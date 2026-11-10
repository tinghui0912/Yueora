#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const OUT_DIR = path.resolve('.taste-skill/shots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PORT = process.env.PORT || 5350;
const BASE_URL = `http://localhost:${PORT}`;

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
      proc.kill();
    }
  } catch {}
}

async function ensureServerRunning(port) {
  const isRunning = await checkHealthy(`http://localhost:${port}/`);
  if (isRunning) {
    console.log(`  ✓ Detected existing server running on port ${port}`);
    return null;
  }

  console.log(`  ⏳ Spawning Vite development server on port ${port}...`);
  const isWin = process.platform === 'win32';
  const serverProc = isWin
    ? spawn('cmd.exe', ['/d', '/s', '/c', `npm.cmd run dev -- --port ${port} --strictPort`], { stdio: 'pipe' })
    : spawn('npm', ['run', 'dev', '--', '--port', String(port), '--strictPort'], { stdio: 'pipe' });

  const healthy = await waitForHealthy(`http://localhost:${port}/`, 15000);
  if (!healthy) {
    killProcess(serverProc);
    throw new Error(`Failed to start Vite dev server on port ${port}`);
  }

  console.log(`  ✓ Dev server ready on port ${port}\n`);
  return serverProc;
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
      { stdio: 'inherit' }
    );

    const timer = setTimeout(() => {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
        } else {
          child.kill('SIGKILL');
        }
      } catch {}
      reject(new Error(`Timeout capturing ${target.name}`));
    }, 45000);

    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        console.log(`✓ [${target.category}] ${target.name} (${target.w}x${target.h}) -> ${path.relative(process.cwd(), outFile)}`);
        resolve(outFile);
      } else {
        reject(new Error(`Failed to capture ${target.name} (exit code ${code})`));
      }
    });
  });
}

async function main() {
  let serverProcess = null;
  let failures = 0;

  try {
    serverProcess = await ensureServerRunning(PORT);

    for (const target of TARGETS) {
      try {
        await runShoot(target);
      } catch (err) {
        failures++;
        console.error(`⚠️ Error capturing ${target.name}:`, err.message);
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

  console.log('\n✅ Automated screenshot capture complete. All targets captured successfully in .taste-skill/shots/');
}

main();
