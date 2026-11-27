import '@fontsource-variable/cormorant/wght.css';
import '@fontsource-variable/cormorant/wght-italic.css';
import '@fontsource-variable/onest/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import 'lenis/dist/lenis.css';
import './style.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { initThreads } from './threads.js';
import { initHow } from './how.js';
import { initCalc } from './calc.js';

gsap.registerPlugin(ScrollTrigger, Flip);
document.documentElement.classList.add('js');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => innerWidth < 1024;

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const goTo = (target) => {
  const off = target === 0 ? 0 : -70;
  if (lenis) return lenis.scrollTo(target, { offset: off, duration: 1.4 });
  const y = (typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY) + off;
  window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
};

/* ---------------- hero threads ---------------- */
const threads = initThreads($('.hero__threads'), { reduced });
const introState = { v: 0 };

/* ---------------- preloader + intro ---------------- */
function intro() {
  const pre = $('.preloader');
  if (reduced) {
    pre.remove();
    threads.setIntro(1);
    return;
  }

  const vane = $('.pl-vane', pre);
  const quill = $('.pl-quill', pre);
  [vane, quill].forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.visibility = 'visible';
  });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(vane, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
    .to(quill, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35')
    .to('.preloader__logo', { opacity: 1, duration: 0.3 }, '-=0.1')
    .to([vane, quill], { opacity: 0, duration: 0.3 }, '<')
    .to('.preloader__word', { opacity: 1, y: 0, duration: 0.4 }, '<')
    .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.15')
    .add(() => pre.remove())
    .from('.hero__title .ln > span', { yPercent: 115, rotate: 3, duration: 1.15, stagger: 0.09, ease: 'power4.out' }, '-=0.45')
    .to(introState, { v: 1, duration: 1.8, ease: 'power2.inOut', onUpdate: () => threads.setIntro(introState.v) }, '<')
    .from('.hero__eyebrow, .hero__lead, .hero__cta', { opacity: 0, y: 24, duration: 0.9, stagger: 0.08 }, '-=1.2')
    .from('.hero__trial', { opacity: 0, scale: 0.85, rotate: -6, duration: 1, ease: 'back.out(1.6)' }, '-=0.9')
    .from('.hero__meta > div', { opacity: 0, y: 20, duration: 0.8, stagger: 0.08 }, '-=0.8')
    .from('.nav', { opacity: 0, duration: 0.8 }, '-=1');
  // safety: never trap the user behind the preloader
  setTimeout(() => { if (document.body.contains(pre)) { pre.remove(); threads.setIntro(1); } }, 4500);
}
intro();

/* hero scroll-out: converge the ribbon */
ScrollTrigger.create({
  trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
  onUpdate: (s) => threads.setProgress(s.progress),
});
if (!reduced) {
  gsap.to('.hero__inner', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------------- nav ---------------- */
const nav = $('[data-nav]');
let lastY = 0;
let navHidden = false;
// Only GSAP moves the header (no CSS transform transition), so Safari can't leave it half-way.
const setNavHidden = (hide) => {
  if (hide === navHidden) return;
  navHidden = hide;
  gsap.to(nav, { yPercent: hide ? -105 : 0, duration: reduced ? 0 : 0.45, ease: 'power3.out', overwrite: true });
};
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (s) => {
    const y = Math.max(0, s.scroll());
    nav.classList.toggle('is-scrolled', y > 40);
    if (y < 200) {
      // near the top the header is always fully visible
      setNavHidden(false);
      if (!gsap.isTweening(nav)) gsap.set(nav, { yPercent: 0 });
    } else if (Math.abs(y - lastY) > 3) {
      setNavHidden(y > lastY && y > 600 && !document.body.classList.contains('menu-open'));
    }
    lastY = y;
  },
});
/* menu */
const burger = $('[data-burger]');
const menu = $('[data-menu]');
const setMenu = (open) => {
  if (!open && menu.contains(document.activeElement)) burger.focus({ preventScroll: true });
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  menu.setAttribute('aria-hidden', String(!open));
  menu.inert = !open;
  if (open) {
    setNavHidden(false);
    menu.scrollTop = 0;
    $('a', menu).focus({ preventScroll: true });
  }
  if (lenis) open ? lenis.stop() : lenis.start();
};
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.inert) setMenu(false);
});
matchMedia('(max-width: 1180px)').addEventListener('change', ({ matches }) => {
  if (!matches && !menu.inert) setMenu(false);
});

