/* ===================================
   SKILL-CARDS.JS
   Tilt + flip interaction for the .skill-card competency cards
   (home screen "Services" grid and the Services page — shared).

   - Mouse: 3D tilt toward the cursor (RAF-throttled, no transition)
   - Click: flip with a direction-aware Y rotation (springs home)
   - Keyboard: Enter / Space flips the focused card
   - Touch: the tap's click event flips; no tilt needed
   =================================== */
(function () {
  "use strict";

  var TILT_MAX = 6;
  var SPRING = "cubic-bezier(0.34,1.56,0.64,1)";
  var EASE_OUT = "cubic-bezier(0.23,1,0.32,1)";

  document.querySelectorAll(".skill-card-wrap").forEach(function (wrap) {
    var card = wrap.querySelector(".skill-card");
    if (!card) return;

    var isFlipped = false;
    var animating = false;
    var tiltEnabled = true;
    var lastX = 0;
    var lastY = 0;
    var tiltRaf = null;

    /* ── Tilt on mousemove (RAF-throttled, no transition) ── */
    wrap.addEventListener("mousemove", function (e) {
      var rect = wrap.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      lastX = (e.clientX - cx) / (rect.width / 2);
      lastY = (e.clientY - cy) / (rect.height / 2);

      if (animating || !tiltEnabled) return;
      if (tiltRaf) return;

      tiltRaf = requestAnimationFrame(function () {
        tiltRaf = null;
        var rotX = -lastY * TILT_MAX;
        var rotY = lastX * TILT_MAX;

        card.style.transition = "none";
        if (!isFlipped) {
          card.style.transform =
            "rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
        } else {
          card.style.transform =
            "rotateY(180deg) rotateX(" +
            -rotX +
            "deg) rotateY(" +
            -rotY +
            "deg)";
        }
      });
    });

    /* ── Spring back on mouse leave ── */
    wrap.addEventListener("mouseleave", function () {
      if (animating) return;
      if (tiltRaf) {
        cancelAnimationFrame(tiltRaf);
        tiltRaf = null;
      }
      tiltEnabled = true;
      card.style.transition = "transform 0.7s " + SPRING;
      card.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";
    });

    /* ── Flip on click (left/right only) ── */
    wrap.addEventListener("click", function (e) {
      if (animating) return;
      animating = true;

      /* Cancel any pending tilt */
      if (tiltRaf) {
        cancelAnimationFrame(tiltRaf);
        tiltRaf = null;
      }

      /* Instant snap to neutral, no transition */
      card.style.transition = "none";
      card.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";

      /* Flip on Y-axis, direction from cursor side */
      var flipDir = lastX >= 0 ? 1 : -1;
      var midRot = !isFlipped
        ? "rotateY(" + flipDir * 90 + "deg)"
        : "rotateY(" + (180 - flipDir * 90) + "deg)";

      card.style.transition = "transform 0.3s " + EASE_OUT;
      card.style.transform = midRot;

      setTimeout(function () {
        isFlipped = !isFlipped;
        card.classList.toggle("is-flipped", isFlipped);

        card.style.transition = "transform 0.35s " + SPRING;
        card.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";

        setTimeout(function () {
          animating = false;
          tiltEnabled = false;
        }, 360);
      }, 300);
    });

    /* ── Keyboard support ── */
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        lastX = 0.5;
        lastY = 0;
        wrap.click();
      }
    });
  });
})();
