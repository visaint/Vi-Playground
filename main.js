// ===================================
// MAIN.JS - Reusable across all pages
// ===================================

// Add JS detection class
document.documentElement.classList.add('js-enabled');

// ===================================
// LENIS SMOOTH SCROLL INITIALIZATION
// ===================================
let lenis;

function initLenis() {
  if (typeof Lenis === 'undefined') return;
  
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
  
  // CRITICAL FIX: Disable Lenis entirely on mobile to prevent scroll blocking
  if (isMobile) {
    console.log('Mobile detected - Lenis disabled for performance');
    return;
  }
  
  lenis = new Lenis({
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
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const lerp = (start, end, factor) => start + (end - start) * factor;

// ===================================
// DOM CACHE
// ===================================
const DOM = {
  miniCircle: null,
  page2Elements: null,
  logo: null,
  menuBtn: null,
  headerLinks: null,
  heroHead: null,
  mainHead: null,
  miniH6: null,
  firstBottom: null,
  footer: null,
  page2: null,
  page3: null,
  grids: null,
  servicesArrow: null,
  
  init() {
    this.miniCircle = document.querySelector("#move-circle");
    this.page2Elements = document.querySelectorAll(".page2-ele");
    this.logo = document.querySelector("#logo");
    this.menuBtn = document.querySelector("#menu-btn");
    this.headerLinks = document.querySelectorAll(".header-link");
    this.heroHead = document.querySelector("#hero-head h1");
    this.mainHead = document.querySelector("#main-head h1");
    this.miniH6 = document.querySelector("#mini h6");
    this.firstBottom = document.querySelector("#first-bottom");
    this.footer = document.querySelector("footer");
    this.page2 = document.querySelector("#page-2");
    this.page3 = document.querySelector("#page-3");
    this.grids = document.querySelector(".grids");
  }
};

// ===================================
// PAGE 2 ANIMATIONS (Homepage only) - OPTIMIZED
// ===================================
function initPage2Animations() {
  if (!DOM.page2Elements.length) return;
  
  DOM.page2Elements.forEach((element) => {
    const h1 = element.querySelector("h2");
    const h6 = element.querySelector("h6");
    if (!h1 || !h6) return;

    // OPTIMIZED: Shorter duration, simpler easing
    element.addEventListener("mouseenter", () => {
      gsap.to([h1, h6], {
        opacity: 0.7,
        duration: 0.4,
        ease: "power1.out",
        overwrite: "auto"
      });
      gsap.to(h1, { 
        x: "4vw", 
        duration: 0.4, 
        ease: "power1.out",
        overwrite: "auto"
      });
    });

    element.addEventListener("mouseleave", () => {
      gsap.to([h1, h6], {
        opacity: 1,
        duration: 0.4,
        ease: "power1.out",
        overwrite: "auto"
      });
      gsap.to(h1, { 
        x: 0, 
        duration: 0.4, 
        ease: "power1.out",
        overwrite: "auto"
      });
    });
  });
}

// ===================================
// CHROME SCROLL ANIMATION (Reusable)
// ===================================
function initChromeScroll() {
  const containers = [
    document.querySelector("#chrome-scroll"),
    ...document.querySelectorAll(".chrome-scroll-section")
  ].filter(Boolean);
  
  if (!containers.length) return;

  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
  
  // Use JavaScript fallback for mobile and browsers without scroll-driven animation support
  const chromeScrollInstances = new Map();
  
  containers.forEach(container => {
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
        if (rect.top > vh + offscreenMargin || rect.bottom < -offscreenMargin) return;

        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        const raw = clamp(1 - distance / (vh * 0.6), 0, 1);

        const s = state.get(el);
        const smooth = 0.12;

        s.raw = lerp(s.raw, raw, smooth);
        s.easedExpo = lerp(s.easedExpo, clamp(easeOutExpo(raw), 0, 1), smooth);
        s.easedQuart = lerp(s.easedQuart, clamp(easeOutQuart(raw), 0, 1), smooth);
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

        const precision = 3;
        const progress = s.raw.toFixed(precision);
        const expo = s.easedExpo.toFixed(precision);
        const quart = s.easedQuart.toFixed(precision);
        const blur = ((1 - s.easedExpo) * 8).toFixed(1);
        const zIndex = Math.round(s.easedExpo * 100) + 10;
        const quartInv = s.easedQuartInv.toFixed(precision);
        const inCubic = s.easedInCubic.toFixed(precision);
        
        el.style.cssText = `
          --chrome-progress-y: ${progress};
          --chrome-eased-expo: ${expo};
          --chrome-eased-quart: ${quart};
          --chrome-eased-quart-inv: ${quartInv};
          --chrome-eased-in-cubic: ${inCubic};
          --chrome-blur: ${blur}px;
          z-index: ${zIndex};
          will-change: transform, opacity, filter;
          pointer-events: none;
        `;
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
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        compute();
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    });
  }, { 
    rootMargin: '100px'
  });

  containers.forEach(container => observer.observe(container));

  compute();
  
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      requestAnimationFrame(compute);
    }, 100);
  }, { passive: true });
}

