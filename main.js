// ===================================
// MAIN.JS - Optimized & Clean
// ===================================

// Add JS detection class
document.documentElement.classList.add("js-enabled");

// ===================================
// HELPERS
// ===================================
const isMobile = () => window.innerWidth < 768 || "ontouchstart" in window;
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const lerp = (start, end, factor) => start + (end - start) * factor;

// Register ScrollTrigger once, up-front. initFooterAnimations and the
// work-trail timelines create scrollTriggers before initScrollAnimations
// runs (which is where the plugin used to be registered), so without this
// the scrollTrigger property is silently dropped and those tweens play
// immediately on load instead of waiting for the user to scroll to them.
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// If GSAP never arrived (CDN failure), release the pre-paint CSS class
// (html.anim-loading) immediately so no entrance frame stays hidden.
if (typeof gsap === "undefined") {
  document.documentElement.classList.remove("anim-loading");
}

// ===================================
// LENIS SMOOTH SCROLL
// ===================================
function initLenis() {
  if (typeof Lenis === "undefined") return;

  // Keep disabled on mobile for native feel/performance
  if (isMobile()) return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP integration
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  window.lenis = lenis;
}

// ===================================
// PAGE 2 HOVER ANIMATIONS
// ===================================
function initPage2Animations() {
  const page2Elements = document.querySelectorAll(".page2-ele");
  if (!page2Elements.length) return;

  // Skip hover logic on mobile to prevent sticky states
  if (isMobile()) return;

  page2Elements.forEach((element) => {
    const h2 = element.querySelector("h2");
    const h6 = element.querySelector("h6");
    if (!h2 || !h6) return;

    element.addEventListener("mouseenter", () => {
      gsap.to([h2, h6], {
        opacity: 0.7,
        duration: 0.4,
        ease: "power1.out",
        overwrite: true,
      });
      gsap.to(h2, {
        x: "4vw",
        duration: 0.4,
        ease: "power1.out",
        overwrite: true,
      });
    });

    element.addEventListener("mouseleave", () => {
      gsap.to([h2, h6], {
        opacity: 1,
        duration: 0.4,
        ease: "power1.out",
        overwrite: true,
      });
      gsap.to(h2, { x: 0, duration: 0.4, ease: "power1.out", overwrite: true });
    });
  });
}

// ===================================
// CHROME SCROLL ANIMATION (Optimized)
// ===================================
function initChromeScroll() {
  const containers = [
    document.querySelector("#chrome-scroll"),
    ...document.querySelectorAll(".chrome-scroll-section"),
  ].filter(Boolean);

  if (!containers.length) return;

  const chromeScrollInstances = new Map();

  containers.forEach((container) => {
    const items = Array.from(container.querySelectorAll(".text"));
    if (!items.length) return;

    container.style.position = "relative";
    const state = new Map();

    items.forEach((el) => {
      state.set(el, {
        raw: 0,
        easedExpo: 0,
        easedQuart: 0,
        easedQuartInv: 0,
        easedInCubic: 0,
      });
      el.style.willChange = "transform, opacity, filter";
      el.style.pointerEvents = "none";
    });

    chromeScrollInstances.set(container, { items, state });
  });

  let ticking = false;
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const easeInCubic = (t) => t * t * t;

  const compute = () => {
    ticking = false;
    const vh = window.innerHeight;
    const viewportCenter = vh / 2;

    chromeScrollInstances.forEach(({ items, state }) => {
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offscreenMargin = 200;

        // Skip calculation if off-screen
        if (rect.top > vh + offscreenMargin || rect.bottom < -offscreenMargin)
          return;

        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        const raw = clamp(1 - distance / (vh * 0.6), 0, 1);
        const s = state.get(el);
        const smooth = 0.12;

        s.raw = lerp(s.raw, raw, smooth);
        // Optimization: Only calculate complex eases if raw changed significantly
        if (Math.abs(s.raw - raw) < 0.001 && raw === 0) return;

        s.easedExpo = lerp(s.easedExpo, clamp(easeOutExpo(raw), 0, 1), smooth);
        s.easedQuart = lerp(
          s.easedQuart,
          clamp(easeOutQuart(raw), 0, 1),
          smooth,
        );
        s.easedQuartInv = lerp(
          s.easedQuartInv,
          clamp(easeOutQuart(1 - raw), 0, 1),
          smooth,
        );
        s.easedInCubic = lerp(
          s.easedInCubic,
          clamp(easeInCubic(1 - raw), 0, 1),
          smooth,
        );

        el.style.setProperty("--chrome-progress-y", s.raw.toFixed(3));
        el.style.setProperty("--chrome-eased-expo", s.easedExpo.toFixed(3));
        el.style.setProperty("--chrome-eased-quart", s.easedQuart.toFixed(3));
        el.style.setProperty(
          "--chrome-eased-quart-inv",
          s.easedQuartInv.toFixed(3),
        );
        el.style.setProperty(
          "--chrome-eased-in-cubic",
          s.easedInCubic.toFixed(3),
        );
        el.style.setProperty(
          "--chrome-blur",
          `${((1 - s.easedExpo) * 8).toFixed(1)}px`,
        );
        el.style.zIndex = Math.round(s.easedExpo * 100) + 10;
      });
    });
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(compute);
      ticking = true;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const isAnyIntersecting = entries.some((entry) => entry.isIntersecting);
      if (isAnyIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        compute();
      }
    },
    { rootMargin: "100px" },
  );

  containers.forEach((container) => observer.observe(container));
  compute();
}

