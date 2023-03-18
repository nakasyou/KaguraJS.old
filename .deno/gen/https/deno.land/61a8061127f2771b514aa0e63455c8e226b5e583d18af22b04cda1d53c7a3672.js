// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { AuthTokens } from "./auth_tokens.ts";
import { colors, fromFileUrl, readAll } from "./deps.ts";
function shouldUseCache(cacheSetting, specifier) {
    switch(cacheSetting){
        case "only":
        case "use":
            return true;
        case "reloadAll":
            return false;
        default:
            {
                const specifierStr = specifier.toString();
                for (const value of cacheSetting){
                    if (specifierStr.startsWith(value)) {
                        return false;
                    }
                }
                return true;
            }
    }
}
const SUPPORTED_SCHEMES = [
    "data:",
    "blob:",
    "file:",
    "http:",
    "https:"
];
function getValidatedScheme(specifier) {
    const scheme = specifier.protocol;
    // deno-lint-ignore no-explicit-any
    if (!SUPPORTED_SCHEMES.includes(scheme)) {
        throw new TypeError(`Unsupported scheme "${scheme}" for module "${specifier.toString()}". Supported schemes: ${JSON.stringify(SUPPORTED_SCHEMES)}.`);
    }
    return scheme;
}
export function stripHashbang(value) {
    return value.startsWith("#!") ? value.slice(value.indexOf("\n")) : value;
}
async function fetchLocal(specifier) {
    const local = fromFileUrl(specifier);
    if (!local) {
        throw new TypeError(`Invalid file path.\n  Specifier: ${specifier.toString()}`);
    }
    try {
        const source = await Deno.readTextFile(local);
        const content = stripHashbang(source);
        return {
            kind: "module",
            content,
            specifier: specifier.toString()
        };
    } catch  {
    // ignoring errors, we will just return undefined
    }
}
const decoder = new TextDecoder();
export class FileFetcher {
    #allowRemote;
    #authTokens;
    #cache = new Map();
    #cacheSetting;
    #httpCache;
    constructor(httpCache, cacheSetting = "use", allowRemote = true){
        Deno.permissions.request({
            name: "env",
            variable: "DENO_AUTH_TOKENS"
        });
        this.#authTokens = new AuthTokens(Deno.env.get("DENO_AUTH_TOKENS"));
        this.#allowRemote = allowRemote;
        this.#cacheSetting = cacheSetting;
        this.#httpCache = httpCache;
    }
    async #fetchBlobDataUrl(specifier) {
        const cached = await this.#fetchCached(specifier, 0);
        if (cached) {
            return cached;
        }
        if (this.#cacheSetting === "only") {
            throw new Deno.errors.NotFound(`Specifier not found in cache: "${specifier.toString()}", --cached-only is specified.`);
        }
        const response = await fetch(specifier.toString());
        const content = await response.text();
        const headers = {};
        for (const [key, value] of response.headers){
            headers[key.toLowerCase()] = value;
        }
        await this.#httpCache.set(specifier, headers, content);
        return {
            kind: "module",
            specifier: specifier.toString(),
            headers,
            content
        };
    }
    async #fetchCached(specifier1, redirectLimit) {
        if (redirectLimit < 0) {
            throw new Deno.errors.Http("Too many redirects");
        }
        const cached1 = await this.#httpCache.get(specifier1);
        if (!cached1) {
            return undefined;
        }
        const [file, headers1] = cached1;
        const location = headers1["location"];
        if (location) {
            const redirect = new URL(location, specifier1);
            file.close();
            return this.#fetchCached(redirect, redirectLimit - 1);
        }
        const bytes = await readAll(file);
        file.close();
        const content1 = decoder.decode(bytes);
        return {
            kind: "module",
            specifier: specifier1.toString(),
            headers: headers1,
            content: content1
        };
    }
    async #fetchRemote(specifier2, redirectLimit1) {
        if (redirectLimit1 < 0) {
            throw new Deno.errors.Http("Too many redirects.");
        }
        if (shouldUseCache(this.#cacheSetting, specifier2)) {
            const response1 = await this.#fetchCached(specifier2, redirectLimit1);
            if (response1) {
                return response1;
            }
        }
        if (this.#cacheSetting === "only") {
            throw new Deno.errors.NotFound(`Specifier not found in cache: "${specifier2.toString()}", --cached-only is specified.`);
        }
        const requestHeaders = new Headers();
        const cached2 = await this.#httpCache.get(specifier2);
        if (cached2) {
            const [file1, cachedHeaders] = cached2;
            file1.close();
            if (cachedHeaders["etag"]) {
                requestHeaders.append("if-none-match", cachedHeaders["etag"]);
            }
        }
        const authToken = this.#authTokens.get(specifier2);
        if (authToken) {
            requestHeaders.append("authorization", authToken);
        }
        console.log(`${colors.green("Download")} ${specifier2.toString()}`);
        const response2 = await fetch(specifier2.toString(), {
            headers: requestHeaders
        });
        if (!response2.ok) {
            if (response2.status === 404) {
                return undefined;
            } else {
                throw new Deno.errors.Http(`${response2.status} ${response2.statusText}`);
            }
        }
        // WHATWG fetch follows redirects automatically, so we will try to
        // determine if that ocurred and cache the value.
        if (specifier2.toString() !== response2.url) {
            const headers2 = {
                "location": response2.url
            };
            await this.#httpCache.set(specifier2, headers2, "");
        }
        const url = new URL(response2.url);
        const content2 = await response2.text();
        const headers3 = {};
        for (const [key1, value1] of response2.headers){
            headers3[key1.toLowerCase()] = value1;
        }
        await this.#httpCache.set(url, headers3, content2);
        return {
            kind: "module",
            specifier: response2.url,
            headers: headers3,
            content: content2
        };
    }
    async fetch(specifier) {
        const scheme = getValidatedScheme(specifier);
        const response = this.#cache.get(specifier.toString());
        if (response) {
            return response;
        } else if (scheme === "file:") {
            return fetchLocal(specifier);
        } else if (scheme === "data:" || scheme === "blob:") {
            const response1 = await this.#fetchBlobDataUrl(specifier);
            this.#cache.set(specifier.toString(), response1);
            return response1;
        } else if (!this.#allowRemote) {
            throw new Deno.errors.PermissionDenied(`A remote specifier was requested: "${specifier.toString()}", but --no-remote is specifier`);
        } else {
            const response2 = await this.#fetchRemote(specifier, 10);
            if (response2) {
                this.#cache.set(specifier.toString(), response2);
            }
            return response2;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS9maWxlX2ZldGNoZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgQXV0aFRva2VucyB9IGZyb20gXCIuL2F1dGhfdG9rZW5zLnRzXCI7XG5pbXBvcnQgeyBjb2xvcnMsIGZyb21GaWxlVXJsLCByZWFkQWxsIH0gZnJvbSBcIi4vZGVwcy50c1wiO1xuaW1wb3J0IHR5cGUgeyBMb2FkUmVzcG9uc2UgfSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEh0dHBDYWNoZSB9IGZyb20gXCIuL2h0dHBfY2FjaGUudHNcIjtcblxuLyoqIEEgc2V0dGluZyB0aGF0IGRldGVybWluZXMgaG93IHRoZSBjYWNoZSBpcyBoYW5kbGVkIGZvciByZW1vdGUgZGVwZW5kZW5jaWVzLlxuICpcbiAqIFRoZSBkZWZhdWx0IGlzIGBcInVzZVwiYC5cbiAqXG4gKiAtIGBcIm9ubHlcImAgLSBvbmx5IHRoZSBjYWNoZSB3aWxsIGJlIHJlLXVzZWQsIGFuZCBhbnkgcmVtb3RlIG1vZHVsZXMgbm90IGluXG4gKiAgICB0aGUgY2FjaGUgd2lsbCBlcnJvci5cbiAqIC0gYFwidXNlXCJgIC0gdGhlIGNhY2hlIHdpbGwgYmUgdXNlZCwgbWVhbmluZyBleGlzdGluZyByZW1vdGUgZmlsZXMgd2lsbCBub3QgYmVcbiAqICAgIHJlbG9hZGVkLlxuICogLSBgXCJyZWxvYWRBbGxcImAgLSBhbnkgY2FjaGVkIG1vZHVsZXMgd2lsbCBiZSBpZ25vcmVkIGFuZCB0aGVpciB2YWx1ZXMgd2lsbCBiZVxuICogICAgZmV0Y2hlZC5cbiAqIC0gYHN0cmluZ1tdYCAtIGFuIGFycmF5IG9mIHN0cmluZyBzcGVjaWZpZXJzLCB0aGF0IGlmIHRoZXkgbWF0Y2ggdGhlIHN0YXJ0IG9mXG4gKiAgICB0aGUgcmVxdWVzdGVkIHNwZWNpZmllciwgd2lsbCBiZSByZWxvYWRlZC5cbiAqL1xuZXhwb3J0IHR5cGUgQ2FjaGVTZXR0aW5nID0gXCJvbmx5XCIgfCBcInJlbG9hZEFsbFwiIHwgXCJ1c2VcIiB8IHN0cmluZ1tdO1xuXG5mdW5jdGlvbiBzaG91bGRVc2VDYWNoZShjYWNoZVNldHRpbmc6IENhY2hlU2V0dGluZywgc3BlY2lmaWVyOiBVUkwpOiBib29sZWFuIHtcbiAgc3dpdGNoIChjYWNoZVNldHRpbmcpIHtcbiAgICBjYXNlIFwib25seVwiOlxuICAgIGNhc2UgXCJ1c2VcIjpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGNhc2UgXCJyZWxvYWRBbGxcIjpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBkZWZhdWx0OiB7XG4gICAgICBjb25zdCBzcGVjaWZpZXJTdHIgPSBzcGVjaWZpZXIudG9TdHJpbmcoKTtcbiAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgY2FjaGVTZXR0aW5nKSB7XG4gICAgICAgIGlmIChzcGVjaWZpZXJTdHIuc3RhcnRzV2l0aCh2YWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBTVVBQT1JURURfU0NIRU1FUyA9IFtcbiAgXCJkYXRhOlwiLFxuICBcImJsb2I6XCIsXG4gIFwiZmlsZTpcIixcbiAgXCJodHRwOlwiLFxuICBcImh0dHBzOlwiLFxuXSBhcyBjb25zdDtcblxudHlwZSBTdXBwb3J0ZWRTY2hlbWVzID0gdHlwZW9mIFNVUFBPUlRFRF9TQ0hFTUVTW251bWJlcl07XG5cbmZ1bmN0aW9uIGdldFZhbGlkYXRlZFNjaGVtZShzcGVjaWZpZXI6IFVSTCkge1xuICBjb25zdCBzY2hlbWUgPSBzcGVjaWZpZXIucHJvdG9jb2w7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGlmICghU1VQUE9SVEVEX1NDSEVNRVMuaW5jbHVkZXMoc2NoZW1lIGFzIGFueSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgYFVuc3VwcG9ydGVkIHNjaGVtZSBcIiR7c2NoZW1lfVwiIGZvciBtb2R1bGUgXCIke3NwZWNpZmllci50b1N0cmluZygpfVwiLiBTdXBwb3J0ZWQgc2NoZW1lczogJHtcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoU1VQUE9SVEVEX1NDSEVNRVMpXG4gICAgICB9LmAsXG4gICAgKTtcbiAgfVxuICByZXR1cm4gc2NoZW1lIGFzIFN1cHBvcnRlZFNjaGVtZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEhhc2hiYW5nKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUuc3RhcnRzV2l0aChcIiMhXCIpID8gdmFsdWUuc2xpY2UodmFsdWUuaW5kZXhPZihcIlxcblwiKSkgOiB2YWx1ZTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hMb2NhbChzcGVjaWZpZXI6IFVSTCk6IFByb21pc2U8TG9hZFJlc3BvbnNlIHwgdW5kZWZpbmVkPiB7XG4gIGNvbnN0IGxvY2FsID0gZnJvbUZpbGVVcmwoc3BlY2lmaWVyKTtcbiAgaWYgKCFsb2NhbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICBgSW52YWxpZCBmaWxlIHBhdGguXFxuICBTcGVjaWZpZXI6ICR7c3BlY2lmaWVyLnRvU3RyaW5nKCl9YCxcbiAgICApO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3Qgc291cmNlID0gYXdhaXQgRGVuby5yZWFkVGV4dEZpbGUobG9jYWwpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBzdHJpcEhhc2hiYW5nKHNvdXJjZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IFwibW9kdWxlXCIsXG4gICAgICBjb250ZW50LFxuICAgICAgc3BlY2lmaWVyOiBzcGVjaWZpZXIudG9TdHJpbmcoKSxcbiAgICB9O1xuICB9IGNhdGNoIHtcbiAgICAvLyBpZ25vcmluZyBlcnJvcnMsIHdlIHdpbGwganVzdCByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxuY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG5leHBvcnQgY2xhc3MgRmlsZUZldGNoZXIge1xuICAjYWxsb3dSZW1vdGU6IGJvb2xlYW47XG4gICNhdXRoVG9rZW5zOiBBdXRoVG9rZW5zO1xuICAjY2FjaGUgPSBuZXcgTWFwPHN0cmluZywgTG9hZFJlc3BvbnNlPigpO1xuICAjY2FjaGVTZXR0aW5nOiBDYWNoZVNldHRpbmc7XG4gICNodHRwQ2FjaGU6IEh0dHBDYWNoZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBodHRwQ2FjaGU6IEh0dHBDYWNoZSxcbiAgICBjYWNoZVNldHRpbmc6IENhY2hlU2V0dGluZyA9IFwidXNlXCIsXG4gICAgYWxsb3dSZW1vdGUgPSB0cnVlLFxuICApIHtcbiAgICBEZW5vLnBlcm1pc3Npb25zLnJlcXVlc3QoeyBuYW1lOiBcImVudlwiLCB2YXJpYWJsZTogXCJERU5PX0FVVEhfVE9LRU5TXCIgfSk7XG4gICAgdGhpcy4jYXV0aFRva2VucyA9IG5ldyBBdXRoVG9rZW5zKERlbm8uZW52LmdldChcIkRFTk9fQVVUSF9UT0tFTlNcIikpO1xuICAgIHRoaXMuI2FsbG93UmVtb3RlID0gYWxsb3dSZW1vdGU7XG4gICAgdGhpcy4jY2FjaGVTZXR0aW5nID0gY2FjaGVTZXR0aW5nO1xuICAgIHRoaXMuI2h0dHBDYWNoZSA9IGh0dHBDYWNoZTtcbiAgfVxuXG4gIGFzeW5jICNmZXRjaEJsb2JEYXRhVXJsKHNwZWNpZmllcjogVVJMKTogUHJvbWlzZTxMb2FkUmVzcG9uc2U+IHtcbiAgICBjb25zdCBjYWNoZWQgPSBhd2FpdCB0aGlzLiNmZXRjaENhY2hlZChzcGVjaWZpZXIsIDApO1xuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIHJldHVybiBjYWNoZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuI2NhY2hlU2V0dGluZyA9PT0gXCJvbmx5XCIpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5Ob3RGb3VuZChcbiAgICAgICAgYFNwZWNpZmllciBub3QgZm91bmQgaW4gY2FjaGU6IFwiJHtzcGVjaWZpZXIudG9TdHJpbmcoKX1cIiwgLS1jYWNoZWQtb25seSBpcyBzcGVjaWZpZWQuYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChzcGVjaWZpZXIudG9TdHJpbmcoKSk7XG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgcmVzcG9uc2UuaGVhZGVycykge1xuICAgICAgaGVhZGVyc1trZXkudG9Mb3dlckNhc2UoKV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy4jaHR0cENhY2hlLnNldChzcGVjaWZpZXIsIGhlYWRlcnMsIGNvbnRlbnQpO1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBcIm1vZHVsZVwiLFxuICAgICAgc3BlY2lmaWVyOiBzcGVjaWZpZXIudG9TdHJpbmcoKSxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBjb250ZW50LFxuICAgIH07XG4gIH1cblxuICBhc3luYyAjZmV0Y2hDYWNoZWQoXG4gICAgc3BlY2lmaWVyOiBVUkwsXG4gICAgcmVkaXJlY3RMaW1pdDogbnVtYmVyLFxuICApOiBQcm9taXNlPExvYWRSZXNwb25zZSB8IHVuZGVmaW5lZD4ge1xuICAgIGlmIChyZWRpcmVjdExpbWl0IDwgMCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkh0dHAoXCJUb28gbWFueSByZWRpcmVjdHNcIik7XG4gICAgfVxuXG4gICAgY29uc3QgY2FjaGVkID0gYXdhaXQgdGhpcy4jaHR0cENhY2hlLmdldChzcGVjaWZpZXIpO1xuICAgIGlmICghY2FjaGVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBbZmlsZSwgaGVhZGVyc10gPSBjYWNoZWQ7XG4gICAgY29uc3QgbG9jYXRpb24gPSBoZWFkZXJzW1wibG9jYXRpb25cIl07XG4gICAgaWYgKGxvY2F0aW9uKSB7XG4gICAgICBjb25zdCByZWRpcmVjdCA9IG5ldyBVUkwobG9jYXRpb24sIHNwZWNpZmllcik7XG4gICAgICBmaWxlLmNsb3NlKCk7XG4gICAgICByZXR1cm4gdGhpcy4jZmV0Y2hDYWNoZWQocmVkaXJlY3QsIHJlZGlyZWN0TGltaXQgLSAxKTtcbiAgICB9XG4gICAgY29uc3QgYnl0ZXMgPSBhd2FpdCByZWFkQWxsKGZpbGUpO1xuICAgIGZpbGUuY2xvc2UoKTtcbiAgICBjb25zdCBjb250ZW50ID0gZGVjb2Rlci5kZWNvZGUoYnl0ZXMpO1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBcIm1vZHVsZVwiLFxuICAgICAgc3BlY2lmaWVyOiBzcGVjaWZpZXIudG9TdHJpbmcoKSxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBjb250ZW50LFxuICAgIH07XG4gIH1cblxuICBhc3luYyAjZmV0Y2hSZW1vdGUoXG4gICAgc3BlY2lmaWVyOiBVUkwsXG4gICAgcmVkaXJlY3RMaW1pdDogbnVtYmVyLFxuICApOiBQcm9taXNlPExvYWRSZXNwb25zZSB8IHVuZGVmaW5lZD4ge1xuICAgIGlmIChyZWRpcmVjdExpbWl0IDwgMCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkh0dHAoXCJUb28gbWFueSByZWRpcmVjdHMuXCIpO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRVc2VDYWNoZSh0aGlzLiNjYWNoZVNldHRpbmcsIHNwZWNpZmllcikpIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy4jZmV0Y2hDYWNoZWQoc3BlY2lmaWVyLCByZWRpcmVjdExpbWl0KTtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuI2NhY2hlU2V0dGluZyA9PT0gXCJvbmx5XCIpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5Ob3RGb3VuZChcbiAgICAgICAgYFNwZWNpZmllciBub3QgZm91bmQgaW4gY2FjaGU6IFwiJHtzcGVjaWZpZXIudG9TdHJpbmcoKX1cIiwgLS1jYWNoZWQtb25seSBpcyBzcGVjaWZpZWQuYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAgIGNvbnN0IGNhY2hlZCA9IGF3YWl0IHRoaXMuI2h0dHBDYWNoZS5nZXQoc3BlY2lmaWVyKTtcbiAgICBpZiAoY2FjaGVkKSB7XG4gICAgICBjb25zdCBbZmlsZSwgY2FjaGVkSGVhZGVyc10gPSBjYWNoZWQ7XG4gICAgICBmaWxlLmNsb3NlKCk7XG4gICAgICBpZiAoY2FjaGVkSGVhZGVyc1tcImV0YWdcIl0pIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnMuYXBwZW5kKFwiaWYtbm9uZS1tYXRjaFwiLCBjYWNoZWRIZWFkZXJzW1wiZXRhZ1wiXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGF1dGhUb2tlbiA9IHRoaXMuI2F1dGhUb2tlbnMuZ2V0KHNwZWNpZmllcik7XG4gICAgaWYgKGF1dGhUb2tlbikge1xuICAgICAgcmVxdWVzdEhlYWRlcnMuYXBwZW5kKFwiYXV0aG9yaXphdGlvblwiLCBhdXRoVG9rZW4pO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgJHtjb2xvcnMuZ3JlZW4oXCJEb3dubG9hZFwiKX0gJHtzcGVjaWZpZXIudG9TdHJpbmcoKX1gKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHNwZWNpZmllci50b1N0cmluZygpLCB7XG4gICAgICBoZWFkZXJzOiByZXF1ZXN0SGVhZGVycyxcbiAgICB9KTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5IdHRwKGAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBXSEFUV0cgZmV0Y2ggZm9sbG93cyByZWRpcmVjdHMgYXV0b21hdGljYWxseSwgc28gd2Ugd2lsbCB0cnkgdG9cbiAgICAvLyBkZXRlcm1pbmUgaWYgdGhhdCBvY3VycmVkIGFuZCBjYWNoZSB0aGUgdmFsdWUuXG4gICAgaWYgKHNwZWNpZmllci50b1N0cmluZygpICE9PSByZXNwb25zZS51cmwpIHtcbiAgICAgIGNvbnN0IGhlYWRlcnMgPSB7IFwibG9jYXRpb25cIjogcmVzcG9uc2UudXJsIH07XG4gICAgICBhd2FpdCB0aGlzLiNodHRwQ2FjaGUuc2V0KHNwZWNpZmllciwgaGVhZGVycywgXCJcIik7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVzcG9uc2UudXJsKTtcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiByZXNwb25zZS5oZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzW2tleS50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLiNodHRwQ2FjaGUuc2V0KHVybCwgaGVhZGVycywgY29udGVudCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IFwibW9kdWxlXCIsXG4gICAgICBzcGVjaWZpZXI6IHJlc3BvbnNlLnVybCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBjb250ZW50LFxuICAgIH07XG4gIH1cblxuICBhc3luYyBmZXRjaChzcGVjaWZpZXI6IFVSTCk6IFByb21pc2U8TG9hZFJlc3BvbnNlIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3Qgc2NoZW1lID0gZ2V0VmFsaWRhdGVkU2NoZW1lKHNwZWNpZmllcik7XG4gICAgY29uc3QgcmVzcG9uc2UgPSB0aGlzLiNjYWNoZS5nZXQoc3BlY2lmaWVyLnRvU3RyaW5nKCkpO1xuICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0gZWxzZSBpZiAoc2NoZW1lID09PSBcImZpbGU6XCIpIHtcbiAgICAgIHJldHVybiBmZXRjaExvY2FsKHNwZWNpZmllcik7XG4gICAgfSBlbHNlIGlmIChzY2hlbWUgPT09IFwiZGF0YTpcIiB8fCBzY2hlbWUgPT09IFwiYmxvYjpcIikge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLiNmZXRjaEJsb2JEYXRhVXJsKHNwZWNpZmllcik7XG4gICAgICB0aGlzLiNjYWNoZS5zZXQoc3BlY2lmaWVyLnRvU3RyaW5nKCksIHJlc3BvbnNlKTtcbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLiNhbGxvd1JlbW90ZSkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLlBlcm1pc3Npb25EZW5pZWQoXG4gICAgICAgIGBBIHJlbW90ZSBzcGVjaWZpZXIgd2FzIHJlcXVlc3RlZDogXCIke3NwZWNpZmllci50b1N0cmluZygpfVwiLCBidXQgLS1uby1yZW1vdGUgaXMgc3BlY2lmaWVyYCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy4jZmV0Y2hSZW1vdGUoc3BlY2lmaWVyLCAxMCk7XG4gICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgdGhpcy4jY2FjaGUuc2V0KHNwZWNpZmllci50b1N0cmluZygpLCByZXNwb25zZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVB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