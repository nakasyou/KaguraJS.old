import * as esbuild from "https://deno.land/x/esbuild@v0.17.12/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";
const args = Deno.args;
const options = {
    plugins: [
        denoPlugin()
    ],
    entryPoints: [
        "./src/index.ts"
    ],
    outfile: "./dist/kagura.esm.js",
    bundle: true,
    format: "esm"
};
switch(args[0]){
    case "--watch":
        {
            const ctx = await esbuild.context(options);
            ctx.watch();
            break;
        }
    case "--npm":
        {
            await emptyDir("./npm");
            await build({
                entryPoints: [
                    "./src/index.ts"
                ],
                outDir: "./npm",
                shims: {
                    deno: true
                },
                package: {
                    name: "your-package",
                    version: Deno.args[0],
                    description: "Your package.",
                    license: "MIT",
                    repository: {
                        type: "git",
                        url: "git+https://github.com/username/repo.git"
                    },
                    bugs: {
                        url: "https://github.com/username/repo/issues"
                    }
                }
            });
        }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvQ29hcnNlUHJldmFpbGluZ0V4cGVyaW1lbnQvYnVpbGQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZXNidWlsZCBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9lc2J1aWxkQHYwLjE3LjEyL21vZC5qc1wiO1xuaW1wb3J0IHsgZGVub1BsdWdpbiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2VzYnVpbGRfZGVub19sb2FkZXJAMC42LjAvbW9kLnRzXCI7XG5pbXBvcnQgeyBidWlsZCwgZW1wdHlEaXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9kbnQvbW9kLnRzXCI7XG5cbmNvbnN0IGFyZ3M9RGVuby5hcmdzO1xuXG5jb25zdCBvcHRpb25zPXtcbiAgcGx1Z2luczogW2Rlbm9QbHVnaW4oKV0sXG4gIGVudHJ5UG9pbnRzOiBbXCIuL3NyYy9pbmRleC50c1wiXSxcbiAgb3V0ZmlsZTogXCIuL2Rpc3Qva2FndXJhLmVzbS5qc1wiLFxuICBidW5kbGU6IHRydWUsXG4gIGZvcm1hdDogXCJlc21cIixcbn07XG5zd2l0Y2goYXJnc1swXSl7XG4gIGNhc2UgXCItLXdhdGNoXCI6e1xuICAgIGNvbnN0IGN0eD1hd2FpdCBlc2J1aWxkLmNvbnRleHQob3B0aW9ucyk7XG4gICAgY3R4LndhdGNoKCk7XG4gICAgYnJlYWs7XG4gIH1cbiAgY2FzZSBcIi0tbnBtXCI6e1xuICAgIGF3YWl0IGVtcHR5RGlyKFwiLi9ucG1cIik7XG4gICAgYXdhaXQgYnVpbGQoe1xuICAgICAgZW50cnlQb2ludHM6IFtcIi4vc3JjL2luZGV4LnRzXCJdLFxuICAgICAgb3V0RGlyOiBcIi4vbnBtXCIsXG4gICAgICBzaGltczoge1xuICAgICAgICBkZW5vOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHBhY2thZ2U6IHtcbiAgICAgICAgbmFtZTogXCJ5b3VyLXBhY2thZ2VcIixcbiAgICAgICAgdmVyc2lvbjogRGVuby5hcmdzWzBdLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJZb3VyIHBhY2thZ2UuXCIsXG4gICAgICAgIGxpY2Vuc2U6IFwiTUlUXCIsXG4gICAgICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgICAgICB0eXBlOiBcImdpdFwiLFxuICAgICAgICAgIHVybDogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL3VzZXJuYW1lL3JlcG8uZ2l0XCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJ1Z3M6IHtcbiAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9naXRodWIuY29tL3VzZXJuYW1lL3JlcG8vaXNzdWVzXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksYUFBYSw4Q0FBOEM7QUFDdkUsU0FBUyxVQUFVLFFBQVEsdURBQXVEO0FBQ2xGLFNBQVMsS0FBSyxFQUFFLFFBQVEsUUFBUSxpQ0FBaUM7QUFFakUsTUFBTSxPQUFLLEtBQUssSUFBSTtBQUVwQixNQUFNLFVBQVE7SUFDWixTQUFTO1FBQUM7S0FBYTtJQUN2QixhQUFhO1FBQUM7S0FBaUI7SUFDL0IsU0FBUztJQUNULFFBQVEsSUFBSTtJQUNaLFFBQVE7QUFDVjtBQUNBLE9BQU8sSUFBSSxDQUFDLEVBQUU7SUFDWixLQUFLO1FBQVU7WUFDYixNQUFNLE1BQUksTUFBTSxRQUFRLE9BQU8sQ0FBQztZQUNoQyxJQUFJLEtBQUs7WUFDVCxLQUFNO1FBQ1I7SUFDQSxLQUFLO1FBQVE7WUFDWCxNQUFNLFNBQVM7WUFDZixNQUFNLE1BQU07Z0JBQ1YsYUFBYTtvQkFBQztpQkFBaUI7Z0JBQy9CLFFBQVE7Z0JBQ1IsT0FBTztvQkFDTCxNQUFNLElBQUk7Z0JBQ1o7Z0JBQ0EsU0FBUztvQkFDUCxNQUFNO29CQUNOLFNBQVMsS0FBSyxJQUFJLENBQUMsRUFBRTtvQkFDckIsYUFBYTtvQkFDYixTQUFTO29CQUNULFlBQVk7d0JBQ1YsTUFBTTt3QkFDTixLQUFLO29CQUNQO29CQUNBLE1BQU07d0JBQ0osS0FBSztvQkFDUDtnQkFDRjtZQUNGO1FBQ0Y7QUFDRiJ9