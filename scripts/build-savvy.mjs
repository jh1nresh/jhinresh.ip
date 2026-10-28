/** Synthetic place-memory station: link card → review → Map Stamp. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as anatomy from './vendor/anatomy-kit.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const projection={origin:[225,165],scale:Math.sqrt(1.5/1.6),azimuth:45,elevation:Math.atan(1/Math.sqrt(2))*180/Math.PI};
function rounded(x,y,z,w,d,h,r,c){const q=anatomy.slabOf({x,y,w,d,r},z,h,projection,5,.5);return `<path d="${q.fill}" fill="${c.l}"/>`+q.shades.map((p,i)=>`<path d="${p}" fill="${i<2?c.m:c.d}"/>`).join('')+`<path d="${q.top}" fill="${c.l}"/><path d="${q.outline}${q.crease}" fill="none" stroke="#263d34" stroke-width=".8" stroke-linejoin="round"/><path d="${q.bevel}" fill="none" stroke="${c.l}" stroke-width=".5"/>`;}
const ctx=vm.createContext({rounded,result:null});
vm.runInContext(readFileSync(`${root}scripts/vendor/colorfigures-drawing.js`,'utf8')+`
OX=225;OY=165;setLight(110);
const paper={l:'#fff9e9',m:'#e6dbc5',d:'#c3b69c'},coral={l:'#ec8666',m:'#d2694f',d:'#a84b39'},green={l:'#739d7e',m:'#427657',d:'#24533d'},metal={l:'#c5d0bf',m:'#9eae93',d:'#6e8467'},inkMat={l:'#5d6c60',m:'#46584b',d:'#2b4033'};
const parts=[];
const b=(name,x,y,z,w,d,h,c)=>{parts.push({name,x,y,z,w,d,h});return box(x,y,z,x+w,y+d,z+h,c,toneI,.7);};
const slab=(name,x,y,z,w,d,h,r,c)=>{parts.push({name,x,y,z,w,d,h});return rounded(x,y,z,w,d,h,r,c);};
const round=(name,x,y,z0,z1,r,c)=>{parts.push({name,x:x-r,y:y-r,z:z0,w:2*r,d:2*r,h:z1-z0,shape:'cylinder'});return cyl(x,y,z0,z1,r,c,toneI,.7,24);};
const patch=(plane,points,color)=>shape(on(plane,points),color,0);
let s=castShadow([[0,0,3],[330,0,3],[330,140,3],[0,140,3]]).replace('#41538f','#dce2d4');
for(const [x,y] of [[9,8],[307,8],[9,118],[307,118]])s+=b('platform foot',x,y,0,12,12,4,inkMat);
s+=slab('platform',0,0,4,330,140,6,6,paper);
// The card rests on a continuous bed between two guide lips and two stops.
s+=slab('card bed',20,70,10,150,38,9,2,metal);
for(const y of [70,105])s+=b('card guide',20,y,19,150,3,4,green);
for(const x of [20,166])s+=b('card stop',x,70,19,4,38,6,coral);
for(const [x,y] of [[22,72],[22,104],[168,72],[168,104],[32,72],[32,106],[158,72],[158,106]])s+=b('rail fastener',x,y,(x===22||x===168?25:23),1,1,.4,inkMat);
// A mounted review screen; its foot, stem, bracket and case meet flush.
s+=slab('review foot',132,43,10,34,24,3,2,green);
s+=b('review stem',146,50,13,6,8,25,metal);
s+=b('review bracket',139,49,38,20,8,5,green);
s+=slab('review screen',112,43,43,64,12,48,3,coral);
s+=patch(PY(55.2),rectUV(117,49,171,85),'#fff9e9');
s+=txY(144,55.4,76,'Savvy',9,'#24533d',700).replace('font-family="ui-monospace,Menlo,monospace"','font-family="Georgia,serif" font-style="italic"');
s+=txY(144,55.4,65,'CHECK THE PLACE',4,'#53644d',500);
s+='<g id="savvy-confirmed" opacity="0">'+txY(144,55.5,55,'REVIEWED',4,'#24533d',700)+'</g>';
for(const [x,z] of [[115,47],[173,47],[115,88],[173,88]])s+=b('case fastener',x,55,z,.8,.3,.8,inkMat);
// Three small controls on a mounted base, beside the review screen.
s+=slab('control base',180,39,10,17,58,4,2,metal);
for(let i=0;i<3;i++){s+=b('control socket',183,44+i*16,14,11,11,2,inkMat);s+=slab('control key',184,45+i*16,16,9,9,1,1,[coral,paper,green][i]);}
// A paper map on four small supports; all coordinates are illustrative.
for(const [x,y] of [[210,25],[306,25],[210,110],[306,110]])s+=b('map foot',x,y,10,7,7,3,metal);
s+=slab('map board',205,20,13,115,105,5,3,coral);
s+=slab('map paper',209,24,18,107,97,.7,2,paper);
for(const points of [[[218,38,18.8],[245,59,18.8],[300,96,18.8]],[[225,107,18.8],[255,83,18.8],[299,40,18.8]]])s+=line(points,1.5).replace('<path','<path data-free=""').replace('#231e16','#739d7e');
for(const [x,y] of [[230,49],[288,95],[298,55]])s+=patch(PZ(18.9),ellUV(x,y,2.8,2.8,12),'#d2694f');
s+='<g id="savvy-pin" opacity="0" transform="translate(0 -15)">';
s+=round('Map Stamp foot',255,83,18.7,20,8,green);
s+=round('map pin stem',255,83,20,32,2,metal);
s+=round('map pin head',255,83,32,36,5,coral);
s+='</g>';
// All three sheets move as one retained card assembly on the bed.
s+='<g id="savvy-card">';
for(let i=0;i<3;i++)s+=slab('source card',30,77,19+i*.45,32,21,.45,1,paper);
for(let i=0;i<3;i++)s+=patch(PZ(20.4),rectUV(35,81+i*4,57-i*3,82+i*4),'#8c9c85');
s+='</g>';
for(const [x,label,w] of [[26,'LINK',40],[128,'REVIEW',47],[245,'MAP STAMP',62]]){s+=b('station plate',x,140,5,w,1,4,paper);s+=txY(x+w/2,141.1,6,label,3,'#53644d',500);}
result={svg:s,parts};
`,ctx);
const parts=ctx.result.parts;
assert(parts.length>=40&&parts.length<=80);
assert(parts.find(p=>p.name==='card bed').z+parts.find(p=>p.name==='card bed').h===19);
assert(parts.filter(p=>p.name==='source card')[0].z===19);
assert(30+90+32<=166,'card stops before the fixed end stop');
assert(parts.find(p=>p.name==='review stem').z+25===38);
assert(parts.find(p=>p.name==='review bracket').z+5===43);
assert(parts.filter(p=>p.name==='map foot').every(p=>p.z+p.h===13));
const licenses=['COLORFIGURES-LICENSE','ANATOMY-LICENSE'].map(f=>readFileSync(`${root}scripts/vendor/${f}`,'utf8')).join('\n');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 110 445 300" id="savvy-workflow" role="img" aria-labelledby="savvy-figure-title savvy-figure-desc"><title id="savvy-figure-title">From a saved link to a Map Stamp</title><desc id="savvy-figure-desc">A synthetic place-memory station. A link card travels to a review screen; a map marker appears after the illustrated review. No real places are shown.</desc><!-- ${licenses} -->${ctx.result.svg.replaceAll('#231e16','#263d34')}</svg>`;
writeFileSync(`${root}assets/figures/savvy-workflow.svg`,svg);
writeFileSync(`${root}assets/figures/savvy-parts.json`,JSON.stringify({projection,cardTravel:90,parts},null,2));
const path=`${root}index.html`;writeFileSync(path,readFileSync(path,'utf8').replace(/<!-- SAVVY:START -->[\s\S]*?<!-- SAVVY:END -->/,'<!-- SAVVY:START -->'+svg+'<!-- SAVVY:END -->'));
console.log(`Savvy: ${parts.length} solids; bed/support/travel assertions PASS; ${svg.length} SVG bytes.`);
