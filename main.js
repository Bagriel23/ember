/* ============================================================
   Ember — coreografia de scroll
   Cada seção tem um gesto próprio, ligado ao que ela diz.
   ============================================================ */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

/* ---- brasas: spans com variáveis aleatórias, animadas em CSS ---- */
function seedEmbers(host, count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const bit = document.createElement("span");
    bit.className = "ember-bit";
    bit.style.setProperty("--x", `${Math.random() * 100}%`);
    bit.style.setProperty("--sz", `${2 + Math.random() * 4}px`);
    bit.style.setProperty("--dur", `${7 + Math.random() * 9}s`);
    bit.style.setProperty("--delay", `${-Math.random() * 16}s`);
    bit.style.setProperty("--drift", `${(Math.random() - 0.5) * 22}vw`);
    frag.appendChild(bit);
  }
  host.appendChild(frag);
}

async function boot() {
  document.documentElement.classList.add("js");

  if (REDUCED) {
    document.querySelector(".hero__name").style.opacity = 1;
    return; // o CSS já deixa tudo legível e parado
  }

  await document.fonts.ready;

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.5,
    effects: true,
    normalizeScroll: true,
  });

  seedEmbers(document.getElementById("embers"), 44);

  /* ---- 1 · hero: o nome sobe como brasa ---------------------- */
  const name = document.querySelector(".hero__name");
  const nameChars = SplitText.create(name, { type: "chars", charsClass: "ch" }).chars;
  gsap.set(name, { opacity: 1 });

  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(nameChars, {
      yPercent: 118,
      opacity: 0,
      rotate: 4,
      duration: 1.5,
      stagger: 0.06,
    })
    .from(".hero__meta span", { y: 14, opacity: 0, duration: 1, stagger: 0.12 }, "-=0.9")
    .from(".hero__portrait", { opacity: 0, scale: 1.06, duration: 2, ease: "power2.out" }, 0)
    .from(".hero__glow", { opacity: 0, duration: 2.4, ease: "power1.out" }, 0);

  // retrato sobe mais devagar que a página
  gsap.to(".hero__portrait", {
    yPercent: -14,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---- 2 · a vila: as palavras se materializam --------------- */
  document.querySelectorAll("[data-dissolve]").forEach((el) => {
    const words = SplitText.create(el, { type: "words", wordsClass: "wd" }).words;
    gsap.from(words, {
      opacity: 0,
      filter: "blur(12px)",
      yPercent: 38,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
  });

  // prosa dos capítulos: entra por parágrafo, discreta
  gsap.utils.toArray(".chapter .measure p, .valebris__text p, .today__text p, .death__run")
    .forEach((p) => {
      if (p.hasAttribute("data-dissolve")) return;
      gsap.from(p, {
        opacity: 0,
        y: 26,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: p, start: "top 88%" },
      });
    });

  // "Krovagard" acende quando passa
  gsap.fromTo(".burn",
    { color: "#EFE6DA" },
    {
      color: "#E8561C",
      duration: 0.8,
      ease: "power2.in",
      scrollTrigger: { trigger: ".burn", start: "top 78%" },
    });

  /* ---- 3 · a família: a página trava e o texto troca --------- */
  const beats = gsap.utils.toArray(".beat");
  const famTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".pinned",
      start: "top top",
      end: `+=${beats.length * 90}%`,
      pin: ".pinned__stage",
      scrub: 0.9,
    },
  });
  beats.forEach((beat, i) => {
    if (i > 0) famTl.to(beats[i - 1], { opacity: 0, y: -28, duration: 0.5 }, i);
    famTl.fromTo(beat,
      { opacity: 0, y: i === 0 ? 0 : 28 },
      { opacity: 1, y: 0, duration: 0.5 },
      i === 0 ? 0 : i
    );
    famTl.to({}, { duration: 0.55 }); // respiro para ler
  });

  /* ---- 4 · o irmão: os caminhos se afastam ------------------- */
  const wide = window.matchMedia("(min-width: 901px)").matches;
  gsap.timeline({
    scrollTrigger: { trigger: "#diverge", start: "top 78%", end: "bottom 55%", scrub: 1 },
  })
    .fromTo(".diverge__blade",
      { scaleY: 0, opacity: 0 },
      { scaleY: 1, opacity: 1, ease: "power2.out", duration: 1 }, 0)
    .fromTo(".diverge__col--left",
      { x: wide ? 90 : 0, opacity: 0 },
      { x: 0, opacity: 1, ease: "power2.out", duration: 1 }, 0.1)
    .fromTo(".diverge__col--right",
      { x: wide ? -90 : 0, opacity: 0 },
      { x: 0, opacity: 1, ease: "power2.out", duration: 1 }, 0.1);

  /* ---- 5 · a ideia: o amarelo varre a tela ------------------- */
  const creedLines = SplitText.create(".creed__quote p", {
    type: "lines",
    linesClass: "ln",
    mask: "lines",
  }).lines;

  gsap.timeline({
    scrollTrigger: { trigger: ".creed", start: "top 72%" },
  })
    .fromTo("#creedPanel",
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power4.inOut" })
    .from(creedLines, { yPercent: 115, duration: 0.9, ease: "expo.out", stagger: 0.09 }, "-=0.45");

  /* ---- 6 · valebris: as runas se desenham ------------------- */
  gsap.to(".valebris__art", {
    yPercent: -9,
    ease: "none",
    scrollTrigger: { trigger: ".valebris", start: "top bottom", end: "bottom top", scrub: true },
  });

  gsap.to(".valebris__runes path, .valebris__runes circle", {
    strokeDashoffset: 0,
    duration: 1.6,
    ease: "power2.inOut",
    stagger: 0.16,
    scrollTrigger: { trigger: ".valebris__art", start: "top 68%" },
  });

  /* ---- 7 · a morte: tudo apaga, e a cicatriz aparece -------- */
  gsap.from(".death__blow", {
    opacity: 0,
    scale: 0.94,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: { trigger: ".death__blow", start: "top 80%" },
  });

  const veil = document.getElementById("veil");
  gsap.timeline({
    scrollTrigger: { trigger: ".death__dark", start: "top 92%", end: "top 12%", scrub: 0.6 },
  })
    .to(veil, { opacity: 1, ease: "power2.in", duration: 1 })
    .to(veil, { opacity: 0, ease: "power2.out", duration: 1 });

  gsap.from(".death__line", {
    opacity: 0,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: ".death__dark", start: "top 35%" },
  });

  // empurrão lento para dentro da marca
  gsap.fromTo(".scar__crop img",
    { scale: 1.22 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: "#scar", start: "top 90%", end: "bottom 55%", scrub: 1 },
    });
  gsap.from(".scar__crop", {
    opacity: 0,
    duration: 1.6,
    ease: "power2.out",
    scrollTrigger: { trigger: "#scar", start: "top 82%" },
  });

  /* ---- 8 · hoje: o calor volta ------------------------------ */
  gsap.from(".today__art", {
    opacity: 0,
    scale: 0.88,
    duration: 1.3,
    ease: "power3.out",
    scrollTrigger: { trigger: ".today__art", start: "top 82%" },
  });

  /* ---- 9 · fecho: as duas metades, e o fogo ----------------- */
  gsap.to("#embers", {
    opacity: 1,
    ease: "none",
    scrollTrigger: { trigger: ".finale", start: "top 85%", end: "top 35%", scrub: true },
  });

  gsap.timeline({ scrollTrigger: { trigger: ".finale", start: "top 62%" } })
    .from('[data-half="l"]', { xPercent: -8, opacity: 0, duration: 1.2, ease: "expo.out" })
    .from('[data-half="r"]', { xPercent: 8, opacity: 0, duration: 1.2, ease: "expo.out" }, "-=0.85")
    .from(".finale__after", { y: 22, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.7");

  ScrollTrigger.refresh();
  return smoother;
}

boot();
