'use strict';
/* =====================================================================
   Salon activities (all of them edit the one shared look, S)
   1. tool art & small helpers     5. hair styling tools
   2. drag-tool engine + particles 6. facial spa
   3. hair spa                     7. nail salon
   4. hair cutting                 8. fashion designer · salon hub
   ===================================================================== */

/* ---------- 1. tool art & helpers ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const lastT = {};
const every = (k, ms) => { const n = performance.now(); if (n - (lastT[k] || 0) < ms) return false; lastT[k] = n; return true; };
const nudge = msg => { if (every('nudge', 2600)) toast(msg); };
const diamond = (x, y, r, f) => `<path d="M${x},${f1(y - r)} L${f1(x + r * .72)},${y} L${x},${f1(y + r)} L${f1(x - r * .72)},${y}Z" fill="${f}" stroke="#fff" stroke-width="1.2"/><path d="M${f1(x - r * .3)},${f1(y - r * .15)} L${x},${f1(y - r * .6)}" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
const hsl2hex = (h, s = .78, l = .68) => { const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); }; return rgb2hex([f(0), f(8), f(4)]); };

Object.assign(sfx, {
  snip: () => { tone(2300, 0, .04, 'square', .03); tone(1700, .05, .05, 'square', .03); },
  water: () => tone(rnd(900, 1500), 0, .08, 'sine', .025),
  pop: () => tone(rnd(500, 1000), 0, .07, 'sine', .05),
  air: () => tone(rnd(120, 160), 0, .14, 'sawtooth', .018),
  brush: () => tone(rnd(1400, 1900), 0, .05, 'triangle', .03),
});

/* every tool is a small original drawing on a 64 × 64 canvas */
const ART = {
  shower: `<path d="M44 6v20" stroke="#b9c2e8" stroke-width="6" stroke-linecap="round"/><path d="M14 30a18 12 0 0 1 36 0z" fill="#9fd8ff" stroke="#6fb8ef" stroke-width="2"/><path d="M20 38v6M32 38v10M44 38v6M26 46v8M38 46v8" stroke="#6fc3ff" stroke-width="3.5" stroke-linecap="round"/>`,
  shampoo: `<rect x="26" y="4" width="12" height="10" rx="3" fill="#7a5cf0"/><rect x="16" y="14" width="32" height="46" rx="12" fill="#c9a2ff"/><rect x="21" y="28" width="22" height="18" rx="6" fill="#fff"/>` + heart(32, 37, 9, '#ff6fa8'),
  sponge: `<rect x="8" y="22" width="48" height="32" rx="14" fill="#ffd36e"/><circle cx="22" cy="34" r="4" fill="#f5b83d"/><circle cx="36" cy="44" r="3.5" fill="#f5b83d"/><circle cx="44" cy="32" r="3" fill="#f5b83d"/><circle cx="16" cy="16" r="8" fill="#fff" stroke="#bfe6ff" stroke-width="2"/><circle cx="34" cy="12" r="6" fill="#fff" stroke="#bfe6ff" stroke-width="2"/><circle cx="50" cy="18" r="5" fill="#fff" stroke="#bfe6ff" stroke-width="2"/>`,
  dryer: `<rect x="28" y="30" width="13" height="30" rx="6" fill="#ff8fc0"/><rect x="10" y="8" width="46" height="28" rx="14" fill="#ff5c8a"/><rect x="2" y="13" width="12" height="18" rx="4" fill="#c9a2ff"/><circle cx="40" cy="22" r="8" fill="#fff" opacity=".8"/>`,
  brush: `<rect x="28" y="34" width="8" height="26" rx="4" fill="#7a5cf0"/><rect x="14" y="4" width="36" height="34" rx="15" fill="#c9a2ff"/>` + [[24, 14], [32, 12], [40, 14], [22, 23], [32, 22], [42, 23], [26, 31], [38, 31]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#fff"/>`).join(''),
  scissors: `<path d="M23 42L41 4M41 42L23 4" stroke="#cfd6ee" stroke-width="6" stroke-linecap="round"/><circle cx="18" cy="50" r="9" fill="none" stroke="#ff5c8a" stroke-width="5"/><circle cx="46" cy="50" r="9" fill="none" stroke="#ff5c8a" stroke-width="5"/><circle cx="32" cy="23" r="3" fill="#7a5cf0"/>`,
  curler: `<rect x="27" y="34" width="10" height="26" rx="5" fill="#7a5cf0"/><rect x="25" y="4" width="14" height="34" rx="7" fill="#ffc94d"/><path d="M25 12h14M25 20h14M25 28h14" stroke="#f5a623" stroke-width="2"/>`,
  flat: `<rect x="18" y="4" width="11" height="52" rx="5" fill="#ff8fc0"/><rect x="35" y="4" width="11" height="52" rx="5" fill="#ff5c8a"/><rect x="20" y="8" width="7" height="24" rx="2" fill="#e9eefc"/><rect x="37" y="8" width="7" height="24" rx="2" fill="#e9eefc"/><rect x="16" y="50" width="32" height="10" rx="5" fill="#7a5cf0"/>`,
  roller: `<rect x="8" y="16" width="48" height="32" rx="16" fill="#ff9ecb"/><ellipse cx="14" cy="32" rx="6" ry="16" fill="#ff6fa8"/><path d="M26 18v28M36 18v28M46 20v24" stroke="#fff" stroke-width="3" opacity=".7"/>`,
  cleanser: `<rect x="24" y="4" width="16" height="9" rx="3" fill="#6fd0ff"/><path d="M18 14h28l-4 46H22z" fill="#bfe9ff"/><circle cx="32" cy="36" r="8" fill="#fff"/><circle cx="29" cy="33" r="2.5" fill="#bfe9ff"/>`,
  facebrush: `<rect x="28" y="30" width="8" height="30" rx="4" fill="#ff8fc0"/><circle cx="32" cy="20" r="16" fill="#ffd1e6"/><circle cx="32" cy="20" r="10" fill="#fff"/>`,
  mask: c => `<path d="M6 30h52a26 24 0 0 1-52 0z" fill="#fff" stroke="#dcc8ff" stroke-width="2"/><ellipse cx="32" cy="30" rx="26" ry="8" fill="${c}"/><rect x="40" y="2" width="6" height="30" rx="3" transform="rotate(24 43 17)" fill="#c58b52"/>`,
  cream: `<rect x="12" y="26" width="40" height="32" rx="10" fill="#fff" stroke="#ffd1e6" stroke-width="2"/><rect x="10" y="14" width="44" height="14" rx="6" fill="#ff8fc0"/>` + flower(32, 43, 8, '#ffb3d1'),
  polish: c => `<rect x="26" y="2" width="12" height="26" rx="4" fill="#4b2a6b"/><rect x="14" y="26" width="36" height="34" rx="10" fill="${c}"/><rect x="20" y="32" width="8" height="18" rx="4" fill="#fff" opacity=".5"/>`,
  glitter: star(20, 22, 13, '#ffe27a') + star(44, 18, 8, '#fff', 'stroke="#ffd36e" stroke-width="1.5"') + star(40, 44, 12, '#ff9ecb') + star(18, 48, 6, '#bfe6ff'),
  remover: `<rect x="14" y="14" width="36" height="40" rx="12" fill="#fff" stroke="#dcc8ff" stroke-width="2"/><path d="M22 26c6 8 14 8 20 0M22 38c6 8 14 8 20 0" stroke="#cdb9ee" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  lipstick: `<rect x="20" y="34" width="24" height="26" rx="5" fill="#7a5cf0"/><rect x="23" y="24" width="18" height="12" fill="#ffc94d"/><path d="M25 24V10l14-6v20z" fill="#ff4f8b"/>`,
  dress: `<path d="M24 6l8 8 8-8 3 16-5 8 16 30H10l16-30-5-8z" fill="#ff8fc0"/>` + bow(32, 30, 8, '#fff') + star(50, 14, 7, '#ffe27a'),
  hanger: `<path d="M32 16a5 5 0 1 1 5-5" fill="none" stroke="#9aa5d6" stroke-width="3" stroke-linecap="round"/><path d="M32 16L8 32h48z" fill="none" stroke="#9aa5d6" stroke-width="4" stroke-linejoin="round"/><path d="M18 32h28l10 28H8z" fill="#b79bff"/>`,
  wand: `<path d="M10 56L40 22" stroke="#7a5cf0" stroke-width="6" stroke-linecap="round"/>` + star(44, 18, 15, '#ffe27a', 'stroke="#f5a623" stroke-width="2"'),
  stage: `<path d="M2 50h60v10H2z" fill="#ff8fc0"/><path d="M2 4h60v8q-10 10-14 0-8 10-16 0-8 10-16 0-4 10-14 0z" fill="#b79bff"/>` + star(32, 34, 15, '#ffe27a', 'stroke="#f5a623" stroke-width="2"'),
};
const toolSvg = art => `<svg viewBox="0 0 64 64" aria-hidden="true">${typeof art === 'function' ? art() : art}</svg>`;

/* ---------- 2. drag-tool engine + particles ---------- */
/* A tab with `tools` turns the stage into a play surface: pick a tool (or drag it straight out of the
   tray) and rub it on the princess. Works the same for mouse and touch through pointer events. */
const drag = { on: false, started: false, last: null }, nailDrag = { on: false, first: true, last: -1 };
const parts = []; let paintDue = false;
const dollBox = () => { const el = document.querySelector('#doll svg'); return el ? el.getBoundingClientRect() : null; };
const toSvg = (cx, cy) => { const r = dollBox(); return r ? [(cx - r.left) / r.width * 400, (cy - r.top) / r.height * 700] : [0, 0]; };
const toClient = (x, y) => { const r = dollBox(); return r ? [r.left + x / 400 * r.width, r.top + y / 700 * r.height] : [0, 0]; };
const curTools = () => { if (!STUDIOS[save.stage] || !document.getElementById('opts')) return null; const tab = curTab(); return tab && tab.tools ? tab : null; };
const inStage = e => { const st = document.getElementById('stage'); if (!st) return false; const r = st.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };

function fxSpawn(kind, x, y, o = {}) { parts.push({ kind, x, y, vx: o.vx || 0, vy: o.vy || 0, life: o.life || 1, age: 0, c: o.c || '#fff', r: o.r || 5, rot: rnd(0, 6), vr: rnd(-.2, .2) }); if (parts.length > 240) parts.shift(); }
function fxLoop() {
  if (paintDue) { paintDue = false; if (save.stage === 'nails') paintNails(); else paintDoll(); }
  const cv = document.getElementById('fxc');
  if (cv) {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, r.width, r.height);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.age += 1 / 60; if (p.age >= p.life) { parts.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      const a = 1 - p.age / p.life, x = p.x - r.left, y = p.y - r.top; g.globalAlpha = Math.min(1, a * 1.6); g.fillStyle = p.c;
      if (p.kind === 'drop') { p.vy += .25; g.beginPath(); g.ellipse(x, y, p.r * .7, p.r * 1.5, 0, 0, 7); g.fill(); }
      else if (p.kind === 'clip') { p.vy += .18; g.save(); g.translate(x, y); g.rotate(p.rot); g.fillRect(-3, -p.r / 2, 6, p.r); g.restore(); }
      else if (p.kind === 'puff') { g.globalAlpha = a * .5; g.beginPath(); g.arc(x, y, p.r * (1.7 - a), 0, 7); g.fill(); }
      else if (p.kind === 'bub') { p.vy -= .012; g.strokeStyle = '#fff'; g.lineWidth = 2; g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(x, y, p.r, 0, 7); g.fill(); g.stroke(); }
      else { g.save(); g.translate(x, y); g.rotate(p.rot); g.beginPath(); for (let q = 0; q < 10; q++) { const an = Math.PI * q / 5, rr = (q % 2 ? p.r * .45 : p.r) * (.4 + a * .6); g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.restore(); }
    }
    g.globalAlpha = 1;
  } else parts.length = 0;
  requestAnimationFrame(fxLoop);
}
const sparkleAt = (cx, cy, n = 2, c) => { for (let i = 0; i < n; i++) fxSpawn('star', cx + rnd(-16, 16), cy + rnd(-16, 16), { c: c || pick(['#fff', '#ffe27a', '#ff9ecb']), r: rnd(6, 11), vy: -.6, vx: rnd(-.6, .6), life: .7 }); };

function selectTool(id) {
  ui.tool = id; document.querySelectorAll('.tool[data-tool]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === id));
  const tab = curTools(), t = tab && tab.tools.find(q => q.id === id), sp = document.getElementById('toolSprite');
  if (t) { sp.innerHTML = toolSvg(t.art); sp.className = (t.flip ? 'flip ' : '') + (tab.place ? 'place' : ''); }
}
function moveSprite(e, show) { const sp = document.getElementById('toolSprite'); sp.hidden = !show; if (show) { if (!sp.firstChild) selectTool(ui.tool); sp.style.left = e.clientX + 'px'; sp.style.top = e.clientY + 'px'; sp.classList.toggle('busy', drag.on); } }
function stroke(e, tab) {
  const [x, y] = toSvg(e.clientX, e.clientY);
  if (!drag.started) { drag.started = true; drag.last = [x, y]; if (tab.onStart) tab.onStart(ui.tool); }
  const [lx, ly] = drag.last, n = Math.max(1, Math.min(12, Math.ceil(Math.hypot(x - lx, y - ly) / 10)));
  for (let i = 1; i <= n; i++) tab.onDrag(ui.tool, lx + (x - lx) * i / n, ly + (y - ly) * i / n, e.clientX, e.clientY);
  drag.last = [x, y]; paintDue = true;
}
window.addEventListener('pointerdown', e => {
  if (save.stage === 'nails' && e.target.closest('#hands')) { nailDrag.on = true; nailDrag.first = true; nailDrag.last = -1; return nailTouch(e); }
  const tab = curTools(); if (!tab) return;
  const tb = e.target.closest('.tool[data-tool]'), onStage = e.target.closest('#stage') && !e.target.closest('button');
  if (tb) { selectTool(tb.dataset.tool); sfx.tap(); } else if (!onStage) return;
  drag.on = true; drag.started = false; moveSprite(e, true);
  if (onStage && !tab.place) stroke(e, tab);
});
window.addEventListener('pointermove', e => {
  if (nailDrag.on) return nailTouch(e);
  const tab = curTools(); if (!tab) { const sp = document.getElementById('toolSprite'); if (sp && !sp.hidden) sp.hidden = true; return; }
  const inside = inStage(e);
  moveSprite(e, drag.on || (e.pointerType === 'mouse' && inside && !e.target.closest('button')));
  if (drag.on && inside && !tab.place) stroke(e, tab);
});
const endDrag = e => {
  if (nailDrag.on) { nailDrag.on = false; persist(); }
  if (!drag.on) return; drag.on = false;
  const tab = curTools();
  if (tab) {
    if (tab.place && e.type === 'pointerup' && inStage(e) && !e.target.closest('button')) { const [x, y] = toSvg(e.clientX, e.clientY); tab.onDrop(ui.tool, x, y, e.clientX, e.clientY); }
    else if (drag.started && tab.onEnd) tab.onEnd(ui.tool);
    if (drag.started) persist();
  }
  drag.started = false; moveSprite(e, e.pointerType === 'mouse' && inStage(e));
};
window.addEventListener('pointerup', endDrag); window.addEventListener('pointercancel', endDrag);

function setHint(text, step, total, tool) {
  const h = document.getElementById('hint'); if (!h) return;
  let dots = ''; if (total) for (let i = 0; i < total; i++) dots += `<i class="${i < step ? 'done' : i === step ? 'now' : ''}"></i>`;
  h.innerHTML = (dots ? `<span class="dots">${dots}</span>` : '') + `<b>${text}</b>`;
  document.querySelectorAll('.tool[data-tool]').forEach(b => b.classList.toggle('pulse', !!tool && b.dataset.tool === tool));
}
const yay = msg => { sfx.fanfare(); burstAtDoll([200, 150]); burstAtDoll([200, 260]); toast(msg); };
const SALON_LOOK = { dress: 'smock', cape: 'none', wings: 'none', wand: 'none', bag: 'none', hairDo: 'loose' };
DMAP.smock = { id: 'smock', name: 'Salon cape', k: 'short', sl: 'tee', c: ['#e2d4ff', '#ffffff'], deco: 'none' };

/* ---------- 3. hair spa ---------- */
let spa = null;
const SPA_STEPS = [['wet', 'Wet her hair with the shower', 'shower'], ['shampoo', 'Squeeze shampoo onto her hair', 'shampoo'], ['scrub', 'Rub and rub to make bubbles', 'sponge'], ['rinse', 'Rinse all the bubbles away', 'shower'], ['dry', 'Dry her hair with the dryer', 'dryer'], ['brush', 'Brush out every tangle', 'brush']];
function spaInit() {
  const mx = Math.max(...hairModel(S).len), tg = [[150, 96], [200, 84], [250, 98]];
  for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1; tg.push([200 + side * rnd(100, 112), rnd(196, Math.max(214, mx - 30))]); }
  spa = { wet: 0, dollops: [], bubbles: [], tangles: tg, done: {}, t: 0 };
}
function spaHint() { const i = SPA_STEPS.findIndex(s => !spa.done[s[0]]); if (i < 0) setHint('All clean, soft and shiny!', 6, 6); else setHint(SPA_STEPS[i][1], i, 6, SPA_STEPS[i][2]); }
function spaDrag(tool, x, y, cx, cy) {
  const near = onHair(S, x, y), d = spa.done, was = JSON.stringify(d);
  if (tool === 'shower') {
    for (let i = 0; i < 2; i++) fxSpawn('drop', cx + rnd(-24, 24), cy + rnd(0, 10), { vy: rnd(3, 6), c: '#7fc8ff', r: 3, life: .7 });
    if (every('water', 90)) sfx.water();
    if (near) {
      spa.wet = Math.min(1, spa.wet + .035); if (spa.wet >= 1) d.wet = true;
      const far = b => Math.hypot(b[0] - x, b[1] - y) > 48; spa.bubbles = spa.bubbles.filter(far); spa.dollops = spa.dollops.filter(far);
      if (d.scrub && !spa.bubbles.length && !spa.dollops.length) d.rinse = true;
    }
  } else if (tool === 'shampoo') {
    if (spa.wet < .6) nudge('Her hair is still dry. Use the shower first.');
    else if (near && spa.dollops.length < 6 && every('dollop', 260)) { spa.dollops.push([x, y]); spa.n = (spa.n || 0) + 1; sfx.pour(); if (spa.n >= 3) d.shampoo = true; }
  } else if (tool === 'sponge') {
    if (!spa.dollops.length && !spa.bubbles.length && !d.shampoo) nudge('Add some shampoo first.');
    else if (near) {
      const bx = x + rnd(-20, 20), by = y + rnd(-20, 20);   // foam stays on her hair, not over her eyes
      if (spa.bubbles.length < 70 && !(inFace(bx, by) && by > 140)) spa.bubbles.push([bx, by, rnd(7, 17)]);
      spa.dollops = spa.dollops.filter(b => Math.hypot(b[0] - x, b[1] - y) > 30);
      if (every('bub', 120)) { fxSpawn('bub', cx + rnd(-20, 20), cy, { vy: -1.2, vx: rnd(-.5, .5), r: rnd(5, 10), life: 1.2 }); sfx.pop(); }
      if (spa.bubbles.length >= 40) d.scrub = true;
    }
  } else if (tool === 'dryer') {
    fxSpawn('puff', cx + rnd(-10, 10), cy + rnd(-6, 6), { vx: rnd(-1.5, 1.5), vy: rnd(1, 3), r: rnd(8, 14), life: .5 });
    if (every('air', 130)) sfx.air();
    if (spa.bubbles.length) nudge('Rinse the bubbles away first.');
    else if (near && spa.wet > 0) { spa.wet = Math.max(0, spa.wet - .03); if (spa.wet === 0 && d.rinse) d.dry = true; }
  } else if (tool === 'brush') {
    const n = spa.tangles.length; spa.tangles = spa.tangles.filter(b => Math.hypot(b[0] - x, b[1] - y) > 44);
    if (spa.tangles.length < n) { sparkleAt(cx, cy, 3); sfx.brush(); } else if (near && every('br', 140)) sfx.brush();
    if (!spa.tangles.length && !d.brush) { if (spa.wet > 0 || !d.rinse) nudge('Wash and dry her hair to make it shine.'); else { d.brush = true; S.hairShine = true; persist(); yay('Her hair is clean and shiny!'); } }
  }
  if (JSON.stringify(d) !== was) { sfx.pick(); spaHint(); }
}

/* ---------- 4. hair cutting ---------- */
function cutDrag(tool, x, y) {
  const ch = cutAt(S, x, y);
  if (!ch.length) return;
  if (every('snip', 90)) sfx.snip();
  ch.forEach(c => { const [px, py] = toClient(c.x, c.y); fxSpawn('clip', px, py, { c: S.hairColor, vx: rnd(-1.2, 1.2), vy: rnd(0, 1.5), r: Math.max(8, Math.min(26, c.h * .5)), life: 1.2 }); });
}
function animateHair(toLen, toBang, cutting) {
  // clock-driven, so it always lands exactly on the target; a newer animation or an undo cancels it
  const fromL = S.hairLen.slice(), fromB = S.bangLen.slice(), who = S, id = ++hairAnim, t0 = performance.now(), D = 480;
  (function step() {
    if (id !== hairAnim || S !== who) return;
    const t = Math.min(1, (performance.now() - t0) / D), e = t * t * (3 - 2 * t);
    S.hairLen = fromL.map((v, i) => Math.round(v + (toLen[i] - v) * e)); S.bangLen = fromB.map((v, i) => Math.round(v + (toBang[i] - v) * e)); paintDoll();
    if (cutting && t < 1) { const i = Math.floor(rnd(0, HN)); if (fromL[i] - toLen[i] > 4) { const [cx, cy] = toClient(colX(i), S.hairLen[i]); fxSpawn('clip', cx, cy, { c: S.hairColor, vx: rnd(-1, 1), vy: 1, r: rnd(10, 22), life: 1.1 }); } if (every('snip', 110)) sfx.snip(); }
    if (t < 1) setTimeout(step, 16); else persist();
  })();
}
let hairAnim = 0;
function cutStyle(id) {
  ensureHair(S);
  const target = cutProfile(id), next = S.hairLen.map((l, i) => Math.min(l, target[i]));
  if (next.every((l, i) => l === S.hairLen[i])) return toast('Her hair is already shorter than that. Tap Grow back first.');
  pushHist(); animateHair(next, S.bangLen, true);
}
function growBack() {
  const d = HAIRDEF[S.hair] || HAIRDEF.long; ensureHair(S); pushHist();
  animateHair(fillN(HN, d.len), BANGP[d.bang], false); sfx.magic(); burstAtDoll([200, 200]);
}

/* ---------- 5. hair styling tools ---------- */
function styleDrag(tool, x, y, cx, cy) {
  if (!onHair(S, x, y)) return;
  const m = hairModel(S);
  if (m.do !== 'loose') { S.hairDo = 'loose'; nudge('Hair let down, ready for styling.'); }
  if (tool === 'dryer') { S.hairVol = Math.min(2, (+S.hairVol || 0) + .05); fxSpawn('puff', cx, cy, { vx: rnd(-1.5, 1.5), vy: rnd(1, 3), r: rnd(8, 14), life: .5 }); if (every('air', 130)) sfx.air(); return; }
  if (tool === 'brush') { S.hairVol = Math.max(0, (+S.hairVol || 0) - .06); S.hairShine = true; if (every('br', 110)) { sparkleAt(cx, cy, 2); sfx.brush(); } return; }
  const v = { curler: 2, roller: 1, flat: 0 }[tool]; if (v === undefined) return;
  if (!Array.isArray(S.hairTex)) S.hairTex = m.tex.slice();
  const left = x < 200; let changed = false;
  for (let i = left ? 0 : HN / 2; i < (left ? HN / 2 : HN); i++) if (S.hairTex[i] !== v) { S.hairTex[i] = v; changed = true; }
  if (changed) { sfx.pick(); sparkleAt(cx, cy, 5); } else if (every('steam', 100)) fxSpawn('puff', cx, cy, { vy: -1.2, vx: rnd(-.5, .5), r: 8, life: .6 });
}

/* ---------- 6. facial spa ---------- */
let fc = null;
const HEAD_D = 'M112,152 C112,88 288,88 288,152 C288,218 246,264 200,264 C154,264 112,218 112,152Z';
const MASKS = { mask1: '#b8e6a0', mask2: '#ffb3c9', mask3: '#ffe08a' };
const FACE_STEPS = [['clean', 'Rub foamy cleanser all over her face', 'cleanser'], ['scrub', 'Scrub the smudges away with the brush', 'facebrush'], ['rinse', 'Rinse the foam off with water', 'water'], ['mask', 'Paint a face mask on her skin', 'mask1'], ['rinse2', 'Rinse the mask away', 'water'], ['cream', 'Dab on some face cream', 'cream']];
const inFace = (x, y) => ((x - 200) / 86) ** 2 + ((y - 180) / 82) ** 2 < 1;
const CREAM_MS = 1400;   // a dab of cream soaks in over this long
function facialInit() { fc = { foam: [], dirt: [[150, 150], [246, 160], [170, 238], [238, 228], [200, 128]], mask: [], cells: {}, cream: [], creamN: 0, done: {}, green: false }; }
setInterval(() => {
  if (save.stage !== 'facial' || !fc || !fc.cream.length) return;
  const now = performance.now(); fc.cream = fc.cream.filter(c => now - c[2] < CREAM_MS); paintDoll(); if (!fc.cream.length) faceCheck();
}, 80);
function faceHint() { const i = FACE_STEPS.findIndex(s => !fc.done[s[0]]); if (i < 0) setHint('Her skin is glowing!', 6, 6); else setHint(FACE_STEPS[i][1], i, 6, FACE_STEPS[i][2]); }
function faceCheck() { if (fc.creamN >= 8 && !fc.cream.length && !fc.done.cream) { fc.done.cream = true; S.glow = true; persist(); faceHint(); yay('Her skin is soft and glowing!'); } }
function faceDrag(tool, x, y, cx, cy) {
  const d = fc.done, was = JSON.stringify(d), on = inFace(x, y);
  if (tool === 'cleanser') { if (on) { if (fc.foam.length < 60) fc.foam.push([x + rnd(-10, 10), y + rnd(-10, 10), rnd(8, 15)]); if (every('pop', 130)) sfx.pop(); if (fc.foam.length >= 22) d.clean = true; } }
  else if (tool === 'facebrush') {
    if (!fc.foam.length && fc.dirt.length) nudge('Add foamy cleanser first.');
    else if (on) { const n = fc.dirt.length; fc.dirt = fc.dirt.filter(b => Math.hypot(b[0] - x, b[1] - y) > 34); if (fc.dirt.length < n) sparkleAt(cx, cy, 3); if (every('br', 120)) sfx.brush(); if (!fc.dirt.length && d.clean) d.scrub = true; }
  } else if (tool === 'water') {
    for (let i = 0; i < 2; i++) fxSpawn('drop', cx + rnd(-24, 24), cy + rnd(0, 10), { vy: rnd(3, 6), c: '#7fc8ff', r: 3, life: .6 });
    if (every('water', 90)) sfx.water();
    const far = b => Math.hypot(b[0] - x, b[1] - y) > 46; fc.foam = fc.foam.filter(far); fc.mask = fc.mask.filter(far);
    if (d.clean && !fc.foam.length) d.rinse = true;
    if (!fc.mask.length) { fc.cells = {}; fc.green = false; if (d.mask) d.rinse2 = true; }
  } else if (MASKS[tool]) {
    if (on) { if (fc.mask.length > 120) fc.mask.shift(); fc.mask.push([x, y, MASKS[tool]]); fc.cells[Math.round(x / 18) + '_' + Math.round(y / 18)] = 1; if (every('pop', 160)) sfx.pour(); if (Object.keys(fc.cells).length >= 26) { d.mask = true; fc.green = tool === 'mask1'; } }
  } else if (tool === 'cream') {
    if (on && every('cream', 140)) { fc.cream.push([x, y, performance.now()]); fc.creamN++; sfx.pop(); sparkleAt(cx, cy, 1, '#fff'); }
  }
  if (JSON.stringify(d) !== was) { sfx.pick(); faceHint(); }
}
/* drawn inside the face layer: phase 0 sits under eyes and lips, phase 1 on top of them */
function faceFx(s, phase) {
  const f = s._face; let o = '';
  if (phase === 0) {
    if (s.glow) o += `<ellipse cx="200" cy="130" rx="42" ry="13" fill="#fff" opacity=".2"/>` + mirror(`<ellipse cx="150" cy="203" rx="9" ry="4.500" fill="#fff" opacity=".55"/>`) + `<circle cx="200" cy="201" r="3" fill="#fff" opacity=".6"/>`;
    if (f && (f.dirt.length || f.mask.length)) { const id = uid(); o += `<clipPath id="${id}"><path d="${HEAD_D}"/></clipPath><g clip-path="url(#${id})">` + f.dirt.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="10" fill="#8a6a4a" opacity=".4"/><circle cx="${x + 9}" cy="${y - 6}" r="5" fill="#8a6a4a" opacity=".3"/>`).join('') + f.mask.map(([x, y, c]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="21" fill="${c}"/>`).join('') + `</g>`; }
    return o;
  }
  if (!f) return '';
  if (f.green && f.mask.length) o += [164, 236].map(x => `<circle cx="${x}" cy="181" r="23" fill="#9bd97c" stroke="#6fbf58" stroke-width="3"/><circle cx="${x}" cy="181" r="13" fill="#d6f5c2"/>` + [0, 1, 2, 3, 4, 5].map(q => `<circle cx="${f1(x + Math.cos(q) * 8)}" cy="${f1(181 + Math.sin(q) * 8)}" r="1.6" fill="#8fcf74"/>`).join('')).join('');
  o += f.foam.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" opacity=".94" stroke="#cfeaff" stroke-width="1.5"/><circle cx="${f1(x - r * .3)}" cy="${f1(y - r * .3)}" r="${f1(r * .25)}" fill="#dff3ff"/>`).join('');
  const now = performance.now();
  o += f.cream.map(([x, y, t0]) => [x, y, Math.max(0, 1 - (now - t0) / CREAM_MS)]).map(([x, y, a]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(4 + a * 7)}" fill="#fff" opacity="${f1(.35 + a * .6)}"/>`).join('');
  return o;
}

/* ---------- 7. nail salon ---------- */
const NAILPAL = ['#ff5c8a', '#e8375f', '#ff9ecb', '#ffb07a', '#ffd36e', '#a8e26b', '#5fd3c8', '#7fd4ff', '#8f8bff', '#c9a2ff', '#ffffff', '#4b3a8f'];
const NAILSTK = [['heart', 'Heart'], ['star', 'Star'], ['diamond', 'Diamond'], ['flower', 'Flower'], ['bow', 'Bow'], ['moon', 'Moon']];
const nailGet = (s, i) => { const [c, g, st] = String((Array.isArray(s.nails) && s.nails[i]) || 'x_0_x').split('_'); return { c: /^[0-9a-f]{6}$/i.test(c) ? '#' + c : null, g: g === '1', st: st && st !== 'x' ? st : null }; };
const nailSet = (i, n) => { if (!Array.isArray(S.nails) || S.nails.length !== 10) S.nails = fillN(10, 'x_0_x'); S.nails[i] = `${n.c ? n.c.slice(1) : 'x'}_${n.g ? 1 : 0}_${n.st || 'x'}`; };
const nailSticker = (st, x, y, r) => ({ heart: () => heart(x, y, r * 1.2, '#ff4f8b', 'stroke="#fff" stroke-width="1"'), star: () => star(x, y, r, '#ffe27a', 'stroke="#f5a623" stroke-width="1"'), diamond: () => diamond(x, y, r, '#9fe8ff'), flower: () => flower(x, y, r, '#fff', '#ff8fc0'), bow: () => bow(x, y, r * .9, '#ff6fa8'), moon: () => `<path d="M${x + r * .3},${y - r} A${r},${r} 0 1 0 ${x + r * .3},${y + r} A${r * .8},${r * .8} 0 1 1 ${x + r * .3},${y - r}Z" fill="#fff6c9" stroke="#f5c84b" stroke-width="1"/>` }[st] || (() => ''))();
const FINGERS = [[150, 318, 92, 30, -15], [186, 308, 122, 33, -6], [223, 304, 136, 35, 0], [260, 310, 120, 34, 7], [296, 404, 100, 38, 50]];
function handSvg(s, off) {
  const sk = PMAP[s.princess].skin, dk = shade(sk, -.16), cuff = s.dress === 'custom' ? (s.dColor || '#ff8fc0') : (s.dressColor || (DMAP[s.dress] || DRESSES[0]).c[0]);
  const finger = ([x, y, len, w, rot], k) => {
    const n = nailGet(s, off + k), nw = w * .74, nh = w * .98, ny = -len + w * .26, cy = ny + nh / 2;
    let nail = `<rect x="${f1(-nw / 2)}" y="${f1(ny)}" width="${f1(nw)}" height="${f1(nh)}" rx="${f1(nw * .42)}" fill="${n.c || shade(sk, .5)}" stroke="${n.c ? shade(n.c, -.22) : dk}" stroke-width="1.6"/><rect x="${f1(-nw * .3)}" y="${f1(ny + 4)}" width="${f1(nw * .2)}" height="${f1(nh * .5)}" rx="2" fill="#fff" opacity=".5"/>`;
    if (n.g) nail += [[-.2, .25], [.22, .45], [-.1, .7], [.18, .82], [0, .5]].map(([a, b], q) => star(f1(a * nw), f1(ny + b * nh), q % 2 ? 2.6 : 3.6, q % 2 ? '#fff' : '#ffe27a')).join('');
    if (n.st) nail += nailSticker(n.st, 0, +f1(cy), w * .24);
    return `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-len}" width="${w}" height="${len + 26}" rx="${w / 2}" fill="${sk}"/><path d="M${f1(-w * .28)},${f1(-len * .46)} h${f1(w * .56)}" stroke="${dk}" stroke-width="2" opacity=".45" stroke-linecap="round"/><g class="nail" data-nail="${off + k}">${nail}<rect x="${-w / 2}" y="${-len - 6}" width="${w}" height="${f1(nh + w * .5)}" fill="transparent"/></g></g>`;
  };
  return finger(FINGERS[4], 4) + `<rect x="160" y="440" width="96" height="130" fill="${sk}"/><rect x="128" y="292" width="158" height="190" rx="52" fill="${sk}"/>` + FINGERS.slice(0, 4).map(finger).join('') + `<rect x="138" y="508" width="140" height="70" rx="22" fill="${cuff}"/><rect x="138" y="508" width="140" height="16" rx="8" fill="#fff" opacity=".6"/>`;
}
const handsSvg = s => `<svg viewBox="110 150 580 430" xmlns="http://www.w3.org/2000/svg">${handSvg(s, 0)}<g transform="translate(800,0) scale(-1,1)">${handSvg(s, 5)}</g></svg>`;
/* painted nails also show as tiny dots on the doll's hands, so the runway keeps the manicure */
function nailDots(s, arms) {
  if (!Array.isArray(s.nails)) return '';
  return arms.map((A, k) => [[-5, 6], [0, 8.5], [5, 6]].map(([dx, dy], j) => { const n = nailGet(s, k * 5 + j + 1); return n.c ? `<ellipse cx="${A[2][0] + dx}" cy="${A[2][1] + dy}" rx="2.200" ry="2.800" fill="${n.c}"/>` : ''; }).join('')).join('');
}
SCENES.table = () => { const [d, f] = vgrad(['#fff0f8', '#ffd6ea']); return d + `<rect width="800" height="700" fill="${f}"/>` + [[80, 80], [700, 120], [620, 40], [150, 180], [730, 300], [60, 320]].map(([x, y], i) => star(x, y, i % 2 ? 7 : 10, '#fff', 'opacity=".8"')).join('') + `<rect y="330" width="800" height="370" fill="#f3d9ff"/><rect y="330" width="800" height="18" fill="#fff" opacity=".6"/><rect x="110" y="380" width="580" height="330" rx="46" fill="#fff" opacity=".7"/>` + [[60, 300, '#ff5c8a'], [120, 312, '#8f8bff'], [700, 300, '#5fd3c8'], [748, 314, '#ffd36e']].map(([x, y, c]) => `<g transform="translate(${x - 26},${y - 50}) scale(.85)">${ART.polish(c)}</g>`).join(''); };
function paintNails() { const el = document.getElementById('hands'); if (el) el.innerHTML = handsSvg(S); }
function renderNailOpts() {
  const n = ui.nail, box = document.getElementById('nopts'); if (!box) return;
  const tool = (attr, on, art, name) => `<button class="tool" ${attr} aria-pressed="${on}">${toolSvg(art)}<span>${name}</span></button>`;
  box.innerHTML = `<div class="nrow sws">${NAILPAL.map(c => `<button class="sw" data-nc="${c}" aria-pressed="${n.mode === 'polish' && n.color === c}" style="--c:${c}" aria-label="Polish ${c}"></button>`).join('')}</div>
    <label class="hue"><span>Colour slider</span><input type="range" min="0" max="359" value="330" data-hue aria-label="Polish colour slider"></label>
    <div class="nrow tools">${tool('data-nm="glitter"', n.mode === 'glitter', ART.glitter, 'Glitter')}${NAILSTK.map(([id, name]) => tool(`data-ns="${id}"`, n.mode === 'sticker' && n.st === id, `<g transform="translate(32,32)">${nailSticker(id, 0, 0, 20)}</g>`, name)).join('')}${tool('data-nm="clean"', n.mode === 'clean', ART.remover, 'Remover')}</div>
    <button class="btn magic wide" data-nall>${n.mode === 'clean' ? 'Clean all nails' : 'Do all ten nails'}</button>`;
  const h = { polish: 'Tap a nail, or drag across her nails to paint them.', glitter: 'Tap nails to add sparkly glitter.', sticker: 'Tap a nail to stick it on.', clean: 'Tap a nail to wipe it clean.' }[n.mode];
  setHint(h);
}
function nailApply(i) {
  const m = ui.nail, n = nailGet(S, i);
  if (m.mode === 'polish') n.c = m.color; else if (m.mode === 'glitter') n.g = true; else if (m.mode === 'sticker') n.st = m.st; else { n.c = null; n.g = false; n.st = null; }
  nailSet(i, n);
}
function nailTouch(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY), nail = el && el.closest('[data-nail]'); if (!nail) return;
  const i = +nail.dataset.nail; if (i === nailDrag.last) return; nailDrag.last = i;
  if (nailDrag.first) { pushHist(); nailDrag.first = false; }
  nailApply(i); paintDue = true; sparkleAt(e.clientX, e.clientY, 4); sfx.pick();
}
function renderNails() {
  const p = PMAP[S.princess];
  view.innerHTML = `<section class="studio">
    <div class="stage tooling" id="stage"><div class="scene">${sceneSvg('table')}</div><div class="hands" id="hands"></div><canvas class="fxc" id="fxc"></canvas>
      <div class="plate"><b>${p.name}</b> · Nail salon</div>${histButtons()}</div>
    <div class="panel"><div class="hint" id="hint"></div><div class="opts nailopts" id="nopts"></div></div>
    ${navHtml()}</section>`;
  paintNails(); renderNailOpts(); syncHist();
}

/* ---------- 8. fashion designer ---------- */
const KINDS = [{ id: 'ball', name: 'Ball gown' }, { id: 'aline', name: 'A-line' }, { id: 'mermaid', name: 'Mermaid' }, { id: 'tier', name: 'Ruffles' }, { id: 'short', name: 'Party' }, { id: 'tutu', name: 'Tutu' }, { id: 'casual', name: 'Skirt & top' }, { id: 'pants', name: 'Trousers' }];
const SLEEVES = [{ id: 'puff', name: 'Puff' }, { id: 'strap', name: 'Straps' }, { id: 'off', name: 'Off-shoulder' }, { id: 'long', name: 'Long' }, { id: 'tee', name: 'Short' }];
const PATTERNS = [none, { id: 'dots', name: 'Dots' }, { id: 'stripes', name: 'Stripes' }, { id: 'checks', name: 'Checks' }, { id: 'hearts', name: 'Hearts' }, { id: 'stars', name: 'Stars' }, { id: 'flowers', name: 'Flowers' }, { id: 'zigzag', name: 'Zigzag' }];
const TRIMS = [none, { id: 'bow', name: 'Bow sash' }, { id: 'stars', name: 'Stars' }, { id: 'hearts', name: 'Hearts' }, { id: 'flowers', name: 'Flowers' }, { id: 'pearls', name: 'Pearls' }];
const STICKERS = [['bow', 'Ribbon'], ['flower', 'Flower'], ['diamond', 'Diamond'], ['heart', 'Heart'], ['star', 'Star'], ['glitter', 'Glitter'], ['pearl', 'Pearl'], ['butterfly', 'Butterfly']];
const stickerDraw = (t, x, y) => ({
  bow: () => bow(x, y, 14, '#ff6fa8'), flower: () => flower(x, y, 12, '#fff', '#ffc94d'), diamond: () => diamond(x, y, 11, '#9fe8ff'), heart: () => heart(x, y, 14, '#ff4f8b', 'stroke="#fff" stroke-width="1"'),
  star: () => star(x, y, 11, '#ffe27a', 'stroke="#f5a623" stroke-width="1"'), glitter: () => star(x - 6, y - 4, 6, '#fff') + star(x + 7, y + 2, 4.5, '#ffe27a') + star(x - 1, y + 8, 3.5, '#fff') + star(x + 4, y - 9, 3, '#ffe27a'),
  pearl: () => gem(x, y, 6, '#fff'), butterfly: () => `<g transform="translate(${x},${y})"><ellipse cx="-7" cy="-3" rx="8" ry="6" fill="#9d7bff"/><ellipse cx="7" cy="-3" rx="8" ry="6" fill="#9d7bff"/><ellipse cx="-5" cy="5" rx="5" ry="4.500" fill="#7fd4ff"/><ellipse cx="5" cy="5" rx="5" ry="4.500" fill="#7fd4ff"/><rect x="-1.5" y="-7" width="3" height="15" rx="1.5" fill="#4b3a8f"/></g>`,
}[t] || (() => ''))();
function stickersSvg(s) {
  if (s.dress !== 'custom' || !Array.isArray(s.dStick)) return '';
  return s.dStick.map(v => { const [t, x, y] = String(v).split('_'); return stickerDraw(t, +x || 0, +y || 0); }).join('');
}
function dressPattern(p, base) {
  const id = uid(), c = lum(base) > 225 ? '#c9a2ff' : '#ffffff', w = `fill="${c}" opacity=".6"`;
  const cell = {
    dots: [24, `<circle cx="6" cy="6" r="3.500" ${w}/><circle cx="18" cy="18" r="3.500" ${w}/>`], stripes: [20, `<rect width="9" height="20" ${w}/>`], checks: [28, `<rect width="14" height="14" ${w}/><rect x="14" y="14" width="14" height="14" ${w}/>`],
    hearts: [36, heart(10, 10, 9, c, 'opacity=".7"') + heart(28, 28, 9, c, 'opacity=".7"')], stars: [36, star(10, 10, 7, c, 'opacity=".75"') + star(28, 28, 7, c, 'opacity=".75"')],
    flowers: [44, `<g opacity=".8">${flower(12, 12, 8, c, '#ffd95a')}${flower(34, 34, 8, c, '#ffd95a')}</g>`], zigzag: [24, `<path d="M0,10 L6,3 L12,10 L18,3 L24,10" stroke="${c}" stroke-width="3" fill="none" opacity=".7"/>`, 16],
  }[p];
  return cell ? [`<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="${cell[0]}" height="${cell[2] || cell[0]}">${cell[1]}</pattern></defs>`, `url(#${id})`] : null;
}
function designerEnter() {
  if (S.dress !== 'custom') { // start from the dress she is wearing, so nothing jumps
    const D = DMAP[S.dress] || DRESSES[0]; let [a, b] = D.c; if (S.dressColor) { a = S.dressColor; b = mix(a, '#ffffff', .6); }
    Object.assign(S, { dKind: D.k, dSleeve: D.sl, dColor: a, dColor2: b, dTrim: D.deco || 'none', dPattern: 'none', dStick: [], dress: 'custom', dressColor: null });
  }
  if (!Array.isArray(S.dStick)) S.dStick = [];
}
function stickerDrop(tool, x, y, cx, cy) {
  if (x < 30 || x > 370 || y < 250 || y > 670) return nudge('Drop it on her dress.');
  pushHist(); S.dStick.push(`${tool}_${Math.round(x)}_${Math.round(y)}`); if (S.dStick.length > 40) S.dStick.shift();
  persist(); paintDoll(true); sfx.pick(); burst(cx, cy, 6);
}

/* ---------- studio definitions for the new activities ---------- */
const hairTip = () => setHint(curTab().tools ? 'Pick a tool and rub it on her hair. Left and right sides style on their own.' : 'Tap anything to try it on.');
STUDIOS.spa = { title: 'Hair spa', zoom: 'hair', tint: '#cfeeff', noSurprise: true, enter: spaInit, hint: spaHint, over: () => ({ ...SALON_LOOK, crown: 'none', hairAcc: 'none', hairShine: !!spa.done.brush, _spa: spa }), tabs: [
  { label: 'Spa tools', tools: [{ id: 'shower', name: 'Shower', art: ART.shower }, { id: 'shampoo', name: 'Shampoo', art: ART.shampoo }, { id: 'sponge', name: 'Scrub', art: ART.sponge }, { id: 'dryer', name: 'Dryer', art: ART.dryer }, { id: 'brush', name: 'Brush', art: ART.brush, flip: true }], onDrag: spaDrag }] };
STUDIOS.cut = { title: 'Hair cutting', zoom: 'hair', tint: '#ffe0ef', noSurprise: true, hint: () => setHint('Drag the scissors across her hair to snip it. You can trim her fringe too.'), over: () => SALON_LOOK, tabs: [
  { label: 'Scissors', tools: [{ id: 'scissors', name: 'Scissors', art: ART.scissors, flip: true }], onStart: () => { pushHist(); ensureHair(S); }, onDrag: cutDrag,
    extra: () => `<div class="chips"><h3>Quick cuts</h3>${[['long', 'Long trim'], ['medium', 'Medium'], ['layered', 'Layered'], ['bob', 'Bob'], ['short', 'Short']].map(([id, n]) => `<button class="chip" data-cut="${id}">${n}</button>`).join('')}<button class="chip grow" data-grow>Grow back</button></div>` }] };
STUDIOS.hair.hint = hairTip;
STUDIOS.hair.title = 'Hair styling';
STUDIOS.hair.tabs = [
  { label: 'Styling tools', tools: [{ id: 'curler', name: 'Curling iron', art: ART.curler, flip: true }, { id: 'roller', name: 'Rollers', art: ART.roller }, { id: 'flat', name: 'Straightener', art: ART.flat, flip: true }, { id: 'dryer', name: 'Volume dryer', art: ART.dryer }, { id: 'brush', name: 'Shine brush', art: ART.brush, flip: true }], onStart: () => pushHist(), onDrag: styleDrag },
  { key: 'hairDo', label: 'Ponytails & braids', items: DOS, vb: '30 0 340 480', fx: [200, 110], get: () => hairModel(S).do },
  { key: 'hairColor', label: 'Colour', colors: PAL.hairColor, fx: [200, 100] },
  { key: 'hairFx', label: 'Rainbow & ombre', items: HAIRFX, vb: '30 0 340 480', fx: [200, 110] },
  { key: 'hairColor2', label: 'Tip colour', colors: PAL.hairColor, fx: [200, 300], onPick: () => { if ((S.hairFx || 'solid') !== 'ombre') S.hairFx = 'ombre'; } },
  { key: 'hair', label: 'Magic styles', items: HAIRS, vb: '30 0 340 480', fx: [200, 110], noSurprise: true, pv: id => ({ hair: id, hairLen: null, bangLen: null, hairTex: null, hairDo: null, hairVol: 0 }), onPick: () => { S.hairLen = S.bangLen = S.hairTex = S.hairDo = null; S.hairVol = 0; } },
  ...STUDIOS.hair.tabs.filter(t => t.key === 'hairAcc' || t.key === 'crown'),
];
STUDIOS.facial = { title: 'Facial spa', zoom: 'face', tint: '#d9f5ee', noSurprise: true, enter: facialInit, hint: faceHint, over: () => ({ _face: fc }), tabs: [
  { label: 'Spa tools', tools: [{ id: 'cleanser', name: 'Cleanser', art: ART.cleanser }, { id: 'facebrush', name: 'Face brush', art: ART.facebrush, flip: true }, { id: 'water', name: 'Rinse', art: ART.shower }, { id: 'mask1', name: 'Cucumber mask', art: () => ART.mask(MASKS.mask1) }, { id: 'mask2', name: 'Berry mask', art: () => ART.mask(MASKS.mask2) }, { id: 'mask3', name: 'Gold mask', art: () => ART.mask(MASKS.mask3) }, { id: 'cream', name: 'Face cream', art: ART.cream }], onDrag: faceDrag },
  ...STUDIOS.makeup.tabs.filter(t => ['blush', 'lips', 'shadow'].includes(t.key))] };
STUDIOS.designer = { title: 'Fashion designer', zoom: 'full', tint: '#fff1b8', enter: designerEnter, tabs: [
  { key: 'dKind', label: 'Skirt', items: KINDS, vb: '40 262 320 400', fx: [200, 480] },
  { key: 'dSleeve', label: 'Sleeves', items: SLEEVES, vb: '100 250 200 200', fx: [200, 310] },
  { key: 'dColor', label: 'Colour', colors: PAL.dressColor.filter(Boolean), fx: [200, 420] },
  { key: 'dColor2', label: 'Second colour', colors: PAL.dressColor.filter(Boolean), fx: [200, 560] },
  { key: 'dPattern', label: 'Pattern', items: PATTERNS, vb: '110 290 180 220', fx: [200, 460] },
  { key: 'dTrim', label: 'Trim', items: TRIMS, vb: '40 262 320 400', fx: [200, 420] },
  { label: 'Stickers', place: true, tools: STICKERS.map(([id, name]) => ({ id, name, art: `<g transform="translate(32,32) scale(2)">${stickerDraw(id, 0, 0)}</g>` })), onDrop: stickerDrop, extra: () => `<div class="chips"><h3>Drag a sticker onto her dress</h3><button class="chip" data-unstick>Take stickers off</button></div>` },
  STUDIOS.dress.tabs.find(t => t.key === 'shoes'), STUDIOS.extras.tabs.find(t => t.key === 'jewel'), STUDIOS.dress.tabs.find(t => t.key === 'necklace')] };
STUDIOS.dress.title = 'Wardrobe';
/* the wardrobe colour tab also recolours a dress she designed herself */
Object.assign(STUDIOS.dress.tabs.find(t => t.key === 'dressColor'), { get: () => S.dress === 'custom' ? S.dColor : S.dressColor, onPick: v => { if (S.dress === 'custom') { if (v) { S.dColor = v; S.dColor2 = mix(v, '#ffffff', .6); } S.dressColor = null; } } });
Object.defineProperty(STUDIOS.dress.tabs.find(t => t.key === 'dress'), 'items', { get: () => S && S.dKind ? [...DRESSES, { id: 'custom', name: 'My design' }] : DRESSES });

/* ---------- salon hub ---------- */
const ACTS = [
  { id: 'spa', name: 'Hair Spa', art: ART.shower, c: '#cfeeff' }, { id: 'cut', name: 'Hair Cutting', art: ART.scissors, c: '#ffe0ef' }, { id: 'hair', name: 'Hair Styling', art: ART.curler, c: '#e9dcff' },
  { id: 'makeup', name: 'Makeup Studio', art: ART.lipstick, c: '#ffd9ea' }, { id: 'facial', name: 'Facial Spa', art: ART.cream, c: '#d9f5ee' }, { id: 'nails', name: 'Nail Salon', art: () => ART.polish('#ff5c8a'), c: '#ffe6cf' },
  { id: 'designer', name: 'Fashion Designer', art: ART.dress, c: '#fff3bf' }, { id: 'dress', name: 'Wardrobe', art: ART.hanger, c: '#d6e9ff' }, { id: 'extras', name: 'Accessories', art: ART.wand, c: '#e9dcff' }, { id: 'runway', name: 'Princess Runway', art: ART.stage, c: '#ffd9ea' },
];
function renderSalon() {
  const p = PMAP[S.princess];
  view.innerHTML = `<section class="studio hub">
    <div class="stage" data-zoom="full"><div class="scene">${sceneSvg('studio', '#ffd9ea')}</div><div class="doll" id="doll"></div><div class="plate"><b>${p.name}</b> · Salon day</div></div>
    <div class="panel"><h2 class="hubtitle">What shall we do today?</h2><div class="acts">${ACTS.map(a => `<button class="act" data-go="${a.id}" style="--c:${a.c}">${toolSvg(a.art)}<strong>${a.name}</strong></button>`).join('')}</div></div></section>`;
  paintDoll();
}

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.cut) return cutStyle(t.dataset.cut);
  if ('grow' in t.dataset) return growBack();
  if ('unstick' in t.dataset) { if (S.dStick && S.dStick.length) { pushHist(); S.dStick = []; persist(); paintDoll(true); sfx.tap(); } return; }
  const n = ui.nail;
  if (t.dataset.nc) { n.mode = 'polish'; n.color = t.dataset.nc; sfx.tap(); return renderNailOpts(); }
  if (t.dataset.nm) { n.mode = t.dataset.nm; sfx.tap(); return renderNailOpts(); }
  if (t.dataset.ns) { n.mode = 'sticker'; n.st = t.dataset.ns; sfx.tap(); return renderNailOpts(); }
  if ('nall' in t.dataset) { pushHist(); for (let i = 0; i < 10; i++) nailApply(i); persist(); paintNails(); sfx.magic(); const r = document.getElementById('hands').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 14); }
});
requestAnimationFrame(fxLoop);
