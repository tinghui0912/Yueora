import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  YUEORA_VISUAL_RECIPE_MANIFEST,
  NUMIS_REFERENCE_RECIPES,
  NUMIS_REFERENCE_STATUS_RECIPES,
} from './lib/numis-visual-provenance-manifest.mjs';

const numisRoot = 'c:/Users/tinghuilin/Desktop/NumisCollection';
const destRoot = path.resolve('scripts/fixtures/numis-frozen');

const files = new Set();
const scan = (arr) => {
  if (Array.isArray(arr)) {
    arr.forEach((r) => {
      if (r?.source?.file) files.add(r.source.file.replace(/\\/g, '/'));
    });
  }
};
scan(YUEORA_VISUAL_RECIPE_MANIFEST);
scan(NUMIS_REFERENCE_RECIPES);
scan(NUMIS_REFERENCE_STATUS_RECIPES);

const metadata = {
  repository: 'tinghui0912/NumisCollection',
  commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
  tree: '9602c27dce5c2625c0e7251acfae8c1be6b5c725',
  fileCount: files.size,
  files: {},
};

for (const relFile of [...files].sort()) {
  const srcPath = path.join(numisRoot, relFile);
  const destPath = path.join(destRoot, relFile);
  if (!fs.existsSync(srcPath)) {
    console.error(`Missing source file: ${srcPath}`);
    process.exit(1);
  }
  const rawContent = fs.readFileSync(srcPath, 'utf8');
  const normalizedContent = rawContent.replace(/\r\n/g, '\n');
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, normalizedContent, 'utf8');
  const hash = crypto.createHash('sha256').update(normalizedContent, 'utf8').digest('hex');
  metadata.files[relFile] = {
    sha256: hash,
    bytes: Buffer.byteLength(normalizedContent, 'utf8'),
  };
}

fs.writeFileSync(path.join(destRoot, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
console.log(`Successfully created checked-in frozen Numis fixture set of ${files.size} files.`);
