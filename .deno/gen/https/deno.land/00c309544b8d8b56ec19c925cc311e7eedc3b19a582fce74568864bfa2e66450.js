// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
export function getPackageJson({ transformOutput , entryPoints , package: packageJsonObj , includeEsModule , includeScriptModule , includeDeclarations , includeTsLib , testEnabled , shims  }) {
    const finalEntryPoints = transformOutput.main.entryPoints.map((e, i)=>({
            name: entryPoints[i].name,
            kind: entryPoints[i].kind ?? "export",
            path: e.replace(/\.tsx?$/i, ".js"),
            types: e.replace(/\.tsx?$/i, ".d.ts")
        }));
    const exports = finalEntryPoints.filter((e)=>e.kind === "export");
    const binaries = finalEntryPoints.filter((e)=>e.kind === "bin");
    const dependencies = {
        // typescript helpers library (https://www.npmjs.com/package/tslib)
        ...includeTsLib ? {
            tslib: "^2.4.1"
        } : {},
        // add dependencies from transform
        ...Object.fromEntries(transformOutput.main.dependencies.filter((d)=>!d.peerDependency).map((d)=>[
                d.name,
                d.version
            ])),
        // override with specified dependencies
        ...packageJsonObj.dependencies ?? {}
    };
    const peerDependencies = {
        // add dependencies from transform
        ...Object.fromEntries(transformOutput.main.dependencies.filter((d)=>d.peerDependency).map((d)=>[
                d.name,
                d.version
            ])),
        // override with specified dependencies
        ...packageJsonObj.peerDependencies ?? {}
    };
    const testDevDependencies = testEnabled ? {
        ...!Object.keys(dependencies).includes("chalk") ? {
            "chalk": "^4.1.2"
        } : {},
        // add dependencies from transform
        ...Object.fromEntries(// ignore peer dependencies on this
        transformOutput.test.dependencies.map((d)=>[
                d.name,
                d.version
            ]) ?? [])
    } : {};
    const devDependencies = {
        ...shouldIncludeTypesNode() ? {
            "@types/node": "^18.11.9"
        } : {},
        ...testDevDependencies,
        // override with specified dependencies
        ...packageJsonObj.devDependencies ?? {}
    };
    const scripts = testEnabled ? {
        test: "node test_runner.js",
        // override with specified scripts
        ...packageJsonObj.scripts ?? {}
    } : packageJsonObj.scripts;
    const mainExport = exports.length > 0 ? {
        module: includeEsModule ? `./esm/${exports[0].path}` : undefined,
        main: includeScriptModule ? `./script/${exports[0].path}` : undefined,
        types: includeDeclarations ? `./types/${exports[0].types}` : undefined
    } : {};
    const binaryExport = binaries.length > 0 ? {
        bin: Object.fromEntries(binaries.map((b)=>[
                b.name,
                `./esm/${b.path}`
            ]))
    } : {};
    return {
        ...mainExport,
        ...binaryExport,
        ...packageJsonObj,
        ...deleteEmptyKeys({
            exports: {
                ...includeEsModule || exports.length > 1 ? {
                    ...Object.fromEntries(exports.map((e)=>{
                        return [
                            e.name,
                            {
                                import: includeEsModule ? getPathOrTypesObject(`./esm/${e.path}`) : undefined,
                                require: includeScriptModule ? getPathOrTypesObject(`./script/${e.path}`) : undefined,
                                ...packageJsonObj.exports?.[e.name] ?? {}
                            }
                        ];
                        function getPathOrTypesObject(path) {
                            if (includeDeclarations) {
                                return {
                                    // "types" must always be first and "default" last
                                    types: (e.name === "." ? packageJsonObj.types : undefined) ?? `./types/${e.types}`,
                                    default: path
                                };
                            } else {
                                return path;
                            }
                        }
                    }))
                } : {},
                // allow someone to override
                ...packageJsonObj.exports ?? {}
            },
            scripts,
            dependencies,
            peerDependencies,
            devDependencies
        })
    };
    function shouldIncludeTypesNode() {
        if (Object.keys(dependencies).includes("@types/node")) {
            return false;
        }
        if (typeof shims.deno === "object") {
            if (shims.deno.test) {
                return true;
            } else {
                return false;
            }
        } else if (shims.deno || shims.undici) {
            return true;
        } else {
            return false;
        }
    }
    function deleteEmptyKeys(obj) {
        for (const key of Object.keys(obj)){
            const value = obj[key];
            if (typeof value === "object" && value != null && Object.keys(value).length === 0) {
                delete obj[key];
            }
        }
        return obj;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9saWIvcGFja2FnZV9qc29uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgRW50cnlQb2ludCwgU2hpbU9wdGlvbnMgfSBmcm9tIFwiLi4vbW9kLnRzXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm1PdXRwdXQgfSBmcm9tIFwiLi4vdHJhbnNmb3JtLnRzXCI7XG5pbXBvcnQgeyBQYWNrYWdlSnNvbk9iamVjdCB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0UGFja2FnZUpzb25PcHRpb25zIHtcbiAgdHJhbnNmb3JtT3V0cHV0OiBUcmFuc2Zvcm1PdXRwdXQ7XG4gIGVudHJ5UG9pbnRzOiBFbnRyeVBvaW50W107XG4gIHBhY2thZ2U6IFBhY2thZ2VKc29uT2JqZWN0O1xuICBpbmNsdWRlRXNNb2R1bGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIGluY2x1ZGVTY3JpcHRNb2R1bGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIGluY2x1ZGVEZWNsYXJhdGlvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIGluY2x1ZGVUc0xpYjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgdGVzdEVuYWJsZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIHNoaW1zOiBTaGltT3B0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhY2thZ2VKc29uKHtcbiAgdHJhbnNmb3JtT3V0cHV0LFxuICBlbnRyeVBvaW50cyxcbiAgcGFja2FnZTogcGFja2FnZUpzb25PYmosXG4gIGluY2x1ZGVFc01vZHVsZSxcbiAgaW5jbHVkZVNjcmlwdE1vZHVsZSxcbiAgaW5jbHVkZURlY2xhcmF0aW9ucyxcbiAgaW5jbHVkZVRzTGliLFxuICB0ZXN0RW5hYmxlZCxcbiAgc2hpbXMsXG59OiBHZXRQYWNrYWdlSnNvbk9wdGlvbnMpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIGNvbnN0IGZpbmFsRW50cnlQb2ludHMgPSB0cmFuc2Zvcm1PdXRwdXRcbiAgICAubWFpbi5lbnRyeVBvaW50cy5tYXAoKGUsIGkpID0+ICh7XG4gICAgICBuYW1lOiBlbnRyeVBvaW50c1tpXS5uYW1lLFxuICAgICAga2luZDogZW50cnlQb2ludHNbaV0ua2luZCA/PyBcImV4cG9ydFwiLFxuICAgICAgcGF0aDogZS5yZXBsYWNlKC9cXC50c3g/JC9pLCBcIi5qc1wiKSxcbiAgICAgIHR5cGVzOiBlLnJlcGxhY2UoL1xcLnRzeD8kL2ksIFwiLmQudHNcIiksXG4gICAgfSkpO1xuICBjb25zdCBleHBvcnRzID0gZmluYWxFbnRyeVBvaW50cy5maWx0ZXIoKGUpID0+IGUua2luZCA9PT0gXCJleHBvcnRcIik7XG4gIGNvbnN0IGJpbmFyaWVzID0gZmluYWxFbnRyeVBvaW50cy5maWx0ZXIoKGUpID0+IGUua2luZCA9PT0gXCJiaW5cIik7XG4gIGNvbnN0IGRlcGVuZGVuY2llcyA9IHtcbiAgICAvLyB0eXBlc2NyaXB0IGhlbHBlcnMgbGlicmFyeSAoaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvdHNsaWIpXG4gICAgLi4uKGluY2x1ZGVUc0xpYlxuICAgICAgPyB7XG4gICAgICAgIHRzbGliOiBcIl4yLjQuMVwiLFxuICAgICAgfVxuICAgICAgOiB7fSksXG4gICAgLy8gYWRkIGRlcGVuZGVuY2llcyBmcm9tIHRyYW5zZm9ybVxuICAgIC4uLk9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIHRyYW5zZm9ybU91dHB1dC5tYWluLmRlcGVuZGVuY2llc1xuICAgICAgICAuZmlsdGVyKChkKSA9PiAhZC5wZWVyRGVwZW5kZW5jeSlcbiAgICAgICAgLm1hcCgoZCkgPT4gW2QubmFtZSwgZC52ZXJzaW9uXSksXG4gICAgKSxcbiAgICAvLyBvdmVycmlkZSB3aXRoIHNwZWNpZmllZCBkZXBlbmRlbmNpZXNcbiAgICAuLi4ocGFja2FnZUpzb25PYmouZGVwZW5kZW5jaWVzID8/IHt9KSxcbiAgfTtcbiAgY29uc3QgcGVlckRlcGVuZGVuY2llcyA9IHtcbiAgICAvLyBhZGQgZGVwZW5kZW5jaWVzIGZyb20gdHJhbnNmb3JtXG4gICAgLi4uT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgdHJhbnNmb3JtT3V0cHV0Lm1haW4uZGVwZW5kZW5jaWVzXG4gICAgICAgIC5maWx0ZXIoKGQpID0+IGQucGVlckRlcGVuZGVuY3kpXG4gICAgICAgIC5tYXAoKGQpID0+IFtkLm5hbWUsIGQudmVyc2lvbl0pLFxuICAgICksXG4gICAgLy8gb3ZlcnJpZGUgd2l0aCBzcGVjaWZpZWQgZGVwZW5kZW5jaWVzXG4gICAgLi4uKHBhY2thZ2VKc29uT2JqLnBlZXJEZXBlbmRlbmNpZXMgPz8ge30pLFxuICB9O1xuICBjb25zdCB0ZXN0RGV2RGVwZW5kZW5jaWVzID0gdGVzdEVuYWJsZWRcbiAgICA/ICh7XG4gICAgICAuLi4oIU9iamVjdC5rZXlzKGRlcGVuZGVuY2llcykuaW5jbHVkZXMoXCJjaGFsa1wiKVxuICAgICAgICA/IHtcbiAgICAgICAgICBcImNoYWxrXCI6IFwiXjQuMS4yXCIsXG4gICAgICAgIH1cbiAgICAgICAgOiB7fSksXG4gICAgICAvLyBhZGQgZGVwZW5kZW5jaWVzIGZyb20gdHJhbnNmb3JtXG4gICAgICAuLi5PYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIC8vIGlnbm9yZSBwZWVyIGRlcGVuZGVuY2llcyBvbiB0aGlzXG4gICAgICAgIHRyYW5zZm9ybU91dHB1dC50ZXN0LmRlcGVuZGVuY2llcy5tYXAoKGQpID0+IFtkLm5hbWUsIGQudmVyc2lvbl0pID8/XG4gICAgICAgICAgW10sXG4gICAgICApLFxuICAgIH0pXG4gICAgOiB7fTtcbiAgY29uc3QgZGV2RGVwZW5kZW5jaWVzID0ge1xuICAgIC4uLihzaG91bGRJbmNsdWRlVHlwZXNOb2RlKClcbiAgICAgID8ge1xuICAgICAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjE4LjExLjlcIixcbiAgICAgIH1cbiAgICAgIDoge30pLFxuICAgIC4uLnRlc3REZXZEZXBlbmRlbmNpZXMsXG4gICAgLy8gb3ZlcnJpZGUgd2l0aCBzcGVjaWZpZWQgZGVwZW5kZW5jaWVzXG4gICAgLi4uKHBhY2thZ2VKc29uT2JqLmRldkRlcGVuZGVuY2llcyA/PyB7fSksXG4gIH07XG4gIGNvbnN0IHNjcmlwdHMgPSB0ZXN0RW5hYmxlZFxuICAgID8gKHtcbiAgICAgIHRlc3Q6IFwibm9kZSB0ZXN0X3J1bm5lci5qc1wiLFxuICAgICAgLy8gb3ZlcnJpZGUgd2l0aCBzcGVjaWZpZWQgc2NyaXB0c1xuICAgICAgLi4uKHBhY2thZ2VKc29uT2JqLnNjcmlwdHMgPz8ge30pLFxuICAgIH0pXG4gICAgOiBwYWNrYWdlSnNvbk9iai5zY3JpcHRzO1xuICBjb25zdCBtYWluRXhwb3J0ID0gZXhwb3J0cy5sZW5ndGggPiAwXG4gICAgPyB7XG4gICAgICBtb2R1bGU6IGluY2x1ZGVFc01vZHVsZSA/IGAuL2VzbS8ke2V4cG9ydHNbMF0ucGF0aH1gIDogdW5kZWZpbmVkLFxuICAgICAgbWFpbjogaW5jbHVkZVNjcmlwdE1vZHVsZSA/IGAuL3NjcmlwdC8ke2V4cG9ydHNbMF0ucGF0aH1gIDogdW5kZWZpbmVkLFxuICAgICAgdHlwZXM6IGluY2x1ZGVEZWNsYXJhdGlvbnMgPyBgLi90eXBlcy8ke2V4cG9ydHNbMF0udHlwZXN9YCA6IHVuZGVmaW5lZCxcbiAgICB9XG4gICAgOiB7fTtcbiAgY29uc3QgYmluYXJ5RXhwb3J0ID0gYmluYXJpZXMubGVuZ3RoID4gMFxuICAgID8ge1xuICAgICAgYmluOiBPYmplY3QuZnJvbUVudHJpZXMoYmluYXJpZXMubWFwKChiKSA9PiBbYi5uYW1lLCBgLi9lc20vJHtiLnBhdGh9YF0pKSxcbiAgICB9XG4gICAgOiB7fTtcblxuICByZXR1cm4ge1xuICAgIC4uLm1haW5FeHBvcnQsXG4gICAgLi4uYmluYXJ5RXhwb3J0LFxuICAgIC4uLnBhY2thZ2VKc29uT2JqLFxuICAgIC4uLmRlbGV0ZUVtcHR5S2V5cyh7XG4gICAgICBleHBvcnRzOiB7XG4gICAgICAgIC4uLihpbmNsdWRlRXNNb2R1bGUgfHwgZXhwb3J0cy5sZW5ndGggPiAxXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAuLi4oT2JqZWN0LmZyb21FbnRyaWVzKGV4cG9ydHMubWFwKChlKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBbZS5uYW1lLCB7XG4gICAgICAgICAgICAgICAgaW1wb3J0OiBpbmNsdWRlRXNNb2R1bGVcbiAgICAgICAgICAgICAgICAgID8gZ2V0UGF0aE9yVHlwZXNPYmplY3QoYC4vZXNtLyR7ZS5wYXRofWApXG4gICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZXF1aXJlOiBpbmNsdWRlU2NyaXB0TW9kdWxlXG4gICAgICAgICAgICAgICAgICA/IGdldFBhdGhPclR5cGVzT2JqZWN0KGAuL3NjcmlwdC8ke2UucGF0aH1gKVxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgLi4uKHBhY2thZ2VKc29uT2JqLmV4cG9ydHM/LltlLm5hbWVdID8/IHt9KSxcbiAgICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UGF0aE9yVHlwZXNPYmplY3QocGF0aDogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVEZWNsYXJhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFwidHlwZXNcIiBtdXN0IGFsd2F5cyBiZSBmaXJzdCBhbmQgXCJkZWZhdWx0XCIgbGFzdFxuICAgICAgICAgICAgICAgICAgICB0eXBlczpcbiAgICAgICAgICAgICAgICAgICAgICAoZS5uYW1lID09PSBcIi5cIiA/IHBhY2thZ2VKc29uT2JqLnR5cGVzIDogdW5kZWZpbmVkKSA/P1xuICAgICAgICAgICAgICAgICAgICAgICAgYC4vdHlwZXMvJHtlLnR5cGVzfWAsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHBhdGgsXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKSksXG4gICAgICAgICAgfVxuICAgICAgICAgIDoge30pLFxuICAgICAgICAvLyBhbGxvdyBzb21lb25lIHRvIG92ZXJyaWRlXG4gICAgICAgIC4uLihwYWNrYWdlSnNvbk9iai5leHBvcnRzID8/IHt9KSxcbiAgICAgIH0sXG4gICAgICBzY3JpcHRzLFxuICAgICAgZGVwZW5kZW5jaWVzLFxuICAgICAgcGVlckRlcGVuZGVuY2llcyxcbiAgICAgIGRldkRlcGVuZGVuY2llcyxcbiAgICB9KSxcbiAgfTtcblxuICBmdW5jdGlvbiBzaG91bGRJbmNsdWRlVHlwZXNOb2RlKCkge1xuICAgIGlmIChPYmplY3Qua2V5cyhkZXBlbmRlbmNpZXMpLmluY2x1ZGVzKFwiQHR5cGVzL25vZGVcIikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNoaW1zLmRlbm8gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGlmIChzaGltcy5kZW5vLnRlc3QpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzaGltcy5kZW5vIHx8IHNoaW1zLnVuZGljaSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZWxldGVFbXB0eUtleXMob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPSBudWxsICYmXG4gICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGggPT09IDBcbiAgICAgICkge1xuICAgICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFrQjFFLE9BQU8sU0FBUyxlQUFlLEVBQzdCLGdCQUFlLEVBQ2YsWUFBVyxFQUNYLFNBQVMsZUFBYyxFQUN2QixnQkFBZSxFQUNmLG9CQUFtQixFQUNuQixvQkFBbUIsRUFDbkIsYUFBWSxFQUNaLFlBQVcsRUFDWCxNQUFLLEVBQ2lCLEVBQTJCO0lBQ2pELE1BQU0sbUJBQW1CLGdCQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBTSxDQUFDO1lBQy9CLE1BQU0sV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJO1lBQ3pCLE1BQU0sV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUk7WUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZO1lBQzVCLE9BQU8sRUFBRSxPQUFPLENBQUMsWUFBWTtRQUMvQixDQUFDO0lBQ0gsTUFBTSxVQUFVLGlCQUFpQixNQUFNLENBQUMsQ0FBQyxJQUFNLEVBQUUsSUFBSSxLQUFLO0lBQzFELE1BQU0sV0FBVyxpQkFBaUIsTUFBTSxDQUFDLENBQUMsSUFBTSxFQUFFLElBQUksS0FBSztJQUMzRCxNQUFNLGVBQWU7UUFDbkIsbUVBQW1FO1FBQ25FLEdBQUksZUFDQTtZQUNBLE9BQU87UUFDVCxJQUNFLENBQUMsQ0FBQztRQUNOLGtDQUFrQztRQUNsQyxHQUFHLE9BQU8sV0FBVyxDQUNuQixn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