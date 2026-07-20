const header = document.querySelector(".site-header");
const cursorLight = document.querySelector(".cursor-light");
const copyButton = document.querySelector("[data-copy-email]");
const email = "jhinresh@gmail.com";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const documentElement = document.documentElement;
const loader = document.querySelector("[data-loader]");
const loaderValue = document.querySelector("[data-loader-value]");
const loaderBar = document.querySelector("[data-loader-bar]");
const scrollProgress = document.querySelector("[data-scroll-progress]");

const revealIntro = () => {
  documentElement.classList.add("intro-ready");
};

if (!loader || prefersReducedMotion.matches) {
  loader?.remove();
  revealIntro();
} else {
  documentElement.classList.add("loader-active");

  let pageLoaded = document.readyState === "complete";
  let displayedProgress = 0;
  const loaderStartedAt = performance.now();

  window.addEventListener("load", () => {
    pageLoaded = true;
  }, { once: true });

  const finishLoader = () => {
    if (loaderValue) loaderValue.textContent = "100";
    if (loaderBar) loaderBar.style.transform = "scaleX(1)";
    loader.dataset.state = "done";
    documentElement.classList.remove("loader-active");
    revealIntro();
    window.setTimeout(() => loader.remove(), 760);
  };

  const updateLoader = (now) => {
    const elapsed = now - loaderStartedAt;
    const waitingTarget = Math.min(92, (elapsed / 620) * 92);
    const target = (pageLoaded && elapsed > 540) || elapsed > 1400 ? 100 : waitingTarget;
    displayedProgress += Math.max(1.8, (target - displayedProgress) * 0.22);
    displayedProgress = Math.min(displayedProgress, target);

    const roundedProgress = Math.round(displayedProgress);
    if (loaderValue) loaderValue.textContent = String(roundedProgress).padStart(2, "0");
    if (loaderBar) loaderBar.style.transform = `scaleX(${displayedProgress / 100})`;

    if (target === 100 && displayedProgress > 99.2) {
      finishLoader();
      return;
    }

    window.requestAnimationFrame(updateLoader);
  };

  window.requestAnimationFrame(updateLoader);
}

const updateHeader = () => {
  header?.setAttribute("data-elevated", String(window.scrollY > 20));
  const scrollableHeight = documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  if (scrollProgress) scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (cursorLight && !prefersReducedMotion.matches) {
  let cursorFrame;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;

  const renderCursor = () => {
    cursorFrame = undefined;
    cursorLight.style.transform = `translate3d(${cursorX - 360}px, ${cursorY - 360}px, 0)`;
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
    },
    { passive: true },
  );

  renderCursor();
}

const revealTargets = document.querySelectorAll(".reveal");

document.querySelectorAll(".project-grid, .method-grid, .research-principles").forEach((group) => {
  group.querySelectorAll(".reveal").forEach((target, index) => {
    target.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
  });
});

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5%" },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card[data-category]");

const setFilter = (filter) => {
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  projectCards.forEach((card) => {
    const categories = card.dataset.category?.split(" ") ?? [];
    const visible = filter === "all" || categories.includes(filter);
    card.hidden = !visible;
  });
};

filterButtons.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  button.addEventListener("click", () => setFilter(button.dataset.filter ?? "all"));
});

const heroCarousel = document.querySelector("[data-hero-carousel]");

