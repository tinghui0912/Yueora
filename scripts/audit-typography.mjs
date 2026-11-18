#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const pagesDir = path.resolve('src/pages');
const RAW_TEXT_REGEX = /\b(text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|\[\d+px\]))\b/g;
const FONT_DISPLAY_REGEX = /\bfont-display\b/g;
const RAW_UPPERCASE_REGEX = /\buppercase\b/g;
const RAW_TRACKING_REGEX = /\btracking-(?:wide|wider|widest|\[[^\]]+\])\b/g;
const SEMANTIC_TYPE_REGEX = /\btype-(?:hero-title|marketing-title|editorial-quote|marketing-body|display|experience-title|page-title|section-title|subsection|body-small|body|label|caption|eyebrow|metadata|metric)\b/g;

let totalRaw = 0;
let totalSemantic = 0;
let totalDsAllow = 0;
const fileStats = [];
const targetFile = process.argv[2];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
      const relPath = path.relative('src/pages', full).replace(/\\/g, '/');
      if (targetFile && !relPath.includes(targetFile)) continue;
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      let fileRaw = 0;
      let fileSemantic = 0;
      let fileDsAllow = 0;

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          if (line.includes('ds-allow:') || line.includes('ds-ignore:')) {
            fileDsAllow++;
          }
          return;
        }

        const isLineAllow = line.includes('ds-allow:')
          || line.includes('ds-ignore:')
          || (idx > 0 && lines.slice(Math.max(0, idx - 4), idx).some(l => l.includes('ds-allow:') || l.includes('ds-ignore:')));
        if (isLineAllow) {
          fileDsAllow++;
          return; // excused
        }

        // Count semantic types
        const semMatches = line.match(SEMANTIC_TYPE_REGEX) || [];
        fileSemantic += semMatches.length;

        // Check for class attributes
        const classMatches = [...line.matchAll(/className=["']([^"']+)["']/g)];
        for (const cm of classMatches) {
          const str = cm[1] || '';
          const textSizes = str.match(RAW_TEXT_REGEX) || [];
          if (textSizes.length > 0 && targetFile) {
            console.log(`[${relPath}:${idx + 1}] raw size:`, textSizes.join(', '), '-> line:', trimmed);
          }
          fileRaw += textSizes.length;

          // Check raw font-display (if not accompanied by a semantic type role)
          if (FONT_DISPLAY_REGEX.test(str) && !SEMANTIC_TYPE_REGEX.test(str)) {
            if (targetFile) console.log(`[${relPath}:${idx + 1}] raw font-display ->`, trimmed);
            fileRaw += (str.match(FONT_DISPLAY_REGEX) || []).length;
          }

          // Check raw uppercase without type-caption or type-eyebrow
          if (RAW_UPPERCASE_REGEX.test(str) && !/\btype-(?:caption|eyebrow)\b/.test(str)) {
            if (targetFile) console.log(`[${relPath}:${idx + 1}] raw uppercase ->`, trimmed);
            fileRaw += (str.match(RAW_UPPERCASE_REGEX) || []).length;
          }

          // Check raw tracking without type-caption or type-eyebrow
          if (RAW_TRACKING_REGEX.test(str) && !/\btype-(?:caption|eyebrow)\b/.test(str)) {
            if (targetFile) console.log(`[${relPath}:${idx + 1}] raw tracking ->`, trimmed);
            fileRaw += (str.match(RAW_TRACKING_REGEX) || []).length;
          }
        }
      });

      totalRaw += fileRaw;
      totalSemantic += fileSemantic;
      totalDsAllow += fileDsAllow;
      if (fileRaw > 0 || fileSemantic > 0 || fileDsAllow > 0) {
        fileStats.push({
          file: path.relative('src/pages', full).replace(/\\/g, '/'),
          raw: fileRaw,
          semantic: fileSemantic,
          dsAllow: fileDsAllow,
        });
      }
    }
  }
}

scan(pagesDir);
fileStats.sort((a, b) => b.raw - a.raw);
console.log('--- BASELINE AUDIT (src/pages) ---');
console.log('Total files scanned in src/pages:', fileStats.length);
console.log('page-level raw typography decisions =', totalRaw);
console.log('semantic type-* usages =', totalSemantic);
console.log('ds-allow typography exceptions =', totalDsAllow);
console.log('\nTop files with raw typography decisions:');
console.table(fileStats.slice(0, 20));
