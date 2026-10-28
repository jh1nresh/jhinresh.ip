import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../workflows.js',import.meta.url),'utf8');
class Element{
 constructor(){this.events={};this.attrs={};this.hidden=false;this.dataset={};this.textContent='';}
 addEventListener(name,fn){(this.events[name]||=[]).push(fn);}emit(name,event={}){this.events[name]?.forEach(fn=>fn(event));}
 setAttribute(name,value){this.attrs[name]=String(value);}click(){this.emit('click');}
}
function fixture(reduced=false){
 const document=Object.assign(new Element(),{hidden:false}),window=new Element(),chapter={hidden:false};
 const figure=new Element(),controls=Object.assign(new Element(),{hidden:true}),card=new Element(),pin=new Element(),confirmed=new Element(),readout=new Element(),play=new Element(),reset=new Element();
 figure.closest=()=>chapter;figure.querySelector=id=>({'#savvy-card':card,'#savvy-pin':pin,'#savvy-confirmed':confirmed}[id]);
 const steps=[0,1,2].map(n=>Object.assign(new Element(),{dataset:{savvyStep:String(n)}}));
 const motion=Object.assign(new Element(),{matches:reduced});
 document.querySelector=selector=>({'#savvy-workflow':figure,'.savvy-controls':controls,'#savvy-readout':readout,'#savvy-play':play,'#savvy-reset':reset}[selector]);
 document.querySelectorAll=()=>steps;
 const observers=[],frames=new Map();let id=0,now=0;
 function Observer(callback){observers.push(callback);this.observe=()=>{};}
 window.IntersectionObserver=Observer;
 const context={document,window,matchMedia:()=>motion,IntersectionObserver:Observer,requestAnimationFrame:callback=>{frames.set(++id,callback);return id;},cancelAnimationFrame:key=>frames.delete(key)};
 vm.runInNewContext(source,context);
 function advance(n=450){for(let i=0;i<n&&frames.size;i++){now+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));assert.ok(frames.size<=1,'single Savvy animation loop');}}
 return{document,window,chapter,controls,card,pin,confirmed,readout,play,reset,steps,motion,frames,advance,observe:visible=>observers[0]([{isIntersecting:visible}])};
}
const checks=[];
let f=fixture();assert.equal(f.controls.hidden,false);assert.equal(f.frames.size,0);assert.equal(f.pin.attrs.opacity,'0');checks.push('initial diagram is still and controls initialize');
f.play.click();f.advance(70);f.play.click();const frozen=f.card.attrs.transform;f.advance();assert.equal(f.card.attrs.transform,frozen);assert.equal(f.play.textContent,'Resume story');f.play.click();f.advance();assert.equal(f.readout.textContent,'03 / Map Stamp placed');assert.equal(f.pin.attrs.opacity,'1');assert.equal(f.pin.attrs.transform,'translate(0 0)');assert.equal(f.frames.size,0);checks.push('play, pause, resume and completion keep a single retained pose');
f.reset.click();assert.equal(f.card.attrs.transform,'translate(0 0)');assert.equal(f.confirmed.attrs.opacity,'0');f.steps[1].click();f.advance();assert.equal(f.readout.textContent,'02 / Review the place match');assert.equal(f.confirmed.attrs.opacity,'1');assert.equal(f.pin.attrs.opacity,'0');checks.push('reset and direct review step show the matching card/marker state');
f.play.click();f.advance(20);f.steps[2].click();f.advance(2);f.steps[0].click();f.advance();assert.equal(f.readout.textContent,'01 / Save a link');assert.equal(f.pin.attrs.opacity,'0');checks.push('step selection interrupts playback and reverses safely');
f.play.click();f.advance(50);f.observe(false);const paused=f.card.attrs.transform;f.advance();assert.equal(f.frames.size,0);assert.equal(f.card.attrs.transform,paused);f.observe(true);f.advance();assert.equal(f.readout.textContent,'03 / Map Stamp placed');checks.push('offscreen illustration pauses and resumes without a clock jump');
f.reset.click();f.play.click();f.advance(50);f.document.hidden=true;f.document.emit('visibilitychange');assert.equal(f.frames.size,0);f.document.hidden=false;f.document.emit('visibilitychange');f.advance();assert.equal(f.pin.attrs.transform,'translate(0 0)');checks.push('hidden-page illustration pauses and resumes');
f=fixture(true);f.play.click();assert.equal(f.readout.textContent,'03 / Map Stamp placed');assert.equal(f.frames.size,0);f.steps[1].click();assert.equal(f.pin.attrs.opacity,'0');assert.equal(f.frames.size,0);checks.push('reduced motion jumps to meaningful requested states');
console.log(JSON.stringify({passed:checks.length,checks},null,2));
