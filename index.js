// ===================================
// DOM CACHE - Query once, use many times
// ===================================
const DOM = {
  miniCircle: null,
  page2Elements: null,
  logo: null,
  menuBtn: null,
  blogLink: null,
  heroHead: null,
  mainHead: null,
  miniH6: null,
  firstBottom: null,
  footer: null,
  page2: null,
  page3: null,
  grids: null,
  
  init() {
    this.miniCircle = document.querySelector("#move-circle");
    this.page2Elements = document.querySelectorAll(".page2-ele");
    this.logo = document.querySelector("#logo");
    this.menuBtn = document.querySelector("#menu-btn");
    this.blogLink = document.querySelector(".blog-link");
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
// PAGE 2 ANIMATIONS
// ===================================
function initPage2Animations() {
  if (!DOM.page2Elements.length) return;
  
  DOM.page2Elements.forEach((element) => {
    const h1 = element.querySelector("h1");
    const h6 = element.querySelector("h6");
    if (!h1 || !h6) return;

    element.addEventListener("mouseenter", () => {
      gsap.to([h1, h6], {
        opacity: 0.7,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(h1, { x: "4vw", duration: 0.8, ease: "power2.out" });
    });

    element.addEventListener("mouseleave", () => {
      gsap.to([h1, h6], {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(h1, { x: 0, duration: 0.8, ease: "power2.out" });
    });
  });
}

// ===================================
// CHROME SCROLL ANIMATION
// ===================================
function initChromeScroll() {
  // Disable on mobile for performance
  if (window.innerWidth <= 768 || 'ontouchstart' in window) {
    return;
  }

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

        el.style.setProperty("--chrome-progress-y", s.raw.toFixed(4));
        el.style.setProperty("--chrome-eased-expo", s.easedExpo.toFixed(4));
        el.style.setProperty("--chrome-eased-quart", s.easedQuart.toFixed(4));
        el.style.setProperty(
          "--chrome-eased-quart-inv",
          s.easedQuartInv.toFixed(4),
        );
        el.style.setProperty(
          "--chrome-eased-in-cubic",
          s.easedInCubic.toFixed(4),
        );
        el.style.setProperty("--chrome-blur", `${(1 - s.easedExpo) * 8}px`);
        el.style.zIndex = String(Math.round(s.easedExpo * 100) + 10);
      });
    });
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(compute);
      ticking = true;
    }
  };

  compute();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(compute), {
    passive: true,
  });
}

// ===================================
// IMAGE HOVER EFFECTS
// ===================================
function initImageHoverEffects() {
  if (!DOM.miniCircle || !DOM.page2Elements.length) return;

  DOM.page2Elements.forEach((element) => {
    const image = element.querySelector("img");
    if (!image) return;

    // Fixed positioning to avoid border interference
    gsap.set(image, { 
      position: "absolute",
      top: "50%",
      left: "50%",
      xPercent: -50, 
      yPercent: -25, 
      opacity: 0,
      zIndex: 50,
      pointerEvents: "none"
    });

    element.addEventListener("mouseenter", () => {
      gsap.to(image, { opacity: 1, duration: 0.3, ease: "power1.out" });
      gsap.to(DOM.miniCircle, { scale: 2, opacity: 0.9, duration: 0.3 });
      DOM.miniCircle.innerHTML = "<h4>VIEW</h4>";
      DOM.miniCircle.classList.add("glow");
    });

    let mouseMoveTimeout;
    element.addEventListener("mousemove", (event) => {
      if (mouseMoveTimeout) return;
      mouseMoveTimeout = setTimeout(() => {
        const bounds = element.getBoundingClientRect();
        // Constrain movement within element bounds to prevent border issues
        const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
        const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
        
        gsap.to(image, {
          x: x - bounds.width / 2,
          y: y - bounds.height / 2,
          rotation: clamp(event.movementX * 0.5, -15, 15),
          duration: 0.6,
          ease: "power2.out",
        });
        mouseMoveTimeout = null;
      }, 16);
    });

    element.addEventListener("mouseleave", () => {
      gsap.to(image, { opacity: 0, duration: 0.3, ease: "power1.out" });
      gsap.to(DOM.miniCircle, { scale: 1, opacity: 1, duration: 0.3 });
      DOM.miniCircle.innerHTML = "";
      DOM.miniCircle.classList.remove("glow");
    });
  });
}

