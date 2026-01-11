// ===================================
// BROWSER DETECTION
// ===================================
const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

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
  if (typeof Lenis === "undefined") return;

  lenis = new Lenis({
    duration: 1.0, 
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
    autoRaf: true,
  });

  if (typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
  }

  if (typeof gsap !== "undefined") {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

// ===================================
// CUSTOM CURSOR (OPTIMIZED)
// ===================================
function initCustomCursor() {
  const circle = document.getElementById("move-circle");
  if (!circle) return;
  
  // Disable on touch devices immediately
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
    circle.style.display = "none";
    return;
  }
  
  circle.style.display = "flex";

  // PERFORMANCE: use quickSetter to bypass property parsing overhead
  const setX = gsap.quickSetter(circle, "x", "px");
  const setY = gsap.quickSetter(circle, "y", "px");

  // Initial center
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  
  let anchorActive = false;
  let anchorX = 0;
  let anchorY = 0;
  let rafId = null;

  // Center the cursor visually using transform once
  gsap.set(circle, { xPercent: -50, yPercent: -50 });

  const updateCursor = () => {
    const targetX = anchorActive ? mouseX + (anchorX - mouseX) * 0.5 : mouseX;
    const targetY = anchorActive ? mouseY + (anchorY - mouseY) * 0.5 : mouseY;
    
    // Lerp smoothing
    currentX += (targetX - currentX) * 0.14; 
    currentY += (targetY - currentY) * 0.14;
    
    setX(currentX);
    setY(currentY);
    
    // Stop loop if settled
    const dist = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
    if (dist < 0.1 && !anchorActive) {
      setX(targetX);
      setY(targetY);
      rafId = null;
    } else {
      rafId = requestAnimationFrame(updateCursor);
    }
  };

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(updateCursor);
  }, { passive: true });

  // Start loop
  rafId = requestAnimationFrame(updateCursor);

  // COLOR LOGIC
  try {
    const rootStyles = getComputedStyle(document.documentElement);
    const defaultRgb = (rootStyles.getPropertyValue("--pink-rgb") || "238,143,161").trim();
    const blueRgb = (rootStyles.getPropertyValue("--blue-rgb") || "4,77,166").trim();

    circle.style.setProperty("--cursor-rgb", defaultRgb);

    if (isLowEnd) {
       // Simplify low-end visuals
       circle.style.setProperty("--cursor-glow-blur", "20px");
       circle.style.setProperty("--cursor-glow-size", "10rem");
       circle.style.boxShadow = "none"; // Remove heavy shadows
    }

    const setCursorColor = (rgb) => {
        circle.style.setProperty("--cursor-rgb", rgb);
        if (!isLowEnd) {
             circle.style.setProperty("--cursor-shadow-strong", 
                `0 0 48px rgba(${rgb},0.28), 0 0 112px rgba(${rgb},0.22)`);
        }
    };

    // Event Delegation for hover effects to reduce listeners
    document.body.addEventListener("pointerover", (e) => {
        const target = e.target;
        
        // 1. Magnetic Elements (Page 2)
        const page2Ele = target.closest(".page2-ele");
        if (page2Ele) {
            if (!rafId) rafId = requestAnimationFrame(updateCursor);
            const rect = page2Ele.getBoundingClientRect();
            anchorX = rect.left + rect.width / 2;
            anchorY = rect.top + rect.height / 2;
            anchorActive = true;
            circle.classList.add("page2-border", "glow");
            circle.style.backgroundColor = "transparent";
            return;
        } 

        // 2. Color triggers
        const colorTrigger = target.closest("a, button, [data-cursor-color]");
        if (colorTrigger) {
            if (!rafId) rafId = requestAnimationFrame(updateCursor);
            
            const ds = colorTrigger.dataset?.cursorColor;
            if (ds) {
                if (ds.includes(",")) setCursorColor(ds);
                else if (ds.startsWith("#")) {
                    // Hex convert could be here, but simpler to rely on rgb vars
                    setCursorColor(defaultRgb); 
                } else {
                    const varColor = rootStyles.getPropertyValue(ds);
                    if(varColor) setCursorColor(varColor.trim());
                }
            } else if (colorTrigger.tagName === "A") {
                setCursorColor(blueRgb);
            } else {
                setCursorColor(defaultRgb);
            }
        }
    }, { passive: true });

    document.body.addEventListener("pointerout", (e) => {
        const target = e.target;
        if (target.closest(".page2-ele")) {
            anchorActive = false;
            circle.classList.remove("page2-border", "glow");
            circle.style.backgroundColor = "";
        }
        if (target.closest("a, button, [data-cursor-color]")) {
            circle.style.setProperty("--cursor-rgb", defaultRgb);
            if (!isLowEnd) {
                 circle.style.setProperty("--cursor-shadow-strong", 
                    `0 0 48px rgba(${defaultRgb},0.22), 0 0 112px rgba(${defaultRgb},0.18)`);
            }
        }
    }, { passive: true });

  } catch (e) { console.warn("Cursor Error", e); }
}

function initMenuRefreshBehavior() {
  const menuToggle = document.getElementById("menu-toggle");
  if (!menuToggle) return;

  const wasOpen = sessionStorage.getItem("menu_was_open") === "1";
  sessionStorage.removeItem("menu_was_open");

  if (wasOpen || menuToggle.checked) {
    menuToggle.checked = false;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    
    if (lenis?.scrollTo) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

    requestAnimationFrame(() => {
        if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    });
  }

  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("menu_was_open", menuToggle.checked ? "1" : "0");
  });
}

// ===================================
// GLOBAL INIT
// ===================================
function initGlobal() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  initLenis();
  initCustomCursor();
  initMenuRefreshBehavior();
  if (typeof gsap !== "undefined" && isLowEnd) gsap.globalTimeline.timeScale(1.2);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobal);
} else {
  initGlobal();
}