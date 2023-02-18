import * as util from "../util/index.ts";

export default class App{
  constructor(options:(object|null)){
    options=util.objectSafe(options,{
      element:document.createElement("canvas")
    });
    this.options=options;
  }
  async run(): Promise<null>{
    
  }
}