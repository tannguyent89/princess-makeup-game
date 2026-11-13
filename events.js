'use strict';
/* =====================================================================
   Royal events: get the place ready, choose an outfit, celebrate.
   An event is only data: a backdrop, five things to prepare (pieces from
   the castle furniture kit) and what falls from the sky at the party.
   prep entries: [piece, what the button says, x, y, scale, flipped]
   ===================================================================== */
const EVENTS = [
  { id: 'birthday', name: 'Royal Birthday Party', k: 'sun', scene: 'k_sun', fall: 'sun', cheer: 'Happy birthday, {n}!', line: 'Cake, balloons and a very loud song.',
    prep: [['bunting', 'Hang the bunting', 400, 70, 1.5], ['balloons', 'Blow up balloons', 130, 330, 1.3], ['cake', 'Bake the cake', 140, 560, 1.3], ['presents', 'Wrap the presents', 668, 600, 1.2], ['cupcakes', 'Stack the cupcakes', 668, 420, 1.1]] },
  { id: 'snow', name: 'Winter Snow Festival', k: 'ice', scene: 'k_ice', fall: 'ice', cheer: 'The Snow Festival has begun, {n}!', line: 'Lanterns in the snow and hot cocoa for everyone.',
    prep: [['lanterns', 'Hang the lanterns', 400, 80, 1.5], ['snowman', 'Build a snowman', 140, 560, 1.4], ['pine', 'Light the party tree', 660, 420, 1.2, 1], ['sled', 'Park the sled', 660, 640, 1.2], ['drinks', 'Pour the cocoa', 140, 400, 1.1]] },
  { id: 'mermaid', name: 'Mermaid Celebration', k: 'ocean', scene: 'k_ocean', fall: 'ocean', cheer: 'Splash! Welcome to the celebration, {n}!', line: 'A party under the waves, with treasure to share.',
    prep: [['bunting', 'Hang the shell garland', 400, 70, 1.5], ['throne', 'Polish the shell throne', 140, 450, 1.2], ['chest', 'Open the treasure chest', 660, 610, 1.3], ['coral', 'Plant the coral', 130, 610, 1.1], ['balloons', 'Blow bubble balloons', 670, 350, 1.2]] },
  { id: 'fashion', name: 'Princess Fashion Show', k: 'star', scene: 'catwalk', fall: 'star', cheer: '{n} is the star of the show!', line: 'Lights, cameras and a long pink catwalk.',
    prep: [['lanterns', 'Switch on the lights', 400, 70, 1.5], ['spotlight', 'Aim the left spotlight', 690, 420, 1.3], ['spotlight', 'Aim the right spotlight', 110, 420, 1.3, 1], ['camera', 'Set up the camera', 130, 610, 1.2], ['bouquet', 'Bring the flowers', 670, 620, 1.2]] },
  { id: 'wedding', name: 'Royal Wedding', k: 'rose', scene: 'k_rose', fall: 'heart', cheer: 'Hooray for the royal wedding, {n}!', line: 'Bells, roses and the biggest cake in the kingdom.',
    prep: [['arch', 'Build the flower arch', 400, 330, 3.6], ['bells', 'Ring the wedding bells', 400, 70, 1.3], ['bouquet', 'Tie the bouquet', 130, 610, 1.3], ['cake', 'Ice the wedding cake', 670, 580, 1.5], ['balloons', 'Blow up balloons', 130, 360, 1.2]] },
  { id: 'garden', name: 'Magical Garden Party', k: 'forest', scene: 'k_forest', fall: 'forest', cheer: 'Welcome to the garden party, {n}!', line: 'Tea under the trees, with butterflies as guests.',
    prep: [['lanterns', 'Hang the lanterns', 400, 80, 1.5], ['teatable', 'Set the tea table', 140, 590, 1.3], ['cupcakes', 'Stack the cupcakes', 668, 590, 1.3], ['butterflies', 'Invite the butterflies', 660, 330, 1.4], ['tulips', 'Plant the tulips', 130, 440, 1.2]] },
  { id: 'lantern', name: 'Lantern Night', k: 'lotus', scene: 'k_lotus', fall: 'lotus', cheer: 'The lanterns are glowing for you, {n}!', line: 'A hundred lights floating over the lake.',
    prep: [['lanterns', 'Hang the lanterns', 400, 80, 1.5], ['lantern', 'Light the left lamp', 120, 520, 1.5], ['lantern', 'Light the right lamp', 680, 520, 1.5], ['teatable', 'Set the tea table', 660, 640, 1], ['bouquet', 'Pick lake flowers', 130, 640, 1]] },
  { id: 'picnic', name: 'Blossom Picnic', k: 'cherry', scene: 'k_cherry', fall: 'cherry', cheer: 'The blossom picnic is ready, {n}!', line: 'Snacks on a blanket while the petals fall.',
    prep: [['bunting', 'Hang the bunting', 400, 70, 1.5], ['blanket', 'Spread the blanket', 140, 620, 1.3], ['cupcakes', 'Stack the cupcakes', 668, 600, 1.2], ['teatable', 'Set the tea table', 660, 440, 1], ['balloons', 'Blow up balloons', 130, 380, 1.1]] },
  { id: 'dance', name: 'Butterfly Dance', k: 'butterfly', scene: 'k_butterfly', fall: 'butterfly', cheer: 'Time to dance, {n}!', line: 'Everybody flutters, everybody twirls.',
    prep: [['lanterns', 'Hang the lanterns', 400, 80, 1.5], ['butterflies', 'Call the butterflies', 130, 350, 1.5], ['butterflies', 'Call some more', 670, 420, 1.3, 1], ['arch', 'Build the flower arch', 400, 330, 3.6], ['presents', 'Bring the gifts', 668, 620, 1.1]] },
];
const EVMAP = Object.fromEntries(EVENTS.map(e => [e.id, e]));
const evNow = () => ui.ev && EVMAP[ui.ev.id];
/* side decorations are pulled a little toward the middle so a tall, narrow stage does not crop them */
const evItems = (ev, done) => ev.prep.map(([t, , x, y, s, f], i) => !done || done.includes(i) ? `<g transform="translate(${Math.round(400 + (x - 400) * .8)},${y}) scale(${(f ? -1 : 1) * s},${s})">${IT[t][1]()}</g>` : '').join('');
const eventSceneInner = (ev, done) => (SCENES[ev.scene] || SCENES.ballroom)() + evItems(ev, done);
const eventSceneSvg = (ev, done) => `<svg viewBox="0 0 800 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${eventSceneInner(ev, done)}</svg>`;

