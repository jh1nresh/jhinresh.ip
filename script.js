/* Pointer light and grid parallax for the scrolling page. No page turns. */
(() => {
  const root = document.documentElement;
  const world = document.querySelector('.world');
  const toggle = document.querySelector('#motion-toggle');
  const menu = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#index');
  const bar = document.querySelector('.bar');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = motion.matches;
  let frame = 0;
  let px = 0;
  let py = 0;

  function measure() {
    if (bar) root.style.setProperty('--bar', `${bar.offsetHeight}px`);
  }

  function paint() {
    frame = 0;
    const playing = !paused;
    root.toggleAttribute('data-motion-paused', paused);
    root.toggleAttribute('data-motion-opt-in', playing && motion.matches);
    if (toggle) toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    if (!playing) {
      root.style.removeProperty('--mx');
      root.style.removeProperty('--my');
      if (world) {
        world.style.removeProperty('--px');
        world.style.removeProperty('--py');
      }
      return;
    }
    if (!world) return;
    world.style.setProperty('--px', px.toFixed(3));
    world.style.setProperty('--py', py.toFixed(3));
  }

  function setMenu(open) {
    if (!menu || !nav) return;
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.textContent = open ? 'Close' : 'Menu';
  }

  menu?.addEventListener('click', () => {
    setMenu(menu.getAttribute('aria-expanded') !== 'true');
  });
  nav?.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a')) setMenu(false);
  });
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

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
      root.style.setProperty('--mx', `${event.clientX}px`);
      root.style.setProperty('--my', `${event.clientY}px`);
      if (!frame) frame = requestAnimationFrame(paint);
    }, { passive: true });
  }
  addEventListener('resize', measure);
  measure();
  paint();
})();
