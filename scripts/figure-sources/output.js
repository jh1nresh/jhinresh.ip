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
