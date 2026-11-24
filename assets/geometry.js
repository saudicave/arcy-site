/*
  Shared geometry for the home stage (assets/stage.js, in the browser) and the static plates (plates.mjs, at
  build time). Pure functions and data only: no DOM, no Node APIs, so both sides import the same file and the
  drawings agree. Units are metres; x east, y south (plan down the page), z up.
*/

// ---------- the courtyard house ----------
export const HOUSE = { W: 20, D: 16, H1: 3.4, H2: 6.8, PAR: 4.4, T: 0.3 };

// Boxes [x0, y0, z0, x1, y1, z1, tag]. Tags: 'wall', 'slab', 'col', 'step', 'screen'. The whole house, both halves;
// the section plane clips it at run time.
export function houseBoxes() {
  const { W, D, H1, H2, PAR, T } = HOUSE;
  const b = [
    [0, 0, -0.4, W, D, 0, 'slab'],
    [0, 0, 0, W, T, H2, 'wall'], [0, D - T, 0, W, D, PAR, 'wall'],
    [0, T, 0, T, 5, H2, 'wall'], [0, 5, 0, T, D - T, PAR, 'wall'],
    [W - T, T, 0, W, 5, H2, 'wall'], [W - T, 5, 0, W, D - T, PAR, 'wall'],
    [T, T, H1 - T, W - T, 5, H1, 'slab'],
    [T, 5, H1 - T, 6, D - T, H1, 'slab'], [14, 11, H1 - T, W - T, D - T, H1, 'slab'],
    [6 - .15, 5, 0, 6 + .15, 11, PAR, 'wall'], [14 - .15, 5, 0, 14 + .15, 11, PAR, 'wall'],
    [6, 11 - .15, 0, 14, 11 + .15, PAR, 'wall'],
    [10 - .15, T, 0, 10 + .15, 4.85, H2, 'wall'],
    [6, 4.85, H1 - T, 14, 5.15, H2, 'screen'],
    [T, 4.85, H1 - T, 6 - .15, 5.15, H2, 'wall'], [14 + .15, 4.85, H1 - T, W - T, 5.15, H2, 'wall'],
    [T, 11 - .15, 0, 6 - .15, 11 + .15, H1, 'wall'],
  ];
  for (const x of [6, 8, 10, 12, 14]) b.push([x - .15, 4.85, 0, x + .15, 5.15, H1 - T, 'col']);
  for (let i = 0; i < 10; i++) b.push([14.6 + i * 0.45, 5.6, 0, 14.6 + (i + 1) * 0.45, 7.2, (i + 1) * H1 / 10, 'step']);
  return b;
}

// Rooms of the ground floor for hover: [name key, x0, y0, x1, y1] (inside faces of walls).
export const ROOMS = [
  ['majlis', 0.3, 0.3, 9.85, 4.85], ['family', 10.15, 0.3, 19.7, 4.85], ['courtyard', 6.15, 5.15, 13.85, 10.85],
  ['guest', 0.3, 5, 5.85, 10.85], ['stair', 14.15, 5, 19.7, 10.85], ['service', 0.3, 11.15, 5.85, 15.7],
  ['entrance', 6.15, 11.15, 19.7, 15.7],
];

// Wall centrelines of the plan (for the sketch stage): [x0, y0, x1, y1].
export const PLAN_LINES = [
  [0, 0, 20, 0], [20, 0, 20, 16], [20, 16, 0, 16], [0, 16, 0, 0],
  [10, 0, 10, 5], [0, 5, 20, 5], [6, 5, 6, 11], [14, 5, 14, 11], [0, 11, 20, 11],
];

// People: [x, y, z] of their feet.
export const PEOPLE = [[10, 8, 0], [17.5, 6.4, 0], [4, 2.5, 3.4], [12, 13, 0]];

