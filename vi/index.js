// ===================================
// DETECT PROBLEMATIC BROWSERS
// ===================================
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isArc = navigator.userAgent.includes("Arc");
const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

// ===================================
// CONDITIONAL LENIS INITIALIZATION
// ===================================
let lenis;

// Only use Lenis on Chrome/Edge - disable on Safari/Arc/Firefox
if (!isSafari && !isArc && !isFirefox) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
    autoRaf: true, // Let Lenis handle RAF automatically
  });

  // Sync with ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
} else {
  // For Safari/Arc/Firefox: Use native scroll with polished CSS
  console.log("Using native scroll for better compatibility");

  // Update ScrollTrigger on native scroll
  window.addEventListener(
    "scroll",
    () => {
      ScrollTrigger.update();
    },
    { passive: true },
  );
}

// ===================================
// SKILLS DRAG (GSAP Draggable)
// ===================================
function initSkillsDrag() {
  if (typeof Draggable === "undefined") return;

  const container = document.getElementById("skills");
  const inner = document.getElementById("skil");
  if (!container || !inner) return;

  // Stop any CSS-driven slider animation so JS can control transforms
  inner.style.animation = "none";
  inner.style.webkitAnimation = "none";

  // ensure transform starting point
  gsap.set(inner, { x: 0 });

  function computeBounds() {
    const containerWidth = container.clientWidth;
    const innerWidth = inner.scrollWidth;
    const minX = Math.min(containerWidth - innerWidth, 0); // negative or 0
    const maxX = 0;
    return { minX, maxX };
  }

  let bounds = computeBounds();

  // If there's nothing to scroll, make sure it's centered and not draggable
  if (bounds.minX === 0) {
    inner.style.touchAction = "auto";
    return;
  }

  // Kill existing draggable if present
  const existing = Draggable.get(inner);
  if (existing) existing.kill();

  const draggable = Draggable.create(inner, {
    type: "x",
    bounds: { minX: bounds.minX, maxX: bounds.maxX },
    edgeResistance: 0.8,
    inertia: false, // InertiaPlugin is not included (paid); keep a simple drag
    allowContextMenu: true,
    onPress() {
      inner.style.cursor = "grabbing";
      if (autoTween) autoTween.pause();
    },
    onRelease() {
      inner.style.cursor = "grab";
      if (autoTween) autoTween.play();
    },
  })[0];

  // styling cursor
  inner.style.cursor = "grab";
  inner.style.userSelect = "none";
  inner.style.touchAction = "pan-y"; // allow vertical page scroll on touch

  // change cursor while dragging via pointer events for wider support
  inner.addEventListener(
    "pointerdown",
    () => {
      inner.style.cursor = "grabbing";
      if (autoTween) autoTween.pause();
    },
    { passive: true },
  );
  window.addEventListener(
    "pointerup",
    () => {
      inner.style.cursor = "grab";
      if (autoTween) {
        // small delay so accidental taps don't immediately resume
        setTimeout(() => autoTween && autoTween.play(), 60);
      }
    },
    { passive: true },
  );

  // Recompute bounds on resize
  let resizeTO;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        bounds = computeBounds();
        if (bounds.minX === 0) {
          // disable draggable and reset
          if (draggable) {
            draggable.applyBounds({ minX: 0, maxX: 0 });
            try {
              draggable.disable();
            } catch (e) {}
          }
          gsap.to(inner, { x: 0, duration: 0.3 });
          inner.style.cursor = "";
          // stop auto-scroll
          if (autoTween) {
            autoTween.kill();
            autoTween = null;
          }
        } else {
          if (draggable) {
            try {
              draggable.applyBounds({ minX: bounds.minX, maxX: bounds.maxX });
              draggable.enable();
            } catch (e) {}
          }
          inner.style.cursor = "grab";
          // restart auto-scroll with new bounds
          startAutoScroll();
        }
      }, 120);
    },
    { passive: true },
  );

  // Auto-scroll setup
  let autoTween = null;

  function startAutoScroll() {
    // Kill previous
    if (autoTween) {
      try {
        autoTween.kill();
      } catch (e) {}
      autoTween = null;
    }

    const distance = inner.scrollWidth - container.clientWidth;
    if (distance <= 0) return;

    // Match previous CSS speed: original used ~50s for ~1690px → ~34px/s
    const duration = Math.max(10, distance / 34);

    // Animate from current x to -distance, loop by resetting to 0 on repeat
    autoTween = gsap.to(inner, {
      x: -distance,
      duration: duration,
      ease: "none",
      repeat: -1,
      onRepeat() {
        gsap.set(inner, { x: 0 });
      },
    });
  }

  // Start auto-scroll initially
  startAutoScroll();
}

