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
    element.addEventListener("htmx:afterSwap", reset);
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
  if (isMobile()) {
    const footer = document.querySelector("footer");
    if (footer) footer.style.opacity = "1";
    return;
  }

  const footer = document.querySelector("footer");
  if (
    footer &&
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined"
  ) {
    gsap.from(footer, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: footer, start: "top 92%", once: true },
    });
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
    midElements: document.querySelectorAll(".mid h5"),
  };

  if (isMobile()) {
    Object.values(els).forEach((el) => {
      if (el instanceof NodeList) el.forEach((e) => (e.style.opacity = "1"));
      else if (el) el.style.opacity = "1";
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });

  // "Designer &" slides from left, "Developer" slides from right
  els.heroHead &&
    tl.from(els.heroHead, { x: -80, opacity: 0, duration: 0.5 }, 0);
  els.mainHead &&
    tl.from(els.mainHead, { x: 80, opacity: 0, duration: 0.5 }, 0);

  // "Vi Saint" drifts from bottom — appears first
  els.name && tl.from(els.name, { y: 18, opacity: 0, duration: 0.3 }, 0);

  // "the only" drifts from top, "based in europe" from bottom
  els.prefixH6 &&
    tl.from(els.prefixH6, { y: -18, opacity: 0, duration: 0.28 }, "-=0.15");
  els.miniH6 &&
    tl.from(els.miniH6, { y: 18, opacity: 0, duration: 0.28 }, "-=0.2");

  // Stats
  els.firstBottom &&
    tl.from(els.firstBottom, { opacity: 0, y: 12, duration: 0.3 }, "-=0.1");

  // Mid elements
  if (els.midElements.length) {
    tl.from(
      els.midElements,
      { y: -18, opacity: 0, duration: 0.35, stagger: 0.05 },
      "-=0.1",
    );
  }
}

window.initHeaderAnimations = initHeaderAnimations;
window.initFooterAnimations = initFooterAnimations;

// ===================================
// HEADER INIT
// ===================================
function initHeaderComponent() {
  initHeaderAnimations();
  initMenuLinkHandlers();
  initContextMenu();
}

// ===================================
// INTERSECTION OBSERVER (Fade-ins)
// ===================================
function initIntersectionObserver() {
  // Added .service-item to this observer list
  const targets = document.querySelectorAll(".fade-in-element, .service-item");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
          });
          observer.unobserve(entry.target);
        }
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
}

// ===================================
// SCROLL TRIGGER ANIMATIONS (Desktop)
// ===================================
function initScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  if (isMobile()) {
    // Ensure visibility on mobile if animations are skipped
    [
      ".blurb h2",
      "#work",
      "#about #t-f-div img",
      "#about #t-s-div",
      "#grids",
      "#my-top h1",
      "#my-bottom h1",
      "#story-top h1",
      "#story-bottom h1",
      ".skill-card-wrap",
      ".skill-cards-heading",
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
    gsap.from(blurbH2, {
      x: 100,
      opacity: 0,
      stagger: 0.08,
      ...defaults,
      scrollTrigger: createTrigger(blurbH2[0]),
    });
  }

  // Page 2
  const page2 = document.querySelector("#work");
  page2 &&
    gsap.from(page2, {
      y: 100,
      opacity: 0,
      ...defaults,
      scrollTrigger: createTrigger(page2, "top 80%"),
    });

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
    gsap.from(grids, {
      opacity: 0,
      y: 50,
      ...defaults,
      scrollTrigger: createTrigger(grids, "top 80%"),
    });

  // Skill cards heading
  const skillHeading = document.querySelector(".skill-cards-heading");
  skillHeading &&
    gsap.from(skillHeading, {
      y: 40,
      opacity: 0,
      ...defaults,
      scrollTrigger: createTrigger(skillHeading, "top 90%"),
    });

  // Skill cards
  const skillCards = document.querySelectorAll(".skill-card-wrap");
  if (skillCards.length) {
    gsap.from(skillCards, {
      y: 60,
      opacity: 0,
      stagger: 0.12,
      ...defaults,
      scrollTrigger: createTrigger(skillCards[0], "top 85%"),
    });
  }

  // Process & Story Headers
  ["#my-top h1", "#story-top h1"].forEach((sel) => {
    const el = document.querySelector(sel);
    el &&
      gsap.from(el, {
        x: -100,
        opacity: 0,
        ...defaults,
        scrollTrigger: createTrigger(el),
      });
  });

  ["#my-bottom h1", "#story-bottom h1"].forEach((sel) => {
    const el = document.querySelector(sel);
    el &&
      gsap.from(el, {
        x: 100,
        opacity: 0,
        ...defaults,
        scrollTrigger: createTrigger(el),
      });
  });
}

