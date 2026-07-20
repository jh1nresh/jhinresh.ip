const header = document.querySelector(".site-header");
const cursorLight = document.querySelector(".cursor-light");
const copyButton = document.querySelector("[data-copy-email]");
const email = "jhinresh@gmail.com";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateHeader = () => {
  header?.setAttribute("data-elevated", String(window.scrollY > 20));
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (cursorLight && !prefersReducedMotion.matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      cursorLight.style.left = `${event.clientX}px`;
      cursorLight.style.top = `${event.clientY}px`;
    },
    { passive: true },
  );
}

const revealTargets = document.querySelectorAll(".reveal");

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

const tiltTargets = document.querySelectorAll("[data-tilt]");

if (!prefersReducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  tiltTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const intensity = target.classList.contains("float-card") ? 10 : 2.2;
      target.style.transform = `perspective(1100px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(0)`;
    });

    target.addEventListener("pointerleave", () => {
      target.style.transform = "";
    });
  });
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
