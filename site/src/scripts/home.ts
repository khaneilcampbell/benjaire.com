import { signalField } from './signal';

// Homepage interactions. Everything here is enhancement: without this script
// the page shows all content and nothing moves. Nav behaviour lives in Nav.astro.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const desktop = matchMedia('(min-width: 900px)');

// Hero load sequence: let the first frame paint, then settle the render and copy.
const ready = () => root.classList.add('ready');
requestAnimationFrame(() => requestAnimationFrame(ready));
setTimeout(ready, 120); // rAF is paused in background tabs

// Hero: the signal field lands in the owner alert, which glows on arrival and
// cycles through sample inquiries while the hero is on screen.
const hero = document.querySelector<HTMLElement>('.hero');
const canvas = document.querySelector<HTMLCanvasElement>('[data-signal]');
const alertEl = document.querySelector<HTMLElement>('[data-alert]');
if (hero && canvas) {
  const ping = () => {
    if (!alertEl) return;
    alertEl.classList.add('ping');
    setTimeout(() => alertEl.classList.remove('ping'), 420);
  };
  const field = signalField(hero, canvas, alertEl, ping);
  const body = alertEl?.querySelector<HTMLElement>('[data-alert-body]');
  if (alertEl && body && !reduce) {
    // Sample data only: no real people or firms.
    const SAMPLES: [string, [string, string?][], string][] = [
      ['[Urgent] New inquiry: Dana Lee, Lee & Co', [['Branding'], ['Urgent', 'urgent'], ['$5,000']], 'Hi Dana, thank you for reaching out. A launch next week is a tight window…'],
      ['New inquiry: Marcus Ortiz, Ortiz Family Dental', [['Website'], ['This week'], ['$2,500']], 'Hi Marcus, thanks for getting in touch. We can start with a short call about your booking page…'],
      ['New inquiry: Priya Shah, Harbor Accounting', [['Automation'], ['Normal'], ['$1,200']], 'Hi Priya, thank you for your note. Moving client intake out of email is a great place to start…'],
    ];
    const title = body.querySelector('[data-alert-title]');
    const tags = body.querySelector('[data-alert-tags]');
    const reply = body.querySelector('[data-alert-reply]');
    const count = alertEl.querySelector('[data-alert-count]');
    let i = 0;
    setInterval(() => {
      if (!field.running()) return;
      i = (i + 1) % SAMPLES.length;
      body.classList.add('out');
      setTimeout(() => {
        const [t, tg, q] = SAMPLES[i];
        if (title) title.textContent = t;
        if (tags) tags.replaceChildren(...tg.map(([x, c]) => { const li = document.createElement('li'); li.textContent = x; if (c) li.className = c; return li; }));
        if (reply) reply.textContent = q;
        if (count) count.textContent = `Sample ${i + 1} of ${SAMPLES.length}`;
        body.classList.remove('out');
      }, 320);
    }, 5200);
  }
  if (finePointer && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      if (!desktop.matches) return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--hx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--hy', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => { hero.style.setProperty('--hx', '0'); hero.style.setProperty('--hy', '0'); });
  }
}

// Operating model: the sticky stage crossfades to the visual of the step in view.
const stage = document.querySelector<HTMLElement>('[data-stage]');
const stageLabel = document.querySelector<HTMLElement>('[data-stage-label]');
const steps = [...document.querySelectorAll<HTMLElement>('[data-step]')];
if (stage && steps.length) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const i = en.target.getAttribute('data-step') ?? '0';
      stage.dataset.active = i;
      const name = en.target.querySelector('h3')?.textContent ?? '';
      if (stageLabel) stageLabel.textContent = `${String(Number(i) + 1).padStart(2, '0')} · ${name}`;
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));
}

// Section rail: marks the section in view; turns light over the dark band.
const rail = document.querySelector<HTMLElement>('.rail');
if (rail) {
  const marks = new Map([...rail.querySelectorAll<HTMLElement>('[data-rail]')].map((m) => [m.dataset.rail, m]));
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const id = (en.target as HTMLElement).dataset.section;
      marks.forEach((m, k) => m.classList.toggle('on', k === id));
      rail.classList.toggle('on-dark', id === 'partner' || id === 'hero');
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
}
