'use strict';
/* =====================================================================
   Pet World: five pets drawn from one kit (body + species parts), pet care
   studio (wash, dry, brush, feed, recolour, dress up) and the buddy that
   walks along with the princess. Pets live in save.pets.
   ===================================================================== */
const PETS = [
  { id: 'kitten', name: 'Mochi', kind: 'Kitten', c: '#ffd9b8', c2: '#ff9e7d', at: 0 },
  { id: 'puppy', name: 'Biscuit', kind: 'Puppy', c: '#f3d6a8', c2: '#b5793f', at: 0 },
  { id: 'rabbit', name: 'Clover', kind: 'Magic rabbit', c: '#ffffff', c2: '#ffb3d1', at: 3 },
  { id: 'unicorn', name: 'Twinkle', kind: 'Unicorn', c: '#fff7fb', c2: '#c9a2ff', at: 7 },
  { id: 'dragon', name: 'Ember', kind: 'Baby dragon', c: '#8fe0b0', c2: '#ffb07a', at: 12 },
];
const PETMAP = Object.fromEntries(PETS.map(p => [p.id, p]));
const PETACC = [none, { id: 'bow', name: 'Bow' }, { id: 'crown', name: 'Crown' }, { id: 'collar', name: 'Heart collar' }, { id: 'flower', name: 'Flower' }, { id: 'scarf', name: 'Scarf' }, { id: 'star', name: 'Star clip' }];
const PETPAL = ['#ffffff', '#ffd9b8', '#f3d6a8', '#c98f5a', '#9aa0b8', '#4b3a5c', '#ff9ecb', '#c9a2ff', '#7fd4ff', '#8fe0b0', '#ffe27a', '#ff9e7d'];
const isHex = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
const petOpen = id => save.stars >= PETMAP[id].at;
const hasPet = id => !!(PETMAP[id] && save.pets[id] && typeof save.pets[id] === 'object');
function petOf(id) { const d = PETMAP[id], s = save.pets[id] || {}; return { ...d, c: isHex(s.c) ? s.c : d.c, c2: isHex(s.c2) ? s.c2 : d.c2, acc: PETACC.some(a => a.id === s.acc) ? s.acc : 'none', clean: !!s.clean, shiny: !!s.shiny }; }
function setPet(id, o) { save.pets[id] = { ...(save.pets[id] || {}), ...o }; }