// ===================================
// PAGE 2 ELEMENT ANIMATIONS
// ===================================
function initPage2Animations() {
  const elements = document.querySelectorAll(".page2-ele");

  elements.forEach((element) => {
    const h1 = element.querySelector("h1");
    const h6 = element.querySelector("h6");

    if (!h1 || !h6) return;

    element.addEventListener("mouseenter", function () {
      gsap.to(h1, {
        x: "4vw",
        opacity: 0.7,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.to(h6, {
        opacity: 0.7,
        duration: 0.8,
        ease: "power2.out",
      });
    });

    element.addEventListener("mouseleave", function () {
      gsap.to(h1, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.to(h6, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
    });
  });
}

// ===================================
// CHROME SCROLL DEMO - JS fallback for animation-timeline
// ===================================
function initChromeScroll() {
  const container = document.querySelector("#chrome-scroll");
  if (!container) return;

  const items = Array.from(container.querySelectorAll(".text"));
  if (!items.length) return;
  // Smoothed per-element state to avoid jank — we'll lerp values toward targets
  container.style.position = container.style.position || "relative";
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

  let ticking = false;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function lerp(a, b, f) {
    return a + (b - a) * f;
  }

  function compute() {
    ticking = false;
    const vh = window.innerHeight;
    const viewportCenter = vh / 2;

    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elCenter - viewportCenter);

      const activationRange = vh * 0.6; // 60% of viewport
      const raw = clamp(1 - distance / activationRange, 0, 1);

      // easing helpers
      const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
      const easeInCubic = (t) => t * t * t;

      const easedExpo = clamp(easeOutExpo(raw), 0, 1);
      const easedQuart = clamp(easeOutQuart(raw), 0, 1);
      const easedQuartInv = clamp(easeOutQuart(1 - raw), 0, 1);
      const easedInCubic = clamp(easeInCubic(1 - raw), 0, 1);

      const s = state.get(el);
      const smooth = 0.18; // smoothing factor (0..1) — lower = snappier

      s.raw = lerp(s.raw, raw, smooth);
      s.easedExpo = lerp(s.easedExpo, easedExpo, smooth);
      s.easedQuart = lerp(s.easedQuart, easedQuart, smooth);
      s.easedQuartInv = lerp(s.easedQuartInv, easedQuartInv, smooth);
      s.easedInCubic = lerp(s.easedInCubic, easedInCubic, smooth);

      // write CSS vars (rounded for smaller strings)
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

      // blur: more centered = less blur
      const blur = (1 - s.easedExpo) * 8; // up to 8px
      el.style.setProperty("--chrome-blur", `${blur}px`);

      // raise z-index for centered elements so they overlap nicely
      el.style.zIndex = String(Math.round(s.easedExpo * 100) + 10);
    });
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(compute);
      ticking = true;
    }
  }

  function onResize() {
    requestAnimationFrame(compute);
  }

  // initial run
  compute();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
}

