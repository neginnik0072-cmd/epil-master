import { gsap } from 'gsap';

const fmt = (n) => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');

export function initCalc(form, { reduced = false, onLayoutChange } = {}) {
  const panel = form.closest('[role="tabpanel"]');
  const priceLists = [...panel.querySelectorAll('[data-branch-prices]')];
  const bookingLinks = panel.querySelectorAll('[data-book-for]');
  const rates = new Map([...panel.querySelectorAll('[data-rate]')].map((row) => [row.dataset.rate, {
    row,
    amount: Number(row.querySelector('data').value),
  }]));
  const electrode = Number(panel.querySelector('[data-electrode]').value);
  const fields = {
    gender: form.querySelector('[data-calc-gender]'),
    level: form.querySelector('[data-calc-level]'),
    device: form.querySelector('[data-calc-device]'),
    zone: form.querySelector('[data-calc-zone]'),
    service: form.querySelector('[data-nekrasova-only]'),
  };
  const out = {
    address: panel.querySelector('[data-calc-address]'),
    total: panel.querySelector('[data-total]'),
    rate: panel.querySelector('[data-l-rate]'),
    time: panel.querySelector('[data-l-time]'),
    cataRow: panel.querySelector('[data-l-cata]'),
    cataV: panel.querySelector('[data-l-cata-v]'),
    min: form.querySelector('[data-min]'),
    devLabel: form.querySelector('[data-devlabel]'),
  };
  const { branch, who, lvl, dev, zone, min: range, cata } = form.elements;
  const shown = { v: 0 };
  let highlightedRow;

  function rateKey(isNekrasova, forWomen) {
    if (isNekrasova) return `w-${lvl.value}-senior`;
    if (!forWomen) return `m-${dev.value}`;
    if (dev.value === 'xcell') return `w-${lvl.value}-xcell`;
    return `w-${lvl.value}-std-${zone.value}`;
  }

  function update(animate = true) {
    const branchName = branch.value;
    const isNekrasova = branchName === 'nekrasova';
    const forWomen = isNekrasova || who.value === 'w';
    const minutes = range.valueAsNumber;
    const cataCost = Number(cata.value);

    fields.gender.hidden = isNekrasova;
    fields.level.hidden = !forWomen;
    fields.device.hidden = isNekrasova;
    fields.zone.hidden = isNekrasova || !forWomen || dev.value !== 'std';
    fields.service.hidden = !isNekrasova;
    out.devLabel.textContent = 'Apilus Cleo';
    if (!forWomen) out.devLabel.textContent = 'Apilus Cleo, ЭлитЭп';
    else if (lvl.value === 'pro') out.devLabel.textContent = 'ЭлитЭп, Apilus Cleo';

    for (const list of priceLists) {
      const active = list.dataset.branchPrices === branchName;
      list.hidden = !active;
      if (active) out.address.textContent = list.querySelector('h3').textContent;
    }
    for (const link of bookingLinks) link.hidden = link.dataset.bookFor !== branchName;

    const { amount: rate, row } = rates.get(rateKey(isNekrasova, forWomen));
    const timeCost = rate * minutes;
    const total = timeCost + electrode + cataCost;

    out.min.textContent = `${minutes} мин`;
    range.style.setProperty('--p', ((minutes - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100 + '%');
    out.rate.textContent = `${rate} ₽/мин × ${minutes} мин`;
    out.time.textContent = `${fmt(timeCost)} ₽`;
    out.cataRow.hidden = cataCost === 0;
    out.cataV.textContent = `${fmt(cataCost)} ₽`;

    highlightedRow?.classList.remove('is-hit');
    row.classList.add('is-hit');
    highlightedRow = row;

    if (animate && !reduced) {
      gsap.to(shown, { v: total, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => { out.total.textContent = fmt(shown.v); } });
    } else {
      shown.v = total; out.total.textContent = fmt(total);
    }
  }

  form.addEventListener('input', ({ target }) => {
    update();
    if (['branch', 'who', 'dev', 'cata'].includes(target.name)) onLayoutChange?.();
  });
  update(false);
}
