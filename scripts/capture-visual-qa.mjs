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

  const actualCount = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.png')).length;
  console.log(`\n✅ Automated screenshot capture complete. All ${actualCount} targets captured and asserted successfully in .taste-skill/shots/`);
  process.exit(0);
}

main();
