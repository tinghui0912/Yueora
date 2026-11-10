#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';

const OUT_DIR = path.resolve('.taste-skill/shots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PORT = process.env.PORT || 5350;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

const TARGETS = [
  // Public & Commercial Pages across calibrated viewports
  { name: 'landing-1440', category: 'Public', path: '/', w: 1440, h: 900 },
  { name: 'landing-1280', category: 'Public', path: '/', w: 1280, h: 800 },
  { name: 'landing-1024', category: 'Public', path: '/', w: 1024, h: 768 },
  { name: 'landing-390', category: 'Public', path: '/', w: 390, h: 844 },
  { name: 'pricing-1440', category: 'Public', path: '/pricing', w: 1440, h: 900 },
  { name: 'pricing-1024', category: 'Public', path: '/pricing', w: 1024, h: 768 },
  { name: 'pricing-390', category: 'Public', path: '/pricing', w: 390, h: 844 },
  { name: 'about-1440', category: 'Public', path: '/about', w: 1440, h: 900 },
  { name: 'help-1440', category: 'Public', path: '/help', w: 1440, h: 900 },
  { name: 'help-390', category: 'Public', path: '/help', w: 390, h: 844 },
  { name: 'help-article-1440', category: 'Public', path: '/help/change-plan', w: 1440, h: 900 },
  { name: 'help-article-390', category: 'Public', path: '/help/change-plan', w: 390, h: 844 },
  { name: 'login-desktop', category: 'Public', path: '/login', w: 1440, h: 900 },

  // Authenticated Application (Dev Demo Boundary: local dev preview only)
  { name: 'library-desktop', category: 'DEV Demo', path: '/library?demo=true', w: 1440, h: 900 },
  { name: 'practice-hub-desktop', category: 'DEV Demo', path: '/practice?demo=true', w: 1440, h: 900 },
  { name: 'imports-desktop', category: 'DEV Demo', path: '/imports?demo=true', w: 1440, h: 900 },
  { name: 'setup-desktop', category: 'DEV Demo', path: '/score/clair-de-lune/setup?demo=true', w: 1440, h: 900 },
  { name: 'setup-mobile', category: 'DEV Demo', path: '/score/clair-de-lune/setup?demo=true', w: 390, h: 844 },
  { name: 'settings-desktop', category: 'DEV Demo', path: '/settings/account?demo=true', w: 1440, h: 900 },
];

console.log('📸 Starting Yueora Automated Visual QA Screenshot Capture...');
console.log(`Target server: ${BASE_URL}\n`);

function findChrome() {
  const local = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe')
    : null;
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    local,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) {
    throw new Error('Chrome/Chromium binary not found.');
  }
  return found;
}

function checkHealthy(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(Boolean(res.statusCode && res.statusCode < 500));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForHealthy(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkHealthy(url)) return true;
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

function killProcess(proc) {
  if (!proc) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t']);
    } else {
      try { process.kill(-proc.pid, 'SIGKILL'); } catch { proc.kill('SIGKILL'); }
    }
  } catch {}
}

async function ensureServerRunning(port) {
  const isRunning = await checkHealthy(`http://127.0.0.1:${port}/`);
  if (isRunning) {
    console.log(`  ✓ Detected existing server running on port ${port}`);
    return null;
  }

  console.log(`  ⏳ Spawning Vite development server on port ${port}...`);
  const isWin = process.platform === 'win32';
  const serverProc = isWin
    ? spawn('cmd.exe', ['/d', '/s', '/c', `npx.cmd vite --host 127.0.0.1 --port ${port} --strictPort`], { stdio: 'ignore' })
    : spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore', detached: true });

  const healthy = await waitForHealthy(`http://127.0.0.1:${port}/`, 15000);
  if (!healthy) {
    killProcess(serverProc);
    throw new Error(`Failed to start Vite dev server on port ${port}`);
  }

  console.log(`  ✓ Dev server ready on port ${port}\n`);
  return serverProc;
}

