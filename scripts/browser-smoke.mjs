import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';
const API_URL = process.env.API_URL ?? 'http://localhost:3000/api';

const ROUTES = [
  '/',
  '/inventory',
  '/products',
  '/warehouses',
  '/suppliers',
  '/customers',
  '/imports',
  '/analytics',
  '/settings',
];

class Cdp {
  constructor(wsUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.ws = new WebSocket(wsUrl);
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const callback = this.pending.get(message.id);
      if (!callback) return;
      this.pending.delete(message.id);
      if (message.error) callback.reject(new Error(message.error.message));
      else callback.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return result;
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  await assertHealthy(`${API_URL.replace(/\/api$/, '')}/docs`, 'API docs');
  await assertHealthy(WEB_URL, 'web app');

  const chromePath = findChrome();
  const debugPort = 9300 + Math.floor(Math.random() * 300);
  const profileDir = path.join(os.tmpdir(), `jupiter-gsm-chrome-${Date.now()}`);
  const screenshotPath = path.join(os.tmpdir(), `jupiter-gsm-dashboard-${Date.now()}.png`);

  await mkdir(profileDir, { recursive: true });
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    WEB_URL,
  ], { stdio: 'ignore' });

  let cdp;
  try {
    const wsUrl = await waitForPage(debugPort);
    cdp = new Cdp(wsUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await navigate(cdp, WEB_URL);

    const loginUser = await evaluate(cdp, `(async () => {
      const response = await fetch('${API_URL}/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@tradingcopilot.local', password: 'Admin@123456' })
      });
      if (!response.ok) throw new Error(await response.text());
      const session = await response.json();
      localStorage.setItem('trading-copilot-session', JSON.stringify(session));
      localStorage.setItem('jupiter-gsm-language', 'tr');
      return session.user.email;
    })()`);

    const routes = [];
    for (const route of ROUTES) {
      await navigate(cdp, `${WEB_URL}${route}`);
      const state = await evaluate(cdp, `(() => ({
        path: location.pathname,
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() ?? '',
        text: document.body.innerText,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
      }))()`);
      if (!state.h1) throw new Error(`Missing page heading for ${route}`);
      if (/Internal server error|Cannot GET|Something went wrong/i.test(state.text)) throw new Error(`Visible error text on ${route}`);
      routes.push({ path: state.path, h1: state.h1, hasHorizontalOverflow: state.hasHorizontalOverflow });
    }

    await navigate(cdp, `${WEB_URL}/`);
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    console.log(JSON.stringify({ loginUser, routes, screenshotPath }, null, 2));
  } finally {
    cdp?.close();
    chrome.kill();
    await wait(500);
    await rm(profileDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function assertHealthy(url, label) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${label} is not healthy: ${response.status}`);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error('Chrome or Edge executable was not found. Set CHROME_PATH to run browser smoke tests.');
  return found;
}

async function waitForPage(debugPort) {
  const endpoint = `http://127.0.0.1:${debugPort}/json/list`;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const targets = await fetch(endpoint).then((response) => response.json());
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await wait(200);
  }
  throw new Error('Chrome DevTools endpoint did not become ready.');
}

async function navigate(cdp, url) {
  await cdp.send('Page.navigate', { url });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const ready = await evaluate(cdp, 'document.readyState');
    if (ready === 'complete') break;
    await wait(100);
  }
  await wait(700);
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    const message = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
    throw new Error(message);
  }
  return result.result.value;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
