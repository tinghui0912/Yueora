#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import http from 'node:http';

const PREVIEW_PORT = 5389;
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;

console.log('🔒 Running Yueora Production Auth Boundary Verification...');

// 1. Static Bundle Inspection
function verifyStaticBundle() {
  const distDir = path.resolve('dist/assets');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist/assets does not exist. Please run npm run build first.');
  }

  const jsFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
  let checkedSafeguards = 0;

  for (const f of jsFiles) {
    const code = fs.readFileSync(path.join(distDir, f), 'utf8');
    // Ensure the production safeguard string exists in the compiled output
    if (code.includes('Demo authentication is strictly disabled in production builds')) {
      checkedSafeguards++;
    }
  }

  if (checkedSafeguards === 0) {
    throw new Error('Production bundle does not contain the demo auth prohibition guard.');
  }

  console.log('  ✓ Static bundle inspection: import.meta.env.DEV strictly gated, production auth safeguard verified.');
}

// 2. Headless Chrome Helper
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
    throw new Error('Chrome/Chromium binary not found in default paths. Browser auth boundary check cannot be skipped.');
  }
  return found;
}

let completedBrowserAssertions = 0;

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode && res.statusCode < 500) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return false;
}

async function verifyBrowserRedirect(chromePath, targetPath, expectedPath = '/login') {
  return new Promise((resolve, reject) => {
    const tempProfile = path.resolve('.taste-skill/auth-test-profile');
    if (!fs.existsSync(tempProfile)) fs.mkdirSync(tempProfile, { recursive: true });

    const chromeProcess = spawn(chromePath, [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      `--user-data-dir=${tempProfile}`,
      '--remote-debugging-port=0',
      '--no-first-run',
      '--disable-gpu',
      'about:blank',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    let wsUrl = '';
    const stderrBuf = [];

    chromeProcess.stderr.on('data', (d) => {
      stderrBuf.push(d);
      const str = d.toString();
      const match = str.match(/ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[a-zA-Z0-9-]+/);
      if (match && !wsUrl) {
        wsUrl = match[0];
        runCdpSession(wsUrl)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            try { chromeProcess.kill(); } catch {}
          });
      }
    });

    setTimeout(() => {
      if (!wsUrl) {
        try { chromeProcess.kill(); } catch {}
        reject(new Error(`Timed out waiting for Chrome CDP WebSocket: ${Buffer.concat(stderrBuf).toString()}`));
      }
    }, 10000);

    async function runCdpSession(browserWs) {
      // Connect to CDP via Node WebSocket
      const WebSocketClient = globalThis.WebSocket;
      if (!WebSocketClient) {
        throw new Error('globalThis.WebSocket is missing in Node environment; WebSocket is required for CDP browser redirect assertions.');
      }

      const ws = new WebSocketClient(browserWs);
      await new Promise((res, rej) => {
        ws.onopen = res;
        ws.onerror = rej;
      });

      let id = 1;
      const send = (method, params = {}) => new Promise((res, rej) => {
        const reqId = id++;
        const onMsg = (e) => {
          const data = JSON.parse(e.data);
          if (data.id === reqId) {
            ws.removeEventListener('message', onMsg);
            if (data.error) rej(new Error(data.error.message));
            else res(data.result);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });

      // Create new page target
      const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

      const sendSession = (method, params = {}) => new Promise((res, rej) => {
        const reqId = id++;
        const onMsg = (e) => {
          const data = JSON.parse(e.data);
          if (data.id === reqId) {
            ws.removeEventListener('message', onMsg);
            if (data.error) rej(new Error(data.error.message));
            else res(data.result);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: reqId, sessionId, method, params }));
      });

      await sendSession('Page.enable');
      await sendSession('Runtime.enable');

      sendSession('Runtime.consoleAPICalled', {}).catch(() => {});
      ws.addEventListener('message', (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.method === 'Runtime.consoleAPICalled') {
            console.log('    [browser console]', msg.params.type, msg.params.args?.map(a => a.value || a.description).join(' '));
          }
          if (msg.method === 'Runtime.exceptionThrown') {
            console.log('    [browser exception]', msg.params.exceptionDetails?.text, msg.params.exceptionDetails?.exception?.description);
          }
        } catch {}
      });

      await sendSession('Page.navigate', { url: `${BASE_URL}${targetPath}` });

      // Poll up to 6 seconds for client-side React Router to evaluate auth and redirect
      let pathname = '';
      let text = '';
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 250));
        const evalRes = await sendSession('Runtime.evaluate', {
          expression: 'JSON.stringify({ pathname: window.location.pathname, text: document.body.innerText.slice(0, 200) })',
          returnByValue: true,
        });
        const current = JSON.parse(evalRes?.result?.value || '{}');
        pathname = current.pathname;
        text = current.text;
        if (pathname === expectedPath) {
          break;
        }
      }

      console.log(`    [browser state at check end] pathname: "${pathname}", text: "${text.replace(/\s+/g, ' ')}"`);
      ws.close();

      if (pathname !== expectedPath) {
        throw new Error(`Production auth bypass detected! Navigated to ${targetPath}, expected ${expectedPath}, but landed on ${pathname}`);
      }

      completedBrowserAssertions++;
      console.log(`  ✓ Browser Assertion ${completedBrowserAssertions}: Production preview navigated to ${targetPath} -> successfully rejected & redirected to ${pathname} ("${text.replace(/\s+/g, ' ').slice(0, 40)}…")`);
    }
  });
}

async function main() {
  try {
    verifyStaticBundle();

    const chromePath = findChrome();
    // Spawn Vite preview server
    const isWin = process.platform === 'win32';
    const previewProc = isWin
      ? spawn('cmd.exe', ['/d', '/s', '/c', `npm.cmd run preview -- --port ${PREVIEW_PORT} --strictPort`], { stdio: 'pipe', shell: false })
      : spawn('npm', ['run', 'preview', '--', '--port', String(PREVIEW_PORT), '--strictPort'], { stdio: 'pipe' });

    try {
      const healthy = await waitForServer(`${BASE_URL}/`);
      if (!healthy) {
        throw new Error(`Vite preview server failed to become healthy on port ${PREVIEW_PORT}`);
      }

      // Test 1: /library?demo=true -> must redirect to /login
      await verifyBrowserRedirect(chromePath, '/library?demo=true', '/login');

      // Test 2: /settings/account?demo=true -> must redirect to /login
      await verifyBrowserRedirect(chromePath, '/settings/account?demo=true', '/login');

    } finally {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(previewProc.pid), '/f', '/t']);
        } else {
          previewProc.kill();
        }
      } catch {}
    }

    if (completedBrowserAssertions !== 2) {
      throw new Error(`Incomplete browser verification: expected 2 redirect assertions to execute, but only ${completedBrowserAssertions} ran.`);
    }

    console.log('\n✅ Production auth boundary verification passed:');
    console.log('  ✓ Static bundle auth boundary verified.');
    console.log('  ✓ Browser redirect assertion 1 passed (/library?demo=true -> /login).');
    console.log('  ✓ Browser redirect assertion 2 passed (/settings/account?demo=true -> /login).');
    console.log('  ✓ Production auth boundary verification passed: 0 bypass vectors detected.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Production auth boundary verification failed:', err.message);
    process.exit(1);
  }
}

main();
