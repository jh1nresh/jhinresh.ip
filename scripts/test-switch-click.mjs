// A real pointer click must flip the switch immediately, even while the day
// photograph is still unloaded. The crossfade may wait; aria-checked may not.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { createReadStream, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain' };

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  if (pathname.endsWith('/bg-day.webp')) {
    response.writeHead(200, { 'content-type': 'image/webp' });
    return;
  }
  const path = normalize(join(root, decodeURIComponent(pathname)));
  if (!path.startsWith(root) || !existsSync(path)) {
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
assert.ok(chromeBin, 'a Chrome or Chromium binary is required for the real click test');
const debugPort = 9222 + (port % 1000);
const profile = mkdtempSync(join(tmpdir(), 'switch-click-'));
let chrome;

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

let cdp;
try {
chrome = spawn(chromeBin, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
  '--disable-breakpad', '--no-first-run',
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${debugPort}`, 'about:blank',
], { stdio: 'ignore', detached: true });
for (let attempt = 0; attempt < 40 && !cdp; attempt += 1) {
  try {
    const version = await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json();
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });
    cdp = cdpFactory(ws);
  } catch {
    await delay(150);
  }
}
assert.ok(cdp, 'Chrome did not open a debugging port');
const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
await cdp('Page.enable', {}, sessionId);
await cdp('Runtime.enable', {}, sessionId);
async function waitForSwitch(url) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const { result } = await cdp('Runtime.evaluate', {
        expression: `location.href === ${JSON.stringify(url)} && document.readyState !== 'loading' && !!document.querySelector('#view-switch')`,
        returnByValue: true,
      }, sessionId);
      if (result?.value === true) return;
    } catch { /* navigation replaces the document */ }
    await delay(50);
  }
  throw new Error(`switch was not ready for ${url}`);
}
await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
const desktopUrl = `http://127.0.0.1:${port}/`;
await cdp('Page.navigate', { url: desktopUrl }, sessionId);
await waitForSwitch(desktopUrl);

async function readHour() {
  const { result } = await cdp('Runtime.evaluate', {
    expression: `(() => {
      const slider = document.querySelector('[role=slider]');
      const day = getComputedStyle(document.documentElement).getPropertyValue('--t').trim();
      return { now: slider.getAttribute('aria-valuenow'), text: slider.getAttribute('aria-valuetext'), day, ready: getComputedStyle(document.documentElement).getPropertyValue('--day-ready').trim() };
    })()`,
    returnByValue: true,
  }, sessionId);
  return result.value;
}
async function clickLink(href) {
  const { result } = await cdp('Runtime.evaluate', {
    expression: `(() => { const link = document.querySelector('#index a[href="${href}"]'); link.scrollIntoView({ inline: 'center', block: 'nearest' }); const rect = link.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`,
    returnByValue: true,
  }, sessionId);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: result.value.x, y: result.value.y, button: 'left', clickCount: 1 }, sessionId);
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: result.value.x, y: result.value.y, button: 'left', clickCount: 1 }, sessionId);
}
const before = await readHour();
assert.equal(before.ready, '0', 'the day image must still be unloaded when the nav is used');
await clickLink('#contact');
const night = await readHour();
assert.equal(night.text, 'Night', 'clicking Contact puts the page in night');
assert.equal(night.now, '100');
assert.ok(Math.abs(Number(night.day)) < 0.001, `night blend was ${night.day}`);
await clickLink('#home');
const day = await readHour();
assert.equal(day.text, 'Day', 'clicking About puts the page in day');
assert.equal(day.now, '0');
assert.ok(Math.abs(Number(day.day) - 1) < 0.001, `day blend was ${day.day}`);
const track = await cdp('Runtime.evaluate', {
  expression: `(() => { const rect = document.querySelector('.nav-track').getBoundingClientRect(); return { y: rect.top + rect.height / 2, left: rect.left + 6, mid: rect.left + rect.width / 2 }; })()`,
  returnByValue: true,
}, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: track.result.value.left, y: track.result.value.y, button: 'left', clickCount: 1 }, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: track.result.value.mid, y: track.result.value.y, button: 'left' }, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: track.result.value.mid, y: track.result.value.y, button: 'left', clickCount: 1 }, sessionId);
const blend = await readHour();
assert.equal(blend.text, 'Dusk', 'dragging to the middle gives a blend');
const blendAmount = Number(blend.day);
assert.ok(blendAmount > 0.35 && blendAmount < 0.65, `middle blend was ${blend.day}`);

await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);
const mobileUrl = `http://127.0.0.1:${port}/?mobile=1`;
await cdp('Page.navigate', { url: mobileUrl }, sessionId);
await waitForSwitch(mobileUrl);
await clickLink('#contact');
const mobileNight = await readHour();
assert.equal(mobileNight.text, 'Night', 'clicking Contact puts a phone in night');
await clickLink('#home');
const mobileDay = await readHour();
assert.equal(mobileDay.text, 'Day', 'clicking About puts a phone in day');
console.log(JSON.stringify({ passed: 1, checks: ['About is day, Contact is night, and the middle of the nav is a blend'] }, null, 2));
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
