#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR = path.resolve('.taste-skill/shots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PORT = process.env.PORT || 5350;
const BASE_URL = `http://localhost:${PORT}`;

const TARGETS = [
  { name: 'landing-desktop', path: '/', w: 1440, h: 900 },
  { name: 'landing-mobile', path: '/', w: 390, h: 844 },
  { name: 'login-desktop', path: '/login', w: 1440, h: 900 },
  { name: 'library-desktop', path: '/library?demo=true', w: 1440, h: 900 },
  { name: 'setup-desktop', path: '/score/clair-de-lune/setup?demo=true', w: 1440, h: 900 },
  { name: 'setup-mobile', path: '/score/clair-de-lune/setup?demo=true', w: 390, h: 844 },
  { name: 'settings-desktop', path: '/settings/account?demo=true', w: 1440, h: 900 },
];

console.log('📸 Starting Yueora Automated Visual QA Screenshot Capture...');
console.log(`Target server: ${BASE_URL}\n`);

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

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`✓ Captured ${target.name} (${target.w}x${target.h}) -> ${path.relative(process.cwd(), outFile)}`);
        resolve(outFile);
      } else {
        reject(new Error(`Failed to capture ${target.name} (exit code ${code})`));
      }
    });
  });
}

async function main() {
  for (const target of TARGETS) {
    try {
      await runShoot(target);
    } catch (err) {
      console.error(`⚠️ Error capturing ${target.name}:`, err.message);
    }
  }
  console.log('\n✅ Automated screenshot capture complete. Files saved in .taste-skill/shots/');
}

main();
