/* Native anchors remain readable without scripts; enhancement turns one retained sheet. */
(() => {
  const reader = document.querySelector('.reader');
  const binding = document.querySelector('.book-binding');
  const spreads = [...document.querySelectorAll('[data-spread]')];
  const controls = document.querySelector('.reader-controls');
  const previous = document.querySelector('#previous-chapter');
  const next = document.querySelector('#next-chapter');
  const readout = document.querySelector('#chapter-readout');
  if (!reader || !spreads.length || !controls || !previous || !next || !readout) return;
  const labels = ['Hello', 'Savvy', 'OUTPUT', 'EZNest', 'Agents', 'Awards & blog'];
  const projects = ['savvy', 'output', 'eznest', 'maiat'];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 760px)');
  let current = -1, currentSide = 0, activeProject = 'savvy', turn = null, queued = null, serial = 0;
  function spreadForHash(hash) {
    if (hash === '#work') return 0;
    const direct = spreads.findIndex(spread => `#${spread.id}` === hash);
    if (direct >= 0) return direct;
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    return target ? spreads.indexOf(target.closest('[data-spread]')) : 0;
  }
  function selectProject(key) {
    if (!projects.includes(key)) return;
    activeProject = key;
    document.documentElement.dataset.activeProject = key;
    const link = document.querySelector('#cabinet-read-chapter');
    link.href = `#project-${key}`;
    link.dataset.chapter = `#project-${key}`.slice(1);
    link.textContent = `Read the ${({savvy: 'Savvy', output: 'OUTPUT', eznest: 'EZNest', maiat: 'Maiat + Dojo'})[key]} chapter ↗`;
    document.dispatchEvent(new CustomEvent('projectchange', {detail: key}));
  }
  function face(spread, side, className) {
    const source = spread.querySelector(`.page-${side}`);
    const copy = source.cloneNode(true);
    // Cloned pages are visual only. Prefix SVG/HTML references instead of duplicating IDs.
    const prefix = `turn-${++serial}-`, ids = new Map();
    const nodes = [copy, ...copy.querySelectorAll('*')];
    for (const node of nodes) if (node.id) { ids.set(node.id, prefix + node.id); node.id = prefix + node.id; }
    for (const node of nodes) for (const attr of [...node.attributes]) {
      let value = attr.value.replace(/url\(#([^)]+)\)/g, (all,id) => ids.has(id) ? `url(#${ids.get(id)})` : all);
      if (['aria-labelledby','aria-describedby','aria-controls'].includes(attr.name)) value = value.split(' ').map(id => ids.get(id) || id).join(' ');
      if (attr.name === 'href' && value[0] === '#' && ids.has(value.slice(1))) value = '#' + ids.get(value.slice(1));
      node.setAttribute(attr.name,value);
    }
    copy.style.background = getComputedStyle(source).background;
    copy.style.setProperty('--chapter',getComputedStyle(source).getPropertyValue('--chapter'));
    const scrollTop=source.querySelector('.page-content').scrollTop;
    const wrapper = document.createElement('div');
    wrapper.className = `${spread.className} turn-face ${className}`;
    wrapper.append(copy);wrapper.savedScroll=scrollTop;
    return wrapper;
  }
  function turnSheet(from, to, forward, finish, fromSide = 0, toSide = 0) {
    if (!binding || !binding.animate || !window.bookCurl || motion.matches || document.hidden) { finish(); return; }
    const layer = document.createElement('div');
    const single=narrow.matches;
    layer.className = `turn-layer${forward ? '' : ' turn-reverse'}${single ? ' turn-single' : ''}`;
    layer.inert = true;
    layer.setAttribute('aria-hidden','true');
    const under = face(from,forward ? 'left' : 'right','turn-under');
    const leaf = document.createElement('div');
    leaf.className = 'turn-leaf';
    if(!single)layer.append(under);layer.append(leaf);binding.append(layer);
    const vertical=false,axis='Y';
    const bounds=from.querySelector(single?(fromSide?'.page-right':'.page-left'):'.page-right').getBoundingClientRect();
    const width=bounds.width,height=bounds.height,length=vertical?height:width;
    const count=window.bookCurl.segments,step=length/count,duration=980;
    const steps=window.bookCurl.keyframes;
    const poses=Array.from({length:steps+1},(_,i)=>window.bookCurl.sample(i/steps,length,!forward,vertical));
    const animations=[];
    // Clip full-size page copies into material strips; neighbouring ends share one curve.
    leaf.replaceChildren();
    for(let i=0;i<count;i++){
      const strip=document.createElement('div');strip.className='curl-strip';
      strip.style.width=`${vertical?width:step+.35}px`;strip.style.height=`${vertical?step+.35:height}px`;
      for(const back of [false,true]){
        const panel=document.createElement('div');panel.className=`curl-face ${back?'curl-back':'curl-front'}`;
        const side=single?(back?toSide:fromSide)?'right':'left':back?(forward?'left':'right'):(forward?'right':'left');
        const page=face(back?to:from,side,'curl-content');
        page.style.width=`${width}px`;page.style.height=`${height}px`;
        const crop=back?(forward?count-1-i:i):(forward?i:count-1-i);
        page.style[vertical?'top':'left']=`${-crop*step}px`;
        const shade=document.createElement('div');shade.className='curl-shade';
        panel.append(page,shade);strip.append(panel);
        animations.push(shade.animate(poses.map((pose,index)=>({offset:index/steps,opacity:pose[i].shade})),{duration,easing:'linear',fill:'both'}));
      }
      leaf.append(strip);
      animations.push(strip.animate(poses.map((pose,index)=>({offset:index/steps,transform:`translate3d(${pose[i].x}px,${pose[i].y}px,${pose[i].z}px) rotate${axis}(${pose[i].angle}deg)`})),{duration,easing:'linear',fill:'both'}));
    }
    layer.querySelectorAll('.turn-face').forEach(page=>{page.querySelector('.page-content').scrollTop=page.savedScroll;});
    const clock=leaf.animate([{transform:'translateZ(0px)'},{transform:'translateZ(0px)'}],{duration,easing:'linear',fill:'forwards'});
    animations.push(clock);
    if(typeof document.timeline?.currentTime==='number'){const started=performance.now();animations.forEach(animation=>{animation.startTime=started;});}
    const animation={finished:clock.finished,finish(){animations.forEach(item=>item.finish());}};
    let done = false;
    const cleanup = () => { if(done)return;done=true;layer.remove();turn=null;reader.removeAttribute('aria-busy');finish();const pending=queued;queued=null;if(pending)showChapter(...pending); };
    turn = {animation,cleanup};reader.setAttribute('aria-busy','true');
    animation.finished.then(cleanup,cleanup);
  }
  function showChapter(index, navigate = false, targetHash = null, side = 0) {
    index = Math.max(0, Math.min(spreads.length - 1,index));
    if (turn) { queued=[index,navigate,targetHash,side];return; }
    if(narrow.matches&&targetHash)side=document.getElementById(targetHash.slice(1))?.closest('.page-right')?1:0;
    if(!narrow.matches)side=0;
    if(index===current && side===currentSide && !navigate && !targetHash)return;
    const old = current >= 0 ? spreads[current] : null, oldSide=currentSide, forward=index*2+side>current*2+currentSide;
    const destination = targetHash || (narrow.matches&&side ? `#page-${String(index*2+2).padStart(2,'0')}` : `#${spreads[index].id}`);
    if(navigate) {
      spreads[index].querySelectorAll('.page-content').forEach(page=>{page.scrollTop=0;});
      if(location.hash!==destination)history.pushState(null,'',destination);
    }
    const finish = () => {
      document.dispatchEvent(new CustomEvent('chapterchange',{detail:spreads[current].id}));
      if(!navigate)return;

      const pane=spreads[current].querySelector(currentSide?'.page-right':'.page-left');
      const heading=(destination==='#research'&&document.getElementById('awards-title'))||(narrow.matches?(pane?.querySelector('h1:not([hidden]),h2:not([hidden])')||pane?.querySelector('.page-content')):null)||spreads[current].querySelector('h1,h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
    };
    // Snapshot before hiding the old spread; then reveal the destination under the turning leaf.
    // turnSheet creates its snapshot synchronously, before returning control to this task.
    document.dispatchEvent(new CustomEvent('beforechapterchange',{detail:{index,side,single:narrow.matches,targetHash:destination}}));
    const animate = old && (old!==spreads[index]||side!==oldSide) && binding?.animate && window.bookCurl && !motion.matches && !document.hidden;
    const startTurn=animate?()=>turnSheet(old,spreads[index],forward,finish,oldSide,side):null;
    current=index;currentSide=side;
    if(startTurn)startTurn();
    spreads.forEach((spread,i)=>{spread.hidden=i!==current;spread.dataset.side=currentSide?'right':'left';});
    document.querySelectorAll('.chapter-tabs a').forEach(link=>{if(link.dataset.chapter===spreads[current].id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    previous.disabled=current===0&&(!narrow.matches||currentSide===0);next.disabled=current===spreads.length-1&&(!narrow.matches||currentSide===1);
    previous.setAttribute('aria-label',narrow.matches?'Previous page':'Previous chapter');next.setAttribute('aria-label',narrow.matches?'Next page':'Next chapter');
    readout.textContent=`${String(current*2+1+(narrow.matches?currentSide:0)).padStart(2,'0')}${narrow.matches?'':'–'+String(current*2+2).padStart(2,'0')} / ${String(spreads.length*2).padStart(2,'0')} — ${labels[current]}`;
    if(current>=1&&current<=4)selectProject(projects[current-1]);
    document.dispatchEvent(new CustomEvent('chapterleave'));
    if(!startTurn)finish();
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[data-chapter]');
    if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;
    const index=spreadForHash(link.getAttribute('href'));if(index<0)return;
    event.preventDefault();showChapter(index,true,link.getAttribute('href'));
  });
  document.querySelectorAll('[data-cabinet]').forEach(button=>button.addEventListener('click',()=>selectProject(button.dataset.cabinet)));
  function step(direction){if(narrow.matches){const page=Math.max(0,Math.min(spreads.length*2-1,current*2+currentSide+direction));showChapter(Math.floor(page/2),true,null,page%2);}else showChapter(current+direction,true);}
  previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
  const restore=()=>showChapter(Math.max(0,spreadForHash(location.hash)),false,location.hash);
  window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
  motion.addEventListener('change',()=>{if(motion.matches)turn?.animation.finish();});
  window.addEventListener('resize',()=>{if(turn)turn.animation.finish();});
  narrow.addEventListener?.('change',()=>{if(turn){queued=[current,false,location.hash,0];turn.animation.finish();}else{const index=current;current=-1;showChapter(index,false,location.hash);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)turn?.animation.finish();});
  document.documentElement.dataset.projectNavigation='ready';selectProject(activeProject);
  reader.classList.add('reader-enhanced');restore();controls.hidden=false;document.dispatchEvent(new CustomEvent('readerready'));
})();
