import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";
const args = Deno.args;
switch(args[0]){
    case "--watch":
        {
            const option = {
                plugins: [
                    denoPlugin()
                ],
                entryPoints: [
                    "src/index.ts"
                ],
                outfile: "./dist/async.ts",
                bundle: true,
                format: "esm"
            };
        }
    case "--npm":
        {}
}
Deno.exit();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvQ29hcnNlUHJldmFpbGluZ0V4cGVyaW1lbnQvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZXNidWlsZCBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9lc2J1aWxkQHYwLjE3LjEyL21vZC5qc1wiO1xuaW1wb3J0IHsgZGVub1BsdWdpbiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2VzYnVpbGRfZGVub19sb2FkZXJAMC42LjAvbW9kLnRzXCI7XG5cbmNvbnN0IGFyZ3M9RGVuby5hcmdzO1xuXG5zd2l0Y2goYXJnc1swXSl7XG4gIGNhc2UgXCItLXdhdGNoXCI6e1xuICAgIGNvbnN0IG9wdGlvbj17XG4gICAgICBwbHVnaW5zOiBbZGVub1BsdWdpbigpXSxcbiAgICAgIGVudHJ5UG9pbnRzOiBbXCJzcmMvaW5kZXgudHNcIl0sXG4gICAgICBvdXRmaWxlOiBcIi4vZGlzdC9hc3luYy50c1wiLFxuICAgICAgYnVuZGxlOiB0cnVlLFxuICAgICAgZm9ybWF0OiBcImVzbVwiLFxuICAgIH1cbiAgICBcbiAgfVxuICBjYXNlIFwiLS1ucG1cIjp7XG4gICAgICAgIFxuICB9XG59XG5cbkRlbm8uZXhpdCgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsVUFBVSxRQUFRLHVEQUF1RDtBQUVsRixNQUFNLE9BQUssS0FBSyxJQUFJO0FBRXBCLE9BQU8sSUFBSSxDQUFDLEVBQUU7SUFDWixLQUFLO1FBQVU7WUFDYixNQUFNLFNBQU87Z0JBQ1gsU0FBUztvQkFBQztpQkFBYTtnQkFDdkIsYUFBYTtvQkFBQztpQkFBZTtnQkFDN0IsU0FBUztnQkFDVCxRQUFRLElBQUk7Z0JBQ1osUUFBUTtZQUNWO1FBRUY7SUFDQSxLQUFLO1FBQVEsQ0FFYjtBQUNGO0FBRUEsS0FBSyxJQUFJIn0=