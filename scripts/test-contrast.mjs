// Hero and section text stay at AA contrast at day, the evening threshold, dusk, and night.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';
import { createReadStream, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const path = normalize(join(root, decodeURIComponent(pathname)));
  if (!path.startsWith(root) || !existsSync(path) || path.endsWith('/')) {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
  createReadStream(path).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const chromeBin = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].find((bin) => spawnSync(bin, ['--version'], { stdio: 'ignore' }).status === 0);
assert.ok(chromeBin, 'a Chrome or Chromium binary is required for the contrast test');
const debugPort = 9222 + (port % 1000);
const profile = mkdtempSync(join(tmpdir(), 'contrast-'));
let chrome;
let cdp;

function cdpFactory(ws) {
  let next = 1;
  const wait = new Map();
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && wait.has(message.id)) {
      const done = wait.get(message.id);
      wait.delete(message.id);
      done(message);
    }
  });
  return (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = next++;
    const timer = setTimeout(() => reject(new Error(method)), 20000);
    wait.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    });
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
}

function readPNG(buffer) {
  let cursor = 8;
  let width = 0;
  let height = 0;
  let colorType = 2;
  const chunks = [];
  while (cursor < buffer.length) {
    const length = buffer.readUInt32BE(cursor);
    cursor += 4;
    const type = buffer.toString('ascii', cursor, cursor + 4);
    cursor += 4;
    const data = buffer.subarray(cursor, cursor + length);
    cursor += length + 4;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') chunks.push(data);
    else if (type === 'IEND') break;
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * 4);
  let offset = 0;
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[offset];
    offset += 1;
    const row = Buffer.from(raw.subarray(offset, offset + stride));
    offset += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = previous[x];
      const upperLeft = x >= channels ? previous[x - channels] : 0;
      if (filter === 1) row[x] = (row[x] + left) & 255;
      else if (filter === 2) row[x] = (row[x] + up) & 255;
      else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const estimate = left + up - upperLeft;
        const pa = Math.abs(estimate - left);
        const pb = Math.abs(estimate - up);
        const pc = Math.abs(estimate - upperLeft);
        const nearest = pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft;
        row[x] = (row[x] + nearest) & 255;
      }
    }
    previous = row;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      pixels[index] = row[x * channels];
      pixels[index + 1] = row[x * channels + 1];
      pixels[index + 2] = row[x * channels + 2];
      pixels[index + 3] = channels === 4 ? row[x * channels + 3] : 255;
    }
  }
  return { width, height, pixels };
}

