// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { join } from "../path/mod.ts";
import { toPathString } from "./_util.ts";
/**
 * Ensures that a directory is empty.
 * Deletes directory contents if the directory is not empty.
 * If the directory does not exist, it is created.
 * The directory itself is not deleted.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { emptyDir } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * emptyDir("./foo"); // returns a promise
 * ```
 */ export async function emptyDir(dir) {
    try {
        const items = [];
        for await (const dirEntry of Deno.readDir(dir)){
            items.push(dirEntry);
        }
        while(items.length){
            const item = items.shift();
            if (item && item.name) {
                const filepath = join(toPathString(dir), item.name);
                await Deno.remove(filepath, {
                    recursive: true
                });
            }
        }
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        // if not exist. then create it
        await Deno.mkdir(dir, {
            recursive: true
        });
    }
}
/**
 * Ensures that a directory is empty.
 * Deletes directory contents if the directory is not empty.
 * If the directory does not exist, it is created.
 * The directory itself is not deleted.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { emptyDirSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * emptyDirSync("./foo"); // void
 * ```
 */ export function emptyDirSync(dir) {
    try {
        const items = [
            ...Deno.readDirSync(dir)
        ];
        // If the directory exists, remove all entries inside it.
        while(items.length){
            const item = items.shift();
            if (item && item.name) {
                const filepath = join(toPathString(dir), item.name);
                Deno.removeSync(filepath, {
                    recursive: true
                });
            }
        }
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        // if not exist. then create it
        Deno.mkdirSync(dir, {
            recursive: true
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3MS4wL2ZzL2VtcHR5X2Rpci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCIuLi9wYXRoL21vZC50c1wiO1xuaW1wb3J0IHsgdG9QYXRoU3RyaW5nIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgYSBkaXJlY3RvcnkgaXMgZW1wdHkuXG4gKiBEZWxldGVzIGRpcmVjdG9yeSBjb250ZW50cyBpZiB0aGUgZGlyZWN0b3J5IGlzIG5vdCBlbXB0eS5cbiAqIElmIHRoZSBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXG4gKiBUaGUgZGlyZWN0b3J5IGl0c2VsZiBpcyBub3QgZGVsZXRlZC5cbiAqIFJlcXVpcmVzIHRoZSBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctd3JpdGVgIGZsYWcuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbXB0eURpciB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL21vZC50c1wiO1xuICpcbiAqIGVtcHR5RGlyKFwiLi9mb29cIik7IC8vIHJldHVybnMgYSBwcm9taXNlXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtcHR5RGlyKGRpcjogc3RyaW5nIHwgVVJMKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgaXRlbXMgPSBbXTtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IGRpckVudHJ5IG9mIERlbm8ucmVhZERpcihkaXIpKSB7XG4gICAgICBpdGVtcy5wdXNoKGRpckVudHJ5KTtcbiAgICB9XG5cbiAgICB3aGlsZSAoaXRlbXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBpdGVtID0gaXRlbXMuc2hpZnQoKTtcbiAgICAgIGlmIChpdGVtICYmIGl0ZW0ubmFtZSkge1xuICAgICAgICBjb25zdCBmaWxlcGF0aCA9IGpvaW4odG9QYXRoU3RyaW5nKGRpciksIGl0ZW0ubmFtZSk7XG4gICAgICAgIGF3YWl0IERlbm8ucmVtb3ZlKGZpbGVwYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cblxuICAgIC8vIGlmIG5vdCBleGlzdC4gdGhlbiBjcmVhdGUgaXRcbiAgICBhd2FpdCBEZW5vLm1rZGlyKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgYSBkaXJlY3RvcnkgaXMgZW1wdHkuXG4gKiBEZWxldGVzIGRpcmVjdG9yeSBjb250ZW50cyBpZiB0aGUgZGlyZWN0b3J5IGlzIG5vdCBlbXB0eS5cbiAqIElmIHRoZSBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXG4gKiBUaGUgZGlyZWN0b3J5IGl0c2VsZiBpcyBub3QgZGVsZXRlZC5cbiAqIFJlcXVpcmVzIHRoZSBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctd3JpdGVgIGZsYWcuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbXB0eURpclN5bmMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9mcy9tb2QudHNcIjtcbiAqXG4gKiBlbXB0eURpclN5bmMoXCIuL2Zvb1wiKTsgLy8gdm9pZFxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbXB0eURpclN5bmMoZGlyOiBzdHJpbmcgfCBVUkwpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBpdGVtcyA9IFsuLi5EZW5vLnJlYWREaXJTeW5jKGRpcildO1xuXG4gICAgLy8gSWYgdGhlIGRpcmVjdG9yeSBleGlzdHMsIHJlbW92ZSBhbGwgZW50cmllcyBpbnNpZGUgaXQuXG4gICAgd2hpbGUgKGl0ZW1zLmxlbmd0aCkge1xuICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zLnNoaWZ0KCk7XG4gICAgICBpZiAoaXRlbSAmJiBpdGVtLm5hbWUpIHtcbiAgICAgICAgY29uc3QgZmlsZXBhdGggPSBqb2luKHRvUGF0aFN0cmluZyhkaXIpLCBpdGVtLm5hbWUpO1xuICAgICAgICBEZW5vLnJlbW92ZVN5bmMoZmlsZXBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIC8vIGlmIG5vdCBleGlzdC4gdGhlbiBjcmVhdGUgaXRcbiAgICBEZW5vLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsSUFBSSxRQUFRLGlCQUFpQjtBQUN0QyxTQUFTLFlBQVksUUFBUSxhQUFhO0FBRTFDOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FDRCxPQUFPLGVBQWUsU0FBUyxHQUFpQixFQUFFO0lBQ2hELElBQUk7UUFDRixNQUFNLFFBQVEsRUFBRTtRQUNoQixXQUFXLE1BQU0sWUFBWSxLQUFLLE9BQU8sQ0FBQyxLQUFNO1lBQzlDLE1BQU0sSUFBSSxDQUFDO1FBQ2I7UUFFQSxNQUFPLE1BQU0sTUFBTSxDQUFFO1lBQ25CLE1BQU0sT0FBTyxNQUFNLEtBQUs7WUFDeEIsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUNyQixNQUFNLFdBQVcsS0FBSyxhQUFhLE1BQU0sS0FBSyxJQUFJO2dCQUNsRCxNQUFNLEtBQUssTUFBTSxDQUFDLFVBQVU7b0JBQUUsV0FBVyxJQUFJO2dCQUFDO1lBQ2hELENBQUM7UUFDSDtJQUNGLEVBQUUsT0FBTyxLQUFLO1FBQ1osSUFBSSxDQUFDLENBQUMsZUFBZSxLQUFLLE1BQU0sQ0FBQyxRQUFRLEdBQUc7WUFDMUMsTUFBTSxJQUFJO1FBQ1osQ0FBQztRQUVELCtCQUErQjtRQUMvQixNQUFNLEtBQUssS0FBSyxDQUFDLEtBQUs7WUFBRSxXQUFXLElBQUk7UUFBQztJQUMxQztBQUNGLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7OztDQWFDLEdBQ0QsT0FBTyxTQUFTLGFBQWEsR0FBaUIsRUFBRTtJQUM5QyxJQUFJO1FBQ0YsTUFBTSxRQUFRO2VBQUksS0FBSyxXQUFXLENBQUM7U0FBSztRQUV4Qyx5REFBeUQ7UUFDekQsTUFBTyxNQUFNLE1BQU0sQ0FBRTtZQUNuQixNQUFNLE9BQU8sTUFBTSxLQUFLO1lBQ3hCLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDckIsTUFBTSxXQUFXLEtBQUssYUFBYSxNQUFNLEtBQUssSUFBSTtnQkFDbEQsS0FBSyxVQUFVLENBQUMsVUFBVTtvQkFBRSxXQUFXLElBQUk7Z0JBQUM7WUFDOUMsQ0FBQztRQUNIO0lBQ0YsRUFBRSxPQUFPLEtBQUs7UUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztZQUMxQyxNQUFNLElBQUk7UUFDWixDQUFDO1FBQ0QsK0JBQStCO1FBQy9CLEtBQUssU0FBUyxDQUFDLEtBQUs7WUFBRSxXQUFXLElBQUk7UUFBQztJQUN4QztBQUNGLENBQUMifQ==