// ===================================
// PAGE 2 EXPANDABLE CONTENT
// ===================================
function initPage2Expandable() {
  const page2Elements = document.querySelectorAll(".page2-ele");
  if (!page2Elements.length) return;

  page2Elements.forEach((element) => {
    const content = element.querySelector(".page2-content");
    if (!content) return;

    let isAnimating = false;

    content.addEventListener("click", (e) => e.stopPropagation());

    element.addEventListener("htmx:afterSwap", () => {
      if (isAnimating) return;
      element.classList.add("active");

      const fullHeight = content.offsetHeight;
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          onComplete: () =>
            typeof ScrollTrigger !== "undefined" && ScrollTrigger.refresh(),
        },
      );
    });

    element.addEventListener("click", (e) => {
      if (e.target.closest(".page2-content")) return;

      const isActive = element.classList.contains("active");
      if (isActive && content.innerHTML.trim().length > 0) {
        if (isAnimating) return;
        isAnimating = true;

        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut",
          onComplete: () => {
            element.classList.remove("active");
            content.innerHTML = "";
            gsap.set(content, { height: "auto", opacity: 1 });
            isAnimating = false;
            typeof ScrollTrigger !== "undefined" && ScrollTrigger.refresh();
          },
        });
      }
    });
  });
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

function initMenuLinkHandlers() {
  const menuLinks = document.querySelectorAll('.menu-link[href^="#"]');
  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const toggle = document.getElementById("menu-toggle");
      if (toggle) toggle.checked = false;

      const target = document.getElementById(
        link.getAttribute("href").slice(1),
      );
      if (!target) return;

      e.preventDefault();
      if (window.lenis) window.lenis.stop();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.disable();

      const offset = (document.querySelector("header")?.offsetHeight || 0) + 20;
      window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" });

      setTimeout(() => {
        if (window.lenis) window.lenis.start();
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.enable();
          ScrollTrigger.refresh();
        }
      }, 800);
    });
  });
}

// ===================================
// CONTEXT-AWARE MENU (page-sensitive)
// ===================================
function initContextMenu() {
  // Links are always consistent — no page-dependent swapping
}

function randomizeBackground() {
  const blobs = document.querySelectorAll(".blob");
  blobs.forEach((blob) => {
    blob.style.left = `${Math.floor(Math.random() * 80)}%`;
    blob.style.top = `${Math.floor(Math.random() * 80)}%`;
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

function initPage() {
  randomizeBackground();
  initHeaderComponent();
  initLenis();
  initMenuToggleScrollLock();
  initWorkToggle();
  initPage2Animations();
  initImageHoverEffects();
  initLoadAnimations();
  initChromeScroll();
  initPage2Expandable();
  initMenuLinkHandlers();
  initIntersectionObserver();
  initFooterAnimations();
  initWorkTrailAnimations();

  window.addEventListener("load", () => {
    initScrollAnimations();
    typeof ScrollTrigger !== "undefined" && ScrollTrigger.refresh();
  });
}

// HTMX & Resize Handlers
document.addEventListener("htmx:afterSwap", (event) => {
  const t = event.target;
  const isHeader = t.innerHTML.includes("<header") || t.tagName === "HEADER";
  const isFooter = t.innerHTML.includes("<footer") || t.tagName === "FOOTER";

  if (isHeader)
    setTimeout(() => {
      initHeaderAnimations();
      initMenuLinkHandlers();
    }, 50);
  if (isFooter)
    setTimeout(() => {
      initFooterAnimations();
      typeof ScrollTrigger !== "undefined" && ScrollTrigger.refresh();
    }, 50);
});

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
