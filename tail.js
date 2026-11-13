'use strict';
/* =====================================================================
   Mermaid Tail Beauty Studio
   The tail is drawn from the shared look, layer by layer:
     colour blend -> pattern(s) -> painted scales -> shine -> fin -> decorations -> magic effects
   State (all on the look S, so every screen, the gallery and photos show it):
     tailOn · tailC/tailC2/tailC3 + tailGrad · tailPat/tailPat2 + tailPC
     tailScales[]  one entry per scale: "x" or "<hex>_<n|g|m|w|h>" (plain, glitter, metallic, glow, heart)
     tailStick[]   decorations: "<type>_<x>_<y>_<size>"
     finShape · finC/finC2 · finLook · tailFx
   ===================================================================== */
const TAIL_D = 'M172,368 C160,400 162,430 168,470 C174,520 186,570 190,606 L210,606 C214,570 226,520 232,470 C238,430 240,400 228,368Z';
const FINS = {
  classic: 'M200,598 C170,610 130,640 118,690 C150,684 186,668 200,640 C214,668 250,684 282,690 C270,640 230,610 200,598Z',
  big: 'M200,596 C160,600 104,630 84,696 C130,694 184,676 200,644 C216,676 270,694 316,696 C296,630 240,600 200,596Z',
  small: 'M200,600 C182,610 158,630 150,668 C172,664 192,652 200,636 C208,652 228,664 250,668 C242,630 218,610 200,600Z',
  round: 'M200,598 C150,600 116,640 132,680 C150,700 190,684 200,650 C210,684 250,700 268,680 C284,640 250,600 200,598Z',
  butterfly: 'M200,600 C160,570 104,590 110,636 C114,662 170,650 200,628 C230,650 286,662 290,636 C296,590 240,570 200,600Z M200,628 C176,640 140,660 150,694 C170,700 194,676 200,650 C206,676 230,700 250,694 C260,660 224,640 200,628Z',
  ribbon: 'M200,598 C176,620 150,650 96,664 C140,676 150,700 130,700 C170,700 192,676 200,646 C208,676 230,700 270,700 C250,700 260,676 304,664 C250,650 224,620 200,598Z',
};
const FINL = [{ id: 'classic', name: 'Classic' }, { id: 'big', name: 'Big' }, { id: 'small', name: 'Small' }, { id: 'round', name: 'Rounded' }, { id: 'butterfly', name: 'Butterfly' }, { id: 'ribbon', name: 'Ribbon' }];
const FINLOOK = [{ id: 'solid', name: 'Solid' }, { id: 'clear', name: 'See-through' }, { id: 'glitter', name: 'Glitter' }, { id: 'clearglit', name: 'Clear glitter' }];
const TAILGRAD = [{ id: 'one', name: 'One colour' }, { id: 'two', name: 'Two colours' }, { id: 'three', name: 'Three colours' }, { id: 'rainbow', name: 'Rainbow' }, { id: 'shimmer', name: 'Shimmer' }];
const TAILPAT = [none, { id: 'scales', name: 'Mermaid scales' }, { id: 'fish', name: 'Fish scales' }, { id: 'waves', name: 'Waves' }, { id: 'stars', name: 'Stars' }, { id: 'flowers', name: 'Flowers' }, { id: 'hearts', name: 'Hearts' }, { id: 'shells', name: 'Shells' }, { id: 'rainbow', name: 'Rainbow' }];
const TAILFX = [none, { id: 'bubbles', name: 'Bubbles' }, { id: 'sparkle', name: 'Sparkles' }, { id: 'shimmer', name: 'Shimmer' }, { id: 'glow', name: 'Glow' }, { id: 'waves', name: 'Water waves' }, { id: 'glitter', name: 'Glitter' }, { id: 'colours', name: 'Colour dance' }, { id: 'all', name: 'All the magic' }];
const TAILPAL = ['#ff8fc0', '#b06bff', '#3f8fe0', '#5fd3c8', '#c9a2ff', '#ffc94d', '#d6dcec', '#ff5c8a', '#7fd4ff', '#a8e26b', '#ffffff', '#4b3a8f'];
const TDECO = [['pearl', 'Pearl'], ['diamond', 'Diamond'], ['star', 'Star'], ['heart', 'Heart'], ['shell', 'Shell'], ['flower', 'Flower'], ['bubble', 'Bubble'], ['crystal', 'Crystal']];
const tdecoDraw = t => ({
  pearl: () => gem(0, 0, 7, '#ffffff'), diamond: () => diamond(0, 0, 11, '#9fe8ff'), star: () => star(0, 0, 11, '#ffe27a', 'stroke="#f5a623" stroke-width="1"'), heart: () => heart(0, 0, 14, '#ff4f8b', 'stroke="#fff" stroke-width="1"'),
  shell: () => EMB.ocean(0, 0, 10, '#ffb3d1'), flower: () => flower(0, 0, 11, '#ff9ecb'), bubble: () => `<circle r="9" fill="#fff" opacity=".4" stroke="#fff" stroke-width="2"/><circle cx="-3" cy="-3" r="2.500" fill="#fff"/>`,
  crystal: () => `<path d="M0,-14 L8,-4 L5,12 L-5,12 L-8,-4Z" fill="#c9a2ff" stroke="#fff" stroke-width="1.2"/><path d="M0,-14 L0,12 M-8,-4 H8" stroke="#fff" stroke-width="1" opacity=".7"/>`,
}[t] || (() => ''))();
const decoParse = v => { const [t, x, y, z] = String(v).split('_'); return { t, x: +x || 200, y: +y || 480, z: Math.max(50, Math.min(260, +z || 100)) }; };

