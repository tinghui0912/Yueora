import fs from 'fs';
import path from 'path';

const SCAN_DIRECTORIES = [
  path.resolve('src/pages'),
  path.resolve('src/components/patterns'),
  path.resolve('src/components/library'),
  path.resolve('src/components/app-shell'),
];

// Pages exempted from application heading checks (marketing / public copy)
const MARKETING_PAGES = new Set(['About.jsx', 'Landing.jsx', 'Pricing.jsx', 'DesignSystemPreview.jsx']);

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

function scanDirectory(dir, issues = []) {
  if (!fs.existsSync(dir)) return issues;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, issues);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      const isMarketing = MARKETING_PAGES.has(entry.name);

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

        // Check forbidden patterns
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

        // Check unmigrated application page title
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

console.log('🔍 Scanning pages and core component directories for Design System violations...\n');
let totalViolations = [];

for (const dir of SCAN_DIRECTORIES) {
  scanDirectory(dir, totalViolations);
}

if (totalViolations.length === 0) {
  console.log('✅ Design System Lint Passed: All pages and core components strictly adhere to semantic tokens and typography rules!\n');
  process.exit(0);
} else {
  console.error(`⚠️ Found ${totalViolations.length} Design System violations:\n`);
  totalViolations.forEach((v) => {
    console.error(`  ${v.file}:${v.line} - [${v.matched}] ${v.message}`);
  });
  console.error('\nPlease resolve these violations by migrating to semantic Design System tokens/components.\n');
  process.exit(1);
}
