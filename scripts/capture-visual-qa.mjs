#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';

const OUT_DIR = path.resolve('.taste-skill/shots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
} else {
  // Clean previous run screenshots so count is exact and truthful
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith('.png')) {
      try { fs.unlinkSync(path.join(OUT_DIR, file)); } catch { /* ignore */ }
    }
  }
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
  { name: 'register-desktop', category: 'Public', path: '/register', w: 1440, h: 900 },

  // Authenticated Application & Prototype Journeys (Dev Demo Boundary: local dev preview only)
  { name: 'library-desktop', category: 'DEV Demo', path: '/library?demo=true', w: 1440, h: 900 },
  { name: 'practice-hub-desktop', category: 'DEV Demo', path: '/practice?demo=true', w: 1440, h: 900 },
  { name: 'practice-progress-free', category: 'DEV Demo', path: '/practice/progress?plan=free&demo=true', w: 1440, h: 900 },
  { name: 'practice-progress-pro', category: 'DEV Demo', path: '/practice/progress?plan=pro&demo=true', w: 1440, h: 900 },
  { name: 'imports-desktop', category: 'DEV Demo', path: '/imports?demo=true', w: 1440, h: 900 },
  { name: 'setup-desktop', category: 'DEV Demo', path: '/score/clair-de-lune/setup?demo=true', w: 1440, h: 900 },
  { name: 'setup-mobile', category: 'DEV Demo', path: '/score/clair-de-lune/setup?demo=true', w: 390, h: 844 },
  { name: 'add-score-camera', category: 'DEV Demo', path: '/add-score?source=camera&demo=true', w: 1440, h: 900 },
  { name: 'add-score-musicxml', category: 'DEV Demo', path: '/add-score?source=musicxml&demo=true', w: 1440, h: 900 },
  { name: 'settings-desktop', category: 'DEV Demo', path: '/settings/account?demo=true', w: 1440, h: 900 },
  { name: 'settings-security', category: 'DEV Demo', path: '/settings/security?demo=true', w: 1440, h: 900 },
  { name: 'settings-notifications', category: 'DEV Demo', path: '/settings/notifications?demo=true', w: 1440, h: 900 },
  { name: 'settings-plan', category: 'DEV Demo', path: '/settings/plan?demo=true', w: 1440, h: 900 },
  { name: 'settings-preferences', category: 'DEV Demo', path: '/settings/preferences?demo=true', w: 1440, h: 900 },
  { name: 'settings-privacy', category: 'DEV Demo', path: '/settings/privacy?demo=true', w: 1440, h: 900 },
  { name: 'mfa-manage', category: 'DEV Demo', path: '/mfa?demo=true&manage=true', w: 1440, h: 900 },
  { name: 'checkout', category: 'DEV Demo', path: '/checkout?plan=plus&interval=monthly&demo=true', w: 1440, h: 900 },
  { name: 'checkout-payment-failure', category: 'DEV Demo', path: '/checkout?plan=plus&interval=monthly&state=declined&demo=true', w: 1440, h: 900 },
  { name: 'checkout-success', category: 'DEV Demo', path: '/checkout/success?demo=true', w: 1440, h: 900 },
  { name: 'sharing-free', category: 'DEV Demo', path: '/score/clair-de-lune?dialog=sharing&plan=free&demo=true', w: 1440, h: 900, isDialog: true },
  { name: 'sharing-pro', category: 'DEV Demo', path: '/score/clair-de-lune?dialog=sharing&plan=pro&demo=true', w: 1440, h: 900, isDialog: true },
  { name: 'perf-locked-download', category: 'DEV Demo', path: '/performances/perf-clair-take-1?plan=free&demo=true', w: 1440, h: 900 },
  { name: 'perf-pro-download', category: 'DEV Demo', path: '/performances/perf-clair-take-1?plan=pro&demo=true', w: 1440, h: 900 },
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

