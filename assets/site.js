/* Shared behaviour for every page (MOTION.md has the rules). Deliberately little: the line drawing is the one
   signature motion; everything else is still.
   - theme toggle; the menu and the results folds open on wide screens
   - a plate draws itself once when it enters the view (CSS draws; this adds `.in`); gallery plates are drawn complete
   - the regions gallery moves by drag, arrow keys and buttons (never by capturing the vertical wheel)
   With reduced motion, CSS shows every plate finished and nothing animates. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const btn = document.querySelector('[data-theme-toggle]');
  if (btn) btn.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('arcy-theme', root.dataset.theme); } catch (e) {}
  });

  const wide = matchMedia('(min-width: 900px)');
  const menu = document.querySelector('.menu');
  const folds = document.querySelectorAll('[data-fold]');
  const sync = () => { if (menu) menu.open = wide.matches; folds.forEach(f => { f.open = wide.matches; }); };
  sync(); wide.addEventListener('change', sync);

  // Gallery plates are complete from the start: a region's name is never beside an empty or half-drawn frame.
  document.querySelectorAll('.rplate').forEach(p => p.classList.add('in'));
  const plates = document.querySelectorAll('[data-plate]:not(.rplate)');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
    plates.forEach(p => io.observe(p));
  } else plates.forEach(p => p.classList.add('in'));

  const gal = document.querySelector('[data-gallery]');
  if (gal) {
    const track = gal.querySelector('.gal-track'), slides = [...track.children], now = gal.querySelector('[data-gal-now]');
    const rtl = root.dir === 'rtl';
    const current = () => { const mid = track.getBoundingClientRect().left + track.clientWidth / 2; let best = 0, d = Infinity; slides.forEach((s, i) => { const r = s.getBoundingClientRect(), dd = Math.abs(r.left + r.width / 2 - mid); if (dd < d) { d = dd; best = i; } }); return best; };
    const go = dir => { const s = slides[Math.max(0, Math.min(slides.length - 1, current() + dir))]; s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); };
    gal.querySelector('[data-gal=prev]').addEventListener('click', () => go(-1));
    gal.querySelector('[data-gal=next]').addEventListener('click', () => go(1));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { go(rtl ? -1 : 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { go(rtl ? 1 : -1); e.preventDefault(); } });
    let drag = null;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, s: track.scrollLeft }; track.style.scrollSnapType = 'none'; track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove', e => { if (drag) track.scrollLeft = drag.s - (e.clientX - drag.x); });
    const end = () => { if (!drag) return; drag = null; track.style.scrollSnapType = ''; go(0); };
    track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
    let t = 0; track.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(() => { now.textContent = String(current() + 1).padStart(2, '0'); }); }, { passive: true });
  }
})();
