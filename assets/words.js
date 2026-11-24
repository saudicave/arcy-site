/*
  Words and drawing are one unit (MOTION.md, rule 6). Every scrubbed drawing on the site (the home stage and the
  scenes of the inner pages) has one clock, p: the whole number is the stage being drawn, the fraction is how far
  that stage's drawing has come. The words are a pure function of the same p, so they can neither lag nor lead:

    leaving   while the next drawing makes its first move (its first OUT of progress), the previous words fade out
    entering  then the new words come in over the next IN of progress, while the drawing makes its main change
    holding   from there on, and for as long as the drawing rests, the words stay

  Only one stage's words are ever shown. scripts/overlap.mjs recomputes this function from the drawing's p and
  fails the check if the page shows anything else.
*/
// The previous stage's words stay until the new drawing has visibly arrived (a third of its stretch), so the words
// never name a picture that is not yet on the screen (the owner saw new words over the old drawing).
export const OUT = 0.35, IN = 0.33;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export function wordsAt(p, last) {
  const n = Math.min(last, Math.max(0, Math.floor(p))), q = clamp((p - n) / 0.999);
  // The words change with the stage and are then fully there: a scroll that stops half way never leaves them
  // half-transparent (the owner saw ghosted text). The fade in is a short timed animation in CSS, not the scroll.
  if (n > 0 && q < OUT) return { stage: n - 1, alpha: 1 };
  return { stage: n, alpha: 1 };
}

// Returns a function to call with p on every drawn frame; it touches the page only when something changed.
export function bindWords(wrap, steps, chain) {
  let shown = -1, alpha = -1, now = -1, u = -1;
  const marks = chain ? [...chain.querySelectorAll('[data-at]')] : [];
  return p => {
    const w = wordsAt(p, steps.length - 1), a = Math.round(w.alpha * 100) / 100;
    if (w.stage !== shown) { steps.forEach((el, i) => el.toggleAttribute('data-on', i === w.stage)); wrap.dataset.step = w.stage; shown = w.stage; alpha = -1; }
    if (!chain) return;
    const v = Math.round(clamp(p / steps.length) * 1000) / 1000;
    if (v !== u) { chain.style.setProperty('--u', v); u = v; }
    const st = Math.min(steps.length - 1, Math.floor(p));
    if (st !== now) { let cur = null; for (const m of marks) if (Number(m.dataset.at) <= st) cur = m; marks.forEach(m => m.toggleAttribute('data-now', m === cur)); now = st; }
  };
}
