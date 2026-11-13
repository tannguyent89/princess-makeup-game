'use strict';
/* =====================================================================
   Screens, navigation, undo/redo, events and boot.
   Every screen draws the same look object S, so a change made in one
   activity is what every other activity (and the runway) shows.
   world.js · pets.js · castle.js · events.js · gallery.js add their own
   screens; this file routes between them.
   ===================================================================== */
const app = $('#app'), view = $('#view'), fx = $('#fx');
const NOICON = `<svg class="noicon" viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="4"/><path d="M12 36L36 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;
const ico = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const IC = {
  crown: 'M3 18h18l1.5-10-5.5 4L12 5 7 12 1.5 8z', salon: 'M4 3h16v4H4zM6 9h12l-1 12H7zM10 12v6M14 12v6', star: 'M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z',
  magic: 'M3 21l11-11 1.5 1.5L4.5 22.5zM17 2l1.2 3.3 3.3 1.2-3.3 1.2L17 11l-1.2-3.3-3.3-1.2 3.3-1.2z',
  undo: 'M9 5L3 11l6 6v-4h5a4 4 0 0 1 0 8h-3v2h3a6 6 0 0 0 0-12H9z', redo: 'M15 5l6 6-6 6v-4h-5a4 4 0 0 0 0 8h3v2h-3a6 6 0 0 1 0-12h5z', reset: 'M12 5V1L6.5 6 12 11V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z',
  heart: 'M12 21C5 15 2 12 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3 7-10 13z', cam: 'M9 4L7.500 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.500L15 4zM12 9a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14', paw: 'M12 13c3 0 6 2 6 5s-3 3-6 3-6 0-6-3 3-5 6-5zM5 9a2 2.500 0 1 1 0 .1zM9.500 5a2 2.500 0 1 1 0 .1zM14.500 5a2 2.500 0 1 1 0 .1zM19 9a2 2.500 0 1 1 0 .1z',
};
const VIEWS = { world: renderWorld, choose: renderChoose, kingdom: renderKingdom, salon: renderHub, fashion: renderHub, nails: renderNails, runway: renderRunway, pets: renderPets, castle: renderCastle, events: renderEvents, prep: renderPrep, party: renderParty, gallery: renderGallery, art: renderArt };
const LOOK_STAGES = ['salon', 'fashion', 'eventfit', ...ACTS.map(a => a.id)];   // screens where "start this princess over" makes sense

/* ---------- navigation ---------- */
function go(stage) {
  gestureReset(); G.view = { z: 1, x: 0, y: 0 };            // a new screen never inherits a half-finished drag or a zoom
  if (!ORDER.includes(stage)) stage = 'world';
  if (!S) stage = 'choose';
  else if (['prep', 'eventfit', 'party'].includes(stage) && !evNow()) stage = 'events';
  else if (stage === 'petcare' && !hasPet(ui.pet)) stage = 'pets';
  else if (stage === 'kingdom' && !kOpen(save.kingdom)) stage = 'world';
  save.stage = stage; hist.undo = []; hist.redo = []; ui.tool = null; ui.walked = false;
  ui.entry = S ? snap() : null;                           // what "reset this activity" goes back to
  const st = STUDIOS[stage]; if (st && st.enter) st.enter();
  persist(); render();
}
function render() {
  app.dataset.stage = save.stage;
  const cur = id => save.stage === id ? 'aria-current="page"' : '';
  $('#steps').innerHTML = `<button class="step" data-go="world" ${cur('world')} ${S ? '' : 'disabled'}>${ico(IC.map)}<span>World map</span></button><button class="step" data-go="choose" ${cur('choose')}>${ico(IC.crown)}<span>Princesses</span></button><button class="step stars" id="starChip" aria-label="Magical stars">${ico(IC.star)}<b>${save.stars}</b></button>`;
  $('#btnReset').hidden = !S || !LOOK_STAGES.includes(save.stage);
  $('#btnSave').hidden = !S || ['choose', 'gallery', 'art', 'pets', 'petcare', 'castle', 'events', 'prep'].includes(save.stage);
  $('#toolSprite').hidden = true; $('#toolSprite').innerHTML = '';
  (VIEWS[save.stage] || renderStudio)();
  view.scrollTop = 0;
}
function navHtml() {
  const st = STUDIOS[save.stage]; if (st && st.nav) return st.nav();
  const i = ACTS.findIndex(a => a.id === save.stage), hub = i >= 0 ? ACTS[i].g : 'salon', next = ACTS[i + 1];
  return `<div class="nav"><button class="btn ghost" data-go="${hub}">${ico(IC.salon)}${hub === 'salon' ? 'Salon' : 'Studio'}</button>${next ? `<button class="btn" data-go="${next.id}">Next: ${next.name}</button>` : ''}</div>`;
}

/* ---------- undo / redo / reset (snapshots of everything a screen can change) ---------- */
const hist = { undo: [], redo: [] };
const snap = () => JSON.stringify({ S, pets: save.pets, castle: save.castle });
function restore(j) { const o = JSON.parse(j); S = o.S; save.pets = o.pets; save.castle = o.castle; }
const histButtons = () => `<div class="hist"><button class="round" id="undo" aria-label="Undo">${ico(IC.undo)}</button><button class="round" id="redo" aria-label="Redo">${ico(IC.redo)}</button><button class="round" id="resetAct" aria-label="Reset this activity">${ico(IC.reset)}</button></div>`;
function pushHist() { hist.undo.push(snap()); if (hist.undo.length > 40) hist.undo.shift(); hist.redo = []; syncHist(); }
function syncHist() { const u = $('#undo'), r = $('#redo'); if (u) u.disabled = !hist.undo.length; if (r) r.disabled = !hist.redo.length; }
function timeTravel(from, to) { if (!from.length) return; hairAnim++; to.push(snap()); restore(from.pop()); persist(); refresh(); sfx.tap(); }
function refresh() {
  syncHist();
  if (save.stage === 'nails') paintNails();
  else if (save.stage === 'castle') { cz.sel = -1; paintRoom(); renderRoomOpts(); }
  else { paintDoll(true); if ($('#opts')) renderOpts(); }
}
function resetActivity() {
  if (!ui.entry) return;
  const keep = snap(); hairAnim++; restore(ui.entry);
  const st = STUDIOS[save.stage]; if (st && st.enter) st.enter();
  cz.sel = -1; persist(); render(); hist.undo.push(keep); syncHist(); sfx.magic();
}

/* ---------- princess collection ---------- */
function renderChoose() {
  view.innerHTML = `<section class="choose"><h2>${S ? 'Princess collection' : 'Pick your first princess'}</h2><p class="sub">Nine princesses from nine kingdoms. You can style every one of them.</p><div class="cards many">${PRINCESSES.map(p => `
    <button class="card" data-princess="${p.id}" style="--accent:${p.accent}">
      <span class="portrait">${dollSvg(lookOf(p.id), '50 10 300 330', 0)}<i class="badge"><svg viewBox="-18 -18 36 36">${EMB[p.k](0, 0, 11)}</svg></i></span>
      <strong>${p.name}</strong><em>${p.kind}</em><small>${p.line}</small>
      <span class="btn small">${S && S.princess === p.id ? 'Playing now' : save.looks[p.id] ? 'Keep styling' : 'Choose ' + p.name}</span>
    </button>`).join('')}</div></section>`;
}

/* ---------- the two hubs: Beauty Salon and Fashion Studio ---------- */
function renderHub() {
  const p = PMAP[S.princess], g = save.stage, fash = g === 'fashion';
  view.innerHTML = `<section class="studio hub">
    <div class="stage" id="stage" data-zoom="full"><div class="scene">${sceneSvg('studio', fash ? '#fff1b8' : '#ffd9ea')}</div>${auraHtml(p.k)}<div class="doll" id="doll"></div>${buddyHtml()}<div class="plate"><b>${p.name}</b> · ${fash ? 'Fashion studio' : 'Beauty salon'}</div></div>
    <div class="panel"><h2 class="hubtitle">${fash ? 'What shall she wear?' : 'What shall we do today?'}</h2><div class="acts">${ACTS.filter(a => a.g === g).map(a => `<button class="act" data-go="${a.id}" style="--c:${a.c}">${toolSvg(a.art)}<strong>${a.name}</strong></button>`).join('')}</div></div></section>`;
  paintDoll();
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
      <div class="scene">${st.scene ? st.scene() : sceneSvg('studio', st.tint)}</div>
      <div class="doll" id="doll"></div><canvas class="fxc" id="fxc"></canvas>
      <div class="plate">${st.plate ? st.plate() : `<b>${p.name}</b> · ${st.title}`}</div>${histButtons()}<button class="round unzoom" id="unzoom" aria-label="Zoom back out" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 0 1 5.600 11.200l5.100 5.100-1.400 1.400-5.100-5.100A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM7 9h6v2H7z"/></svg></button>
      ${st.noSurprise ? '' : `<button class="btn magic" id="surprise">${ico(IC.magic)}Surprise me</button>`}
    </div>
    <div class="panel">
      <div class="hint" id="hint"></div>
      <div class="tabs" role="tablist" ${st.tabs.length < 2 ? 'hidden' : ''}>${st.tabs.map((t, n) => `<button class="tab" role="tab" data-tab="${n}">${t.label}</button>`).join('')}</div>
      <div class="opts" id="opts"></div>
    </div>
    ${navHtml()}</section>`;
  paintDoll(); renderOpts(); syncHist();
}
function paintDoll(hop) {
  const el = $('#doll'); if (!el) return;
  const st = STUDIOS[save.stage];
  const html = st && st.draw ? st.draw() : dollSvg(viewState(), '0 0 400 700', save.stage === 'runway' || save.stage === 'party' ? S.pose : 0), key = html.replace(/u[0-9]+/g, 'u');
  if (el._key !== key) { el._key = key; el.innerHTML = html; }          // nothing changed: leave the picture alone
  if (hop) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }
}
const hueRow = `<label class="hue"><span>Colour slider</span><input type="range" min="0" max="359" value="300" data-hue aria-label="Colour slider"></label>`;
function renderOpts() {
  const st = STUDIOS[save.stage], tab = curTab(), box = $('#opts'), n = st.tabs.indexOf(tab);
  document.querySelectorAll('.tab[data-tab]').forEach((b, k) => b.setAttribute('aria-selected', k === n));
  $('#stage').classList.toggle('tooling', !!tab.tools);
  $('#stage').dataset.zoom = tab.zoom || st.zoom;          // a tab may move the camera (the tail studio zooms in for painting)
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
    box.innerHTML = itemsOf(tab).map(it => `<button class="opt" data-v="${it.id}" aria-pressed="${cur === it.id}">${it.id === 'none' ? NOICON : tab.thumb ? tab.thumb(it.id) : dollSvg({ ...base, ...(tab.clean || {}), ...(tab.pv ? tab.pv(it.id) : { [tab.key]: it.id }) }, tab.vb, 0)}<span>${it.name}</span></button>`).join('');
  }
  box.scrollTop = 0;
  if (st.hint) st.hint(); else setHint(tab.colors ? `Tap a colour, or drag the brush onto ${PMAP[S.princess].name}.` : `Tap one to try it on, or drag it onto ${PMAP[S.princess].name}.`);
}
function setChoice(tab, value) { if (tab.set) tab.set(value); else S[tab.key] = value; if (tab.onPick) tab.onPick(value); }
function applyChoice(tab, value, quiet, noHist) {
  if (!noHist) pushHist();
  setChoice(tab, value); persist(); paintDoll(!noHist);
  document.querySelectorAll('#opts [data-v]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.v || null) === value));
  if (!quiet) { sfx.pick(); burstAtDoll(tab.fx); }
}

/* ---------- princess runway ---------- */
let confettiTimer = null;
const showScenes = () => [...SHOW_SCENES, ...KINGDOMS.filter(k => kOpen(k.id)).map(k => ({ id: 'k_' + k.id, name: k.short }))];
function renderRunway() {
  const p = PMAP[S.princess];
  view.innerHTML = `<section class="runway">
    <div class="stage show" id="stage">
      <div class="scene" id="showScene">${sceneSvg(S.scene)}</div>${auraHtml(p.k)}
      <div class="spot"></div>
      <div class="doll" id="doll"></div>${buddyHtml()}
      <div class="flash" id="flash"></div>
      <div class="banner"><span>Princess ${p.name}</span> is ready for the ball!</div>
    </div>
    <div class="showbar">
      <div class="group"><h3>Where is the party?</h3><div class="row" id="scenePick">${showScenes().map(sc => `<button class="scn" data-scene="${sc.id}" aria-pressed="${S.scene === sc.id}">${sceneSvg(sc.id)}<span>${sc.name}</span></button>`).join('')}</div></div>
      <div class="group"><h3>Strike a pose</h3><div class="row" id="posePick">${POSES.map((po, i) => `<button class="pose" data-pose="${i}" aria-pressed="${S.pose === i}">${dollSvg(S, '40 230 320 330', i)}<span>${po.name}</span></button>`).join('')}</div></div>
      <div class="group actions">
        <button class="btn magic" id="walk">${ico(IC.star)}Walk the runway</button>
        <button class="btn" id="toGallery">${ico(IC.heart)}Save to my gallery</button>
        <button class="btn ghost" id="photo">${ico(IC.cam)}Save a photo</button>
        <button class="btn ghost" data-go="fashion">Back to the studio</button>
      </div>
    </div></section>`;
  paintDoll(); celebrate();
}
/* each princess has her own signature move */
function doMove(quiet) {
  const d = $('#doll'); if (!d || !S) return;
  const c = 'mv-' + (PMAP[S.princess].move || 'twirl');
  d.classList.remove(c); void d.offsetWidth; d.classList.add(c); setTimeout(() => d.classList.remove(c), 1600);
  if (!quiet) { sfx.magic(); burstAtDoll([200, 220]); }
}
function celebrate() {
  sfx.fanfare(); doMove(true);
  clearInterval(confettiTimer); let n = 0;
  confettiTimer = setInterval(() => { if (!$('.stage.show') || ++n > 60) { clearInterval(confettiTimer); return; } dropConfetti(); if (n < 26) dropConfetti(); }, 130);
}
function walkRunway() {
  const d = $('#doll'), f = $('#flash'); if (!d || d.classList.contains('walk')) return;
  d.classList.add('walk'); f.classList.add('go'); sfx.fanfare();
  let n = 0; const t = setInterval(() => { if (++n > 5 || !$('#flash')) return clearInterval(t); S.pose = n % POSES.length; paintDoll(); for (let i = 0; i < 4; i++) dropConfetti(); tone(1800, 0, .05, 'square', .03); }, 520);
  setTimeout(() => {
    d.classList.remove('walk'); f.classList.remove('go'); if (save.stage !== 'runway') return;
    persist(); document.querySelectorAll('.pose').forEach(b => b.setAttribute('aria-pressed', +b.dataset.pose === S.pose));
    if (!ui.walked) { ui.walked = true; muddy(); earn(1, 'What a show!'); }
  }, 3300);
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
const savePhoto = () => svgToPng(photoSvg(S, save.stage === 'party' && evNow() ? eventSceneInner(evNow()) : (SCENES[S.scene] || SCENES.ballroom)()), 1200, 1050, `princess-${S.princess}.png`);
function toast(msg) { document.querySelectorAll('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2800); }

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
  const t = e.target.closest('button');
  if (!t) { if (e.target.closest('#doll') && ['salon', 'fashion', 'kingdom', 'runway', 'party'].includes(save.stage)) doMove(); return; }
  if (t.dataset.go) { sfx.tap(); return go(t.dataset.go); }
  if (t.dataset.princess && PMAP[t.dataset.princess]) { S = lookOf(t.dataset.princess); save.current = S.princess; sfx.magic(); const r = t.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 3, 14); return go(save.stage === 'kingdom' ? 'kingdom' : 'world'); }
  if (t.dataset.tab) { ui.tab[save.stage] = +t.dataset.tab; sfx.tap(); return renderOpts(); }
  if (t.dataset.mix) { sfx.tap(); return openMixer(curTab()); }
  if (t.dataset.potion) { if (ui.mixPick.length >= 2) ui.mixPick = []; ui.mixPick.push(t.dataset.potion); sfx.pour(); return drawMixer(); }
  if (t.id === 'mixUse') { const c = t.dataset.c, k = ui.mixTab.key; save.mixes[k] = [c, ...(save.mixes[k] || []).filter(x => x !== c)].slice(0, 5); $('#mixer').close(); applyChoice(ui.mixTab, c, true); renderOpts(); sfx.magic(); return burstAtDoll(ui.mixTab.fx); }
  if (t.hasAttribute('data-close')) { const dlg = t.closest('dialog'); dlg.close(); if (dlg.id === 'unlock') setTimeout(showUnlock, 300); return; }
  if (t.closest('#opts') && 'v' in t.dataset) return applyChoice(curTab(), t.dataset.v || null);
  if (t.id === 'surprise') { pushHist(); STUDIOS[save.stage].tabs.forEach(tab => { if (tab.tools || tab.noSurprise) return; setChoice(tab, tab.colors ? pick(tab.colors) : pick(itemsOf(tab)).id); }); persist(); paintDoll(true); renderOpts(); sfx.magic(); return burstAtDoll([200, STUDIOS[save.stage].zoom === 'face' ? 180 : 380]); }
  if (t.dataset.scene) { S.scene = t.dataset.scene; persist(); $('#showScene').innerHTML = sceneSvg(S.scene); document.querySelectorAll('.scn').forEach(b => b.setAttribute('aria-pressed', b.dataset.scene === S.scene)); return sfx.pick(); }
  if (t.dataset.pose) { S.pose = +t.dataset.pose; persist(); paintDoll(true); document.querySelectorAll('.pose').forEach(b => b.setAttribute('aria-pressed', +b.dataset.pose === S.pose)); sfx.pick(); return burstAtDoll([200, 300]); }
  if (t.id === 'photo') return savePhoto();
  if (t.id === 'walk') return walkRunway();
  if (t.id === 'unzoom') { sfx.tap(); return resetView(); }
  if (t.id === 'undo') return timeTravel(hist.undo, hist.redo);
  if (t.id === 'redo') return timeTravel(hist.redo, hist.undo);
  if (t.id === 'resetAct') return resetActivity();
  if (t.id === 'btnSave') return addToGallery();
  if (t.id === 'btnSound') { save.muted = !save.muted; persist(); drawSound(); return sfx.tap(); }
  if (t.id === 'btnReset') return $('#confirm').showModal();
  if (t.id === 'confirmYes') { $('#confirm').close(); S = { ...freshLook(PMAP[S.princess]), pet: S.pet }; sfx.magic(); return go(save.stage); }
});
$('#unlock').addEventListener('close', () => setTimeout(showUnlock, 300));   // also covers closing with the Esc key
/* colour slider: one undo step per drag, live preview while it moves */
let hueLive = false;
document.addEventListener('input', e => {
  if (!e.target.matches('[data-hue]')) return;
  const c = hsl2hex(+e.target.value); e.target.style.setProperty('--thumb', c);
  if (save.stage === 'art') { art.color = c; if (art.mode === 'eraser' || art.mode === 'stamp') art.mode = 'brush'; document.querySelectorAll('#aopts .sw').forEach(b => b.setAttribute('aria-pressed', 'false')); return; }
  if (save.stage === 'tail' && curTab().tools) { ui.scaleC = c; ui.tool = 'paint'; selectTool('paint'); document.querySelectorAll('#opts .sw').forEach(b => b.setAttribute('aria-pressed', 'false')); return; }
  if (save.stage === 'nails') { ui.nail.mode = 'polish'; ui.nail.color = c; document.querySelectorAll('#nopts [aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false')); return; }
  applyChoice(curTab(), c, true, hueLive); hueLive = true;
});
document.addEventListener('change', e => { if (e.target.matches('[data-hue]')) hueLive = false; });
function drawSound() { $('#btnSound').innerHTML = ico(save.muted ? 'M3 9v6h4l5 5V4L7 9zM15 9l6 6M21 9l-6 6' : 'M3 9v6h4l5 5V4L7 9zM15.500 8a5 5 0 0 1 0 8l-1.200-1.500a3 3 0 0 0 0-5zM18 5a9 9 0 0 1 0 14l-1.200-1.500a7 7 0 0 0 0-11z'); $('#btnSound').classList.toggle('off', save.muted); }