// ===================================
// IMAGE HOVER EFFECTS
// ===================================
function initImageHoverEffects() {
  const page2Elements = document.querySelectorAll(".page2-ele");
  if (!page2Elements.length || isMobile()) return;

  page2Elements.forEach((element) => {
    const image = element.querySelector("img");
    if (!image) return;

    // Use CSS for better performance
    Object.assign(image.style, {
      opacity: "0",
      position: "absolute",
      pointerEvents: "none",
      transition: "opacity 0.3s ease",
      willChange: "transform",
    });

    let isHovering = false;
    let rafId = null;
    let hideTimer = null;

    element.addEventListener("mouseenter", () => {
      if (!element.classList.contains("active")) {
        isHovering = true;
        image.style.opacity = "1";
        // Cancel any pending hide timer
        if (hideTimer) clearTimeout(hideTimer);
        // Auto-hide the preview image after 5 seconds
        hideTimer = setTimeout(() => {
          image.style.opacity = "0";
          isHovering = false;
        }, 3000);
      }
    });

    element.addEventListener("mousemove", (e) => {
      if (!isHovering || element.classList.contains("active") || rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        image.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
        rafId = null;
      });
    });

    const reset = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      isHovering = false;
      image.style.opacity = "0";
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    element.addEventListener("mouseleave", reset);
  });
}

// ===================================
// INITIAL PAGE LOAD ANIMATIONS
// ===================================
function initHeaderAnimations() {
  const logo = document.querySelector("#logo");
  const navBtns = document.querySelectorAll(
    ".nav-right .btn-pb, .nav-right .btn-bo, .nav-right .btn-op, #menu-btn",
  );

  if (!logo && !navBtns.length) return;

  // No GSAP on mobile (skipped by anim-loader.js) — elements show by default
  if (typeof gsap === "undefined") return;

  const els = [logo, ...Array.from(navBtns)].filter(Boolean);

  // Kill stale tweens
  gsap.killTweensOf(els);

  if (prefersReducedMotion()) return;

  const mobile = isMobile();
  const tl = gsap.timeline({ delay: mobile ? 0.05 : 0.1 });

  if (logo) {
    // Set initial hidden state, then slide in
    gsap.set(logo, { opacity: 0, x: mobile ? 0 : -24 });
    tl.to(
      logo,
      {
        x: 0,
        opacity: 1,
        duration: mobile ? 0.2 : 0.35,
        ease: "power3.out",
        clearProps: "x",
      },
      0,
    );
  }

  if (navBtns.length) {
    // Start fully hidden (no transform — preserve CSS hover states)
    gsap.set(navBtns, { autoAlpha: 0 });
    // Fade in without touching transform so CSS :hover scale works
    tl.to(
      navBtns,
      {
        autoAlpha: 1,
        duration: mobile ? 0.2 : 0.35,
        ease: "power3.out",
        clearProps: "all",
      },
      mobile ? 0 : 0.05,
    );
  }
}

