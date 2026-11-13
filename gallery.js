'use strict';
/* =====================================================================
   My Gallery (saved princess designs, before & after, favourite outfits,
   paintings) and the Art Studio. Designs are stored as look data and
   redrawn on demand, so they stay tiny; paintings are stored as pictures.
   ===================================================================== */
const ART_KEY = KEY + '-art', ART_MAX = 8, GAL_MAX = 24;
const OUTFIT = ['dress', 'dressColor', 'shoes', 'gloves', 'necklace', 'earrings', 'bracelet', 'wings', 'cape', 'wand', 'bag', 'flower', 'jewel', 'crown', 'dKind', 'dSleeve', 'dColor', 'dColor2', 'dPattern', 'dTrim', 'dStick'];
let artStore = [];
try { const j = JSON.parse(localStorage.getItem(ART_KEY)); if (Array.isArray(j)) artStore = j.filter(a => a && typeof a.id === 'number' && typeof a.src === 'string' && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(a.src)).slice(-ART_MAX); } catch (e) { /* no saved paintings */ }
const newId = list => Math.max(Date.now(), ...list.map(x => x.id + 1));   // unique even for two saves in the same instant
const saveArt = () => { try { localStorage.setItem(ART_KEY, JSON.stringify(artStore)); return true; } catch (e) { return false; } };

/* ---------- pictures ---------- */
/* On iPad and iPhone the share sheet is the dependable way to put a picture into Photos (downloads are
   unreliable from a home-screen app), so touch devices get the share sheet and everything else a download. */
const COARSE = window.matchMedia('(pointer: coarse)').matches;
function saveBlob(b, name, done) {
  const finish = msg => { toast(msg); sfx.magic(); if (done) done(); };
  const viaLink = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); finish('Picture saved to your downloads'); };
  let file = null; try { file = new File([b], name, { type: b.type || 'image/png' }); } catch (e) { /* no File support */ }
  if (COARSE && file && navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file] }).then(() => finish('Picture saved'), err => { if (!err || err.name !== 'AbortError') viaLink(); });
  else viaLink();
}
function svgToPng(svg, w, h, name, done) {
  const img = new Image();
  img.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); c.toBlob(b => b ? saveBlob(b, name, done) : toast('Could not make the picture in this browser.'), 'image/png'); };
  img.onerror = () => toast('Could not make the picture in this browser.');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const nameTag = (x, text, w = 380) => `<rect x="${x - w / 2}" y="14" width="${w}" height="50" rx="25" fill="#fff" opacity=".92"/><text x="${x}" y="48" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="bold" font-size="26" fill="#7a3fb0">${text}</text>`;
function photoSvg(look, sceneInner) {
  const pet = hasPet(look.pet) ? `<g transform="translate(40,500) scale(.9)">${petInner(petOf(look.pet))}</g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1050" viewBox="0 0 800 700">${sceneInner}<g transform="translate(214,36) scale(.93)">${dollInner(look)}</g>${pet}${nameTag(400, 'Princess ' + PMAP[look.princess].name)}</svg>`;
}
function beforeAfterSvg(look) {
  const p = PMAP[look.princess], card = x => `<rect x="${x}" y="80" width="380" height="640" rx="40" fill="#fff" opacity=".75"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1350" height="1125" viewBox="0 0 900 750">${SCENES.studio(p.accent)}<rect width="900" height="750" fill="${p.accent}" opacity=".25"/>${card(40)}${card(480)}<g transform="translate(60,96) scale(.86)">${dollInner(freshLook(p), 0)}</g><g transform="translate(500,96) scale(.86)">${dollInner(look, 0)}</g>${heart(450, 400, 44, '#ff5c8a')}${nameTag(230, 'Before', 200)}${nameTag(670, 'After', 200)}</svg>`;
}
const sceneNow = () => save.stage === 'kingdom' ? 'k_' + save.kingdom : save.stage === 'party' && evNow() ? evNow().scene : S.scene;
const galLook = g => ({ ...freshLook(PMAP[g.p]), ...g.look, princess: g.p });
const galScene = g => (SCENES[g.scene] || SCENES.ballroom)();

