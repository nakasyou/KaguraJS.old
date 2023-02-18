import * as esbuild from "https://deno.land/x/esbuild@v0.11.23/mod.js";
import { serve } from "https://deno.land/std@0.141.0/http/mod.ts";
import { serveDir } from "https://deno.land/std@0.141.0/http/file_server.ts";
console.log(esbuild.version);
const options={
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
    },
    sourcemap:true,
    watch:(()=>Deno.args.includes("--watch"))(),
}
if(Deno.args.includes("--serve")){
  serve((req) => serveDir(req));
}
// esm build
const ctx=await esbuild.build(options);