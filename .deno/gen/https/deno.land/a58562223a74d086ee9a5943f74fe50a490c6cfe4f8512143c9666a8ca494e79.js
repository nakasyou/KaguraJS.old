// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { join } from "./deps.ts";
export function cacheDir() {
    if (Deno.build.os === "darwin") {
        const home = homeDir();
        if (home) {
            return join(home, "Library/Caches");
        }
    } else if (Deno.build.os === "linux") {
        Deno.permissions.request({
            name: "env",
            variable: "XDG_CACHE_HOME"
        });
        const cacheHome = Deno.env.get("XDG_CACHE_HOME");
        if (cacheHome) {
            return cacheHome;
        } else {
            const home1 = homeDir();
            if (home1) {
                return join(home1, ".cache");
            }
        }
    } else {
        Deno.permissions.request({
            name: "env",
            variable: "LOCALAPPDATA"
        });
        return Deno.env.get("LOCALAPPDATA");
    }
}
export function homeDir() {
    switch(Deno.build.os){
        case "windows":
            Deno.permissions.request({
                name: "env",
                variable: "USERPROFILE"
            });
            return Deno.env.get("USERPROFILE");
        case "linux":
        case "darwin":
            Deno.permissions.request({
                name: "env",
                variable: "HOME"
            });
            return Deno.env.get("HOME");
        default:
            throw Error("unreachable");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS9kaXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWNoZURpcigpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoRGVuby5idWlsZC5vcyA9PT0gXCJkYXJ3aW5cIikge1xuICAgIGNvbnN0IGhvbWUgPSBob21lRGlyKCk7XG4gICAgaWYgKGhvbWUpIHtcbiAgICAgIHJldHVybiBqb2luKGhvbWUsIFwiTGlicmFyeS9DYWNoZXNcIik7XG4gICAgfVxuICB9IGVsc2UgaWYgKERlbm8uYnVpbGQub3MgPT09IFwibGludXhcIikge1xuICAgIERlbm8ucGVybWlzc2lvbnMucmVxdWVzdCh7IG5hbWU6IFwiZW52XCIsIHZhcmlhYmxlOiBcIlhER19DQUNIRV9IT01FXCIgfSk7XG4gICAgY29uc3QgY2FjaGVIb21lID0gRGVuby5lbnYuZ2V0KFwiWERHX0NBQ0hFX0hPTUVcIik7XG4gICAgaWYgKGNhY2hlSG9tZSkge1xuICAgICAgcmV0dXJuIGNhY2hlSG9tZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaG9tZSA9IGhvbWVEaXIoKTtcbiAgICAgIGlmIChob21lKSB7XG4gICAgICAgIHJldHVybiBqb2luKGhvbWUsIFwiLmNhY2hlXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBEZW5vLnBlcm1pc3Npb25zLnJlcXVlc3QoeyBuYW1lOiBcImVudlwiLCB2YXJpYWJsZTogXCJMT0NBTEFQUERBVEFcIiB9KTtcbiAgICByZXR1cm4gRGVuby5lbnYuZ2V0KFwiTE9DQUxBUFBEQVRBXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob21lRGlyKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAoRGVuby5idWlsZC5vcykge1xuICAgIGNhc2UgXCJ3aW5kb3dzXCI6XG4gICAgICBEZW5vLnBlcm1pc3Npb25zLnJlcXVlc3QoeyBuYW1lOiBcImVudlwiLCB2YXJpYWJsZTogXCJVU0VSUFJPRklMRVwiIH0pO1xuICAgICAgcmV0dXJuIERlbm8uZW52LmdldChcIlVTRVJQUk9GSUxFXCIpO1xuICAgIGNhc2UgXCJsaW51eFwiOlxuICAgIGNhc2UgXCJkYXJ3aW5cIjpcbiAgICAgIERlbm8ucGVybWlzc2lvbnMucmVxdWVzdCh7IG5hbWU6IFwiZW52XCIsIHZhcmlhYmxlOiBcIkhPTUVcIiB9KTtcbiAgICAgIHJldHVybiBEZW5vLmVudi5nZXQoXCJIT01FXCIpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBFcnJvcihcInVucmVhY2hhYmxlXCIpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLFlBQVk7QUFFakMsT0FBTyxTQUFTLFdBQStCO0lBQzdDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLLFVBQVU7UUFDOUIsTUFBTSxPQUFPO1FBQ2IsSUFBSSxNQUFNO1lBQ1IsT0FBTyxLQUFLLE1BQU07UUFDcEIsQ0FBQztJQUNILE9BQU8sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUztRQUNwQyxLQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUM7WUFBRSxNQUFNO1lBQU8sVUFBVTtRQUFpQjtRQUNuRSxNQUFNLFlBQVksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQy9CLElBQUksV0FBVztZQUNiLE9BQU87UUFDVCxPQUFPO1lBQ0wsTUFBTSxRQUFPO1lBQ2IsSUFBSSxPQUFNO2dCQUNSLE9BQU8sS0FBSyxPQUFNO1lBQ3BCLENBQUM7UUFDSCxDQUFDO0lBQ0gsT0FBTztRQUNMLEtBQUssV0FBVyxDQUFDLE9BQU8sQ0FBQztZQUFFLE1BQU07WUFBTyxVQUFVO1FBQWU7UUFDakUsT0FBTyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDdEIsQ0FBQztBQUNILENBQUM7QUFFRCxPQUFPLFNBQVMsVUFBOEI7SUFDNUMsT0FBUSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ25CLEtBQUs7WUFDSCxLQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQUUsTUFBTTtnQkFBTyxVQUFVO1lBQWM7WUFDaEUsT0FBTyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDdEIsS0FBSztRQUNMLEtBQUs7WUFDSCxLQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQUUsTUFBTTtnQkFBTyxVQUFVO1lBQU87WUFDekQsT0FBTyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDdEI7WUFDRSxNQUFNLE1BQU0sZUFBZTtJQUMvQjtBQUNGLENBQUMifQ==