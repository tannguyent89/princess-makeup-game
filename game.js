'use strict';
/* =====================================================================
   Moonpetal Princess Salon
   game.js  helpers, catalogue, doll renderer, scenes, state & sound
   hair.js  strand hair engine (cutting, texture, colour effects)
   salon.js spa, cutting, styling tools, facial, nails, designer, hub
   ui.js    screens, navigation, undo/redo, events, boot
   ===================================================================== */

/* ---------- 1. helpers & shape kit ---------- */
const $ = (s, r = document) => r.querySelector(s);
const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16, n >> 8 & 255, n & 255]; };
const rgb2hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t = .5) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => v + (B[i] - v) * t)); };
const shade = (c, t) => t < 0 ? mix(c, '#3a1f4d', -t) : mix(c, '#ffffff', t);
let uidN = 0; const uid = () => 'u' + (++uidN);
const pick = a => a[Math.floor(Math.random() * a.length)];
const f1 = n => (+n).toFixed(1);

const star = (x, y, r, f, extra = '') => { x = +x; y = +y; let p = ''; for (let i = 0; i < 10; i++) { const a = Math.PI * i / 5 - Math.PI / 2, q = i % 2 ? r * .45 : r; p += (i ? 'L' : 'M') + f1(x + Math.cos(a) * q) + ',' + f1(y + Math.sin(a) * q); } return `<path d="${p}Z" fill="${f}" ${extra}/>`; };
const heart = (x, y, s, f, extra = '') => `<path transform="translate(${x},${f1(y - s * .4)}) scale(${f1(s / 20)})" d="M0,7 C-3,-6 -20,-3 -10,9 L0,19 L10,9 C20,-3 3,-6 0,7Z" fill="${f}" ${extra}/>`;
const flower = (x, y, r, pc, cc = '#ffd95a') => { x = +x; y = +y; let o = ''; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2; o += `<circle cx="${f1(x + Math.cos(a) * r * .62)}" cy="${f1(y + Math.sin(a) * r * .62)}" r="${f1(r * .48)}" fill="${pc}"/>`; } return o + `<circle cx="${x}" cy="${y}" r="${f1(r * .34)}" fill="${cc}"/>`; };
const bow = (x, y, s, f) => `<g transform="translate(${x},${y}) scale(${f1(s / 20)})"><path d="M0,0 C-8,-14 -24,-14 -22,0 C-24,14 -8,14 0,0Z M0,0 C8,-14 24,-14 22,0 C24,14 8,14 0,0Z" fill="${f}"/><circle r="5" fill="${shade(f, -.2)}"/></g>`;
const gem = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/><circle cx="${f1(x - r * .3)}" cy="${f1(y - r * .3)}" r="${f1(r * .35)}" fill="#fff" opacity=".85"/>`;
const mirror = (s, w = 400) => s + `<g transform="translate(${w},0) scale(-1,1)">${s}</g>`;
const GOLD = '#ffc94d';

/* ---------- 2. catalogue ---------- */
const PRINCESSES = [
  { id: 'lien', name: 'Liên', title: 'Princess of the Lotus Lake', line: 'Gentle and brave. She paints lanterns and sings to the koi fish.', skin: '#f6d3b0', eyes: '#5b3a29', hair: 'long', hairColor: '#2b2233', dress: 'lotus', eyeRy: 16, accent: '#ff9ec4' },
  { id: 'amara', name: 'Amara', title: 'Princess of the Star Garden', line: 'Curious and clever. She gives a name to every new star she finds.', skin: '#8d5a3c', eyes: '#3b2a20', hair: 'buns', hairColor: '#2a1a16', dress: 'moon', eyeRy: 18, accent: '#9c8cff' },
  { id: 'coralie', name: 'Coralie', title: 'Princess of Seashell Bay', line: 'Giggly and kind. She rides with the dolphins before breakfast.', skin: '#ffe3d3', eyes: '#3fa7c9', hair: 'braids', hairColor: '#f3c46a', dress: 'sea', eyeRy: 17, freckles: true, accent: '#5fd3c8' },
  { id: 'rosalind', name: 'Rosalind', title: 'Princess of the Rose Meadow', line: 'Dreamy and bold. She bakes a cake for every dragon she meets.', skin: '#d9a273', eyes: '#4f8a4b', hair: 'waves', hairColor: '#b5482f', dress: 'rose', eyeRy: 17, accent: '#ff8fb0' },
];
const PMAP = Object.fromEntries(PRINCESSES.map(p => [p.id, p]));

const PAL = {
  lips: [null, '#ff5c8a', '#e8375f', '#ff8fa3', '#c9184a', '#ff7b54', '#d14bd1', '#f4a6c0', '#9d4edd', '#ffb3c6', '#ff3d6e'],
  shadow: [null, '#ffa6d9', '#c9a2ff', '#8fd3ff', '#7ee8c7', '#ffd36e', '#ff8fa3', '#9d7bff', '#5fb4ff', '#f7b2ff', '#ffb37a'],
  blush: [null, '#ff8fab', '#ff6f91', '#ffa07a', '#f783ac', '#e599f7', '#ff9e7d', '#ff5d8f'],
  eyes: ['#5b3a29', '#3b2a20', '#3fa7c9', '#4f8a4b', '#7b61ff', '#c27ba0', '#2f6fdb', '#d08b2c', '#19a59a', '#8a8fa3'],
  hairColor: ['#2b2233', '#2a1a16', '#6b3f2a', '#b5482f', '#f3c46a', '#fff1c9', '#ff9ecb', '#c9a2ff', '#7fd4ff', '#7ee8c7', '#ff7b54', '#e8e8f5'],
  dressColor: [null, '#ff8fc0', '#ff5c8a', '#c9a2ff', '#8f8bff', '#7fd4ff', '#5fd3c8', '#a8e26b', '#ffd36e', '#ffb07a', '#ffffff', '#4b3a8f'],
};

const none = { id: 'none', name: 'None' };
const LINERS = [{ id: 'natural', name: 'Natural' }, { id: 'soft', name: 'Soft' }, { id: 'bold', name: 'Bold' }, { id: 'wing', name: 'Wing' }, { id: 'cat', name: 'Kitty' }, { id: 'jewel', name: 'Jewel' }];
const LASHES = [none, { id: 'sweet', name: 'Sweet' }, { id: 'flutter', name: 'Flutter' }, { id: 'doll', name: 'Doll' }, { id: 'star', name: 'Starry' }];
const DECOS = [none, { id: 'stars', name: 'Stars' }, { id: 'heart', name: 'Heart' }, { id: 'glitter', name: 'Glitter' }, { id: 'gem', name: 'Gem' }, { id: 'flower', name: 'Flower' }, { id: 'butterfly', name: 'Butterfly' }, { id: 'rainbow', name: 'Rainbow' }];
const HAIRS = [{ id: 'long', name: 'Long straight' }, { id: 'waves', name: 'Mermaid waves' }, { id: 'curls', name: 'Cloud curls' }, { id: 'bob', name: 'Short bob' }, { id: 'pixie', name: 'Pixie' }, { id: 'braids', name: 'Twin braids' }, { id: 'sidebraid', name: 'Side braid' }, { id: 'pony', name: 'Ponytail' }, { id: 'buns', name: 'Star buns' }, { id: 'bun', name: 'Ballet bun' }, { id: 'pigtails', name: 'Curly tails' }];
const CLIPS = [none, { id: 'bow', name: 'Bow' }, { id: 'flower', name: 'Flower' }, { id: 'stars', name: 'Star clips' }, { id: 'butterfly', name: 'Butterfly' }, { id: 'band', name: 'Headband' }, { id: 'pearls', name: 'Pearl pins' }];
const CROWNS = [none, { id: 'tiara', name: 'Tiara' }, { id: 'gold', name: 'Gold crown' }, { id: 'flowers', name: 'Flower crown' }, { id: 'halo', name: 'Star halo' }, { id: 'heart', name: 'Heart tiara' }, { id: 'ice', name: 'Ice crown' }];
const DRESSES = [
  { id: 'rose', name: 'Rose ball gown', k: 'ball', sl: 'puff', c: ['#ff8fc0', '#ffd1e6'], deco: 'bow' },
  { id: 'moon', name: 'Moonlight gown', k: 'ball', sl: 'off', c: ['#8f8bff', '#d6d4ff'], deco: 'stars' },
  { id: 'lotus', name: 'Lotus gown', k: 'aline', sl: 'long', c: ['#ff9ec4', '#fff0c9', '#ffe08a'], deco: 'flowers' },
  { id: 'sea', name: 'Sea foam gown', k: 'mermaid', sl: 'strap', c: ['#5fd3c8', '#c3f5ee'], deco: 'pearls' },
  { id: 'sun', name: 'Sunrise ruffles', k: 'tier', sl: 'puff', c: ['#ffb07a', '#ffe7a8'], deco: 'bow' },
  { id: 'lav', name: 'Lavender dream', k: 'tier', sl: 'long', c: ['#b79bff', '#f0e6ff'], deco: 'stars' },
  { id: 'snow', name: 'Snow wedding', k: 'ball', sl: 'long', c: ['#ffffff', '#e6ecff', '#cfe3ff'], deco: 'pearls' },
  { id: 'lily', name: 'Lily wedding', k: 'aline', sl: 'off', c: ['#fff7fb', '#ffdcec', '#ffb3d1'], deco: 'hearts' },
  { id: 'berry', name: 'Berry party', k: 'short', sl: 'strap', c: ['#ff5c8a', '#ffb3c6'], deco: 'hearts' },
  { id: 'disco', name: 'Starlight party', k: 'short', sl: 'puff', c: ['#4b3a8f', '#9d7bff'], deco: 'stars' },
  { id: 'tutu', name: 'Candy tutu', k: 'tutu', sl: 'strap', c: ['#ff9ecb', '#bfe6ff'], deco: 'bow' },
  { id: 'garden', name: 'Garden day dress', k: 'aline', sl: 'puff', c: ['#a8e26b', '#fff6b0'], deco: 'flowers' },
  { id: 'picnic', name: 'Picnic outfit', k: 'casual', sl: 'tee', c: ['#7fd4ff', '#d6f1ff', '#ffffff'], deco: 'hearts' },
  { id: 'rider', name: 'Adventure outfit', k: 'pants', sl: 'long', c: ['#c9a2ff', '#6f5bd6'], deco: 'none' },
];
const DMAP = Object.fromEntries(DRESSES.map(d => [d.id, d]));
const SHOES = [{ id: 'flats', name: 'Bow flats' }, { id: 'glass', name: 'Glass slippers' }, { id: 'ballet', name: 'Ballet ribbons' }, { id: 'heels', name: 'Gold heels' }, { id: 'boots', name: 'Lilac boots' }, { id: 'sneakers', name: 'Star sneakers' }];
const GLOVE = { shortw: [24, '#ffffff'], longw: [52, '#ffffff'], longp: [52, '#ffb3d1'], shortl: [24, '#cdb7ff'], longb: [52, '#bfe6ff'] };
const GLOVES = [none, { id: 'shortw', name: 'Short white' }, { id: 'longw', name: 'Long white' }, { id: 'longp', name: 'Long pink' }, { id: 'shortl', name: 'Short lilac' }, { id: 'longb', name: 'Long sky' }];
const NECKS = [none, { id: 'pearls', name: 'Pearls' }, { id: 'heart', name: 'Heart' }, { id: 'choker', name: 'Gem choker' }, { id: 'star', name: 'Star' }];
const EARS = [none, { id: 'pearl', name: 'Pearls' }, { id: 'drop', name: 'Gem drops' }, { id: 'star', name: 'Stars' }, { id: 'hoop', name: 'Hoops' }, { id: 'heart', name: 'Hearts' }];
const BRACES = [none, { id: 'gold', name: 'Gold' }, { id: 'pearl', name: 'Pearl' }, { id: 'rose', name: 'Rose' }, { id: 'charm', name: 'Star charm' }];
const WINGL = [none, { id: 'fairy', name: 'Fairy' }, { id: 'butterfly', name: 'Butterfly' }, { id: 'angel', name: 'Angel' }, { id: 'crystal', name: 'Crystal' }];
const CAPEL = [none, { id: 'royal', name: 'Royal violet' }, { id: 'night', name: 'Starry night' }, { id: 'petal', name: 'Rose petal' }, { id: 'rainbow', name: 'Rainbow' }, { id: 'snow', name: 'Snow fur' }];
const WANDS = [none, { id: 'star', name: 'Star wand' }, { id: 'heart', name: 'Heart wand' }, { id: 'moon', name: 'Moon wand' }, { id: 'flower', name: 'Flower wand' }];
const BAGS = [none, { id: 'heart', name: 'Heart purse' }, { id: 'shell', name: 'Shell clutch' }, { id: 'star', name: 'Star bag' }, { id: 'kitty', name: 'Kitty bag' }];
const FLOWERS = [none, { id: 'rose', name: 'Hair rose' }, { id: 'lei', name: 'Flower garland' }, { id: 'corsage', name: 'Shoulder bloom' }, { id: 'daisies', name: 'Daisy belt' }];
const JEWELS = [none, { id: 'heart', name: 'Heart brooch' }, { id: 'star', name: 'Star brooch' }, { id: 'belt', name: 'Gem belt' }, { id: 'sparkle', name: 'Diamond dust' }];

const POSES = [
  { name: 'Graceful', L: [[166, 302], [138, 372], [134, 442]], R: [[234, 302], [262, 372], [266, 442]], wr: 14 },
  { name: 'Wave', L: [[166, 302], [112, 352], [160, 398]], R: [[234, 302], [292, 338], [306, 262]], wr: 10 },
  { name: 'Ta-da', L: [[166, 302], [118, 346], [84, 300]], R: [[234, 302], [282, 346], [316, 300]], wr: 26 },
  { name: 'Sassy', L: [[166, 302], [112, 350], [162, 396]], R: [[234, 302], [288, 350], [238, 396]], wr: 150 },
];

/* ---------- 3. doll renderer ---------- */
const armD = A => `M${A[2]} Q${A[1]} ${A[0]}`;                       // hand -> shoulder
const bz = (A, t) => [0, 1].map(i => (1 - t) ** 2 * A[2][i] + 2 * t * (1 - t) * A[1][i] + t * t * A[0][i]);
const layer = (cls, inner) => inner ? `<g class="L-${cls}">${inner}</g>` : '';

/* hair: see hair.js (strand engine, so it can be cut and styled) */
const CROWN = {
  tiara: () => `<path d="M-48,10 Q0,-12 48,10" stroke="#e9eefc" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-30,0 L-22,-20 L-12,-4 L0,-34 L12,-4 L22,-20 L30,0Z" fill="#f4f7ff" stroke="#cdd7f5" stroke-width="2"/>` + gem(0, -12, 6, '#ff6fa8') + gem(-22, -6, 3.5, '#9fe8ff') + gem(22, -6, 3.5, '#9fe8ff'),
  gold: () => `<path d="M-42,12 L-48,-28 L-24,-8 L0,-40 L24,-8 L48,-28 L42,12Z" fill="${GOLD}"/><rect x="-42" y="4" width="84" height="10" rx="4" fill="#f5a623"/>` + gem(0, -40, 6, '#ff6fa8') + gem(-48, -28, 5, '#9fe8ff') + gem(48, -28, 5, '#9fe8ff') + gem(0, 9, 4.5, '#c9a2ff') + gem(-22, 9, 3.5, '#fff') + gem(22, 9, 3.5, '#fff'),
  flowers: () => `<path d="M-58,22 Q0,-22 58,22" stroke="#7fcf7a" stroke-width="6" fill="none" stroke-linecap="round"/>` + flower(-46, 10, 13, '#ff9ecb') + flower(-24, -2, 14, '#fff') + flower(0, -8, 16, '#ff7aa8') + flower(24, -2, 14, '#c9a2ff') + flower(46, 10, 13, '#ffd36e', '#ff9e3d'),
  halo: () => `<path d="M-56,18 Q0,-26 56,18" stroke="${GOLD}" stroke-width="3" fill="none"/>` + [[-52, 14, 8], [-30, -2, 10], [0, -10, 14], [30, -2, 10], [52, 14, 8]].map(([x, y, r]) => star(x, y, r, '#ffe27a', 'stroke="#f5a623" stroke-width="1.5"')).join(''),
  heart: () => `<path d="M-48,10 Q0,-10 48,10" stroke="#ffd6e8" stroke-width="6" fill="none" stroke-linecap="round"/>` + heart(0, -14, 26, '#ff5c8a') + heart(-28, -2, 13, '#ff9ecb') + heart(28, -2, 13, '#ff9ecb') + `<circle cx="-6" cy="-18" r="4" fill="#fff" opacity=".7"/>`,
  ice: () => `<path d="M-44,12 L-40,-22 L-28,-2 L-16,-36 L-6,-4 L0,-46 L6,-4 L16,-36 L28,-2 L40,-22 L44,12Z" fill="#bfe9ff" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><path d="M-44,12 Q0,2 44,12" stroke="#8fd3ff" stroke-width="6" fill="none"/>` + gem(0, 6, 5, '#fff'),
};
const CLIP = {
  bow: () => bow(268, 112, 20, '#ff6fa8'),
  flower: () => flower(270, 116, 18, '#fff', '#ffc94d'),
  stars: () => star(266, 104, 11, '#ffe27a') + star(284, 126, 8, '#ffe27a') + star(250, 92, 7, '#fff'),
  butterfly: () => `<g transform="translate(270,114) rotate(18)"><ellipse cx="-11" cy="-5" rx="12" ry="9" fill="#9d7bff"/><ellipse cx="11" cy="-5" rx="12" ry="9" fill="#9d7bff"/><ellipse cx="-8" cy="8" rx="8" ry="7" fill="#ff9ecb"/><ellipse cx="8" cy="8" rx="8" ry="7" fill="#ff9ecb"/><rect x="-2" y="-10" width="4" height="22" rx="2" fill="#4b3a8f"/></g>`,
  band: () => `<path d="M108,150 Q200,34 292,150" stroke="#ff8fc0" stroke-width="10" fill="none" stroke-linecap="round"/>` + bow(262, 96, 15, '#ff5c8a'),
  pearls: () => [[236, 84], [254, 94], [270, 108], [282, 126]].map(([x, y]) => gem(x, y, 5.5, '#fff')).join(''),
};
const EAR = {
  pearl: x => gem(x, 196, 6, '#fff'),
  drop: x => `<path d="M${x},192 l5,12 a5.5,5.5 0 1 1 -10,0Z" fill="#6fd0ff"/><circle cx="${x - 1.5}" cy="204" r="1.8" fill="#fff"/>`,
  star: x => star(x, 200, 8.5, '#ffe27a', 'stroke="#f5a623" stroke-width="1"'),
  hoop: x => `<circle cx="${x}" cy="202" r="9" fill="none" stroke="${GOLD}" stroke-width="3.5"/>`,
  heart: x => heart(x, 201, 11, '#ff5c8a'),
};
const NECK = {
  pearls: () => { let o = ''; for (let i = 0; i <= 8; i++) { const t = i / 8; o += gem(f1(178 + 44 * t), f1(283 + 19 * Math.sin(Math.PI * t)), 3.8, '#fff'); } return o; },
  heart: () => `<path d="M180,282 Q200,308 220,282" stroke="${GOLD}" stroke-width="2.2" fill="none"/>` + heart(200, 302, 10, '#ff4f8b'),
  choker: () => `<path d="M186,268 Q200,277 214,268" stroke="#7a5cf0" stroke-width="7" fill="none"/>` + gem(200, 273, 5, '#9fe8ff'),
  star: () => `<path d="M180,282 Q200,308 220,282" stroke="#e9eefc" stroke-width="2.2" fill="none"/>` + star(200, 303, 9, '#ffe27a', 'stroke="#f5a623" stroke-width="1"'),
};
const SHOE = {
  flats: x => `<ellipse cx="${x}" cy="648" rx="14" ry="9" fill="#ff8fc0"/>` + bow(x, 644, 7, '#fff'),
  glass: x => `<ellipse cx="${x}" cy="648" rx="15" ry="9.5" fill="#bfe9ff" opacity=".85" stroke="#fff" stroke-width="2"/><ellipse cx="${x - 4}" cy="645" rx="4" ry="2" fill="#fff"/>` + star(x + 6, 642, 4, '#fff'),
  ballet: x => `<path d="M${x - 8},600 L${x + 8},622 M${x + 8},600 L${x - 8},622 M${x - 8},622 L${x + 8},640 M${x + 8},622 L${x - 8},640" stroke="#ffb3d1" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="${x}" cy="648" rx="14" ry="9" fill="#ffb3d1"/>`,
  heels: x => `<ellipse cx="${x}" cy="648" rx="14" ry="8.5" fill="${GOLD}"/><path d="M${x - 9},634 L${x + 9},634" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>` + gem(x, 646, 3.5, '#ff6fa8'),
  boots: x => `<path d="M${x - 11},592 L${x + 11},592 L${x + 12},650 Q${x},662 ${x - 14},650Z" fill="#b79bff"/><rect x="${x - 13}" y="586" width="26" height="12" rx="6" fill="#fff"/>` + star(x, 624, 5, '#fff'),
  sneakers: x => `<ellipse cx="${x}" cy="648" rx="15" ry="10" fill="#fff"/><path d="M${x - 15},650 a15,9 0 0 0 30,0Z" fill="#ff8fc0"/>` + star(x, 644, 4, '#9d7bff'),
};
const wingGrad = (a, b) => { const id = uid(); return [`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`, `url(#${id})`]; };
const WING = {
  fairy: () => { const [d, f] = wingGrad('#ffd1f0', '#b9c8ff'); return d + mirror(`<path d="M196,330 C150,210 40,180 26,250 C16,320 110,356 196,344Z" fill="${f}" stroke="#fff" stroke-width="3" opacity=".92"/><path d="M196,348 C140,352 66,386 80,446 C100,486 172,424 196,362Z" fill="${f}" stroke="#fff" stroke-width="3" opacity=".85"/>`); },
  butterfly: () => { const [d, f] = wingGrad('#ff8fc0', '#9d7bff'); return d + mirror(`<path d="M196,326 C170,180 30,150 14,240 C2,330 110,372 196,346Z" fill="${f}" stroke="#fff" stroke-width="3"/><path d="M196,350 C130,360 40,400 62,470 C90,520 180,450 196,366Z" fill="${f}" stroke="#fff" stroke-width="3"/><circle cx="70" cy="250" r="16" fill="#fff" opacity=".6"/><circle cx="110" cy="290" r="9" fill="#ffe27a" opacity=".8"/><circle cx="92" cy="440" r="11" fill="#fff" opacity=".6"/>`); },
  angel: () => mirror(`<path d="M196,330 C150,230 80,170 30,176 C40,200 34,214 22,226 C40,238 40,254 30,268 C52,274 56,290 50,306 C74,304 84,318 82,334 C106,326 120,338 122,354 C150,340 180,346 196,350Z" fill="#fff" stroke="#e3e8ff" stroke-width="3" stroke-linejoin="round"/><path d="M60,214 Q110,250 170,320 M70,262 Q120,290 176,334" stroke="#e3e8ff" stroke-width="3" fill="none"/>`),
  crystal: () => { const [d, f] = wingGrad('#d6f6ff', '#8fd3ff'); return d + mirror(`<path d="M196,326 C120,270 40,200 6,214 C0,260 110,330 196,344Z" fill="${f}" stroke="#fff" stroke-width="2.5" opacity=".85"/><path d="M196,350 C130,352 50,400 30,440 C70,460 160,400 196,362Z" fill="${f}" stroke="#fff" stroke-width="2.5" opacity=".75"/><path d="M30,222 L170,330 M60,236 L100,290" stroke="#fff" stroke-width="2" opacity=".8"/>`); },
};
const CAPE_D = 'M162,296 C92,360 60,540 68,640 Q200,672 332,640 C340,540 308,360 238,296Z';
const capeBack = (inner, fill) => { const cid = uid(); return `<clipPath id="${cid}"><path d="${CAPE_D}"/></clipPath><path d="${CAPE_D}" fill="${fill}"/><g clip-path="url(#${cid})">${inner}</g>`; };
const CAPE = {
  royal: { back: () => capeBack(`<path d="M68,616 Q200,650 332,616 L332,680 L68,680Z" fill="${GOLD}"/>`, '#7a5cf0'), clasp: () => gem(200, 296, 7, GOLD) },
  night: { back: () => capeBack([[110, 420], [150, 520], [250, 470], [290, 560], [200, 600], [100, 590], [280, 400], [230, 560]].map(([x, y], i) => star(x, y, i % 2 ? 7 : 10, '#ffe27a')).join(''), '#3b3a8f'), clasp: () => star(200, 296, 9, '#ffe27a') },
  petal: { back: () => capeBack([80, 120, 160, 200, 240, 280, 320].map(x => `<circle cx="${x}" cy="648" r="24" fill="#ffd1e6"/>`).join(''), '#ff8fc0'), clasp: () => flower(200, 296, 10, '#fff') },
  rainbow: { back: () => capeBack(['#ff8fa3', '#ffb07a', '#ffe27a', '#a8e26b', '#7fd4ff', '#b79bff'].map((c, i) => `<rect x="${60 + i * 46}" y="280" width="47" height="400" fill="${c}"/>`).join(''), '#fff'), clasp: () => heart(200, 296, 12, '#ff5c8a') },
  snow: { back: () => capeBack([70, 104, 138, 172, 206, 240, 274, 308, 336].map(x => `<circle cx="${x}" cy="644" r="20" fill="#fff"/>`).join('') + `<circle cx="120" cy="500" r="5" fill="#fff"/><circle cx="270" cy="460" r="5" fill="#fff"/><circle cx="240" cy="570" r="5" fill="#fff"/>`, '#bfe6ff'), clasp: () => gem(200, 296, 7, '#fff') },
};
const WAND = {
  star: () => `<line x1="0" y1="14" x2="0" y2="-62" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` + star(0, -76, 20, '#ffe27a', 'stroke="#f5a623" stroke-width="2"') + star(18, -98, 5, '#fff') + star(-20, -92, 4, '#fff'),
  heart: () => `<line x1="0" y1="14" x2="0" y2="-60" stroke="#ffd1e6" stroke-width="5" stroke-linecap="round"/>` + heart(0, -76, 28, '#ff5c8a') + `<path d="M-2,-58 q-12,10 -6,24 M2,-58 q12,10 6,24" stroke="#ff9ecb" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  moon: () => `<line x1="0" y1="14" x2="0" y2="-58" stroke="#d6d4ff" stroke-width="5" stroke-linecap="round"/><path d="M6,-98 A22,22 0 1 0 6,-56 A17,17 0 1 1 6,-98Z" fill="#ffe9a8" stroke="#f5c84b" stroke-width="2"/>` + star(10, -77, 6, '#fff'),
  flower: () => `<line x1="0" y1="14" x2="0" y2="-58" stroke="#7fcf7a" stroke-width="5" stroke-linecap="round"/><path d="M0,-30 q14,-8 16,-20 q-12,2 -16,14Z" fill="#7fcf7a"/>` + flower(0, -74, 22, '#ff9ecb'),
};
const BAG = {
  heart: () => `<path d="M-13,8 Q0,-16 13,8" stroke="${GOLD}" stroke-width="3" fill="none"/>` + heart(0, 26, 30, '#ff6fa8') + gem(0, 12, 4, GOLD),
  shell: () => `<path d="M-13,8 Q0,-16 13,8" stroke="#fff" stroke-width="3" fill="none"/><path d="M-24,36 A24,26 0 0 1 24,36 Q0,50 -24,36Z" fill="#ffd1e6" stroke="#ffb3d1" stroke-width="2"/><path d="M0,12 L0,42 M-12,16 L-5,42 M12,16 L5,42" stroke="#ffb3d1" stroke-width="2"/>`,
  star: () => `<path d="M-13,8 Q0,-16 13,8" stroke="#9d7bff" stroke-width="3" fill="none"/><rect x="-22" y="8" width="44" height="36" rx="10" fill="#b79bff"/>` + star(0, 26, 11, '#ffe27a'),
  kitty: () => `<path d="M-13,8 Q0,-16 13,8" stroke="#ff9ecb" stroke-width="3" fill="none"/><path d="M-20,12 l4,-12 l10,8Z M20,12 l-4,-12 l-10,8Z" fill="#fff"/><ellipse cx="0" cy="28" rx="24" ry="20" fill="#fff"/><circle cx="-8" cy="25" r="2.6" fill="#4b2a6b"/><circle cx="8" cy="25" r="2.6" fill="#4b2a6b"/><ellipse cx="0" cy="32" rx="3" ry="2" fill="#ff8fc0"/><ellipse cx="-15" cy="32" rx="4" ry="2.5" fill="#ffc2dc"/><ellipse cx="15" cy="32" rx="4" ry="2.5" fill="#ffc2dc"/>`,
};

function dressParts(s, P) {
  const D = s.dress === 'custom' ? { k: s.dKind || 'ball', sl: s.dSleeve || 'puff', c: [s.dColor || '#ff8fc0', s.dColor2 || '#ffd1e6'], deco: s.dTrim || 'none', pat: s.dPattern } : DMAP[s.dress] || DRESSES[0];
  let [a, b, t] = D.c;
  if (s.dressColor && s.dress !== 'custom') { a = s.dressColor; b = mix(a, '#ffffff', .6); }
  t = t || '#ffffff';
  const id = uid(), cid = uid(), dk = shade(a, -.2), fill = `url(#${id})`, sc = mix(a, '#ffffff', .32);
  let u = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`, o = '', sil = '';
  const hem = d => `<path d="${d}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 11" opacity=".9"/>`;
  const long = !['short', 'tutu', 'casual', 'pants'].includes(D.k);
  if (s.tailOn) sil = 'M172,366 H228 V382 H172Z';      // a mermaid wears only the top; her tail replaces the skirt
  else switch (D.k) {
    case 'ball': sil = 'M172,370 C118,430 68,556 60,622 Q200,660 340,622 C332,556 282,430 228,370Z';
      u += `<path d="${sil}" fill="${fill}"/><path d="M190,372 C172,460 162,560 160,640 Q200,648 240,640 C238,560 228,460 210,372Z" fill="${t}" opacity=".38"/>` + hem('M68,612 Q200,648 332,612'); break;
    case 'aline': sil = 'M174,370 C150,440 120,540 106,616 Q200,644 294,616 C280,540 250,440 226,370Z';
      u += `<path d="${sil}" fill="${fill}"/>` + hem('M112,606 Q200,632 288,606'); break;
    case 'mermaid': sil = 'M174,370 C158,440 164,520 172,560 C140,590 116,616 104,636 Q200,662 296,636 C284,616 260,590 228,560 C236,520 242,440 226,370Z';
      u += `<path d="${sil}" fill="${fill}"/><path d="M172,560 Q200,574 228,560" stroke="${dk}" stroke-width="3" fill="none" opacity=".5"/>` + hem('M112,628 Q200,652 288,628'); break;
    case 'short': sil = 'M174,370 C140,400 116,452 110,490 Q200,516 290,490 C284,452 260,400 226,370Z';
      u += `<path d="${sil}" fill="${fill}"/>` + hem('M116,482 Q200,506 284,482'); break;
    case 'tier': sil = 'M172,372 C130,450 96,560 88,628 Q200,656 312,628 C304,560 270,450 228,372Z';
      u += `<path d="${sil}" fill="${b}"/><path d="M172,372 C140,430 112,500 104,552 Q200,578 296,552 C288,500 260,430 228,372Z" fill="${mix(a, b, .5)}"/><path d="M172,372 C150,410 130,450 122,478 Q200,502 278,478 C270,450 250,410 228,372Z" fill="${a}"/>` + hem('M128,470 Q200,492 272,470') + hem('M110,544 Q200,568 290,544') + hem('M94,620 Q200,646 306,620'); break;
    case 'tutu': sil = 'M174,370 C128,396 92,440 86,474 Q200,506 314,474 C308,440 272,396 226,370Z';
      u += `<path d="${sil}" fill="${b}" opacity=".9"/><path d="M174,370 C136,392 108,428 102,456 Q200,484 298,456 C292,428 264,392 226,370Z" fill="${mix(a, b, .5)}" opacity=".92"/><path d="M174,370 C146,388 124,414 120,436 Q200,460 280,436 C276,414 254,388 226,370Z" fill="${a}"/>` + hem('M92,466 Q200,496 308,466'); break;
    case 'casual': sil = 'M174,372 C146,400 124,446 118,480 Q200,504 282,480 C276,446 254,400 226,372Z';
      u += `<path d="${sil}" fill="${a}"/><path d="M150,440 Q200,456 250,440" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>`; break;
    case 'pants': sil = 'M172,370 C158,400 150,426 148,444 Q200,462 252,444 C250,426 242,400 228,370Z';
      u += `<path d="M186,396 L184,630 M214,396 L216,630" stroke="${b}" stroke-width="22" stroke-linecap="round"/><path d="${sil}" fill="${fill}"/>`; break;
  }
  if (D.deco && D.deco !== 'none' && D.deco !== 'bow') {
    const pts = long ? [[150, 470], [252, 500], [118, 566], [205, 548], [283, 580], [168, 606], [236, 436]] : [[158, 424], [242, 432], [200, 462], [140, 462], [262, 466]];
    const drawOne = { stars: ([x, y], i) => star(x, y, i % 2 ? 6 : 8, '#fff8c9'), hearts: ([x, y], i) => heart(x, y, i % 2 ? 9 : 12, t === '#ffffff' ? '#fff' : t, 'opacity=".9"'), flowers: ([x, y]) => flower(x, y, 9, t === '#ffffff' ? '#fff' : t), pearls: ([x, y]) => gem(x, y, 4, '#fff') }[D.deco] || (EMB[D.deco] ? ([x, y], i) => EMB[D.deco](x, y, i % 2 ? 8 : 11, D.c[2] || '#ffffff') : () => '');
    u += `<clipPath id="${cid}"><path d="${sil}"/></clipPath><g clip-path="url(#${cid})">${pts.map(drawOne).join('')}</g>`;
  }
  // bodice
  const top = D.k === 'casual' ? t : a;
  const bod = (D.sl === 'long' || D.sl === 'tee') ? 'M164,296 Q200,312 236,296 L228,376 Q200,382 172,376Z' : 'M166,302 Q184,314 200,306 Q216,314 234,302 L228,376 Q200,382 172,376Z';
  const pat = D.pat && D.pat !== 'none' ? dressPattern(D.pat, a) : null;   // designer patterns (salon.js)
  if (pat) u += pat[0] + `<path d="${sil}" fill="${pat[1]}"/>`;
  u += `<path d="${bod}" fill="${top}"/>` + (pat ? `<path d="${bod}" fill="${pat[1]}"/>` : '');
  if (D.sl === 'strap') u += `<path d="M175,306 L181,286 M225,306 L219,286" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`;
  if (D.k === 'casual') u += heart(200, 338, 16, a);
  u += `<path d="M171,366 Q200,374 229,366 L229,378 Q200,386 171,378Z" fill="${dk}"/>`;
  if (D.deco === 'bow') u += bow(200, 373, 15, mix(a, '#ffffff', .7));
  // sleeves (drawn over the arms)
  const arms = [P.L, P.R];
  if (D.sl === 'puff') o += arms.map(A => `<circle cx="${A[0][0] + (A[0][0] < 200 ? -4 : 4)}" cy="${A[0][1] + 4}" r="18" fill="${sc}"/>`).join('');
  if (D.sl === 'long' || D.sl === 'tee') { const n = D.sl === 'long' ? [58, 42] : [24, 76]; o += arms.map(A => `<path d="${armD(A)}" pathLength="100" fill="none" stroke="${top}" stroke-width="22" stroke-dasharray="${n[0]} ${n[1]}" stroke-dashoffset="-${n[1]}"/>`).join(''); }
  if (D.sl === 'off') o += `<path d="M150,300 Q200,320 250,300 L251,315 Q200,336 149,315Z" fill="${sc}"/>`;
  return { under: u, over: o };
}

function faceInner(s, p) {
  const sk = p.skin, ln = shade(sk, -.4), ink = '#3a2340', bq = { arch: 128, flat: 141 }[p.brow] || 135;
  let o = '';
  if (p.mark) o += `<circle cx="228" cy="222" r="2.600" fill="#3a2340" opacity=".8"/>`;
  if (p.freckles) o += [[150, 204], [158, 210], [166, 204], [234, 204], [242, 210], [250, 204]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${shade(sk, -.3)}" opacity=".7"/>`).join('');
  const bl = s.blush || mix(sk, '#ff7d9c', .4);
  o += mirror(`<ellipse cx="143" cy="213" rx="17" ry="10" fill="${bl}" opacity="${s.blush ? .62 : .32}"/>`);
  const ry = p.eyeRy, lidY = dx => { const t = (dx + 16) / 32; return (1 - t) ** 2 * 180 + 2 * t * (1 - t) * (183 - 2 * ry) + t * t * 180; };
  const lw = { natural: 2.6, soft: 3.6, bold: 5.6, wing: 4.4, cat: 5, jewel: 4.6 }[s.liner] || 2.6, lc = s.liner === 'jewel' ? '#7b4dff' : ink;
  for (const ex of [164, 236]) {
    const d = ex < 200 ? -1 : 1, id = uid();
    if (s.shadow) o += `<path d="M${ex - 20},179 Q${ex},${f1(150 - ry * 1.7)} ${ex + 20},179 Q${ex},${183 - 2 * ry} ${ex - 20},179Z" fill="${s.shadow}" opacity=".88"/>`;
    o += `<path d="M${ex - d * 14},146 Q${ex},${bq} ${ex + d * 16},143" stroke="${shade(s.hairColor, -.25)}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    o += `<g class="eye" style="transform-origin:${ex}px 182px"><clipPath id="${id}"><ellipse cx="${ex}" cy="181" rx="15" ry="${ry}"/></clipPath><ellipse cx="${ex}" cy="181" rx="15" ry="${ry}" fill="#fff"/><g clip-path="url(#${id})"><g class="iris"><circle cx="${ex}" cy="182" r="11.5" fill="${s.eyes}"/><circle cx="${ex}" cy="182" r="6" fill="#2a1a2e"/><circle cx="${ex - 4}" cy="177" r="3.6" fill="#fff"/><circle cx="${ex + 4}" cy="187" r="1.8" fill="#fff" opacity=".8"/></g></g>`;
    o += `<path d="M${ex - 16},180 Q${ex},${183 - 2 * ry} ${ex + 16},180" stroke="${lc}" stroke-width="${lw}" stroke-linecap="round" fill="none"/>`;
    if (s.liner === 'wing' || s.liner === 'jewel') o += `<path d="M${ex + d * 15},179 L${ex + d * 25},171" stroke="${lc}" stroke-width="${lw}" stroke-linecap="round"/>`;
    if (s.liner === 'cat') o += `<path d="M${ex + d * 14},180 L${ex + d * 30},166 L${ex + d * 17},174Z" fill="${ink}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`;
    if (s.liner === 'jewel') o += gem(ex + d * 27, 168, 3, '#9fe8ff');
    const lash = (dx, lx, ly, base) => { const y = base ?? lidY(dx); return `<path d="M${f1(ex + d * dx)},${f1(y)} L${f1(ex + d * (dx + lx))},${f1(y - ly)}" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`; };
    const L = s.lashes;
    if (L === 'sweet' || L === 'star') o += lash(8, 3, 7) + lash(12, 6, 6) + lash(15, 8, 3);
    if (L === 'flutter' || L === 'doll') o += lash(-8, -2, 7) + lash(-2, 0, 8) + lash(4, 2, 9) + lash(9, 4, 9) + lash(13, 7, 7) + lash(15.5, 9, 4);
    if (L === 'doll') o += lash(4, 1, -5, 181 + ry - 2) + lash(9, 3, -5, 181 + ry - 4) + lash(13, 5, -4, 181 + ry - 8);
    if (L === 'star') o += star(ex + d * 28, 170, 5, '#ffe27a');
    o += `</g>`;
  }
  const lips = s.lips || mix(sk, '#e0527a', .5);
  o += `<path d="M196,207 Q200,211 204,207" stroke="${ln}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".7"/>`;
  o += `<path d="M184,228 Q200,247 216,228 Q200,233 184,228Z" fill="${lips}"/><path d="M184,228 Q192,221 200,225 Q208,221 216,228 Q200,233 184,228Z" fill="${shade(lips, -.14)}"/><path d="M180,226 Q183,229 186,228 M220,226 Q217,229 214,228" stroke="${ln}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".6"/>`;
  if (s.lips) o += `<ellipse cx="204" cy="236" rx="4" ry="1.8" fill="#fff" opacity=".6"/>`;
  const deco = {
    stars: () => star(128, 196, 7, '#ffe27a') + star(136, 228, 5, '#fff') + star(272, 196, 7, '#ffe27a') + star(264, 228, 5, '#fff'),
    heart: () => heart(258, 212, 14, '#ff4f8b'),
    glitter: () => [[150, 204, '#fff'], [160, 209, '#ffe27a'], [170, 205, '#fff'], [142, 211, '#ffe27a'], [230, 205, '#fff'], [240, 209, '#ffe27a'], [250, 204, '#fff'], [258, 211, '#ffe27a']].map(([x, y, c]) => star(x, y, 3.6, c)).join(''),
    gem: () => gem(200, 150, 5.5, '#9fe8ff') + gem(188, 146, 2.8, '#ff9ecb') + gem(212, 146, 2.8, '#ff9ecb'),
    flower: () => flower(142, 212, 11, '#fff', '#ff8fc0'),
    butterfly: () => `<g transform="translate(262,206) rotate(-14)"><ellipse cx="-7" cy="-3" rx="8" ry="6" fill="#9d7bff"/><ellipse cx="7" cy="-3" rx="8" ry="6" fill="#9d7bff"/><ellipse cx="-5" cy="5" rx="5" ry="4.5" fill="#7fd4ff"/><ellipse cx="5" cy="5" rx="5" ry="4.5" fill="#7fd4ff"/><rect x="-1.5" y="-7" width="3" height="15" rx="1.5" fill="#4b3a8f"/></g>`,
    rainbow: () => mirror(['#ff8fa3', '#ffd36e', '#7fd4ff'].map((c, i) => `<path d="M${128 + i * 4},${218 - i} A${16 - i * 4},${16 - i * 4} 0 0 1 ${160 - i * 4},${218 - i}" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`).join('')),
  }[s.deco];
  return o + (deco ? deco() : '');
}