// ===================================
// IMAGE HOVER EFFECTS
// ===================================
function initImageHoverEffects() {
  const elements = document.querySelectorAll(".page2-ele");
  const miniCircle = document.querySelector("#move-circle");

  if (!miniCircle) return;

  elements.forEach((element) => {
    const image = element.querySelector("img");

    if (!image) return;

    // Set initial state
    gsap.set(image, {
      xPercent: -50,
      yPercent: -25,
      opacity: 0,
    });

    element.addEventListener("mouseenter", function () {
      gsap.to(image, {
        opacity: 1,
        duration: 0.3,
        ease: "power1.out",
      });

      // Make the expanded circle half as big as it used to be
      gsap.to(miniCircle, {
        scale: 2,
        opacity: 0.9,
        duration: 0.3,
      });

      miniCircle.innerHTML = "<h3>VIEW</h3>";
      miniCircle.style.mixBlendMode = "normal";
      // Add glow class to intensify radiance while hovering a card
      miniCircle.classList.add("glow");
    });

    // Throttle mousemove for better performance
    let mouseMoveTimeout;
    element.addEventListener("mousemove", function (event) {
      if (mouseMoveTimeout) return;

      mouseMoveTimeout = setTimeout(() => {
        const bounds = element.getBoundingClientRect();
        const relX = event.clientX - bounds.left;
        const relY = event.clientY - bounds.top;

        gsap.to(image, {
          x: relX,
          y: relY,
          rotation: gsap.utils.clamp(-15, 15, event.movementX * 0.5),
          duration: 0.6,
          ease: "power2.out",
        });

        mouseMoveTimeout = null;
      }, 16); // ~60fps
    });

    element.addEventListener("mouseleave", function () {
      gsap.to(image, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
      });

      gsap.to(miniCircle, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      });

      miniCircle.innerHTML = "";
      miniCircle.style.mixBlendMode = "normal";
      // Remove glow class on leave
      miniCircle.classList.remove("glow");
    });
  });
}

// ===================================
// CUSTOM CURSOR
// ===================================
function initCustomCursor() {
  const circle = document.querySelector("#move-circle");

  if (!circle) return;

  // Hide on mobile/tablet
  if (window.innerWidth <= 1024) {
    circle.style.display = "none";
    return;
  }

  gsap.set(circle, {
    xPercent: -70,
    yPercent: -70,
  });

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  // Anchor target when hovering .page2-ele (anchorActive toggles behavior)
  let anchorActive = false;
  let anchorX = 0;
  let anchorY = 0;

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    },
    { passive: true },
  );

  // Smooth cursor follow (supports optional anchoring toward element center)
  function updateCursor() {
    // if anchored, move target halfway between pointer and element center (50% closer to element)
    const targetX = anchorActive ? mouseX + (anchorX - mouseX) * 0.5 : mouseX;
    const targetY = anchorActive ? mouseY + (anchorY - mouseY) * 0.5 : mouseY;

    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    // Use GSAP to set x/y so GSAP's other transform animations (like scale)
    // are composed and not overwritten by a direct style transform assignment.
    gsap.set(circle, { x: currentX, y: currentY });

    requestAnimationFrame(updateCursor);
  }

  requestAnimationFrame(updateCursor);

  // --- Per-element cursor color + low-end device fallback ---
  try {
    const rootStyles = getComputedStyle(document.documentElement);
    const defaultRgb = (
      rootStyles.getPropertyValue("--pink-rgb") || "238,143,161"
    ).trim();
    const blueRgb = (
      rootStyles.getPropertyValue("--blue-rgb") || "4,77,166"
    ).trim();

    // Set default cursor rgb CSS var on the circle
    circle.style.setProperty("--cursor-rgb", defaultRgb);

    // Performance fallback: reduce glow on low-end machines
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      circle.style.setProperty("--cursor-glow-blur", "20px");
      circle.style.setProperty("--cursor-glow-size", "10rem");
      circle.style.setProperty("--cursor-glow-mid-alpha", "0.12");
      circle.style.setProperty("--cursor-glow-alpha", "0.7");
      // softer shadow for performance
      circle.style.setProperty(
        "--cursor-shadow-strong",
        `0 0 12px rgba(${defaultRgb},0.10), 0 0 28px rgba(${defaultRgb},0.06)`,
      );
    }

    // Helper to set cursor color (expects 'r,g,b')
    function setCursorRgb(rgb) {
      if (!rgb) return;
      circle.style.setProperty("--cursor-rgb", rgb.trim());
      // also update shadow var for consistent hue
      circle.style.setProperty(
        "--cursor-shadow-strong",
        `0 0 48px rgba(${rgb.trim()},0.28), 0 0 112px rgba(${rgb.trim()},0.22)`,
      );
    }

    // Attach hover listeners to common interactive elements
    const interactive = document.querySelectorAll(
      "a, button, .page2-ele, [data-cursor-color]",
    );
    interactive.forEach((el) => {
      el.addEventListener(
        "pointerenter",
        (e) => {
          // Priority: explicit dataset rgb (data-cursor-color="r,g,b")
          const ds = el.dataset && el.dataset.cursorColor;
          if (ds) {
            // allow passing hex (#rrggbb) OR csv rgb
            if (ds.indexOf(",") > -1) {
              setCursorRgb(ds);
              return;
            }
            // hex -> convert to rgb
            if (ds[0] === "#") {
              const hex = ds.substring(1);
              const bigint = parseInt(hex, 16);
              const r = (bigint >> 16) & 255;
              const g = (bigint >> 8) & 255;
              const b = bigint & 255;
              setCursorRgb(`${r},${g},${b}`);
              return;
            }
            // otherwise try to treat as CSS var name (e.g., --blue-rgb)
            const val = rootStyles.getPropertyValue(ds).trim();
            if (val) setCursorRgb(val);
          } else if (el.tagName === "A") {
            setCursorRgb(blueRgb);
          } else if (
            el.tagName === "BUTTON" ||
            el.classList.contains("page2-ele") ||
            el.closest(".page2-ele")
          ) {
            setCursorRgb(defaultRgb);
          }
        },
        { passive: true },
      );

      el.addEventListener(
        "pointerleave",
        () => {
          // revert to default
          circle.style.setProperty("--cursor-rgb", defaultRgb);
          circle.style.setProperty(
            "--cursor-shadow-strong",
            `0 0 48px rgba(${defaultRgb},0.22), 0 0 112px rgba(${defaultRgb},0.18)`,
          );
        },
        { passive: true },
      );
    });

    // Expand cursor into a border around .page2-ele elements (anchored toward element center)
    const page2Els = document.querySelectorAll(".page2-ele");
    page2Els.forEach((el) => {
      el.addEventListener(
        "pointerenter",
        (ev) => {
          // compute element center in viewport coordinates
          const rect = el.getBoundingClientRect();
          anchorX = rect.left + rect.width / 2;
          anchorY = rect.top + rect.height / 2;
          anchorActive = true;

          circle.classList.add("page2-border", "glow");
          // ensure inner dot is hidden when border is active
          circle.style.backgroundColor = "transparent";
        },
        { passive: true },
      );

      // keep anchor updated if the user moves pointer inside the element
      el.addEventListener(
        "pointermove",
        (ev) => {
          const rect = el.getBoundingClientRect();
          anchorX = rect.left + rect.width / 2;
          anchorY = rect.top + rect.height / 2;
        },
        { passive: true },
      );

      el.addEventListener(
        "pointerleave",
        () => {
          anchorActive = false;
          circle.classList.remove("page2-border", "glow");
          circle.style.backgroundColor = "";
        },
        { passive: true },
      );
    });
  } catch (e) {
    // non-fatal: if CSS vars aren't available, skip per-element color features
    // console.warn('Cursor color feature skipped', e);
  }
}

