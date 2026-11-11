/* Researcher is night, on the left. Founder is day, on the right. */
(() => {
  const root = document.documentElement;
  const sw = document.querySelector('#view-switch');
  if (!sw) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#index');
  const hero = document.querySelector('#home');
  let view = root.dataset.view === 'founder' ? 'founder' : 'researcher';
  let drag = null;
  let heroDrag = null;

  function paint(t, settle) {
    const clamped = Math.min(1, Math.max(0, t));
    root.style.setProperty('--t', clamped.toFixed(4));
    const animate = Boolean(settle) && !motion.matches;
    root.classList.toggle('is-settling', animate);
    if (animate) {
      root.classList.remove('is-sweeping');
      void root.offsetWidth;
      root.classList.add('is-sweeping');
    } else {
      root.classList.remove('is-sweeping');
    }
  }

  function commit(next, settle) {
    view = next;
    root.dataset.view = next;
    sw.setAttribute('aria-checked', next === 'founder' ? 'true' : 'false');
    paint(next === 'founder' ? 1 : 0, settle);
  }

  function ratio(clientX) {
    const rect = sw.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width)));
  }

  sw.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'End') {
      event.preventDefault();
      commit('founder', true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'Home') {
      event.preventDefault();
      commit('researcher', true);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      commit(view === 'founder' ? 'researcher' : 'founder', true);
    }
  });

  sw.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    drag = { startX: event.clientX, moved: false };
    root.classList.add('is-dragging');
    root.classList.remove('is-settling');
    sw.setPointerCapture?.(event.pointerId);
  });
  sw.addEventListener('pointermove', (event) => {
    if (!drag) return;
    if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true;
    if (drag.moved) paint(ratio(event.clientX), false);
  });
  sw.addEventListener('pointerup', (event) => {
    if (!drag) return;
    const moved = drag.moved;
    const at = ratio(event.clientX);
    drag = null;
    root.classList.remove('is-dragging');
    if (!moved) commit(view === 'founder' ? 'researcher' : 'founder', true);
    else commit(at >= 0.5 ? 'founder' : 'researcher', true);
  });
  sw.addEventListener('pointercancel', () => {
    if (!drag) return;
    drag = null;
    root.classList.remove('is-dragging');
    commit(view, false);
  });

  if (hero) {
    hero.addEventListener('pointerdown', (event) => {
      if (event.target.closest && event.target.closest('#view-switch, a, button, summary')) return;
      heroDrag = { x: event.clientX, y: event.clientY };
    });
    hero.addEventListener('pointerup', (event) => {
      if (!heroDrag) return;
      const dx = event.clientX - heroDrag.x;
      const dy = event.clientY - heroDrag.y;
      heroDrag = null;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
      commit(dx > 0 ? 'founder' : 'researcher', true);
    });
    hero.addEventListener('pointercancel', () => { heroDrag = null; });
  }

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      menu.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('a')) return;
      menu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      menu.textContent = 'Menu';
    });
  }

  addEventListener('resize', () => commit(view, false));
  motion.addEventListener?.('change', () => commit(view, false));
  commit(view, false);
})();
