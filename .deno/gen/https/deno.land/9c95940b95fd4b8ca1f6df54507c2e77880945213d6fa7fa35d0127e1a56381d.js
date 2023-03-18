// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { path, ts } from "./mod.deps.ts";
export function outputDiagnostics(diagnostics) {
    const host = {
        getCanonicalFileName: (fileName)=>path.resolve(fileName),
        getCurrentDirectory: ()=>Deno.cwd(),
        getNewLine: ()=>"\n"
    };
    const output = Deno.noColor ? ts.formatDiagnostics(diagnostics, host) : ts.formatDiagnosticsWithColorAndContext(diagnostics, host);
    console.error(output);
}
export function getCompilerScriptTarget(target) {
    switch(target){
        case "ES3":
            return ts.ScriptTarget.ES3;
        case "ES5":
            return ts.ScriptTarget.ES5;
        case "ES2015":
            return ts.ScriptTarget.ES2015;
        case "ES2016":
            return ts.ScriptTarget.ES2016;
        case "ES2017":
            return ts.ScriptTarget.ES2017;
        case "ES2018":
            return ts.ScriptTarget.ES2018;
        case "ES2019":
            return ts.ScriptTarget.ES2019;
        case "ES2020":
            return ts.ScriptTarget.ES2020;
        case "ES2021":
            return ts.ScriptTarget.ES2021;
        case "Latest":
            return ts.ScriptTarget.Latest;
        default:
            throw new Error(`Unknown target compiler option: ${target}`);
    }
}
export function getCompilerLibOption(target) {
    switch(target){
        case "ES3":
            return [];
        case "ES5":
            return [
                "es5"
            ];
        case "ES2015":
            return [
                "es2015"
            ];
        case "ES2016":
            return [
                "es2016"
            ];
        case "ES2017":
            return [
                "es2017"
            ];
        case "ES2018":
            return [
                "es2018"
            ];
        case "ES2019":
            return [
                "es2019"
            ];
        case "ES2020":
            return [
                "es2020"
            ];
        case "ES2021":
            return [
                "es2021"
            ];
        case "Latest":
            return [
                "esnext"
            ];
        default:
            {
                const _assertNever = target;
                throw new Error(`Unknown target compiler option: ${target}`);
            }
    }
}
export function libNamesToCompilerOption(names) {
    const libFileNames = [];
    const libMap = ts.libMap;
    for (const name of names){
        const fileName = libMap.get(name);
        if (fileName == null) {
            throw new Error(`Could not find filename for lib: ${name}`);
        } else {
            libFileNames.push(fileName);
        }
    }
    return libFileNames;
}
export function getCompilerSourceMapOptions(sourceMaps) {
    switch(sourceMaps){
        case "inline":
            return {
                inlineSourceMap: true
            };
        case true:
            return {
                sourceMap: true
            };
        default:
            return {};
    }
}
export function getTopLevelAwaitLocation(sourceFile) {
    const topLevelAwait = getTopLevelAwait(sourceFile);
    if (topLevelAwait !== undefined) {
        return sourceFile.getLineAndCharacterOfPosition(topLevelAwait.getStart(sourceFile));
    }
    return undefined;
}
function getTopLevelAwait(node) {
    if (ts.isAwaitExpression(node)) {
        return node;
    }
    if (ts.isForOfStatement(node) && node.awaitModifier !== undefined) {
        return node;
    }
    return ts.forEachChild(node, (child)=>{
        if (!ts.isFunctionDeclaration(child) && !ts.isFunctionExpression(child) && !ts.isArrowFunction(child) && !ts.isMethodDeclaration(child)) {
            return getTopLevelAwait(child);
        }
    });
}
export function transformCodeToTarget(code, target) {
    return ts.transpile(code, {
        target
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9saWIvY29tcGlsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgcGF0aCwgdHMgfSBmcm9tIFwiLi9tb2QuZGVwcy50c1wiO1xuaW1wb3J0IHsgU2NyaXB0VGFyZ2V0IH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIG91dHB1dERpYWdub3N0aWNzKGRpYWdub3N0aWNzOiByZWFkb25seSB0cy5EaWFnbm9zdGljW10pIHtcbiAgY29uc3QgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0ge1xuICAgIGdldENhbm9uaWNhbEZpbGVOYW1lOiAoZmlsZU5hbWUpID0+IHBhdGgucmVzb2x2ZShmaWxlTmFtZSksXG4gICAgZ2V0Q3VycmVudERpcmVjdG9yeTogKCkgPT4gRGVuby5jd2QoKSxcbiAgICBnZXROZXdMaW5lOiAoKSA9PiBcIlxcblwiLFxuICB9O1xuICBjb25zdCBvdXRwdXQgPSBEZW5vLm5vQ29sb3JcbiAgICA/IHRzLmZvcm1hdERpYWdub3N0aWNzKGRpYWdub3N0aWNzLCBob3N0KVxuICAgIDogdHMuZm9ybWF0RGlhZ25vc3RpY3NXaXRoQ29sb3JBbmRDb250ZXh0KGRpYWdub3N0aWNzLCBob3N0KTtcbiAgY29uc29sZS5lcnJvcihvdXRwdXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcGlsZXJTY3JpcHRUYXJnZXQodGFyZ2V0OiBTY3JpcHRUYXJnZXQpIHtcbiAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICBjYXNlIFwiRVMzXCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMztcbiAgICBjYXNlIFwiRVM1XCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTNTtcbiAgICBjYXNlIFwiRVMyMDE1XCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNTtcbiAgICBjYXNlIFwiRVMyMDE2XCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNjtcbiAgICBjYXNlIFwiRVMyMDE3XCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNztcbiAgICBjYXNlIFwiRVMyMDE4XCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMjAxODtcbiAgICBjYXNlIFwiRVMyMDE5XCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMjAxOTtcbiAgICBjYXNlIFwiRVMyMDIwXCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMjAyMDtcbiAgICBjYXNlIFwiRVMyMDIxXCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkVTMjAyMTtcbiAgICBjYXNlIFwiTGF0ZXN0XCI6XG4gICAgICByZXR1cm4gdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHRhcmdldCBjb21waWxlciBvcHRpb246ICR7dGFyZ2V0fWApO1xuICB9XG59XG5cbi8vIENyZWF0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi8wYWQ1ZjgyZDYyNDNkYjgwZDQyYmMwYWJiN2ExOTFkZDM4MGU5ODBlL3NyYy9jb21waWxlci9jb21tYW5kTGluZVBhcnNlci50c1xuZXhwb3J0IHR5cGUgTGliTmFtZSA9XG4gIHwgXCJlczVcIlxuICB8IFwiZXM2XCJcbiAgfCBcImVzMjAxNVwiXG4gIHwgXCJlczdcIlxuICB8IFwiZXMyMDE2XCJcbiAgfCBcImVzMjAxN1wiXG4gIHwgXCJlczIwMThcIlxuICB8IFwiZXMyMDE5XCJcbiAgfCBcImVzMjAyMFwiXG4gIHwgXCJlczIwMjFcIlxuICB8IFwiZXMyMDIyXCJcbiAgfCBcImVzbmV4dFwiXG4gIHwgXCJkb21cIlxuICB8IFwiZG9tLml0ZXJhYmxlXCJcbiAgfCBcIndlYndvcmtlclwiXG4gIHwgXCJ3ZWJ3b3JrZXIuaW1wb3J0c2NyaXB0c1wiXG4gIHwgXCJ3ZWJ3b3JrZXIuaXRlcmFibGVcIlxuICB8IFwic2NyaXB0aG9zdFwiXG4gIHwgXCJlczIwMTUuY29yZVwiXG4gIHwgXCJlczIwMTUuY29sbGVjdGlvblwiXG4gIHwgXCJlczIwMTUuZ2VuZXJhdG9yXCJcbiAgfCBcImVzMjAxNS5pdGVyYWJsZVwiXG4gIHwgXCJlczIwMTUucHJvbWlzZVwiXG4gIHwgXCJlczIwMTUucHJveHlcIlxuICB8IFwiZXMyMDE1LnJlZmxlY3RcIlxuICB8IFwiZXMyMDE1LnN5bWJvbFwiXG4gIHwgXCJlczIwMTUuc3ltYm9sLndlbGxrbm93blwiXG4gIHwgXCJlczIwMTYuYXJyYXkuaW5jbHVkZVwiXG4gIHwgXCJlczIwMTcub2JqZWN0XCJcbiAgfCBcImVzMjAxNy5zaGFyZWRtZW1vcnlcIlxuICB8IFwiZXMyMDE3LnN0cmluZ1wiXG4gIHwgXCJlczIwMTcuaW50bFwiXG4gIHwgXCJlczIwMTcudHlwZWRhcnJheXNcIlxuICB8IFwiZXMyMDE4LmFzeW5jZ2VuZXJhdG9yXCJcbiAgfCBcImVzMjAxOC5hc3luY2l0ZXJhYmxlXCJcbiAgfCBcImVzMjAxOC5pbnRsXCJcbiAgfCBcImVzMjAxOC5wcm9taXNlXCJcbiAgfCBcImVzMjAxOC5yZWdleHBcIlxuICB8IFwiZXMyMDE5LmFycmF5XCJcbiAgfCBcImVzMjAxOS5vYmplY3RcIlxuICB8IFwiZXMyMDE5LnN0cmluZ1wiXG4gIHwgXCJlczIwMTkuc3ltYm9sXCJcbiAgfCBcImVzMjAyMC5iaWdpbnRcIlxuICB8IFwiZXMyMDIwLmRhdGVcIlxuICB8IFwiZXMyMDIwLnByb21pc2VcIlxuICB8IFwiZXMyMDIwLnNoYXJlZG1lbW9yeVwiXG4gIHwgXCJlczIwMjAuc3RyaW5nXCJcbiAgfCBcImVzMjAyMC5zeW1ib2wud2VsbGtub3duXCJcbiAgfCBcImVzMjAyMC5pbnRsXCJcbiAgfCBcImVzMjAyMC5udW1iZXJcIlxuICB8IFwiZXMyMDIxLnByb21pc2VcIlxuICB8IFwiZXMyMDIxLnN0cmluZ1wiXG4gIHwgXCJlczIwMjEud2Vha3JlZlwiXG4gIHwgXCJlczIwMjEuaW50bFwiXG4gIHwgXCJlczIwMjIuYXJyYXlcIlxuICB8IFwiZXMyMDIyLmVycm9yXCJcbiAgfCBcImVzMjAyMi5pbnRsXCJcbiAgfCBcImVzMjAyMi5vYmplY3RcIlxuICB8IFwiZXMyMDIyLnN0cmluZ1wiXG4gIHwgXCJlc25leHQuYXJyYXlcIlxuICB8IFwiZXNuZXh0LnN5bWJvbFwiXG4gIHwgXCJlc25leHQuYXN5bmNpdGVyYWJsZVwiXG4gIHwgXCJlc25leHQuaW50bFwiXG4gIHwgXCJlc25leHQuYmlnaW50XCJcbiAgfCBcImVzbmV4dC5zdHJpbmdcIlxuICB8IFwiZXNuZXh0LnByb21pc2VcIlxuICB8IFwiZXNuZXh0LndlYWtyZWZcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBpbGVyTGliT3B0aW9uKHRhcmdldDogU2NyaXB0VGFyZ2V0KTogTGliTmFtZVtdIHtcbiAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICBjYXNlIFwiRVMzXCI6XG4gICAgICByZXR1cm4gW107XG4gICAgY2FzZSBcIkVTNVwiOlxuICAgICAgcmV0dXJuIFtcImVzNVwiXTtcbiAgICBjYXNlIFwiRVMyMDE1XCI6XG4gICAgICByZXR1cm4gW1wiZXMyMDE1XCJdO1xuICAgIGNhc2UgXCJFUzIwMTZcIjpcbiAgICAgIHJldHVybiBbXCJlczIwMTZcIl07XG4gICAgY2FzZSBcIkVTMjAxN1wiOlxuICAgICAgcmV0dXJuIFtcImVzMjAxN1wiXTtcbiAgICBjYXNlIFwiRVMyMDE4XCI6XG4gICAgICByZXR1cm4gW1wiZXMyMDE4XCJdO1xuICAgIGNhc2UgXCJFUzIwMTlcIjpcbiAgICAgIHJldHVybiBbXCJlczIwMTlcIl07XG4gICAgY2FzZSBcIkVTMjAyMFwiOlxuICAgICAgcmV0dXJuIFtcImVzMjAyMFwiXTtcbiAgICBjYXNlIFwiRVMyMDIxXCI6XG4gICAgICByZXR1cm4gW1wiZXMyMDIxXCJdO1xuICAgIGNhc2UgXCJMYXRlc3RcIjpcbiAgICAgIHJldHVybiBbXCJlc25leHRcIl07XG4gICAgZGVmYXVsdDoge1xuICAgICAgY29uc3QgX2Fzc2VydE5ldmVyOiBuZXZlciA9IHRhcmdldDtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0YXJnZXQgY29tcGlsZXIgb3B0aW9uOiAke3RhcmdldH1gKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpYk5hbWVzVG9Db21waWxlck9wdGlvbihuYW1lczogTGliTmFtZVtdKSB7XG4gIGNvbnN0IGxpYkZpbGVOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgbGliTWFwID0gKHRzIGFzIGFueSkubGliTWFwIGFzIE1hcDxzdHJpbmcsIHN0cmluZz47XG4gIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xuICAgIGNvbnN0IGZpbGVOYW1lID0gbGliTWFwLmdldChuYW1lKTtcbiAgICBpZiAoZmlsZU5hbWUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlbmFtZSBmb3IgbGliOiAke25hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYkZpbGVOYW1lcy5wdXNoKGZpbGVOYW1lKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGxpYkZpbGVOYW1lcztcbn1cblxuZXhwb3J0IHR5cGUgU291cmNlTWFwT3B0aW9ucyA9IFwiaW5saW5lXCIgfCBib29sZWFuO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcGlsZXJTb3VyY2VNYXBPcHRpb25zKFxuICBzb3VyY2VNYXBzOiBTb3VyY2VNYXBPcHRpb25zIHwgdW5kZWZpbmVkLFxuKTogeyBpbmxpbmVTb3VyY2VNYXA/OiBib29sZWFuOyBzb3VyY2VNYXA/OiBib29sZWFuIH0ge1xuICBzd2l0Y2ggKHNvdXJjZU1hcHMpIHtcbiAgICBjYXNlIFwiaW5saW5lXCI6XG4gICAgICByZXR1cm4geyBpbmxpbmVTb3VyY2VNYXA6IHRydWUgfTtcbiAgICBjYXNlIHRydWU6XG4gICAgICByZXR1cm4geyBzb3VyY2VNYXA6IHRydWUgfTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHt9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3BMZXZlbEF3YWl0TG9jYXRpb24oc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkge1xuICBjb25zdCB0b3BMZXZlbEF3YWl0ID0gZ2V0VG9wTGV2ZWxBd2FpdChzb3VyY2VGaWxlKTtcbiAgaWYgKHRvcExldmVsQXdhaXQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBzb3VyY2VGaWxlLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKFxuICAgICAgdG9wTGV2ZWxBd2FpdC5nZXRTdGFydChzb3VyY2VGaWxlKSxcbiAgICApO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldFRvcExldmVsQXdhaXQobm9kZTogdHMuTm9kZSk6IHRzLk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAodHMuaXNBd2FpdEV4cHJlc3Npb24obm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICBpZiAodHMuaXNGb3JPZlN0YXRlbWVudChub2RlKSAmJiBub2RlLmF3YWl0TW9kaWZpZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIHJldHVybiB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgKGNoaWxkKSA9PiB7XG4gICAgaWYgKFxuICAgICAgIXRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihjaGlsZCkgJiYgIXRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKGNoaWxkKSAmJlxuICAgICAgIXRzLmlzQXJyb3dGdW5jdGlvbihjaGlsZCkgJiYgIXRzLmlzTWV0aG9kRGVjbGFyYXRpb24oY2hpbGQpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZ2V0VG9wTGV2ZWxBd2FpdChjaGlsZCk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybUNvZGVUb1RhcmdldChjb2RlOiBzdHJpbmcsIHRhcmdldDogdHMuU2NyaXB0VGFyZ2V0KSB7XG4gIHJldHVybiB0cy50cmFuc3BpbGUoY29kZSwge1xuICAgIHRhcmdldCxcbiAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxFQUFFLEVBQUUsUUFBUSxnQkFBZ0I7QUFHekMsT0FBTyxTQUFTLGtCQUFrQixXQUFxQyxFQUFFO0lBQ3ZFLE1BQU0sT0FBaUM7UUFDckMsc0JBQXNCLENBQUMsV0FBYSxLQUFLLE9BQU8sQ0FBQztRQUNqRCxxQkFBcUIsSUFBTSxLQUFLLEdBQUc7UUFDbkMsWUFBWSxJQUFNO0lBQ3BCO0lBQ0EsTUFBTSxTQUFTLEtBQUssT0FBTyxHQUN2QixHQUFHLGlCQUFpQixDQUFDLGFBQWEsUUFDbEMsR0FBRyxvQ0FBb0MsQ0FBQyxhQUFhLEtBQUs7SUFDOUQsUUFBUSxLQUFLLENBQUM7QUFDaEIsQ0FBQztBQUVELE9BQU8sU0FBUyx3QkFBd0IsTUFBb0IsRUFBRTtJQUM1RCxPQUFRO1FBQ04sS0FBSztZQUNILE9BQU8sR0FBRyxZQUFZLENBQUMsR0FBRztRQUM1QixLQUFLO1lBQ0gsT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHO1FBQzVCLEtBQUs7WUFDSCxPQUFPLEdBQUcsWUFBWSxDQUFDLE1BQU07UUFDL0IsS0FBSztZQUNILE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTTtRQUMvQixLQUFLO1lBQ0gsT0FBTyxHQUFHLFlBQVksQ0FBQyxNQUFNO1FBQy9CLEtBQUs7WUFDSCxPQUFPLEdBQUcsWUFBWSxDQUFDLE1BQU07UUFDL0IsS0FBSztZQUNILE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTTtRQUMvQixLQUFLO1lBQ0gsT0FBTyxHQUFHLFlBQVksQ0FBQyxNQUFNO1FBQy9C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