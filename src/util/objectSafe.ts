export default function(input:Record<string,any>,sample:Record<string,any>):Record<string,any>{
  Object.keys(input).forEach(key=>{
    sample[key]=input[key];
  });
  return sample;
}
