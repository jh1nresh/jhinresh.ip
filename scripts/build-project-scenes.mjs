/** Build native, seekable project figures without a page shell or timers. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFileSync(root+path,'utf8');
const license=read('scripts/vendor/COLORFIGURES-LICENSE');
const reset=`VIEW=0;RC=[0,0];OX=0;OY=0;INK_K=.65;_clipN=0;setLight(110);`;
const timeline=String.raw`const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));return t<=total+1.3?Math.min(t,total):total*(1-smooth((t-total-1.3)/1.8));}
function render(t){${reset}const svg=inkScale(scene(at(t)));return svg.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function caption(t){return t>total+1.3?'Resetting this illustrative workflow.':say(at(t));}`;
function factory(key,file,extra){return `(()=>{\n${read(`scripts/figure-sources/${file}.js`)}\nconst prefix='book-${key}-';${extra}\nconst duration=total+3.1;${timeline}\nreturn {duration,stillTime:total,viewBox:'',render,caption};\n})()`;}
const output=factory('output','output',`const total=EZ_TOTAL,scene=t=>ezScene3({t}),say=t=>EZ_CAP[ezScene(t)][0];`);
const nesting=factory('eznest','nesting',`const total=EZ_TOTAL,scene=t=>ezScene3({t}),say=t=>EZ_CAP[ezScene(t)][0];`);
const agent=factory('maiat','agent',`const total=7.7,scene=t=>agScene(t),say=t=>t<2.6?'A quote arrives at the approval station.':t<4.8?'The illustrated approval stamp meets the card.':'The approved example leaves a receipt.';`);
let bundle=`/* Dusk-desk project scenes. OUTPUT and EZNest keep their original timelines and synthetic part data.\n${license}\n*/\n(()=>{\n'use strict';\n${read('scripts/figure-sources/drawing.js')}\nwindow.bookScenes={output:${output},eznest:${nesting},maiat:${agent}};\n})();\n`;
const sandbox={window:{}};vm.runInNewContext(bundle,sandbox);const scenes=sandbox.window.bookScenes;
function bounds(svg){
 const xs=[],ys=[];
 for(const m of svg.matchAll(/\bd="([^"]+)"/g)){
  const pairs=m[1].match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number)||[];
  for(let i=0;i+1<pairs.length;i+=2){xs.push(pairs[i]);ys.push(pairs[i+1]);}
 }
 for(const m of svg.matchAll(/<(rect|circle|ellipse)\b([^>]+)>/g)){
  const attrs=Object.fromEntries([...m[2].matchAll(/([\w:-]+)="([^"]+)"/g)].map(a=>[a[1],a[2]]));
  const n=value=>{const parsed=Number(value);return Number.isFinite(parsed)?parsed:null;};
  if(m[1]==='rect'){const x=n(attrs.x)??0,y=n(attrs.y)??0,w=n(attrs.width),h=n(attrs.height);if(w!=null&&h!=null){xs.push(x,x+w);ys.push(y,y+h);}}
  else if(m[1]==='circle'){const cx=n(attrs.cx),cy=n(attrs.cy),r=n(attrs.r);if(cx!=null&&cy!=null&&r!=null){xs.push(cx-r,cx+r);ys.push(cy-r,cy+r);}}
  else{const cx=n(attrs.cx),cy=n(attrs.cy),rx=n(attrs.rx),ry=n(attrs.ry);if(cx!=null&&cy!=null&&rx!=null&&ry!=null){xs.push(cx-rx,cx+rx);ys.push(cy-ry,cy+ry);}}
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
  const refs=[...svg.matchAll(/url\(#([^)]+)\)/g)].map(m=>m[1]);
  assert.ok(refs.every(id=>ids.includes(id)),`${key} clip references resolve within the rendered scene`);
 }
 const fallback=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox}" role="img" aria-labelledby="${key}-title ${key}-desc"><title id="${key}-title">${titles[key]}</title><desc id="${key}-desc">${descriptions[key]}</desc><!-- ${license} -->${start}</svg>\n`;
 writeFileSync(root+'assets/figures/'+filenames[key],fallback);
 bundle+=`window.bookScenes.${key}.viewBox=${JSON.stringify(scene.viewBox)};\n`;
 console.log(`${key}: ${scene.duration.toFixed(1)}s cycle; stable loop, finite geometry and clip IDs PASS; viewBox ${scene.viewBox}`);
}
// The quote still travels, the stamp still meets it, and the receipt still clears the tray.
function agentParts(t){const box={parts:null};vm.runInNewContext(read('scripts/figure-sources/agent.js')+`\nconst captured=[];agScene(${t},captured);parts=captured;`,box);return box.parts;}
const start=agentParts(0),pressed=agentParts(3.2),done=agentParts(7);
const card=list=>list.find(part=>part.name==='quote card');
const stamp=list=>list.find(part=>part.name==='stamp');
assert.equal(start.length,5);
assert.ok(card(start).x<card(pressed).x&&card(pressed).x<card(done).x,'the quote card travels toward the receipt');
assert.equal(card(start).x,24);assert.equal(card(pressed).x,114);assert.equal(card(done).x,178);
assert.equal(stamp(start).stroke,0);
assert.ok(stamp(pressed).stroke>20,'the stamp is down when it meets the card');
assert.ok(stamp(done).stroke<1,'the stamp lifts before the receipt pose');
assert.ok(done.find(part=>part.name==='receipt tray'));
const posed=scenes.maiat.render(7);
assert.match(posed,/QUOTE/);assert.match(posed,/CONSENT/);assert.match(posed,/RECEIPT/);
assert.match(posed,/STAMP/);
writeFileSync(root+'assets/figures/agent-parts.json',JSON.stringify({cardTravel:154,stroke:24.8,parts:done},null,2)+'\n');
writeFileSync(root+'assets/figures/project-scenes.js',bundle);
console.log(`Maiat desk: card ${card(start).x} → ${card(done).x}; stamp stroke ${stamp(pressed).stroke.toFixed(1)} PASS.`);

// Update only owned host SVG markers; surrounding layout and product copy stay in index.html.
let host=read('index.html');
for(const [key,file] of [['output','output-workflow.svg'],['eznest','nesting-workflow.svg'],['maiat','agent-workflow.svg']]){
 let svg=read('assets/figures/'+file).trim().replace('role="img"',`id="${key}-workflow" data-project-scene="${key}" role="img"`);
 const at=svg.indexOf('-->')+3;svg=svg.slice(0,at)+'<g data-scene-art>'+svg.slice(at,-6)+'</g></svg>';
 const name=key.toUpperCase();host=host.replace(new RegExp(`<!-- PROJECT-${name}:START -->[\\s\\S]*?<!-- PROJECT-${name}:END -->`),`<!-- PROJECT-${name}:START -->${svg}<!-- PROJECT-${name}:END -->`);
}
writeFileSync(root+'index.html',host);