function addToGallery() {
  const look = JSON.parse(JSON.stringify(S)), last = save.gallery[save.gallery.length - 1];
  if (last && JSON.stringify(galLook(last)) === JSON.stringify({ ...freshLook(PMAP[S.princess]), ...look })) return toast('This look is already in your gallery.');
  save.gallery.push({ id: newId(save.gallery), p: S.princess, scene: sceneNow(), look }); if (save.gallery.length > GAL_MAX) save.gallery.shift();
  persist(); const n = save.gallery.length;
  if (n <= 6 && !save.found['gal' + n]) { save.found['gal' + n] = 1; earn(1, 'Saved to My Gallery!'); } else { toast('Saved to My Gallery!'); sfx.magic(); }
}

/* ---------- gallery screen ---------- */
function renderGallery() {
  const looks = save.gallery.slice().reverse(), arts = artStore.slice().reverse();
  view.innerHTML = `<section class="choose"><h2>My gallery</h2><p class="sub">${looks.length || arts.length ? 'Tap a picture to see before and after, wear it again or download it.' : 'Nothing here yet. Tap the heart at the top of any screen to save your princess, or paint a picture in the Art Studio.'}</p>
    <div class="cards many">${looks.map(g => `<button class="card gcard" data-gal="${g.id}" style="--accent:${PMAP[g.p].accent}"><span class="portrait"><svg viewBox="150 0 500 550" preserveAspectRatio="xMidYMid slice">${galScene(g)}<g transform="translate(214,36) scale(.93)">${dollInner(galLook(g), 0)}</g></svg></span><strong>${PMAP[g.p].name}</strong></button>`).join('')}
    ${arts.map(a => `<button class="card gcard" data-artid="${a.id}" style="--accent:#7fd4ff"><span class="portrait pic"><img src="${a.src}" alt="My painting"></span><strong>My painting</strong></button>`).join('')}</div>
    ${looks.length || arts.length ? '' : `<p class="sub"><button class="btn" data-go="art">Open the Art Studio</button></p>`}</section>`;
}
function openGal(id) {
  const g = save.gallery.find(x => x.id === id); if (!g) return;
  const look = galLook(g), p = PMAP[g.p]; ui.gal = id;
  $('#galTitle').textContent = `Princess ${p.name}`;
  $('#galBody').innerHTML = `<div class="ba"><figure><div>${dollSvg(freshLook(p), '0 0 400 700', 0)}</div><figcaption>Before</figcaption></figure><figure><div>${dollSvg(look, '0 0 400 700', 0)}</div><figcaption>After</figcaption></figure></div>`;
  $('#galActs').innerHTML = `<button class="btn" data-galact="wear">Play with this look</button>${S.princess === g.p ? '' : `<button class="btn magic" data-galact="outfit">${PMAP[S.princess].name} wears this outfit</button>`}<button class="btn ghost" data-galact="photo">Download picture</button><button class="btn ghost" data-galact="ba">Download before and after</button><button class="btn ghost" data-galact="del">Delete</button><button class="btn ghost" data-close>Close</button>`;
  $('#galdlg').showModal();
}
function openArt(id) {
  const a = artStore.find(x => x.id === id); if (!a) return; ui.gal = id;
  $('#galTitle').textContent = 'My painting';
  $('#galBody').innerHTML = `<div class="ba one"><img src="${a.src}" alt="My painting"></div>`;
  $('#galActs').innerHTML = `<a class="btn" href="${a.src}" download="my-painting.jpg">Download picture</a><button class="btn ghost" data-galact="delart">Delete</button><button class="btn ghost" data-close>Close</button>`;
  $('#galdlg').showModal();
}