function dollInner(s, poseIdx) {
  const p = PMAP[s.princess], P = POSES[poseIdx ?? s.pose ?? 0] || POSES[0], sk = p.skin, skD = shade(sk, -.16);
  const hair = hairParts(s), dress = dressParts(s, P), arms = [P.L, P.R];
  // body
  let b = s.tailOn ? '' : `<path d="M186,396 L184,640 M214,396 L216,640" stroke="${sk}" stroke-width="18" stroke-linecap="round"/>` + (SHOE[s.shoes] || SHOE.flats)(184) + (SHOE[s.shoes] || SHOE.flats)(216);
  b += `<path d="M186,258 L186,282 Q172,286 164,298 L172,400 L228,400 L236,298 Q228,286 214,282 L214,258Z" fill="${sk}"/><path d="M186,262 Q200,278 214,262 L214,270 Q200,286 186,270Z" fill="${skD}" opacity=".45"/>`;
  b += dress.under + (s.tailOn ? tailSvg(s) : '');
  b += arms.map(A => `<path d="${armD(A)}" pathLength="100" fill="none" stroke="${sk}" stroke-width="19" stroke-linecap="round"/>`).join('');
  const gl = GLOVE[s.gloves];
  b += dress.over + stickersSvg(s);
  if (gl) b += arms.map(A => `<path d="${armD(A)}" pathLength="100" fill="none" stroke="${gl[1]}" stroke-width="21" stroke-linecap="round" stroke-dasharray="${gl[0]} 100"/>`).join('');
  if (s.bracelet !== 'none') { const c = { gold: GOLD, pearl: '#ffffff', rose: '#ff8fc0', charm: '#c9a2ff' }[s.bracelet]; b += arms.map(A => { const w = bz(A, .17); return `<path d="${armD(A)}" pathLength="100" fill="none" stroke="${c}" stroke-width="23" stroke-dasharray="5 95" stroke-dashoffset="-13"/>` + (s.bracelet === 'charm' ? star(f1(w[0]), f1(w[1] + 8), 6, '#ffe27a') : s.bracelet === 'pearl' ? gem(f1(w[0]), f1(w[1]), 3.5, '#e8ecff') : ''); }).join(''); }
  if (CAPE[s.cape]) b += `<path d="M164,300 Q200,286 236,300" stroke="${shade('#ffffff', 0)}" stroke-width="5" fill="none" opacity=".85"/>` + CAPE[s.cape].clasp();
  if (NECK[s.necklace]) b += NECK[s.necklace]();
  if (s.flower === 'lei') { for (let i = 0; i <= 6; i++) { const t = i / 6; b += flower(f1(166 + 68 * t), f1(298 + 26 * Math.sin(Math.PI * t)), 9, i % 2 ? '#fff' : '#ff9ecb'); } }
  if (s.flower === 'corsage') b += flower(238, 300, 15, '#ff9ecb') + flower(224, 314, 9, '#fff') + `<path d="M246,312 q12,4 14,16 q-12,-2 -14,-16Z" fill="#7fcf7a"/>`;
  if (s.flower === 'daisies') b += [174, 188, 202, 216, 228].map((x, i) => flower(x, 372 + (i % 2 ? 3 : 0), 8, '#fff')).join('');
  if (s.jewel === 'heart') b += heart(200, 334, 15, '#ff4f8b', `stroke="${GOLD}" stroke-width="2.5"`);
  if (s.jewel === 'star') b += star(200, 336, 12, '#ffe27a', 'stroke="#f5a623" stroke-width="1.5"');
  if (s.jewel === 'belt') b += [176, 188, 200, 212, 224].map((x, i) => gem(x, 372 + (i === 2 ? 2 : i % 2 ? 1 : 0), i === 2 ? 6 : 4.2, i % 2 ? '#9fe8ff' : '#ff9ecb')).join('');
  if (s.jewel === 'sparkle') b += [[150, 336, 6], [250, 330, 7], [130, 500, 8], [270, 520, 7], [200, 440, 9], [176, 580, 6], [232, 596, 7], [200, 346, 5]].map(([x, y, r]) => star(x, y, r, '#fff', 'stroke="#ffe27a" stroke-width="1"')).join('');
  const [LH, RH] = [P.L[2], P.R[2]];
  if (BAG[s.bag]) b += `<g transform="translate(${LH})">${BAG[s.bag]()}</g>`;
  if (WAND[s.wand]) b += `<g transform="translate(${RH}) rotate(${P.wr})">${WAND[s.wand]()}</g>`;
  b += arms.map(A => `<circle cx="${A[2][0]}" cy="${A[2][1]}" r="11" fill="${gl ? gl[1] : sk}"/>`).join('') + (gl ? '' : nailDots(s, arms));
  // head
  let h = mirror(`<ellipse cx="110" cy="180" rx="9" ry="14" fill="${sk}"/>`);
  h += `<path d="M112,152 C112,88 288,88 288,152 C288,218 246,264 200,264 C154,264 112,218 112,152Z" fill="${sk}"/>`;
  h += layer('face', faceFx(s, 0) + faceInner(s, p) + faceFx(s, 1)) + hair.front;
  if (EAR[s.earrings]) h += EAR[s.earrings](110) + EAR[s.earrings](290);
  if (s.flower === 'rose') h += `<path d="M96,150 q-16,4 -20,20 q16,0 20,-20Z" fill="#7fcf7a"/>` + flower(112, 138, 19, '#ff5c8a', '#ffb3c6');
  if (CLIP[s.hairAcc]) h += CLIP[s.hairAcc]();
  if (CROWN[s.crown]) h += `<g transform="translate(200,80)">${CROWN[s.crown]()}</g>`;
  h += hair.top;
  return layer('wings', WING[s.wings] ? WING[s.wings]() : '') + layer('cape', CAPE[s.cape] ? CAPE[s.cape].back() : '') + layer('hairback', hair.back) + layer('body', b) + layer('head', h);
}
const dollSvg = (s, vb = '0 0 400 700', pose) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${dollInner(s, pose)}</svg>`;

/* ---------- 4. scenes (viewBox 0 0 800 700) ---------- */
const vgrad = (stops) => { const id = uid(); return [`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`, `url(#${id})`]; };
const cloud = (x, y, s, o = 1) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="60" ry="22" fill="#fff"/><circle cx="-24" cy="-12" r="22" fill="#fff"/><circle cx="8" cy="-22" r="28" fill="#fff"/><circle cx="36" cy="-8" r="18" fill="#fff"/></g>`;
const SCENES = {
  studio: (t = '#ffd3e6') => { const [d, f] = vgrad([shade(t, .6), t]); let bulbs = ''; for (let i = 0; i <= 10; i++) { const a = Math.PI + Math.PI * i / 10; bulbs += `<circle cx="${f1(400 + Math.cos(a) * 186)}" cy="${f1(250 + Math.sin(a) * 186)}" r="9" fill="#fff6c9" stroke="#ffd36e" stroke-width="3"/>`; }
    return d + `<rect width="800" height="700" fill="${f}"/>` + [[70, 90], [170, 200], [650, 120], [730, 260], [90, 330], [700, 420], [620, 40], [150, 470]].map(([x, y], i) => star(x, y, i % 2 ? 7 : 10, '#fff', 'opacity=".7"')).join('') +
      `<path d="M235,612 V250 a165,165 0 0 1 330,0 V612Z" fill="#fff" opacity=".6"/><path d="M235,612 V250 a165,165 0 0 1 330,0 V612" fill="none" stroke="#ffd36e" stroke-width="10"/>${bulbs}` +
      `<rect y="604" width="800" height="96" fill="${shade(t, -.1)}"/><ellipse cx="400" cy="656" rx="240" ry="34" fill="#fff" opacity=".5"/>` +
      mirror(`<path d="M0,0 H130 C112,200 66,380 0,520Z" fill="${shade(t, -.2)}"/><path d="M0,0 H80 C70,180 40,340 0,460Z" fill="${shade(t, -.1)}" opacity=".7"/>`, 800); },
  ballroom: () => { const [d, f] = vgrad(['#fff3fa', '#ffd6ea']); const win = x => `<path d="M${x - 50},470 V230 a50,50 0 0 1 100,0 V470Z" fill="#cfeaff" stroke="#fff" stroke-width="8"/><path d="M${x},184 V470 M${x - 50},320 H${x + 50}" stroke="#fff" stroke-width="5"/>`;
    return d + `<rect width="800" height="700" fill="${f}"/>${win(150)}${win(650)}<path d="M300,520 V220 a100,100 0 0 1 200,0 V520Z" fill="#e3d5ff" stroke="#fff" stroke-width="8"/>` + star(400, 250, 26, '#fff', 'opacity=".8"') +
      mirror(`<rect x="40" y="110" width="44" height="470" fill="#fff"/><rect x="28" y="90" width="68" height="26" rx="8" fill="#ffe7b0"/><rect x="28" y="566" width="68" height="26" rx="8" fill="#ffe7b0"/><path d="M0,0 H250 Q170,70 96,60 Q40,120 0,150Z" fill="#c9a2ff"/>`, 800) +
      mirror(`<path d="M150,0 V96" stroke="${GOLD}" stroke-width="4"/><path d="M106,104 Q150,150 194,104Z" fill="${GOLD}"/>` + [114, 132, 150, 168, 186].map(x => `<circle cx="${x}" cy="104" r="7" fill="#fff6c9"/>`).join('') + gem(150, 140, 6, '#bfe9ff'), 800) +
      `<path d="M0,580 H800 V700 H0Z" fill="#f3c9ff"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 114 - 40},580 L${i * 114 + 17},580 L${i * 170 - 190},700 L${i * 170 - 275},700Z" fill="#fff" opacity=".45"/>`).join('') +
      `<path d="M330,580 L470,580 L580,700 L220,700Z" fill="#ff8fb8"/><path d="M346,580 L330,580 L220,700 L246,700Z M454,580 L470,580 L580,700 L554,700Z" fill="${GOLD}"/>`; },
  garden: () => { const [d, f] = vgrad(['#2b2a6b', '#6a57c4', '#c99be8']); return d + `<rect width="800" height="700" fill="${f}"/><circle cx="620" cy="130" r="92" fill="#fff6c9" opacity=".25"/><circle cx="620" cy="130" r="66" fill="#fff6c9"/><circle cx="600" cy="112" r="10" fill="#f3e3a0"/><circle cx="640" cy="150" r="14" fill="#f3e3a0"/>` +
      [[80, 70], [180, 140], [300, 60], [420, 120], [520, 40], [740, 260], [60, 250], [250, 230], [480, 250], [700, 60]].map(([x, y], i) => star(x, y, i % 3 ? 5 : 9, '#fff', 'opacity=".9"')).join('') +
      `<path d="M0,520 Q200,420 400,500 Q600,430 800,510 V700 H0Z" fill="#4c4a9e"/><path d="M0,580 Q400,520 800,580 V700 H0Z" fill="#6fcf97"/><path d="M340,584 Q400,570 460,584 L560,700 H240Z" fill="#ffe7b0"/>` +
      mirror(`<circle cx="60" cy="520" r="70" fill="#3fa37a"/><circle cx="150" cy="548" r="52" fill="#58bd8a"/>` + flower(50, 490, 13, '#ff9ecb') + flower(104, 530, 11, '#fff') + flower(160, 524, 12, '#ffd36e', '#ff9e3d') + flower(30, 560, 11, '#c9a2ff') + `<path d="M230,330 V600" stroke="#3b3a8f" stroke-width="6"/><circle cx="230" cy="320" r="34" fill="#ffe27a" opacity=".3"/><rect x="214" y="298" width="32" height="44" rx="12" fill="#ffe27a"/>`, 800) +
      `<path d="M0,180 Q200,260 400,190 Q600,260 800,180" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>` + [100, 200, 300, 400, 500, 600, 700].map((x, i) => `<circle cx="${x}" cy="${[216, 228, 216, 192, 216, 228, 216][i]}" r="9" fill="${['#ff9ecb', '#ffe27a', '#7fd4ff'][i % 3]}"/>`).join(''); },
  castle: () => { const [d, f] = vgrad(['#8fd3ff', '#d8c7ff', '#ffd6ea']); const tower = (x, y, w) => `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${560 - y}" fill="#fff"/><path d="M${x - w / 2 - 8},${y} L${x},${y - w * 1.3} L${x + w / 2 + 8},${y}Z" fill="#ff9ecb"/><rect x="${x - 8}" y="${y + 24}" width="16" height="26" rx="8" fill="#c9a2ff"/>`;
    return d + `<rect width="800" height="700" fill="${f}"/>` + ['#ff8fa3', '#ffd36e', '#a8e26b', '#7fd4ff', '#b79bff'].map((c, i) => `<path d="M${40 + i * 16},600 A${360 - i * 16},${360 - i * 16} 0 0 1 ${760 - i * 16},600" stroke="${c}" stroke-width="16" fill="none" opacity=".75"/>`).join('') +
      tower(250, 300, 60) + tower(550, 300, 60) + tower(400, 210, 90) + `<rect x="250" y="400" width="300" height="160" fill="#fff"/><path d="M366,560 V470 a34,34 0 0 1 68,0 V560Z" fill="#c9a2ff"/>` + [270, 310, 350, 430, 470, 510].map(x => `<rect x="${x}" y="384" width="22" height="20" fill="#fff"/>`).join('') +
      cloud(120, 150, 1.1, .9) + cloud(680, 110, .9, .9) + cloud(600, 300, .7, .7) + cloud(150, 560, 2, 1) + cloud(420, 600, 2.4, 1) + cloud(690, 570, 2, 1) + `<rect y="610" width="800" height="90" fill="#fff"/>` + star(90, 300, 9, '#fff') + star(720, 420, 8, '#fff') + star(330, 90, 7, '#fff'); },
};
const sceneSvg = (id, arg) => `<svg viewBox="0 0 800 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${(SCENES[id] || SCENES.ballroom)(arg)}</svg>`;
SCENES.catwalk = () => { const [d, f] = vgrad(['#2b1b5e', '#6f4bc4', '#ff9ecb']); return d + `<rect width="800" height="700" fill="${f}"/>` + [[90, 90], [230, 50], [560, 60], [710, 110], [400, 36], [150, 230], [660, 250]].map(([x, y], i) => star(x, y, i % 2 ? 6 : 10, '#fff', 'opacity=".85"')).join('') +
  mirror(`<path d="M70,0 H210 L430,580 H250Z" fill="#fff" opacity=".12"/><path d="M0,0 H150 C130,180 80,330 0,440Z" fill="#ff5c8a"/><path d="M0,0 H90 C80,160 50,290 0,380Z" fill="#ff8fb8" opacity=".8"/><circle cx="140" cy="20" r="26" fill="#ffe27a"/>`, 800) +
  `<rect y="560" width="800" height="140" fill="#3b2a7a"/><path d="M310,560 H490 L640,700 H160Z" fill="#ff8fc0"/><path d="M310,560 H326 L186,700 H160Z M490,560 H474 L614,700 H640Z" fill="#fff" opacity=".7"/>` +
  [0, 1, 2, 3, 4].map(i => `<circle cx="${302 - i * 30}" cy="${572 + i * 30}" r="${6 + i}" fill="#ffe27a"/><circle cx="${498 + i * 30}" cy="${572 + i * 30}" r="${6 + i}" fill="#ffe27a"/>`).join('') +
  mirror([[40, 690], [100, 700], [10, 640]].map(([x, y]) => `<circle cx="${x}" cy="${y - 50}" r="26" fill="#241552"/><rect x="${x - 34}" y="${y - 30}" width="68" height="80" rx="30" fill="#241552"/>`).join(''), 800); };