/* anchor links */
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const t = id === '#top' ? 0 : $(id);
    if (t === null) return;
    e.preventDefault();
    const fromMenu = !menu.inert;
    if (fromMenu) setMenu(false);
    if (id === '#messengers') {
      t.focus({ preventScroll: true });
    } else if (t && (fromMenu || a.closest('.hero__navigation'))) {
      const heading = t.querySelector('h2, h3') ?? t;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    goTo(t);
  });
});

/* ---------------- generic reveals ---------------- */
if (!reduced) {
  $$('.rv').forEach((n) => {
    gsap.to(n, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 88%' } });
  });
  $$('.rv-img').forEach((n) => {
    gsap.to(n, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: n, start: 'top 85%' } });
    gsap.to(n.querySelector('img'), { scale: 1, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 85%' } });
  });
  $$('.label').forEach((n) => gsap.from(n, { opacity: 0, x: -20, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 90%' } }));
} else {
  $$('.rv, .rv-img').forEach((n) => { n.style.opacity = 1; n.style.transform = 'none'; n.style.clipPath = 'none'; });
}

/* ---------------- how it works ---------------- */
initHow($('.how'), { reduced, mobile: isMobile() });

/* ---------------- masters: horizontal pinned scroll ---------------- */
const mm = gsap.matchMedia();
mm.add('(min-width: 1024px) and (min-height: 1000px) and (prefers-reduced-motion: no-preference)', () => {
  const section = $('.masters');
  const track = $('.masters__track');
  section.classList.add('masters--pinned');
  if (section.offsetHeight > innerHeight) {
    section.classList.remove('masters--pinned');
    return;
  }
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const tw = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true },
  });
  $$('.master').forEach((card) => {
    gsap.from(card.querySelector('img'), { scale: 1.25, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tw, start: 'left right', end: 'center center', scrub: true } });
  });
  return () => section.classList.remove('masters--pinned');
});

/* master sheet */
const sheet = $('[data-sheet]');
$$('[data-master]').forEach((btn) => btn.addEventListener('click', () => {
  const card = btn.closest('.master');
  $('.sheet__img', sheet).src = $('img', card).src;
  $('.sheet__img', sheet).alt = $('img', card).alt;
  $('.sheet__rank', sheet).textContent = $('.master__rank', card).textContent;
  $('.sheet__name', sheet).innerHTML = $('.master__name', card).innerHTML;
  const list = $('.sheet__list', sheet);
  list.innerHTML = '';
  list.appendChild($('template', card).content.cloneNode(true));
  sheet.showModal();
  lenis?.stop();
}));
const closeDialog = (d) => { d.close(); };
$$('dialog').forEach((d) => {
  d.addEventListener('close', () => lenis?.start());
  d.addEventListener('click', (e) => { if (e.target === d) closeDialog(d); });
  $$('[data-close]', d).forEach((x) => x.addEventListener('click', () => closeDialog(d)));
});

/* ---------------- results grid ---------------- */
const resultCards = $$('.rcard', $('[data-rgrid]'));
resultCards.forEach((card) => card.addEventListener('click', () => openLB(card)));
if (!reduced) {
  ScrollTrigger.batch('.rcard', {
    start: 'top 92%',
    onEnter: (els) => gsap.from(els, { opacity: 0, y: 50, scale: 0.94, duration: 0.9, stagger: 0.07, ease: 'power3.out' }),
    once: true,
  });
}
$$('.filters button').forEach((btn) => btn.addEventListener('click', () => {
  const f = btn.dataset.filter;
  $$('.filters button').forEach((x) => { x.classList.toggle('is-on', x === btn); x.setAttribute('aria-pressed', String(x === btn)); });
  const cards = $$('.rcard');
  const state = Flip.getState(cards);
  cards.forEach((c) => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f));
  Flip.from(state, {
    duration: reduced ? 0 : 0.7, ease: 'power3.inOut', absolute: true, scale: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6 }),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.4 }),
    onComplete: () => ScrollTrigger.refresh(),
  });
}));

/* lightbox */
const lb = $('[data-lightbox]');
const lbImg = $('img', lb);
let lbList = [], lbI = 0;
function showLB() {
  lbImg.src = lbList[lbI].src;
  $('.lightbox__count', lb).textContent = `${String(lbI + 1).padStart(2, '0')} / ${String(lbList.length).padStart(2, '0')}`;
  if (!reduced) gsap.fromTo(lbImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' });
}
function openLB(card) {
  const visible = resultCards.filter((item) => !item.classList.contains('is-hidden'));
  lbList = visible.map((item) => $('img', item));
  lbI = visible.indexOf(card);
  showLB();
  lb.showModal();
  lenis?.stop();
}
const step = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; showLB(); };
$('.lightbox__prev', lb).addEventListener('click', () => step(-1));
$('.lightbox__next', lb).addEventListener('click', () => step(1));
lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
let tx = null;
lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null; });

