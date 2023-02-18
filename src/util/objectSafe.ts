export default function(input:object,sample:object):object{
  Object.keys(input).forEach(key=>{
    sample[key]=input[key];
  });
  return sample;
}