if (heroCarousel) {
  const viewport = heroCarousel.querySelector("[data-carousel-viewport]");
  const track = heroCarousel.querySelector("[data-carousel-track]");
  const originalCards = [...heroCarousel.querySelectorAll("[data-carousel-card]")];
  const previousButton = heroCarousel.querySelector("[data-carousel-prev]");
  const nextButton = heroCarousel.querySelector("[data-carousel-next]");
  const announcer = heroCarousel.querySelector("[data-carousel-announcer]");
  const lightbox = document.querySelector("[data-carousel-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-carousel-lightbox-image]");
  const lightboxTitle = lightbox?.querySelector("[data-carousel-lightbox-title]");
  const lightboxLink = lightbox?.querySelector("[data-carousel-lightbox-link]");
  const lightboxClose = lightbox?.querySelector("[data-carousel-lightbox-close]");

  if (viewport && track && originalCards.length) {
    const cloneCard = (card) => {
      const clone = document.createElement("div");
      clone.className = card.className;
      Object.entries(card.dataset).forEach(([key, value]) => {
        clone.dataset[key] = value;
      });
      clone.innerHTML = card.innerHTML;
      clone.dataset.carouselClone = "";
      clone.setAttribute("aria-hidden", "true");
      return clone;
    };

    originalCards.forEach((card, index) => {
      card.setAttribute(
        "aria-label",
        `${card.dataset.carouselTitle}, ${index + 1} of ${originalCards.length}. Open preview`,
      );
    });

    track.prepend(...originalCards.map(cloneCard));
    track.append(...originalCards.map(cloneCard));

    const cards = [...track.querySelectorAll("[data-carousel-card]")];
    let cardWidth = 0;
    let cardStep = 0;
    let setWidth = 0;
    let offset = 0;
    let velocity = 0;
    let motionFrame;
    let dragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let suppressClickUntil = 0;
    let pressedCard;
    let keyboardMode = false;
    let lastLightboxTrigger;

    const cancelMotion = () => {
      if (!motionFrame) return;
      window.cancelAnimationFrame(motionFrame);
      motionFrame = undefined;
    };

    const normalizeOffset = () => {
      if (!setWidth) return;
      while (offset > -setWidth * 0.35) offset -= setWidth;
      while (offset < -setWidth * 1.65) offset += setWidth;
    };

    const renderCarousel = () => {
      track.style.transform = `translate3d(${offset}px, -50%, 0)`;
      const motionStrength = prefersReducedMotion.matches
        ? 0
        : Math.min(1, Math.abs(velocity) / 9 + (dragging ? 0.22 : 0));
      const sharedSkew = Math.max(-7, Math.min(7, velocity * 0.24));
      const viewportCenter = viewport.clientWidth / 2;

      cards.forEach((card, index) => {
        const cardCenter = index * cardStep + cardWidth / 2 + offset;
        const distance = cardStep ? (cardCenter - viewportCenter) / cardStep : 0;
        const distanceMagnitude = Math.abs(distance);
        const yaw = Math.sign(distance) * Math.min(24, distanceMagnitude * 7.5) * motionStrength;
        const scale = 1 - Math.min(0.085, distanceMagnitude * 0.02) * motionStrength;
        const drop = Math.min(11, distanceMagnitude * 3) * motionStrength;
        card.style.transform = `perspective(900px) translateY(${drop}px) rotateY(${yaw}deg) rotateZ(${sharedSkew}deg) scale(${scale})`;
      });
    };

    const measureCarousel = () => {
      const previousStep = cardStep;
      const previousSetWidth = setWidth;
      const relativePosition = previousStep ? (offset + previousSetWidth) / previousStep : 0.5;
      const trackStyle = window.getComputedStyle(track);
      const gap = Number.parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;
      cardWidth = originalCards[0].getBoundingClientRect().width;
      cardStep = cardWidth + gap;
      setWidth = cardStep * originalCards.length;
      offset = -setWidth + relativePosition * cardStep;
      normalizeOffset();
      renderCarousel();
    };

    const runMomentum = () => {
      cancelMotion();
      let lastFrameTime = performance.now();

      const tick = (now) => {
        if (dragging || prefersReducedMotion.matches) {
          velocity = 0;
          renderCarousel();
          motionFrame = undefined;
          return;
        }

        const frameScale = Math.min(2, (now - lastFrameTime) / 16.67);
        lastFrameTime = now;
        offset += velocity * frameScale;
        velocity *= Math.pow(0.875, frameScale);
        normalizeOffset();
        renderCarousel();

        if (Math.abs(velocity) < 0.08) {
          velocity = 0;
          renderCarousel();
          motionFrame = undefined;
          return;
        }

        motionFrame = window.requestAnimationFrame(tick);
      };

      motionFrame = window.requestAnimationFrame(tick);
    };

    const animateBy = (distance, announcement) => {
      cancelMotion();
      const startOffset = offset;
      const targetOffset = offset + distance;

      if (prefersReducedMotion.matches) {
        offset = targetOffset;
        velocity = 0;
        normalizeOffset();
        renderCarousel();
      } else {
        const duration = 420;
        const startedAt = performance.now();
        let previousOffset = offset;

        const tick = (now) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          offset = startOffset + (targetOffset - startOffset) * eased;
          velocity = offset - previousOffset;
          previousOffset = offset;
          renderCarousel();

          if (progress < 1) {
            motionFrame = window.requestAnimationFrame(tick);
            return;
          }

          velocity = 0;
          normalizeOffset();
          renderCarousel();
          motionFrame = undefined;
        };

        motionFrame = window.requestAnimationFrame(tick);
      }

      if (announcer) announcer.textContent = announcement;
    };

    const finishDrag = (event, cancelled = false) => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      if (viewport.hasPointerCapture?.(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      const cardToOpen = pressedCard;
      pressedCard = undefined;

      if (dragMoved && !cancelled) {
        suppressClickUntil = performance.now() + 280;
        velocity = Math.max(-42, Math.min(42, velocity));
        runMomentum();
      } else {
        velocity = 0;
        renderCarousel();
        if (!cancelled && cardToOpen) {
          suppressClickUntil = performance.now() + 280;
          openLightbox(cardToOpen);
        }
      }
    };

    viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      keyboardMode = false;
      cancelMotion();
      dragging = true;
      dragMoved = false;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      lastPointerX = event.clientX;
      lastPointerTime = event.timeStamp;
      pressedCard = event.target.closest?.("[data-carousel-card]");
      viewport.setPointerCapture?.(event.pointerId);
      velocity = 0;
      viewport.classList.add("is-dragging");
      renderCarousel();
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const totalX = event.clientX - dragStartX;
      const totalY = event.clientY - dragStartY;
      const deltaX = event.clientX - lastPointerX;
      const deltaTime = Math.max(8, event.timeStamp - lastPointerTime);

      if (!dragMoved && Math.abs(totalX) > 7 && Math.abs(totalX) > Math.abs(totalY)) {
        dragMoved = true;
      }

      if (dragMoved) {
        event.preventDefault();
        offset += deltaX;
        const instantVelocity = (deltaX / deltaTime) * 16.67;
        velocity = velocity * 0.55 + instantVelocity * 0.45;
        normalizeOffset();
        renderCarousel();
      }

      lastPointerX = event.clientX;
      lastPointerTime = event.timeStamp;
    });

    viewport.addEventListener("pointerup", (event) => finishDrag(event));
    viewport.addEventListener("pointercancel", (event) => finishDrag(event, true));
    viewport.addEventListener("dragstart", (event) => event.preventDefault());

    previousButton?.addEventListener("click", () => animateBy(cardStep, "Moved to previous projects"));
    nextButton?.addEventListener("click", () => animateBy(-cardStep, "Moved to next projects"));

    heroCarousel.addEventListener("keydown", (event) => {
      keyboardMode = true;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        animateBy(cardStep, "Moved to previous projects");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        animateBy(-cardStep, "Moved to next projects");
      }
    });

    heroCarousel.addEventListener("pointerdown", () => {
      keyboardMode = false;
    });

    track.addEventListener("focusin", (event) => {
      const card = event.target.closest("[data-carousel-card]");
      if (!keyboardMode || !card || card.dataset.carouselClone !== undefined) return;
      const cardIndex = cards.indexOf(card);
      const targetOffset = viewport.clientWidth / 2 - (cardIndex * cardStep + cardWidth / 2);
      animateBy(targetOffset - offset, `${card.dataset.carouselTitle} centered`);
    });

    const openLightbox = (card) => {
      if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxLink || !lightboxClose) return;
      const sourceImage = card.querySelector("img");
      const title = card.dataset.carouselTitle ?? "Selected project";
      lightboxImage.src = sourceImage?.getAttribute("src") ?? "";
      lightboxImage.alt = sourceImage?.alt ?? title;
      lightboxTitle.textContent = title;
      lightboxLink.href = card.dataset.carouselTarget ?? "#work";
      lastLightboxTrigger = card.dataset.carouselClone !== undefined
        ? originalCards.find((candidate) => candidate.dataset.carouselTitle === title)
        : card;
      lightbox.hidden = false;
      lightbox.dataset.state = "opening";
      document.body.classList.add("lightbox-open");
      window.requestAnimationFrame(() => {
        lightbox.dataset.state = "open";
        lightboxClose.focus({ preventScroll: true });
      });
    };

    const closeLightbox = (returnFocus = true) => {
      if (!lightbox || lightbox.hidden) return;
      lightbox.dataset.state = "closing";
      document.body.classList.remove("lightbox-open");
      const closeDelay = prefersReducedMotion.matches ? 0 : 300;
      window.setTimeout(() => {
        lightbox.hidden = true;
        lightbox.dataset.state = "closed";
        if (returnFocus) lastLightboxTrigger?.focus({ preventScroll: true });
      }, closeDelay);
    };

    track.addEventListener("click", (event) => {
      const card = event.target.closest("[data-carousel-card]");
      if (!card) return;
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        return;
      }
      openLightbox(card);
    });

    lightboxClose?.addEventListener("click", () => closeLightbox());
    lightboxLink?.addEventListener("click", () => closeLightbox(false));
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key !== "Tab" || !lightboxClose || !lightboxLink) return;
      const focusable = [lightboxClose, lightboxLink];
      const currentIndex = focusable.indexOf(document.activeElement);
      if (event.shiftKey && currentIndex <= 0) {
        event.preventDefault();
        lightboxLink.focus();
      } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
        event.preventDefault();
        lightboxClose.focus();
      }
    });

    const resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(measureCarousel)
      : undefined;
    resizeObserver?.observe(viewport);
    if (!resizeObserver) window.addEventListener("resize", measureCarousel, { passive: true });
    prefersReducedMotion.addEventListener?.("change", () => {
      if (!prefersReducedMotion.matches) return;
      cancelMotion();
      velocity = 0;
      renderCarousel();
    });
    measureCarousel();
  }
}

