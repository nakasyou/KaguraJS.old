// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
export function getNpmIgnoreText(options) {
    // Try to make as little of this conditional in case a user edits settings
    // to exclude something, but then the output directory still has that file
    const lines = [];
    if (!isUsingSourceMaps() || options.inlineSources) {
        lines.push("src/");
    }
    for (const fileName of getTestFileNames()){
        lines.push(fileName);
    }
    lines.push("yarn.lock", "pnpm-lock.yaml");
    return Array.from(lines).join("\n") + "\n";
    function* getTestFileNames() {
        for (const file of options.testFiles){
            const filePath = file.filePath.replace(/\.ts$/i, ".js");
            const dtsFilePath = file.filePath.replace(/\.ts$/i, ".d.ts");
            if (options.includeEsModule) {
                yield `esm/${filePath}`;
            }
            if (options.includeScriptModule) {
                yield `script/${filePath}`;
            }
            yield `types/${dtsFilePath}`;
        }
        yield "test_runner.js";
    }
    function isUsingSourceMaps() {
        return options?.sourceMap === "inline" || options?.sourceMap === true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9saWIvbnBtX2lnbm9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBPdXRwdXRGaWxlIH0gZnJvbSBcIi4uL3RyYW5zZm9ybS50c1wiO1xuaW1wb3J0IHsgU291cmNlTWFwT3B0aW9ucyB9IGZyb20gXCIuL2NvbXBpbGVyLnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROcG1JZ25vcmVUZXh0KG9wdGlvbnM6IHtcbiAgc291cmNlTWFwPzogU291cmNlTWFwT3B0aW9ucztcbiAgaW5saW5lU291cmNlcz86IGJvb2xlYW47XG4gIHRlc3RGaWxlczogT3V0cHV0RmlsZVtdO1xuICBpbmNsdWRlU2NyaXB0TW9kdWxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICBpbmNsdWRlRXNNb2R1bGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG59KSB7XG4gIC8vIFRyeSB0byBtYWtlIGFzIGxpdHRsZSBvZiB0aGlzIGNvbmRpdGlvbmFsIGluIGNhc2UgYSB1c2VyIGVkaXRzIHNldHRpbmdzXG4gIC8vIHRvIGV4Y2x1ZGUgc29tZXRoaW5nLCBidXQgdGhlbiB0aGUgb3V0cHV0IGRpcmVjdG9yeSBzdGlsbCBoYXMgdGhhdCBmaWxlXG4gIGNvbnN0IGxpbmVzID0gW107XG4gIGlmICghaXNVc2luZ1NvdXJjZU1hcHMoKSB8fCBvcHRpb25zLmlubGluZVNvdXJjZXMpIHtcbiAgICBsaW5lcy5wdXNoKFwic3JjL1wiKTtcbiAgfVxuICBmb3IgKGNvbnN0IGZpbGVOYW1lIG9mIGdldFRlc3RGaWxlTmFtZXMoKSkge1xuICAgIGxpbmVzLnB1c2goZmlsZU5hbWUpO1xuICB9XG4gIGxpbmVzLnB1c2goXCJ5YXJuLmxvY2tcIiwgXCJwbnBtLWxvY2sueWFtbFwiKTtcbiAgcmV0dXJuIEFycmF5LmZyb20obGluZXMpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiO1xuXG4gIGZ1bmN0aW9uKiBnZXRUZXN0RmlsZU5hbWVzKCkge1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBvcHRpb25zLnRlc3RGaWxlcykge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBmaWxlLmZpbGVQYXRoLnJlcGxhY2UoL1xcLnRzJC9pLCBcIi5qc1wiKTtcbiAgICAgIGNvbnN0IGR0c0ZpbGVQYXRoID0gZmlsZS5maWxlUGF0aC5yZXBsYWNlKC9cXC50cyQvaSwgXCIuZC50c1wiKTtcbiAgICAgIGlmIChvcHRpb25zLmluY2x1ZGVFc01vZHVsZSkge1xuICAgICAgICB5aWVsZCBgZXNtLyR7ZmlsZVBhdGh9YDtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmluY2x1ZGVTY3JpcHRNb2R1bGUpIHtcbiAgICAgICAgeWllbGQgYHNjcmlwdC8ke2ZpbGVQYXRofWA7XG4gICAgICB9XG4gICAgICB5aWVsZCBgdHlwZXMvJHtkdHNGaWxlUGF0aH1gO1xuICAgIH1cbiAgICB5aWVsZCBcInRlc3RfcnVubmVyLmpzXCI7XG4gIH1cblxuICBmdW5jdGlvbiBpc1VzaW5nU291cmNlTWFwcygpIHtcbiAgICByZXR1cm4gb3B0aW9ucz8uc291cmNlTWFwID09PSBcImlubGluZVwiIHx8XG4gICAgICBvcHRpb25zPy5zb3VyY2VNYXAgPT09IHRydWU7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFLMUUsT0FBTyxTQUFTLGlCQUFpQixPQU1oQyxFQUFFO0lBQ0QsMEVBQTBFO0lBQzFFLDBFQUEwRTtJQUMxRSxNQUFNLFFBQVEsRUFBRTtJQUNoQixJQUFJLENBQUMsdUJBQXVCLFFBQVEsYUFBYSxFQUFFO1FBQ2pELE1BQU0sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUNELEtBQUssTUFBTSxZQUFZLG1CQUFvQjtRQUN6QyxNQUFNLElBQUksQ0FBQztJQUNiO0lBQ0EsTUFBTSxJQUFJLENBQUMsYUFBYTtJQUN4QixPQUFPLE1BQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVE7SUFFdEMsVUFBVSxtQkFBbUI7UUFDM0IsS0FBSyxNQUFNLFFBQVEsUUFBUSxTQUFTLENBQUU7WUFDcEMsTUFBTSxXQUFXLEtBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2pELE1BQU0sY0FBYyxLQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVTtZQUNwRCxJQUFJLFFBQVEsZUFBZSxFQUFFO2dCQUMzQixNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztZQUN6QixDQUFDO1lBQ0QsSUFBSSxRQUFRLG1CQUFtQixFQUFFO2dCQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztZQUM1QixDQUFDO1lBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUM7UUFDOUI7UUFDQSxNQUFNO0lBQ1I7SUFFQSxTQUFTLG9CQUFvQjtRQUMzQixPQUFPLFNBQVMsY0FBYyxZQUM1QixTQUFTLGNBQWMsSUFBSTtJQUMvQjtBQUNGLENBQUMifQ==