/* a pet on a 200 × 200 canvas; `st` is the wash-and-feed session when she is being cared for */
function petInner(pet, st) {
  const { c, c2 } = pet, dk = shade(c, -.14), lt = shade(c, .5), ink = '#3a2340', m = s => mirror(s, 200);
  let back = '', mid = '', face = '', nose = `<ellipse cx="100" cy="97" rx="4.500" ry="3.200" fill="#ff8fab"/>`;
  switch (pet.id) {
    case 'kitten':
      back = `<path d="M140,160 C178,160 180,116 158,110" stroke="${c}" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M164,118 L158,110" stroke="${c2}" stroke-width="13" stroke-linecap="round"/>` + m(`<path d="M58,64 L64,18 L98,46Z" fill="${c}"/><path d="M67,52 L70,32 L86,46Z" fill="#ffb3d1"/>`);
      mid = `<path d="M92,42 v12 M100,40 v14 M108,42 v12" stroke="${c2}" stroke-width="4.500" stroke-linecap="round"/>`;
      face = m(`<path d="M62,98 h-22 M62,104 l-20,7" stroke="${ink}" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>`); break;
    case 'puppy':
      back = `<path d="M140,152 q28,-10 24,-36" stroke="${c}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
      mid = `<ellipse cx="118" cy="86" rx="16" ry="18" fill="${c2}" opacity=".55"/>` + m(`<ellipse cx="54" cy="86" rx="15" ry="31" fill="${c2}" transform="rotate(14 54 86)"/>`);
      nose = `<ellipse cx="100" cy="97" rx="7" ry="5" fill="${ink}"/><path d="M95,106 q5,11 10,0Z" fill="#ff7d9c"/>`; break;
    case 'rabbit':
      back = `<circle cx="146" cy="162" r="14" fill="${lt}" stroke="${dk}" stroke-width="2"/>` + m(`<ellipse cx="80" cy="28" rx="13" ry="35" fill="${c}" stroke="${dk}" stroke-width="1.5" transform="rotate(-8 80 28)"/><ellipse cx="80" cy="30" rx="6" ry="24" fill="${c2}" transform="rotate(-8 80 30)"/>`);
      mid = star(100, 56, 8, c2);
      face = `<rect x="96" y="105" width="8" height="8" rx="2" fill="#fff" stroke="${dk}" stroke-width="1.2"/>`; break;
    case 'unicorn':
      back = `<path d="M142,150 C178,146 178,188 150,184" stroke="${c2}" stroke-width="14" stroke-linecap="round" fill="none"/>` + m(`<path d="M64,54 L68,26 L88,46Z" fill="${c}" stroke="${dk}" stroke-width="1.5"/>`);
      mid = [[58, 62, 16], [50, 86, 15], [54, 110, 13]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? shade(c2, .25) : c2}"/>`).join('') + `<circle cx="100" cy="46" r="15" fill="${c2}"/><path d="M91,42 L100,2 L109,42Z" fill="${GOLD}"/><path d="M95,30 l10,-5 M93,38 l13,-6 M97,20 l6,-3" stroke="#f5a623" stroke-width="2"/><ellipse cx="100" cy="102" rx="22" ry="15" fill="${lt}" stroke="${dk}" stroke-width="1"/>`;
      nose = `<circle cx="93" cy="100" r="2" fill="${ink}" opacity=".6"/><circle cx="107" cy="100" r="2" fill="${ink}" opacity=".6"/>`; break;
    case 'dragon':
      back = m(`<path d="M62,128 C30,94 12,102 8,132 C22,126 30,136 34,148 C44,138 54,142 62,152Z" fill="${c2}"/>`) + `<path d="M140,162 C172,166 178,140 166,124" stroke="${c}" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M166,126 l-13,-6 l11,-13 l9,15Z" fill="${c2}"/>` + m(`<path d="M72,48 L68,20 L88,40Z" fill="#fff3c9"/>`);
      mid = `<path d="M91,42 l9,-16 l9,16Z" fill="${c2}"/>`;
      nose = `<circle cx="94" cy="97" r="2.200" fill="${ink}" opacity=".6"/><circle cx="106" cy="97" r="2.200" fill="${ink}" opacity=".6"/>`;
      face = `<path d="M108,104 l3,7 l3,-7Z" fill="#fff"/>`; break;
  }
  const happy = st && st.fed >= 3;
  const eyes = happy ? m(`<path d="M74,89 q8,-11 16,0" stroke="${ink}" stroke-width="3.500" fill="none" stroke-linecap="round"/>`) : m(`<ellipse cx="82" cy="86" rx="7" ry="8.500" fill="${ink}"/><circle cx="84.500" cy="82.500" r="2.800" fill="#fff"/>`);
  let o = back + m(`<ellipse cx="78" cy="178" rx="15" ry="9" fill="${pet.id === 'unicorn' ? c2 : dk}"/>`) + `<ellipse cx="100" cy="142" rx="44" ry="40" fill="${c}"/><ellipse cx="100" cy="150" rx="26" ry="26" fill="${lt}"/>` +
    (pet.id === 'dragon' ? `<path d="M80,140 h40 M78,152 h44 M82,164 h36" stroke="${dk}" stroke-width="2" opacity=".5"/>` : '') +
    `<circle cx="100" cy="84" r="46" fill="${c}"/>` + mid + eyes + m(`<ellipse cx="68" cy="101" rx="8" ry="5" fill="#ff8fab" opacity=".5"/>`) + nose + `<path d="M93,103 Q100,${happy ? 114 : 110} 107,103" stroke="${ink}" stroke-width="2.400" fill="none" stroke-linecap="round"/>` + face;
  o += ({
    bow: () => bow(100, 128, 15, '#ff6fa8'),
    crown: () => `<path d="M82,46 L79,24 L91,36 L100,18 L109,36 L121,24 L118,46Z" fill="${GOLD}" stroke="#f5a623" stroke-width="1.5"/>` + gem(100, 38, 4, '#ff6fa8'),
    collar: () => `<path d="M66,120 Q100,140 134,120" stroke="#7a5cf0" stroke-width="8" fill="none" stroke-linecap="round"/>` + heart(100, 136, 12, '#ff4f8b'),
    flower: () => flower(134, 52, 13, '#ff9ecb'),
    scarf: () => `<path d="M64,118 Q100,142 136,118" stroke="#ff6f91" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M122,126 l8,34 l-16,-4Z" fill="#ff6f91"/><path d="M76,126 q24,12 48,0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>`,
    star: () => star(64, 52, 12, '#ffe27a', 'stroke="#f5a623" stroke-width="1.5"'),
  }[pet.acc] || (() => ''))();
  if (st) {
    o += st.dirt.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="8" fill="#8a6a4a" opacity=".55"/><circle cx="${x + 9}" cy="${y - 6}" r="4" fill="#8a6a4a" opacity=".4"/>`).join('');
    o += st.bub.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" opacity=".93" stroke="#cfeaff" stroke-width="1.2"/><circle cx="${f1(x - r * .3)}" cy="${f1(y - r * .3)}" r="${f1(r * .25)}" fill="#dff3ff"/>`).join('');
    if (st.wet > .4) o += [[62, 130], [140, 124], [100, 190]].map(([x, y]) => `<path d="M${x},${y - 5} q4,7 0,9 q-4,-2 0,-9Z" fill="#8fd3ff"/>`).join('');
    if (happy) o += heart(40, 40, 14, '#ff5c8a') + heart(162, 34, 11, '#ff9ecb');
  }
  if (pet.shiny && !(st && (st.dirt.length || st.bub.length))) o += star(34, 86, 7, '#fff', 'stroke="#ffe27a" stroke-width="1"') + star(168, 96, 6, '#fff', 'stroke="#ffe27a" stroke-width="1"') + star(150, 30, 5, '#ffe27a');
  return o;
}
const petSvg = (pet, st) => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${petInner(pet, st)}</svg>`;
const buddyHtml = () => S && hasPet(S.pet) ? `<div class="buddy">${petSvg(petOf(S.pet))}</div>` : '';
const muddy = () => { if (S && hasPet(S.pet)) setPet(S.pet, { clean: false, shiny: false }); };   // she played hard: bath time next visit

/* ---------- Pet World ---------- */
function renderPets() {
  const p = PMAP[S.princess];
  view.innerHTML = `<section class="choose"><h2>Pet World</h2><p class="sub">Adopt a pet, look after it, and take it along on ${p.name}'s adventures.</p><div class="cards many">${PETS.map(d => {
    const mine = hasPet(d.id), open = petOpen(d.id), pet = petOf(d.id);
    return `<div class="card pcard${open ? '' : ' locked'}" style="--accent:${pet.c2}"><span class="portrait">${petSvg(pet)}</span><strong>${d.name}</strong><em>${d.kind}</em>
      ${!open ? `<span class="btn small off">Comes at ${plural(d.at)}</span>` : mine ? `<button class="btn small" data-care="${d.id}">Care for ${d.name}</button><button class="chip" data-buddy="${d.id}" aria-pressed="${S.pet === d.id}">${S.pet === d.id ? `Walking with ${p.name}` : `Walk with ${p.name}`}</button>` : `<button class="btn small" data-adopt="${d.id}">Adopt ${d.name}</button>`}</div>`;
  }).join('')}</div><p class="sub"><button class="btn ghost" data-room="pethouse">Decorate the pet house</button></p></section>`;
}

/* ---------- pet care studio (uses the same drag-tool engine as the salon) ---------- */
let pc = null;
const FOOD = {
  carrot: `<path d="M18 22 L50 46 Q54 52 48 54 Q14 44 18 22Z" fill="#ff9e3d"/><path d="M18 22 q-8,-10 -2,-16 q2,8 8,10 q0,-10 8,-10 q-2,10 -6,14Z" fill="#58bd8a"/>`,
  cupcake: `<path d="M16 34h32l-5 24H21z" fill="#c58b52"/><circle cx="32" cy="26" r="17" fill="#ff9ecb"/><circle cx="32" cy="10" r="5" fill="#ff5c8a"/>`,
  milk: `<path d="M20 14h24l-3 44H23z" fill="#fff" stroke="#cfeaff" stroke-width="2"/><path d="M21 30h22l-2 26H23z" fill="#f0f6ff"/><path d="M40 14l8-10" stroke="#ff8fc0" stroke-width="4" stroke-linecap="round"/>`,
  apple: `<circle cx="32" cy="36" r="20" fill="#ff5c6c"/><path d="M32 18 q2-10 10-12" stroke="#a9744a" stroke-width="3" fill="none"/><path d="M34 16 q10-6 14 2 q-10 4-14-2Z" fill="#58bd8a"/><circle cx="24" cy="30" r="4" fill="#fff" opacity=".6"/>`,
  fish: `<ellipse cx="28" cy="32" rx="20" ry="12" fill="#7fd4ff"/><path d="M44 32 l16-12 v24Z" fill="#7fd4ff"/><circle cx="18" cy="29" r="3" fill="#3a2340"/>`,
  cookie: star(32, 32, 26, '#f3c46a', 'stroke="#d9a04a" stroke-width="2"') + `<circle cx="26" cy="28" r="3" fill="#8a5a44"/><circle cx="38" cy="34" r="3" fill="#8a5a44"/><circle cx="30" cy="40" r="2.500" fill="#8a5a44"/>`,
};
const P2 = (x, y) => [(x - 40) / 1.6, (y - 250) / 1.6];           // doll-space point -> pet-space point
const onPet = (u, v) => Math.hypot(u - 100, v - 84) < 52 || ((u - 100) / 50) ** 2 + ((v - 142) / 46) ** 2 < 1;
function petInit() {
  const pet = petOf(ui.pet);
  pc = { dirt: pet.clean ? [] : [[70, 70], [128, 64], [84, 132], [122, 150], [100, 104], [140, 112]], bub: [], wet: 0, brush: 0, fed: 0, done: pet.clean ? { scrub: 1, rinse: 1, dry: 1, brush: 1 } : {}, paid: false };
}
function petHint() {
  const pet = petOf(ui.pet), tab = curTab();
  if (tab.place) return setHint(pc.fed >= 3 ? `${pet.name} is full and happy!` : `Drag a treat to ${pet.name}.`, Math.min(pc.fed, 3), 3);
  if (!tab.tools) return setHint(`Make ${pet.name} look just how you like.`);
  const steps = [['scrub', `Scrub ${pet.name} with the soapy sponge`, 'sponge'], ['rinse', 'Rinse the bubbles off', 'shower'], ['dry', `Dry ${pet.name} with the dryer`, 'dryer'], ['brush', 'Brush until the fur sparkles', 'brush']];
  const i = steps.findIndex(s => !pc.done[s[0]]);
  if (i < 0) setHint(`${pet.name} is clean and fluffy!`, 4, 4); else setHint(steps[i][1], i, 4, steps[i][2]);
}
function petDrag(tool, x, y, cx, cy) {
  const [u, v] = P2(x, y), on = onPet(u, v), d = pc.done, was = JSON.stringify(d), name = PETMAP[ui.pet].name;
  if (tool === 'sponge') {
    if (on) { if (pc.bub.length < 50) pc.bub.push([u + rnd(-12, 12), v + rnd(-12, 12), rnd(5, 11)]); pc.dirt = pc.dirt.filter(b => Math.hypot(b[0] - u, b[1] - v) > 24); if (every('pop', 120)) sfx.pop(); if (pc.bub.length >= 24 && !pc.dirt.length) d.scrub = 1; }
  } else if (tool === 'shower') {
    for (let i = 0; i < 2; i++) fxSpawn('drop', cx + rnd(-24, 24), cy + rnd(0, 10), { vy: rnd(3, 6), c: '#7fc8ff', r: 3, life: .7 });
    if (every('water', 90)) sfx.water();
    if (on) pc.wet = Math.min(1, pc.wet + .05);
    pc.bub = pc.bub.filter(b => Math.hypot(b[0] - u, b[1] - v) > 34);
    if (d.scrub && !pc.bub.length) d.rinse = 1;
  } else if (tool === 'dryer') {
    fxSpawn('puff', cx + rnd(-10, 10), cy + rnd(-6, 6), { vx: rnd(-1.5, 1.5), vy: rnd(1, 3), r: rnd(8, 14), life: .5 });
    if (every('air', 130)) sfx.air();
    if (pc.bub.length) nudge('Rinse the bubbles off first.');
    else if (on) { pc.wet = Math.max(0, pc.wet - .05); if (pc.wet === 0 && d.rinse) d.dry = 1; }
  } else if (tool === 'brush' && on) {
    if (every('br', 110)) { sparkleAt(cx, cy, 2); sfx.brush(); }
    if (!d.dry) nudge(`Wash and dry ${name} first.`);
    else if (!d.brush && ++pc.brush >= 20) { d.brush = 1; setPet(ui.pet, { clean: true, shiny: true }); if (!pc.paid) { pc.paid = true; yay(`${name} is clean and fluffy!`, 1); } }
  }
  if (JSON.stringify(d) !== was) { sfx.pick(); petHint(); }
}
function petDrop(tool, x, y, cx, cy) {
  const [u, v] = P2(x, y), name = PETMAP[ui.pet].name;
  if (!(onPet(u, v) || Math.hypot(u - 100, v - 100) < 80)) return nudge(`Drop it on ${name}.`);
  pc.fed++; sfx.pop(); tone(660, .08, .12, 'triangle', .06); burst(cx, cy, 6); paintDoll(true);
  if (pc.fed === 3) yay(`Yum! ${name} is full and happy!`, 1);
  petHint();
}
STUDIOS.petcare = {
  zoom: 'pet', tint: '#d5f5e9', enter: petInit, hint: petHint,
  plate: () => { const pet = petOf(ui.pet); return `<b>${pet.name}</b> · ${pet.kind}`; },
  draw: () => `<svg viewBox="0 0 400 700" xmlns="http://www.w3.org/2000/svg"><ellipse cx="200" cy="545" rx="120" ry="18" fill="#4b2a6b" opacity=".12"/><g transform="translate(40,250) scale(1.6)">${petInner(petOf(ui.pet), pc)}</g></svg>`,
  nav: () => `<div class="nav"><button class="btn ghost" data-go="pets">${ico(IC.paw)}Pet World</button><button class="btn" data-buddy="${ui.pet}" aria-pressed="${S.pet === ui.pet}">${S.pet === ui.pet ? 'Walking with ' + PMAP[S.princess].name : 'Walk with ' + PMAP[S.princess].name}</button></div>`,
  tabs: [
    { label: 'Bath time', tools: [{ id: 'sponge', name: 'Soapy sponge', art: ART.sponge }, { id: 'shower', name: 'Shower', art: ART.shower }, { id: 'dryer', name: 'Dryer', art: ART.dryer }, { id: 'brush', name: 'Brush', art: ART.brush, flip: true }], onDrag: petDrag,
      extra: () => `<div class="chips"><button class="chip" data-mud>Play in the mud</button></div>` },
    { label: 'Treats', place: true, tools: Object.keys(FOOD).map(id => ({ id, name: id[0].toUpperCase() + id.slice(1), art: FOOD[id] })), onDrop: petDrop },
    { key: 'petC', label: 'Colour', colors: PETPAL, fx: [200, 400], get: () => petOf(ui.pet).c, set: v => setPet(ui.pet, { c: v }) },
    { key: 'petC2', label: 'Second colour', colors: PETPAL, fx: [200, 340], get: () => petOf(ui.pet).c2, set: v => setPet(ui.pet, { c2: v }) },
    { key: 'petAcc', label: 'Dress up', items: PETACC, fx: [200, 380], get: () => petOf(ui.pet).acc, set: v => setPet(ui.pet, { acc: v || 'none' }), thumb: id => petSvg({ ...petOf(ui.pet), acc: id }) },
  ],
};

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.adopt && petOpen(t.dataset.adopt) && !hasPet(t.dataset.adopt)) {
    const id = t.dataset.adopt; setPet(id, { clean: false }); if (!S.pet) S.pet = id;
    const r = t.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 14); render(); return earn(1, `${PETMAP[id].name} has a new home!`);
  }
  if (t.dataset.care && hasPet(t.dataset.care)) { ui.pet = t.dataset.care; sfx.tap(); return go('petcare'); }
  if (t.dataset.buddy && hasPet(t.dataset.buddy)) { S.pet = S.pet === t.dataset.buddy ? null : t.dataset.buddy; persist(); sfx.pick(); return render(); }
  if ('mud' in t.dataset) { setPet(ui.pet, { clean: false, shiny: false }); petInit(); persist(); paintDoll(true); petHint(); return sfx.pour(); }
});
