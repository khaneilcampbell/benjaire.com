// Signal field: scattered lines of light (inquiries) drift in from the left,
// are pulled into order, turn ice blue and land on a target element (the
// owner alert). Pure canvas, no dependencies. Pauses off screen and in
// background tabs; with reduced motion it draws one still frame.
type Line = { y0: number; amp: number; ph: number; sp: number; a: number; lane: number; pulses: { s: number; v: number }[] };

export function signalField(stage: HTMLElement, canvas: HTMLCanvasElement, target: HTMLElement | null, onArrive?: () => void) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { running: () => false };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINE = '232,237,243', ICE = '143,179,220';
  let w = 0, h = 0, tx = 0, ty = 0, running = false, lastPing = 0;
  const t0 = performance.now();
  const lines: Line[] = Array.from({ length: 18 }, (_, i) => ({
    y0: 0.06 + Math.random() * 0.88, amp: 0.05 + Math.random() * 0.09, ph: Math.random() * 6.28,
    sp: 0.00005 + Math.random() * 0.00007, a: 0.07 + Math.random() * 0.12, lane: (i % 5) - 2,
    pulses: Array.from({ length: i % 3 === 0 ? 2 : 1 }, () => ({ s: Math.random(), v: 0.00006 + Math.random() * 0.00006 })),
  }));
  const smooth = (e0: number, e1: number, x: number) => { const k = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return k * k * (3 - 2 * k); };

  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (target) {
      const a = target.getBoundingClientRect();
      const wide = innerWidth >= 900;
      tx = wide ? a.left - r.left + 2 : a.left - r.left + a.width * 0.78;
      ty = wide ? a.top - r.top + a.height * 0.5 : a.top - r.top + 2;
    } else { tx = w * 0.62; ty = h * 0.5; }
  };
  const pt = (l: Line, s: number, t: number): [number, number, number] => {
    const x = -0.04 * w + s * (tx + 0.04 * w);
    const m = smooth(0.35, 0.92, s);
    const wave = Math.sin(s * 4.2 + l.ph + t * l.sp * 6.28) * l.amp + Math.sin(s * 9 + l.ph * 2) * 0.012;
    const yRaw = h * (l.y0 + wave);
    const yLane = ty + l.lane * 5 * (1 - smooth(0.9, 1, s));
    return [x, yRaw + (yLane - yRaw) * m, m];
  };
  const draw = (t: number, now: number) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, w * 0.45);
    g.addColorStop(0, `rgba(${ICE},0.16)`); g.addColorStop(1, `rgba(${ICE},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (const l of lines) {
      const grad = ctx.createLinearGradient(0, 0, Math.max(1, tx), 0);
      grad.addColorStop(0, `rgba(${LINE},${l.a})`);
      grad.addColorStop(0.55, `rgba(${LINE},${l.a})`);
      grad.addColorStop(1, `rgba(${ICE},${Math.min(0.5, l.a * 2.6)})`);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      for (let s = 0; s <= 1.0001; s += 0.02) { const [x, y] = pt(l, s, t); if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      for (const p of l.pulses) {
        const head = reduce ? p.s : (p.s + t * p.v) % 1;
        if (!reduce && head > 0.985 && onArrive && now - lastPing > 1100) { lastPing = now; onArrive(); }
        for (let k = 0; k < 16; k++) {
          const s = head - k * 0.006; if (s < 0) break;
          const [x, y, m] = pt(l, s, t);
          ctx.fillStyle = `rgba(${Math.round(232 - 89 * m)},${Math.round(237 - 58 * m)},${Math.round(243 - 23 * m)},${(1 - k / 16) * 0.95})`;
          ctx.beginPath(); ctx.arc(x, y, Math.max(0.4, 1.7 - k * 0.08), 0, 6.28); ctx.fill();
        }
      }
    }
  };
  const loop = (now: number) => { if (!running) return; draw(now - t0, now); requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce && !document.hidden) { running = true; requestAnimationFrame(loop); } };
  const stop = () => { running = false; };

  size(); draw(0, 0);
  // Re-measure when the stage resizes or web fonts change the alert's height.
  new ResizeObserver(() => { size(); if (!running) draw(performance.now() - t0, 0); }).observe(stage);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(stage);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  return { running: () => running };
}
