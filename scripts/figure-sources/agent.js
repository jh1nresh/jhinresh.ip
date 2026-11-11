/* Maiat + Dojo, redrawn as a dusk desk. A quote card meets an illustrated stamp
   and leaves a receipt. It never signs, approves, or pays anything. */
const agClamp = value => Math.max(0, Math.min(1, value));
const agEase = value => { const k = agClamp(value); return k * k * (3 - 2 * k); };
function agPose(t) {
  const arrival = agEase((t - .4) / 1.8);
  const exit = agEase((t - 4.8) / 2.2);
  const down = agEase((t - 2.6) / .7);
  const up = agEase((t - 3.7) / .7);
  return {x: 24 + 90 * arrival + 64 * exit, stroke: 24.8 * down * (1 - up), approved: t >= 3.3};
}
function agScene(t, inventory = null) {
  const pose = agPose(t);
  const parts = [
    {name: 'platform', x: 0, y: 150, w: 360, h: 70},
    {name: 'quote bed', x: 20, y: 118, w: 250, h: 16},
    {name: 'quote card', x: pose.x, y: 78, w: 72, h: 48},
    {name: 'stamp', x: 150, y: 36 + pose.stroke, w: 54, h: 36, stroke: pose.stroke},
    {name: 'receipt tray', x: 250, y: 96, w: 84, h: 70},
  ];
  if (inventory) inventory.push(...parts);
  const stampY = (36 + pose.stroke).toFixed(1);
  const cardX = pose.x.toFixed(1);
  return `<defs><linearGradient id="agSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2748"/><stop offset="1" stop-color="#e7b07a"/></linearGradient><linearGradient id="agBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2"/><stop offset="1" stop-color="#d0893a"/></linearGradient><clipPath id="agCard"><rect x="${cardX}" y="78" width="72" height="48" rx="10"/></clipPath></defs><rect width="360" height="230" rx="24" fill="url(#agSky)"/><circle cx="320" cy="36" r="16" fill="url(#agBrass)"/><path d="M-8 168 C80 150 160 154 220 170 C290 190 320 176 372 158 L372 246 L-8 246 Z" fill="#6b4124"/><rect x="20" y="124" width="250" height="14" rx="7" fill="#c4a574"/><g clip-path="url(#agCard)"><rect x="${cardX}" y="78" width="72" height="48" rx="10" fill="#fffaf2" stroke="#e7d3b0" stroke-width="1.5"/><rect x="${(pose.x + 10).toFixed(1)}" y="90" width="40" height="5" rx="2" fill="#8d74a8"/><rect x="${(pose.x + 10).toFixed(1)}" y="100" width="28" height="4" rx="2" fill="#eadcc4"/>${pose.approved ? `<circle cx="${(pose.x + 50).toFixed(1)}" cy="108" r="8" fill="none" stroke="#145e58" stroke-width="2"/>` : ''}</g><g transform="translate(150 ${stampY})"><rect width="54" height="28" rx="10" fill="#8d74a8"/><rect y="24" width="54" height="10" rx="4" fill="#145e58"/><text x="27" y="18" text-anchor="middle" fill="#fffaf2" font-family="Georgia,serif" font-size="9">STAMP</text></g><rect x="250" y="96" width="84" height="70" rx="12" fill="#fffaf2" stroke="#e7d3b0"/><path d="M258 150 l6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8" fill="none" stroke="#c4a574" stroke-width="1.5"/><text x="46" y="210" fill="#fffaf2" font-family="Georgia,serif" font-size="13">QUOTE</text><text x="156" y="210" fill="#fffaf2" font-family="Georgia,serif" font-size="13">CONSENT</text><text x="268" y="210" fill="#fffaf2" font-family="Georgia,serif" font-size="13">RECEIPT</text>`;
}
