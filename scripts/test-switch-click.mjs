// A real pointer click must flip the switch immediately, even while the day
// photograph is still unloaded. The crossfade may wait; aria-checked may not.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
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
const chrome = spawn(chromeBin, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
  `--remote-debugging-port=${debugPort}`, 'about:blank',
], { stdio: 'ignore' });

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
for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    const version = await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json();
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });
    cdp = cdpFactory(ws);
    break;
  } catch {
    await delay(150);
  }
}
assert.ok(cdp, 'Chrome did not open a debugging port');

const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
await cdp('Page.enable', {}, sessionId);
await cdp('Runtime.enable', {}, sessionId);
await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await cdp('Page.navigate', { url: `http://127.0.0.1:${port}/` }, sessionId);
await delay(2500);

const box = await cdp('Runtime.evaluate', {
  expression: `(() => {
    const node = document.querySelector('[role=switch]');
    const rect = node.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, checked: node.getAttribute('aria-checked'), ready: getComputedStyle(document.documentElement).getPropertyValue('--day-ready').trim() };
  })()`,
  returnByValue: true,
}, sessionId);
assert.equal(box.result.value.checked, 'false');
assert.equal(box.result.value.ready, '0', 'the day image must still be unloaded when the click lands');
await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.result.value.x, y: box.result.value.y, button: 'left', clickCount: 1 }, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.result.value.x, y: box.result.value.y, button: 'left', clickCount: 1 }, sessionId);
const after = await cdp('Runtime.evaluate', {
  expression: `document.querySelector('[role=switch]').getAttribute('aria-checked')`,
  returnByValue: true,
}, sessionId);
assert.equal(after.result.value, 'true', 'a pointer click flips the switch before the day image loads');
const drag = await cdp('Runtime.evaluate', {
  expression: `(() => { const rect = document.querySelector('[role=switch]').getBoundingClientRect(); return { y: rect.top + rect.height / 2, left: rect.left + 8, right: rect.right - 8 }; })()`,
  returnByValue: true,
}, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: drag.result.value.right, y: drag.result.value.y, button: 'left', clickCount: 1 }, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: drag.result.value.left, y: drag.result.value.y, button: 'left' }, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: drag.result.value.left, y: drag.result.value.y, button: 'left', clickCount: 1 }, sessionId);
const dragged = await cdp('Runtime.evaluate', {
  expression: `document.querySelector('[role=switch]').getAttribute('aria-checked')`,
  returnByValue: true,
}, sessionId);
assert.equal(dragged.result.value, 'false', 'a drag back to Researcher stays there when its click arrives');

await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);
await cdp('Page.navigate', { url: `http://127.0.0.1:${port}/?mobile=1` }, sessionId);
await delay(2500);
const mobile = await cdp('Runtime.evaluate', {
  expression: `(() => { const node = document.querySelector('[role=switch]'); const rect = node.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`,
  returnByValue: true,
}, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: mobile.result.value.x, y: mobile.result.value.y, button: 'left', clickCount: 1 }, sessionId);
await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: mobile.result.value.x, y: mobile.result.value.y, button: 'left', clickCount: 1 }, sessionId);
const mobileAfter = await cdp('Runtime.evaluate', {
  expression: `document.querySelector('[role=switch]').getAttribute('aria-checked')`,
  returnByValue: true,
}, sessionId);
assert.equal(mobileAfter.result.value, 'true', 'a pointer click flips the switch on a phone before the day image loads');

chrome.kill('SIGKILL');
server.close();
console.log(JSON.stringify({ passed: 1, checks: ['a real pointer click toggles while the day image is still unloaded'] }, null, 2));
