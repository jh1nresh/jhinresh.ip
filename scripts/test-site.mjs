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

assert.match(html, /role="slider"/);
assert.match(html, /aria-valuemin="0"/);
assert.match(html, /aria-valuemax="100"/);
assert.match(html, /aria-valuetext="Day"/);
assert.match(html, /DOMContentLoaded/);
assert.match(html, /setAttribute\('aria-hidden'/);
assert.match(js, /event\.ctrlKey/);
assert.equal(html.includes('label-researcher'), false);
assert.equal(html.includes('>Researcher<'), false);
assert.match(html, /id="menu-toggle"/);
assert.match(html, /aria-controls="index"/);
assert.match(html, /class="world"/);
assert.ok(html.includes('./assets/bg/bg-night.webp'));
assert.ok(html.includes('data-src="./assets/bg/bg-day.webp"'));
assert.match(css, /scale\(calc\(1 \+ var\(--t\) \* 0\.04 \+ var\(--scroll\) \* 0\.025\)\)/);
assert.match(css, /\.bg-stack \{ transform: none; \}/);
assert.match(css, /var\(--day-ready\)/);
assert.match(css, /html\.day-failed \.tone-day \{ opacity: var\(--t\); \}/);
assert.match(js, /removeAttribute\('src'\)/);
assert.match(js, /ArrowRight/);
assert.match(js, /ArrowLeft/);
assert.match(js, /key === 'Home'/);
assert.match(js, /key === 'End'/);
assert.match(js, /prefers-reduced-motion/);
assert.match(css, /span\.when-researcher \{ display: inline; \}/);
assert.match(css, /\.skip-link \{[\s\S]*?z-index:\s*6/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /animation:\s*none/);
assert.match(css, /\.7s cubic-bezier\(\.22, \.7, \.2, 1\)/);
assert.match(css, /#index, \.nav-track \{ touch-action: pan-x pan-y; \}/);
assert.match(css, /\.tone-day \{[^}]*\* 0\.32\)/);
assert.match(css, /\.tone-night \{[^}]*\* 0\.38\)/);
assert.match(css, /min-height:\s*44px/);
assert.match(css, /min-width:\s*max-content/);
const bar = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
const nav = bar.slice(bar.indexOf('<nav'), bar.indexOf('</nav>'));
assert.match(nav, /id="view-switch"/);
assert.match(nav, /href="#home"/);
assert.match(nav, /href="#contact"/);
assert.equal(nav.includes('>Researcher<'), false);
const hero = html.slice(html.indexOf('id="home"'), html.indexOf('id="news"'));
assert.equal(hero.includes('view-switch'), false);
assert.equal(html.includes('mode-thumb'), false);
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
assert.match(html, /savvy-web-20261028\.png"[^>]*loading="lazy"/);
assert.match(html, /maiat\.png"[^>]*loading="lazy"/);
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
  const lens = el('#view-switch', { left: 0, top: 0, width: 300, height: 36 });
  const hrefs = ['#home', '#news', '#work', '#research', '#blog', '#contact'];
  const links = hrefs.map((href, index) => {
    const link = el(`a${href}`, { left: index * 50, top: 0, width: 50, height: 36 });
    link.getAttribute = (name) => (name === 'href' ? href : link.attrs[name]);
    link.closest = (selector) => (selector === 'a' ? link : null);
    return link;
  });
  const nav = el('#index', { left: 0, top: 0, width: 300, height: 36 });
  nav.scrollLeft = 0;
  nav.scrollWidth = 300;
  nav.clientWidth = 300;
  nav.querySelector = () => null;
  nav.querySelectorAll = (query) => (query === 'a[href^="#"]' ? links : []);
  nav.contains = (node) => links.includes(node);
  lens.querySelector = (query) => {
    if (query === '.lens-window') return stage;
    if (query === '.capsule') return capsule;
    if (query === '.capsule-mag') return mag;
    if (query === '#desk-scene') return scene;
    return null;
  };
  const root = {
    dataset: { view: 'researcher' },
    style: {
      props: {},
      setProperty(name, value) { this.props[name] = String(value); },
      getPropertyValue(name) { return this.props[name] || ''; },
    },
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
  const timers = [];
  const windowListeners = {};
  const sectionTops = { home: 0, news: 200, work: 400, research: 600, blog: 800, contact: 1000 };
  const context = {
    scrollY: 0,
    innerHeight: 900,
    document: {
      documentElement: root,
      scrollingElement: { scrollHeight: 1900, clientHeight: 900 },
      querySelector: (query) => (query === '#view-switch' ? lens : query === '#index' ? nav : null),
      querySelectorAll: () => [],
      getElementById: (id) => (sectionTops[id] == null ? null : { getBoundingClientRect: () => ({ top: sectionTops[id] - context.scrollY }) }),
    },
    matchMedia: () => motion,
    addEventListener(type, fn) { (windowListeners[type] ||= []).push(fn); },
    setTimeout(fn) { timers.push(fn); return timers.length; },
  };
  vm.createContext(context);
  vm.runInContext(js, context);
  function emit(selector, type, event) {
    for (const fn of listeners[`${selector}:${type}`] || []) fn(event);
  }
  return {
    root, lens, links, emit,
    flush() { while (timers.length) timers.shift()(); },
    scrollTo(y) { context.scrollY = y; },
    emitWindow(type) { for (const fn of windowListeners[type] || []) fn({}); },
  };
}

let ui = harness(false);
assert.equal(ui.root.dataset.view, 'founder');
assert.equal(ui.lens.attrs['aria-valuenow'], '0');
assert.equal(ui.lens.attrs['aria-valuetext'], 'Day');
ui.emit('#view-switch', 'keydown', { key: 'End', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'researcher');
assert.equal(ui.lens.attrs['aria-valuenow'], '100');
assert.equal(ui.lens.attrs['aria-valuetext'], 'Night');
assert.equal(ui.root.style.props['--t'], '0.0000');
assert.equal(ui.root.classList.contains('is-settling'), true);
ui.emit('#view-switch', 'keydown', { key: 'Home', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'founder');
assert.equal(ui.lens.attrs['aria-valuetext'], 'Day');
assert.equal(ui.root.style.props['--t'], '1.0000');
ui.emit('#index', 'click', { target: ui.links[5], preventDefault() {} });
assert.equal(ui.lens.attrs['aria-valuetext'], 'Night', 'clicking Contact puts the page in night');
assert.equal(ui.root.dataset.view, 'researcher');
ui.emit('#index', 'click', { target: ui.links[0], preventDefault() {} });
assert.equal(ui.lens.attrs['aria-valuetext'], 'Day', 'clicking About puts the page in day');
assert.equal(ui.root.style.props['--t'], '1.0000');
ui.emit('#index', 'pointerdown', { button: 0, pointerType: 'mouse', clientX: 12, pointerId: 1 });
ui.emit('#index', 'pointermove', { pointerType: 'mouse', clientX: 150, pointerId: 1 });
ui.emit('#index', 'pointerup', { pointerType: 'mouse', clientX: 150, pointerId: 1 });
assert.equal(ui.lens.attrs['aria-valuetext'], 'Dusk', 'dragging to the middle gives a blend');
assert.equal(ui.root.style.props['--t'], '0.5000');
ui.emit('#index', 'click', { target: ui.links[0], preventDefault() {} });
assert.equal(ui.lens.attrs['aria-valuetext'], 'Dusk', 'the click after a drag does not jump to the link');
ui.emit('#index', 'pointerdown', { button: 0, pointerType: 'mouse', clientX: 20, pointerId: 4 });
ui.emit('#index', 'pointermove', { pointerType: 'mouse', clientX: 220, pointerId: 4 });
ui.emit('#index', 'pointercancel', { pointerType: 'mouse', clientX: 220, pointerId: 4 });
assert.equal(ui.lens.attrs['aria-valuetext'], 'Night', 'a drag that ends in pointercancel keeps the scrubbed hour');
assert.equal(ui.root.classList.contains('is-settling'), true);
const modified = harness(false);
modified.emit('#index', 'pointerdown', { button: 0, pointerType: 'mouse', clientX: 280, pointerId: 8, ctrlKey: true, target: modified.links[5] });
modified.emit('#index', 'pointerup', { button: 0, pointerType: 'mouse', clientX: 280, pointerId: 8, ctrlKey: true });
modified.emit('#index', 'click', { button: 0, ctrlKey: true, target: modified.links[5], preventDefault() {} });
assert.equal(modified.lens.attrs['aria-valuetext'], 'Day', 'a modified click keeps this tab on its current hour');
checks.push('the nav track scrubs day to night, and links still choose their hour');

const hovered = harness(false);
hovered.emit('#index', 'pointermove', { pointerType: 'mouse', clientX: 20 });
hovered.scrollTo(1000);
hovered.emitWindow('scroll');
hovered.emit('#index', 'pointerleave', {});
assert.equal(hovered.lens.attrs['aria-valuetext'], 'Night', 'leaving the nav after a scroll follows the page');
checks.push('a scroll under the pointer is kept when the pointer leaves');

ui = harness(true);
ui.emit('#view-switch', 'keydown', { key: 'End', preventDefault() {} });
assert.equal(ui.root.dataset.view, 'researcher');
assert.equal(ui.lens.attrs['aria-valuetext'], 'Night');
assert.equal(ui.root.classList.contains('is-settling'), false);
assert.equal(ui.root.classList.contains('is-sweeping'), false);
checks.push('reduced motion commits the end state without the settle animation');

console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