function linear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(red, green, blue) {
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function ratio(text, background) {
  const hi = luminance(...text);
  const lo = luminance(...background);
  const [light, dark] = hi > lo ? [hi, lo] : [lo, hi];
  return (light + 0.05) / (dark + 0.05);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

try {
  const chromeErrors = [];
  chrome = spawn(chromeBin, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--disable-breakpad', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, `--remote-debugging-port=${debugPort}`, 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  chrome.stderr?.on('data', (chunk) => chromeErrors.push(String(chunk)));
  const readyBy = Date.now() + 20000;
  while (Date.now() < readyBy && !cdp && chrome.exitCode === null) {
    let browserPort = debugPort;
    try {
      const opened = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]);
      if (opened) browserPort = opened;
    } catch { /* Chrome has not written its port yet */ }
    try {
      const version = await (await fetch(`http://127.0.0.1:${browserPort}/json/version`)).json();
      const ws = new WebSocket(version.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve);
        ws.addEventListener('error', reject);
      });
      cdp = cdpFactory(ws);
    } catch {
      await delay(200);
    }
  }
  assert.ok(cdp, `Chrome did not open a debugging port${chromeErrors.length ? `: ${chromeErrors.join('').slice(-500)}` : ''}`);
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
  await cdp('Page.enable', {}, sessionId);
  await cdp('Runtime.enable', {}, sessionId);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await cdp('Page.navigate', { url: `http://127.0.0.1:${port}/` }, sessionId);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const { result } = await cdp('Runtime.evaluate', {
      expression: `document.readyState !== 'loading' && !!document.querySelector('#hero-title')`,
      returnByValue: true,
    }, sessionId);
    if (result?.value === true) break;
    await delay(50);
  }
  await cdp('Runtime.evaluate', {
    expression: `addEventListener('scroll', (event) => event.stopImmediatePropagation(), true);`,
  }, sessionId);
  await cdp('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const day = document.querySelector('.bg-day');
      if (day && !day.getAttribute('src')) day.src = day.dataset.src;
      const pending = [...document.images].filter((image) => !image.complete);
      if (!pending.length) resolve();
      else Promise.all(pending.map((image) => new Promise((done) => { image.addEventListener('load', done, { once: true }); image.addEventListener('error', done, { once: true }); }))).then(resolve);
      setTimeout(resolve, 2500);
    })`,
    awaitPromise: true,
  }, sessionId);

  async function paint(hour) {
    await cdp('Runtime.evaluate', {
      expression: `(() => {
        const root = document.documentElement;
        root.classList.remove('is-settling', 'is-scrubbing', 'is-fading');
        root.style.setProperty('--hour', ${hour.toFixed(4)});
        root.style.setProperty('--t', ${(1 - hour).toFixed(4)});
        root.dataset.view = ${hour} < 0.5 ? 'founder' : 'researcher';
        document.querySelector('[role=slider]').setAttribute('aria-valuenow', '${Math.round(hour * 100)}');
      })()`,
    }, sessionId);
    await delay(40);
  }

  async function sample(selector, minimum, hour) {
    const { result } = await cdp('Runtime.evaluate', {
      expression: `new Promise((resolve) => {
        document.documentElement.style.scrollBehavior = 'auto';
        const root = document.documentElement;
        const apply = () => {
          root.style.setProperty('--hour', ${hour.toFixed(4)});
          root.style.setProperty('--t', ${(1 - hour).toFixed(4)});
          root.dataset.view = ${hour} < 0.5 ? 'founder' : 'researcher';
        };
        apply();
        const node = [...document.querySelectorAll('${selector}')].find((item) => getComputedStyle(item).display !== 'none');
        node.scrollIntoView({ block: 'center', inline: 'nearest' });
        apply();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          apply();
          const rect = node.getBoundingClientRect();
          resolve({ x: Math.max(0, rect.left), y: Math.max(0, rect.top), width: Math.min(Math.max(rect.width, 40), 420), height: Math.min(Math.max(rect.height, 18), 72), top: rect.top });
        }));
      })`,
      awaitPromise: true,
      returnByValue: true,
    }, sessionId);
    const box = result.value;
    assert.ok(box.width > 40 && box.height > 12, `${selector} box was ${box.width}x${box.height}`);
    await cdp('Runtime.evaluate', {
      expression: `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
      awaitPromise: true,
    }, sessionId);
    const fresh = await cdp('Page.captureScreenshot', { format: 'png' }, sessionId);
    const frame = readPNG(Buffer.from(fresh.data, 'base64'));
    const painted = {
      width: Math.max(1, Math.round(box.width)),
      height: Math.max(1, Math.round(box.height)),
      pixels: Buffer.alloc(Math.max(1, Math.round(box.width)) * Math.max(1, Math.round(box.height)) * 4),
    };
    for (let y = 0; y < painted.height; y += 1) {
      for (let x = 0; x < painted.width; x += 1) {
        const sourceX = Math.min(frame.width - 1, Math.max(0, Math.round(box.x) + x));
        const sourceY = Math.min(frame.height - 1, Math.max(0, Math.round(box.y) + y));
        const from = (sourceY * frame.width + sourceX) * 4;
        const to = (y * painted.width + x) * 4;
        painted.pixels[to] = frame.pixels[from];
        painted.pixels[to + 1] = frame.pixels[from + 1];
        painted.pixels[to + 2] = frame.pixels[from + 2];
        painted.pixels[to + 3] = frame.pixels[from + 3];
      }
    }
    const dark = [];
    const light = [];
    for (let y = 0; y < painted.height; y += 1) {
      for (let x = 0; x < painted.width; x += 1) {
        const index = (y * painted.width + x) * 4;
        const pixel = [painted.pixels[index], painted.pixels[index + 1], painted.pixels[index + 2]];
        (luminance(...pixel) < 0.45 ? dark : light).push(pixel);
      }
    }
    if (dark.length <= 20 || light.length <= 20) writeFileSync('/tmp/contrast-fail.png', Buffer.from(fresh.data, 'base64'));
    assert.ok(dark.length > 20 && light.length > 20, `${selector} clusters dark ${dark.length} light ${light.length} at hour ${hour}`);
    const wantLight = hour >= 0.5;
    const textPixels = (wantLight ? light : dark)
      .map((pixel) => ({ pixel, tone: luminance(...pixel) }))
      .sort((a, b) => a.tone - b.tone);
    const edge = Math.max(1, Math.ceil(textPixels.length * 0.25));
    const glyph = wantLight ? textPixels.slice(-edge) : textPixels.slice(0, edge);
    const textColor = [0, 1, 2].map((channel) => median(glyph.map((item) => item.pixel[channel])));
    const backgroundColor = [0, 1, 2].map((channel) => median((wantLight ? dark : light).map((pixel) => pixel[channel])));
    const score = ratio(textColor, backgroundColor);
    const tone = luminance(...textColor);
    if (score < minimum || (hour >= 0.5 ? tone < 0.62 : tone > 0.2)) {
      writeFileSync('/tmp/contrast-fail.png', Buffer.from(fresh.data, 'base64'));
    }
    assert.ok(hour >= 0.5 ? tone > 0.62 : tone < 0.2, `${selector} text luminance ${tone.toFixed(2)} did not flip at hour ${hour}`);
    assert.ok(score >= minimum, `${selector} contrast ${score.toFixed(2)} is below ${minimum} at hour ${hour} (text ${textColor.join(',')} on ${backgroundColor.join(',')}; y ${Math.round(box.y)} reported ${Math.round(box.top)})`);
    return Number(score.toFixed(2));
  }

  const report = {};
  for (const hour of [0, 0.5, 0.6, 1]) {
    const hero = await sample('#hero-title', 3, hour);
    const focus = await sample('.focus', 4.5, hour);
    const section = await sample('#news-title', 3, hour);
    const lede = await sample('#news .lede', 4.5, hour);
    report[Math.round(hour * 100)] = { hero, focus, section, lede };
  }
  console.log(JSON.stringify({ passed: 1, checks: ['hero and section text pass AA at 0, 50, 60, and 100'], report }, null, 2));
} finally {
  if (chrome?.pid) {
    try { process.kill(-chrome.pid, 'SIGKILL'); } catch { chrome.kill('SIGKILL'); }
  }
  server.closeAllConnections?.();
  server.close();
  if (chrome) {
    await Promise.race([
      new Promise((resolve) => {
        if (chrome.exitCode !== null || chrome.signalCode) resolve();
        else chrome.once('exit', resolve);
      }),
      delay(1000),
    ]);
  }
  rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
}