// ===================================
// IMAGE HOVER EFFECTS (Homepage only) - OPTIMIZED
// ===================================
function initImageHoverEffects() {
  if (!DOM.page2Elements.length) return;
  
  // MOBILE FIX: Disable hover effects on mobile entirely
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
  if (isMobile) return;

  DOM.page2Elements.forEach((element) => {
    const image = element.querySelector("img");
    if (!image) return;

    // OPTIMIZED: Use CSS for better performance
    image.style.opacity = '0';
    image.style.position = 'absolute';
    image.style.pointerEvents = 'none';
    image.style.transition = 'opacity 0.3s ease';
    image.style.willChange = 'transform';

    let isHovering = false;
    let rafId = null;

    element.addEventListener("mouseenter", () => {
      if (!element.classList.contains("active")) {
        isHovering = true;
        image.style.opacity = '1';
      }
    });

    // OPTIMIZED: Throttled cursor follow with RAF
    element.addEventListener("mousemove", (e) => {
      if (!isHovering || element.classList.contains("active")) return;
      
      if (rafId) return; // Skip if already animating
      
      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        image.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        rafId = null;
      });
    });

    element.addEventListener("mouseleave", () => {
      isHovering = false;
      image.style.opacity = '0';
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    // Hide when content loads
    element.addEventListener("htmx:afterSwap", () => {
      isHovering = false;
      image.style.opacity = '0';
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  });
}

// ===================================
// INITIAL PAGE LOAD ANIMATIONS (Reusable)
// ===================================
function initLoadAnimations() {
  // MOBILE FIX: Reduce animations on mobile
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
  
  if (isMobile) {
    // Instant display on mobile - no animations
    if (DOM.logo) DOM.logo.style.opacity = '1';
    if (DOM.menuBtn) DOM.menuBtn.style.opacity = '1';
    if (DOM.headerLinks) DOM.headerLinks.forEach(link => link.style.opacity = '1');
    
    const navInnerUl = document.querySelector("#nav-inner-ul");
    if (navInnerUl) navInnerUl.style.opacity = '1';
    
    if (DOM.heroHead) DOM.heroHead.style.opacity = '1';
    if (DOM.mainHead) DOM.mainHead.style.opacity = '1';
    if (DOM.miniH6) DOM.miniH6.style.opacity = '1';
    
    const midElements = document.querySelectorAll(".mid h5");
    midElements.forEach(el => el.style.opacity = '1');
    
    if (DOM.firstBottom) DOM.firstBottom.style.opacity = '1';
    return;
  }
  
  // Desktop animations
  const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay: 0.1 });

  DOM.logo && tl.from(DOM.logo, { y: 40, opacity: 0, duration: 0.5 });
  DOM.menuBtn && tl.from(DOM.menuBtn, { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");
  DOM.headerLinks && DOM.headerLinks.forEach((link, index) => 
    tl.from(link, { y: 40, opacity: 0, duration: 0.5 }, `-=0.3${index > 0 ? `-${index * 0.1}` : ''}`)
  );

  if (window.innerWidth > 600) {
    const navInnerUl = document.querySelector("#nav-inner-ul");
    navInnerUl && tl.from(navInnerUl, { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");
  }

  DOM.heroHead && tl.from(DOM.heroHead, { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.2");
  DOM.mainHead && tl.from(DOM.mainHead, { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.4");
  DOM.miniH6 && tl.from(DOM.miniH6, { y: -40, opacity: 0, duration: 0.4 }, "-=0.3");

  const midElements = document.querySelectorAll(".mid h5");
  midElements.length && tl.from(midElements, { y: -40, opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");

  DOM.firstBottom && tl.from(DOM.firstBottom, { opacity: 0, y: 20, duration: 0.3 }, "-=0.2");
}

// ===================================
// INTERSECTION OBSERVER FOR FADE-INS (Reusable)
// ===================================
function initIntersectionObserver() {
  const fadeElements = document.querySelectorAll('.fade-in-element');
  if (!fadeElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        });
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  fadeElements.forEach(el => {
    gsap.set(el, { opacity: 0, y: 30 });
    observer.observe(el);
  });
}

// ===================================
// SCROLL TRIGGER ANIMATIONS (Reusable)
// ===================================
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  // MOBILE FIX: Disable ScrollTrigger animations on mobile for performance
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
  if (isMobile) {
    console.log('Mobile detected - ScrollTrigger animations disabled');
    // Make elements visible immediately on mobile
    const elements = [
      '.blurb h2',
      '#page-2',
      '#page-3 #t-f-div img',
      '#page-3 #t-s-div',
      '.grids',
      '#my-top h1',
      '#my-bottom h1',
      'footer'
    ];
    elements.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
    return;
  }
  
  gsap.registerPlugin(ScrollTrigger);

  // Blurb Text
  const blurbH2 = document.querySelector(".blurb h2");
  blurbH2 && gsap.from(blurbH2, {
    x: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: blurbH2,
      start: "top 85%",
      once: true,
    },
  });

  // Page 2 (Work Section)
  DOM.page2 && gsap.from(DOM.page2, {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: DOM.page2,
      start: "top 80%",
      once: true,
    },
  });

  // Page 3 (About Section)
  if (DOM.page3) {
    const picture = DOM.page3.querySelector("#t-f-div img");
    const textDiv = DOM.page3.querySelector("#t-s-div");

    picture && gsap.fromTo(picture, 
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: picture,
          start: "top 80%",
          once: true,
        },
      }
    );

    textDiv && gsap.fromTo(textDiv,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: textDiv,
          start: "top 80%",
          once: true,
        },
      }
    );
  }

  // Grids Section (Skills)
  DOM.grids && gsap.from(DOM.grids, {
    opacity: 0,
    y: 50,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: DOM.grids,
      start: "top 80%",
      once: true,
    },
  });

  // My Process Section
  const myTopH1 = document.querySelector("#my-top h1");
  const myBottomH1 = document.querySelector("#my-bottom h1");

  myTopH1 && gsap.from(myTopH1, {
    x: -100,
    opacity: 0,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: myTopH1,
      start: "top 85%",
      once: true,
    },
  });

  myBottomH1 && gsap.from(myBottomH1, {
    x: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: myBottomH1,
      start: "top 85%",
      once: true,
    },
  });

  // Footer
  DOM.footer && gsap.from(DOM.footer, {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: DOM.footer,
      start: "top 95%",
      once: true,
    },
  });
}

