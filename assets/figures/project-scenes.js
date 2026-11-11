/* Dusk-desk project scenes. OUTPUT and EZNest keep their original timelines and synthetic part data.
MIT License

Copyright (c) 2026 April Zhu (Colorfigures: colour, hand-drawn style, 3D props, template, examples)
Copyright (c) 2026 April Zhu (iso-glow, on which Colorfigures is based)
Copyright (c) 2026 Tolga Cohce (iso-figure, on which iso-glow is based)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
(()=>{
'use strict';
/* ============================================================
   Colorfigures core: projection, shapes, shading, ink, labels, page shell.
   A figure page includes this file (scripts/build.py inlines it), then calls mountFigure({...}).
   See SKILL.md for the drawing contract and conventions.
   One fixed view (front-left-top) and one fixed light (from above, behind the viewer's right shoulder: the front is lit,
   the left side is in shade, and cast shadows fall toward the lower left of the screen).
   ============================================================ */

/* ---------- palettes ---------- */
const PALS = {
  mustard: { l:'#f4b829', m:'#d49c1f', d:'#4e4a18' },
  tomato:  { l:'#ef6a4c', m:'#cf5038', d:'#4a2219' },
  mint:    { l:'#93d3b0', m:'#71b693', d:'#1f4034' },
  cobalt:  { l:'#76a0e2', m:'#5a82c6', d:'#1c2948' },
  blush:   { l:'#f3a6bb', m:'#d8869c', d:'#4b2430' },
};
const METAL   = { l:'#eef0f0', m:'#c6ccce', d:'#8f989b' };
const CLEAR   = { l:'#e4f2f4', m:'#c4dfe4', d:'#97b9c0' };
const CERAMIC = { l:'#fbfaf3', m:'#e3e0d2', d:'#bdb8a6' };
const DARK    = { l:'#55504a', m:'#3d3935', d:'#272421' };
const INK = '#231e16';
const SHADOW = '#41538f';

/* ---------- projection (x = depth toward viewer-right, y = toward viewer-left, z = up) ---------- */
const C = Math.cos(Math.PI/6), S = Math.sin(Math.PI/6);
let OX = 0, OY = 0;
/* VIEW turns the object in 90° steps about a vertical axis through its centre (RC):
   0 = front (+x) and left (+y) faces toward the viewer, 1 = turned once (the +y side becomes the front)…
   Figures keep modelling in their own coordinates; P / Dv / vis / tone / depthOf all apply the turn. */
let VIEW = 0, RC = [0, 0];
const VIEW_NAMES = ['front', 'left side', 'back', 'right side'];
const TURNS = [0, 2];                 // the views the UI offers: front and back (figures still draw correctly in all four)
const rotV = ([x,y,z]) => { switch (VIEW & 3){ case 1: return [y,-x,z]; case 2: return [-x,-y,z]; case 3: return [-y,x,z]; default: return [x,y,z]; } };
const rotXY = (x,y) => { const r = rotV([x-RC[0], y-RC[1], 0]); return [r[0]+RC[0], r[1]+RC[1]]; };
const P0 = (x,y,z) => [(x-y)*C + OX, (x+y)*S - z + OY];                       // raw iso, no turn
const P  = (x,y,z) => { const [a,b] = rotXY(x,y); return [(a-b)*C + OX, (a+b)*S - z + OY]; };
const Dv = (x,y,z) => { const [a,b,c] = rotV([x,y,z]); return [(a-b)*C, (a+b)*S - c]; };
// distance toward the viewer in the current view: draw parts with smaller depth first
const depthOf = p => { const [a,b] = rotXY(p[0],p[1]); return a + b + p[2]; };
// sort [{at:[x,y,z], svg}] back-to-front for the current view and join
const byDepth = parts => parts.filter(Boolean).sort((p,q) => depthOf(p.at) - depthOf(q.at)).map(p => p.svg).join('');
const f  = v => (Math.round(v * 10 + 1e-8) / 10).toFixed(1);
const pd = (pts, close=true) => 'M' + pts.map(p => { const q = P(p[0],p[1],p[2]); return f(q[0])+' '+f(q[1]); }).join('L') + (close ? 'Z' : '');
const sp = pts => 'M' + pts.map(q => f(q[0])+' '+f(q[1])).join('L') + 'Z';

