/* The illustration has one bounded mechanism. All drawer parts move together. */
(() => {
  const figure = document.querySelector('#project-cabinet');
  const controls = document.querySelector('.cabinet-controls');
  const readout = document.querySelector('#cabinet-readout');
  if (!figure || !controls || !readout || document.documentElement.dataset.projectNavigation !== 'ready') return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const drawers = [...figure.querySelectorAll('[data-drawer]')];
  const descriptions = {savvy: 'Savvy / Personal place memory', output: 'OUTPUT / Print-shop collaboration', eznest: 'EZNest / Artwork nesting', maiat: 'Maiat + Dojo / Agent trust'};
  let selected = document.documentElement.dataset.activeProject || 'savvy';
  let positions = drawers.map(drawer => drawer.dataset.drawer === selected ? 28 : 0);
  let frame = 0, lastTime = null, visible = true;
  function draw(settled) {
    drawers.forEach((drawer, i) => drawer.setAttribute('transform', `translate(${-positions[i] * Math.sqrt(3) / 2} ${positions[i] / 2})`));
    controls.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cabinet === selected)));
    const message = settled ? descriptions[selected] : `Opening ${({savvy: 'Savvy', output: 'OUTPUT', eznest: 'EZNest', maiat: 'Maiat + Dojo'})[selected]}…`;
    if (readout.textContent !== message) readout.textContent = message;
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = null; }
  function targets() { return drawers.map(drawer => drawer.dataset.drawer === selected ? 28 : 0); }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) { lastTime = null; return; }
    const dt = lastTime === null ? 16 : Math.min(33, now - lastTime);
    lastTime = now;
    const goal = targets();
    positions = positions.map((position, i) => {
      const next = position + (goal[i] - position) * (1 - Math.exp(-dt / 150));
      return Math.abs(goal[i] - next) < .02 ? goal[i] : next;
    });
    const settled = positions.every((position, i) => position === goal[i]);
    draw(settled);
    if (!settled) frame = requestAnimationFrame(tick); else lastTime = null;
  }
  function resume() {
    if (motion.matches) { stop(); positions = targets(); draw(true); }
    else if (visible && !document.hidden && !frame) { lastTime = null; frame = requestAnimationFrame(tick); }
  }
  document.addEventListener('projectchange', event => {
    if (!(event.detail in descriptions)) return;
    selected = event.detail; resume();
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) resume(); else stop();
  }).observe(figure);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else resume(); });
  motion.addEventListener('change', resume);
  controls.hidden = false;
  draw(true);
})();
