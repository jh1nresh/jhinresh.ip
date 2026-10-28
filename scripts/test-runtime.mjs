// Run real chapter/drawer handlers with deterministic DOM, history and frame adapters.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const sources=['../script.js','../cabinet.js'].map(path=>fs.readFileSync(new URL(path,import.meta.url),'utf8'));
class Element {
 constructor(attrs={}){this.attrs=attrs;this.events={};this.dataset={};this.hidden=false;this.textContent='';this.classes=new Set();this.classList={add:value=>this.classes.add(value)};}
 addEventListener(name,fn){(this.events[name]||=[]).push(fn);}
 emit(name,event={}){this.events[name]?.forEach(fn=>fn(event));}
 dispatchEvent(event){this.emit(event.type,event);}
 getAttribute(name){return this.attrs[name]??null;}
 setAttribute(name,value){this.attrs[name]=String(value);}
 removeAttribute(name){delete this.attrs[name];}
 set href(value){this.attrs.href=value;}get href(){return this.attrs.href;}
 focus(){this.focused=true;}
 scrollIntoView(){this.scrolled=true;}
 click(){if(!this.disabled)this.emit('click');}
 closest(selector){return selector==='a[data-chapter]'&&this.attrs.href&&this.dataset.chapter?this:null;}
}
function fixture({reduced=false,hash='',main=true}={}){
 const ids=['home','project-savvy','project-output','project-eznest','project-maiat','about'];
 const labels=['Hello','Savvy','OUTPUT','EZNest','Agents','Footnotes'];
 const reader=new Element(),controls=new Element(),previous=new Element(),next=new Element(),chapterReadout=new Element(),figure=new Element(),cabinetControls=new Element(),drawerReadout=new Element(),readLink=new Element({href:'#project-savvy'});
 controls.hidden=true;cabinetControls.hidden=true;
 const spreads=ids.map(id=>{const e=Object.assign(new Element(),{id});e.heading=new Element();e.pages=[new Element(),new Element()];e.querySelector=()=>e.heading;e.querySelectorAll=()=>e.pages;return e;});
 const links=ids.map((id,i)=>Object.assign(new Element({href:`#${id}`}),{dataset:{chapter:id},textContent:labels[i]}));
 const buttons=['savvy','output','eznest','maiat'].map(key=>Object.assign(new Element(),{dataset:{cabinet:key}}));
 const drawers=buttons.map(button=>Object.assign(new Element(),{dataset:{drawer:button.dataset.cabinet}}));
 figure.querySelectorAll=()=>drawers;cabinetControls.querySelectorAll=()=>buttons;
 const contact=new Element();contact.closest=()=>spreads[5];
 const motion=Object.assign(new Element(),{matches:reduced});
 const window=new Element(),document=Object.assign(new Element(),{hidden:false,documentElement:{dataset:{}}});
 const selectors={'.reader':reader,'.reader-controls':controls,'#previous-chapter':previous,'#next-chapter':next,'#chapter-readout':chapterReadout,'#project-cabinet':figure,'.cabinet-controls':cabinetControls,'#cabinet-readout':drawerReadout,'#cabinet-read-chapter':readLink};
 document.querySelector=selector=>selectors[selector];
 document.querySelectorAll=selector=>selector==='[data-spread]'?spreads:selector==='.chapter-tabs a'?links:buttons;
 document.getElementById=id=>id==='contact'||id==='research'?contact:spreads.find(spread=>spread.id===id);
 const frames=new Map(),observers=[];let id=0,now=0;
 function Observer(callback){observers.push(callback);this.observe=()=>{};}
 window.IntersectionObserver=Observer;
 const location={hash},stack=[];
 const context={window,document,location,history:{pushState(_s,_t,path){stack.push(path);location.hash=path;}},matchMedia:()=>motion,IntersectionObserver:Observer,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},requestAnimationFrame:callback=>{frames.set(++id,callback);return id;},cancelAnimationFrame:key=>frames.delete(key)};
 if(main)vm.runInNewContext(sources[0],context);
 vm.runInNewContext(sources[1],context);
 function advance(count=200){for(let i=0;i<count&&frames.size;i++){now+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));assert.ok(frames.size<=1,'single drawer loop');}}
 function linkClick(link,extra={}){let prevented=false;document.emit('click',{target:link,button:0,preventDefault(){prevented=true;},...extra});return prevented;}
 const position=key=>Number(drawers.find(drawer=>drawer.dataset.drawer===key).getAttribute('transform').match(/ ([\d.]+)\)/)[1])*2;
 const active=()=>spreads.findIndex(spread=>!spread.hidden);
 return {document,window,location,stack,spreads,links,buttons,controls,previous,next,chapterReadout,cabinetControls,drawerReadout,readLink,drawers,motion,frames,advance,position,active,linkClick,contact,observe:visible=>observers[0]([{isIntersecting:visible}])};
}
const checks=[];
const markup=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const folios=[...markup.matchAll(/<div class="folio-foot"><span>.*?<\/span><span>(\d{2})<\/span><\/div>/g)].map(match=>match[1]);
assert.deepEqual(folios,Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')));
checks.push('actual HTML folios are unique and consecutive from 01 through 12');
let f=fixture();assert.equal(f.active(),0);assert.equal(f.previous.disabled,true);assert.equal(f.controls.hidden,false);assert.equal(f.frames.size,0);checks.push('cover initializes without autoplay; chapter controls have correct boundaries');
f.next.click();f.advance();assert.equal(f.active(),1);assert.equal(f.spreads[1].heading.focused,true);assert.equal(f.position('savvy'),28);f.next.click();f.advance();assert.equal(f.active(),2);assert.equal(f.position('output'),28);assert.equal(f.chapterReadout.textContent,'05–06 / 12 — OUTPUT');checks.push('next chapter aligns visible spread, URL, focus, drawer and page count');
f.linkClick(f.links[5]);assert.equal(f.next.disabled,true);f.next.click();assert.equal(f.active(),5);f.previous.click();assert.equal(f.active(),4);checks.push('chapter links and previous/next respect first and final chapters');
f.buttons[0].click();f.advance(2);f.buttons[3].click();f.advance(3);f.buttons[1].click();f.advance();assert.equal(f.position('output'),28);assert.equal(f.position('savvy'),0);assert.equal(f.readLink.href,'#project-output');checks.push('rapid drawer choices settle and update the read-chapter link');
f.linkClick(f.readLink);assert.equal(f.active(),2);f.location.hash='#home';f.window.emit('popstate');assert.equal(f.active(),0);checks.push('selected drawer opens its chapter; browser back restores the cover');
const contactLink=Object.assign(new Element({href:'#contact'}),{dataset:{chapter:'about'}});f.linkClick(contactLink);assert.equal(f.active(),5);assert.equal(f.location.hash,'#contact');assert.equal(f.contact.scrolled,true);checks.push('contact alias reveals the final chapter and scrolls to contact');
assert.equal(f.linkClick(f.links[1],{metaKey:true}),false);assert.equal(f.linkClick(f.links[1],{button:1}),false);checks.push('modified chapter clicks retain native browser behavior');
f.buttons[0].click();f.advance(2);f.observe(false);const frozen=f.drawers[0].getAttribute('transform');f.advance();assert.equal(f.frames.size,0);assert.equal(f.drawers[0].getAttribute('transform'),frozen);f.observe(true);f.advance();assert.equal(f.position('savvy'),28);checks.push('offscreen drawer motion pauses and resumes');
f.buttons[3].click();f.advance(2);f.document.hidden=true;f.document.emit('visibilitychange');assert.equal(f.frames.size,0);f.document.hidden=false;f.document.emit('visibilitychange');f.advance();assert.equal(f.position('maiat'),28);checks.push('hidden-page drawer motion pauses and resumes');
f.buttons[1].click();f.advance(2);f.motion.matches=true;f.motion.emit('change');assert.equal(f.frames.size,0);assert.equal(f.position('output'),28);checks.push('reduced-motion change snaps without a live frame');
f=fixture({reduced:true,hash:'#project-maiat'});assert.equal(f.active(),4);assert.equal(f.position('maiat'),28);assert.equal(f.frames.size,0);assert.equal(f.drawerReadout.textContent,'Maiat + Dojo / Agent trust');checks.push('direct chapter hash and initial reduced motion align the selected project');
f=fixture({reduced:true,hash:'#project-eznest'});assert.equal(f.active(),3);assert.equal(f.position('eznest'),28);assert.equal(f.drawerReadout.textContent,'EZNest / Artwork nesting');checks.push('EZNest chapter and fourth cabinet drawer stay aligned');
f=fixture();
for(let i=0;i<f.links.length;i++){
 f.spreads[i].pages.forEach(page=>{page.scrollTop=180;});
 f.linkClick(f.links[i]);
 assert.equal(f.chapterReadout.textContent,`${String(i*2+1).padStart(2,'0')}–${String(i*2+2).padStart(2,'0')} / 12 — ${['Hello','Savvy','OUTPUT','EZNest','Agents','Footnotes'][i]}`);
 assert.ok(f.spreads[i].pages.every(page=>page.scrollTop===0));
}
f.location.hash='#project-output';f.window.emit('popstate');assert.equal(f.chapterReadout.textContent,'05–06 / 12 — OUTPUT');
checks.push('all page pairs match the twelve printed folios; explicit navigation resets page scrolling and history restores the range');
f=fixture({hash:'#work'});assert.equal(f.active(),0);assert.equal(f.chapterReadout.textContent,'01–02 / 12 — Hello');checks.push('skip-to-book hash opens the first page pair');
f=fixture({main:false});assert.equal(f.cabinetControls.hidden,true);assert.ok(f.spreads.every(spread=>!spread.hidden));checks.push('main script failure leaves native chapters readable and dependent controls hidden');
console.log(JSON.stringify({passed:checks.length,checks},null,2));