function initFooterAnimations() {
  const footer = document.querySelector("footer");

  if (isMobile() || prefersReducedMotion()) {
    if (footer) footer.style.opacity = "1";
    return;
  }

  if (
    footer &&
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined"
  ) {
    // immediateRender: false — do NOT apply the y:40/opacity:0 opening
    // frame (or play the tween) at page load. That shifted the whole page
    // bottom (+40px scrollbar geometry) and hid the footer until scroll.
    // The reveal now only happens when the footer actually scrolls into view.
    // fromTo (not from) so the destination is explicit: a from() tween
    // created while html.anim-loading hides elements would capture
    // opacity: 0 as its destination and the footer would never show.
    gsap.fromTo(
      footer,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: footer, start: "top 92%", once: true },
      },
    );
  }
}

function initLoadAnimations() {
  const els = {
    heroHead: document.querySelector("#hero-head h1"),
    mainHead: document.querySelector("#main-head h1"),
    prefixH6: document.querySelector("#prefix h6"),
    miniH6: document.querySelector("#mini h6"),
    name: document.querySelector("#name h1"),
    firstBottom: document.querySelector("#first-bottom"),
  };

  const forceVisible = () => {
    Object.values(els).forEach((el) => {
      if (el instanceof NodeList) el.forEach((e) => (e.style.opacity = "1"));
      else if (el) el.style.opacity = "1";
    });
  };

  // Mobile / reduced-motion / no GSAP: show everything immediately.
  if (isMobile() || prefersReducedMotion() || typeof gsap === "undefined") {
    forceVisible();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });

  // fromTo (not from) so the end values are explicit: while html.anim-loading
  // is set, CSS already holds these opening frames, so GSAP takes over with
  // zero visible jump — no flash of the final layout before the animation.
  // "Designer &" slides from left, "Developer" slides from right
  els.heroHead &&
    tl.fromTo(
      els.heroHead,
      { x: -80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5 },
      0,
    );
  els.mainHead &&
    tl.fromTo(
      els.mainHead,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5 },
      0,
    );

  // "Vi Saint" drifts from bottom — appears first
  els.name &&
    tl.fromTo(
      els.name,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3 },
      0,
    );

  // "the only" drifts from top, "based in europe" from bottom
  els.prefixH6 &&
    tl.fromTo(
      els.prefixH6,
      { y: -18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.28 },
      "-=0.15",
    );
  els.miniH6 &&
    tl.fromTo(
      els.miniH6,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.28 },
      "-=0.2",
    );

  // Stats
  els.firstBottom &&
    tl.fromTo(
      els.firstBottom,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.1",
    );

}