const SHOW_SCENES = [{ id: 'catwalk', name: 'Catwalk' }, { id: 'ballroom', name: 'Ballroom' }, { id: 'garden', name: 'Moon garden' }, { id: 'castle', name: 'Cloud castle' }];

/* ---------- studio definitions ---------- */
const STUDIOS = {
  makeup: { title: 'Makeup studio', zoom: 'face', tint: '#ffd3e6', tabs: [
    { key: 'lips', label: '💄 Lipstick', colors: PAL.lips, fx: [200, 232] },
    { key: 'shadow', label: '🎨 Eyeshadow', colors: PAL.shadow, fx: [200, 165] },
    { key: 'blush', label: '🌸 Blush', colors: PAL.blush, fx: [200, 212] },
    { key: 'liner', label: '✏️ Eyeliner', items: LINERS, vb: '132 148 64 50', fx: [200, 178] },
    { key: 'lashes', label: '🪶 Lashes', items: LASHES, vb: '132 148 64 50', fx: [200, 178] },
    { key: 'eyes', label: '👁️ Eye colour', colors: PAL.eyes, fx: [200, 182], noMixNone: true },
    { key: 'deco', label: '⭐ Face art', items: DECOS, vb: '100 96 200 176', fx: [200, 205] },
  ] },
  hair: { title: 'Hair studio', zoom: 'hair', tint: '#e2d4ff', tabs: [
    { key: 'hair', label: '💇 Style', items: HAIRS, vb: '30 0 340 480', fx: [200, 110] },
    { key: 'hairColor', label: '🌈 Colour', colors: PAL.hairColor, fx: [200, 100] },
    { key: 'hairAcc', label: '🎀 Clips', items: CLIPS, vb: '70 20 260 260', fx: [268, 112] },
    { key: 'crown', label: '👑 Crowns', items: CROWNS, vb: '70 10 260 260', fx: [200, 70] },
  ] },
  dress: { title: 'Dress up studio', zoom: 'full', tint: '#cfe6ff', tabs: [
    { key: 'dress', label: '👗 Dresses', items: DRESSES, vb: '40 262 320 400', fx: [200, 460] },
    { key: 'dressColor', label: '🎨 Dress colour', colors: PAL.dressColor, fx: [200, 460], noneLabel: 'Original colours' },
    { key: 'shoes', label: '👠 Shoes', items: SHOES, vb: '150 578 100 86', clean: { dress: 'berry' }, fx: [200, 640] },
    { key: 'gloves', label: '🧤 Gloves', items: GLOVES, vb: '86 296 110 160', fx: [200, 420] },
    { key: 'necklace', label: '📿 Necklaces', items: NECKS, vb: '150 244 100 86', fx: [200, 292] },
    { key: 'earrings', label: '💎 Earrings', items: EARS, vb: '84 150 70 70', fx: [200, 200] },
    { key: 'bracelet', label: '✨ Bracelets', items: BRACES, vb: '100 390 70 70', clean: { gloves: 'none', bag: 'none' }, fx: [200, 430] },
    { key: 'wings', label: '🦋 Wings', items: WINGL, vb: '0 130 400 400', fx: [200, 330] },
    { key: 'crown', label: '👑 Crowns', items: CROWNS, vb: '70 10 260 260', fx: [200, 70] },
  ] },
  extras: { title: 'Accessories studio', zoom: 'full', tint: '#d5f5e9', tabs: [
    { key: 'wand', label: '🪄 Magic wands', items: WANDS, vb: '210 320 130 140', fx: [280, 380] },
    { key: 'bag', label: '👜 Handbags', items: BAGS, vb: '84 410 100 100', fx: [134, 460] },
    { key: 'flower', label: '🌷 Flowers', items: FLOWERS, vb: '60 90 280 310', fx: [200, 300] },
    { key: 'jewel', label: '💎 Sparkly jewels', items: JEWELS, vb: '110 280 180 180', fx: [200, 350] },
    { key: 'crown', label: '👑 Royal crowns', items: CROWNS, vb: '70 10 260 260', fx: [200, 70] },
    { key: 'cape', label: '🧚 Magic capes', items: CAPEL, vb: '20 250 360 420', fx: [200, 480] },
  ] },
};
const ORDER = ['world', 'choose', 'kingdom', 'salon', 'fashion', 'spa', 'cut', 'hair', 'makeup', 'facial', 'nails', 'designer', 'dress', 'extras', 'runway', 'tail', 'pets', 'petcare', 'castle', 'events', 'prep', 'eventfit', 'party', 'gallery', 'art'];

