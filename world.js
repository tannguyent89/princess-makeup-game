'use strict';
/* =====================================================================
   Magical Princess World
   1. emblems (one little drawing per kingdom, reused everywhere)
   2. kingdoms + their palaces and backdrops
   3. the new princesses, fashion collections, crowns, wands, hairstyles
   4. magical stars and what they open
   5. world map, kingdom pages
   ===================================================================== */

/* ---------- 1. emblems ---------- */
const EMB = {
  ice: (x, y, r, c = '#8fd3ff') => `<g transform="translate(${x},${y})" stroke="${c}" stroke-width="${f1(r * .2)}" stroke-linecap="round" fill="none">${[0, 60, 120].map(a => `<path transform="rotate(${a})" d="M0,${f1(-r)} V${f1(r)} M${f1(-r * .32)},${f1(-r * .66)} L0,${f1(-r * .4)} L${f1(r * .32)},${f1(-r * .66)} M${f1(-r * .32)},${f1(r * .66)} L0,${f1(r * .4)} L${f1(r * .32)},${f1(r * .66)}"/>`).join('')}</g>`,
  rose: (x, y, r, c = '#ff5c8a') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${f1(x - r * .15)}" cy="${f1(y - r * .1)}" r="${f1(r * .62)}" fill="${shade(c, .28)}"/><circle cx="${f1(x + r * .1)}" cy="${f1(y + r * .05)}" r="${f1(r * .3)}" fill="${shade(c, -.14)}"/>`,
  ocean: (x, y, r, c = '#ff9ecb') => `<path d="M${f1(x - r)},${f1(y + r * .3)} A${r},${r} 0 0 1 ${f1(x + r)},${f1(y + r * .3)} Q${x},${f1(y + r * 1.1)} ${f1(x - r)},${f1(y + r * .3)}Z" fill="${c}"/><path d="M${x},${f1(y + r * .6)} V${f1(y - r * .6)} M${x},${f1(y + r * .6)} L${f1(x - r * .55)},${f1(y - r * .3)} M${x},${f1(y + r * .6)} L${f1(x + r * .55)},${f1(y - r * .3)}" stroke="${shade(c, -.2)}" stroke-width="${f1(r * .12)}" fill="none" stroke-linecap="round"/>`,
  forest: (x, y, r, c = '#58bd8a') => `<path d="M${x},${f1(y - r)} Q${f1(x + r)},${f1(y - r * .1)} ${x},${f1(y + r)} Q${f1(x - r)},${f1(y - r * .1)} ${x},${f1(y - r)}Z" fill="${c}"/><path d="M${x},${f1(y - r * .6)} V${f1(y + r)}" stroke="${shade(c, -.25)}" stroke-width="${f1(r * .14)}" stroke-linecap="round"/>`,
  sun: (x, y, r, c = '#ffc94d') => `<g transform="translate(${x},${y})">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path transform="rotate(${a})" d="M0,${f1(-r * .7)} V${f1(-r)}" stroke="${c}" stroke-width="${f1(r * .2)}" stroke-linecap="round"/>`).join('')}<circle r="${f1(r * .5)}" fill="${c}"/></g>`,
  star: (x, y, r, c = '#ffe27a') => star(x, y, r, c),
  cherry: (x, y, r, c = '#ffb7d5') => flower(x, y, r, c, '#ff6fa8'),
  butterfly: (x, y, r, c = '#b79bff') => `<g transform="translate(${x},${y}) scale(${f1(r / 12)})"><ellipse cx="-7" cy="-3" rx="8" ry="6" fill="${c}"/><ellipse cx="7" cy="-3" rx="8" ry="6" fill="${c}"/><ellipse cx="-5" cy="5" rx="5" ry="4.500" fill="${shade(c, .35)}"/><ellipse cx="5" cy="5" rx="5" ry="4.500" fill="${shade(c, .35)}"/><rect x="-1.5" y="-7" width="3" height="15" rx="1.5" fill="${shade(c, -.4)}"/></g>`,
  lotus: (x, y, r, c = '#ff9ec4') => `<g transform="translate(${x},${f1(y + r * .5)})">${[-64, 64, -32, 32, 0].map(a => `<path transform="rotate(${a})" d="M0,0 Q${f1(-r * .45)},${f1(-r * .7)} 0,${f1(-r * 1.4)} Q${f1(r * .45)},${f1(-r * .7)} 0,0Z" fill="${Math.abs(a) === 32 ? shade(c, .3) : c}"/>`).join('')}</g>`,
  heart: (x, y, r, c = '#ff5c8a') => heart(x, y, r * 1.7, c),
};

/* ---------- 2. kingdoms ---------- */
const tree = (x, y, s, c = '#58bd8a', t = '#a9744a') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-9" y="-40" width="18" height="44" rx="6" fill="${t}"/><circle cx="0" cy="-70" r="38" fill="${c}"/><circle cx="-28" cy="-48" r="26" fill="${shade(c, -.1)}"/><circle cx="28" cy="-48" r="26" fill="${shade(c, .12)}"/></g>`;
const pine = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-7" y="-14" width="14" height="18" fill="#a9744a"/><path d="M0,-120 L34,-70 H16 L44,-34 H22 L54,-8 H-54 L-22,-34 H-44 L-16,-70 H-34Z" fill="#4fae8a"/><path d="M0,-120 L18,-92 Q0,-100 -18,-92Z M-30,-52 Q0,-64 30,-52 L16,-70 H-16Z" fill="#fff"/></g>`;
const bloom = (x, y, s, c, e) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 V-70" stroke="#58bd8a" stroke-width="7" stroke-linecap="round"/><path d="M0,-30 q22,-6 26,-24 q-20,2 -26,24Z" fill="#6fcf97"/>${e ? e(0, -84, 26) : flower(0, -84, 22, c)}</g>`;

