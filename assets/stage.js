/*
  The home stage: one continuous drawing that the visitor drives by scrolling (direction A, round 3).

  P runs from 0 to 8 across a pinned section; each unit is one stage. Stage 2 (the agent seen working on the
  finished plan: its named cursor, the region it works in, its plan ticking itself) is drawn over the plan held
  at rest; inner(P) gives the drawing clock p of the seven stages below, whose geometry carries through:
    0 sketch      wall centrelines drawn as loose, wobbling strokes that tighten as p rises
    1 plan        the strokes become walls (thickness grows to the real 0.3 m), cut walls fill, dimension chains tick in
    2 axonometric the camera tilts from plan to a 32 degree view and turns; walls rise storey by storey, the stair
                  climbs step by step, the Central Najdi parapet's five-stepped crenellations rise last
    3 section     a section plane sweeps through and the house opens: what it cuts fills black, people appear inside
    4 city        the camera pulls back to plan; the house flattens into its footprint, one block of a generated fabric
                  (spine street, lanes, a square); a review mark lands on one block with its clause
    5 chart       the city's blocks slide into the cells of the measured chart (numbers from data/results via the page)
    6 mark        the chart's cells fold onto the outline of the ARCY mark, which fills
  Interactions: drag (or arrow keys) turns the house in stages 2-3; the sun slider moves the sun over Riyadh and
  the shadows are recomputed; in stage 3 the section follows the pointer (or its slider); hovering a room in the plan
  writes its dimensions and area; a crosshair shows ground coordinates in metres.
  Hidden lines: boxes are cut into pieces no longer than 1.2 m, back faces are culled, and pieces are drawn far to near
  (painter's order on short pieces), with internal seams left unstroked.
  Words: the text beside the drawing is a function of the same p (words.js): it enters with a stage's drawing,
  holds while the drawing rests, and leaves as the next drawing starts.
  Performance: everything is drawn on one canvas, only when something changed, and nothing runs off screen.
*/
import { HOUSE, houseBoxes, ROOMS, PLAN_LINES, PEOPLE, rng, city, sun } from './geometry.js';
import { bindWords } from './words.js';

const DATA = JSON.parse(document.getElementById('stage-data').textContent);
const L = DATA.text;
const root = document.documentElement;
const rtl = root.dir === 'rtl';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- colours from tokens (light-dark resolved through a probe) ----------
const probe = document.createElement('span'); probe.style.display = 'none'; document.body.append(probe);
let C = {};
function readColours() {
  const get = v => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
  C = { agent: get('--agent'), ink: get('--ink'), ink2: get('--ink-2'), ink3: get('--ink-3'), line: get('--line-ink'), rule: get('--rule'), paper: get('--table'), fault: get('--fault') };
  const dark = matchMedia('(prefers-color-scheme: dark)').matches && root.dataset.theme !== 'light' || root.dataset.theme === 'dark';
  C.dark = dark;
  C.shadow = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.10)';
}

// ---------- geometry, prepared once ----------
const { T, H1, H2, PAR } = HOUSE;
const boxes = houseBoxes();
// Central Najdi parapet: five-stepped triangular crenellations (DASC Central Najdi guidelines, G25), on the outer
// walls' tops; parapet 0.3-0.8 m (p9), drawn at 0.6 m with five steps.
const CREN = 0.6, STEP = CREN / 5;
function crenellations() {
  const out = [];
  const runs = [[0, 0, 20, 0, H2], [0, 16, 20, 16, PAR], [0, 0, 0, 5, H2], [0, 5, 0, 16, PAR], [20, 0, 20, 5, H2], [20, 5, 20, 16, PAR]];
  for (const [x0, y0, x1, y1, z] of runs) {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(len / 1.0);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * len / n;
      const cx = x0 + (x1 - x0) * u / len, cy = y0 + (y1 - y0) * u / len;
      for (let s = 0; s < 5; s++) {
        const half = 0.35 * (1 - s / 5.5), along = x1 !== x0;
        out.push(along ? [cx - half, cy - T / 2 + (y0 === 0 ? T / 2 : -T / 2), z + s * STEP, cx + half, cy + T / 2 + (y0 === 0 ? T / 2 : -T / 2), z + (s + 1) * STEP, 'cren']
                       : [cx - T / 2 + (x0 === 0 ? T / 2 : -T / 2), cy - half, z + s * STEP, cx + T / 2 + (x0 === 0 ? T / 2 : -T / 2), cy + half, z + (s + 1) * STEP, 'cren']);
      }
    }
  }
  return out;
}
const allBoxes = boxes.concat(crenellations());
// Central Najdi openings: vertical, width:height 1:2 to 1:5 (G38), window 0.8-2.4 m (p9): slits 0.6 x 1.8 m.
const WINDOWS = [];
for (let x = 1.5; x < 19; x += 2.4) { WINDOWS.push({ face: 'y-', at: 0, u: x, w: 0.6, z0: 1.0, z1: 2.8 }); WINDOWS.push({ face: 'y-', at: 0, u: x, w: 0.6, z0: 4.4, z1: 6.2 }); }
for (let x = 2.5; x < 18; x += 3.2) WINDOWS.push({ face: 'y+', at: 16, u: x, w: 0.6, z0: 0.9, z1: 2.7 });
for (let y = 1.5; y < 15; y += 2.6) { WINDOWS.push({ face: 'x+', at: 20, u: y, w: 0.6, z0: 0.9, z1: 2.7 }); WINDOWS.push({ face: 'x-', at: 0, u: y, w: 0.6, z0: 0.9, z1: 2.7 }); }

// Split a box into pieces along its longer horizontal axis; record which sides are internal seams.
function pieces(b) {
  const [x0, y0, z0, x1, y1, z1, tag] = b;
  const alongX = (x1 - x0) >= (y1 - y0), len = alongX ? x1 - x0 : y1 - y0;
  const n = tag === 'slab' ? 1 : Math.max(1, Math.ceil(len / 1.2));
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (alongX ? x0 : y0) + len * i / n, c = (alongX ? x0 : y0) + len * (i + 1) / n;
    out.push({ b: alongX ? [a, y0, z0, c, y1, z1] : [x0, a, z0, x1, c, z1], tag, alongX, loIn: i > 0, hiIn: i < n - 1, src: b });
  }
  return out;
}
const PIECES = allBoxes.flatMap(pieces);
const cityData = city(11);

// ---------- camera ----------
function camera(th, ph, s, cx, cy, ox = 10, oy = 8) {
  const c = Math.cos(th), sn = Math.sin(th), sp = Math.sin(ph), cp = Math.cos(ph);
  return {
    th, ph, s, cx, cy, ox, oy,
    P(x, y, z) { const dx = x - ox, dy = y - oy, xr = dx * c - dy * sn, yr = dx * sn + dy * c; return [cx + xr * s, cy + (yr * sp - z * cp) * s, yr * cp + z * sp]; },
    view: [sn * cp, c * cp, sp],
    ground(sx, sy) { const xr = (sx - cx) / s, yr = (sy - cy) / (s * Math.max(sp, 1e-3)); return [ox + c * xr + sn * yr, oy - sn * xr + c * yr]; },
  };
}

// ---------- state ----------
// The page's clock P counts eight stages; the drawing's own clock p counts seven. Stage 2 holds the plan at rest.
const STAGES = 8;
const inner = P => P < 2 ? P : P < 3 ? 1.999 : P - 1;
const state = { p: 0, target: 0, th: 0, userTh: 0, sunHour: 15.5, day: dayOfYear(), cut: null, pointer: null, hoverRoom: null };
function dayOfYear() { const d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); }

// ---------- drawing ----------
function poly(ctx, pts) { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); }
function seg(ctx, a, b) { pen(ctx, a, b); }

