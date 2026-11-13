'use strict';
/* =====================================================================
   Strand hair engine
   The hair is not a fixed picture. It is a row of strands:
     hairLen[16]  where each back strand ends (y in doll units, 206..470)
     bangLen[9]   where each fringe strand ends (104 = no fringe .. 178)
     hairTex[16]  0 straight · 1 wavy · 2 curly, per strand
     hairDo       loose | pony | pigtails | braids | sidebraid | buns | bun
   A preset style (s.hair) only supplies defaults; anything the player cut,
   curled or tied is stored on top of it and survives every activity.
   ===================================================================== */
const HN = 16, BN = 9, HMIN = 206, HMAX = 470, BMIN = 104, BMAX = 178;
const colX = i => 80 + 16 * i, bangX = j => 120 + 20 * j;
const CAPB = 'M100,172 C84,28 316,28 300,172';
const BANGP = { fringe: [133, 138, 141, 143, 144, 143, 141, 138, 133], side: [170, 163, 156, 149, 142, 135, 127, 119, 112], part: [158, 140, 124, 110, 104, 110, 124, 140, 158], pixie: [150, 130, 152, 126, 150, 124, 150, 128, 152] };
const HAIRDEF = {
  long: { len: 440, tex: 0, bang: 'part', do: 'loose' }, waves: { len: 452, tex: 1, bang: 'side', do: 'loose' }, curls: { len: 400, tex: 2, bang: 'part', do: 'loose' },
  bob: { len: 274, tex: 0, bang: 'fringe', do: 'loose' }, pixie: { len: 212, tex: 0, bang: 'pixie', do: 'loose' },
  braids: { len: 420, tex: 0, bang: 'part', do: 'braids' }, sidebraid: { len: 430, tex: 0, bang: 'side', do: 'sidebraid' }, pony: { len: 430, tex: 0, bang: 'fringe', do: 'pony' },
  buns: { len: 400, tex: 0, bang: 'fringe', do: 'buns' }, bun: { len: 420, tex: 0, bang: 'side', do: 'bun' }, pigtails: { len: 330, tex: 2, bang: 'part', do: 'pigtails' },
};
const DOS = [{ id: 'loose', name: 'Loose' }, { id: 'pony', name: 'Ponytail' }, { id: 'pigtails', name: 'Twin tails' }, { id: 'braids', name: 'Two braids' }, { id: 'sidebraid', name: 'Side braid' }, { id: 'buns', name: 'Two buns' }, { id: 'bun', name: 'Top bun' }];
const RAINBOWS = { rainbow: ['#ff8fa3', '#ffb07a', '#ffe27a', '#a8e26b', '#7fd4ff', '#b79bff'], sunset: ['#ff5c8a', '#ff9e3d', '#ffd93d'], mermaid: ['#7ee8c7', '#7fd4ff', '#b79bff'], candy: ['#ff9ecb', '#fff1c9', '#bfe6ff'], galaxy: ['#4b3a8f', '#9d7bff', '#ff9ecb'] };
const HAIRFX = [{ id: 'solid', name: 'One colour' }, { id: 'ombre', name: 'Ombre tips' }, { id: 'rainbow', name: 'Rainbow' }, { id: 'sunset', name: 'Sunset' }, { id: 'mermaid', name: 'Mermaid' }, { id: 'candy', name: 'Candy' }, { id: 'galaxy', name: 'Galaxy' }];

const fillN = (n, v) => Array.from({ length: n }, () => v);
const lum = c => { const [r, g, b] = hex2rgb(c); return .3 * r + .59 * g + .11 * b; };

/* the one place that answers "what does her hair look like right now?" */
function hairModel(s) {
  const d = HAIRDEF[s.hair] || HAIRDEF.long, arr = (a, n) => Array.isArray(a) && a.length === n ? a : null;
  return { len: arr(s.hairLen, HN) || fillN(HN, d.len), bang: arr(s.bangLen, BN) || BANGP[d.bang], tex: arr(s.hairTex, HN) || fillN(HN, d.tex), do: s.hairDo || d.do, vol: +s.hairVol || 0 };
}
function ensureHair(s) { const m = hairModel(s); s.hairLen = m.len.map(Math.round); s.bangLen = m.bang.map(Math.round); }

function hairPaint(s, maxLen, wet) {
  const fx = s.hairFx || 'solid', base = s.hairColor, damp = c => wet ? mix(c, '#1d1038', wet * .28) : c;
  const stops = fx === 'ombre' ? [base, s.hairColor2 || shade(base, .55)] : RAINBOWS[fx];
  if (!stops) return { defs: '', f: damp(base), c: base };
  const id = uid();
  return { defs: `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${fx === 'ombre' ? 150 : 60}" x2="0" y2="${Math.max(270, maxLen)}">${stops.map((c, i) => `<stop offset="${f1(i / (stops.length - 1))}" stop-color="${damp(c)}"/>`).join('')}</linearGradient></defs>`, f: `url(#${id})`, c: stops[0] };
}

