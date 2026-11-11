/** A soft proof shelf: four labeled drawers on the evening desk. */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const travel = 28;
const projects = [
  {key: 'savvy', label: 'SAVVY', y: 128, enamel: '#f0b9a4', ink: '#6a3328'},
  {key: 'output', label: 'OUTPUT', y: 198, enamel: '#c5d8ea', ink: '#1d3a55'},
  {key: 'eznest', label: 'EZNEST', y: 268, enamel: '#d7deaf', ink: '#3c4a26'},
  {key: 'maiat', label: 'MAIAT + DOJO', y: 338, enamel: '#ddd0ea', ink: '#3d3158'},
];

function drawer(project) {
  const open = project.key === 'savvy' ? travel : 0;
  const slide = `translate(${open} 0)`;
  return `<g id="drawer-${project.key}" data-drawer="${project.key}" data-position="${open}" transform="${slide}">
    <rect x="86" y="${project.y}" width="214" height="62" rx="18" fill="#fffaf2" stroke="#e7d3b0" stroke-width="1.5"/>
    <rect x="98" y="${project.y + 14}" width="34" height="34" rx="12" fill="${project.enamel}"/>
    <rect x="148" y="${project.y + 18}" width="92" height="8" rx="4" fill="#eadcc4"/>
    <rect x="148" y="${project.y + 32}" width="64" height="6" rx="3" fill="#f3e6cc"/>
    <text x="196" y="${project.y + 52}" text-anchor="middle" fill="${project.ink}" font-family="Georgia,serif" font-size="${project.key === 'maiat' ? 11 : 13}">${project.label}</text>
    <rect x="262" y="${project.y + 24}" width="22" height="14" rx="7" fill="url(#shelfBrass)"/>
  </g>`;
}

const parts = [
  {name: 'desk', x: 0, y: 430, w: 420, h: 70},
  {name: 'case', x: 70, y: 108, w: 250, h: 300},
  ...projects.map(project => ({name: `drawer ${project.key}`, x: 86, y: project.y, w: 214, h: 62, travel: project.key === 'savvy' ? travel : 0})),
  {name: 'notebook', x: 118, y: 36, w: 150, h: 78},
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 500" role="img" aria-labelledby="cabinet-title cabinet-desc" id="project-cabinet"><title id="cabinet-title">Jerry’s project index</title><desc id="cabinet-desc">An illustrated teal filing cabinet with four drawers labeled Savvy, OUTPUT, EZNest, and Maiat + Dojo. A visual index of Jerry’s current projects.</desc><defs><linearGradient id="shelfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2748"/><stop offset=".62" stop-color="#6a5878"/><stop offset="1" stop-color="#e7b07a"/></linearGradient><linearGradient id="shelfBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d78a"/><stop offset="1" stop-color="#c47a32"/></linearGradient><linearGradient id="shelfCase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3e5c"/><stop offset="1" stop-color="#1b2838"/></linearGradient></defs><rect width="420" height="500" rx="28" fill="url(#shelfSky)"/><ellipse cx="330" cy="78" rx="46" ry="46" fill="#f6c56a" opacity=".9"/><ellipse cx="314" cy="64" rx="14" ry="10" fill="#fff6df" opacity=".8"/><ellipse cx="70" cy="120" rx="54" ry="22" fill="#fffaf2" opacity=".35"/><path d="M-10 430 C80 392 160 392 220 420 C300 456 360 430 440 400 L440 520 L-10 520 Z" fill="#6b4124"/><path d="M-10 438 C90 404 170 408 230 434 C310 466 360 444 440 416" fill="none" stroke="#e7c98a" stroke-width="3" opacity=".7"/><g transform="rotate(-8 190 74)"><rect x="118" y="36" width="150" height="78" rx="8" fill="#fffaf2" stroke="#e7d3b0"/><path d="M250 36 L268 54 L250 54 Z" fill="#e7d3b0"/><text x="193" y="82" text-anchor="middle" fill="#1c2428" font-family="Georgia,serif" font-size="16">J. CHEN</text></g><rect x="70" y="108" width="250" height="308" rx="32" fill="url(#shelfCase)"/><rect x="86" y="122" width="218" height="280" rx="24" fill="#24344e"/>${projects.map(drawer).join('')}</svg>`;

assert.equal(projects.length, 4);
for (const project of projects) {
  assert.ok(svg.includes(`data-drawer="${project.key}"`));
  assert.ok(svg.includes(`>${project.label}<`));
}
assert.match(svg, /id="drawer-savvy"[^>]*transform="translate\(28 0\)"/);
assert.match(svg, />J\. CHEN</);
assert.equal(parts.filter(part => part.name.startsWith('drawer ')).length, 4);
assert.ok(parts.find(part => part.name === 'drawer savvy').travel === travel);
assert.ok(parts.filter(part => part.name.startsWith('drawer ') && part.name !== 'drawer savvy').every(part => part.travel === 0));

writeFileSync(`${root}assets/figures/project-cabinet.svg`, svg);
writeFileSync(`${root}assets/figures/cabinet-parts.json`, JSON.stringify({travel, parts}, null, 2));
const htmlPath = `${root}index.html`;
const html = readFileSync(htmlPath, 'utf8');
writeFileSync(htmlPath, html.replace(/<!-- CABINET:START -->[\s\S]*?<!-- CABINET:END -->/, `<!-- CABINET:START -->${svg}<!-- CABINET:END -->`));
console.log(`Project cabinet: ${parts.length} parts; drawer travel ${travel} PASS; ${svg.length} SVG bytes.`);
