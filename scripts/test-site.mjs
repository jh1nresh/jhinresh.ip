import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const checks = [];

for (const id of ['top', 'work', 'index', 'home', 'project-savvy', 'project-output', 'project-eznest', 'project-maiat', 'about', 'research', 'blog', 'contact', 'hero-title', 'awards-title']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
}
checks.push('scrolling page keeps the section anchors');

assert.equal((html.match(/<li>/g) || []).length, 16, 'preview, Maiat notes, and twelve award rows');
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
checks.push('project, contact, and canonical links remain');

assert.ok(html.includes('Devnet sandbox'));
assert.ok(html.includes('does not offer production printing or production escrow'));
assert.ok(html.includes('not a measurement'));
assert.ok(html.includes('No real approval, signature, or payment is performed'));
assert.ok(html.includes('Public website captured 28 Oct 2026'));
checks.push('project limits and the dated Savvy capture remain');

for (const gone of ['page-curl.js', 'fit-reader.js', 'book-binding', 'folio-foot', 'chapter-tabs', 'data-spread', 'page-curl']) {
  assert.equal(html.includes(gone), false, gone);
}
assert.equal(fs.existsSync(new URL('../page-curl.js', import.meta.url)), false);
assert.equal(fs.existsSync(new URL('../fit-reader.js', import.meta.url)), false);
assert.equal(fs.existsSync(new URL('../cabinet.js', import.meta.url)), false);
assert.equal(fs.existsSync(new URL('../workflows.js', import.meta.url)), false);
checks.push('the field book, page curl, and folio reader are gone');

assert.match(css, /prefers-reduced-motion/);
assert.match(css, /data-motion-opt-in/);
assert.match(js, /Pause motion/);
assert.match(js, /prefers-reduced-motion/);
checks.push('motion can be paused and respects reduced motion');

console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
