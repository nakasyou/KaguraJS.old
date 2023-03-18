// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import * as deps from "./mod.deps.ts";
import { path } from "./mod.deps.ts";
/** Gets the files found in the provided root dir path based on the glob. */ export async function glob(options) {
    const paths = [];
    const entries = deps.glob.expandGlob(options.pattern, {
        root: options.rootDir,
        extended: true,
        globstar: true,
        exclude: options.excludeDirs
    });
    for await (const entry of entries){
        if (entry.isFile) {
            paths.push(entry.path);
        }
    }
    return paths;
}
export function runNpmCommand({ bin , args , cwd  }) {
    return runCommand({
        cmd: [
            bin,
            ...args
        ],
        cwd
    });
}
export async function runCommand(opts) {
    const cmd = getCmd();
    await Deno.permissions.request({
        name: "run",
        command: cmd[0]
    });
    try {
        const process = Deno.run({
            cmd,
            cwd: opts.cwd,
            stderr: "inherit",
            stdout: "inherit",
            stdin: "inherit"
        });
        try {
            const status = await process.status();
            if (!status.success) {
                throw new Error(`${opts.cmd.join(" ")} failed with exit code ${status.code}`);
            }
        } finally{
            process.close();
        }
    } catch (err) {
        // won't happen on Windows, but that's ok because cmd outputs
        // a message saying that the command doesn't exist
        if (err instanceof Deno.errors.NotFound) {
            throw new Error(`Could not find command '${opts.cmd[0]}'. Ensure it is available on the path.`, {
                cause: err
            });
        } else {
            throw err;
        }
    }
    function getCmd() {
        const cmd = [
            ...opts.cmd
        ];
        if (Deno.build.os === "windows") {
            return [
                "cmd",
                "/c",
                ...opts.cmd
            ];
        } else {
            return cmd;
        }
    }
}
export function standardizePath(fileOrDirPath) {
    if (fileOrDirPath.startsWith("file:")) {
        return path.fromFileUrl(fileOrDirPath);
    }
    return path.resolve(fileOrDirPath);
}
export function valueToUrl(value) {
    const lowerCaseValue = value.toLowerCase();
    if (lowerCaseValue.startsWith("http:") || lowerCaseValue.startsWith("https:") || lowerCaseValue.startsWith("npm:") || lowerCaseValue.startsWith("node:") || lowerCaseValue.startsWith("file:")) {
        return value;
    } else {
        return path.toFileUrl(path.resolve(value)).toString();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9saWIvdXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0ICogYXMgZGVwcyBmcm9tIFwiLi9tb2QuZGVwcy50c1wiO1xuaW1wb3J0IHsgcGF0aCB9IGZyb20gXCIuL21vZC5kZXBzLnRzXCI7XG5cbi8qKiBHZXRzIHRoZSBmaWxlcyBmb3VuZCBpbiB0aGUgcHJvdmlkZWQgcm9vdCBkaXIgcGF0aCBiYXNlZCBvbiB0aGUgZ2xvYi4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnbG9iKG9wdGlvbnM6IHtcbiAgcGF0dGVybjogc3RyaW5nO1xuICByb290RGlyOiBzdHJpbmc7XG4gIGV4Y2x1ZGVEaXJzOiBzdHJpbmdbXTtcbn0pIHtcbiAgY29uc3QgcGF0aHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGVudHJpZXMgPSBkZXBzLmdsb2IuZXhwYW5kR2xvYihvcHRpb25zLnBhdHRlcm4sIHtcbiAgICByb290OiBvcHRpb25zLnJvb3REaXIsXG4gICAgZXh0ZW5kZWQ6IHRydWUsXG4gICAgZ2xvYnN0YXI6IHRydWUsXG4gICAgZXhjbHVkZTogb3B0aW9ucy5leGNsdWRlRGlycyxcbiAgfSk7XG4gIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgIGlmIChlbnRyeS5pc0ZpbGUpIHtcbiAgICAgIHBhdGhzLnB1c2goZW50cnkucGF0aCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYXRocztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bk5wbUNvbW1hbmQoeyBiaW4sIGFyZ3MsIGN3ZCB9OiB7XG4gIGJpbjogc3RyaW5nO1xuICBhcmdzOiBzdHJpbmdbXTtcbiAgY3dkOiBzdHJpbmc7XG59KSB7XG4gIHJldHVybiBydW5Db21tYW5kKHtcbiAgICBjbWQ6IFtiaW4sIC4uLmFyZ3NdLFxuICAgIGN3ZCxcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Db21tYW5kKG9wdHM6IHtcbiAgY21kOiBzdHJpbmdbXTtcbiAgY3dkOiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IGNtZCA9IGdldENtZCgpO1xuICBhd2FpdCBEZW5vLnBlcm1pc3Npb25zLnJlcXVlc3QoeyBuYW1lOiBcInJ1blwiLCBjb21tYW5kOiBjbWRbMF0gfSk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9jZXNzID0gRGVuby5ydW4oe1xuICAgICAgY21kLFxuICAgICAgY3dkOiBvcHRzLmN3ZCxcbiAgICAgIHN0ZGVycjogXCJpbmhlcml0XCIsXG4gICAgICBzdGRvdXQ6IFwiaW5oZXJpdFwiLFxuICAgICAgc3RkaW46IFwiaW5oZXJpdFwiLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHByb2Nlc3Muc3RhdHVzKCk7XG4gICAgICBpZiAoIXN0YXR1cy5zdWNjZXNzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgJHtvcHRzLmNtZC5qb2luKFwiIFwiKX0gZmFpbGVkIHdpdGggZXhpdCBjb2RlICR7c3RhdHVzLmNvZGV9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgcHJvY2Vzcy5jbG9zZSgpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gd29uJ3QgaGFwcGVuIG9uIFdpbmRvd3MsIGJ1dCB0aGF0J3Mgb2sgYmVjYXVzZSBjbWQgb3V0cHV0c1xuICAgIC8vIGEgbWVzc2FnZSBzYXlpbmcgdGhhdCB0aGUgY29tbWFuZCBkb2Vzbid0IGV4aXN0XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBDb3VsZCBub3QgZmluZCBjb21tYW5kICcke1xuICAgICAgICAgIG9wdHMuY21kWzBdXG4gICAgICAgIH0nLiBFbnN1cmUgaXQgaXMgYXZhaWxhYmxlIG9uIHRoZSBwYXRoLmAsXG4gICAgICAgIHsgY2F1c2U6IGVyciB9LFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENtZCgpIHtcbiAgICBjb25zdCBjbWQgPSBbLi4ub3B0cy5jbWRdO1xuICAgIGlmIChEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIikge1xuICAgICAgcmV0dXJuIFtcImNtZFwiLCBcIi9jXCIsIC4uLm9wdHMuY21kXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNtZDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkaXplUGF0aChmaWxlT3JEaXJQYXRoOiBzdHJpbmcpIHtcbiAgaWYgKGZpbGVPckRpclBhdGguc3RhcnRzV2l0aChcImZpbGU6XCIpKSB7XG4gICAgcmV0dXJuIHBhdGguZnJvbUZpbGVVcmwoZmlsZU9yRGlyUGF0aCk7XG4gIH1cbiAgcmV0dXJuIHBhdGgucmVzb2x2ZShmaWxlT3JEaXJQYXRoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlVG9VcmwodmFsdWU6IHN0cmluZykge1xuICBjb25zdCBsb3dlckNhc2VWYWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChcbiAgICBsb3dlckNhc2VWYWx1ZS5zdGFydHNXaXRoKFwiaHR0cDpcIikgfHxcbiAgICBsb3dlckNhc2VWYWx1ZS5zdGFydHNXaXRoKFwiaHR0cHM6XCIpIHx8XG4gICAgbG93ZXJDYXNlVmFsdWUuc3RhcnRzV2l0aChcIm5wbTpcIikgfHxcbiAgICBsb3dlckNhc2VWYWx1ZS5zdGFydHNXaXRoKFwibm9kZTpcIikgfHxcbiAgICBsb3dlckNhc2VWYWx1ZS5zdGFydHNXaXRoKFwiZmlsZTpcIilcbiAgKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXRoLnRvRmlsZVVybChwYXRoLnJlc29sdmUodmFsdWUpKS50b1N0cmluZygpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFlBQVksVUFBVSxnQkFBZ0I7QUFDdEMsU0FBUyxJQUFJLFFBQVEsZ0JBQWdCO0FBRXJDLDBFQUEwRSxHQUMxRSxPQUFPLGVBQWUsS0FBSyxPQUkxQixFQUFFO0lBQ0QsTUFBTSxRQUFrQixFQUFFO0lBQzFCLE1BQU0sVUFBVSxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxPQUFPLEVBQUU7UUFDcEQsTUFBTSxRQUFRLE9BQU87UUFDckIsVUFBVSxJQUFJO1FBQ2QsVUFBVSxJQUFJO1FBQ2QsU0FBUyxRQUFRLFdBQVc7SUFDOUI7SUFDQSxXQUFXLE1BQU0sU0FBUyxRQUFTO1FBQ2pDLElBQUksTUFBTSxNQUFNLEVBQUU7WUFDaEIsTUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJO1FBQ3ZCLENBQUM7SUFDSDtJQUNBLE9BQU87QUFDVCxDQUFDO0FBRUQsT0FBTyxTQUFTLGNBQWMsRUFBRSxJQUFHLEVBQUUsS0FBSSxFQUFFLElBQUcsRUFJN0MsRUFBRTtJQUNELE9BQU8sV0FBVztRQUNoQixLQUFLO1lBQUM7ZUFBUTtTQUFLO1FBQ25CO0lBQ0Y7QUFDRixDQUFDO0FBRUQsT0FBTyxlQUFlLFdBQVcsSUFHaEMsRUFBRTtJQUNELE1BQU0sTUFBTTtJQUNaLE1BQU0sS0FBSyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQUUsTUFBTTtRQUFPLFNBQVMsR0FBRyxDQUFDLEVBQUU7SUFBQztJQUU5RCxJQUFJO1FBQ0YsTUFBTSxVQUFVLEtBQUssR0FBRyxDQUFDO1lBQ3ZCO1lBQ0EsS0FBSyxLQUFLLEdBQUc7WUFDYixRQUFRO1lBQ1IsUUFBUTtZQUNSLE9BQU87UUFDVDtRQUVBLElBQUk7WUFDRixNQUFNLFNBQVMsTUFBTSxRQUFRLE1BQU07WUFDbkMsSUFBSSxDQUFDLE9BQU8sT0FBTyxFQUFFO2dCQUNuQixNQUFNLElBQUksTUFDUixDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssdUJBQXVCLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxFQUM1RDtZQUNKLENBQUM7UUFDSCxTQUFVO1lBQ1IsUUFBUSxLQUFLO1FBQ2Y7SUFDRixFQUFFLE9BQU8sS0FBSztRQUNaLDZEQUE2RDtRQUM3RCxrREFBa0Q7UUFDbEQsSUFBSSxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxNQUFNLElBQUksTUFDUixDQUFDLHdCQUF3QixFQUN2QixLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQ1osc0NBQXNDLENBQUMsRUFDeEM7Z0JBQUUsT0FBTztZQUFJLEdBQ2I7UUFDSixPQUFPO1lBQ0wsTUFBTSxJQUFJO1FBQ1osQ0FBQztJQUNIO0lBRUEsU0FBUyxTQUFTO1FBQ2hCLE1BQU0sTUFBTTtlQUFJLEtBQUssR0FBRztTQUFDO1FBQ3pCLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLLFdBQVc7WUFDL0IsT0FBTztnQkFBQztnQkFBTzttQkFBUyxLQUFLLEdBQUc7YUFBQztRQUNuQyxPQUFPO1lBQ0wsT0FBTztRQUNULENBQUM7SUFDSDtBQUNGLENBQUM7QUFFRCxPQUFPLFNBQVMsZ0JBQWdCLGFBQXFCLEVBQUU7SUFDckQsSUFBSSxjQUFjLFVBQVUsQ0FBQyxVQUFVO1FBQ3JDLE9BQU8sS0FBSyxXQUFXLENBQUM7SUFDMUIsQ0FBQztJQUNELE9BQU8sS0FBSyxPQUFPLENBQUM7QUFDdEIsQ0FBQztBQUVELE9BQU8sU0FBUyxXQUFXLEtBQWEsRUFBRTtJQUN4QyxNQUFNLGlCQUFpQixNQUFNLFdBQVc7SUFDeEMsSUFDRSxlQUFlLFVBQVUsQ0FBQyxZQUMxQixlQUFlLFVBQVUsQ0FBQyxhQUMxQixlQUFlLFVBQVUsQ0FBQyxXQUMxQixlQUFlLFVBQVUsQ0FBQyxZQUMxQixlQUFlLFVBQVUsQ0FBQyxVQUMxQjtRQUNBLE9BQU87SUFDVCxPQUFPO1FBQ0wsT0FBTyxLQUFLLFNBQVMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxRQUFRLFFBQVE7SUFDckQsQ0FBQztBQUNILENBQUMifQ==