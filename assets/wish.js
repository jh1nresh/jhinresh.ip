// A short, optional decorative meteor shower. No loop, sound, or tracking.
(() => {
  const button = document.querySelector('#make-wish');
  const sky = document.querySelector('#wish-sky');
  const status = document.querySelector('#wish-status');
  if (!button || !sky || !status) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  let busy = false;
  let runId = 0;
  const stop = () => {
    runId++;
    animations.forEach(animation => animation.cancel());
    animations = []; sky.replaceChildren(); busy = false;
    button.removeAttribute('aria-disabled');
  };
  button.addEventListener('click', async () => {
    if (busy) return;
    status.textContent = 'Here’s to your next good idea.';
    if (reduced.matches || typeof Element.prototype.animate !== 'function') return;
    busy = true; button.setAttribute('aria-disabled', 'true');
    const id = ++runId;
    for (let index = 0; index < 7; index++) {
      const meteor = document.createElement('span'); meteor.className = 'wish-meteor';
      meteor.style.right = `${6 + index * 9}%`;
      meteor.style.top = `${13 + index * 5}%`;
      sky.append(meteor);
      animations.push(meteor.animate([
        {transform:'translate(90px,-70px) rotate(-42deg)',opacity:0,offset:0},
        {transform:'translate(25px,-20px) rotate(-42deg)',opacity:.8,offset:.2},
        {transform:'translate(-210px,180px) rotate(-42deg)',opacity:0,offset:1}
      ],{duration:1000,delay:index*80,easing:'linear',fill:'both'}));
    }
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    if (id === runId) stop();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  addEventListener('pagehide', stop);
})();