// ===================================
// INITIAL PAGE LOAD ANIMATIONS
// ===================================
function initLoadAnimations() {
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    delay: 0.1,
  });

  const logo = document.querySelector("#logo");
  if (logo) {
    tl.from(logo, {
      y: 40,
      opacity: 0,
      duration: 0.5,
    });
  }

  if (window.innerWidth > 600) {
    const menu = document.querySelector("#nav-inner-ul");
    if (menu) {
      tl.from(
        menu,
        {
          y: 40,
          opacity: 0,
          duration: 0.5,
        },
        "-=0.3",
      );
    }
  } else {
    const extra = document.querySelector("#extra");
    if (extra) {
      tl.from(
        extra,
        {
          y: 40,
          opacity: 0,
          duration: 0.5,
        },
        "-=0.3",
      );
    }
  }

  const heroH1 = document.querySelector("#hero-head h1");
  if (heroH1) {
    tl.from(
      heroH1,
      {
        y: "30vw",
        opacity: 0,
        duration: 0.6,
      },
      "-=0.2",
    );
  }

  const mainH1 = document.querySelector("#main-head h1");
  if (mainH1) {
    tl.from(
      mainH1,
      {
        y: "30vw",
        opacity: 0,
        duration: 0.6,
      },
      "-=0.4",
    );
  }

  const miniH6 = document.querySelector("#mini h6");
  if (miniH6) {
    tl.from(
      miniH6,
      {
        y: -40,
        opacity: 0,
        duration: 0.4,
      },
      "-=0.3",
    );
  }

  const midElements = document.querySelectorAll(".mid h3");
  if (midElements.length > 0) {
    tl.from(
      midElements,
      {
        y: -40,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
      },
      "-=0.2",
    );
  }

  const bottom = document.querySelector("#first-bottom");
  if (bottom) {
    tl.from(
      bottom,
      {
        opacity: 0,
        y: 20,
        duration: 0.5,
      },
      "-=0.2",
    );
  }
}

