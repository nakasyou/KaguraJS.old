const args=Deno.args;
const ver=args[0];
(async()=>{
  const json=await Deno.readTextFile('./package.json');
  const data=JSON.parse(json);
  data.version=ver;
  await Deno.writeTextFile('./package.json',JSON.stringify(data,null,"  "))
})();