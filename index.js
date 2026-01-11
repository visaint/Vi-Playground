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
    this.miniCircle = document.getElementById("move-circle");
    this.page2Elements = document.querySelectorAll(".page2-ele");
    this.logo = document.getElementById("logo");
    this.menuBtn = document.getElementById("menu-btn");
    this.blogLink = document.querySelector(".blog-link");
    this.heroHead = document.querySelector("#hero-head h1");
    this.mainHead = document.querySelector("#main-head h1");
    this.miniH6 = document.querySelector("#mini h6");
    this.firstBottom = document.getElementById("first-bottom");
    this.footer = document.querySelector("footer");
    this.page2 = document.getElementById("page-2");
    this.page3 = document.getElementById("page-3");
    this.grids = document.getElementById("grids");
  }
};

// ===================================
// PAGE 2 ANIMATIONS
// ===================================
function initPage2Animations() {
  if (!DOM.page2Elements.length) return;
  
  // Use a context for cleaner animation management
  const ctx = gsap.context(() => {
    DOM.page2Elements.forEach((element) => {
      const h1 = element.querySelector("h1");
      const h6 = element.querySelector("h6");
      if (!h1 || !h6) return;

      element.addEventListener("mouseenter", () => {
        gsap.to([h1, h6], { opacity: 0.7, duration: 0.8, ease: "power2.out" });
        gsap.to(h1, { x: "4vw", duration: 0.8, ease: "power2.out" });
      });

      element.addEventListener("mouseleave", () => {
        gsap.to([h1, h6], { opacity: 1, duration: 0.8, ease: "power2.out" });
        gsap.to(h1, { x: 0, duration: 0.8, ease: "power2.out" });
      });
    });
  });
}

// ===================================
// CHROME SCROLL ANIMATION (OPTIMIZED)
// ===================================
function initChromeScroll() {
  const containers = [
    document.getElementById("chrome-scroll"),
    ...document.querySelectorAll(".chrome-scroll-section")
  ].filter(Boolean);
  
  if (!containers.length) return;

  const chromeScrollInstances = [];
  
  // Pre-calculate structure to avoid DOM queries in the loop
  containers.forEach(container => {
    const items = Array.from(container.querySelectorAll(".text"));
    if (!items.length) return;

    container.style.position = "relative";
    
    // Create state objects
    const itemStates = items.map(el => {
      el.style.willChange = "transform, opacity, filter";
      el.style.pointerEvents = "none";
      return {
        el,
        state: {
          raw: 0,
          easedExpo: 0,
          easedQuart: 0,
          easedQuartInv: 0,
          easedInCubic: 0
        }
      };
    });

    chromeScrollInstances.push({ items: itemStates });
  });

  let ticking = false;
  // Math constants pre-calc
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const easeInCubic = (t) => t * t * t;

  const compute = () => {
    ticking = false;
    const vh = window.innerHeight;
    const viewportCenter = vh / 2;
    const smooth = 0.12;
    
    // BATCH READS: Perform all measurements first
    // This prevents layout thrashing (interleaved read/write)
    const updates = [];

    for (const instance of chromeScrollInstances) {
      for (const item of instance.items) {
        const rect = item.el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        // Skip items completely off-screen to save CPU
        if (distance > vh) continue; 

        const raw = clamp(1 - distance / (vh * 0.6), 0, 1);
        updates.push({ item, raw });
      }
    }

    // BATCH WRITES: Apply styles only after all reads are done
    for (const update of updates) {
        const { item, raw } = update;
        const s = item.state;
        const el = item.el;

        s.raw = lerp(s.raw, raw, smooth);
        s.easedExpo = lerp(s.easedExpo, clamp(easeOutExpo(raw), 0, 1), smooth);
        s.easedQuart = lerp(s.easedQuart, clamp(easeOutQuart(raw), 0, 1), smooth);
        s.easedQuartInv = lerp(s.easedQuartInv, clamp(easeOutQuart(1 - raw), 0, 1), smooth);
        s.easedInCubic = lerp(s.easedInCubic, clamp(easeInCubic(1 - raw), 0, 1), smooth);

        // Batch style updates
        const style = el.style;
        style.setProperty("--chrome-progress-y", s.raw.toFixed(4));
        style.setProperty("--chrome-eased-expo", s.easedExpo.toFixed(4));
        style.setProperty("--chrome-eased-quart", s.easedQuart.toFixed(4));
        style.setProperty("--chrome-eased-quart-inv", s.easedQuartInv.toFixed(4));
        style.setProperty("--chrome-eased-in-cubic", s.easedInCubic.toFixed(4));
        style.setProperty("--chrome-blur", `${(1 - s.easedExpo) * 8}px`);
        style.zIndex = Math.round(s.easedExpo * 100) + 10;
    }
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(compute);
      ticking = true;
    }
  };

  compute();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(compute), { passive: true });
}

