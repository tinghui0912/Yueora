import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve('src/pages');

// Rules to scan for in page JSX
const FORBIDDEN_PATTERNS = [
  {
    regex: /text-\[\d+px\]/g,
    message: 'Arbitrary pixel text size found. Use semantic typography (.type-*) instead.',
  },
  {
    regex: /(?:bg|text|border|ring)-\[#(?:[0-9a-fA-F]{3}){1,2}\]/g,
    message: 'Raw hex color found in JSX. Use semantic color tokens (e.g. text-ink-*, bg-surface-*, text-brand).',
  },
  {
    regex: /type-page-title\s+text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[\w+\])/g,
    message: 'Conflicting font-size override on .type-page-title. The semantic class owns the font size.',
  },
  {
    regex: /type-section-title\s+text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[\w+\])/g,
    message: 'Conflicting font-size override on .type-section-title. The semantic class owns the font size.',
  },
];

function scanDirectory(dir, issues = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, issues);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, lineIndex) => {
        // Skip comment lines or lines with explicit design-system allowlist annotations
        if (
          line.trim().startsWith('//') ||
          line.trim().startsWith('/*') ||
          line.trim().startsWith('*') ||
          line.includes('ds-allow') ||
          line.includes('ds-ignore')
        ) {
          return;
        }

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
      });
    }
  }

  return issues;
}

console.log('🔍 Scanning src/pages for Design System rule violations...\n');
const violations = scanDirectory(PAGES_DIR);

if (violations.length === 0) {
  console.log('✅ Design System Lint Passed: All pages adhere to semantic tokens and typography rules!\n');
  process.exit(0);
} else {
  console.error(`⚠️ Found ${violations.length} Design System violations in pages:\n`);
  violations.forEach((v) => {
    console.error(`  ${v.file}:${v.line} - [${v.matched}] ${v.message}`);
  });
  console.error('\nPlease fix these violations by migrating to semantic Design System tokens/components.\n');
  process.exit(1);
}