// ===================================
// HEADER INIT
// ===================================
function initNavHideOnScroll() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // The tiered button count (styles.css) leaves some buttons at
  // display:none for a given viewport, so the animated set is recomputed
  // on every scroll. Invisible buttons never get animated, and a tier
  // change is picked up on the next scroll without extra wiring.
  const btnSel =
    ".nav-right > a.btn-pb, .nav-right > a.btn-bo, .nav-right > a.btn-op";
  const visibleBtns = () =>
    Array.from(nav.querySelectorAll(btnSel)).filter(
      (b) => getComputedStyle(b).display !== "none",
    );

  // Desktop uses GSAP (loaded by anim-loader); mobile has no GSAP,
  // so fall back to the native Web Animations API for the same feel.
  const gsapOk = typeof gsap !== "undefined";
  const waapiOk =
    typeof Element !== "undefined" && !!Element.prototype.animate;

  let lastY = window.scrollY;
  let hidden = false;
  let ticking = false;

  // In-flight WAAPI animations per button — cancel on direction flips
  const live = new Map();

  const hideBtns = () => {
    if (hidden) return;
    hidden = true;
    nav.dataset.navHidden = "true";
    const btns = visibleBtns();
    if (!btns.length) return;
    if (gsapOk) {
      gsap.killTweensOf(btns);
      gsap.to(btns, {
        autoAlpha: 0,
        y: -14,
        duration: 0.3,
        ease: "power2.in",
        stagger: 0.02,
      });
      return;
    }
    if (waapiOk) {
      btns.forEach((b, i) => {
        const prev = live.get(b);
        if (prev) prev.cancel();
        b.style.pointerEvents = "none";
        live.set(
          b,
          b.animate(
            [
              { opacity: 1, transform: "translateY(0)" },
              { opacity: 0, transform: "translateY(-14px)" },
            ],
            { duration: 300, delay: i * 20, easing: "ease-in", fill: "forwards" },
          ),
        );
      });
      // Drop them out of the tab order once the fade completes
      const last = live.get(btns[btns.length - 1]);
      if (last) {
        last.onfinish = () => {
          if (hidden) btns.forEach((b) => (b.style.visibility = "hidden"));
        };
      }
      return;
    }
    btns.forEach((b) => {
      b.style.opacity = "0";
      b.style.visibility = "hidden";
      b.style.pointerEvents = "none";
    });
  };

  const showBtns = () => {
    if (!hidden) return;
    hidden = false;
    delete nav.dataset.navHidden;
    const btns = visibleBtns();
    if (!btns.length) return;
    if (gsapOk) {
      gsap.killTweensOf(btns);
      // Fall in from above, staggered like the blurb — clearProps keeps
      // the CSS :hover transform working afterwards
      gsap.fromTo(
        btns,
        { autoAlpha: 0, y: -24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.07,
          clearProps: "all",
        },
      );
      return;
    }
    if (waapiOk) {
      btns.forEach((b, i) => {
        const prev = live.get(b);
        if (prev) prev.cancel();
        b.style.pointerEvents = "";
        b.style.visibility = "";
        live.set(
          b,
          b.animate(
            [
              { opacity: 0, transform: "translateY(-24px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 700,
              delay: i * 70,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              // "both" (not "forwards") holds the from-keyframe during the
              // stagger delay, matching GSAP's immediate-render fromTo on
              // desktop. With "forwards" each button flashes visible while
              // waiting out its delay, then fades in again (the "double take").
              fill: "both",
            },
          ),
        );
      });
      return;
    }
    btns.forEach((b) => {
      b.style.opacity = "";
      b.style.visibility = "";
      b.style.pointerEvents = "";
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (Math.abs(delta) < 4) return; // ignore micro-scrolls
      if (delta > 0 && y > 100) hideBtns();
      else if (delta < 0) showBtns();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

function initHeaderComponent() {
  initHeaderAnimations();
  initNavHideOnScroll();
  initNavTiers();
}

// ===================================
// NAV TIERS — fixed breakpoint cleanup (phones 2–3, tablets 4–5)
// ===================================
// The button count is decided by fixed CSS breakpoints in styles.css
// (≤ 400px → 2, 401–600 → 3, 601–700 → 4, 701–768 → 5). This listener
// only cleans up after the scroll-hide animation when a button flips
// between display:none and visible at a breakpoint, so a button can
// never reappear stuck invisible. Keep the breakpoints in sync with
// styles.css.
function initNavTiers() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const btnSel =
    ".nav-right > a.btn-pb, .nav-right > a.btn-bo, .nav-right > a.btn-op";

  const sync = () => {
    const btns = Array.from(nav.querySelectorAll(btnSel));
    // Cancel any leftover WAAPI fill:forwards state (the old code cleared
    // inline styles, which doesn't undo animation fills).
    btns.forEach((b) => {
      if (typeof b.getAnimations === "function") {
        b.getAnimations().forEach((anim) => anim.cancel());
      }
    });
    // If the scroll-hide is active (or was mid-flight), keep every tier
    // button in the same hidden state as its visible siblings instead of
    // flashing it in at full opacity.
    const visible = btns.filter((b) => getComputedStyle(b).display !== "none");
    const hidden =
      nav.dataset.navHidden === "true" ||
      visible.some((b) => getComputedStyle(b).visibility === "hidden");
    visible.forEach((b) => {
      b.style.visibility = hidden ? "hidden" : "";
      b.style.opacity = hidden ? "0" : "";
      b.style.pointerEvents = hidden ? "none" : "";
    });
  };

  // Every boundary the CSS tiers depend on. onChange runs in BOTH
  // directions (match and unmatch) so a button reappearing is synced
  // too, not just one that is being hidden away.
  [320, 400, 600, 700, 768].forEach((px) => {
    const mq = window.matchMedia(`(max-width: ${px}px)`);
    const onChange = () => sync();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onChange); // legacy Safari
    }
  });
}

// ===================================
// AVAILABILITY DOT — heartbeat blink, random brand colour per beat
// ===================================
function initAvailDot() {
  const dot = document.querySelector(".avail-dot");
  if (!dot) return;
  if (prefersReducedMotion()) return; // keep the static dot, no beats

  const rootStyle = getComputedStyle(document.documentElement);
  const colors = [
    (rootStyle.getPropertyValue("--orange").trim() || "#f48f6e"),
    (rootStyle.getPropertyValue("--blue").trim() || "#5a9fd4"),
    (rootStyle.getPropertyValue("--pink").trim() || "#ee8198"),
  ];

  let timer = null;
  let lastColorIndex = -1;

  // Keep in sync with the availHeartbeat animation duration in
  // styles.css (1.6s). The dot is at its smallest ~25% through the
  // animation — swap the colour there so each expansion glows in a
  // fresh colour (the swap is invisible at period size).
  const ANIM_MS = 1600;
  const COLOR_SWAP_MS = ANIM_MS * 0.25;

  const swapColor = () => {
    // pick a colour different from the current one
    let index;
    do {
      index = Math.floor(Math.random() * colors.length);
    } while (index === lastColorIndex);
    lastColorIndex = index;

    const color = colors[index];
    dot.style.backgroundColor = color;
    dot.style.boxShadow = `0 0 12px ${color}66`;
  };

  const beat = () => {
    // restart the heartbeat animation cleanly
    dot.classList.remove("beating");
    void dot.offsetWidth; // force reflow so the animation re-runs
    dot.classList.add("beating");

    // swap the colour while the dot is shrunk, not at the start of
    // the beat — the next expansion then appears in the new colour
    setTimeout(swapColor, COLOR_SWAP_MS);

    // irregular rhythm: base rest + random jitter
    const rest = 1400 + Math.random() * 800;
    timer = setTimeout(beat, rest);
  };

  timer = setTimeout(beat, 500 + Math.random() * 500);
}

// ===================================
// INTERSECTION OBSERVER (Fade-ins)
// ===================================
function initIntersectionObserver() {
  // Added .service-item to this observer list
  const targets = document.querySelectorAll(".fade-in-element, .service-item");
  if (!targets.length) return;

  // No GSAP on mobile (skipped by anim-loader.js) — elements are visible by default.
  // Reduced motion: leave everything visible — no hide-then-reveal.
  if (typeof gsap === "undefined" || prefersReducedMotion()) return;

  const reveal = (el) => {
    if (el._revealed) return;
    el._revealed = true;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      overwrite: true,
    });
    observer.unobserve(el);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  targets.forEach((el) => {
    // Force CSS animation to none so GSAP takes over completely
    el.style.animation = "none";
    gsap.set(el, { opacity: 0, y: 24 });
    observer.observe(el);
  });

  // Safety net: IntersectionObserver only reports state CHANGES, so an
  // element can be skipped entirely when the page is jumped past it in one
  // instant (scrollbar drag, Cmd+End, instant jump). Sweep on scroll too and
  // reveal anything that has reached (or passed) the viewport, so content
  // can never stay hidden once the user has scrolled to it.
  let ticking = false;
  const sweep = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of targets) {
      if (el._revealed) continue;
      if (el.getBoundingClientRect().top < vh) reveal(el);
    }
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ===================================
// SCROLL TRIGGER ANIMATIONS (Desktop)
// ===================================
function initScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  if (isMobile() || prefersReducedMotion()) {
    // Ensure visibility on mobile / reduced-motion if animations are skipped
    [
      ".blurb h2",
      "#work",
      "#about #t-f-div img",
      "#about #t-s-div",
      "#grids",
      ".skill-card-wrap",
    ].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const defaults = {
    duration: 0.8,
    ease: "power3.out",
  };

  const createTrigger = (trigger, start = "top 85%") => ({
    trigger,
    start,
    once: true,
  });

  // Blurb
  const blurbH2 = document.querySelectorAll(".blurb h2");
  if (blurbH2.length) {
    gsap.fromTo(
      blurbH2,
      { x: 100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        stagger: 0.08,
        immediateRender: true,
        ...defaults,
        scrollTrigger: createTrigger(blurbH2[0]),
      },
    );
  }

  // Page 2
  const page2 = document.querySelector("#work");
  page2 &&
    gsap.fromTo(
      page2,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        immediateRender: true,
        ...defaults,
        scrollTrigger: createTrigger(page2, "top 80%"),
      },
    );

  // Page 3
  const p3Pic = document.querySelector("#about #t-f-div img");
  const p3Text = document.querySelector("#about #t-s-div");

  p3Pic &&
    gsap.fromTo(
      p3Pic,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        ...defaults,
        scrollTrigger: createTrigger(p3Pic, "top 80%"),
      },
    );
  p3Text &&
    gsap.fromTo(
      p3Text,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        ...defaults,
        scrollTrigger: createTrigger(p3Text, "top 80%"),
      },
    );

  // Grids
  const grids = document.querySelector("#grids");
  grids &&
    gsap.fromTo(
      grids,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        immediateRender: true,
        ...defaults,
        scrollTrigger: createTrigger(grids, "top 80%"),
      },
    );

  // Skill cards
  const skillCards = document.querySelectorAll(".skill-card-wrap");
  if (skillCards.length) {
    gsap.fromTo(
      skillCards,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        immediateRender: true,
        ...defaults,
        scrollTrigger: createTrigger(skillCards[0], "top 85%"),
      },
    );
  }
}

