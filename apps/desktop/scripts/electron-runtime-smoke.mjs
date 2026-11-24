import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const electron = createRequire(import.meta.url)('electron');
const appDir = fileURLToPath(new URL('../', import.meta.url));
const timeoutMs = 20_000;
let logs = '';

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') return reject(new Error('No free port'));
      const selected = address.port;
      server.close((error) => (error ? reject(error) : resolve(selected)));
    });
  });
}
function launch(dataDir, debugPort) {
  const args = [
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--remote-allow-origins=*',
  ];
  if (debugPort !== undefined) args.push(`--remote-debugging-port=${debugPort}`);
  args.push(appDir);
  const child = spawn(electron, args, {
    cwd: appDir,
    env: { ...process.env, DESKTOP_E2E_USER_DATA_DIR: dataDir, ELECTRON_ENABLE_LOGGING: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.setEncoding('utf8').on('data', (chunk) => {
    logs += chunk;
  });
  child.stderr.setEncoding('utf8').on('data', (chunk) => {
    logs += chunk;
  });
  return child;
}
async function listTargets(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
  if (!response.ok) throw new Error(`CDP HTTP ${response.status}`);
  return response.json();
}
async function waitPage(debugPort, predicate = () => true) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      const targets = await listTargets(debugPort);
      const page = targets.find(
        (item) =>
          item.type === 'page' && item.url?.includes('/out/renderer/index.html') && predicate(item),
      );
      if (page) return page;
    } catch {
      /* Wait for Electron's debugging server. */
    }
    await delay(100);
  }
  throw new Error('Timed out waiting for Electron renderer');
}
function connectCdp(url) {
  if (typeof WebSocket === 'undefined') throw new Error('Node WebSocket API is unavailable');
  const socket = new WebSocket(url);
  const pending = new Map();
  let sequence = 0;
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('CDP connection failed')), {
      once: true,
    });
  });
  socket.addEventListener('message', (event) => {
    let message;
    try {
      message = JSON.parse(String(event.data));
    } catch {
      return;
    }
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    clearTimeout(item.timer);
    message.error
      ? item.reject(new Error(message.error.message ?? 'CDP error'))
      : item.resolve(message.result);
  });
  return {
    ready,
    send(method, params = {}) {
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error('CDP command timed out: ' + method));
        }, 8_000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    async eval(expression) {
      const response = await this.send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (response.exceptionDetails)
        throw new Error(response.exceptionDetails.text ?? 'Renderer evaluation failed');
      return response.result?.value;
    },
    close() {
      try {
        socket.close();
      } catch {
        /* already closed */
      }
    },
  };
}
async function until(check, description) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const result = await check();
      if (result) return result;
    } catch {
      /* renderer loading */
    }
    await delay(100);
  }
  throw new Error('Timed out: ' + description);
}
function click(label) {
  return `(() => {
    const button = Array.from(document.querySelectorAll('button')).find((item) => item.textContent?.trim() === ${JSON.stringify(label)});
    if (!button) return false;
    button.click();
    return true;
  })()`;
}
function setValue(selector, value) {
  return `(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) return false;
    const prototype = node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (!setter) return false;
    setter.call(node, ${JSON.stringify(value)});
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`;
}
function localClock(date, zone) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((item) => item.type === type)?.value ?? '';
  return (
    get('year') + '-' + get('month') + '-' + get('day') + ' ' + get('hour') + ':' + get('minute')
  );
}
async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    delay(6_000).then(() => child.kill('SIGKILL')),
  ]);
}
async function waitExit(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    delay(timeoutMs).then(() => {
      throw new Error('Duplicate instance did not exit after losing the lock');
    }),
  ]);
}

