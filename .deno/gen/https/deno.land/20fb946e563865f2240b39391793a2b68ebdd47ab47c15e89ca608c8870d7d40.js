// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// Documentation and interface for walk were adapted from Go
// https://golang.org/pkg/path/filepath/#Walk
// Copyright 2009 The Go Authors. All rights reserved. BSD license.
import { assert } from "../_util/asserts.ts";
import { join, normalize } from "../path/mod.ts";
import { createWalkEntry, createWalkEntrySync, toPathString } from "./_util.ts";
function include(path, exts, match, skip) {
    if (exts && !exts.some((ext)=>path.endsWith(ext))) {
        return false;
    }
    if (match && !match.some((pattern)=>!!path.match(pattern))) {
        return false;
    }
    if (skip && skip.some((pattern)=>!!path.match(pattern))) {
        return false;
    }
    return true;
}
function wrapErrorWithRootPath(err, root) {
    if (err instanceof Error && "root" in err) return err;
    const e = new Error();
    e.root = root;
    e.message = err instanceof Error ? `${err.message} for path "${root}"` : `[non-error thrown] for path "${root}"`;
    e.stack = err instanceof Error ? err.stack : undefined;
    e.cause = err instanceof Error ? err.cause : undefined;
    return e;
}
/**
 * Walks the file tree rooted at root, yielding each file or directory in the
 * tree filtered according to the given options.
 *
 * @example
 * ```ts
 * import { walk } from "https://deno.land/std@$STD_VERSION/fs/walk.ts";
 * import { assert } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * for await (const entry of walk(".")) {
 *   console.log(entry.path);
 *   assert(entry.isFile);
 * }
 * ```
 */ export async function* walk(root, { maxDepth =Infinity , includeFiles =true , includeDirs =true , followSymlinks =false , exts =undefined , match =undefined , skip =undefined  } = {}) {
    if (maxDepth < 0) {
        return;
    }
    root = toPathString(root);
    if (includeDirs && include(root, exts, match, skip)) {
        yield await createWalkEntry(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    try {
        for await (const entry of Deno.readDir(root)){
            assert(entry.name != null);
            let path = join(root, entry.name);
            let { isSymlink , isDirectory  } = entry;
            if (isSymlink) {
                if (!followSymlinks) continue;
                path = await Deno.realPath(path);
                // Caveat emptor: don't assume |path| is not a symlink. realpath()
                // resolves symlinks but another process can replace the file system
                // entity with a different type of entity before we call lstat().
                ({ isSymlink , isDirectory  } = await Deno.lstat(path));
            }
            if (isSymlink || isDirectory) {
                yield* walk(path, {
                    maxDepth: maxDepth - 1,
                    includeFiles,
                    includeDirs,
                    followSymlinks,
                    exts,
                    match,
                    skip
                });
            } else if (includeFiles && include(path, exts, match, skip)) {
                yield {
                    path,
                    ...entry
                };
            }
        }
    } catch (err) {
        throw wrapErrorWithRootPath(err, normalize(root));
    }
}
/** Same as walk() but uses synchronous ops */ export function* walkSync(root, { maxDepth =Infinity , includeFiles =true , includeDirs =true , followSymlinks =false , exts =undefined , match =undefined , skip =undefined  } = {}) {
    root = toPathString(root);
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield createWalkEntrySync(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    let entries;
    try {
        entries = Deno.readDirSync(root);
    } catch (err) {
        throw wrapErrorWithRootPath(err, normalize(root));
    }
    for (const entry of entries){
        assert(entry.name != null);
        let path = join(root, entry.name);
        let { isSymlink , isDirectory  } = entry;
        if (isSymlink) {
            if (!followSymlinks) continue;
            path = Deno.realPathSync(path);
            // Caveat emptor: don't assume |path| is not a symlink. realpath()
            // resolves symlinks but another process can replace the file system
            // entity with a different type of entity before we call lstat().
            ({ isSymlink , isDirectory  } = Deno.lstatSync(path));
        }
        if (isSymlink || isDirectory) {
            yield* walkSync(path, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                followSymlinks,
                exts,
                match,
                skip
            });
        } else if (includeFiles && include(path, exts, match, skip)) {
            yield {
                path,
                ...entry
            };
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3MS4wL2ZzL3dhbGsudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIERvY3VtZW50YXRpb24gYW5kIGludGVyZmFjZSBmb3Igd2FsayB3ZXJlIGFkYXB0ZWQgZnJvbSBHb1xuLy8gaHR0cHM6Ly9nb2xhbmcub3JnL3BrZy9wYXRoL2ZpbGVwYXRoLyNXYWxrXG4vLyBDb3B5cmlnaHQgMjAwOSBUaGUgR28gQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gQlNEIGxpY2Vuc2UuXG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiLi4vX3V0aWwvYXNzZXJ0cy50c1wiO1xuaW1wb3J0IHsgam9pbiwgbm9ybWFsaXplIH0gZnJvbSBcIi4uL3BhdGgvbW9kLnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVXYWxrRW50cnksXG4gIGNyZWF0ZVdhbGtFbnRyeVN5bmMsXG4gIHRvUGF0aFN0cmluZyxcbiAgV2Fsa0VudHJ5LFxufSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG5mdW5jdGlvbiBpbmNsdWRlKFxuICBwYXRoOiBzdHJpbmcsXG4gIGV4dHM/OiBzdHJpbmdbXSxcbiAgbWF0Y2g/OiBSZWdFeHBbXSxcbiAgc2tpcD86IFJlZ0V4cFtdLFxuKTogYm9vbGVhbiB7XG4gIGlmIChleHRzICYmICFleHRzLnNvbWUoKGV4dCk6IGJvb2xlYW4gPT4gcGF0aC5lbmRzV2l0aChleHQpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAobWF0Y2ggJiYgIW1hdGNoLnNvbWUoKHBhdHRlcm4pOiBib29sZWFuID0+ICEhcGF0aC5tYXRjaChwYXR0ZXJuKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHNraXAgJiYgc2tpcC5zb21lKChwYXR0ZXJuKTogYm9vbGVhbiA9PiAhIXBhdGgubWF0Y2gocGF0dGVybikpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiB3cmFwRXJyb3JXaXRoUm9vdFBhdGgoZXJyOiB1bmtub3duLCByb290OiBzdHJpbmcpIHtcbiAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yICYmIFwicm9vdFwiIGluIGVycikgcmV0dXJuIGVycjtcbiAgY29uc3QgZSA9IG5ldyBFcnJvcigpIGFzIEVycm9yICYgeyByb290OiBzdHJpbmcgfTtcbiAgZS5yb290ID0gcm9vdDtcbiAgZS5tZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICA/IGAke2Vyci5tZXNzYWdlfSBmb3IgcGF0aCBcIiR7cm9vdH1cImBcbiAgICA6IGBbbm9uLWVycm9yIHRocm93bl0gZm9yIHBhdGggXCIke3Jvb3R9XCJgO1xuICBlLnN0YWNrID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIuc3RhY2sgOiB1bmRlZmluZWQ7XG4gIGUuY2F1c2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5jYXVzZSA6IHVuZGVmaW5lZDtcbiAgcmV0dXJuIGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2Fsa09wdGlvbnMge1xuICAvKiogQGRlZmF1bHQge0luZmluaXR5fSAqL1xuICBtYXhEZXB0aD86IG51bWJlcjtcbiAgLyoqIEBkZWZhdWx0IHt0cnVlfSAqL1xuICBpbmNsdWRlRmlsZXM/OiBib29sZWFuO1xuICAvKiogQGRlZmF1bHQge3RydWV9ICovXG4gIGluY2x1ZGVEaXJzPzogYm9vbGVhbjtcbiAgLyoqIEBkZWZhdWx0IHtmYWxzZX0gKi9cbiAgZm9sbG93U3ltbGlua3M/OiBib29sZWFuO1xuICBleHRzPzogc3RyaW5nW107XG4gIG1hdGNoPzogUmVnRXhwW107XG4gIHNraXA/OiBSZWdFeHBbXTtcbn1cbmV4cG9ydCB0eXBlIHsgV2Fsa0VudHJ5IH07XG5cbi8qKlxuICogV2Fsa3MgdGhlIGZpbGUgdHJlZSByb290ZWQgYXQgcm9vdCwgeWllbGRpbmcgZWFjaCBmaWxlIG9yIGRpcmVjdG9yeSBpbiB0aGVcbiAqIHRyZWUgZmlsdGVyZWQgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBvcHRpb25zLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgd2FsayB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL3dhbGsudHNcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuICpcbiAqIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2Ygd2FsayhcIi5cIikpIHtcbiAqICAgY29uc29sZS5sb2coZW50cnkucGF0aCk7XG4gKiAgIGFzc2VydChlbnRyeS5pc0ZpbGUpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiogd2FsayhcbiAgcm9vdDogc3RyaW5nIHwgVVJMLFxuICB7XG4gICAgbWF4RGVwdGggPSBJbmZpbml0eSxcbiAgICBpbmNsdWRlRmlsZXMgPSB0cnVlLFxuICAgIGluY2x1ZGVEaXJzID0gdHJ1ZSxcbiAgICBmb2xsb3dTeW1saW5rcyA9IGZhbHNlLFxuICAgIGV4dHMgPSB1bmRlZmluZWQsXG4gICAgbWF0Y2ggPSB1bmRlZmluZWQsXG4gICAgc2tpcCA9IHVuZGVmaW5lZCxcbiAgfTogV2Fsa09wdGlvbnMgPSB7fSxcbik6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgaWYgKG1heERlcHRoIDwgMCkge1xuICAgIHJldHVybjtcbiAgfVxuICByb290ID0gdG9QYXRoU3RyaW5nKHJvb3QpO1xuICBpZiAoaW5jbHVkZURpcnMgJiYgaW5jbHVkZShyb290LCBleHRzLCBtYXRjaCwgc2tpcCkpIHtcbiAgICB5aWVsZCBhd2FpdCBjcmVhdGVXYWxrRW50cnkocm9vdCk7XG4gIH1cbiAgaWYgKG1heERlcHRoIDwgMSB8fCAhaW5jbHVkZShyb290LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgc2tpcCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdHJ5IHtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIERlbm8ucmVhZERpcihyb290KSkge1xuICAgICAgYXNzZXJ0KGVudHJ5Lm5hbWUgIT0gbnVsbCk7XG4gICAgICBsZXQgcGF0aCA9IGpvaW4ocm9vdCwgZW50cnkubmFtZSk7XG5cbiAgICAgIGxldCB7IGlzU3ltbGluaywgaXNEaXJlY3RvcnkgfSA9IGVudHJ5O1xuXG4gICAgICBpZiAoaXNTeW1saW5rKSB7XG4gICAgICAgIGlmICghZm9sbG93U3ltbGlua3MpIGNvbnRpbnVlO1xuICAgICAgICBwYXRoID0gYXdhaXQgRGVuby5yZWFsUGF0aChwYXRoKTtcbiAgICAgICAgLy8gQ2F2ZWF0IGVtcHRvcjogZG9uJ3QgYXNzdW1lIHxwYXRofCBpcyBub3QgYSBzeW1saW5rLiByZWFscGF0aCgpXG4gICAgICAgIC8vIHJlc29sdmVzIHN5bWxpbmtzIGJ1dCBhbm90aGVyIHByb2Nlc3MgY2FuIHJlcGxhY2UgdGhlIGZpbGUgc3lzdGVtXG4gICAgICAgIC8vIGVudGl0eSB3aXRoIGEgZGlmZmVyZW50IHR5cGUgb2YgZW50aXR5IGJlZm9yZSB3ZSBjYWxsIGxzdGF0KCkuXG4gICAgICAgICh7IGlzU3ltbGluaywgaXNEaXJlY3RvcnkgfSA9IGF3YWl0IERlbm8ubHN0YXQocGF0aCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNTeW1saW5rIHx8IGlzRGlyZWN0b3J5KSB7XG4gICAgICAgIHlpZWxkKiB3YWxrKHBhdGgsIHtcbiAgICAgICAgICBtYXhEZXB0aDogbWF4RGVwdGggLSAxLFxuICAgICAgICAgIGluY2x1ZGVGaWxlcyxcbiAgICAgICAgICBpbmNsdWRlRGlycyxcbiAgICAgICAgICBmb2xsb3dTeW1saW5rcyxcbiAgICAgICAgICBleHRzLFxuICAgICAgICAgIG1hdGNoLFxuICAgICAgICAgIHNraXAsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChpbmNsdWRlRmlsZXMgJiYgaW5jbHVkZShwYXRoLCBleHRzLCBtYXRjaCwgc2tpcCkpIHtcbiAgICAgICAgeWllbGQgeyBwYXRoLCAuLi5lbnRyeSB9O1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgd3JhcEVycm9yV2l0aFJvb3RQYXRoKGVyciwgbm9ybWFsaXplKHJvb3QpKTtcbiAgfVxufVxuXG4vKiogU2FtZSBhcyB3YWxrKCkgYnV0IHVzZXMgc3luY2hyb25vdXMgb3BzICovXG5leHBvcnQgZnVuY3Rpb24qIHdhbGtTeW5jKFxuICByb290OiBzdHJpbmcgfCBVUkwsXG4gIHtcbiAgICBtYXhEZXB0aCA9IEluZmluaXR5LFxuICAgIGluY2x1ZGVGaWxlcyA9IHRydWUsXG4gICAgaW5jbHVkZURpcnMgPSB0cnVlLFxuICAgIGZvbGxvd1N5bWxpbmtzID0gZmFsc2UsXG4gICAgZXh0cyA9IHVuZGVmaW5lZCxcbiAgICBtYXRjaCA9IHVuZGVmaW5lZCxcbiAgICBza2lwID0gdW5kZWZpbmVkLFxuICB9OiBXYWxrT3B0aW9ucyA9IHt9LFxuKTogSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgcm9vdCA9IHRvUGF0aFN0cmluZyhyb290KTtcbiAgaWYgKG1heERlcHRoIDwgMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoaW5jbHVkZURpcnMgJiYgaW5jbHVkZShyb290LCBleHRzLCBtYXRjaCwgc2tpcCkpIHtcbiAgICB5aWVsZCBjcmVhdGVXYWxrRW50cnlTeW5jKHJvb3QpO1xuICB9XG4gIGlmIChtYXhEZXB0aCA8IDEgfHwgIWluY2x1ZGUocm9vdCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHNraXApKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBlbnRyaWVzO1xuICB0cnkge1xuICAgIGVudHJpZXMgPSBEZW5vLnJlYWREaXJTeW5jKHJvb3QpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyB3cmFwRXJyb3JXaXRoUm9vdFBhdGgoZXJyLCBub3JtYWxpemUocm9vdCkpO1xuICB9XG4gIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgIGFzc2VydChlbnRyeS5uYW1lICE9IG51bGwpO1xuICAgIGxldCBwYXRoID0gam9pbihyb290LCBlbnRyeS5uYW1lKTtcblxuICAgIGxldCB7IGlzU3ltbGluaywgaXNEaXJlY3RvcnkgfSA9IGVudHJ5O1xuXG4gICAgaWYgKGlzU3ltbGluaykge1xuICAgICAgaWYgKCFmb2xsb3dTeW1saW5rcykgY29udGludWU7XG4gICAgICBwYXRoID0gRGVuby5yZWFsUGF0aFN5bmMocGF0aCk7XG4gICAgICAvLyBDYXZlYXQgZW1wdG9yOiBkb24ndCBhc3N1bWUgfHBhdGh8IGlzIG5vdCBhIHN5bWxpbmsuIHJlYWxwYXRoKClcbiAgICAgIC8vIHJlc29sdmVzIHN5bWxpbmtzIGJ1dCBhbm90aGVyIHByb2Nlc3MgY2FuIHJlcGxhY2UgdGhlIGZpbGUgc3lzdGVtXG4gICAgICAvLyBlbnRpdHkgd2l0aCBhIGRpZmZlcmVudCB0eXBlIG9mIGVudGl0eSBiZWZvcmUgd2UgY2FsbCBsc3RhdCgpLlxuICAgICAgKHsgaXNTeW1saW5rLCBpc0RpcmVjdG9yeSB9ID0gRGVuby5sc3RhdFN5bmMocGF0aCkpO1xuICAgIH1cblxuICAgIGlmIChpc1N5bWxpbmsgfHwgaXNEaXJlY3RvcnkpIHtcbiAgICAgIHlpZWxkKiB3YWxrU3luYyhwYXRoLCB7XG4gICAgICAgIG1heERlcHRoOiBtYXhEZXB0aCAtIDEsXG4gICAgICAgIGluY2x1ZGVGaWxlcyxcbiAgICAgICAgaW5jbHVkZURpcnMsXG4gICAgICAgIGZvbGxvd1N5bWxpbmtzLFxuICAgICAgICBleHRzLFxuICAgICAgICBtYXRjaCxcbiAgICAgICAgc2tpcCxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaW5jbHVkZUZpbGVzICYmIGluY2x1ZGUocGF0aCwgZXh0cywgbWF0Y2gsIHNraXApKSB7XG4gICAgICB5aWVsZCB7IHBhdGgsIC4uLmVudHJ5IH07XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLDREQUE0RDtBQUM1RCw2Q0FBNkM7QUFDN0MsbUVBQW1FO0FBQ25FLFNBQVMsTUFBTSxRQUFRLHNCQUFzQjtBQUM3QyxTQUFTLElBQUksRUFBRSxTQUFTLFFBQVEsaUJBQWlCO0FBQ2pELFNBQ0UsZUFBZSxFQUNmLG1CQUFtQixFQUNuQixZQUFZLFFBRVAsYUFBYTtBQUVwQixTQUFTLFFBQ1AsSUFBWSxFQUNaLElBQWUsRUFDZixLQUFnQixFQUNoQixJQUFlLEVBQ047SUFDVCxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQWlCLEtBQUssUUFBUSxDQUFDLE9BQU87UUFDNUQsT0FBTyxLQUFLO0lBQ2QsQ0FBQztJQUNELElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBcUIsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFdBQVc7UUFDckUsT0FBTyxLQUFLO0lBQ2QsQ0FBQztJQUNELElBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLFVBQXFCLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxXQUFXO1FBQ2xFLE9BQU8sS0FBSztJQUNkLENBQUM7SUFDRCxPQUFPLElBQUk7QUFDYjtBQUVBLFNBQVMsc0JBQXNCLEdBQVksRUFBRSxJQUFZLEVBQUU7SUFDekQsSUFBSSxlQUFlLFNBQVMsVUFBVSxLQUFLLE9BQU87SUFDbEQsTUFBTSxJQUFJLElBQUk7SUFDZCxFQUFFLElBQUksR0FBRztJQUNULEVBQUUsT0FBTyxHQUFHLGVBQWUsUUFDdkIsQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUNuQyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNDLEVBQUUsS0FBSyxHQUFHLGVBQWUsUUFBUSxJQUFJLEtBQUss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