// ===================================
// PAGE 2 EXPANDABLE CONTENT (Homepage only)
// ===================================
function initPage2Expandable() {
  if (!DOM.page2Elements.length) return;
  
  DOM.page2Elements.forEach((element) => {
    const content = element.querySelector(".page2-content");
    if (!content) return;
    
    let isAnimating = false;

    // After HTMX loads content, expand it
    element.addEventListener("htmx:afterSwap", () => {
      if (isAnimating) return;

      element.classList.add("active");
      gsap.set(content, { height: "auto", opacity: 1 });

      const fullHeight = content.offsetHeight;

      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: fullHeight,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(content, { height: "auto" });
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
          }
        }
      );
    });

    // Click handler: toggle open/close, but ignore clicks on expanded content
    element.addEventListener("click", (e) => {
      // If clicking inside the expanded content area, do nothing
      if (e.target.closest('.page2-content')) {
        return;
      }

      const isActive = element.classList.contains("active");
      const hasContent = content.innerHTML.trim().length > 0;

      // If already open and has content, close it
      if (isActive && hasContent) {
        if (isAnimating) return;
        isAnimating = true;

        const currentHeight = content.offsetHeight;
        gsap.set(content, { height: currentHeight });

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
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
          }
        });
      }
      // If not open, HTMX will handle loading content (htmx:afterSwap will expand)
    });
  });
}

