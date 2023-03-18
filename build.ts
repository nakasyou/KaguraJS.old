import * as esbuild from "https://deno.land/x/esbuild@v0.17.12/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

const args=Deno.args;

const options={
  plugins: [denoPlugin()],
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/kagura.esm.js",
  bundle: true,
  format: "esm",
};
switch(args[0]){
  case "--watch":{
    const ctx=await esbuild.context(options);
    ctx.watch();
    break;
  }
  case "--npm":{
    await emptyDir("./npm");
    await build({
      entryPoints: ["./src/index.ts"],
      outDir: "./npm",
      shims: {
        deno: true,
      },
      package: {
        name: "your-package",
        version: Deno.args[0],
        description: "Your package.",
        license: "MIT",
        repository: {
          type: "git",
          url: "git+https://github.com/username/repo.git",
        },
        bugs: {
          url: "https://github.com/username/repo/issues",
        },
      },
    });
  }
}