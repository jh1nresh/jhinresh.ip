/* Glass-capsule slider. Left is night / Researcher. Right is day / Founder. */
(() => {
  const root = document.documentElement;
  const lens = document.querySelector('#view-switch');
  if (!lens) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = lens.querySelector('.lens-window');
  const capsule = lens.querySelector('.capsule');
  const mag = lens.querySelector('.capsule-mag');
  const scene = lens.querySelector('#desk-scene');
  if (scene && mag) {
    const copy = scene.cloneNode(true);
    copy.removeAttribute('id');
    mag.appendChild(copy);
  }

  let view = root.dataset.view === 'founder' ? 'founder' : 'researcher';
  let drag = null;

  function apply(t, settle) {
    const clamped = Math.min(1, Math.max(0, t));
    const win = stage.getBoundingClientRect();
    const cap = capsule.getBoundingClientRect().width || capsule.offsetWidth || 78;
    const travel = Math.max(0, win.width - cap);
    const x = clamped * travel;
    lens.style.setProperty('--t', clamped.toFixed(4));
    lens.style.setProperty('--x', x.toFixed(2));
    lens.style.setProperty('--track', `${win.width}px`);
    lens.style.setProperty('--win-h', `${stage.clientHeight || win.height}px`);
    lens.style.setProperty('--cap-w', `${cap}px`);
    capsule.style.left = `${x}px`;
    const settling = Boolean(settle) && !motion.matches;
    lens.classList.toggle('is-settling', settling);
    lens.setAttribute('aria-valuenow', String(Math.round(clamped * 100)));
    lens.setAttribute('aria-valuetext', clamped < 0.5 ? 'Researcher' : 'Founder');
  }

  function commit(next, settle) {
    view = next;
    root.dataset.view = next;
    apply(next === 'founder' ? 1 : 0, settle);
    lens.setAttribute('aria-valuenow', next === 'founder' ? '100' : '0');
    lens.setAttribute('aria-valuetext', next === 'founder' ? 'Founder' : 'Researcher');
  }

  function ratio(clientX) {
    const win = stage.getBoundingClientRect();
    const cap = capsule.getBoundingClientRect().width || capsule.offsetWidth || 78;
    const travel = Math.max(1, win.width - cap);
    return Math.min(1, Math.max(0, (clientX - win.left - cap / 2) / travel));
  }

  lens.addEventListener('keydown', (event) => {
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

  lens.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    drag = { startX: event.clientX, moved: false };
    lens.classList.add('is-dragging');
    lens.classList.remove('is-settling');
    lens.setPointerCapture?.(event.pointerId);
  });

  lens.addEventListener('pointermove', (event) => {
    if (!drag) return;
    if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true;
    if (drag.moved) apply(ratio(event.clientX), false);
  });

  function endDrag(event) {
    if (!drag) return;
    const moved = drag.moved;
    const at = ratio(event.clientX);
    drag = null;
    lens.classList.remove('is-dragging');
    if (!moved) {
      commit(view === 'founder' ? 'researcher' : 'founder', true);
      return;
    }
    commit(at >= 0.5 ? 'founder' : 'researcher', true);
  }

  lens.addEventListener('pointerup', endDrag);
  lens.addEventListener('pointercancel', () => {
    if (!drag) return;
    drag = null;
    lens.classList.remove('is-dragging');
    commit(view, false);
  });

  addEventListener('resize', () => commit(view, false));
  motion.addEventListener?.('change', () => commit(view, false));
  commit(view, false);
})();
