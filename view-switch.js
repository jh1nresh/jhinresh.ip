/* Researcher is night, on the left. Founder is day, on the right. */
(() => {
  const root = document.documentElement;
  const sw = document.querySelector('#view-switch');
  if (!sw) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#index');
  const hero = document.querySelector('#home');
  const laterBg = document.querySelector('.bg-day');
  function loadLater() {
    if (!laterBg || laterBg.getAttribute('src')) return;
    const src = laterBg.getAttribute('data-src');
    if (!src) return;
    laterBg.addEventListener?.('load', () => root.style.setProperty('--day-ready', '1'), { once: true });
    laterBg.addEventListener?.('error', () => root.style.setProperty('--day-ready', '0'), { once: true });
    laterBg.setAttribute('src', src);
  }
  if (typeof requestIdleCallback === 'function') requestIdleCallback(loadLater, { timeout: 1500 });
  else addEventListener('load', () => setTimeout(loadLater, 200));
  let view = root.dataset.view === 'founder' ? 'founder' : 'researcher';
  let drag = null;
  let heroDrag = null;
  let fromPointer = false;

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

  function commit(next, settle, animateSnap) {
    const changed = view !== next;
    view = next;
    root.dataset.view = next;
    sw.setAttribute('aria-checked', next === 'founder' ? 'true' : 'false');
    paint(next === 'founder' ? 1 : 0, settle && (changed || animateSnap));
  }

  function ratio(clientX) {
    const rect = sw.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width)));
  }

  sw.addEventListener('keydown', (event) => {
    loadLater();
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
    if (drag) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    loadLater();
    drag = { startX: event.clientX, moved: false, id: event.pointerId };
    root.classList.add('is-dragging');
    root.classList.remove('is-settling');
    sw.setPointerCapture?.(event.pointerId);
  });
  sw.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true;
    if (drag.moved) paint(ratio(event.clientX), false);
  });
  sw.addEventListener('pointerup', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    const at = ratio(event.clientX);
    drag = null;
    root.classList.remove('is-dragging');
    fromPointer = true;
    if (typeof setTimeout === 'function') setTimeout(() => { fromPointer = false; }, 0);
    if (!moved) commit(view === 'founder' ? 'researcher' : 'founder', true);
    else commit(at >= 0.5 ? 'founder' : 'researcher', true, true);
  });
  sw.addEventListener('pointercancel', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    root.classList.remove('is-dragging');
    commit(view, false);
  });
  sw.addEventListener('click', (event) => {
    if (fromPointer) {
      fromPointer = false;
      return;
    }
    commit(view === 'founder' ? 'researcher' : 'founder', true);
  });

  if (hero) {
    hero.addEventListener('pointerdown', (event) => {
      loadLater();
      if (heroDrag) return;
      if (event.target.closest && event.target.closest('#view-switch, a, button, summary')) return;
      heroDrag = { x: event.clientX, y: event.clientY, id: event.pointerId };
      hero.setPointerCapture?.(event.pointerId);
    });
    hero.addEventListener('pointerup', (event) => {
      if (!heroDrag || event.pointerId !== heroDrag.id) return;
      const dx = event.clientX - heroDrag.x;
      const dy = event.clientY - heroDrag.y;
      heroDrag = null;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
      commit(dx > 0 ? 'founder' : 'researcher', true);
    });
    hero.addEventListener('pointercancel', (event) => {
      if (!heroDrag || event.pointerId !== heroDrag.id) return;
      heroDrag = null;
    });
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

  const bar = document.querySelector('.bar');
  function trackScroll() {
    const y = globalThis.scrollY || 0;
    const span = (hero && hero.offsetHeight) || globalThis.innerHeight || 1;
    const progress = Math.min(1, Math.max(0, y / Math.max(1, span)));
    root.style.setProperty('--scroll', progress.toFixed(4));
    bar?.classList.toggle('is-scrolled', y > 24);
  }
  addEventListener('scroll', trackScroll, { passive: true });
  addEventListener('resize', () => { commit(view, false); trackScroll(); });
  motion.addEventListener?.('change', () => commit(view, false));
  commit(view, false);
  trackScroll();
})();
