// Run the actual paginator against controlled layout sizes; browser QA owns CSS geometry.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../fit-reader.js',import.meta.url),'utf8');
class Node{
 constructor(tag='div',classes='',height=0){this.tagName=tag.toUpperCase();this.classes=new Set(classes.split(' '));this.classList={contains:c=>this.classes.has(c)};this.children=[];this.events={};this.dataset={};this.hidden=false;this.height=height;this.attrs={};this.style={setProperty(){}};}
 append(...nodes){nodes.forEach(node=>{node.parent=this;this.children.push(node);});}
 insertBefore(node,before){node.parent=this;this.children.splice(this.children.indexOf(before),0,node);}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){(this.events[k]||=[]).push(fn);}
 emit(k,event={}){this.events[k]?.forEach(fn=>fn(event));}
 contains(other){return this===other||this.children.some(child=>child.contains(other));}
 matches(selector){if(selector==='[data-spread]')return this.dataset.spread!==undefined;return selector.split(',').some(s=>s[0]==='.'?this.classes.has(s.slice(1)):s.toUpperCase()===this.tagName);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 querySelectorAll(selector){if(selector===':scope > .page')return this.children.filter(c=>c.matches('.page'));const all=this.children.flatMap(c=>[c,...c.querySelectorAll('*')]);return selector==='*'?all:all.filter(c=>c.matches(selector));}
 get size(){if(this.hidden)return 0;if(this.tagName==='DETAILS'&&!this.open)return this.children[0].size;return this.height+this.children.reduce((sum,c)=>sum+c.size,0);}
 focus(){this.focused=true;}
 click(){if(!this.disabled)this.emit('click');}
}
function fixture({ready=false,hash='',capacity=160,supported=true,details=false}={}){
 const reader=new Node('main',ready?'reader reader-enhanced':'reader'),binding=new Node('div','book-binding'),spread=new Node('section'),page=new Node('div','page');spread.dataset.spread='fixture';reader.append(binding);binding.append(spread);spread.append(page);
 const content=new Node('div','page-content'),copy=new Node('div','chapter-copy'),foot=new Node('div','folio-foot');page.append(content,foot);content.append(copy);
 const label=new Node('p','chapter-label',20),title=new Node('h2','',50),first=new Node('p','',70),contact=new Node('div','',60);copy.append(label,title,first,contact);
 let summary,image,caption,detail;
 if(details){copy.hidden=true;content.children=[];detail=new Node('details');summary=new Node('summary','',30);const figure=new Node('figure');image=new Node('img','',70);caption=new Node('figcaption','',40);figure.append(image,caption);detail.append(summary,figure);content.append(detail);}
 Object.defineProperty(content,'clientHeight',{get:()=>capacity-(page.children.find(n=>n.className==='page-pager')?.hidden===false?38:0)});
 Object.defineProperty(content,'scrollHeight',{get:()=>Math.max(content.clientHeight,content.children.reduce((sum,c)=>sum+c.size,0))});
 const document=new Node();document.documentElement={dataset:{}};document.querySelector=s=>s==='.reader'?reader:s==='.book-binding'?binding:null;document.getElementById=id=>id==='contact'?contact:null;
 const window=new Node(),frames=new Map();let serial=0,observer,captionObserver;
 class ResizeObserver{constructor(fn){observer=fn;}observe(){}}
 class MutationObserver{constructor(fn){captionObserver=fn;}observe(){}}
 document.createElement=tag=>new Node(tag);
 vm.runInNewContext(source,{document,window:Object.assign(window,supported?{ResizeObserver,MutationObserver}:{}),ResizeObserver,MutationObserver,location:{hash},requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id)});
 const readyEvent=()=>{reader.classes.add('reader-enhanced');document.emit('readerready');};
 const flush=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());};
 const pager=()=>page.children.find(n=>n.className==='page-pager');
 return{reader,binding,spread,page,content,document,window,units:[label,title,first,contact],contact,summary,image,caption,detail,readyEvent,flush,pager,captionChange(height){caption.height=height;captionObserver();flush();},resize(value){capacity=value;observer();flush();}};
}
const checks=[];
let f=fixture();assert.equal(f.document.documentElement.dataset.bookFit,undefined);assert.equal(f.pager(),undefined);assert.ok(f.units.every(n=>!n.hidden));f.readyEvent();assert.equal(f.document.documentElement.dataset.bookFit,'');checks.push('fit enhancement starts only after the reader is ready; native fallback stays readable');
const seen=new Set();for(let i=0;i<10;i++){assert.ok(f.content.scrollHeight<=f.content.clientHeight);f.units.filter(n=>!n.hidden).forEach(n=>seen.add(n));const next=f.pager().children[2];if(next.disabled)break;next.click();}assert.equal(seen.size,4);assert.equal(f.pager().children[2].disabled,true);checks.push('every text unit remains reachable and every section fits without scroll');
f=fixture({ready:true,hash:'#contact'});assert.equal(f.contact.hidden,false);assert.ok(f.content.scrollHeight<=f.content.clientHeight);f.document.emit('beforechapterchange',{detail:{index:0,side:0,single:true,targetHash:'#contact'}});assert.equal(f.contact.hidden,false);checks.push('direct hashes and navigation aliases reveal the target section');
f.resize(400);assert.equal(f.pager().hidden,true);assert.ok(f.units.every(n=>!n.hidden));f.resize(150);assert.equal(f.pager().hidden,false);assert.ok(f.content.scrollHeight<=f.content.clientHeight);checks.push('resize repaginates content without losing access');
f=fixture({ready:true,capacity:140,details:true});f.detail.open=true;f.document.emit('toggle');f.flush();const detailsSeen=new Set();for(let i=0;i<10;i++){assert.ok(f.content.scrollHeight<=f.content.clientHeight);[f.summary,f.image,f.caption].filter(n=>!n.hidden).forEach(n=>detailsSeen.add(n));if(f.pager().children[2].disabled)break;f.pager().children[2].click();}assert.equal(detailsSeen.size,3);checks.push('expanded interface previews paginate summary image and caption separately');
f.captionChange(90);assert.ok(f.content.scrollHeight<=f.content.clientHeight);checks.push('caption changes trigger a fresh fit without overflowing the current section');
f=fixture({ready:true,supported:false});assert.equal(f.document.documentElement.dataset.bookFit,undefined);checks.push('unsupported sizing API preserves native content flow');
f=fixture({ready:true,capacity:80});const reachable=new Set();let guarded=false;for(let i=0;i<12;i++){if(f.content.scrollHeight>f.content.clientHeight){assert.equal(f.content.dataset.overflow,'');guarded=true;}f.units.filter(n=>!n.hidden).forEach(n=>reachable.add(n));if(f.pager().children[2].disabled)break;f.pager().children[2].click();}assert.equal(reachable.size,4);assert.ok(guarded);f.resize(400);assert.equal(f.content.dataset.overflow,undefined);assert.ok(f.units.every(n=>!n.hidden));checks.push('oversized groups split and unbreakable content keeps a native scrolling escape hatch only when needed');
console.log(JSON.stringify({passed:checks.length,checks},null,2));
