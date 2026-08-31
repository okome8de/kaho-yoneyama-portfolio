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

  // Click-to-enlarge lightbox for portfolio images only — excludes the
  // About profile photo and every external "View site" / "View Instagram"
  // link. Images sharing a data-gallery value can be browsed with
  // prev/next inside the lightbox; images without one open alone.
  var lightboxImgs = document.querySelectorAll(
    [
      ".project-card--featured .project-media .placeholder-box img",
      "#case-study .media-row .placeholder-box img",
      ".design-card:not(.design-card--banners) .placeholder-box img",
      ".design-card--banners .banner-item img"
    ].join(", ")
  );

  var lightbox = document.getElementById("lightbox");

  if (lightboxImgs.length && lightbox) {
    var lightboxImage = lightbox.querySelector(".lightbox-image");
    var lightboxClose = lightbox.querySelector(".lightbox-close");
    var lightboxPrev = lightbox.querySelector(".lightbox-prev");
    var lightboxNext = lightbox.querySelector(".lightbox-next");
    var lightboxCounter = lightbox.querySelector(".lightbox-counter");
    var lastFocused = null;
    var currentGallery = [];
    var currentIndex = 0;

    var galleries = {};
    lightboxImgs.forEach(function (img) {
      var key = img.getAttribute("data-gallery");
      if (!key) return;
      if (!galleries[key]) galleries[key] = [];
      galleries[key].push(img);
    });

    var onKeydown = function (event) {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showRelative(-1);
      } else if (event.key === "ArrowRight") {
        showRelative(1);
      }
    };

    function showImage(index) {
      currentIndex = index;
      var img = currentGallery[currentIndex];
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || "";

      var multi = currentGallery.length > 1;
      lightboxPrev.hidden = !multi;
      lightboxNext.hidden = !multi;
      lightboxCounter.hidden = !multi;
      if (multi) {
        lightboxCounter.textContent = (currentIndex + 1) + " / " + currentGallery.length;
      }
    }

    function showRelative(delta) {
      if (currentGallery.length < 2) return;
      showImage((currentIndex + delta + currentGallery.length) % currentGallery.length);
    }

    function openLightbox(img) {
      lastFocused = document.activeElement;
      var key = img.getAttribute("data-gallery");
      currentGallery = key && galleries[key] ? galleries[key] : [img];
      showImage(currentGallery.indexOf(img));
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      lightboxClose.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.src = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    lightboxImgs.forEach(function (img) {
      img.classList.add("lightbox-trigger");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.alt || "画像") + "を拡大表示");

      img.addEventListener("click", function () {
        openLightbox(img);
      });

      img.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(img);
        }
      });
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", function () {
      showRelative(-1);
    });
    lightboxNext.addEventListener("click", function () {
      showRelative(1);
    });
  }
});
