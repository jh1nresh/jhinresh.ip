// Adapted from Aditya Ojha, MIT. See assets/reference/LICENSE.adityaojha.txt.
const DITHER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const PIXEL_SIZE = 2;
function readColor(element, name) {
  return getComputedStyle(element).getPropertyValue(name).trim().split(/\s+/).map(Number);
}


function initEarth(landPolygons) {

    const canvas = document.querySelector("#earth-canvas");
    if (!canvas) return;
    const footer = canvas.closest("footer");
    const scene = canvas.closest(".footer-earth");
    if (!scene) return;
    const context = canvas.getContext("2d");
    const map = document.createElement("canvas");
    map.width = 720;
    map.height = 360;
    const mapContext = map.getContext("2d", { willReadFrequently: true });
    if (!context || !mapContext) {
      console.error("Footer Earth could not create a canvas context.");
      return;
    }

    mapContext.fillStyle = "white";
    for (const polygon of landPolygons) {
      mapContext.beginPath();
      for (const ring of polygon) {
        ring.forEach(([longitude, latitude], index) => {
          const x = ((longitude + 180) / 360) * map.width;
          const y = ((90 - latitude) / 180) * map.height;
          if (index === 0) mapContext.moveTo(x, y);
          else mapContext.lineTo(x, y);
        });
        mapContext.closePath();
      }
      mapContext.fill("evenodd");
    }
    const land = mapContext.getImageData(0, 0, map.width, map.height).data;
    const palette = ["deep", "ocean", "light", "cloud"].map((name) =>
      readColor(canvas, `--footer-earth-${name}`),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    let skipped = false;
    let playing = true;
    let pageHidden = false;
    let lastFrame = 0;
    let elapsed = 0;
    // The illustration is its own pause surface; no separate control is shown.
    scene.setAttribute('role', 'button');
    scene.tabIndex = 0;
    const updateMotion = () => {
      const running = playing && visible && !skipped && !pageHidden && !document.hidden && !reducedMotion.matches;
      scene.classList.toggle('earth-running', running);
      scene.setAttribute('aria-label', reducedMotion.matches ? 'A green Earth. Motion reduced.' : playing ? 'Pause Earth animation' : 'Resume Earth animation');
      scene.setAttribute('aria-pressed', String(!playing));
      scene.setAttribute('aria-disabled', String(reducedMotion.matches));
    };

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const image = context.createImageData(width, height);
      const radius = width * 0.68;
      const centerY = height + Math.sqrt(radius * radius - width * width / 4);
      const angle = 0.1 + elapsed * 0.000018;

      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          const x = (column - width / 2) / radius;
          const y = (centerY - row) / radius;
          const distance = x * x + y * y;
          if (distance >= 1) continue;

          const z = Math.sqrt(1 - distance);
          const latitude = Math.asin(y * 0.66 - z * 0.75);
          const longitude = Math.atan2(x, y * 0.75 + z * 0.66) + angle;
          const mapX = Math.floor((longitude / (Math.PI * 2) + 1.5) % 1 * map.width);
          const mapY = Math.min(map.height - 1, Math.floor((0.5 - latitude / Math.PI) * map.height));
          const isLand = land[(mapY * map.width + mapX) * 4 + 3] > 0;
          const clouds = Math.sin(longitude * 14 + Math.sin(latitude * 17) * 1.7) +
            Math.sin(latitude * 36 + longitude * 5) * 0.65 +
            Math.sin(longitude * 31 - latitude * 23) * 0.3 +
            Math.sin(longitude * 71 + latitude * 53) * 0.16;
          const light = Math.max(0, Math.min(1, 0.22 + x * 0.4 + y * 0.06 + z * 0.4));
          const terrain = Math.sin(longitude * 24) * Math.sin(latitude * 29) * 0.05;
          const detail = (isLand ? 0.12 + terrain : 0) + Math.max(0, Math.min(0.12, (clouds - 0.8) * 0.12));
          const brightness = Math.min(0.99, light * 0.8 + detail);
          const threshold = (DITHER[(row % 4) * 4 + column % 4] + 0.5) / 16;
          const edge = Math.min(1, z * 3.5);
          if (threshold > edge * Math.min(1, 0.48 + brightness * 0.75)) continue;

          const shade = Math.floor(brightness * 3 + threshold);
          const level = clouds > 1.5 && light > 0.58
            ? 3
            : isLand ? Math.min(2, Math.max(1, shade + 1)) : Math.min(1, shade);
          const offset = (row * width + column) * 4;
          image.data[offset] = palette[level][0];
          image.data[offset + 1] = palette[level][1];
          image.data[offset + 2] = palette[level][2];
          image.data[offset + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
      document.querySelector(".earth-fallback")?.setAttribute("hidden", "");
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(bounds.width / PIXEL_SIZE));
      canvas.height = Math.max(1, Math.round(bounds.height / PIXEL_SIZE));
      draw();
    };
    const tick = (time) => {
      if (!playing || !visible || skipped || pageHidden || document.hidden || reducedMotion.matches) {
        frame = 0;
        lastFrame = 0;
        return;
      }
      if (time - lastFrame >= 80) {
        if (lastFrame) elapsed += Math.min(time - lastFrame, 100);
        lastFrame = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      updateMotion();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      if (playing && visible && !skipped && !pageHidden && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick);
      else draw();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    if (footer) resizeObserver.observe(footer);
    intersection.observe(scene);
    const chooseMotion = () => { if (!reducedMotion.matches) { playing = !playing; update(); } };
    const chooseWithKey = event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!event.repeat) chooseMotion(); }
    };
    const renderState = event => { skipped = event.skipped; update(); };
    const hidePage = () => { pageHidden = true; update(); };
    const showPage = () => { pageHidden = false; resize(); update(); };
    scene.addEventListener('click', chooseMotion);
    scene.addEventListener('keydown', chooseWithKey);
    scene.addEventListener('contentvisibilityautostatechange', renderState);
    window.addEventListener('pagehide', hidePage);
    window.addEventListener('pageshow', showPage);
    reducedMotion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    resize();

    return () => {
      scene.classList.remove('earth-running');
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      scene.removeEventListener('click', chooseMotion);
      scene.removeEventListener('keydown', chooseWithKey);
      scene.removeEventListener('contentvisibilityautostatechange', renderState);
      window.removeEventListener('pagehide', hidePage);
      window.removeEventListener('pageshow', showPage);
      reducedMotion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };

}
fetch("./assets/reference/footer/earth-land.json").then(r => { if (!r.ok) throw new Error("Earth map unavailable"); return r.json(); }).then(land => { const cleanup = initEarth(land); if (cleanup) window.addEventListener("pagehide", event => { if (!event.persisted) cleanup(); }); }).catch(() => { /* Static Earth remains available. */ });