// ===================================
// INITIAL PAGE LOAD ANIMATIONS
// ===================================
function initLoadAnimations() {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay: 0.1 });

  DOM.logo && tl.from(DOM.logo, { y: 40, opacity: 0, duration: 0.5 });

  DOM.menuBtn &&
    tl.from(DOM.menuBtn, { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");
  
  DOM.blogLink &&
    tl.from(DOM.blogLink, { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");

  if (window.innerWidth > 600) {
    const navInnerUl = document.querySelector("#nav-inner-ul");
    navInnerUl &&
      tl.from(navInnerUl, { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");
  } else {
    const extra = document.querySelector("#extra");
    extra && tl.from(extra, { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");
  }

  DOM.heroHead &&
    tl.from(DOM.heroHead, { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.2");
  DOM.mainHead &&
    tl.from(DOM.mainHead, { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.4");
  DOM.miniH6 &&
    tl.from(DOM.miniH6, { y: -40, opacity: 0, duration: 0.4 }, "-=0.3");

  const midElements = document.querySelectorAll(".mid h5");
  midElements.length &&
    tl.from(
      midElements,
      { y: -40, opacity: 0, duration: 0.4, stagger: 0.1 },
      "-=0.2",
    );

  DOM.firstBottom &&
    tl.from(DOM.firstBottom, { opacity: 0, y: 20, duration: 0.3 }, "-=0.2");
}

// ===================================
// INTERSECTION OBSERVER FOR FADE-INS
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
// SCROLL TRIGGER ANIMATIONS
// ===================================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // 1. Blurb Text
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

  // 2. Page 2 (Work Section)
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

  // 3. Page 3 (About Section)
if (DOM.page3) {
  const picture = DOM.page3.querySelector("#t-f-div img");
  const textDiv = DOM.page3.querySelector("#t-s-div");

  picture && gsap.fromTo(picture, 
    {
      opacity: 0,
      scale: 0.9,
    },
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
    {
      opacity: 0,
      y: 60,
    },
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

  const thirdBottom = document.querySelector("#third-bottom");
  thirdBottom && gsap.fromTo(thirdBottom,
    {
      y: 40,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: thirdBottom,
        start: "top 90%",
        once: true,
      },
    }
  );
}

  // 4. Grids Section (Skills)
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

  // 5. My Process Section
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

  // 6. Footer
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
// PAGE 2 EXPANDABLE CONTENT (SIMPLIFIED)
// ===================================
function initPage2Expandable() {
  if (!DOM.page2Elements.length) return;
  
  DOM.page2Elements.forEach((element) => {
    const content = element.querySelector(".page2-content");
    const projectContent = element.querySelector(".project-content");
    const h2 = element.querySelector("h2");
    let isAnimating = false;

    // Map h2 text to partial files
    const partialMap = {
      "veoma studio": "./partials/veoma.html",
      "view from nowhere": "./partials/vfns.html",
      "doctors": "./partials/doctors.html",
      "nebesna": "./partials/nebesna.html",
      "anksioznost": "./partials/anksioznost.html"
    };

    // Create triangle indicator
    const triangle = document.createElement('div');
    triangle.className = 'triangle-indicator';
    triangle.innerHTML = '▼';
    element.appendChild(triangle);

    // Click on entire page2-ele div triggers open/close
    element.addEventListener("click", (e) => {
      // Prevent clicks on content from triggering
      if (e.target.closest('.page2-content')) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      if (isAnimating) return;
      isAnimating = true;

      if (element.classList.contains("active")) {
        // Close animation
        triangle.style.transform = 'rotate(0deg)';
        const currentHeight = content.offsetHeight;
        gsap.set(content, { height: currentHeight });

        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut",
          onComplete: () => {
            element.classList.remove("active");
            projectContent.innerHTML = "";
            gsap.set(content, { height: "auto", opacity: 1 });
            isAnimating = false;
            ScrollTrigger.refresh();
          }
        });
      } else {
        // Load content and open animation
        const partialUrl = partialMap[h2.textContent.trim()];
        if (!partialUrl) {
          isAnimating = false;
          return;
        }

        fetch(partialUrl)
          .then(response => response.text())
          .then(html => {
            projectContent.innerHTML = html;
            element.classList.add("active");
            triangle.style.transform = 'rotate(180deg)';
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
                  isAnimating = false;
                  ScrollTrigger.refresh();
                }
              }
            );
          })
          .catch(error => {
            console.error('Error loading partial:', error);
            isAnimating = false;
          });
      }
    });
  });
}

// ===================================
// MENU LINK CLICK HANDLER
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

      if (typeof lenis !== 'undefined') {
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
        if (typeof lenis !== 'undefined') {
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
// INITIALIZATION - CRITICAL (Runs on DOMContentLoaded)
// ===================================
function initCriticalFunctionality() {
  DOM.init(); // Must run first to cache elements
  
  // Handlers required for basic site navigation/interaction
  initMenuLinkHandlers();
  
  // Non-animation fixes
  initChromeScroll(); 
}

// ===================================
// PRELOADER
// ===================================
function hidePreloader() {
    const preloader = document.getElementById("preloader");
    const mainContent = document.getElementById("main-content");

    if (preloader) {
        // Use a short delay with GSAP for a smooth fade-out effect
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                preloader.classList.add('hidden'); // Hide completely
            }
        });
    }

    if (mainContent) {
        // Fade in the content
        mainContent.classList.add('visible');
    }
}

// ===================================
// INITIALIZATION - DEFERRED (Runs on window.load)
// ===================================
function initAnimationDeferred() {
  // Heavy-lifting animation initialization moved here:
  initPage2Animations();
  initImageHoverEffects();
  initLoadAnimations();
  initPage2Expandable();
  initIntersectionObserver();
  initScrollAnimations(); // This was already here, but now everything else joins it

  // Final refresh after all animations are set up
  if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
  }
  
  // Hide preloader after everything is loaded
  hidePreloader();
}

// ===================================
// AUTO-INITIALIZATION BLOCK (Integrates with your new global.js flow)
// We replace the original 'startAnimations' logic with our new split functions.
// ===================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCriticalFunctionality);
} else {
  initCriticalFunctionality();
}

// Ensure deferred animations run after all assets are loaded.
window.addEventListener("load", initAnimationDeferred);

let resizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      if (DOM.miniCircle) {
        DOM.miniCircle.style.display = window.innerWidth <= 1024 ? "none" : "flex";
      }
    }, 250);
},
  { passive: true },
);

if (typeof isLowEnd !== 'undefined' && isLowEnd) {
  gsap.globalTimeline.timeScale(1.2);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAnimations);
} else {
  startAnimations();
}