/* where every scale sits (doll units); rows are staggered like real scales */
const tailHalf = y => { const P = [[368, 26], [400, 36], [470, 32], [540, 22], [606, 10]]; for (let i = 1; i < P.length; i++) if (y <= P[i][0]) return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * (y - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return 10; };
const TAIL_SCALES = [];
for (let r = 0; r < 12; r++) { const y = 388 + r * 18, hw = tailHalf(y + 4) - 3; for (let k = -3; k <= 3; k++) { const x = 200 + k * 16 + (r % 2 ? 8 : 0); if (Math.abs(x - 200) <= hw && TAIL_SCALES.length < 60) TAIL_SCALES.push([x, y, r]); } }
const scaleGet = (s, i) => { const [c, fx] = String((Array.isArray(s.tailScales) && s.tailScales[i]) || 'x').split('_'); return /^[0-9a-f]{6}$/i.test(c) ? { c: '#' + c, fx: 'ngmwh'.includes(fx) && fx ? fx : 'n' } : null; };
const scaleSet = (i, c, fx) => { if (!Array.isArray(S.tailScales) || S.tailScales.length !== TAIL_SCALES.length) S.tailScales = fillN(TAIL_SCALES.length, 'x'); S.tailScales[i] = c ? `${c.slice(1)}_${fx || 'n'}` : 'x'; };

function tailPattern(p, pc) {
  if (!p || p === 'none') return '';
  if (p === 'rainbow') return RAINBOWS.rainbow.map((q, i) => `<rect x="150" y="${368 + i * 40}" width="100" height="40" fill="${q}" opacity=".5"/>`).join('');
  const id = uid(), st = `stroke="${pc}" stroke-width="2" fill="none" opacity=".65"`, fl = 'opacity=".6"';
  const cell = {
    scales: [16, 36, 192, 386, `<path d="M0,0 a8,10 0 0 0 16,0 M-8,18 a8,10 0 0 0 16,0 M8,18 a8,10 0 0 0 16,0" ${st}/>`], fish: [12, 14, 194, 372, `<path d="M0,10 a6,7 0 0 1 12,0 M-6,3 a6,7 0 0 1 12,0 M6,3 a6,7 0 0 1 12,0" ${st}/>`],
    waves: [24, 16, 188, 372, `<path d="M0,8 q6,-8 12,0 t12,0" ${st}/>`], stars: [28, 28, 186, 374, star(7, 7, 5.5, pc, fl) + star(21, 21, 5.5, pc, fl)],
    flowers: [30, 30, 185, 374, `<g ${fl}>${flower(8, 8, 6, pc)}${flower(23, 23, 6, pc)}</g>`], hearts: [28, 28, 186, 374, heart(7, 7, 8, pc, fl) + heart(21, 21, 8, pc, fl)],
    shells: [30, 30, 185, 374, `<g ${fl}>${EMB.ocean(8, 8, 6, pc)}${EMB.ocean(23, 23, 6, pc)}</g>`],
  }[p];
  return cell ? `<pattern id="${id}" patternUnits="userSpaceOnUse" x="${cell[2]}" y="${cell[3]}" width="${cell[0]}" height="${cell[1]}">${cell[4]}</pattern><rect x="150" y="360" width="100" height="250" fill="url(#${id})"/>` : '';
}

/* the whole tail, drawn in place of legs and skirt when s.tailOn is set (called by the doll renderer in game.js) */
function tailSvg(s) {
  const c = s.tailC || '#5fd3c8', c2 = s.tailC2 || '#8f8bff', c3 = s.tailC3 || '#ff9ecb', pc = s.tailPC || '#ffffff';
  const stops = { one: [c, shade(c, -.14)], two: [c, c2], three: [c, c2, c3], rainbow: RAINBOWS.rainbow, shimmer: [c, shade(c, .65), c, shade(c, .65), c, shade(c, .5)] }[s.tailGrad] || [c, c2];
  const gid = uid(), cid = uid(), fid = uid(), fcid = uid(), fx = s.tailFx || 'none', has = k => fx === k || fx === 'all', dly = i => `style="animation-delay:${(-i * .47).toFixed(2)}s"`;
  const grad = (id, st, y1, y2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}">${st.map((q, i) => `<stop offset="${f1(i / (st.length - 1))}" stop-color="${q}"/>`).join('')}</linearGradient>`;
  const fc = s.finC || stops[stops.length - 1], fc2 = s.finC2 || shade(fc, .55), fin = FINS[s.finShape] || FINS.classic, look = s.finLook || 'solid', clear = look === 'clear' || look === 'clearglit', glit = look === 'glitter' || look === 'clearglit';
  let o = `<defs>${grad(gid, stops, 368, 606)}${grad(fid, [fc, fc2], 590, 700)}<clipPath id="${cid}"><path d="${TAIL_D}"/></clipPath><clipPath id="${fcid}"><path d="${fin}"/></clipPath></defs>`;
  if (has('glow')) o += `<path class="tfx-glow" d="${TAIL_D}" fill="none" stroke="${shade(c, .6)}" stroke-width="16" stroke-linejoin="round" opacity=".55"/>`;
  o += `<g${has('colours') ? ' class="tfx-hue"' : ''}>`;
  o += `<path d="${fin}" fill="url(#${fid})" opacity="${clear ? .58 : 1}"${clear ? ' stroke="#fff" stroke-width="3"' : ''}/><g clip-path="url(#${fcid})"><path d="M200,606 L118,694 M200,606 L160,700 M200,606 V700 M200,606 L240,700 M200,606 L282,694" stroke="#fff" stroke-width="3" opacity=".35" fill="none"/>`;
  if (glit) o += [[150, 664], [176, 640], [226, 642], [252, 668], [200, 668], [134, 684], [268, 682], [168, 620], [234, 618]].map(([x, y], i) => star(x, y, i % 2 ? 4 : 6, i % 3 ? '#fff' : '#ffe27a', has('glitter') || has('sparkle') ? `class="tfx-spk" ${dly(i)}` : '')).join('');
  o += `</g><path d="${TAIL_D}" fill="url(#${gid})"/><g clip-path="url(#${cid})">${tailPattern(s.tailPat || 'scales', pc)}${tailPattern(s.tailPat2, pc)}`;
  TAIL_SCALES.forEach(([x, y], i) => {       // painted scales sit on top of the pattern
    const sc = scaleGet(s, i); if (!sc) return;
    if (sc.fx === 'w') o += `<circle class="tfx-glo" cx="${x}" cy="${y + 3}" r="13" fill="${shade(sc.c, .4)}" opacity=".55"/>`;
    o += sc.fx === 'h' ? heart(x, y + 3, 14, sc.c, 'stroke="#fff" stroke-width="1"') : `<path d="M${x - 8},${y - 2} a8,10 0 0 0 16,0Z" fill="${sc.c}" stroke="${shade(sc.c, -.2)}" stroke-width="1"/>`;
    if (sc.fx === 'm') o += `<path d="M${x - 5},${y} a5,6 0 0 0 6,5" stroke="#fff" stroke-width="2.200" fill="none" opacity=".85" stroke-linecap="round"/><path d="M${x - 8},${y - 2} h16" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
    if (sc.fx === 'g') o += star(x - 3, y + 1, 3, '#fff') + star(x + 3, y + 4, 2.4, '#ffe27a');
  });
  o += `<path d="M178,384 C170,420 174,470 184,540" stroke="#fff" stroke-width="7" opacity=".28" fill="none" stroke-linecap="round"/>`;
  if (has('shimmer')) o += `<g transform="rotate(-18 200 480)"><rect class="tfx-shim" x="110" y="330" width="180" height="46" fill="#fff" opacity=".38"/></g>`;
  if (has('glitter')) o += [[184, 396], [214, 410], [196, 440], [220, 456], [180, 474], [206, 500], [192, 530], [212, 548], [200, 574], [198, 596]].map(([x, y], i) => star(x, y, 3.4, i % 2 ? '#fff' : '#ffe27a', `class="tfx-spk" ${dly(i)}`)).join('');
  o += `</g></g>`;
  o += [176, 188, 200, 212, 224].map((x, i) => `<circle cx="${x}" cy="${370 + (i === 2 ? 2 : i % 2 ? 1 : 0)}" r="7.500" fill="${shade(c, .5)}"/>`).join('') + [176, 200, 224].map(x => gem(x, 370, 3, '#fff')).join('');
  (Array.isArray(s.tailStick) ? s.tailStick : []).forEach((v, i) => { const d = decoParse(v); o += `<g transform="translate(${d.x},${d.y}) scale(${f1(d.z / 100)})">${tdecoDraw(d.t)}${i === s._tsel ? `<circle r="19" fill="none" stroke="#ff4f9a" stroke-width="2.500" stroke-dasharray="5 4"/>` : ''}</g>`; });
  if (has('bubbles')) o += [[150, 600, 6], [250, 560, 8], [140, 500, 5], [262, 640, 6], [170, 660, 7], [236, 470, 5]].map(([x, y, r], i) => `<circle class="tfx-bub" ${dly(i * 1.3)} cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".5" stroke="#fff" stroke-width="1.5"/>`).join('');
  if (has('sparkle')) o += [[146, 420], [256, 400], [136, 560], [266, 520], [160, 640], [246, 610]].map(([x, y], i) => star(x, y, i % 2 ? 6 : 9, i % 2 ? '#fff' : '#ffe27a', `class="tfx-spk" ${dly(i)}`)).join('');
  if (has('waves')) o += [0, 1].map(i => `<path class="tfx-wave" ${dly(i * 2.5)} d="M96,${672 + i * 16} q13,-11 26,0 t26,0 t26,0 t26,0 t26,0 t26,0 t26,0" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>`).join('');
  return o;
}

/* ---------- studio: underwater backdrop, tools, tabs ---------- */
SCENES.reef = () => {
  const [d, f] = vgrad(['#8fe6f2', '#56bcdc', '#3a8fc4']); let pearls = '';
  for (let i = 0; i <= 12; i++) { const a = Math.PI + Math.PI * i / 12; pearls += gem(+f1(400 + Math.cos(a) * 178), +f1(250 + Math.sin(a) * 178), 10, '#ffffff'); }
  const fish = (x, y, c, s) => `<g transform="translate(${x},${y}) scale(${s},${Math.abs(s)})"><ellipse rx="24" ry="13" fill="${c}"/><path d="M20,0 l20,-13 v26Z" fill="${c}"/><path d="M-4,-12 q8,-12 16,0Z" fill="${shade(c, -.15)}"/><circle cx="-12" cy="-3" r="3" fill="#3a2340"/></g>`;
  return d + `<rect width="800" height="700" fill="${f}"/>` + [[80, 60], [330, 110], [560, 90]].map(([x, w]) => `<path d="M${x},0 h${w + 40} l-90,640 h-150Z" fill="#fff" opacity=".1"/>`).join('') +
    `<path d="M235,620 V250 a165,165 0 0 1 330,0 V620Z" fill="#fff" opacity=".32"/><path d="M235,620 V250 a165,165 0 0 1 330,0 V620" fill="none" stroke="#ffd1e6" stroke-width="12"/>${pearls}` + EMB.ocean(400, 62, 30, '#ffb3d1') +
    fish(120, 170, '#ffb07a', 1) + fish(690, 250, '#ffe27a', -1) + fish(660, 120, '#ff9ecb', -.7) +
    [[90, 330, 9], [130, 420, 6], [700, 400, 10], [730, 500, 6], [60, 520, 7], [610, 60, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".35" stroke="#fff" stroke-width="2"/>`).join('') +
    `<path d="M0,620 Q400,576 800,620 V700 H0Z" fill="#ffe7b0"/>` +
    mirror(`<path d="M90,700 v-90 M90,650 q-36,-12 -40,-62 M90,630 q34,-12 42,-56 M90,610 q-8,-36 8,-70" stroke="#ff7da8" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M190,700 q-20,-60 0,-110 q20,-50 0,-110" stroke="#58bd8a" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M30,700 v-60 M30,668 q26,-10 30,-44" stroke="#b79bff" stroke-width="12" fill="none" stroke-linecap="round"/>`, 800) +
    star(300, 664, 16, '#ff9e7d') + EMB.ocean(520, 664, 16, '#ffffff') + gem(470, 676, 7, '#ffffff');
};
const brushArt = tip => `<rect x="27" y="30" width="10" height="32" rx="5" fill="#7a5cf0"/><rect x="25" y="24" width="14" height="10" rx="3" fill="#ffc94d"/>${tip}`;
const tipOne = c => `<path d="M22 26 Q20 8 32 2 Q44 8 42 26Z" fill="${c}" stroke="#fff" stroke-width="2.5"/>`;
ART.tail = `<path d="M22 4 C16 16 18 26 24 36 C28 44 30 48 31 50 L33 50 C34 48 36 44 40 36 C46 26 48 16 42 4Z" fill="#5fd3c8"/><path d="M24 10 a4,5 0 0 0 8,0 a4,5 0 0 0 8,0 M26 20 a3,4 0 0 0 6,0 a3,4 0 0 0 6,0 M29 30 a3,4 0 0 0 6,0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/><path d="M32 48 C22 50 12 54 8 62 C18 62 28 60 32 54 C36 60 46 62 56 62 C52 54 42 50 32 48Z" fill="#b79bff"/>`;
ui.scaleC = '#ff5c8a'; ui.tailSel = -1;
const SCALE_TOOLS = [
  { id: 'paint', name: 'Paint', art: () => brushArt(tipOne(ui.scaleC)), flip: true },
  { id: 'rainbow', name: 'Rainbow', art: brushArt(`<path d="M22 26 Q20 8 32 2 Q44 8 42 26Z" fill="#7fd4ff" stroke="#fff" stroke-width="2.5"/><path d="M22.500 20 h19 Q41 13 37 8 h-10 Q23 13 22.500 20Z" fill="#ffd36e"/><path d="M27 8 h10 Q35 4 32 2 Q29 4 27 8Z" fill="#ff8fa3"/>`), flip: true },
  { id: 'glitter', name: 'Glitter', art: ART.glitter }, { id: 'metal', name: 'Metallic', art: brushArt(tipOne('#d6dcec') + `<path d="M27 22 Q26 12 31 6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`), flip: true },
  { id: 'glow', name: 'Glow', art: `<circle cx="32" cy="32" r="26" fill="#fff6c9" opacity=".5"/><circle cx="32" cy="32" r="17" fill="#ffe27a" opacity=".8"/><circle cx="32" cy="32" r="9" fill="#fff"/>` },
  { id: 'heart', name: 'Heart scales', art: heart(32, 30, 40, '#ff4f8b', 'stroke="#fff" stroke-width="2"') }, { id: 'erase', name: 'Eraser', art: ART.remover },
];
const FXL = { glitter: 'g', metal: 'm', glow: 'w', heart: 'h' };
function scaleApply(tool, i) {
  const cur = scaleGet(S, i), was = Array.isArray(S.tailScales) ? S.tailScales[i] : 'x';
  if (tool === 'erase') scaleSet(i, null);
  else if (tool === 'paint') scaleSet(i, ui.scaleC, cur ? cur.fx : 'n');
  else if (tool === 'rainbow') scaleSet(i, RAINBOWS.rainbow[TAIL_SCALES[i][2] % 6], cur ? cur.fx : 'n');
  else scaleSet(i, cur ? cur.c : ui.scaleC, FXL[tool]);
  return S.tailScales[i] !== was;
}
function scaleDrag(tool, x, y, cx, cy) {
  let hit = false;
  TAIL_SCALES.forEach(([sx, sy], i) => { if (Math.hypot(sx - x, sy + 3 - y) <= 12 && scaleApply(tool, i)) hit = true; });
  if (hit) { sparkleAt(cx, cy, 2, tool === 'erase' ? '#fff' : undefined); if (every('scale', 80)) sfx.pop(); }
}
/* decorations: drop new ones, drag one to move it, drag it off the stage to take it away */
let tg = null;
function decoDrop(tool, x, y, cx, cy) {
  if (x < 100 || x > 300 || y < 352 || y > 700) return nudge('Drop it on her tail.');
  if (!Array.isArray(S.tailStick)) S.tailStick = [];
  pushHist(); S.tailStick.push(`${tool}_${Math.round(x)}_${Math.round(y)}_100`); if (S.tailStick.length > 30) S.tailStick.shift();
  ui.tailSel = S.tailStick.length - 1; persist(); paintDoll(); sfx.pick(); burst(cx, cy, 6);
}
function decoGrab(x, y) {
  const a = Array.isArray(S.tailStick) ? S.tailStick : []; let best = -1, bd = 1e9, bp = null;
  a.forEach((v, i) => { const d = decoParse(v), dist = Math.hypot(d.x - x, d.y - y); if (dist < Math.max(18, 14 * d.z / 100) && dist <= bd) { bd = dist; best = i; bp = d; } });
  if (best < 0) { ui.tailSel = -1; return false; }
  pushHist(); a.push(a.splice(best, 1)[0]); ui.tailSel = a.length - 1; tg = { dx: bp.x - x, dy: bp.y - y, moved: false }; sfx.tap(); return true;
}
function decoGrabMove(x, y) {
  const d = decoParse(S.tailStick[ui.tailSel]); if (!tg) return;
  S.tailStick[ui.tailSel] = `${d.t}_${Math.round(clamp(x + tg.dx, 40, 360))}_${Math.round(clamp(y + tg.dy, 330, 700))}_${d.z}`; tg.moved = true;
}
function decoGrabEnd(inside) {
  if (!inside) { S.tailStick.splice(ui.tailSel, 1); ui.tailSel = -1; tone(300, 0, .12, 'sine', .05); toast('Decoration taken off.'); }
  else if (tg && !tg.moved) { hist.undo.pop(); syncHist(); }
  tg = null;
}
function decoAct(act) {
  const a = Array.isArray(S.tailStick) ? S.tailStick : [];
  if (act === 'clear') { if (!a.length) return; pushHist(); S.tailStick = []; ui.tailSel = -1; }
  else { const v = a[ui.tailSel]; if (!v) return nudge('Tap a decoration on her tail first.'); const d = decoParse(v); pushHist(); if (act === 'del') { a.splice(ui.tailSel, 1); ui.tailSel = -1; } else a[ui.tailSel] = `${d.t}_${d.x}_${d.y}_${clamp(d.z + (act === 'big' ? 25 : -25), 50, 260)}`; }
  persist(); paintDoll(true); sfx.tap();
}
const tailTab = (key, label, o) => ({ key, label, vb: '80 350 240 356', fx: [200, 480], ...o });
function tailHint() {
  const t = curTab(), n = PMAP[S.princess].name;
  setHint(!S.tailOn ? 'Pick Mermaid tail to give her a tail to decorate.' : t.place ? 'Drag a decoration onto her tail. Drag it again to move it, or off the picture to take it away.' : t.tools ? 'Pick a brush and paint across her scales with your finger.' : t.colors ? `Tap a colour, or drag the brush onto ${n}'s tail.` : `Tap one to try it, or drag it onto ${n}.`);
}
STUDIOS.tail = {
  title: 'Mermaid tail studio', zoom: 'tail', tint: '#bfeaf5', hint: tailHint,
  scene: () => sceneSvg('reef') + auraHtml('ocean'),
  enter: () => { S.tailOn = true; if (!Array.isArray(S.tailStick)) S.tailStick = []; ui.tailSel = -1; },
  over: () => ({ _tsel: curTab().place ? ui.tailSel : -1 }),
  nav: () => `<div class="nav"><button class="btn ghost" data-go="salon">${ico(IC.salon)}Salon</button><button class="btn" id="toGallery">${ico(IC.heart)}Save to my gallery</button></div>`,
  tabs: [
    tailTab('tailC', 'Tail colour', { colors: TAILPAL }),
    tailTab('tailGrad', 'Colour blend', { items: TAILGRAD }),
    { label: 'Scale paint', zoom: 'tailclose', tools: SCALE_TOOLS, onStart: () => pushHist(), onDrag: scaleDrag,
      extra: () => `<div class="chips"><h3>Paint colour</h3><div class="nrow sws">${TAILPAL.map(c => `<button class="sw" data-sc="${c}" aria-pressed="${ui.scaleC === c}" style="--c:${c}" aria-label="Paint ${c}"></button>`).join('')}</div>${hueRow}<button class="chip" data-scall>Paint every scale</button><button class="chip" data-scclear>Clean all scales</button></div>` },
    { label: 'Decorations', zoom: 'tailclose', place: true, tools: TDECO.map(([id, name]) => ({ id, name, art: `<g transform="translate(32,32) scale(2.2)">${tdecoDraw(id)}</g>` })), onDrop: decoDrop, onGrab: decoGrab, onGrabMove: decoGrabMove, onGrabEnd: decoGrabEnd,
      extra: () => `<div class="chips"><h3>The decoration you tapped</h3><button class="chip" data-td="big">Bigger</button><button class="chip" data-td="small">Smaller</button><button class="chip" data-td="del">Take it off</button><button class="chip" data-td="clear">Take them all off</button></div>` },
    tailTab('finShape', 'Fin shape', { items: FINL, vb: '70 560 260 150', fx: [200, 650] }),
    tailTab('tailPat', 'Pattern', { items: TAILPAT }),
    tailTab('tailFx', 'Magic', { items: TAILFX }),
    tailTab('tailC2', 'Second colour', { colors: TAILPAL, onPick: () => { if (S.tailGrad !== 'two' && S.tailGrad !== 'three') S.tailGrad = 'two'; } }),
    tailTab('tailC3', 'Third colour', { colors: TAILPAL, onPick: () => { S.tailGrad = 'three'; } }),
    tailTab('tailPat2', 'Second pattern', { items: TAILPAT }),
    tailTab('tailPC', 'Pattern colour', { colors: TAILPAL, onPick: () => { if (!S.tailPat || S.tailPat === 'none' || S.tailPat === 'rainbow') S.tailPat = 'scales'; } }),
    tailTab('finC', 'Fin colour', { colors: [null, ...TAILPAL], noneLabel: 'Same as her tail', fx: [200, 650] }),
    tailTab('finC2', 'Fin tip colour', { colors: [null, ...TAILPAL], noneLabel: 'Soft fade', fx: [200, 670] }),
    tailTab('finLook', 'Fin style', { items: FINLOOK, vb: '70 560 260 150', fx: [200, 650] }),
    { key: 'tailMode', label: 'Tail or legs', items: [{ id: 'tail', name: 'Mermaid tail' }, { id: 'legs', name: 'Legs' }], vb: '60 250 280 450', fx: [200, 480], noSurprise: true, get: () => S.tailOn ? 'tail' : 'legs', set: v => { S.tailOn = v === 'tail'; }, pv: id => ({ tailOn: id === 'tail' }) },
  ],
};
ACTS.push({ id: 'tail', name: 'Mermaid Tail', art: ART.tail, c: '#bfeaf5', g: 'salon' });
PMAP.coralie.look = { ...(PMAP.coralie.look || {}), tailOn: true };          // the Mermaid Princess swims in with her tail
Object.assign(STUDIOS.dress.tabs.find(t => t.key === 'shoes'), { onPick: () => { if (S.tailOn) nudge('Mermaids swim without shoes. Pick Legs in the Mermaid Tail studio to wear them.'); } });

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t || save.stage !== 'tail') return;
  if (t.dataset.sc) { ui.scaleC = t.dataset.sc; if (ui.tool !== 'paint') ui.tool = 'paint'; sfx.tap(); return renderOpts(); }
  if (t.dataset.td) return decoAct(t.dataset.td);
  if ('scall' in t.dataset) { pushHist(); TAIL_SCALES.forEach((_, i) => scaleApply(ui.tool, i)); persist(); paintDoll(true); sfx.magic(); return burstAtDoll([200, 480]); }
  if ('scclear' in t.dataset) { if (!Array.isArray(S.tailScales)) return; pushHist(); S.tailScales = null; persist(); paintDoll(true); return sfx.tap(); }
});
