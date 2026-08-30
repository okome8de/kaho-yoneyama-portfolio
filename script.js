// Mobile navigation toggle only — no other behavior needed for this MVP.
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fade-in on scroll for cards and section content. Skipped entirely
  // under reduced motion, so nothing is ever hidden without a reveal.
  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(
      ".project-card, .design-card, #case-study .section-inner, #skills .section-inner, #about .section-inner"
    );

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  // Highlight the nav link for the section currently in view.
  var navLinks = nav.querySelectorAll('a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    var navSections = [];
    navLinks.forEach(function (link) {
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        navSections.push({ link: link, section: target });
      }
    });

    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (l) {
            l.classList.remove("is-active");
          });
          var match = navSections.filter(function (item) {
            return item.section === entry.target;
          })[0];
          if (match) {
            match.link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    navSections.forEach(function (item) {
      navObserver.observe(item.section);
    });
  }

  // Back-to-top button.
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.hidden = window.scrollY < 480;
    };
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
});
