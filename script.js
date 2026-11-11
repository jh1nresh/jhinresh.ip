/* Light sky motion for the scrolling page. No page turns. */
(() => {
  const root = document.documentElement;
  const world = document.querySelector('.world');
  const toggle = document.querySelector('#motion-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = motion.matches;
  let frame = 0;
  let px = 0;
  let py = 0;
  let scrollY = 0;

  function paint() {
    frame = 0;
    const playing = !paused;
    root.toggleAttribute('data-motion-paused', paused);
    root.toggleAttribute('data-motion-opt-in', playing && motion.matches);
    if (toggle) toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    if (!world) return;
    if (!playing) {
      world.style.removeProperty('--px');
      world.style.removeProperty('--py');
      world.style.removeProperty('--sy');
      return;
    }
    world.style.setProperty('--px', px.toFixed(3));
    world.style.setProperty('--py', py.toFixed(3));
    world.style.setProperty('--sy', String(Math.min(scrollY, 800)));
  }

  toggle?.addEventListener('click', () => {
    paused = !paused;
    paint();
  });
  motion.addEventListener('change', () => {
    paused = motion.matches;
    paint();
  });
  if (fine.matches) {
    addEventListener('pointermove', (event) => {
      if (paused) return;
      px = event.clientX / innerWidth - 0.5;
      py = event.clientY / innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(paint);
    }, { passive: true });
  }
  addEventListener('scroll', () => {
    scrollY = window.scrollY || 0;
    if (!paused && !frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
  paint();
})();