/* ---------- art studio ---------- */
const art = { color: '#ff5c8a', size: 14, mode: 'brush', stamp: null, img: null, undo: [], keep: null, tab: 0, hue: 0, down: false, last: null };
const ARTPAL = ['#ff5c8a', '#ff9e3d', '#ffd93d', '#6bd968', '#3dc9c0', '#4d96ff', '#8f6bff', '#ff9ecb', '#c58b52', '#ffffff', '#9aa0b8', '#3a2340'];
const STAMPS = () => [...KINGDOMS.map(k => [k.id, k.gift]), ['heart', 'Heart'], ['princess', PMAP[S.princess].name], ...(hasPet(S.pet) ? [['pet', PETMAP[S.pet].name]] : [])];
const stampSvg = id => id === 'princess' ? [`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="700" viewBox="0 0 400 700">${dollInner(S, 0)}</svg>`, 230, 402]
  : id === 'pet' ? [`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 200 200">${petInner(petOf(S.pet))}</svg>`, 150, 150]
    : [`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="-18 -18 36 36">${EMB[id](0, 0, 12)}</svg>`, 90, 90];
const paperCtx = () => { const c = $('#paper'); return c ? c.getContext('2d') : null; };
const copyCanvas = c => { const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; k.getContext('2d').drawImage(c, 0, 0); return k; };
function artPush() { const c = $('#paper'); art.undo.push(copyCanvas(c)); if (art.undo.length > 8) art.undo.shift(); $('#artUndo').disabled = false; }
function artKeep() { art.keep = copyCanvas($('#paper')); }
function renderArt() {
  view.innerHTML = `<section class="studio">
    <div class="stage artstage" id="stage"><canvas id="paper" width="960" height="720"></canvas><div class="plate"><b>Art studio</b></div>
      <div class="hist"><button class="round" id="artUndo" aria-label="Undo" ${art.undo.length ? '' : 'disabled'}>${ico(IC.undo)}</button><button class="round" id="artClear" aria-label="Start a new page">${ico(IC.reset)}</button></div></div>
    <div class="panel"><div class="hint" id="hint"></div><div class="tabs">${['Brushes', 'Stamps', 'Pages'].map((n, i) => `<button class="tab" data-atab="${i}">${n}</button>`).join('')}</div><div class="opts" id="aopts"></div></div>
    <div class="nav"><button class="btn ghost" data-go="world">${ico(IC.map)}Map</button><button class="btn ghost" id="artDl">${ico(IC.cam)}Download</button><button class="btn" id="artSave">${ico(IC.heart)}Save to gallery</button></div></section>`;
  const g = paperCtx(); if (art.keep) g.drawImage(art.keep, 0, 0); else { g.fillStyle = '#fff'; g.fillRect(0, 0, 960, 720); }
  renderArtOpts();
}
function renderArtOpts() {
  const box = $('#aopts'); if (!box) return;
  document.querySelectorAll('[data-atab]').forEach((b, i) => b.setAttribute('aria-selected', i === art.tab));
  const tool = (attr, on, svg, name) => `<button class="tool" ${attr} aria-pressed="${on}">${svg}<span>${name}</span></button>`;
  const dot = r => `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" fill="#7a5cf0"/></svg>`;
  if (art.tab === 0) {
    box.className = 'opts nailopts';
    box.innerHTML = `<div class="nrow sws">${ARTPAL.map(c => `<button class="sw" data-ac="${c}" aria-pressed="${art.color === c && art.mode !== 'eraser'}" style="--c:${c}" aria-label="Paint ${c}"></button>`).join('')}</div>
      <label class="hue"><span>Colour slider</span><input type="range" min="0" max="359" value="330" data-hue aria-label="Paint colour slider"></label>
      <div class="nrow tools">${tool('data-am="brush"', art.mode === 'brush', toolSvg(ART.facebrush), 'Brush')}${tool('data-am="rainbow"', art.mode === 'rainbow', `<svg viewBox="0 0 64 64">${['#ff8fa3', '#ffd36e', '#a8e26b', '#7fd4ff', '#b79bff'].map((c, i) => `<path d="M${8 + i * 5},50 A${24 - i * 5},${24 - i * 5} 0 0 1 ${56 - i * 5},50" stroke="${c}" stroke-width="5" fill="none"/>`).join('')}</svg>`, 'Rainbow')}${tool('data-am="glitter"', art.mode === 'glitter', toolSvg(ART.glitter), 'Glitter')}${tool('data-am="eraser"', art.mode === 'eraser', toolSvg(ART.remover), 'Eraser')}
      ${[[6, 'Thin'], [14, 'Medium'], [30, 'Thick']].map(([s, n]) => tool(`data-as="${s}"`, art.size === s, dot(s * .7 + 3), n)).join('')}</div>`;
  } else if (art.tab === 1) {
    box.className = 'opts tools';
    box.innerHTML = STAMPS().map(([id, n]) => tool(`data-stamp="${id}"`, art.mode === 'stamp' && art.stamp === id, stampSvg(id)[0].replace(/ width="\d+" height="\d+"/, ''), n)).join('');
  } else {
    box.className = 'opts';
    box.innerHTML = `<button class="opt" data-page="blank"><svg viewBox="0 0 800 600"><rect width="800" height="600" fill="#fff" stroke="#eadcff" stroke-width="12"/></svg><span>Blank paper</span></button>` +
      [...KINGDOMS.filter(k => kOpen(k.id)).map(k => ['k_' + k.id, k.short]), ['ballroom', 'Ballroom'], ['garden', 'Moon garden'], ['castle', 'Cloud castle']].map(([id, n]) => `<button class="opt" data-page="${id}"><svg viewBox="0 50 800 600">${SCENES[id]()}</svg><span>${n}</span></button>`).join('');
  }
  setHint(art.tab === 1 ? 'Pick a stamp, then tap the paper.' : art.tab === 2 ? 'Pick a page to paint on. It starts a new picture.' : 'Draw with your finger or the mouse.');
}
function loadStamp(id) {
  const [svg, w, h] = stampSvg(id), img = new Image(); art.mode = 'stamp'; art.stamp = id; art.img = null;
  img.onload = () => { if (art.stamp === id) art.img = [img, w, h]; };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function setPage(id) {
  const g = paperCtx(); artPush();
  if (id === 'blank') { g.fillStyle = '#fff'; g.fillRect(0, 0, 960, 720); return artKeep(); }
  const img = new Image();
  img.onload = () => { const c = paperCtx(); if (c) { c.drawImage(img, 0, 0, 960, 720); artKeep(); } };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 50 800 600">${SCENES[id]()}</svg>`);
}
const paperPt = e => { const r = $('#paper').getBoundingClientRect(); return [(e.clientX - r.left) * 960 / r.width, (e.clientY - r.top) * 720 / r.height]; };
function artStroke(x, y) {
  const g = paperCtx(), [lx, ly] = art.last || [x, y];
  if (art.mode === 'glitter') {
    for (let i = 0; i < 2; i++) { const px = x + rnd(-art.size, art.size) * 1.4, py = y + rnd(-art.size, art.size) * 1.4, r = rnd(3, 4 + art.size * .5); g.fillStyle = pick([art.color, '#ffe27a', '#ffffff', '#ff9ecb']); g.beginPath(); for (let q = 0; q < 10; q++) { const a = Math.PI * q / 5, rr = q % 2 ? r * .45 : r; g.lineTo(px + Math.sin(a) * rr, py - Math.cos(a) * rr); } g.closePath(); g.fill(); }
  } else {
    if (art.mode === 'rainbow') { art.hue = (art.hue + 5) % 360; g.strokeStyle = `hsl(${art.hue} 85% 65%)`; } else g.strokeStyle = art.mode === 'eraser' ? '#ffffff' : art.color;
    g.lineWidth = (art.mode === 'eraser' ? art.size * 2.4 : art.size) * (art.press ? .4 + art.press * 1.2 : 1); g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(lx, ly); g.lineTo(x + .01, y + .01); g.stroke();
  }
  art.last = [x, y];
}
G.resets.push(() => { art.down = false; });
window.addEventListener('pointerdown', e => {
  if (save.stage !== 'art' || e.target.id !== 'paper' || G.id !== null || (e.pointerType === 'mouse' && e.button)) return;
  const [x, y] = paperPt(e); e.preventDefault();
  if (art.mode === 'stamp') { if (!art.img) return; artPush(); const [img, w, h] = art.img, k = art.size / 14 * .9 + .3; paperCtx().drawImage(img, x - w * k / 2, y - h * k / 2, w * k, h * k); sfx.pop(); burst(e.clientX, e.clientY, 5); return artKeep(); }
  if (!claim(e, 'art')) return;
  artPush(); art.down = true; art.last = null; art.press = e.pointerType === 'pen' ? e.pressure : 0; artStroke(x, y);
});
window.addEventListener('pointermove', e => {
  if (!mine(e, 'art') || !$('#paper')) return;
  const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];      // every sample between frames: smooth lines for fast fingers and pencils
  (list.length ? list : [e]).forEach(ev => { if (e.pointerType === 'pen') art.press = ev.pressure; const [x, y] = paperPt(ev); artStroke(x, y); });
});
const artUp = e => { if (!mine(e, 'art')) return; release(); art.down = false; if ($('#paper')) artKeep(); };
window.addEventListener('pointerup', artUp); window.addEventListener('pointercancel', artUp);

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.gal) { sfx.tap(); return openGal(+t.dataset.gal); }
  if (t.dataset.artid) { sfx.tap(); return openArt(+t.dataset.artid); }
  if (t.id === 'toGallery') return addToGallery();
  if (t.dataset.galact) {
    const act = t.dataset.galact, g = save.gallery.find(x => x.id === ui.gal), dlg = $('#galdlg');
    if (act === 'delart') { artStore = artStore.filter(a => a.id !== ui.gal); saveArt(); dlg.close(); return renderGallery(); }
    if (!g) return; const look = galLook(g);
    if (act === 'photo') return svgToPng(photoSvg(look, galScene(g)), 1200, 1050, `princess-${g.p}.png`);
    if (act === 'ba') return svgToPng(beforeAfterSvg(look), 1350, 1125, `princess-${g.p}-before-after.png`);
    dlg.close();
    if (act === 'del') { save.gallery = save.gallery.filter(x => x.id !== g.id); persist(); return renderGallery(); }
    if (act === 'wear') { S = JSON.parse(JSON.stringify(look)); save.current = S.princess; sfx.magic(); toast(`${PMAP[S.princess].name} is wearing this look again.`); return go('fashion'); }
    if (act === 'outfit') { OUTFIT.forEach(k => { S[k] = JSON.parse(JSON.stringify(look[k])); }); sfx.magic(); toast(`${PMAP[S.princess].name} is wearing the outfit.`); return go('fashion'); }
  }
  if (save.stage !== 'art') return;
  if (t.dataset.atab) { art.tab = +t.dataset.atab; sfx.tap(); return renderArtOpts(); }
  if (t.dataset.ac) { art.color = t.dataset.ac; if (art.mode === 'eraser' || art.mode === 'stamp') art.mode = 'brush'; sfx.tap(); return renderArtOpts(); }
  if (t.dataset.am) { art.mode = t.dataset.am; sfx.tap(); return renderArtOpts(); }
  if (t.dataset.as) { art.size = +t.dataset.as; sfx.tap(); return renderArtOpts(); }
  if (t.dataset.stamp) { loadStamp(t.dataset.stamp); sfx.tap(); return renderArtOpts(); }
  if (t.dataset.page) { setPage(t.dataset.page); return sfx.pick(); }
  if (t.id === 'artUndo') { const c = art.undo.pop(); if (c) { paperCtx().drawImage(c, 0, 0); artKeep(); sfx.tap(); } t.disabled = !art.undo.length; return; }
  if (t.id === 'artClear') { artPush(); const g = paperCtx(); g.fillStyle = '#fff'; g.fillRect(0, 0, 960, 720); artKeep(); return sfx.tap(); }
  if (t.id === 'artDl') return $('#paper').toBlob(b => b && saveBlob(b, 'my-painting.png'), 'image/png');
  if (t.id === 'artSave') {
    if (artStore.length >= ART_MAX) return toast(`Your gallery holds ${ART_MAX} paintings. Delete one to make room.`);
    artStore.push({ id: newId(artStore), src: $('#paper').toDataURL('image/jpeg', .85) });
    if (!saveArt()) { artStore.pop(); return toast('There is no room left to save this painting.'); }
    const n = artStore.length; if (n <= 3 && !save.found['art' + n]) { save.found['art' + n] = 1; earn(1, 'Painting saved to My Gallery!'); } else { toast('Painting saved to My Gallery!'); sfx.magic(); }
  }
});