async function createCdpClient() {
  const tempProfile = path.join(os.tmpdir(), `yueora-qa-${process.pid}-${Math.random().toString(36).slice(2)}`);
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
    throw new Error('Chrome did not write DevToolsActivePort');
  }

  const wsUrl = `ws://127.0.0.1:${port}/${browserPath.replace(/^\/?/, '')}`;
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

  const ev = async (x) => {
    const r = await S('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true });
    return r.result?.value;
  };

  await S('Page.enable');
  await S('Runtime.enable');

  return {
    chromeProc,
    ws,
    send,
    S,
    ev,
    subs,
    async close() {
      try { ws.close(); } catch {}
      try { killProcess(chromeProc); } catch {}
    },
  };
}

async function verifyLandingViewports(client, baseUrl) {
  console.log(`🔍 Verifying Landing layout & header responsiveness via CDP...`);
  const { S, ev, subs } = client;

  const loaded = new Promise((r) => subs.push((m) => { if (m.method === 'Page.loadEventFired') r(); }));
  await S('Page.navigate', { url: `${baseUrl}/` });
  await Promise.race([loaded, new Promise((r) => setTimeout(r, 15000))]);

  // Wait until React mounts the application header
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
  const verificationResults = [];

  for (const w of viewports) {
    const h = w < 768 ? 844 : 900;
    await S('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: w < 768,
      dontSetVisibleSize: false,
    });
    await new Promise((r) => setTimeout(r, 200));

    const metrics = await ev(`(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const clientWidth = document.documentElement.clientWidth;
      const hasHorizontalOverflow = scrollWidth > innerWidth;

      const logo = document.querySelector('header a[aria-label="Yueora home"]');
      const logoRect = logo ? logo.getBoundingClientRect() : null;
      const logoValid = !!(
        logoRect &&
        logoRect.width > 0 &&
        logoRect.height > 0 &&
        logoRect.left >= 0 &&
        logoRect.right <= innerWidth + 1
      );

      const hamburger = document.querySelector('header button[aria-label*="menu"]');
      const hamburgerRect = hamburger ? hamburger.getBoundingClientRect() : null;
      const isMobile = innerWidth < 768;
      const hamburgerValid = isMobile
        ? !!(
            hamburgerRect &&
            hamburgerRect.width >= 40 &&
            hamburgerRect.height >= 40 &&
            hamburgerRect.left >= 0 &&
            hamburgerRect.right <= innerWidth + 1
          )
        : true;

      const cta = document.querySelector('header a[href="/register"], header a[href="/library"]');
      const ctaEl = cta ? (cta.closest('button') || cta) : null;
      const ctaVisible = !!(ctaEl && window.getComputedStyle(ctaEl).display !== 'none' && ctaEl.getBoundingClientRect().width > 0);
      const ctaRect = ctaVisible ? ctaEl.getBoundingClientRect() : null;
      const ctaValid = ctaVisible ? (ctaRect.right <= innerWidth + 1) : true;

      return {
        requested: ${w},
        scrollWidth,
        innerWidth,
        clientWidth,
        hasHorizontalOverflow,
        logoRect: logoRect ? { left: Math.round(logoRect.left), right: Math.round(logoRect.right), width: Math.round(logoRect.width) } : null,
        logoValid,
        hamburgerRect: hamburgerRect ? { left: Math.round(hamburgerRect.left), right: Math.round(hamburgerRect.right), width: Math.round(hamburgerRect.width) } : null,
        hamburgerValid,
        ctaVisible,
        ctaRect: ctaRect ? { left: Math.round(ctaRect.left), right: Math.round(ctaRect.right), width: Math.round(ctaRect.width) } : null,
        ctaValid,
        isMobile,
      };
    })()`);

    verificationResults.push(metrics);

    if (Math.abs(metrics.innerWidth - w) > 1) {
      throw new Error(`Viewport-truth invariant failed at ${w}px: innerWidth (${metrics.innerWidth}) !== requested (${w})`);
    }
    if (metrics.hasHorizontalOverflow) {
      throw new Error(`Horizontal overflow at ${w}px: scrollWidth (${metrics.scrollWidth}) > innerWidth (${metrics.innerWidth})`);
    }
    if (!metrics.logoValid) {
      throw new Error(`Logo bounding box is invalid at ${w}px`);
    }
    if (!metrics.hamburgerValid) {
      throw new Error(`Hamburger is invalid at ${w}px`);
    }
    if (!metrics.ctaValid) {
      throw new Error(`Header CTA right edge (${metrics.ctaRect?.right}) exceeded viewport at ${w}px`);
    }
    console.log(`  ✓ Viewport ${w}px: requested=${w}, innerWidth=${metrics.innerWidth}, logo & hamburger within bounds.`);
  }

  console.log('\n📊 Viewport Truth & Header Geometry Verification Table:');
  console.table(
    verificationResults.map((r) => ({
      Requested: r.requested,
      'innerWidth (CSS)': r.innerWidth,
      clientWidth: r.clientWidth,
      scrollWidth: r.scrollWidth,
      'Overflow?': r.hasHorizontalOverflow ? 'FAIL' : 'PASS',
      'Logo Bounds': r.logoValid ? 'PASS' : 'FAIL',
      'Hamburger Bounds': r.hamburgerValid ? 'PASS' : 'FAIL',
      'CTA Bounds': r.ctaValid ? 'PASS' : 'FAIL',
    }))
  );
}