async function verifyLandingViewports(baseUrl) {
  console.log(`🔍 Verifying Landing layout & header responsiveness via CDP...`);
  const tempProfile = path.join(os.tmpdir(), `yueora-viewport-${process.pid}`);
  if (!fs.existsSync(tempProfile)) fs.mkdirSync(tempProfile, { recursive: true });
  const portFile = path.join(tempProfile, 'DevToolsActivePort');
  try { fs.rmSync(portFile); } catch {}

  const chromeProc = spawn(findChrome(), [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    `--user-data-dir=${tempProfile}`,
    '--remote-debugging-port=0',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--hide-scrollbars',
    '--mute-audio',
    '--disable-gpu',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=1440,900',
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });

  let port = 0;
  let browserPath = '';
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 100));
    try {
      const lines = fs.readFileSync(portFile, 'utf8').trim().split('\n');
      if (lines[0]) {
        port = +lines[0].trim();
        browserPath = lines[1] ? lines[1].trim() : '';
        break;
      }
    } catch {}
  }

  if (!port) {
    try { killProcess(chromeProc); } catch {}
    throw new Error('Chrome did not write DevToolsActivePort for viewport verification');
  }

  const wsUrl = `ws://127.0.0.1:${port}/${browserPath.replace(/^\/?/, '')}`;

  try {
    const WebSocketClient = globalThis.WebSocket;
    const ws = new WebSocketClient(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let id = 0;
    const pend = new Map();
    const subs = [];

    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        pend.get(m.id)(m);
        pend.delete(m.id);
      } else {
        subs.forEach((f) => f(m));
      }
    });

    const send = (method, params = {}, sessionId) => new Promise((r) => {
      const i = ++id;
      pend.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params, sessionId }));
    });

    const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
    const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });

    const S = async (m, p) => {
      const r = await send(m, p, sessionId);
      if (r.error) throw new Error(`${m}: ${r.error.message}`);
      return r.result;
    };
    const ev = async (x) => (await S('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.value;

    await S('Page.enable');
    await S('Runtime.enable');
    subs.push((m) => {
      if (m.method === 'Runtime.consoleAPICalled') {
        console.log('    [browser console]', m.params.type, m.params.args?.map(a => a.value || a.description).join(' '));
      }
      if (m.method === 'Runtime.exceptionThrown') {
        console.log('    [browser exception]', m.params.exceptionDetails?.text, m.params.exceptionDetails?.exception?.description);
      }
    });
    const loaded = new Promise((r) => subs.push((m) => { if (m.method === 'Page.loadEventFired') r(); }));
    await S('Page.navigate', { url: `${baseUrl}/` });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 15000))]);

    // Wait until React mounts the application header (cold Vite dev compilation takes 5-15s on first visit)
    let headerMounted = false;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const hasHeader = await ev('Boolean(document.querySelector("header a[aria-label=\'Yueora home\']"))');
      if (hasHeader) {
        headerMounted = true;
        break;
      }
      if (i > 0 && i % 10 === 0) {
        console.log(`  ⏳ Waiting for React & components in Vite dev mode (${i * 0.5}s)...`);
      }
    }
    if (!headerMounted) {
      throw new Error('Timed out waiting for Landing header to mount in DOM.');
    }

    await ev('document.fonts ? document.fonts.ready.then(() => 1) : 1');
    await new Promise((r) => setTimeout(r, 600));

    const viewports = [320, 375, 390, 430, 1024, 1280, 1440];
    for (const w of viewports) {
      const h = w < 768 ? 844 : 900;
      await S('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w < 768,
      });
      await new Promise((r) => setTimeout(r, 200));

      const metrics = await ev(`(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > innerWidth;
        const logo = document.querySelector('header a[aria-label="Yueora home"]');
        const logoRect = logo ? logo.getBoundingClientRect() : null;
        const logoVisible = !!(logoRect && logoRect.width > 0 && logoRect.height > 0);
        const hamburger = document.querySelector('header button[aria-label*="menu"]');
        const hamburgerRect = hamburger ? hamburger.getBoundingClientRect() : null;
        const isMobile = window.innerWidth < 768;
        const hamburgerVisible = isMobile
          ? !!(hamburgerRect && hamburgerRect.width > 0 && hamburgerRect.height > 0 && hamburgerRect.right <= window.innerWidth)
          : true;
        return {
          scrollWidth,
          innerWidth,
          hasHorizontalOverflow,
          logoVisible,
          hamburgerVisible,
          isMobile,
        };
      })()`);

      console.log('Metrics at', w, 'px:', metrics);

      if (metrics.hasHorizontalOverflow) {
        throw new Error(`Horizontal overflow at ${w}px: scrollWidth (${metrics.scrollWidth}) > innerWidth (${metrics.innerWidth})`);
      }
      if (!metrics.logoVisible) {
        throw new Error(`Logo is not visible at ${w}px`);
      }
      if (!metrics.hamburgerVisible) {
        throw new Error(`Hamburger is not properly positioned within viewport at ${w}px`);
      }
      console.log(`  ✓ Viewport ${w}px: scrollWidth=${metrics.scrollWidth} <= innerWidth=${metrics.innerWidth}, logo visible, header clean.`);
    }

    try { ws.close(); } catch {}
  } finally {
    try { killProcess(chromeProc); } catch {}
  }
}

