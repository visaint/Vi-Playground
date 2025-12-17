// ===================================
// SKILLS DRAG
// ===================================
function initSkillsDrag() {
  if (typeof Draggable === "undefined") return;

  const container = document.getElementById("skills");
  const inner = document.getElementById("skil");
  if (!container || !inner) return;

  inner.style.animation = "none";
  inner.style.webkitAnimation = "none";
  gsap.set(inner, { x: 0 });

  function computeBounds() {
    const minX = Math.min(container.clientWidth - inner.scrollWidth, 0);
    return { minX, maxX: 0 };
  }

  let bounds = computeBounds();
  if (bounds.minX === 0) {
    inner.style.touchAction = "auto";
    return;
  }

  const existing = Draggable.get(inner);
  if (existing) existing.kill();

  let autoTween = null;

  const draggable = Draggable.create(inner, {
    type: "x",
    bounds: { minX: bounds.minX, maxX: bounds.maxX },
    edgeResistance: 0.8,
    inertia: false,
    allowContextMenu: true,
    onPress() {
      inner.style.cursor = "grabbing";
      if (autoTween) autoTween.pause();
    },
    onRelease() {
      inner.style.cursor = "grab";
      if (autoTween) setTimeout(() => autoTween && autoTween.play(), 60);
    },
  })[0];

  inner.style.cursor = "grab";
  inner.style.userSelect = "none";
  inner.style.touchAction = "pan-y";

  const updateAutoScroll = () => {
    if (autoTween) autoTween.kill();
    const distance = inner.scrollWidth - container.clientWidth;
    if (distance <= 0) return;
    const duration = Math.max(10, distance / 34);
    autoTween = gsap.to(inner, {
      x: -distance,
      duration,
      ease: "none",
      repeat: -1,
      onRepeat: () => gsap.set(inner, { x: 0 }),
    });
  };

  updateAutoScroll();

  let resizeTO;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        bounds = computeBounds();
        if (bounds.minX === 0) {
          draggable?.applyBounds({ minX: 0, maxX: 0 });
          gsap.to(inner, { x: 0, duration: 0.3 });
          autoTween?.kill();
          autoTween = null;
        } else {
          draggable?.applyBounds(bounds);
          updateAutoScroll();
        }
      }, 120);
    },
    { passive: true },
  );
}

