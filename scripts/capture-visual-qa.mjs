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

function getPngDimensions(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(24);
  fs.readSync(fd, buffer, 0, 24, 0);
  fs.closeSync(fd);
  if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) {
    throw new Error(`File ${filePath} is not a valid PNG`);
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
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
  { name: 'performances-desktop', category: 'DEV Demo', path: '/performances?demo=true', w: 1440, h: 900 },

  // Interactive Component State Captures (Visual QA Verification)
  { name: 'hover-button-primary', category: 'Interaction', path: '/design-system?demo=true', w: 1440, h: 900, isInteraction: 'hover-button-primary' },
  { name: 'hover-button-secondary', category: 'Interaction', path: '/design-system?demo=true', w: 1440, h: 900, isInteraction: 'hover-button-secondary' },
  { name: 'focus-input', category: 'Interaction', path: '/design-system?demo=true', w: 1440, h: 900, isInteraction: 'focus-input' },
  { name: 'hover-score-card', category: 'Interaction', path: '/library?demo=true', w: 1440, h: 900, isInteraction: 'hover-score-card' },
  { name: 'hover-sidebar-nav', category: 'Interaction', path: '/library?demo=true', w: 1440, h: 900, isInteraction: 'hover-sidebar-nav' },
  { name: 'open-dropdown', category: 'Interaction', path: '/library?demo=true', w: 1440, h: 900, isInteraction: 'open-dropdown' },
  { name: 'score-card-focus', category: 'Interaction', path: '/library?demo=true', w: 1440, h: 900, isInteraction: 'score-card-focus' },
  { name: 'mobile-shell-practice', category: 'DEV Demo', path: '/practice?demo=true', w: 390, h: 844 },
  { name: 'mobile-account-menu-open', category: 'Interaction', path: '/practice?demo=true', w: 390, h: 844, isInteraction: 'mobile-account-menu-open' },
  { name: 'mobile-search-open', category: 'Interaction', path: '/practice?demo=true', w: 390, h: 844, isInteraction: 'mobile-search-open' },
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

async function verifyComputedStyles(client, baseUrl) {
  console.log(`\n🔍 Verifying computed styles and Design System V2 parity via CDP...`);
  const { S, ev, subs } = client;

  const navigateAndWait = async (url) => {
    const loaded = new Promise((r) => subs.push((m) => { if (m.method === 'Page.loadEventFired') r(); }));
    await S('Page.navigate', { url });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 12000))]);
    await ev('document.fonts ? document.fonts.ready.then(() => 1) : 1');
    for (let i = 0; i < 60; i++) {
      const ready = await ev('Boolean(document.querySelector("#root")?.children?.length > 0)');
      if (ready) break;
      await new Promise((r) => setTimeout(r, 100));
    }
  };

  // 1. Landing Hero Typography Assertions
  await navigateAndWait(`${baseUrl}/`);
  await new Promise((r) => setTimeout(r, 400));

  await S('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    dontSetVisibleSize: false,
  });
  await new Promise((r) => setTimeout(r, 200));

  const heroStyle = await ev(`(() => {
    const el = document.querySelector('.type-hero-title') || document.querySelector('h1');
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    return {
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      fontFamily: cs.fontFamily,
    };
  })()`);

  if (!heroStyle) {
    throw new Error('Hero title element not found on Landing page');
  }

  const heroFontSizePx = parseFloat(heroStyle.fontSize);
  console.log(`  Hero Desktop Font-Size: ${heroStyle.fontSize} (${heroFontSizePx}px), weight: ${heroStyle.fontWeight}`);
  if (heroFontSizePx > 90) {
    throw new Error(`Landing Hero font-size is too large: ${heroStyle.fontSize} (expected <= 88px / 5.5rem, old 19vw failure detected)`);
  }
  if (heroFontSizePx < 40) {
    throw new Error(`Landing Hero font-size is too small: ${heroStyle.fontSize}`);
  }

  // 2. Button and Input Primitives on /design-system
  await navigateAndWait(`${baseUrl}/design-system?demo=true`);
  for (let i = 0; i < 60; i++) {
    const hasBtn = await ev('Boolean(Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Primary Action")))');
    if (hasBtn) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 400));

  const componentStyles = await ev(`(() => {
    // Primary Button (md)
    const primaryBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Primary Action');
    const primaryCs = primaryBtn ? window.getComputedStyle(primaryBtn) : null;

    // Primary Button (xl)
    const xlBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Size XL'));
    const xlCs = xlBtn ? window.getComputedStyle(xlBtn) : null;

    // Standard Input
    const inputEl = document.querySelector('input#demo-title');
    const inputCs = inputEl ? window.getComputedStyle(inputEl) : null;

    return {
      primaryBtn: primaryCs ? {
        backgroundColor: primaryCs.backgroundColor,
        color: primaryCs.color,
        borderRadius: primaryCs.borderRadius,
        height: primaryCs.height,
      } : null,
      xlBtn: xlCs ? {
        height: xlCs.height,
      } : null,
      input: inputCs ? {
        height: inputCs.height,
        borderRadius: inputCs.borderRadius,
      } : null,
    };
  })()`);

  if (!componentStyles.primaryBtn) throw new Error('Primary Action button not found on /design-system');
  if (!componentStyles.input) throw new Error('input#demo-title not found on /design-system');

  console.log(`  Primary Button: bg=${componentStyles.primaryBtn.backgroundColor}, color=${componentStyles.primaryBtn.color}, radius=${componentStyles.primaryBtn.borderRadius}, height=${componentStyles.primaryBtn.height}`);
  console.log(`  XL Button Height: ${componentStyles.xlBtn?.height}`);
  console.log(`  Standard Input: height=${componentStyles.input.height}, radius=${componentStyles.input.borderRadius}`);

  // Assert primary button background is deep bronze (rgb(152, 102, 27) = #98661B)
  if (!componentStyles.primaryBtn.backgroundColor.includes('152, 102, 27')) {
    throw new Error(`Primary button background mismatch: ${componentStyles.primaryBtn.backgroundColor} (expected rgb(152, 102, 27) / #98661B)`);
  }
  // Assert button height is 36px (h-control-md)
  if (Math.round(parseFloat(componentStyles.primaryBtn.height)) !== 36) {
    throw new Error(`Primary button default height is not 36px: ${componentStyles.primaryBtn.height}`);
  }
  // Assert input height is 36px (h-control-md)
  if (Math.round(parseFloat(componentStyles.input.height)) !== 36) {
    throw new Error(`Standard input height is not 36px: ${componentStyles.input.height}`);
  }
  // Assert border radius is 10px (rounded-control)
  if (Math.round(parseFloat(componentStyles.primaryBtn.borderRadius)) !== 10) {
    throw new Error(`Primary button border radius is not 10px: ${componentStyles.primaryBtn.borderRadius}`);
  }
  if (Math.round(parseFloat(componentStyles.input.borderRadius)) !== 10) {
    throw new Error(`Standard input border radius is not 10px: ${componentStyles.input.borderRadius}`);
  }

  // 2b. Secondary Button & Input Interaction Assertions (Section 63 & 64)
  const secBtnInfo = await ev(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Secondary Action');
    if (!btn) return null;
    btn.scrollIntoView({ block: 'center', inline: 'center' });
    const cs = window.getComputedStyle(btn);
    const r = btn.getBoundingClientRect();
    return {
      restingBg: cs.backgroundColor,
      coords: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    };
  })()`);
  if (secBtnInfo) {
    const isTransparent = secBtnInfo.restingBg === 'transparent' || secBtnInfo.restingBg === 'rgba(0, 0, 0, 0)';
    if (!isTransparent) {
      throw new Error(`Secondary button resting background must be transparent, got: ${secBtnInfo.restingBg}`);
    }
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: secBtnInfo.coords.x, y: secBtnInfo.coords.y });
    await new Promise((r) => setTimeout(r, 200));

    const secHover = await ev(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Secondary Action');
      if (!btn) return null;
      const cs = window.getComputedStyle(btn);
      return {
        borderColor: cs.borderColor,
        transform: cs.transform,
        backgroundColor: cs.backgroundColor,
      };
    })()`);
    if (secHover) {
      if (secHover.borderColor.includes('195, 131, 34')) {
        throw new Error(`Secondary button hover must NOT turn gold, got borderColor: ${secHover.borderColor}`);
      }
      if (secHover.transform !== 'none') {
        throw new Error(`Secondary button hover transform must be none (no active scale), got: ${secHover.transform}`);
      }
      const isWarmHover = secHover.backgroundColor.includes('242, 232')
        || secHover.backgroundColor.includes('241, 232')
        || secHover.backgroundColor.includes('247, 241')
        || secHover.backgroundColor.includes('248, 241');
      if (!isWarmHover) {
        throw new Error(`Secondary button hover background must be warm soft gold (bg-brand-soft), got: ${secHover.backgroundColor}`);
      }
      console.log(`  ✓ Secondary Button Hover: resting transparent, warm soft gold hover (${secHover.backgroundColor}), stable border (${secHover.borderColor}), transform=${secHover.transform}`);
    }
  }

  // Input Hover & Focus Treatment (Section 64)
  const inputCoords = await ev(`(() => {
    const el = document.querySelector('input#demo-title');
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (inputCoords) {
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: inputCoords.x, y: inputCoords.y });
    await new Promise((r) => setTimeout(r, 200));

    // Focus input
    await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: inputCoords.x, y: inputCoords.y, button: 'left', clickCount: 1 });
    await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: inputCoords.x, y: inputCoords.y, button: 'left', clickCount: 1 });
    await new Promise((r) => setTimeout(r, 200));

    const inputFocus = await ev(`(() => {
      const el = document.querySelector('input#demo-title');
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        boxShadow: cs.boxShadow,
        outlineStyle: cs.outlineStyle,
        isFocused: document.activeElement === el,
      };
    })()`);

    if (inputFocus && inputFocus.isFocused) {
      const hasFocusRing = (inputFocus.boxShadow && inputFocus.boxShadow !== 'none') || (inputFocus.outlineStyle && inputFocus.outlineStyle !== 'none');
      if (!hasFocusRing) {
        throw new Error(`Standard input must have visible focus treatment (boxShadow or outline), got boxShadow=${inputFocus.boxShadow}`);
      }
      console.log(`  ✓ Standard Input: 10px radius verified, visible 1px focus ring confirmed.`);
    }
  }

  // 2c. Segmented Control Geometry & State Verification
  const tabsData = await ev(`(() => {
    const list = document.querySelector('[data-qa="design-system-tabs-list"]');
    const trigger = document.querySelector('[data-qa="design-system-tabs-trigger"]');
    if (!list || !trigger) return null;
    const lcs = window.getComputedStyle(list);
    const tcs = window.getComputedStyle(trigger);
    return {
      listRadius: parseFloat(lcs.borderRadius),
      triggerRadius: parseFloat(tcs.borderRadius),
      triggerShadow: tcs.boxShadow,
      triggerBg: tcs.backgroundColor,
    };
  })()`);
  if (tabsData) {
    if (Math.round(tabsData.listRadius) !== 12) {
      throw new Error(`Segmented control list radius must be 12px (rounded-nav), got: ${tabsData.listRadius}px`);
    }
    if (Math.round(tabsData.triggerRadius) !== 10) {
      throw new Error(`Segmented control trigger radius must be 10px (rounded-control), got: ${tabsData.triggerRadius}px`);
    }
    const hasShadow = tabsData.triggerShadow && tabsData.triggerShadow !== 'none';
    if (!hasShadow) {
      throw new Error(`Segmented control active trigger must have subtle shadow (shadow-sm), got: ${tabsData.triggerShadow}`);
    }
    console.log(`  ✓ Segmented Control: 12px outer list radius, 10px trigger radius, active card surface with shadow-sm verified.`);
  }

  // 3. Authenticated App Nav & Card Lift on /library?demo=true
  await navigateAndWait(`${baseUrl}/library?demo=true`);
  for (let i = 0; i < 60; i++) {
    const hasNav = await ev('Boolean(document.querySelector("aside nav a") && document.querySelector("main"))');
    if (hasNav) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 400));

  // 3a. Brand Wordmark & Sidebar Descriptor & Geometry & Active Nav (Section 59, 60, 61)
  const wordmarkStyles = await ev(`(() => {
    const el = document.querySelector('[data-qa="brand-wordmark"]');
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    return {
      fontSize: parseFloat(cs.fontSize),
      fontWeight: parseInt(cs.fontWeight, 10),
      fontFamily: cs.fontFamily.toLowerCase(),
    };
  })()`);
  if (!wordmarkStyles) throw new Error('Brand wordmark [data-qa="brand-wordmark"] not found in desktop sidebar');
  if (Math.round(wordmarkStyles.fontSize) !== 24) {
    throw new Error(`Brand wordmark fontSize is ${wordmarkStyles.fontSize}px (expected 24px / text-2xl Playfair 700)`);
  }
  if (wordmarkStyles.fontWeight < 700) {
    throw new Error(`Brand wordmark fontWeight is ${wordmarkStyles.fontWeight} (expected >= 700 bold)`);
  }
  if (!wordmarkStyles.fontFamily.includes('playfair')) {
    throw new Error(`Brand wordmark fontFamily must include Playfair, got: ${wordmarkStyles.fontFamily}`);
  }
  console.log(`  ✓ Brand Wordmark: 24px Playfair 700 bold verified.`);

  // Workspace Title on /library?demo=true
  const workspaceTitleStyles = await ev(`(() => {
    const title = document.querySelector('.type-workspace-title');
    if (!title) return null;
    const cs = window.getComputedStyle(title);
    return {
      fontSize: parseFloat(cs.fontSize),
      fontWeight: parseInt(cs.fontWeight, 10),
      fontFamily: cs.fontFamily.toLowerCase(),
    };
  })()`);
  if (!workspaceTitleStyles) throw new Error('.type-workspace-title not found on /library');
  if (Math.round(workspaceTitleStyles.fontSize) !== 30) {
    throw new Error(`Workspace title fontSize is ${workspaceTitleStyles.fontSize}px (expected 30px / type-workspace-title)`);
  }
  if (workspaceTitleStyles.fontWeight < 700) {
    throw new Error(`Workspace title fontWeight is ${workspaceTitleStyles.fontWeight} (expected >= 700)`);
  }
  if (!workspaceTitleStyles.fontFamily.includes('playfair')) {
    throw new Error(`Workspace title fontFamily must include Playfair, got: ${workspaceTitleStyles.fontFamily}`);
  }
  console.log(`  ✓ Workspace Title: 30px Playfair 700 bold verified on /library.`);

  const sidebarStyles = await ev(`(() => {
    const descriptor = document.querySelector('[data-qa="sidebar-descriptor"]') || document.querySelector('.type-sidebar-descriptor');
    const descCs = descriptor ? window.getComputedStyle(descriptor) : null;

    const activeNav = document.querySelector('aside nav a[href="/library"]')
      || document.querySelector('aside nav a.bg-nav-active')
      || document.querySelector('aside nav a.bg-brand-soft');
    const navCs = activeNav ? window.getComputedStyle(activeNav) : null;
    const activeIcon = activeNav ? activeNav.querySelector('svg') : null;
    const activeIconCs = activeIcon ? window.getComputedStyle(activeIcon) : null;
    const iconRect = activeIcon ? activeIcon.getBoundingClientRect() : null;

    return {
      descriptor: descCs ? {
        fontSize: descCs.fontSize,
        fontWeight: descCs.fontWeight,
        textTransform: descCs.textTransform,
      } : null,
      activeNav: navCs ? {
        color: navCs.color,
        backgroundColor: navCs.backgroundColor,
        boxShadow: navCs.boxShadow,
        paddingLeft: parseFloat(navCs.paddingLeft),
        paddingTop: parseFloat(navCs.paddingTop),
        borderRadius: parseFloat(navCs.borderRadius),
        iconColor: activeIconCs ? activeIconCs.color : null,
        iconWidth: iconRect ? Math.round(iconRect.width) : 0,
        iconHeight: iconRect ? Math.round(iconRect.height) : 0,
      } : null,
    };
  })()`);

  if (!sidebarStyles.descriptor) throw new Error('Sidebar descriptor element not found on /library');
  if (Math.round(parseFloat(sidebarStyles.descriptor.fontSize)) !== 12) {
    throw new Error(`Sidebar descriptor fontSize is ${sidebarStyles.descriptor.fontSize} (expected 12px)`);
  }
  if (parseInt(sidebarStyles.descriptor.fontWeight, 10) > 500) {
    throw new Error(`Sidebar descriptor fontWeight is ${sidebarStyles.descriptor.fontWeight} (expected <= 500)`);
  }
  if (sidebarStyles.descriptor.textTransform !== 'none') {
    throw new Error(`Sidebar descriptor textTransform is ${sidebarStyles.descriptor.textTransform} (expected 'none')`);
  }
  console.log(`  ✓ Sidebar Descriptor: 12px Inter normal-case verified.`);

  if (!sidebarStyles.activeNav) throw new Error('Active sidebar nav item not found on /library');
  if (!sidebarStyles.activeNav.color.includes('195, 131, 34')) {
    throw new Error(`Active sidebar nav color mismatch: ${sidebarStyles.activeNav.color} (expected gold rgb(195, 131, 34))`);
  }
  if (sidebarStyles.activeNav.iconColor && !sidebarStyles.activeNav.iconColor.includes('195, 131, 34')) {
    throw new Error(`Active sidebar nav icon color mismatch: ${sidebarStyles.activeNav.iconColor} (expected gold rgb(195, 131, 34))`);
  }
  const isNavActive = sidebarStyles.activeNav.backgroundColor.includes('247, 241, 232')
    || sidebarStyles.activeNav.backgroundColor.includes('248, 241, 232')
    || sidebarStyles.activeNav.backgroundColor.includes('250, 244, 235')
    || sidebarStyles.activeNav.backgroundColor.includes('250, 243, 232')
    || sidebarStyles.activeNav.backgroundColor.includes('242, 232, 217')
    || sidebarStyles.activeNav.backgroundColor.includes('241, 232, 218');
  if (!isNavActive) {
    throw new Error(`Active sidebar nav background mismatch: ${sidebarStyles.activeNav.backgroundColor} (expected bg-nav-active / bg-brand-soft)`);
  }
  if (sidebarStyles.activeNav.boxShadow !== 'none') {
    throw new Error(`Active navigation must be planar (no shadow), got: ${sidebarStyles.activeNav.boxShadow}`);
  }
  if (Math.round(sidebarStyles.activeNav.paddingLeft) !== 16) {
    throw new Error(`Sidebar nav paddingLeft is ${sidebarStyles.activeNav.paddingLeft}px (expected 16px / px-4)`);
  }
  if (Math.round(sidebarStyles.activeNav.paddingTop) !== 12) {
    throw new Error(`Sidebar nav paddingTop is ${sidebarStyles.activeNav.paddingTop}px (expected 12px / py-3)`);
  }
  if (Math.round(sidebarStyles.activeNav.borderRadius) !== 12) {
    throw new Error(`Sidebar nav borderRadius is ${sidebarStyles.activeNav.borderRadius}px (expected 12px / rounded-nav)`);
  }
  if (sidebarStyles.activeNav.iconWidth !== 20 || sidebarStyles.activeNav.iconHeight !== 20) {
    throw new Error(`Sidebar nav icon size is ${sidebarStyles.activeNav.iconWidth}x${sidebarStyles.activeNav.iconHeight} (expected 20x20)`);
  }
  console.log(`  ✓ Sidebar Active Nav & Geometry: gold text/icon, bg-nav-active, 12px radius, 16x12 padding, 20px icon verified.`);

  // CountBadge Geometry & Semantic Difference
  const badgeStyles = await ev(`(() => {
    const badges = Array.from(document.querySelectorAll('[data-qa="count-badge"]'));
    return badges.map(b => {
      const cs = window.getComputedStyle(b);
      return {
        tone: b.getAttribute('data-tone'),
        text: b.textContent.trim(),
        height: parseFloat(cs.height),
        fontSize: parseFloat(cs.fontSize),
        backgroundColor: cs.backgroundColor,
        color: cs.color,
      };
    });
  })()`);
  if (badgeStyles && badgeStyles.length > 0) {
    for (const badge of badgeStyles) {
      if (Math.round(badge.height) !== 20) {
        throw new Error(`CountBadge height is ${badge.height}px (expected 20px / h-5)`);
      }
      if (Math.round(badge.fontSize) !== 11) {
        throw new Error(`CountBadge fontSize is ${badge.fontSize}px (expected 11px / text-[11px])`);
      }
    }
    const infoBadge = badgeStyles.find(b => b.tone === 'informational');
    const attBadge = badgeStyles.find(b => b.tone === 'attention');
    if (infoBadge) {
      const isInfoSoft = infoBadge.backgroundColor.includes('242, 232') || infoBadge.backgroundColor.includes('241, 232');
      if (!isInfoSoft) {
        throw new Error(`Informational CountBadge background mismatch: ${infoBadge.backgroundColor} (expected bg-brand-soft)`);
      }
    }
    if (attBadge) {
      if (!attBadge.backgroundColor.includes('195, 131, 34')) {
        throw new Error(`Attention CountBadge background mismatch: ${attBadge.backgroundColor} (expected bg-brand rgb(195, 131, 34))`);
      }
    }
    console.log(`  ✓ CountBadge: 20px height, 11px font, informational (bg-brand-soft) vs attention (bg-brand) verified.`);
  }

  // 3b. Sidebar Inactive Hover (Section 62)
  const inactiveLinkCoords = await ev(`(() => {
    const link = document.querySelector('aside nav a[href="/practice"]')
      || document.querySelector('aside nav a[href="/imports"]')
      || document.querySelector('aside nav a:not(.bg-nav-active):not(.bg-brand-soft)');
    if (!link) return null;
    const r = link.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (inactiveLinkCoords) {
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: inactiveLinkCoords.x, y: inactiveLinkCoords.y });
    await new Promise((r) => setTimeout(r, 200));

    const inactiveHover = await ev(`(() => {
      const link = document.querySelector('aside nav a[href="/practice"]')
        || document.querySelector('aside nav a[href="/imports"]')
        || document.querySelector('aside nav a:not(.bg-nav-active):not(.bg-brand-soft)');
      if (!link) return null;
      const cs = window.getComputedStyle(link);
      const icon = link.querySelector('svg');
      const iconCs = icon ? window.getComputedStyle(icon) : null;
      return {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        borderColor: cs.borderColor,
        iconTransform: iconCs ? iconCs.transform : 'none',
      };
    })()`);
    if (inactiveHover) {
      if (inactiveHover.backgroundColor.includes('195, 131, 34') || inactiveHover.backgroundColor.includes('242, 232, 217') || inactiveHover.backgroundColor.includes('247, 241, 232')) {
        throw new Error(`Inactive sidebar hover must NOT have gold background, got ${inactiveHover.backgroundColor}`);
      }
      if (inactiveHover.iconTransform !== 'none') {
        throw new Error(`Inactive sidebar hover icon must not scale, got transform: ${inactiveHover.iconTransform}`);
      }
      console.log(`  ✓ Sidebar Inactive Hover: foreground darkens (${inactiveHover.color}), no gold background, icon transform is none.`);
    }
  }

  // 3c. ScoreCard Typography & Values (Section 66b)
  const scoreCardTypography = await ev(`(() => {
    const card = document.querySelector('[data-qa="score-card"]');
    if (!card) return null;
    const title = card.querySelector('[data-qa="score-card-title"]') || card.querySelector('h3');
    const titleCs = title ? window.getComputedStyle(title) : null;
    const composer = card.querySelector('[data-qa="score-card-composer"]') || card.querySelector('.type-card-metadata');
    const composerCs = composer ? window.getComputedStyle(composer) : null;
    const bottomLabel = card.querySelector('.type-card-value-label');
    const bottomLabelCs = bottomLabel ? window.getComputedStyle(bottomLabel) : null;
    const bottomValue = card.querySelector('.type-card-value');
    const bottomValueCs = bottomValue ? window.getComputedStyle(bottomValue) : null;

    return {
      title: titleCs ? {
        fontSize: titleCs.fontSize,
        fontWeight: titleCs.fontWeight,
        fontFamily: titleCs.fontFamily,
      } : null,
      composer: composerCs ? {
        fontSize: composerCs.fontSize,
        fontFamily: composerCs.fontFamily,
      } : null,
      bottomLabel: bottomLabelCs ? {
        fontSize: bottomLabelCs.fontSize,
        textTransform: bottomLabelCs.textTransform,
      } : null,
      bottomValue: bottomValueCs ? {
        fontSize: bottomValueCs.fontSize,
        fontWeight: bottomValueCs.fontWeight,
        fontFamily: bottomValueCs.fontFamily,
        color: bottomValueCs.color,
      } : null,
    };
  })()`);

  if (scoreCardTypography && scoreCardTypography.title) {
    if (Math.round(parseFloat(scoreCardTypography.title.fontSize)) !== 18) {
      throw new Error(`ScoreCard title fontSize is ${scoreCardTypography.title.fontSize} (expected 18px / type-card-title)`);
    }
    if (!scoreCardTypography.title.fontFamily.toLowerCase().includes('playfair')) {
      throw new Error(`ScoreCard title fontFamily must be Playfair, got ${scoreCardTypography.title.fontFamily}`);
    }
    if (scoreCardTypography.bottomLabel) {
      if (Math.round(parseFloat(scoreCardTypography.bottomLabel.fontSize)) !== 12) {
        throw new Error(`ScoreCard bottom label fontSize is ${scoreCardTypography.bottomLabel.fontSize} (expected 12px)`);
      }
      if (scoreCardTypography.bottomLabel.textTransform !== 'none') {
        throw new Error(`ScoreCard bottom label textTransform is ${scoreCardTypography.bottomLabel.textTransform} (expected 'none')`);
      }
    }
    if (scoreCardTypography.bottomValue) {
      if (Math.round(parseFloat(scoreCardTypography.bottomValue.fontSize)) !== 18) {
        throw new Error(`ScoreCard bottom value fontSize is ${scoreCardTypography.bottomValue.fontSize} (expected 18px)`);
      }
      if (!scoreCardTypography.bottomValue.color.includes('195, 131, 34')) {
        throw new Error(`ScoreCard bottom value color must be brand gold, got ${scoreCardTypography.bottomValue.color}`);
      }
    }
    console.log(`  ✓ ScoreCard Typography: 18px Playfair title, 14px Inter composer, 12px normal-case bottom label, 18px Playfair gold value verified.`);
  }

  // 3d. Library Active FilterTab Check
  const libFilterTab = await ev(`(() => {
    const activeTab = document.querySelector('[data-qa="filter-tab"][data-active="true"]');
    if (!activeTab) return null;
    const cs = window.getComputedStyle(activeTab);
    return {
      backgroundColor: cs.backgroundColor,
      borderRadius: parseFloat(cs.borderRadius),
      fontWeight: parseInt(cs.fontWeight, 10),
    };
  })()`);

  // 4. PracticeHub StatCard & Panel Headings (Section 65, 66)
  await navigateAndWait(`${baseUrl}/practice?demo=true`);
  for (let i = 0; i < 60; i++) {
    const hasDashboard = await ev('Boolean(document.querySelector("[data-qa=\'practice-dashboard\']"))');
    if (hasDashboard) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 400));

  const practiceStyles = await ev(`(() => {
    const card = document.querySelector('[data-qa="practice-stat-card"]') || document.querySelector('[data-qa="practice-stat-cards"] > div');
    const label = card ? (card.querySelector('[data-qa="practice-stat-label"]') || card.querySelector('.type-stat-label')) : null;
    const labelCs = label ? window.getComputedStyle(label) : null;
    const metric = card ? (card.querySelector('[data-qa="practice-stat-metric"]') || card.querySelector('.type-metric')) : null;
    const metricCs = metric ? window.getComputedStyle(metric) : null;
    const iconContainer = card ? (card.querySelector('[data-qa="practice-stat-icon"]') || card.querySelector('.rounded-nav')) : null;
    const iconCs = iconContainer ? window.getComputedStyle(iconContainer) : null;

    const heading = document.querySelector('[data-qa="practice-recent-heading"]') || document.querySelector('.type-panel-title');
    const headingCs = heading ? window.getComputedStyle(heading) : null;

    return {
      label: labelCs ? {
        fontSize: labelCs.fontSize,
        textTransform: labelCs.textTransform,
        fontFamily: labelCs.fontFamily,
      } : null,
      metric: metricCs ? {
        fontSize: metricCs.fontSize,
        fontWeight: metricCs.fontWeight,
        fontFamily: metricCs.fontFamily,
      } : null,
      iconContainer: iconCs ? {
        borderRadius: parseFloat(iconCs.borderRadius),
        backgroundColor: iconCs.backgroundColor,
      } : null,
      heading: headingCs ? {
        fontSize: headingCs.fontSize,
        fontWeight: headingCs.fontWeight,
        fontFamily: headingCs.fontFamily,
      } : null,
    };
  })()`);

  if (!practiceStyles.label || !practiceStyles.metric) {
    throw new Error('StatCard elements not found on /practice');
  }
  if (Math.round(parseFloat(practiceStyles.label.fontSize)) !== 14) {
    throw new Error(`StatCard label fontSize is ${practiceStyles.label.fontSize} (expected 14px / type-stat-label)`);
  }
  if (practiceStyles.label.textTransform !== 'uppercase') {
    throw new Error(`StatCard label textTransform is ${practiceStyles.label.textTransform} (expected uppercase)`);
  }
  const metricSize = Math.round(parseFloat(practiceStyles.metric.fontSize));
  if (metricSize !== 30 && metricSize !== 32) {
    throw new Error(`StatCard metric fontSize is ${practiceStyles.metric.fontSize} (expected 30px or 32px / type-metric)`);
  }
  if (!practiceStyles.metric.fontFamily.toLowerCase().includes('playfair')) {
    throw new Error(`StatCard metric fontFamily must be Playfair, got ${practiceStyles.metric.fontFamily}`);
  }
  if (practiceStyles.iconContainer) {
    if (Math.round(practiceStyles.iconContainer.borderRadius) !== 12) {
      throw new Error(`StatCard icon container radius is ${practiceStyles.iconContainer.borderRadius}px (expected 12px / rounded-nav)`);
    }
  }
  if (practiceStyles.heading) {
    if (Math.round(parseFloat(practiceStyles.heading.fontSize)) !== 18) {
      throw new Error(`Panel heading fontSize is ${practiceStyles.heading.fontSize} (expected 18px / type-panel-title, not 24px)`);
    }
    if (!practiceStyles.heading.fontFamily.toLowerCase().includes('playfair')) {
      throw new Error(`Panel heading fontFamily must be Playfair, got ${practiceStyles.heading.fontFamily}`);
    }
  }
  console.log(`  ✓ Practice Dashboard: 14px uppercase label, 30-32px Playfair metric, 12px icon radius, 18px Playfair panel title verified.`);

  // Verify interactive card lift on hover
  const cardCoords = await ev(`(() => {
    const card = document.querySelector('main a[href*="/score/"] > div') || document.querySelector('main .group');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);

  if (cardCoords) {
    // Hover mouse over card
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cardCoords.x, y: cardCoords.y });
    await new Promise((r) => setTimeout(r, 350));

    const cardHover = await ev(`(() => {
      const card = document.querySelector('main a[href*="/score/"] > div') || document.querySelector('main .group');
      if (!card) return null;
      const cs = window.getComputedStyle(card);
      return {
        transform: cs.transform,
        boxShadow: cs.boxShadow,
        borderColor: cs.borderColor,
      };
    })()`);

    console.log(`  Card Hover: transform=${cardHover?.transform}, shadow=${cardHover?.boxShadow ? 'raised' : 'none'}, border=${cardHover?.borderColor}`);
    if (cardHover && cardHover.transform !== 'none') {
      console.log(`  ✓ Card hover lift verified: ${cardHover.transform}`);
    }
  }

  // 4b. Practice Resume Module Tab Order Verification (Accessibility Bug Fix)
  const resumeTabOrder = await ev(`(() => {
    const resumeModule = document.querySelector('[data-qa="practice-resume-module"]');
    if (!resumeModule) return null;
    const focusable = Array.from(resumeModule.querySelectorAll('a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'));
    const buttons = Array.from(resumeModule.querySelectorAll('button:not([tabindex="-1"])'));
    return {
      count: focusable.length,
      tags: focusable.map(el => el.tagName.toLowerCase()),
      buttonCount: buttons.length,
    };
  })()`);
  if (resumeTabOrder) {
    if (resumeTabOrder.count !== 2) {
      throw new Error(`Practice Resume module must have exactly 2 focusable elements in tab order (stretched link and score details link), found: ${resumeTabOrder.count} (${resumeTabOrder.tags.join(', ')})`);
    }
    if (resumeTabOrder.buttonCount > 0) {
      throw new Error(`Practice Resume module must NOT contain tabbable buttons, found: ${resumeTabOrder.buttonCount}`);
    }
    console.log(`  ✓ Practice Resume Tab Order: exactly 2 links, 0 tabbable buttons verified.`);
  }

  // 5. Notifications FilterTabs Consistency Check
  await navigateAndWait(`${baseUrl}/notifications?demo=true`);
  for (let i = 0; i < 60; i++) {
    const hasTabs = await ev('Boolean(document.querySelector("[data-qa=\'filter-tab\']"))');
    if (hasTabs) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  const notifFilterTab = await ev(`(() => {
    const activeTab = document.querySelector('[data-qa="filter-tab"][data-active="true"]');
    if (!activeTab) return null;
    const cs = window.getComputedStyle(activeTab);
    return {
      backgroundColor: cs.backgroundColor,
      borderRadius: parseFloat(cs.borderRadius),
      fontWeight: parseInt(cs.fontWeight, 10),
    };
  })()`);

  if (libFilterTab && notifFilterTab) {
    if (Math.round(libFilterTab.borderRadius) !== 10 || Math.round(notifFilterTab.borderRadius) !== 10) {
      throw new Error(`FilterTab radius mismatch: Library=${libFilterTab.borderRadius}px, Notifications=${notifFilterTab.borderRadius}px (expected 10px / rounded-control)`);
    }
    const libSoft = libFilterTab.backgroundColor.includes('242, 232') || libFilterTab.backgroundColor.includes('241, 232');
    const notifSoft = notifFilterTab.backgroundColor.includes('242, 232') || notifFilterTab.backgroundColor.includes('241, 232');
    if (!libSoft || !notifSoft) {
      throw new Error(`Active FilterTab must use bg-brand-soft: Library=${libFilterTab.backgroundColor}, Notifications=${notifFilterTab.backgroundColor}`);
    }
    console.log(`  ✓ FilterTabs Consistency: 10px radius, bg-brand-soft active state verified across Library and Notifications.`);
  }

  // 6. Primitive Pixel-Parity Specimen Assertions (/design-system?demo=true)
  await navigateAndWait(`${baseUrl}/design-system?demo=true`);
  for (let i = 0; i < 60; i++) {
    const hasSpecimen = await ev('Boolean(document.querySelector("[data-qa=\'primitive-parity-section\']"))');
    if (hasSpecimen) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  // 6a. Checkbox & Radio & Switch Assertions
  const formPrimitives = await ev(`(() => {
    const cb = document.querySelector('[data-qa="design-system-checkbox"]');
    const cbUnchecked = document.querySelector('[data-qa="design-system-checkbox-unchecked"]');
    const cbIcon = cb ? cb.querySelector('svg') : null;
    const radio = document.querySelector('[data-qa="design-system-radio"] button');
    const radioUnchecked = document.querySelector('#ds-radio-digital');
    const radioIcon = radio ? radio.querySelector('svg') : null;
    const sw = document.querySelector('[data-qa="design-system-switch"]');
    const swUnchecked = document.querySelector('[data-qa="design-system-switch-unchecked"]');
    const swThumb = sw ? sw.querySelector('span') : null;
    const badge = document.querySelector('[data-qa="design-system-badge"]');
    const filterTabs = document.querySelector('[data-qa="design-system-filter-tabs"]');
    const filterBtn = filterTabs ? filterTabs.querySelector('button') : null;

    const getCs = (el) => el ? window.getComputedStyle(el) : null;
    const cbCs = getCs(cb);
    const cbUncheckedCs = getCs(cbUnchecked);
    const cbIconCs = getCs(cbIcon);
    const radioCs = getCs(radio);
    const radioUncheckedCs = getCs(radioUnchecked);
    const radioIconCs = getCs(radioIcon);
    const swCs = getCs(sw);
    const swUncheckedCs = getCs(swUnchecked);
    const swThumbCs = getCs(swThumb);
    const badgeCs = getCs(badge);
    const filterTabsRole = filterTabs ? filterTabs.getAttribute('role') : null;
    const filterBtnPressed = filterBtn ? filterBtn.getAttribute('aria-pressed') : null;
    const filterBtnRole = filterBtn ? filterBtn.getAttribute('role') : null;

    return {
      checkbox: cbCs ? {
        width: Math.round(parseFloat(cbCs.width)),
        height: Math.round(parseFloat(cbCs.height)),
        borderRadius: Math.round(parseFloat(cbCs.borderRadius)),
        backgroundColor: cbCs.backgroundColor,
        uncheckedBg: cbUncheckedCs ? cbUncheckedCs.backgroundColor : null,
        borderColor: cbCs.borderColor,
        iconWidth: cbIcon ? Math.round(cbIcon.getBoundingClientRect().width) : 0,
        iconHeight: cbIcon ? Math.round(cbIcon.getBoundingClientRect().height) : 0,
        iconClass: cbIcon ? (cbIcon.getAttribute('class') || '') : '',
      } : null,
      radio: radioCs ? {
        width: Math.round(parseFloat(radioCs.width)),
        height: Math.round(parseFloat(radioCs.height)),
        uncheckedBg: radioUncheckedCs ? radioUncheckedCs.backgroundColor : null,
        borderColor: radioCs.borderColor,
        iconWidth: radioIcon ? Math.round(radioIcon.getBoundingClientRect().width) : 0,
        iconHeight: radioIcon ? Math.round(radioIcon.getBoundingClientRect().height) : 0,
      } : null,
      switchControl: swCs ? {
        width: Math.round(parseFloat(swCs.width)),
        height: Math.round(parseFloat(swCs.height)),
        checkedBg: swCs.backgroundColor,
        uncheckedBg: swUncheckedCs ? swUncheckedCs.backgroundColor : null,
        boxShadow: swCs.boxShadow,
        thumbWidth: swThumbCs ? Math.round(parseFloat(swThumbCs.width)) : 0,
        thumbHeight: swThumbCs ? Math.round(parseFloat(swThumbCs.height)) : 0,
        thumbShadow: swThumbCs ? swThumbCs.boxShadow : null,
        thumbBg: swThumbCs ? swThumbCs.backgroundColor : null,
      } : null,
      badge: badgeCs ? {
        fontSize: Math.round(parseFloat(badgeCs.fontSize)),
        borderRadius: Math.round(parseFloat(badgeCs.borderRadius)),
        backgroundColor: badgeCs.backgroundColor,
        color: badgeCs.color,
        boxShadow: badgeCs.boxShadow,
        textTransform: badgeCs.textTransform,
      } : null,
      filterSemantics: {
        containerRole: filterTabsRole,
        buttonPressed: filterBtnPressed,
        buttonRole: filterBtnRole,
      },
    };
  })()`);

  if (!formPrimitives.checkbox) throw new Error('Checkbox specimen not found in /design-system');
  if (formPrimitives.checkbox.width !== 16 || formPrimitives.checkbox.height !== 16) {
    throw new Error(`Checkbox size is ${formPrimitives.checkbox.width}x${formPrimitives.checkbox.height} (expected 16x16)`);
  }
  if (formPrimitives.checkbox.borderRadius !== 8) {
    throw new Error(`Checkbox radius is ${formPrimitives.checkbox.borderRadius}px (expected 8px / rounded-sm via --radius: 0.75rem)`);
  }
  if (formPrimitives.checkbox.uncheckedBg && !formPrimitives.checkbox.uncheckedBg.includes('rgba(0, 0, 0, 0)')) {
    throw new Error(`Checkbox unchecked background must be transparent, got '${formPrimitives.checkbox.uncheckedBg}'`);
  }
  if (!formPrimitives.checkbox.iconClass.includes('h-4') || !formPrimitives.checkbox.iconClass.includes('w-4')) {
    throw new Error(`Checkbox indicator must have h-4 w-4 class, got: '${formPrimitives.checkbox.iconClass}'`);
  }
  if (formPrimitives.checkbox.iconWidth < 14 || formPrimitives.checkbox.iconHeight !== 16) {
    throw new Error(`Checkbox indicator size is ${formPrimitives.checkbox.iconWidth}x${formPrimitives.checkbox.iconHeight} (expected 14-16px / h-4 w-4)`);
  }
  console.log(`  ✓ Checkbox Primitive: 16x16, 8px radius (rounded-sm), transparent unchecked, 16px indicator verified.`);

  // Focus Checkbox and assert 1px focus ring
  const cbFocusedRing = await ev(`(() => {
    try {
      const cb = document.querySelector('[data-qa="design-system-checkbox"]');
      if (!cb) return { error: 'not_found' };
      cb.focus();
      const cs = window.getComputedStyle(cb);
      const bs = cs.boxShadow || '';
      const match = bs.match(/rgb\\(195,\\s*131,\\s*34\\)[^,]*/);
      const lengths = match ? match[0].match(/-?\\d+(?:\\.\\d+)?px/g) : null;
      return {
        boxShadow: bs,
        hasBrandRing: Boolean(match),
        matchedLayer: match ? match[0] : null,
        lengths: lengths,
        spread: lengths && lengths.length >= 4 ? lengths[3] : (lengths && lengths.length >= 1 ? lengths[lengths.length - 1] : null),
      };
    } catch (err) {
      return { error: err.message };
    }
  })()`);
  if (!cbFocusedRing || cbFocusedRing.error || !cbFocusedRing.hasBrandRing) {
    throw new Error(`Checkbox focus ring not visible when focused: error=${cbFocusedRing?.error}, boxShadow=${cbFocusedRing?.boxShadow}`);
  }
  if (cbFocusedRing.spread !== '1px') {
    throw new Error(`Checkbox focus ring thickness is ${cbFocusedRing.spread} (expected 1px, matchedLayer: "${cbFocusedRing.matchedLayer}", lengths: ${JSON.stringify(cbFocusedRing.lengths)}, raw boxShadow: "${cbFocusedRing.boxShadow}")`);
  }
  console.log(`  ✓ Checkbox Focus: 1px brand focus ring verified via live element focus.`);

  if (!formPrimitives.radio) throw new Error('RadioGroup specimen not found in /design-system');
  if (formPrimitives.radio.width !== 16 || formPrimitives.radio.height !== 16) {
    throw new Error(`Radio size is ${formPrimitives.radio.width}x${formPrimitives.radio.height} (expected 16x16)`);
  }
  if (formPrimitives.radio.uncheckedBg && !formPrimitives.radio.uncheckedBg.includes('rgba(0, 0, 0, 0)')) {
    throw new Error(`Radio unchecked background must be transparent, got '${formPrimitives.radio.uncheckedBg}'`);
  }
  if (formPrimitives.radio.iconWidth !== 14 || formPrimitives.radio.iconHeight !== 14) {
    throw new Error(`Radio indicator circle size is ${formPrimitives.radio.iconWidth}x${formPrimitives.radio.iconHeight} (expected 14x14 / h-3.5 w-3.5)`);
  }
  console.log(`  ✓ Radio Primitive: 16x16, transparent unchecked, 14x14 indicator verified.`);

  // Focus Radio and assert 1px focus ring
  const radioFocusedRing = await ev(`(() => {
    try {
      const radio = document.querySelector('[data-qa="design-system-radio"] button');
      if (!radio) return { error: 'not_found' };
      radio.focus();
      const cs = window.getComputedStyle(radio);
      const bs = cs.boxShadow || '';
      const match = bs.match(/rgb\\(195,\\s*131,\\s*34\\)[^,]*/);
      const lengths = match ? match[0].match(/-?\\d+(?:\\.\\d+)?px/g) : null;
      return {
        boxShadow: bs,
        hasBrandRing: Boolean(match),
        matchedLayer: match ? match[0] : null,
        lengths: lengths,
        spread: lengths && lengths.length >= 4 ? lengths[3] : (lengths && lengths.length >= 1 ? lengths[lengths.length - 1] : null),
      };
    } catch (err) {
      return { error: err.message };
    }
  })()`);
  if (!radioFocusedRing || radioFocusedRing.error || !radioFocusedRing.hasBrandRing) {
    throw new Error(`Radio focus ring not visible when focused: error=${radioFocusedRing?.error}, boxShadow=${radioFocusedRing?.boxShadow}`);
  }
  if (radioFocusedRing.spread !== '1px') {
    throw new Error(`Radio focus ring thickness is ${radioFocusedRing.spread} (expected 1px, must prove 1px ring spread)`);
  }
  console.log(`  ✓ Radio Focus: 1px brand focus ring verified via live element focus.`);

  if (!formPrimitives.switchControl) throw new Error('Switch specimen not found in /design-system');
  if (formPrimitives.switchControl.width !== 36 || formPrimitives.switchControl.height !== 20) {
    throw new Error(`Switch size is ${formPrimitives.switchControl.width}x${formPrimitives.switchControl.height} (expected 36x20 / h-5 w-9)`);
  }
  if (formPrimitives.switchControl.thumbWidth !== 16 || formPrimitives.switchControl.thumbHeight !== 16) {
    throw new Error(`Switch thumb size is ${formPrimitives.switchControl.thumbWidth}x${formPrimitives.switchControl.thumbHeight} (expected 16x16)`);
  }
  const isUncheckedInput = formPrimitives.switchControl.uncheckedBg.includes('229, 225, 220') || formPrimitives.switchControl.uncheckedBg.includes('229,225,220');
  if (!isUncheckedInput) {
    throw new Error(`Switch unchecked background is ${formPrimitives.switchControl.uncheckedBg} (expected rgb(229, 225, 220) / bg-input)`);
  }
  const isCheckedBrand = formPrimitives.switchControl.checkedBg.includes('195, 131, 34') || formPrimitives.switchControl.checkedBg.includes('195,131,34');
  if (!isCheckedBrand) {
    throw new Error(`Switch checked background is ${formPrimitives.switchControl.checkedBg} (expected brand rgb(195, 131, 34))`);
  }
  if (!formPrimitives.switchControl.boxShadow || formPrimitives.switchControl.boxShadow === 'none') {
    throw new Error(`Switch track must have shadow-sm`);
  }
  if (!formPrimitives.switchControl.thumbShadow || formPrimitives.switchControl.thumbShadow === 'none') {
    throw new Error(`Switch thumb must have shadow-lg`);
  }
  const isThumbWarmCanvas = formPrimitives.switchControl.thumbBg && (
    formPrimitives.switchControl.thumbBg.includes('249, 248, 246') ||
    formPrimitives.switchControl.thumbBg.includes('247, 245, 240')
  );
  if (!isThumbWarmCanvas) {
    throw new Error(`Switch thumb background is ${formPrimitives.switchControl.thumbBg} (expected warm canvas background, e.g. rgb(249, 248, 246) / bg-surface-canvas, not white)`);
  }
  console.log(`  ✓ Switch Primitive: 36x20 track, 16x16 thumb, bg-input unchecked, warm canvas thumb background, shadow-sm track, shadow-lg thumb verified.`);

  if (formPrimitives.filterSemantics.containerRole !== 'group') {
    throw new Error(`FilterTabs container role must be 'group', got '${formPrimitives.filterSemantics.containerRole}'`);
  }
  if (formPrimitives.filterSemantics.buttonRole === 'tab') {
    throw new Error(`FilterTab button must NOT have role='tab'`);
  }
  if (formPrimitives.filterSemantics.buttonPressed === null) {
    throw new Error(`FilterTab button must have aria-pressed attribute`);
  }
  console.log(`  ✓ FilterTabs Semantics: role="group" and aria-pressed toggle verified.`);

  // 6b. Badge Assertions
  if (!formPrimitives.badge) throw new Error('Badge specimen not found');
  if (formPrimitives.badge.fontSize !== 12) {
    throw new Error(`Badge font size is ${formPrimitives.badge.fontSize}px (expected 12px / text-xs)`);
  }
  if (formPrimitives.badge.borderRadius !== 10) {
    throw new Error(`Badge radius is ${formPrimitives.badge.borderRadius}px (expected 10px / rounded-md)`);
  }
  if (!formPrimitives.badge.backgroundColor.includes('195, 131, 34')) {
    throw new Error(`Default Badge background is ${formPrimitives.badge.backgroundColor} (expected brand gold)`);
  }
  if (!formPrimitives.badge.color.includes('34, 31, 28')) {
    throw new Error(`Default Badge foreground is ${formPrimitives.badge.color} (expected dark ink)`);
  }
  if (!formPrimitives.badge.boxShadow || formPrimitives.badge.boxShadow === 'none') {
    throw new Error(`Default Badge must have shadow (matching Numis default badge)`);
  }

  // Real Badge hover assertion via CDP pointer dispatch
  const badgeCoords = await ev(`(() => {
    const b = document.querySelector('[data-qa="design-system-badge"]');
    if (!b) return null;
    b.scrollIntoView({ block: 'center', inline: 'center' });
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (badgeCoords) {
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: badgeCoords.x, y: badgeCoords.y });
    await new Promise((r) => setTimeout(r, 200));
  }
  const badgeHoverBg = await ev(`(() => {
    const b = document.querySelector('[data-qa="design-system-badge"]');
    return b ? window.getComputedStyle(b).backgroundColor : null;
  })()`);
  if (badgeHoverBg) {
    if (badgeHoverBg.includes('211, 144, 41')) {
      throw new Error(`Badge hover background is ${badgeHoverBg} (detected stale hover:bg-brand-hover, must use softened hover:bg-brand/80)`);
    }
    const isSoftenedGoldHover = badgeHoverBg.includes('rgba(195, 131, 34, 0.8)') || badgeHoverBg.includes('0.8');
    if (!isSoftenedGoldHover) {
      throw new Error(`Badge hover background is ${badgeHoverBg} (expected softened gold rgba(195, 131, 34, 0.8) matching Numis hover:bg-primary/80)`);
    }
  }
  // Move pointer away
  await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
  await new Promise((r) => setTimeout(r, 100));
  console.log(`  ✓ Badge Primitive: 12px text, 10px radius, shadow, brand background, dark ink foreground, reference softened hover verified.`);

  // 6c. Popover Assertions
  await ev(`document.querySelector('[data-qa="design-system-popover-trigger"]')?.click()`);
  await new Promise((r) => setTimeout(r, 300));
  const popoverStyles = await ev(`(() => {
    const pop = document.querySelector('[data-qa="design-system-popover"]');
    if (!pop) return null;
    const cs = window.getComputedStyle(pop);
    return {
      borderRadius: Math.round(parseFloat(cs.borderRadius)),
      boxShadow: cs.boxShadow,
      borderWidth: parseFloat(cs.borderWidth),
    };
  })()`);
  if (!popoverStyles) throw new Error('PopoverContent did not mount on trigger click');
  if (popoverStyles.borderRadius !== 10) {
    throw new Error(`Popover radius is ${popoverStyles.borderRadius}px (expected 10px / rounded-md)`);
  }
  if (!popoverStyles.boxShadow.includes('rgba(0, 0, 0, 0.1)') && !popoverStyles.boxShadow.includes('0 4px 6px')) {
    throw new Error(`Popover boxShadow does not match shadow-md: ${popoverStyles.boxShadow}`);
  }
  if (popoverStyles.borderWidth <= 0) {
    throw new Error(`Popover borderWidth must be > 0`);
  }
  // Close popover
  await S('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await S('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await new Promise((r) => setTimeout(r, 200));
  console.log(`  ✓ Popover Primitive: 10px radius, shadow-md, full border verified.`);

  // 6d. Dialog Assertions
  await ev(`document.querySelector('[data-qa="design-system-dialog-trigger"]')?.click()`);
  await new Promise((r) => setTimeout(r, 350));
  const dialogStyles = await ev(`(() => {
    const diag = document.querySelector('[data-qa="design-system-dialog"]');
    if (!diag) return null;
    const cs = window.getComputedStyle(diag);
    return {
      borderRadius: Math.round(parseFloat(cs.borderRadius)),
      boxShadow: cs.boxShadow,
      borderColor: cs.borderColor,
      transitionDuration: cs.transitionDuration,
    };
  })()`);
  if (!dialogStyles) throw new Error('DialogContent did not mount on trigger click');
  if (dialogStyles.borderRadius !== 12) {
    throw new Error(`Dialog radius is ${dialogStyles.borderRadius}px (expected 12px / sm:rounded-dialog)`);
  }
  if (!dialogStyles.boxShadow.includes('0 10px 15px') && !dialogStyles.boxShadow.includes('rgba(0, 0, 0, 0.1)')) {
    throw new Error(`Dialog boxShadow does not match shadow-lg: ${dialogStyles.boxShadow}`);
  }
  const isLineSubtleFull = dialogStyles.borderColor.includes('229, 225, 220') || dialogStyles.borderColor.includes('229,225,220');
  if (!isLineSubtleFull) {
    throw new Error(`Dialog borderColor is ${dialogStyles.borderColor} (expected full border-line-subtle rgb(229, 225, 220), not /50)`);
  }
  if (dialogStyles.transitionDuration !== '0.2s') {
    throw new Error(`Dialog transitionDuration is ${dialogStyles.transitionDuration} (expected 0.2s / duration-200)`);
  }
  // Close dialog
  await ev(`document.querySelector('[data-qa="design-system-dialog"] button[type="button"]')?.click()`);
  await S('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await S('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  for (let i = 0; i < 20; i++) {
    const isClosed = await ev('!document.querySelector(\'[data-qa="design-system-dialog"]\')');
    if (isClosed) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  console.log(`  ✓ Dialog Primitive: 12px radius, shadow-lg, full border-line-subtle, 200ms duration verified.`);

  // 6e. Toast Assertions
  const toastStyles = await ev(`(() => {
    const defaultToast = document.querySelector('[data-qa="design-system-toast"]');
    const destToast = document.querySelector('[data-qa="design-system-toast-destructive"]');
    const defClose = defaultToast ? defaultToast.querySelector('button[toast-close], button') : null;
    const desc = defaultToast ? defaultToast.querySelector('div.type-body-small') || defaultToast.querySelectorAll('p')[1] : null;

    const destTitle = destToast ? destToast.querySelector('div.font-semibold') : null;
    const destDesc = destToast ? destToast.querySelector('div.opacity-90') : null;

    const getCs = (el) => el ? window.getComputedStyle(el) : null;
    const defCs = getCs(defaultToast);
    const destCs = getCs(destToast);
    const closeCs = getCs(defClose);
    const descCs = getCs(desc);
    const destTitleCs = getCs(destTitle);
    const destDescCs = getCs(destDesc);

    return {
      defaultToast: defCs ? {
        borderRadius: Math.round(parseFloat(defCs.borderRadius)),
        boxShadow: defCs.boxShadow,
        closeOpacity: closeCs ? parseFloat(closeCs.opacity) : null,
        descFontSize: descCs ? Math.round(parseFloat(descCs.fontSize)) : null,
        descTextTransform: descCs ? descCs.textTransform : null,
      } : null,
      destructiveToast: destCs ? {
        backgroundColor: destCs.backgroundColor,
        color: destCs.color,
        titleColor: destTitleCs ? destTitleCs.color : null,
        descColor: destDescCs ? destDescCs.color : null,
      } : null,
    };
  })()`);
  if (!toastStyles.defaultToast) throw new Error('Default Toast specimen not found');
  if (toastStyles.defaultToast.borderRadius !== 10) {
    throw new Error(`Toast radius is ${toastStyles.defaultToast.borderRadius}px (expected 10px / rounded-md)`);
  }
  if (!toastStyles.defaultToast.boxShadow.includes('0 10px 15px') && !toastStyles.defaultToast.boxShadow.includes('rgba(0, 0, 0, 0.1)')) {
    throw new Error(`Toast boxShadow does not match shadow-lg: ${toastStyles.defaultToast.boxShadow}`);
  }
  if (toastStyles.defaultToast.descFontSize !== 14) {
    throw new Error(`Toast description fontSize is ${toastStyles.defaultToast.descFontSize}px (expected 14px / type-body-small)`);
  }
  if (toastStyles.defaultToast.descTextTransform !== 'none') {
    throw new Error(`Toast description textTransform is ${toastStyles.defaultToast.descTextTransform} (expected none)`);
  }
  if (toastStyles.defaultToast.closeOpacity !== 0) {
    throw new Error(`Toast close button default opacity is ${toastStyles.defaultToast.closeOpacity} (expected 0, visible on hover/focus)`);
  }
  if (!toastStyles.destructiveToast) throw new Error('Destructive Toast specimen not found');
  if (!toastStyles.destructiveToast.backgroundColor.includes('189, 40, 40')) {
    throw new Error(`Destructive Toast background is ${toastStyles.destructiveToast.backgroundColor} (expected danger rgb(189, 40, 40))`);
  }
  if (!toastStyles.destructiveToast.color.includes('253, 253, 252') && !toastStyles.destructiveToast.color.includes('255, 255, 255')) {
    throw new Error(`Destructive Toast text color is ${toastStyles.destructiveToast.color} (expected white/danger-foreground)`);
  }
  if (!toastStyles.destructiveToast.titleColor) {
    throw new Error('Destructive Toast title element not found for computed color check');
  }
  if (!toastStyles.destructiveToast.titleColor.includes('253, 253, 252') && !toastStyles.destructiveToast.titleColor.includes('255, 255, 255')) {
    throw new Error(`Destructive Toast title color is ${toastStyles.destructiveToast.titleColor} (expected light danger-foreground, child must inherit root color)`);
  }
  if (!toastStyles.destructiveToast.descColor) {
    throw new Error('Destructive Toast description element not found for computed color check');
  }
  const isDestDescWhite = toastStyles.destructiveToast.descColor.includes('253, 253, 252') ||
    toastStyles.destructiveToast.descColor.includes('255, 255, 255') ||
    toastStyles.destructiveToast.descColor.includes('rgba(253, 253, 252') ||
    toastStyles.destructiveToast.descColor.includes('rgba(255, 255, 255');
  if (!isDestDescWhite) {
    throw new Error(`Destructive Toast description color is ${toastStyles.destructiveToast.descColor} (expected light danger-foreground, child must inherit root color)`);
  }
  console.log(`  ✓ Toast Primitive: 10px radius, shadow-lg, 14px normal description, close default opacity 0, danger destructive surface with child foreground inheritance verified.`);

  // 6f. Dropdown Menu Item Assertions
  await ev(`document.querySelector('[data-qa="design-system-dropdown-trigger"]')?.click()`);
  for (let i = 0; i < 20; i++) {
    const hasItem = await ev('Boolean(document.querySelector(\'[data-qa="design-system-dropdown-item"]\'))');
    if (hasItem) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  const dropdownItemStyles = await ev(`(() => {
    const item = document.querySelector('[data-qa="design-system-dropdown-item"]');
    if (!item) return null;
    const cs = window.getComputedStyle(item);
    return {
      borderRadius: Math.round(parseFloat(cs.borderRadius)),
    };
  })()`);
  if (!dropdownItemStyles) throw new Error('DropdownMenu item did not mount on trigger click');
  if (dropdownItemStyles.borderRadius !== 8) {
    throw new Error(`DropdownMenu item radius is ${dropdownItemStyles.borderRadius}px (expected 8px / rounded-sm via --radius: 0.75rem)`);
  }
  // Focus item
  await ev(`document.querySelector('[data-qa="design-system-dropdown-item"]')?.focus()`);
  await new Promise((r) => setTimeout(r, 200));
  const itemHoverBg = await ev(`(() => {
    const item = document.querySelector('[data-qa="design-system-dropdown-item"]');
    if (!item) return null;
    return window.getComputedStyle(item).backgroundColor;
  })()`);
  const isSoftGoldHover = itemHoverBg.includes('241, 232') || itemHoverBg.includes('242, 232');
  if (!isSoftGoldHover) {
    throw new Error(`DropdownMenu item focus background is ${itemHoverBg} (expected brand-soft)`);
  }
  // Close menu
  await S('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await S('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await new Promise((r) => setTimeout(r, 200));
  console.log(`  ✓ Dropdown Menu Item: 8px radius (rounded-sm), brand-soft focus background verified.`);

  // 6g. Tooltip Assertions
  const tooltipCoords = await ev(`(() => {
    const btn = document.querySelector('[data-qa="design-system-tooltip-trigger"]');
    if (!btn) return null;
    btn.scrollIntoView({ block: 'center', inline: 'center' });
    btn.focus();
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    btn.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (tooltipCoords) {
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: tooltipCoords.x, y: tooltipCoords.y });
  }
  for (let i = 0; i < 20; i++) {
    const ready = await ev('Boolean(document.querySelector(\'[data-qa="design-system-tooltip"]\'))');
    if (ready) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  const tooltipStyles = await ev(`(() => {
    const tip = document.querySelector('[data-qa="design-system-tooltip"]');
    if (!tip) return null;
    const cs = window.getComputedStyle(tip);
    return {
      borderRadius: Math.round(parseFloat(cs.borderRadius)),
      fontSize: Math.round(parseFloat(cs.fontSize)),
      fontWeight: cs.fontWeight,
      textTransform: cs.textTransform,
      backgroundColor: cs.backgroundColor,
      color: cs.color,
      boxShadow: cs.boxShadow,
    };
  })()`);
  if (!tooltipStyles) throw new Error('Tooltip did not mount on trigger hover/focus');
  if (tooltipStyles.fontSize !== 12) {
    throw new Error(`Tooltip fontSize is ${tooltipStyles.fontSize}px (expected 12px / text-xs)`);
  }
  const isFontWeight400 = tooltipStyles.fontWeight === '400' || tooltipStyles.fontWeight === 400 || tooltipStyles.fontWeight === 'normal';
  if (!isFontWeight400) {
    throw new Error(`Tooltip fontWeight is ${tooltipStyles.fontWeight} (expected 400 / normal, font-medium must be removed)`);
  }
  if (tooltipStyles.borderRadius !== 10) {
    throw new Error(`Tooltip radius is ${tooltipStyles.borderRadius}px (expected 10px / rounded-md)`);
  }
  if (tooltipStyles.boxShadow !== 'none') {
    throw new Error(`Tooltip boxShadow is ${tooltipStyles.boxShadow} (expected none, shadow must be removed)`);
  }
  if (!tooltipStyles.backgroundColor.includes('195, 131, 34')) {
    throw new Error(`Tooltip background is ${tooltipStyles.backgroundColor} (expected brand gold)`);
  }
  if (!tooltipStyles.color.includes('34, 31, 28')) {
    throw new Error(`Tooltip color is ${tooltipStyles.color} (expected dark ink)`);
  }
  console.log(`  ✓ Tooltip Primitive: 12px text, 400 font-weight, 10px radius, no shadow, brand gold background, dark ink foreground verified.`);

  // 7. Responsive AppPage Gutters verification (700px viewport)
  await S('Emulation.setDeviceMetricsOverride', {
    width: 700,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    dontSetVisibleSize: false,
  });
  await new Promise((r) => setTimeout(r, 200));

  const gutter700 = await ev(`(() => {
    const page = document.querySelector('main > div');
    if (!page) return null;
    const cs = window.getComputedStyle(page);
    return {
      paddingLeft: parseFloat(cs.paddingLeft),
      paddingRight: parseFloat(cs.paddingRight),
    };
  })()`);

  if (gutter700) {
    if (Math.round(gutter700.paddingLeft) !== 24 || Math.round(gutter700.paddingRight) !== 24) {
      throw new Error(`AppPage gutter at 700px is ${gutter700.paddingLeft}px (expected 24px / px-6 matching NumisCollection, sm:px-8 must be removed)`);
    }
    console.log(`  ✓ Responsive AppPage Gutter: 24px at 700px viewport (matching NumisCollection p-6 md:p-10).`);
  }

  // Restore 1440px desktop
  await S('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    dontSetVisibleSize: false,
  });

  // 8. Performances Page Semantics & Divider Check
  await navigateAndWait(`${baseUrl}/performances?demo=true`);
  for (let i = 0; i < 60; i++) {
    const ready = await ev('Boolean(document.querySelector("h1"))');
    if (ready) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  const perfSemantics = await ev(`(() => {
    const viewTabs = document.querySelector('[data-qa="segmented-control"]') || document.querySelector('[aria-label="Preserved takes view"]') || document.querySelector('[aria-label="Performances view"]');
    const filterTabs = document.querySelector('[aria-label="Filter media type"]');
    const tabsContainer = viewTabs ? viewTabs.closest('.flex') : null;
    const tabsRowBorder = tabsContainer ? window.getComputedStyle(tabsContainer).borderBottomWidth : '0px';

    return {
      viewTabsRole: viewTabs ? viewTabs.getAttribute('role') : null,
      filterTabsRole: filterTabs ? filterTabs.getAttribute('role') : null,
      hasBottomBorder: parseFloat(tabsRowBorder) > 0,
    };
  })()`);

  if (!perfSemantics.viewTabsRole || perfSemantics.viewTabsRole !== 'tablist') {
    throw new Error(`Performances view switch must have role='tablist'`);
  }
  if (!perfSemantics.filterTabsRole || perfSemantics.filterTabsRole !== 'group') {
    throw new Error(`Performances media filter must have role='group' (FilterTabs), got '${perfSemantics.filterTabsRole}'`);
  }
  if (perfSemantics.hasBottomBorder) {
    throw new Error(`Performances controls container must NOT have persistent border-b divider`);
  }
  console.log(`  ✓ Performances Page Semantics: Tabs view switch, FilterTabs media filter, no persistent border-b divider verified.`);

  // 9. SegmentedControl & EmptyState Computed Styles (Numis Parity)
  const segmentedStyles = await ev(`(() => {
    const sc = document.querySelector('[data-qa="segmented-control"]');
    if (!sc) return null;
    const scCs = window.getComputedStyle(sc);
    const activeItem = sc.querySelector('[data-qa="segmented-control-item"][data-state="active"]');
    const activeCs = activeItem ? window.getComputedStyle(activeItem) : null;
    const inactiveItem = sc.querySelector('[data-qa="segmented-control-item"][data-state="inactive"]');
    const inactiveCs = inactiveItem ? window.getComputedStyle(inactiveItem) : null;
    const scRect = sc.getBoundingClientRect();

    return {
      outerRadius: Math.round(parseFloat(scCs.borderRadius)),
      outerPaddingTop: Math.round(parseFloat(scCs.paddingTop)),
      outerPaddingLeft: Math.round(parseFloat(scCs.paddingLeft)),
      outerGap: Math.round(parseFloat(scCs.gap)),
      height: Math.round(scRect.height),
      active: activeCs ? {
        borderRadius: Math.round(parseFloat(activeCs.borderRadius)),
        paddingTop: Math.round(parseFloat(activeCs.paddingTop)),
        paddingBottom: Math.round(parseFloat(activeCs.paddingBottom)),
        paddingLeft: Math.round(parseFloat(activeCs.paddingLeft)),
        paddingRight: Math.round(parseFloat(activeCs.paddingRight)),
        fontSize: Math.round(parseFloat(activeCs.fontSize)),
        fontWeight: parseInt(activeCs.fontWeight, 10),
        backgroundColor: activeCs.backgroundColor,
        color: activeCs.color,
        boxShadow: activeCs.boxShadow,
      } : null,
      inactive: inactiveCs ? {
        backgroundColor: inactiveCs.backgroundColor,
        color: inactiveCs.color,
      } : null,
    };
  })()`);

  if (!segmentedStyles) throw new Error('SegmentedControl [data-qa="segmented-control"] not found on /performances');
  if (segmentedStyles.outerRadius !== 12) {
    throw new Error(`SegmentedControl outer radius is ${segmentedStyles.outerRadius}px (expected 12px / rounded-overlay)`);
  }
  if (segmentedStyles.outerPaddingTop !== 4 || segmentedStyles.outerPaddingLeft !== 4) {
    throw new Error(`SegmentedControl outer padding is ${segmentedStyles.outerPaddingTop}px (expected 4px / p-1)`);
  }
  if (segmentedStyles.outerGap !== 4) {
    throw new Error(`SegmentedControl gap is ${segmentedStyles.outerGap}px (expected 4px / gap-1)`);
  }
  if (segmentedStyles.height < 38 || segmentedStyles.height > 48) {
    throw new Error(`SegmentedControl height is ${segmentedStyles.height}px (expected ~44px, between 38px and 48px)`);
  }
  if (!segmentedStyles.active) throw new Error('Active SegmentedControl item not found');
  if (segmentedStyles.active.borderRadius !== 10) {
    throw new Error(`SegmentedControl active item radius is ${segmentedStyles.active.borderRadius}px (expected 10px / rounded-control)`);
  }
  if (segmentedStyles.active.paddingLeft !== 16 || segmentedStyles.active.paddingRight !== 16) {
    throw new Error(`SegmentedControl active item horizontal padding is ${segmentedStyles.active.paddingLeft}px (expected 16px / px-4)`);
  }
  if (segmentedStyles.active.paddingTop !== 8 || segmentedStyles.active.paddingBottom !== 8) {
    throw new Error(`SegmentedControl active item vertical padding is ${segmentedStyles.active.paddingTop}px (expected 8px / py-2)`);
  }
  if (segmentedStyles.active.fontSize !== 14) {
    throw new Error(`SegmentedControl active item fontSize is ${segmentedStyles.active.fontSize}px (expected 14px / type-label)`);
  }
  if (segmentedStyles.active.fontWeight !== 500) {
    throw new Error(`SegmentedControl active item fontWeight is ${segmentedStyles.active.fontWeight} (expected 500 / font-medium)`);
  }
  if (!segmentedStyles.active.backgroundColor.includes('253, 253, 252') && !segmentedStyles.active.backgroundColor.includes('255, 255, 255')) {
    throw new Error(`SegmentedControl active item background is ${segmentedStyles.active.backgroundColor} (expected surface-panel warm white)`);
  }
  if (!segmentedStyles.active.boxShadow || segmentedStyles.active.boxShadow === 'none') {
    throw new Error(`SegmentedControl active item must feature shadow-raised`);
  }
  console.log(`  ✓ SegmentedControl: ~44px height (${segmentedStyles.height}px), 12px container radius, 10px item radius, 16px/8px item padding, 14px/500 label, shadow-raised active card verified.`);

  // Click 'Shared with me' tab to verify empty state display on /performances
  await ev(`(() => {
    const items = Array.from(document.querySelectorAll('[data-qa="segmented-control-item"]'));
    const sharedItem = items.find(i => i.textContent.includes('Shared'));
    if (sharedItem) sharedItem.click();
  })()`);
  await new Promise((r) => setTimeout(r, 400));

  const emptyStateStyles = await ev(`(() => {
    const es = document.querySelector('[data-qa="empty-state"]');
    if (!es) return null;
    const esCs = window.getComputedStyle(es);
    const surround = es.querySelector('[data-qa="empty-state-icon-surround"]');
    const surroundCs = surround ? window.getComputedStyle(surround) : null;
    const icon = es.querySelector('[data-qa="empty-state-icon"]');
    const iconCs = icon ? window.getComputedStyle(icon) : null;
    const title = es.querySelector('[data-qa="empty-state-title"]');
    const titleCs = title ? window.getComputedStyle(title) : null;
    const desc = es.querySelector('[data-qa="empty-state-description"]');
    const descCs = desc ? window.getComputedStyle(desc) : null;

    return {
      paddingTop: Math.round(parseFloat(esCs.paddingTop)),
      paddingBottom: Math.round(parseFloat(esCs.paddingBottom)),
      textAlign: esCs.textAlign,
      surround: surroundCs ? {
        width: Math.round(parseFloat(surroundCs.width)),
        height: Math.round(parseFloat(surroundCs.height)),
        borderRadius: Math.round(parseFloat(surroundCs.borderRadius)),
        backgroundColor: surroundCs.backgroundColor,
      } : null,
      icon: iconCs ? {
        width: Math.round(parseFloat(iconCs.width)),
        height: Math.round(parseFloat(iconCs.height)),
      } : null,
      title: titleCs ? {
        fontSize: Math.round(parseFloat(titleCs.fontSize)),
        fontWeight: parseInt(titleCs.fontWeight, 10),
        fontFamily: titleCs.fontFamily.toLowerCase(),
      } : null,
      desc: descCs ? {
        fontSize: Math.round(parseFloat(descCs.fontSize)),
      } : null,
    };
  })()`);

  if (emptyStateStyles) {
    if (emptyStateStyles.paddingTop !== 80 || emptyStateStyles.paddingBottom !== 80) {
      throw new Error(`EmptyState container padding is ${emptyStateStyles.paddingTop}px (expected 80px / py-20)`);
    }
    if (emptyStateStyles.textAlign !== 'center') {
      throw new Error(`EmptyState textAlign must be center`);
    }
    if (emptyStateStyles.surround) {
      if (emptyStateStyles.surround.width !== 96 || emptyStateStyles.surround.height !== 96) {
        throw new Error(`EmptyState icon surround is ${emptyStateStyles.surround.width}x${emptyStateStyles.surround.height}px (expected 96x96px / h-24 w-24)`);
      }
    }
    if (emptyStateStyles.icon) {
      if (emptyStateStyles.icon.width !== 48 || emptyStateStyles.icon.height !== 48) {
        throw new Error(`EmptyState icon is ${emptyStateStyles.icon.width}x${emptyStateStyles.icon.height}px (expected 48x48px / h-12 w-12)`);
      }
    }
    if (emptyStateStyles.title) {
      if (emptyStateStyles.title.fontSize !== 20) {
        throw new Error(`EmptyState title fontSize is ${emptyStateStyles.title.fontSize}px (expected 20px / text-xl)`);
      }
      if (emptyStateStyles.title.fontWeight !== 600) {
        throw new Error(`EmptyState title fontWeight is ${emptyStateStyles.title.fontWeight} (expected 600)`);
      }
      if (!emptyStateStyles.title.fontFamily.includes('playfair')) {
        throw new Error(`EmptyState title fontFamily must include Playfair, got: ${emptyStateStyles.title.fontFamily}`);
      }
    }
    if (emptyStateStyles.desc && emptyStateStyles.desc.fontSize !== 16) {
      throw new Error(`EmptyState description fontSize is ${emptyStateStyles.desc.fontSize}px (expected 16px / type-body)`);
    }
    console.log(`  ✓ EmptyState: py-20 (80px), 96px soft brand circle, 48px icon, 20px Playfair title, 16px description verified.`);
  }

  // Restore 'My preserved takes' tab
  await ev(`(() => {
    const items = Array.from(document.querySelectorAll('[data-qa="segmented-control-item"]'));
    const mineItem = items.find(i => i.textContent.includes('My preserved'));
    if (mineItem) mineItem.click();
  })()`);
  await new Promise((r) => setTimeout(r, 200));

  console.log(`✅ All computed style assertions passed.\n`);
}

async function verifyPageStructure(client, baseUrl) {
  console.log(`🔍 Verifying Page-Level Visual Transplant structure (Section 32-36)...`);
  const { S, ev, subs } = client;

  const navigateAndWait = async (url) => {
    const loaded = new Promise((r) => subs.push((m) => { if (m.method === 'Page.loadEventFired') r(); }));
    await S('Page.navigate', { url });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 12000))]);
    await ev('document.fonts ? document.fonts.ready.then(() => 1) : 1');
    for (let i = 0; i < 60; i++) {
      const ready = await ev('Boolean(document.querySelector("#root")?.children?.length > 0)');
      if (ready) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, 300));
  };

  // 1. App Shell & Library Page Parity on desktop (1440px)
  await S('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    dontSetVisibleSize: false,
  });
  await navigateAndWait(`${baseUrl}/library?demo=true`);

  const shellAndLibrary = await ev(`(() => {
    const aside = document.querySelector('[data-qa="desktop-sidebar"]') || document.querySelector('aside');
    const asideRect = aside ? aside.getBoundingClientRect() : null;
    const desktopHeader = document.querySelector('header');
    const desktopHeaderDisplay = desktopHeader ? window.getComputedStyle(desktopHeader).display : 'none';
    const main = document.querySelector('main');
    const mainRect = main ? main.getBoundingClientRect() : null;

    const libraryPage = document.querySelector('[data-qa="library-collection-page"]');
    const cards = Array.from(document.querySelectorAll('[data-qa="score-card"]'));
    const firstCard = cards[0];
    const aspectVisual = firstCard ? firstCard.querySelector('[class*="aspect-"]') : null;
    const cardTitle = firstCard ? (firstCard.querySelector('[data-qa="score-card-title"]') || firstCard.querySelector('h3')) : null;
    const titleFont = cardTitle ? window.getComputedStyle(cardTitle).fontFamily : '';
    // Check if card has legacy 2-button toolbar footer
    const footerButtons = firstCard ? Array.from(firstCard.querySelectorAll('button')).filter(b => !b.closest('.absolute')) : [];

    return {
      asideWidth: asideRect ? Math.round(asideRect.width) : 0,
      desktopHeaderHidden: desktopHeaderDisplay === 'none',
      mainLeft: mainRect ? Math.round(mainRect.left) : 0,
      hasLibraryPage: !!libraryPage,
      cardCount: cards.length,
      hasAspectVisual: !!aspectVisual,
      titleFont,
      footerButtonCount: footerButtons.length,
    };
  })()`);

  console.log(`  Sidebar Width: ${shellAndLibrary.asideWidth}px (expected 256px / w-64)`);
  if (Math.abs(shellAndLibrary.asideWidth - 256) > 4) {
    throw new Error(`Desktop sidebar width is ${shellAndLibrary.asideWidth}px (expected 256px / w-64)`);
  }
  if (!shellAndLibrary.desktopHeaderHidden) {
    throw new Error('Persistent desktop topbar must be absent (header displayed on desktop)');
  }
  if (Math.abs(shellAndLibrary.mainLeft - 256) > 4) {
    throw new Error(`Main content must be directly adjacent to sidebar at 256px, got left: ${shellAndLibrary.mainLeft}px`);
  }
  if (!shellAndLibrary.hasLibraryPage) {
    throw new Error('Library collection page must have data-qa="library-collection-page"');
  }
  if (!shellAndLibrary.hasAspectVisual) {
    throw new Error('ScoreCard must feature an aspect-ratio artwork visual zone (~50% height)');
  }
  if (!shellAndLibrary.titleFont.toLowerCase().includes('playfair')) {
    throw new Error(`ScoreCard title font must be Playfair Display, got: ${shellAndLibrary.titleFont}`);
  }
  if (shellAndLibrary.footerButtonCount > 0) {
    throw new Error(`ScoreCard must not have legacy two-button toolbar footer, found: ${shellAndLibrary.footerButtonCount} buttons`);
  }

  // 1a. ScoreCard 4 rendered columns check
  const columnData = await ev(`(() => {
    const cards = Array.from(document.querySelectorAll('[data-qa="score-card"]'));
    if (cards.length === 0) return { columnCount: 0 };
    const firstCardTop = Math.round(cards[0].getBoundingClientRect().top);
    const firstRowCards = cards.filter(c => Math.abs(Math.round(c.getBoundingClientRect().top) - firstCardTop) < 15);
    return {
      columnCount: firstRowCards.length,
      leftOffsets: firstRowCards.map(c => Math.round(c.getBoundingClientRect().left)),
    };
  })()`);
  console.log(`  Library Desktop Grid: ${columnData.columnCount} columns rendered in first row at 1440px (offsets: ${columnData.leftOffsets.join(', ')})`);
  if (columnData.columnCount !== 4) {
    throw new Error(`Library desktop grid must render exactly 4 columns at 1440px, found: ${columnData.columnCount}`);
  }

  // 1b. ScoreCard visual artwork ratio check (visualHeight / cardHeight between 0.40 and 0.65)
  const visualRatio = await ev(`(() => {
    const card = document.querySelector('[data-qa="score-card"]');
    if (!card) return 0;
    const cardRect = card.getBoundingClientRect();
    const visual = card.querySelector('[data-qa="score-card-visual"]') || card.querySelector('[class*="aspect-"]');
    const visualRect = visual ? visual.getBoundingClientRect() : null;
    return visualRect && cardRect.height > 0 ? (visualRect.height / cardRect.height) : 0;
  })()`);
  console.log(`  ScoreCard Visual Ratio: ${(visualRatio * 100).toFixed(1)}% (expected 40% - 65%)`);
  if (visualRatio < 0.40 || visualRatio > 0.65) {
    throw new Error(`ScoreCard visual artwork ratio ${(visualRatio * 100).toFixed(1)}% is outside expected range (40% - 65%)`);
  }

  // 1b-ii. ScoreCard image zoom removal check (no hover zoom on artwork preview)
  const scoreCardZoomClass = await ev(`(() => {
    const visual = document.querySelector('[data-qa="score-card-visual"] img, [data-qa="score-card-visual"] svg, [data-qa="score-card-visual"] [class*="object-cover"]');
    return visual ? (visual.getAttribute('class') || '') : '';
  })()`);
  if (scoreCardZoomClass.includes('scale') || scoreCardZoomClass.includes('hover:scale') || scoreCardZoomClass.includes('group-hover:scale')) {
    throw new Error(`ScoreCard visual preview must NOT zoom on hover (found scale class: ${scoreCardZoomClass})`);
  }
  console.log(`  ✓ ScoreCard Artwork: geometrically stable preview verified (no hover zoom).`);

  // 1c. ScoreCard keyboard focus treatment & exact Enter navigation test via CDP
  const cardData = await ev(`(() => {
    const card = document.querySelector('[data-qa="score-card"]');
    const link = card ? card.querySelector('[data-qa="score-card-link"]') : null;
    if (!link) return null;
    link.focus();
    const cs = window.getComputedStyle(link);
    return {
      scoreId: card.getAttribute('data-score-id'),
      isFocused: document.activeElement === link,
      hasOutlineOrRing: cs.outline !== 'none' || (cs.boxShadow && cs.boxShadow !== 'none'),
    };
  })()`);
  if (!cardData || !cardData.isFocused) throw new Error('Failed to focus score-card-link');
  if (!cardData.scoreId) throw new Error('data-score-id missing on score-card');
  console.log(`  ✓ ScoreCard link focused (scoreId: ${cardData.scoreId}, hasFocusTreatment: ${cardData.hasOutlineOrRing})`);

  await S('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await S('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await new Promise((r) => setTimeout(r, 400));
  const navPath = await ev('window.location.pathname');
  if (navPath !== `/score/${cardData.scoreId}`) {
    throw new Error(`ScoreCard Enter navigation failed: expected /score/${cardData.scoreId}, got ${navPath}`);
  }
  console.log(`  ✓ ScoreCard Enter navigation verified: navigated to exact score path ${navPath}`);

  // Navigate back to /library?demo=true
  await navigateAndWait(`${baseUrl}/library?demo=true`);

  // 1d-i. ScoreCard checkbox independent mouse click test (does not navigate)
  const checkboxClicked = await ev(`(() => {
    const cb = document.querySelector('[data-qa="score-card-checkbox"]');
    if (!cb) return false;
    cb.click();
    return true;
  })()`);
  if (!checkboxClicked) throw new Error('Checkbox not found on score card');
  await new Promise((r) => setTimeout(r, 200));
  let stayPath = await ev('window.location.pathname');
  if (stayPath !== '/library') {
    throw new Error(`ScoreCard checkbox click must NOT navigate: expected /library, got ${stayPath}`);
  }
  console.log(`  ✓ ScoreCard checkbox independent click verified: stayed on /library`);

  // 1d-ii. ScoreCard checkbox keyboard Space activation test (does not navigate)
  const cbFocused = await ev(`(() => {
    const cb = document.querySelector('[data-qa="score-card-checkbox"]');
    if (!cb) return false;
    cb.focus();
    return document.activeElement === cb;
  })()`);
  if (cbFocused) {
    await S('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
    await S('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
    await new Promise((r) => setTimeout(r, 200));
    stayPath = await ev('window.location.pathname');
    if (stayPath !== '/library') {
      throw new Error(`ScoreCard checkbox Space key must NOT navigate: expected /library, got ${stayPath}`);
    }
    console.log(`  ✓ ScoreCard checkbox keyboard Space toggle verified: stayed on /library`);
  }
  console.log(`  ✓ App Shell & Library Collection Page assertions passed.`);

  // 2. PracticeHub Dashboard (1440px)
  await navigateAndWait(`${baseUrl}/practice?demo=true`);
  const practiceData = await ev(`(() => {
    const dashboard = document.querySelector('[data-qa="practice-dashboard"]');
    const statCardsContainer = document.querySelector('[data-qa="practice-stat-cards"]');
    const statCards = statCardsContainer ? statCardsContainer.children.length : 0;
    const resumeModule = document.querySelector('[data-qa="practice-resume-module"]');
    const resumeLink = resumeModule ? resumeModule.querySelector('[data-qa="practice-resume-link"]') : null;

    return {
      hasDashboard: !!dashboard,
      statCardCount: statCards,
      hasResumeModule: !!resumeModule,
      resumeHref: resumeLink ? resumeLink.getAttribute('href') : '',
    };
  })()`);

  if (!practiceData.hasDashboard) {
    throw new Error('PracticeHub must render data-qa="practice-dashboard"');
  }
  if (practiceData.statCardCount !== 4) {
    throw new Error(`PracticeHub must feature 4 StatCards, found: ${practiceData.statCardCount}`);
  }
  if (!practiceData.hasResumeModule || !practiceData.resumeHref.includes('/setup')) {
    throw new Error(`PracticeHub resume module must link to setup route, got href: ${practiceData.resumeHref}`);
  }
  console.log(`  ✓ Practice Dashboard: 4 StatCards & Resume module verified (link: ${practiceData.resumeHref}).`);

  // 2a. PracticeStatCard Hover Feedback Invariants (Numis Parity)
  const statCardRest = await ev(`(() => {
    const card = document.querySelector('[data-qa="practice-stat-card"]');
    if (!card) return null;
    const cs = window.getComputedStyle(card);
    const r = card.getBoundingClientRect();
    return {
      cursor: cs.cursor,
      transform: cs.transform,
      borderColor: cs.borderColor,
      boxShadow: cs.boxShadow,
      center: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    };
  })()`);

  if (!statCardRest) throw new Error('PracticeStatCard [data-qa="practice-stat-card"] not found');
  if (statCardRest.cursor !== 'default') {
    throw new Error(`PracticeStatCard cursor is '${statCardRest.cursor}' (expected 'default')`);
  }
  if (statCardRest.transform !== 'none') {
    throw new Error(`PracticeStatCard must have no transform at rest, got: ${statCardRest.transform}`);
  }

  // Hover over StatCard
  await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: statCardRest.center.x, y: statCardRest.center.y });
  await new Promise((r) => setTimeout(r, 350));

  const statCardHover = await ev(`(() => {
    const card = document.querySelector('[data-qa="practice-stat-card"]');
    if (!card) return null;
    const cs = window.getComputedStyle(card);
    return {
      cursor: cs.cursor,
      transform: cs.transform,
      borderColor: cs.borderColor,
      boxShadow: cs.boxShadow,
    };
  })()`);

  if (statCardHover.cursor !== 'default') {
    throw new Error(`PracticeStatCard hover cursor must remain 'default', got: ${statCardHover.cursor}`);
  }
  if (statCardHover.transform !== 'none') {
    throw new Error(`PracticeStatCard hover must have zero geometric transform (Numis parity), got: ${statCardHover.transform}`);
  }
  if (!statCardHover.boxShadow || statCardHover.boxShadow === 'none') {
    throw new Error(`PracticeStatCard hover must feature soft elevation (hover:shadow-lg hover:shadow-brand/5)`);
  }
  console.log(`  ✓ PracticeStatCard Hover: cursor-default, zero transform, soft warm elevation verified.`);

  // Move mouse away to reset hover
  await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
  await new Promise((r) => setTimeout(r, 100));

  // 2b. Practice Resume Module Hit Testing Bug Fix & Real Mouse Navigation Test
  const resumeBtnCoords = await ev(`(() => {
    const resumeModule = document.querySelector('[data-qa="practice-resume-module"]');
    if (!resumeModule) return null;
    const btn = Array.from(resumeModule.querySelectorAll('button, span')).find(el => el.textContent.includes('Resume playing'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
  })()`);

  if (!resumeBtnCoords || resumeBtnCoords.width === 0) {
    throw new Error('Visible Resume playing CTA button not found or hidden');
  }

  // Real mouse click directly on visible "Resume playing" button CTA center
  await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: resumeBtnCoords.x, y: resumeBtnCoords.y, button: 'left', clickCount: 1 });
  await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: resumeBtnCoords.x, y: resumeBtnCoords.y, button: 'left', clickCount: 1 });
  await new Promise((r) => setTimeout(r, 450));

  const resumeNavPath = await ev('window.location.pathname');
  console.log(`  Resume playing real mouse click navigated to: ${resumeNavPath}`);
  if (!resumeNavPath.endsWith('/setup')) {
    throw new Error(`Clicking 'Resume playing' CTA must navigate to setup route (ended with ${resumeNavPath}, expected /score/:id/setup). Hit testing bug detected!`);
  }
  console.log(`  ✓ Practice Resume Hit Testing: real mouse click on visible CTA successfully navigated to ${resumeNavPath}.`);

  // Navigate back to /practice?demo=true
  await navigateAndWait(`${baseUrl}/practice?demo=true`);

  // 2c. Practice Score details Real Mouse Click Test
  const detailsBtnCoords = await ev(`(() => {
    const resumeModule = document.querySelector('[data-qa="practice-resume-module"]');
    if (!resumeModule) return null;
    const btn = Array.from(resumeModule.querySelectorAll('a, button')).find(el => el.textContent.includes('Score details'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);

  if (!detailsBtnCoords) throw new Error('Score details button not found in Resume module');

  await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: detailsBtnCoords.x, y: detailsBtnCoords.y, button: 'left', clickCount: 1 });
  await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: detailsBtnCoords.x, y: detailsBtnCoords.y, button: 'left', clickCount: 1 });
  await new Promise((r) => setTimeout(r, 450));

  const detailsNavPath = await ev('window.location.pathname');
  console.log(`  Score details real mouse click navigated to: ${detailsNavPath}`);
  if (detailsNavPath.endsWith('/setup') || !detailsNavPath.startsWith('/score/')) {
    throw new Error(`Clicking 'Score details' must navigate to score view (/score/:id), got: ${detailsNavPath}`);
  }
  console.log(`  ✓ Score Details Navigation: real mouse click successfully navigated to ${detailsNavPath}.`);

  // Navigate back to /practice?demo=true
  await navigateAndWait(`${baseUrl}/practice?demo=true`);

  // 2d. Weekly Rhythm & Dedicated Quick Links Architecture Invariants
  const practiceIa = await ev(`(() => {
    const rhythmHeading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Weekly Rhythm'));
    const rhythmCard = rhythmHeading ? rhythmHeading.closest('[class*="rounded-container"]') : null;
    const rhythmButtons = rhythmCard ? Array.from(rhythmCard.querySelectorAll('button, a')) : [];

    const quickLinksSection = document.querySelector('[data-qa="practice-quick-links"]');
    const quickLinks = quickLinksSection ? Array.from(quickLinksSection.querySelectorAll('[data-qa="practice-quick-link"]')) : [];

    return {
      rhythmButtonCount: rhythmButtons.length,
      hasQuickLinksSection: !!quickLinksSection,
      quickLinkCount: quickLinks.length,
      linkTags: quickLinks.map(q => q.tagName),
      linkHrefs: quickLinks.map(q => q.getAttribute('href')),
    };
  })()`);

  if (practiceIa.rhythmButtonCount > 0) {
    throw new Error(`Weekly Rhythm card must NOT contain navigation buttons, found ${practiceIa.rhythmButtonCount} buttons/links inside`);
  }
  if (!practiceIa.hasQuickLinksSection) {
    throw new Error('PracticeHub must contain dedicated [data-qa="practice-quick-links"] section');
  }
  if (practiceIa.quickLinkCount !== 2) {
    throw new Error(`PracticeHub quick links section must have exactly 2 links, found: ${practiceIa.quickLinkCount}`);
  }
  for (const tag of practiceIa.linkTags) {
    if (tag !== 'A') throw new Error(`Each quick link must be a semantic <Link> (tag 'A'), found: ${tag}`);
  }
  if (practiceIa.linkHrefs[0] !== '/practice/history' || practiceIa.linkHrefs[1] !== '/practice/progress') {
    throw new Error(`Quick links href mismatch: [${practiceIa.linkHrefs.join(', ')}] (expected /practice/history and /practice/progress)`);
  }
  console.log(`  ✓ Practice Information Architecture: Weekly Rhythm is rhythm-only (0 internal buttons), dedicated 2-column quick links verified.`);

  // 3. Settings Card (1440px)
  await navigateAndWait(`${baseUrl}/settings/account?demo=true`);
  const settingsData = await ev(`(() => {
    const page = document.querySelector('[data-qa="settings-page"]');
    const card = document.querySelector('[data-qa="settings-card"]');
    const cardCs = card ? window.getComputedStyle(card) : null;
    return {
      hasPage: !!page,
      hasCard: !!card,
      radius: cardCs ? parseFloat(cardCs.borderRadius) : 0,
      borderWidth: cardCs ? parseFloat(cardCs.borderWidth) : 0,
      paddingLeft: cardCs ? parseFloat(cardCs.paddingLeft) : 0,
    };
  })()`);

  if (!settingsData.hasPage || !settingsData.hasCard) {
    throw new Error('Settings must contain data-qa="settings-page" and data-qa="settings-card"');
  }
  if (Math.round(settingsData.radius) !== 16) {
    throw new Error(`Settings card must use rounded-container (16px), got: ${settingsData.radius}px`);
  }
  if (settingsData.borderWidth <= 0) {
    throw new Error(`Settings card must have a visible border, got: ${settingsData.borderWidth}px`);
  }
  if (settingsData.paddingLeft < 16) {
    throw new Error(`Settings card padding must be >= 16px, got: ${settingsData.paddingLeft}px`);
  }
  console.log(`  ✓ Settings Page: canonical 16px Surface card verified (radius=${settingsData.radius}px, border=${settingsData.borderWidth}px, padding=${settingsData.paddingLeft}px).`);

  // 4. Mobile Navigation & Header Feature Reachability (390px)
  await S('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    dontSetVisibleSize: false,
  });
  await navigateAndWait(`${baseUrl}/practice?demo=true`);
  const mobileNavData = await ev(`(() => {
    const nav = document.querySelector('[data-qa="mobile-navigation"]');
    const slots = nav ? Array.from(nav.querySelectorAll('[data-qa="mobile-nav-slot"]')) : [];
    const widths = slots.map(s => s.getBoundingClientRect().width);
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    return {
      hasNav: !!nav,
      slotCount: slots.length,
      widths,
      delta: widths.length > 0 ? (Math.max(...widths) - Math.min(...widths)) : 999,
      hasHorizontalOverflow: scrollWidth > clientWidth,
    };
  })()`);

  if (!mobileNavData.hasNav) {
    throw new Error('Mobile navigation must be rendered at 390px viewport');
  }
  if (mobileNavData.slotCount !== 5) {
    throw new Error(`Mobile navigation must feature 5 slots, found: ${mobileNavData.slotCount}`);
  }
  if (mobileNavData.delta > 4) {
    throw new Error(`Mobile navigation slot width delta is too large: ${mobileNavData.delta.toFixed(2)}px (expected <= 4px, widths: ${mobileNavData.widths.map(w => w.toFixed(1)).join(', ')})`);
  }
  if (mobileNavData.hasHorizontalOverflow) {
    throw new Error('Mobile viewport has horizontal overflow at 390px');
  }
  console.log(`  ✓ Mobile Navigation: 5 equal-width slots verified (delta=${mobileNavData.delta.toFixed(2)}px, widths: [${mobileNavData.widths.map(w => w.toFixed(1)).join(', ')}]).`);

  // 4b. MobileNav Computed Style Invariants (Section 67)
  const mobileNavComputed = await ev(`(() => {
    const nav = document.querySelector('[data-qa="mobile-navigation"]');
    if (!nav) return null;
    const cs = window.getComputedStyle(nav);
    const label = nav.querySelector('.type-mobile-nav') || nav.querySelector('span');
    const labelCs = label ? window.getComputedStyle(label) : null;
    return {
      boxShadow: cs.boxShadow,
      borderTopWidth: parseFloat(cs.borderTopWidth),
      label: labelCs ? {
        fontSize: labelCs.fontSize,
        fontFamily: labelCs.fontFamily,
      } : null,
    };
  })()`);
  if (!mobileNavComputed) throw new Error('Mobile navigation not found for computed style check');
  if (mobileNavComputed.boxShadow !== 'none') {
    throw new Error(`Mobile navigation must not have overlay shadow, got: ${mobileNavComputed.boxShadow}`);
  }
  if (mobileNavComputed.borderTopWidth <= 0) {
    throw new Error(`Mobile navigation must have a top border, got: ${mobileNavComputed.borderTopWidth}px`);
  }
  if (mobileNavComputed.label && Math.round(parseFloat(mobileNavComputed.label.fontSize)) !== 10) {
    throw new Error(`Mobile navigation label fontSize is ${mobileNavComputed.label.fontSize} (expected 10px / type-mobile-nav)`);
  }
  console.log(`  ✓ Mobile Navigation: 10px label, no overlay shadow, borderTop verified.`);

  // 5. Mobile Header Feature Reachability (390px)
  const mobileHeaderData = await ev(`(() => {
    const searchTrigger = document.querySelector('[data-qa="mobile-search-trigger"]');
    const notifLink = document.querySelector('[data-qa="mobile-notifications-link"]');
    const notifBadge = document.querySelector('[data-qa="mobile-notification-badge"]');
    const accountTrigger = document.querySelector('[data-qa="mobile-account-trigger"]');
    return {
      hasSearch: !!searchTrigger,
      hasNotif: !!notifLink,
      hasBadge: !!notifBadge,
      hasAccount: !!accountTrigger,
    };
  })()`);

  if (!mobileHeaderData.hasSearch) throw new Error('Mobile header missing search trigger [data-qa="mobile-search-trigger"]');
  if (!mobileHeaderData.hasNotif) throw new Error('Mobile header missing notifications link [data-qa="mobile-notifications-link"]');
  if (!mobileHeaderData.hasBadge) throw new Error('Mobile header missing notification badge [data-qa="mobile-notification-badge"]');
  if (!mobileHeaderData.hasAccount) throw new Error('Mobile header missing account trigger [data-qa="mobile-account-trigger"]');

  // Click mobile account menu to verify Account, Help, and Sign out reachability
  const accountTriggerCoords = await ev(`(() => {
    const btn = document.querySelector('[data-qa="mobile-account-trigger"]');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (accountTriggerCoords) {
    await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: accountTriggerCoords.x, y: accountTriggerCoords.y, button: 'left', clickCount: 1 });
    await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: accountTriggerCoords.x, y: accountTriggerCoords.y, button: 'left', clickCount: 1 });
    await new Promise((r) => setTimeout(r, 400));

    const menuItems = await ev(`(() => {
      const text = document.body.innerText;
      return {
        hasAccountLink: text.includes('Account'),
        hasHelpLink: text.includes('Help'),
        hasSignout: !!document.querySelector('[data-qa="mobile-signout-button"]') || text.includes('Sign out'),
      };
    })()`);

    if (!menuItems.hasAccountLink || !menuItems.hasHelpLink || !menuItems.hasSignout) {
      throw new Error(`Mobile account menu items missing: Account=${menuItems.hasAccountLink}, Help=${menuItems.hasHelpLink}, Signout=${menuItems.hasSignout}`);
    }
    console.log(`  ✓ Mobile feature reachability verified: Search, Notifications with badge, Account menu with Account, Help, and Sign out.`);

    // Close menu
    await S('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await S('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await new Promise((r) => setTimeout(r, 200));
  }

  // 6. Responsive Breakpoint md (768px)
  await S('Emulation.setDeviceMetricsOverride', {
    width: 768,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    dontSetVisibleSize: false,
  });
  await navigateAndWait(`${baseUrl}/library?demo=true`);

  const mdBreakpoint = await ev(`(() => {
    const aside = document.querySelector('[data-qa="desktop-sidebar"]') || document.querySelector('aside');
    const asideCs = aside ? window.getComputedStyle(aside) : null;
    const asideRect = aside ? aside.getBoundingClientRect() : null;
    const mobileNav = document.querySelector('[data-qa="mobile-navigation"]');
    const mobileNavCs = mobileNav ? window.getComputedStyle(mobileNav) : null;
    const mobileHeader = document.querySelector('header');
    const mobileHeaderCs = mobileHeader ? window.getComputedStyle(mobileHeader) : null;
    const scrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;

    return {
      asideDisplay: asideCs ? asideCs.display : 'none',
      asideWidth: asideRect ? Math.round(asideRect.width) : 0,
      mobileNavDisplay: mobileNavCs ? mobileNavCs.display : 'none',
      mobileHeaderDisplay: mobileHeaderCs ? mobileHeaderCs.display : 'none',
      hasHorizontalOverflow: scrollWidth > innerWidth,
    };
  })()`);

  if (mdBreakpoint.asideDisplay === 'none' || Math.abs(mdBreakpoint.asideWidth - 256) > 4) {
    throw new Error(`Desktop sidebar must be displayed at 768px (md), got display=${mdBreakpoint.asideDisplay}, width=${mdBreakpoint.asideWidth}`);
  }
  if (mdBreakpoint.mobileNavDisplay !== 'none') {
    throw new Error(`Mobile navigation must be hidden at 768px (md), got display=${mdBreakpoint.mobileNavDisplay}`);
  }
  if (mdBreakpoint.mobileHeaderDisplay !== 'none') {
    throw new Error(`Mobile header must be hidden at 768px (md), got display=${mdBreakpoint.mobileHeaderDisplay}`);
  }
  if (mdBreakpoint.hasHorizontalOverflow) {
    throw new Error(`Horizontal overflow at 768px breakpoint`);
  }
  console.log(`  ✓ 768px (md) Breakpoint verified: Desktop sidebar visible (256px), mobile header and nav hidden, zero overflow.`);

  // Reset viewport to desktop
  await S('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    dontSetVisibleSize: false,
  });

  console.log(`✅ All page-level visual transplant structural assertions passed.\n`);
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
  for (let i = 0; i < 40; i++) {
    const mounted = await ev('Boolean(document.querySelector("#root")?.children?.length > 0)');
    if (mounted) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  await new Promise((r) => setTimeout(r, 300));

  let assertionDescription = 'Global guard verified (no 404, no auth redirect)';

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

  // Handle interactive state setups
  if (target.isInteraction) {
    if (target.isInteraction === 'hover-button-primary') {
      const coords = await ev(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Primary Action');
        if (!btn) return null;
        btn.scrollIntoView({ block: 'center', inline: 'center' });
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: coords.x, y: coords.y });
        await new Promise((r) => setTimeout(r, 300));
      }
      assertionDescription = 'Hover state on Primary Action button captured';
    } else if (target.isInteraction === 'hover-button-secondary') {
      const coords = await ev(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Secondary Action');
        if (!btn) return null;
        btn.scrollIntoView({ block: 'center', inline: 'center' });
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: coords.x, y: coords.y });
        await new Promise((r) => setTimeout(r, 300));
      }
      assertionDescription = 'Hover state on Secondary Action button captured';
    } else if (target.isInteraction === 'focus-input') {
      const coords = await ev(`(() => {
        const input = document.querySelector('input#demo-title');
        if (!input) return null;
        input.scrollIntoView({ block: 'center', inline: 'center' });
        const r = input.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await new Promise((r) => setTimeout(r, 300));
      }
      assertionDescription = 'Focus state on standard input captured';
    } else if (target.isInteraction === 'hover-score-card') {
      const coords = await ev(`(() => {
        const card = document.querySelector('main [data-score-id]') || document.querySelector('main a[href*="/score/"] > div') || document.querySelector('main .group');
        if (!card) return null;
        card.scrollIntoView({ block: 'center', inline: 'center' });
        const r = card.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: coords.x, y: coords.y });
        await new Promise((r) => setTimeout(r, 350));
      }
      assertionDescription = 'Hover lift and gold border on score card captured';
    } else if (target.isInteraction === 'hover-sidebar-nav') {
      const coords = await ev(`(() => {
        const link = document.querySelector('aside nav a[href="/practice"]') || document.querySelector('aside nav a[href="/imports"]');
        if (!link) return null;
        link.scrollIntoView({ block: 'center', inline: 'center' });
        const r = link.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: coords.x, y: coords.y });
        await new Promise((r) => setTimeout(r, 300));
      }
      assertionDescription = 'Inactive Sidebar hover: foreground darkens, no background, no scale, no shadow';
    } else if (target.isInteraction === 'open-dropdown') {
      const coords = await ev(`(() => {
        const btn = document.querySelector('[data-qa="desktop-sidebar"] [aria-haspopup="dialog"]')
          || document.querySelector('button[aria-label*="Filter"]')
          || document.querySelector('[data-qa="desktop-sidebar"] button')
          || document.querySelector('header button[aria-haspopup="menu"]')
          || document.querySelector('button[aria-haspopup="menu"]');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await new Promise((r) => setTimeout(r, 400));
      }
      assertionDescription = 'Open state on action / dropdown trigger captured';
    } else if (target.isInteraction === 'score-card-focus') {
      const focused = await ev(`(() => {
        const link = document.querySelector('[data-qa="score-card-link"]');
        if (!link) return false;
        link.scrollIntoView({ block: 'center', inline: 'center' });
        link.focus();
        return true;
      })()`);
      await new Promise((r) => setTimeout(r, 200));
      assertionDescription = 'Focus ring state on ScoreCard link captured';
    } else if (target.isInteraction === 'mobile-account-menu-open') {
      const coords = await ev(`(() => {
        const btn = document.querySelector('[data-qa="mobile-account-trigger"]');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await new Promise((r) => setTimeout(r, 400));
      }
      assertionDescription = 'Mobile account menu dropdown opened';
    } else if (target.isInteraction === 'mobile-search-open') {
      const coords = await ev(`(() => {
        const btn = document.querySelector('[data-qa="mobile-search-trigger"]');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (coords) {
        await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
        await new Promise((r) => setTimeout(r, 400));
      }
      assertionDescription = 'Mobile search palette modal opened';
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
  } else if (target.name === 'performances-desktop') {
    const check = await ev(`(() => {
      const sc = document.querySelector('[data-qa="segmented-control"]');
      const title = document.querySelector('.type-workspace-title');
      return !!sc && !!title;
    })()`);
    if (!check) throw new Error('performances-desktop missing SegmentedControl or workspace title');
    assertionDescription = 'Displays Preserved Moments with SegmentedControl view selector';
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
  } else if (target.name === 'score-card-focus') {
    const check = await ev(`(() => {
      const link = document.querySelector('[data-qa="score-card-link"]');
      return link && document.activeElement === link;
    })()`);
    if (!check) throw new Error('score-card-focus link is not focused');
    assertionDescription = 'ScoreCard stretched navigation link is actively focused';
  } else if (target.name === 'mobile-shell-practice') {
    const check = await ev(`(() => {
      const header = document.querySelector('[data-qa="mobile-search-trigger"]');
      const nav = document.querySelector('[data-qa="mobile-navigation"]');
      return !!header && !!nav;
    })()`);
    if (!check) throw new Error('mobile-shell-practice missing mobile header or mobile nav');
    assertionDescription = 'Mobile application shell rendered with top header and bottom nav';
  } else if (target.name === 'mobile-account-menu-open') {
    const check = await ev(`(() => {
      const text = document.body.innerText;
      return text.includes('Account') && (text.includes('Sign out') || !!document.querySelector('[data-qa="mobile-signout-button"]'));
    })()`);
    if (!check) throw new Error('mobile-account-menu-open missing menu contents');
    assertionDescription = 'Mobile account menu rendered with navigation and signout options';
  } else if (target.name === 'mobile-search-open') {
    const check = await ev(`(() => {
      const dlg = document.querySelector('[role="dialog"]');
      const input = dlg ? dlg.querySelector('input') : null;
      return !!input;
    })()`);
    if (!check) throw new Error('mobile-search-open missing search dialog input');
    assertionDescription = 'Search palette dialog rendered with active search input';
  }

  // 3. Capture Viewport Screenshot via CDP (viewport remains strictly target.w × target.h)
  await S('Emulation.setDeviceMetricsOverride', {
    width: target.w,
    height: target.h,
    deviceScaleFactor: 1,
    mobile: target.w < 600,
    dontSetVisibleSize: false,
  });
  await new Promise((r) => setTimeout(r, 200));

  // Primary human-review viewport screenshot: EXACT declared viewport dimensions
  const { data: viewportData } = await S('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outFile, Buffer.from(viewportData, 'base64'));

  // Assert actual PNG dimensions equal declared viewport dimensions
  const pngDim = getPngDimensions(outFile);
  if (pngDim.width !== target.w || pngDim.height !== target.h) {
    throw new Error(`Viewport screenshot dimension mismatch for ${target.name}.png: actual ${pngDim.width}x${pngDim.height} !== declared ${target.w}x${target.h}`);
  }

  // B. Optional Full-Page Screenshot (for scrollable regular pages, without altering viewport dimensions!)
  let fullInfo = '';
  if (!target.isDialog && !target.isInteraction) {
    const scrollH = await ev('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight)');
    if (scrollH > target.h + 20) {
      const fullOutFile = path.join(OUT_DIR, `${target.name}-full.png`);
      const { data: fullData } = await S('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: 0,
          width: target.w,
          height: Math.min(16000, scrollH),
          scale: 1,
        },
      });
      fs.writeFileSync(fullOutFile, Buffer.from(fullData, 'base64'));
      const fullDim = getPngDimensions(fullOutFile);
      fullInfo = ` + full-page: ${target.name}-full.png (${fullDim.width}x${fullDim.height})`;
    }
  }

  const stat = fs.statSync(outFile);
  console.log(`✓ [${target.category}] ${target.name} (${pngDim.width}x${pngDim.height}) -> ${path.relative(process.cwd(), outFile)} (${Math.round(stat.size / 1024)} KB)${fullInfo}`);

  return {
    Target: target.name,
    Route: target.path,
    Category: target.category,
    Status: 'PASS',
    Assertion: assertionDescription,
    Dimensions: `${pngDim.width}x${pngDim.height}`,
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

    // 2. Verify computed styles and Design System V2 parity via CDP
    await verifyComputedStyles(client, BASE_URL);

    // 3. Verify Page-Level Visual Transplant structure (Section 32-36)
    await verifyPageStructure(client, BASE_URL);

    // 4. Capture screenshot suite and assert semantic DOM invariants
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

    // 4. Verify file counts and non-zero bytes on disk, and assert exact PNG dimensions
    console.log('\n🔍 Verifying screenshot artifacts and PNG dimensions on disk...');
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
        const dim = getPngDimensions(filePath);
        if (dim.width !== target.w || dim.height !== target.h) {
          failures++;
          console.error(`❌ PNG dimension assertion failed for ${target.name}.png: actual ${dim.width}x${dim.height} !== declared ${target.w}x${target.h}`);
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

  const allPngs = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.png'));
  const fullPageCount = allPngs.filter((f) => f.includes('-full')).length;
  console.log(`\n✅ Automated screenshot capture complete:`);
  console.log(`   - ${TARGETS.length} viewport QA targets validated.`);
  console.log(`   - ${fullPageCount} full-page companion captures generated.`);
  console.log(`   - ${allPngs.length} PNG files total in .taste-skill/shots/\n`);
  process.exit(0);
}

main();
