import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};

/**
 * «Волос за волосом» — scroll-scrubbed schematic of electrolysis:
 * the probe visits each active follicle, a spark destroys it and the
 * hair slides out; dormant follicles wake up in waves until the skin is smooth.
 */
export function initHow(section, { reduced = false, mobile = false } = {}) {
  const svg = section.querySelector('.how__svg');
  const steps = [...section.querySelectorAll('.how__steps li')];
  const countEl = section.querySelector('.how__count');

  const SURF = 230, BULB = 392;
  const xs = [90, 170, 250, 330, 410, 490, 570, 650, 730];
  const waves = [[1, 3, 5, 7], [0, 4, 8], [2, 6]];
  const heights = [118, 96, 132, 104, 90, 126, 110, 140, 100];
  const lean = [8, -6, 10, -4, 6, -8, 4, -10, 7];

  // defs
  const defs = el('defs', {}, svg);
  const glow = el('filter', { id: 'hwGlow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  el('feGaussianBlur', { stdDeviation: '6', result: 'b' }, glow);
  const m = el('feMerge', {}, glow);
  el('feMergeNode', { in: 'b' }, m); el('feMergeNode', { in: 'SourceGraphic' }, m);
  const derm = el('linearGradient', { id: 'hwDerm', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: '0', 'stop-color': '#1f4838', 'stop-opacity': '.55' }, derm);
  el('stop', { offset: '1', 'stop-color': '#1f4838', 'stop-opacity': '0' }, derm);

  // skin
  const skinD = 'M0 230 C 120 221, 250 239, 400 230 S 680 221, 800 230';
  el('path', { d: skinD + ' L800 520 L0 520 Z', fill: 'url(#hwDerm)' }, svg);
  for (let k = 0; k < 4; k++) {
    el('path', { d: `M0 ${280 + k * 46} C 200 ${272 + k * 46}, 600 ${290 + k * 46}, 800 ${280 + k * 46}`, fill: 'none', stroke: 'rgba(243,241,234,.06)', 'stroke-width': 1 }, svg);
  }
  const skin = el('path', { d: skinD, fill: 'none', stroke: 'rgba(243,241,234,.55)', 'stroke-width': 1.6 }, svg);
  const skinGlow = el('path', { d: skinD, fill: 'none', stroke: '#9af2c4', 'stroke-width': 2.2, filter: 'url(#hwGlow)', opacity: 0 }, svg);

  // labels
  const lab = (x, y, t, anchor = 'start') => el('text', { x, y, fill: 'rgba(243,241,234,.38)', 'font-family': 'JetBrains Mono Variable, monospace', 'font-size': 11, 'letter-spacing': '1.5', 'text-anchor': anchor }, svg).appendChild(document.createTextNode(t));
  lab(8, SURF - 12, 'КОЖА');
  lab(8, BULB + 44, 'ФОЛЛИКУЛЫ');

  const F = xs.map((x, i) => {
    const g = el('g', {}, svg);
    const canal = el('path', { d: `M${x} ${SURF + 2} L${x + lean[i] * 0.15} ${BULB - 14}`, stroke: 'rgba(243,241,234,.18)', 'stroke-width': 1, 'stroke-dasharray': '2 4', fill: 'none' }, g);
    const bulb = el('ellipse', { cx: x + lean[i] * 0.15, cy: BULB, rx: 10, ry: 15, fill: 'rgba(243,241,234,.08)', stroke: 'rgba(243,241,234,.7)', 'stroke-width': 1.3 }, g);
    const tip = SURF - heights[i];
    const hair = el('path', {
      d: `M${x + lean[i] * 0.15} ${BULB - 10} L${x} ${SURF} C ${x + lean[i] * 0.3} ${SURF - 40}, ${x + lean[i]} ${tip + 30}, ${x + lean[i] * 1.6} ${tip}`,
      fill: 'none', stroke: '#f3f1ea', 'stroke-width': 2.4, 'stroke-linecap': 'round',
    }, g);
    const spark = el('circle', { cx: x + lean[i] * 0.15, cy: BULB, r: 4, fill: '#9af2c4', filter: 'url(#hwGlow)', opacity: 0 }, g);
    const len = hair.getTotalLength();
    hair.style.strokeDasharray = `${len}`;
    return { x, g, canal, bulb, hair, spark, len, bx: x + lean[i] * 0.15 };
  });

  // probe
  const probe = el('g', {}, svg);
  el('rect', { x: -7, y: -230, width: 14, height: 70, rx: 7, fill: 'rgba(243,241,234,.12)', stroke: 'rgba(243,241,234,.5)', 'stroke-width': 1 }, probe);
  el('line', { x1: 0, y1: -160, x2: 0, y2: 0, stroke: '#9af2c4', 'stroke-width': 1.4 }, probe);
  el('circle', { cx: 0, cy: 0, r: 3, fill: '#9af2c4', filter: 'url(#hwGlow)' }, probe);
  el('text', { x: 14, y: -196, fill: 'rgba(243,241,234,.45)', 'font-family': 'JetBrains Mono Variable, monospace', 'font-size': 11, 'letter-spacing': '1.5' }, probe).appendChild(document.createTextNode('ЗОНД'));

  // initial state
  const dormant = new Set([...waves[1], ...waves[2]]);
  F.forEach((f, i) => {
    if (dormant.has(i)) {
      gsap.set(f.hair, { strokeDashoffset: f.len });
      gsap.set(f.bulb, { opacity: 0.35 });
    } else {
      gsap.set(f.hair, { strokeDashoffset: 0 });
    }
  });
  const REST_Y = 120;
  gsap.set(probe, { x: 40, y: REST_Y });

  const setCount = (n) => { countEl.textContent = n; };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const labels = [];
  const killTimes = [];

  const kill = (i) => {
    const f = F[i];
    const t0 = tl.duration();
    tl.to(probe, { x: f.bx, y: REST_Y, duration: 0.45 })
      .to(probe, { y: BULB - 6, duration: 0.35, ease: 'power1.in' })
      .to(f.spark, { attr: { r: 26 }, opacity: 1, duration: 0.12, ease: 'power1.out' })
      .to(f.bulb, { stroke: '#9af2c4', duration: 0.08 }, '<')
      .to(f.spark, { attr: { r: 40 }, opacity: 0, duration: 0.25 })
      .to(f.hair, { y: -150, opacity: 0, duration: 0.5, ease: 'power2.in' }, '<')
      .to(f.bulb, { opacity: 0.12, stroke: 'rgba(243,241,234,.7)', attr: { rx: 6, ry: 9 }, duration: 0.35 }, '<')
      .to(f.canal, { opacity: 0.25, duration: 0.3 }, '<')
      .to(probe, { y: REST_Y, duration: 0.35 }, '<');
    killTimes.push(t0 + 0.9);
    return t0;
  };

  const grow = (wave) => {
    const pos = tl.duration();
    wave.forEach((i, n) => {
      tl.to(F[i].hair, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.out' }, pos + n * 0.12);
      tl.to(F[i].bulb, { opacity: 1, duration: 0.4 }, pos + n * 0.12);
    });
  };

  labels.push(0); // step 1
  const first = kill(waves[0][0]);
  labels.push(first + 0.82); // step 2 — the first spark
  waves[0].slice(1).forEach(kill);
  tl.to(probe, { x: 40, duration: 0.4 });
  labels.push(tl.duration()); // step 3
  grow(waves[1]);
  waves[1].forEach(kill);
  grow(waves[2]);
  waves[2].forEach(kill);
  tl.to(probe, { x: 40, y: REST_Y - 30, opacity: 0.4, duration: 0.5 });
  labels.push(tl.duration()); // step 4
  tl.to(skinGlow, { opacity: 1, duration: 0.6 }, '<')
    .to(skin, { stroke: '#9af2c4', duration: 0.6 }, '<')
    .to({}, { duration: 0.6 });

  const setStep = (time) => {
    let s = 0;
    for (let i = 0; i < labels.length; i++) if (time >= labels[i]) s = i;
    steps.forEach((li, i) => li.classList.toggle('is-active', i === s));
    let n = 0;
    for (const kt of killTimes) if (time >= kt) n++;
    setCount(n);
  };

  if (reduced) {
    tl.progress(1);
    setStep(tl.duration());
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => '+=' + (mobile ? window.innerHeight * 2.8 : window.innerHeight * 3.2),
    pin: section.querySelector('.how__pin'),
    scrub: 0.6,
    animation: tl,
    invalidateOnRefresh: true,
  });
  tl.eventCallback('onUpdate', () => setStep(tl.time()));
  setStep(0);
}
