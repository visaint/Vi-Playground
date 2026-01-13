// ===================================
// MAIN.JS - Optimized & Clean
// ===================================

// Add JS detection class
document.documentElement.classList.add('js-enabled');

// ===================================
// HELPERS
// ===================================
const isMobile = () => window.innerWidth < 768 || 'ontouchstart' in window;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const lerp = (start, end, factor) => start + (end - start) * factor;

// ===================================
// LENIS SMOOTH SCROLL
// ===================================
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  
  // Keep disabled on mobile for native feel/performance
  if (isMobile()) return;
  
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP integration
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
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
      gsap.to([h2, h6], { opacity: 0.7, duration: 0.4, ease: "power1.out", overwrite: true });
      gsap.to(h2, { x: "4vw", duration: 0.4, ease: "power1.out", overwrite: true });
    });

    element.addEventListener("mouseleave", () => {
      gsap.to([h2, h6], { opacity: 1, duration: 0.4, ease: "power1.out", overwrite: true });
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
    ...document.querySelectorAll(".chrome-scroll-section")
  ].filter(Boolean);
  
  if (!containers.length) return;

  const chromeScrollInstances = new Map();
  
  containers.forEach(container => {
    const items = Array.from(container.querySelectorAll(".text"));
    if (!items.length) return;

    container.style.position = "relative";
    const state = new Map();
    
    items.forEach((el) => {
      state.set(el, {
        raw: 0, easedExpo: 0, easedQuart: 0, easedQuartInv: 0, easedInCubic: 0,
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
        if (rect.top > vh + offscreenMargin || rect.bottom < -offscreenMargin) return;

        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        const raw = clamp(1 - distance / (vh * 0.6), 0, 1);
        const s = state.get(el);
        const smooth = 0.12;

        s.raw = lerp(s.raw, raw, smooth);
        // Optimization: Only calculate complex eases if raw changed significantly
        if (Math.abs(s.raw - raw) < 0.001 && raw === 0) return;

        s.easedExpo = lerp(s.easedExpo, clamp(easeOutExpo(raw), 0, 1), smooth);
        s.easedQuart = lerp(s.easedQuart, clamp(easeOutQuart(raw), 0, 1), smooth);
        s.easedQuartInv = lerp(s.easedQuartInv, clamp(easeOutQuart(1 - raw), 0, 1), smooth);
        s.easedInCubic = lerp(s.easedInCubic, clamp(easeInCubic(1 - raw), 0, 1), smooth);

        el.style.setProperty('--chrome-progress-y', s.raw.toFixed(3));
        el.style.setProperty('--chrome-eased-expo', s.easedExpo.toFixed(3));
        el.style.setProperty('--chrome-eased-quart', s.easedQuart.toFixed(3));
        el.style.setProperty('--chrome-eased-quart-inv', s.easedQuartInv.toFixed(3));
        el.style.setProperty('--chrome-eased-in-cubic', s.easedInCubic.toFixed(3));
        el.style.setProperty('--chrome-blur', `${((1 - s.easedExpo) * 8).toFixed(1)}px`);
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

  const observer = new IntersectionObserver((entries) => {
    const isAnyIntersecting = entries.some(entry => entry.isIntersecting);
    if (isAnyIntersecting) {
      window.addEventListener("scroll", onScroll, { passive: true });
      compute();
    }
  }, { rootMargin: '100px' });

  containers.forEach(container => observer.observe(container));
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
      opacity: '0', position: 'absolute', pointerEvents: 'none',
      transition: 'opacity 0.3s ease', willChange: 'transform'
    });

    let isHovering = false;
    let rafId = null;

    element.addEventListener("mouseenter", () => {
      if (!element.classList.contains("active")) {
        isHovering = true;
        image.style.opacity = '1';
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
      isHovering = false;
      image.style.opacity = '0';
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    };

    element.addEventListener("mouseleave", reset);
    element.addEventListener("htmx:afterSwap", reset);
  });
}

// ===================================
// INITIAL PAGE LOAD ANIMATIONS
// ===================================
function initHeaderAnimations() {
  if (isMobile()) {
    const elements = document.querySelectorAll("#logo, #menu-btn, .header-link");
    elements.forEach(el => el.style.opacity = '1');
    return;
  }

  const logo = document.querySelector("#logo");
  const menuBtn = document.querySelector("#menu-btn");
  const headerLinks = document.querySelectorAll(".header-link");

  const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay: 0.1 });

  logo && tl.from(logo, { y: 40, opacity: 0, duration: 0.5 });
  headerLinks && headerLinks.forEach((link) => 
    tl.from(link, { y: 40, opacity: 0, duration: 0.4 }, `-=0.2`)
  );
  menuBtn && tl.from(menuBtn, { y: 40, opacity: 0, duration: 0.5 }, "-=0.2");
}

function initFooterAnimations() {
  if (isMobile()) {
    const footer = document.querySelector("footer");
    if (footer) footer.style.opacity = '1';
    return;
  }

  const footer = document.querySelector("footer");
  if (footer && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from(footer, {
      y: 60, opacity: 0, duration: 1.2, ease: "power2.out",
      scrollTrigger: { trigger: footer, start: "top 95%", once: true },
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
    midElements: document.querySelectorAll(".mid h5")
  };

  if (isMobile()) {
    Object.values(els).forEach(el => {
        if (el instanceof NodeList) el.forEach(e => e.style.opacity = '1');
        else if (el) el.style.opacity = '1';
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay: 0.1 });

  els.heroHead && tl.from(els.heroHead, { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.2");
  els.mainHead && tl.from(els.mainHead, { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.4");
  
  [els.prefixH6, els.miniH6, els.name].forEach(el => {
    if (el) tl.from(el, { y: -40, opacity: 0, duration: 0.4 }, "-=0.3");
  });

  if (els.midElements.length) {
    tl.from(els.midElements, { y: -40, opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");
  }

  els.firstBottom && tl.from(els.firstBottom, { opacity: 0, y: 20, duration: 0.3 }, "-=0.2");
}

window.initHeaderAnimations = initHeaderAnimations;
window.initFooterAnimations = initFooterAnimations;

// ===================================
// INTERSECTION OBSERVER (Fade-ins)
// ===================================
function initIntersectionObserver() {
  // Added .service-item to this observer list
  const targets = document.querySelectorAll('.fade-in-element, .service-item');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          overwrite: true
        });
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  targets.forEach(el => {
    // Force CSS animation to none so GSAP takes over completely
    el.style.animation = 'none';
    gsap.set(el, { opacity: 0, y: 30 });
    observer.observe(el);
  });
}

// ===================================
// SCROLL TRIGGER ANIMATIONS (Desktop)
// ===================================
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  if (isMobile()) {
    // Ensure visibility on mobile if animations are skipped
    ['.blurb h2', '#page-2', '#page-3 #t-f-div img', '#page-3 #t-s-div', '.grids', '#my-top h1', '#my-bottom h1', '#story-top h1', '#story-bottom h1']
      .forEach(sel => {
        const el = document.querySelector(sel);
        if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
    return;
  }
  
  gsap.registerPlugin(ScrollTrigger);

  const defaults = {
    duration: 1.5,
    ease: "power2.out",
    once: true
  };

  const createTrigger = (trigger, start = "top 85%") => ({ trigger, start, once: true });

  // Blurb
  const blurbH2 = document.querySelector(".blurb h2");
  blurbH2 && gsap.from(blurbH2, { x: 100, opacity: 0, ...defaults, scrollTrigger: createTrigger(blurbH2) });

  // Page 2
  const page2 = document.querySelector("#page-2");
  page2 && gsap.from(page2, { y: 100, opacity: 0, ...defaults, scrollTrigger: createTrigger(page2, "top 80%") });

  // Page 3
  const p3Pic = document.querySelector("#page-3 #t-f-div img");
  const p3Text = document.querySelector("#page-3 #t-s-div");
  
  p3Pic && gsap.fromTo(p3Pic, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, ...defaults, scrollTrigger: createTrigger(p3Pic, "top 80%") });
  p3Text && gsap.fromTo(p3Text, { opacity: 0, y: 60 }, { opacity: 1, y: 0, ...defaults, scrollTrigger: createTrigger(p3Text, "top 80%") });

  // Grids
  const grids = document.querySelector(".grids");
  grids && gsap.from(grids, { opacity: 0, y: 50, ...defaults, scrollTrigger: createTrigger(grids, "top 80%") });

  // Process & Story Headers
  ['#my-top h1', '#story-top h1'].forEach(sel => {
    const el = document.querySelector(sel);
    el && gsap.from(el, { x: -100, opacity: 0, ...defaults, scrollTrigger: createTrigger(el) });
  });

  ['#my-bottom h1', '#story-bottom h1'].forEach(sel => {
    const el = document.querySelector(sel);
    el && gsap.from(el, { x: 100, opacity: 0, ...defaults, scrollTrigger: createTrigger(el) });
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
      gsap.fromTo(content, 
        { height: 0, opacity: 0 },
        { 
          height: "auto", opacity: 1, duration: 0.45, ease: "power2.out",
          onComplete: () => typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh()
        }
      );
    });

    element.addEventListener("click", (e) => {
      if (e.target.closest('.page2-content')) return;

      const isActive = element.classList.contains("active");
      if (isActive && content.innerHTML.trim().length > 0) {
        if (isAnimating) return;
        isAnimating = true;

        gsap.to(content, {
          height: 0, opacity: 0, duration: 0.45, ease: "power2.inOut",
          onComplete: () => {
            element.classList.remove("active");
            content.innerHTML = "";
            gsap.set(content, { height: "auto", opacity: 1 });
            isAnimating = false;
            typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh();
          }
        });
      }
    });
  });
}

// ===================================
// UTILS
// ===================================
function initMenuLinkHandlers() {
  const menuLinks = document.querySelectorAll('.menu-link[href^="#"]');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const toggle = document.getElementById('menu-toggle');
      if (toggle) toggle.checked = false;

      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;

      e.preventDefault();
      if (window.lenis) window.lenis.stop();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.disable();

      const offset = (document.querySelector('header')?.offsetHeight || 0) + 20;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });

      setTimeout(() => {
        if (window.lenis) window.lenis.start();
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.enable();
          ScrollTrigger.refresh();
        }
      }, 800);
    });
  });
}

function randomizeBackground() {
  const blobs = document.querySelectorAll('.blob');
  blobs.forEach(blob => {
    blob.style.left = `${Math.floor(Math.random() * 80)}%`;
    blob.style.top = `${Math.floor(Math.random() * 80)}%`;
  });
}

// ===================================
// INIT
// ===================================
function initPage() {
  randomizeBackground();
  initLenis();
  initPage2Animations();
  initImageHoverEffects();
  initLoadAnimations();
  initChromeScroll();
  initPage2Expandable();
  initMenuLinkHandlers();
  initIntersectionObserver();

  window.addEventListener("load", () => {
    initScrollAnimations();
    typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh();
  });
}

// HTMX & Resize Handlers
document.addEventListener('htmx:afterSwap', (event) => {
  const t = event.target;
  const isHeader = t.innerHTML.includes('<header') || t.tagName === 'HEADER';
  const isFooter = t.innerHTML.includes('<footer') || t.tagName === 'FOOTER';
  
  if (isHeader) setTimeout(() => { initHeaderAnimations(); initMenuLinkHandlers(); }, 50);
  if (isFooter) setTimeout(() => { initFooterAnimations(); typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh(); }, 50);
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh(), 250);
}, { passive: true });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
