// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { dirname, ensureDir, fromFileUrl, isAbsolute, join, readAll, sep, writeAll } from "./deps.ts";
import { assert, CACHE_PERM, urlToFilename } from "./util.ts";
export class DiskCache {
    location;
    constructor(location){
        assert(isAbsolute(location));
        this.location = location;
    }
    async get(filename) {
        const path = join(this.location, filename);
        const file = await Deno.open(path, {
            read: true
        });
        const value = await readAll(file);
        file.close();
        return value;
    }
    async set(filename, data) {
        const path = join(this.location, filename);
        const parentFilename = dirname(path);
        await ensureDir(parentFilename);
        const file = await Deno.open(path, {
            write: true,
            create: true,
            mode: CACHE_PERM
        });
        await writeAll(file, data);
        file.close();
    }
    static getCacheFilename(url) {
        const out = [];
        const scheme = url.protocol.replace(":", "");
        out.push(scheme);
        switch(scheme){
            case "wasm":
                {
                    const { hostname , port  } = url;
                    out.push(port ? `${hostname}_PORT${port}` : hostname);
                    out.push(...url.pathname.split("/"));
                    break;
                }
            case "http":
            case "https":
            case "data":
            case "blob":
                return urlToFilename(url);
            case "file":
                {
                    const path = fromFileUrl(url);
                    if (!path) {
                        return undefined;
                    }
                    const { host  } = url;
                    if (host) {
                        out.push("UNC");
                        out.push(host.replaceAll(":", "_"));
                    }
                    const pathComponents = path.split(sep).filter((p)=>p.length > 0);
                    if (Deno.build.os === "windows") {
                        if (host) {
                            // windows will have the host in the result of fromFileUrl, so remove it
                            pathComponents.shift();
                        }
                        const first = pathComponents.shift();
                        assert(first);
                        out.push(first.replace(/:$/, ""));
                    }
                    out.push(...pathComponents);
                    break;
                }
            default:
                return undefined;
        }
        return join(...out);
    }
    static getCacheFilenameWithExtension(url, extension) {
        const base = this.getCacheFilename(url);
        return base ? `${base}.${extension}` : undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS9kaXNrX2NhY2hlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7XG4gIGRpcm5hbWUsXG4gIGVuc3VyZURpcixcbiAgZnJvbUZpbGVVcmwsXG4gIGlzQWJzb2x1dGUsXG4gIGpvaW4sXG4gIHJlYWRBbGwsXG4gIHNlcCxcbiAgd3JpdGVBbGwsXG59IGZyb20gXCIuL2RlcHMudHNcIjtcbmltcG9ydCB7IGFzc2VydCwgQ0FDSEVfUEVSTSwgdXJsVG9GaWxlbmFtZSB9IGZyb20gXCIuL3V0aWwudHNcIjtcblxuZXhwb3J0IGNsYXNzIERpc2tDYWNoZSB7XG4gIGxvY2F0aW9uOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobG9jYXRpb246IHN0cmluZykge1xuICAgIGFzc2VydChpc0Fic29sdXRlKGxvY2F0aW9uKSk7XG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICB9XG5cbiAgYXN5bmMgZ2V0KGZpbGVuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICBjb25zdCBwYXRoID0gam9pbih0aGlzLmxvY2F0aW9uLCBmaWxlbmFtZSk7XG4gICAgY29uc3QgZmlsZSA9IGF3YWl0IERlbm8ub3BlbihwYXRoLCB7IHJlYWQ6IHRydWUgfSk7XG4gICAgY29uc3QgdmFsdWUgPSBhd2FpdCByZWFkQWxsKGZpbGUpO1xuICAgIGZpbGUuY2xvc2UoKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBhc3luYyBzZXQoZmlsZW5hbWU6IHN0cmluZywgZGF0YTogVWludDhBcnJheSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBqb2luKHRoaXMubG9jYXRpb24sIGZpbGVuYW1lKTtcbiAgICBjb25zdCBwYXJlbnRGaWxlbmFtZSA9IGRpcm5hbWUocGF0aCk7XG4gICAgYXdhaXQgZW5zdXJlRGlyKHBhcmVudEZpbGVuYW1lKTtcbiAgICBjb25zdCBmaWxlID0gYXdhaXQgRGVuby5vcGVuKHBhdGgsIHtcbiAgICAgIHdyaXRlOiB0cnVlLFxuICAgICAgY3JlYXRlOiB0cnVlLFxuICAgICAgbW9kZTogQ0FDSEVfUEVSTSxcbiAgICB9KTtcbiAgICBhd2FpdCB3cml0ZUFsbChmaWxlLCBkYXRhKTtcbiAgICBmaWxlLmNsb3NlKCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0Q2FjaGVGaWxlbmFtZSh1cmw6IFVSTCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHNjaGVtZSA9IHVybC5wcm90b2NvbC5yZXBsYWNlKFwiOlwiLCBcIlwiKTtcbiAgICBvdXQucHVzaChzY2hlbWUpO1xuXG4gICAgc3dpdGNoIChzY2hlbWUpIHtcbiAgICAgIGNhc2UgXCJ3YXNtXCI6IHtcbiAgICAgICAgY29uc3QgeyBob3N0bmFtZSwgcG9ydCB9ID0gdXJsO1xuICAgICAgICBvdXQucHVzaChwb3J0ID8gYCR7aG9zdG5hbWV9X1BPUlQke3BvcnR9YCA6IGhvc3RuYW1lKTtcbiAgICAgICAgb3V0LnB1c2goLi4udXJsLnBhdGhuYW1lLnNwbGl0KFwiL1wiKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcImh0dHBcIjpcbiAgICAgIGNhc2UgXCJodHRwc1wiOlxuICAgICAgY2FzZSBcImRhdGFcIjpcbiAgICAgIGNhc2UgXCJibG9iXCI6XG4gICAgICAgIHJldHVybiB1cmxUb0ZpbGVuYW1lKHVybCk7XG4gICAgICBjYXNlIFwiZmlsZVwiOiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBmcm9tRmlsZVVybCh1cmwpO1xuICAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgaG9zdCB9ID0gdXJsO1xuICAgICAgICBpZiAoaG9zdCkge1xuICAgICAgICAgIG91dC5wdXNoKFwiVU5DXCIpO1xuICAgICAgICAgIG91dC5wdXNoKGhvc3QucmVwbGFjZUFsbChcIjpcIiwgXCJfXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXRoQ29tcG9uZW50cyA9IHBhdGguc3BsaXQoc2VwKS5maWx0ZXIoKHApID0+IHAubGVuZ3RoID4gMCk7XG4gICAgICAgIGlmIChEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIikge1xuICAgICAgICAgIGlmIChob3N0KSB7XG4gICAgICAgICAgICAvLyB3aW5kb3dzIHdpbGwgaGF2ZSB0aGUgaG9zdCBpbiB0aGUgcmVzdWx0IG9mIGZyb21GaWxlVXJsLCBzbyByZW1vdmUgaXRcbiAgICAgICAgICAgIHBhdGhDb21wb25lbnRzLnNoaWZ0KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZmlyc3QgPSBwYXRoQ29tcG9uZW50cy5zaGlmdCgpO1xuICAgICAgICAgIGFzc2VydChmaXJzdCk7XG4gICAgICAgICAgb3V0LnB1c2goZmlyc3QucmVwbGFjZSgvOiQvLCBcIlwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0LnB1c2goLi4ucGF0aENvbXBvbmVudHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBqb2luKC4uLm91dCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0Q2FjaGVGaWxlbmFtZVdpdGhFeHRlbnNpb24oXG4gICAgdXJsOiBVUkwsXG4gICAgZXh0ZW5zaW9uOiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYmFzZSA9IHRoaXMuZ2V0Q2FjaGVGaWxlbmFtZSh1cmwpO1xuICAgIHJldHVybiBiYXNlID8gYCR7YmFzZX0uJHtleHRlbnNpb259YCA6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