// ---------- the pen ----------
// A drawn line, not a vector: a slight bow (a hand does not rule a perfect line), a small overshoot at each end
// for construction lines, and a weight that varies a little along its length. All seeded by the line's own
// coordinates, so a line looks the same in every frame.
function hash(a, b, c = 0) { const v = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return v - Math.floor(v); }
function pen(ctx, a, b, opt = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  if (len < 0.5) return;
  const ux = dx / len, uy = dy / len, h = hash(Math.round(a[0]), Math.round(a[1]), Math.round(b[0] + b[1]));
  const over = opt.over ?? 0, bow = (h - 0.5) * Math.min(1.6, len * 0.006) * (opt.bow ?? 1);
  const A = [a[0] - ux * over, a[1] - uy * over], B = [b[0] + ux * over, b[1] + uy * over];
  const M = [(A[0] + B[0]) / 2 - uy * bow, (A[1] + B[1]) / 2 + ux * bow];
  ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.quadraticCurveTo(M[0], M[1], B[0], B[1]); ctx.stroke();
}
// Hatching for cut material: diagonal strokes on the ink fill read as poché with grain, not a flat fill.
// Light hatch for the city's buildings, and the same hatch in the review colour for the plot under review.
const hatchCache = {};
function hatchOf(ctx, colour, gap, key) {
  const k2 = key + colour;
  if (hatchCache[k2]) return hatchCache[k2];
  const c = document.createElement('canvas'); c.width = c.height = gap;
  const g = c.getContext('2d'); g.strokeStyle = colour; g.lineWidth = 0.7;
  g.beginPath(); g.moveTo(-1, gap + 1); g.lineTo(gap + 1, -1); g.moveTo(-1, 1); g.lineTo(1, -1); g.moveTo(gap - 1, gap + 1); g.lineTo(gap + 1, gap - 1); g.stroke();
  return (hatchCache[k2] = ctx.createPattern(c, 'repeat'));
}
const cityHatch = ctx => hatchOf(ctx, C.ink2, 5, 'city');
const reviewHatch = ctx => hatchOf(ctx, C.fault, 4, 'review');
const denseHatch = ctx => hatchOf(ctx, C.ink, 3, 'dense');
// Mud plaster for the house's walls in the axonometric: a light grey ground with a fine stipple and faint courses.
let plasterCache = null;
function plaster(ctx) {
  const key = C.paper + C.ink;
  if (plasterCache && plasterCache.key === key) return plasterCache.pat;
  const c = document.createElement('canvas'); c.width = c.height = 24;
  const g = c.getContext('2d'); g.fillStyle = C.dark ? '#2A2A2C' : '#ECECEE'; g.fillRect(0, 0, 24, 24);
  const R = rng(5); g.fillStyle = C.dark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.10)';
  for (let i = 0; i < 40; i++) g.fillRect(Math.floor(R() * 24), Math.floor(R() * 24), 1, 1);
  g.fillStyle = C.dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(0, 11, 24, 1); g.fillRect(0, 23, 24, 1);
  plasterCache = { key, pat: ctx.createPattern(c, 'repeat') };
  return plasterCache.pat;
}
let pocheCache = null;
function poche(ctx) {
  const key = C.ink + C.ink2;
  if (pocheCache && pocheCache.key === key) return pocheCache.pat;
  const c = document.createElement('canvas'); c.width = c.height = 8;
  const g = c.getContext('2d'); g.fillStyle = C.ink; g.fillRect(0, 0, 8, 8);
  g.strokeStyle = C.dark ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.16)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(-2, 10); g.lineTo(10, -2); g.moveTo(-2, 2); g.lineTo(2, -2); g.moveTo(6, 10); g.lineTo(10, 6); g.stroke();
  pocheCache = { key, pat: ctx.createPattern(c, 'repeat') };
  return pocheCache.pat;
}

function layout(w, h) {
  // The canvas is the drawing's own area (the words have theirs beside or below it); the house is centred in it
  // with room for its dimension chains and level marks.
  const s = Math.min(w / 27, h / 22);
  return { s, cx: w * 0.5, cy: h * 0.5 };
}

function render(ctx, w, h, p, opts = {}) {
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const { s, cx, cy } = layout(w, h);
  if (p < 2) drawPlanStages(ctx, w, h, p, s, cx, cy);
  else if (p < 4) { drawHouse(ctx, w, h, p, s, cx, cy, opts); if (p < 2.35) ghostPlan(ctx, w, h, s, cx, cy, 1 - (p - 2) / 0.35); }
  else if (p < 5) drawCity(ctx, w, h, p - 4, s, cx, cy);
  else drawMorph(ctx, w, h, p - 5, s, cx, cy);
  if (state.pointer && !opts.still) drawCrosshair(ctx, w, h, p, s, cx, cy);
}

// While the house begins to rise, the finished plan stays on the sheet and fades out over it, so the reader never
// sees a bare outline that looks like a lost drawing (the owner's note on the stage after "ARCY works where you see").
let ghost = null;
function ghostPlan(ctx, w, h, s, cx, cy, a) {
  if (a <= 0) return;
  ghost ||= document.createElement('canvas');
  if (ghost.width !== ctx.canvas.width || ghost.height !== ctx.canvas.height) { ghost.width = ctx.canvas.width; ghost.height = ctx.canvas.height; }
  const g = ghost.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, ghost.width, ghost.height);
  g.setTransform(ctx.getTransform()); g.lineCap = 'round'; g.lineJoin = 'round';
  drawPlanStages(g, w, h, 1.999, s, cx, cy);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(ghost, 0, 0); ctx.restore();
}

