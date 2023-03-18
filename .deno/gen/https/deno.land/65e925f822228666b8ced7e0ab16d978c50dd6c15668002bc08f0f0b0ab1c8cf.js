import { fromFileUrl, resolveImportMap, resolveModuleSpecifier, toFileUrl } from "./deps.ts";
import { load as nativeLoad } from "./src/native_loader.ts";
import { load as portableLoad } from "./src/portable_loader.ts";
/** The default loader to use. */ export const DEFAULT_LOADER = await Deno.permissions.query({
    name: "run"
}).then((res)=>res.state !== "granted") ? "portable" : "native";
export function denoPlugin(options = {}) {
    const loader = options.loader ?? DEFAULT_LOADER;
    return {
        name: "deno",
        setup (build) {
            const infoCache = new Map();
            let importMap = null;
            build.onStart(async function onStart() {
                if (options.importMapURL !== undefined) {
                    const resp = await fetch(options.importMapURL.href);
                    const txt = await resp.text();
                    importMap = resolveImportMap(JSON.parse(txt), options.importMapURL);
                } else {
                    importMap = null;
                }
            });
            build.onResolve({
                filter: /.*/
            }, function onResolve(args) {
                const resolveDir = args.resolveDir ? `${toFileUrl(args.resolveDir).href}/` : "";
                const referrer = args.importer ? `${args.namespace}:${args.importer}` : resolveDir;
                let resolved;
                if (importMap !== null) {
                    const res = resolveModuleSpecifier(args.path, importMap, new URL(referrer) || undefined);
                    resolved = new URL(res);
                } else {
                    resolved = new URL(args.path, referrer);
                }
                const protocol = resolved.protocol;
                if (protocol === "file:") {
                    const path = fromFileUrl(resolved);
                    return {
                        path,
                        namespace: "file"
                    };
                }
                const path1 = resolved.href.slice(protocol.length);
                return {
                    path: path1,
                    namespace: protocol.slice(0, -1)
                };
            });
            function onLoad(args) {
                let url;
                if (args.namespace === "file") {
                    url = toFileUrl(args.path);
                } else {
                    url = new URL(`${args.namespace}:${args.path}`);
                }
                switch(loader){
                    case "native":
                        return nativeLoad(infoCache, url, options);
                    case "portable":
                        return portableLoad(url, options);
                }
            }
            build.onLoad({
                filter: /.*\.json/,
                namespace: "file"
            }, onLoad);
            build.onLoad({
                filter: /.*/,
                namespace: "http"
            }, onLoad);
            build.onLoad({
                filter: /.*/,
                namespace: "https"
            }, onLoad);
            build.onLoad({
                filter: /.*/,
                namespace: "data"
            }, onLoad);
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXNidWlsZF9kZW5vX2xvYWRlckAwLjYuMC9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZXNidWlsZCxcbiAgZnJvbUZpbGVVcmwsXG4gIEltcG9ydE1hcCxcbiAgcmVzb2x2ZUltcG9ydE1hcCxcbiAgcmVzb2x2ZU1vZHVsZVNwZWNpZmllcixcbiAgdG9GaWxlVXJsLFxufSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5pbXBvcnQgeyBsb2FkIGFzIG5hdGl2ZUxvYWQgfSBmcm9tIFwiLi9zcmMvbmF0aXZlX2xvYWRlci50c1wiO1xuaW1wb3J0IHsgbG9hZCBhcyBwb3J0YWJsZUxvYWQgfSBmcm9tIFwiLi9zcmMvcG9ydGFibGVfbG9hZGVyLnRzXCI7XG5pbXBvcnQgeyBNb2R1bGVFbnRyeSB9IGZyb20gXCIuL3NyYy9kZW5vLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVub1BsdWdpbk9wdGlvbnMge1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgVVJMIHRvIGFuIGltcG9ydCBtYXAgdG8gdXNlIHdoZW4gcmVzb2x2aW5nIGltcG9ydCBzcGVjaWZpZXJzLlxuICAgKiBUaGUgVVJMIG11c3QgYmUgZmV0Y2hhYmxlIHdpdGggYGZldGNoYC5cbiAgICovXG4gIGltcG9ydE1hcFVSTD86IFVSTDtcbiAgLyoqXG4gICAqIFNwZWNpZnkgd2hpY2ggbG9hZGVyIHRvIHVzZS4gQnkgZGVmYXVsdCB0aGlzIHdpbGwgdXNlIHRoZSBgbmF0aXZlYCBsb2FkZXIsXG4gICAqIHVubGVzcyB0aGUgYC0tYWxsb3ctcnVuYCBwZXJtaXNzaW9uIGhhcyBub3QgYmVlbiBnaXZlbi5cbiAgICpcbiAgICogLSBgbmF0aXZlYDogICAgIFNoZWxscyBvdXQgdG8gdGhlIERlbm8gZXhlY3VhdGJsZSB1bmRlciB0aGUgaG9vZCB0byBsb2FkXG4gICAqICAgICAgICAgICAgICAgICBmaWxlcy4gUmVxdWlyZXMgLS1hbGxvdy1yZWFkIGFuZCAtLWFsbG93LXJ1bi5cbiAgICogLSBgcG9ydGFibGVgOiAgIERvIG1vZHVsZSBkb3dubG9hZGluZyBhbmQgY2FjaGluZyB3aXRoIG9ubHkgV2ViIEFQSXMuXG4gICAqICAgICAgICAgICAgICAgICBSZXF1aXJlcyAtLWFsbG93LXJlYWQgYW5kL29yIC0tYWxsb3ctbmV0LlxuICAgKi9cbiAgbG9hZGVyPzogXCJuYXRpdmVcIiB8IFwicG9ydGFibGVcIjtcbn1cblxuLyoqIFRoZSBkZWZhdWx0IGxvYWRlciB0byB1c2UuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9MT0FERVI6IFwibmF0aXZlXCIgfCBcInBvcnRhYmxlXCIgPVxuICBhd2FpdCBEZW5vLnBlcm1pc3Npb25zLnF1ZXJ5KHsgbmFtZTogXCJydW5cIiB9KS50aGVuKChyZXMpID0+XG4gICAgICByZXMuc3RhdGUgIT09IFwiZ3JhbnRlZFwiXG4gICAgKVxuICAgID8gXCJwb3J0YWJsZVwiXG4gICAgOiBcIm5hdGl2ZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVub1BsdWdpbihvcHRpb25zOiBEZW5vUGx1Z2luT3B0aW9ucyA9IHt9KTogZXNidWlsZC5QbHVnaW4ge1xuICBjb25zdCBsb2FkZXIgPSBvcHRpb25zLmxvYWRlciA/PyBERUZBVUxUX0xPQURFUjtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcImRlbm9cIixcbiAgICBzZXR1cChidWlsZCkge1xuICAgICAgY29uc3QgaW5mb0NhY2hlID0gbmV3IE1hcDxzdHJpbmcsIE1vZHVsZUVudHJ5PigpO1xuICAgICAgbGV0IGltcG9ydE1hcDogSW1wb3J0TWFwIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIGJ1aWxkLm9uU3RhcnQoYXN5bmMgZnVuY3Rpb24gb25TdGFydCgpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaW1wb3J0TWFwVVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2gob3B0aW9ucy5pbXBvcnRNYXBVUkwuaHJlZik7XG4gICAgICAgICAgY29uc3QgdHh0ID0gYXdhaXQgcmVzcC50ZXh0KCk7XG4gICAgICAgICAgaW1wb3J0TWFwID0gcmVzb2x2ZUltcG9ydE1hcChKU09OLnBhcnNlKHR4dCksIG9wdGlvbnMuaW1wb3J0TWFwVVJMKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbXBvcnRNYXAgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgYnVpbGQub25SZXNvbHZlKHsgZmlsdGVyOiAvLiovIH0sIGZ1bmN0aW9uIG9uUmVzb2x2ZShcbiAgICAgICAgYXJnczogZXNidWlsZC5PblJlc29sdmVBcmdzLFxuICAgICAgKTogZXNidWlsZC5PblJlc29sdmVSZXN1bHQgfCBudWxsIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZURpciA9IGFyZ3MucmVzb2x2ZURpclxuICAgICAgICAgID8gYCR7dG9GaWxlVXJsKGFyZ3MucmVzb2x2ZURpcikuaHJlZn0vYFxuICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgY29uc3QgcmVmZXJyZXIgPSBhcmdzLmltcG9ydGVyXG4gICAgICAgICAgPyBgJHthcmdzLm5hbWVzcGFjZX06JHthcmdzLmltcG9ydGVyfWBcbiAgICAgICAgICA6IHJlc29sdmVEaXI7XG4gICAgICAgIGxldCByZXNvbHZlZDogVVJMO1xuICAgICAgICBpZiAoaW1wb3J0TWFwICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgcmVzID0gcmVzb2x2ZU1vZHVsZVNwZWNpZmllcihcbiAgICAgICAgICAgIGFyZ3MucGF0aCxcbiAgICAgICAgICAgIGltcG9ydE1hcCxcbiAgICAgICAgICAgIG5ldyBVUkwocmVmZXJyZXIpIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJlc29sdmVkID0gbmV3IFVSTChyZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmVkID0gbmV3IFVSTChhcmdzLnBhdGgsIHJlZmVycmVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm90b2NvbCA9IHJlc29sdmVkLnByb3RvY29sO1xuICAgICAgICBpZiAocHJvdG9jb2wgPT09IFwiZmlsZTpcIikge1xuICAgICAgICAgIGNvbnN0IHBhdGggPSBmcm9tRmlsZVVybChyZXNvbHZlZCk7XG4gICAgICAgICAgcmV0dXJuIHsgcGF0aCwgbmFtZXNwYWNlOiBcImZpbGVcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhdGggPSByZXNvbHZlZC5ocmVmLnNsaWNlKHByb3RvY29sLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiB7IHBhdGgsIG5hbWVzcGFjZTogcHJvdG9jb2wuc2xpY2UoMCwgLTEpIH07XG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gb25Mb2FkKFxuICAgICAgICBhcmdzOiBlc2J1aWxkLk9uTG9hZEFyZ3MsXG4gICAgICApOiBQcm9taXNlPGVzYnVpbGQuT25Mb2FkUmVzdWx0IHwgbnVsbD4ge1xuICAgICAgICBsZXQgdXJsO1xuICAgICAgICBpZiAoYXJncy5uYW1lc3BhY2UgPT09IFwiZmlsZVwiKSB7XG4gICAgICAgICAgdXJsID0gdG9GaWxlVXJsKGFyZ3MucGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXJsID0gbmV3IFVSTChgJHthcmdzLm5hbWVzcGFjZX06JHthcmdzLnBhdGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChsb2FkZXIpIHtcbiAgICAgICAgICBjYXNlIFwibmF0aXZlXCI6XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTG9hZChpbmZvQ2FjaGUsIHVybCwgb3B0aW9ucyk7XG4gICAgICAgICAgY2FzZSBcInBvcnRhYmxlXCI6XG4gICAgICAgICAgICByZXR1cm4gcG9ydGFibGVMb2FkKHVybCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogLy4qXFwuanNvbi8sIG5hbWVzcGFjZTogXCJmaWxlXCIgfSwgb25Mb2FkKTtcbiAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogLy4qLywgbmFtZXNwYWNlOiBcImh0dHBcIiB9LCBvbkxvYWQpO1xuICAgICAgYnVpbGQub25Mb2FkKHsgZmlsdGVyOiAvLiovLCBuYW1lc3BhY2U6IFwiaHR0cHNcIiB9LCBvbkxvYWQpO1xuICAgICAgYnVpbGQub25Mb2FkKHsgZmlsdGVyOiAvLiovLCBuYW1lc3BhY2U6IFwiZGF0YVwiIH0sIG9uTG9hZCk7XG4gICAgfSxcbiAgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUVFLFdBQVcsRUFFWCxnQkFBZ0IsRUFDaEIsc0JBQXNCLEVBQ3RCLFNBQVMsUUFDSixZQUFZO0FBQ25CLFNBQVMsUUFBUSxVQUFVLFFBQVEseUJBQXlCO0FBQzVELFNBQVMsUUFBUSxZQUFZLFFBQVEsMkJBQTJCO0FBcUJoRSwrQkFBK0IsR0FDL0IsT0FBTyxNQUFNLGlCQUNYLE1BQU0sS0FBSyxXQUFXLENBQUMsS0FBSyxDQUFDO0lBQUUsTUFBTTtBQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsTUFDaEQsSUFBSSxLQUFLLEtBQUssYUFFZCxhQUNBLFFBQVEsQ0FBQztBQUVmLE9BQU8sU0FBUyxXQUFXLFVBQTZCLENBQUMsQ0FBQyxFQUFrQjtJQUMxRSxNQUFNLFNBQVMsUUFBUSxNQUFNLElBQUk7SUFDakMsT0FBTztRQUNMLE1BQU07UUFDTixPQUFNLEtBQUssRUFBRTtZQUNYLE1BQU0sWUFBWSxJQUFJO1lBQ3RCLElBQUksWUFBOEIsSUFBSTtZQUV0QyxNQUFNLE9BQU8sQ0FBQyxlQUFlLFVBQVU7Z0JBQ3JDLElBQUksUUFBUSxZQUFZLEtBQUssV0FBVztvQkFDdEMsTUFBTSxPQUFPLE1BQU0sTUFBTSxRQUFRLFlBQVksQ0FBQyxJQUFJO29CQUNsRCxNQUFNLE1BQU0sTUFBTSxLQUFLLElBQUk7b0JBQzNCLFlBQVksaUJBQWlCLEtBQUssS0FBSyxDQUFDLE1BQU0sUUFBUSxZQUFZO2dCQUNwRSxPQUFPO29CQUNMLFlBQVksSUFBSTtnQkFDbEIsQ0FBQztZQUNIO1lBRUEsTUFBTSxTQUFTLENBQUM7Z0JBQUUsUUFBUTtZQUFLLEdBQUcsU0FBUyxVQUN6QyxJQUEyQixFQUNpQjtnQkFDNUMsTUFBTSxhQUFhLEtBQUssVUFBVSxHQUM5QixDQUFDLEVBQUUsVUFBVSxLQUFLLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQ3JDLEVBQUU7Z0JBQ04sTUFBTSxXQUFXLEtBQUssUUFBUSxHQUMxQixDQUFDLEVBQUUsS0FBSyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsR0FDcEMsVUFBVTtnQkFDZCxJQUFJO2dCQUNKLElBQUksY0FBYyxJQUFJLEVBQUU7b0JBQ3RCLE1BQU0sTUFBTSx1QkFDVixLQUFLLElBQUksRUFDVCxXQUNBLElBQUksSUFBSSxhQUFhO29CQUV2QixXQUFXLElBQUksSUFBSTtnQkFDckIsT0FBTztvQkFDTCxXQUFXLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDaEMsQ0FBQztnQkFDRCxNQUFNLFdBQVcsU0FBUyxRQUFRO2dCQUNsQyxJQUFJLGFBQWEsU0FBUztvQkFDeEIsTUFBTSxPQUFPLFlBQVk7b0JBQ3pCLE9BQU87d0JBQUU7d0JBQU0sV0FBVztvQkFBTztnQkFDbkMsQ0FBQztnQkFDRCxNQUFNLFFBQU8sU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsTUFBTTtnQkFDaEQsT0FBTztvQkFBRSxNQUFBO29CQUFNLFdBQVcsU0FBUyxLQUFLLENBQUMsR0FBRyxDQUFDO2dCQUFHO1lBQ2xEO1lBRUEsU0FBUyxPQUNQLElBQXdCLEVBQ2M7Z0JBQ3RDLElBQUk7Z0JBQ0osSUFBSSxLQUFLLFNBQVMsS0FBSyxRQUFRO29CQUM3QixNQUFNLFVBQVUsS0FBSyxJQUFJO2dCQUMzQixPQUFPO29CQUNMLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQztnQkFDaEQsQ0FBQztnQkFDRCxPQUFRO29CQUNOLEtBQUs7d0JBQ0gsT0FBTyxXQUFXLFdBQVcsS0FBSztvQkFDcEMsS0FBSzt3QkFDSCxPQUFPLGFBQWEsS0FBSztnQkFDN0I7WUFDRjtZQUNBLE1BQU0sTUFBTSxDQUFDO2dCQUFFLFFBQVE7Z0JBQVksV0FBVztZQUFPLEdBQUc7WUFDeEQsTUFBTSxNQUFNLENBQUM7Z0JBQUUsUUFBUTtnQkFBTSxXQUFXO1lBQU8sR0FBRztZQUNsRCxNQUFNLE1BQU0sQ0FBQztnQkFBRSxRQUFRO2dCQUFNLFdBQVc7WUFBUSxHQUFHO1lBQ25ELE1BQU0sTUFBTSxDQUFDO2dCQUFFLFFBQVE7Z0JBQU0sV0FBVztZQUFPLEdBQUc7UUFDcEQ7SUFDRjtBQUNGLENBQUMifQ==