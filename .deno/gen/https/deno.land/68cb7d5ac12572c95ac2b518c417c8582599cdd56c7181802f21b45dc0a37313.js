// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { globToRegExp, isAbsolute, isGlob, joinGlobs, resolve, SEP_PATTERN } from "../path/mod.ts";
import { walk, walkSync } from "./walk.ts";
import { assert } from "../_util/asserts.ts";
import { isWindows } from "../_util/os.ts";
import { createWalkEntry, createWalkEntrySync, toPathString } from "./_util.ts";
function split(path) {
    const s = SEP_PATTERN.source;
    const segments = path.replace(new RegExp(`^${s}|${s}$`, "g"), "").split(SEP_PATTERN);
    const isAbsolute_ = isAbsolute(path);
    return {
        segments,
        isAbsolute: isAbsolute_,
        hasTrailingSep: !!path.match(new RegExp(`${s}$`)),
        winRoot: isWindows && isAbsolute_ ? segments.shift() : undefined
    };
}
function throwUnlessNotFound(error) {
    if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
    }
}
function comparePath(a, b) {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
}
/**
 * Expand the glob string from the specified `root` directory and yield each
 * result as a `WalkEntry` object.
 *
 * See [`globToRegExp()`](../path/glob.ts#globToRegExp) for details on supported
 * syntax.
 *
 * @example
 * ```ts
 * import { expandGlob } from "https://deno.land/std@$STD_VERSION/fs/expand_glob.ts";
 * for await (const file of expandGlob("**\/*.ts")) {
 *   console.log(file);
 * }
 * ```
 */ export async function* expandGlob(glob, { root =Deno.cwd() , exclude =[] , includeDirs =true , extended =true , globstar =false , caseInsensitive  } = {}) {
    const globOptions = {
        extended,
        globstar,
        caseInsensitive
    };
    const absRoot = resolve(root);
    const resolveFromRoot = (path)=>resolve(absRoot, path);
    const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp(s, globOptions));
    const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p));
    const { segments , isAbsolute: isGlobAbsolute , hasTrailingSep , winRoot  } = split(toPathString(glob));
    let fixedRoot = isGlobAbsolute ? winRoot != undefined ? winRoot : "/" : absRoot;
    while(segments.length > 0 && !isGlob(segments[0])){
        const seg = segments.shift();
        assert(seg != null);
        fixedRoot = joinGlobs([
            fixedRoot,
            seg
        ], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = await createWalkEntry(fixedRoot);
    } catch (error) {
        return throwUnlessNotFound(error);
    }
    async function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        } else if (globSegment == "..") {
            const parentPath = joinGlobs([
                walkInfo.path,
                ".."
            ], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield await createWalkEntry(parentPath);
                }
            } catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        } else if (globSegment == "**") {
            return yield* walk(walkInfo.path, {
                skip: excludePatterns,
                maxDepth: globstar ? Infinity : 1
            });
        }
        const globPattern = globToRegExp(globSegment, globOptions);
        for await (const walkEntry of walk(walkInfo.path, {
            maxDepth: 1,
            skip: excludePatterns
        })){
            if (walkEntry.path != walkInfo.path && walkEntry.name.match(globPattern)) {
                yield walkEntry;
            }
        }
    }
    let currentMatches = [
        fixedRootInfo
    ];
    for (const segment of segments){
        // Advancing the list of current matches may introduce duplicates, so we
        // pass everything through this Map.
        const nextMatchMap = new Map();
        await Promise.all(currentMatches.map(async (currentMatch)=>{
            for await (const nextMatch of advanceMatch(currentMatch, segment)){
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }));
        currentMatches = [
            ...nextMatchMap.values()
        ].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry)=>entry.isDirectory);
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry)=>!entry.isDirectory);
    }
    yield* currentMatches;
}
/**
 * Synchronous version of `expandGlob()`.
 *
 * @example
 * ```ts
 * import { expandGlobSync } from "https://deno.land/std@$STD_VERSION/fs/expand_glob.ts";
 * for (const file of expandGlobSync("**\/*.ts")) {
 *   console.log(file);
 * }
 * ```
 */ export function* expandGlobSync(glob, { root =Deno.cwd() , exclude =[] , includeDirs =true , extended =true , globstar =false , caseInsensitive  } = {}) {
    const globOptions = {
        extended,
        globstar,
        caseInsensitive
    };
    const absRoot = resolve(root);
    const resolveFromRoot = (path)=>resolve(absRoot, path);
    const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp(s, globOptions));
    const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p));
    const { segments , isAbsolute: isGlobAbsolute , hasTrailingSep , winRoot  } = split(toPathString(glob));
    let fixedRoot = isGlobAbsolute ? winRoot != undefined ? winRoot : "/" : absRoot;
    while(segments.length > 0 && !isGlob(segments[0])){
        const seg = segments.shift();
        assert(seg != null);
        fixedRoot = joinGlobs([
            fixedRoot,
            seg
        ], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = createWalkEntrySync(fixedRoot);
    } catch (error) {
        return throwUnlessNotFound(error);
    }
    function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        } else if (globSegment == "..") {
            const parentPath = joinGlobs([
                walkInfo.path,
                ".."
            ], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield createWalkEntrySync(parentPath);
                }
            } catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        } else if (globSegment == "**") {
            return yield* walkSync(walkInfo.path, {
                skip: excludePatterns,
                maxDepth: globstar ? Infinity : 1
            });
        }
        const globPattern = globToRegExp(globSegment, globOptions);
        for (const walkEntry of walkSync(walkInfo.path, {
            maxDepth: 1,
            skip: excludePatterns
        })){
            if (walkEntry.path != walkInfo.path && walkEntry.name.match(globPattern)) {
                yield walkEntry;
            }
        }
    }
    let currentMatches = [
        fixedRootInfo
    ];
    for (const segment of segments){
        // Advancing the list of current matches may introduce duplicates, so we
        // pass everything through this Map.
        const nextMatchMap = new Map();
        for (const currentMatch of currentMatches){
            for (const nextMatch of advanceMatch(currentMatch, segment)){
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }
        currentMatches = [
            ...nextMatchMap.values()
        ].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry)=>entry.isDirectory);
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry)=>!entry.isDirectory);
    }
    yield* currentMatches;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3MS4wL2ZzL2V4cGFuZF9nbG9iLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQge1xuICBHbG9iT3B0aW9ucyxcbiAgZ2xvYlRvUmVnRXhwLFxuICBpc0Fic29sdXRlLFxuICBpc0dsb2IsXG4gIGpvaW5HbG9icyxcbiAgcmVzb2x2ZSxcbiAgU0VQX1BBVFRFUk4sXG59IGZyb20gXCIuLi9wYXRoL21vZC50c1wiO1xuaW1wb3J0IHsgd2Fsaywgd2Fsa1N5bmMgfSBmcm9tIFwiLi93YWxrLnRzXCI7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiLi4vX3V0aWwvYXNzZXJ0cy50c1wiO1xuaW1wb3J0IHsgaXNXaW5kb3dzIH0gZnJvbSBcIi4uL191dGlsL29zLnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVXYWxrRW50cnksXG4gIGNyZWF0ZVdhbGtFbnRyeVN5bmMsXG4gIHRvUGF0aFN0cmluZyxcbiAgV2Fsa0VudHJ5LFxufSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEV4cGFuZEdsb2JPcHRpb25zIGV4dGVuZHMgT21pdDxHbG9iT3B0aW9ucywgXCJvc1wiPiB7XG4gIHJvb3Q/OiBzdHJpbmc7XG4gIGV4Y2x1ZGU/OiBzdHJpbmdbXTtcbiAgaW5jbHVkZURpcnM/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgU3BsaXRQYXRoIHtcbiAgc2VnbWVudHM6IHN0cmluZ1tdO1xuICBpc0Fic29sdXRlOiBib29sZWFuO1xuICBoYXNUcmFpbGluZ1NlcDogYm9vbGVhbjtcbiAgLy8gRGVmaW5lZCBmb3IgYW55IGFic29sdXRlIFdpbmRvd3MgcGF0aC5cbiAgd2luUm9vdD86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gc3BsaXQocGF0aDogc3RyaW5nKTogU3BsaXRQYXRoIHtcbiAgY29uc3QgcyA9IFNFUF9QQVRURVJOLnNvdXJjZTtcbiAgY29uc3Qgc2VnbWVudHMgPSBwYXRoXG4gICAgLnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7c318JHtzfSRgLCBcImdcIiksIFwiXCIpXG4gICAgLnNwbGl0KFNFUF9QQVRURVJOKTtcbiAgY29uc3QgaXNBYnNvbHV0ZV8gPSBpc0Fic29sdXRlKHBhdGgpO1xuICByZXR1cm4ge1xuICAgIHNlZ21lbnRzLFxuICAgIGlzQWJzb2x1dGU6IGlzQWJzb2x1dGVfLFxuICAgIGhhc1RyYWlsaW5nU2VwOiAhIXBhdGgubWF0Y2gobmV3IFJlZ0V4cChgJHtzfSRgKSksXG4gICAgd2luUm9vdDogaXNXaW5kb3dzICYmIGlzQWJzb2x1dGVfID8gc2VnbWVudHMuc2hpZnQoKSA6IHVuZGVmaW5lZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcjogdW5rbm93bikge1xuICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVQYXRoKGE6IFdhbGtFbnRyeSwgYjogV2Fsa0VudHJ5KTogbnVtYmVyIHtcbiAgaWYgKGEucGF0aCA8IGIucGF0aCkgcmV0dXJuIC0xO1xuICBpZiAoYS5wYXRoID4gYi5wYXRoKSByZXR1cm4gMTtcbiAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogRXhwYW5kIHRoZSBnbG9iIHN0cmluZyBmcm9tIHRoZSBzcGVjaWZpZWQgYHJvb3RgIGRpcmVjdG9yeSBhbmQgeWllbGQgZWFjaFxuICogcmVzdWx0IGFzIGEgYFdhbGtFbnRyeWAgb2JqZWN0LlxuICpcbiAqIFNlZSBbYGdsb2JUb1JlZ0V4cCgpYF0oLi4vcGF0aC9nbG9iLnRzI2dsb2JUb1JlZ0V4cCkgZm9yIGRldGFpbHMgb24gc3VwcG9ydGVkXG4gKiBzeW50YXguXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleHBhbmRHbG9iIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvZXhwYW5kX2dsb2IudHNcIjtcbiAqIGZvciBhd2FpdCAoY29uc3QgZmlsZSBvZiBleHBhbmRHbG9iKFwiKipcXC8qLnRzXCIpKSB7XG4gKiAgIGNvbnNvbGUubG9nKGZpbGUpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiogZXhwYW5kR2xvYihcbiAgZ2xvYjogc3RyaW5nIHwgVVJMLFxuICB7XG4gICAgcm9vdCA9IERlbm8uY3dkKCksXG4gICAgZXhjbHVkZSA9IFtdLFxuICAgIGluY2x1ZGVEaXJzID0gdHJ1ZSxcbiAgICBleHRlbmRlZCA9IHRydWUsXG4gICAgZ2xvYnN0YXIgPSBmYWxzZSxcbiAgICBjYXNlSW5zZW5zaXRpdmUsXG4gIH06IEV4cGFuZEdsb2JPcHRpb25zID0ge30sXG4pOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gIGNvbnN0IGdsb2JPcHRpb25zOiBHbG9iT3B0aW9ucyA9IHsgZXh0ZW5kZWQsIGdsb2JzdGFyLCBjYXNlSW5zZW5zaXRpdmUgfTtcbiAgY29uc3QgYWJzUm9vdCA9IHJlc29sdmUocm9vdCk7XG4gIGNvbnN0IHJlc29sdmVGcm9tUm9vdCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4gcmVzb2x2ZShhYnNSb290LCBwYXRoKTtcbiAgY29uc3QgZXhjbHVkZVBhdHRlcm5zID0gZXhjbHVkZVxuICAgIC5tYXAocmVzb2x2ZUZyb21Sb290KVxuICAgIC5tYXAoKHM6IHN0cmluZyk6IFJlZ0V4cCA9PiBnbG9iVG9SZWdFeHAocywgZ2xvYk9wdGlvbnMpKTtcbiAgY29uc3Qgc2hvdWxkSW5jbHVkZSA9IChwYXRoOiBzdHJpbmcpOiBib29sZWFuID0+XG4gICAgIWV4Y2x1ZGVQYXR0ZXJucy5zb21lKChwOiBSZWdFeHApOiBib29sZWFuID0+ICEhcGF0aC5tYXRjaChwKSk7XG4gIGNvbnN0IHtcbiAgICBzZWdtZW50cyxcbiAgICBpc0Fic29sdXRlOiBpc0dsb2JBYnNvbHV0ZSxcbiAgICBoYXNUcmFpbGluZ1NlcCxcbiAgICB3aW5Sb290LFxuICB9ID0gc3BsaXQodG9QYXRoU3RyaW5nKGdsb2IpKTtcblxuICBsZXQgZml4ZWRSb290ID0gaXNHbG9iQWJzb2x1dGVcbiAgICA/IHdpblJvb3QgIT0gdW5kZWZpbmVkID8gd2luUm9vdCA6IFwiL1wiXG4gICAgOiBhYnNSb290O1xuICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoID4gMCAmJiAhaXNHbG9iKHNlZ21lbnRzWzBdKSkge1xuICAgIGNvbnN0IHNlZyA9IHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgYXNzZXJ0KHNlZyAhPSBudWxsKTtcbiAgICBmaXhlZFJvb3QgPSBqb2luR2xvYnMoW2ZpeGVkUm9vdCwgc2VnXSwgZ2xvYk9wdGlvbnMpO1xuICB9XG5cbiAgbGV0IGZpeGVkUm9vdEluZm86IFdhbGtFbnRyeTtcbiAgdHJ5IHtcbiAgICBmaXhlZFJvb3RJbmZvID0gYXdhaXQgY3JlYXRlV2Fsa0VudHJ5KGZpeGVkUm9vdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHRocm93VW5sZXNzTm90Rm91bmQoZXJyb3IpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24qIGFkdmFuY2VNYXRjaChcbiAgICB3YWxrSW5mbzogV2Fsa0VudHJ5LFxuICAgIGdsb2JTZWdtZW50OiBzdHJpbmcsXG4gICk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgICBpZiAoIXdhbGtJbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChnbG9iU2VnbWVudCA9PSBcIi4uXCIpIHtcbiAgICAgIGNvbnN0IHBhcmVudFBhdGggPSBqb2luR2xvYnMoW3dhbGtJbmZvLnBhdGgsIFwiLi5cIl0sIGdsb2JPcHRpb25zKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzaG91bGRJbmNsdWRlKHBhcmVudFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHlpZWxkIGF3YWl0IGNyZWF0ZVdhbGtFbnRyeShwYXJlbnRQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChnbG9iU2VnbWVudCA9PSBcIioqXCIpIHtcbiAgICAgIHJldHVybiB5aWVsZCogd2Fsayh3YWxrSW5mby5wYXRoLCB7XG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgICAgbWF4RGVwdGg6IGdsb2JzdGFyID8gSW5maW5pdHkgOiAxLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGdsb2JQYXR0ZXJuID0gZ2xvYlRvUmVnRXhwKGdsb2JTZWdtZW50LCBnbG9iT3B0aW9ucyk7XG4gICAgZm9yIGF3YWl0IChcbiAgICAgIGNvbnN0IHdhbGtFbnRyeSBvZiB3YWxrKHdhbGtJbmZvLnBhdGgsIHtcbiAgICAgICAgbWF4RGVwdGg6IDEsXG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgIH0pXG4gICAgKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHdhbGtFbnRyeS5wYXRoICE9IHdhbGtJbmZvLnBhdGggJiZcbiAgICAgICAgd2Fsa0VudHJ5Lm5hbWUubWF0Y2goZ2xvYlBhdHRlcm4pXG4gICAgICApIHtcbiAgICAgICAgeWllbGQgd2Fsa0VudHJ5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBjdXJyZW50TWF0Y2hlczogV2Fsa0VudHJ5W10gPSBbZml4ZWRSb290SW5mb107XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgIC8vIEFkdmFuY2luZyB0aGUgbGlzdCBvZiBjdXJyZW50IG1hdGNoZXMgbWF5IGludHJvZHVjZSBkdXBsaWNhdGVzLCBzbyB3ZVxuICAgIC8vIHBhc3MgZXZlcnl0aGluZyB0aHJvdWdoIHRoaXMgTWFwLlxuICAgIGNvbnN0IG5leHRNYXRjaE1hcDogTWFwPHN0cmluZywgV2Fsa0VudHJ5PiA9IG5ldyBNYXAoKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIGN1cnJlbnRNYXRjaGVzLm1hcChhc3luYyAoY3VycmVudE1hdGNoKSA9PiB7XG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgbmV4dE1hdGNoIG9mIGFkdmFuY2VNYXRjaChjdXJyZW50TWF0Y2gsIHNlZ21lbnQpKSB7XG4gICAgICAgICAgbmV4dE1hdGNoTWFwLnNldChuZXh0TWF0Y2gucGF0aCwgbmV4dE1hdGNoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IFsuLi5uZXh0TWF0Y2hNYXAudmFsdWVzKCldLnNvcnQoY29tcGFyZVBhdGgpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2VwKSB7XG4gICAgY3VycmVudE1hdGNoZXMgPSBjdXJyZW50TWF0Y2hlcy5maWx0ZXIoXG4gICAgICAoZW50cnk6IFdhbGtFbnRyeSk6IGJvb2xlYW4gPT4gZW50cnkuaXNEaXJlY3RvcnksXG4gICAgKTtcbiAgfVxuICBpZiAoIWluY2x1ZGVEaXJzKSB7XG4gICAgY3VycmVudE1hdGNoZXMgPSBjdXJyZW50TWF0Y2hlcy5maWx0ZXIoXG4gICAgICAoZW50cnk6IFdhbGtFbnRyeSk6IGJvb2xlYW4gPT4gIWVudHJ5LmlzRGlyZWN0b3J5LFxuICAgICk7XG4gIH1cbiAgeWllbGQqIGN1cnJlbnRNYXRjaGVzO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHZlcnNpb24gb2YgYGV4cGFuZEdsb2IoKWAuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleHBhbmRHbG9iU3luYyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL2V4cGFuZF9nbG9iLnRzXCI7XG4gKiBmb3IgKGNvbnN0IGZpbGUgb2YgZXhwYW5kR2xvYlN5bmMoXCIqKlxcLyoudHNcIikpIHtcbiAqICAgY29uc29sZS5sb2coZmlsZSk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uKiBleHBhbmRHbG9iU3luYyhcbiAgZ2xvYjogc3RyaW5nIHwgVVJMLFxuICB7XG4gICAgcm9vdCA9IERlbm8uY3dkKCksXG4gICAgZXhjbHVkZSA9IFtdLFxuICAgIGluY2x1ZGVEaXJzID0gdHJ1ZSxcbiAgICBleHRlbmRlZCA9IHRydWUsXG4gICAgZ2xvYnN0YXIgPSBmYWxzZSxcbiAgICBjYXNlSW5zZW5zaXRpdmUsXG4gIH06IEV4cGFuZEdsb2JPcHRpb25zID0ge30sXG4pOiBJdGVyYWJsZUl0ZXJhdG9yPFdhbGtFbnRyeT4ge1xuICBjb25zdCBnbG9iT3B0aW9uczogR2xvYk9wdGlvbnMgPSB7IGV4dGVuZGVkLCBnbG9ic3RhciwgY2FzZUluc2Vuc2l0aXZlIH07XG4gIGNvbnN0IGFic1Jvb3QgPSByZXNvbHZlKHJvb3QpO1xuICBjb25zdCByZXNvbHZlRnJvbVJvb3QgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHJlc29sdmUoYWJzUm9vdCwgcGF0aCk7XG4gIGNvbnN0IGV4Y2x1ZGVQYXR0ZXJucyA9IGV4Y2x1ZGVcbiAgICAubWFwKHJlc29sdmVGcm9tUm9vdClcbiAgICAubWFwKChzOiBzdHJpbmcpOiBSZWdFeHAgPT4gZ2xvYlRvUmVnRXhwKHMsIGdsb2JPcHRpb25zKSk7XG4gIGNvbnN0IHNob3VsZEluY2x1ZGUgPSAocGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PlxuICAgICFleGNsdWRlUGF0dGVybnMuc29tZSgocDogUmVnRXhwKTogYm9vbGVhbiA9PiAhIXBhdGgubWF0Y2gocCkpO1xuICBjb25zdCB7XG4gICAgc2VnbWVudHMsXG4gICAgaXNBYnNvbHV0ZTogaXNHbG9iQWJzb2x1dGUsXG4gICAgaGFzVHJhaWxpbmdTZXAsXG4gICAgd2luUm9vdCxcbiAgfSA9IHNwbGl0KHRvUGF0aFN0cmluZyhnbG9iKSk7XG5cbiAgbGV0IGZpeGVkUm9vdCA9IGlzR2xvYkFic29sdXRlXG4gICAgPyB3aW5Sb290ICE9IHVuZGVmaW5lZCA/IHdpblJvb3QgOiBcIi9cIlxuICAgIDogYWJzUm9vdDtcbiAgd2hpbGUgKHNlZ21lbnRzLmxlbmd0aCA+IDAgJiYgIWlzR2xvYihzZWdtZW50c1swXSkpIHtcbiAgICBjb25zdCBzZWcgPSBzZWdtZW50cy5zaGlmdCgpO1xuICAgIGFzc2VydChzZWcgIT0gbnVsbCk7XG4gICAgZml4ZWRSb290ID0gam9pbkdsb2JzKFtmaXhlZFJvb3QsIHNlZ10sIGdsb2JPcHRpb25zKTtcbiAgfVxuXG4gIGxldCBmaXhlZFJvb3RJbmZvOiBXYWxrRW50cnk7XG4gIHRyeSB7XG4gICAgZml4ZWRSb290SW5mbyA9IGNyZWF0ZVdhbGtFbnRyeVN5bmMoZml4ZWRSb290KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcik7XG4gIH1cblxuICBmdW5jdGlvbiogYWR2YW5jZU1hdGNoKFxuICAgIHdhbGtJbmZvOiBXYWxrRW50cnksXG4gICAgZ2xvYlNlZ21lbnQ6IHN0cmluZyxcbiAgKTogSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgICBpZiAoIXdhbGtJbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChnbG9iU2VnbWVudCA9PSBcIi4uXCIpIHtcbiAgICAgIGNvbnN0IHBhcmVudFBhdGggPSBqb2luR2xvYnMoW3dhbGtJbmZvLnBhdGgsIFwiLi5cIl0sIGdsb2JPcHRpb25zKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzaG91bGRJbmNsdWRlKHBhcmVudFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHlpZWxkIGNyZWF0ZVdhbGtFbnRyeVN5bmMocGFyZW50UGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHRocm93VW5sZXNzTm90Rm91bmQoZXJyb3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZ2xvYlNlZ21lbnQgPT0gXCIqKlwiKSB7XG4gICAgICByZXR1cm4geWllbGQqIHdhbGtTeW5jKHdhbGtJbmZvLnBhdGgsIHtcbiAgICAgICAgc2tpcDogZXhjbHVkZVBhdHRlcm5zLFxuICAgICAgICBtYXhEZXB0aDogZ2xvYnN0YXIgPyBJbmZpbml0eSA6IDEsXG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgZ2xvYlBhdHRlcm4gPSBnbG9iVG9SZWdFeHAoZ2xvYlNlZ21lbnQsIGdsb2JPcHRpb25zKTtcbiAgICBmb3IgKFxuICAgICAgY29uc3Qgd2Fsa0VudHJ5IG9mIHdhbGtTeW5jKHdhbGtJbmZvLnBhdGgsIHtcbiAgICAgICAgbWF4RGVwdGg6IDEsXG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgIH0pXG4gICAgKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHdhbGtFbnRyeS5wYXRoICE9IHdhbGtJbmZvLnBhdGggJiZcbiAgICAgICAgd2Fsa0VudHJ5Lm5hbWUubWF0Y2goZ2xvYlBhdHRlcm4pXG4gICAgICApIHtcbiAgICAgICAgeWllbGQgd2Fsa0VudHJ5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBjdXJyZW50TWF0Y2hlczogV2Fsa0VudHJ5W10gPSBbZml4ZWRSb290SW5mb107XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgIC8vIEFkdmFuY2luZyB0aGUgbGlzdCBvZiBjdXJyZW50IG1hdGNoZXMgbWF5IGludHJvZHVjZSBkdXBsaWNhdGVzLCBzbyB3ZVxuICAgIC8vIHBhc3MgZXZlcnl0aGluZyB0aHJvdWdoIHRoaXMgTWFwLlxuICAgIGNvbnN0IG5leHRNYXRjaE1hcDogTWFwPHN0cmluZywgV2Fsa0VudHJ5PiA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGN1cnJlbnRNYXRjaCBvZiBjdXJyZW50TWF0Y2hlcykge1xuICAgICAgZm9yIChjb25zdCBuZXh0TWF0Y2ggb2YgYWR2YW5jZU1hdGNoKGN1cnJlbnRNYXRjaCwgc2VnbWVudCkpIHtcbiAgICAgICAgbmV4dE1hdGNoTWFwLnNldChuZXh0TWF0Y2gucGF0aCwgbmV4dE1hdGNoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY3VycmVudE1hdGNoZXMgPSBbLi4ubmV4dE1hdGNoTWFwLnZhbHVlcygpXS5zb3J0KGNvbXBhcmVQYXRoKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NlcCkge1xuICAgIGN1cnJlbnRNYXRjaGVzID0gY3VycmVudE1hdGNoZXMuZmlsdGVyKFxuICAgICAgKGVudHJ5OiBXYWxrRW50cnkpOiBib29sZWFuID0+IGVudHJ5LmlzRGlyZWN0b3J5LFxuICAgICk7XG4gIH1cbiAgaWYgKCFpbmNsdWRlRGlycykge1xuICAgIGN1cnJlbnRNYXRjaGVzID0gY3VycmVudE1hdGNoZXMuZmlsdGVyKFxuICAgICAgKGVudHJ5OiBXYWxrRW50cnkpOiBib29sZWFuID0+ICFlbnRyeS5pc0RpcmVjdG9yeSxcbiAgICApO1xuICB9XG4gIHlpZWxkKiBjdXJyZW50TWF0Y2hlcztcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FFRSxZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixTQUFTLEVBQ1QsT0FBTyxFQUNQLFdBQVcsUUFDTixpQkFBaUI7QUFDeEIsU0FBUyxJQUFJLEVBQUUsUUFBUSxRQUFRLFlBQVk7QUFDM0MsU0FBUyxNQUFNLFFBQVEsc0JBQXNCO0FBQzdDLFNBQVMsU0FBUyxRQUFRLGlCQUFpQjtBQUMzQyxTQUNFLGVBQWUsRUFDZixtQkFBbUIsRUFDbkIsWUFBWSxRQUVQLGFBQWE7QUFnQnBCLFNBQVMsTUFBTSxJQUFZLEVBQWE7SUFDdEMsTUFBTSxJQUFJLFlBQVksTUFBTTtJQUM1QixNQUFNLFdBQVcsS0FDZCxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVB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