/* 2.5D parallax: the doll's layers follow the pointer, or sway gently when idle */
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let tx = 0, ty = 0, px = 0, py = 0, lastMove = 0;
window.addEventListener('pointermove', e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; lastMove = performance.now(); }, { passive: true });
const LITE = window.matchMedia('(pointer: coarse)').matches; let tickN = 0, sentX = 9, sentY = 9;
function tick(now) {
  if (LITE && (tickN ^= 1)) return requestAnimationFrame(tick);      // tablets: every other frame is plenty for a gentle sway
  if (now - lastMove > 2500) { tx = Math.sin(now / 1900) * .55; ty = Math.sin(now / 2700) * .35; }
  px += (tx - px) * .08; py += (ty - py) * .08;
  const d = document.getElementById('doll');
  if (d && !G.pinch && (Math.abs(px - sentX) > .004 || Math.abs(py - sentY) > .004 || d !== tick.el)) { tick.el = d; sentX = px; sentY = py; d.style.setProperty('--px', px.toFixed(3)); d.style.setProperty('--py', py.toFixed(3)); }
  requestAnimationFrame(tick);
}

/* ---------- tablets and phones ---------- */
document.addEventListener('touchstart', () => { /* lets iOS show the pressed look of buttons */ }, { passive: true });
document.addEventListener('gesturestart', e => e.preventDefault());            // Safari: no page zoom in the middle of a game
if (LITE) document.addEventListener('contextmenu', e => e.preventDefault());   // long-press is "pick up", not a menu
let resizeDue = 0;
window.addEventListener('resize', () => {                                      // rotation, split view, keyboard
  clearTimeout(resizeDue); resizeDue = setTimeout(() => {
    gestureReset(); resetView();
    const w = $('#mapwrap'); if (w) w.scrollLeft = (w.scrollWidth - w.clientWidth) / 2;
  }, 150);
});

/* ---------- boot ---------- */
loadSave();
if (save.current) S = lookOf(save.current);
const want = location.hash.slice(1);
if (ORDER.includes(want)) { if (!S && want !== 'choose') { S = lookOf(PRINCESSES[0].id); save.current = S.princess; } save.stage = want; }
drawSound(); go(save.stage);
if (!still) requestAnimationFrame(tick);
/* when served from a website (not opened as a file), keep a copy for playing offline */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { /* offline copy is optional */ });
