const header = document.querySelector(".site-header");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateHeader = () => {
  header?.setAttribute("data-elevated", String(window.scrollY > 24));
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const revealTargets = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6%" },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const featureData = {
  save: {
    kicker: "Consumer AI · iOS",
    title: "SAV-E",
    thesis: "A private, evidence-backed memory for saved places.",
    description:
      "Turns social posts, maps, web pages, voice notes, and Google Takeout into reviewable evidence and confirmed Map Stamps—without guessing.",
    stack: "SwiftUI · MapKit · App Intents · PostgreSQL",
    href: "https://sav-e-app.vercel.app",
    linkLabel: "Open SAV-E",
  },
  maiat: {
    kicker: "Agent trust · Base",
    title: "Maiat + Dojo",
    thesis: "Verifiable reputation for AI agent work.",
    description:
      "Dojo is the work-order surface; Maiat turns evaluator decisions, settlement receipts, and behavioral signals into reputation for future work.",
    stack: "Solidity · Foundry · TypeScript · EAS",
    href: "https://app.maiat.io",
    linkLabel: "Open Maiat",
  },
  sllr: {
    kicker: "Commerce agents · Execution",
    title: "SLL-R",
    thesis: "Merchant-backed ordering for AI agents.",
    description:
      "Locks an exact merchant quote to buyer consent, prevents duplicate orders, tracks fulfillment, and issues one canonical receipt.",
    stack: "TypeScript · MCP · Payments · Receipt lifecycle",
    href: "https://github.com/jh1nresh/SLL-R",
    linkLabel: "View SLL-R Source",
  },
  match: {
    kicker: "Settlement · Merkle proof",
    title: "Match Receipt Engine",
    thesis: "Deterministic settlement backed by Merkle proofs.",
    description:
      "Live match events become Merkle-verifiable receipts. Valid evidence advances settlement; tampered evidence stops it.",
    stack: "State machines · Merkle proofs · Tamper demo",
    href: "https://match-receipt-engine.vercel.app",
    linkLabel: "Run the Demo",
  },
  more: {
    kicker: "Product + protocol experiments",
    title: "More Projects",
    thesis: "Experiments in learning, identity, receipts, and coordination.",
    description:
      "Oshiami, Cloak, Jiagon, Gimi, Pincher, flops, and ClearTrade span learning, fashion, local reviews, rentals, events, infrastructure credits, and trading agents.",
    stack: "Consumer apps · Agent systems · Protocol research",
    href: "https://github.com/jh1nresh?tab=repositories",
    linkLabel: "Browse Public Repositories",
  },
};

const featureTabs = [...document.querySelectorAll("[data-feature-tab]")];
const featureKicker = document.querySelector("[data-feature-kicker]");
const featureTitle = document.querySelector("[data-feature-title]");
const featureThesis = document.querySelector("[data-feature-thesis]");
const featureDescription = document.querySelector("[data-feature-description]");
const featureStack = document.querySelector("[data-feature-stack]");
const featureLink = document.querySelector("[data-feature-link]");
const featureProgress = document.querySelector("[data-feature-progress]");
const featureCount = document.querySelector("[data-feature-count]");

