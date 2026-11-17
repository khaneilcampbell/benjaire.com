// Flow page motion. Enhancement only: without this script every screen,
// stop and outcome shows its complete still frame.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Hero: pointer depth on the layered product screens.
const layers = document.querySelector<HTMLElement>('[data-layers]');
if (layers && fine && !reduce) {
  layers.addEventListener('pointermove', (e) => {
    const r = layers.getBoundingClientRect();
    layers.style.setProperty('--lx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    layers.style.setProperty('--ly', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  });
  layers.addEventListener('pointerleave', () => { layers.style.setProperty('--lx', '0'); layers.style.setProperty('--ly', '0'); });
}

// Story: the beat in the middle of the viewport picks the pinned screen.
const beats = [...document.querySelectorAll<HTMLElement>('[data-beat]')];
const screens = [...document.querySelectorAll<HTMLElement>('[data-screen]')];
const bars = [...document.querySelectorAll<HTMLElement>('.progress b')];
const label = document.querySelector<HTMLElement>('[data-device-label]');
if (beats.length && !reduce) {
  const show = (i: number) => {
    beats.forEach((b, j) => b.classList.toggle('on', j === i));
    screens.forEach((s, j) => s.classList.toggle('on', j === i));
    bars.forEach((b, j) => b.classList.toggle('on', j <= i));
    if (label) label.textContent = beats[i].dataset.label ?? '';
  };
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) show(Number((e.target as HTMLElement).dataset.beat)); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  beats.forEach((b) => io.observe(b));
}

// How it works: the track fills and the stops light as the path scrolls in.
const path = document.querySelector<HTMLElement>('[data-path]');
if (path && !reduce) {
  path.dataset.live = '';
  const stops = [...path.querySelectorAll<HTMLElement>('[data-n]')];
  let ticking = false;
  const frame = () => {
    ticking = false;
    const r = path.getBoundingClientRect();
    const d = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (innerHeight * 0.5)));
    path.style.setProperty('--d', d.toFixed(3));
    stops.forEach((s, i) => s.classList.toggle('node-on', d >= i / (stops.length - 1) - 0.01));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
}

// Outcomes: the ring and bars settle in once.
const oc = document.querySelector<HTMLElement>('[data-outcomes]');
if (oc && !reduce) {
  const r = oc.getBoundingClientRect();
  if (r.top > innerHeight) {
    oc.dataset.wait = '';
    oc.style.setProperty('--on', '0');
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      delete oc.dataset.wait;
      oc.style.setProperty('--on', '1');
      obs.disconnect();
    }, { threshold: 0.35 }).observe(oc);
  }
}
