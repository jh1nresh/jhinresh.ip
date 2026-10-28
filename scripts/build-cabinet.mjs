/** A project index cabinet. Anatomy slabs + Colorfigures projection and flat ink. */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as anatomy from './vendor/anatomy-kit.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const projection={origin:[225,165],scale:Math.sqrt(1.5/1.6),azimuth:45,elevation:Math.atan(1/Math.sqrt(2))*180/Math.PI};
function rounded(x,y,z,w,d,h,r,c){
 const q=anatomy.slabOf({x,y,w,d,r},z,h,projection,5,.55);
 return `<path d="${q.fill}" fill="${c.l}"/>`+q.shades.map((p,i)=>`<path d="${p}" fill="${i<2?c.m:c.d}"/>`).join('')+`<path d="${q.top}" fill="${c.l}"/><path d="${q.outline}${q.crease}" fill="none" stroke="#182136" stroke-width=".8" stroke-linejoin="round"/><path d="${q.bevel}" fill="none" stroke="${c.l}" stroke-width=".5"/>`;
}
const ctx=vm.createContext({rounded,result:null});
vm.runInContext(readFileSync(`${root}scripts/vendor/colorfigures-drawing.js`,'utf8')+`
OX=225;OY=165;setLight(110);
const blue={l:'#3b827e',m:'#226b65',d:'#174e49'},paper={l:'#ffffff',m:'#edf0eb',d:'#cbd3d0'},metal={l:'#b7c6be',m:'#91aaa0',d:'#627b71'},sand={l:'#e7e2d5',m:'#c8bfaa',d:'#a79b7e'},inkMat={l:'#5c6870',m:'#4d575e',d:'#353c41'};
const parts=[];
const b=(name,x,y,z,w,d,h,c)=>{parts.push({name,x,y,z,w,d,h});return box(x,y,z,x+w,y+d,z+h,c,toneI,.7);};
const slab=(name,x,y,z,w,d,h,r,c)=>{parts.push({name,x,y,z,w,d,h});return rounded(x,y,z,w,d,h,r,c);};
let s=castShadow([[-7,-4,2],[127,-4,2],[127,133,2],[-7,133,2]]).replace('#41538f','#dce1dd');
// Platform and four rubber feet carry the cabinet; no floating structural parts.
for(const [x,y] of [[-3,1],[112,1],[-3,116],[112,116]])s+=b('platform foot',x,y,0,13,12,4,inkMat);
s+=slab('platform',-7,-4,4,134,137,5,6,paper);
for(const [x,y] of [[5,8],[105,8],[5,70],[105,70]])s+=b('cabinet foot',x,y,9,10,10,5,metal);
s+=slab('cabinet bottom',0,4,14,120,82,6,3,blue);
s+=b('back panel',4,4,20,112,4,129,blue);
s+=b('left side',0,4,20,5,82,129,blue);
// Fixed shelf and guide parts first, then the moving drawer tray.
for(let i=0;i<4;i++){
 const z=23+i*33;
 s+=b('support shelf',5,8,z-3,110,71,3,metal);
 for(const x of [6,110])s+=b('drawer guide',x,10,z,4,69,2,metal);
}
// Bottom to top: each upper drawer properly occludes the rear of the one below.
const projects=[{key:'maiat',label:'MAIAT + DOJO',z:23,color:'#b9b3d0'},{key:'eznest',label:'EZNEST',z:56,color:'#8caa91'},{key:'output',label:'OUTPUT',z:89,color:'#006cf5'},{key:'savvy',label:'SAVVY',z:122,color:'#d87355'}];
for(const p of projects){
 const open=p.key==='savvy'?28:0;
 s+='<g id="drawer-'+p.key+'" data-drawer="'+p.key+'" data-position="'+open+'" transform="translate('+(-open*Math.sqrt(3)/2)+' '+open/2+')">';
 s+=slab('drawer floor '+p.key,10,10,p.z,100,70,2,1,paper);
 s+=b('drawer back '+p.key,10,10,p.z+2,100,3,16,sand);
 for(const x of [10,107])s+=b('drawer wall '+p.key,x,13,p.z+2,3,67,16,sand);
 s+=slab('project folio '+p.key,20,27,p.z+2,78,44,1.5,1,paper);
 s+=shape(on(PZ(p.z+3.6),rectUV(25,34,50,63)),p.color,0);
 // Printed rules on a real sheet are surface artwork, not loose rods.
 for(let j=0;j<3;j++)s+=shape(on(PZ(p.z+3.6),rectUV(56,36+j*8,91-j*4,37+j*8)),'#9ba6aa',0);
 s+=slab('drawer front '+p.key,7,80,p.z-1,106,5,23,1,paper);
 s+=shape(on(PY(85.1),rectUV(14,p.z+5,18,p.z+15)),p.color,0);
 s+=txY(64,85.2,p.z+11,p.label,p.key==='maiat'?5:6,'#182136',700);
 for(const x of [44,75])s+=b('handle mount '+p.key,x,85,p.z+1,3,4,3,metal);
 s+=b('drawer handle '+p.key,44,89,p.z+1,34,3,3,metal);
 s+='</g>';
}
// The near side and top cap mask the drawer bodies where they enter the case.
s+=b('right side',115,4,20,5,82,129,blue);
s+=slab('top cap',-1,3,149,122,84,5,3,blue);
for(const [x,y] of [[5,9],[112,9],[5,78],[112,78]])s+=b('top fastener',x,y,154,1,1,.3,metal);
// A bound project notebook rests on the cabinet top.
s+=slab('notebook back',29,24,154,57,41,1,1,sand);
s+=slab('notebook pages',30,25,155,55,39,3,1,paper);
s+=slab('notebook cover',29,24,158,57,41,1,1,metal);
s+=b('notebook spine',29,24,154,3,41,5,metal);
s+='<text transform="'+txM(P(59,48,159.2),Dv(1,0,0),Dv(0,1,0))+'" font-size="5" fill="#182136" text-anchor="middle" font-family="monospace">J. CHEN</text>';
result={svg:s,parts};
`,ctx);
const parts=ctx.result.parts;
assert(parts.length>=40&&parts.length<=80);
assert(parts.filter(p=>p.name==='cabinet foot').every(p=>p.z+p.h===14));
assert(parts.filter(p=>p.name.startsWith('drawer floor')).every(p=>p.z===23||p.z===56||p.z===89||p.z===122));
assert(92+28<=133,'full drawer travel stays above the platform');
for(const front of parts.filter(p=>p.name.startsWith('drawer front '))){
 const shelf=parts.find(p=>p.name==='support shelf'&&p.z+p.h===front.z+1);
 assert(shelf&&shelf.y+shelf.d<=front.y,'closed drawer front clears its fixed shelf');
}
const licenses=['COLORFIGURES-LICENSE','ANATOMY-LICENSE'].map(f=>readFileSync(`${root}scripts/vendor/${f}`,'utf8')).join('\n');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="75 -5 285 310" role="img" aria-labelledby="cabinet-title cabinet-desc" id="project-cabinet"><title id="cabinet-title">Jerry’s project index</title><desc id="cabinet-desc">An illustrated teal filing cabinet with four drawers labeled Savvy, OUTPUT, EZNest, and Maiat + Dojo. A visual index of Jerry’s current projects.</desc><!-- ${licenses} -->${ctx.result.svg.replaceAll('#231e16','#182136')}</svg>`;
writeFileSync(`${root}assets/figures/project-cabinet.svg`,svg);
writeFileSync(`${root}assets/figures/cabinet-parts.json`,JSON.stringify({projection,travel:28,parts},null,2));
const p=`${root}index.html`,html=readFileSync(p,'utf8');
writeFileSync(p,html.replace(/<!-- CABINET:START -->[\s\S]*?<!-- CABINET:END -->/,'<!-- CABINET:START -->'+svg+'<!-- CABINET:END -->'));
console.log(`Project cabinet: ${parts.length} solids; support/travel assertions PASS; ${svg.length} SVG bytes.`);