const tiltTargets = document.querySelectorAll("[data-tilt]");

if (!prefersReducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  tiltTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const intensity = 2.2;
      target.style.setProperty("--tilt-x", `${-y * intensity}deg`);
      target.style.setProperty("--tilt-y", `${x * intensity}deg`);
      target.style.setProperty("--pointer-x", `${(x + 0.5) * 100}%`);
      target.style.setProperty("--pointer-y", `${(y + 0.5) * 100}%`);
    });

    target.addEventListener("pointerleave", () => {
      target.style.removeProperty("--tilt-x");
      target.style.removeProperty("--tilt-y");
      target.style.removeProperty("--pointer-x");
      target.style.removeProperty("--pointer-y");
    });
  });
}

const hero = document.querySelector(".hero");
const heroAtmosphere = document.querySelector(".hero-atmosphere");

if (hero && !prefersReducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  let heroPointerFrame;
  let pointerX = 0;
  let pointerY = 0;

  const renderHeroParallax = () => {
    heroPointerFrame = undefined;
    heroAtmosphere?.style.setProperty("--atmo-x", `${pointerX * -10}px`);
    heroAtmosphere?.style.setProperty("--atmo-y", `${pointerY * -8}px`);
  };

  const requestHeroParallax = () => {
    if (heroPointerFrame) return;
    heroPointerFrame = window.requestAnimationFrame(renderHeroParallax);
  };

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    requestHeroParallax();
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    requestHeroParallax();
  });
}

