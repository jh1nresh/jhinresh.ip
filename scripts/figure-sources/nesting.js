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
