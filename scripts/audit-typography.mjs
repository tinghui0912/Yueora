#!/usr/bin/env node
import path from 'node:path';
import { scanDirectory } from './lib/typography-scanner.mjs';

const targetFilter = process.argv[2] || null;
const pagesDir = path.resolve('src/pages');

const { discoveredCount, scannedCount, results } = scanDirectory(pagesDir, targetFilter);

let totalRaw = 0;
let totalSemantic = 0;
let totalRedundant = 0;
let totalLeading = 0;
const allExceptions = [];

let filesWithSemantic = 0;
let filesWithRaw = 0;
let filesWithExceptions = 0;

const fileRows = [];

for (const res of results) {
  if (res.error) {
    console.error(`Error in ${res.filePath}: ${res.error}`);
    continue;
  }

  const rawCount = res.rawFindings.length;
  const semCount = res.semanticUsages.length;
  const redCount = res.redundantUsages.length;
  const leadCount = res.leadingOverrides.length;
  const excCount = res.explicitExceptions.length;

  totalRaw += rawCount;
  totalSemantic += semCount;
  totalRedundant += redCount;
  totalLeading += leadCount;

  if (semCount > 0) filesWithSemantic++;
  if (rawCount > 0) filesWithRaw++;
  if (excCount > 0) filesWithExceptions++;

  res.explicitExceptions.forEach((e) => allExceptions.push(e));

  if (rawCount > 0 || redCount > 0 || leadCount > 0 || targetFilter) {
    fileRows.push({
      file: res.filePath.replace(/^src\/pages\//, ''),
      raw: rawCount,
      semantic: semCount,
      redundant: redCount,
      leading: leadCount,
      exceptions: excCount,
    });
  }

  // Print line details if a specific file was targeted
  if (targetFilter) {
    res.rawFindings.forEach((f) => {
      console.log(`[${res.filePath}:${f.line}] RAW: [${f.matched}] ${f.message}`);
    });
    res.redundantUsages.forEach((f) => {
      console.log(`[${res.filePath}:${f.line}] REDUNDANT: [${f.matched}] ${f.message}`);
    });
    res.leadingOverrides.forEach((f) => {
      console.log(`[${res.filePath}:${f.line}] LEADING OVERRIDE: [${f.matched}] ${f.message}`);
    });
  }
}

fileRows.sort((a, b) => (b.raw + b.redundant + b.leading) - (a.raw + a.redundant + a.leading));

console.log('--- YUEORA TYPOGRAPHY AUDIT REPORT ---');
console.log(`Files discovered in src/pages:            ${discoveredCount}`);
console.log(`Files scanned:                            ${scannedCount}`);
console.log(`Files with semantic typography:           ${filesWithSemantic}`);
console.log(`Files with raw typography findings:       ${filesWithRaw}`);
console.log(`Files with redundant style overrides:     ${fileRows.filter((r) => r.redundant > 0 || r.leading > 0).length}`);
console.log(`Files with explicit typography exceptions: ${filesWithExceptions}`);
console.log('--------------------------------------');
console.log(`Total Semantic type-* Usages:             ${totalSemantic}`);
console.log(`Total Raw Typography Findings:            ${totalRaw}`);
console.log(`Total Redundant Caption Declarations:     ${totalRedundant}`);
console.log(`Total Semantic Leading Overrides:         ${totalLeading}`);
console.log(`Total Unique Explicit ds-allow Exceptions: ${allExceptions.length}\n`);

if (fileRows.length > 0) {
  console.log('Files with Typography Findings or Overrides:');
  console.table(fileRows);
}

if (allExceptions.length > 0 && !targetFilter) {
  console.log('Unique Explicit ds-allow Exceptions:');
  console.table(
    allExceptions.map((e) => ({
      file: e.file.replace(/^src\/pages\//, ''),
      line: e.line,
      reason: e.reason,
      trivial: e.isTrivial ? 'YES (BANNED)' : 'NO',
    }))
  );
}