/* ---------- 5. state & sound ---------- */
const KEY = 'moonpetal-salon-v1';
const freshLook = p => ({ princess: p.id, lips: null, shadow: null, blush: null, liner: 'natural', lashes: 'sweet', eyes: p.eyes, deco: 'none', hair: p.hair, hairColor: p.hairColor, hairAcc: 'none', crown: 'none', dress: p.dress, dressColor: null, shoes: 'flats', gloves: 'none', necklace: 'none', earrings: 'none', bracelet: 'none', wings: 'none', cape: 'none', wand: 'none', bag: 'none', flower: 'none', jewel: 'none', pose: 0, scene: 'ballroom',
  // shared salon state: cut lengths per strand, fringe, texture, hairdo, colour effects, skin, nails, own dress design
  hairLen: null, bangLen: null, hairTex: null, hairDo: null, hairVol: 0, hairFx: 'solid', hairColor2: null, hairShine: false, glow: false, nails: null,
  dKind: null, dSleeve: null, dColor: null, dColor2: null, dPattern: 'none', dTrim: 'none', dStick: [], pet: null,
  // mermaid tail (tail.js)
  tailOn: false, tailC: '#5fd3c8', tailC2: '#8f8bff', tailC3: '#ff9ecb', tailGrad: 'two', tailPat: 'scales', tailPat2: 'none', tailPC: '#ffffff', tailScales: null, tailStick: [],
  finShape: 'classic', finC: null, finC2: null, finLook: 'solid', tailFx: 'none', ...(p.look || {}) });