function renderEvents() {
  view.innerHTML = `<section class="choose"><h2>Royal events</h2><p class="sub">Get the party ready, pick an outfit, then celebrate.</p><div class="cards many">${EVENTS.map(ev => {
    const k = KMAP[ev.k], open = kOpen(ev.k);
    return `<button class="card ecard${open ? '' : ' locked'}" data-event="${ev.id}" style="--accent:${k.rc}"><span class="portrait">${sceneSvg(ev.scene)}</span><strong>${ev.name}</strong><em>${k.short}</em><small>${ev.line}</small><span class="btn small${open ? '' : ' off'}">${open ? (save.evDone[ev.id] ? 'Play again' : 'Start') : `Opens at ${plural(k.at)}`}</span></button>`;
  }).join('')}</div></section>`;
}
function renderPrep() {
  const ev = evNow(), done = ui.ev.done, all = done.length === ev.prep.length;
  view.innerHTML = `<section class="studio">
    <div class="stage" id="stage"><div class="scene">${eventSceneSvg(ev, done)}</div><div class="plate"><b>${ev.name}</b> · Getting ready</div></div>
    <div class="panel"><div class="hint" id="hint"></div><div class="opts tasks">${ev.prep.map(([t, label], i) => `<button class="opt task" data-task="${i}" aria-pressed="${done.includes(i)}"><svg viewBox="-92 -96 184 184">${IT[t][1]()}</svg><span>${label}</span></button>`).join('')}</div></div>
    <div class="nav"><button class="btn ghost" data-go="events">Events</button><button class="btn" data-go="eventfit" ${all ? '' : 'disabled'}>Next: party outfit</button></div></section>`;
  setHint(all ? 'Everything is ready. Time to dress up!' : 'Tap each job to get the party ready.', done.length, ev.prep.length);
}
function renderParty() {
  const ev = evNow(), p = PMAP[S.princess];
  view.innerHTML = `<section class="runway">
    <div class="stage show" id="stage"><div class="scene">${eventSceneSvg(ev)}</div>${auraHtml(ev.fall)}<div class="spot"></div><div class="doll" id="doll"></div>${buddyHtml()}<div class="flash" id="flash"></div>
      <div class="banner">${ev.cheer.replace('{n}', `<span>Princess ${p.name}</span>`)}</div></div>
    <div class="showbar">
      <div class="group"><h3>${ev.name}</h3><p class="kline">${ev.line}</p></div>
      <div class="group"><h3>Strike a pose</h3><div class="row" id="posePick">${POSES.map((po, i) => `<button class="pose" data-pose="${i}" aria-pressed="${S.pose === i}">${dollSvg(S, '40 230 320 330', i)}<span>${po.name}</span></button>`).join('')}</div></div>
      <div class="group actions">
        <button class="btn magic" id="again">${ico(IC.star)}Celebrate again</button>
        <button class="btn" id="toGallery">${ico(IC.heart)}Save to my gallery</button>
        <button class="btn ghost" id="photo">${ico(IC.cam)}Save a photo</button>
        <button class="btn ghost" data-go="world">Back to the map</button>
      </div></div></section>`;
  paintDoll(); celebrate();
  if (!ui.ev.paid) { ui.ev.paid = true; save.evDone[ev.id] = 1; muddy(); persist(); setTimeout(() => earn(3, 'What a party!'), 1000); }
}
STUDIOS.eventfit = {
  title: 'Party outfit', zoom: 'full', noSurprise: true,
  scene: () => eventSceneSvg(evNow()),
  plate: () => `<b>${evNow().name}</b> · Party outfit`,
  hint: () => setHint(`Pick what ${PMAP[S.princess].name} wears to the party.`),
  nav: () => `<div class="nav"><button class="btn ghost" data-go="prep">Back</button><button class="btn" data-go="party">Start the party</button></div>`,
  tabs: [...['dress', 'dressColor', 'shoes', 'crown', 'wings'].map(k => STUDIOS.dress.tabs.find(t => t.key === k)), ...['wand', 'cape'].map(k => STUDIOS.extras.tabs.find(t => t.key === k))],
};

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.event && EVMAP[t.dataset.event]) {
    const ev = EVMAP[t.dataset.event], k = KMAP[ev.k]; sfx.tap();
    if (!kOpen(ev.k)) return toast(`This party opens with the ${k.name}, at ${plural(k.at)}. You have ${save.stars}.`);
    ui.ev = { id: ev.id, done: [], paid: false }; return go('prep');
  }
  if (t.dataset.task && save.stage === 'prep' && !ui.ev.done.includes(+t.dataset.task)) {
    ui.ev.done.push(+t.dataset.task); renderPrep(); sfx.pick();
    const r = $('#stage').getBoundingClientRect(), [, , x, y] = evNow().prep[+t.dataset.task]; burst(r.left + r.width * Math.max(.1, Math.min(.9, x / 800)), r.top + r.height * y / 700, 10);
    if (ui.ev.done.length === evNow().prep.length) sfx.magic();
  }
  if (t.id === 'again') return celebrate();
});