const roof = (x, y, w, st, c) => {
  const h = w / 2, d = shade(c, -.16);
  switch (st) {
    case 'cone': return `<path d="M${x - h - 6},${y} L${x},${y - w * 1.6} L${x + h + 6},${y}Z" fill="${c}"/>`;
    case 'crystal': return `<path d="M${x - h - 4},${y} L${x},${y - w * 2} L${x + h + 4},${y}Z" fill="${c}"/><path d="M${x},${y - w * 2} V${y} H${x + h + 4}Z" fill="#fff" opacity=".4"/>`;
    case 'dome': return `<path d="M${x - h - 4},${y} A${h + 4},${f1(w * .8)} 0 0 1 ${x + h + 4},${y}Z" fill="${c}"/><path d="M${x},${f1(y - w * .8)} v-14" stroke="${GOLD}" stroke-width="4"/><circle cx="${x}" cy="${f1(y - w * .8 - 17)}" r="5" fill="${GOLD}"/>`;
    case 'onion': return `<path d="M${x - h},${y} C${x - w},${f1(y - w * .5)} ${f1(x - h * .4)},${f1(y - w * .9)} ${x},${f1(y - w * 1.5)} C${f1(x + h * .4)},${f1(y - w * .9)} ${x + w},${f1(y - w * .5)} ${x + h},${y}Z" fill="${c}"/>`;
    case 'shell': return `<path d="M${x - h - 8},${y} A${h + 8},${h + 8} 0 0 1 ${x + h + 8},${y}Z" fill="${c}"/><path d="M${x},${y} V${y - h - 8} M${x},${y} L${f1(x - h * .75)},${f1(y - h * .8)} M${x},${y} L${f1(x + h * .75)},${f1(y - h * .8)}" stroke="${d}" stroke-width="3"/>`;
    case 'leaf': return `<circle cx="${x}" cy="${f1(y - h * .7)}" r="${h + 12}" fill="${c}"/><circle cx="${f1(x - h * .9)}" cy="${f1(y - h * .1)}" r="${f1(h * .85)}" fill="${d}"/><circle cx="${f1(x + h * .9)}" cy="${f1(y - h * .1)}" r="${f1(h * .85)}" fill="${shade(c, .14)}"/>`;
    case 'eave': return `<path d="M${x - h - 20},${y} Q${x - h - 4},${y - 6} ${f1(x - h * .5)},${f1(y - w * .5)} L${x},${f1(y - w * .95)} L${f1(x + h * .5)},${f1(y - w * .5)} Q${x + h + 4},${y - 6} ${x + h + 20},${y} Q${x},${y - 12} ${x - h - 20},${y}Z" fill="${c}"/>`;
    default: return `<rect x="${x - h - 5}" y="${y - 14}" width="${w + 10}" height="14" fill="${c}"/>` + [-1, 0, 1].map(i => `<rect x="${f1(x + i * (h - 2) - 6)}" y="${y - 28}" width="12" height="16" fill="${c}"/>`).join('');
  }
};
/* every palace is the same kit of towers, wearing its kingdom's roofs, colours and emblem */
function palace(cx, by, k) {
  const T = (x, w, hg) => `<rect x="${x - w / 2}" y="${by - hg}" width="${w}" height="${hg}" fill="${k.wall}"/><rect x="${x - w / 2}" y="${by - hg}" width="${f1(w * .3)}" height="${hg}" fill="#3a1f4d" opacity=".06"/>` + roof(x, by - hg, w, k.roof, k.rc) + `<rect x="${x - 7}" y="${by - hg + 24}" width="14" height="26" rx="7" fill="${k.win}"/>`;
  return T(cx - 170, 44, 150) + T(cx + 170, 44, 150) + T(cx - 105, 56, 230) + T(cx + 105, 56, 230) + `<rect x="${cx - 112}" y="${by - 140}" width="224" height="140" fill="${k.wall}"/>` + T(cx, 84, 300) +
    [-70, 70].map(dx => `<rect x="${cx + dx - 9}" y="${by - 104}" width="18" height="32" rx="9" fill="${k.win}"/>`).join('') +
    `<path d="M${cx - 30},${by} V${by - 62} a30,30 0 0 1 60,0 V${by}Z" fill="${k.rc}"/><circle cx="${cx}" cy="${by - 200}" r="26" fill="#fff" opacity=".85"/>` + EMB[k.id](cx, by - 200, 17);
}
const KINGDOMS = [
  { id: 'lotus', name: 'Lotus Lake Kingdom', short: 'Lotus Lake', gift: 'Lotus', p: 'lien', pos: [14, 82], line: 'Paper lanterns drift over a quiet pink lake.',
    sky: ['#ffd9ea', '#ffe7c9', '#e9dcff'], hill: '#d9c2f0', ground: '#bfe6ff', road: '#f3d9b0', roof: 'onion', wall: '#ffffff', rc: '#ff9ec4', win: '#ffd36e',
    back: () => `<circle cx="170" cy="150" r="70" fill="#fff6c9" opacity=".85"/>` + cloud(330, 110, .8, .8),
    front: () => [[90, 590], [240, 660], [330, 560], [730, 650], [560, 610]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y + 12}" rx="34" ry="9" fill="#8fd9a8"/>` + EMB.lotus(x, y, i % 2 ? 16 : 20)).join('') + [[150, 480], [40, 550], [690, 560]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#ffe27a" opacity=".35"/><rect x="${x - 10}" y="${y - 14}" width="20" height="28" rx="8" fill="#ffb07a"/><rect x="${x - 10}" y="${y - 3}" width="20" height="6" fill="#ffe27a"/>`).join('') },
  { id: 'star', name: 'Star Kingdom', short: 'Star Kingdom', gift: 'Comet', p: 'amara', pos: [29, 11], line: 'The night never ends here, and every star has a name.',
    sky: ['#2b2a6b', '#6a57c4', '#ff9ecb'], hill: '#3b3a8f', ground: '#4c4a9e', road: '#c9a2ff', roof: 'cone', wall: '#e9e6ff', rc: '#8f8bff', win: '#ffe27a',
    back: () => [[80, 70], [180, 150], [300, 60], [420, 130], [60, 260], [250, 250], [700, 60], [760, 200]].map(([x, y], i) => star(x, y, i % 3 ? 5 : 10, '#fff', 'opacity=".9"')).join('') + `<path d="M190,70 A56,56 0 1 0 190,182 A44,44 0 1 1 190,70Z" fill="#fff6c9"/><path d="M330,170 l110,-40" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>` + star(330, 170, 9, '#ffe27a'),
    front: () => [[80, 560], [200, 640], [320, 590], [720, 620], [600, 670]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 16 : 22}" fill="#ffe27a" opacity=".25"/>` + star(x, y, i % 2 ? 9 : 13, '#ffe27a')).join('') },
  { id: 'sun', name: 'Sunshine Kingdom', short: 'Sunshine', gift: 'Sunbeam', p: 'sola', pos: [50, 9], line: 'Golden fields where the sun stays up late to play.',
    sky: ['#ffe9a8', '#ffd36e', '#ffb07a'], hill: '#ffc46b', ground: '#ffe08a', road: '#fff6d6', roof: 'flat', wall: '#fff8e0', rc: '#ff9e3d', win: '#ff7b54',
    back: () => `<circle cx="170" cy="150" r="130" fill="#fff" opacity=".25"/>` + EMB.sun(170, 150, 150, '#fff6c9') + cloud(420, 90, .8, .7),
    front: () => bloom(80, 640, 1.5, '', EMB.sun) + bloom(190, 690, 1.2, '', EMB.sun) + bloom(300, 620, 1, '', EMB.sun) + bloom(730, 690, 1.3, '', EMB.sun) },
  { id: 'butterfly', name: 'Butterfly Kingdom', short: 'Butterfly', gift: 'Butterfly', p: 'bree', pos: [71, 11], line: 'Giant flowers, and wings in every colour you can think of.',
    sky: ['#e9dcff', '#ffd9ec', '#cdeaff'], hill: '#c9f0a8', ground: '#b8eaa0', road: '#ffffff', roof: 'onion', wall: '#fff7fb', rc: '#b79bff', win: '#ffb07a',
    back: () => ['#ff8fa3', '#ffd36e', '#a8e26b', '#7fd4ff'].map((c, i) => `<path d="M${-40 + i * 14},470 A${330 - i * 14},${330 - i * 14} 0 0 1 ${620 - i * 14},470" stroke="${c}" stroke-width="14" fill="none" opacity=".6"/>`).join('') + EMB.butterfly(120, 120, 22, '#ff9ecb') + EMB.butterfly(360, 200, 16) + EMB.butterfly(250, 70, 14, '#7fd4ff'),
    front: () => bloom(70, 650, 1.7, '#ff9ecb') + bloom(200, 700, 1.3, '#c9a2ff') + bloom(310, 630, 1, '#ffd36e') + bloom(740, 700, 1.4, '#ff8fc0') + EMB.butterfly(150, 470, 18, '#ffb07a') },
  { id: 'cherry', name: 'Blossom Kingdom', short: 'Blossom', gift: 'Blossom', p: 'hana', pos: [91, 25], line: 'It snows pink petals here all year round.',
    sky: ['#e6ecff', '#ffe3ee', '#ffd1e6'], hill: '#c9b6e8', ground: '#d9f5c9', road: '#f3e3d0', roof: 'eave', wall: '#ffffff', rc: '#ff6fa8', win: '#ffb7d5',
    back: () => `<path d="M40,460 L230,170 L420,460Z" fill="#b9a6e0" opacity=".7"/><path d="M190,232 L230,170 L270,232 Q250,222 230,240 Q210,222 190,232Z" fill="#fff"/>` + cloud(430, 120, .8, .8),
    front: () => tree(90, 640, 2, '#ffb7d5', '#8a5a44') + tree(250, 600, 1.2, '#ffc9e0', '#8a5a44') + tree(760, 690, 1.5, '#ffb7d5', '#8a5a44') + [[160, 380], [320, 470], [60, 300], [380, 620], [300, 300]].map(([x, y], i) => EMB.cherry(x, y, i % 2 ? 8 : 11)).join('') },
  { id: 'rose', name: 'Rose Kingdom', short: 'Rose Kingdom', gift: 'Rose', p: 'rosalind', pos: [93, 57], line: 'A thousand roses, and not one of them has thorns.',
    sky: ['#fff0f6', '#ffd1e6', '#ffe7c9'], hill: '#b8e6b0', ground: '#a8e2a0', road: '#ffe7f0', roof: 'dome', wall: '#ffffff', rc: '#ff5c8a', win: '#ffb3c6',
    back: () => cloud(140, 130, 1.1, .9) + cloud(400, 80, .8, .8),
    front: () => [[80, 610, 1.5], [220, 670, 1.1], [330, 590, .8], [740, 680, 1.2]].map(([x, y, s]) => `<g transform="translate(${x},${y}) scale(${s})"><circle cx="-26" cy="0" r="30" fill="#58bd8a"/><circle cx="26" cy="0" r="30" fill="#6fcf97"/><circle cx="0" cy="-22" r="34" fill="#4fae7a"/>${EMB.rose(-22, -8, 13)}${EMB.rose(20, -24, 12, '#ff8fb8')}${EMB.rose(8, 10, 11)}${EMB.rose(-4, -40, 10, '#ffb3c6')}</g>`).join('') },
  { id: 'ocean', name: 'Ocean Kingdom', short: 'Ocean', gift: 'Seashell', p: 'coralie', pos: [84, 86], line: 'A palace under the waves, where the fish are the neighbours.',
    sky: ['#8fe3ff', '#5fc9d8', '#3f9fc9'], hill: '#2f8fb5', ground: '#ffe7b0', road: '#fff3d6', roof: 'shell', wall: '#fff7e6', rc: '#ff9ecb', win: '#7fd4ff',
    back: () => [[60, 200], [220, 320], [380, 240]].map(([x, w]) => `<path d="M${x},0 h${w - x > 120 ? 90 : 70} l-60,470 h-120Z" fill="#fff" opacity=".12"/>`).join('') + [[90, 120, 14], [140, 210, 8], [300, 90, 11], [360, 300, 16], [60, 330, 9], [250, 380, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".35" stroke="#fff" stroke-width="2"/>`).join('') + [[180, 150, '#ffb07a'], [330, 220, '#ffe27a']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="13" fill="${c}"/><path d="M${x + 20},${y} l20,-13 v26Z" fill="${c}"/><circle cx="${x - 12}" cy="${y - 3}" r="3" fill="#3a2340"/>`).join(''),
    front: () => [[70, 690, '#ff7da8'], [730, 690, '#b79bff'], [290, 700, '#ffb07a']].map(([x, y, c]) => `<path d="M${x},${y} v-70 M${x},${y - 30} q-30,-10 -34,-50 M${x},${y - 46} q30,-10 36,-44 M${x},${y - 66} q-6,-30 6,-56" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/>`).join('') + [[170, 700], [200, 700]].map(([x, y], i) => `<path d="M${x},${y} q-18,-50 0,-90 q18,-40 0,-90" stroke="${i ? '#58bd8a' : '#4fae7a'}" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('') + EMB.ocean(360, 640, 22) + EMB.ocean(640, 660, 16, '#fff') },
  { id: 'forest', name: 'Enchanted Forest', short: 'Forest', gift: 'Leaf', p: 'fern', pos: [7, 55], line: 'The trees whisper, and the mushrooms glow at night.',
    sky: ['#d5f5e9', '#c9f0c0', '#fff6b0'], hill: '#58bd8a', ground: '#6fcf97', road: '#e9d9a8', roof: 'leaf', wall: '#c58b52', rc: '#4fae7a', win: '#ffe27a',
    back: () => `<circle cx="200" cy="130" r="80" fill="#fff6c9" opacity=".7"/>` + [[0, 60], [120, 200], [260, 330]].map(([a, b]) => `<path d="M200,130 L${a},470 H${b}Z" fill="#fff" opacity=".14"/>`).join(''),
    front: () => tree(70, 640, 2.4, '#3fa37a') + tree(250, 590, 1.3, '#58bd8a') + tree(770, 700, 1.7, '#3fa37a') + [[170, 660, 1], [330, 640, .7], [690, 680, .8]].map(([x, y, s]) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-9" y="-30" width="18" height="34" rx="8" fill="#fff3e0"/><path d="M-36,-26 A36,34 0 0 1 36,-26Z" fill="#ff6f91"/><circle cx="-14" cy="-40" r="6" fill="#fff"/><circle cx="12" cy="-46" r="7" fill="#fff"/></g>`).join('') + [[140, 420], [330, 380], [60, 500], [400, 520]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff6a0" opacity=".4"/><circle cx="${x}" cy="${y}" r="4" fill="#fffbd0"/>`).join('') },
  { id: 'ice', name: 'Frozen Kingdom', short: 'Frozen', gift: 'Snowflake', p: 'neva', pos: [9, 23], line: 'Crystal towers, soft snow and dancing northern lights.',
    sky: ['#8fc7ff', '#cfe3ff', '#ffffff'], hill: '#e6f1ff', ground: '#ffffff', road: '#d6ecff', roof: 'crystal', wall: '#e6f6ff', rc: '#8fd3ff', win: '#b79bff',
    back: () => ['#9fe8d0', '#c9a2ff', '#ff9ecb'].map((c, i) => `<path d="M-20,${150 + i * 34} Q200,${60 + i * 30} 400,${150 + i * 24} T820,${110 + i * 30}" stroke="${c}" stroke-width="26" fill="none" opacity=".45" stroke-linecap="round"/>`).join('') + [[80, 60], [240, 300], [420, 60], [330, 400], [60, 380], [180, 200]].map(([x, y], i) => EMB.ice(x, y, i % 2 ? 9 : 14, '#fff')).join(''),
    front: () => pine(80, 650, 1.9) + pine(230, 600, 1.2) + pine(760, 700, 1.5) + `<ellipse cx="330" cy="680" rx="110" ry="30" fill="#e6f1ff"/><ellipse cx="660" cy="640" rx="80" ry="22" fill="#e6f1ff"/>` },
];
const KMAP = Object.fromEntries(KINGDOMS.map(k => [k.id, k]));
function kScene(k) {
  const [d, f] = vgrad(k.sky);
  return d + `<rect width="800" height="700" fill="${f}"/>` + k.back() + `<path d="M0,470 Q130,330 300,430 T560,400 T800,440 V700 H0Z" fill="${k.hill}" opacity=".75"/><g transform="translate(600,488) scale(.8)">${palace(0, 0, k)}</g><path d="M0,500 Q400,452 800,500 V700 H0Z" fill="${k.ground}"/><path d="M574,486 L626,486 L690,700 L470,700Z" fill="${k.road}" opacity=".85"/>` + k.front();
}

/* ---------- 3. princesses, collections, hairstyles ---------- */
Object.assign(PMAP.lien, { kind: 'Lotus Princess', k: 'lotus', move: 'sway' });
Object.assign(PMAP.amara, { kind: 'Galaxy Princess', k: 'star', move: 'spin', brow: 'arch' });
Object.assign(PMAP.coralie, { kind: 'Mermaid Princess', k: 'ocean', move: 'float' });
Object.assign(PMAP.rosalind, { kind: 'Rose Princess', k: 'rose', move: 'twirl', mark: true });
[
  { id: 'neva', name: 'Neva', kind: 'Ice Princess', title: 'Princess of the Frozen Kingdom', line: 'Calm and clever. She teaches the snowflakes how to dance.', skin: '#c98f6b', eyes: '#7b61ff', hair: 'bob', hairColor: '#cfe3ff', dress: 'frost', eyeRy: 17, brow: 'arch', accent: '#8fd3ff', k: 'ice', move: 'spin', look: { crown: 'k_ice', shadow: '#8fd3ff' } },
  { id: 'fern', name: 'Fern', kind: 'Forest Princess', title: 'Princess of the Enchanted Forest', line: 'Wild and gentle. She knows every tree and every fox by name.', skin: '#e8b98e', eyes: '#d08b2c', hair: 'pony', hairColor: '#5f8f3e', dress: 'moss', eyeRy: 16, freckles: true, brow: 'flat', accent: '#6fcf97', k: 'forest', move: 'sway', look: { flower: 'rose' } },
  { id: 'sola', name: 'Sola', kind: 'Sunshine Princess', title: 'Princess of the Sunshine Kingdom', line: 'Cheerful and loud. She sings the sun awake every morning.', skin: '#7a4a2e', eyes: '#d08b2c', hair: 'curls', hairColor: '#ffb347', dress: 'sunbeam', eyeRy: 19, accent: '#ffd36e', k: 'sun', move: 'jump', look: { blush: '#ff9e7d' } },
  { id: 'hana', name: 'Hana', kind: 'Cherry Blossom Princess', title: 'Princess of the Blossom Kingdom', line: 'Quiet and funny. She writes tiny poems on falling petals.', skin: '#fde0d0', eyes: '#c27ba0', hair: 'bun', hairColor: '#ff9ecb', dress: 'blossom', eyeRy: 15, mark: true, brow: 'flat', accent: '#ffb7d5', k: 'cherry', move: 'bow', look: { lips: '#ff8fa3' } },
  { id: 'bree', name: 'Bree', kind: 'Butterfly Princess', title: 'Princess of the Butterfly Kingdom', line: 'Curious and quick. She can never sit still for a whole minute.', skin: '#f1c7a0', eyes: '#19a59a', hair: 'pigtails', hairColor: '#9d7bff', dress: 'flutter', eyeRy: 18, brow: 'arch', accent: '#b79bff', k: 'butterfly', move: 'float', look: { wings: 'butterfly', hairFx: 'ombre', hairColor2: '#ff9ecb' } },
].forEach(p => { PRINCESSES.push(p); PMAP[p.id] = p; });

/* `kd` marks a thing that belongs to a kingdom: it shows up once that kingdom is open (or for its own princess) */
[
  { id: 'frost', name: 'Snowflake gown', k: 'ball', sl: 'long', c: ['#bfe9ff', '#ffffff', '#ffffff'], deco: 'ice', kd: 'ice' },
  { id: 'aurora', name: 'Aurora dress', k: 'tier', sl: 'puff', c: ['#9fe8d0', '#c9a2ff'], deco: 'stars', kd: 'ice' },
  { id: 'moss', name: 'Leaf dress', k: 'aline', sl: 'tee', c: ['#6fcf97', '#d5f5c9', '#fff6b0'], deco: 'forest', kd: 'forest' },
  { id: 'acorn', name: 'Explorer outfit', k: 'pants', sl: 'long', c: ['#c58b52', '#58bd8a'], deco: 'none', kd: 'forest' },
  { id: 'sunbeam', name: 'Sunbeam ruffles', k: 'tier', sl: 'puff', c: ['#ffd36e', '#fff6b0', '#ff9e3d'], deco: 'sun', kd: 'sun' },
  { id: 'marigold', name: 'Marigold party', k: 'short', sl: 'strap', c: ['#ffb347', '#ffe7a8', '#ffffff'], deco: 'sun', kd: 'sun' },
  { id: 'blossom', name: 'Blossom gown', k: 'aline', sl: 'long', c: ['#ffb7d5', '#fff0f6', '#ffffff'], deco: 'cherry', kd: 'cherry' },
  { id: 'petal', name: 'Petal tutu', k: 'tutu', sl: 'strap', c: ['#ff9ecb', '#ffffff'], deco: 'bow', kd: 'cherry' },
  { id: 'flutter', name: 'Flutter tutu', k: 'tutu', sl: 'puff', c: ['#b79bff', '#ffb07a', '#fff6b0'], deco: 'butterfly', kd: 'butterfly' },
  { id: 'wing', name: 'Wing gown', k: 'ball', sl: 'off', c: ['#9d7bff', '#ffd1f0', '#ffe27a'], deco: 'butterfly', kd: 'butterfly' },
  { id: 'lantern', name: 'Lantern gown', k: 'mermaid', sl: 'long', c: ['#ffb07a', '#ffe7a8', '#ffffff'], deco: 'lotus', kd: 'lotus' },
  { id: 'comet', name: 'Comet gown', k: 'ball', sl: 'strap', c: ['#4b3a8f', '#ff9ecb', '#ffe27a'], deco: 'star', kd: 'star' },
  { id: 'pearl', name: 'Pearl diver', k: 'short', sl: 'tee', c: ['#7fd4ff', '#c3f5ee', '#ffffff'], deco: 'ocean', kd: 'ocean' },
  { id: 'rosebud', name: 'Rosebud wedding', k: 'ball', sl: 'puff', c: ['#ffffff', '#ffd1e6', '#ff5c8a'], deco: 'rose', kd: 'rose' },
].forEach(d => { DRESSES.push(d); DMAP[d.id] = d; });
KINGDOMS.forEach(k => {
  const id = 'k_' + k.id, e = EMB[k.id];
  CROWN[id] = () => `<path d="M-48,10 Q0,-12 48,10" stroke="${GOLD}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="0" cy="-20" r="22" fill="#fff" opacity=".9"/>` + e(0, -20, 16) + e(-32, 0, 8) + e(32, 0, 8);
  CROWNS.push({ id, name: k.gift + ' tiara', kd: k.id });
  WAND[id] = () => `<line x1="0" y1="14" x2="0" y2="-58" stroke="${k.rc}" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-78" r="24" fill="#fff" opacity=".9"/>` + e(0, -78, 18) + star(20, -102, 5, '#fff') + star(-22, -96, 4, '#fff');
  WANDS.push({ id, name: k.gift + ' wand', kd: k.id });
  SCENES[id] = () => kScene(k);
});
/* `at` marks a thing that arrives with a number of stars */
[['verylong', 'Extra long', { len: 470, tex: 0, bang: 'fringe', do: 'loose' }, 5], ['curlybob', 'Curly bob', { len: 262, tex: 2, bang: 'side', do: 'loose' }, 9], ['beach', 'Beach waves', { len: 350, tex: 1, bang: 'part', do: 'loose' }, 14]]
  .forEach(([id, name, def, at]) => { HAIRDEF[id] = def; HAIRS.push({ id, name, at }); });

/* ---------- 4. magical stars ---------- */
const LADDER = [
  { at: 2, kind: 'kingdom', id: 'ice' }, { at: 3, kind: 'pet', id: 'rabbit' }, { at: 4, kind: 'kingdom', id: 'forest' }, { at: 5, kind: 'hair', id: 'verylong' },
  { at: 6, kind: 'kingdom', id: 'sun' }, { at: 7, kind: 'pet', id: 'unicorn' }, { at: 8, kind: 'kingdom', id: 'cherry' }, { at: 9, kind: 'hair', id: 'curlybob' },
  { at: 10, kind: 'kingdom', id: 'butterfly' }, { at: 12, kind: 'pet', id: 'dragon' }, { at: 14, kind: 'hair', id: 'beach' },
];
KINGDOMS.forEach(k => { const l = LADDER.find(l => l.kind === 'kingdom' && l.id === k.id); k.at = l ? l.at : 0; });
const kOpen = id => !!KMAP[id] && save.stars >= KMAP[id].at;
const openItem = it => (!it.kd || kOpen(it.kd) || (S && PMAP[S.princess].k === it.kd)) && (!it.at || save.stars >= it.at);
const itemsOf = tab => tab.items.filter(openItem);
const plural = n => `${n} star${n === 1 ? '' : 's'}`;
const palaceIcon = k => `<svg viewBox="-215 -500 430 510" aria-hidden="true">${palace(0, 0, k)}</svg>`;

let unlockQ = [];
function earn(n, msg) {
  const before = save.stars; save.stars = before + n; persist();
  const chip = $('#starChip');
  if (chip) { chip.querySelector('b').textContent = save.stars; chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); const r = chip.getBoundingClientRect(); burst(r.left + r.width / 2, r.bottom + 12, 8); }
  toast(`${msg ? msg + ' ' : ''}+${plural(n)}`); sfx.magic();
  unlockQ.push(...LADDER.filter(l => l.at > before && l.at <= save.stars));
  if (unlockQ.length) setTimeout(showUnlock, 1300);
}
function ladderInfo(l) {
  if (l.kind === 'kingdom') { const k = KMAP[l.id]; return { art: palaceIcon(k), name: k.name, text: `Find it on the map: new dresses, a ${k.gift.toLowerCase()} tiara, a wand and a party.` }; }
  if (l.kind === 'pet') { const p = PETMAP[l.id]; return { art: petSvg(p), name: `${p.name} the ${p.kind.toLowerCase()}`, text: `${p.name} is waiting for you in Pet World.` }; }
  const h = HAIRS.find(h => h.id === l.id); return { art: dollSvg({ ...(S || freshLook(PRINCESSES[0])), hair: l.id, hairLen: null, bangLen: null, hairTex: null, hairDo: null }, '30 0 340 480', 0), name: `${h.name} hairstyle`, text: 'Find it in Hair Styling, under Magic styles.' };
}
function showUnlock() {
  const dlg = $('#unlock'); if (dlg.open || !unlockQ.length) return;
  const i = ladderInfo(unlockQ.shift());
  $('#unlockArt').innerHTML = i.art; $('#unlockTitle').textContent = `New: ${i.name}!`; $('#unlockText').textContent = i.text;
  dlg.showModal(); sfx.fanfare();
}
function openPath() {
  const next = LADDER.find(l => l.at > save.stars);
  $('#pathSub').textContent = `You have ${plural(save.stars)}. ` + (next ? `${plural(next.at - save.stars)} more for the next surprise.` : 'You have found every surprise!');
  $('#pathList').innerHTML = LADDER.map(l => { const i = ladderInfo(l), got = save.stars >= l.at; return `<div class="prow${got ? ' got' : ''}"><span class="pnum">${l.at}</span><span class="part">${i.art}</span><b>${i.name}</b><i>${got ? 'Open' : plural(l.at - save.stars) + ' to go'}</i></div>`; }).join('') +
    `<p class="phow">Earn stars by finishing a hair spa or facial, caring for a pet, decorating your castle, throwing a party, walking the runway, saving pictures, and finding the stars hidden in each kingdom.</p>`;
  $('#path').showModal(); $('#path').scrollTop = 0;
}

/* ---------- 5. world map & kingdom pages ---------- */
const shop = (c, art) => `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 30 L32 6 L60 30Z" fill="${shade(c, -.14)}"/><rect x="9" y="28" width="46" height="32" rx="6" fill="${c}"/><rect x="18" y="22" width="28" height="32" rx="9" fill="#fff"/><g transform="translate(20.500,26.500) scale(.36)">${art}</g></svg>`;
const PLACES = [
  { id: 'choose', name: 'Princess Collection', pos: [31, 33], c: '#ffc94d', art: `<path d="M8 52h48l4-32-15 12L32 8 19 32 4 20z" fill="#ffc94d"/><circle cx="32" cy="42" r="5" fill="#ff6fa8"/>` },
  { id: 'salon', name: 'Beauty Salon', pos: [50, 28], c: '#ff9ecb', art: ART.lipstick },
  { id: 'fashion', name: 'Fashion Studio', pos: [69, 33], c: '#c9a2ff', art: ART.dress },
  { id: 'pets', name: 'Pet World', pos: [27, 58], c: '#8fe0b0', art: `<ellipse cx="32" cy="44" rx="16" ry="13" fill="#ff8fc0"/><circle cx="11" cy="29" r="7" fill="#ff8fc0"/><circle cx="24" cy="16" r="7" fill="#ff8fc0"/><circle cx="40" cy="16" r="7" fill="#ff8fc0"/><circle cx="53" cy="29" r="7" fill="#ff8fc0"/>` },
  { id: 'castle', name: 'My Castle', pos: [50, 53], c: '#ff8fc0', big: true, art: `<rect x="14" y="28" width="36" height="30" fill="#c9a2ff"/><rect x="6" y="18" width="14" height="40" fill="#b79bff"/><rect x="44" y="18" width="14" height="40" fill="#b79bff"/><path d="M4 18l9-14 9 14zM42 18l9-14 9 14z" fill="#ff8fc0"/><path d="M26 58V44a6 6 0 0 1 12 0v14z" fill="#7a5cf0"/>` },
  { id: 'art', name: 'Art Studio', pos: [73, 58], c: '#7fd4ff', art: `<path d="M32 6C14 6 4 18 4 32s12 26 26 26c6 0 6-6 3-9s0-9 6-9h9c8 0 12-6 12-12C60 16 48 6 32 6z" fill="#f3d9b0"/><circle cx="20" cy="24" r="6" fill="#ff5c8a"/><circle cx="36" cy="16" r="6" fill="#ffd36e"/><circle cx="50" cy="26" r="6" fill="#7fd4ff"/><circle cx="16" cy="40" r="6" fill="#a8e26b"/>` },
  { id: 'events', name: 'Royal Events', pos: [39, 79], c: '#ffb07a', art: `<ellipse cx="22" cy="22" rx="14" ry="18" fill="#ff5c8a"/><ellipse cx="44" cy="26" rx="13" ry="17" fill="#7fd4ff"/><path d="M22 40q4 10 10 20M44 43q-4 8-12 17" stroke="#7a5cf0" stroke-width="2.5" fill="none"/>` },
  { id: 'gallery', name: 'My Gallery', pos: [61, 79], c: '#a8e26b', art: `<rect x="6" y="8" width="52" height="48" rx="8" fill="#ffc94d"/><rect x="13" y="15" width="38" height="34" rx="4" fill="#fff"/>` + heart(32, 32, 20, '#ff6fa8') },
];
function mapSvg() {
  const [d, f] = vgrad(['#c9ecff', '#a6dcff', '#bcc9ff']);
  const land = 'M150,120 C300,10 520,50 640,40 C820,20 1020,50 1120,190 C1200,330 1170,530 1090,630 C960,750 700,730 560,740 C380,750 170,730 80,600 C0,460 40,220 150,120Z';
  const ends = [...KINGDOMS, ...PLACES].map(o => [o.pos[0] * 12, o.pos[1] * 7.6]);
  return `<svg viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true">${d}<rect width="1200" height="760" fill="${f}"/>` +
    [[40, 60], [1090, 60], [1150, 420], [20, 430], [520, 20], [1000, 730], [300, 748]].map(([x, y]) => `<path d="M${x},${y} q10,-10 20,0 t20,0 t20,0" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>`).join('') +
    `<path d="${land}" fill="#fff6d6"/><path d="${land}" fill="#d9f4c7" transform="translate(600 385) scale(.95) translate(-600 -385)"/>` +
    KINGDOMS.map(k => `<ellipse cx="${k.pos[0] * 12}" cy="${f1(k.pos[1] * 7.6 + 8)}" rx="104" ry="72" fill="${k.ground}" opacity="${kOpen(k.id) ? .9 : .4}"/>`).join('') +
    ends.map(([x, y]) => `<path d="M600,400 Q${f1((600 + x) / 2 + (y - 400) * .14)},${f1((400 + y) / 2 - (x - 600) * .14)} ${f1(x)},${f1(y)}" stroke="#fff" stroke-width="7" stroke-dasharray="1 15" stroke-linecap="round" fill="none"/>`).join('') +
    [[230, 330, .5], [420, 500, .45], [800, 470, .5], [900, 330, .45], [520, 660, .4], [700, 170, .4], [200, 470, .4], [980, 470, .4]].map(([x, y, s]) => tree(x, y, s)).join('') +
    cloud(250, 250, .5, .8) + cloud(930, 190, .55, .8) + cloud(760, 640, .5, .7) + `</svg>`;
}
function renderWorld() {
  const p = PMAP[S.princess];
  view.innerHTML = `<section class="world"><div class="mapwrap" id="mapwrap"><div class="map">${mapSvg()}` +
    KINGDOMS.map(k => { const open = kOpen(k.id); return `<button class="pin kpin${open ? '' : ' locked'}" data-kingdom="${k.id}" style="left:${k.pos[0]}%;top:${k.pos[1]}%">${palaceIcon(k)}<span>${k.short}</span>${open ? '' : `<i>${ico(IC.star)}${k.at}</i>`}</button>`; }).join('') +
    PLACES.map(pl => `<button class="pin place${pl.big ? ' big' : ''}" data-go="${pl.id}" style="left:${pl.pos[0]}%;top:${pl.pos[1]}%">${shop(pl.c, pl.art)}<span>${pl.name}</span></button>`).join('') +
    `</div></div><button class="passport" data-go="choose"><span class="kport">${dollSvg(S, '50 10 300 330', 0)}</span><span><small>Playing as</small><b>${p.name}</b></span></button><div class="swipe">Swipe to explore</div></section>`;
  const w = $('#mapwrap'); w.scrollLeft = (w.scrollWidth - w.clientWidth) / 2;
}
const auraHtml = id => EMB[id] ? `<div class="aura${id === 'ocean' || id === 'butterfly' ? ' up' : ''}" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i style="left:${(i * 37 + 8) % 96}%;--s:${16 + (i * 7) % 16}px;--d:${7 + (i * 3) % 6}s;--dl:${(-i * 1.3).toFixed(1)}s"><svg viewBox="-16 -16 32 32">${id === 'ocean' ? '<circle r="10" fill="#fff" opacity=".45" stroke="#fff" stroke-width="2"/>' : EMB[id](0, 0, 11)}</svg></i>`).join('')}</div>` : '';
const HIDE = i => [[10 + (i * 7) % 18, 30 + (i * 9) % 18], [84 - (i * 5) % 14, 64 + (i * 4) % 18], [46 + (i * 11) % 24, 13 + (i * 3) % 9]];
function renderKingdom() {
  const k = KMAP[save.kingdom], hp = PMAP[k.p], ev = EVENTS.find(e => e.k === k.id), ki = KINGDOMS.indexOf(k);
  const wear = [...DRESSES.filter(d => d.kd === k.id).map(d => ['dress', d, '40 262 320 400']), ['crown', CROWNS.find(c => c.id === 'k_' + k.id), '70 10 260 260'], ['wand', WANDS.find(c => c.id === 'k_' + k.id), '210 320 130 140']];
  const found = [0, 1, 2].filter(i => save.found[`${k.id}-${i}`]).length;
  view.innerHTML = `<section class="studio hub kingdom">
    <div class="stage" id="stage" data-zoom="full"><div class="scene">${sceneSvg('k_' + k.id)}</div>${auraHtml(k.id)}<div class="doll" id="doll"></div>${buddyHtml()}
      ${HIDE(ki).map(([x, y], i) => save.found[`${k.id}-${i}`] ? '' : `<button class="hid" data-find="${k.id}-${i}" style="left:${x}%;top:${y}%" aria-label="A hidden star">${ico(IC.star)}</button>`).join('')}
      <div class="plate"><b>${k.name}</b></div></div>
    <div class="panel"><div class="kpanel">
      <h2 class="hubtitle">${k.name}</h2><p class="kline">${k.line}</p>
      <div class="krow"><span class="kport">${dollSvg(lookOf(hp.id), '50 10 300 330', 0)}</span><span><b>${hp.name}</b><small>The ${hp.kind} lives here</small></span>${S.princess === hp.id ? '' : `<button class="chip" data-princess="${hp.id}">Play as ${hp.name}</button>`}</div>
      <h3>The ${k.gift} collection</h3><p class="kline">Tap one, or drag it onto ${PMAP[S.princess].name}.</p>
      <div class="wears">${wear.map(([key, it, vb]) => `<button class="opt" data-wear="${key}:${it.id}" aria-pressed="${S[key] === it.id}">${dollSvg({ ...S, [key]: it.id, ...(key === 'dress' ? { dressColor: null } : {}) }, vb, 0)}<span>${it.name}</span></button>`).join('')}</div>
      ${ev ? `<h3>Party time</h3><button class="btn magic wide" data-event="${ev.id}">${ico(IC.star)}${ev.name}</button>` : ''}
      <p class="kline" id="foundLine">${found === 3 ? 'You found all 3 hidden stars here.' : `${3 - found} hidden ${found === 2 ? 'star is' : 'stars are'} twinkling somewhere in the picture.`}</p>
    </div></div></section>`;
  paintDoll();
}

function wearItem(v) {
  const [key, id] = v.split(':'); S[key] = id; if (key === 'dress') S.dressColor = null;
  persist(); paintDoll(true); sfx.pick(); burstAtDoll([200, key === 'dress' ? 460 : key === 'crown' ? 70 : 380]);
  document.querySelectorAll('[data-wear]').forEach(b => { const [k2, i2] = b.dataset.wear.split(':'); b.setAttribute('aria-pressed', S[k2] === i2); });
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'starChip') { sfx.tap(); return openPath(); }
  if (t.dataset.kingdom) {
    const k = KMAP[t.dataset.kingdom]; sfx.tap();
    if (!kOpen(k.id)) return toast(`The ${k.name} opens at ${plural(k.at)}. You have ${save.stars}.`);
    save.kingdom = k.id; return go('kingdom');
  }
  if (t.dataset.wear) return wearItem(t.dataset.wear);
  if (t.dataset.find && !save.found[t.dataset.find]) {
    save.found[t.dataset.find] = 1; const r = t.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 12); t.remove();
    const left = document.querySelectorAll('.hid').length, fl = $('#foundLine'); if (fl) fl.textContent = left ? `${left} hidden ${left === 1 ? 'star is' : 'stars are'} twinkling somewhere in the picture.` : 'You found all 3 hidden stars here.';
    return earn(1, 'You found a hidden star!');
  }
});
