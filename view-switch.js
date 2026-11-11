/* About, on the left, is day. Contact, on the right, is night. */
(() => {
  const root = document.documentElement;
  const sw = document.querySelector('#view-switch');
  const nav = document.querySelector('#index');
  if (!sw || !nav) return;
  const track = nav.querySelector('.nav-track') || nav;
  const links = [...track.querySelectorAll('a[href^="#"]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#menu-toggle');
  const hero = document.querySelector('#home');
  const bar = document.querySelector('.bar');
  const laterBg = document.querySelector('.bg-day');
  const storeKey = 'jhinresh-hour';

  function loadLater() {
    if (!laterBg) return;
    if (!laterBg.getAttribute('src')) {
      const src = laterBg.getAttribute('data-src');
      if (!src) return;
      laterBg.setAttribute('src', src);
    }
    const markReady = () => {
      root.classList.remove('day-failed');
      root.style.setProperty('--day-ready', '1');
    };
    const markFailed = () => {
      root.style.setProperty('--day-ready', '0');
      root.classList.add('day-failed');
      laterBg.removeAttribute('src');
    };
    if (laterBg.complete && laterBg.naturalWidth > 0) {
      markReady();
      return;
    }
    if (laterBg.complete) {
      markFailed();
      return;
    }
    root.style.setProperty('--day-ready', '0');
    laterBg.addEventListener?.('load', markReady, { once: true });
    laterBg.addEventListener?.('error', markFailed, { once: true });
  }
  loadLater();

  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  function storedHour() {
    const painted = parseFloat(root.style.getPropertyValue('--hour'));
    if (!Number.isNaN(painted)) return clamp(painted);
    try {
      const raw = globalThis.localStorage?.getItem(storeKey);
      if (raw != null) return clamp(Number(raw));
    } catch { /* private browsing */ }
    return 0;
  }

  let hour = storedHour();
  let committed = hour;
  let drag = null;
  let hovering = false;
  let suppressClick = false;
  let holdScroll = 0;
  let startY = globalThis.scrollY || 0;
  let persistTimer = 0;

  function label(value) {
    const now = Math.round(value * 100);
    if (now < 34) return 'Day';
    if (now > 66) return 'Night';
    return 'Dusk';
  }

  function markCopy(view) {
    document.querySelectorAll?.('.when-founder, .founder-frame').forEach((node) => {
      node.setAttribute?.('aria-hidden', view === 'founder' ? 'false' : 'true');
    });
    document.querySelectorAll?.('.when-researcher, .researcher-frame').forEach((node) => {
      node.setAttribute?.('aria-hidden', view === 'researcher' ? 'false' : 'true');
    });
  }

  function paint(value, settle) {
    const next = clamp(value);
    hour = next;
    const view = next < 0.5 ? 'founder' : 'researcher';
    const changed = root.dataset.view !== view;
    root.dataset.view = view;
    root.style.setProperty('--hour', next.toFixed(4));
    root.style.setProperty('--t', (1 - next).toFixed(4));
    sw.setAttribute('aria-valuenow', String(Math.round(next * 100)));
    sw.setAttribute('aria-valuetext', label(next));
    markCopy(view);
    const animate = Boolean(settle) && !motion.matches;
    root.classList.toggle('is-settling', animate);
    root.classList.toggle('is-scrubbing', !animate);
    if (changed && !motion.matches) {
      root.classList.remove('is-fading');
      void root.offsetWidth;
      root.classList.add('is-fading');
    }
    if (animate) {
      root.classList.remove('is-sweeping');
      void root.offsetWidth;
      root.classList.add('is-sweeping');
    } else {
      root.classList.remove('is-sweeping');
    }
  }

  function persist(value) {
    try { globalThis.localStorage?.setItem(storeKey, clamp(value).toFixed(4)); } catch { /* ignore */ }
  }

  function remember(value) {
    committed = clamp(value);
    if (typeof clearTimeout === 'function' && persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => persist(committed), 150);
  }

  function commit(value, settle) {
    remember(value);
    hovering = false;
    paint(committed, settle);
    if (settle && typeof clearTimeout === 'function' && persistTimer) {
      clearTimeout(persistTimer);
      persist(committed);
    }
  }

  function overflows() {
    return (nav.scrollWidth || 0) > (nav.clientWidth || 0) + 1;
  }

  function hourFromX(clientX) {
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left + (track.scrollLeft || 0);
    return clamp(x / Math.max(1, track.scrollWidth || rect.width));
  }

  function hourFromScroll() {
    if (!links.length || !document.getElementById) return null;
    const tops = [];
    for (const link of links) {
      const id = (link.getAttribute('href') || '').slice(1);
      const section = id && document.getElementById(id);
      if (!section) return null;
      const top = section.getBoundingClientRect?.().top;
      tops.push((typeof top === 'number' ? top : 0) + (globalThis.scrollY || 0));
    }
    const scrolling = document.scrollingElement || document.documentElement;
    const viewport = globalThis.innerHeight || scrolling.clientHeight || 1;
    const maxScroll = Math.max(1, (scrolling.scrollHeight || 0) - viewport);
    const y = Math.min(maxScroll, globalThis.scrollY || 0);
    const points = tops.map((top) => Math.min(maxScroll, Math.max(0, top)));
    points[points.length - 1] = maxScroll;
    if (y <= points[0]) return 0;
    const last = points.length - 1;
    if (y >= points[last]) return 1;
    for (let i = 0; i < last; i += 1) {
      if (y <= points[i + 1]) {
        const span = Math.max(1, points[i + 1] - points[i]);
        return (i + (y - points[i]) / span) / last;
      }
    }
    return 1;
  }

  sw.addEventListener('keydown', (event) => {
    loadLater();
    const key = event.key;
    if (key === 'ArrowRight' || key === 'ArrowUp') {
      event.preventDefault();
      commit(committed + 0.1, true);
    } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
      event.preventDefault();
      commit(committed - 0.1, true);
    } else if (key === 'Home') {
      event.preventDefault();
      commit(0, true);
    } else if (key === 'End') {
      event.preventDefault();
      commit(1, true);
    }
  });

  track.addEventListener('pointerdown', (event) => {
    if (drag) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    loadLater();
    const link = event.target && event.target.closest ? event.target.closest('a') : null;
    drag = {
      startX: event.clientX,
      moved: false,
      id: event.pointerId,
      pointerType: event.pointerType,
      touchScroll: event.pointerType === 'touch' && overflows(),
      link: links.includes(link) ? link : null,
    };
    hovering = false;
    if (!drag.touchScroll) track.setPointerCapture?.(event.pointerId);
  });
  track.addEventListener('pointermove', (event) => {
    if (drag && event.pointerId === drag.id) {
      if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true;
      if (drag.touchScroll) return;
      if (drag.moved) paint(hourFromX(event.clientX), false);
      return;
    }
    if (drag || event.pointerType !== 'mouse') return;
    hovering = true;
    paint(hourFromX(event.clientX), false);
  });
  function modifiedClick(event) {
    return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0;
  }
  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    const at = hourFromX(event.clientX);
    const link = drag.link;
    const touchScroll = drag.touchScroll;
    drag = null;
    if (moved && touchScroll) {
      hovering = false;
      return;
    }
    if (moved) {
      suppressClick = true;
      commit(at, true);
      return;
    }
    if (link && !modifiedClick(event)) {
      holdScroll = Date.now() + 1500;
      commit(links.indexOf(link) / Math.max(1, links.length - 1), true);
    }
    hovering = false;
  }
  track.addEventListener('pointerup', finishDrag);
  addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    const touch = drag.pointerType === 'touch';
    drag = null;
    if (moved && !touch) {
      suppressClick = true;
      commit(hour, true);
      return;
    }
    paint(committed, false);
  });
  track.addEventListener('pointerleave', () => {
    if (drag || !hovering) return;
    hovering = false;
    paint(committed, true);
  });
  addEventListener('click', (event) => {
    if (!suppressClick) return;
    const target = event.target;
    if (target && track.contains?.(target)) return;
    suppressClick = false;
  });
  track.addEventListener('click', (event) => {
    const target = event.target;
    const link = target && target.closest ? target.closest('a') : null;
    if (suppressClick) {
      suppressClick = false;
      if (link) event.preventDefault();
      return;
    }
    if (!link || !links.includes(link) || modifiedClick(event)) return;
    const index = links.indexOf(link);
    holdScroll = Date.now() + 1500;
    commit(index / Math.max(1, links.length - 1), true);
    if (menu) {
      menu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      menu.textContent = 'Menu';
    }
  });

  if (menu) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      menu.textContent = open ? 'Close' : 'Menu';
    });
  }

  function trackScroll() {
    const y = globalThis.scrollY || 0;
    const span = (hero && hero.offsetHeight) || globalThis.innerHeight || 1;
    const progress = Math.min(1, Math.max(0, y / Math.max(1, span)));
    root.style.setProperty('--scroll', progress.toFixed(4));
    bar?.classList.toggle('is-scrolled', y > 24);
    if (y === startY || drag || Date.now() < holdScroll) return;
    startY = -1;
    const fromPage = hourFromScroll();
    if (fromPage == null || Math.abs(fromPage - committed) < 0.004) return;
    if (hovering) {
      remember(fromPage);
      return;
    }
    commit(fromPage, false);
  }
  addEventListener('scroll', trackScroll, { passive: true });
  addEventListener('resize', trackScroll);
  motion.addEventListener?.('change', () => paint(committed, false));
  paint(committed, false);
  trackScroll();
})();
