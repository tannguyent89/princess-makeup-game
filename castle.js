'use strict';
/* =====================================================================
   My Castle: five rooms you decorate freely. Pick walls, floor and rug,
   then put furniture anywhere and drag it around. The same furniture kit
   also dresses the royal event scenes. Rooms live in save.castle.
   ===================================================================== */
const sR = (x, y, w, h, r, f, x2 = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${x2}/>`;
const sC = (x, y, r, f, x2 = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${x2}/>`;
const sE = (x, y, rx, ry, f, x2 = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${x2}/>`;
const sP = (d, f, x2 = '') => `<path d="${d}" fill="${f}" ${x2}/>`;
const sL = (d, s, w, x2 = '') => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x2}/>`;
const WOOD = '#c58b52', PALE = '#e9c9a0';
const cupc = (x, y, c) => sP(`M${x - 10},${y} h20 l-3,13 h-14Z`, WOOD) + sC(x, y - 4, 11, c);
const curveY = (x, a, b, w) => a + (b - a) * (1 - (x / w) ** 2);   // a hanging string: a at the ends, b in the middle

/* every piece is drawn around (0,0), roughly 120 wide */
const IT = {
  bed: ['Bed', () => sR(-78, -58, 156, 70, 26, '#ff8fc0') + sR(-82, -6, 164, 50, 14, '#fff') + sR(-82, 12, 164, 36, 12, '#c9a2ff') + sR(-62, -22, 56, 26, 12, '#ffe6f2') + heart(40, 30, 16, '#fff') + sR(-78, 44, 12, 16, 4, '#d96a9c') + sR(66, 44, 12, 16, 4, '#d96a9c')],
  wardrobe: ['Wardrobe', () => sP('M-50,-70 Q0,-104 50,-70Z', '#9d7bff') + sR(-50, -76, 100, 152, 14, '#b79bff') + sL('M0,-66 V70', '#9d7bff', 3) + sC(-10, 0, 5, GOLD) + sC(10, 0, 5, GOLD) + heart(-25, -36, 14, '#fff') + heart(25, -36, 14, '#fff') + sR(-44, 74, 14, 10, 3, '#7a5cf0') + sR(30, 74, 14, 10, 3, '#7a5cf0')],
  lamp: ['Lamp', () => sE(0, 56, 26, 8, GOLD) + sR(-4, -26, 8, 82, 4, GOLD) + sP('M-34,-26 L-18,-74 H18 L34,-26Z', '#fff0b8') + sP('M-34,-26 H34 L30,-38 H-30Z', '#ffd36e')],
  armchair: ['Armchair', () => sR(-52, -48, 104, 80, 30, '#ff9ecb') + sR(-64, -8, 128, 52, 20, '#ff6fa8') + sR(-44, -2, 88, 30, 12, '#ffc2dc') + sR(-56, 40, 12, 14, 4, WOOD) + sR(44, 40, 12, 14, 4, WOOD)],
  bookshelf: ['Bookshelf', () => sR(-48, -76, 96, 152, 8, WOOD) + [-66, -22, 22].map((y, r) => sR(-40, y, 80, 38, 4, '#fff3d6') + ['#ff8fc0', '#7fd4ff', '#ffd36e', '#b79bff', '#8fe0b0'].map((c, i) => sR(-36 + i * 15, y + 8 + (i + r) % 2 * 4, 11, 30 - (i + r) % 2 * 4, 2, c)).join('')).join('')],
  window: ['Window', () => sP('M-50,62 V-16 a50,50 0 0 1 100,0 V62Z', '#cfeaff', 'stroke="#fff" stroke-width="9"') + sL('M0,-66 V62 M-50,4 H50', '#fff', 6) + sP('M-62,-70 Q-30,-20 -60,66 H-74 V-70Z', '#ff9ecb') + sP('M62,-70 Q30,-20 60,66 H74 V-70Z', '#ff9ecb') + sR(-78, -80, 156, 12, 6, GOLD)],
  frame: ['Picture', () => sR(-40, -48, 80, 96, 10, GOLD) + sR(-30, -38, 60, 76, 6, '#fff0f7') + heart(0, 0, 34, '#ff8fc0')],
  teddy: ['Teddy', () => sC(-22, -52, 12, '#c98f5a') + sC(22, -52, 12, '#c98f5a') + sE(-30, 14, 10, 16, '#c98f5a') + sE(30, 14, 10, 16, '#c98f5a') + sE(0, 24, 34, 36, '#d9a273') + sC(0, -28, 30, '#d9a273') + sE(0, -18, 13, 10, '#f3d9b0') + sC(-10, -32, 3.5, '#3a2340') + sC(10, -32, 3.5, '#3a2340') + sC(0, -22, 3.5, '#3a2340') + sE(-16, 56, 13, 9, '#c98f5a') + sE(16, 56, 13, 9, '#c98f5a') + bow(0, 0, 10, '#ff5c8a')],
  toybox: ['Toy box', () => sC(-28, -30, 16, '#ff8fc0') + star(24, -34, 15, '#ffe27a') + sR(-54, -8, 108, 60, 10, '#7fd4ff') + sR(-58, -22, 116, 20, 8, '#5fb4ff') + star(0, 24, 14, '#ffe27a')],
  plant: ['Plant', () => sE(0, -24, 14, 40, '#58bd8a') + sE(-22, -10, 12, 30, '#6fcf97', 'transform="rotate(-30 -22 -10)"') + sE(22, -10, 12, 30, '#4fae7a', 'transform="rotate(30 22 -10)"') + sP('M-26,10 H26 L20,56 H-20Z', '#ff9ecb') + sR(-30, 4, 60, 12, 5, '#ff6fa8')],
  chandelier: ['Chandelier', () => sL('M0,-80 V-40', GOLD, 4) + sL('M-50,-20 Q0,30 50,-20 M-50,-20 Q-25,-50 0,-40 Q25,-50 50,-20', GOLD, 5) + [-50, 0, 50].map(x => sR(x - 4, x ? -44 : -64, 8, 24, 3, '#fff') + sE(x, x ? -50 : -70, 4, 7, '#ffb347')).join('') + gem(-25, 8, 6, '#bfe9ff') + gem(25, 8, 6, '#bfe9ff') + gem(0, 22, 7, '#ff9ecb')],
  desk: ['Desk', () => sR(-30, -46, 44, 36, 6, '#fff') + heart(-8, -28, 12, '#ff8fc0') + sR(26, -36, 10, 26, 3, '#b79bff') + sR(-64, -10, 128, 14, 6, PALE) + sR(-56, 4, 12, 56, 4, WOOD) + sR(44, 4, 12, 56, 4, WOOD)],
  mirror: ['Mirror', () => sL('M-26,40 L-36,76 M26,40 L36,76', GOLD, 6) + sE(0, -12, 40, 62, GOLD) + sE(0, -12, 32, 54, '#d6f1ff') + sL('M-14,-44 L-2,-56 M-18,-28 L4,-50', '#fff', 4)],
  mannequin: ['Mannequin', () => sL('M0,-70 V70', '#c9b6e8', 6) + sE(0, 72, 28, 8, '#c9b6e8') + sC(0, -76, 9, '#c9b6e8') + sP('M-20,-62 Q0,-52 20,-62 L15,-22 L44,48 Q0,62 -44,48 L-15,-22Z', '#ff8fc0') + bow(0, -22, 9, '#fff')],
  shoerack: ['Shoe rack', () => sR(-56, -54, 112, 108, 8, '#f3d9b0') + [-20, 16].map(y => sR(-56, y, 112, 6, 2, WOOD)).join('') + [[-32, '#ff5c8a'], [0, '#7fd4ff'], [32, GOLD]].map(([y, c], r) => [-34, -10, 16, 40].map((x, i) => sE(x, y + 2, 11, 6, i < 2 ? c : ['#b79bff', '#8fe0b0', '#ff9ecb'][r])).join('')).join('')],
  hatstand: ['Hat stand', () => sL('M0,-70 V66', WOOD, 6) + sL('M-26,72 L0,54 L26,72', WOOD, 6) + sE(-22, -50, 30, 8, '#ff8fc0') + sP('M-38,-52 a16,16 0 0 1 32,0Z', '#ff8fc0') + sE(24, -14, 26, 7, '#ffd36e') + sP('M10,-16 a14,14 0 0 1 28,0Z', '#ffd36e')],
  vanity: ['Vanity', () => sC(0, -36, 42, GOLD) + sC(0, -36, 33, '#d6f1ff') + [0, 1, 2, 3, 4, 5, 6, 7].map(i => sC(f1(Math.cos(i * .785) * 42), f1(-36 + Math.sin(i * .785) * 42), 6, '#fff6c9', 'stroke="#ffd36e" stroke-width="2"')).join('') + sR(-62, 8, 124, 16, 6, '#ffb3d1') + sR(-52, 22, 104, 42, 8, '#ff8fc0') + sC(-20, 42, 4, GOLD) + sC(20, 42, 4, GOLD)],
  rail: ['Clothes rail', () => sL('M-64,-60 H64 M-56,-60 V72 M56,-60 V72', '#b9c2e8', 6) + [[-32, '#ff8fc0'], [0, '#7fd4ff'], [32, '#ffd36e']].map(([x, c]) => sP(`M${x - 6},-54 h12 l15,64 h-42Z`, c)).join('')],
  stool: ['Stool', () => sL('M-22,8 L-28,54 M22,8 L28,54', WOOD, 7) + sR(-36, -18, 72, 28, 14, '#ff8fc0')],
  screen: ['Screen', () => [-54, -17, 20].map((x, i) => sR(x, -70 + i % 2 * 6, 35, 140, 6, i % 2 ? '#e9dcff' : '#d0bfff') + heart(x + 17.5, -20, 14, '#fff')).join('')],
  tree: ['Apple tree', () => tree(0, 66, 1.15) + sC(-20, -30, 7, '#ff5c6c') + sC(18, -8, 7, '#ff5c6c') + sC(4, -50, 7, '#ff5c6c')],
  bush: ['Flower bush', () => sC(-30, 20, 30, '#58bd8a') + sC(30, 20, 30, '#6fcf97') + sC(0, 0, 36, '#4fae7a') + flower(-24, 6, 10, '#ff9ecb') + flower(20, -8, 10, '#fff') + flower(10, 26, 9, '#ffd36e', '#ff9e3d')],
  fountain: ['Fountain', () => sE(0, 50, 70, 20, '#d6dcf5') + sE(0, 44, 60, 14, '#8fd3ff') + sR(-9, -30, 18, 76, 6, '#e3e8ff') + sE(0, -30, 36, 10, '#d6dcf5') + sE(0, -34, 28, 6, '#8fd3ff') + sL('M0,-70 V-36 M0,-66 Q-30,-70 -34,-36 M0,-66 Q30,-70 34,-36', '#bfe9ff', 5)],
  bench: ['Bench', () => sL('M-54,-44 V48 M54,-44 V48', WOOD, 8) + sR(-66, -46, 132, 12, 6, PALE) + sR(-66, -28, 132, 10, 5, PALE) + sR(-70, -4, 140, 14, 6, PALE)],
  swing: ['Swing', () => sL('M-60,72 L-30,-74 H30 L60,72', WOOD, 8) + sL('M-18,-74 V20 M18,-74 V20', '#fff', 3) + sR(-28, 18, 56, 12, 5, '#ff8fc0')],
  gazebo: ['Gazebo', () => sL('M-60,-30 V60 M60,-30 V60 M-20,-30 V60 M20,-30 V60', '#fff', 8) + sR(-64, 28, 128, 8, 4, '#fff') + sP('M-78,-30 L0,-90 L78,-30Z', '#ff8fc0') + sC(0, -92, 7, GOLD) + sR(-74, 56, 148, 14, 6, '#e3e8ff')],
  lantern: ['Lantern', () => sR(-4, -30, 8, 98, 4, '#7a5cf0') + sC(0, -46, 28, '#ffe27a', 'opacity=".35"') + sR(-13, -64, 26, 36, 8, '#ffe27a') + sP('M-17,-64 L0,-80 L17,-64Z', '#7a5cf0')],
  birdbath: ['Bird bath', () => sP('M-10,60 L-6,-10 H6 L10,60Z', '#d6dcf5') + sE(0, 62, 30, 8, '#d6dcf5') + sE(0, -14, 42, 12, '#e3e8ff') + sE(0, -17, 34, 7, '#8fd3ff') + sC(14, -34, 11, '#ff9ecb') + sC(22, -44, 7, '#ff9ecb') + sP('M28,-46 l10,3 l-10,4Z', '#ffb347') + sC(24, -46, 1.5, '#3a2340')],
  mushroom: ['Mushroom', () => sR(-12, 0, 24, 50, 10, '#fff3e0') + sP('M-50,6 A50,46 0 0 1 50,6Z', '#ff6f91') + sC(-22, -14, 8, '#fff') + sC(12, -26, 9, '#fff') + sC(28, -6, 6, '#fff')],
  tulips: ['Tulips', () => [[-26, -10, '#ff5c8a'], [0, -30, '#ffd36e'], [26, -6, '#b79bff']].map(([x, y, c]) => sL(`M${x},56 V${y}`, '#58bd8a', 5) + sP(`M${x - 12},${y} q0,-22 6,-18 l6,-8 l6,8 q6,-4 6,18 q-12,10 -24,0Z`, c)).join('')],
  arch: ['Flower arch', () => sL('M-64,72 V-10 A64,64 0 0 1 64,-10 V72', '#58bd8a', 14) + [[-64, 44], [-64, 4], [-52, -42], [-26, -68], [0, -74], [26, -68], [52, -42], [64, 4], [64, 44]].map(([x, y], i) => flower(x, y, 11, ['#ff9ecb', '#fff', '#ff5c8a'][i % 3])).join('')],
  butterflies: ['Butterflies', () => EMB.butterfly(-30, -10, 22, '#ff9ecb') + EMB.butterfly(26, -34, 18) + EMB.butterfly(20, 26, 16, '#7fd4ff')],
  lounger: ['Sun lounger', () => sL('M-56,30 V52 M56,30 V52', '#fff', 6) + sP('M-74,32 L-44,-34 L-22,-26 L-38,10 H74 V32Z', '#7fd4ff') + sL('M-56,6 L-34,-30 M-20,20 H60', '#fff', 5, 'opacity=".7"')],
  umbrella: ['Parasol', () => sL('M0,-30 V70', '#c9b6e8', 6) + sE(0, 72, 22, 6, '#c9b6e8') + sP('M-74,-30 A74,58 0 0 1 74,-30Z', '#ff8fc0') + sP('M-26,-30 A26,58 0 0 1 26,-30Z', '#fff')],
  ring: ['Swim ring', () => sC(0, 0, 44, 'none', 'stroke="#ff8fc0" stroke-width="26"') + sC(0, 0, 44, 'none', 'stroke="#fff" stroke-width="26" stroke-dasharray="17 52"')],
  ball: ['Beach ball', () => sC(0, 0, 40, '#fff', 'stroke="#e3e8ff" stroke-width="2"') + sP('M0,-40 A40,40 0 0 1 34.600,-20 L0,0Z', '#ff5c8a') + sP('M34.600,20 A40,40 0 0 1 0,40 L0,0Z', '#ffd36e') + sP('M-34.600,20 A40,40 0 0 1 -34.600,-20 L0,0Z', '#7fd4ff')],
  slide: ['Water slide', () => sL('M40,-70 V62 M66,-70 V62 M40,-40 H66 M40,-10 H66 M40,20 H66', '#b9c2e8', 6) + sL('M44,-66 C-10,-60 -30,30 -76,52', '#7fd4ff', 24) + sL('M44,-66 C-10,-60 -30,30 -76,52', '#fff', 4, 'opacity=".6"')],
  palm: ['Palm tree', () => sL('M0,72 Q-12,0 6,-48', WOOD, 14) + [-70, -30, 10, 50, 90].map(a => sE(40, -50, 40, 12, a % 20 ? '#58bd8a' : '#4fae7a', `transform="rotate(${a - 90} 6 -50) translate(-0 0)"`)).join('') + sC(4, -44, 7, '#a9744a')],
  drinks: ['Drinks table', () => sL('M0,18 V64', '#c9b6e8', 6) + sE(0, 66, 22, 6, '#c9b6e8') + sR(-42, 8, 84, 10, 5, '#fff') + sP('M-28,-24 h18 l-3,32 h-12Z', '#ffb07a') + sP('M10,-24 h18 l-3,32 h-12Z', '#ff9ecb') + sL('M-16,-24 l6,-18 M22,-24 l6,-18', '#7a5cf0', 3)],
  duck: ['Duck float', () => sE(0, 20, 54, 30, '#ffd93d') + sC(30, -22, 24, '#ffd93d') + sP('M50,-24 l22,6 l-22,8Z', '#ff9e3d') + sC(36, -28, 4, '#3a2340') + sP('M-30,10 q20,-18 40,4 q-20,10 -40,-4Z', '#ffe98a')],
  towel: ['Towel', () => sR(-60, -26, 120, 52, 8, '#fff', 'stroke="#e3e8ff" stroke-width="2"') + sR(-60, -18, 120, 10, 0, '#ff8fc0') + sR(-60, 8, 120, 10, 0, '#7fd4ff')],
  petbed: ['Pet bed', () => sE(0, 20, 72, 32, '#b79bff') + sE(0, 12, 54, 20, '#f0e6ff') + heart(0, 12, 16, '#ff8fc0')],
  bowl: ['Food bowl', () => sP('M-40,0 H40 L30,36 H-30Z', '#ff8fc0') + sE(0, 0, 40, 10, '#ffb3d1') + sE(0, -2, 30, 7, WOOD) + sC(0, 22, 6, '#fff') + sC(-9, 13, 3, '#fff') + sC(0, 10, 3, '#fff') + sC(9, 13, 3, '#fff')],
  yarn: ['Yarn ball', () => sL('M30,16 q20,10 10,30 q-10,10 14,14', '#ff8fc0', 5) + sC(0, 0, 34, '#ff8fc0') + sL('M-28,-12 Q0,-30 28,-12 M-32,6 Q0,-12 32,6 M-24,22 Q0,4 24,22', '#fff', 3, 'opacity=".7"')],
  tower: ['Cat tower', () => sR(-8, -60, 16, 130, 4, '#f3d9b0') + sR(-50, -72, 100, 14, 7, '#b79bff') + sR(-62, -8, 72, 14, 7, '#ff8fc0') + sR(-56, 62, 112, 14, 7, '#b79bff') + sL('M36,-58 V-30', '#fff', 2) + sC(36, -22, 9, '#ffd36e')],
  kennel: ['Pet house', () => sR(-50, -14, 100, 86, 6, '#ffd1e6') + sP('M-62,-12 L0,-72 L62,-12Z', '#ff6fa8') + sP('M-22,72 V22 a22,22 0 0 1 44,0 V72Z', '#7a5cf0') + heart(0, -34, 16, '#fff')],
  bone: ['Bone', () => [[-34, -9], [-34, 9], [34, -9], [34, 9]].map(([x, y]) => sC(x, y, 12, '#fff', 'stroke="#e3e8ff" stroke-width="2"')).join('') + sR(-34, -8, 68, 16, 4, '#fff')],
  pawmat: ['Paw mat', () => sE(0, 0, 72, 46, '#ffd1e6') + sE(0, 12, 22, 16, '#ff8fc0') + [[-26, -8], [-9, -20], [9, -20], [26, -8]].map(([x, y]) => sC(x, y, 9, '#ff8fc0')).join('')],
  cake: ['Cake', () => sE(0, 56, 66, 8, '#fff') + sR(-50, 10, 100, 44, 10, '#ffd1e6') + sR(-36, -26, 72, 40, 10, '#fff') + sP('M-36,-14 q9,14 18,0 t18,0 t18,0 t18,0 V-26 H-36Z', '#ff8fc0') + [-18, 0, 18].map(x => sR(x - 3, -48, 6, 22, 2, '#7fd4ff') + sE(x, -54, 4, 7, '#ffb347')).join('') + [-30, 0, 30].map(x => heart(x, 32, 12, '#ff5c8a')).join('')],
  balloons: ['Balloons', () => sL('M-32,-8 Q-10,40 0,72 M0,-30 V72 M32,-8 Q10,40 0,72', '#fff', 2) + sE(-32, -34, 22, 28, '#ff5c8a') + sE(32, -34, 22, 28, '#7fd4ff') + sE(0, -56, 22, 28, '#ffd36e') + sE(-40, -44, 5, 8, '#fff', 'opacity=".6"') + sE(-8, -66, 5, 8, '#fff', 'opacity=".6"') + sE(24, -44, 5, 8, '#fff', 'opacity=".6"')],
  presents: ['Presents', () => sR(-56, 0, 60, 54, 6, '#ff8fc0') + sR(-30, 0, 8, 54, 0, '#fff') + bow(-26, -2, 10, '#fff') + sR(8, 16, 48, 38, 6, '#b79bff') + sR(28, 16, 8, 38, 0, '#ffe27a') + bow(32, 14, 9, '#ffe27a')],
  bunting: ['Bunting', () => sL('M-150,-20 Q0,40 150,-20', '#fff', 3) + [-126, -84, -42, 0, 42, 84, 126].map((x, i) => { const y = f1(curveY(x, -20, 10, 150)); return sP(`M${x - 14},${y} h28 l-14,30Z`, ['#ff5c8a', '#ffd36e', '#7fd4ff', '#b79bff'][i % 4]); }).join('')],
  lanterns: ['Lantern string', () => sL('M-150,-30 Q0,10 150,-30', '#fff', 3) + [-110, -55, 0, 55, 110].map((x, i) => { const y = +f1(curveY(x, -30, -10, 150)); return sC(x, y + 22, 24, '#ffe27a', 'opacity=".25"') + sE(x, y + 22, 15, 18, ['#ff8fa3', '#ffd36e', '#ffb07a'][i % 3]) + sR(x - 6, y + 2, 12, 5, 2, GOLD); }).join('')],
  cupcakes: ['Cupcake stand', () => sL('M0,-50 V56', '#c9b6e8', 5) + sE(0, 58, 30, 7, '#c9b6e8') + sE(0, 20, 56, 9, '#fff') + sE(0, -22, 38, 7, '#fff') + cupc(-30, 4, '#ff9ecb') + cupc(0, 2, '#7fd4ff') + cupc(30, 4, '#ffd36e') + cupc(-14, -38, '#b79bff') + cupc(14, -38, '#ff5c8a')],
  teatable: ['Tea table', () => sP('M-64,0 Q-50,50 -40,58 H40 Q50,50 64,0Z', '#ffd1e6') + sE(0, 0, 64, 18, '#fff') + sL('M18,-22 q14,-4 14,-16', '#ff8fc0', 5) + sE(0, -20, 20, 15, '#ff8fc0') + sC(0, -36, 5, '#ff8fc0') + sE(-38, -6, 10, 6, '#fff', 'stroke="#ffb3d1" stroke-width="2"') + sE(40, -4, 10, 6, '#fff', 'stroke="#ffb3d1" stroke-width="2"')],
  bouquet: ['Bouquet', () => sP('M-14,10 L0,66 L14,10Z', '#fff', 'stroke="#ffd1e6" stroke-width="2"') + flower(-18, -10, 16, '#ff9ecb') + flower(18, -10, 16, '#fff') + flower(0, -30, 17, '#ff5c8a', '#ffb3c6') + flower(0, 4, 14, '#c9a2ff') + bow(0, 34, 9, '#ff8fc0')],
  blanket: ['Picnic blanket', () => sP('M-84,10 L0,-32 L84,10 L0,58Z', '#ff8fc0') + sL('M-42,-11 L42,34 M42,-11 L-42,34', '#fff', 6, 'opacity=".5"') + sL('M14,-22 q18,-26 36,0', '#a9744a', 5) + sR(10, -24, 44, 30, 8, WOOD) + sC(-26, 6, 9, '#ff5c6c') + sC(-10, 16, 9, '#ffd36e')],
  snowman: ['Snowman', () => sC(0, 34, 36, '#fff', 'stroke="#d6e6ff" stroke-width="2"') + sC(0, -18, 26, '#fff', 'stroke="#d6e6ff" stroke-width="2"') + sR(-22, -4, 44, 10, 5, '#ff6f91') + sR(8, 0, 10, 26, 4, '#ff6f91') + sC(-9, -24, 3, '#3a2340') + sC(9, -24, 3, '#3a2340') + sP('M0,-18 l20,5 l-20,4Z', '#ff9e3d') + sC(0, 24, 3.5, '#3a2340') + sC(0, 40, 3.5, '#3a2340') + sR(-18, -66, 36, 26, 4, '#4b3a8f') + sR(-26, -44, 52, 7, 3, '#4b3a8f')],
  pine: ['Party pine', () => pine(0, 66, 1) + [[-20, 30, '#ff5c8a'], [16, 20, '#ffd36e'], [-8, -6, '#7fd4ff'], [10, -30, '#ff9ecb'], [28, 46, '#b79bff'], [-34, 52, '#ffd36e']].map(([x, y, c]) => sC(x, y, 5, c)).join('') + star(0, -58, 12, '#ffe27a')],
  sled: ['Sled', () => sL('M-62,24 H50 Q72,24 72,2 M-40,-2 V24 M30,-2 V24', WOOD, 6) + sR(-56, -16, 104, 14, 6, '#ff6f91')],
  chest: ['Treasure chest', () => sP('M-50,-6 Q0,-58 50,-6Z', '#a9744a') + sR(-50, -6, 100, 58, 8, WOOD) + sR(-50, 6, 100, 8, 0, GOLD) + sR(-8, -14, 16, 22, 4, GOLD) + gem(-26, -16, 7, '#fff') + gem(22, -20, 8, '#fff') + gem(0, -30, 6, '#ff9ecb')],
  coral: ['Coral', () => sL('M0,72 V10 M0,40 Q-30,30 -34,-10 M0,20 Q30,10 36,-30 M0,10 Q-6,-30 6,-60 M-34,-10 Q-50,-20 -48,-40 M36,-30 Q52,-36 50,-56', '#ff7da8', 12)],
  throne: ['Shell throne', () => EMB.ocean(0, -22, 62, '#ffb3d1') + sR(-46, 20, 92, 30, 12, '#ff8fc0') + sR(-52, 46, 104, 16, 6, '#ffd36e')],
  spotlight: ['Spotlight', () => sP('M4,-44 L-90,74 H10Z', '#fff6c9', 'opacity=".45"') + sL('M16,-30 L30,72 M30,72 L8,76 M30,72 L52,76', '#4b3a8f', 6) + sC(10, -50, 22, '#4b3a8f') + sC(4, -44, 13, '#fff6c9')],
  camera: ['Camera', () => sL('M0,10 L-26,74 M0,10 L26,74 M0,10 V74', '#4b3a8f', 5) + sR(14, -44, 16, 12, 3, '#7a5cf0') + sR(-34, -34, 68, 46, 10, '#7a5cf0') + sC(0, -10, 16, '#d6f1ff') + sC(0, -10, 8, '#4b3a8f') + star(36, -52, 15, '#fff')],
  bells: ['Wedding bells', () => sP('M-44,16 Q-46,-26 -22,-30 Q2,-26 0,16Z', GOLD) + sC(-22, 20, 7, '#f5a623') + sP('M0,16 Q-2,-26 22,-30 Q46,-26 44,16Z', '#ffd36e') + sC(22, 20, 7, '#f5a623') + bow(0, -34, 14, '#ff8fc0')],
};
const itemDef = t => IT[t] || (t === 'princess' && S ? ['Princess', () => `<g transform="translate(-58,-150) scale(.29)">${dollInner(S, 0)}</g>`] : typeof t === 'string' && t.startsWith('pet-') && hasPet(t.slice(4)) ? [PETMAP[t.slice(4)].name, () => `<g transform="translate(-50,-50) scale(.5)">${petInner(petOf(t.slice(4)))}</g>`] : null);

/* ---------- walls, floors, rugs ---------- */
const patFill = (bg, cell, size, y, h) => { const id = uid(); return `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">${cell}</pattern></defs><rect y="${y}" width="800" height="${h}" fill="${bg}"/><rect y="${y}" width="800" height="${h}" fill="url(#${id})"/>`; };
const wallIn = (bg, cell, size) => patFill(bg, cell, size, 0, 364) + `<rect y="350" width="800" height="14" fill="#fff"/>`;
const skyOut = (stops, extra) => { const [d, f] = vgrad(stops); return d + `<rect width="800" height="364" fill="${f}"/>` + extra + `<path d="M0,364 V320 Q200,270 400,315 T800,300 V364Z" fill="#b8e6b0"/>`; };
const WALLS = {
  hearts: ['Hearts', () => wallIn('#ffe6f2', heart(24, 24, 15, '#ffc2dc'), 48)],
  stripes: ['Stripes', () => wallIn('#e9dcff', `<rect width="24" height="48" fill="#fff" opacity=".5"/>`, 48)],
  stars: ['Stars', () => wallIn('#d6d4ff', star(24, 24, 9, '#fff'), 48)],
  clouds: ['Clouds', () => wallIn('#cfeaff', '', 48) + cloud(150, 120, .9) + cloud(520, 190, 1.1) + cloud(700, 90, .7)],
  mint: ['Mint dots', () => wallIn('#d9f5e6', `<circle cx="20" cy="20" r="5" fill="#fff"/>`, 40)],
  day: ['Sunny day', () => skyOut(['#8fd3ff', '#e6f6ff'], `<circle cx="660" cy="90" r="46" fill="#fff6c9"/>` + cloud(170, 110, 1) + cloud(460, 170, .8))],
  sunset: ['Sunset', () => skyOut(['#ff9e7d', '#ffd1e6'], `<circle cx="400" cy="300" r="90" fill="#fff6c9" opacity=".9"/>` + cloud(150, 130, .9, .6))],
  night: ['Starry night', () => skyOut(['#2b2a6b', '#6a57c4'], `<circle cx="640" cy="100" r="44" fill="#fff6c9"/>` + [[80, 70], [200, 150], [320, 60], [460, 130], [560, 220], [740, 230], [120, 240]].map(([x, y], i) => star(x, y, i % 2 ? 6 : 10, '#fff')).join(''))],
  rainbow: ['Rainbow', () => skyOut(['#cdeaff', '#fff0f7'], ['#ff8fa3', '#ffd36e', '#a8e26b', '#7fd4ff', '#b79bff'].map((c, i) => `<path d="M${130 + i * 16},364 A${270 - i * 16},${270 - i * 16} 0 0 1 ${670 - i * 16},364" stroke="${c}" stroke-width="16" fill="none" opacity=".8"/>`).join('') + cloud(130, 330, 1) + cloud(680, 330, 1))],
};
const FLOORS = {
  wood: ['Wood', () => patFill(PALE, `<path d="M0,0 H120 M0,40 H120 M40,0 V40 M100,40 V80" stroke="${WOOD}" stroke-width="2" opacity=".5"/>`, 80, 364, 236)],
  tiles: ['Pink tiles', () => patFill('#ffd9ea', `<path d="M0,0 H60 M0,0 V60" stroke="#fff" stroke-width="4"/>`, 60, 364, 236)],
  carpet: ['Soft carpet', () => patFill('#d9c9ff', `<circle cx="10" cy="10" r="2.500" fill="#fff" opacity=".7"/><circle cx="30" cy="30" r="2.500" fill="#fff" opacity=".7"/>`, 40, 364, 236)],
  checks: ['Checks', () => patFill('#ffd1e6', `<rect width="40" height="40" fill="#fff" opacity=".7"/><rect x="40" y="40" width="40" height="40" fill="#fff" opacity=".7"/>`, 80, 364, 236)],
  grass: ['Grass', () => patFill('#a8e2a0', `<path d="M10,30 l4,-12 l4,12 M50,60 l4,-12 l4,12" stroke="#7fcf7a" stroke-width="3" fill="none" stroke-linecap="round"/>`, 80, 364, 236)],
  meadow: ['Flower meadow', () => patFill('#b8eaa0', flower(20, 24, 6, '#fff') + flower(64, 62, 6, '#ff9ecb'), 88, 364, 236)],
  snow: ['Snow', () => patFill('#ffffff', `<ellipse cx="40" cy="30" rx="26" ry="6" fill="#e6f1ff"/>`, 110, 364, 236)],
  sand: ['Sand', () => patFill('#ffe7b0', `<circle cx="10" cy="14" r="2" fill="#e9c98a"/><circle cx="34" cy="38" r="2" fill="#e9c98a"/>`, 48, 364, 236)],
  deck: ['Wooden deck', () => patFill('#f3d9b0', `<path d="M0,0 H120 M0,30 H120 M30,0 V30 M90,30 V60" stroke="${WOOD}" stroke-width="2" opacity=".45"/>`, 60, 364, 236)],
  bluetiles: ['Blue tiles', () => patFill('#cfeaff', `<path d="M0,0 H50 M0,0 V50" stroke="#fff" stroke-width="4"/>`, 50, 364, 236)],
};
const flat = (inner) => `<g transform="translate(400,492) scale(1,.42)">${inner}</g>`;   // lay a shape down on the floor
const water = (shape) => flat(shape('#fff', 1.08) + shape('#7fd4ff', 1)) + `<path d="M330,476 q14,-8 28,0 t28,0 M410,512 q14,-8 28,0 t28,0" stroke="#fff" stroke-width="4" fill="none" opacity=".8" stroke-linecap="round"/>`;
const RUGS = {
  none: ['No rug', () => ''],
  round: ['Round rug', () => sE(400, 492, 180, 64, '#ff9ecb') + sE(400, 492, 150, 50, '#ffc2dc') + sE(400, 492, 80, 26, '#fff', 'opacity=".6"')],
  heart: ['Heart rug', () => flat(heart(0, 0, 170, '#ff8fc0') + heart(0, 0, 110, '#ffc2dc'))],
  star: ['Star rug', () => flat(star(0, 0, 170, '#ffe27a') + star(0, 0, 100, '#fff6c9'))],
  rainbow: ['Rainbow rug', () => ['#ff8fa3', '#ffd36e', '#a8e26b', '#7fd4ff', '#b79bff'].map((c, i) => sE(400, 492, 190 - i * 32, 68 - i * 12, c)).join('')],
  path: ['Stone path', () => [[400, 400, 30], [380, 440, 36], [410, 486, 42], [380, 536, 48], [410, 588, 54]].map(([x, y, r]) => sE(x, y, r, r * .36, '#e3e8ff')).join('')],
  pond: ['Lily pond', () => sE(400, 492, 190, 66, '#7fd4ff') + sE(400, 486, 150, 46, '#a6e2ff') + [[320, 490], [450, 510], [420, 466]].map(([x, y]) => sE(x, y + 8, 24, 8, '#58bd8a') + EMB.lotus(x, y, 12)).join('')],
  flowerbed: ['Flower ring', () => sE(400, 492, 180, 62, '#8a5a44', 'opacity=".5"') + Array.from({ length: 14 }, (_, i) => flower(Math.round(400 + Math.cos(i * .449) * 164), Math.round(492 + Math.sin(i * .449) * 54), 12, ['#ff9ecb', '#fff', '#ffd36e'][i % 3])).join('')],
  oval: ['Oval pool', () => water((c, k) => `<ellipse rx="${250 * k}" ry="${180 * k}" fill="${c}"/>`)],
  heartpool: ['Heart pool', () => water((c, k) => heart(0, 0, 230 * k, c))],
  starpool: ['Star pool', () => water((c, k) => star(0, 0, 230 * k, c))],
  long: ['Long pool', () => water((c, k) => `<rect x="${-270 * k}" y="${-170 * k}" width="${540 * k}" height="${340 * k}" rx="90" fill="${c}"/>`)],
};
const IN_WALLS = ['hearts', 'stripes', 'stars', 'clouds', 'mint'], OUT_WALLS = ['day', 'sunset', 'night', 'rainbow'], IN_FLOORS = ['wood', 'tiles', 'carpet', 'checks'], IN_RUGS = ['none', 'round', 'heart', 'star', 'rainbow'];
const ROOMS = [
  { id: 'bedroom', name: 'Bedroom', walls: IN_WALLS, floors: IN_FLOORS, rugs: IN_RUGS, items: ['bed', 'wardrobe', 'lamp', 'armchair', 'bookshelf', 'window', 'frame', 'teddy', 'toybox', 'plant', 'chandelier', 'desk'], start: [['window', 400, 190, 110, 0], ['bed', 250, 410, 130, 0], ['lamp', 560, 330, 100, 0]] },
  { id: 'dressing', name: 'Dressing room', walls: ['stripes', 'hearts', 'stars', 'mint', 'clouds'], floors: ['carpet', 'tiles', 'wood', 'checks'], rugs: IN_RUGS, items: ['mirror', 'mannequin', 'shoerack', 'hatstand', 'vanity', 'rail', 'stool', 'screen', 'lamp', 'frame', 'chandelier', 'plant'], start: [['vanity', 400, 330, 130, 0], ['mannequin', 630, 370, 120, 0]] },
  { id: 'garden', name: 'Garden', walls: OUT_WALLS, floors: ['grass', 'meadow', 'snow', 'sand'], rugs: ['none', 'path', 'pond', 'flowerbed'], items: ['tree', 'bush', 'fountain', 'bench', 'swing', 'gazebo', 'lantern', 'birdbath', 'mushroom', 'tulips', 'arch', 'butterflies'], start: [['tree', 130, 330, 150, 0], ['bench', 620, 400, 110, 0]] },
  { id: 'pool', name: 'Swimming pool', walls: OUT_WALLS, floors: ['deck', 'bluetiles', 'sand', 'grass'], rugs: ['oval', 'heartpool', 'starpool', 'long'], items: ['lounger', 'umbrella', 'ring', 'ball', 'slide', 'palm', 'drinks', 'duck', 'towel', 'bush'], start: [['umbrella', 680, 320, 130, 0], ['duck', 400, 480, 70, 0]] },
  { id: 'pethouse', name: 'Pet house', walls: ['mint', 'clouds', 'hearts', 'stars', 'stripes'], floors: ['wood', 'carpet', 'checks', 'tiles'], rugs: IN_RUGS, items: ['petbed', 'bowl', 'yarn', 'tower', 'kennel', 'bone', 'pawmat', 'toybox', 'plant', 'window', 'ball'], start: [['kennel', 210, 350, 150, 0], ['bowl', 540, 480, 100, 0]] },
];
const RMAP = Object.fromEntries(ROOMS.map(r => [r.id, r]));
const PARTY_ITEMS = ['cake', 'balloons', 'presents', 'bunting', 'lanterns', 'cupcakes', 'teatable', 'bouquet', 'blanket', 'snowman', 'pine', 'chest'];
const cz = { room: 'bedroom', cat: 'things', sel: -1, drag: null };
const okItem = a => Array.isArray(a) && itemDef(a[0]) && [1, 2, 3].every(i => Number.isFinite(a[i]));
function roomState(id) {
  const def = RMAP[id]; let r = save.castle[id]; if (!r || typeof r !== 'object' || Array.isArray(r)) r = save.castle[id] = {};
  if (!def.walls.includes(r.wall)) r.wall = def.walls[0]; if (!def.floors.includes(r.floor)) r.floor = def.floors[0]; if (!def.rugs.includes(r.rug)) r.rug = def.rugs[0];
  r.items = Array.isArray(r.items) ? r.items.filter(okItem).slice(0, 40) : def.start.map(a => a.slice());
  return r;
}
function roomInner(id, sel = -1) {
  const r = roomState(id);
  return WALLS[r.wall][1]() + FLOORS[r.floor][1]() + RUGS[r.rug][1]() + r.items.map((a, i) => `<g data-it="${i}" transform="translate(${a[1]},${a[2]}) rotate(${+a[5] || 0}) scale(${(a[4] ? -1 : 1) * a[3] / 100},${a[3] / 100})"><rect x="-60" y="-70" width="120" height="140" fill="transparent"/>${itemDef(a[0])[1]()}${i === sel ? `<circle r="88" fill="none" stroke="#ff4f9a" stroke-width="4" stroke-dasharray="10 9"/>` : ''}</g>`).join('');
}
const roomSvg = (id, sel) => `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">${roomInner(id, sel)}</svg>`;

/* ---------- the designer ---------- */
function renderCastle() {
  view.innerHTML = `<section class="studio">
    <div class="stage roomstage" id="stage"><div class="roomsvg" id="room"></div><div class="plate"><b>My castle</b> · <span id="roomName"></span></div>${histButtons()}
      <div class="itbar" id="itbar" hidden><button class="round" data-itact="big" aria-label="Bigger"><svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg></button><button class="round" data-itact="small" aria-label="Smaller"><svg viewBox="0 0 24 24"><path d="M5 11h14v2H5z"/></svg></button><button class="round" data-itact="flip" aria-label="Flip"><svg viewBox="0 0 24 24"><path d="M11 3h2v18h-2zM9 7v10l-6-5zM15 7l6 5-6 5z"/></svg></button><button class="round" data-itact="turn" aria-label="Turn"><svg viewBox="0 0 24 24"><path d="M12 5V1l5.500 5L12 11V7a5 5 0 1 0 5 5h2a7 7 0 1 1-7-7z"/></svg></button><button class="round" data-itact="del" aria-label="Take away"><svg viewBox="0 0 24 24"><path d="M7 6l1-2h8l1 2h3v2H4V6zM6 9h12l-1 12H7z"/></svg></button></div></div>
    <div class="panel"><div class="hint" id="hint"></div>
      <div class="tabs">${ROOMS.map(r => `<button class="tab" data-room="${r.id}">${r.name}</button>`).join('')}</div>
      <div class="tabs sub" id="rcats"></div><div class="opts" id="ropts"></div></div>
    <div class="nav"><button class="btn ghost" data-go="world">${ico(IC.map)}Map</button><button class="btn" id="roomPhoto">${ico(IC.cam)}Save a photo</button></div></section>`;
  paintRoom(); renderRoomOpts(); syncHist();
}
function paintRoom() {
  const el = $('#room'); if (!el) return;
  el.innerHTML = roomSvg(cz.room, cz.sel); $('#itbar').hidden = cz.sel < 0;
}
let roomDue = false;
const queueRoom = () => { if (roomDue) return; roomDue = true; requestAnimationFrame(() => { roomDue = false; paintRoom(); }); };
function renderRoomOpts() {
  const def = RMAP[cz.room], r = roomState(cz.room), out = OUT_WALLS.includes(def.walls[0]);
  const cats = [['things', 'Furniture'], ['wall', out ? 'Sky' : 'Walls'], ['floor', out ? 'Ground' : 'Floor'], ['rug', cz.room === 'pool' ? 'Pool' : out ? 'Middle' : 'Rug'], ['party', 'Party'], ['friends', 'Friends']];
  $('#roomName').textContent = def.name;
  document.querySelectorAll('.tab[data-room]').forEach(b => b.setAttribute('aria-selected', b.dataset.room === cz.room));
  $('#rcats').innerHTML = cats.map(([id, n]) => `<button class="tab" data-rcat="${id}" aria-selected="${cz.cat === id}">${n}</button>`).join('');
  const layer = (key, list, lib, vb) => list.map(id => `<button class="opt" data-ropt="${key}:${id}" aria-pressed="${r[key] === id}"><svg viewBox="${vb}">${key === 'rug' ? FLOORS[r.floor][1]() : ''}${lib[id][1]()}</svg><span>${lib[id][0]}</span></button>`).join('');
  const tray = list => list.filter(itemDef).map(t => `<button class="opt tray" data-item="${t}"><svg viewBox="-92 -96 184 184">${itemDef(t)[1]()}</svg><span>${itemDef(t)[0]}</span></button>`).join('');
  $('#ropts').innerHTML = cz.cat === 'wall' ? layer('wall', def.walls, WALLS, '0 0 800 364') : cz.cat === 'floor' ? layer('floor', def.floors, FLOORS, '200 364 300 236') : cz.cat === 'rug' ? layer('rug', def.rugs, RUGS, '150 384 500 216')
    : tray(cz.cat === 'party' ? PARTY_ITEMS : cz.cat === 'friends' ? ['princess', ...PETS.map(p => 'pet-' + p.id)] : def.items);
  setHint(cz.cat === 'things' || cz.cat === 'party' || cz.cat === 'friends' ? 'Tap or drag a thing into the room. Move it with one finger; pinch with two to resize and turn it.' : 'Tap to change the room.');
}
function roomPt(e) { const svg = $('#room svg'), m = svg && svg.getScreenCTM(); if (!m) return [400, 400]; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return [Math.round(Math.max(20, Math.min(780, p.x))), Math.round(Math.max(40, Math.min(580, p.y)))]; }
function addItem(t, x, y) {
  const r = roomState(cz.room); if (r.items.length >= 40) { toast('This room is full. Take something away first.'); return -1; }
  pushHist(); r.items.push([t, x, y, t === 'princess' ? 130 : 100, 0]); cz.sel = r.items.length - 1; sfx.pick();
  if (r.items.length >= 5 && !save.found['room-' + cz.room]) { save.found['room-' + cz.room] = 1; earn(1, `The ${RMAP[cz.room].name.toLowerCase()} looks lovely!`); }
  return cz.sel;
}
/* pointer handling for the room (gesture kind "room"; the shared rules live in salon.js) */
function trayClear(d) { clearTimeout(d.timer); d.el.classList.remove('held', 'lifted'); if (d.ghost) d.ghost.remove(); d.ghost = null; dropGlow(false); }
G.resets.push(() => { const d = cz.drag; cz.drag = null; cz.pin = null; if (d && d.fresh) trayClear(d); });
window.addEventListener('pointerdown', e => {
  if (save.stage !== 'castle' || G.id !== null || (e.pointerType === 'mouse' && e.button) || !e.target.closest) return;
  const tray = e.target.closest('[data-item]');
  if (tray) { const d = cz.drag = press(e, { fresh: tray.dataset.item, el: tray }); holdTimer(d, () => cz.drag === d); return; }
  if (!e.target.closest('#room')) return;
  const g = e.target.closest('[data-it]'), r = roomState(cz.room);
  if (!g) { if (cz.sel >= 0) { cz.sel = -1; paintRoom(); } return; }
  if (!claim(e, 'room')) return;
  pushHist(); const it = r.items.splice(+g.dataset.it, 1)[0]; r.items.push(it); cz.sel = r.items.length - 1;   // picked-up things come to the front
  const [x, y] = roomPt(e); cz.drag = { dx: it[1] - x, dy: it[2] - y, moved: false }; paintRoom(); e.preventDefault();
});
window.addEventListener('pointermove', e => {
  const d = cz.drag; if (!d || save.stage !== 'castle') return;
  if (d.fresh) {                                          // carrying a new thing out of the tray
    if (e.pointerId !== d.pid) return;
    if (!d.live) { if (G.id !== null || !lifted(d, e) || !claim(e, 'room')) return; d.live = true; G.block = true; d.el.classList.add('lifted'); const svg = d.el.querySelector('svg'); d.ghost = makeGhost(svg ? svg.outerHTML : ''); sfx.tap(); }
    const [hx, hy] = hot(d, e), at = { clientX: hx, clientY: hy }, inside = inStage(at); placeGhost(d.ghost, hx, hy); dropGlow(true, inside);
    if (!inside) return;
    trayClear(d); const [x, y] = roomPt(at), [fx, fy] = roomPt(e);         // over the room it becomes real and keeps following the finger
    if (addItem(d.fresh, x, y) < 0) { cz.drag = null; release(); return; }
    cz.drag = { dx: x - fx, dy: y - fy, moved: true }; return queueRoom();
  }
  if (!mine(e, 'room')) return;
  const it = roomState(cz.room).items[cz.sel], [x, y] = roomPt(e); if (!it) return;
  it[1] = clamp(x + d.dx, 20, 780); it[2] = clamp(y + d.dy, 40, 580); d.moved = true; queueRoom();
});
const endRoomDrag = e => {
  const d = cz.drag; if (!d || save.stage !== 'castle') return;
  if (d.fresh) {
    if (e.pointerId !== d.pid) return;
    cz.drag = null;
    if (d.live) { if (d.ghost) { flyBack(d.ghost, d.el); d.ghost = null; } trayClear(d); release(); G.ate = performance.now(); return; }   // let go outside the room: nothing is added
    trayClear(d); G.block = false;
    if (e.type !== 'pointerup' || d.scroll) return;       // the tray was being scrolled
    if (addItem(d.fresh, 400 + Math.round(rnd(-120, 120)), 440 + Math.round(rnd(-40, 60))) >= 0) { persist(); paintRoom(); }
    return;
  }
  if (!mine(e, 'room')) return;
  cz.drag = null; release();
  if (!d.moved) { hist.undo.pop(); syncHist(); }          // just a tap: nothing to undo
  persist(); paintRoom();
};
window.addEventListener('pointerup', endRoomDrag); window.addEventListener('pointercancel', endRoomDrag);
/* two fingers on the selected thing: spread to resize, twist to turn */
function roomPinchStart() { const it = roomState(cz.room).items[cz.sel]; if (!it) return false; if (!cz.drag) pushHist(); cz.drag = null; cz.pin = { s: it[3], r: +it[5] || 0 }; return true; }
function roomPinchMove(k, deg) { const it = roomState(cz.room).items[cz.sel]; if (!it || !cz.pin) return; it[3] = Math.round(clamp(cz.pin.s * k, 40, 240)); it[5] = Math.round(cz.pin.r + deg); queueRoom(); }
function roomPinchEnd() { cz.pin = null; persist(); paintRoom(); }

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.room && RMAP[t.dataset.room]) { cz.room = t.dataset.room; cz.sel = -1; cz.cat = 'things'; sfx.tap(); if (save.stage !== 'castle') return go('castle'); paintRoom(); return renderRoomOpts(); }
  if (save.stage !== 'castle') return;
  if (t.dataset.rcat) { cz.cat = t.dataset.rcat; sfx.tap(); return renderRoomOpts(); }
  if (t.dataset.ropt) { const [key, id] = t.dataset.ropt.split(':'), r = roomState(cz.room); if (r[key] === id) return; pushHist(); r[key] = id; persist(); paintRoom(); renderRoomOpts(); return sfx.pick(); }
  if (t.dataset.itact) {
    const r = roomState(cz.room), it = r.items[cz.sel]; if (!it) return; pushHist();
    if (t.dataset.itact === 'big') it[3] = Math.min(240, it[3] + 20); else if (t.dataset.itact === 'small') it[3] = Math.max(40, it[3] - 20); else if (t.dataset.itact === 'flip') it[4] = it[4] ? 0 : 1; else if (t.dataset.itact === 'turn') it[5] = ((+it[5] || 0) + 15) % 360; else { r.items.splice(cz.sel, 1); cz.sel = -1; }
    persist(); paintRoom(); return sfx.tap();
  }
  if (t.id === 'roomPhoto') return svgToPng(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 800 600">${roomInner(cz.room)}</svg>`, 1200, 900, `my-castle-${cz.room}.png`);
});
