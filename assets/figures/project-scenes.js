/* Native project scenes. Geometry/model adapted from EZNest landing, 27 Oct 2026.
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
/* EZNest -> OUTPUT hand-off figure (DESIGN, 2026-10-27). Built on Colorfigures (April Zhu, MIT). Synthetic shapes only.
   OUTPUT is a SEPARATE pilot network (test network, no production printing); this scene is explanation, not an EZNest feature. */
PALS.output = { l:'#006cf5', m:'#0054c2', d:'#003b8a' };          // tokens: blue / blue-hover / blue-shadow
const EZP = { out:PALS.output, sheet:{ l:'#ffffff', m:'#f7f7f2', d:'#dce1dd' },
  parts:[ PALS.output, matOf('#c19753'), matOf('#91aaa0'), matOf('#5c6870') ] };   // blue, ochre, sage, slate (live site colours)
const EZ_VBH = .70;
const EZ_INK='#182136', EZ_SHADOW='#dce1dd', EZ_STAGE='#f7f7f2', EZ_BLUE='#006cf5';

const EZ_OCHRE = matOf('#c19753');
const ezBH = 3, ezBoard = [-12, -14, 156, 118];
const ezClamp = (v,a=0,b=1) => Math.max(a, Math.min(b, v)), ezOut = k => 1 - Math.pow(1-k, 4), ezQuant = (k,n) => Math.floor(ezClamp(k)*n + 1e-9)/n, ezLerp = (a,b,k) => a + (b-a)*k;
const EZ_T = { drop0:.9, drop:.7, ping0:3.4, trav:1.6, find0:5.0, open0:5.4, fly0:6.3, flyDur:1.2, sheet0:7.5, sheetDur:1.0 };
const EZ_E = [0.7, 3.2, 6.1, 9.0], EZ_TOTAL = 9.0;
const YM = [4, 68, 44, 100], NM = [110, 6, 150, 38], HB = [58, 42, 78, 62];   // machine footprints (x0,y0,x1,y1)
const ezScene = t => t < EZ_T.drop0 ? 0 : t < EZ_E[1] ? 1 : t < EZ_E[2] ? 2 : 3;
const EZ_CAP = [ ['Your shop, a nearby shop, and OUTPUT in between.', 'A separate pilot network. EZNest works on its own.'],
  ['A shop receives a job it cannot make today.', 'Synthetic shapes. Illustration only.'],
  ['OUTPUT looks for a nearby shop with an open machine.', 'Pilot on a test network. No production printing.'],
  ['Illustrated hand-off reaches the nearby shop.', 'Test-network illustration. No production printing.'] ];
function ezMachine(b, m, label, state){ const [x0,y0,x1,y1] = b; let s = '';
  s += box(x0, y0, ezBH, x1, y1, ezBH + 9, m, tone, 1.5);
  s += box(x0 + 1, y0 + 1, ezBH + 9, x1 - 1, y0 + 8, ezBH + 22, m, tone, 1.4);
  s += shape(on(PZ(ezBH + 9.05), rectUV(x0 + 4, y0 + 10, x1 - 4, y1 - 4)), '#ffffff', 1);
  s += shape(on(PX(x1 + .1), ellUV((y0 + y1)/2, ezBH + 5, 1.7, 1.7, 14)), state === 'on' ? '#ffffff' : (state === 'wait' ? '#9fc3ff' : '#3e4855'), .8);
  return s; }
function ezHub(t){ const [x0,y0,x1,y1] = HB; const pulse = ezQuant(ezClamp((t - EZ_T.find0)/1.2), 4); let s = '';
  for (let i = 0; i < 2; i++){ const k = ezClamp((t - EZ_T.ping0 - 1.2 - i*.5)/1.4); if (k <= 0 || k >= 1) continue; const r = 14 + ezQuant(k,8)*26;
    s += `<path d="${pd(Array.from({length:28},(_,j)=>[ (x0+x1)/2 + r*Math.cos(j/28*6.2832), (y0+y1)/2 + r*Math.sin(j/28*6.2832), ezBH + .2]))}Z" fill="none" stroke="${EZ_BLUE}" stroke-width="1.4" stroke-dasharray="3 3" opacity="${(1-ezQuant(k,8)).toFixed(2)}"/>`; }
  s += box(x0, y0, ezBH, x1, y1, ezBH + 16, EZP.out, tone, 1.5);
  s += box(x0 + 3, y0 + 3, ezBH + 16, x1 - 3, y1 - 3, ezBH + 19, EZP.out, tone, 1.2);
  s += tx(x1 + .2, (y0 + y1)/2, ezBH + 10, 'OUTPUT', 3.6, '#ffffff', 800);
  s += tx(x1 + .2, (y0 + y1)/2, ezBH + 5, 'TEST NET', 2.6, '#9fc3ff', 800);
  return s; }