// ===================================
// PAGE 2 ANIMATIONS
// ===================================
function initPage2Animations() {
  document.querySelectorAll(".page2-ele").forEach((element) => {
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
  // Find all chrome scroll containers (both original ID and new class)
  const containers = [
    document.querySelector("#chrome-scroll"),
    ...document.querySelectorAll(".chrome-scroll-section")
  ].filter(Boolean);
  
  if (!containers.length) return;

  // Map to track each container's state
  const chromeScrollInstances = new Map();
  
  // Initialize each container
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

    // Update all chrome scroll instances
    chromeScrollInstances.forEach(({ items, state }) => {
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        const raw = clamp(1 - distance / (vh * 0.6), 0, 1);

        const s = state.get(el);
        const smooth = 0.12; // Reduced for smoother, more responsive animation

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
  const miniCircle = document.querySelector("#move-circle");
  if (!miniCircle) return;

  document.querySelectorAll(".page2-ele").forEach((element) => {
    const image = element.querySelector("img");
    if (!image) return;

    gsap.set(image, { xPercent: -50, yPercent: -25, opacity: 0 });

    element.addEventListener("mouseenter", () => {
      gsap.to(image, { opacity: 1, duration: 0.3, ease: "power1.out" });
      gsap.to(miniCircle, { scale: 2, opacity: 0.9, duration: 0.3 });
      miniCircle.innerHTML = "<h4>VIEW</h4>";
      miniCircle.classList.add("glow");
    });

    let mouseMoveTimeout;
    element.addEventListener("mousemove", (event) => {
      if (mouseMoveTimeout) return;
      mouseMoveTimeout = setTimeout(() => {
        const bounds = element.getBoundingClientRect();
        gsap.to(image, {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          rotation: clamp(event.movementX * 0.5, -15, 15),
          duration: 0.6,
          ease: "power2.out",
        });
        mouseMoveTimeout = null;
      }, 16);
    });

    element.addEventListener("mouseleave", () => {
      gsap.to(image, { opacity: 0, duration: 0.3, ease: "power1.out" });
      gsap.to(miniCircle, { scale: 1, opacity: 1, duration: 0.3 });
      miniCircle.innerHTML = "";
      miniCircle.classList.remove("glow");
    });
  });
}

// ===================================
// INITIAL PAGE LOAD ANIMATIONS
// ===================================
function initLoadAnimations() {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay: 0.1 });

  document.querySelector("#logo") &&
    tl.from("#logo", { y: 40, opacity: 0, duration: 0.5 });

  if (window.innerWidth > 600) {
    document.querySelector("#nav-inner-ul") &&
      tl.from("#nav-inner-ul", { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");
  } else {
    document.querySelector("#extra") &&
      tl.from("#extra", { y: 40, opacity: 0, duration: 0.5 }, "-=0.3");
  }

  document.querySelector("#hero-head h1") &&
    tl.from("#hero-head h1", { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.2");
  document.querySelector("#main-head h1") &&
    tl.from("#main-head h1", { y: "30vw", opacity: 0, duration: 0.6 }, "-=0.4");
  document.querySelector("#mini h6") &&
    tl.from("#mini h6", { y: -40, opacity: 0, duration: 0.4 }, "-=0.3");

  const midElements = document.querySelectorAll(".mid h5");
  midElements.length &&
    tl.from(
      midElements,
      { y: -40, opacity: 0, duration: 0.4, stagger: 0.1 },
      "-=0.2",
    );

  document.querySelector("#first-bottom") &&
    tl.from("#first-bottom", { opacity: 0, y: 20, duration: 0.3 }, "-=0.2");
}






// ===================================
// SCROLL TRIGGER ANIMATIONS
// ===================================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".blurb h2", {
    x: 100,
    opacity: 0,
    duration: 7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".blurb h2",
      start: "top 95%",
      toggleActions: "play none none reverse",
    },
  });

  const page2 = document.querySelector("#page-2");
  if (page2) {
    gsap.from(page2, {
      y: 100,
      opacity: 0,
      duration: 5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: page2,
        start: "top 80%",
        end: "top 50%",
        toggleActions: "play none none reverse",
      },
    });
  }

  // Grids fade-in animation using direct GSAP
  const grids = document.querySelector(".grids");
  if (grids) {
    gsap.from(grids, {
      opacity: 0,
      y: 30,
      duration: 5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: grids,
        start: "top 90%",
        toggleActions: "play none none reverse"
      }
    });
  }

  gsap.from("#my-top h1", {
    x: -100,
    opacity: 0,
    duration: 2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#my-top h1",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.from("#my-bottom h1", {
    x: 100,
    opacity: 0,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#my-bottom h1",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });

  const page3 = document.querySelector("#page-3");
  if (page3) {
    const picture = document.querySelector("#t-f-div img");
    const textDiv = document.querySelector("#t-s-div");

    picture &&
      gsap.from(picture, {
        opacity: 0,
        scale: 0.9,
        duration: 3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: page3,
          start: "top 70%",
          end: "top 40%",
          toggleActions: "play none none reverse",
        },
      });

    textDiv &&
      gsap.from(textDiv, {
        opacity: 0,
        y: 80,
        duration: 3.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: page3,
          start: "top 70%",
          end: "top 40%",
          toggleActions: "play none none reverse",
        },
      });
    const thirdBottom = document.querySelector("#third-bottom");
    if (thirdBottom) {
      gsap.from(thirdBottom, {
        y: 40,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: thirdBottom,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }
  }
  // Footer animation - faster
  const footer = document.querySelector("footer");
  if (footer) {
    gsap.from(footer, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footer,
        start: "top 100%",
        toggleActions: "play none none reverse",
      },
    });
  }
}

