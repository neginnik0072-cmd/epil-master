/**
 * Hero «silk ribbon»: a bundle of fine threads that twist like the
 * brand's wave graphics. The pointer acts as the probe: threads part
 * around it and tiny sparks fly off.
 */
export function initThreads(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;
  let W = 0, H = 0, DPR = 1, mobile = false;
  let N = 54, SEG = 110;
  let running = false, raf = 0, t0 = performance.now();
  let progress = 0; // 0..1 scroll-out of hero
  let intro = 0; // 0..1 entrance

  const ptr = { x: -9999, y: -9999, sx: -9999, sy: -9999, inside: false, power: 0, vx: 0, vy: 0 };
  const sparks = [];

  function resize() {
    const r = host.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mobile = W < 1024;
    N = mobile ? 34 : 56;
    SEG = mobile ? 64 : 120;
    if (reduced) draw(4);
  }

  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (ptr.inside) { ptr.vx = x - ptr.x; ptr.vy = y - ptr.y; }
    else { ptr.sx = x; ptr.sy = y; }
    ptr.x = x; ptr.y = y; ptr.inside = true;
    const speed = Math.hypot(ptr.vx, ptr.vy);
    if (speed > 6 && sparks.length < 60) {
      const n = Math.min(3, (speed / 14) | 0) + 1;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 2.2;
        sparks.push({ x, y, vx: Math.cos(a) * s - ptr.vx * 0.04, vy: Math.sin(a) * s - ptr.vy * 0.04 - 0.4, life: 1, r: 0.8 + Math.random() * 1.4 });
      }
    }
  }
  function onLeave() { ptr.inside = false; }

  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onMove, { passive: true });
  host.addEventListener('pointerleave', onLeave);
  host.addEventListener('pointercancel', onLeave);
  window.addEventListener('resize', resize);

  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    // ease pointer
    ptr.sx += (ptr.x - ptr.sx) * 0.18;
    ptr.sy += (ptr.y - ptr.sy) * 0.18;
    ptr.power += ((ptr.inside ? 1 : 0) - ptr.power) * 0.06;

    const p = progress;
    const cxBase = mobile ? W * 0.80 : W * 0.70;
    const swayA = mobile ? W * 0.10 : W * 0.085;
    const bandW = (mobile ? W * 0.22 : Math.min(W * 0.14, 230)) * (1 - p * 0.92);
    const R = mobile ? 90 : 150;
    const R2 = R * R;
    const push = (mobile ? 40 : 64) * ptr.power;
    const rev = intro; // reveal from top to bottom

    for (let i = 0; i < N; i++) {
      const s = (i / (N - 1)) * 2 - 1; // -1..1 across the ribbon
      const ph = s * 0.55;
      const a = 0.18 + 0.42 * (1 - Math.abs(s) * 0.55);
      ctx.beginPath();
      const segs = Math.max(2, Math.floor(SEG * rev));
      for (let j = 0; j <= segs; j++) {
        const u = j / SEG;
        let y = -0.06 * H + u * 1.12 * H;
        const cx = cxBase
          + Math.sin(u * 2.3 + time * 0.28) * swayA
          + Math.sin(u * 5.1 - time * 0.17) * swayA * 0.25
          - (u - 0.5) * W * 0.12;
        const twist = u * 4.6 - time * 0.42 + ph;
        const widthMod = 0.75 + 0.45 * Math.sin(u * 1.9 + time * 0.22);
        let x = cx + s * bandW * widthMod * Math.cos(twist) + s * s * 10 * Math.sin(u * 7 + time * 0.5);

        // probe repulsion
        if (push > 0.5) {
          const dx = x - ptr.sx, dy = y - ptr.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 * 4) {
            const d = Math.sqrt(d2) || 1;
            const f = Math.exp(-d2 / (2 * R2 * 0.5)) * push;
            x += (dx / d) * f;
            y += (dy / d) * f * 0.35;
          }
        }
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(31,72,56,${a * (1 - p * 0.4)})`;
      ctx.lineWidth = Math.abs(s) < 0.04 ? 1.4 : 0.9;
      ctx.stroke();
    }

    // probe glow
    if (ptr.power > 0.02) {
      const g = ctx.createRadialGradient(ptr.sx, ptr.sy, 0, ptr.sx, ptr.sy, 42);
      g.addColorStop(0, `rgba(154,242,196,${0.55 * ptr.power})`);
      g.addColorStop(1, 'rgba(154,242,196,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ptr.sx, ptr.sy, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(31,72,56,${ptr.power})`;
      ctx.beginPath(); ctx.arc(ptr.sx, ptr.sy, 2.6, 0, Math.PI * 2); ctx.fill();
    }

    // sparks
    for (let k = sparks.length - 1; k >= 0; k--) {
      const sp = sparks[k];
      sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.03; sp.vx *= 0.97; sp.life -= 0.022;
      if (sp.life <= 0) { sparks.splice(k, 1); continue; }
      ctx.fillStyle = `rgba(31,72,56,${sp.life * 0.9})`;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(154,242,196,${sp.life * 0.6})`;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * 2.6 * sp.life, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    draw((now - t0) / 1000);
  }

  function start() {
    if (running || reduced) return;
    running = true; raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
  io.observe(host);

  resize();
  if (reduced) { intro = 1; draw(4); }

  return {
    setProgress(v) { progress = v; if (reduced) draw(4); },
    setIntro(v) { intro = v; },
  };
}