// ===================================
// UTILS
// ===================================
function initMenuToggleScrollLock() {
  document.addEventListener("change", (e) => {
    if (e.target.id !== "menu-toggle") return;
    if (e.target.checked) {
      window.lenis?.stop();
    } else {
      window.lenis?.start();
    }
  });
}

function randomizeBackground() {
  const blobs = document.querySelectorAll(".blob");
  const placed = [];
  const minGap = 26; // % — keep blobs from spawning on top of each other
  blobs.forEach((blob) => {
    let left, top;
    // Re-roll until the blob lands clear of every already-placed blob
    for (let tries = 0; tries < 50; tries++) {
      left = Math.floor(Math.random() * 76);
      top = Math.floor(Math.random() * 76);
      const tooClose = placed.some(
        (p) =>
          Math.abs(p.left - left) < minGap && Math.abs(p.top - top) < minGap
      );
      if (!tooClose) break;
    }
    placed.push({ left, top });
    blob.style.left = `${left}%`;
    blob.style.top = `${top}%`;
  });
}

// ===================================
// CONTACT PAGE — COPY EMAIL TO CLIPBOARD
// ===================================
function initCopyEmail() {
  const btn = document.getElementById("copy-email");
  if (!btn) return;

  const email = btn.dataset.email || btn.textContent.trim();
  const label = btn.querySelector("span");

  const flashCopied = () => {
    if (!label) return;
    label.textContent = "Copied!";
    btn.classList.add("copied");
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => {
      label.textContent = email;
      btn.classList.remove("copied");
    }, 1600);
  };

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
      if (!ok) return;
    }
    flashCopied();
  });
}