async function runShoot(target) {
  const fullUrl = `${BASE_URL}${target.path}`;
  const outFile = path.join(OUT_DIR, `${target.name}.png`);
  const shootScript = path.resolve('.agents/skills/design-taste-frontend/scripts/shoot.mjs');

  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        shootScript,
        '--url', fullUrl,
        '--w', String(target.w),
        '--h', String(target.h),
        '--out', outFile,
        '--no-tiles',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let stdoutBuf = '';
    let stderrBuf = '';
    child.stdout.on('data', (d) => { stdoutBuf += d.toString(); });
    child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

    const timer = setTimeout(() => {
      killProcess(child);
      reject(new Error(`Timeout capturing ${target.name}`));
    }, 45000);

    child.on('exit', (code) => {
      clearTimeout(timer);
      const combined = stdoutBuf + '\n' + stderrBuf;
      if (combined.includes('could not be scrolled to')) {
        reject(new Error(`Unreachable rows detected in ${target.name}:\n${combined}`));
        return;
      }
      if (code === 0 && fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
        console.log(`✓ [${target.category}] ${target.name} (${target.w}x${target.h}) -> ${path.relative(process.cwd(), outFile)}`);
        resolve(outFile);
      } else {
        reject(new Error(`Failed to capture ${target.name} (exit code ${code}): ${combined.trim()}`));
      }
    });
  });
}

async function main() {
  let serverProcess = null;
  let failures = 0;

  try {
    serverProcess = await ensureServerRunning(PORT);

    // 1. Verify responsive layout viewports on Landing via CDP
    await verifyLandingViewports(BASE_URL);

    // 2. Capture screenshot suite
    console.log(`\n📸 Capturing ${TARGETS.length} Visual QA targets...`);
    for (const target of TARGETS) {
      try {
        await runShoot(target);
      } catch (err) {
        failures++;
        console.error(`⚠️ Error capturing ${target.name}:`, err.message);
      }
    }

    // 3. Verify file counts and non-zero bytes on disk
    console.log('\n🔍 Verifying screenshot artifacts on disk...');
    for (const target of TARGETS) {
      const filePath = path.join(OUT_DIR, `${target.name}.png`);
      if (!fs.existsSync(filePath)) {
        failures++;
        console.error(`❌ Missing screenshot file: ${target.name}.png`);
      } else {
        const stat = fs.statSync(filePath);
        if (stat.size < 1000) {
          failures++;
          console.error(`❌ Screenshot file is too small (${stat.size} bytes): ${target.name}.png`);
        }
      }
    }
  } catch (globalErr) {
    console.error('Fatal visual QA runner error:', globalErr);
    failures++;
  } finally {
    if (serverProcess) {
      console.log('\n  🧹 Terminating spawned dev server...');
      killProcess(serverProcess);
    }
  }

  if (failures > 0) {
    console.error(`\n❌ Visual QA capture finished with ${failures} failure(s).`);
    process.exit(1);
  }

  const actualCount = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.png')).length;
  console.log(`\n✅ Automated screenshot capture complete. All ${actualCount} targets captured successfully in .taste-skill/shots/`);
  process.exit(0);
}

main();
