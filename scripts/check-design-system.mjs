import fs from 'fs';
import path from 'path';

// 1. Verify CSS Foundations & Token Integrity
const INDEX_CSS_PATH = path.resolve('src/index.css');
const REQUIRED_TYPOGRAPHY = [
  'type-display',
  'type-experience-title',
  'type-page-title',
  'type-section-title',
  'type-subsection',
  'type-body',
  'type-body-small',
  'type-label',
  'type-caption',
  'type-metadata',
  'type-metric',
];

const REQUIRED_CONTROL_VARS = [
  '--control-height-xs',
  '--control-height-sm',
  '--control-height-md',
  '--control-height-lg',
  '--control-height-xl',
];

const REQUIRED_CONTROL_UTILITIES = [
  '.h-control-xs',
  '.h-control-sm',
  '.h-control-md',
  '.h-control-lg',
  '.h-control-xl',
  '.w-control-xs',
  '.w-control-sm',
  '.w-control-md',
  '.w-control-lg',
  '.w-control-xl',
  '.min-h-control-xs',
  '.min-h-control-sm',
  '.min-h-control-md',
  '.min-h-control-lg',
  '.min-h-control-xl',
];

const REQUIRED_ICON_VARS = [
  '--icon-size-xs',
  '--icon-size-sm',
  '--icon-size-md',
  '--icon-size-lg',
  '--icon-size-xl',
];

const REQUIRED_ICON_UTILITIES = [
  '.icon-xs',
  '.icon-sm',
  '.icon-md',
  '.icon-lg',
  '.icon-xl',
];

function verifyFoundations(issues = []) {
  if (!fs.existsSync(INDEX_CSS_PATH)) {
    issues.push({
      file: 'src/index.css',
      line: 1,
      matched: 'Missing file',
      message: 'src/index.css was not found.',
    });
    return issues;
  }

  const css = fs.readFileSync(INDEX_CSS_PATH, 'utf8');

  // Verify typography utilities exist
  REQUIRED_TYPOGRAPHY.forEach((role) => {
    const regex = new RegExp(`\\.${role}\\b`);
    if (!regex.test(css)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: role,
        message: `Required semantic typography utility .${role} is not defined in src/index.css.`,
      });
    }
  });

  // Verify control variables exist
  REQUIRED_CONTROL_VARS.forEach((v) => {
    if (!css.includes(v)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: v,
        message: `Required control token ${v} is missing from :root in src/index.css.`,
      });
    }
  });

  // Verify control utilities exist
  REQUIRED_CONTROL_UTILITIES.forEach((u) => {
    if (!css.includes(u)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: u,
        message: `Required control utility ${u} is missing from @layer utilities in src/index.css.`,
      });
    }
  });

  // Verify icon variables exist
  REQUIRED_ICON_VARS.forEach((v) => {
    if (!css.includes(v)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: v,
        message: `Required icon token ${v} is missing from :root in src/index.css.`,
      });
    }
  });

  // Verify icon utilities exist
  REQUIRED_ICON_UTILITIES.forEach((u) => {
    if (!css.includes(u)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: u,
        message: `Required icon utility ${u} is missing from @layer utilities in src/index.css.`,
      });
    }
  });

  return issues;
}

// 2. Scan Directories for Token Consumption & Rules
const SCAN_DIRECTORIES = [
  path.resolve('src/pages'),
  path.resolve('src/components/ui'),
  path.resolve('src/components/patterns'),
  path.resolve('src/components/app-shell'),
  path.resolve('src/components/library'),
  path.resolve('src/components/practice'),
  path.resolve('src/components/editor'),
  path.resolve('src/components/performances'),
];

// Exemptions for non-application marketing pages or musical notation canvas geometry
const MARKETING_PAGES = new Set(['About.jsx', 'Landing.jsx', 'Pricing.jsx', 'DesignSystemPreview.jsx']);
const GEOMETRY_EXEMPT_FILES = new Set(['ScoreCanvas.jsx', 'ScorePreview.jsx', 'MusicalGlyphs.jsx']);

