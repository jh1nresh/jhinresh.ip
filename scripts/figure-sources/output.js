/* OUTPUT hand-off, redrawn as a dusk desk. Same story and limits: a test-network
   illustration. No production printing or production escrow is performed. */
const EZ_TOTAL = 9.0;
const EZ_T = { drop0: .9, fly0: 6.3, open0: 5.4, sheet0: 7.5 };
const ezClamp = value => Math.max(0, Math.min(1, value));
const ezEase = value => { const k = ezClamp(value); return k * k * (3 - 2 * k); };
const ezScene = t => t < EZ_T.drop0 ? 0 : t < 3.2 ? 1 : t < 6.1 ? 2 : 3;
const EZ_CAP = [
  ['Your shop, a nearby shop, and OUTPUT in between.', 'A separate pilot network. EZNest works on its own.'],
  ['A shop receives a job it cannot make today.', 'Synthetic shapes. Illustration only.'],
  ['OUTPUT looks for a nearby shop with an open machine.', 'Pilot on a test network. No production printing.'],
  ['Illustrated hand-off reaches the nearby shop.', 'Test-network illustration. No production printing.'],
];

function ezScene3(st) {
  const t = st.t;
  const dropped = ezEase((t - EZ_T.drop0) / .7);
  const flying = ezEase((t - EZ_T.fly0) / 1.2);
  const cardX = 54 + dropped * 8 + flying * 196;
  const cardY = 78 - Math.sin(Math.PI * flying) * 28 - (1 - dropped) * 24;
  const open = t >= EZ_T.open0;
  const sheet = ezClamp((t - EZ_T.sheet0) / 1);
  const nearby = open ? 'OPEN MACHINE' : 'NEARBY SHOP';
  return `<defs><linearGradient id="outSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2748"/><stop offset="1" stop-color="#e7b07a"/></linearGradient><linearGradient id="outBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2"/><stop offset="1" stop-color="#d0893a"/></linearGradient><clipPath id="outCard"><rect x="${cardX.toFixed(1)}" y="${cardY.toFixed(1)}" width="54" height="36" rx="8"/></clipPath></defs><rect width="360" height="230" rx="24" fill="url(#outSky)"/><path d="M-8 176 C70 156 140 160 190 176 C250 196 300 184 372 164 L372 246 L-8 246 Z" fill="#6b4124"/><circle cx="316" cy="36" r="16" fill="url(#outBrass)"/><path d="M78 118 C140 100 210 100 278 118" fill="none" stroke="#fffaf2" stroke-width="2" stroke-dasharray="2 6" opacity=".7"/><g><rect x="28" y="96" width="92" height="70" rx="18" fill="#fffaf2"/><text x="74" y="128" text-anchor="middle" fill="#1c2428" font-family="Georgia,serif" font-size="11">YOUR SHOP</text><circle cx="74" cy="146" r="6" fill="${t >= EZ_T.drop0 + .7 ? '#e7b07a' : '#c5d0bf'}"/></g><g><rect x="136" y="78" width="88" height="64" rx="22" fill="#145e58"/><text x="180" y="106" text-anchor="middle" fill="#fffaf2" font-family="Georgia,serif" font-size="13">OUTPUT</text><text x="180" y="124" text-anchor="middle" fill="#d7efe8" font-family="Georgia,serif" font-size="8">TEST NET</text></g><g><rect x="246" y="96" width="96" height="70" rx="18" fill="#fffaf2"/><text x="294" y="126" text-anchor="middle" fill="#1c2428" font-family="Georgia,serif" font-size="10">${nearby}</text><circle cx="294" cy="146" r="6" fill="${open ? '#f6d78a' : '#c5d0bf'}"/></g><g clip-path="url(#outCard)"><rect x="${cardX.toFixed(1)}" y="${cardY.toFixed(1)}" width="54" height="36" rx="8" fill="#fffaf2" stroke="#e7c98a"/><rect x="${(cardX + 8).toFixed(1)}" y="${(cardY + 10).toFixed(1)}" width="28" height="5" rx="2" fill="#145e58"/></g>${sheet > 0 ? `<rect x="300" y="168" width="${(40 * sheet).toFixed(1)}" height="22" rx="6" fill="#fffaf2" stroke="#145e58"/>` : ''}<text x="18" y="28" fill="#fffaf2" font-family="Georgia,serif" font-size="13">${EZ_CAP[ezScene(t)][0].split('.')[0]}</text>`;
}
