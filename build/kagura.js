/*
* KaguraJS
* Mit license
* https://github.com/nakasyou/KaguraJS
*/
var u=(r,e,t)=>new Promise((x,f)=>{var d=o=>{try{a(t.next(o))}catch(c){f(c)}},m=o=>{try{a(t.throw(o))}catch(c){f(c)}},a=o=>o.done?x(o.value):Promise.resolve(o.value).then(d,m);a((t=t.apply(r,e)).next())});var i=class{constructor(){this.init()}init(){}update(){}exit(){}},l=i;function n(r,e){return Object.keys(r).forEach(t=>{e[t]=r[t]}),e}var s=class{constructor(e){e=n(e,{element:document.createElement("canvas")}),this.options=e}run(){return u(this,null,function*(){})}},p=s;export{p as App,l as Scene};
//# sourceMappingURL=kagura.js.map