/* soft outline through a list of points (starts at the current pen position = pts[0]) */
const smooth = pts => { let d = ''; for (let i = 1; i < pts.length - 1; i++) d += `Q${f1(pts[i][0])},${f1(pts[i][1])} ${f1((pts[i][0] + pts[i + 1][0]) / 2)},${f1((pts[i][1] + pts[i + 1][1]) / 2)} `; const l = pts[pts.length - 1]; return d + `L${f1(l[0])},${f1(l[1])}`; };

function looseBack(m, wet) {
  const L = m.len, vol = m.vol * (1 - wet * .8), curls = [];
  const edge = side => {
    const i = side < 0 ? 0 : HN - 1, l = L[i], tx = m.tex[side < 0 ? 1 : HN - 2], fl = Math.min(22, (l - 172) * .085) * (1 + vol * .7) - wet * 3, n = Math.max(1, Math.round((l - 172) / 34)), pts = [];
    for (let q = 1; q <= n; q++) { const t = q / n, y = 172 + (l - 172) * t; let x = 100 + fl * t + vol * 8 * Math.sin(Math.PI * t); if (tx === 1 && q < n) x += q % 2 ? 11 : -7; if (tx === 2) curls.push([200 + side * (x + 2), y - 8, 25]); pts.push([200 + side * x, y]); }
    return pts;
  };
  const R = edge(1), Lf = edge(-1), xl = Lf[Lf.length - 1][0], xr = R[R.length - 1][0], tips = [];
  for (let i = HN - 2; i >= 1; i--) { const x = xl + (xr - xl) * i / (HN - 1), y = L[i] + (m.tex[i] === 1 ? (i % 2 ? 7 : -3) : 0); tips.push([x, y]); if (m.tex[i] === 2 && i % 2) curls.push([x, y - 4, 20]); }
  return { d: `${CAPB} ` + smooth([[300, 172], ...R, ...tips, ...Lf.reverse(), [100, 172]]) + 'Z', curls };
}
function capPath(B) { const pts = [[294, 182]]; for (let j = BN - 1; j >= 0; j--) pts.push([bangX(j), B[j]]); pts.push([106, 182]); return 'M106,182 C90,38 310,38 294,182 ' + smooth(pts) + 'Z'; }