// ===================================
// IMAGE HOVER EFFECTS (OPTIMIZED)
// ===================================
function initImageHoverEffects() {
  if (!DOM.miniCircle || !DOM.page2Elements.length) return;

  DOM.page2Elements.forEach((element) => {
    const image = element.querySelector("img");
    if (!image) return;

    // Use quickSetter for high performance mouse movement
    const setX = gsap.quickSetter(image, "x", "px");
    const setY = gsap.quickSetter(image, "y", "px");
    const setRot = gsap.quickSetter(image, "rotation", "deg");

    gsap.set(image, { xPercent: -50, yPercent: -25, opacity: 0 });

    element.addEventListener("mouseenter", () => {
      gsap.to(image, { opacity: 1, duration: 0.3, ease: "power1.out" });
      gsap.to(DOM.miniCircle, { scale: 2, opacity: 0.9, duration: 0.3 });
      DOM.miniCircle.innerHTML = "<h4>VIEW</h4>";
      DOM.miniCircle.classList.add("glow");
    });

    // Throttled mouse move using requestAnimationFrame for smoothness
    let ticking = false;
    element.addEventListener("mousemove", (event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const bounds = element.getBoundingClientRect();
          const relX = event.clientX - bounds.left;
          const relY = event.clientY - bounds.top;
          
          setX(relX);
          setY(relY);
          setRot(clamp(event.movementX * 0.5, -15, 15));
          
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

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

  // Batch animations to reduce repaints
  if (DOM.logo) tl.from(DOM.logo, { y: 40, opacity: 0, duration: 0.5 });

  const navElements = [DOM.menuBtn, DOM.blogLink].filter(Boolean);
  if (navElements.length) {
      tl.from(navElements, { y: 40, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3");
  }

  // Hero elements batch
  const heroElements = [DOM.heroHead, DOM.mainHead].filter(Boolean);
  if (heroElements.length) {
     tl.from(heroElements, { y: "30vw", opacity: 0, duration: 0.6, stagger: 0.2 }, "-=0.2");
  }

  if (DOM.miniH6) tl.from(DOM.miniH6, { y: -40, opacity: 0, duration: 0.4 }, "-=0.3");

  const midElements = document.querySelectorAll(".mid h5");
  if (midElements.length) {
    tl.from(midElements, { y: -40, opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");
  }

  if (DOM.firstBottom) {
    tl.from(DOM.firstBottom, { opacity: 0, y: 20, duration: 0.3 }, "-=0.2");
  }
}

// ===================================
// INTERSECTION OBSERVER
// ===================================
function initIntersectionObserver() {
  const fadeElements = document.querySelectorAll('.fade-in-element');
  if (!fadeElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          overwrite: "auto"
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

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

  const triggers = [
    { el: ".blurb h2", props: { x: 100 } },
    { el: "#page-2", props: { y: 100, start: "top 80%" } },
    { el: "#grids", props: { y: 50, start: "top 80%" } },
    { el: "#my-top h1", props: { x: -100, start: "top 85%" } },
    { el: "#my-bottom h1", props: { x: 100, start: "top 85%" } },
    { el: "footer", props: { y: 60, start: "top 95%" } }
  ];

  triggers.forEach(({ el, props }) => {
    const element = typeof el === "string" ? document.querySelector(el) : el;
    if (!element) return;

    gsap.from(element, {
      ...props,
      opacity: 0,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: props.start || "top 85%",
        once: true,
      },
    });
  });

  // Page 3 Specifics
  if (DOM.page3) {
    const picture = DOM.page3.querySelector("#t-f-div img");
    const textDiv = DOM.page3.querySelector("#t-s-div");
    const thirdBottom = document.querySelector("#third-bottom");

    if (picture) {
        gsap.fromTo(picture, { opacity: 0, scale: 0.9 }, {
            opacity: 1, scale: 1, duration: 1.5, ease: "power2.out",
            scrollTrigger: { trigger: picture, start: "top 80%", once: true }
        });
    }
    if (textDiv) {
        gsap.fromTo(textDiv, { opacity: 0, y: 60 }, {
            opacity: 1, y: 0, duration: 1.5, ease: "power2.out",
            scrollTrigger: { trigger: textDiv, start: "top 80%", once: true }
        });
    }
    if (thirdBottom) {
        gsap.fromTo(thirdBottom, { y: 40, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1.2, ease: "power2.out",
            scrollTrigger: { trigger: thirdBottom, start: "top 90%", once: true }
        });
    }
  }
}

// ===================================
// PAGE 2 EXPANDABLE CONTENT
// ===================================
function initPage2Expandable() {
  if (!DOM.page2Elements.length) return;
  
  DOM.page2Elements.forEach((element) => {
    const content = element.querySelector(".page2-content");
    const projectContent = element.querySelector(".project-content");
    const h2 = element.querySelector("h2");
    
    // Create triangle indicator
    const triangle = document.createElement('div');
    triangle.className = 'triangle-indicator';
    triangle.textContent = '▼';
    element.appendChild(triangle);

    // Partial map
    const partialMap = {
      "veoma studio": "./partials/veoma.html",
      "view from nowhere": "./partials/vfns.html",
      "doctors": "./partials/doctors.html",
      "nebesna": "./partials/nebesna.html",
      "anksioznost": "./partials/anksioznost.html"
    };

    let isAnimating = false;

    element.addEventListener("click", (e) => {
      if (e.target.closest('.page2-content')) return;
      e.preventDefault();
      
      if (isAnimating) return;
      isAnimating = true;

      const isActive = element.classList.contains("active");

      if (isActive) {
        // CLOSE
        triangle.style.transform = 'rotate(0deg)';
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut",
          onComplete: () => {
            element.classList.remove("active");
            projectContent.innerHTML = "";
            isAnimating = false;
            ScrollTrigger.refresh();
          }
        });
      } else {
        // OPEN
        const key = h2.textContent.trim();
        if (!partialMap[key]) { isAnimating = false; return; }

        fetch(partialMap[key])
          .then(r => r.text())
          .then(html => {
            projectContent.innerHTML = html;
            element.classList.add("active");
            triangle.style.transform = 'rotate(180deg)';
            
            // Get height naturally
            gsap.set(content, { height: "auto", opacity: 1 });
            const h = content.offsetHeight;
            gsap.set(content, { height: 0, opacity: 0 });

            gsap.to(content, {
              height: h,
              opacity: 1,
              duration: 0.45,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(content, { height: "auto" });
                isAnimating = false;
                ScrollTrigger.refresh();
              }
            });
          })
          .catch(() => isAnimating = false);
      }
    });
  });
}

// ===================================
// MENU HANDLER
// ===================================
function initMenuLinkHandlers() {
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('.menu-link[href^="#"]');
    if (!link) return;

    e.preventDefault();
    const toggle = document.getElementById('menu-toggle');
    if (toggle) toggle.checked = false;

    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    
    if (target) {
        if (typeof lenis !== 'undefined') lenis.stop();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.disable();

        const headerOffset = document.querySelector('header')?.offsetHeight || 0;
        const targetTop = target.offsetTop - headerOffset - 20;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        setTimeout(() => {
            if (typeof lenis !== 'undefined') lenis.start();
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.enable();
                ScrollTrigger.refresh();
            }
        }, 800);
    }
  });
}

// ===================================
// BOOTSTRAP
// ===================================
function startAnimations() {
  DOM.init();
  initPage2Animations();
  initImageHoverEffects();
  initLoadAnimations();
  initChromeScroll();
  initPage2Expandable();
  initMenuLinkHandlers();
  initIntersectionObserver();

  // Defer heavy layout calculations until next frame
  requestAnimationFrame(() => {
      initScrollAnimations();
      ScrollTrigger.refresh();
  });
}

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      if (DOM.miniCircle) {
        DOM.miniCircle.style.display = window.innerWidth <= 1024 ? "none" : "flex";
      }
    }, 200);
}, { passive: true });

if (typeof isLowEnd !== 'undefined' && isLowEnd) {
  gsap.globalTimeline.timeScale(1.2);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAnimations);
} else {
  startAnimations();
}