/* One visible chapter, one illustration clock. SVG scenes never require a play gesture. */
(() => {
  const toggle=document.querySelector('#motion-toggle');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};
  const entries=[];
  const savvy=document.querySelector('#savvy-workflow');
  if(savvy){
    const card=savvy.querySelector('#savvy-card'),pin=savvy.querySelector('#savvy-pin'),confirmed=savvy.querySelector('#savvy-confirmed');
    entries.push({svg:savvy,readout:document.querySelector('#savvy-readout'),duration:6.4,stillTime:6.4,render(t){
      const progress=2*smooth(t/6.4),travel=90*smooth(progress),stamp=smooth((progress-1.15)/.85);
      card.setAttribute('transform',`translate(${travel*Math.sqrt(3)/2} ${travel/2})`);
      confirmed.setAttribute('opacity',progress>=.98?'1':'0');pin.setAttribute('opacity',stamp>0?'1':'0');pin.setAttribute('transform',`translate(0 ${-15*(1-stamp)})`);
      return progress<.8?'01 / Save a link':progress<1.8?'02 / Review the place match':'03 / Map Stamp placed';
    }});
  }
  for(const svg of document.querySelectorAll('[data-project-scene]')){
    const scene=window.bookScenes?.[svg.dataset.projectScene],art=svg.querySelector('[data-scene-art]');
    if(!scene||!art)continue;
    entries.push({svg,readout:document.querySelector(`#${svg.dataset.projectScene}-readout`),duration:scene.duration,stillTime:scene.stillTime??scene.duration,render(t){art.innerHTML=scene.render(t);return scene.caption(t);}});
  }
  for(const entry of entries){entry.chapter=entry.svg.closest('[data-spread]');entry.visible=true;entry.elapsed=0;entry.readout?.removeAttribute('role');}
  let active=null,frame=0,last=null,lastDraw=null,userPaused=false,motionOptIn=false,transitioning=false;
  const enabled=()=>!userPaused&&(!motion.matches||motionOptIn);
  function draw(entry){
    const cycle=entry.elapsed%(entry.duration+2),t=Math.min(entry.duration,cycle);
    const message=entry.render(t);
    entry.svg.style.opacity=String(Math.min(1,cycle/.5,(entry.duration+2-cycle)/.5));
    entry.svg.dataset.time=t.toFixed(3);
    if(entry.readout&&entry.readout.textContent!==message)entry.readout.textContent=message;
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=lastDraw=null;}
  function tick(now){
    frame=0;
    if(!active||!active.visible||document.hidden||transitioning||!enabled()){last=null;return;}
    active.elapsed+=last===null?0:Math.min(.1,(now-last)/1000);last=now;
    if(lastDraw===null||now-lastDraw>=32){draw(active);lastDraw=now;}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    stop();active=entries.find(entry=>!entry.chapter.hidden)||null;
    if(toggle){toggle.hidden=!active;toggle.textContent=enabled()?'Pause illustrations':'Play illustrations';}
    if(!active)return;
    if(!enabled()){
      // Reduced motion receives a complete, meaningful still; an explicit pause retains its pose.
      if(motion.matches&&!motionOptIn&&!userPaused){active.elapsed=active.stillTime;draw(active);active.svg.style.opacity='1';}
      return;
    }
    if(active.visible&&!document.hidden&&!transitioning)frame=requestAnimationFrame(tick);
  }
  for(const entry of entries){entry.elapsed=.5;draw(entry);}
  // Keep the observer instance so every pane participates in the same visibility state.
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(changes=>{
      for(const entry of entries){const latest=changes.filter(change=>change.target===entry.svg).at(-1);if(latest)entry.visible=latest.isIntersecting;}
      sync();
    },{threshold:.05});entries.forEach(entry=>observer.observe(entry.svg));
  }
  toggle?.addEventListener('click',()=>{if(enabled())userPaused=true;else{userPaused=false;motionOptIn=true;}sync();});
  document.addEventListener('chapterleave',()=>{transitioning=true;stop();});
  document.addEventListener('chapterchange',()=>{transitioning=false;sync();});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',stop);
  motion.addEventListener('change',()=>{motionOptIn=false;sync();});
  sync();
})();
