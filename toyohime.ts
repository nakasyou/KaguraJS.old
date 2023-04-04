import { Toyohime } from "https://deno.land/x/estoyohime@v0.1.2/mod.ts";

export default new Toyohime({
  src: "./src/index.ts",
  esmDist: "./dist/esm.js",
  minEsmDist: "./dist/esm.min.js",
  readmeText: await Deno.readTextFile("./README.md"),
  readmePath: "README.md",
  licenseText: await Deno.readTextFile("./LICENSE"),
  npmDist: "./npm",
  npm: {
    name: "kagurajs",
    version: "v0.1.0",
    description: await Deno.readTextFile("./README.md"),
  },
  plugins: [],
  importmapPath: "./import_map.json",
  tsconfigPath: "./tsconfig.json",
  globalName: "kagura",
});
