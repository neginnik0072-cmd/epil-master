import { gsap } from 'gsap';

/** Prices per minute, taken from the studio's price list. */
const RATES = {
  'w-top-std-body': 60,
  'w-top-std-face': 65,
  'w-top-xcell': 80,
  'w-pro-std-body': 55,
  'w-pro-std-face': 60,
  'w-pro-xcell': 80,
  'm-std': 75,
  'm-xcell': 80,
};
const ELECTRODE = 200;

const fmt = (n) => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');

export function initCalc(form, { reduced = false } = {}) {
  const out = {
    total: document.querySelector('[data-total]'),
    rate: document.querySelector('[data-l-rate]'),
    time: document.querySelector('[data-l-time]'),
    cataRow: document.querySelector('[data-l-cata]'),
    cataV: document.querySelector('[data-l-cata-v]'),
    min: form.querySelector('[data-min]'),
    devLabel: form.querySelector('[data-devlabel]'),
  };
  const range = form.querySelector('input[type=range]');
  const shown = { v: 0 };

  function key(v) {
    if (v.who === 'm') return v.dev === 'xcell' ? 'm-xcell' : 'm-std';
    if (v.dev === 'xcell') return `w-${v.lvl}-xcell`;
    return `w-${v.lvl}-std-${v.zone}`;
  }

  function update(animate = true) {
    const d = new FormData(form);
    const v = Object.fromEntries(d.entries());
    const minutes = +v.min;
    const cata = +v.cata;

    // conditional fieldsets
    form.querySelector('[data-when="w"]').classList.toggle('is-off', v.who !== 'w');
    form.querySelector('[data-when="w-std"]').classList.toggle('is-off', !(v.who === 'w' && v.dev === 'std'));
    out.devLabel.textContent = v.who === 'm'
      ? 'Apilus Cleo, Senior, ЭлитЭп'
      : v.lvl === 'pro' ? 'ЭлитЭп, Apilus Cleo, Senior' : 'Apilus Cleo, Senior';

    const k = key(v);
    const rate = RATES[k];
    const timeCost = rate * minutes;
    const total = timeCost + ELECTRODE + cata;

    out.min.textContent = `${minutes} мин`;
    range.style.setProperty('--p', ((minutes - 30) / (180 - 30)) * 100 + '%');
    out.rate.textContent = `${rate} ₽/мин × ${minutes} мин`;
    out.time.textContent = `${fmt(timeCost)} ₽`;
    out.cataRow.hidden = cata === 0;
    out.cataV.textContent = `${fmt(cata)} ₽`;

    document.querySelectorAll('[data-rate]').forEach((r) => r.classList.toggle('is-hit', r.dataset.rate === k));

    if (animate && !reduced) {
      gsap.to(shown, { v: total, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => { out.total.textContent = fmt(shown.v); } });
    } else {
      shown.v = total; out.total.textContent = fmt(total);
    }
  }

  form.addEventListener('input', () => update());
  form.addEventListener('change', () => update());
  update(false);
}
