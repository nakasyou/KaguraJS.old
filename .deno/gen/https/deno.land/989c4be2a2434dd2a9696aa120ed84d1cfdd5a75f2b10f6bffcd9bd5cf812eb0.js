// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { CodeBlockWriter } from "../mod.deps.ts";
import { runTestDefinitions } from "./test_runner.ts";
export function getTestRunnerCode(options) {
    const usesDenoTest = options.denoTestShimPackageName != null;
    const writer = createWriter();
    writer.writeLine(`const chalk = require("chalk");`).writeLine(`const process = require("process");`);
    if (usesDenoTest) {
        writer.writeLine(`const { pathToFileURL } = require("url");`);
        writer.writeLine(`const { testDefinitions } = require("${options.denoTestShimPackageName}");`);
    }
    writer.blankLine();
    writer.writeLine("const filePaths = [");
    writer.indent(()=>{
        for (const entryPoint of options.testEntryPoints){
            writer.quote(entryPoint.replace(/\.ts$/, ".js")).write(",").newLine();
        }
    });
    writer.writeLine("];").newLine();
    writer.write("async function main()").block(()=>{
        if (usesDenoTest) {
            writer.write("const testContext = ").inlineBlock(()=>{
                writer.writeLine("process,");
                writer.writeLine("chalk,");
            }).write(";").newLine();
        }
        writer.write("for (const [i, filePath] of filePaths.entries())").block(()=>{
            writer.write("if (i > 0)").block(()=>{
                writer.writeLine(`console.log("");`);
            }).blankLine();
            if (options.includeScriptModule) {
                writer.writeLine(`const scriptPath = "./script/" + filePath;`);
                writer.writeLine(`console.log("Running tests in " + chalk.underline(scriptPath) + "...\\n");`);
                writer.writeLine(`process.chdir(__dirname + "/script");`);
                if (usesDenoTest) {
                    writer.write(`const scriptTestContext = `).inlineBlock(()=>{
                        writer.writeLine("origin: pathToFileURL(filePath).toString(),");
                        writer.writeLine("...testContext,");
                    }).write(";").newLine();
                }
                writer.write("try ").inlineBlock(()=>{
                    writer.writeLine(`require(scriptPath);`);
                }).write(" catch(err)").block(()=>{
                    writer.writeLine("console.error(err);");
                    writer.writeLine("process.exit(1);");
                });
                if (usesDenoTest) {
                    writer.writeLine("await runTestDefinitions(testDefinitions.splice(0, testDefinitions.length), scriptTestContext);");
                }
            }
            if (options.includeEsModule) {
                if (options.includeScriptModule) {
                    writer.blankLine();
                }
                writer.writeLine(`const esmPath = "./esm/" + filePath;`);
                writer.writeLine(`console.log("\\nRunning tests in " + chalk.underline(esmPath) + "...\\n");`);
                writer.writeLine(`process.chdir(__dirname + "/esm");`);
                if (usesDenoTest) {
                    writer.write(`const esmTestContext = `).inlineBlock(()=>{
                        writer.writeLine("origin: pathToFileURL(filePath).toString(),");
                        writer.writeLine("...testContext,");
                    }).write(";").newLine();
                }
                writer.writeLine(`await import(esmPath);`);
                if (usesDenoTest) {
                    writer.writeLine("await runTestDefinitions(testDefinitions.splice(0, testDefinitions.length), esmTestContext);");
                }
            }
        });
    });
    writer.blankLine();
    if (options.denoTestShimPackageName != null) {
        writer.writeLine(`${getRunTestDefinitionsCode()}`);
        writer.blankLine();
    }
    writer.writeLine("main();");
    return writer.toString();
}
function getRunTestDefinitionsCode() {
    return runTestDefinitions.toString().replace("export async function", "async function");
}
function createWriter() {
    return new CodeBlockWriter({
        indentNumberOfSpaces: 2
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9saWIvdGVzdF9ydW5uZXIvZ2V0X3Rlc3RfcnVubmVyX2NvZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgQ29kZUJsb2NrV3JpdGVyIH0gZnJvbSBcIi4uL21vZC5kZXBzLnRzXCI7XG5pbXBvcnQgeyBydW5UZXN0RGVmaW5pdGlvbnMgfSBmcm9tIFwiLi90ZXN0X3J1bm5lci50c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVzdFJ1bm5lckNvZGUob3B0aW9uczoge1xuICB0ZXN0RW50cnlQb2ludHM6IHN0cmluZ1tdO1xuICBkZW5vVGVzdFNoaW1QYWNrYWdlTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBpbmNsdWRlRXNNb2R1bGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIGluY2x1ZGVTY3JpcHRNb2R1bGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG59KSB7XG4gIGNvbnN0IHVzZXNEZW5vVGVzdCA9IG9wdGlvbnMuZGVub1Rlc3RTaGltUGFja2FnZU5hbWUgIT0gbnVsbDtcbiAgY29uc3Qgd3JpdGVyID0gY3JlYXRlV3JpdGVyKCk7XG4gIHdyaXRlci53cml0ZUxpbmUoYGNvbnN0IGNoYWxrID0gcmVxdWlyZShcImNoYWxrXCIpO2ApXG4gICAgLndyaXRlTGluZShgY29uc3QgcHJvY2VzcyA9IHJlcXVpcmUoXCJwcm9jZXNzXCIpO2ApO1xuICBpZiAodXNlc0Rlbm9UZXN0KSB7XG4gICAgd3JpdGVyLndyaXRlTGluZShgY29uc3QgeyBwYXRoVG9GaWxlVVJMIH0gPSByZXF1aXJlKFwidXJsXCIpO2ApO1xuICAgIHdyaXRlci53cml0ZUxpbmUoXG4gICAgICBgY29uc3QgeyB0ZXN0RGVmaW5pdGlvbnMgfSA9IHJlcXVpcmUoXCIke29wdGlvbnMuZGVub1Rlc3RTaGltUGFja2FnZU5hbWV9XCIpO2AsXG4gICAgKTtcbiAgfVxuICB3cml0ZXIuYmxhbmtMaW5lKCk7XG5cbiAgd3JpdGVyLndyaXRlTGluZShcImNvbnN0IGZpbGVQYXRocyA9IFtcIik7XG4gIHdyaXRlci5pbmRlbnQoKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZW50cnlQb2ludCBvZiBvcHRpb25zLnRlc3RFbnRyeVBvaW50cykge1xuICAgICAgd3JpdGVyLnF1b3RlKGVudHJ5UG9pbnQucmVwbGFjZSgvXFwudHMkLywgXCIuanNcIikpLndyaXRlKFwiLFwiKS5uZXdMaW5lKCk7XG4gICAgfVxuICB9KTtcbiAgd3JpdGVyLndyaXRlTGluZShcIl07XCIpLm5ld0xpbmUoKTtcblxuICB3cml0ZXIud3JpdGUoXCJhc3luYyBmdW5jdGlvbiBtYWluKClcIikuYmxvY2soKCkgPT4ge1xuICAgIGlmICh1c2VzRGVub1Rlc3QpIHtcbiAgICAgIHdyaXRlci53cml0ZShcImNvbnN0IHRlc3RDb250ZXh0ID0gXCIpLmlubGluZUJsb2NrKCgpID0+IHtcbiAgICAgICAgd3JpdGVyLndyaXRlTGluZShcInByb2Nlc3MsXCIpO1xuICAgICAgICB3cml0ZXIud3JpdGVMaW5lKFwiY2hhbGssXCIpO1xuICAgICAgfSkud3JpdGUoXCI7XCIpLm5ld0xpbmUoKTtcbiAgICB9XG4gICAgd3JpdGVyLndyaXRlKFwiZm9yIChjb25zdCBbaSwgZmlsZVBhdGhdIG9mIGZpbGVQYXRocy5lbnRyaWVzKCkpXCIpXG4gICAgICAuYmxvY2soKCkgPT4ge1xuICAgICAgICB3cml0ZXIud3JpdGUoXCJpZiAoaSA+IDApXCIpLmJsb2NrKCgpID0+IHtcbiAgICAgICAgICB3cml0ZXIud3JpdGVMaW5lKGBjb25zb2xlLmxvZyhcIlwiKTtgKTtcbiAgICAgICAgfSkuYmxhbmtMaW5lKCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaW5jbHVkZVNjcmlwdE1vZHVsZSkge1xuICAgICAgICAgIHdyaXRlci53cml0ZUxpbmUoYGNvbnN0IHNjcmlwdFBhdGggPSBcIi4vc2NyaXB0L1wiICsgZmlsZVBhdGg7YCk7XG4gICAgICAgICAgd3JpdGVyLndyaXRlTGluZShcbiAgICAgICAgICAgIGBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgdGVzdHMgaW4gXCIgKyBjaGFsay51bmRlcmxpbmUoc2NyaXB0UGF0aCkgKyBcIi4uLlxcXFxuXCIpO2AsXG4gICAgICAgICAgKTtcbiAgICAgICAgICB3cml0ZXIud3JpdGVMaW5lKGBwcm9jZXNzLmNoZGlyKF9fZGlybmFtZSArIFwiL3NjcmlwdFwiKTtgKTtcbiAgICAgICAgICBpZiAodXNlc0Rlbm9UZXN0KSB7XG4gICAgICAgICAgICB3cml0ZXIud3JpdGUoYGNvbnN0IHNjcmlwdFRlc3RDb250ZXh0ID0gYCkuaW5saW5lQmxvY2soKCkgPT4ge1xuICAgICAgICAgICAgICB3cml0ZXIud3JpdGVMaW5lKFwib3JpZ2luOiBwYXRoVG9GaWxlVVJMKGZpbGVQYXRoKS50b1N0cmluZygpLFwiKTtcbiAgICAgICAgICAgICAgd3JpdGVyLndyaXRlTGluZShcIi4uLnRlc3RDb250ZXh0LFwiKTtcbiAgICAgICAgICAgIH0pLndyaXRlKFwiO1wiKS5uZXdMaW5lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHdyaXRlci53cml0ZShcInRyeSBcIikuaW5saW5lQmxvY2soKCkgPT4ge1xuICAgICAgICAgICAgd3JpdGVyLndyaXRlTGluZShgcmVxdWlyZShzY3JpcHRQYXRoKTtgKTtcbiAgICAgICAgICB9KS53cml0ZShcIiBjYXRjaChlcnIpXCIpLmJsb2NrKCgpID0+IHtcbiAgICAgICAgICAgIHdyaXRlci53cml0ZUxpbmUoXCJjb25zb2xlLmVycm9yKGVycik7XCIpO1xuICAgICAgICAgICAgd3JpdGVyLndyaXRlTGluZShcInByb2Nlc3MuZXhpdCgxKTtcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHVzZXNEZW5vVGVzdCkge1xuICAgICAgICAgICAgd3JpdGVyLndyaXRlTGluZShcbiAgICAgICAgICAgICAgXCJhd2FpdCBydW5UZXN0RGVmaW5pdGlvbnModGVzdERlZmluaXRpb25zLnNwbGljZSgwLCB0ZXN0RGVmaW5pdGlvbnMubGVuZ3RoKSwgc2NyaXB0VGVzdENvbnRleHQpO1wiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5pbmNsdWRlRXNNb2R1bGUpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5pbmNsdWRlU2NyaXB0TW9kdWxlKSB7XG4gICAgICAgICAgICB3cml0ZXIuYmxhbmtMaW5lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHdyaXRlci53cml0ZUxpbmUoYGNvbnN0IGVzbVBhdGggPSBcIi4vZXNtL1wiICsgZmlsZVBhdGg7YCk7XG4gICAgICAgICAgd3JpdGVyLndyaXRlTGluZShcbiAgICAgICAgICAgIGBjb25zb2xlLmxvZyhcIlxcXFxuUnVubmluZyB0ZXN0cyBpbiBcIiArIGNoYWxrLnVuZGVybGluZShlc21QYXRoKSArIFwiLi4uXFxcXG5cIik7YCxcbiAgICAgICAgICApO1xuICAgICAgICAgIHdyaXRlci53cml0ZUxpbmUoYHByb2Nlc3MuY2hkaXIoX19kaXJuYW1lICsgXCIvZXNtXCIpO2ApO1xuICAgICAgICAgIGlmICh1c2VzRGVub1Rlc3QpIHtcbiAgICAgICAgICAgIHdyaXRlci53cml0ZShgY29uc3QgZXNtVGVzdENvbnRleHQgPSBgKS5pbmxpbmVCbG9jaygoKSA9PiB7XG4gICAgICAgICAgICAgIHdyaXRlci53cml0ZUxpbmUoXCJvcmlnaW46IHBhdGhUb0ZpbGVVUkwoZmlsZVBhdGgpLnRvU3RyaW5nKCksXCIpO1xuICAgICAgICAgICAgICB3cml0ZXIud3JpdGVMaW5lKFwiLi4udGVzdENvbnRleHQsXCIpO1xuICAgICAgICAgICAgfSkud3JpdGUoXCI7XCIpLm5ld0xpbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgd3JpdGVyLndyaXRlTGluZShgYXdhaXQgaW1wb3J0KGVzbVBhdGgpO2ApO1xuICAgICAgICAgIGlmICh1c2VzRGVub1Rlc3QpIHtcbiAgICAgICAgICAgIHdyaXRlci53cml0ZUxpbmUoXG4gICAgICAgICAgICAgIFwiYXdhaXQgcnVuVGVzdERlZmluaXRpb25zKHRlc3REZWZpbml0aW9ucy5zcGxpY2UoMCwgdGVzdERlZmluaXRpb25zLmxlbmd0aCksIGVzbVRlc3RDb250ZXh0KTtcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSk7XG4gIHdyaXRlci5ibGFua0xpbmUoKTtcblxuICBpZiAob3B0aW9ucy5kZW5vVGVzdFNoaW1QYWNrYWdlTmFtZSAhPSBudWxsKSB7XG4gICAgd3JpdGVyLndyaXRlTGluZShgJHtnZXRSdW5UZXN0RGVmaW5pdGlvbnNDb2RlKCl9YCk7XG4gICAgd3JpdGVyLmJsYW5rTGluZSgpO1xuICB9XG5cbiAgd3JpdGVyLndyaXRlTGluZShcIm1haW4oKTtcIik7XG4gIHJldHVybiB3cml0ZXIudG9TdHJpbmcoKTtcbn1cblxuZnVuY3Rpb24gZ2V0UnVuVGVzdERlZmluaXRpb25zQ29kZSgpIHtcbiAgcmV0dXJuIHJ1blRlc3REZWZpbml0aW9ucy50b1N0cmluZygpLnJlcGxhY2UoXG4gICAgXCJleHBvcnQgYXN5bmMgZnVuY3Rpb25cIixcbiAgICBcImFzeW5jIGZ1bmN0aW9uXCIsXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdyaXRlcigpIHtcbiAgcmV0dXJuIG5ldyBDb2RlQmxvY2tXcml0ZXIoe1xuICAgIGluZGVudE51bWJlck9mU3BhY2VzOiAyLFxuICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsU0FBUyxlQUFlLFFBQVEsaUJBQWlCO0FBQ2pELFNBQVMsa0JBQWtCLFFBQVEsbUJBQW1CO0FBRXRELE9BQU8sU0FBUyxrQkFBa0IsT0FLakMsRUFBRTtJQUNELE1BQU0sZUFBZSxR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