function hairParts(s) {
  const m = hairModel(s), sp = s._spa, wet = sp ? sp.wet : 0, mx = Math.max(...m.len);
  const { defs, f, c } = hairPaint(s, mx, wet);
  // "§" marks the hair paint, so every piece can be drawn once in colour and once as a soft shadow
  const two = (mk, dark) => mk.replaceAll('§', f) + (dark ? `<g opacity="${dark}">${mk.replaceAll('§', '#1d1038')}</g>` : '');
  const A = m.len.reduce((a, b) => a + b, 0) / HN, k = Math.max(.2, Math.min(1.1, (A - HMIN) / 224));
  const braid = (x, y, n, dx = 0) => { let all = '', odd = ''; for (let i = 0; i < n; i++) { const e = `<ellipse cx="${x + dx * i + (i % 2 ? 5 : -5)}" cy="${y + i * 26}" rx="15" ry="18" fill="§"/>`; all += e; if (i % 2) odd += e; } const ex = x + dx * n, ey = y + n * 26 - 8; return two(all + `<path d="M${ex - 9},${ey} l9,34 l9,-34Z" fill="§"/>`) + `<g opacity=".14">${odd.replaceAll('§', '#1d1038')}</g>` + bow(ex, ey, 11, '#ff8fc0'); };
  let back = defs, front = '', top = '';
  if (m.do === 'loose') {
    const lb = looseBack(m, wet);
    back += two(`<path d="${lb.d}" fill="§"/>`, .13) + lb.curls.map(([x, y, r], i) => two(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="§"/>`, i % 2 ? .1 : 0)).join('');
  } else {
    back += two(`<path d="${CAPB} L298,214 Q200,236 102,214Z" fill="§"/>`, .13);
    if (m.do === 'pony') back += two(`<g transform="translate(262,68) scale(${f1(.75 + .25 * k)},${f1(k)}) translate(-262,-68)"><path d="M256,66 C340,50 380,150 356,252 C346,304 360,344 336,380 C332,322 300,284 296,212 C294,150 282,108 256,66Z" fill="§"/></g>`) + `<circle cx="272" cy="74" r="13" fill="#ff8fc0"/>`;
    if (m.do === 'buns') { const r = f1(22 + 16 * k); back += two(`<circle cx="124" cy="74" r="${r}" fill="§"/><circle cx="276" cy="74" r="${r}" fill="§"/>`) + `<circle cx="114" cy="62" r="10" fill="#fff" opacity=".18"/><circle cx="266" cy="62" r="10" fill="#fff" opacity=".18"/>`; }
    if (m.do === 'bun') back += two(`<circle cx="200" cy="50" r="${f1(26 + 16 * k)}" fill="§"/>`) + `<circle cx="188" cy="38" r="11" fill="#fff" opacity=".18"/>`;
    if (m.do === 'pigtails') { const cs = [[86, 196, 32], [76, 242, 30], [84, 286, 24], [92, 320, 16]].slice(0, Math.max(1, Math.round(k * 4))); back += two(mirror(cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="§"/>`).join(''))); front += mirror(bow(100, 168, 12, '#ff8fc0')); }
    if (m.do === 'braids') { const n = Math.max(1, Math.round(k * 7)); front += braid(108, 214, n) + braid(292, 214, n); }
    if (m.do === 'sidebraid') front += braid(290, 206, Math.max(1, Math.round(k * 8)), -2);
  }
  front += two(`<path d="${capPath(m.bang)}" fill="§"/>`) + `<path d="M146,86 Q200,62 254,86" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity="${lum(c) > 190 ? .55 : .22}"/>`;
  if (m.do === 'loose') { // curls also puff up the crown, per side
    const cl = m.tex[1] === 2, cr = m.tex[HN - 2] === 2;
    if (cl) front += two(`<circle cx="118" cy="120" r="20" fill="§"/><circle cx="160" cy="92" r="22" fill="§"/>`);
    if (cr) front += two(`<circle cx="282" cy="120" r="20" fill="§"/><circle cx="240" cy="92" r="22" fill="§"/>`);
    if (cl && cr) front += two(`<circle cx="200" cy="84" r="22" fill="§"/>`);
  }
  if (s.hairShine) top += star(150, 104, 8, '#fff', 'opacity=".95"') + star(258, 124, 6, '#fff', 'opacity=".95"') + (mx > 290 && m.do === 'loose' ? star(96, 250, 7, '#fff') + star(306, 300, 6, '#fff') : '') + `<path d="M134,112 Q200,80 266,112" stroke="#fff" stroke-width="5" fill="none" opacity=".3" stroke-linecap="round"/>`;
  if (sp) { // hair spa: tangles, shampoo, foam and drips
    const tc = lum(c) > 150 ? shade(c, -.4) : shade(c, .45);
    top += sp.tangles.map(([x, y]) => `<path d="M${f1(x - 12)},${f1(y)} q4,-12 8,0 t8,0 t8,0 M${f1(x - 8)},${f1(y + 9)} l-9,-6 M${f1(x + 9)},${f1(y - 9)} l9,-6" stroke="${tc}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');
    top += sp.dollops.map(([x, y]) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="14" ry="10" fill="#b79bff"/><ellipse cx="${f1(x - 4)}" cy="${f1(y - 3)}" rx="4.500" ry="2.500" fill="#fff" opacity=".75"/>`).join('');
    top += sp.bubbles.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" opacity=".93" stroke="#cfeaff" stroke-width="1.5"/><circle cx="${f1(x - r * .3)}" cy="${f1(y - r * .3)}" r="${f1(r * .24)}" fill="#dff3ff"/>`).join('');
    if (wet > .5 && m.do === 'loose') top += [0, 3, 12, 15].map(i => { const x = i < 8 ? 90 + i * 4 : 250 + i * 4, y = m.len[i] + 12; return `<path d="M${x},${y - 6} q5,8 0,11 q-5,-3 0,-11Z" fill="#8fd3ff"/>`; }).join('');
  }
  return { back, front, top };
}

/* ---------- cutting ---------- */
/* Scissors at (x, y): strands under the blades end there. Fringe and back hair are separate strands. */
function cutAt(s, x, y, r = 14) {
  const out = [];
  if (y <= BMAX + 10 && x > 108 && x < 292) {
    const ny = Math.round(Math.max(BMIN, y));
    for (let j = 0; j < BN; j++) if (Math.abs(bangX(j) - x) <= r && ny < s.bangLen[j] - 1) { out.push({ x: bangX(j), y: ny, h: s.bangLen[j] - ny }); s.bangLen[j] = ny; }
  } else if (y >= HMIN - 8) {
    const ny = Math.round(Math.max(HMIN, y));
    for (let i = 0; i < HN; i++) if (Math.abs(colX(i) - x) <= r && ny < s.hairLen[i] - 1) { out.push({ x: colX(i), y: ny, h: s.hairLen[i] - ny }); s.hairLen[i] = ny; }
  }
  return out;
}
/* ready-made cuts: a target length for every strand (u runs -1 at her left edge .. 1 at her right edge) */
const CUTS = { long: u => 440 - u * u * 12, medium: u => 345 - u * u * 8, layered: u => 300 + (1 - Math.abs(u)) * 130, bob: u => 268 + Math.abs(u) * 10, short: u => 222 + (1 - Math.abs(u)) * 6 };
const cutProfile = id => fillN(HN, 0).map((_, i) => Math.round(CUTS[id](i / (HN - 1) * 2 - 1)));
const onHair = (s, x, y) => x > 62 && x < 338 && y > 44 && y < Math.max(...hairModel(s).len) + 40;