// ===================================
// WORK PAGE — TRAIL ANIMATIONS
// ===================================
function initWorkTrailAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  const trailItems = document.querySelectorAll(".trail-item");
  if (!trailItems.length) return;

  // Skip on mobile — let content be visible without animation
  if (isMobile()) {
    trailItems.forEach((item) => {
      const img = item.querySelector(".trail-image");
      const text = item.querySelector(".trail-text");
      if (img) { img.style.opacity = "1"; img.style.transform = "none"; }
      if (text) { text.style.opacity = "1"; text.style.transform = "none"; }
    });
    return;
  }

  if (prefersReducedMotion()) {
    trailItems.forEach((item) => {
      const img = item.querySelector(".trail-image");
      const text = item.querySelector(".trail-text");
      if (img) { img.style.opacity = "1"; img.style.transform = "none"; }
      if (text) { text.style.opacity = "1"; text.style.transform = "none"; }
    });
    return;
  }

  trailItems.forEach((item) => {
    const isLeft = item.classList.contains("trail-left");
    const img = item.querySelector(".trail-image");
    const text = item.querySelector(".trail-text");

    if (img) {
      gsap.set(img, { opacity: 0, x: isLeft ? -80 : 80, scale: 0.95 });
    }
    if (text) {
      gsap.set(text, { opacity: 0, x: isLeft ? 60 : -60, y: 40 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top 80%",
        once: true,
      },
    });

    if (img) {
      tl.to(img, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.9,
        ease: "power3.out",
      }, 0);
    }

    if (text) {
      tl.to(text, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }, 0.15);
    }
  });
}