// Stages 0-1: an architect's sketch finding the plan, then the measured plan.
function drawPlanStages(ctx, w, h, p, s, cx, cy) {
  const cam = camera(0, Math.PI / 2, s, cx, cy);
  const R = rng(7);
  const find = ease(clamp(p / 0.9));           // the sketch: strokes searching for the line (stage 0)
  const wall = ease(clamp((p - 1.0) / 0.4));    // stage 1: walls gain thickness
  const detail = ease(clamp((p - 1.3) / 0.4));  // furniture, door swings, the court's paving and tree
  // The first frame is already a drawing at rest: the plan's outline, lightly and completely drawn. The sketch
  // strokes build on it as the reader scrolls; the walls of stage 1 then take its place.
  ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.9 * (1 - wall);
  for (const [x0, y0, x1, y1] of PLAN_LINES) pen(ctx, cam.P(x0, y0, 0), cam.P(x1, y1, 0), { over: 6 });
  ctx.restore();
  // Guide axes: long faint lines through the main walls, overshooting the drawing like a draughtsman's.
  ctx.strokeStyle = C.line; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.5 * (1 - 0.6 * wall);
  for (const x of [0, 6, 14, 20]) pen(ctx, cam.P(x, -3, 0), cam.P(x, 19, 0));
  for (const y of [0, 5, 11, 16]) pen(ctx, cam.P(-3, y, 0), cam.P(23, y, 0));
  ctx.globalAlpha = 1;
  if (p > 1) {
    ctx.globalAlpha = clamp(p - 1) * 0.8; ctx.strokeStyle = C.rule; ctx.lineWidth = 0.5;
    for (let x = 0; x <= 20; x += 2) seg(ctx, cam.P(x, -1.5, 0), cam.P(x, 17.5, 0));
    for (let y = 0; y <= 16; y += 2) seg(ctx, cam.P(-1.5, y, 0), cam.P(21.5, y, 0));
    ctx.globalAlpha = 1;
  }
  // Each wall line is found by three quick strokes that converge: loose and overshooting at first, then on the line.
  PLAN_LINES.forEach(([x0, y0, x1, y1], i) => {
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
    for (let pass = 0; pass < 3; pass++) {
      const seed = R() * 10, start = i * 0.07 + pass * 0.12, drawn = clamp((p * 1.3 - start) / 0.45);
      if (drawn <= 0) continue;
      const off = (1 - find) * (pass - 1) * 0.35 + (R() - 0.5) * 0.12 * (1 - find), over = (0.5 + R() * 0.8) * (1 - 0.7 * find);
      const head = drawn < 1;
      ctx.strokeStyle = C.ink; ctx.lineWidth = (pass === 1 ? 1.5 : 0.85) * lerp(1, 0.7, wall);
      ctx.globalAlpha = (pass === 1 ? 1 : 0.6) * lerp(1, 0.3, wall);
      ctx.beginPath();
      const N = 18;
      let last = null;
      for (let j = 0; j <= N * drawn; j++) {
        const t = j / N, d = -over + t * (len + 2 * over);
        const wob = (1 - find) * 0.18 * Math.sin(t * 5 + seed) + off;
        const q = cam.P(x0 + ux * d - uy * wob, y0 + uy * d + ux * wob, 0);
        j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); last = q;
      }
      ctx.stroke();
      if (head && last && C.dark) { // night sheet: the pen's leading end glows a little
        ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(255,255,255,.8)'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(last[0], last[1], 1.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }
  });
  ctx.globalAlpha = 1;
  // Sketch marks: a scribbled north arrow and a note written as quick strokes (marks, not letters).
  if (p < 1.4) {
    const a = clamp((p - 0.35) / 0.3) * (1 - clamp((p - 1.05) / 0.3));
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.ink; ctx.lineWidth = 0.9;
    const n = cam.P(23, -2.5, 0);
    ctx.beginPath(); ctx.moveTo(n[0], n[1] + 22); ctx.lineTo(n[0] + 1, n[1] - 14); ctx.moveTo(n[0] - 6, n[1] - 4); ctx.lineTo(n[0] + 1, n[1] - 15); ctx.lineTo(n[0] + 7, n[1] - 5);
    ctx.moveTo(n[0] - 5, n[1] - 20); ctx.lineTo(n[0] - 5, n[1] - 30); ctx.lineTo(n[0] + 4, n[1] - 20); ctx.lineTo(n[0] + 4, n[1] - 31); ctx.stroke();
    const note = cam.P(rtl ? 15 : 1, 18.6, 0);
    for (let row = 0; row < 2; row++) {
      ctx.beginPath(); let x = note[0], y = note[1] + row * 13;
      ctx.moveTo(x, y);
      for (let k = 0; k < 26 - row * 8; k++) { x += 4 + R() * 2; ctx.quadraticCurveTo(x - 2, y - 4 - R() * 4, x, y + (R() - 0.5) * 2); if (R() < 0.15) { x += 5; ctx.moveTo(x, y); } }
      ctx.stroke();
    }
    ctx.restore();
  }
  if (wall > 0) {
    // Walls cut at 1.2 m: poché with grain.
    ctx.fillStyle = poche(ctx);
    for (const b of boxes) {
      if (!(b[6] === 'wall' || b[6] === 'col') || b[2] > 1.2 || b[5] < 1.2) continue;
      const mx = (b[0] + b[3]) / 2, my = (b[1] + b[4]) / 2, hw = (b[3] - b[0]) / 2 * wall, hd = (b[4] - b[1]) / 2 * wall;
      const along = (b[3] - b[0]) > (b[4] - b[1]);
      const q = along ? [[b[0], my - hd], [b[3], my - hd], [b[3], my + hd], [b[0], my + hd]] : [[mx - hw, b[1]], [mx + hw, b[1]], [mx + hw, b[4]], [mx - hw, b[4]]];
      poly(ctx, q.map(([x, y]) => cam.P(x, y, 0))); ctx.fill();
    }
    // the stair: treads, the walking line, and the break line where the plan cuts it
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 0.6; ctx.globalAlpha = wall;
    for (let i = 0; i <= 10; i++) seg(ctx, cam.P(14.6 + i * 0.45, 5.6, 0), cam.P(14.6 + i * 0.45, 7.2, 0));
    seg(ctx, cam.P(14.4, 6.4, 0), cam.P(19.2, 6.4, 0));
    ctx.beginPath(); const b1 = cam.P(17, 5.5, 0), b2 = cam.P(17.6, 7.3, 0); ctx.moveTo(b1[0], b1[1]); ctx.lineTo((b1[0] + b2[0]) / 2 - 4, (b1[1] + b2[1]) / 2); ctx.lineTo((b1[0] + b2[0]) / 2 + 4, (b1[1] + b2[1]) / 2 + 3); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (detail > 0) drawPlanDetail(ctx, cam, s, detail);
  if (p > 1.4) {
    const t = ease(clamp((p - 1.4) / 0.45));
    chain(ctx, cam, [0, 6, 10, 14, 20], -2.2, 'x', t);
    chain(ctx, cam, [0, 5, 11, 16], 21.8, 'y', t);
    north(ctx, cam.P(-3.5, 17.5, 0), 0, t);
  }
  if (state.hoverRoom != null && p > 0.9) roomInfo(ctx, cam, ROOMS[state.hoverRoom]);
}

// Where the eye rests: door swings, majlis seating along the walls, the court's paving and its tree, people.
function drawPlanDetail(ctx, cam, s, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.ink2; ctx.lineWidth = 0.6;
  const arc = (x, y, r, a0, a1) => { const c = cam.P(x, y, 0); ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.arc(c[0], c[1], r * s, a0, a1); ctx.stroke(); };
  arc(9.6, 16, 1.0, -Math.PI, -Math.PI / 2);          // entrance door
  arc(10.15, 2.2, 0.9, 0, Math.PI / 2);               // majlis to family
  arc(5.85, 7.2, 0.9, Math.PI / 2, Math.PI);          // guest room
  arc(14.15, 12.4, 0.9, -Math.PI / 2, 0);             // entrance hall to stair
  // majlis seating: cushions along three walls, a low table
  for (let x = 0.8; x < 9.2; x += 1.05) { const a0 = cam.P(x, 0.6, 0), b0 = cam.P(x + 0.95, 1.3, 0); ctx.strokeRect(a0[0], a0[1], b0[0] - a0[0], b0[1] - a0[1]); }
  for (let y = 1.4; y < 4.4; y += 1.0) { const a0 = cam.P(0.6, y, 0), b0 = cam.P(1.3, y + 0.9, 0); ctx.strokeRect(a0[0], a0[1], b0[0] - a0[0], b0[1] - a0[1]); }
  { const a0 = cam.P(3.8, 2.4, 0), b0 = cam.P(6.4, 3.4, 0); ctx.strokeRect(a0[0], a0[1], b0[0] - a0[0], b0[1] - a0[1]); }
  // family room: a table with chairs
  { const c = cam.P(15, 2.6, 0); ctx.beginPath(); ctx.arc(c[0], c[1], 0.8 * s, 0, Math.PI * 2); ctx.stroke(); for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; ctx.beginPath(); ctx.arc(c[0] + Math.cos(an) * 1.2 * s, c[1] + Math.sin(an) * 1.2 * s, 0.22 * s, 0, Math.PI * 2); ctx.stroke(); } }
  // the court: paving on a 0.6 m grid, a fountain, a tree with a drawn canopy
  ctx.strokeStyle = C.rule; ctx.lineWidth = 0.5;
  for (let x = 6.6; x < 13.8; x += 0.6) seg(ctx, cam.P(x, 5.4, 0), cam.P(x, 10.6, 0));
  for (let y = 5.6; y < 10.8; y += 0.6) seg(ctx, cam.P(6.4, y, 0), cam.P(13.6, y, 0));
  tree(ctx, cam.P(11.6, 7.2, 0), 1.9 * s, 3);
  ctx.strokeStyle = C.ink2; { const c = cam.P(8.4, 8.4, 0); ctx.beginPath(); ctx.arc(c[0], c[1], 0.55 * s, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(c[0], c[1], 0.3 * s, 0, Math.PI * 2); ctx.stroke(); }
  // people seen from above: a head and shoulders, turned
  for (const [x, y, an] of [[9.2, 13.2, 0.4], [3.2, 7.6, -0.8], [16.4, 13.8, 2.2]]) { const c = cam.P(x, y, 0); ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(an); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.ellipse(0, 0, 0.32 * s, 0.16 * s, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 0.11 * s, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore(); }
  ctx.restore();
}
// A tree in plan: a canopy drawn as a loose scalloped ring, a trunk dot, and a light inner ring.
function tree(ctx, c, r, seed) {
  ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 0.7; ctx.beginPath();
  const n = 14;
  for (let k = 0; k <= n; k++) {
    const a0 = k / n * Math.PI * 2, rr = r * (0.9 + 0.12 * hash(seed, k));
    const x = c[0] + Math.cos(a0) * rr, y = c[1] + Math.sin(a0) * rr;
    if (!k) ctx.moveTo(x, y); else { const am = (k - 0.5) / n * Math.PI * 2; ctx.quadraticCurveTo(c[0] + Math.cos(am) * rr * 1.12, c[1] + Math.sin(am) * rr * 1.12, x, y); }
  }
  ctx.stroke(); ctx.globalAlpha *= 0.5; ctx.beginPath(); ctx.arc(c[0], c[1], r * 0.55, 0.4, 5.6); ctx.stroke();
  ctx.globalAlpha *= 2; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(c[0], c[1], Math.max(1, r * 0.07), 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function chain(ctx, cam, ticks, at, axis, t) {
  ctx.strokeStyle = C.line; ctx.fillStyle = C.ink2; ctx.lineWidth = 0.8;
  ctx.font = `${Math.round(11)}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
  const P = v => axis === 'x' ? cam.P(v, at, 0) : cam.P(at, v, 0);
  const last = ticks[0] + (ticks[ticks.length - 1] - ticks[0]) * t;
  seg(ctx, P(ticks[0]), P(last));
  ticks.forEach((v, i) => {
    if (v > last + 1e-6) return;
    const q = P(v); seg(ctx, [q[0] - 4, q[1] + 4], [q[0] + 4, q[1] - 4]);
    if (i) { const m = P((v + ticks[i - 1]) / 2); ctx.save(); ctx.translate(m[0], m[1]); if (axis === 'y') ctx.rotate(-Math.PI / 2); ctx.fillText((v - ticks[i - 1]).toFixed(2), 0, -6); ctx.restore(); }
  });
}
function north(ctx, q, rot, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(q[0], q[1]); ctx.rotate(rot);
  ctx.strokeStyle = C.line; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(4, 4); ctx.lineTo(0, 1); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
  ctx.font = '600 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('N', 0, -19); ctx.restore();
}
function roomInfo(ctx, cam, [key, x0, y0, x1, y1]) {
  const a = cam.P(x0, y0, 0), b = cam.P(x1, y1, 0);
  ctx.save(); ctx.fillStyle = C.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]); ctx.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); ctx.setLineDash([]);
  const W = x1 - x0, D = y1 - y0;
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.font = `600 13px ${getComputedStyle(document.body).fontFamily}`;
  ctx.fillText(L.rooms[key], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 6);
  ctx.font = `12px ${getComputedStyle(document.body).fontFamily}`;
  ctx.fillText(`${(W * D).toFixed(1)} ${L.m2}`, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 12);
  ctx.strokeStyle = C.line; seg(ctx, [a[0], a[1] + 8], [b[0], a[1] + 8]); seg(ctx, [a[0] + 8, a[1]], [a[0] + 8, b[1]]);
  ctx.fillStyle = C.ink2; ctx.fillText(W.toFixed(2), (a[0] + b[0]) / 2, a[1] + 22);
  ctx.save(); ctx.translate(a[0] + 22, (a[1] + b[1]) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(D.toFixed(2), 0, 0); ctx.restore();
  ctx.restore();
}

// Page stage 2: the agent at work on the plan, where the person can see it. Its named cursor (in the agent's own
// colour: colour on this site says who, or a state) comes to the entrance hall, outlines the region it is working
// in, and draws there; beside the plan its plan of work is a list that ticks itself: done, now, next. An abstract
// drawing of behaviour, not a picture of the product's interface.
function drawWorking(ctx, w, h, k) {
  const { s, cx, cy } = layout(w, h), cam = camera(0, Math.PI / 2, s, cx, cy), font = getComputedStyle(document.body).fontFamily;
  const R = [6, 11, 14, 16], corners = [[R[0], R[1]], [R[2], R[1]], [R[2], R[3]], [R[0], R[3]], [R[0], R[1]]];
  const come = ease(clamp(k / 0.25)), ring = clamp((k - 0.25) / 0.3), work = clamp((k - 0.55) / 0.3);
  // where the cursor is: coming in from the corner, then round the region, then along what it draws
  const along = (pts, t) => { const n = pts.length - 1, i = Math.min(n - 1, Math.floor(t * n)), f = t * n - i; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; };
  const mark = [[8, 12.2], [8, 14.8], [12, 14.8], [12, 12.2]];
  const at = k < 0.25 ? [lerp(24, R[0], come), lerp(20, R[1], come)] : k < 0.55 ? along(corners, ring) : along(mark, work);
  ctx.save(); ctx.lineCap = 'round';
  if (ring > 0) { // the region it works in
    ctx.strokeStyle = C.agent; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.beginPath();
    const n = 4 * ring; for (let i = 0; i <= Math.floor(n) && i < 4; i++) { const a = cam.P(...corners[i], 0), f = Math.min(1, n - i), b = cam.P(lerp(corners[i][0], corners[i + 1][0], f), lerp(corners[i][1], corners[i + 1][1], f), 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  if (work > 0) { // what it draws there: a bench along three sides of the hall, in ink like the rest of the plan
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath();
    const n = 3 * work; for (let i = 0; i <= Math.floor(n) && i < 3; i++) { const a = cam.P(...mark[i], 0), f = Math.min(1, n - i), b = cam.P(lerp(mark[i][0], mark[i + 1][0], f), lerp(mark[i][1], mark[i + 1][1], f), 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();
  }
  // its plan of work, under the drawing: three steps as marks, each done, now or next
  const done = k < 0.25 ? 0 : k < 0.55 ? 1 : 2, base = cam.P(rtl ? 20 : 0, 18.6, 0), dir = rtl ? -1 : 1;
  ctx.globalAlpha = clamp(k / 0.15); ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const x = base[0] + dir * i * Math.min(150, w * 0.26), y = base[1] + 6, b = 11;
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink;
    ctx.strokeRect(dir < 0 ? x - b : x, y, b, b);
    if (i < done) ctx.fillRect(dir < 0 ? x - b : x, y, b, b);
    else if (i === done) { ctx.beginPath(); ctx.arc(x + dir * b / 2, y + b / 2, 2.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = i <= done ? C.ink : C.line; ctx.lineWidth = i === done ? 1.6 : 0.9;
    ctx.beginPath(); ctx.moveTo(x + dir * (b + 8), y + b / 2); ctx.lineTo(x + dir * (b + 8 + Math.min(80, w * 0.13)), y + b / 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // the cursor and its name
  const q = cam.P(at[0], at[1], 0);
  ctx.translate(q[0], q[1]); ctx.fillStyle = C.agent;
  ctx.beginPath(); [[0, 0], [0, 17], [4.6, 12.6], [7.8, 19.6], [10.6, 18.4], [7.4, 11.4], [13.6, 11.4]].forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
  ctx.font = `600 11px ${font}`; const tw = ctx.measureText('ARCY').width + 12;
  ctx.fillRect(12, 17, tw, 17); ctx.fillStyle = C.paper; ctx.textAlign = 'left'; ctx.fillText('ARCY', 18, 29.5);
  ctx.restore();
}

// Stages 2-3: the axonometric, the rise, the sun, and the section.
function houseCamera(p, s, cx, cy) {
  const k = ease(clamp((p - 2) / 0.6));
  const ph = lerp(Math.PI / 2, 0.56, k), th = lerp(0, -0.62, k) + state.userTh * clamp((p - 2.3) / 0.3);
  return camera(th, ph, s * lerp(1, 0.92, k), cx, cy + s * lerp(0, 2.6, k));
}
function zmap(p) {
  const k = clamp((p - 2.1) / 0.85);
  const s1 = ease(clamp(k / 0.45)), s2 = ease(clamp((k - 0.45) / 0.4)), s3 = ease(clamp((k - 0.85) / 0.15));
  return z => z <= 0 ? z : z <= H1 ? z * s1 : z <= H2 + 1e-6 ? H1 * s1 + (z - H1) * s2 : H1 * s1 + (H2 - H1) * s2 + (z - H2) * s3;
}
function stepRise(p, i) { return clamp(((p - 2.1) / 0.85 - 0.1 - i * 0.05) / 0.1); }

function drawHouse(ctx, w, h, p, s, cx, cy, opts = {}) {
  const cam = opts.cam || houseCamera(p, s, cx, cy);
  const Z = opts.Z || zmap(p);
  const sweep = ease(clamp((p - 3) / 0.7));
  let cutY = p < 3 ? 99 : lerp(16.6, 8, sweep);
  if (p >= 3 && state.cut != null && !opts.still && !opts.cam) cutY = state.cut;
  const view = cam.view;
  // Ground slab first, then shadows, then pieces far to near.
  const slab = PIECES.filter(q => q.tag === 'slab' && q.src[2] < 0);
  const rest = PIECES.filter(q => !(q.tag === 'slab' && q.src[2] < 0));
  for (const q of slab) drawPiece(ctx, cam, q, Z, cutY, view, p);
  drawShadows(ctx, cam, Z, cutY, p);
  const items = [];
  for (const q of rest) {
    let [x0, y0, z0, x1, y1, z1] = q.b;
    if (q.tag === 'step') { const i = Math.round((x0 - 14.6) / 0.45); z1 = z1 * stepRise(p, i); if (z1 < 0.01) continue; }
    if (y0 >= cutY) continue;
    const d = cam.P((x0 + x1) / 2, (y0 + Math.min(y1, cutY)) / 2, (Z(z0) + Z(z1)) / 2)[2];
    items.push({ d, q, z1 });
  }
  if (p >= 3) PEOPLE.forEach(([x, y, z], i) => { if (y < cutY) items.push({ d: cam.P(x, y, Z(z) + 0.9)[2], fig: [x, y, z], a: clamp((p - 3.2 - i * 0.08) / 0.25) }); });
  items.sort((a, b) => a.d - b.d);
  for (const it of items) it.fig ? drawFigure(ctx, cam, it.fig, Z, it.a * (opts.figAlpha ?? 1)) : drawPiece(ctx, cam, it.q, Z, cutY, view, p, it.z1);
  if (opts.cam) return;
  // Section line and levels
  if (p >= 3 && cutY < 16.5) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([14, 4, 2, 4]);
    seg(ctx, cam.P(-2, cutY, 0), cam.P(22, cutY, 0)); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = '600 13px system-ui'; ctx.textAlign = 'center';
    const a = cam.P(-2.6, cutY, 0), b = cam.P(22.6, cutY, 0); ctx.fillText('A', a[0], a[1] + 4); ctx.fillText('A', b[0], b[1] + 4);
  }
  if (p > 2.8) levels(ctx, cam, Z, clamp((p - 2.8) / 0.3));
  north(ctx, [w - 40, h - 40], -cam.th, clamp((p - 2.4) / 0.3));
}

function faceList(b, alongX, loIn, hiIn) {
  const [x0, y0, z0, x1, y1, z1] = b;
  // Each face: 4 corners, outward normal, and which of its 4 edges are internal seams.
  const seamX = (xa, xb) => alongX && ((xa === x0 && xb === x0 && loIn) || (xa === x1 && xb === x1 && hiIn));
  const seamY = (ya, yb) => !alongX && ((ya === y0 && yb === y0 && loIn) || (ya === y1 && yb === y1 && hiIn));
  const F = [];
  const add = (pts, n) => F.push({ pts, n, seam: pts.map((a, i) => { const c = pts[(i + 1) % 4]; return seamX(a[0], c[0]) || seamY(a[1], c[1]); }) });
  add([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]);
  add([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0]);
  add([[x1, y0, z0], [x0, y0, z0], [x0, y0, z1], [x1, y0, z1]], [0, -1, 0]);
  add([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0]);
  add([[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]], [-1, 0, 0]);
  if (alongX) { if (loIn) F.splice(4, 1); if (hiIn) F.splice(3, 1); } else { if (hiIn) F.splice(1, 1); if (loIn) F.splice(2, 1); }
  return F;
}

function drawPiece(ctx, cam, q, Z, cutY, view, p, z1o) {
  let [x0, y0, z0, x1, y1, z1] = q.b;
  if (z1o != null) z1 = z1o;
  const cut = y1 > cutY; if (cut) y1 = cutY;
  const zz0 = Z(z0), zz1 = Z(z1);
  if (zz1 - zz0 < 1e-3 && q.tag !== 'slab') return;
  const faces = faceList([x0, y0, zz0, x1, y1, zz1], q.alongX, q.loIn, q.hiIn);
  const heavy = q.tag === 'wall' || q.tag === 'slab';
  for (const f of faces) {
    if (f.n[0] * view[0] + f.n[1] * view[1] + f.n[2] * view[2] <= 1e-4) continue;
    const pts = f.pts.map(([x, y, z]) => cam.P(x, y, z));
    const isCut = cut && f.n[1] === 1;
    poly(ctx, pts);
    ctx.fillStyle = isCut ? poche(ctx) : (f.n[2] === 0 && (q.tag === 'wall' || q.tag === 'cren')) ? plaster(ctx) : C.paper; ctx.fill();
    // faces turned from the sun take a light tone, so the house reads in light and shade
    if (!isCut && f.n[2] === 0 && SUNV && f.n[0] * SUNV[0] + f.n[1] * SUNV[1] < 0) { ctx.fillStyle = C.shadow; ctx.fill(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = isCut ? 1.5 : q.tag === 'cren' ? 0.5 : heavy ? 0.95 : 0.7;
    if (q.tag === 'cren' || q.tag === 'step') { ctx.beginPath(); pts.forEach((a, i) => { if (f.seam[i]) return; const b = pts[(i + 1) % 4]; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }); ctx.stroke(); }
    else pts.forEach((a, i) => { if (!f.seam[i]) pen(ctx, a, pts[(i + 1) % 4], { bow: 0.6 }); });
    if (!isCut && q.tag === 'wall' && f.n[2] === 0) windowsOn(ctx, cam, f, Z, [x0, y0, x1, y1]);
    if (!isCut && q.tag === 'screen' && f.n[1] !== 0) {
      ctx.strokeStyle = C.line; ctx.lineWidth = 0.45;
      for (let x = x0 + 0.2; x < x1; x += 0.3) seg(ctx, cam.P(x, f.pts[0][1], Z(H1 + 0.3)), cam.P(x, f.pts[0][1], Z(H2 - 0.3)));
    }
  }
}
function windowsOn(ctx, cam, f, Z, [x0, y0, x1, y1]) {
  const n = f.n, key = n[1] === -1 ? 'y-' : n[1] === 1 ? 'y+' : n[0] === 1 ? 'x+' : 'x-';
  const plane = key[0] === 'y' ? f.pts[0][1] : f.pts[0][0];
  const lo = key[0] === 'y' ? x0 : y0, hi = key[0] === 'y' ? x1 : y1;
  ctx.fillStyle = C.ink2;
  for (const wdw of WINDOWS) {
    if (wdw.face !== key || Math.abs(wdw.at - plane) > 0.31) continue;
    const a = Math.max(lo, wdw.u - wdw.w / 2), b = Math.min(hi, wdw.u + wdw.w / 2); if (b <= a) continue;
    const zz0 = Z(wdw.z0), zz1 = Z(wdw.z1); if (zz1 - zz0 < 0.05) continue;
    const P = (u, z) => key[0] === 'y' ? cam.P(u, plane, z) : cam.P(plane, u, z);
    poly(ctx, [P(a, zz0), P(b, zz0), P(b, zz1), P(a, zz1)]); ctx.fillStyle = C.ink; ctx.fill();
    // the opening's depth: one jamb catches light, the head casts a shadow band
    const jw = (b - a) * 0.24; poly(ctx, [P(a, zz0), P(a + jw, zz0), P(a + jw, zz1), P(a, zz1)]); ctx.fillStyle = C.ink3; ctx.fill();
    ctx.fillStyle = C.ink2;
    // the triangular fenestration above each window (Central Najdi, G11/G25)
    if (wdw.w > 0.5) { const m = wdw.u; if (m > lo && m < hi) { poly(ctx, [P(m - 0.18, zz1 + 0.25 * (zz1 - zz0) / 1.8), P(m + 0.18, zz1 + 0.25 * (zz1 - zz0) / 1.8), P(m, zz1 + 0.55 * (zz1 - zz0) / 1.8)]); ctx.fill(); } }
  }
}
let SUNV = null;
function drawShadows(ctx, cam, Z, cutY, p) {
  const sn = sun(state.day, state.sunHour);
  SUNV = sn.el > 0.02 ? [Math.sin(sn.az), -Math.cos(sn.az)] : null;
  if (sn.el <= 0.02 || p < 2.6) return;
  const a = clamp((p - 2.6) / 0.4);
  const dx = Math.sin(sn.az) * Math.cos(sn.el), dy = -Math.cos(sn.az) * Math.cos(sn.el), dz = Math.sin(sn.el);
  const path = new Path2D();
  for (const b of allBoxes) {
    let [x0, y0, z0, x1, y1, z1, tag] = b;
    if (tag === 'slab' && z0 < 0) continue;
    if (y0 >= cutY) continue; y1 = Math.min(y1, cutY);
    const top = Z(z1); if (top < 0.05) continue;
    const pts = [];
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) { pts.push([x, y]); pts.push([x - dx / dz * top, y - dy / dz * top]); }
    const hull = convexHull(pts).map(([x, y]) => cam.P(x, y, 0));
    hull.forEach((q, i) => i ? path.lineTo(q[0], q[1]) : path.moveTo(q[0], q[1])); path.closePath();
  }
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.shadow; ctx.fill(path, 'nonzero'); ctx.restore();
}
function convexHull(P) {
  P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of P.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function drawFigure(ctx, cam, [x, y, z], Z, a) {
  if (a <= 0) return;
  const f = cam.P(x, y, Z(z)), hd = cam.P(x, y, Z(z) + 1.75);
  const H = f[1] - hd[1], u = H / 7;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.ink; ctx.fillStyle = C.paper; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(f[0] - u * .35, f[1]); ctx.lineTo(f[0] - u * .2, f[1] - u * 3.4); ctx.lineTo(f[0] + u * .2, f[1] - u * 3.4); ctx.lineTo(f[0] + u * .35, f[1]);
  ctx.moveTo(f[0] - u * .55, f[1] - u * 3.2); ctx.lineTo(f[0] - u * .5, f[1] - u * 5.6); ctx.lineTo(f[0] + u * .5, f[1] - u * 5.6); ctx.lineTo(f[0] + u * .55, f[1] - u * 3.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(f[0], f[1] - u * 6.3, u * .6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
}
function levels(ctx, cam, Z, a) {
  // Level marks stand clear of the building: to the east of the east wall, with a leader.
  ctx.save(); ctx.globalAlpha = a; ctx.font = '11px system-ui'; ctx.fillStyle = C.ink2; ctx.strokeStyle = C.line; ctx.lineWidth = 0.8;
  for (const [z, l] of [[0, '±0.00'], [H1, '+3.40'], [H2, '+6.80']]) {
    const q = cam.P(23.2, 2, Z(z)), e = cam.P(20, 2, Z(z));
    seg(ctx, e, q); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - 5, q[1] - 6); ctx.lineTo(q[0] + 5, q[1] - 6); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
    ctx.fillStyle = C.ink2; ctx.textAlign = 'left'; ctx.fillText(l, q[0] + 9, q[1] + 4);
  }
  ctx.restore();
}

// Stage 4: the city.
function cityCamera(k, s, cx, cy) {
  const e = ease(clamp(k / 0.7));
  const from = houseCamera(3.999, s, cx, cy);
  const fin = Math.min((W || 1000) * 0.98 / 170, (H || 800) * 0.98 / 140) / s; // the city fills the stage: about 170 by 140 m
  return camera(lerp(from.th, 0, e), lerp(from.ph, Math.PI / 2, e), s * lerp(0.92, fin, e), cx, lerp(from.cy, cy, e), lerp(10, 0, e), lerp(8, 4, e));
}
function drawCity(ctx, w, h, k, s, cx, cy) {
  const cam = cityCamera(k, s, cx, cy);
  const flat = ease(clamp(k / 0.5));
  drawFabric(ctx, cam, k);
  if (k < 0.5) {
    // the house flattening into its footprint (the same pieces, z shrinking), drawn over the fabric
    const Z0 = zmap(3.999), Z = z => Z0(z) * (1 - flat);
    drawHouse(ctx, w, h, 3.999, s, cx, cy, { cam, Z, figAlpha: 1 - flat });
  }
}
function drawFabric(ctx, cam, k, alpha = 1) {
  const grow = ease(clamp((k - 0.2) / 0.6));
  const S = cam.s;
  ctx.save(); ctx.globalAlpha = alpha;
  const line = (pts, close) => { ctx.beginPath(); pts.forEach(([x, y], i) => { const q = cam.P(x, y, 0); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); if (close) ctx.closePath(); };
  // the wadi and its park: two banks, and short hatch strokes down the slope
  const W = cityData.wadi;
  ctx.strokeStyle = C.line; ctx.lineWidth = 0.8;
  line(W.north); ctx.stroke(); line(W.south); ctx.stroke();
  ctx.lineWidth = 0.5;
  W.north.forEach(([x, y], i) => { if (i % 2) return; const a = cam.P(x, y, 0), b = cam.P(x + 1, y + 3.5, 0); seg(ctx, a, b); });
  // the souq: kerbs and parked cars
  ctx.lineWidth = 0.8; ctx.strokeStyle = C.line;
  for (const y of cityData.souq) seg(ctx, cam.P(-150, y, 0), cam.P(150, y, 0));
  if (S > 1.2) for (const [x, y, a] of cityData.cars) { const c = cam.P(x, y, 0); ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(a); ctx.strokeStyle = C.ink2; ctx.strokeRect(-2.2 * S, -0.9 * S, 4.4 * S, 1.8 * S); ctx.restore(); }
  // Plots as a planner draws a figure-ground: buildings in a light hatch with a fine outline, each with its
  // courtyard drawn inside it (outlined, open to the sky), the house in grained poché, the reviewed plot in red.
  cityData.blocks.forEach((b, i) => {
    const d = Math.hypot(b.cx - 10, b.cy - 8) / 170, t = b.house ? clamp((k - 0.45) / 0.1) : clamp((grow - d) / 0.22);
    if (t <= 0) return;
    const ring = r => { ctx.beginPath(); r.forEach(([x, y], j) => { const q = cam.P(x, y, 0); j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); };
    ctx.globalAlpha = alpha * t;
    ring(b.pts);
    ctx.fillStyle = b.house ? denseHatch(ctx) : i === cityData.review ? reviewHatch(ctx) : cityHatch(ctx); ctx.fill();
    ctx.strokeStyle = i === cityData.review ? C.fault : C.ink; ctx.lineWidth = b.house ? 1.2 : 0.7; ctx.stroke();
    if (b.court) { ring(b.court); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 0.5; ctx.stroke(); }
    ctx.globalAlpha = alpha;
  });
  // the mosque: its site, the prayer hall turned to the qibla, the court and the minaret
  const M = cityData.mosque;
  if (M && grow > 0.2) {
    ctx.globalAlpha = alpha * clamp((grow - 0.2) / 0.3);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8; line(M.site, true); ctx.stroke();
    ctx.fillStyle = denseHatch(ctx); line(M.hall, true); ctx.fill(); ctx.stroke();
    line(M.court, true); ctx.stroke();
    const m = cam.P(...M.minaret, 0); ctx.beginPath(); ctx.arc(m[0], m[1], Math.max(2, 1.6 * S), 0, Math.PI * 2); ctx.fill();
    // qibla arrow
    const c = cam.P(M.cx, M.cy, 0), a = (M.bearing - 90) * Math.PI / 180, L2 = 26 * S;
    ctx.strokeStyle = C.ink2; ctx.setLineDash([3, 3]); seg(ctx, c, [c[0] + Math.cos(a) * L2, c[1] + Math.sin(a) * L2]); ctx.setLineDash([]);
    ctx.globalAlpha = alpha;
  }
  // trees along the souq and in the park
  if (grow > 0.4) { ctx.globalAlpha = alpha * clamp((grow - 0.4) / 0.4); cityData.trees.forEach(([x, y, r], i) => tree(ctx, cam.P(x, y, 0), Math.max(1.6, r * S), i)); ctx.globalAlpha = alpha; }
  if (k > 0.7) reviewMark(ctx, cam, clamp((k - 0.7) / 0.25));
  ctx.restore();
}
function reviewMark(ctx, cam, a) {
  const b = cityData.blocks[cityData.review];
  const c = cam.P(b.cx, b.cy, 0), r = Math.max(18, 14 * cam.s);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.fault; ctx.lineWidth = 1.4; ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.arc(c[0], c[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a); ctx.stroke(); ctx.setLineDash([]);
  // the leader points towards the middle of the stage so the label never leaves it
  const dpr = Math.min(devicePixelRatio || 1, 2), CW = ctx.canvas.width / dpr, CH = ctx.canvas.height / dpr;
  let dir = c[0] > CW / 2 ? -1 : 1;
  let end = [c[0] + dir * 60, c[1] + 50];
  // narrow screens: the label goes to the foot of the drawing area, clear of the fabric it describes
  if (CW < 600) { dir = 1; end = [4, CH - 34]; }
  seg(ctx, [c[0] + dir * r * 0.7, c[1] + r * 0.7], end); seg(ctx, end, [end[0] + dir * 16, end[1]]);
  // a paper label, so the note reads over the fabric
  const font = getComputedStyle(document.body).fontFamily;
  ctx.font = `12px ${font}`; const tw = Math.max(ctx.measureText(L.clause).width, 90) + 16;
  ctx.fillStyle = C.paper; ctx.globalAlpha = a * 0.94; ctx.fillRect(dir < 0 ? end[0] + dir * 12 - tw : end[0] + dir * 12, end[1] - 14, tw, 44); ctx.globalAlpha = a;
  ctx.strokeStyle = C.fault; ctx.lineWidth = 0.8; ctx.strokeRect(dir < 0 ? end[0] + dir * 12 - tw : end[0] + dir * 12, end[1] - 14, tw, 44);
  ctx.fillStyle = C.fault; ctx.font = `600 13px ${font}`; ctx.textAlign = dir < 0 ? 'right' : 'left';
  ctx.fillText(`✕ ${L.noAccess}`, end[0] + dir * 20, end[1] + 4);
  ctx.fillStyle = C.ink2; ctx.font = `12px ${getComputedStyle(document.body).fontFamily}`;
  ctx.fillText(L.clause, end[0] + dir * 20, end[1] + 22);
  ctx.restore();
}

// Stages 5-6: blocks -> chart cells -> the mark.
let chartCache = null;
function chartLayout(w, h) {
  const runs = DATA.runs, phone = w < 600;
  const left = w * 0.04, right = w * 0.96, cell = (right - left) / 19;
  const rows = [];
  let y = h * 0.2;
  runs.forEach(r => { rows.push({ y, n: r.tasks, filled: r.passed, label: r.label, at: r.at }); y += h * 0.27; });
  rows.push({ y, n: 4, filled: DATA.verdict.score, target: DATA.verdict.target, verdict: true });
  const cells = [];
  rows.forEach((row, ri) => { for (let i = 0; i < row.n; i++) cells.push({ row: ri, i, x: rtl ? right - (i + 1) * cell : left + i * cell, y: row.y, w: cell - (phone ? 2 : 4), h: Math.min(cell * 1.6, h * 0.09), filled: i < row.filled, target: !!row.verdict && i >= row.filled && i < row.target }); });
  return { rows, cells, left, right, cell, phone };
}
let markCache = null;
function markOutline(w, h) {
  if (markCache && markCache.w === w && markCache.h === h) return markCache;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.style.position = 'absolute'; svg.style.visibility = 'hidden'; document.body.append(svg);
  const S = Math.min(w, h) * 0.0042, ox = w / 2 - 45.2 * S, oy = h * 0.46 - 49.7 * S;
  const pts = [];
  const paths = DATA.mark.map(d => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); svg.append(p); return p; });
  const total = paths.reduce((a, p) => a + p.getTotalLength(), 0);
  markCache = { w, h, S, ox, oy, sample(t) { let u = t * total; for (const p of paths) { const l = p.getTotalLength(); if (u <= l) { const q = p.getPointAtLength(u); return [ox + q.x * S, oy + q.y * S]; } u -= l; } const q = paths[paths.length - 1].getPointAtLength(paths[paths.length - 1].getTotalLength()); return [ox + q.x * S, oy + q.y * S]; },
    paths: DATA.mark.map(d => new Path2D(d)) };
  svg.remove();
  return markCache;
}
function drawMorph(ctx, w, h, k, s, cx, cy) {
  const camEnd = cityCamera(1, s, cx, cy);
  const ch = chartLayout(w, h);
  const blocks = cityData.blocks;
  const n = ch.cells.length;
  // Which blocks become which cells: the house first, the review block second, then the nearest to the house.
  const order = blocks.map((b, i) => i).sort((a, b) => (blocks[b].house - blocks[a].house) || ((b === cityData.review) - (a === cityData.review)) || (Math.hypot(blocks[a].cx - 10, blocks[a].cy - 8) - Math.hypot(blocks[b].cx - 10, blocks[b].cy - 8)));
  const toChart = ease(clamp(k < 1 ? k / 0.75 : 1));
  const toMark = ease(clamp((k - 1) / 0.6));
  const fillMark = ease(clamp((k - 1.6) / 0.35));
  const mk = k > 1 ? markOutline(w, h) : null;
  ctx.save();
  order.forEach((bi, j) => {
    const b = blocks[bi];
    const src = b.pts.map(([x, y]) => camEnd.P(x, y, 0));
    let dst;
    const cell = ch.cells[j];
    if (cell) dst = [[cell.x, cell.y], [cell.x + cell.w, cell.y], [cell.x + cell.w, cell.y + cell.h], [cell.x, cell.y + cell.h]];
    else { const t = (j - n) / Math.max(1, blocks.length - n), x = rtl ? ch.right - t * (ch.right - ch.left) : ch.left + t * (ch.right - ch.left), yb = ch.rows[ch.rows.length - 1].y + 70; dst = [[x, yb], [x + 1, yb], [x + 1, yb + 0.5], [x, yb + 0.5]]; }
    let pts = src.map((q, i) => [lerp(q[0], dst[i][0], toChart), lerp(q[1], dst[i][1], toChart)]);
    if (mk) {
      if (cell) { const t0 = j / n, t1 = (j + 1) / n, a = mk.sample(t0), c = mk.sample(t1); const m = [[a[0], a[1]], [c[0], c[1]], [c[0], c[1]], [a[0], a[1]]]; pts = pts.map((q, i) => [lerp(q[0], m[i][0], toMark), lerp(q[1], m[i][1], toMark)]); }
      else ctx.globalAlpha = 1 - toMark;
    }
    poly(ctx, pts);
    const filled = cell ? cell.filled : true;
    if (k < 1 || !cell) {
      // The plots keep their drawn hatch as they travel. On arrival the hatch gives way to the chart's three marks,
      // read at a glance in one ink: a passed task (or the score reached) is solid, a failed one is an outline only,
      // and the cells between the score and the target are dashed. The legend sits in the words' area.
      const arrive = cell ? clamp((toChart - 0.8) / 0.2) : 0;
      ctx.globalAlpha = (cell ? 1 - arrive : lerp(1, 0.2, toChart)) * (mk && !cell ? 1 - toMark : 1);
      ctx.fillStyle = cityHatch(ctx); ctx.fill();
      ctx.globalAlpha = 1;
      if (cell && filled && arrive > 0) { ctx.globalAlpha = arrive; ctx.fillStyle = C.ink; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = C.ink; ctx.lineWidth = cell && arrive > 0.5 ? 1.2 : 0.8;
      if (cell && cell.target && arrive > 0.5) ctx.setLineDash([3, 2.5]);
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    } else { ctx.strokeStyle = C.ink; ctx.lineWidth = lerp(1, 2.2, toMark); ctx.stroke(); if (filled && toMark < 1) { ctx.globalAlpha = 1 - toMark; ctx.fillStyle = C.ink; ctx.fill(); ctx.globalAlpha = 1; } }
    ctx.globalAlpha = 1;
  });
  ctx.restore();
  if (k > 0.5 && k < 1.3) chartLabels(ctx, ch, clamp((k - 0.5) / 0.3) * (1 - clamp((k - 1) / 0.3)));
  if (mk && fillMark > 0) {
    ctx.save(); ctx.globalAlpha = fillMark; ctx.translate(mk.ox, mk.oy); ctx.scale(mk.S, mk.S); ctx.fillStyle = C.ink; mk.paths.forEach(p => ctx.fill(p)); ctx.restore();
  }
}
function chartLabels(ctx, ch, a) {
  ctx.save(); ctx.globalAlpha = a;
  const font = getComputedStyle(document.body).fontFamily;
  ch.rows.forEach(row => {
    const x0 = rtl ? ch.right : ch.left, dir = rtl ? -1 : 1;
    ctx.fillStyle = C.ink2; ctx.font = `${ch.phone ? 12 : 13}px ${font}`; ctx.textAlign = rtl ? 'right' : 'left';
    ctx.fillText(row.verdict ? L.verdictLabel : `${row.at} · ${L.tasksPassed}`, x0, row.y - 34);
    // dimension chain above the row: 0, filled, total
    const yy = row.y - 14; ctx.strokeStyle = C.line; ctx.lineWidth = 0.8;
    const X = i => x0 + dir * i * ch.cell;
    seg(ctx, [X(0), yy], [X(row.n), yy]);
    const marks = row.verdict ? [0, row.filled, row.target, row.n] : [0, row.filled, row.n];
    ctx.fillStyle = C.ink; ctx.font = `600 ${ch.phone ? 13 : 15}px ${font}`; ctx.textAlign = 'center';
    for (const m of marks) { seg(ctx, [X(m) - 4, yy + 4], [X(m) + 4, yy - 4]); if (m) ctx.fillText(String(m), X(m) - dir * (m === row.n ? 0 : 0), yy - 6); }
    if (row.verdict) { const ch2 = ch.cells[0].h; ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); seg(ctx, [X(row.target), row.y - 4], [X(row.target), row.y + ch2 + 6]); ctx.setLineDash([]); ctx.font = `12px ${font}`; ctx.fillStyle = C.ink2; ctx.fillText(L.target, X(row.target), row.y + ch2 + 22); }
  });
  ctx.restore();
}

function drawCrosshair(ctx, w, h, p, s, cx, cy) {
  const [px, py] = state.pointer;
  ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 0.6; ctx.setLineDash([2, 4]);
  seg(ctx, [px, 0], [px, h]); seg(ctx, [0, py], [w, py]); ctx.setLineDash([]);
  ctx.strokeRect(px - 5, py - 5, 10, 10);
  let cam = null;
  if (p < 2) cam = camera(0, Math.PI / 2, s, cx, cy); else if (p < 4) cam = houseCamera(p, s, cx, cy); else if (p < 5) cam = cityCamera(p - 4, s, cx, cy);
  ctx.fillStyle = C.ink2; ctx.font = '11px ui-monospace, Menlo, monospace'; ctx.textAlign = rtl ? 'left' : 'right';
  if (cam) { const [x, y] = cam.ground(px, py); ctx.fillText(`X ${x.toFixed(2)} m   Y ${(-y).toFixed(2)} m   Z 0.00`, rtl ? 16 : w - 16, h - 14); }
  ctx.restore();
}

// ---------- the page: pinning, scrubbing, interactions ----------
const wrap = document.querySelector('[data-stage]');
const canvas = wrap.querySelector('canvas');
const ctx = canvas.getContext('2d');
const steps = [...wrap.querySelectorAll('[data-step]')];
const sunInput = wrap.querySelector('[data-sun]'), cutInput = wrap.querySelector('[data-cut]'), sunOut = wrap.querySelector('[data-sun-out]');
let W = 0, H = 0, running = false, dirty = true, lastStep = -1;
const words = bindWords(wrap, steps, wrap.querySelector('[data-chain]'));
const renderMs = []; window.__arcyRenderMs = renderMs; // time spent drawing each frame, for the motion check

function size() {
  const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
  W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); markCache = null; dirty = true;
}
function readScroll() {
  const r = wrap.getBoundingClientRect(), span = r.height - innerHeight;
  // Slower and fewer: each stage takes an equal share of the scroll; it draws in the first 60% of that stretch and
  // then rests, complete, for the remaining 40% before the next stage begins.
  const u = clamp(-r.top / Math.max(1, span)) * STAGES, n = Math.min(STAGES - 1, Math.floor(u)), f = u - n;
  state.target = n + 0.999 * ease(clamp(f / 0.6));
}
let introT0 = performance.now();
function frame() {
  if (!running) return;
  // On arrival the sketch starts drawing by itself (first view holds a drawing in motion); scroll takes over.
  const intro = 0.999 * ease(clamp((performance.now() - introT0 - 300) / 3600));
  const goal = state.target; void intro;
  if (goal !== state.goal) { state.goal = goal; }
  const d = goal - state.p;
  if (Math.abs(d) > 0.0005) { state.p += d * 0.12; dirty = true; } else if (state.p !== goal) { state.p = goal; dirty = true; }
  if (dirty) {
    const t0 = performance.now();
    const P = Math.min(state.p, STAGES - 0.001);
    render(ctx, W, H, inner(P));
    if (P >= 2 && P < 3) drawWorking(ctx, W, H, P - 2);
    renderMs.push(performance.now() - t0); if (renderMs.length > 4000) renderMs.shift();
    // Words and drawing are one unit: the words are computed from the p that was just drawn (words.js), so they
    // enter with the drawing's change, hold while it rests, and leave as the next drawing starts.
    words(P);
    lastStep = Number(wrap.dataset.step);
    dirty = false;
  }
  requestAnimationFrame(frame);
}

function staticSequence() {
  // Reduced motion: the stages as a plain vertical sequence of finished plates, each beside its text.
  wrap.classList.add('is-static');
  steps.forEach((el, i) => {
    const c = document.createElement('canvas'); c.className = 'still'; c.setAttribute('aria-hidden', 'true');
    el.prepend(c);
    const r = c.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = r.width * dpr; c.height = r.height * dpr;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(g, r.width, r.height, inner(i + 0.999), { still: true });
    if (i === 2) drawWorking(g, r.width, r.height, 0.999);
  });
}

readColours();
if (reduce) staticSequence();
else {
  wrap.classList.add('is-live');
  size(); readScroll(); state.p = state.target;
  new ResizeObserver(size).observe(canvas);
  addEventListener('scroll', () => { readScroll(); }, { passive: true });
  new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !running) { running = true; requestAnimationFrame(frame); } else if (!on) running = false; }).observe(wrap);
  const mo = new MutationObserver(() => { readColours(); dirty = true; }); mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColours(); dirty = true; });

  // Pointer: crosshair everywhere, room hover in the plan, drag to turn, the section follows the pointer.
  let drag = null;
  const local = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener('pointermove', e => {
    state.pointer = local(e); dirty = true;
    const p = inner(state.p), { s, cx, cy } = layout(W, H);
    state.hoverRoom = null;
    if (p > 0.9 && p < 2.2) { const [x, y] = camera(0, Math.PI / 2, s, cx, cy).ground(...state.pointer); const i = ROOMS.findIndex(r => x > r[1] && x < r[3] && y > r[2] && y < r[4]); state.hoverRoom = i < 0 ? null : i; }
    if (drag && p > 2.3 && p < 4) { state.userTh = drag.th + (e.clientX - drag.x) * 0.008; if (Math.abs(e.clientX - drag.x) > 20) markUsed('drag'); }
    else if (p >= 3.4 && p < 4 && e.pointerType !== 'touch') { const [x, y] = houseCamera(p, s, cx, cy).ground(...state.pointer); state.cut = clamp(y, 0.5, 16.6); if (cutInput) cutInput.value = state.cut.toFixed(1); markUsed('cut'); }
  });
  canvas.addEventListener('pointerleave', () => { state.pointer = null; state.hoverRoom = null; dirty = true; });
  canvas.addEventListener('pointerdown', e => { if (inner(state.p) > 2.3 && inner(state.p) < 4) { drag = { x: e.clientX, th: state.userTh }; canvas.setPointerCapture(e.pointerId); } });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { state.userTh += (e.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1) * 0.12; dirty = true; markUsed('drag'); e.preventDefault(); }
  });
  sunInput?.addEventListener('input', () => { markUsed('sun'); state.sunHour = Number(sunInput.value); sunOut.textContent = fmtHour(state.sunHour); dirty = true; });
  cutInput?.addEventListener('input', () => { state.cut = Number(cutInput.value); dirty = true; });
  if (sunOut) sunOut.textContent = fmtHour(state.sunHour);
}
// Invitations: a drawn hint the first time each interaction is possible; it leaves once the thing is used.
const used = (() => { try { return JSON.parse(localStorage.getItem('arcy-used') || '{}'); } catch { return {}; } })();
function markUsed(k) { if (used[k]) return; used[k] = 1; try { localStorage.setItem('arcy-used', JSON.stringify(used)); } catch {} hints(lastStep); }
function hints(st) {
  const show = { drag: st === 3 && !used.drag, sun: st === 3 && used.drag && !used.sun, cut: st === 4 && !used.cut && matchMedia('(hover: hover)').matches };
  wrap.querySelectorAll('[data-hint]').forEach(el => { el.hidden = !show[el.dataset.hint]; });
}
function fmtHour(hr) { const h = Math.floor(hr), m = Math.round((hr - h) * 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
window.__arcyStage = state;
