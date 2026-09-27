(() => {
  "use strict";

  /* ---------------------------------------------------------
     Theme — the site is dark-only now (set once via
     data-theme="dark" on <html> and baked into the CSS
     variables). No toggle, no light mode, nothing to switch.
  --------------------------------------------------------- */

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  function closeNav(){
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  Array.from(navLinks.querySelectorAll("a")).forEach(link => {
    link.addEventListener("click", closeNav);
  });

  /* ---------------------------------------------------------
     Smooth-scroll for every in-page link, handled entirely in
     JS so navigation never depends on native hash jumps.
  --------------------------------------------------------- */
  function scrollToId(id){
    const target = id === "top" ? document.body : document.getElementById(id);
    if (!target) return;
    if (id === "top"){
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  Array.from(document.querySelectorAll('a[href^="#"]')).forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      e.preventDefault();
      scrollToId(id);
    });
  });

  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn){
    backToTopBtn.addEventListener("click", () => scrollToId("top"));
  }

  /* ---------------------------------------------------------
     Scrollspy — highlight active nav link as sections pass,
     and slide a single indicator underneath it
  --------------------------------------------------------- */
  const navAnchors = Array.from(document.querySelectorAll("[data-nav]"));
  const navIndicator = document.getElementById("navIndicator");
  const spySections = navAnchors
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function updateIndicator(){
    if (!navIndicator || !navLinks) return;
    const activeLink = navAnchors.find(a => a.classList.contains("active"));
    if (!activeLink || navIndicator.offsetParent === null){
      navIndicator.style.opacity = "0";
      return;
    }
    const containerRect = navLinks.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - containerRect.left;
    navIndicator.style.width = linkRect.width + "px";
    navIndicator.style.transform = "translateX(" + left + "px)";
    navIndicator.classList.add("is-ready");
    navIndicator.style.opacity = "1";
  }

  if ("IntersectionObserver" in window && spySections.length){
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = "#" + entry.target.id;
        const link = navAnchors.find(a => a.getAttribute("href") === id);
        if (!link) return;
        if (entry.isIntersecting){
          navAnchors.forEach(a => a.classList.remove("active"));
          link.classList.add("active");
          updateIndicator();
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });

    spySections.forEach(sec => spyObserver.observe(sec));
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateIndicator, 120);
  });

  /* ---------------------------------------------------------
     EVRA screen data — shared by the hero mini-phone and the
     featured project showcase
  --------------------------------------------------------- */
  const EVRA_SCREENS = [
    { src: "assets/img/evra-welcome.webp",     label: "Welcome screen" },
    { src: "assets/img/evra-register.webp",    label: "Registration" },
    { src: "assets/img/evra-login.webp",       label: "Login" },
    { src: "assets/img/evra-preference.webp",  label: "Style preferences" },
    { src: "assets/img/evra-home.webp",        label: "Home feed" },
    { src: "assets/img/evra-search.webp",      label: "Search & categories" },
    { src: "assets/img/evra-footwear.webp",    label: "Category browsing" },
    { src: "assets/img/evra-product.webp",     label: "Product details" },
    { src: "assets/img/evra-cart.webp",        label: "Shopping cart" },
    { src: "assets/img/evra-checkout.webp",    label: "Checkout" },
    { src: "assets/img/evra-payment.webp",     label: "Payment" },
    { src: "assets/img/evra-profile.webp",     label: "Profile" },
  ];

  /* ---------------------------------------------------------
     Featured project showcase — "coverflow" style: the active
     screen sits centred and in full focus, with the screens
     either side stacked behind it, dimmed and peeking out.
     Navigating slides everything smoothly into its new spot.
  --------------------------------------------------------- */
  const coverflow = document.getElementById("coverflow");
  const showcaseThumbs = document.getElementById("showcaseThumbs");
  const showcaseCaption = document.getElementById("showcaseCaption");
  const showcasePrev = document.getElementById("showcasePrev");
  const showcaseNext = document.getElementById("showcaseNext");

  let showcaseIndex = 0;
  let showcaseTimer = null;
  let cfSlides = [];

  function wrappedDelta(i){
    const n = EVRA_SCREENS.length;
    let d = i - showcaseIndex;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  function renderCoverflow(){
    cfSlides.forEach((slide, i) => {
      const d = wrappedDelta(i);
      const ad = Math.abs(d);
      let tx, scale, opacity, z, bright, pe;
      if (d === 0){ tx = 0; scale = 1; opacity = 1; z = 5; bright = 1; pe = "none"; }
      else if (ad === 1){ tx = d * 62; scale = 0.8; opacity = 0.55; z = 4; bright = 0.45; pe = "auto"; }
      else if (ad === 2){ tx = d * 100; scale = 0.64; opacity = 0.22; z = 3; bright = 0.35; pe = "auto"; }
      else { tx = (d > 0 ? 1 : -1) * 130; scale = 0.58; opacity = 0; z = 1; bright = 0.35; pe = "none"; }
      slide.style.transform = "translateX(-50%) translateX(" + tx + "%) scale(" + scale + ")";
      slide.style.opacity = String(opacity);
      slide.style.zIndex = String(z);
      slide.style.filter = "brightness(" + bright + ")";
      slide.style.pointerEvents = pe;
      slide.classList.toggle("is-active", d === 0);
    });
    showcaseCaption.textContent = EVRA_SCREENS[showcaseIndex].label;
    if (showcaseThumbs){
      Array.from(showcaseThumbs.children).forEach((t, idx) => t.classList.toggle("active", idx === showcaseIndex));
    }
  }

  function goToShowcase(i, restart){
    showcaseIndex = (i + EVRA_SCREENS.length) % EVRA_SCREENS.length;
    renderCoverflow();
    if (restart) restartShowcaseTimer();
  }

  function restartShowcaseTimer(){
    if (showcaseTimer) clearInterval(showcaseTimer);
    showcaseTimer = setInterval(() => goToShowcase(showcaseIndex + 1, false), 3200);
  }

  if (coverflow){
    EVRA_SCREENS.forEach((screen, i) => {
      const slide = document.createElement("div");
      slide.className = "cf-slide";
      slide.setAttribute("role", "button");
      slide.setAttribute("aria-label", "Show " + screen.label);
      slide.innerHTML =
        '<div class="phone">' +
          '<div class="phone__notch"></div>' +
          '<div class="phone__screen"><img src="' + screen.src + '" alt="EVRA app — ' + screen.label + '" loading="lazy"></div>' +
        "</div>";
      slide.addEventListener("click", () => goToShowcase(i, true));
      coverflow.appendChild(slide);
      cfSlides.push(slide);
    });
  }

  if (showcaseThumbs){
    EVRA_SCREENS.forEach((screen, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", screen.label);
      if (i === 0) b.classList.add("active");
      const img = document.createElement("img");
      img.src = screen.src;
      img.alt = "";
      img.loading = "lazy";
      b.appendChild(img);
      b.addEventListener("click", () => goToShowcase(i, true));
      showcaseThumbs.appendChild(b);
    });
  }

  if (coverflow){
    renderCoverflow();
    restartShowcaseTimer();
  }

  if (showcasePrev) showcasePrev.addEventListener("click", () => goToShowcase(showcaseIndex - 1, true));
  if (showcaseNext) showcaseNext.addEventListener("click", () => goToShowcase(showcaseIndex + 1, true));

  /* ---------------------------------------------------------
     Project filters
  --------------------------------------------------------- */
  const filterBtns = Array.from(document.querySelectorAll(".filter"));
  const projectCards = Array.from(document.querySelectorAll(".pcard"));

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.filter;
      filterBtns.forEach(b => b.setAttribute("aria-selected", String(b === btn)));
      projectCards.forEach(card => {
        const show = target === "all" || card.dataset.cat === target;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------------------------------------------------------
     Copy email to clipboard + toast
  --------------------------------------------------------- */
  const toast = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message){
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  const copyEmailBtn = document.getElementById("copyEmail");
  if (copyEmailBtn){
    copyEmailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const email = "dvasant.1526@gmail.com";
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(email).then(() => showToast("Email copied to clipboard"));
      } else {
        showToast("Email: " + email);
      }
    });
  }

  /* ---------------------------------------------------------
     Nav background intensifies slightly once scrolled
  --------------------------------------------------------- */
  const nav = document.getElementById("nav");
  let lastScrolled = false;
  function handleScroll(){
    const scrolled = window.scrollY > 12;
    if (scrolled !== lastScrolled){
      nav.style.boxShadow = scrolled ? "0 8px 30px rgba(0,0,0,.25)" : "none";
      lastScrolled = scrolled;
    }
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ---------------------------------------------------------
     Scroll-triggered reveal — elements (including the hero
     copy/device, which slide in from the side) fade/slide
     into place the first time they enter the viewport.
  --------------------------------------------------------- */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)){
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------
     Experience timeline — a progress line grows down the
     track as you scroll, and each dot lights up once the
     line has "drawn" its way to it.
  --------------------------------------------------------- */
  const timelineEl = document.querySelector(".timeline");
  const timelineProgressEl = document.getElementById("timelineProgress");
  const timelineItems = Array.from(document.querySelectorAll(".tl__item"));

  if (timelineEl && timelineProgressEl && timelineItems.length){
    let tlTicking = false;

    function updateTimelineProgress(){
      const timelineRect = timelineEl.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // The line "draws" toward a point ~70% down the viewport, so it
      // grows smoothly as the section scrolls through view.
      const triggerY = viewportH * 0.7;
      let filled = triggerY - timelineRect.top;
      filled = Math.max(0, Math.min(filled, timelineRect.height));
      timelineProgressEl.style.height = filled + "px";

      timelineItems.forEach(item => {
        const card = item.querySelector(".tl__card");
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        const dotY = (cardRect.top - timelineRect.top) + 12; // dot's vertical centre
        item.classList.toggle("is-passed", filled >= dotY);
      });
    }

    function onTimelineScroll(){
      if (tlTicking) return;
      tlTicking = true;
      requestAnimationFrame(() => {
        updateTimelineProgress();
        tlTicking = false;
      });
    }

    window.addEventListener("scroll", onTimelineScroll, { passive: true });
    window.addEventListener("resize", onTimelineScroll);
    updateTimelineProgress();
  }

})();