// ===================================
// MENU LINK CLICK HANDLER (Reusable)
// ===================================
function initMenuLinkHandlers() {
  const menuLinks = document.querySelectorAll('.menu-link[href^="#"]');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const toggle = document.getElementById('menu-toggle');
      if (toggle) toggle.checked = false;

      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      if (typeof lenis !== 'undefined' && lenis) {
        lenis.stop();
      }
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
        ScrollTrigger.disable();
      }

      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop = target.offsetTop - headerHeight - 20;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      setTimeout(() => {
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.start();
        }
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.enable();
          ScrollTrigger.refresh();
        }
      }, 800);
    });
  });
}

// ===================================
// PAGE-SPECIFIC INITIALIZATION
// ===================================

// Homepage initialization
function initHomepage() {
  DOM.init();
  initLenis(); // Initialize smooth scroll
  initPage2Animations();
  initImageHoverEffects();
  initLoadAnimations();
  initChromeScroll();
  initPage2Expandable();
  initMenuLinkHandlers();
  initIntersectionObserver();

  window.addEventListener("load", () => {
    initScrollAnimations();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
}

// About/Process page initialization
function initAboutPage() {
  DOM.init();
  initLenis(); // Initialize smooth scroll
  initLoadAnimations();
  initChromeScroll(); // This page has chrome scroll
  initMenuLinkHandlers();
  initIntersectionObserver();

  window.addEventListener("load", () => {
    initScrollAnimations();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
}

// ===================================
// AUTO-DETECT PAGE AND INITIALIZE
// ===================================
function initPage() {
  // Detect which page we're on
  const isHomepage = document.querySelector("#page-2") !== null; // Homepage has work section
  const isAboutPage = document.querySelector("#my-ding") !== null; // About has process section

  if (isHomepage) {
    initHomepage();
  } else if (isAboutPage) {
    initAboutPage();
  } else {
    // Generic page - just load basics
    DOM.init();
    initLenis();
    initLoadAnimations();
    initMenuLinkHandlers();
    initIntersectionObserver();
  }
}

// ===================================
// GLOBAL EVENT LISTENERS
// ===================================
let resizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
      if (DOM.miniCircle) {
        DOM.miniCircle.style.display = window.innerWidth <= 1024 ? "none" : "flex";
      }
    }, 250);
  },
  { passive: true },
);

// Performance optimization for low-end devices
if (typeof isLowEnd !== 'undefined' && isLowEnd) {
  gsap.globalTimeline.timeScale(1.2);
}

// ===================================
// START
// ===================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}