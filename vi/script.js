window.onload = () => {
  console.log("window.onload fired. All resources should be loaded.");

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;

  console.log("gsap:", gsap);
  console.log("ScrollTrigger:", ScrollTrigger);
  console.log("SplitText:", SplitText);

  if (typeof gsap === "undefined") {
    console.error("GSAP is not loaded. Cannot proceed with animations.");
    // Fallback: make elements visible if animations can't run
    document
      .querySelectorAll(
        ".hero-title, .hero-nav-item, .hero-text, .nav-bottom-center, .svg-container, .text-grid, .main-title, .wavelength-label",
      )
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
      });
    return;
  }

  if (ScrollTrigger && SplitText) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    console.log("GSAP plugins registered.");
  } else {
    console.warn(
      "ScrollTrigger or SplitText not found. Some animations may not work.",
    );
    // Ensure elements are visible if SplitText isn't available for initial animation
    document
      .querySelectorAll(
        ".hero-title, .hero-nav-item, .hero-text, .nav-bottom-center, .svg-container, .text-grid, .main-title, .wavelength-label",
      )
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
      });
  }

  const colorThemes = {
    original: [
      "#340B05",
      "#0358F7",
      "#5092C7",
      "#E1ECFE",
      "#FFD400",
      "#FA3D1D",
      "#FD02F5",
      "#FFC0FD",
    ],
    "blue-pink": [
      "#1E3A8A",
      "#3B82F6",
      "#A855F7",
      "#EC4899",
      "#F472B6",
      "#F9A8D4",
      "#FBCFE8",
      "#FDF2F8",
    ],
    "blue-orange": [
      "#1E40AF",
      "#3B82F6",
      "#60A5FA",
      "#FFFFFF",
      "#FED7AA",
      "#FB923C",
      "#EA580C",
      "#9A3412",
    ],
    sunset: [
      "#FEF3C7",
      "#FCD34D",
      "#F59E0B",
      "#D97706",
      "#B45309",
      "#92400E",
      "#78350F",
      "#451A03",
    ],
    purple: [
      "#F3E8FF",
      "#E9D5FF",
      "#D8B4FE",
      "#C084FC",
      "#A855F7",
      "#9333EA",
      "#7C3AED",
      "#6B21B6",
    ],
    monochrome: [
      "#1A1A1A",
      "#404040",
      "#666666",
      "#999999",
      "#CCCCCC",
      "#E5E5E5",
      "#F5F5F5",
      "#FFFFFF",
    ],
    "pink-purple": [
      "#FDF2F8",
      "#FCE7F3",
      "#F9A8D4",
      "#F472B6",
      "#EC4899",
      "#BE185D",
      "#831843",
      "#500724",
    ],
    "blue-black": [
      "#000000",
      "#0F172A",
      "#1E293B",
      "#334155",
      "#475569",
      "#64748B",
      "#94A3B8",
      "#CBD5E1",
    ],
    "beige-black": [
      "#FEF3C7",
      "#F59E0B",
      "#D97706",
      "#92400E",
      "#451A03",
      "#1C1917",
      "#0C0A09",
      "#000000",
    ],
  };

  const darkThemes = ["blue-black", "beige-black", "monochrome"];
  let currentTheme = "original";
  let blurEnabled = true;
  let soundEnabled = false;

  const audioFiles = {
    whoosh: new Audio("https://assets.codepen.io/7558/whoosh-fx-001.mp3"),
    glitch: new Audio("https://assets.codepen.io/7558/glitch-fx-001.mp3"),
    reverb: new Audio("https://assets.codepen.io/7558/click-reverb-001.mp3"),
  };

  Object.values(audioFiles).forEach((sound) => {
    sound.volume = 0.3;
  });

  function playSound(soundName) {
    if (soundEnabled && audioFiles[soundName]) {
      audioFiles[soundName].currentTime = 0;
      audioFiles[soundName].play().catch(() => {});
    }
  }

  function blendColors(color1, color2, percentage) {
    percentage = Math.max(0, Math.min(1, percentage));
    const hexToRgb = (hex) => {
      const bigint = Number.parseInt(hex.slice(1), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };
    const rgbToHex = (rgb) =>
      "#" +
      ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2])
        .toString(16)
        .slice(1);
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = Math.round(rgb1[0] * (1 - percentage) + rgb2[0] * percentage);
    const g = Math.round(rgb1[1] * (1 - percentage) + rgb2[1] * percentage);
    const b = Math.round(rgb1[2] * (1 - percentage) + rgb2[2] * percentage);
    return rgbToHex([r, g, b]);
  }

  function updateColors(theme) {
    const colors = colorThemes[theme];
    if (!colors) return;

    const isDarkTheme = darkThemes.includes(theme);
    document.documentElement.style.setProperty(
      "--color-bg",
      isDarkTheme ? "#1a1a1a" : "#f5f5f5",
    );
    document.documentElement.style.setProperty(
      "--color-text",
      isDarkTheme ? "#ffffff" : "#333",
    );
    document.documentElement.style.setProperty(
      "--color-text-light",
      isDarkTheme ? "#cccccc" : "#666",
    );
    document.documentElement.style.setProperty(
      "--color-text-lighter",
      isDarkTheme ? "#999999" : "#999",
    );

    document
      .querySelectorAll(".main-title, .wavelength-label")
      .forEach((el) => {
        el.style.color = isDarkTheme ? "#FFFFFF" : "#333333";
      });

    const emailLink = document.querySelector(".email-link");
    if (emailLink) {
      emailLink.style.setProperty(
        "--bg-color",
        isDarkTheme ? "#FFFFFF" : "#333333",
      );
      emailLink.style.setProperty(
        "--hover-color",
        isDarkTheme ? "#333333" : "#f5f5f5",
      );
    }

    document.documentElement.style.setProperty("--grad-color-1", colors[0]);
    document.documentElement.style.setProperty("--grad-color-2", colors[1]);
    document.documentElement.style.setProperty("--grad-color-3", colors[4]);
    document.documentElement.style.setProperty("--grad-color-4", colors[5]);
    document.documentElement.style.setProperty("--grad-color-5", colors[6]);
    document.documentElement.style.setProperty("--grad-color-6", colors[2]);

    updateGradients(theme);
    updateTitleGradient(colors);
  }

  function updateTitleGradient(colors) {
    document.documentElement.style.setProperty(
      "--grad-1",
      colors[0] || "#340B05",
    );
    document.documentElement.style.setProperty(
      "--grad-2",
      colors[1] || "#0358F7",
    );
    document.documentElement.style.setProperty(
      "--grad-3",
      colors[4] || "#FFD400",
    );
    document.documentElement.style.setProperty(
      "--grad-4",
      colors[5] || "#FA3D1D",
    );
    document.documentElement.style.setProperty(
      "--grad-5",
      colors[6] || "#FD02F5",
    );
  }

  let rainbowAnimationTimeline;

  function createRainbowAnimation() {
    const heroTitle = document.querySelector(".hero-title");
    const chars = heroTitle.querySelectorAll(".char");
    const themeColors = colorThemes[currentTheme] || colorThemes.original;
    const defaultTextColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-text")
      .trim();

    const waveLength = 6;
    const fadeLength = 3;
    const totalAnimationRange = chars.length + waveLength + fadeLength;

    if (rainbowAnimationTimeline) {
      rainbowAnimationTimeline.kill();
    }
    gsap.killTweensOf(chars); // Kill any existing tweens on chars

    gsap.set(chars, {
      color: defaultTextColor,
      opacity: 1,
      filter: "blur(0px)",
      x: 0,
    });

    rainbowAnimationTimeline = gsap.timeline({ repeat: 0, ease: "none" });

    rainbowAnimationTimeline.to(
      { x: 0 },
      {
        x: totalAnimationRange,
        duration: 2.5,
        onUpdate: function () {
          const wavePosition = this.targets()[0].x;
          chars.forEach((char, index) => {
            const charRelativePosition = wavePosition - index;
            let colorToApply = defaultTextColor;

            if (
              charRelativePosition >= 0 &&
              charRelativePosition < totalAnimationRange
            ) {
              if (charRelativePosition < fadeLength) {
                const progress = charRelativePosition / fadeLength;
                colorToApply = blendColors(
                  defaultTextColor,
                  themeColors[0],
                  progress,
                );
              } else if (
                charRelativePosition >= fadeLength &&
                charRelativePosition < fadeLength + waveLength
              ) {
                const waveProgress =
                  (charRelativePosition - fadeLength) / waveLength;
                const colorIndex = Math.floor(
                  waveProgress * themeColors.length,
                );
                colorToApply =
                  themeColors[Math.min(themeColors.length - 1, colorIndex)];
              } else if (
                charRelativePosition >= fadeLength + waveLength &&
                charRelativePosition < fadeLength + waveLength + fadeLength
              ) {
                const progress =
                  (charRelativePosition - (fadeLength + waveLength)) /
                  fadeLength;
                colorToApply = blendColors(
                  themeColors[themeColors.length - 1],
                  defaultTextColor,
                  progress,
                );
              }
            }
            // OPTIMIZATION: Directly set style instead of creating new tweens
            char.style.color = colorToApply;
          });
        },
      },
    );
  }

  function toggleBlur() {
    const svgGroup = document.querySelector('g[clip-path="url(#clip)"]');
    const blurBtn = document.querySelector(".blur-btn");
    playSound("whoosh");

    if (blurEnabled) {
      svgGroup.removeAttribute("filter");
      blurBtn.textContent = "Blur On";
      blurEnabled = false;
    } else {
      svgGroup.setAttribute("filter", "url(#blur)");
      blurBtn.textContent = "Blur Off";
      blurEnabled = true;
    }
  }

  function updateGradients(theme) {
    const colors = colorThemes[theme];
    for (let i = 0; i < 9; i++) {
      const gradient = document.getElementById(`grad${i}`);
      if (gradient && colors) {
        gradient.querySelectorAll("stop").forEach((stop, idx) => {
          if (colors[idx]) stop.setAttribute("stop-color", colors[idx]);
          else if (colors[colors.length - 1])
            stop.setAttribute("stop-color", colors[colors.length - 1]);
        });
      }
    }
  }

  function generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 40) + 60;
    const lightness = Math.floor(Math.random() * 50) + 30;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  function randomizeColors() {
    playSound("glitch");
    const randomColors = Array.from({ length: 8 }, () => generateRandomColor());

    for (let i = 0; i < 9; i++) {
      const gradient = document.getElementById(`grad${i}`);
      if (gradient && randomColors) {
        gradient.querySelectorAll("stop").forEach((stop, idx) => {
          if (randomColors[idx])
            stop.setAttribute("stop-color", randomColors[idx]);
          else if (randomColors[randomColors.length - 1])
            stop.setAttribute(
              "stop-color",
              randomColors[randomColors.length - 1],
            );
        });
      }
    }

    document.documentElement.style.setProperty(
      "--grad-color-1",
      randomColors[0],
    );
    document.documentElement.style.setProperty(
      "--grad-color-2",
      randomColors[1],
    );
    document.documentElement.style.setProperty(
      "--grad-color-3",
      randomColors[4],
    );
    document.documentElement.style.setProperty(
      "--grad-color-4",
      randomColors[5],
    );
    document.documentElement.style.setProperty(
      "--grad-color-5",
      randomColors[6],
    );
    document.documentElement.style.setProperty(
      "--grad-color-6",
      randomColors[2],
    );

    updateTitleGradient(randomColors);

    // Temporarily set currentTheme to 'randomized' for createRainbowAnimation
    const tempTheme = currentTheme;
    currentTheme = "randomized";
    setTimeout(() => {
      createRainbowAnimation();
      currentTheme = tempTheme; // Revert to previous theme after animation setup
    }, 100);

    gsap.to(".svg-container", {
      scale: 1.02,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    });
  }

  function toggleSound() {
    const waveLine = document.querySelector(".wave-line");
    if (soundEnabled) {
      waveLine.classList.remove("wave-animated");
      soundEnabled = false;
    } else {
      waveLine.classList.add("wave-animated");
      soundEnabled = true;
    }
  }

  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".color-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentTheme = this.getAttribute("data-theme");
      updateColors(currentTheme);
      setTimeout(() => {
        createRainbowAnimation();
      }, 100);
      gsap.to(".svg-container", {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    });
  });

  document.querySelector(".blur-btn").addEventListener("click", toggleBlur);
  document
    .querySelector(".randomize-btn")
    .addEventListener("click", randomizeColors);
  document
    .querySelector(".sound-toggle")
    .addEventListener("click", toggleSound);

  const heroNavItems = document.querySelectorAll(".hero-nav-item");
  const heroNav = document.querySelector(".hero-nav");
  const gradientOverlay = document.querySelector(".gradient-overlay");
  const navGradients = [
    "radial-gradient(circle, #340B05 0%, #0358F7 50%, transparent 100%)",
    "radial-gradient(circle, #0358F7 0%, #5092C7 50%, transparent 100%)",
    "radial-gradient(circle, #FFD400 0%, #FA3D1D 50%, transparent 100%)",
    "radial-gradient(circle, #5092C7 0%, #E1ECFE 50%, transparent 100%)",
    "radial-gradient(circle, #FA3D1D 0%, #FD02F5 50%, transparent 100%)",
    "radial-gradient(circle, #E1ECFE 0%, #FFD400 50%, transparent 100%)",
    "radial-gradient(circle, #FD02F5 0%, #340B05 50%, transparent 100%)",
    "radial-gradient(circle, #FFD400 0%, #5092C7 50%, transparent 100%)",
    "radial-gradient(circle, #5092C7 0%, #FD02F5 50%, transparent 100%)",
  ];

  // =========================================================================
  // NEW CODE FOR POPUP AND PERSISTENT HOVER EFFECT
  // =========================================================================
  let activeNavItem = null;
  const popupContainer = document.querySelector(".popup-container");
  const popupContent = document.querySelector(".popup-content");

  function showPopup(item, gradient) {
    const content = item.getAttribute("data-content");
    if (!content) return;

    // Set content and gradient for the popup/overlay
    popupContent.textContent = content;
    gradientOverlay.style.background = gradient;
    gradientOverlay.style.opacity = "0.3";

    popupContainer.classList.add("visible");
    // Ensure pointer-events are auto on the container for click-outside to work
    // (This should be set in CSS with the .visible class, but we set it here for clarity)
    popupContainer.style.pointerEvents = "auto";
    activeNavItem = item;
  }

  function hidePopup() {
    popupContainer.classList.remove("visible");
    activeNavItem = null;

    // Clear the gradient overlay once the click outside is processed
    // Use a slight delay to match the common CSS transition time
    setTimeout(() => {
      if (!activeNavItem) {
        gradientOverlay.style.opacity = "0";
      }
    }, 300);
  }

  // Modified mouseleave handler: only clear the effect if no item is actively clicked
  heroNav.addEventListener("mouseleave", () => {
    if (!activeNavItem) {
      heroNavItems.forEach((navItem) => {
        navItem.style.opacity = "1";
        navItem.classList.remove("active");
      });
      gradientOverlay.style.opacity = "0";
    }
  });

  heroNavItems.forEach((item, index) => {
    const itemGradient = navGradients[index];

    // Mouseenter (Hover) Logic
    item.addEventListener("mouseenter", () => {
      if (item === activeNavItem) return; // Do nothing if hovering over the already active item

      playSound("reverb");

      // Show the hover effect gradient and opacity change
      gradientOverlay.style.background = itemGradient;
      gradientOverlay.style.opacity = "0.3";

      // Opacity management: Only affect items that are not actively clicked
      heroNavItems.forEach((navItem, navIndex) => {
        if (navItem !== activeNavItem) {
          // Don't affect the clicked item's persistent state
          navItem.classList.remove("active");
          const distance = Math.abs(index - navIndex);
          let opacity = 1;
          if (navIndex === index) {
            opacity = 1;
            navItem.classList.add("active");
          } else if (distance === 1) {
            opacity = 0.6;
          } else if (distance === 2) {
            opacity = 0.4;
          } else if (distance === 3) {
            opacity = 0.3;
          } else if (distance >= 4) {
            opacity = 0.2;
          }
          navItem.style.opacity = opacity.toString();
        }
      });

      // **Hover Popup Behavior:** Show a temporary popup on hover if no item is clicked
      if (!activeNavItem && popupContainer && popupContent) {
        popupContent.textContent = item.getAttribute("data-content") || "";
        popupContainer.classList.add("visible");
        // Important: Set pointer-events to none so the popup doesn't block clicks on nav items
        popupContainer.style.pointerEvents = "none";
      }
    });

    // Mouseleave (Hover) Logic
    item.addEventListener("mouseleave", () => {
      if (!activeNavItem && popupContainer) {
        // Hide popup only on mouseleave if no item is clicked
        popupContainer.classList.remove("visible");
        // Restore pointer-events to auto or default
        popupContainer.style.pointerEvents = "auto";
      }
    });

    // Click Logic: Toggle the persistent state
    item.addEventListener("click", () => {
      if (activeNavItem === item) {
        // Case 1: Clicking the active item -> Deactivate (close popup)
        hidePopup();
        // Restore all nav items opacity to default
        heroNavItems.forEach((navItem) => {
          navItem.style.opacity = "1";
          navItem.classList.remove("active");
        });
      } else {
        // Case 2: Clicking a new item -> Activate (show persistent popup)

        // 1. Dim all other items and activate the current one
        heroNavItems.forEach((navItem) => {
          navItem.style.opacity = "0.2"; // Dim all others
          navItem.classList.remove("active");
        });

        item.style.opacity = "1"; // Set clicked item to full opacity
        item.classList.add("active");

        // 2. Show persistent popup and set active state
        showPopup(item, itemGradient);
      }
    });
  });

  // Global click handler to dismiss the popup on click outside
  document.addEventListener("click", (event) => {
    if (activeNavItem) {
      const isClickInsidePopup =
        popupContainer && popupContainer.contains(event.target);
      const isClickOnNavItem = event.target.closest(".hero-nav-item");

      // Dismiss only if the click is outside the popup AND not on any nav item
      if (!isClickInsidePopup && !isClickOnNavItem) {
        hidePopup();
        // Restore all nav items opacity to default
        heroNavItems.forEach((navItem) => {
          navItem.style.opacity = "1";
          navItem.classList.remove("active");
        });
      }
    }
  });
  // =========================================================================

  // Function to check if it's a mobile view
  function isMobile() {
    return window.innerWidth <= 768; // Matches the media query breakpoint
  }

  document.fonts.ready.then(() => {
    updateColors(currentTheme);

    // --- Initial Hero Animations ---
    const heroTl = gsap.timeline({ delay: 0.5 });

    // Title animation
    const heroTitle = document.querySelector(".hero-title");
    let titleSplit;
    let titleElementsToAnimate;
    let titleStagger;

    if (isMobile()) {
      titleSplit = SplitText.create(heroTitle, { type: "words" });
      titleElementsToAnimate = titleSplit.words;
      titleStagger = 0.1; // Stagger for words
      console.log("Hero Title SplitText words:", titleSplit.words.length);
    } else {
      titleSplit = SplitText.create(heroTitle, {
        type: "chars",
        charsClass: "char",
      });
      titleElementsToAnimate = titleSplit.chars;
      titleStagger = 0.03; // Stagger for chars
      console.log("Hero Title SplitText chars:", titleSplit.chars.length);
    }

    gsap.set(titleElementsToAnimate, {
      opacity: 0,
      filter: "blur(8px)",
      x: -20,
    }); // Hide elements after splitting
    heroTl.to(
      titleElementsToAnimate,
      {
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        duration: 0.8,
        stagger: titleStagger,
        ease: "power2.out",
      },
      0,
    );

    // Nav items animation
    const navItems = document.querySelectorAll(".hero-nav-item");
    console.log("Hero Nav Items found:", navItems.length);
    navItems.forEach((item) => {
      const split = SplitText.create(item, { type: "lines" }); // Split each nav item
      gsap.set(split.lines, { opacity: 0, y: 30, filter: "blur(8px)" }); // Hide lines after splitting
      heroTl.to(
        split.lines,
        {
          autoAlpha: 1,
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
        },
        0.4,
      );
    });

    // Text content animation
    const textElements = document.querySelectorAll(".hero-text");
    console.log("Hero Text Elements found:", textElements.length);
    textElements.forEach((textEl, index) => {
      const textSplit = SplitText.create(textEl, { type: "lines" });
      console.log(
        `Hero Text ${index} SplitText lines:`,
        textSplit.lines.length,
      );
      gsap.set(textSplit.lines, {
        opacity: 0,
        y: 50,
        clipPath: "inset(0 0 100% 0)",
      }); // Hide lines after splitting
      heroTl.to(
        textSplit.lines,
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        },
        0.8 + index * 0.2,
      );
    });

    // Scroll hint continuous blur animation
    const scrollHint = document.querySelector(".nav-bottom-center");
    const scrollHintSplit = SplitText.create(scrollHint, { type: "chars" });
    console.log("Scroll Hint SplitText chars:", scrollHintSplit.chars.length);
    gsap.set(scrollHintSplit.chars, { opacity: 0, filter: "blur(3px)" }); // Hide chars after splitting
    gsap.to(scrollHintSplit.chars, {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.6,
      stagger: { each: 0.08, repeat: -1, yoyo: true },
      ease: "sine.inOut",
      delay: 1,
    });
    gsap.to(scrollHintSplit.chars, {
      filter: "blur(1px)",
      duration: 0.8,
      stagger: { each: 0.08, repeat: -1, yoyo: true },
      ease: "sine.inOut",
      delay: 1.04,
    });

    // --- Scroll-triggered animations ---
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".animation-section",
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1,
        onEnter: () => console.log("ScrollTrigger: Animation section entered!"),
        onLeave: () => console.log("ScrollTrigger: Animation section left!"),
        onUpdate: (self) =>
          console.log("ScrollTrigger progress:", self.progress.toFixed(2)),
      },
    });

    // OPTIMIZATION: Create SplitText instances for wavelength labels and main title once
    const wavelengthLabels = document.querySelectorAll(".wavelength-label");
    const mainTitle = document.querySelector(".main-title");

    const allSplitLines = [];
    wavelengthLabels.forEach((label, index) => {
      const split = SplitText.create(label, { type: "lines" });
      console.log(
        `Wavelength Label ${index} SplitText lines:`,
        split.lines.length,
      );
      gsap.set(split.lines, { opacity: 0, y: 30, filter: "blur(8px)" }); // Hide lines after splitting
      allSplitLines.push(...split.lines);
    });
    const mainTitleSplit = SplitText.create(mainTitle, { type: "lines" });
    console.log("Main Title SplitText lines:", mainTitleSplit.lines.length);
    gsap.set(mainTitleSplit.lines, { opacity: 0, y: 30, filter: "blur(8px)" }); // Hide lines after splitting
    allSplitLines.push(...mainTitleSplit.lines);

    console.log(
      "Total SplitText lines for scroll animation:",
      allSplitLines.length,
    );

    // Ensure parent containers are visible and interactive before animating their children
    tl.to(".svg-container", { autoAlpha: 1, duration: 0.01 }, 0)
      .to(".text-grid", { autoAlpha: 1, duration: 0.01 }, 0) // Make text-grid visible immediately
      .to(".main-title", { autoAlpha: 1, duration: 0.01 }, 0) // Make main-title visible immediately
      .to(
        ".svg-container",
        {
          transform: "scaleY(0.05) translateY(-30px)",
          duration: 0.3,
          ease: "power2.out",
        },
        0,
      )
      .to(
        ".svg-container",
        {
          transform: "scaleY(1) translateY(0px)",
          duration: 1.2,
          ease: "power2.out",
        },
        0.3,
      )
      .to(
        ".nav-bottom-left, .nav-bottom-right, .nav-bottom-center",
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        0.2,
      )
      .to(
        allSplitLines,
        {
          duration: 0.8,
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.08,
          ease: "power2.out",
        },
        0.9,
      )
      .to(".level-5", { y: "-25vh", duration: 0.8, ease: "power2.out" }, 0.9)
      .to(".level-4", { y: "-20vh", duration: 0.8, ease: "power2.out" }, 0.9)
      .to(".level-3", { y: "-15vh", duration: 0.8, ease: "power2.out" }, 0.9)
      .to(".level-2", { y: "-10vh", duration: 0.8, ease: "power2.out" }, 0.9)
      .to(".level-1", { y: "-5vh", duration: 0.8, ease: "power2.out" }, 0.9);
  });

  if (ScrollTrigger) {
    window.addEventListener("resize", () => ScrollTrigger.refresh());
    console.log("Resize listener for ScrollTrigger.refresh() added.");
  } else {
    console.warn(
      "ScrollTrigger not available for resize listener. Skipping ScrollTrigger.refresh().",
    );
  }
};
