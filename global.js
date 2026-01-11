// ===================================
// BROWSER DETECTION
// ===================================
// Detect low-power devices (<= 4 cores) to disable heavy effects
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

function initLenis() {
  if (typeof Lenis === "undefined") {
    console.warn("Lenis not loaded");
    return;
  }

  lenis = new Lenis({
    duration: 1.0, 
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false, // Disabled on touch for native feel/performance
    touchMultiplier: 2,
    infinite: false,
    autoRaf: true,
  });

  if (typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Sync with GSAP Ticker to prevent layout jitter
  if (typeof gsap !== "undefined") {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    // Disable lag smoothing to keep scroll synced with visual updates
    gsap.ticker.lagSmoothing(0);
  }
}

// ===================================
// CUSTOM CURSOR (OPTIMIZED)
// ===================================
function initCustomCursor() {
  const circle = document.querySelector("#move-circle");
  
  // Early return if cursor element is missing
  if (!circle) {
    console.warn("Cursor element #move-circle not found");
    return;
  }
  
  // Optimization: Disable entirely on touch devices to save resources
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 1024) {
    circle.style.display = "none";
    return; // Stop execution here for mobile
  } else {
    circle.style.display = "flex";
  }
  
  if (typeof gsap === "undefined") {
    console.warn("GSAP not loaded for cursor");
    return;
  }

  gsap.set(circle, { xPercent: -50, yPercent: -50 });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let anchorActive = false;
  let anchorX = 0;
  let anchorY = 0;
  let rafId = null;

  // PERFORMANCE: Threshold to stop the animation loop
  const settleThreshold = 0.1;

  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // PERFORMANCE: Only restart the loop if it has stopped
    if (!rafId) {
      rafId = requestAnimationFrame(updateCursor);
    }
  };

  window.addEventListener("mousemove", onMouseMove, { passive: true });

  const updateCursor = () => {
    const targetX = anchorActive ? mouseX + (anchorX - mouseX) * 0.5 : mouseX;
    const targetY = anchorActive ? mouseY + (anchorY - mouseY) * 0.5 : mouseY;
    
    // Lerp smoothing (0.14 factor)
    currentX += (targetX - currentX) * 0.14; 
    currentY += (targetY - currentY) * 0.14;
    
    // PERFORMANCE: Calculate distance to target
    const dist = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);

    // PERFORMANCE: If settled and not anchored, stop the loop to save battery/CPU
    if (dist < settleThreshold && !anchorActive) {
      currentX = targetX;
      currentY = targetY;
      gsap.set(circle, { x: currentX, y: currentY });
      rafId = null; // Kill the loop
    } else {
      gsap.set(circle, { x: currentX, y: currentY });
      rafId = requestAnimationFrame(updateCursor);
    }
  };

  // Kickstart
  rafId = requestAnimationFrame(updateCursor);

  try {
    const rootStyles = getComputedStyle(document.documentElement);
    const defaultRgb = (rootStyles.getPropertyValue("--pink-rgb") || "238,143,161").trim();
    const blueRgb = (rootStyles.getPropertyValue("--blue-rgb") || "4,77,166").trim();

    circle.style.setProperty("--cursor-rgb", defaultRgb);

    // Apply reduced effects for low-end devices
    if (isLowEnd) {
      circle.style.setProperty("--cursor-glow-blur", "20px");
      circle.style.setProperty("--cursor-glow-size", "10rem");
      circle.style.setProperty("--cursor-glow-mid-alpha", "0.12");
      circle.style.setProperty("--cursor-glow-alpha", "0.7");
      circle.style.setProperty(
        "--cursor-shadow-strong",
        `0 0 12px rgba(${defaultRgb},0.10), 0 0 28px rgba(${defaultRgb},0.06)`,
      );
    }

    const setCursorRgb = (rgb) => {
      if (!rgb) return;
      const trimmed = rgb.trim();
      circle.style.setProperty("--cursor-rgb", trimmed);
      // Skip heavy shadow update on low-end
      if (!isLowEnd) {
        circle.style.setProperty(
          "--cursor-shadow-strong",
          `0 0 48px rgba(${trimmed},0.28), 0 0 112px rgba(${trimmed},0.22)`,
        );
      }
    };

    const resetCursor = () => {
      circle.style.setProperty("--cursor-rgb", defaultRgb);
      if (!isLowEnd) {
        circle.style.setProperty(
          "--cursor-shadow-strong",
          `0 0 48px rgba(${defaultRgb},0.22), 0 0 112px rgba(${defaultRgb},0.18)`,
        );
      }
    };

    // Event Delegation could be better here, but maintaining current logic for specific selectors
    const interactiveElements = document.querySelectorAll(
      "a, button, .page2-ele, [data-cursor-color]"
    );
    
    interactiveElements.forEach((el) => {
      el.addEventListener(
        "pointerenter",
        () => {
          // Restart loop on hover just in case it was idle
          if (!rafId) rafId = requestAnimationFrame(updateCursor);

          const ds = el.dataset?.cursorColor;
          if (ds) {
            if (ds.includes(",")) {
              setCursorRgb(ds);
            } else if (ds[0] === "#") {
              // Hex to RGB conversion
              const hex = ds.substring(1);
              const bigint = parseInt(hex, 16);
              setCursorRgb(
                `${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255}`,
              );
            } else {
              const cssVar = rootStyles.getPropertyValue(ds);
              if (cssVar) setCursorRgb(cssVar.trim());
            }
          } else if (el.tagName === "A") {
            setCursorRgb(blueRgb);
          } else {
            setCursorRgb(defaultRgb);
          }
        },
        { passive: true },
      );

      el.addEventListener("pointerleave", resetCursor, { passive: true });
    });

    // Page2 Magnetic Elements
    document.querySelectorAll(".page2-ele").forEach((el) => {
      el.addEventListener(
        "pointerenter",
        () => {
          if (!rafId) rafId = requestAnimationFrame(updateCursor);
          
          const rect = el.getBoundingClientRect();
          anchorX = rect.left + rect.width / 2;
          anchorY = rect.top + rect.height / 2;
          anchorActive = true;
          circle.classList.add("page2-border", "glow");
          circle.style.backgroundColor = "transparent";
        },
        { passive: true },
      );

      // No pointermove listener needed here as mouseX/Y are global

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
    console.error("Cursor initialization error:", e);
  }
}

function initMenuRefreshBehavior() {
  const menuToggle = document.getElementById("menu-toggle");
  if (!menuToggle) return;

  const wasOpen = (() => {
    try { return sessionStorage.getItem("menu_was_open") === "1"; } catch { return false; }
  })();

  try { sessionStorage.removeItem("menu_was_open"); } catch {}

  if (wasOpen || menuToggle.checked) {
    menuToggle.checked = false;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { immediate: true });
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
    } catch {}
  });
}

// ===================================
// GLOBAL INITIALIZATION
// ===================================
function initGlobal() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  initLenis();
  initCustomCursor();
  initMenuRefreshBehavior();

  // Speed up GSAP on low-end devices to hide potential frame drops
  if (typeof gsap !== "undefined" && isLowEnd) {
    gsap.globalTimeline.timeScale(1.2);
  }
}

// ===================================
// AUTO-INITIALIZE
// ===================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobal);
} else {
  initGlobal();
}

// Optimized Resize Handler
let globalResizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(globalResizeTimer);
    globalResizeTimer = setTimeout(() => {
      const circle = document.querySelector("#move-circle");
      if (circle) {
        // Use modern media query check instead of hardcoded width
        const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 1024;
        circle.style.display = isMobile ? "none" : "flex";
      }
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 250);
  },
  { passive: true },
);