function ezCard3(t){ // the job card: drops onto your tray, later flies to the nearby shop's tray
  const own = [(YM[0]+YM[2])/2, (YM[1]+YM[3])/2 + 6, ezBH + 10.3], oth = [(NM[0]+NM[2])/2, (NM[1]+NM[3])/2 + 6, ezBH + 10.3];
  if (t < EZ_T.drop0 - .05) return ''; const kd = ezOut(ezClamp((t - EZ_T.drop0)/EZ_T.drop)), kf = ezOut(ezClamp((t - EZ_T.fly0)/EZ_T.flyDur));
  const x = ezLerp(own[0], oth[0], kf), y = ezLerp(own[1], oth[1], kf), z = ezLerp(own[2] + 14*(1-kd), oth[2], kf) + 24*Math.sin(Math.PI*kf), w = 9, h = 6.5;
  const R = [[x - w, y - h, z], [x + w, y - h, z], [x + w, y + h, z], [x - w, y + h, z]], B = R.map(q => [q[0], q[1], q[2] + .6]);
  return { at:[x, y, z], svg: ink(pd(R), .8) + loft(R, B, n => toneI(n, EZP.sheet)) + fill(pd(B), '#fff') + ink(pd(B), .9)
    + `<path d="${pd([[x - w*.6, y - h*.5, z + .7], [x - w*.1, y - h*.5, z + .7], [x - w*.1, y + h*.1, z + .7], [x - w*.6, y + h*.1, z + .7]])}" fill="${EZ_BLUE}" opacity=".85"/>`
    + `<path d="${pd([[x + w*.1, y + h*.2, z + .7], [x + w*.7, y + h*.2, z + .7], [x + w*.7, y + h*.7, z + .7], [x + w*.1, y + h*.7, z + .7]])}" fill="${EZ_BLUE}" opacity=".55"/>` }; }
function ezPix(t){ // 3 stepped 8-unit squares: your shop -> OUTPUT -> nearby shop (OUTPUT's own transfer motif)
  let s = ''; const A = [(YM[2]+8), (YM[1]+YM[3])/2], H = [(HB[0]+HB[2])/2, (HB[1]+HB[3])/2], N = [NM[0] - 2, (NM[1]+NM[3])/2];
  const seg = (P0, P1, k, i) => { const kk = ezQuant(ezClamp(k*1.5 - i*.2), 8); if (kk <= 0 || kk >= 1) return ''; const x = ezLerp(P0[0], P1[0], kk), y = ezLerp(P0[1], P1[1], kk);
    return shape(on(PZ(ezBH + .3), rectUV(x - 2.5, y - 2.5, x + 2.5, y + 2.5)), EZ_BLUE, 1); };
  for (let i = 0; i < 3; i++){ s += seg(A, H, (t - EZ_T.ping0)/EZ_T.trav, i) + seg(H, N, (t - EZ_T.open0 - .2)/EZ_T.trav, i); }
  return s; }
