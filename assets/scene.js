/*
  A scene: the opening of an inner page, built like the home stage (MOTION.md, rule 6). The page's plate is pinned
  on one side and drawn in stages; beside it, one chapter of words per stage.

  One clock, p. The whole number is the stage, the fraction how far its drawing has come:
    stage 0     draws by itself as the reader arrives (about two seconds), then rests
    stage 1..   each takes one stretch of scroll: it draws over the first 60% of the stretch and rests for the
                remaining 40% before the next begins (stage 0 rests for half a stretch first)
  p follows its goal by 12% a frame, as on the home stage. The plate is inline SVG whose elements carry their
  stage (--k) and their place in it (--o); this file only writes --p on the figure and site.css turns that into
  line drawing and settling fills. The words are shown from the same p (words.js). Nothing runs off screen.
  With reduced motion or without this script, the scene is the finished plate followed by its chapters.
*/
import { bindWords } from './words.js';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

for (const wrap of reduce ? [] : document.querySelectorAll('[data-scene]')) {
  const steps = [...wrap.querySelectorAll('[data-step]')], N = steps.length, fig = wrap.querySelector('[data-scene-plate]');
  const words = bindWords(wrap, steps, wrap.querySelector('[data-chain]'));
  const state = { p: 0, scroll: 0 }; window.__arcyScene = state;
  let running = false, shown = -1;
  const t0 = performance.now();
  wrap.classList.add('is-live');
  const read = () => {
    const r = wrap.getBoundingClientRect(), u = clamp(-r.top / Math.max(1, r.height - innerHeight)) * (N - 0.5) - 0.5;
    if (u <= 0) { state.scroll = 0; return; }
    const n = Math.min(N - 2, Math.floor(u));
    state.scroll = 1 + n + 0.999 * ease(clamp((u - n) / 0.6));
  };
  const frame = () => {
    if (!running) return;
    const goal = Math.max(0.999 * ease(clamp((performance.now() - t0 - 200) / 2200)), state.scroll), d = goal - state.p;
    state.p = Math.abs(d) > 0.0005 ? state.p + d * 0.12 : goal;
    if (state.p !== shown) { fig.style.setProperty('--p', state.p.toFixed(3)); words(Math.min(state.p, N - 0.001)); shown = state.p; }
    requestAnimationFrame(frame);
  };
  read(); if (state.scroll) state.p = state.scroll;
  addEventListener('scroll', read, { passive: true });
  new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !running) { running = true; requestAnimationFrame(frame); } else if (!on) running = false; }).observe(wrap);
}
