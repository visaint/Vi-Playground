/* 404 hero carousel — swipe / drag / arrow keys to cycle the
   second headline; auto-advances every 3 s.  Same interaction
   model as the homepage hero-carousel.js. */
(function () {
    "use strict";

    var TITLES = [
        ["404", "Error"],
        ["Wrong", "Page"],
        ["Lost", "Zone"],
        ["Dead", "End"],
        ["Nothing", "Here"],
        ["Go", "Back"],
        ["Oops", "Broken"],
        ["Missing", "Link"],
        ["Invalid", "Route"],
        ["Empty", "Void"],
    ];

    var heroHead = document.querySelector("#hero-head h1");
    var mainHead = document.querySelector("#main-head h1");
    if (!heroHead || !mainHead) return;

    var THRESHOLD = 48;
    var AXIS_LOCK = 6;
    var MAX_FOLLOW = 140;
    var EXIT_MS = 180;
    var ENTER_MS = 200;
    var AUTO_MS = 3000;

    var heads = [heroHead, mainHead];
    var index = 0;

    var fitSpan = document.createElement("span");
    fitSpan.style.cssText =
        "position:fixed;left:-9999px;top:0;visibility:hidden;white-space:nowrap;pointer-events:none;";
    fitSpan.style.fontFamily = getComputedStyle(heroHead).fontFamily;
    document.body.appendChild(fitSpan);
    var activePointer = null;
    var dragging = false;
    var animating = false;
    var startX = 0;
    var startY = 0;
    var dx = 0;
    var autoTimer = null;

    function setTitle(i) {
        index = (i + TITLES.length) % TITLES.length;
        heroHead.textContent = TITLES[index][0];
        mainHead.textContent = TITLES[index][1];
        fitTitles();
    }

    function fitTitles() {
        if (window.innerWidth < 768) {
            for (var i = 0; i < heads.length; i++) heads[i].style.fontSize = "";
            var base = parseFloat(getComputedStyle(heroHead).fontSize);
            if (!(base > 0)) return;
            var maxW = 0;
            for (var i = 0; i < heads.length; i++) {
                fitSpan.textContent = heads[i].textContent;
                fitSpan.style.fontSize = base + "px";
                var w = fitSpan.offsetWidth;
                if (w > maxW) maxW = w;
            }
            var avail = heroHead.clientWidth;
            if (maxW > avail) {
                var px = Math.floor((avail * base) / maxW * 100) / 100;
                for (var i = 0; i < heads.length; i++) {
                    heads[i].style.fontSize = px + "px";
                }
            }
            return;
        }
        for (var i = 0; i < heads.length; i++) {
            var el = heads[i];
            el.style.fontSize = "";
            for (var pass = 0; pass < 4; pass++) {
                if (el.scrollWidth <= el.clientWidth + 1) break;
                var cs = getComputedStyle(el);
                var pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
                var usable = el.clientWidth - pad;
                var contentW = el.scrollWidth - pad;
                if (contentW <= usable) break;
                var base = parseFloat(cs.fontSize);
                el.style.fontSize =
                    Math.floor((base * usable) / contentW * 100) / 100 + "px";
            }
        }
    }

    function setTransform(x) {
        for (var i = 0; i < heads.length; i++) {
            heads[i].style.transform = x;
        }
    }

    function setTransition(on) {
        for (var i = 0; i < heads.length; i++) {
            heads[i].classList.toggle("hero-carousel-anim", on);
        }
    }

    function go(dir) {
        if (animating) return;
        animating = true;
        restartAuto();
        var outX = dir === 1 ? "translateX(-100%)" : "translateX(100%)";
        var inX = dir === 1 ? "translateX(100%)" : "translateX(-100%)";

        setTransition(true);
        setTransform(outX);
        setTimeout(function () {
            setTitle(index + dir);
            setTransition(false);
            setTransform(inX);
            void heroHead.offsetWidth;
            setTransition(true);
            setTransform("translateX(0)");
            setTimeout(function () {
                setTransition(false);
                setTransform("");
                animating = false;
            }, ENTER_MS);
        }, EXIT_MS);
    }

    function restartAuto() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = setInterval(function () {
            if (activePointer === null) go(1);
        }, AUTO_MS);
    }

    function reset() {
        setTransition(true);
        setTransform("translateX(0)");
        setTimeout(function () {
            setTransition(false);
            setTransform("");
        }, 200);
    }

    function cleanup() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        document.documentElement.classList.remove("hero-carousel-dragging");
        activePointer = null;
        dragging = false;
        dx = 0;
    }

    function onDown(e) {
        if (animating || activePointer !== null) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        activePointer = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onCancel);
    }

    function onMove(e) {
        if (e.pointerId !== activePointer) return;
        var moveX = e.clientX - startX;
        var moveY = e.clientY - startY;
        if (!dragging) {
            if (Math.abs(moveX) < AXIS_LOCK) return;
            if (Math.abs(moveX) < Math.abs(moveY)) return;
            dragging = true;
            document.documentElement.classList.add("hero-carousel-dragging");
        }
        dx = Math.max(-MAX_FOLLOW, Math.min(MAX_FOLLOW, moveX));
        setTransform("translateX(" + dx + "px)");
    }

    function onUp(e) {
        if (e.pointerId !== activePointer) return;
        var shouldGo = dragging && Math.abs(dx) >= THRESHOLD;
        var dir = dx < 0 ? 1 : -1;
        var hadOffset = dx !== 0;
        cleanup();
        if (shouldGo) go(dir);
        else if (hadOffset) reset();
    }

    function onCancel(e) {
        if (e.pointerId !== activePointer) return;
        var hadOffset = dx !== 0;
        cleanup();
        if (hadOffset) reset();
    }

    heroHead.addEventListener("pointerdown", onDown);
    mainHead.addEventListener("pointerdown", onDown);

    for (var i = 0; i < heads.length; i++) {
        heads[i].addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                go(1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(-1);
            }
        });
    }

    setTitle(0);
    restartAuto();
    window.addEventListener("resize", fitTitles);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(fitTitles);
    }
})();