const selectFeature = (tab, moveFocus = false) => {
  const key = tab.dataset.featureTab;
  const data = key ? featureData[key] : undefined;
  if (!data) return;

  const index = featureTabs.indexOf(tab);
  featureTabs.forEach((candidate) => {
    const active = candidate === tab;
    candidate.classList.toggle("is-active", active);
    candidate.setAttribute("aria-selected", String(active));
    candidate.tabIndex = active ? 0 : -1;
  });

  if (featureKicker) featureKicker.textContent = data.kicker;
  if (featureTitle) featureTitle.textContent = data.title;
  if (featureThesis) featureThesis.textContent = data.thesis;
  if (featureDescription) featureDescription.textContent = data.description;
  if (featureStack) featureStack.textContent = data.stack;
  if (featureLink) {
    featureLink.href = data.href;
    featureLink.textContent = data.linkLabel;
  }
  if (featureProgress) featureProgress.style.width = `${((index + 1) / featureTabs.length) * 100}%`;
  if (featureCount) featureCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(featureTabs.length).padStart(2, "0")}`;
  if (moveFocus) tab.focus();
};

featureTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectFeature(tab));
  tab.addEventListener("keydown", (event) => {
    const currentIndex = featureTabs.indexOf(tab);
    let nextIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % featureTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + featureTabs.length) % featureTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = featureTabs.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    selectFeature(featureTabs[nextIndex], true);
  });
});

const activeFeatureTab = featureTabs.find((tab) => tab.classList.contains("is-active"));
if (activeFeatureTab) selectFeature(activeFeatureTab);

const HLS_LIBRARY_URL = "https://cdn.jsdelivr.net/npm/hls.js@1.6.16/dist/hls.min.js";
const HLS_LIBRARY_INTEGRITY = "sha384-5E8B0pTlZZJMabWpC0fyYf6OUpe15jJij34BqBAh4NXoHAlLNOjCPRrwtOXOQFAn";

let hlsInstance;
let hlsLoadTimeout;
const hlsVideo = document.querySelector("[data-hls-video]");

const safePlay = (video) => {
  if (reducedMotion.matches) {
    video.pause();
    return;
  }
  video.play().catch(() => {});
};

const markMediaFallback = (video) => {
  video.parentElement?.classList.add("media-fallback");
};

const clearMediaFallback = (video) => {
  video.parentElement?.classList.remove("media-fallback");
};

document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("canplay", () => safePlay(video));
  video.addEventListener("error", () => markMediaFallback(video));
  if (reducedMotion.matches) video.removeAttribute("autoplay");
});

const attachHlsSource = () => {
  if (!hlsVideo) return false;

  const source = hlsVideo.dataset.src;
  if (!source) return false;

  if (hlsVideo.canPlayType("application/vnd.apple.mpegurl")) {
    clearMediaFallback(hlsVideo);
    hlsVideo.src = source;
    hlsVideo.addEventListener("loadedmetadata", () => safePlay(hlsVideo), { once: true });
    return true;
  }

  const HlsConstructor = window.Hls;
  if (HlsConstructor?.isSupported()) {
    clearMediaFallback(hlsVideo);
    hlsInstance = new HlsConstructor();
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(hlsVideo);
    hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, () => safePlay(hlsVideo));
    hlsInstance.on(HlsConstructor.Events.ERROR, (_event, data) => {
      if (!data?.fatal) return;
      hlsInstance?.destroy();
      hlsInstance = undefined;
      markMediaFallback(hlsVideo);
    });
    return true;
  }

  return false;
};

const loadHlsLibrary = () => {
  if (!hlsVideo || window.Hls) {
    if (!attachHlsSource() && hlsVideo) markMediaFallback(hlsVideo);
    return;
  }

  const script = document.createElement("script");
  script.src = HLS_LIBRARY_URL;
  script.integrity = HLS_LIBRARY_INTEGRITY;
  script.crossOrigin = "anonymous";
  script.async = true;
  script.dataset.hlsLibrary = "";
  script.addEventListener("load", () => {
    window.clearTimeout(hlsLoadTimeout);
    if (!attachHlsSource()) markMediaFallback(hlsVideo);
  }, { once: true });
  script.addEventListener("error", () => {
    window.clearTimeout(hlsLoadTimeout);
    markMediaFallback(hlsVideo);
  }, { once: true });

  hlsLoadTimeout = window.setTimeout(() => markMediaFallback(hlsVideo), 8000);
  document.head.append(script);
};

if (!attachHlsSource()) {
  loadHlsLibrary();
}

reducedMotion.addEventListener?.("change", () => {
  document.querySelectorAll("video").forEach((video) => {
    if (reducedMotion.matches) {
      video.pause();
    } else {
      safePlay(video);
    }
  });
});

window.addEventListener("pagehide", () => {
  window.clearTimeout(hlsLoadTimeout);
  hlsInstance?.destroy();
}, { once: true });
