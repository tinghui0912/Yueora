import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  YUEORA_VISUAL_RECIPE_MANIFEST,
  NUMIS_REFERENCE_RECIPES,
  NUMIS_REFERENCE_STATUS_RECIPES,
} from './lib/numis-visual-provenance-manifest.mjs';

const FROZEN_COMMIT = 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c';
const FROZEN_TREE = '9602c27dce5c2625c0e7251acfae8c1be6b5c725';
const EXPECTED_REPO = 'tinghui0912/NumisCollection';

const numisRepoPath = process.env.NUMIS_REPO_PATH || process.argv[2] || path.resolve('../NumisCollection');
const destRoot = path.resolve('scripts/fixtures/numis-frozen');

if (!fs.existsSync(numisRepoPath)) {
  console.error(`Error: Numis repository path '${numisRepoPath}' does not exist.`);
  console.error('Provide the path via NUMIS_REPO_PATH environment variable or as a CLI argument:');
  console.error('  node scripts/build-frozen-numis-fixtures.mjs <path-to-NumisCollection>');
  process.exit(1);
}

// 1. Verify Git commit existence in target repo
try {
  const verifiedCommit = execFileSync('git', ['-C', numisRepoPath, 'rev-parse', '--verify', FROZEN_COMMIT], {
    encoding: 'utf8',
  }).trim();
  if (verifiedCommit !== FROZEN_COMMIT) {
    console.error(`Error: Commit mismatch in repo. Expected ${FROZEN_COMMIT}, got ${verifiedCommit}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`Error: Failed to verify commit ${FROZEN_COMMIT} in ${numisRepoPath}: ${err.message}`);
  process.exit(1);
}

// 2. Verify tree SHA
try {
  const treeSha = execFileSync('git', ['-C', numisRepoPath, 'rev-parse', `${FROZEN_COMMIT}^{tree}`], {
    encoding: 'utf8',
  }).trim();
  if (treeSha !== FROZEN_TREE) {
    console.error(`Error: Tree SHA mismatch. Expected ${FROZEN_TREE}, got ${treeSha}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`Error: Failed to verify tree SHA in ${numisRepoPath}: ${err.message}`);
  process.exit(1);
}

// 3. Optional repo remote validation
try {
  const remoteUrl = execFileSync('git', ['-C', numisRepoPath, 'remote', 'get-url', 'origin'], {
    encoding: 'utf8',
  }).trim();
  if (!remoteUrl.includes('NumisCollection')) {
    console.warn(`Warning: Origin remote URL '${remoteUrl}' does not match expected repository name 'NumisCollection'.`);
  }
} catch {
  // Remote check is optional (e.g. detached clones or local mirrors)
}

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
  repository: EXPECTED_REPO,
  commit: FROZEN_COMMIT,
  tree: FROZEN_TREE,
  fileCount: files.size,
  files: {},
};

function computeGitBlobSha(contentBuffer) {
  const header = Buffer.from(`blob ${contentBuffer.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header, contentBuffer])).digest('hex');
}

for (const relFile of [...files].sort()) {
  const destPath = path.join(destRoot, relFile);
  
  // Extract file content directly from the frozen git commit, NOT working tree
  let rawContent;
  try {
    rawContent = execFileSync('git', ['-C', numisRepoPath, 'show', `${FROZEN_COMMIT}:${relFile}`], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    console.error(`Failed to read '${relFile}' from commit ${FROZEN_COMMIT}: ${err.message}`);
    process.exit(1);
  }

  // Normalize line endings to LF
  const normalizedContent = rawContent.replace(/\r\n/g, '\n');
  const contentBuffer = Buffer.from(normalizedContent, 'utf8');

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, normalizedContent, 'utf8');

  const sha256 = crypto.createHash('sha256').update(contentBuffer).digest('hex');
  const gitBlobSha = computeGitBlobSha(contentBuffer);

  // Cross-verify with git object database
  try {
    const directGitBlob = execFileSync('git', ['-C', numisRepoPath, 'rev-parse', `${FROZEN_COMMIT}:${relFile}`], {
      encoding: 'utf8',
    }).trim();
    if (directGitBlob !== gitBlobSha) {
      console.warn(`Note: Git tree blob for '${relFile}' is ${directGitBlob}, normalized LF blob is ${gitBlobSha}`);
    }
  } catch {
    // ignore
  }

  metadata.files[relFile] = {
    sha256,
    gitBlobSha,
    bytes: contentBuffer.length,
  };
}

fs.writeFileSync(path.join(destRoot, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
console.log(`Successfully extracted and verified ${files.size} frozen Numis fixture files from commit ${FROZEN_COMMIT}.`);
