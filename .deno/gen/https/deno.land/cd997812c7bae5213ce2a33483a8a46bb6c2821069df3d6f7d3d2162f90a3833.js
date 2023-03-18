// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { join } from "./deps.ts";
import { DiskCache } from "./disk_cache.ts";
import { isFile, isFileSync } from "./util.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
/** Provides an interface to Deno's CLI cache.
 *
 * It is better to use the {@linkcode createCache} function directly. */ export class FetchCacher {
    #diskCache;
    #fileFetcher;
    #httpCache;
    #readOnly;
    async #getEmitMetadata(specifier) {
        const filename = DiskCache.getCacheFilenameWithExtension(specifier, "meta");
        if (!filename || !await isFile(filename)) {
            return undefined;
        }
        const bytes = await this.#diskCache.get(filename);
        return JSON.parse(decoder.decode(bytes));
    }
    async #setEmitMetadata(specifier1, data) {
        const filename1 = DiskCache.getCacheFilenameWithExtension(specifier1, "meta");
        if (!filename1) {
            return;
        }
        const bytes1 = encoder.encode(JSON.stringify(data));
        await this.#diskCache.set(filename1, bytes1);
    }
    constructor(diskCache, httpCache, fileFetcher, readOnly){
        this.#diskCache = diskCache;
        this.#fileFetcher = fileFetcher;
        this.#httpCache = httpCache;
        if (readOnly === undefined) {
            (async ()=>{
                this.#readOnly = (await Deno.permissions.query({
                    name: "write"
                })).state === "denied";
            })();
        } else {
            this.#readOnly = readOnly;
        }
    }
    /** Provides information about the state of the cache, which is used by
   * things like [`deno_graph`](https://deno.land/x/deno_graph) to enrich the
   * information about a module graph. */ cacheInfo = (specifier)=>{
        // when we are "read-only" (e.g. Deploy) we can access sync versions of APIs
        // so we can't return the cache info synchronously.
        if (this.#readOnly) {
            return {};
        }
        const url = new URL(specifier);
        const local = this.#httpCache.getCacheFilename(url);
        const emitCache = DiskCache.getCacheFilenameWithExtension(url, "js");
        const mapCache = DiskCache.getCacheFilenameWithExtension(url, "js.map");
        const emit = emitCache ? join(this.#diskCache.location, emitCache) : undefined;
        const map = mapCache ? join(this.#diskCache.location, mapCache) : undefined;
        return {
            local: isFileSync(local) ? local : undefined,
            emit: emit && isFileSync(emit) ? emit : undefined,
            map: map && isFileSync(map) ? map : undefined
        };
    };
    async get(type, specifier) {
        const url = new URL(specifier);
        let extension;
        switch(type){
            case "declaration":
                extension = "d.ts";
                break;
            case "emit":
                extension = "js";
                break;
            case "sourcemap":
                extension = "js.map";
                break;
            case "buildinfo":
                extension = "buildinfo";
                break;
            case "version":
                {
                    const data = await this.#getEmitMetadata(url);
                    return data ? data.version_hash : undefined;
                }
        }
        const filename = DiskCache.getCacheFilenameWithExtension(url, extension);
        if (filename) {
            const data1 = await this.#diskCache.get(filename);
            return decoder.decode(data1);
        }
    }
    load = (specifier)=>{
        const url = new URL(specifier);
        return this.#fileFetcher.fetch(url);
    };
    async set(type, specifier, value) {
        const url = new URL(specifier);
        let extension;
        switch(type){
            case "declaration":
                extension = "d.ts";
                break;
            case "emit":
                extension = "js";
                break;
            case "sourcemap":
                extension = "js.map";
                break;
            case "buildinfo":
                extension = "buildinfo";
                break;
            case "version":
                {
                    let data = await this.#getEmitMetadata(url);
                    if (data) {
                        data.version_hash = value;
                    } else {
                        data = {
                            version_hash: value
                        };
                    }
                    return this.#setEmitMetadata(url, data);
                }
        }
        const filename = DiskCache.getCacheFilenameWithExtension(url, extension);
        if (filename) {
            await this.#diskCache.set(filename, encoder.encode(value));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS9jYWNoZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIi4vZGVwcy50c1wiO1xuaW1wb3J0IHR5cGUgeyBDYWNoZUluZm8sIExvYWRSZXNwb25zZSB9IGZyb20gXCIuL2RlcHMudHNcIjtcbmltcG9ydCB7IERpc2tDYWNoZSB9IGZyb20gXCIuL2Rpc2tfY2FjaGUudHNcIjtcbmltcG9ydCB0eXBlIHsgRmlsZUZldGNoZXIgfSBmcm9tIFwiLi9maWxlX2ZldGNoZXIudHNcIjtcbmltcG9ydCB0eXBlIHsgSHR0cENhY2hlIH0gZnJvbSBcIi4vaHR0cF9jYWNoZS50c1wiO1xuaW1wb3J0IHsgaXNGaWxlLCBpc0ZpbGVTeW5jIH0gZnJvbSBcIi4vdXRpbC50c1wiO1xuXG4vKiogVGhlIHR5cGUgb2YgY2FjaGUgaW5mb3JtYXRpb24gdGhhdCBzaG91bGQgYmUgc2V0IG9yIHJldHJpZXZlZCBmcm9tIHRoZVxuICogY2FjaGUuICovXG5leHBvcnQgdHlwZSBDYWNoZVR5cGUgPVxuICB8IFwiZGVjbGFyYXRpb25cIlxuICB8IFwiZW1pdFwiXG4gIHwgXCJzb3VyY2VtYXBcIlxuICB8IFwiYnVpbGRpbmZvXCJcbiAgfCBcInZlcnNpb25cIjtcblxuY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuXG5pbnRlcmZhY2UgRW1pdE1ldGFkYXRhIHtcbiAgLy8gZGVuby1saW50LWlnbm9yZSBjYW1lbGNhc2VcbiAgdmVyc2lvbl9oYXNoOiBzdHJpbmc7XG59XG5cbi8qKiBQcm92aWRlcyBhbiBpbnRlcmZhY2UgdG8gRGVubydzIENMSSBjYWNoZS5cbiAqXG4gKiBJdCBpcyBiZXR0ZXIgdG8gdXNlIHRoZSB7QGxpbmtjb2RlIGNyZWF0ZUNhY2hlfSBmdW5jdGlvbiBkaXJlY3RseS4gKi9cbmV4cG9ydCBjbGFzcyBGZXRjaENhY2hlciB7XG4gICNkaXNrQ2FjaGU6IERpc2tDYWNoZTtcbiAgI2ZpbGVGZXRjaGVyOiBGaWxlRmV0Y2hlcjtcbiAgI2h0dHBDYWNoZTogSHR0cENhY2hlO1xuICAjcmVhZE9ubHkhOiBib29sZWFuO1xuXG4gIGFzeW5jICNnZXRFbWl0TWV0YWRhdGEoc3BlY2lmaWVyOiBVUkwpOiBQcm9taXNlPEVtaXRNZXRhZGF0YSB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gRGlza0NhY2hlLmdldENhY2hlRmlsZW5hbWVXaXRoRXh0ZW5zaW9uKHNwZWNpZmllciwgXCJtZXRhXCIpO1xuICAgIGlmICghZmlsZW5hbWUgfHwgIShhd2FpdCBpc0ZpbGUoZmlsZW5hbWUpKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgYnl0ZXMgPSBhd2FpdCB0aGlzLiNkaXNrQ2FjaGUuZ2V0KGZpbGVuYW1lKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGVyLmRlY29kZShieXRlcykpO1xuICB9XG5cbiAgYXN5bmMgI3NldEVtaXRNZXRhZGF0YShzcGVjaWZpZXI6IFVSTCwgZGF0YTogRW1pdE1ldGFkYXRhKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBEaXNrQ2FjaGUuZ2V0Q2FjaGVGaWxlbmFtZVdpdGhFeHRlbnNpb24oc3BlY2lmaWVyLCBcIm1ldGFcIik7XG4gICAgaWYgKCFmaWxlbmFtZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBieXRlcyA9IGVuY29kZXIuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICBhd2FpdCB0aGlzLiNkaXNrQ2FjaGUuc2V0KGZpbGVuYW1lLCBieXRlcyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBkaXNrQ2FjaGU6IERpc2tDYWNoZSxcbiAgICBodHRwQ2FjaGU6IEh0dHBDYWNoZSxcbiAgICBmaWxlRmV0Y2hlcjogRmlsZUZldGNoZXIsXG4gICAgcmVhZE9ubHk/OiBib29sZWFuLFxuICApIHtcbiAgICB0aGlzLiNkaXNrQ2FjaGUgPSBkaXNrQ2FjaGU7XG4gICAgdGhpcy4jZmlsZUZldGNoZXIgPSBmaWxlRmV0Y2hlcjtcbiAgICB0aGlzLiNodHRwQ2FjaGUgPSBodHRwQ2FjaGU7XG4gICAgaWYgKHJlYWRPbmx5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuI3JlYWRPbmx5ID1cbiAgICAgICAgICAoYXdhaXQgRGVuby5wZXJtaXNzaW9ucy5xdWVyeSh7IG5hbWU6IFwid3JpdGVcIiB9KSkuc3RhdGUgPT09IFwiZGVuaWVkXCI7XG4gICAgICB9KSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiNyZWFkT25seSA9IHJlYWRPbmx5O1xuICAgIH1cbiAgfVxuXG4gIC8qKiBQcm92aWRlcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3RhdGUgb2YgdGhlIGNhY2hlLCB3aGljaCBpcyB1c2VkIGJ5XG4gICAqIHRoaW5ncyBsaWtlIFtgZGVub19ncmFwaGBdKGh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19ncmFwaCkgdG8gZW5yaWNoIHRoZVxuICAgKiBpbmZvcm1hdGlvbiBhYm91dCBhIG1vZHVsZSBncmFwaC4gKi9cbiAgY2FjaGVJbmZvID0gKHNwZWNpZmllcjogc3RyaW5nKTogQ2FjaGVJbmZvID0+IHtcbiAgICAvLyB3aGVuIHdlIGFyZSBcInJlYWQtb25seVwiIChlLmcuIERlcGxveSkgd2UgY2FuIGFjY2VzcyBzeW5jIHZlcnNpb25zIG9mIEFQSXNcbiAgICAvLyBzbyB3ZSBjYW4ndCByZXR1cm4gdGhlIGNhY2hlIGluZm8gc3luY2hyb25vdXNseS5cbiAgICBpZiAodGhpcy4jcmVhZE9ubHkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChzcGVjaWZpZXIpO1xuICAgIGNvbnN0IGxvY2FsID0gdGhpcy4jaHR0cENhY2hlLmdldENhY2hlRmlsZW5hbWUodXJsKTtcbiAgICBjb25zdCBlbWl0Q2FjaGUgPSBEaXNrQ2FjaGUuZ2V0Q2FjaGVGaWxlbmFtZVdpdGhFeHRlbnNpb24odXJsLCBcImpzXCIpO1xuICAgIGNvbnN0IG1hcENhY2hlID0gRGlza0NhY2hlLmdldENhY2hlRmlsZW5hbWVXaXRoRXh0ZW5zaW9uKHVybCwgXCJqcy5tYXBcIik7XG4gICAgY29uc3QgZW1pdCA9IGVtaXRDYWNoZVxuICAgICAgPyBqb2luKHRoaXMuI2Rpc2tDYWNoZS5sb2NhdGlvbiwgZW1pdENhY2hlKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgbWFwID0gbWFwQ2FjaGUgPyBqb2luKHRoaXMuI2Rpc2tDYWNoZS5sb2NhdGlvbiwgbWFwQ2FjaGUpIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiB7XG4gICAgICBsb2NhbDogaXNGaWxlU3luYyhsb2NhbCkgPyBsb2NhbCA6IHVuZGVmaW5lZCxcbiAgICAgIGVtaXQ6IGVtaXQgJiYgaXNGaWxlU3luYyhlbWl0KSA/IGVtaXQgOiB1bmRlZmluZWQsXG4gICAgICBtYXA6IG1hcCAmJiBpc0ZpbGVTeW5jKG1hcCkgPyBtYXAgOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgfTtcblxuICBhc3luYyBnZXQodHlwZTogQ2FjaGVUeXBlLCBzcGVjaWZpZXI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChzcGVjaWZpZXIpO1xuICAgIGxldCBleHRlbnNpb246IHN0cmluZztcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJkZWNsYXJhdGlvblwiOlxuICAgICAgICBleHRlbnNpb24gPSBcImQudHNcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZW1pdFwiOlxuICAgICAgICBleHRlbnNpb24gPSBcImpzXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInNvdXJjZW1hcFwiOlxuICAgICAgICBleHRlbnNpb24gPSBcImpzLm1hcFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJidWlsZGluZm9cIjpcbiAgICAgICAgZXh0ZW5zaW9uID0gXCJidWlsZGluZm9cIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwidmVyc2lvblwiOiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLiNnZXRFbWl0TWV0YWRhdGEodXJsKTtcbiAgICAgICAgcmV0dXJuIGRhdGEgPyBkYXRhLnZlcnNpb25faGFzaCA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZmlsZW5hbWUgPSBEaXNrQ2FjaGUuZ2V0Q2FjaGVGaWxlbmFtZVdpdGhFeHRlbnNpb24odXJsLCBleHRlbnNpb24pO1xuICAgIGlmIChmaWxlbmFtZSkge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuI2Rpc2tDYWNoZS5nZXQoZmlsZW5hbWUpO1xuICAgICAgcmV0dXJuIGRlY29kZXIuZGVjb2RlKGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIGxvYWQgPSAoc3BlY2lmaWVyOiBzdHJpbmcpOiBQcm9taXNlPExvYWRSZXNwb25zZSB8IHVuZGVmaW5lZD4gPT4ge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoc3BlY2lmaWVyKTtcbiAgICByZXR1cm4gdGhpcy4jZmlsZUZldGNoZXIuZmV0Y2godXJsKTtcbiAgfTtcblxuICBhc3luYyBzZXQodHlwZTogQ2FjaGVUeXBlLCBzcGVjaWZpZXI6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoc3BlY2lmaWVyKTtcbiAgICBsZXQgZXh0ZW5zaW9uOiBzdHJpbmc7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFwiZGVjbGFyYXRpb25cIjpcbiAgICAgICAgZXh0ZW5zaW9uID0gXCJkLnRzXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImVtaXRcIjpcbiAgICAgICAgZXh0ZW5zaW9uID0gXCJqc1wiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzb3VyY2VtYXBcIjpcbiAgICAgICAgZXh0ZW5zaW9uID0gXCJqcy5tYXBcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiYnVpbGRpbmZvXCI6XG4gICAgICAgIGV4dGVuc2lvbiA9IFwiYnVpbGRpbmZvXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInZlcnNpb25cIjoge1xuICAgICAgICBsZXQgZGF0YSA9IGF3YWl0IHRoaXMuI2dldEVtaXRNZXRhZGF0YSh1cmwpO1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgIGRhdGEudmVyc2lvbl9oYXNoID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgIHZlcnNpb25faGFzaDogdmFsdWUsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy4jc2V0RW1pdE1ldGFkYXRhKHVybCwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGZpbGVuYW1lID0gRGlza0NhY2hlLmdldENhY2hlRmlsZW5hbWVXaXRoRXh0ZW5zaW9uKHVybCwgZXh0ZW5zaW9uKTtcbiAgICBpZiAoZmlsZW5hbWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuI2Rpc2tDYWNoZS5zZXQoZmlsZW5hbWUsIGVuY29kZXIuZW5jb2RlKHZhbHVlKSk7XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLFlBQVk7QUFFakMsU0FBUyxTQUFTLFFBQVEsa0JBQWtCO0FBRzVDLFNBQVMsTUFBTSxFQUFFLFVBQVUsUUFBUSxZQUFZO0FB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