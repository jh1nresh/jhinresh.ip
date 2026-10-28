import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../workflows.js',import.meta.url),'utf8');
class Element{
 constructor(){this.events={};this.attrs={};this.hidden=false;this.dataset={};this.textContent='';this.style={};}
 addEventListener(name,fn){(this.events[name]||=[]).push(fn);}emit(name,event={}){this.events[name]?.forEach(fn=>fn(event));}
 setAttribute(name,value){this.attrs[name]=String(value);}removeAttribute(name){delete this.attrs[name];}click(){this.emit('click');}
}
function fixture(reduced=false){
 const document=Object.assign(new Element(),{hidden:false}),window=new Element(),toggle=new Element();
 const motion=Object.assign(new Element(),{matches:reduced});
 const chapters=Array.from({length:4},(_,i)=>({hidden:i!==0}));
 const svgs=chapters.map((chapter,i)=>{const svg=new Element();svg.closest=()=>chapter;svg.art=new Element();svg.querySelector=()=>svg.art;svg.dataset.projectScene=['savvy','output','eznest','maiat'][i];return svg;});
 const [card,pin,confirmed]=Array.from({length:3},()=>new Element());svgs[0].querySelector=id=>({'#savvy-card':card,'#savvy-pin':pin,'#savvy-confirmed':confirmed}[id]);
 const readouts=Object.fromEntries(['savvy','output','eznest','maiat'].map(key=>[key,new Element()]));
 window.bookScenes=Object.fromEntries(['output','eznest','maiat'].map(key=>[key,{duration:9,stillTime:5,render:t=>`<path data-time="${t}"/>`,caption:t=>`${key}:${Math.floor(t)}`} ]));
 document.querySelector=selector=>selector==='#motion-toggle'?toggle:selector==='#savvy-workflow'?svgs[0]:readouts[selector.slice(1).replace('-readout','')];
 document.querySelectorAll=()=>svgs.slice(1);
 const frames=new Map(),observers=[];let id=0,now=0;
 function Observer(callback){observers.push(callback);this.observe=()=>{};}
 window.IntersectionObserver=Observer;
 vm.runInNewContext(source,{document,window,matchMedia:()=>motion,IntersectionObserver:Observer,requestAnimationFrame:callback=>{frames.set(++id,callback);return id;},cancelAnimationFrame:key=>frames.delete(key)});
 function advance(n=90){for(let i=0;i<n&&frames.size;i++){now+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));assert.ok(frames.size<=1,'one shared illustration clock');}}
 function select(index){document.emit('chapterleave');chapters.forEach((c,i)=>{c.hidden=i!==index;});document.emit('chapterchange');}
 return{document,window,toggle,motion,svgs,chapters,card,pin,confirmed,readouts,frames,advance,select,observe:(index,visible)=>observers[0]([{target:svgs[index],isIntersecting:visible}])};
}
const checks=[];
let f=fixture();assert.equal(f.frames.size,1);const initial=f.card.attrs.transform;f.advance(120);assert.notEqual(f.card.attrs.transform,initial);checks.push('Savvy starts automatically without a play gesture');
f.advance(1200);assert.equal(f.frames.size,1);assert.ok(Number(f.svgs[0].dataset.time)<6.4);checks.push('automatic story continues into subsequent cycles on one frame clock');
f.toggle.click();const pose=f.card.attrs.transform;f.advance();assert.equal(f.frames.size,0);assert.equal(f.card.attrs.transform,pose);assert.equal(f.toggle.textContent,'Play illustrations');f.toggle.click();for(let i=0;i<600&&f.card.attrs.transform===pose;i++)f.advance(1);assert.notEqual(f.card.attrs.transform,pose);checks.push('global opt-out pauses and resumes the current pose');
for(let i=1;i<4;i++){f.select(i);const before=f.svgs[i].art.innerHTML;f.advance(90);assert.notEqual(f.svgs[i].art.innerHTML,before);assert.equal(f.frames.size,1);}checks.push('OUTPUT, EZNest and Maiat automatically animate on chapter entry');
f.document.emit('chapterleave');assert.equal(f.frames.size,0);f.document.emit('chapterchange');assert.equal(f.frames.size,1);checks.push('illustration clock waits for the paper turn to finish');
f.observe(3,false);const offscreen=f.svgs[3].dataset.time;f.advance();assert.equal(f.frames.size,0);f.observe(3,true);f.advance(1);assert.ok(Math.abs(Number(f.svgs[3].dataset.time)-Number(offscreen))<=.033);f.advance(60);assert.notEqual(f.svgs[3].dataset.time,offscreen);checks.push('offscreen pause resumes without a time jump');
f.document.hidden=true;f.document.emit('visibilitychange');assert.equal(f.frames.size,0);f.document.hidden=false;f.document.emit('visibilitychange');assert.equal(f.frames.size,1);f.select(-1);assert.equal(f.frames.size,0);assert.equal(f.toggle.hidden,true);checks.push('hidden documents and non-project chapters have no live illustration loop');
f=fixture(true);assert.equal(f.frames.size,0);assert.equal(f.pin.attrs.opacity,'1');assert.equal(f.toggle.textContent,'Play illustrations');for(let i=1;i<4;i++){f.select(i);assert.equal(f.svgs[i].dataset.time,'5.000');assert.equal(f.frames.size,0);}f.toggle.click();f.advance(60);assert.equal(f.frames.size,1);f.motion.emit('change');assert.equal(f.frames.size,0);checks.push('reduced motion defaults to a complete still and permits an explicit opt-in');
console.log(JSON.stringify({passed:checks.length,checks},null,2));