function ezScene3(st){ const t = st.t; let s = board(ezBoard[0], ezBoard[1], ezBoard[2], ezBoard[3], ezBH, 6, { l:'#ffffff', m:'#f0f1ee', d:'#dce1dd' });
  const top = boardTop(ezBoard[0], ezBoard[1], ezBoard[2], ezBoard[3], ezBH, 6);
  const pb = (b, h) => [[b[0],b[1],ezBH],[b[2],b[1],ezBH],[b[2],b[3],ezBH],[b[0],b[3],ezBH],[b[0],b[1],ezBH+h],[b[2],b[1],ezBH+h],[b[2],b[3],ezBH+h],[b[0],b[3],ezBH+h]];
  s += castShadow(pb(YM, 22), ezBH, top) + castShadow(pb(NM, 22), ezBH, top) + castShadow(pb(HB, 19), ezBH, top);
  // dotted route on the board (static, quiet)
  const L = (a, b) => `<path d="M${P(a[0], a[1], ezBH + .1).map(f).join(' ')}L${P(b[0], b[1], ezBH + .1).map(f).join(' ')}" stroke="${EZ_INK}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round" fill="none" opacity=".45"/>`;
  s += L([YM[2] + 8, (YM[1]+YM[3])/2], [(HB[0]+HB[2])/2, (HB[1]+HB[3])/2]) + L([(HB[0]+HB[2])/2, (HB[1]+HB[3])/2], [NM[0] - 2, (NM[1]+NM[3])/2]);
  const nState = t >= EZ_T.open0 ? 'on' : 'off', yState = t >= EZ_T.drop0 + EZ_T.drop ? 'wait' : 'off';
  const items = [ { at:[(YM[0]+YM[2])/2, (YM[1]+YM[3])/2, ezBH + 8], svg: ezMachine(YM, EZP.out, 'YOUR SHOP', yState) },
                  { at:[(NM[0]+NM[2])/2, (NM[1]+NM[3])/2, ezBH + 8], svg: ezMachine(NM, EZ_OCHRE, 'NEARBY SHOP', nState) },
                  { at:[(HB[0]+HB[2])/2, (HB[1]+HB[3])/2, ezBH + 8], svg: ezHub(t) } ];
  const c = ezCard3(t); if (c) items.push(c);
  if (t >= EZ_T.sheet0){ const k = ezQuant((t - EZ_T.sheet0)/EZ_T.sheetDur, 8), x1 = NM[2] + 1, len = 22*k;
    items.push({ at:[x1 + len/2, (NM[1]+NM[3])/2, ezBH + 1], svg: box(x1, NM[1] + 6, ezBH, x1 + len, NM[3] - 6, ezBH + .9, EZP.sheet, tone, 1) + (k > .3 ? shape(on(PZ(ezBH + 1), rectUV(x1 + 3, NM[1] + 10, x1 + Math.max(4, len - 3), NM[3] - 10)), EZ_BLUE, 0) : '') }); }
  s += byDepth(items) + ezPix(t);
  const sc = ezScene(t), tg = [];
  const tg2 = (p, dx, dy, txt, on) => tg.push(ezTag(p, dx, dy, txt, on));
  tg2([(YM[0]+YM[2])/2, YM[1] + 3, ezBH + 22], -10, -36, 'YOUR SHOP', sc === 1);
  if (sc >= 2) tg2([(HB[0]+HB[2])/2, HB[1], ezBH + 19], -4, -42, 'OUTPUT', true);
  if (sc >= 2) tg2([(NM[0]+NM[2])/2, NM[1] + 3, ezBH + 22], 12, -38, t >= EZ_T.open0 ? 'OPEN MACHINE' : 'NEARBY SHOP', sc === 2 && t >= EZ_T.open0);
  if (sc === 3 && t > EZ_T.sheet0 + .5) tg2([NM[2] + 12, (NM[1]+NM[3])/2, ezBH + 1], 20, 38, 'MADE NEARBY', true);
  if (sc === 0) tg2([(NM[0]+NM[2])/2, NM[1] + 3, ezBH + 22], 12, -38, 'NEARBY SHOP', false);
  s += tg.join('');
  return s.split(SHADOW).join(EZ_SHADOW).split(INK).join(EZ_INK).split('ui-monospace,Menlo,monospace').join('OUTPUT Shop,Arial,sans-serif'); }
