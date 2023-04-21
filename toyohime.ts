import { Toyohime } from "https://deno.land/x/estoyohime@v0.3.0/mod.ts"

const deps = [
  ["test","v0.1.0","https://test.com","MIT license"]
]
let footer = "";
for(const dep of deps){
  footer+=`/*
 * ${dep[0]} ${dep[1]}
 * ${dep[2]}
 * ${dep[3]}
 */
`
}
export const toyohime = new Toyohime({
  src: "./src/index.ts",
  readmeText: await Deno.readTextFile("./README.md"),
  readmePath: "README.md",
  licenseText: await Deno.readTextFile("./LICENSE"),
  npmDist: "./npm",
  npm: {
    name: "kagurajs",
    version: "v0.1.0",
    description: await Deno.readTextFile("./README.md"),
  },
  importmapPath: new URL("./import_map.json",import.meta.url),
  tsconfigPath: "./tsconfig.json",
  globalName: "kagura",
  banner: {
    js: `/* 
 * KaguraJS
 * MIT Licensed
 * Copyright (c) 2023 nakasyou.
 * https://github.com/nakasyou/KaguraJS
 */`,
  },
  footer: {
    js: footer,
  }
})

await toyohime.connect({})