const parallaxImages = document.querySelectorAll(".feature-visual > img:first-child");

if (parallaxImages.length && !prefersReducedMotion.matches) {
  let mediaParallaxFrame;

  const renderMediaParallax = () => {
    mediaParallaxFrame = undefined;
    parallaxImages.forEach((image) => {
      const rect = image.parentElement.getBoundingClientRect();
      const viewportOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight + rect.height);
      const shift = Math.max(-24, Math.min(24, viewportOffset * -42));
      image.style.setProperty("--media-shift", `${shift}px`);
    });
  };

  const requestMediaParallax = () => {
    if (mediaParallaxFrame) return;
    mediaParallaxFrame = window.requestAnimationFrame(renderMediaParallax);
  };

  window.addEventListener("scroll", requestMediaParallax, { passive: true });
  window.addEventListener("resize", requestMediaParallax, { passive: true });
  requestMediaParallax();
}

const sceneSections = document.querySelectorAll("[data-scene]");

if (sceneSections.length) {
  document.body.dataset.scene = sceneSections[0].dataset.scene ?? "hero";

  if ("IntersectionObserver" in window) {
    const visibleScenes = new Map();

    const sceneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleScenes.set(entry.target, entry.intersectionRatio);
          } else {
            visibleScenes.delete(entry.target);
          }
        });

        const visibleScene = [...visibleScenes.entries()]
          .sort(([, ratioA], [, ratioB]) => ratioB - ratioA)[0]?.[0];
        if (!visibleScene) return;
        document.body.dataset.scene = visibleScene.dataset.scene ?? "hero";
      },
      { rootMargin: "-36% 0px -44%", threshold: [0, 0.15, 0.5] },
    );

    sceneSections.forEach((section) => sceneObserver.observe(section));
  }
}

copyButton?.addEventListener("click", async () => {
  const originalLabel = copyButton.textContent;
  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = "Copied ✓";
  } catch {
    window.location.href = `mailto:${email}`;
    return;
  }

  window.setTimeout(() => {
    copyButton.textContent = originalLabel;
  }, 1600);
});

const sectionLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.setAttribute("aria-current", active ? "location" : "false");
      });
    },
    { rootMargin: "-38% 0px -52%", threshold: [0, 0.2, 0.6] },
  );
  sections.forEach((section) => sectionObserver.observe(section));
}