const dataDir = await mkdtemp(join(tmpdir(), 'desktop-e2e-'));
let first, duplicate, restarted, primaryPage, secondPage, restartedPage;
try {
  const debugPort = await freePort();
  first = launch(dataDir, debugPort);
  const firstTarget = await waitPage(debugPort);
  primaryPage = connectCdp(firstTarget.webSocketDebuggerUrl);
  await primaryPage.ready;
  await until(
    () =>
      primaryPage.eval(
        `document.querySelector('h1')?.textContent.trim() === 'Bind this session' && typeof window.desktop?.bind === 'function'`,
      ),
    'bind page and preload',
  );
  await primaryPage.eval(click('Bind'));
  await until(
    () =>
      primaryPage.eval(
        `document.querySelector('[role="alert"]')?.textContent.includes('unusable-email')`,
      ),
    'empty bind validation',
  );
  assert.equal(await primaryPage.eval(setValue('input', 'qa-smoke@example.test')), true);
  await primaryPage.eval(click('Bind'));
  await until(
    () =>
      primaryPage.eval(`document.querySelector('h1')?.textContent.trim() === 'Create the team'`),
    'create team surface',
  );
  await primaryPage.eval(click('Create team'));
  await until(
    () => primaryPage.eval(`document.querySelector('h1')?.textContent.trim() === 'Team'`),
    'workspace surface',
  );
  await primaryPage.eval(click('New event'));
  await until(
    () => primaryPage.eval(`document.querySelector('h1')?.textContent.trim() === 'New event'`),
    'event editor',
  );

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const start = localClock(new Date(Date.now() + 2 * 3_600_000), zone);
  const end = localClock(new Date(Date.now() + 3 * 3_600_000), zone);
  assert.equal(
    await primaryPage.eval(
      `(() => { const node = document.querySelector('input[name="visibility"]'); if (!node) return false; node.click(); return true; })()`,
    ),
    true,
  );
  assert.equal(
    await primaryPage.eval(setValue('input[placeholder="YYYY-MM-DD HH:mm"]', start)),
    true,
  );
  assert.equal(
    await primaryPage.eval(`(() => {
    const inputs = document.querySelectorAll('input[placeholder="YYYY-MM-DD HH:mm"]');
    if (inputs.length < 2) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter.call(inputs[1], ${JSON.stringify(end)});
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`),
    true,
  );
  assert.equal(
    await primaryPage.eval(`(() => {
    const label = Array.from(document.querySelectorAll('label')).find((item) => item.textContent.trim().startsWith('Title'));
    const input = label?.querySelector('input');
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter.call(input, 'Electron smoke event');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`),
    true,
  );
  await primaryPage.eval(click('Save'));
  await until(
    () =>
      primaryPage.eval(
        `document.querySelector('h1')?.textContent.trim() === 'Team' && document.body.innerText.includes('Electron smoke event')`,
      ),
    'saved event visible',
  );
  const documentData = JSON.parse(await readFile(join(dataDir, 'team-record.json'), 'utf8'));
  assert.equal(documentData.status, 'active');
  assert.ok(documentData.events.some((item) => item.title === 'Electron smoke event'));

  await primaryPage.eval(click('Open another session'));
  const secondTarget = await until(
    async () =>
      (await listTargets(debugPort)).find(
        (item) =>
          item.type === 'page' &&
          item.url?.includes('/out/renderer/index.html') &&
          item.id !== firstTarget.id,
      ),
    'second window',
  );
  secondPage = connectCdp(secondTarget.webSocketDebuggerUrl);
  await secondPage.ready;
  await until(
    () =>
      secondPage.eval(`document.querySelector('h1')?.textContent.trim() === 'Bind this session'`),
    'unbound second session',
  );

  duplicate = launch(dataDir, undefined);
  await waitExit(duplicate);
  await until(
    async () => {
      const expression = 'document.body.innerText.includes("A writer already exists.")';
      const primaryNotice = await primaryPage.eval(expression);
      const secondNotice = await secondPage.eval(expression);
      return primaryNotice || secondNotice;
    },
    'single instance notice',
  );

  primaryPage.close();
  secondPage.close();
  primaryPage = undefined;
  secondPage = undefined;
  await stop(first);
  first = undefined;

  const restartPort = await freePort();
  restarted = launch(dataDir, restartPort);
  const restartTarget = await waitPage(restartPort);
  restartedPage = connectCdp(restartTarget.webSocketDebuggerUrl);
  await restartedPage.ready;
  await until(
    () =>
      restartedPage.eval(
        `document.querySelector('h1')?.textContent.trim() === 'Bind this session'`,
      ),
    'restarted bind page',
  );
  await restartedPage.eval(setValue('input', 'qa-smoke@example.test'));
  await restartedPage.eval(click('Bind'));
  await until(
    () =>
      restartedPage.eval(
        `document.querySelector('h1')?.textContent.trim() === 'Team' && document.body.innerText.includes('Electron smoke event')`,
      ),
    'persisted record after restart',
  );
  console.log(
    'Electron runtime smoke passed: window, preload, IPC, bind, create, event save, persistence, second window/process, and restart.',
  );
} catch (error) {
  console.error(error);
  console.error(logs);
  process.exitCode = 1;
} finally {
  primaryPage?.close();
  secondPage?.close();
  restartedPage?.close();
  await stop(first);
  await stop(duplicate);
  await stop(restarted);
  await rm(dataDir, { recursive: true, force: true });
}