// ===================================
// SCROLL TRIGGER ANIMATIONS
// ===================================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Page 2 animation
  const page2 = document.querySelector("#page-2");
  if (page2) {
    gsap.from(page2, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: page2,
        start: "top 80%",
        end: "top 50%",
        toggleActions: "play none none reverse",
      },
    });
  }

  // Page 3 animations
  const page3 = document.querySelector("#page-3");
  const picture = document.querySelector("#t-f-div img");
  const textDiv = document.querySelector("#t-s-div");

  if (picture && page3) {
    gsap.from(picture, {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: page3,
        start: "top 70%",
        end: "top 40%",
        toggleActions: "play none none reverse",
      },
    });
  }

  if (textDiv && page3) {
    gsap.from(textDiv, {
      opacity: 0,
      y: 80,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: page3,
        start: "top 70%",
        end: "top 40%",
        toggleActions: "play none none reverse",
      },
    });
  }
}

// ===================================
// INITIALIZATION
// ===================================
function init() {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAnimations);
  } else {
    startAnimations();
  }
}

function startAnimations() {
  // Initialize all animations
  initPage2Animations();
  initImageHoverEffects();
  initCustomCursor();
  initSkillsDrag();
  initLoadAnimations();
  initChromeScroll();

  // ScrollTrigger animations after page load
  window.addEventListener("load", () => {
    initScrollAnimations();
    ScrollTrigger.refresh();
  });
}

// Start everything
init();

// ===================================
// RESIZE HANDLER
// ===================================
let resizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();

      // Re-check cursor visibility on resize
      const circle = document.querySelector("#move-circle");
      if (circle) {
        circle.style.display = window.innerWidth <= 1024 ? "none" : "flex";
      }
    }, 250);
  },
  { passive: true },
);

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Reduce animations on low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
  gsap.globalTimeline.timeScale(1.2); // Speed up animations slightly
}

// ===================================
// MOBILE MENU FUNCTIONALITY
// ===================================
function initMobileMenu() {
  const menuBtn = document.querySelector("#menu");
  const mobileSlide = document.querySelector("#mobile-slide");
  const closeBtn = document.querySelector("#close-menu-btn");
  const slideLinks = document.querySelectorAll("#slide-nav-menu li a");
  const navUl = document.querySelector("#nav-inner-ul");
  const menuIcon = menuBtn ? menuBtn.querySelector("i") : null;

  if (!menuBtn || !mobileSlide) return;

  function toggleMenu() {
    const isActive = mobileSlide.classList.contains("active");

    if (isActive) {
      mobileSlide.classList.remove("active");
      menuBtn.classList.remove("active");
      document.body.style.overflow = "auto";

      // Reset menu icon
      if (menuIcon) {
        menuIcon.className = "ri-add-line";
      }
    } else {
      mobileSlide.classList.add("active");
      menuBtn.classList.add("active");
      document.body.style.overflow = "hidden";

      // Animate menu icon to close
      if (menuIcon) {
        menuIcon.className = "ri-close-line";
      }
    }
  }

  function closeMenu() {
    mobileSlide.classList.remove("active");
    menuBtn.classList.remove("active");
    document.body.style.overflow = "auto";

    // Reset menu icon
    if (menuIcon) {
      menuIcon.className = "ri-add-line";
    }
  }

  menuBtn.addEventListener("click", toggleMenu);

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  slideLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();

      // Smooth scroll to section if it exists
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  mobileSlide.addEventListener("click", (e) => {
    if (e.target === mobileSlide) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileSlide.classList.contains("active")) {
      closeMenu();
    }
  });

  function handleResize() {
    if (window.innerWidth > 640) {
      closeMenu();
      if (navUl) {
        navUl.style.display = "flex";
      }
      if (menuBtn) {
        menuBtn.style.display = "none";
      }
    } else {
      if (navUl) {
        navUl.style.display = "none";
      }
      if (menuBtn) {
        menuBtn.style.display = "flex";
      }
    }
  }

  window.addEventListener("resize", handleResize);
  handleResize();
}

initMobileMenu();
