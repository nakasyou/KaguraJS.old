// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { isAbsolute, join, normalize } from "./deps.ts";
import { DiskCache } from "./disk_cache.ts";
import { cacheDir, homeDir } from "./dirs.ts";
import { HttpCache } from "./http_cache.ts";
import { assert } from "./util.ts";
export class DenoDir {
    deps;
    gen;
    root;
    constructor(root, readOnly){
        if (root) {
            if (root instanceof URL) {
                root = root.toString();
            }
            if (!isAbsolute(root)) {
                root = normalize(join(Deno.cwd(), root));
            }
        } else {
            Deno.permissions.request({
                name: "env",
                variable: "DENO_DIR"
            });
            const dd = Deno.env.get("DENO_DIR");
            if (dd) {
                if (!isAbsolute(dd)) {
                    root = normalize(join(Deno.cwd(), dd));
                } else {
                    root = dd;
                }
            } else {
                const cd = cacheDir();
                if (cd) {
                    root = join(cd, "deno");
                } else {
                    const hd = homeDir();
                    if (hd) {
                        root = join(hd, ".deno");
                    }
                }
            }
        }
        assert(root, "Could not set the Deno root directory");
        assert(isAbsolute(root), `The root directory "${root}" is not absolute.`);
        Deno.permissions.request({
            name: "read"
        });
        this.root = root;
        this.deps = new HttpCache(join(root, "deps"), readOnly);
        this.gen = new DiskCache(join(root, "gen"));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS9kZW5vX2Rpci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBpc0Fic29sdXRlLCBqb2luLCBub3JtYWxpemUgfSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5pbXBvcnQgeyBEaXNrQ2FjaGUgfSBmcm9tIFwiLi9kaXNrX2NhY2hlLnRzXCI7XG5pbXBvcnQgeyBjYWNoZURpciwgaG9tZURpciB9IGZyb20gXCIuL2RpcnMudHNcIjtcbmltcG9ydCB7IEh0dHBDYWNoZSB9IGZyb20gXCIuL2h0dHBfY2FjaGUudHNcIjtcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuL3V0aWwudHNcIjtcblxuZXhwb3J0IGNsYXNzIERlbm9EaXIge1xuICBkZXBzOiBIdHRwQ2FjaGU7XG4gIGdlbjogRGlza0NhY2hlO1xuICByb290OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iocm9vdD86IHN0cmluZyB8IFVSTCwgcmVhZE9ubHk/OiBib29sZWFuKSB7XG4gICAgaWYgKHJvb3QpIHtcbiAgICAgIGlmIChyb290IGluc3RhbmNlb2YgVVJMKSB7XG4gICAgICAgIHJvb3QgPSByb290LnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgICBpZiAoIWlzQWJzb2x1dGUocm9vdCkpIHtcbiAgICAgICAgcm9vdCA9IG5vcm1hbGl6ZShqb2luKERlbm8uY3dkKCksIHJvb3QpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgRGVuby5wZXJtaXNzaW9ucy5yZXF1ZXN0KHsgbmFtZTogXCJlbnZcIiwgdmFyaWFibGU6IFwiREVOT19ESVJcIiB9KTtcbiAgICAgIGNvbnN0IGRkID0gRGVuby5lbnYuZ2V0KFwiREVOT19ESVJcIik7XG4gICAgICBpZiAoZGQpIHtcbiAgICAgICAgaWYgKCFpc0Fic29sdXRlKGRkKSkge1xuICAgICAgICAgIHJvb3QgPSBub3JtYWxpemUoam9pbihEZW5vLmN3ZCgpLCBkZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJvb3QgPSBkZDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2QgPSBjYWNoZURpcigpO1xuICAgICAgICBpZiAoY2QpIHtcbiAgICAgICAgICByb290ID0gam9pbihjZCwgXCJkZW5vXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGhkID0gaG9tZURpcigpO1xuICAgICAgICAgIGlmIChoZCkge1xuICAgICAgICAgICAgcm9vdCA9IGpvaW4oaGQsIFwiLmRlbm9cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydChyb290LCBcIkNvdWxkIG5vdCBzZXQgdGhlIERlbm8gcm9vdCBkaXJlY3RvcnlcIik7XG4gICAgYXNzZXJ0KGlzQWJzb2x1dGUocm9vdCksIGBUaGUgcm9vdCBkaXJlY3RvcnkgXCIke3Jvb3R9XCIgaXMgbm90IGFic29sdXRlLmApO1xuICAgIERlbm8ucGVybWlzc2lvbnMucmVxdWVzdCh7IG5hbWU6IFwicmVhZFwiIH0pO1xuICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgdGhpcy5kZXBzID0gbmV3IEh0dHBDYWNoZShqb2luKHJvb3QsIFwiZGVwc1wiKSwgcmVhZE9ubHkpO1xuICAgIHRoaXMuZ2VuID0gbmV3IERpc2tDYWNoZShqb2luKHJvb3QsIFwiZ2VuXCIpKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxRQUFRLFlBQVk7QUFDeEQsU0FBUyxTQUFTLFFBQVEsa0JBQWtCO0FBQzVDLFNBQVMsUUFBUSxFQUFFLE9BQU8sUUFBUSxZQUFZO0FBQzlDLFNBQVMsU0FBUyxRQUFRLGtCQUFrQjtBQUM1QyxTQUFTLE1BQU0sUUFBUSxZQUFZO0FBRW5DLE9BQU8sTUFBTTtJQUNYLEtBQWdCO0lBQ2hCLElBQWU7SUFDZixLQUFhO0lBRWIsWUFBWSxJQUFtQixFQUFFLFFBQWtCLENBQUU7UUFDbkQsSUFBSSxNQUFNO1lBQ1IsSUFBSSxnQkFBZ0IsS0FBSztnQkFDdkIsT0FBTyxLQUFLLFFBQVE7WUFDdEIsQ0FBQztZQUNELElBQUksQ0FBQyxXQUFXLE9BQU87Z0JBQ3JCLE9BQU8sVUFBVSxLQUFLLEtBQUssR0FBRyxJQUFJO1lBQ3BDLENBQUM7UUFDSCxPQUFPO1lBQ0wsS0FBSyxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUFFLE1BQU07Z0JBQU8sVUFBVTtZQUFXO1lBQzdELE1BQU0sS0FBSyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFDeEIsSUFBSSxJQUFJO2dCQUNOLElBQUksQ0FBQyxXQUFXLEtBQUs7b0JBQ25CLE9BQU8sVUFBVSxLQUFLLEtBQUssR0FBRyxJQUFJO2dCQUNwQyxPQUFPO29CQUNMLE9BQU87Z0JBQ1QsQ0FBQztZQUNILE9BQU87Z0JBQ0wsTUFBTSxLQUFLO2dCQUNYLElBQUksSUFBSTtvQkFDTixPQUFPLEtBQUssSUFBSTtnQkFDbEIsT0FBTztvQkFDTCxNQUFNLEtBQUs7b0JBQ1gsSUFBSSxJQUFJO3dCQUNOLE9BQU8sS0FBSyxJQUFJO29CQUNsQixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sTUFBTTtRQUNiLE9BQU8sV0FBVyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztRQUN4RSxLQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUM7WUFBRSxNQUFNO1FBQU87UUFDeEMsSUFBSSxDQUFDLElBQUksR0FBRztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxVQUFVLEtBQUssTUFBTSxTQUFTO1FBQzlDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxVQUFVLEtBQUssTUFBTTtJQUN0QztBQUNGLENBQUMifQ==