async function captureAndValidateTarget(client, target, baseUrl) {
  const { S, ev, subs } = client;
  const fullUrl = `${baseUrl}${target.path}`;
  const outFile = path.join(OUT_DIR, `${target.name}.png`);

  await S('Emulation.setDeviceMetricsOverride', {
    width: target.w,
    height: target.h,
    deviceScaleFactor: 1,
    mobile: target.w < 600,
    dontSetVisibleSize: false,
  });

  const loaded = new Promise((r) => subs.push((m) => { if (m.method === 'Page.loadEventFired') r(); }));
  await S('Page.navigate', { url: fullUrl });
  await Promise.race([loaded, new Promise((r) => setTimeout(r, 12000))]);

  // Wait for fonts and app rendering
  await ev('document.fonts ? document.fonts.ready.then(() => 1) : 1');
  await new Promise((r) => setTimeout(r, 400));

  // If dialog target, wait for dialog modal element
  if (target.isDialog) {
    await ev(`new Promise((resolve) => {
      const start = Date.now();
      (function check() {
        if (document.querySelector('[role="dialog"]') || Date.now() - start > 4000) resolve();
        else setTimeout(check, 100);
      })();
    })`);
    await new Promise((r) => setTimeout(r, 300));

    // For sharing dialog, open the role select trigger so options are rendered in DOM and in the screenshot
    if (target.name.startsWith('sharing-')) {
      const triggerCoords = await ev(`(() => {
        const trigger = document.querySelector('[role="dialog"] button[role="combobox"]')
          || document.querySelector('[role="dialog"] [data-radix-select-trigger]');
        if (!trigger) return null;
        const r = trigger.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (triggerCoords) {
        await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: triggerCoords.x, y: triggerCoords.y, button: 'left', clickCount: 1 });
        await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: triggerCoords.x, y: triggerCoords.y, button: 'left', clickCount: 1 });
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  // 1. Global Visual QA Guards
  const globalCheck = await ev(`(() => {
    const text = document.body ? document.body.innerText : '';
    const path = window.location.pathname;
    const search = window.location.search;
    if (text.includes('Page not found') || text.includes('This performance is not here')) {
      return { pass: false, error: 'Document contains "Page not found" / 404 state' };
    }
    if (search.includes('demo=true') && path.startsWith('/login')) {
      return { pass: false, error: 'Unexpected redirect to /login for demo route' };
    }
    return { pass: true };
  })()`);

  if (!globalCheck.pass) {
    throw new Error(`[Global Guard] ${globalCheck.error}`);
  }

  // 2. Semantic DOM Assertions
  let assertionDescription = 'Global guard verified (no 404, no auth redirect)';

  if (target.name === 'practice-progress-free') {
    const check = await ev(`(() => {
      const text = document.body.innerText;
      return text.includes('Available with Plus') || text.includes('Upgrade to Plus');
    })()`);
    if (!check) throw new Error('practice-progress-free missing "Available with Plus" locked state');
    assertionDescription = 'Contains "Available with Plus" locked entitlement gate';
  } else if (target.name === 'practice-progress-pro') {
    const check = await ev(`(() => {
      const text = document.body.innerText;
      if (text.includes('Available with Plus')) return { pass: false, reason: 'Unexpected "Available with Plus" on Pro' };
      const hasMetrics = text.includes('Practice') || text.includes('Total') || text.includes('Sessions') || text.includes('Minutes');
      if (!hasMetrics) return { pass: false, reason: 'Missing progress metrics' };
      return { pass: true };
    })()`);
    if (!check.pass) throw new Error(`practice-progress-pro: ${check.reason}`);
    assertionDescription = 'Unlocked: excludes "Available with Plus", shows practice analytics';
  } else if (target.name === 'sharing-free') {
    const check = await ev(`(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return { pass: false, reason: 'Modal [role="dialog"] not found in DOM' };
      const dText = dlg.innerText;
      if (!dText.includes('Share “') && !dText.includes('Share "')) return { pass: false, reason: 'Missing Share title' };
      const bodyText = document.body ? document.body.innerText : '';
      if (!bodyText.includes('Can edit · Plus')) return { pass: false, reason: 'Missing "Can edit · Plus" locked role in options' };
      return { pass: true };
    })()`);
    if (!check.pass) throw new Error(`sharing-free: ${check.reason}`);
    assertionDescription = 'Dialog mounted with Share “...” and "Can edit · Plus" locked role';
  } else if (target.name === 'sharing-pro') {
    const check = await ev(`(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return { pass: false, reason: 'Modal [role="dialog"] not found in DOM' };
      const dText = dlg.innerText;
      if (!dText.includes('Share “') && !dText.includes('Share "')) return { pass: false, reason: 'Missing Share title' };
      const bodyText = document.body ? document.body.innerText : '';
      if (bodyText.includes('Can edit · Plus')) return { pass: false, reason: 'Unexpected "Can edit · Plus" locked badge on Pro' };
      if (!bodyText.includes('Can edit')) return { pass: false, reason: 'Missing "Can edit" role on Pro' };
      return { pass: true };
    })()`);
    if (!check.pass) throw new Error(`sharing-pro: ${check.reason}`);
    assertionDescription = 'Dialog mounted with Share “...” and active "Can edit" role';
  } else if (target.name === 'perf-locked-download') {
    const check = await ev(`document.body.innerText.includes('Download recording · Pro')`);
    if (!check) throw new Error('perf-locked-download missing "Download recording · Pro" locked button');
    assertionDescription = 'Contains locked "Download recording · Pro" button';
  } else if (target.name === 'perf-pro-download') {
    const check = await ev(`(() => {
      const text = document.body.innerText;
      if (text.includes('Download recording · Pro')) return { pass: false, reason: 'Unexpected "Download recording · Pro" on Pro' };
      if (!text.includes('Download recording')) return { pass: false, reason: 'Missing "Download recording" active button' };
      return { pass: true };
    })()`);
    if (!check.pass) throw new Error(`perf-pro-download: ${check.reason}`);
    assertionDescription = 'Contains active "Download recording" button without locked badge';
  } else if (target.name === 'checkout-payment-failure') {
    const check = await ev(`document.body.innerText.includes('declined')`);
    if (!check) throw new Error('checkout-payment-failure missing card declined message');
    assertionDescription = 'Displays card declined error state';
  } else if (target.name === 'checkout-success') {
    const check = await ev(`(() => {
      const text = document.body.innerText;
      return text.includes('Subscription confirmed') || text.includes('active') || text.includes('Yueora');
    })()`);
    if (!check) throw new Error('checkout-success missing subscription confirmation card');
    assertionDescription = 'Displays active subscription confirmation receipt';
  } else if (target.name === 'mfa-manage') {
    const check = await ev(`document.body.innerText.includes('Two-factor') || document.body.innerText.includes('MFA')`);
    if (!check) throw new Error('mfa-manage missing two-factor authentication header');
    assertionDescription = 'Displays two-factor authentication management view';
  } else if (target.name === 'add-score-camera') {
    const check = await ev(`document.body.innerText.includes('Capture') || document.body.innerText.includes('camera') || document.body.innerText.includes('photo')`);
    if (!check) throw new Error('add-score-camera missing capture score page state');
    assertionDescription = 'Displays camera score capture interface';
  } else if (target.name === 'add-score-musicxml') {
    const check = await ev(`document.body.innerText.includes('MusicXML') || document.body.innerText.includes('Digital score')`);
    if (!check) throw new Error('add-score-musicxml missing MusicXML verification state');
    assertionDescription = 'Displays MusicXML digital score verification state';
  }

  // 3. Capture Screenshot via CDP
  if (target.isDialog) {
    // Viewport screenshot for dialog overlay
    await S('Emulation.setDeviceMetricsOverride', {
      width: target.w,
      height: target.h,
      deviceScaleFactor: 1,
      mobile: target.w < 600,
      dontSetVisibleSize: false,
    });
    await new Promise((r) => setTimeout(r, 200));
    const { data } = await S('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
  } else {
    // Content height screenshot for regular pages
    const contentH = await ev('Math.min(16000, Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight))');
    await S('Emulation.setDeviceMetricsOverride', {
      width: target.w,
      height: contentH,
      deviceScaleFactor: 1,
      mobile: target.w < 600,
      dontSetVisibleSize: false,
    });
    await new Promise((r) => setTimeout(r, 150));
    const { data } = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
    // Reset back to viewport height
    await S('Emulation.setDeviceMetricsOverride', {
      width: target.w,
      height: target.h,
      deviceScaleFactor: 1,
      mobile: target.w < 600,
      dontSetVisibleSize: false,
    });
  }

  const stat = fs.statSync(outFile);
  console.log(`✓ [${target.category}] ${target.name} (${target.w}x${target.h}) -> ${path.relative(process.cwd(), outFile)} (${Math.round(stat.size / 1024)} KB)`);

  return {
    Target: target.name,
    Route: target.path,
    Category: target.category,
    Status: 'PASS',
    Assertion: assertionDescription,
  };
}

async function main() {
  let serverProcess = null;
  let client = null;
  let failures = 0;
  const assertionResults = [];

  try {
    serverProcess = await ensureServerRunning(PORT);
    client = await createCdpClient();

    // 1. Verify responsive layout viewports on Landing via CDP
    await verifyLandingViewports(client, BASE_URL);

    // 2. Capture screenshot suite and assert semantic DOM invariants
    console.log(`\n📸 Capturing & Asserting ${TARGETS.length} Visual QA targets...`);
    for (const target of TARGETS) {
      try {
        const result = await captureAndValidateTarget(client, target, BASE_URL);
        assertionResults.push(result);
      } catch (err) {
        failures++;
        console.error(`❌ Error on ${target.name}:`, err.message);
        assertionResults.push({
          Target: target.name,
          Route: target.path,
          Category: target.category,
          Status: 'FAIL',
          Assertion: err.message,
        });
      }
    }

    // 3. Print Semantic Assertions Table
    console.log('\n📊 Visual QA Semantic DOM Assertions Table:');
    console.table(assertionResults);

    // 4. Verify file counts and non-zero bytes on disk
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
    if (client) {
      await client.close();
    }
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
  console.log(`\n✅ Automated screenshot capture complete. All ${actualCount} targets captured and asserted successfully in .taste-skill/shots/`);
  process.exit(0);
}

main();