// Rules to scan for in JSX
const FORBIDDEN_PATTERNS = [
  {
    regex: /text-\[\d+px\]/g,
    message: 'Arbitrary pixel text size found. Use semantic typography (.type-*) or standard Tailwind scale instead.',
  },
  {
    regex: /(?:bg|text|border|ring)-\[#(?:[0-9a-fA-F]{3}){1,2}\]/g,
    message: 'Raw hex color found in JSX. Use semantic color tokens (e.g. text-ink-*, bg-surface-*, text-brand).',
  },
  {
    regex: /type-(?:page-title|section-title|experience-title)\s+text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[\w+\])/g,
    message: 'Conflicting font-size override on semantic heading. The semantic heading class owns the font size.',
  },
  {
    regex: /text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[\w+\])\s+type-(?:page-title|section-title|experience-title)/g,
    message: 'Conflicting font-size override before semantic heading. The semantic heading class owns the font size.',
  },
];

let scannedFilesCount = 0;

function scanDirectory(dir, issues = []) {
  if (!fs.existsSync(dir)) return issues;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, issues);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
      scannedFilesCount++;
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      const isMarketing = MARKETING_PAGES.has(entry.name);
      const isGeometryExempt = GEOMETRY_EXEMPT_FILES.has(entry.name);

      lines.forEach((line, lineIndex) => {
        const trimmed = line.trim();

        // Check if line contains ds-allow / ds-ignore annotation
        const hasAllow = line.includes('ds-allow') || line.includes('ds-ignore');
        if (hasAllow) {
          const hasReason = /(?:ds-allow|ds-ignore):\s*\S+/.test(line);
          if (!hasReason) {
            issues.push({
              file: path.relative(process.cwd(), fullPath),
              line: lineIndex + 1,
              matched: 'ds-allow / ds-ignore without reason',
              message: 'Design system allowlist annotation requires an explicit explanation. Format: ds-allow: <reason>',
            });
          }
          return;
        }

        // Skip comments
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return;
        }

        // Check forbidden patterns unless file is exempt
        if (!isGeometryExempt) {
          FORBIDDEN_PATTERNS.forEach((pattern) => {
            const match = line.match(pattern.regex);
            if (match) {
              issues.push({
                file: path.relative(process.cwd(), fullPath),
                line: lineIndex + 1,
                matched: match[0],
                message: pattern.message,
              });
            }
          });
        }

        // Check unmigrated application page titles
        if (!isMarketing && /<h1[^>]*font-display\s+text-(?:2xl|3xl|4xl)/.test(line)) {
          issues.push({
            file: path.relative(process.cwd(), fullPath),
            line: lineIndex + 1,
            matched: line.trim(),
            message: 'Unmigrated page heading. Use type-page-title or type-experience-title instead of font-display text-[2-4]xl.',
          });
        }
      });
    }
  }

  return issues;
}

console.log('🔍 Running Yueora Design System Integrity Checks...\n');

let totalViolations = [];

// Phase 1: Verify Foundations
verifyFoundations(totalViolations);

// Phase 2: Scan Codebase
for (const dir of SCAN_DIRECTORIES) {
  scanDirectory(dir, totalViolations);
}

if (totalViolations.length === 0) {
  console.log('✅ Design System integrity checks passed.');
  console.log(`   - Verified ${REQUIRED_TYPOGRAPHY.length} semantic typography roles in src/index.css`);
  console.log(`   - Verified ${REQUIRED_CONTROL_VARS.length} control scale tokens & ${REQUIRED_CONTROL_UTILITIES.length} utilities`);
  console.log(`   - Verified ${REQUIRED_ICON_VARS.length} icon size tokens & ${REQUIRED_ICON_UTILITIES.length} utilities`);
  console.log(`   - Scanned ${scannedFilesCount} JSX files across ${SCAN_DIRECTORIES.length} system directories\n`);
  process.exit(0);
} else {
  console.error(`⚠️ Found ${totalViolations.length} Design System violations:\n`);
  totalViolations.forEach((v) => {
    console.error(`  ${v.file}:${v.line} - [${v.matched}] ${v.message}`);
  });
  console.error('\nPlease resolve these violations by adhering to canonical tokens and primitives.\n');
  process.exit(1);
}
