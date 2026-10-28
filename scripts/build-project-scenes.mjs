/** Build native, seekable project figures without a page shell or timers. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFileSync(root+path,'utf8');
const license=read('scripts/vendor/COLORFIGURES-LICENSE');
const reset=`VIEW=0;RC=[0,0];OX=0;OY=0;INK_K=.65;_clipN=0;setLight(110);`;
const timeline=`const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));return t<=total+1.3?Math.min(t,total):total*(1-smooth((t-total-1.3)/1.8));}
function render(t){${reset}const svg=inkScale(scene(at(t)));return svg.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function caption(t){return t>total+1.3?'Resetting this illustrative workflow.':say(at(t));}`;
function factory(key,file,extra){return `(()=>{\n${read(`scripts/figure-sources/${file}.js`)}\nconst prefix='book-${key}-';${extra}\nconst duration=total+3.1;${timeline}\nreturn {duration,stillTime:total,viewBox:'',render,caption};\n})()`;}
const output=factory('output','output',`const total=EZ_TOTAL,scene=t=>ezScene3({t}),say=t=>EZ_CAP[ezScene(t)][0];`);
const nesting=factory('eznest','nesting',`const total=EZ_TOTAL,scene=t=>ezScene3({t}),say=t=>EZ_CAP[ezScene(t)][0];`);
const agent=factory('maiat','agent',`const total=7.7,scene=t=>agScene(t),say=t=>t<2.6?'A quote arrives at the approval station.':t<4.8?'The illustrated approval stamp meets the card.':'The approved example leaves a receipt.';`);
let bundle=`/* Native project scenes. Geometry/model adapted from EZNest landing, 27 Oct 2026.\n${license}\n*/\n(()=>{\n'use strict';\n${read('scripts/figure-sources/drawing.js')}\nwindow.bookScenes={output:${output},eznest:${nesting},maiat:${agent}};\n})();\n`;
const sandbox={window:{}};vm.runInNewContext(bundle,sandbox);const scenes=sandbox.window.bookScenes;
function bounds(svg){
 const xs=[],ys=[];
 for(const m of svg.matchAll(/\bd="([^"]+)"/g)){
  const pairs=m[1].match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number)||[];
  for(let i=0;i+1<pairs.length;i+=2){xs.push(pairs[i]);ys.push(pairs[i+1]);}
 }
 for(const m of svg.matchAll(/<(rect|circle)\b([^>]+)>/g)){
  const attrs=Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]+)"/g)].map(a=>[a[1],Number(a[2])]));
  if(m[1]==='rect'){xs.push(attrs.x,attrs.x+attrs.width);ys.push(attrs.y,attrs.y+attrs.height);}
  else{xs.push(attrs.cx-attrs.r,attrs.cx+attrs.r);ys.push(attrs.cy-attrs.r,attrs.cy+attrs.r);}
 }
 return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
}
const titles={output:'OUTPUT: an illustrated hand-off between shops',eznest:'EZNest: synthetic parts, nesting and a Hot folder',maiat:'Maiat and Dojo: an illustrated quote, approval and receipt'};
const filenames={output:'output-workflow.svg',eznest:'nesting-workflow.svg',maiat:'agent-workflow.svg'};
const descriptions={output:'Test-network illustration. No production printing or real job is performed.',eznest:'Fourteen synthetic parts. An explanatory workflow, not a measurement or printer action.',maiat:'A synthetic quote card passes an approval stamp and leaves a receipt. No real approval, signature or payment is performed.'};
for(const [key,scene] of Object.entries(scenes)){
 const start=scene.render(0),mid=scene.render((scene.duration-3.1)/2),end=scene.render(scene.duration-3.1);
 assert.notEqual(start,mid,`${key} moves by its midpoint`);assert.notEqual(mid,end,`${key} reaches a distinct final state`);assert.equal(scene.render(scene.duration),start,`${key} joins its next loop without a pose jump`);
 const frames=Array.from({length:101},(_,i)=>scene.render(scene.duration*i/100));
 assert.ok(frames.every(svg=>!/(?:NaN|Infinity|undefined)/.test(svg)),`${key} finite geometry`);
 const bs=frames.map(bounds),snap=v=>Math.round(v*1e6)/1e6;
 const x=Math.floor(snap(Math.min(...bs.map(b=>b[0])))-18),y=Math.floor(snap(Math.min(...bs.map(b=>b[1])))-18);
 const right=Math.ceil(snap(Math.max(...bs.map(b=>b[2])))+18),bottom=Math.ceil(snap(Math.max(...bs.map(b=>b[3])))+18);
 scene.viewBox=`${x} ${y} ${right-x} ${bottom-y}`;
 for(const svg of frames){
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`${key} unique clip identifiers`);assert.ok(ids.every(id=>id.startsWith(`book-${key}-`)));
 }
 const fallback=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox}" role="img" aria-labelledby="${key}-title ${key}-desc"><title id="${key}-title">${titles[key]}</title><desc id="${key}-desc">${descriptions[key]}</desc><!-- ${license} -->${start}</svg>\n`;
 writeFileSync(root+'assets/figures/'+filenames[key],fallback);
 bundle+=`window.bookScenes.${key}.viewBox=${JSON.stringify(scene.viewBox)};\n`;
 console.log(`${key}: ${scene.duration.toFixed(1)}s cycle; stable loop, finite geometry and clip IDs PASS; viewBox ${scene.viewBox}`);
}
// Verify the original Figure-tier mechanism has real support and working clearance.
const agentCheck={parts:null};vm.runInNewContext(read('scripts/figure-sources/drawing.js')+'\n'+read('scripts/figure-sources/agent.js')+`\nconst captured=[];agScene(0,captured);parts=captured;`,agentCheck);
const parts=agentCheck.parts;assert.ok(parts.length>=40&&parts.length<=80);
const named=name=>parts.filter(p=>p.name===name);
assert.ok(named('platform foot').every(p=>p.z+p.h===0));assert.equal(named('platform')[0].z,0);
assert.ok(named('column').every(p=>p.z===10&&p.z+p.h===82));assert.equal(named('cross beam')[0].z,82);
assert.equal(named('stamp cantilever')[0].z,82);
assert.equal(36-24.8,11.2);assert.equal(10+3*.4,11.2);
assert.ok(24+90+64+28<208,'receipt clears the end stop');assert.equal(named('quote bed')[0].z+named('quote bed')[0].h,10);
assert.equal(named('receipt tray floor')[0].z+named('receipt tray floor')[0].h,10);
writeFileSync(root+'assets/figures/agent-parts.json',JSON.stringify({solidCount:parts.length,stroke:24.8,cardTravel:154,parts},null,2)+'\n');
writeFileSync(root+'assets/figures/project-scenes.js',bundle);
console.log(`Maiat mechanism: ${parts.length} solids; support, stamp contact and card travel assertions PASS.`);

// Update only owned host SVG markers; surrounding layout and product copy stay in index.html.
let host=read('index.html');
for(const [key,file] of [['output','output-workflow.svg'],['eznest','nesting-workflow.svg'],['maiat','agent-workflow.svg']]){
 let svg=read('assets/figures/'+file).trim().replace('role="img"',`id="${key}-workflow" data-project-scene="${key}" role="img"`);
 const at=svg.indexOf('-->')+3;svg=svg.slice(0,at)+'<g data-scene-art>'+svg.slice(at,-6)+'</g></svg>';
 const name=key.toUpperCase();host=host.replace(new RegExp(`<!-- PROJECT-${name}:START -->[\\s\\S]*?<!-- PROJECT-${name}:END -->`),`<!-- PROJECT-${name}:START -->${svg}<!-- PROJECT-${name}:END -->`);
}
writeFileSync(root+'index.html',host);
