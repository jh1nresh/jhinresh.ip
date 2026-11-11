import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../view-switch.js', import.meta.url), 'utf8');
const checks = [];

for (const id of ['top', 'work', 'index', 'home', 'news', 'project-savvy', 'project-output', 'project-eznest', 'project-maiat', 'about', 'research', 'blog', 'contact', 'hero-title', 'awards-title', 'view-switch']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
}
checks.push('academic page keeps the section anchors and the switch');

assert.match(html, /role="switch"/);
assert.match(html, /aria-checked="false"/);
assert.match(html, /aria-describedby="view-switch-state"/);
assert.match(html, /Off is the Researcher view\. On is the Founder view\./);
assert.match(html, /id="menu-toggle"/);
assert.match(html, /aria-controls="index"/);
assert.match(html, /class="world"/);
assert.ok(html.includes('./assets/bg/bg-night.webp'));
assert.ok(html.includes('data-src="./assets/bg/bg-day.webp"'));
assert.match(css, /scale\(calc\(1 \+ var\(--t\) \* 0\.04\)\)/);
assert.match(css, /\.bg-stack \{ transform: none; \}/);
assert.match(js, /ArrowRight/);
assert.match(js, /ArrowLeft/);
assert.match(js, /event\.key === ' '/);
assert.match(js, /prefers-reduced-motion/);
assert.match(css, /span\.when-researcher \{ display: inline; \}/);
assert.match(css, /\.skip-link \{[\s\S]*?z-index:\s*6/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /animation:\s*none/);
checks.push('the switch is keyboard accessible and reduced motion drops the sweep');

for (const fact of [
  'Base Batches 003 Student Track',
  'BNB Chain US College Hackathon',
  'BNB Chain Good Vibe Coding Hackathon',
  'Uniswap Hook Incubator',
  'Solana Solaris Accelerator',
  'Solana Foundation Grants',
  'Jito Grid Hackathon',
  'SOON Genesis Hackathon',
  'Taipei Blockchain Week Hackathon',
  'Solana Colosseum Breakout',
  'XueDao Connect Hackathon',
  'EasyA Consensus Hackathon',
]) assert.ok(html.includes(fact), fact);
checks.push('all twelve recognition facts remain');

for (const href of [
  'https://sav-e-landing.vercel.app',
  'https://testflight.apple.com/join/aSVm9hRJ',
  'https://output.jeezlabs.io/',
  'https://eznest.jeezlabs.io/',
  'https://app.maiat.io',
  'mailto:jhinresh@gmail.com',
  'https://github.com/jh1nresh',
  'https://jhinresh.com/',
]) assert.ok(html.includes(href), href);
assert.equal(html.includes('scholar.google'), false);
checks.push('project, contact, and canonical links remain, with no invented Scholar URL');

for (const sentence of [
  'Devnet sandbox',
  'does not offer production printing or production escrow',
  'not a measurement',
  'No real approval, signature, or payment is performed',
  'Public website captured 28 Oct 2026',
  'Food posts and travel links are easy to save and hard to find again.',
  'I’m designing Savvy around three steps: save the source, review the place match, and keep the confirmed place as a Map Stamp.',
]) assert.ok(html.includes(sentence), sentence);
assert.ok(html.includes('class="founder-frame"') && html.includes('class="researcher-frame"'));
checks.push('both views keep the problem, approach, result, and the project limits');

function harness(reduced) {
  const listeners = {};
  function el(selector, rect) {
    const node = {
      selector,
      attrs: {},
      dataset: {},
      children: [],
      rect: rect || { left: 0, top: 0, width: 300, height: 92 },
      offsetWidth: rect?.width || 78,
      clientHeight: rect?.height || 92,
      style: { setProperty() {}, removeProperty() {} },
      classList: {
        set: new Set(),
        add(name) { this.set.add(name); },
        remove(name) { this.set.delete(name); },
        contains(name) { return this.set.has(name); },
        toggle(name, on) {
          if (on === undefined) on = !this.set.has(name);
          if (on) this.set.add(name);
          else this.set.delete(name);
        },
      },
      setAttribute(name, value) { this.attrs[name] = String(value); },
      getAttribute(name) { return this.attrs[name]; },
      removeAttribute(name) { delete this.attrs[name]; },
      addEventListener(type, fn) { (listeners[`${selector}:${type}`] ||= []).push(fn); },
      appendChild(child) { this.children.push(child); },
      cloneNode() { return el(`${selector}-copy`, rect); },
      getBoundingClientRect() { return this.rect; },
      querySelector(query) {
        if (query === '.lens-window') return stage;
        if (query === '.capsule') return capsule;
        if (query === '.capsule-mag') return mag;
        if (query === '#desk-scene') return scene;
        return null;
      },
    };
    return node;
  }
  const stage = el('.lens-window', { left: 10, top: 0, width: 300, height: 92 });
  const capsule = el('.capsule', { left: 0, top: 0, width: 78, height: 110 });
  const mag = el('.capsule-mag');
  const scene = el('#desk-scene');
  const lens = el('#view-switch', { left: 0, top: 0, width: 320, height: 110 });
  lens.querySelector = (query) => {
    if (query === '.lens-window') return stage;
    if (query === '.capsule') return capsule;
    if (query === '.capsule-mag') return mag;
    if (query === '#desk-scene') return scene;
    return null;
  };
  const root = {
    dataset: { view: 'researcher' },
    style: { setProperty() {} },
    offsetWidth: 12,
    classList: {
      set: new Set(),
      add(name) { this.set.add(name); },
      remove(name) { this.set.delete(name); },
      contains(name) { return this.set.has(name); },
      toggle(name, on) {
        if (on === undefined) on = !this.set.has(name);
        if (on) this.set.add(name);
        else this.set.delete(name);
      },
    },
  };
  const motion = { matches: reduced, addEventListener() {} };
  const context = {
    document: { documentElement: root, querySelector: (query) => query === '#view-switch' ? lens : null },
    matchMedia: () => motion,
    addEventListener() {},
  };
  vm.createContext(context);
  vm.runInContext(js, context);
  function emit(type, event) {
    for (const fn of listeners[`#view-switch:${type}`] || []) fn(event);
  }
  return { root, lens, emit };
}

let ui = harness(false);
assert.equal(ui.root.dataset.view, 'researcher');
assert.equal(ui.lens.attrs['aria-checked'], 'false');
ui.emit('keydown', { key: 'ArrowRight', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'founder');
assert.equal(ui.lens.attrs['aria-checked'], 'true');
assert.equal(ui.root.classList.contains('is-settling'), true);
assert.equal(ui.root.classList.contains('is-sweeping'), true);
ui.emit('keydown', { key: 'ArrowLeft', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'researcher');
ui.emit('keydown', { key: ' ', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'founder');
ui.emit('keydown', { key: 'Enter', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'researcher');
ui.emit('click', { detail: 0 });
assert.equal(ui.root.dataset.view, 'founder', 'a synthesized click toggles the view');
ui.emit('click', { detail: 0 });
assert.equal(ui.root.dataset.view, 'researcher');
ui.emit('pointerdown', { button: 0, pointerType: 'mouse', clientX: 20, pointerId: 1 });
ui.emit('pointermove', { clientX: 280, pointerId: 1 });
ui.emit('pointerup', { clientX: 280, pointerId: 1 });
assert.equal(ui.root.dataset.view, 'founder');
ui.emit('pointerdown', { button: 0, pointerType: 'touch', clientX: 280, pointerId: 2 });
ui.emit('pointermove', { clientX: 30, pointerId: 2 });
ui.emit('pointerup', { clientX: 30, pointerId: 2 });
assert.equal(ui.root.dataset.view, 'researcher');
ui.emit('pointerdown', { button: 0, pointerType: 'mouse', clientX: 20, pointerId: 6 });
ui.emit('pointermove', { clientX: 100, pointerId: 6 });
ui.emit('pointerup', { clientX: 100, pointerId: 6 });
assert.equal(ui.root.dataset.view, 'researcher', 'a short drag snaps back to Researcher');
assert.equal(ui.root.classList.contains('is-settling'), true);
ui.emit('pointerdown', { button: 0, pointerType: 'mouse', clientX: 40, pointerId: 3 });
ui.emit('pointerup', { clientX: 41, pointerId: 3 });
assert.equal(ui.root.dataset.view, 'researcher', 'a click on Researcher keeps Researcher');
ui.emit('pointerdown', { button: 0, pointerType: 'mouse', clientX: 280, pointerId: 5 });
ui.emit('pointerup', { clientX: 281, pointerId: 5 });
assert.equal(ui.root.dataset.view, 'founder', 'a click on Founder selects Founder');
ui.emit('click', { detail: 0 });
assert.equal(ui.root.dataset.view, 'founder', 'a click after a pointer release does not toggle again');
ui.emit('pointerdown', { button: 0, pointerType: 'mouse', clientX: 20, pointerId: 4 });
ui.emit('pointermove', { clientX: 280, pointerId: 4 });
ui.emit('pointercancel', { clientX: 280, pointerId: 4 });
assert.equal(ui.root.dataset.view, 'founder', 'a cancelled drag keeps the committed view');
assert.equal(ui.lens.attrs['aria-checked'], 'true');
assert.equal(ui.root.classList.contains('is-dragging'), false);
assert.equal(ui.root.classList.contains('is-settling'), false);
ui.emit('click', { detail: 0 });
assert.equal(ui.root.dataset.view, 'researcher', 'a click after pointer cancellation still toggles');
checks.push('drag snaps to the nearest side; keys and click flip the view');

ui = harness(true);
ui.emit('keydown', { key: 'ArrowRight', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'founder');
assert.equal(ui.lens.attrs['aria-checked'], 'true');
assert.equal(ui.root.classList.contains('is-settling'), false);
assert.equal(ui.root.classList.contains('is-sweeping'), false);
checks.push('reduced motion commits the end state without the settle animation');

console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
