gsap.registerPlugin(ScrollTrigger);
const EASE = getComputedStyle(document.documentElement).getPropertyValue('--gsap-ease').trim();

/* Découpe un texte en mots (masques) et en lettres, sans casser les retours à la ligne */
function split(el){
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.textContent = '';
  const chars = [];
  words.forEach((w, i) => {
    const word = document.createElement('span');
    word.className = 'word'; word.setAttribute('aria-hidden', 'true');
    [...w].forEach(c => {
      const s = document.createElement('span');
      s.className = 'char'; s.textContent = c;
      word.append(s); chars.push(s);
    });
    el.append(word);
    if (i < words.length - 1) el.append(' ');
  });
  return chars;
}

/* Menu plein écran */
const menuBtn = document.querySelector('.menu-btn');
const menu = gsap.timeline({paused: true})
  .to('.menu', {clipPath: 'circle(150% at 95% 6%)', duration: .8, ease: 'power2.inOut'})
  .from('.menu a', {yPercent: 60, opacity: 0, duration: .6, stagger: .06, ease: EASE}, '-=.35');
let menuOpen = false;
function toggleMenu(){
  menuOpen = !menuOpen;
  menuBtn.setAttribute('aria-expanded', menuOpen);
  menuBtn.textContent = menuOpen ? 'Fermer' : 'Menu';
  menuOpen ? menu.play() : menu.reverse();
}
menuBtn.addEventListener('click', toggleMenu);
document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', toggleMenu));

/* Carrousel à focus central : le projet au centre est net, les autres éteints */
const rail = document.querySelector('.rail');
const railWatch = new IntersectionObserver(
  entries => entries.forEach(e => e.target.classList.toggle('is-current', e.isIntersecting)),
  {root: rail, rootMargin: '0px -49% 0px -49%'});
rail.querySelectorAll('.slide').forEach(s => railWatch.observe(s));
document.querySelectorAll('[data-rail]').forEach(b => b.addEventListener('click', () =>
  rail.scrollBy({left: b.dataset.rail * rail.firstElementChild.offsetWidth, behavior: 'smooth'})));

/* Copie de l'adresse e-mail */
document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () =>
  navigator.clipboard.writeText(b.dataset.copy).then(() => { b.textContent = 'Copié'; })));

/* Nom géant du pied de page : ajusté à la largeur de l'écran, coupé par le bas */
const footWord = document.querySelector('.footer__word');
const fitWord = () => {
  footWord.style.fontSize = '100px';
  footWord.style.fontSize = 100 * footWord.clientWidth * .97 / footWord.firstElementChild.offsetWidth + 'px';
};
document.fonts.ready.then(fitWord);
addEventListener('resize', fitWord);

/* Champ de particules : un nuage qui s'assemble en mot. progress 0 = nuage, 1 = mot */
function particleField(canvas){
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio, 2);
  const field = {progress: 1, px: -9999, py: -9999};
  let W, H, pts = [];
  field.build = () => {
    W = canvas.width = canvas.clientWidth * dpr;
    H = canvas.height = canvas.clientHeight * dpr;
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const o = off.getContext('2d', {willReadFrequently: true});
    const family = getComputedStyle(canvas).fontFamily, word = canvas.dataset.word;
    o.font = `800 100px ${family}`;
    const narrow = canvas.clientWidth < 700;
    o.font = `800 ${100 * W * (narrow ? .86 : .62) / o.measureText(word).width}px ${family}`;
    o.textAlign = 'center'; o.textBaseline = 'middle';
    o.fillText(word, W / 2, H * .42);
    const data = o.getImageData(0, 0, W, H).data, step = Math.round((narrow ? 3 : 4) * dpr);
    pts = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] < 128) continue;
      const a = Math.random() * 6.283, r = Math.sqrt(Math.random());
      pts.push({tx: x, ty: y, sx: W / 2 + Math.cos(a) * r * W * .3, sy: H * .42 + Math.sin(a) * r * H * .14, j: Math.random() * 6.283});
    }
  };
  field.pointer = (x, y) => {
    const r = canvas.getBoundingClientRect();
    field.px = (x - r.left) * dpr; field.py = (y - r.top) * dpr;
  };
  field.frame = time => {
    const p = Math.min(field.progress / .7, 1), e = p * p * (3 - 2 * p);
    const wob = (1 - e) * 7 * dpr, R = 110 * dpr, size = 2.2 * dpr;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = getComputedStyle(canvas).color;
    for (const pt of pts) {
      let x = pt.sx + (pt.tx - pt.sx) * e + Math.cos(time * 1.1 + pt.j) * wob;
      let y = pt.sy + (pt.ty - pt.sy) * e + Math.sin(time * 1.4 + pt.j) * wob;
      const dx = x - field.px, dy = y - field.py, d = Math.hypot(dx, dy);
      if (d < R) { const f = (1 - d / R) * 26 * dpr / (d || 1); x += dx * f; y += dy * f; }
      ctx.fillRect(x, y, size, size);
    }
  };
  return field;
}
const field = particleField(document.querySelector('.stage__canvas'));
const drawField = () => { field.build(); field.frame(0); };
document.fonts.ready.then(drawField);
addEventListener('resize', drawField);

/* Heure locale dans le repère */
const clock = document.querySelector('[data-clock]');
const tick = () => clock.textContent = new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
tick(); setInterval(tick, 30000);

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {

  /* Entrée : logo, cadre qui s'ouvre sur la scène, titre lettre par lettre */
  gsap.timeline({defaults: {ease: EASE}})
    .to('.loader__logo', {opacity: 0, duration: .4, delay: .6})
    .set('.loader', {display: 'none'})
    .fromTo('[data-first]', {clipPath: 'inset(14px round 28px)'}, {clipPath: 'inset(0px round 0px)', duration: 1, ease: 'power2.inOut', clearProps: 'clipPath'})
    .from(split(document.querySelector('[data-title]')), {yPercent: 110, duration: .9, stagger: .03}, '-=.5');

  /* Manifeste qui s'allume lettre par lettre au scroll */
  gsap.utils.toArray('[data-read]').forEach(p =>
    gsap.fromTo(split(p), {opacity: .15}, {opacity: 1, stagger: .05, ease: 'none',
      scrollTrigger: {trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true}}));

  /* Apparition floue des cartes */
  gsap.utils.toArray('[data-reveal]').forEach(el =>
    gsap.from(el, {opacity: 0, y: 24, filter: 'blur(12px)', duration: .6, ease: EASE, clearProps: 'filter',
      scrollTrigger: {trigger: el, start: 'top 85%'}}));

  /* Le scroll assemble le nuage en nom, la souris repousse les particules */
  field.progress = 0;
  addEventListener('pointermove', e => field.pointer(e.clientX, e.clientY));
  ScrollTrigger.create({trigger: '.stage', start: 'top top', end: 'bottom bottom',
    onUpdate: self => field.progress = self.progress});
  ScrollTrigger.create({trigger: '.stage', start: 'top bottom', end: 'bottom top',
    onToggle: self => self.isActive ? gsap.ticker.add(field.frame) : gsap.ticker.remove(field.frame)});
});
