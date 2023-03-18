// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { getCompilerLibOption, getCompilerScriptTarget, getCompilerSourceMapOptions, getTopLevelAwaitLocation, libNamesToCompilerOption, outputDiagnostics, transformCodeToTarget } from "./lib/compiler.ts";
import { colors, createProjectSync, path, ts } from "./lib/mod.deps.ts";
import { shimOptionsToTransformShims } from "./lib/shims.ts";
import { getNpmIgnoreText } from "./lib/npm_ignore.ts";
import { glob, runNpmCommand, standardizePath } from "./lib/utils.ts";
import { transform } from "./transform.ts";
import * as compilerTransforms from "./lib/compiler_transforms.ts";
import { getPackageJson } from "./lib/package_json.ts";
import { getTestRunnerCode } from "./lib/test_runner/get_test_runner_code.ts";
export { emptyDir } from "./lib/mod.deps.ts";
/** Builds the specified Deno module to an npm package using the TypeScript compiler. */ export async function build(options) {
    if (options.scriptModule === false && options.esModule === false) {
        throw new Error("`scriptModule` and `esModule` cannot both be `false`");
    }
    // set defaults
    options = {
        ...options,
        outDir: standardizePath(options.outDir),
        entryPoints: options.entryPoints,
        scriptModule: options.scriptModule ?? "cjs",
        esModule: options.esModule ?? true,
        typeCheck: options.typeCheck ?? true,
        test: options.test ?? true,
        declaration: options.declaration ?? true
    };
    const packageManager = options.packageManager ?? "npm";
    const scriptTarget = options.compilerOptions?.target ?? "ES2021";
    const entryPoints = options.entryPoints.map((e, i)=>{
        if (typeof e === "string") {
            return {
                name: i === 0 ? "." : e.replace(/\.tsx?$/i, ".js"),
                path: standardizePath(e)
            };
        } else {
            return {
                ...e,
                path: standardizePath(e.path)
            };
        }
    });
    await Deno.permissions.request({
        name: "write",
        path: options.outDir
    });
    log("Transforming...");
    const transformOutput = await transformEntryPoints();
    for (const warning of transformOutput.warnings){
        warn(warning);
    }
    const createdDirectories = new Set();
    const writeFile = (filePath, fileText)=>{
        const dir = path.dirname(filePath);
        if (!createdDirectories.has(dir)) {
            Deno.mkdirSync(dir, {
                recursive: true
            });
            createdDirectories.add(dir);
        }
        Deno.writeTextFileSync(filePath, fileText);
    };
    createPackageJson();
    createNpmIgnore();
    // install dependencies in order to prepare for checking TS diagnostics
    log(`Running ${packageManager} install...`);
    const npmInstallPromise = runNpmCommand({
        bin: packageManager,
        args: [
            "install"
        ],
        cwd: options.outDir
    });
    if (options.typeCheck || options.declaration) {
        // Unfortunately this can't be run in parallel to building the project
        // in this case because TypeScript will resolve the npm packages when
        // creating the project.
        await npmInstallPromise;
    }
    log("Building project...");
    const esmOutDir = path.join(options.outDir, "esm");
    const scriptOutDir = path.join(options.outDir, "script");
    const typesOutDir = path.join(options.outDir, "types");
    const compilerScriptTarget = getCompilerScriptTarget(scriptTarget);
    const project = createProjectSync({
        compilerOptions: {
            outDir: typesOutDir,
            allowJs: true,
            alwaysStrict: true,
            stripInternal: true,
            strictBindCallApply: true,
            strictFunctionTypes: true,
            strictNullChecks: true,
            strictPropertyInitialization: true,
            suppressExcessPropertyErrors: false,
            suppressImplicitAnyIndexErrors: false,
            noImplicitAny: true,
            noImplicitReturns: false,
            noImplicitThis: true,
            noStrictGenericChecks: false,
            noUncheckedIndexedAccess: false,
            declaration: options.declaration,
            esModuleInterop: false,
            isolatedModules: true,
            useDefineForClassFields: true,
            experimentalDecorators: true,
            emitDecoratorMetadata: options.compilerOptions?.emitDecoratorMetadata ?? false,
            jsx: ts.JsxEmit.React,
            jsxFactory: "React.createElement",
            jsxFragmentFactory: "React.Fragment",
            importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: compilerScriptTarget,
            lib: libNamesToCompilerOption(options.compilerOptions?.lib ?? getCompilerLibOption(scriptTarget)),
            allowSyntheticDefaultImports: true,
            importHelpers: options.compilerOptions?.importHelpers,
            ...getCompilerSourceMapOptions(options.compilerOptions?.sourceMap),
            inlineSources: options.compilerOptions?.inlineSources,
            skipLibCheck: options.compilerOptions?.skipLibCheck ?? true
        }
    });
    const binaryEntryPointPaths = new Set(entryPoints.map((e, i)=>({
            kind: e.kind,
            path: transformOutput.main.entryPoints[i]
        })).filter((p)=>p.kind === "bin").map((p)=>p.path));
    for (const outputFile of [
        ...transformOutput.main.files,
        ...transformOutput.test.files
    ]){
        const outputFilePath = path.join(options.outDir, "src", outputFile.filePath);
        const outputFileText = binaryEntryPointPaths.has(outputFile.filePath) ? `#!/usr/bin/env node\n${outputFile.fileText}` : outputFile.fileText;
        const sourceFile = project.createSourceFile(outputFilePath, outputFileText);
        if (options.scriptModule) {
            // cjs does not support TLA so error fast if we find one
            const tlaLocation = getTopLevelAwaitLocation(sourceFile);
            if (tlaLocation) {
                warn(`Top level await cannot be used when distributing CommonJS/UMD ` + `(See ${outputFile.filePath} ${tlaLocation.line + 1}:${tlaLocation.character + 1}). ` + `Please re-organize your code to not use a top level await or only distribute an ES module by setting the 'scriptModule' build option to false.`);
                throw new Error("Build failed due to top level await when creating CommonJS/UMD package.");
            }
        }
        if (!options.skipSourceOutput) {
            writeFile(outputFilePath, outputFileText);
        }
    }
    // When creating the program and type checking, we need to ensure that
    // the cwd is the directory that contains the node_modules directory
    // so that TypeScript will read it and resolve any @types/ packages.
    // This is done in `getAutomaticTypeDirectiveNames` of TypeScript's code.
    const originalDir = Deno.cwd();
    let program;
    Deno.chdir(options.outDir);
    try {
        program = project.createProgram();
        if (options.typeCheck) {
            log("Type checking...");
            const diagnostics = ts.getPreEmitDiagnostics(program);
            if (diagnostics.length > 0) {
                outputDiagnostics(diagnostics);
                throw new Error(`Had ${diagnostics.length} diagnostics.`);
            }
        }
    } finally{
        Deno.chdir(originalDir);
    }
    // emit only the .d.ts files
    if (options.declaration) {
        log("Emitting declaration files...");
        emit({
            onlyDtsFiles: true
        });
    }
    if (options.esModule) {
        // emit the esm files
        log("Emitting ESM package...");
        project.compilerOptions.set({
            declaration: false,
            outDir: esmOutDir
        });
        program = project.createProgram();
        emit();
        writeFile(path.join(esmOutDir, "package.json"), `{\n  "type": "module"\n}\n`);
    }
    // emit the script files
    if (options.scriptModule) {
        log("Emitting script package...");
        project.compilerOptions.set({
            declaration: false,
            esModuleInterop: true,
            outDir: scriptOutDir,
            module: options.scriptModule === "umd" ? ts.ModuleKind.UMD : ts.ModuleKind.CommonJS
        });
        program = project.createProgram();
        emit({
            transformers: {
                before: [
                    compilerTransforms.transformImportMeta
                ]
            }
        });
        writeFile(path.join(scriptOutDir, "package.json"), `{\n  "type": "commonjs"\n}\n`);
    }
    // ensure this is done before running tests
    await npmInstallPromise;
    // run post build action
    if (options.postBuild) {
        log("Running post build action...");
        await options.postBuild();
    }
    if (options.test) {
        log("Running tests...");
        createTestLauncherScript();
        await runNpmCommand({
            bin: packageManager,
            args: [
                "run",
                "test"
            ],
            cwd: options.outDir
        });
    }
    log("Complete!");
    function emit(opts) {
        const emitResult = program.emit(undefined, (filePath, data, writeByteOrderMark)=>{
            if (writeByteOrderMark) {
                data = "\uFEFF" + data;
            }
            writeFile(filePath, data);
        }, undefined, opts?.onlyDtsFiles, opts?.transformers);
        if (emitResult.diagnostics.length > 0) {
            outputDiagnostics(emitResult.diagnostics);
            throw new Error(`Had ${emitResult.diagnostics.length} emit diagnostics.`);
        }
    }
    function createPackageJson() {
        const packageJsonObj = getPackageJson({
            entryPoints,
            transformOutput,
            package: options.package,
            testEnabled: options.test,
            includeEsModule: options.esModule !== false,
            includeScriptModule: options.scriptModule !== false,
            includeDeclarations: options.declaration,
            includeTsLib: options.compilerOptions?.importHelpers,
            shims: options.shims
        });
        writeFile(path.join(options.outDir, "package.json"), JSON.stringify(packageJsonObj, undefined, 2));
    }
    function createNpmIgnore() {
        const fileText = getNpmIgnoreText({
            sourceMap: options.compilerOptions?.sourceMap,
            inlineSources: options.compilerOptions?.inlineSources,
            testFiles: transformOutput.test.files,
            includeScriptModule: options.scriptModule !== false,
            includeEsModule: options.esModule !== false
        });
        writeFile(path.join(options.outDir, ".npmignore"), fileText);
    }
    async function transformEntryPoints() {
        const { shims , testShims  } = shimOptionsToTransformShims(options.shims);
        return transform({
            entryPoints: entryPoints.map((e)=>e.path),
            testEntryPoints: options.test ? await glob({
                pattern: getTestPattern(),
                rootDir: options.rootTestDir ?? Deno.cwd(),
                excludeDirs: [
                    options.outDir
                ]
            }) : [],
            shims,
            testShims,
            mappings: options.mappings,
            target: scriptTarget,
            importMap: options.importMap
        });
    }
    function log(message) {
        console.log(`[dnt] ${message}`);
    }
    function warn(message) {
        console.warn(colors.yellow(`[dnt] ${message}`));
    }
    function createTestLauncherScript() {
        const denoTestShimPackage = getDependencyByName("@deno/shim-deno-test") ?? getDependencyByName("@deno/shim-deno");
        writeFile(path.join(options.outDir, "test_runner.js"), transformCodeToTarget(getTestRunnerCode({
            denoTestShimPackageName: denoTestShimPackage == null ? undefined : denoTestShimPackage.name === "@deno/shim-deno" ? "@deno/shim-deno/test-internals" : denoTestShimPackage.name,
            testEntryPoints: transformOutput.test.entryPoints,
            includeEsModule: options.esModule !== false,
            includeScriptModule: options.scriptModule !== false
        }), compilerScriptTarget));
        function getDependencyByName(name) {
            return transformOutput.test.dependencies.find((d)=>d.name === name) ?? transformOutput.main.dependencies.find((d)=>d.name === name);
        }
    }
    function getTestPattern() {
        // * named `test.{ts, tsx, js, mjs, jsx}`,
        // * or ending with `.test.{ts, tsx, js, mjs, jsx}`,
        // * or ending with `_test.{ts, tsx, js, mjs, jsx}`
        return options.testPattern ?? "**/{test.{ts,tsx,js,mjs,jsx},*.test.{ts,tsx,js,mjs,jsx},*_test.{ts,tsx,js,mjs,jsx}}";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHtcbiAgZ2V0Q29tcGlsZXJMaWJPcHRpb24sXG4gIGdldENvbXBpbGVyU2NyaXB0VGFyZ2V0LFxuICBnZXRDb21waWxlclNvdXJjZU1hcE9wdGlvbnMsXG4gIGdldFRvcExldmVsQXdhaXRMb2NhdGlvbixcbiAgTGliTmFtZSxcbiAgbGliTmFtZXNUb0NvbXBpbGVyT3B0aW9uLFxuICBvdXRwdXREaWFnbm9zdGljcyxcbiAgU291cmNlTWFwT3B0aW9ucyxcbiAgdHJhbnNmb3JtQ29kZVRvVGFyZ2V0LFxufSBmcm9tIFwiLi9saWIvY29tcGlsZXIudHNcIjtcbmltcG9ydCB7IGNvbG9ycywgY3JlYXRlUHJvamVjdFN5bmMsIHBhdGgsIHRzIH0gZnJvbSBcIi4vbGliL21vZC5kZXBzLnRzXCI7XG5pbXBvcnQgeyBTaGltT3B0aW9ucywgc2hpbU9wdGlvbnNUb1RyYW5zZm9ybVNoaW1zIH0gZnJvbSBcIi4vbGliL3NoaW1zLnRzXCI7XG5pbXBvcnQgeyBnZXROcG1JZ25vcmVUZXh0IH0gZnJvbSBcIi4vbGliL25wbV9pZ25vcmUudHNcIjtcbmltcG9ydCB7IFBhY2thZ2VKc29uT2JqZWN0LCBTY3JpcHRUYXJnZXQgfSBmcm9tIFwiLi9saWIvdHlwZXMudHNcIjtcbmltcG9ydCB7IGdsb2IsIHJ1bk5wbUNvbW1hbmQsIHN0YW5kYXJkaXplUGF0aCB9IGZyb20gXCIuL2xpYi91dGlscy50c1wiO1xuaW1wb3J0IHsgU3BlY2lmaWVyTWFwcGluZ3MsIHRyYW5zZm9ybSwgVHJhbnNmb3JtT3V0cHV0IH0gZnJvbSBcIi4vdHJhbnNmb3JtLnRzXCI7XG5pbXBvcnQgKiBhcyBjb21waWxlclRyYW5zZm9ybXMgZnJvbSBcIi4vbGliL2NvbXBpbGVyX3RyYW5zZm9ybXMudHNcIjtcbmltcG9ydCB7IGdldFBhY2thZ2VKc29uIH0gZnJvbSBcIi4vbGliL3BhY2thZ2VfanNvbi50c1wiO1xuaW1wb3J0IHsgZ2V0VGVzdFJ1bm5lckNvZGUgfSBmcm9tIFwiLi9saWIvdGVzdF9ydW5uZXIvZ2V0X3Rlc3RfcnVubmVyX2NvZGUudHNcIjtcblxuZXhwb3J0IHR5cGUgeyBMaWJOYW1lLCBTb3VyY2VNYXBPcHRpb25zIH0gZnJvbSBcIi4vbGliL2NvbXBpbGVyLnRzXCI7XG5leHBvcnQgdHlwZSB7IFNoaW1PcHRpb25zIH0gZnJvbSBcIi4vbGliL3NoaW1zLnRzXCI7XG5leHBvcnQgeyBlbXB0eURpciB9IGZyb20gXCIuL2xpYi9tb2QuZGVwcy50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVudHJ5UG9pbnQge1xuICAvKipcbiAgICogSWYgdGhlIGVudHJ5cG9pbnQgaXMgZm9yIGFuIG5wbSBiaW5hcnkgb3IgZXhwb3J0LlxuICAgKiBAZGVmYXVsdCBcImV4cG9ydFwiXG4gICAqL1xuICBraW5kPzogXCJiaW5cIiB8IFwiZXhwb3J0XCI7XG4gIC8qKiBOYW1lIG9mIHRoZSBlbnRyeXBvaW50IGluIHRoZSBcImJpbmFyeVwiIG9yIFwiZXhwb3J0c1wiLiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBQYXRoIHRvIHRoZSBlbnRyeXBvaW50LiAqL1xuICBwYXRoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGRPcHRpb25zIHtcbiAgLyoqIEVudHJ5cG9pbnQocykgdG8gdGhlIERlbm8gbW9kdWxlLiBFeC4gYC4vbW9kLnRzYCAqL1xuICBlbnRyeVBvaW50czogKHN0cmluZyB8IEVudHJ5UG9pbnQpW107XG4gIC8qKiBEaXJlY3RvcnkgdG8gb3V0cHV0IHRvLiAqL1xuICBvdXREaXI6IHN0cmluZztcbiAgLyoqIFNoaW1zIHRvIHVzZS4gKi9cbiAgc2hpbXM6IFNoaW1PcHRpb25zO1xuICAvKiogVHlwZSBjaGVjayB0aGUgb3V0cHV0LlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICB0eXBlQ2hlY2s/OiBib29sZWFuO1xuICAvKiogQ29sbGVjdCBhbmQgcnVuIHRlc3QgZmlsZXMuXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIHRlc3Q/OiBib29sZWFuO1xuICAvKiogQ3JlYXRlIGRlY2xhcmF0aW9uIGZpbGVzLlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBkZWNsYXJhdGlvbj86IGJvb2xlYW47XG4gIC8qKiBJbmNsdWRlIGEgQ29tbW9uSlMgb3IgVU1EIG1vZHVsZS5cbiAgICogQGRlZmF1bHQgXCJjanNcIlxuICAgKi9cbiAgc2NyaXB0TW9kdWxlPzogXCJjanNcIiB8IFwidW1kXCIgfCBmYWxzZTtcbiAgLyoqIFdoZXRoZXIgdG8gZW1pdCBhbiBFUyBtb2R1bGUuXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGVzTW9kdWxlPzogYm9vbGVhbjtcbiAgLyoqIFNraXAgb3V0cHV0dGluZyB0aGUgY2Fub25pY2FsIFR5cGVTY3JpcHQgaW4gdGhlIG91dHB1dCBkaXJlY3RvcnkgYmVmb3JlIGVtaXR0aW5nLlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgc2tpcFNvdXJjZU91dHB1dD86IGJvb2xlYW47XG4gIC8qKiBSb290IGRpcmVjdG9yeSB0byBmaW5kIHRlc3QgZmlsZXMgaW4uIERlZmF1bHRzIHRvIHRoZSBjd2QuICovXG4gIHJvb3RUZXN0RGlyPzogc3RyaW5nO1xuICAvKiogR2xvYiBwYXR0ZXJuIHRvIHVzZSB0byBmaW5kIHRlc3RzIGZpbGVzLiBEZWZhdWx0cyB0byBgZGVubyB0ZXN0YCdzIHBhdHRlcm4uICovXG4gIHRlc3RQYXR0ZXJuPzogc3RyaW5nO1xuICAvKipcbiAgICogU3BlY2lmaWVycyB0byBtYXAgZnJvbSBhbmQgdG8uXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGEgbm9kZSBzcGVjaWZpYyBmaWxlOlxuICAgKlxuICAgKiBgYGBcbiAgICogbWFwcGluZ3M6IHtcbiAgICogICBcIi4vZmlsZS5kZW5vLnRzXCI6IFwiLi9maWxlLm5vZGUudHNcIixcbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogT3IgbWFwIGEgc3BlY2lmaWVyIHRvIGFuIG5wbSBwYWNrYWdlOlxuICAgKlxuICAgKiBgYGBcbiAgICogbWFwcGluZ3M6IHtcbiAgICogXCJodHRwczovL2Rlbm8ubGFuZC94L2NvZGVfYmxvY2tfd3JpdGVyQDExLjAuMC9tb2QudHNcIjoge1xuICAgKiAgIG5hbWU6IFwiY29kZS1ibG9jay13cml0ZXJcIixcbiAgICogICB2ZXJzaW9uOiBcIl4xMS4wLjBcIixcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIG1hcHBpbmdzPzogU3BlY2lmaWVyTWFwcGluZ3M7XG4gIC8qKiBQYWNrYWdlLmpzb24gb3V0cHV0LiBZb3UgbWF5IG92ZXJyaWRlIGRlcGVuZGVuY2llcyBhbmQgZGV2IGRlcGVuZGVuY2llcyBpbiBoZXJlLiAqL1xuICBwYWNrYWdlOiBQYWNrYWdlSnNvbk9iamVjdDtcbiAgLyoqIFBhdGggb3IgdXJsIHRvIGltcG9ydCBtYXAuICovXG4gIGltcG9ydE1hcD86IHN0cmluZztcbiAgLyoqIFBhY2thZ2UgbWFuYWdlciB1c2VkIHRvIGluc3RhbGwgZGVwZW5kZW5jaWVzIGFuZCBydW4gbnBtIHNjcmlwdHMuXG4gICAqIFRoaXMgYWxzbyBjYW4gYmUgYW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZXhlY3V0YWJsZSBmaWxlIG9mIHBhY2thZ2UgbWFuYWdlci5cbiAgICogQGRlZmF1bHQgXCJucG1cIlxuICAgKi9cbiAgcGFja2FnZU1hbmFnZXI/OiBcIm5wbVwiIHwgXCJ5YXJuXCIgfCBcInBucG1cIiB8IHN0cmluZztcbiAgLyoqIE9wdGlvbmFsIGNvbXBpbGVyIG9wdGlvbnMuICovXG4gIGNvbXBpbGVyT3B0aW9ucz86IHtcbiAgICAvKiogVXNlcyB0c2xpYiB0byBpbXBvcnQgaGVscGVyIGZ1bmN0aW9ucyBvbmNlIHBlciBwcm9qZWN0IGluc3RlYWQgb2YgaW5jbHVkaW5nIHRoZW0gcGVyLWZpbGUgaWYgbmVjZXNzYXJ5LlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgaW1wb3J0SGVscGVycz86IGJvb2xlYW47XG4gICAgdGFyZ2V0PzogU2NyaXB0VGFyZ2V0O1xuICAgIC8qKlxuICAgICAqIFVzZSBzb3VyY2UgbWFwcyBmcm9tIHRoZSBjYW5vbmljYWwgdHlwZXNjcmlwdCB0byBFU00vQ29tbW9uSlMgZW1pdC5cbiAgICAgKlxuICAgICAqIFNwZWNpZnkgYHRydWVgIHRvIGluY2x1ZGUgc2VwYXJhdGUgZmlsZXMgb3IgYFwiaW5saW5lXCJgIHRvIGlubGluZSB0aGUgc291cmNlIG1hcCBpbiB0aGUgc2FtZSBmaWxlLlxuICAgICAqIEByZW1hcmtzIFVzaW5nIHRoaXMgb3B0aW9uIHdpbGwgY2F1c2UgeW91ciBzb3VyY2VzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSBucG0gcGFja2FnZS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIHNvdXJjZU1hcD86IFNvdXJjZU1hcE9wdGlvbnM7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB0byBpbmNsdWRlIHRoZSBzb3VyY2UgZmlsZSB0ZXh0IGluIHRoZSBzb3VyY2UgbWFwIHdoZW4gdXNpbmcgc291cmNlIG1hcHMuXG4gICAgICogQHJlbWFya3MgSXQncyBub3QgcmVjb21tZW5kZWQgdG8gZG8gdGhpcyBpZiB5b3UgYXJlIGRpc3RyaWJ1dGluZyBib3RoIEVTTSBhbmQgQ29tbW9uSlNcbiAgICAgKiBzb3VyY2VzIGFzIHRoZW4gaXQgd2lsbCBkdXBsaWNhdGUgdGhlIHRoZSBzb3VyY2UgZGF0YSBiZWluZyBwdWJsaXNoZWQuXG4gICAgICovXG4gICAgaW5saW5lU291cmNlcz86IGJvb2xlYW47XG4gICAgLyoqIERlZmF1bHQgc2V0IG9mIGxpYnJhcnkgb3B0aW9ucyB0byB1c2UuIFNlZSBodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvdHNjb25maWcvI2xpYiAqL1xuICAgIGxpYj86IExpYk5hbWVbXTtcbiAgICAvKipcbiAgICAgKiBTa2lwIHR5cGUgY2hlY2tpbmcgb2YgZGVjbGFyYXRpb24gZmlsZXMgKHRob3NlIGluIGRlcGVuZGVuY2llcykuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIHNraXBMaWJDaGVjaz86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBlbWl0RGVjb3JhdG9yTWV0YWRhdGE/OiBib29sZWFuO1xuICB9O1xuICAvKiogQWN0aW9uIHRvIGRvIGFmdGVyIGVtaXR0aW5nIGFuZCBiZWZvcmUgcnVubmluZyB0ZXN0cy4gKi9cbiAgcG9zdEJ1aWxkPzogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG59XG5cbi8qKiBCdWlsZHMgdGhlIHNwZWNpZmllZCBEZW5vIG1vZHVsZSB0byBhbiBucG0gcGFja2FnZSB1c2luZyB0aGUgVHlwZVNjcmlwdCBjb21waWxlci4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZChvcHRpb25zOiBCdWlsZE9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKG9wdGlvbnMuc2NyaXB0TW9kdWxlID09PSBmYWxzZSAmJiBvcHRpb25zLmVzTW9kdWxlID09PSBmYWxzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImBzY3JpcHRNb2R1bGVgIGFuZCBgZXNNb2R1bGVgIGNhbm5vdCBib3RoIGJlIGBmYWxzZWBcIik7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHRzXG4gIG9wdGlvbnMgPSB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBvdXREaXI6IHN0YW5kYXJkaXplUGF0aChvcHRpb25zLm91dERpciksXG4gICAgZW50cnlQb2ludHM6IG9wdGlvbnMuZW50cnlQb2ludHMsXG4gICAgc2NyaXB0TW9kdWxlOiBvcHRpb25zLnNjcmlwdE1vZHVsZSA/PyBcImNqc1wiLFxuICAgIGVzTW9kdWxlOiBvcHRpb25zLmVzTW9kdWxlID8/IHRydWUsXG4gICAgdHlwZUNoZWNrOiBvcHRpb25zLnR5cGVDaGVjayA/PyB0cnVlLFxuICAgIHRlc3Q6IG9wdGlvbnMudGVzdCA/PyB0cnVlLFxuICAgIGRlY2xhcmF0aW9uOiBvcHRpb25zLmRlY2xhcmF0aW9uID8/IHRydWUsXG4gIH07XG4gIGNvbnN0IHBhY2thZ2VNYW5hZ2VyID0gb3B0aW9ucy5wYWNrYWdlTWFuYWdlciA/PyBcIm5wbVwiO1xuICBjb25zdCBzY3JpcHRUYXJnZXQgPSBvcHRpb25zLmNvbXBpbGVyT3B0aW9ucz8udGFyZ2V0ID8/IFwiRVMyMDIxXCI7XG4gIGNvbnN0IGVudHJ5UG9pbnRzOiBFbnRyeVBvaW50W10gPSBvcHRpb25zLmVudHJ5UG9pbnRzLm1hcCgoZSwgaSkgPT4ge1xuICAgIGlmICh0eXBlb2YgZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogaSA9PT0gMCA/IFwiLlwiIDogZS5yZXBsYWNlKC9cXC50c3g/JC9pLCBcIi5qc1wiKSxcbiAgICAgICAgcGF0aDogc3RhbmRhcmRpemVQYXRoKGUpLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZSxcbiAgICAgICAgcGF0aDogc3RhbmRhcmRpemVQYXRoKGUucGF0aCksXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgYXdhaXQgRGVuby5wZXJtaXNzaW9ucy5yZXF1ZXN0KHsgbmFtZTogXCJ3cml0ZVwiLCBwYXRoOiBvcHRpb25zLm91dERpciB9KTtcblxuICBsb2coXCJUcmFuc2Zvcm1pbmcuLi5cIik7XG4gIGNvbnN0IHRyYW5zZm9ybU91dHB1dCA9IGF3YWl0IHRyYW5zZm9ybUVudHJ5UG9pbnRzKCk7XG4gIGZvciAoY29uc3Qgd2FybmluZyBvZiB0cmFuc2Zvcm1PdXRwdXQud2FybmluZ3MpIHtcbiAgICB3YXJuKHdhcm5pbmcpO1xuICB9XG5cbiAgY29uc3QgY3JlYXRlZERpcmVjdG9yaWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHdyaXRlRmlsZSA9IChmaWxlUGF0aDogc3RyaW5nLCBmaWxlVGV4dDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICBpZiAoIWNyZWF0ZWREaXJlY3Rvcmllcy5oYXMoZGlyKSkge1xuICAgICAgRGVuby5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIGNyZWF0ZWREaXJlY3Rvcmllcy5hZGQoZGlyKTtcbiAgICB9XG4gICAgRGVuby53cml0ZVRleHRGaWxlU3luYyhmaWxlUGF0aCwgZmlsZVRleHQpO1xuICB9O1xuXG4gIGNyZWF0ZVBhY2thZ2VKc29uKCk7XG4gIGNyZWF0ZU5wbUlnbm9yZSgpO1xuXG4gIC8vIGluc3RhbGwgZGVwZW5kZW5jaWVzIGluIG9yZGVyIHRvIHByZXBhcmUgZm9yIGNoZWNraW5nIFRTIGRpYWdub3N0aWNzXG4gIGxvZyhgUnVubmluZyAke3BhY2thZ2VNYW5hZ2VyfSBpbnN0YWxsLi4uYCk7XG4gIGNvbnN0IG5wbUluc3RhbGxQcm9taXNlID0gcnVuTnBtQ29tbWFuZCh7XG4gICAgYmluOiBwYWNrYWdlTWFuYWdlcixcbiAgICBhcmdzOiBbXCJpbnN0YWxsXCJdLFxuICAgIGN3ZDogb3B0aW9ucy5vdXREaXIsXG4gIH0pO1xuICBpZiAob3B0aW9ucy50eXBlQ2hlY2sgfHwgb3B0aW9ucy5kZWNsYXJhdGlvbikge1xuICAgIC8vIFVuZm9ydHVuYXRlbHkgdGhpcyBjYW4ndCBiZSBydW4gaW4gcGFyYWxsZWwgdG8gYnVpbGRpbmcgdGhlIHByb2plY3RcbiAgICAvLyBpbiB0aGlzIGNhc2UgYmVjYXVzZSBUeXBlU2NyaXB0IHdpbGwgcmVzb2x2ZSB0aGUgbnBtIHBhY2thZ2VzIHdoZW5cbiAgICAvLyBjcmVhdGluZyB0aGUgcHJvamVjdC5cbiAgICBhd2FpdCBucG1JbnN0YWxsUHJvbWlzZTtcbiAgfVxuXG4gIGxvZyhcIkJ1aWxkaW5nIHByb2plY3QuLi5cIik7XG4gIGNvbnN0IGVzbU91dERpciA9IHBhdGguam9pbihvcHRpb25zLm91dERpciwgXCJlc21cIik7XG4gIGNvbnN0IHNjcmlwdE91dERpciA9IHBhdGguam9pbihvcHRpb25zLm91dERpciwgXCJzY3JpcHRcIik7XG4gIGNvbnN0IHR5cGVzT3V0RGlyID0gcGF0aC5qb2luKG9wdGlvbnMub3V0RGlyLCBcInR5cGVzXCIpO1xuICBjb25zdCBjb21waWxlclNjcmlwdFRhcmdldCA9IGdldENvbXBpbGVyU2NyaXB0VGFyZ2V0KHNjcmlwdFRhcmdldCk7XG4gIGNvbnN0IHByb2plY3QgPSBjcmVhdGVQcm9qZWN0U3luYyh7XG4gICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICBvdXREaXI6IHR5cGVzT3V0RGlyLFxuICAgICAgYWxsb3dKczogdHJ1ZSxcbiAgICAgIGFsd2F5c1N0cmljdDogdHJ1ZSxcbiAgICAgIHN0cmlwSW50ZXJuYWw6IHRydWUsXG4gICAgICBzdHJpY3RCaW5kQ2FsbEFwcGx5OiB0cnVlLFxuICAgICAgc3RyaWN0RnVuY3Rpb25UeXBlczogdHJ1ZSxcbiAgICAgIHN0cmljdE51bGxDaGVja3M6IHRydWUsXG4gICAgICBzdHJpY3RQcm9wZXJ0eUluaXRpYWxpemF0aW9uOiB0cnVlLFxuICAgICAgc3VwcHJlc3NFeGNlc3NQcm9wZXJ0eUVycm9yczogZmFsc2UsXG4gICAgICBzdXBwcmVzc0ltcGxpY2l0QW55SW5kZXhFcnJvcnM6IGZhbHNlLFxuICAgICAgbm9JbXBsaWNpdEFueTogdHJ1ZSxcbiAgICAgIG5vSW1wbGljaXRSZXR1cm5zOiBmYWxzZSxcbiAgICAgIG5vSW1wbGljaXRUaGlzOiB0cnVlLFxuICAgICAgbm9TdHJpY3RHZW5lcmljQ2hlY2tzOiBmYWxzZSxcbiAgICAgIG5vVW5jaGVja2VkSW5kZXhlZEFjY2VzczogZmFsc2UsXG4gICAgICBkZWNsYXJhdGlvbjogb3B0aW9ucy5kZWNsYXJhdGlvbixcbiAgICAgIGVzTW9kdWxlSW50ZXJvcDogZmFsc2UsXG4gICAgICBpc29sYXRlZE1vZHVsZXM6IHRydWUsXG4gICAgICB1c2VEZWZpbmVGb3JDbGFzc0ZpZWxkczogdHJ1ZSxcbiAgICAgIGV4cGVyaW1lbnRhbERlY29yYXRvcnM6IHRydWUsXG4gICAgICBlbWl0RGVjb3JhdG9yTWV0YWRhdGE6IG9wdGlvbnMuY29tcGlsZXJPcHRpb25zPy5lbWl0RGVjb3JhdG9yTWV0YWRhdGEgPz9cbiAgICAgICAgZmFsc2UsXG4gICAgICBqc3g6IHRzLkpzeEVtaXQuUmVhY3QsXG4gICAgICBqc3hGYWN0b3J5OiBcIlJlYWN0LmNyZWF0ZUVsZW1lbnRcIixcbiAgICAgIGpzeEZyYWdtZW50RmFjdG9yeTogXCJSZWFjdC5GcmFnbWVudFwiLFxuICAgICAgaW1wb3J0c05vdFVzZWRBc1ZhbHVlczogdHMuSW1wb3J0c05vdFVzZWRBc1ZhbHVlcy5SZW1vdmUsXG4gICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuRVNOZXh0LFxuICAgICAgbW9kdWxlUmVzb2x1dGlvbjogdHMuTW9kdWxlUmVzb2x1dGlvbktpbmQuTm9kZUpzLFxuICAgICAgdGFyZ2V0OiBjb21waWxlclNjcmlwdFRhcmdldCxcbiAgICAgIGxpYjogbGliTmFtZXNUb0NvbXBpbGVyT3B0aW9uKFxuICAgICAgICBvcHRpb25zLmNvbXBpbGVyT3B0aW9ucz8ubGliID8/IGdldENvbXBpbGVyTGliT3B0aW9uKHNjcmlwdFRhcmdldCksXG4gICAgICApLFxuICAgICAgYWxsb3dTeW50aGV0aWNEZWZhdWx0SW1wb3J0czogdHJ1ZSxcbiAgICAgIGltcG9ydEhlbHBlcnM6IG9wdGlvbnMuY29tcGlsZXJPcHRpb25zPy5pbXBvcnRIZWxwZXJzLFxuICAgICAgLi4uZ2V0Q29tcGlsZXJTb3VyY2VNYXBPcHRpb25zKG9wdGlvbnMuY29tcGlsZXJPcHRpb25zPy5zb3VyY2VNYXApLFxuICAgICAgaW5saW5lU291cmNlczogb3B0aW9ucy5jb21waWxlck9wdGlvbnM/LmlubGluZVNvdXJjZXMsXG4gICAgICBza2lwTGliQ2hlY2s6IG9wdGlvbnMuY29tcGlsZXJPcHRpb25zPy5za2lwTGliQ2hlY2sgPz8gdHJ1ZSxcbiAgICB9LFxuICB9KTtcblxuICBjb25zdCBiaW5hcnlFbnRyeVBvaW50UGF0aHMgPSBuZXcgU2V0KFxuICAgIGVudHJ5UG9pbnRzLm1hcCgoZSwgaSkgPT4gKHtcbiAgICAgIGtpbmQ6IGUua2luZCxcbiAgICAgIHBhdGg6IHRyYW5zZm9ybU91dHB1dC5tYWluLmVudHJ5UG9pbnRzW2ldLFxuICAgIH0pKS5maWx0ZXIoKHApID0+IHAua2luZCA9PT0gXCJiaW5cIikubWFwKChwKSA9PiBwLnBhdGgpLFxuICApO1xuXG4gIGZvciAoXG4gICAgY29uc3Qgb3V0cHV0RmlsZSBvZiBbXG4gICAgICAuLi50cmFuc2Zvcm1PdXRwdXQubWFpbi5maWxlcyxcbiAgICAgIC4uLnRyYW5zZm9ybU91dHB1dC50ZXN0LmZpbGVzLFxuICAgIF1cbiAgKSB7XG4gICAgY29uc3Qgb3V0cHV0RmlsZVBhdGggPSBwYXRoLmpvaW4oXG4gICAgICBvcHRpb25zLm91dERpcixcbiAgICAgIFwic3JjXCIsXG4gICAgICBvdXRwdXRGaWxlLmZpbGVQYXRoLFxuICAgICk7XG4gICAgY29uc3Qgb3V0cHV0RmlsZVRleHQgPSBiaW5hcnlFbnRyeVBvaW50UGF0aHMuaGFzKG91dHB1dEZpbGUuZmlsZVBhdGgpXG4gICAgICA/IGAjIS91c3IvYmluL2VudiBub2RlXFxuJHtvdXRwdXRGaWxlLmZpbGVUZXh0fWBcbiAgICAgIDogb3V0cHV0RmlsZS5maWxlVGV4dDtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gcHJvamVjdC5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgb3V0cHV0RmlsZVBhdGgsXG4gICAgICBvdXRwdXRGaWxlVGV4dCxcbiAgICApO1xuXG4gICAgaWYgKG9wdGlvbnMuc2NyaXB0TW9kdWxlKSB7XG4gICAgICAvLyBjanMgZG9lcyBub3Qgc3VwcG9ydCBUTEEgc28gZXJyb3IgZmFzdCBpZiB3ZSBmaW5kIG9uZVxuICAgICAgY29uc3QgdGxhTG9jYXRpb24gPSBnZXRUb3BMZXZlbEF3YWl0TG9jYXRpb24oc291cmNlRmlsZSk7XG4gICAgICBpZiAodGxhTG9jYXRpb24pIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICBgVG9wIGxldmVsIGF3YWl0IGNhbm5vdCBiZSB1c2VkIHdoZW4gZGlzdHJpYnV0aW5nIENvbW1vbkpTL1VNRCBgICtcbiAgICAgICAgICAgIGAoU2VlICR7b3V0cHV0RmlsZS5maWxlUGF0aH0gJHt0bGFMb2NhdGlvbi5saW5lICsgMX06JHtcbiAgICAgICAgICAgICAgdGxhTG9jYXRpb24uY2hhcmFjdGVyICsgMVxuICAgICAgICAgICAgfSkuIGAgK1xuICAgICAgICAgICAgYFBsZWFzZSByZS1vcmdhbml6ZSB5b3VyIGNvZGUgdG8gbm90IHVzZSBhIHRvcCBsZXZlbCBhd2FpdCBvciBvbmx5IGRpc3RyaWJ1dGUgYW4gRVMgbW9kdWxlIGJ5IHNldHRpbmcgdGhlICdzY3JpcHRNb2R1bGUnIGJ1aWxkIG9wdGlvbiB0byBmYWxzZS5gLFxuICAgICAgICApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJCdWlsZCBmYWlsZWQgZHVlIHRvIHRvcCBsZXZlbCBhd2FpdCB3aGVuIGNyZWF0aW5nIENvbW1vbkpTL1VNRCBwYWNrYWdlLlwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5za2lwU291cmNlT3V0cHV0KSB7XG4gICAgICB3cml0ZUZpbGUob3V0cHV0RmlsZVBhdGgsIG91dHB1dEZpbGVUZXh0KTtcbiAgICB9XG4gIH1cblxuICAvLyBXaGVuIGNyZWF0aW5nIHRoZSBwcm9ncmFtIGFuZCB0eXBlIGNoZWNraW5nLCB3ZSBuZWVkIHRvIGVuc3VyZSB0aGF0XG4gIC8vIHRoZSBjd2QgaXMgdGhlIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBub2RlX21vZHVsZXMgZGlyZWN0b3J5XG4gIC8vIHNvIHRoYXQgVHlwZVNjcmlwdCB3aWxsIHJlYWQgaXQgYW5kIHJlc29sdmUgYW55IEB0eXBlcy8gcGFja2FnZXMuXG4gIC8vIFRoaXMgaXMgZG9uZSBpbiBgZ2V0QXV0b21hdGljVHlwZURpcmVjdGl2ZU5hbWVzYCBvZiBUeXBlU2NyaXB0J3MgY29kZS5cbiAgY29uc3Qgb3JpZ2luYWxEaXIgPSBEZW5vLmN3ZCgpO1xuICBsZXQgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgRGVuby5jaGRpcihvcHRpb25zLm91dERpcik7XG4gIHRyeSB7XG4gICAgcHJvZ3JhbSA9IHByb2plY3QuY3JlYXRlUHJvZ3JhbSgpO1xuXG4gICAgaWYgKG9wdGlvbnMudHlwZUNoZWNrKSB7XG4gICAgICBsb2coXCJUeXBlIGNoZWNraW5nLi4uXCIpO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSB0cy5nZXRQcmVFbWl0RGlhZ25vc3RpY3MocHJvZ3JhbSk7XG4gICAgICBpZiAoZGlhZ25vc3RpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICBvdXRwdXREaWFnbm9zdGljcyhkaWFnbm9zdGljcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSGFkICR7ZGlhZ25vc3RpY3MubGVuZ3RofSBkaWFnbm9zdGljcy5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgRGVuby5jaGRpcihvcmlnaW5hbERpcik7XG4gIH1cblxuICAvLyBlbWl0IG9ubHkgdGhlIC5kLnRzIGZpbGVzXG4gIGlmIChvcHRpb25zLmRlY2xhcmF0aW9uKSB7XG4gICAgbG9nKFwiRW1pdHRpbmcgZGVjbGFyYXRpb24gZmlsZXMuLi5cIik7XG4gICAgZW1pdCh7IG9ubHlEdHNGaWxlczogdHJ1ZSB9KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmVzTW9kdWxlKSB7XG4gICAgLy8gZW1pdCB0aGUgZXNtIGZpbGVzXG4gICAgbG9nKFwiRW1pdHRpbmcgRVNNIHBhY2thZ2UuLi5cIik7XG4gICAgcHJvamVjdC5jb21waWxlck9wdGlvbnMuc2V0KHtcbiAgICAgIGRlY2xhcmF0aW9uOiBmYWxzZSxcbiAgICAgIG91dERpcjogZXNtT3V0RGlyLFxuICAgIH0pO1xuICAgIHByb2dyYW0gPSBwcm9qZWN0LmNyZWF0ZVByb2dyYW0oKTtcbiAgICBlbWl0KCk7XG4gICAgd3JpdGVGaWxlKFxuICAgICAgcGF0aC5qb2luKGVzbU91dERpciwgXCJwYWNrYWdlLmpzb25cIiksXG4gICAgICBge1xcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCJcXG59XFxuYCxcbiAgICApO1xuICB9XG5cbiAgLy8gZW1pdCB0aGUgc2NyaXB0IGZpbGVzXG4gIGlmIChvcHRpb25zLnNjcmlwdE1vZHVsZSkge1xuICAgIGxvZyhcIkVtaXR0aW5nIHNjcmlwdCBwYWNrYWdlLi4uXCIpO1xuICAgIHByb2plY3QuY29tcGlsZXJPcHRpb25zLnNldCh7XG4gICAgICBkZWNsYXJhdGlvbjogZmFsc2UsXG4gICAgICBlc01vZHVsZUludGVyb3A6IHRydWUsXG4gICAgICBvdXREaXI6IHNjcmlwdE91dERpcixcbiAgICAgIG1vZHVsZTogb3B0aW9ucy5zY3JpcHRNb2R1bGUgPT09IFwidW1kXCJcbiAgICAgICAgPyB0cy5Nb2R1bGVLaW5kLlVNRFxuICAgICAgICA6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgfSk7XG4gICAgcHJvZ3JhbSA9IHByb2plY3QuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIGVtaXQoe1xuICAgICAgdHJhbnNmb3JtZXJzOiB7XG4gICAgICAgIGJlZm9yZTogW2NvbXBpbGVyVHJhbnNmb3Jtcy50cmFuc2Zvcm1JbXBvcnRNZXRhXSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgd3JpdGVGaWxlKFxuICAgICAgcGF0aC5qb2luKHNjcmlwdE91dERpciwgXCJwYWNrYWdlLmpzb25cIiksXG4gICAgICBge1xcbiAgXCJ0eXBlXCI6IFwiY29tbW9uanNcIlxcbn1cXG5gLFxuICAgICk7XG4gIH1cblxuICAvLyBlbnN1cmUgdGhpcyBpcyBkb25lIGJlZm9yZSBydW5uaW5nIHRlc3RzXG4gIGF3YWl0IG5wbUluc3RhbGxQcm9taXNlO1xuXG4gIC8vIHJ1biBwb3N0IGJ1aWxkIGFjdGlvblxuICBpZiAob3B0aW9ucy5wb3N0QnVpbGQpIHtcbiAgICBsb2coXCJSdW5uaW5nIHBvc3QgYnVpbGQgYWN0aW9uLi4uXCIpO1xuICAgIGF3YWl0IG9wdGlvbnMucG9zdEJ1aWxkKCk7XG4gIH1cblxuICBpZiAob3B0aW9ucy50ZXN0KSB7XG4gICAgbG9nKFwiUnVubmluZyB0ZXN0cy4uLlwiKTtcbiAgICBjcmVhdGVUZXN0TGF1bmNoZXJTY3JpcHQoKTtcbiAgICBhd2FpdCBydW5OcG1Db21tYW5kKHtcbiAgICAgIGJpbjogcGFja2FnZU1hbmFnZXIsXG4gICAgICBhcmdzOiBbXCJydW5cIiwgXCJ0ZXN0XCJdLFxuICAgICAgY3dkOiBvcHRpb25zLm91dERpcixcbiAgICB9KTtcbiAgfVxuXG4gIGxvZyhcIkNvbXBsZXRlIVwiKTtcblxuICBmdW5jdGlvbiBlbWl0KFxuICAgIG9wdHM/OiB7IG9ubHlEdHNGaWxlcz86IGJvb2xlYW47IHRyYW5zZm9ybWVycz86IHRzLkN1c3RvbVRyYW5zZm9ybWVycyB9LFxuICApIHtcbiAgICBjb25zdCBlbWl0UmVzdWx0ID0gcHJvZ3JhbS5lbWl0KFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgKGZpbGVQYXRoLCBkYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmspID0+IHtcbiAgICAgICAgaWYgKHdyaXRlQnl0ZU9yZGVyTWFyaykge1xuICAgICAgICAgIGRhdGEgPSBcIlxcdUZFRkZcIiArIGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGVGaWxlKGZpbGVQYXRoLCBkYXRhKTtcbiAgICAgIH0sXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBvcHRzPy5vbmx5RHRzRmlsZXMsXG4gICAgICBvcHRzPy50cmFuc2Zvcm1lcnMsXG4gICAgKTtcblxuICAgIGlmIChlbWl0UmVzdWx0LmRpYWdub3N0aWNzLmxlbmd0aCA+IDApIHtcbiAgICAgIG91dHB1dERpYWdub3N0aWNzKGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBIYWQgJHtlbWl0UmVzdWx0LmRpYWdub3N0aWNzLmxlbmd0aH0gZW1pdCBkaWFnbm9zdGljcy5gKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQYWNrYWdlSnNvbigpIHtcbiAgICBjb25zdCBwYWNrYWdlSnNvbk9iaiA9IGdldFBhY2thZ2VKc29uKHtcbiAgICAgIGVudHJ5UG9pbnRzLFxuICAgICAgdHJhbnNmb3JtT3V0cHV0LFxuICAgICAgcGFja2FnZTogb3B0aW9ucy5wYWNrYWdlLFxuICAgICAgdGVzdEVuYWJsZWQ6IG9wdGlvbnMudGVzdCxcbiAgICAgIGluY2x1ZGVFc01vZHVsZTogb3B0aW9ucy5lc01vZHVsZSAhPT0gZmFsc2UsXG4gICAgICBpbmNsdWRlU2NyaXB0TW9kdWxlOiBvcHRpb25zLnNjcmlwdE1vZHVsZSAhPT0gZmFsc2UsXG4gICAgICBpbmNsdWRlRGVjbGFyYXRpb25zOiBvcHRpb25zLmRlY2xhcmF0aW9uLFxuICAgICAgaW5jbHVkZVRzTGliOiBvcHRpb25zLmNvbXBpbGVyT3B0aW9ucz8uaW1wb3J0SGVscGVycyxcbiAgICAgIHNoaW1zOiBvcHRpb25zLnNoaW1zLFxuICAgIH0pO1xuICAgIHdyaXRlRmlsZShcbiAgICAgIHBhdGguam9pbihvcHRpb25zLm91dERpciwgXCJwYWNrYWdlLmpzb25cIiksXG4gICAgICBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbk9iaiwgdW5kZWZpbmVkLCAyKSxcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTnBtSWdub3JlKCkge1xuICAgIGNvbnN0IGZpbGVUZXh0ID0gZ2V0TnBtSWdub3JlVGV4dCh7XG4gICAgICBzb3VyY2VNYXA6IG9wdGlvbnMuY29tcGlsZXJPcHRpb25zPy5zb3VyY2VNYXAsXG4gICAgICBpbmxpbmVTb3VyY2VzOiBvcHRpb25zLmNvbXBpbGVyT3B0aW9ucz8uaW5saW5lU291cmNlcyxcbiAgICAgIHRlc3RGaWxlczogdHJhbnNmb3JtT3V0cHV0LnRlc3QuZmlsZXMsXG4gICAgICBpbmNsdWRlU2NyaXB0TW9kdWxlOiBvcHRpb25zLnNjcmlwdE1vZHVsZSAhPT0gZmFsc2UsXG4gICAgICBpbmNsdWRlRXNNb2R1bGU6IG9wdGlvbnMuZXNNb2R1bGUgIT09IGZhbHNlLFxuICAgIH0pO1xuICAgIHdyaXRlRmlsZShcbiAgICAgIHBhdGguam9pbihvcHRpb25zLm91dERpciwgXCIubnBtaWdub3JlXCIpLFxuICAgICAgZmlsZVRleHQsXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHRyYW5zZm9ybUVudHJ5UG9pbnRzKCk6IFByb21pc2U8VHJhbnNmb3JtT3V0cHV0PiB7XG4gICAgY29uc3QgeyBzaGltcywgdGVzdFNoaW1zIH0gPSBzaGltT3B0aW9uc1RvVHJhbnNmb3JtU2hpbXMob3B0aW9ucy5zaGltcyk7XG4gICAgcmV0dXJuIHRyYW5zZm9ybSh7XG4gICAgICBlbnRyeVBvaW50czogZW50cnlQb2ludHMubWFwKChlKSA9PiBlLnBhdGgpLFxuICAgICAgdGVzdEVudHJ5UG9pbnRzOiBvcHRpb25zLnRlc3RcbiAgICAgICAgPyBhd2FpdCBnbG9iKHtcbiAgICAgICAgICBwYXR0ZXJuOiBnZXRUZXN0UGF0dGVybigpLFxuICAgICAgICAgIHJvb3REaXI6IG9wdGlvbnMucm9vdFRlc3REaXIgPz8gRGVuby5jd2QoKSxcbiAgICAgICAgICBleGNsdWRlRGlyczogW29wdGlvbnMub3V0RGlyXSxcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXSxcbiAgICAgIHNoaW1zLFxuICAgICAgdGVzdFNoaW1zLFxuICAgICAgbWFwcGluZ3M6IG9wdGlvbnMubWFwcGluZ3MsXG4gICAgICB0YXJnZXQ6IHNjcmlwdFRhcmdldCxcbiAgICAgIGltcG9ydE1hcDogb3B0aW9ucy5pbXBvcnRNYXAsXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coYFtkbnRdICR7bWVzc2FnZX1gKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhcm4obWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc29sZS53YXJuKGNvbG9ycy55ZWxsb3coYFtkbnRdICR7bWVzc2FnZX1gKSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUZXN0TGF1bmNoZXJTY3JpcHQoKSB7XG4gICAgY29uc3QgZGVub1Rlc3RTaGltUGFja2FnZSA9IGdldERlcGVuZGVuY3lCeU5hbWUoXCJAZGVuby9zaGltLWRlbm8tdGVzdFwiKSA/P1xuICAgICAgZ2V0RGVwZW5kZW5jeUJ5TmFtZShcIkBkZW5vL3NoaW0tZGVub1wiKTtcbiAgICB3cml0ZUZpbGUoXG4gICAgICBwYXRoLmpvaW4ob3B0aW9ucy5vdXREaXIsIFwidGVzdF9ydW5uZXIuanNcIiksXG4gICAgICB0cmFuc2Zvcm1Db2RlVG9UYXJnZXQoXG4gICAgICAgIGdldFRlc3RSdW5uZXJDb2RlKHtcbiAgICAgICAgICBkZW5vVGVzdFNoaW1QYWNrYWdlTmFtZTogZGVub1Rlc3RTaGltUGFja2FnZSA9PSBudWxsXG4gICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgOiBkZW5vVGVzdFNoaW1QYWNrYWdlLm5hbWUgPT09IFwiQGRlbm8vc2hpbS1kZW5vXCJcbiAgICAgICAgICAgID8gXCJAZGVuby9zaGltLWRlbm8vdGVzdC1pbnRlcm5hbHNcIlxuICAgICAgICAgICAgOiBkZW5vVGVzdFNoaW1QYWNrYWdlLm5hbWUsXG4gICAgICAgICAgdGVzdEVudHJ5UG9pbnRzOiB0cmFuc2Zvcm1PdXRwdXQudGVzdC5lbnRyeVBvaW50cyxcbiAgICAgICAgICBpbmNsdWRlRXNNb2R1bGU6IG9wdGlvbnMuZXNNb2R1bGUgIT09IGZhbHNlLFxuICAgICAgICAgIGluY2x1ZGVTY3JpcHRNb2R1bGU6IG9wdGlvbnMuc2NyaXB0TW9kdWxlICE9PSBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbXBpbGVyU2NyaXB0VGFyZ2V0LFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeUJ5TmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1PdXRwdXQudGVzdC5kZXBlbmRlbmNpZXMuZmluZCgoZCkgPT4gZC5uYW1lID09PSBuYW1lKSA/P1xuICAgICAgICB0cmFuc2Zvcm1PdXRwdXQubWFpbi5kZXBlbmRlbmNpZXMuZmluZCgoZCkgPT4gZC5uYW1lID09PSBuYW1lKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUZXN0UGF0dGVybigpIHtcbiAgICAvLyAqIG5hbWVkIGB0ZXN0Lnt0cywgdHN4LCBqcywgbWpzLCBqc3h9YCxcbiAgICAvLyAqIG9yIGVuZGluZyB3aXRoIGAudGVzdC57dHMsIHRzeCwganMsIG1qcywganN4fWAsXG4gICAgLy8gKiBvciBlbmRpbmcgd2l0aCBgX3Rlc3Que3RzLCB0c3gsIGpzLCBtanMsIGpzeH1gXG4gICAgcmV0dXJuIG9wdGlvbnMudGVzdFBhdHRlcm4gPz9cbiAgICAgIFwiKiove3Rlc3Que3RzLHRzeCxqcyxtanMsanN4fSwqLnRlc3Que3RzLHRzeCxqcyxtanMsanN4fSwqX3Rlc3Que3RzLHRzeCxqcyxtanMsanN4fX1cIjtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUNFLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsMkJBQTJCLEVBQzNCLHdCQUF3QixFQUV4Qix3QkFBd0IsRUFDeEIsaUJBQWlCLEVBRWpCLHFCQUFxQixRQUNoQixvQkFBb0I7QUFDM0IsU0FBUyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxvQkFBb0I7QUFDeEUsU0FBc0IsMkJBQTJCLFFBQVEsaUJBQWlCO0FBQzFFLFNBQVMsZ0JBQWdCLFFBQVEsc0JBQXNCO0FBRXZELFNBQVMsSUFBSSxFQUFFLGFBQWEsRUFBRSxl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