const lookOf = id => ({ ...freshLook(PMAP[id]), ...(save.looks[id] || {}) });
/* one save for the whole world: looks per princess, plus stars, discoveries, pets, castle rooms and the gallery */
let save = { muted: false, current: null, stage: 'world', looks: {}, mixes: {}, stars: 0, found: {}, pets: {}, castle: {}, gallery: [], evDone: {}, kingdom: null };
const cleanDeep = (v, d = 0) => { if (v === null || typeof v === 'number' || typeof v === 'boolean') return v; if (typeof v === 'string') return /^#?[\w-]{1,24}$/.test(v) ? v : null; if (d > 5 || typeof v !== 'object') return null; if (Array.isArray(v)) return v.slice(0, 200).map(x => cleanDeep(x, d + 1)); const o = {}; for (const [k, x] of Object.entries(v)) if (/^[\w-]{1,24}$/.test(k)) o[k] = cleanDeep(x, d + 1); return o; };
let S = null;                       // the look being edited
const ui = { tab: {}, mixTab: null, mixPick: [], tool: null, entry: null, nail: { mode: 'polish', color: '#ff5c8a', st: 'heart' } };

function loadSave() { try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object') save = { ...save, ...j }; } catch (e) { /* storage unavailable: play without saving */ }
  // saved values end up inside SVG markup, so keep only plain ids, numbers and hex colours
  const ok1 = v => v === null || typeof v === 'number' || typeof v === 'boolean' || (typeof v === 'string' && /^#?[\w-]{1,24}$/.test(v));
  const ok = v => ok1(v) || (Array.isArray(v) && v.length <= 60 && v.every(ok1));
  const looks = {}; for (const [id, look] of Object.entries(save.looks || {})) if (PMAP[id] && look && typeof look === 'object') looks[id] = Object.fromEntries(Object.entries(look).filter(([k, v]) => k !== 'princess' && ok(v)));
  const mixes = {}; for (const [k, list] of Object.entries(save.mixes || {})) if (Array.isArray(list)) mixes[k] = list.filter(c => /^#[0-9a-f]{6}$/i.test(c));
  save.looks = looks; save.mixes = mixes; save.muted = !!save.muted;
  save.stars = Math.max(0, Math.min(9999, Math.floor(+save.stars || 0)));
  for (const k of ['found', 'pets', 'castle', 'evDone']) { const c = cleanDeep(save[k]); save[k] = c && typeof c === 'object' && !Array.isArray(c) ? c : {}; }
  save.gallery = (Array.isArray(save.gallery) ? save.gallery : []).filter(g => g && typeof g === 'object' && PMAP[g.p] && typeof g.id === 'number' && g.look && typeof g.look === 'object').slice(-24)
    .map(g => ({ id: g.id, p: g.p, scene: cleanDeep(g.scene), look: Object.fromEntries(Object.entries(g.look).filter(([k, v]) => k !== 'princess' && ok(v))) }));
  save.kingdom = cleanDeep(save.kingdom);
  if (!PMAP[save.current]) { save.current = null; save.stage = 'choose'; } if (!ORDER.includes(save.stage)) save.stage = 'world'; }
function persist() { if (S) save.looks[S.princess] = S; try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } }

let AC = null;
function tone(f, at = 0, dur = .25, type = 'sine', vol = .1) {
  if (save.muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + at;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + .05);
  } catch (e) { /* no audio available */ }
}
const sfx = {
  tap: () => tone(620, 0, .1, 'triangle', .07),
  pick: () => [880, 1175, 1568].forEach((f, i) => tone(f, i * .06, .32)),
  magic: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * .05, .4)),
  pour: () => { tone(300, 0, .18, 'sine', .09); tone(450, .08, .2, 'sine', .08); },
  fanfare: () => [[523, 0], [659, .14], [784, .28], [1047, .42], [784, .62], [1047, .76], [1319, .9], [1568, 1.1]].forEach(([f, t]) => { tone(f, t, .5, 'triangle', .09); tone(f * 2, t, .4, 'sine', .04); }),
};

/* screens & interactions: see ui.js · new salon activities: salon.js */
