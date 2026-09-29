(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Loading screen: black overlay + logo + bottom progress line, shown on
  // entry and hidden once the page has loaded (with a small minimum
  // display time so it doesn't just flash on fast/cached loads).
  function runPreloader() {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    document.documentElement.classList.add("preloading");
    var minDelay = reduced ? 0 : 900;
    var start = Date.now();
    var hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      var wait = Math.max(0, minDelay - (Date.now() - start));
      setTimeout(function () {
        pre.classList.add("is-hidden");
        document.documentElement.classList.remove("preloading");
        var done = false;
        function finish() {
          if (done) return;
          done = true;
          pre.setAttribute("hidden", "");
        }
        pre.addEventListener("transitionend", finish, { once: true });
        setTimeout(finish, 800);
      }, wait);
    }
    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide);
      setTimeout(hide, 4000);
    }
  }
  runPreloader();

  // Hero entrance ladder (MOT-01/02): stagger comes from data-delay,
  // applied here at runtime rather than as inline style="" in the markup.
  function runHero() {
    var heroRise = document.querySelectorAll(".hero .rise");
    heroRise.forEach(function (el) {
      var delay = reduced ? 0 : parseInt(el.getAttribute("data-delay") || "0", 10);
      el.style.setProperty("--d", delay + "ms");
      requestAnimationFrame(function () {
        el.classList.add("is-in");
      });
    });
  }

  // Scroll-reveal for repeated groups (services, stats, cta band), 50ms stagger via CSS --d.
  function runReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduced) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      runHero();
      runReveal();
    });
  } else {
    runHero();
    runReveal();
  }
})();