function initPage2Expandable() {
  const elements = document.querySelectorAll(".page2-ele");
  
  // Cache container reference
  const container = document.querySelector("#expandable-container");
  
  // Use event delegation for better performance
  let activeElement = null;
  let activeTimeline = null;

  elements.forEach((element) => {
    if (!element.querySelector(".page2-content")) {
      const contentDiv = document.createElement("div");
      contentDiv.className = "page2-content";
      element.appendChild(contentDiv);
    }

    const content = element.querySelector(".page2-content");

    // Optimized hover effects with throttling
    let hoverTimeout;
    element.addEventListener("mouseenter", () => {
      if (!element.classList.contains("active") && element !== activeElement) {
        clearTimeout(hoverTimeout);
        gsap.to(element, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    });

    element.addEventListener("mouseleave", () => {
      if (!element.classList.contains("active") && element !== activeElement) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          gsap.to(element, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        }, 100);
      }
    });

    element.addEventListener("click", (e) => {
      const isActive = element.classList.contains("active");
      
      // If clicking inside content and element is active, close it
      if (e.target.closest(".page2-content") && isActive) {
        element.classList.remove("active");
        activeElement = null;
        
        // Kill any running timeline
        if (activeTimeline) {
          activeTimeline.kill();
        }
        
        // Create optimized timeline for closing
        activeTimeline = gsap.timeline()
          .to(element, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          })
          .to(content, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              content.style.display = "none";
              // Scroll container to center
              if (container) {
                container.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            },
          }, 0);
        return;
      }
      
      // Don't toggle if clicking inside content when not active
      if (e.target.closest(".page2-content")) return;

      // Close other active element if exists
      if (activeElement && activeElement !== element) {
        activeElement.classList.remove("active");
        const otherContent = activeElement.querySelector(".page2-content");
        
        if (activeTimeline) {
          activeTimeline.kill();
        }
        
        activeTimeline = gsap.timeline()
          .to(activeElement, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          })
          .to(otherContent, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              otherContent.style.display = "none";
            },
          }, 0);
      }

      if (isActive) {
        // Closing current element
        element.classList.remove("active");
        activeElement = null;
        
        if (activeTimeline) {
          activeTimeline.kill();
        }
        
        activeTimeline = gsap.timeline()
          .to(element, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          })
          .to(content, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              content.style.display = "none";
              // Scroll container to center
              if (container) {
                container.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            },
          }, 0);
      } else {
        // Opening element
        element.classList.add("active");
        activeElement = element;
        content.style.display = "block";
        
        if (activeTimeline) {
          activeTimeline.kill();
        }
        
        // Set initial states
        gsap.set(content, { height: "auto", opacity: 0 });
        const naturalHeight = content.offsetHeight;
        gsap.set(content, { height: 0 });
        
        activeTimeline = gsap.timeline()
          .to(element, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out"
          })
          .to(content, {
            height: naturalHeight,
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
            onComplete: () => {
              content.style.height = "auto";
            },
          }, 0);
      }
    });
  });
}

// ===================================
// WORD ROLLING ANIMATION
// ===================================
function initWordRolling() {
  const wordsCont = document.querySelector(".words");
  if (!wordsCont) return;

  const words = wordsCont.querySelectorAll("span");
  if (words.length === 0) return;

  let count = 0;
  setInterval(() => {
    const prevIndex = count;
    count = (count + 1) % words.length;
    words[prevIndex].classList.remove("active");
    words[prevIndex].classList.add("gone");
    words[count].classList.add("active");
    words[count].classList.remove("gone");
  }, 1000);
}

// ===================================
// INITIALIZATION
// ===================================
function startAnimations() {
  initPage2Animations();
  initImageHoverEffects();
  initCustomCursor();
  initSkillsDrag();
  initLoadAnimations();
  initChromeScroll();
  initPage2Expandable();
  initWordRolling();
  initMobileMenu();

  window.addEventListener("load", () => {
    initScrollAnimations();
    ScrollTrigger.refresh();
  });
}

let resizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      const circle = document.querySelector("#move-circle");
      if (circle)
        circle.style.display = window.innerWidth <= 1024 ? "none" : "flex";
    }, 250);
  },
  { passive: true },
);

if (isLowEnd) gsap.globalTimeline.timeScale(1.2);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAnimations);
} else {
  startAnimations();
}