// ===================================
// INIT
// ===================================
function initWorkToggle() {
  const btns = document.querySelectorAll(".work-toggle-btn");
  const commercialContent = document.getElementById("work-content-commercial");
  const experimentsContent = document.getElementById("work-content-experiments");

  if (!btns.length || !commercialContent || !experimentsContent) return;

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.toggle;

      // Bail if already active
      if (btn.classList.contains("active")) return;

      // Toggle button states
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Toggle content with fade
      const show = target === "commercial" ? commercialContent : experimentsContent;
      const hide = target === "commercial" ? experimentsContent : commercialContent;

      hide.classList.remove("active");
      // Force reflow for animation
      void show.offsetWidth;
      show.classList.add("active");

      // Refresh scroll triggers after content swap
      if (typeof ScrollTrigger !== "undefined") {
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    });
  });
}

function randomizeSvcItemColors() {
  // Home services grid: give each explainer list a shuffled permutation of
  // orange / blue / pink so every section differs on each page load.
  const lists = document.querySelectorAll(".svc-items");
  if (!lists.length) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const palette = [
    rootStyle.getPropertyValue("--orange").trim() || "#f48f6e",
    rootStyle.getPropertyValue("--blue").trim() || "#5a9fd4",
    rootStyle.getPropertyValue("--pink").trim() || "#ee8198",
  ];

  lists.forEach((list) => {
    const spans = list.querySelectorAll("span");
    if (spans.length < 3) return;

    // The Improve card keeps a fixed orange → blue → pink order (CSS default)
    const cell = list.closest(".svc-cell");
    const isImprove =
      cell && cell.querySelector(".svc-toggle")?.id === "svc-improve";
    if (isImprove) return;

    // Fisher–Yates shuffle so each list gets its own random order
    for (let i = palette.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [palette[i], palette[j]] = [palette[j], palette[i]];
    }

    spans.forEach((span, i) => {
      span.style.color = palette[i % palette.length];
    });
  });
}

function initPage() {
  randomizeBackground();
  randomizeSvcItemColors();
  initHeaderComponent();
  initAvailDot();
  initCopyEmail();
  initLenis();
  initMenuToggleScrollLock();
  initWorkToggle();
  initPage2Animations();
  initImageHoverEffects();
  initLoadAnimations();
  initChromeScroll();
  initIntersectionObserver();
  initFooterAnimations();
  initWorkTrailAnimations();
  // Scroll-reveal tweens (blurb, #work, grids, skill cards, about portrait,
  // trail sections...) must be created while html.anim-loading is still set:
  // their immediateRender opening frames are captured into inline styles
  // here, so removing the class below can't flash the final layout first.
  // ScrollTrigger.refresh() on window load re-measures trigger positions
  // once lazy images / fonts have settled.
  initScrollAnimations();

  // All entrance animations above have captured their opening frames into
  // inline styles, so release the pre-paint CSS class (html.anim-loading).
  // The <head> script's timeout is the fallback if GSAP never arrived.
  document.documentElement.classList.remove("anim-loading");

  window.addEventListener("load", () => {
    typeof ScrollTrigger !== "undefined" && ScrollTrigger.refresh();
  });
}

// Resize handler
let resizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(
      () => typeof ScrollTrigger !== "undefined" && ScrollTrigger.refresh(),
      250,
    );
  },
  { passive: true },
);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