function ezTagK(){ return 1.25; }
function ezTag(p3, dx, dy, text, on = false){ const k = INK_K * ezTagK(), [X, Y] = P(...p3), fs = 8.6*k, w = text.length*fs*.6 + fs*1.5, h = fs*1.8, cx = X + dx*k, cy = Y + dy*k;
  return `<g class="tag${on ? ' on' : ''}"><path d="M${f(X)} ${f(Y)}L${f(cx)} ${f(cy)}" fill="none" stroke="${INK}" stroke-width="1"/>`
   + `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(1.3*k)}" fill="${INK}"/>`
   + `<rect x="${f(cx - w/2)}" y="${f(cy - h/2)}" width="${f(w)}" height="${f(h)}" rx="${f(h/2)}" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`
   + `<text x="${f(cx)}" y="${f(cy + fs*.36)}" font-size="${f(fs)}" text-anchor="middle" font-weight="800" fill="${INK}">${text}</text></g>`; }

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
function ezScene3(st){
  const t = st.t; let s = board(ezBoard[0], ezBoard[1], ezBoard[2], ezBoard[3], ezBH, 6, { l:'#ffffff', m:'#f0f1ee', d:'#dce1dd' });
  const top = boardTop(ezBoard[0], ezBoard[1], ezBoard[2], ezBoard[3], ezBH, 6);
  const ptsBox = (x0,y0,x1,y1,h) => [[x0,y0,ezBH],[x1,y0,ezBH],[x1,y1,ezBH],[x0,y1,ezBH],[x0,y0,ezBH+h],[x1,y0,ezBH+h],[x1,y1,ezBH+h],[x0,y1,ezBH+h]];
  s += castShadow(ptsBox(-12, 62, 0, 106, 40), ezBH, top) + castShadow(ptsBox(ezFX, ezFY, ezFX + ezFW, ezFY + ezFD, ezFH), ezBH, top) + castShadow(ptsBox(-6, 0, 10, ezW, 16), ezBH, top);
  // parts pad
  s += box(ezBX - 4, ezBY - 4, ezBH, ezBX + ezBW + 4, ezBY + ezBD + 4, ezZP, { l:'#f7f7f2', m:'#e9e6dd', d:'#cfd4d0' }, toneI, 1);
  // strip (material) from the roll to the far end, and the "saved" tail
  s += box(2, 0, ezBH, ezEnd, ezW, ezZS, EZP.sheet, toneI, 1);
  const Lm = t >= EZ_T.mark0 ? ezMarkLen(t) : ezLb;
  if (Lm < ezLb - .5){ const a = ezXS + Lm + 2, b = ezXS + ezLb + 2;
    s += `<path d="${pd(on(PZ(ezZS + .05), rectUV(a, 1, b, ezW - 1)))}" fill="#edf4ff" stroke="${EZ_BLUE}" stroke-width="1.1" stroke-dasharray="3 2.2" stroke-linejoin="round"/>`; }
  s += ezCutLines(t);
  // objects, back to front
  const items = [];
  items.push({ at:[2, ezW/2, ezBH + 8], svg: ezRoll() });
  const stTxt = ['READY','ROWS','NEST','CUTS','EXPORT','DONE'][ezScene(t)];
  const bar = t < EZ_T.row0 ? 0 : ezClamp((t - EZ_T.row0)/(EZ_E[4] - EZ_T.row0));
  items.push({ at:[-6, 84, ezBH + 20], svg: ezMonitor(stTxt, bar) });
  items.push({ at:[ezFX + 13, ezFY + 14, ezBH + 5], svg: ezFolder(t) });
  ezD.parts.forEach(p => { const pose = ezPose(p, t); items.push({ at: ezCentre(p, pose), svg: ezPart(p, pose) }); });
  const cd = ezCard(t); if (cd) items.push({ at:[ezFX, 22, 30], svg: cd });
  s += byDepth(items);
  // length marker (a flag across the roll at the used length)
  if (t >= EZ_T.row0 + 13*EZ_T.rowStag + EZ_T.rowHop - .1){ const xm = ezXS + Lm + 3;
    s += box(xm, -2, ezZS, xm + 1.6, ezW + 2, ezZS + 4.5, EZP.out, toneI, 1); }
  s += ezPixels(t);
  // labels (a few, per scene)
  const sc = ezScene(t), tg = [];
  if (sc === 0) tg.push(ezTag([2, ezW*.8, ezBH + 16], -34, -30, 'MATERIAL WIDTH'), ezTag([ezBX + 70, ezBY + 14, ezZP + 2], 30, 36, 'PARTS'));
  if (sc === 1) tg.push(ezTag([ezXS + ezLb*.62, 2, ezZS + 2], 30, -52, 'ROW LAYOUT', true));
  if (sc === 2) { tg.push(ezTag([ezXS + 30, 6, ezZS + 2], 20, -44, 'NESTING', true));
    if (Lm < ezLb - 18) tg.push(ezTag([ezXS + (Lm + ezLb)/2, ezW/2, ezZS + .3], -6, 54, 'SHORTER', true)); }
  if (sc === 3) tg.push(ezTag([ezXS + ezWorld(ezD.parts[1],'nest')[0] - ezXS, ezWorld(ezD.parts[1],'nest')[1], ezZS + 2], 20, -44, 'CUT LINES', true), ezTag([ezGapPair[1], ezGapPair[2], ezZS + 1], 52, 8, 'MIN GAP'));
  if (sc === 4) tg.push(ezTag([ezFX + ezFW, ezFY + 14, ezBH + 8], 26, 40, 'HOT FOLDER', true));
  s += tg.join('');
  return s.split(SHADOW).join(EZ_SHADOW).split(INK).join(EZ_INK).split('ui-monospace,Menlo,monospace').join('OUTPUT Shop,Arial,sans-serif');
}

