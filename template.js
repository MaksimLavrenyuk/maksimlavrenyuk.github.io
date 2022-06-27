"use strict";const e={templateSettings:{argName:"it",encoders:{},selfContained:!1,strip:!0,internalPrefix:"_val",encodersPrefix:"_enc",delimiters:{start:"{{",end:"}}"}},template:a,compile:function(e,t){return a(e,null,t)},setDelimiters:function(t){if(l(t))return;o=u(t),e.templateSettings.delimiters=t}};var t=e;const n={false:"function",true:"string"},r={evaluate:/\{\{([\s\S]+?(\}?)+)\}\}/g,interpolate:/\{\{=([\s\S]+?)\}\}/g,typeInterpolate:/\{\{%([nsb])=([\s\S]+?)\}\}/g,encode:/\{\{([a-z_$]+[\w$]*)?!([\s\S]+?)\}\}/g,use:/\{\{#([\s\S]+?)\}\}/g,useParams:/(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$]+(?:\.[\w$]+|\[[^\]]+\])*|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,define:/\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,defineParams:/^\s*([\w$]+):([\s\S]+)/,conditional:/\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,iterate:/\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g};let o={...r};const s={n:"number",s:"string",b:"boolean"};function c(e,t,n,r){return("string"==typeof n?n:n.toString()).replace(t.define,((e,n,o,s)=>(0===n.indexOf("def.")&&(n=n.substring(4)),n in r||(":"===o?(s.replace(t.defineParams,((e,t,o)=>{r[n]={arg:t,text:o}})),n in r||(r[n]=s)):new Function("def",`def['${n}']=${s}`)(r)),""))).replace(t.use,((n,o)=>{o=o.replace(t.useParams,((e,t,n,o)=>{if(r[n]&&r[n].arg&&o){const e=i((n+":"+o).replace(/'|\\/g,"_"));return r.__exp=r.__exp||{},r.__exp[e]=r[n].text.replace(new RegExp(`(^|[^\\w$])${r[n].arg}([^\\w$])`,"g"),`$1${o}$2`),t+`def.__exp['${e}']`}}));const s=new Function("def","return "+o)(r);return s?c(e,t,s,r):s}))}function i(e){return e.replace(/\\('|\\)/g,"$1").replace(/[\r\t\n]/g," ")}function a(t,r,a){const f=r&&r.delimiters,$=f&&!l(f)?u(f):o;r=r?{...e.templateSettings,...r}:e.templateSettings;let p=0,g=c(r,$,t,a||{});const d={};g=("let out='"+(r.strip?g.trim().replace(/[\t ]+(\r|\n)/g,"\n").replace(/(\r|\n)[\t ]+/g," ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""):g).replace(/'|\\/g,"\\$&").replace($.interpolate,((e,t)=>`'+(${i(t)})+'`)).replace($.typeInterpolate,((e,t,n)=>{p++;const o=r.internalPrefix+p,c=`throw new Error("expected ${s[t]}, got "+ (typeof ${o}))`;return`';const ${o}=(${i(n)});if(typeof ${o}!=="${s[t]}") ${c};out+=${o}+'`})).replace($.encode,((e,t="",n)=>{d[t]=!0,n=i(n);const o=r.selfContained?t:t?"."+t:'[""]';return`'+${r.encodersPrefix}${o}(${n})+'`})).replace($.conditional,((e,t,n)=>n?(n=i(n),t?`';}else if(${n}){out+='`:`';if(${n}){out+='`):t?"';}else{out+='":"';}out+='")).replace($.iterate,((e,t,n,o)=>{if(!t)return"';} } out+='";p++;const s=o?`let ${o}=-1;`:"",c=o?`${o}++;`:"",a=r.internalPrefix+p;return`';const ${a}=${i(t)};if(${a}){${s}for (const ${n} of ${a}){${c}out+='`})).replace($.evaluate,((e,t)=>`';${i(t)}out+='`))+"';return out;").replace(/\n/g,"\\n").replace(/\t/g,"\\t").replace(/\r/g,"\\r").replace(/(\s|;|\}|^|\{)out\+='';/g,"$1").replace(/\+''/g,"");const w=Array.isArray(r.argName)?function(e){return e.reduce(((e,t,n)=>e+(n?",":"")+t),"{")+"}"}(r.argName):r.argName;return 0===Object.keys(d).length?m((()=>new Function(w,g))):(function(e,t){const r=n[e.selfContained];for(const n in t){const t=e.encoders[n];if(!t)throw new Error(`unknown encoder "${n}"`);if(typeof t!==r)throw new Error(`selfContained ${e.selfContained}: encoder type must be "${r}"`)}}(r,d),g=`return function(${w}){${g}};`,m((()=>r.selfContained?new Function(g=function(e,t){let n="";for(const r in t)n+=`const ${e.encodersPrefix}${r}=${e.encoders[r]};`;return n}(r,d)+g)():new Function(r.encodersPrefix,g)(r.encoders))));function m(e){try{return e()}catch(e){throw e}}}function l({start:t,end:n}){const r=e.templateSettings.delimiters;return r.start===t&&r.end===n}function u({start:e,end:t}){e=$(e),t=$(t);const n={};for(const o in r){const s=r[o].toString().replace(/\\\{\\\{/g,e).replace(/\\\}\\\}/g,t);n[o]=g(s)}return n}const f=/([{}[\]()<>\\\/^$\-.+*?!=|&:])/g;function $(e){return e.replace(f,"\\$1")}const p=/^\/(.*)\/([\w]*)$/;function g(e){const[,t,n]=e.match(p);return new RegExp(t,n)}module.exports=t;
//# sourceMappingURL=template.js.map
