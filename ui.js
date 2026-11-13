'use strict';
/* =====================================================================
   Screens, navigation, undo/redo, events and boot.
   Every screen draws the same look object S, so a change made in one
   activity is what every other activity (and the runway) shows.
   ===================================================================== */
const app = $('#app'), view = $('#view'), fx = $('#fx');
const NOICON = `<svg class="noicon" viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="4"/><path d="M12 36L36 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;
const ico = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const IC = {
  crown: 'M3 18h18l1.5-10-5.5 4L12 5 7 12 1.5 8z', salon: 'M4 3h16v4H4zM6 9h12l-1 12H7zM10 12v6M14 12v6', star: 'M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z',
  magic: 'M3 21l11-11 1.5 1.5L4.5 22.5zM17 2l1.2 3.3 3.3 1.2-3.3 1.2L17 11l-1.2-3.3-3.3-1.2 3.3-1.2z',
  undo: 'M9 5L3 11l6 6v-4h5a4 4 0 0 1 0 8h-3v2h3a6 6 0 0 0 0-12H9z', redo: 'M15 5l6 6-6 6v-4h-5a4 4 0 0 0 0 8h3v2h-3a6 6 0 0 1 0-12h5z', reset: 'M12 5V1L6.5 6 12 11V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z',
  heart: 'M12 21C5 15 2 12 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3 7-10 13z', cam: 'M9 4L7.500 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.500L15 4zM12 9a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
};
const NAV = [['choose', 'Princess', IC.crown], ['salon', 'Salon', IC.salon], ['runway', 'Show', IC.star]];
const VIEWS = { choose: renderChoose, salon: renderSalon, nails: renderNails, runway: renderRunway };

/* ---------- navigation ---------- */
function go(stage) {
  if (!ORDER.includes(stage) || (stage !== 'choose' && !S)) stage = 'choose';
  save.stage = stage; hist.undo = []; hist.redo = []; ui.tool = null;
  ui.entry = S ? JSON.stringify(S) : null;                // what "reset this activity" goes back to
  const st = STUDIOS[stage]; if (st && st.enter) st.enter();
  persist(); render();
}
function render() {
  app.dataset.stage = save.stage;
  const here = NAV.some(n => n[0] === save.stage) ? save.stage : 'salon';
  $('#steps').innerHTML = NAV.map(([id, label, d]) => `<button class="step" data-go="${id}" ${id === here ? 'aria-current="step"' : ''} ${id !== 'choose' && !S ? 'disabled' : ''}>${ico(d)}<span>${label}</span></button>`).join('');
  $('#btnReset').hidden = $('#btnSave').hidden = !S || save.stage === 'choose';
  $('#toolSprite').hidden = true; $('#toolSprite').innerHTML = '';
  (VIEWS[save.stage] || renderStudio)();
  view.scrollTop = 0;
}
function navHtml() {
  const i = ACTS.findIndex(a => a.id === save.stage), next = ACTS[i + 1];
  return `<div class="nav"><button class="btn ghost" data-go="salon">${ico(IC.salon)}Salon</button>${next ? `<button class="btn" data-go="${next.id}">Next: ${next.name}</button>` : ''}</div>`;
}

/* ---------- undo / redo / reset (snapshots of the whole look) ---------- */
const hist = { undo: [], redo: [] };
const histButtons = () => `<div class="hist"><button class="round" id="undo" aria-label="Undo">${ico(IC.undo)}</button><button class="round" id="redo" aria-label="Redo">${ico(IC.redo)}</button><button class="round" id="resetAct" aria-label="Reset this activity">${ico(IC.reset)}</button></div>`;
function pushHist() { hist.undo.push(JSON.stringify(S)); if (hist.undo.length > 40) hist.undo.shift(); hist.redo = []; syncHist(); }
function syncHist() { const u = $('#undo'), r = $('#redo'); if (u) u.disabled = !hist.undo.length; if (r) r.disabled = !hist.redo.length; }
function timeTravel(from, to) { if (!from.length) return; to.push(JSON.stringify(S)); S = JSON.parse(from.pop()); persist(); refresh(); sfx.tap(); }
function refresh() { syncHist(); if (save.stage === 'nails') paintNails(); else { paintDoll(true); if ($('#opts')) renderOpts(); } }
function resetActivity() {
  if (!ui.entry) return;
  const keep = JSON.stringify(S); S = JSON.parse(ui.entry);
  const st = STUDIOS[save.stage]; if (st && st.enter) st.enter();
  persist(); render(); hist.undo.push(keep); syncHist(); sfx.magic();
}

/* ---------- princess selection ---------- */
function renderChoose() {
  view.innerHTML = `<section class="choose"><h2>Who is getting ready for the royal ball?</h2><p class="sub">Pick a princess. You can style every one of them.</p><div class="cards">${PRINCESSES.map(p => `
    <button class="card" data-princess="${p.id}" style="--accent:${p.accent}">
      <span class="portrait">${dollSvg(lookOf(p.id), '50 10 300 330', 0)}</span>
      <strong>${p.name}</strong><em>${p.title}</em><small>${p.line}</small>
      <span class="btn small">${save.looks[p.id] ? 'Keep styling' : 'Choose ' + p.name}</span>
    </button>`).join('')}</div></section>`;
}

/* ---------- studios (option tabs and tool tabs) ---------- */
const curTab = () => { const st = STUDIOS[save.stage]; return st.tabs[ui.tab[save.stage] || 0] || st.tabs[0]; };
/* an activity may dress her for the job (salon cape, wet hair, face mask) without touching the saved look */
const viewState = () => { const st = STUDIOS[save.stage], o = st && st.over ? st.over() : null; return o ? { ...S, ...o } : S; };
const tabValue = tab => tab.get ? tab.get() : S[tab.key];

function renderStudio() {
  const st = STUDIOS[save.stage], p = PMAP[S.princess];
  view.innerHTML = `<section class="studio">
    <div class="stage" id="stage" data-zoom="${st.zoom}">
      <div class="scene">${sceneSvg('studio', st.tint)}</div>
      <div class="doll" id="doll"></div><canvas class="fxc" id="fxc"></canvas>
      <div class="plate"><b>${p.name}</b> · ${st.title}</div>${histButtons()}
      ${st.noSurprise ? '' : `<button class="btn magic" id="surprise">${ico(IC.magic)}Surprise me</button>`}
    </div>
    <div class="panel">
      ${st.hint ? '<div class="hint" id="hint"></div>' : ''}
      <div class="tabs" role="tablist" ${st.tabs.length < 2 ? 'hidden' : ''}>${st.tabs.map((t, n) => `<button class="tab" role="tab" data-tab="${n}">${t.label}</button>`).join('')}</div>
      <div class="opts" id="opts"></div>
    </div>
    ${navHtml()}</section>`;
  paintDoll(); renderOpts(); syncHist();
}
function paintDoll(hop) {
  const el = $('#doll'); if (!el) return;
  el.innerHTML = dollSvg(viewState(), '0 0 400 700', save.stage === 'runway' ? S.pose : 0);
  if (hop) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }
}
const hueRow = `<label class="hue"><span>Colour slider</span><input type="range" min="0" max="359" value="300" data-hue aria-label="Colour slider"></label>`;
function renderOpts() {
  const st = STUDIOS[save.stage], tab = curTab(), box = $('#opts'), n = st.tabs.indexOf(tab);
  document.querySelectorAll('.tab').forEach((b, k) => b.setAttribute('aria-selected', k === n));
  $('#stage').classList.toggle('tooling', !!tab.tools);
  if (tab.tools) {
    if (!tab.tools.some(t => t.id === ui.tool)) ui.tool = tab.tools[0].id;
    box.className = 'opts tools';
    box.innerHTML = tab.tools.map(t => `<button class="tool" data-tool="${t.id}" aria-pressed="${ui.tool === t.id}">${toolSvg(t.art)}<span>${t.name}</span></button>`).join('') + (tab.extra ? tab.extra() : '');
    selectTool(ui.tool);
  } else if (tab.colors) {
    const list = [...tab.colors, ...(save.mixes[tab.key] || [])], cur = tabValue(tab);
    box.className = 'opts colors';
    box.innerHTML = list.map(c => `<button class="sw${c ? '' : ' none'}" data-v="${c || ''}" aria-pressed="${cur === c}" aria-label="${c ? 'Colour ' + c : (tab.noneLabel || 'No colour')}" style="--c:${c || '#fff'}">${c ? '' : NOICON}</button>`).join('') +
      `<button class="sw mixbtn" data-mix="1"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 6h10v3h-2v9l10 17a5 5 0 0 1-4 7H15a5 5 0 0 1-4-7l10-17V9h-2z" fill="#fff" stroke="#7a5cf0" stroke-width="2.5"/><path d="M16 30h16l5 8a2.4 2.4 0 0 1-2 3.5H13a2.4 2.4 0 0 1-2-3.5z" fill="#ff8fc0"/><circle cx="22" cy="34" r="2" fill="#fff"/><circle cx="28" cy="37" r="1.4" fill="#fff"/></svg><span>Mix</span></button>` + hueRow;
  } else {
    const base = viewState(), cur = tabValue(tab);
    box.className = 'opts';
    box.innerHTML = tab.items.map(it => `<button class="opt" data-v="${it.id}" aria-pressed="${cur === it.id}">${it.id === 'none' ? NOICON : dollSvg({ ...base, ...(tab.clean || {}), ...(tab.pv ? tab.pv(it.id) : { [tab.key]: it.id }) }, tab.vb, 0)}<span>${it.name}</span></button>`).join('');
  }
  box.scrollTop = 0;
  if (st.hint) st.hint();
}
function setChoice(tab, value) { S[tab.key] = value; if (tab.onPick) tab.onPick(value); }
function applyChoice(tab, value, quiet, noHist) {
  if (!noHist) pushHist();
  setChoice(tab, value); persist(); paintDoll(!noHist);
  document.querySelectorAll('#opts [data-v]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.v || null) === value));
  if (!quiet) { sfx.pick(); burstAtDoll(tab.fx); }
}

/* ---------- royal show ---------- */
let confettiTimer = null;
function renderRunway() {
  const p = PMAP[S.princess];
  view.innerHTML = `<section class="runway">
    <div class="stage show" id="stage">
      <div class="scene" id="showScene">${sceneSvg(S.scene)}</div>
      <div class="spot"></div>
      <div class="doll" id="doll"></div>
      <div class="flash" id="flash"></div>
      <div class="banner"><span>Princess ${p.name}</span> is ready for the ball!</div>
    </div>
    <div class="showbar">
      <div class="group"><h3>Where is the party?</h3><div class="row" id="scenePick">${SHOW_SCENES.map(sc => `<button class="scn" data-scene="${sc.id}" aria-pressed="${S.scene === sc.id}">${sceneSvg(sc.id)}<span>${sc.name}</span></button>`).join('')}</div></div>
      <div class="group"><h3>Strike a pose</h3><div class="row" id="posePick">${POSES.map((po, i) => `<button class="pose" data-pose="${i}" aria-pressed="${S.pose === i}">${dollSvg(S, '40 230 320 330', i)}<span>${po.name}</span></button>`).join('')}</div></div>
      <div class="group actions">
        <button class="btn magic" id="walk">${ico(IC.star)}Walk the runway</button>
        <button class="btn" id="photo">${ico(IC.cam)}Save a photo</button>
        <button class="btn ghost" data-go="salon">Back to the salon</button>
        <button class="btn ghost" data-go="choose">Choose another princess</button>
      </div>
    </div></section>`;
  paintDoll(); celebrate();
}
function celebrate() {
  sfx.fanfare();
  const d = $('#doll'); d.classList.add('twirl'); setTimeout(() => d.classList.remove('twirl'), 1300);
  clearInterval(confettiTimer); let n = 0;
  confettiTimer = setInterval(() => { if (save.stage !== 'runway' || ++n > 60) { clearInterval(confettiTimer); return; } dropConfetti(); if (n < 26) dropConfetti(); }, 130);
}
function walkRunway() {
  const d = $('#doll'), f = $('#flash'); if (!d || d.classList.contains('walk')) return;
  d.classList.remove('twirl'); d.classList.add('walk'); f.classList.add('go'); sfx.fanfare();
  let n = 0; const t = setInterval(() => { if (++n > 5 || !$('#flash')) return clearInterval(t); S.pose = n % POSES.length; paintDoll(); for (let i = 0; i < 4; i++) dropConfetti(); tone(1800, 0, .05, 'square', .03); }, 520);
  setTimeout(() => { d.classList.remove('walk'); f.classList.remove('go'); if (save.stage === 'runway') { persist(); document.querySelectorAll('.pose').forEach(b => b.setAttribute('aria-pressed', +b.dataset.pose === S.pose)); } }, 3300);
}
const PARTY = ['#ff5c8a', '#ffd36e', '#9d7bff', '#7fd4ff', '#ff9ecb', '#ffffff'];
function dropConfetti() {
  const stage = $('.stage.show'); if (!stage) return;
  const r = stage.getBoundingClientRect(), el = document.createElement('i'), c = pick(PARTY), size = 14 + Math.random() * 20;
  el.className = 'confetti'; el.innerHTML = `<svg viewBox="-12 -12 24 24">${Math.random() < .5 ? heart(0, 0, 12, c) : star(0, 0, 11, c)}</svg>`;
  el.style.cssText = `left:${r.left + Math.random() * r.width}px;top:${r.top - 20}px;width:${size}px;--fall:${r.height + 40}px;--sway:${(Math.random() - .5) * 160}px;--dur:${3 + Math.random() * 2.5}s`;
  fx.appendChild(el); el.addEventListener('animationend', () => el.remove());
}
function burstAtDoll(pt) {
  const svg = $('#doll svg'); if (!svg || !pt) return;
  const r = svg.getBoundingClientRect(), stage = svg.closest('.stage').getBoundingClientRect();
  const x = Math.max(stage.left + 20, Math.min(stage.right - 20, r.left + r.width * pt[0] / 400)), y = Math.max(stage.top + 20, Math.min(stage.bottom - 20, r.top + r.height * pt[1] / 700));
  burst(x, y, 10);
}
function burst(x, y, n = 8) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i'), a = Math.PI * 2 * i / n + Math.random() * .6, dist = 50 + Math.random() * 70, c = pick(PARTY);
    el.className = 'spark'; el.innerHTML = `<svg viewBox="-12 -12 24 24">${i % 3 ? star(0, 0, 11, c) : heart(0, 0, 12, c)}</svg>`;
    el.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * dist}px;--dy:${Math.sin(a) * dist}px;width:${12 + Math.random() * 14}px`;
    fx.appendChild(el); el.addEventListener('animationend', () => el.remove());
  }
}
function savePhoto() {
  const p = PMAP[S.princess];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1050" viewBox="0 0 800 700">${SCENES[S.scene]()}<g transform="translate(214,36) scale(.93)">${dollInner(S)}</g><rect x="210" y="14" width="380" height="50" rx="25" fill="#fff" opacity=".9"/><text x="400" y="48" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="bold" font-size="26" fill="#7a3fb0">Princess ${p.name}</text></svg>`;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 1050; c.getContext('2d').drawImage(img, 0, 0, 1200, 1050);
    c.toBlob(b => { if (!b) return toast('Could not make the photo in this browser.'); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `princess-${p.id}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast('Photo saved to your downloads'); sfx.magic(); }, 'image/png');
  };
  img.onerror = () => toast('Could not make the photo in this browser.');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function toast(msg) { document.querySelectorAll('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

/* ---------- potion mixer ---------- */
const POTIONS = ['#ff4d6d', '#ff9e3d', '#ffd93d', '#6bd968', '#3dc9c0', '#4d96ff', '#8f6bff', '#ff6bd6', '#ffffff', '#4a3555'];
function openMixer(tab) {
  ui.mixTab = tab; ui.mixPick = [];
  $('#potions').innerHTML = POTIONS.map(c => `<button class="potion" data-potion="${c}" style="--c:${c}" aria-label="Potion ${c}"><svg viewBox="0 0 48 60"><rect x="18" y="2" width="12" height="8" rx="3" fill="#c58b52"/><path d="M19 9h10v10l11 18a12 12 0 0 1-10 19H18A12 12 0 0 1 8 37l11-18z" fill="#fff" opacity=".85" stroke="#d9c9ff" stroke-width="2"/><path d="M13 34h22l4 7a9 9 0 0 1-8 12H17a9 9 0 0 1-8-12z" fill="var(--c)" stroke="#0001" stroke-width="1"/><circle cx="20" cy="42" r="2.5" fill="#fff" opacity=".8"/></svg></button>`).join('');
  drawMixer(); $('#mixer').showModal();
}
function drawMixer() {
  const [a, b] = ui.mixPick, m = a && b ? mix(a, b, .5) : null;
  $('#potA').style.background = a || ''; $('#potB').style.background = b || '';
  const pot = $('#potMix'); pot.style.background = m || ''; pot.classList.toggle('ready', !!m);
  $('#mixUse').disabled = !m; $('#mixUse').dataset.c = m || '';
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.go) { sfx.tap(); return go(t.dataset.go); }
  if (t.dataset.princess) { S = lookOf(t.dataset.princess); save.current = S.princess; sfx.magic(); const r = t.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 3, 14); return go('salon'); }
  if (t.dataset.tab) { ui.tab[save.stage] = +t.dataset.tab; sfx.tap(); return renderOpts(); }
  if (t.dataset.mix) { sfx.tap(); return openMixer(curTab()); }
  if (t.dataset.potion) { if (ui.mixPick.length >= 2) ui.mixPick = []; ui.mixPick.push(t.dataset.potion); sfx.pour(); return drawMixer(); }
  if (t.id === 'mixUse') { const c = t.dataset.c, k = ui.mixTab.key; save.mixes[k] = [c, ...(save.mixes[k] || []).filter(x => x !== c)].slice(0, 5); $('#mixer').close(); applyChoice(ui.mixTab, c, true); renderOpts(); sfx.magic(); return burstAtDoll(ui.mixTab.fx); }
  if (t.hasAttribute('data-close')) return t.closest('dialog').close();
  if (t.closest('#opts') && 'v' in t.dataset) return applyChoice(curTab(), t.dataset.v || null);
  if (t.id === 'surprise') { pushHist(); STUDIOS[save.stage].tabs.forEach(tab => { if (tab.tools || tab.noSurprise) return; setChoice(tab, tab.colors ? pick(tab.colors) : pick(tab.items).id); }); persist(); paintDoll(true); renderOpts(); sfx.magic(); return burstAtDoll([200, STUDIOS[save.stage].zoom === 'full' ? 380 : 180]); }
  if (t.dataset.scene) { S.scene = t.dataset.scene; persist(); $('#showScene').innerHTML = sceneSvg(S.scene); document.querySelectorAll('.scn').forEach(b => b.setAttribute('aria-pressed', b.dataset.scene === S.scene)); return sfx.pick(); }
  if (t.dataset.pose) { S.pose = +t.dataset.pose; persist(); paintDoll(true); document.querySelectorAll('.pose').forEach(b => b.setAttribute('aria-pressed', +b.dataset.pose === S.pose)); sfx.pick(); return burstAtDoll([200, 300]); }
  if (t.id === 'photo') return savePhoto();
  if (t.id === 'walk') return walkRunway();
  if (t.id === 'undo') return timeTravel(hist.undo, hist.redo);
  if (t.id === 'redo') return timeTravel(hist.redo, hist.undo);
  if (t.id === 'resetAct') return resetActivity();
  if (t.id === 'btnSave') { persist(); sfx.magic(); const r = t.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height, 10); return toast(`Saved! ${PMAP[S.princess].name} will look like this next time.`); }
  if (t.id === 'btnSound') { save.muted = !save.muted; persist(); drawSound(); return sfx.tap(); }
  if (t.id === 'btnReset') return $('#confirm').showModal();
  if (t.id === 'confirmYes') { $('#confirm').close(); S = freshLook(PMAP[S.princess]); sfx.magic(); return go(save.stage); }
});
/* colour slider: one undo step per drag, live preview while it moves */
let hueLive = false;
document.addEventListener('input', e => {
  if (!e.target.matches('[data-hue]')) return;
  const c = hsl2hex(+e.target.value);
  if (save.stage === 'nails') { ui.nail.mode = 'polish'; ui.nail.color = c; document.querySelectorAll('#nopts [aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false')); }
  else applyChoice(curTab(), c, true, hueLive);
  hueLive = true; e.target.style.setProperty('--thumb', c);
});
document.addEventListener('change', e => { if (e.target.matches('[data-hue]')) hueLive = false; });
function drawSound() { $('#btnSound').innerHTML = ico(save.muted ? 'M3 9v6h4l5 5V4L7 9zM15 9l6 6M21 9l-6 6' : 'M3 9v6h4l5 5V4L7 9zM15.500 8a5 5 0 0 1 0 8l-1.200-1.500a3 3 0 0 0 0-5zM18 5a9 9 0 0 1 0 14l-1.200-1.500a7 7 0 0 0 0-11z'); $('#btnSound').classList.toggle('off', save.muted); }

/* 2.5D parallax: the doll's layers follow the pointer, or sway gently when idle */
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let tx = 0, ty = 0, px = 0, py = 0, lastMove = 0;
window.addEventListener('pointermove', e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; lastMove = performance.now(); }, { passive: true });
function tick(now) {
  if (now - lastMove > 2500) { tx = Math.sin(now / 1900) * .55; ty = Math.sin(now / 2700) * .35; }
  px += (tx - px) * .08; py += (ty - py) * .08;
  const d = document.getElementById('doll');
  if (d) { d.style.setProperty('--px', px.toFixed(3)); d.style.setProperty('--py', py.toFixed(3)); }
  requestAnimationFrame(tick);
}

/* ---------- boot ---------- */
loadSave();
if (save.current) S = lookOf(save.current);
const want = location.hash.slice(1);
if (ORDER.includes(want)) { if (!S && want !== 'choose') { S = lookOf(PRINCESSES[0].id); save.current = S.princess; } save.stage = want; }
drawSound(); go(save.stage);
if (!still) requestAnimationFrame(tick);
