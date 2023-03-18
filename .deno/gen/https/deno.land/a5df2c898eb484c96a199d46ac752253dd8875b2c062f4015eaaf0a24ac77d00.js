// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { join, Sha256 } from "./deps.ts";
export const CACHE_PERM = 0o644;
export function assert(cond, msg = "Assertion failed.") {
    if (!cond) {
        throw new Error(msg);
    }
}
/**
 * Generates a sha256 hex hash for a given input string.  This mirrors the
 * behavior of Deno CLI's `cli::checksum::gen`.
 *
 * Would love to use the Crypto API here, but it only works async and we need
 * to be able to generate the hashes sync to be able to keep the cache able to
 * look up files synchronously.
 */ export function hash(value) {
    const sha256 = new Sha256();
    sha256.update(value);
    return sha256.hex();
}
function baseUrlToFilename(url) {
    const out = [];
    const scheme = url.protocol.replace(":", "");
    out.push(scheme);
    switch(scheme){
        case "http":
        case "https":
            {
                const host = url.hostname;
                const hostPort = url.port;
                out.push(hostPort ? `${host}_PORT${hostPort}` : host);
                break;
            }
        case "data":
        case "blob":
            break;
        default:
            throw new TypeError(`Don't know how to create cache name for scheme: ${scheme}`);
    }
    return join(...out);
}
export function urlToFilename(url) {
    const cacheFilename = baseUrlToFilename(url);
    let restStr = url.pathname;
    const query = url.search;
    if (query) {
        restStr += `?${query}`;
    }
    const hashedFilename = hash(restStr);
    return join(cacheFilename, hashedFilename);
}
export async function isFile(filePath) {
    try {
        const stats = await Deno.lstat(filePath);
        return stats.isFile;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
export function isFileSync(filePath) {
    try {
        const stats = Deno.lstatSync(filePath);
        return stats.isFile;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS91dGlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IGpvaW4sIFNoYTI1NiB9IGZyb20gXCIuL2RlcHMudHNcIjtcblxuZXhwb3J0IGNvbnN0IENBQ0hFX1BFUk0gPSAwbzY0NDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kOiB1bmtub3duLCBtc2cgPSBcIkFzc2VydGlvbiBmYWlsZWQuXCIpOiBhc3NlcnRzIGNvbmQge1xuICBpZiAoIWNvbmQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHNoYTI1NiBoZXggaGFzaCBmb3IgYSBnaXZlbiBpbnB1dCBzdHJpbmcuICBUaGlzIG1pcnJvcnMgdGhlXG4gKiBiZWhhdmlvciBvZiBEZW5vIENMSSdzIGBjbGk6OmNoZWNrc3VtOjpnZW5gLlxuICpcbiAqIFdvdWxkIGxvdmUgdG8gdXNlIHRoZSBDcnlwdG8gQVBJIGhlcmUsIGJ1dCBpdCBvbmx5IHdvcmtzIGFzeW5jIGFuZCB3ZSBuZWVkXG4gKiB0byBiZSBhYmxlIHRvIGdlbmVyYXRlIHRoZSBoYXNoZXMgc3luYyB0byBiZSBhYmxlIHRvIGtlZXAgdGhlIGNhY2hlIGFibGUgdG9cbiAqIGxvb2sgdXAgZmlsZXMgc3luY2hyb25vdXNseS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc2godmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHNoYTI1NiA9IG5ldyBTaGEyNTYoKTtcbiAgc2hhMjU2LnVwZGF0ZSh2YWx1ZSk7XG4gIHJldHVybiBzaGEyNTYuaGV4KCk7XG59XG5cbmZ1bmN0aW9uIGJhc2VVcmxUb0ZpbGVuYW1lKHVybDogVVJMKTogc3RyaW5nIHtcbiAgY29uc3Qgb3V0ID0gW107XG4gIGNvbnN0IHNjaGVtZSA9IHVybC5wcm90b2NvbC5yZXBsYWNlKFwiOlwiLCBcIlwiKTtcbiAgb3V0LnB1c2goc2NoZW1lKTtcblxuICBzd2l0Y2ggKHNjaGVtZSkge1xuICAgIGNhc2UgXCJodHRwXCI6XG4gICAgY2FzZSBcImh0dHBzXCI6IHtcbiAgICAgIGNvbnN0IGhvc3QgPSB1cmwuaG9zdG5hbWU7XG4gICAgICBjb25zdCBob3N0UG9ydCA9IHVybC5wb3J0O1xuICAgICAgb3V0LnB1c2goaG9zdFBvcnQgPyBgJHtob3N0fV9QT1JUJHtob3N0UG9ydH1gIDogaG9zdCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSBcImRhdGFcIjpcbiAgICBjYXNlIFwiYmxvYlwiOlxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGBEb24ndCBrbm93IGhvdyB0byBjcmVhdGUgY2FjaGUgbmFtZSBmb3Igc2NoZW1lOiAke3NjaGVtZX1gLFxuICAgICAgKTtcbiAgfVxuXG4gIHJldHVybiBqb2luKC4uLm91dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cmxUb0ZpbGVuYW1lKHVybDogVVJMKSB7XG4gIGNvbnN0IGNhY2hlRmlsZW5hbWUgPSBiYXNlVXJsVG9GaWxlbmFtZSh1cmwpO1xuICBsZXQgcmVzdFN0ciA9IHVybC5wYXRobmFtZTtcbiAgY29uc3QgcXVlcnkgPSB1cmwuc2VhcmNoO1xuICBpZiAocXVlcnkpIHtcbiAgICByZXN0U3RyICs9IGA/JHtxdWVyeX1gO1xuICB9XG4gIGNvbnN0IGhhc2hlZEZpbGVuYW1lID0gaGFzaChyZXN0U3RyKTtcbiAgcmV0dXJuIGpvaW4oY2FjaGVGaWxlbmFtZSwgaGFzaGVkRmlsZW5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0cyA9IGF3YWl0IERlbm8ubHN0YXQoZmlsZVBhdGgpO1xuICAgIHJldHVybiBzdGF0cy5pc0ZpbGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmlsZVN5bmMoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gRGVuby5sc3RhdFN5bmMoZmlsZVBhdGgpO1xuICAgIHJldHVybiBzdGF0cy5pc0ZpbGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsU0FBUyxJQUFJLEVBQUUsTUFBTSxRQUFRLFlBQVk7QUFFekMsT0FBTyxNQUFNLGFBQWEsTUFBTTtBQUVoQyxPQUFPLFNBQVMsT0FBTyxJQUFhLEVBQUUsTUFBTSxtQkFBbUIsRUFBZ0I7SUFDN0UsSUFBSSxDQUFDLE1BQU07UUFDVCxNQUFNLElBQUksTUFBTSxLQUFLO0lBQ3ZCLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Q0FPQyxHQUNELE9BQU8sU0FBUyxLQUFLLEtBQWEsRUFBVTtJQUMxQyxNQUFNLFNBQVMsSUFBSTtJQUNuQixPQUFPLE1BQU0sQ0FBQztJQUNkLE9BQU8sT0FBTyxHQUFHO0FBQ25CLENBQUM7QUFFRCxTQUFTLGtCQUFrQixHQUFRLEVBQVU7SUFDM0MsTUFBTSxNQUFNLEVBQUU7SUFDZCxNQUFNLFNBQVMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUs7SUFDekMsSUFBSSxJQUFJLENBQUM7SUFFVCxPQUFRO1FBQ04sS0FBSztRQUNMLEtBQUs7WUFBUztnQkFDWixNQUFNLE9BQU8sSUFBSSxRQUFRO2dCQUN6QixNQUFNLFdBQVcsSUFBSSxJQUFJO2dCQUN6QixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRSxTQUFTLENBQUMsR0FBRyxJQUFJO2dCQUNwRCxLQUFNO1lBQ1I7UUFDQSxLQUFLO1FBQ0wsS0FBSztZQUNILEtBQU07UUFDUjtZQUNFLE1BQU0sSUFBSSxVQUNSLENBQUMsZ0RBQWdELEVBQUUsT0FBTyxDQUFDLEVBQzNEO0lBQ047SUFFQSxPQUFPLFFBQVE7QUFDakI7QUFFQSxPQUFPLFNBQVMsY0FBYyxHQUFRLEVBQUU7SUFDdEMsTUFBTSxnQkFBZ0Isa0JBQWtCO0lBQ3hDLElBQUksVUFBVSxJQUFJLFFBQVE7SUFDMUIsTUFBTSxRQUFRLElBQUksTUFBTTtJQUN4QixJQUFJLE9BQU87UUFDVCxXQUFXLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztJQUN4QixDQUFDO0lBQ0QsTUFBTSxpQkFBaUIsS0FBSztJQUM1QixPQUFPLEtBQUssZUFBZTtBQUM3QixDQUFDO0FBRUQsT0FBTyxlQUFlLE9BQU8sUUFBZ0IsRUFBb0I7SUFDL0QsSUFBSTtRQUNGLE1BQU0sUUFBUSxNQUFNLEtBQUssS0FBSyxDQUFDO1FBQy9CLE9BQU8sTUFBTSxNQUFNO0lBQ3JCLEVBQUUsT0FBTyxLQUFLO1FBQ1osSUFBSSxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxPQUFPLEtBQUs7UUFDZCxDQUFDO1FBQ0QsTUFBTSxJQUFJO0lBQ1o7QUFDRixDQUFDO0FBRUQsT0FBTyxTQUFTLFdBQVcsUUFBZ0IsRUFBVztJQUNwRCxJQUFJO1FBQ0YsTUFBTSxRQUFRLEtBQUssU0FBUyxDQUFDO1FBQzdCLE9BQU8sTUFBTSxNQUFNO0lBQ3JCLEVBQUUsT0FBTyxLQUFLO1FBQ1osSUFBSSxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxPQUFPLEtBQUs7UUFDZCxDQUFDO1FBQ0QsTUFBTSxJQUFJO0lBQ1o7QUFDRixDQUFDIn0=