import * as esbuild from "https://deno.land/x/esbuild@v0.11.23/mod.js";
console.log(esbuild.version);

await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile: './build/kagura.js',
    target:'es6',
    platform:"browser",
    format:"esm",
    minify: true,
    banner:{
      js:`/*
* KaguraJS
* Mit license
* https://github.com/nakasyou/KaguraJS
*/`
    }
});
Deno.exit();