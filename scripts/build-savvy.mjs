/** Savvy as a small dusk desk: a link card travels to review, then a Map Stamp appears. */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const cardTravel = 90;
const parts = [
  {name: 'desk', x: 0, y: 300, w: 640, h: 80},
  {name: 'card bed', x: 28, y: 148, w: 250, h: 18},
  {name: 'source card', x: 36, y: 118, w: 92, h: 70},
  {name: 'review screen', x: 236, y: 78, w: 150, h: 150},
  {name: 'map board', x: 410, y: 70, w: 180, h: 200},
  {name: 'map pin', x: 486, y: 150, w: 28, h: 64},
];

const inner = `<defs><linearGradient id="savvySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2748"/><stop offset=".7" stop-color="#6d5d78"/><stop offset="1" stop-color="#e7b07a"/></linearGradient><linearGradient id="savvyBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2"/><stop offset="1" stop-color="#d0893a"/></linearGradient><radialGradient id="savvyGlow" cx="50%" cy="40%" r="55%"><stop offset="0" stop-color="#fff6df" stop-opacity=".55"/><stop offset="1" stop-color="#fff6df" stop-opacity="0"/></radialGradient></defs><rect width="640" height="400" rx="28" fill="url(#savvySky)"/><ellipse cx="320" cy="150" rx="120" ry="48" fill="url(#savvyGlow)"/><ellipse cx="78" cy="64" rx="70" ry="26" fill="#fffaf2" opacity=".28"/><circle cx="560" cy="54" r="28" fill="url(#savvyBrass)"/><circle cx="550" cy="44" r="8" fill="#fffaf2" opacity=".75"/><path d="M-20 318 C120 286 240 292 340 318 C460 350 540 328 660 300 L660 420 L-20 420 Z" fill="#6b4124"/><rect x="28" y="156" width="250" height="16" rx="8" fill="#c4a574"/><g id="savvy-card"><rect x="36" y="118" width="92" height="70" rx="12" fill="#fffaf2" stroke="#e7d3b0" stroke-width="2"/><rect x="48" y="132" width="58" height="7" rx="3" fill="#d7c4a4"/><rect x="48" y="146" width="44" height="6" rx="3" fill="#eadcc4"/><rect x="48" y="160" width="36" height="6" rx="3" fill="#eadcc4"/></g><g id="review-screen"><rect x="236" y="78" width="150" height="150" rx="28" fill="#145e58"/><rect x="250" y="92" width="122" height="98" rx="16" fill="#fffaf2"/><text x="311" y="132" text-anchor="middle" fill="#145e58" font-family="Georgia,serif" font-size="22">Savvy</text><text x="311" y="154" text-anchor="middle" fill="#5c6a58" font-family="Georgia,serif" font-size="9">CHECK THE PLACE</text><g id="savvy-confirmed" opacity="0"><text x="311" y="176" text-anchor="middle" fill="#145e58" font-family="Georgia,serif" font-size="11">REVIEWED</text></g></g><g transform="rotate(6 500 160)"><rect x="410" y="70" width="180" height="200" rx="18" fill="#fffaf2" stroke="#e7d3b0" stroke-width="2"/><path d="M430 150 C470 120 520 180 560 130" fill="none" stroke="#7d9a6a" stroke-width="3" stroke-linecap="round"/><path d="M448 190 C500 160 540 200 570 170" fill="none" stroke="#c5d0bf" stroke-width="3" stroke-linecap="round"/><g id="savvy-pin" opacity="0"><ellipse cx="500" cy="214" rx="10" ry="4" fill="#1a120c" opacity=".25"/><path d="M500 196 V156" stroke="#5a3a22" stroke-width="3" stroke-linecap="round"/><circle cx="500" cy="146" r="12" fill="url(#savvyBrass)"/><circle cx="496" cy="142" r="4" fill="#fffaf2"/></g></g><g fill="#fffaf2" font-family="Georgia,serif" font-size="13"><text x="82" y="214">LINK</text><text x="286" y="252">REVIEW</text><text x="470" y="292">MAP STAMP</text></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" id="savvy-workflow" role="img" aria-labelledby="savvy-figure-title savvy-figure-desc"><title id="savvy-figure-title">From a saved link to a Map Stamp</title><desc id="savvy-figure-desc">A synthetic place-memory station. A link card travels to a review screen; a map marker appears after the illustrated review. No real places are shown.</desc>${inner}</svg>`;

assert.ok(svg.includes('id="savvy-card"'));
assert.ok(svg.includes('id="savvy-pin" opacity="0"'));
assert.ok(svg.includes('id="savvy-confirmed" opacity="0"'));
for (const label of ['Savvy', 'CHECK THE PLACE', 'REVIEWED', 'LINK', 'REVIEW', 'MAP STAMP']) assert.match(svg, new RegExp(label));
assert.ok(parts.find(part => part.name === 'source card').x + cardTravel < parts.find(part => part.name === 'review screen').x + parts.find(part => part.name === 'review screen').w);
assert.equal(parts.find(part => part.name === 'source card').x + cardTravel, 126);

writeFileSync(`${root}assets/figures/savvy-workflow.svg`, svg);
writeFileSync(`${root}assets/figures/savvy-parts.json`, JSON.stringify({cardTravel, parts}, null, 2));
const htmlPath = `${root}index.html`;
writeFileSync(htmlPath, readFileSync(htmlPath, 'utf8').replace(/<!-- SAVVY:START -->[\s\S]*?<!-- SAVVY:END -->/, `<!-- SAVVY:START -->${svg}<!-- SAVVY:END -->`));
console.log(`Savvy: ${parts.length} parts; card travel ${cardTravel} PASS; ${svg.length} SVG bytes.`);
