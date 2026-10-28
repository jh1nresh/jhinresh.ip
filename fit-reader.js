/* Fit the physical page to the viewport; paginate overflowing content into readable sections. */
(() => {
 function init(){
 const reader=document.querySelector('.reader'),binding=document.querySelector('.book-binding');
 if(!reader||!binding||!window.ResizeObserver)return;
 const spreads=[...binding.querySelectorAll('[data-spread]')],records=[];
 document.documentElement.dataset.bookFit='';
 function unitsFor(content){
  const units=[];
  function add(nodes){if(nodes.length)units.push(nodes);}
  for(const root of content.children){
   if(root.tagName==='DETAILS'){for(const child of root.children){if(child.tagName==='FIGURE')[...child.children].forEach(node=>add([node]));else add([child]);}continue;}
   if(root.tagName==='FIGURE'){[...root.children].forEach(child=>add([child]));continue;}
   if(!root.classList.contains('chapter-copy')){add([root]);continue;}
   const children=[...root.children];
   for(let i=0;i<children.length;i++){
    const child=children[i];
    if(child.classList.contains('recognition-record')||child.classList.contains('project-recognition')){
     const items=[...child.children];
     for(let j=0;j<items.length;j++){
      const item=items[j];
      if(item.tagName==='H3'&&items[j+1]?.tagName==='UL'){
       const rows=[...items[++j].children];add([item,rows.shift()]);rows.forEach(row=>add([row]));
      }else if(item.tagName==='H2'&&items[j+1]?.classList.contains('recognition-meta'))add([item,items[++j]]);
      else add([item]);
     }
    }else if(child.classList.contains('chapter-label')&&children[i+1]?.matches('h1,h2,.intro-heading'))add([child,children[++i]]);
    else add([child]);
   }
  }
  return units;
 }
 for(const [index,spread] of spreads.entries())for(const [side,page] of [...spread.querySelectorAll(':scope > .page')].entries()){
  const content=page.querySelector('.page-content'),units=unitsFor(content);
  const pager=document.createElement('nav');pager.className='page-pager';pager.setAttribute('aria-label',`Page ${index*2+side+1} sections`);pager.hidden=true;
  const previous=document.createElement('button'),next=document.createElement('button'),readout=document.createElement('span');
  previous.type=next.type='button';previous.textContent='←';next.textContent='→';
  previous.setAttribute('aria-label','Previous section');next.setAttribute('aria-label','Continue reading');readout.setAttribute('role','status');
  pager.append(previous,readout,next);page.insertBefore(pager,page.querySelector('.folio-foot'));
  const record={page,content,units,pager,previous,next,readout,parts:[],part:0,index,side};records.push(record);
  previous.addEventListener('click',()=>select(record,record.part-1,true));next.addEventListener('click',()=>select(record,record.part+1,true));
 }
 function select(record,part,focus=false){
  record.part=Math.max(0,Math.min(record.parts.length-1,part));
  const visible=new Set(record.parts[record.part]||record.units);
  record.units.forEach(unit=>unit.forEach(node=>{node.hidden=!visible.has(unit);}));
  record.previous.disabled=record.part===0;record.next.disabled=record.part===record.parts.length-1;
  record.readout.textContent=`Reading ${record.part+1} / ${record.parts.length}`;
  record.content.scrollTop=0;if(focus)record.content.focus({preventScroll:true});
 }
 function fit(){
  for(const record of records){
   const {page,content,units,pager}=record,spread=spreads[record.index],hidden=spread.hidden;
   spread.hidden=false;page.dataset.measuring='';pager.hidden=true;page.style.setProperty('--content-height',`${content.clientHeight}px`);
   units.forEach(unit=>unit.forEach(node=>{node.hidden=false;}));
   record.parts=[units];
   if(content.scrollHeight>content.clientHeight+1){
    pager.hidden=false;page.style.setProperty('--content-height',`${content.clientHeight}px`);units.forEach(unit=>unit.forEach(node=>{node.hidden=true;}));
    const parts=[];let part=[];
    for(const unit of units){
     unit.forEach(node=>{node.hidden=false;});
     if(part.length&&content.scrollHeight>content.clientHeight+1){
      part.forEach(group=>group.forEach(node=>{node.hidden=true;}));parts.push(part);part=[];
     }
     part.push(unit);
    }
    if(part.length)parts.push(part);record.parts=parts;pager.hidden=parts.length<=1;
   }
   select(record,record.part);delete page.dataset.measuring;spread.hidden=hidden;
  }
 }
 function reveal(record,hash){
  const target=hash&&document.getElementById(hash.slice(1));
  const part=target?record.parts.findIndex(groups=>groups.some(unit=>unit.some(node=>node===target||node.contains(target)||target.contains(node)))):-1;
  select(record,Math.max(0,part));
 }
 document.addEventListener('beforechapterchange',({detail})=>{
  if(!detail)return;
  for(const record of records)if(record.index===detail.index&&(!detail.single||record.side===detail.side))reveal(record,detail.targetHash);
 });
 let frame=0;
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;fit();});}
 new ResizeObserver(schedule).observe(binding);
 if(window.MutationObserver){const captions=new MutationObserver(schedule);reader.querySelectorAll('figcaption').forEach(caption=>captions.observe(caption,{childList:true,characterData:true,subtree:true}));}
 window.addEventListener('resize',schedule);document.addEventListener('toggle',schedule,true);document.addEventListener('load',schedule,true);document.fonts?.ready.then(schedule);
 fit();
 records.forEach(record=>reveal(record,location.hash));
 }
 if(document.querySelector('.reader')?.classList.contains('reader-enhanced'))init();
 else document.addEventListener('readerready',init,{once:true});
})();
