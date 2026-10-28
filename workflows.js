/* One synthetic Savvy mechanism, from a retained link card to a map marker. */
(() => {
  const figure = document.querySelector('#savvy-workflow');
  const controls = document.querySelector('.savvy-controls');
  if (!figure || !controls) return;
  const card = figure.querySelector('#savvy-card');
  const pin = figure.querySelector('#savvy-pin');
  const confirmed = figure.querySelector('#savvy-confirmed');
  const readout = document.querySelector('#savvy-readout');
  const play = document.querySelector('#savvy-play');
  const reset = document.querySelector('#savvy-reset');
  const steps = [...document.querySelectorAll('[data-savvy-step]')];
  const chapter = figure.closest('[data-spread]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 6400;
  let progress = 0, target = 0, elapsed = 0, playing = false, started = false, complete = false;
  let frame = 0, lastTime = null, visible = true;
  const smooth = value => { const x = Math.max(0, Math.min(1, value)); return x*x*(3-2*x); };
  function draw() {
    const travel = 90*smooth(progress);
    card.setAttribute('transform', `translate(${travel*Math.sqrt(3)/2} ${travel/2})`);
    confirmed.setAttribute('opacity', progress >= .98 ? '1' : '0');
    const stamp = smooth((progress-1.15)/.85);
    pin.setAttribute('opacity', stamp > 0 ? '1' : '0');
    pin.setAttribute('transform', `translate(0 ${-15*(1-stamp)})`);
    const phase = progress < .8 ? 0 : progress < 1.8 ? 1 : 2;
    steps.forEach((step,index) => step.setAttribute('aria-pressed', String(index===phase)));
    const message = phase===0 ? '01 / Save a link' : phase===1 ? '02 / Review the place match' : progress < 1.995 ? '03 / Place the Map Stamp' : '03 / Map Stamp placed';
    if (readout.textContent !== message) readout.textContent = message;
    play.textContent = playing ? 'Pause story' : complete ? 'Replay story' : started ? 'Resume story' : 'Play the story';
    play.setAttribute('aria-pressed', String(playing));
  }
  function stop() { cancelAnimationFrame(frame); frame=0; lastTime=null; }
  function finish() { stop(); progress=target=2; elapsed=duration; playing=false; complete=true; draw(); }
  function tick(now) {
    frame=0;
    if (!visible || document.hidden || chapter?.hidden) { lastTime=null; return; }
    const dt=lastTime===null?16:Math.min(33,now-lastTime);lastTime=now;
    if (playing) {
      elapsed+=dt;progress=2*smooth(elapsed/duration);
      if (elapsed>=duration) { finish(); return; }
    } else {
      progress+=(target-progress)*(1-Math.exp(-dt/160));
      if (Math.abs(target-progress)<.002) progress=target;
    }
    draw();
    if (playing || progress!==target) frame=requestAnimationFrame(tick); else lastTime=null;
  }
  function resume() {
    if (motion.matches) { if (playing) finish(); else { stop(); progress=target;draw(); } }
    else if (visible && !document.hidden && !chapter?.hidden && (playing || progress!==target) && !frame) { lastTime=null;frame=requestAnimationFrame(tick); }
  }
  play.addEventListener('click', () => {
    if (playing) { playing=false;target=progress;stop();draw();return; }
    if (!started || complete) { progress=target=elapsed=0;started=true;complete=false; }
    playing=true;draw();resume();
  });
  reset.addEventListener('click', () => { stop();progress=target=elapsed=0;playing=started=complete=false;draw(); });
  steps.forEach(step => step.addEventListener('click', () => { stop();playing=started=complete=false;elapsed=0;target=Number(step.dataset.savvyStep);draw();resume(); }));
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible=entries[entries.length-1].isIntersecting;if(visible)resume();else stop();
  }).observe(figure);
  document.addEventListener('visibilitychange', () => {if(document.hidden)stop();else resume();});
  document.addEventListener('chapterchange', () => {if(chapter?.hidden)stop();else resume();});
  motion.addEventListener('change', resume);
  controls.hidden=false;draw();
})();
