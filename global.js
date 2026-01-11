// ===================================
// BROWSER DETECTION
// ===================================
const isLowEnd =
  navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

// ===================================
// UTILITIES
// ===================================
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, f) => a + (b - a) * f;

// ===================================
// LENIS INITIALIZATION
// ===================================
let lenis;

// global.js (Performance-Optimized Code)
function initLenis() {
    // Check if it's a desktop device (or a large tablet)
    const isDesktop = window.innerWidth > 1024;
    
    // Check for a non-touch screen (more robust)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Only initialize Lenis for devices that are *not* touch-based, 
    // or if you want it on large-screen touch devices, adjust the condition.
    if (!isTouchDevice || isDesktop) {
        if (typeof Lenis === "undefined") {
            console.warn("Lenis not loaded");
            return;
        }

        lenis = new Lenis({
            duration: 1.0, 
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false, // Keep false, as it won't run on touch screens anyway
            touchMultiplier: 2,
            infinite: false,
            autoRaf: true,
        });

        // Only bind to ScrollTrigger if it exists
        if (typeof ScrollTrigger !== "undefined") {
            lenis.on("scroll", ScrollTrigger.update);
        }

        // Bind Lenis to GSAP ticker for performance
        if (typeof gsap !== "undefined") {
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    } else {
        // OPTIONAL: Warn that Lenis is disabled for mobile
        console.log("Lenis disabled for mobile/touch device.");
    }
}


function initMenuRefreshBehavior() {
  const menuToggle = document.getElementById("menu-toggle");
  if (!menuToggle) return;

  const wasOpen = (() => {
    try {
      return sessionStorage.getItem("menu_was_open") === "1";
    } catch {
      return false;
    }
  })();

  try {
    sessionStorage.removeItem("menu_was_open");
  } catch {
    // ignore
  }

  if (wasOpen || menuToggle.checked) {
    menuToggle.checked = false;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (lenis && typeof lenis.scrollTo === "function") {
      try {
        lenis.scrollTo(0, { immediate: true });
      } catch {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    requestAnimationFrame(() => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    });
  }

  window.addEventListener("beforeunload", () => {
    try {
      sessionStorage.setItem("menu_was_open", menuToggle.checked ? "1" : "0");
    } catch {
      // ignore
    }
  });
}
// ===================================
// GLOBAL INITIALIZATION - CRITICAL
// ===================================
function initGlobalCritical() {
  // FIX: Disable browser's native scroll restoration immediately on load
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // This is a fast operation and can run now
  initMenuRefreshBehavior(); 
  
  // CONSOLIDATED: Performance optimization for low-end devices
  if (typeof gsap !== "undefined" && isLowEnd) {
    gsap.globalTimeline.timeScale(1.2);
  }
}

// ===================================
// GLOBAL INITIALIZATION - DEFERRED
// ===================================
function initGlobalDeferred() {
  // HEAVY OPERATIONS MOVED HERE: These can wait until all assets are loaded
  initLenis(); 
}

// ===================================
// AUTO-INITIALIZE ON DOM READY
// ===================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobalCritical);
} else {
  initGlobalCritical();
}

// ===================================
// AUTO-INITIALIZE ON WINDOW LOAD
// ===================================
// The `load` event fires after all external assets (images, etc.) are loaded,
// which is the ideal time for non-critical effects.
window.addEventListener("load", initGlobalDeferred);

// ===================================
// AUTO-INITIALIZE ON DOM READY
// ===================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobal);
} else {
  initGlobal();
}

// Handle resize for cursor visibility
let globalResizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(globalResizeTimer);
    globalResizeTimer = setTimeout(() => {
      const circle = document.querySelector("#move-circle");
      if (circle) {
        // Re-enable original visibility logic for the cursor
        circle.style.display = window.innerWidth <= 1024 ? "none" : "flex";
      }
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 250);
  },
  { passive: true },
);