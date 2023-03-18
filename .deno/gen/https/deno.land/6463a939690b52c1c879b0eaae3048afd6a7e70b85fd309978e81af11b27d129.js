// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import * as path from "../path/mod.ts";
import { basename, fromFileUrl, normalize } from "../path/mod.ts";
/**
 * Test whether or not `dest` is a sub-directory of `src`
 * @param src src file path
 * @param dest dest file path
 * @param sep path separator
 */ export function isSubdir(src, dest, sep = path.sep) {
    if (src === dest) {
        return false;
    }
    src = toPathString(src);
    const srcArray = src.split(sep);
    dest = toPathString(dest);
    const destArray = dest.split(sep);
    return srcArray.every((current, i)=>destArray[i] === current);
}
/**
 * Get a human readable file type string.
 *
 * @param fileInfo A FileInfo describes a file and is returned by `stat`,
 *                 `lstat`
 */ export function getFileInfoType(fileInfo) {
    return fileInfo.isFile ? "file" : fileInfo.isDirectory ? "dir" : fileInfo.isSymlink ? "symlink" : undefined;
}
/** Create WalkEntry for the `path` synchronously */ export function createWalkEntrySync(path) {
    path = toPathString(path);
    path = normalize(path);
    const name = basename(path);
    const info = Deno.statSync(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
/** Create WalkEntry for the `path` asynchronously */ export async function createWalkEntry(path) {
    path = toPathString(path);
    path = normalize(path);
    const name = basename(path);
    const info = await Deno.stat(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
export function toPathString(path) {
    return path instanceof URL ? fromFileUrl(path) : path;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3MS4wL2ZzL191dGlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCIuLi9wYXRoL21vZC50c1wiO1xuaW1wb3J0IHsgYmFzZW5hbWUsIGZyb21GaWxlVXJsLCBub3JtYWxpemUgfSBmcm9tIFwiLi4vcGF0aC9tb2QudHNcIjtcblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgb3Igbm90IGBkZXN0YCBpcyBhIHN1Yi1kaXJlY3Rvcnkgb2YgYHNyY2BcbiAqIEBwYXJhbSBzcmMgc3JjIGZpbGUgcGF0aFxuICogQHBhcmFtIGRlc3QgZGVzdCBmaWxlIHBhdGhcbiAqIEBwYXJhbSBzZXAgcGF0aCBzZXBhcmF0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3ViZGlyKFxuICBzcmM6IHN0cmluZyB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgVVJMLFxuICBzZXA6IHN0cmluZyA9IHBhdGguc2VwLFxuKTogYm9vbGVhbiB7XG4gIGlmIChzcmMgPT09IGRlc3QpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3JjID0gdG9QYXRoU3RyaW5nKHNyYyk7XG4gIGNvbnN0IHNyY0FycmF5ID0gc3JjLnNwbGl0KHNlcCk7XG4gIGRlc3QgPSB0b1BhdGhTdHJpbmcoZGVzdCk7XG4gIGNvbnN0IGRlc3RBcnJheSA9IGRlc3Quc3BsaXQoc2VwKTtcbiAgcmV0dXJuIHNyY0FycmF5LmV2ZXJ5KChjdXJyZW50LCBpKSA9PiBkZXN0QXJyYXlbaV0gPT09IGN1cnJlbnQpO1xufVxuXG5leHBvcnQgdHlwZSBQYXRoVHlwZSA9IFwiZmlsZVwiIHwgXCJkaXJcIiB8IFwic3ltbGlua1wiO1xuXG4vKipcbiAqIEdldCBhIGh1bWFuIHJlYWRhYmxlIGZpbGUgdHlwZSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGZpbGVJbmZvIEEgRmlsZUluZm8gZGVzY3JpYmVzIGEgZmlsZSBhbmQgaXMgcmV0dXJuZWQgYnkgYHN0YXRgLFxuICogICAgICAgICAgICAgICAgIGBsc3RhdGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVJbmZvVHlwZShmaWxlSW5mbzogRGVuby5GaWxlSW5mbyk6IFBhdGhUeXBlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGZpbGVJbmZvLmlzRmlsZVxuICAgID8gXCJmaWxlXCJcbiAgICA6IGZpbGVJbmZvLmlzRGlyZWN0b3J5XG4gICAgPyBcImRpclwiXG4gICAgOiBmaWxlSW5mby5pc1N5bWxpbmtcbiAgICA/IFwic3ltbGlua1wiXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2Fsa0VudHJ5IGV4dGVuZHMgRGVuby5EaXJFbnRyeSB7XG4gIHBhdGg6IHN0cmluZztcbn1cblxuLyoqIENyZWF0ZSBXYWxrRW50cnkgZm9yIHRoZSBgcGF0aGAgc3luY2hyb25vdXNseSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdhbGtFbnRyeVN5bmMocGF0aDogc3RyaW5nIHwgVVJMKTogV2Fsa0VudHJ5IHtcbiAgcGF0aCA9IHRvUGF0aFN0cmluZyhwYXRoKTtcbiAgcGF0aCA9IG5vcm1hbGl6ZShwYXRoKTtcbiAgY29uc3QgbmFtZSA9IGJhc2VuYW1lKHBhdGgpO1xuICBjb25zdCBpbmZvID0gRGVuby5zdGF0U3luYyhwYXRoKTtcbiAgcmV0dXJuIHtcbiAgICBwYXRoLFxuICAgIG5hbWUsXG4gICAgaXNGaWxlOiBpbmZvLmlzRmlsZSxcbiAgICBpc0RpcmVjdG9yeTogaW5mby5pc0RpcmVjdG9yeSxcbiAgICBpc1N5bWxpbms6IGluZm8uaXNTeW1saW5rLFxuICB9O1xufVxuXG4vKiogQ3JlYXRlIFdhbGtFbnRyeSBmb3IgdGhlIGBwYXRoYCBhc3luY2hyb25vdXNseSAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVdhbGtFbnRyeShwYXRoOiBzdHJpbmcgfCBVUkwpOiBQcm9taXNlPFdhbGtFbnRyeT4ge1xuICBwYXRoID0gdG9QYXRoU3RyaW5nKHBhdGgpO1xuICBwYXRoID0gbm9ybWFsaXplKHBhdGgpO1xuICBjb25zdCBuYW1lID0gYmFzZW5hbWUocGF0aCk7XG4gIGNvbnN0IGluZm8gPSBhd2FpdCBEZW5vLnN0YXQocGF0aCk7XG4gIHJldHVybiB7XG4gICAgcGF0aCxcbiAgICBuYW1lLFxuICAgIGlzRmlsZTogaW5mby5pc0ZpbGUsXG4gICAgaXNEaXJlY3Rvcnk6IGluZm8uaXNEaXJlY3RvcnksXG4gICAgaXNTeW1saW5rOiBpbmZvLmlzU3ltbGluayxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvUGF0aFN0cmluZyhwYXRoOiBzdHJpbmcgfCBVUkwpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aCBpbnN0YW5jZW9mIFVSTCA/IGZyb21GaWxlVXJsKHBhdGgpIDogcGF0aDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsWUFBWSxVQUFVLGlCQUFpQjtBQUN2QyxTQUFTLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxRQUFRLGlCQUFpQjtBQUVsRTs7Ozs7Q0FLQyxHQUNELE9BQU8sU0FBUyxTQUNkLEdBQWlCLEVBQ2pCLElBQWtCLEVBQ2xCLE1BQWMsS0FBSyxHQUFHLEVBQ2I7SUFDVCxJQUFJLFFBQVEsTUFBTTtRQUNoQixPQUFPLEtBQUs7SUFDZCxDQUFDO0lBQ0QsTUFBTSxhQUFhO0lBQ25CLE1BQU0sV0FBVyxJQUFJLEtBQUssQ0FBQztJQUMzQixPQUFPLGFBQWE7SUFDcEIsTUFBTSxZQUFZLEtBQUssS0FBSyxDQUFDO0lBQzdCLE9BQU8sU0FBUyxLQUFLLENBQUMsQ0FBQyxTQUFTLElBQU0sU0FBUyxDQUFDLEVBQUUsS0FBSztBQUN6RCxDQUFDO0FBSUQ7Ozs7O0NBS0MsR0FDRCxPQUFPLFNBQVMsZ0JBQWdCLFFBQXVCLEVBQXdCO0lBQzdFLE9BQU8sU0FBUyxNQUFNLEdBQ2xCLFNBQ0EsU0FBUyxXQUFXLEdBQ3BCLFFBQ0EsU0FBUyxTQUFTLEdBQ2xCLFlBQ0EsU0FBUztBQUNmLENBQUM7QUFNRCxrREFBa0QsR0FDbEQsT0FBTyxTQUFTLG9CQUFvQixJQUFrQixFQUFhO0lBQ2pFLE9BQU8sYUFBYTtJQUNwQixPQUFPLFVBQVU7SUFDakIsTUFBTSxPQUFPLFNBQVM7SUFDdEIsTUFBTSxPQUFPLEtBQUssUUFBUSxDQUFDO0lBQzNCLE9BQU87UUFDTDtRQUNBO1FBQ0EsUUFBUSxLQUFLLE1BQU07UUFDbkIsYUFBYSxLQUFLLFdBQVc7UUFDN0IsV0FBVyxLQUFLLFNBQVM7SUFDM0I7QUFDRixDQUFDO0FBRUQsbURBQW1ELEdBQ25ELE9BQU8sZUFBZSxnQkFBZ0IsSUFBa0IsRUFBc0I7SUFDNUUsT0FBTyxhQUFhO0lBQ3BCLE9BQU8sVUFBVTtJQUNqQixNQUFNLE9BQU8sU0FBUztJQUN0QixNQUFNLE9BQU8sTUFBTSxLQUFLLElBQUksQ0FBQztJQUM3QixPQUFPO1FBQ0w7UUFDQTtRQUNBLFFBQVEsS0FBSyxNQUFNO1FBQ25CLGFBQWEsS0FBSyxXQUFXO1FBQzdCLFdBQVcsS0FBSyxTQUFTO0lBQzNCO0FBQ0YsQ0FBQztBQUVELE9BQU8sU0FBUyxhQUFhLElBQWtCLEVBQVU7SUFDdkQsT0FBTyxnQkFBZ0IsTUFBTSxZQUFZLFFBQVEsSUFBSTtBQUN2RCxDQUFDIn0=