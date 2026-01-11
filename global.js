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

function initLenis() {
  if (typeof Lenis === "undefined") {
    console.warn("Lenis not loaded");
    return;
  }

  lenis = new Lenis({
    duration: 1.0, // Reduced from 1.2 for more responsive feel
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
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
}

// ===================================
// CUSTOM CURSOR (RE-ENABLED)
// ===================================
function initCustomCursor() {
  const circle = document.querySelector("#move-circle");
  
  if (!circle) {
    console.warn("Cursor element #move-circle not found");
    return;
  }
  
  // Re-enable visibility logic
  if (window.innerWidth <= 1024) {
    circle.style.display = "none";
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

  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  window.addEventListener("mousemove", onMouseMove, { passive: true });

  const updateCursor = () => {
    const targetX = anchorActive ? mouseX + (anchorX - mouseX) * 0.5 : mouseX;
    const targetY = anchorActive ? mouseY + (anchorY - mouseY) * 0.5 : mouseY;
    
    // Set smoothing factor (e.g., 0.14 from your original file)
    currentX += (targetX - currentX) * 0.14; 
    currentY += (targetY - currentY) * 0.14;
    
    gsap.set(circle, { x: currentX, y: currentY });
    rafId = requestAnimationFrame(updateCursor);
  };

  rafId = requestAnimationFrame(updateCursor);

  try {
    const rootStyles = getComputedStyle(document.documentElement);
    const defaultRgb = (
      rootStyles.getPropertyValue("--pink-rgb") || "238,143,161"
    ).trim();
    const blueRgb = (
      rootStyles.getPropertyValue("--blue-rgb") || "4,77,166"
    ).trim();

    circle.style.setProperty("--cursor-rgb", defaultRgb);

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
      circle.style.setProperty(
        "--cursor-shadow-strong",
        `0 0 48px rgba(${trimmed},0.28), 0 0 112px rgba(${trimmed},0.22)`,
      );
    };

    const resetCursor = () => {
      circle.style.setProperty("--cursor-rgb", defaultRgb);
      circle.style.setProperty(
        "--cursor-shadow-strong",
        `0 0 48px rgba(${defaultRgb},0.22), 0 0 112px rgba(${defaultRgb},0.18)`,
      );
    };

    // Interactive elements cursor effects
    const interactiveElements = document.querySelectorAll(
      "a, button, .page2-ele, [data-cursor-color]"
    );
    
    interactiveElements.forEach((el) => {
      el.addEventListener(
        "pointerenter",
        () => {
          const ds = el.dataset?.cursorColor;
          if (ds) {
            // Logic to handle custom color based on dataset, hex, or CSS variable
            if (ds.includes(",")) {
              setCursorRgb(ds);
            } else if (ds[0] === "#") {
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
          } else if (
            el.tagName === "BUTTON" ||
            el.classList.contains("page2-ele")
          ) {
            setCursorRgb(defaultRgb);
          }
        },
        { passive: true },
      );

      el.addEventListener("pointerleave", resetCursor, { passive: true });
    });

    // Page2 elements special anchor effect
    document.querySelectorAll(".page2-ele").forEach((el) => {
      el.addEventListener(
        "pointerenter",
        () => {
          const rect = el.getBoundingClientRect();
          anchorX = rect.left + rect.width / 2;
          anchorY = rect.top + rect.height / 2;
          anchorActive = true;
          circle.classList.add("page2-border", "glow");
          circle.style.backgroundColor = "transparent";
        },
        { passive: true },
      );

      el.addEventListener(
        "pointermove",
        () => {
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
    console.error("Cursor initialization error:", e);
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
// GLOBAL INITIALIZATION
// ===================================
function initGlobal() {
  // FIX: Disable browser's native scroll restoration immediately on load
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  initLenis();
  initCustomCursor();
  initMenuRefreshBehavior();

  // CONSOLIDATED: Performance optimization for low-end devices moved from index.js
  if (typeof gsap !== "undefined" && isLowEnd) {
    gsap.globalTimeline.timeScale(1.2);
  }
}

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