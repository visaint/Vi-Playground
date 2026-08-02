/* ===================================
   ANIM-LOADER.JS
   Loads Lenis / GSAP / ScrollTrigger + the app scripts without
   blocking first render (breaks the render-blocking script chain
   flagged by Lighthouse).

   On mobile (<768px or touch) the animation libraries are skipped
   entirely — the chrome-scroll effect, fade-ins, hero carousel and
   the checkbox-driven expandables are all pure CSS/JS and don't need
   GSAP. main.js already falls back gracefully when GSAP is missing.

   Usage:
     <script src="./anim-loader.js" data-main="./main.js"
             data-extra="./hero-carousel.js"></script>
   =================================== */
(function () {
  "use strict";

  var script = document.currentScript;
  var isMobile = window.innerWidth < 768 || "ontouchstart" in window;

  var CDN = {
    lenis:
      "https://unpkg.com/@studio-freight/lenis@1.0.36/dist/lenis.min.js",
    gsap: {
      src: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      integrity:
        "sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==",
    },
    scrollTrigger: {
      src: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      integrity:
        "sha512-onMTRKJBKz8M1TnqqDuGBlowlH0ohFzMXYRNebz+yOcc5TQr/zAKsthzhuv0hiyUKEiQEQXEynnXCvNTOk50dg==",
    },
  };

  function load(conf) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = typeof conf === "string" ? conf : conf.src;
      if (conf && conf.integrity) {
        s.integrity = conf.integrity;
        s.crossOrigin = "anonymous";
        s.referrerPolicy = "no-referrer";
      }
      s.onload = resolve;
      s.onerror = resolve; // keep booting even if a CDN fails
      document.body.appendChild(s);
    });
  }

  function boot() {
    var main = script && script.getAttribute("data-main");
    var extra = script && script.getAttribute("data-extra");
    if (main) {
      var m = document.createElement("script");
      m.src = main;
      document.body.appendChild(m);
    }
    if (extra) {
      var e = document.createElement("script");
      e.src = extra;
      e.async = true;
      document.body.appendChild(e);
    }
  }

  if (isMobile) {
    boot();
  } else {
    // Load Lenis + GSAP + ScrollTrigger concurrently, then boot the app
    // once all three are in (each has its own onerror fallback). This cuts
    // the critical path down from three sequential CDN round-trips to one.
    Promise.all([load(CDN.lenis), load(CDN.gsap), load(CDN.scrollTrigger)]).then(
      boot,
    );
  }
})();