/* ---------------- price tabs ---------------- */
const tabs = $$('.tabs [role=tab]');
const ink = $('.tabs__ink');
const moveInk = (btn) => { ink.style.width = btn.offsetWidth + 'px'; ink.style.transform = `translateX(${btn.offsetLeft}px)`; };
tabs.forEach((btn) => btn.addEventListener('click', () => {
  tabs.forEach((b) => {
    const on = b === btn;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(b.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on && !reduced) gsap.from(panel.children, { opacity: 0, y: 24, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
  });
  moveInk(btn);
  ScrollTrigger.refresh();
}));
const tabKeys = (e) => {
  const i = tabs.indexOf(document.activeElement);
  if (i < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
  e.preventDefault();
  const step = e.key === 'ArrowRight' ? 1 : -1;
  const next = tabs[(i + step + tabs.length) % tabs.length];
  next.focus();
  next.click();
};
$('.tabs').addEventListener('keydown', tabKeys);
requestAnimationFrame(() => moveInk($('.tabs .is-on')));
addEventListener('resize', () => moveInk($('.tabs .is-on')));

initCalc($('[data-calc]'), { reduced, onLayoutChange: () => ScrollTrigger.refresh() });

/* Cataphoresis help */
const cataHelpButton = $('.cata-help__button');
const cataHelpText = $('#cata-help-text');
let cataHelpPinned = false;
let cataHelpTimer;
const setCataHelp = (open) => {
  clearTimeout(cataHelpTimer);
  cataHelpText.hidden = !open;
  cataHelpButton.setAttribute('aria-expanded', String(open));
};
const closeCataHelp = () => {
  cataHelpPinned = false;
  setCataHelp(false);
};

[cataHelpButton, cataHelpText].forEach((element) => {
  element.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') setCataHelp(true);
  });
  element.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' && !cataHelpPinned) {
      cataHelpTimer = setTimeout(closeCataHelp, 180);
    }
  });
});
cataHelpButton.addEventListener('click', () => {
  cataHelpPinned = !cataHelpPinned;
  setCataHelp(cataHelpPinned);
});
const dismissCataHelpOutside = ({ target }) => {
  if (!cataHelpText.hidden && target !== cataHelpButton && !cataHelpText.contains(target)) closeCataHelp();
};
document.addEventListener('pointerdown', dismissCataHelpOutside);
document.addEventListener('focusin', dismissCataHelpOutside);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !cataHelpText.hidden) closeCataHelp();
});

/* ---------------- FAQ ---------------- */
$$('.qa__q').forEach((q) => q.addEventListener('click', () => {
  const item = q.parentElement;
  const open = !item.classList.contains('is-open');
  item.classList.toggle('is-open', open);
  q.setAttribute('aria-expanded', String(open));
  setTimeout(() => ScrollTrigger.refresh(), 600);
}));

/* ---------------- contacts title ---------------- */
if (!reduced) {
  gsap.from('.contacts__title .ln > span', { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'power4.out', scrollTrigger: { trigger: '.contacts__title', start: 'top 85%' } });
  gsap.fromTo('.foot__big', { xPercent: 6 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

/* ---------------- mobile dock ---------------- */
const dock = $('[data-dock]');
ScrollTrigger.create({
  trigger: '.hero', start: 'bottom 60%', endTrigger: '.contacts', end: 'top 70%',
  onToggle: (s) => dock.classList.toggle('is-on', s.isActive),
});

/* active nav item — created last so the pinned sections above are accounted for */
[['method', '#method', '.compare'], ['masters'], ['results'], ['prices'], ['faq'], ['contacts']].forEach(([id, from, to]) => {
  const sec = document.getElementById(id);
  if (!sec) return;
  ScrollTrigger.create({
    trigger: from || sec, endTrigger: to || sec,
    start: 'top 50%', end: 'bottom 50%',
    onToggle: (s) => $$('.nav__links a').forEach((a) => {
      if (s.isActive) a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      else if (a.getAttribute('href') === '#' + id) a.classList.remove('is-active');
    }),
  });
});

/* refresh after images/fonts settle */
addEventListener('load', () => ScrollTrigger.refresh());