// ---------- deterministic randomness ----------
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ---------- the city: a fabric with urban logic around the house ----------
// A souq street runs east-west with trees along both sides; cross streets and lanes cut the land into blocks
// aligned to them; each block is divided into plots along its street frontages, most plots with a courtyard;
// deep blocks keep one plot in the middle with no street frontage (the review finds it). A mosque block turns
// its prayer hall to the qibla (bearing computed for Riyadh); a wadi bends along the south with a park on its bank.
// Every element is generated from this description with a fixed seed, so the drawing is stable.
export function qiblaBearing(lat = 24.71, lon = 46.68) {
  const r = Math.PI / 180, la1 = lat * r, la2 = 21.4225 * r, dl = (39.8262 - lon) * r;
  const y = Math.sin(dl) * Math.cos(la2), x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dl);
  return (Math.atan2(y, x) / r + 360) % 360;
}
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const rot = (pts, cx, cy, a) => pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
export function city(seed = 11) {
  const R = rng(seed);
  const souq = [-14, -6];                                   // the souq street's kerbs (y)
  const xs = [-150, -96, -90, -44, -38, 38, 44, 92, 98, 150]; // block edges in x: pairs are streets (6 m)
  const ys = [-120, -64, -59, -14, -6, 34, 39, 84];            // block edges in y: lanes of 5 m, the souq of 8 m
  const wadiY = x => 96 + 9 * Math.sin(x / 37) + 4 * Math.sin(x / 13);
  const plots = [], trees = [], streets = [], cars = [];
  let mosque = null;
  for (let i = 0; i < xs.length - 1; i += 2) for (let j = 0; j < ys.length - 1; j += 2) {
    const x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
    if (i === 6 && j === 2) { // the mosque block, on the souq
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, a = (qiblaBearing() - 180) * Math.PI / 180;
      mosque = { site: rect(x0 + 2, y0 + 2, x1 - 2, y1 - 2), hall: rot(rect(cx - 16, cy - 12, cx + 16, cy + 2), cx, cy, a), court: rot(rect(cx - 12, cy + 4, cx + 12, cy + 16), cx, cy, a), minaret: rot([[cx + 18, cy + 14]], cx, cy, a)[0], cx, cy, bearing: qiblaBearing() };
      continue;
    }
    const deep = y1 - y0 > 40;
    // plots along the north and south frontages
    for (const [fy0, fy1] of deep ? [[y0, y0 + (y1 - y0) * 0.4], [y1 - (y1 - y0) * 0.4, y1]] : [[y0, y1]]) {
      let x = x0;
      while (x < x1 - 6) {
        const w = Math.min(x1 - x, 11 + R() * 12);
        if (x1 - (x + w) < 7) { /* merge a sliver into this plot */ }
        const px1 = x1 - (x + w) < 7 ? x1 : x + w;
        const house = !deep ? false : (x0 <= 0 && x1 >= 20 && fy0 < 0 && fy1 > 16 && x <= 0 && px1 >= 0);
        // A plot holds the street line at its front; its back edge is ragged (plots differ in depth, and the
        // rear corners are not square), and its courtyard sits towards the back, as in a courtyard house.
        const north = fy0 === y0, depth = (fy1 - fy0) * (0.72 + R() * 0.28);
        const fa = north ? fy0 : fy1, fb = north ? fy0 + depth : fy1 - depth, j = () => (R() - 0.5) * 2.2;
        const pts = north ? [[x, fa], [px1, fa], [px1, fb + j()], [x, fb + j()]] : [[x, fb + j()], [px1, fb + j()], [px1, fa], [x, fa]];
        const cw = (px1 - x) * (0.32 + R() * 0.2), ch = depth * (0.26 + R() * 0.16);
        const ccx = (x + px1) / 2 + (R() - 0.5) * 2, ccy = north ? fa + depth * 0.58 : fa - depth * 0.58;
        plots.push({ pts, cx: (x + px1) / 2, cy: (fa + fb) / 2, court: R() < 0.85 ? rect(ccx - cw / 2, ccy - ch / 2, ccx + cw / 2, ccy + ch / 2) : null });
        x = px1;
      }
    }
    if (deep) { // the middle strip: plots reached by a cul-de-sac from the west, except one that is landlocked
      const my0 = y0 + (y1 - y0) * 0.4, my1 = y1 - (y1 - y0) * 0.4, lane = (my0 + my1) / 2;
      let x = x0, k = 0;
      while (x < x1 - 8) {
        const px1 = Math.min(x1, x + 14 + R() * 8);
        plots.push({ pts: rect(x, my0, px1, my1), cx: (x + px1) / 2, cy: (my0 + my1) / 2, court: null, interior: k > 1 && px1 < x1 - 10 });
        x = px1; k++;
      }
      streets.push(rect(x0, lane - 1.5, x0 + (x1 - x0) * 0.35, lane + 1.5)); // the cul-de-sac reaches only the first plots
    }
  }
  // The house replaces the plots it sits on.
  const inHouse = q => q.cx > -4 && q.cx < 24 && q.cy > -6 && q.cy < 34 && q.cy < 20;
  for (let i = plots.length - 1; i >= 0; i--) if (inHouse(plots[i])) plots.splice(i, 1);
  plots.push({ pts: rect(0, -6, 20, 18), cx: 10, cy: 6, house: true, court: rect(6.15, 5.15, 13.85, 10.85) });
  // Trees along the souq, both sides, every 9 m; a park along the wadi.
  for (let x = -148; x < 148; x += 9) { trees.push([x + R() * 1.5, souq[0] - 1.6, 2.2 + R() * 0.8]); trees.push([x + 4 + R() * 1.5, souq[1] + 1.6, 2.2 + R() * 0.8]); }
  for (let x = -146; x < 146; x += 6 + R() * 5) trees.push([x, 88 + R() * (wadiY(x) - 92), 2.5 + R() * 2]);
  for (let k = 0; k < 9; k++) cars.push([-140 + k * 33 + R() * 10, k % 2 ? -12 : -8, k % 2 ? Math.PI : 0]);
  const wadi = { north: [], south: [] };
  for (let x = -150; x <= 150; x += 6) { wadi.north.push([x, wadiY(x)]); wadi.south.push([x, wadiY(x) + 14 + 3 * Math.sin(x / 21)]); }
  // Review: the landlocked plot nearest the house.
  let review = 0, best = Infinity;
  plots.forEach((q, i) => { if (!q.interior) return; const d = Math.hypot(q.cx - 10, q.cy - 8); if (d < best) { best = d; review = i; } });
  return { blocks: plots, review, trees, cars, mosque, wadi, streets, souq, bounds: [-150, -120, 150, 112] };
}

// ---------- sun position (NOAA approximation) ----------
// Riyadh, 24.71 N 46.68 E, solar time. Returns azimuth from north (clockwise) and elevation, in radians.
export const RIYADH = { lat: 24.71, lon: 46.68 };
export function sun(dayOfYear, solarHour, lat = RIYADH.lat) {
  const g = 2 * Math.PI / 365 * (dayOfYear - 1 + (solarHour - 12) / 24);
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = (solarHour - 12) * Math.PI / 12, la = lat * Math.PI / 180;
  const el = Math.asin(Math.sin(la) * Math.sin(decl) + Math.cos(la) * Math.cos(decl) * Math.cos(ha));
  let az = Math.acos(Math.max(-1, Math.min(1, (Math.sin(decl) - Math.sin(el) * Math.sin(la)) / (Math.cos(el) * Math.cos(la)))));
  if (ha > 0) az = 2 * Math.PI - az;
  return { az, el };
}