const prefix='book-eznest-';const total=EZ_TOTAL,scene=t=>ezScene3({t}),say=t=>EZ_CAP[ezScene(t)][0];
const duration=total+3.1;const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));return t<=total+1.3?Math.min(t,total):total*(1-smooth((t-total-1.3)/1.8));}
function render(t){VIEW=0;RC=[0,0];OX=0;OY=0;INK_K=.65;_clipN=0;setLight(110);const svg=inkScale(scene(at(t)));return svg.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function caption(t){return t>total+1.3?'Resetting this illustrative workflow.':say(at(t));}
return {duration,stillTime:total,viewBox:'',render,caption};
})(),maiat:(()=>{
/* Original Maiat + Dojo figure: a quote card passes a mechanical approval stamp,
   then becomes an illustrated receipt. It never signs, approves or pays anything. */
const AGP={paper:{l:'#fff9e9',m:'#e6dbc5',d:'#c3b69c'},green:{l:'#739d7e',m:'#427657',d:'#24533d'},lilac:{l:'#b7a5cb',m:'#9381ad',d:'#66567d'},metal:{l:'#c5d0bf',m:'#9eae93',d:'#6e8467'},ink:{l:'#5d6c60',m:'#46584b',d:'#2b4033'}};
const agClamp=v=>Math.max(0,Math.min(1,v));
const agEase=v=>{const k=agClamp(v);return k*k*(3-2*k);};
function agPose(t){
 const arrival=agEase((t-.4)/1.8),exit=agEase((t-4.8)/2.2);
 const down=agEase((t-2.6)/.7),up=agEase((t-3.7)/.7);
 return {x:24+90*arrival+64*exit,stroke:24.8*down*(1-up),approved:t>=3.3};
}
function agScene(t,inventory=null){
 const parts=[],pose=agPose(t),items=[];
 const b=(name,x,y,z,w,d,h,m)=>{parts.push({name,x,y,z,w,d,h});items.push({at:[x+w/2,y+d/2,z+h/2],svg:box(x,y,z,x+w,y+d,z+h,m,toneI,.7)});};
 const c=(name,x,y,z0,z1,r,m)=>{parts.push({name,x:x-r,y:y-r,z:z0,w:r*2,d:r*2,h:z1-z0,shape:'cylinder'});items.push({at:[x,y,(z0+z1)/2],svg:cyl(x,y,z0,z1,r,m,toneI,.7,20)});};
 // Four feet meet the underside at z0; all other fixed parts contact the z6 top.
 let s='';for(const [x,y] of [[8,8],[196,8],[8,98],[196,98]]){parts.push({name:'platform foot',x,y,z:-6,w:12,d:12,h:6});s+=box(x,y,-6,x+12,y+12,0,AGP.ink,toneI,.7);}
 parts.push({name:'platform',x:0,y:0,z:0,w:216,d:118,h:6});s+=board(0,0,216,118,6,6,AGP.paper);
 b('quote bed',12,48,6,156,38,4,AGP.metal);
 b('receipt tray floor',168,48,6,44,38,4,AGP.metal);
 for(const y of [44,86])b('continuous card guide',12,y,6,200,4,8,AGP.green);
 for(const x of [12,208])b('track end stop',x,48,10,4,38,5,AGP.lilac);
 // The two feet support columns, which support the beam and forward cantilever.
 for(const x of [94,146])b('column mounting foot',x,26,6,16,20,4,AGP.metal);
 for(const x of [98,150])b('column',x,30,10,8,12,72,AGP.lilac);
 b('cross beam',98,30,82,60,12,8,AGP.lilac);
 b('stamp cantilever',122,42,82,12,30,6,AGP.lilac);
 c('telescoping ram',128,66,51-pose.stroke,82,4,AGP.metal);
 b('moving stamp head',110,50,42-pose.stroke,36,32,9,AGP.lilac);
 b('pad backing',110,50,39-pose.stroke,36,32,3,AGP.metal);
 b('rubber stamp face',110,50,36-pose.stroke,36,32,3,AGP.green);
 for(const [x,y] of [[115,55],[141,55],[115,77],[141,77]])c('head retaining screw',x,y,51-pose.stroke,52-pose.stroke,1.1,AGP.ink);
 for(const x of [97,107,149,159])for(const y of [29,43])c('mounting screw',x,y,10,10.6,.9,AGP.ink);
 for(const x of [20,65,115,200])for(const y of [46,88])c('guide retaining screw',x,y,14,14.6,.9,AGP.ink);
 // Three sheet edges stay together throughout translation; their top is z11.2.
 let paper='';for(let i=0;i<3;i++){parts.push({name:'quote card sheet',x:pose.x,y:54,z:10+i*.4,w:28,d:24,h:.4});paper+=box(pose.x,54,10+i*.4,pose.x+28,78,10+(i+1)*.4,AGP.paper,toneI,.5);}
 for(let i=0;i<3;i++)paper+=shape(on(PZ(11.25),rectUV(pose.x+5,59+i*4,pose.x+22,59.8+i*4)),i===0?'#66567d':'#9eae93',0);
 if(pose.approved){const x=pose.x+18;paper+=ink(pd([[x,72,11.3],[x+2,74,11.3],[x+7,68,11.3]]),1.3).replace(INK,'#427657');}
 items.push({at:[pose.x+14,66,11],svg:paper});
 // Indicators are fixed to the +x-facing column surface, not floating above it.
 for(let i=0;i<3;i++){parts.push({name:'column indicator',x:158,y:34,z:55+i*9,w:1,d:4,h:4,shape:'cylinder-x'});items.push({at:[158.5,36,57+i*9],svg:cylX(158,159,36,57+i*9,2,pose.approved&&i===2?AGP.green:AGP.metal,toneI,.6,16)});}
 s+=byDepth(items);
 for(const [x,label] of [[42,'QUOTE'],[128,'CONSENT'],[187,'RECEIPT']])s+=txY(x,118.1,2.7,label,3.3,'#46584b',700);
 if(inventory)inventory.push(...parts);
 return s.replaceAll(INK,'#293d38');
}

const prefix='book-maiat-';const total=7.7,scene=t=>agScene(t),say=t=>t<2.6?'A quote arrives at the approval station.':t<4.8?'The illustrated approval stamp meets the card.':'The approved example leaves a receipt.';
const duration=total+3.1;const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));return t<=total+1.3?Math.min(t,total):total*(1-smooth((t-total-1.3)/1.8));}
function render(t){VIEW=0;RC=[0,0];OX=0;OY=0;INK_K=.65;_clipN=0;setLight(110);const svg=inkScale(scene(at(t)));return svg.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^\)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function caption(t){return t>total+1.3?'Resetting this illustrative workflow.':say(at(t));}
return {duration,stillTime:total,viewBox:'',render,caption};
})()};
})();
window.bookScenes.output.viewBox="-128 -33 312 187";
window.bookScenes.eznest.viewBox="-141 -50 335 220";
window.bookScenes.maiat.viewBox="-118 -44 320 228";