/* ---------- 2D shapes in a plane's (u,v) coords (v up), mapped to 3D by a plane ---------- */
const arcUV  = (cu,cv,r,a0,a1,n=7) => { const o=[]; for (let i=0;i<=n;i++){ const a=(a0+(a1-a0)*i/n)*Math.PI/180; o.push([cu+r*Math.cos(a), cv+r*Math.sin(a)]); } return o; };
const rrUV   = (u0,v0,u1,v1,r,n=7) => r <= 0 ? rectUV(u0,v0,u1,v1) : [...arcUV(u1-r,v0+r,r,-90,0,n), ...arcUV(u1-r,v1-r,r,0,90,n), ...arcUV(u0+r,v1-r,r,90,180,n), ...arcUV(u0+r,v0+r,r,180,270,n)];
const rectUV = (u0,v0,u1,v1) => [[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
const ellUV  = (cu,cv,ru,rv,n=24) => Array.from({length:n}, (_,i) => { const a=i/n*2*Math.PI; return [cu+ru*Math.cos(a), cv+rv*Math.sin(a)]; });
const PX = x => ([u,v]) => [x,u,v];      // front-facing plane x = const   (u = y, v = z)
const PY = y => ([u,v]) => [u,y,v];      // side plane y = const           (u = x, v = z)
const PZ = z => ([u,v]) => [u,v,z];      // horizontal plane z = const     (u = x, v = y)
const on = (plane, uv) => uv.map(plane);

/* ---------- vectors + shading ---------- */
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm=a=>{ const l=Math.hypot(...a)||1; return a.map(v=>v/l); };
const avg=ps=>ps.reduce((s,p)=>[s[0]+p[0]/ps.length,s[1]+p[1]/ps.length,s[2]+p[2]/ps.length],[0,0,0]);
const vis = n => { const r = rotV(n); return r[0]+r[1]+r[2] > 1e-6; };   // viewer looks from (+1,+1,+1) after the turn
const facing = vis;                                                       // readable alias: is this face toward the viewer?
const SHADOW_K = 0.85, AZ_MIN = 20, AZ_MAX = 160;
// cast shadows are drawn shorter than the shading light implies (0.45 × height instead of 0.85 ×): long shadows of tall
// parts on thin supports (a lamp shade, a fan head) land far from the object and read as separate blobs
const SHADOW_LEN = 0.45;
let L = [0,0,1], SH = [0,0];
function setLight(deg){ const a=deg*Math.PI/180; SH=[SHADOW_K*Math.cos(a), SHADOW_K*Math.sin(a)]; L=norm([-SH[0],-SH[1],1]); }
const LIN = norm([.6,.2,1]);                       // fixed light for interiors / small props
const tone  = (n,m) => { const d=dot(rotV(n),L);   return d>-.15 ? m.l : d>-.45 ? m.m : m.d; };   // exterior, follows the sun
const toneI = (n,m) => { const d=dot(rotV(n),LIN); return d>.6 ? m.l : d>.05 ? m.m : m.d; };      // interior / props
const mix = (a,b,t) => '#' + [1,3,5].map(i => Math.round(parseInt(a.substr(i,2),16)*(1-t) + parseInt(b.substr(i,2),16)*t).toString(16).padStart(2,'0')).join('');
const matOf = hex => ({ l:hex, m:mix(hex,'#000000',.16), d:mix(hex,'#000000',.42) });
const ease = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;

/* ---------- drawing primitives (all return SVG strings) ---------- */
const ink   = (d,w=1.0) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const fill  = (d,c,extra='') => `<path d="${d}" fill="${c}" ${extra}/>`;
const face  = (d,c) => `<path d="${d}" fill="${c}" stroke="${c}" stroke-width=".7" stroke-linejoin="round"/>`;
const shape = (pts,c,w=.9) => fill(pd(pts),c) + (w ? ink(pd(pts),w) : '');
const line  = (pts,w=.9) => ink(pd(pts,false),w);
// Loft between two rings of equal length (closed). colour(n) picks each strip's fill; flip = seen from inside.
function loft(A, B, colour, flip=false){
  const n=A.length, cen=avg(A.concat(B)); let s='';
  for (let i=0;i<n;i++){
    const a0=A[i], a1=A[(i+1)%n], b1=B[(i+1)%n], b0=B[i];
    let nr = norm(cross(sub(a1,a0), sub(b0,a0)));
    if (!isFinite(nr[0])) continue;
    if (dot(nr, sub(avg([a0,a1,b1,b0]), cen)) < 0) nr = nr.map(v=>-v);
    if (flip) nr = nr.map(v=>-v);
    if (vis(nr)) s += face(pd([a0,a1,b1,b0]), colour(nr));
  }
  return s;
}
function hull(pts){
  pts = pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]); const lo=[], up=[];
  for (const p of pts){ while(lo.length>=2 && cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
  for (const p of pts.reverse()){ while(up.length>=2 && cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
  lo.pop(); up.pop(); return lo.concat(up);
}
// Silhouette ink, weighted by how thick the part is on screen (like a hand inker): the w you pass is the most it gets.
// Thickness = 2 × area / perimeter of the outline (a rod's diameter, about half a box's width), as a share of the
// frame width. A long thin rod, a handle or a knob stays light (~1–1.5); a grinder, kettle or machine body gets the
// heavy ~2.4–2.8. Thin parts stay thin and parts keep air between them.
const hullInk = (pts3, w=1.4) => { const h = hull(pts3.map(p=>P(...p))); let a = 0, per = 0;
  for (let i = 0; i < h.length; i++){ const p = h[i], q = h[(i+1) % h.length]; a += p[0]*q[1] - q[0]*p[1]; per += Math.hypot(q[0]-p[0], q[1]-p[1]); }
  const thick = per ? Math.abs(a) / per / (INK_K * INK_REF_VB) : 0;
  return ink(sp(h), Math.min(w, .9 + 20*thick)); };
// Axis-aligned box: three visible faces, shaded, each outlined. shade = tone (sunlit) or toneI (interior).
function box(x0,y0,z0,x1,y1,z1,m,shade=toneI,w=.9){
  // all six faces, drawn only when they face the viewer (sides first, then top) — correct in every VIEW
  const F = [
    [[0,1,0],  [[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]],
    [[1,0,0],  [[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]]],
    [[0,-1,0], [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]],
    [[-1,0,0], [[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]]],
    [[0,0,1],  [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]] ];
  return F.filter(([n]) => vis(n)).map(([n,q]) => shape(q, shade(n,m), w)).join('');
}
// Rounded-profile extrusion: profile (u=y, v=z) swept along x from x0 to x1. Body of most machines.
function extrude(profileUV, x0, x1, m, shade=tone){ return loft(on(PX(x0),profileUV), on(PX(x1),profileUV), n=>shade(n,m)); }
// Vertical cylinder (axis z) centred (x,y), radius r from z0 to z1, with top cap.
function cyl(x,y,z0,z1,r,m,shade=toneI,w=1.2,n=24){
  const A=on(PZ(z0),ellUV(x,y,r,r,n)), B=on(PZ(z1),ellUV(x,y,r,r,n));
  return loft(A,B,nr=>shade(nr,m)) + fill(pd(B),shade([0,0,1],m)) + hullInk([...A,...B],w) + ink(pd(B),w*.8);
}
// Cylinder lying along x (e.g. a knob or dial sticking out of a front face): centred (y,z), from x0 to x1.
function cylX(x0,x1,y,z,r,m,shade=toneI,w=1.1,n=20){
  const A=on(PX(x0),ellUV(y,z,r,r,n)), B=on(PX(x1),ellUV(y,z,r,r,n));
  // cap on whichever end faces the viewer (the +x end in VIEW 0)
  const capB = vis([1,0,0]), cap = capB ? B : A, cn = capB ? [1,0,0] : [-1,0,0];
  return loft(A,B,nr=>shade(nr,m)) + (vis(cn) ? fill(pd(cap),shade(cn,m)) : '') + hullInk([...A,...B],w) + (vis(cn) ? ink(pd(cap),w*.8) : '');
}
// Cylinder between any two 3D points a and b (a lamp arm, a rod, a pipe at an angle, a handle bar), radius r.
// The end facing the viewer gets a cap. For a tapered part (a cone, a lamp shade) pass r1 for the radius at b.
function rod(a, b, r, m, shade=toneI, w=1, r1=r, n=16){
  const d = norm(sub(b, a)), u = norm(cross(d, Math.abs(d[2]) < .9 ? [0,0,1] : [1,0,0])), v = cross(d, u);
  const ring = (p, rr) => Array.from({length:n}, (_,i) => { const t = i/n*2*Math.PI, c = Math.cos(t)*rr, s2 = Math.sin(t)*rr;
    return [p[0] + u[0]*c + v[0]*s2, p[1] + u[1]*c + v[1]*s2, p[2] + u[2]*c + v[2]*s2]; });
  const A = ring(a, r), B = ring(b, r1), capB = vis(d), cap = capB ? B : A, cn = capB ? d : d.map(x => -x);
  return loft(A, B, nr => shade(nr, m)) + (Math.max(r, r1) > 0 ? fill(pd(cap), shade(cn, m)) + ink(pd(cap), w*.8) : '') + hullInk([...A, ...B], w);
}
// Text lying flat on a front plane x = const, centred at (y,z) baseline; reads left-to-right on screen.
const txM = (o, U, V) => `matrix(${U[0].toFixed(4)} ${U[1].toFixed(4)} ${V[0].toFixed(4)} ${V[1].toFixed(4)} ${f(o[0])} ${f(o[1])})`;
const tx = (x,y,z,str,size,col=INK,weight=700) => { const o=P(x,y,z);
  return `<text transform="${txM(o, Dv(0,-1,0), Dv(0,0,-1))}" font-size="${size}" fill="${col}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="${weight}" letter-spacing=".04em">${str}</text>`; };
// Text on a side plane y = const, centred at (x,z).
const txY = (x,y,z,str,size,col=INK,weight=700) => { const o=P(x,y,z);
  return `<text transform="${txM(o, Dv(1,0,0), Dv(0,0,-1))}" font-size="${size}" fill="${col}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="${weight}" letter-spacing=".04em">${str}</text>`; };
// Cast shadow of a set of 3D points (any outline of the object), pushed along the light onto z = 0.
// the light stays put relative to the viewer, so the shadow is cast in turned coordinates
// z0: the surface it falls on (a board, a counter); clip it to that surface with clipTo(...) if it could spill off.
// clip: the 3D outline of the surface it falls on (e.g. boardTop(...)), so it can't spill over the edge.
const castShadow = (pts3, z0=0, clip=null) => { const k = SHADOW_LEN / SHADOW_K;
  const s = fill(sp(hull(pts3.map(([x,y,z]) => { const [a,b] = rotXY(x,y); return P0(a+(z-z0)*SH[0]*k, b+(z-z0)*SH[1]*k, z0); }))), SHADOW);
  return clip ? clipTo(clip, s) : s; };
// A board for the object to stand on (a tray, a desk top, a counter): a rounded slab from (x0,y0) to (x1,y1), h thick.
// Draw it first; then castShadow(points, h, boardTop(x0,y0,x1,y1,h,r)) so shadows lie on it and stop at its edge.
const BOARD = { l:'#e6e1d4', m:'#cfc8b8', d:'#aaa293' }, WOOD = { l:'#d9a86c', m:'#bf8a4f', d:'#8e6236' };
const boardTop = (x0,y0,x1,y1,h=3,r=5) => on(PZ(h), rrUV(x0,y0,x1,y1,r));
function board(x0,y0,x1,y1,h=3,r=5,m=BOARD){
  const A = on(PZ(0), rrUV(x0,y0,x1,y1,r)), B = boardTop(x0,y0,x1,y1,h,r);
  return loft(A, B, n => toneI(n, m)) + fill(pd(B), m.l) + ink(pd(B), 1) + hullInk([...A, ...B], 1.8);
}
// Group helpers: clickable target, clip to an opening.
const act  = (name, inner, data='') => `<g data-act="${name}" ${data}>${inner}</g>`;
let _clipN = 0;
// Part label (for "how does it work" figures): a cream pill with a leader line to a 3D point on the part.
// dx, dy = where the pill sits, in screen units at the reference zoom (they scale with the figure like stroke widths).
// on = that part is working right now (the pill turns the accent colour). Labels can be hidden with the Labels switch.
function tag(p3, dx, dy, text, on=false){
  const k = INK_K, [X,Y] = P(...p3), fs = 8.6*k, w = text.length*fs*.62 + fs*1.5, h = fs*1.8, cx = X + dx*k, cy = Y + dy*k;
  return `<g class="tag${on ? ' on' : ''}"><path d="M${f(X)} ${f(Y)}L${f(cx)} ${f(cy)}" fill="none" stroke="${INK}" stroke-width="1"/>`
    + `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(1.3*k)}" fill="${INK}"/>`
    + `<rect x="${f(cx-w/2)}" y="${f(cy-h/2)}" width="${f(w)}" height="${f(h)}" rx="${f(h/2)}" fill="${on ? 'var(--accent,#f4b829)' : '#fff4d6'}" stroke="${INK}" stroke-width="1.2"/>`
    + `<text x="${f(cx)}" y="${f(cy+fs*.36)}" font-size="${f(fs)}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="800" letter-spacing=".04em" fill="${INK}">${text}</text></g>`;
}
const clipTo = (pts3, inner) => { const id = 'k' + (++_clipN); return `<clipPath id="${id}"><path d="${pd(pts3)}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };

/* ---------- constant on-screen line weight ----------
   Stroke widths are written in model units, and each figure is zoomed to fill the frame, so a small
   object would get fat lines. INK_K rescales every stroke-width (and the wobble/grain filter) so all
   figures match the reference zoom of the booth / vending machine (viewBox ≈ 585 units wide). */
const INK_REF_VB = 585;
let INK_K = 1;
const inkScale = svg => INK_K === 1 ? svg : svg.replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${(+w * INK_K).toFixed(2)}"`);

window.bookScenes={output:(()=>{
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

const prefix='book-output-';const total=EZ_TOTAL,scene=t=>ezScene3({t}),say=t=>EZ_CAP[ezScene(t)][0];
const duration=total+3.1;const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));return t<=total+1.3?Math.min(t,total):total*(1-smooth((t-total-1.3)/1.8));}
function render(t){VIEW=0;RC=[0,0];OX=0;OY=0;INK_K=.65;_clipN=0;setLight(110);const svg=inkScale(scene(at(t)));return svg.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function caption(t){return t>total+1.3?'Resetting this illustrative workflow.':say(at(t));}
return {duration,stillTime:total,viewBox:'',render,caption};
})(),eznest:(()=>{
/* EZNest nesting figure (DESIGN, 2026-10-27). Built on Colorfigures (April Zhu, MIT) - see vendor/colorfigures/LICENSE.
   ONE pure model: every pose on screen is a function of the master time st.t (seconds). Shapes are synthetic (parts.json,
   build/pack.py); sizes are abstract units, not millimetres. Own names are prefixed `ez` (core.js owns many short globals). */
const ezD = {"W":44.0,"GAP":2.0,"rowOrder":[12,1,8,2,4,5,10,0,11,13,9,6,7,3],"rowSeed":177,"rowMedianOf":301,"Lb":110.0,"Ln":86.9,"area":2037.1,"fill_nested":0.533,"fill_rows":0.421,"parts":[{"id":0,"kind":"rrect","params":[20,14,3],"color":0,"local":[[7.0,-7.0],[8.5,-6.6],[9.6,-5.5],[10.0,-4.0],[10.0,4.0],[9.6,5.5],[8.5,6.6],[7.0,7.0],[-7.0,7.0],[-8.5,6.6],[-9.6,5.5],[-10.0,4.0],[-10.0,-4.0],[-9.6,-5.5],[-8.5,-6.6],[-7.0,-7.0]],"home":[63.94,25.46,303.99],"row":[76.0,7.0,0.0],"nest":[7.0,10.0,90.0]},{"id":1,"kind":"circle","params":[8],"color":1,"local":[[8.0,0.0],[7.39,3.06],[5.66,5.66],[3.06,7.39],[0.0,8.0],[-3.06,7.39],[-5.66,5.66],[-7.39,3.06],[-8.0,0.0],[-7.39,-3.06],[-5.66,-5.66],[-3.06,-7.39],[-0.0,-8.0],[3.06,-7.39],[5.66,-5.66],[7.39,-3.06]],"home":[31.39,27.1,282.17],"row":[8.0,20.39,0.0],"nest":[23.93,7.93,240.0]},{"id":2,"kind":"hex","params":[8],"color":2,"local":[[6.93,4.0],[0.0,8.0],[-6.93,4.0],[-6.93,-4.0],[-0.0,-8.0],[6.93,-4.0]],"home":[76.32,47.37,90.18],"row":[26.93,8.0,0.0],"nest":[26.73,36.23,105.0]},{"id":3,"kind":"pill","params":[22,8],"color":3,"local":[[7.0,-4.0],[8.53,-3.7],[9.83,-2.83],[10.7,-1.53],[11.0,-0.0],[11.0,-0.0],[10.7,1.53],[9.83,2.83],[8.53,3.7],[7.0,4.0],[-7.0,4.0],[-8.53,3.7],[-9.83,2.83],[-10.7,1.53],[-11.0,0.0],[-11.0,0.0],[-10.7,-1.53],[-9.83,-2.83],[-8.53,-3.7],[-7.0,-4.0]],"home":[8.5,27.78,240.54],"row":[99.0,40.0,0.0],"nest":[38.0,11.0,90.0]},{"id":4,"kind":"tri","params":[18],"color":0,"local":[[0.0,-10.39],[9.0,5.2],[-9.0,5.2]],"home":[76.91,10.78,182.86],"row":[29.0,28.39,0.0],"nest":[43.39,28.5,30.0]},{"id":5,"kind":"star","params":[9.5,4.4],"color":1,"local":[[0.0,-9.5],[2.59,-3.56],[9.04,-2.94],[4.18,1.36],[5.58,7.69],[0.0,4.4],[-5.58,7.69],[-4.18,1.36],[-9.04,-2.94],[-2.59,-3.56]],"home":[34.08,46.11,63.7],"row":[49.04,9.5,0.0],"nest":[66.47,8.47,315.0]},{"id":6,"kind":"rrect","params":[12,12,2],"color":2,"local":[[4.0,-6.0],[5.0,-5.73],[5.73,-5.0],[6.0,-4.0],[6.0,4.0],[5.73,5.0],[5.0,5.73],[4.0,6.0],[-4.0,6.0],[-5.0,5.73],[-5.73,5.0],[-6.0,4.0],[-6.0,-4.0],[-5.73,-5.0],[-5.0,-5.73],[-4.0,-6.0]],"home":[49.04,46.33,293.21],"row":[94.0,15.0,0.0],"nest":[51.0,6.0,0.0]},{"id":7,"kind":"circle","params":[5.5],"color":3,"local":[[5.5,0.0],[5.08,2.1],[3.89,3.89],[2.1,5.08],[0.0,5.5],[-2.1,5.08],[-3.89,3.89],[-5.08,2.1],[-5.5,0.0],[-5.08,-2.1],[-3.89,-3.89],[-2.1,-5.08],[-0.0,-5.5],[2.1,-5.08],[3.89,-3.89],[5.08,-2.1]],"home":[57.2,7.9,210.78],"row":[93.5,28.5,0.0],"nest":[81.45,38.45,30.0]},{"id":8,"kind":"semi","params":[9],"color":0,"local":[[9.0,3.79],[8.56,1.01],[7.28,-1.5],[5.29,-3.49],[2.78,-4.77],[0.0,-5.21],[-2.78,-4.77],[-5.29,-3.49],[-7.28,-1.5],[-8.56,1.01],[-9.0,3.79]],"home":[17.95,48.62,14.18],"row":[9.0,35.6,0.0],"nest":[59.04,37.54,135.0]},{"id":9,"kind":"pill","params":[16,7],"color":1,"local":[[4.5,-3.5],[5.84,-3.23],[6.97,-2.47],[7.73,-1.34],[8.0,0.0],[8.0,0.0],[7.73,1.34],[6.97,2.47],[5.84,3.23],[4.5,3.5],[-4.5,3.5],[-5.84,3.23],[-6.97,2.47],[-7.73,1.34],[-8.0,0.0],[-8.0,0.0],[-7.73,-1.34],[-6.97,-2.47],[-5.84,-3.23],[-4.5,-3.5]],"home":[77.9,29.95,111.88],"row":[96.0,3.5,0.0],"nest":[70.63,28.81,75.0]},{"id":10,"kind":"rrect","params":[24,10,2],"color":2,"local":[[10.0,-5.0],[11.0,-4.73],[11.73,-4.0],[12.0,-3.0],[12.0,3.0],[11.73,4.0],[11.0,4.73],[10.0,5.0],[-10.0,5.0],[-11.0,4.73],[-11.73,4.0],[-12.0,3.0],[-12.0,-3.0],[-11.73,-4.0],[-11.0,-4.73],[-10.0,-5.0]],"home":[46.89,25.18,93.21],"row":[52.0,24.19,0.0],"nest":[11.12,32.12,135.0]},{"id":11,"kind":"hex","params":[6],"color":3,"local":[[5.2,3.0],[0.0,6.0],[-5.2,3.0],[-5.2,-3.0],[-0.0,-6.0],[5.2,-3.0]],"home":[32.53,7.81,255.78],"row":[71.2,22.0,0.0],"nest":[79.2,16.5,60.0]},{"id":12,"kind":"tri","params":[12],"color":1,"local":[[-0.0,-6.93],[6.0,3.46],[-6.0,3.46]],"home":[61.19,47.65,119.44],"row":[6.0,6.93,0.0],"nest":[82.93,6.0,30.0]},{"id":13,"kind":"circle","params":[6.5],"color":0,"local":[[6.5,-0.0],[6.01,2.49],[4.6,4.6],[2.49,6.01],[0.0,6.5],[-2.49,6.01],[-4.6,4.6],[-6.01,2.49],[-6.5,0.0],[-6.01,-2.49],[-4.6,-4.6],[-2.49,-6.01],[-0.0,-6.5],[2.49,-6.01],[4.6,-4.6],[6.01,-2.49]],"home":[15.25,13.5,293.73],"row":[72.5,36.5,0.0],"nest":[57.45,21.45,15.0]}]};
PALS.output = { l:'#006cf5', m:'#0054c2', d:'#003b8a' };          // tokens: blue / blue-hover / blue-shadow
const EZP = { out:PALS.output, sheet:{ l:'#ffffff', m:'#f7f7f2', d:'#dce1dd' },
  parts:[ PALS.output, matOf('#c19753'), matOf('#91aaa0'), matOf('#5c6870') ] };   // blue, ochre, sage, slate (live site colours)
const EZ_VBH = .70;
const EZ_INK='#182136', EZ_SHADOW='#dce1dd', EZ_STAGE='#f7f7f2', EZ_BLUE='#006cf5';
/* ---- geometry (abstract units) ---- */
const ezBH = 3, ezW = ezD.W, ezXS = 14, ezLb = ezD.Lb, ezLn = ezD.Ln, ezEnd = ezXS + ezLb + 8;
const ezBX = ezXS, ezBY = ezW + 14, ezBW = 92, ezBD = 56;               // parts pad
const ezFX = ezEnd + 12, ezFW = 26, ezFD = 28, ezFH = 9, ezFY = 8;          // hot folder
const ezBoard = [-14, -10, ezFX + ezFW + 14, ezBY + ezBD + 8];
const ezZS = ezBH + .7, ezZP = ezBH + 1.3, ezPH = 1.5;
/* ---- timeline (seconds) ---- */
const EZ_T = { row0:1.0, rowStag:.17, rowHop:.62, nest0:4.7, nestStag:.12, nestHop:.9, mark0:4.7, cut0:8.3, cutDur:1.5, fold0:10.2, lid:.4, fly0:10.6, flyDur:1.0, drop0:11.6, drop:.35, close0:11.9, bridge0:12.3 };
const EZ_E = [0.8, 4.4, 8.1, 10.1, 13.6];          // E[0] = manual start, E[i] = end of step i
const EZ_TOTAL = 13.6;
const ezClamp = (v,a=0,b=1) => Math.max(a, Math.min(b, v));
const ezOut = k => 1 - Math.pow(1-k, 4);                  // ~ expo-out feel (cubic-bezier(.16,1,.3,1))
const ezQuant = (k, n) => Math.floor(ezClamp(k)*n + 1e-9)/n;  // stepped, like steps(n)
const ezLerp = (a,b,k) => a + (b-a)*k;
const ezAng = (a,b,k) => { let d = ((b - a) % 360 + 540) % 360 - 180; return a + d*k; };
/* ---- model ---- */
const ezOrderNest = ezD.parts.slice().sort((p,q) => p.nest[0] - q.nest[0]).map(p => p.id);   // nested parts move in order along the roll
const ezRowIdx = {}; ezD.rowOrder.forEach((id,i) => ezRowIdx[id] = i);
const ezNestIdx = {}; ezOrderNest.forEach((id,i) => ezNestIdx[id] = i);
function ezWorld(p, key){ const a = p[key]; return key === 'home' ? [ezBX + a[0], ezBY + a[1], a[2]] : [ezXS + a[0], a[1], a[2]]; }
function ezPose(p, t){
  const h = ezWorld(p,'home'), r = ezWorld(p,'row'), n = ezWorld(p,'nest');
  const k1 = ezClamp((t - EZ_T.row0 - ezRowIdx[p.id]*EZ_T.rowStag) / EZ_T.rowHop);
  const k2 = ezClamp((t - EZ_T.nest0 - ezNestIdx[p.id]*EZ_T.nestStag) / EZ_T.nestHop);
  let x, y, rot, lift;
  if (k2 > 0){ const e = ezOut(k2); x = ezLerp(r[0],n[0],e); y = ezLerp(r[1],n[1],e); rot = ezAng(r[2],n[2],e); lift = 3.2*Math.sin(Math.PI*k2); }
  else { const e = ezOut(k1); x = ezLerp(h[0],r[0],e); y = ezLerp(h[1],r[1],e); rot = ezAng(h[2],r[2],e); lift = 9*Math.sin(Math.PI*k1); }
  const onStrip = ezOut(k1);
  return { x, y, rot, z: ezLerp(ezZP, ezZS, onStrip) + lift };
}
function ezMarkLen(t){ const k = ezClamp((t - EZ_T.mark0 - .5) / 2.6); return ezLerp(ezLb, ezLn, ezOut(k)); }   // length marker slides from row length to nested length
function ezRollUsed(t){ const rowDone = t >= EZ_T.row0 + 13*EZ_T.rowStag + EZ_T.rowHop - .02; const Lm = rowDone ? ezMarkLen(t) : 0;
  return rowDone ? Math.ceil(10 * Lm / ezLb - 1e-6) : 10; }       // 10 blocks = the row layout; blocks follow the marker (illustrative, no unit)
function ezScene(t){ return t < EZ_T.row0 ? 0 : t < EZ_T.nest0 - .3 ? 1 : t < EZ_T.cut0 - .1 ? 2 : t < EZ_T.fold0 - .1 ? 3 : t < EZ_T.bridge0 ? 4 : 5; }
const EZ_CAP = [
  ['Loose parts and one roll of material.', 'Synthetic shapes. Illustration, not a measurement.'],
  ['First, parts go into rows.', 'A simple row layout. The roll runs long.'],
  ['Nesting turns and tucks the same parts together.', 'In this example the roll used gets shorter. Not a measurement.'],
  ['Cut lines follow each part, with a minimum gap between them.', 'You set the gap once.'],
  ['The file goes into the folder you choose.', 'The Hot folder is a setting. Illustration only.'],
  ['A prepared file reaches the Hot folder.', 'Illustration only. No printer action is performed.'] ];
/* ---- drawing ---- */
const ezRing = (p, pose, z, grow=1) => { const c = Math.cos(pose.rot*Math.PI/180), s = Math.sin(pose.rot*Math.PI/180);
  return p.local.map(([a,b]) => [pose.x + (a*c - b*s)*grow, pose.y + (a*s + b*c)*grow, z]); };
function ezPart(p, pose){
  const m = EZP.parts[p.color];
  const A = ezRing(p, pose, pose.z - .0), B = ezRing(p, pose, pose.z + ezPH);
  return ink(pd(A), .8) + loft(A, B, n => toneI(n, m)) + fill(pd(B), m.l) + ink(pd(B), .9);
}
function ezCentre(p, pose){ return [pose.x, pose.y, pose.z]; }
function ezRoll(){ const cz = ezBH + 8; let s = '';
  s += rod([2,0,cz],[2,ezW,cz], 8, EZP.sheet, toneI, 1.3, 8, 24);
  s += rod([2,-.2,cz],[2,ezW*.5,cz], 3.2, {l:'#dce1dd',m:'#c9ced1',d:'#8f989b'}, toneI, .8, 3.2, 14).replace(/stroke="[^"]*"/g, m => m);
  return s; }
function ezMonitor(txt, bar){ const x1 = -6, y0 = 62, y1 = 106, z0 = ezBH + 14, z1 = ezBH + 40; let s = '';
  s += box(-10, 80, ezBH, -3, 88, ezBH + 14, EZP.out, tone, 1);
  s += box(-12, 70, ezBH, 0, 98, ezBH + 2.2, EZP.out, tone, 1);
  s += box(-10, y0, z0, x1, y1, z1, EZP.out, tone, 1.4);
  s += shape(on(PX(x1 + .1), rectUV(y0 + 3, z0 + 3, y1 - 3, z1 - 3)), EZ_INK, 1);
  const cy = (y0 + y1)/2;
  s += tx(x1 + .2, cy, z1 - 9, 'EZNEST', 4.6, '#ffffff', 800);
  s += tx(x1 + .2, cy, z1 - 16, txt, 3.4, '#9fc3ff', 800);
  const bw = (y1 - y0 - 12);
  s += shape(on(PX(x1 + .2), rectUV(y1 - 6, z0 + 5, y0 + 6, z0 + 7.4)), '#3e4855', 0);
  if (bar > 0) s += shape(on(PX(x1 + .3), rectUV(y1 - 6, z0 + 5, y1 - 6 - bw*bar, z0 + 7.4)), EZ_BLUE, 0);
  return s; }
function ezFolder(t){
  const open = ezClamp((t - EZ_T.fold0)/EZ_T.lid) * (1 - ezClamp((t - EZ_T.close0)/EZ_T.lid));
  const x0 = ezFX, x1 = ezFX + ezFW, y0 = ezFY, y1 = ezFY + ezFD, z1 = ezBH + ezFH; let s = '';
  s += box(x0, y0, ezBH, x1, y1, z1, EZP.out, tone, 1.6);
  s += shape(on(PZ(z1 + .05), rectUV(x0 + 3, y0 + 3, x1 - 3, y1 - 3)), open > .02 ? EZ_INK : EZP.out.m, 1);
  s += shape(on(PX(x1 + .1), rectUV(y0 + 5, ezBH + 2, y1 - 5, ezBH + 5.5)), EZ_INK, 0);
  s += tx(x1 + .2, (y0 + y1)/2, ezBH + 3, 'HOT FOLDER', 2.5, '#ffffff', 800);
  const got = t >= EZ_T.drop0 + EZ_T.drop;
  s += shape(on(PX(x1 + .2), ellUV(y0 + 3, ezBH + 7, 1.2, 1.2, 12)), got ? '#ffffff' : '#9fc3ff', .6);
  // lid: hinged on the viewer-right edge (y0), swings up and over so the opening stays visible
  const th = open * 1.25, ly = y0 + (ezFD - 2)*Math.cos(th), lz = z1 + .6 + (ezFD - 2)*Math.sin(th);
  if (open > .02 || t < EZ_T.fold0) {
    const lid = [[x0 + 1, y0 + 1, z1 + .6], [x1 - 1, y0 + 1, z1 + .6], [x1 - 1, ly, lz], [x0 + 1, ly, lz]];
    if (open <= .02) s += shape(lid, EZP.out.l, 1.2); else s += shape(lid, EZP.out.m, 1.2);
  }
  return s; }
function ezCard(t){
  if (t < EZ_T.fly0 - .25) return '';
  const k = ezOut(ezClamp((t - EZ_T.fly0)/EZ_T.flyDur)), kd = ezClamp((t - EZ_T.drop0)/EZ_T.drop);
  if (kd >= 1) return '';
  const a = [ezXS + ezLn/2, ezW/2, ezZS + 2], b = [ezFX + ezFW/2, ezFY + ezFD/2, ezBH + ezFH + 1.4];
  const x = ezLerp(a[0], b[0], k), y = ezLerp(a[1], b[1], k), z = ezLerp(a[2], b[2], k) + 12*Math.sin(Math.PI*k) - kd*6;
  const sc = (1 - kd*.9) * (.55 + .45*ezClamp((t - EZ_T.fly0 + .25)/.25));
  const pose = { x, y, rot: 0, z }, w = 10*sc, h = 7*sc;
  const R = [[x - w, y - h, z], [x + w, y - h, z], [x + w, y + h, z], [x - w, y + h, z]];
  const B = R.map(q => [q[0], q[1], q[2] + .5]);
  let s = ink(pd(R), .8) + loft(R, B, n => toneI(n, EZP.sheet)) + fill(pd(B), '#fff') + ink(pd(B), .9);
  s += `<path d="${pd([[x - w*.6, y - h*.5, z + .6], [x - w*.1, y - h*.5, z + .6], [x - w*.1, y + h*.1, z + .6], [x - w*.6, y + h*.1, z + .6]])}" fill="${EZ_BLUE}" opacity=".85"/>`;
  s += `<path d="${pd([[x + w*.1, y + h*.2, z + .6], [x + w*.7, y + h*.2, z + .6], [x + w*.7, y + h*.7, z + .6], [x + w*.1, y + h*.7, z + .6]])}" fill="${EZ_BLUE}" opacity=".55"/>`;
  return s; }
function ezPixels(t){ if (t < EZ_T.bridge0) return ''; const k = ezClamp((t - EZ_T.bridge0)/(EZ_TOTAL - EZ_T.bridge0 - .1)); let s = '';
  for (let i = 0; i < 3; i++){ const kk = ezQuant(ezClamp(k*1.5 - i*.2), 8); if (kk <= 0) continue;     // stepped, like OUTPUT's 8px transfer square
    const d = 4 + kk*58, x = ezFX + ezFW/2 - 3 + d*.5 + 2, y = ezFY + ezFD + d*.5 - 2;
    s += shape(on(PZ(ezBH + .3 + kk*0), rectUV(x, y, x + 6, y + 6)), EZ_BLUE, 1); }
  return s; }
function ezTagK(){ return 1.25; }
function ezTag(p3, dx, dy, text, on = false){ const k = INK_K * ezTagK(), [X, Y] = P(...p3), fs = 8.6*k, w = text.length*fs*.6 + fs*1.5, h = fs*1.8, cx = X + dx*k, cy = Y + dy*k;
  return `<g class="tag${on ? ' on' : ''}"><path d="M${f(X)} ${f(Y)}L${f(cx)} ${f(cy)}" fill="none" stroke="${INK}" stroke-width="1"/>`
   + `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(1.3*k)}" fill="${INK}"/>`
   + `<rect x="${f(cx - w/2)}" y="${f(cy - h/2)}" width="${f(w)}" height="${f(h)}" rx="${f(h/2)}" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`
   + `<text x="${f(cx)}" y="${f(cy + fs*.36)}" font-size="${f(fs)}" text-anchor="middle" font-weight="800" fill="${INK}">${text}</text></g>`; }
const ezGapPair = (() => { const poses = ezD.parts.map(p => ezRing(p, { x:ezWorld(p,'nest')[0], y:ezWorld(p,'nest')[1], rot:ezWorld(p,'nest')[2] }, 0)); let best = [1e9];
  for (let i = 0; i < poses.length; i++) for (let j = i+1; j < poses.length; j++) for (const a of poses[i]) for (const b of poses[j]){ const d = Math.hypot(a[0]-b[0], a[1]-b[1]); if (d < best[0] && d > 1.5) best = [d, (a[0]+b[0])/2, (a[1]+b[1])/2]; }
  return best; })();
function ezCutLines(t){ if (t < EZ_T.cut0) return ''; const k = ezClamp((t - EZ_T.cut0)/EZ_T.cutDur); let s = '';
  ezD.parts.forEach((p, i) => { const kk = ezQuant(ezClamp(k*1.6 - (i/13)*.6), 8); if (kk <= 0) return;
    const n = ezWorld(p,'nest'); const area = (p.params[0]||8); const r = Math.sqrt(p.local.reduce((m, q) => Math.max(m, q[0]*q[0] + q[1]*q[1]), 1));
    const ring = ezRing(p, { x:n[0], y:n[1], rot:n[2] }, ezZS + .08, 1 + 1.1/r);
    s += ink(pd(ring), 1.3).replace(INK, EZ_BLUE).replace('<path', `<path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${(1 - kk).toFixed(3)}"`); });
  return s; }
/* ---- scene ---- */
function ezFlat(points, fill) {
  const d = points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join('') + 'Z';
  return `<path d="${d}" fill="${fill}" stroke="#fffaf2" stroke-width="1" stroke-linejoin="round"/>`;
}
function ezScene3(st){
  const t = st.t;
  const colors = ['#1f6f68', '#d0893a', '#7d9a6a', '#8d74a8'];
  const open = ezClamp((t - EZ_T.fold0) / EZ_T.lid) * (1 - ezClamp((t - EZ_T.close0) / EZ_T.lid));
  let s = `<defs><linearGradient id="nestSky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#24345c"/><stop offset="1" stop-color="#e7b07a"/></linearGradient><linearGradient id="nestSheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf2"/><stop offset="1" stop-color="#f0e0c4"/></linearGradient><clipPath id="nestRoll"><rect x="2" y="0" width="${ezEnd}" height="${ezW}" rx="8"/></clipPath></defs>`;
  s += `<rect x="${ezBoard[0]}" y="${ezBoard[1]}" width="${ezBoard[2] - ezBoard[0]}" height="${ezBoard[3] - ezBoard[1]}" rx="14" fill="url(#nestSky)"/>`;
  s += `<rect x="${ezBoard[0]}" y="${ezBoard[3] - 22}" width="${ezBoard[2] - ezBoard[0]}" height="28" rx="12" fill="#6b4124"/>`;
  s += `<rect x="2" y="0" width="${ezEnd}" height="${ezW}" rx="10" fill="url(#nestSheet)" stroke="#e7c98a"/>`;
  s += `<rect x="8" y="6" width="36" height="${ezW - 12}" rx="8" fill="#fffaf2" opacity=".45" clip-path="url(#nestRoll)"/>`;
  s += `<rect x="${ezBX - 6}" y="${ezBY - 6}" width="${ezBW + 12}" height="${ezBD + 12}" rx="12" fill="#fffaf2" opacity=".88"/>`;
  for (const part of ezD.parts) {
    const pose = ezPose(part, t);
    s += ezFlat(ezRing(part, pose, 0), colors[part.color]);
  }
  if (t >= EZ_T.cut0) {
    const reveal = ezClamp((t - EZ_T.cut0) / EZ_T.cutDur);
    ezD.parts.forEach((part, index) => {
      const shown = ezClamp(reveal * 1.6 - (index / 13) * .6);
      if (shown <= 0) return;
      const nest = ezWorld(part, 'nest');
      const ring = ezRing(part, {x: nest[0], y: nest[1], rot: nest[2]}, 0, 1.16);
      const d = ring.map((point, pointIndex) => `${pointIndex ? 'L' : 'M'}${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join('') + 'Z';
      s += `<path d="${d}" fill="none" stroke="#145e58" stroke-width="1.1" stroke-dasharray="3 2" opacity="${shown.toFixed(2)}"/>`;
    });
  }
  s += `<g transform="translate(${ezFX} ${ezFY})"><rect width="${ezFW}" height="${ezFD}" rx="6" fill="#145e58"/><rect y="${(-10 * open).toFixed(1)}" width="${ezFW}" height="9" rx="3" fill="#3e8f88"/><text x="${ezFW / 2}" y="${ezFD / 2 + 1}" text-anchor="middle" fill="#fffaf2" font-family="Georgia,serif" font-size="3.4">HOT</text></g>`;
  s += `<text x="${ezBoard[0] + 6}" y="${ezBoard[1] + 10}" fill="#fffaf2" font-family="Georgia,serif" font-size="8">${['PARTS', 'ROWS', 'NESTING', 'CUT LINES', 'HOT FOLDER', 'DONE'][ezScene(t)]}</text>`;
  return s;
}

const prefix='book-eznest-';const total=EZ_TOTAL,scene=t=>ezScene3({t}),say=t=>EZ_CAP[ezScene(t)][0];
const duration=total+3.1;const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));return t<=total+1.3?Math.min(t,total):total*(1-smooth((t-total-1.3)/1.8));}
function render(t){VIEW=0;RC=[0,0];OX=0;OY=0;INK_K=.65;_clipN=0;setLight(110);const svg=inkScale(scene(at(t)));return svg.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function caption(t){return t>total+1.3?'Resetting this illustrative workflow.':say(at(t));}
return {duration,stillTime:total,viewBox:'',render,caption};
})(),maiat:(()=>{
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

const prefix='book-maiat-';const total=7.7,scene=t=>agScene(t),say=t=>t<2.6?'A quote arrives at the approval station.':t<4.8?'The illustrated approval stamp meets the card.':'The approved example leaves a receipt.';
const duration=total+3.1;const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));return t<=total+1.3?Math.min(t,total):total*(1-smooth((t-total-1.3)/1.8));}
function render(t){VIEW=0;RC=[0,0];OX=0;OY=0;INK_K=.65;_clipN=0;setLight(110);const svg=inkScale(scene(at(t)));return svg.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function caption(t){return t>total+1.3?'Resetting this illustrative workflow.':say(at(t));}
return {duration,stillTime:total,viewBox:'',render,caption};
})()};
})();
window.bookScenes.output.viewBox="-26 -18 416 282";
window.bookScenes.eznest.viewBox="-32 -28 234 174";
window.bookScenes.maiat.viewBox="-26 -26 416 290";
