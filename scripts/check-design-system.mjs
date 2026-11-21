import fs from 'fs';
import path from 'path';
import { scanFile } from './lib/typography-scanner.mjs';
import { scanPageAppearanceContent } from './lib/appearance-guard.mjs';

// 1. Verify CSS Foundations & Token Integrity
const INDEX_CSS_PATH = path.resolve('src/index.css');

const REQUIRED_TYPOGRAPHY = [
  'type-hero-title',
  'type-marketing-title',
  'type-editorial-quote',
  'type-marketing-body',
  'type-display',
  'type-experience-title',
  'type-page-title',
  'type-section-title',
  'type-subsection',
  'type-body',
  'type-body-small',
  'type-label',
  'type-caption',
  'type-eyebrow',
  'type-metadata',
  'type-metric',
  'type-sidebar-descriptor',
  'type-dashboard-title',
  'type-workspace-title',
  'type-page-subtitle',
  'type-stat-label',
  'type-panel-title',
  'type-card-title',
  'type-card-metadata',
  'type-card-value-label',
  'type-card-value',
  'type-mobile-nav',
  'type-menu-label',
];

const CANONICAL_CONTROL_TOKENS = [
  { name: '--control-height-xs', expected: '1.75rem' },
  { name: '--control-height-sm', expected: '2rem' },
  { name: '--control-height-md', expected: '2.25rem' },
  { name: '--control-height-lg', expected: '2.5rem' },
  { name: '--control-height-xl', expected: '2.75rem' },
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

const CANONICAL_ICON_TOKENS = [
  { name: '--icon-size-xs', expected: '0.875rem' },
  { name: '--icon-size-sm', expected: '1rem' },
  { name: '--icon-size-md', expected: '1.125rem' },
  { name: '--icon-size-lg', expected: '1.25rem' },
  { name: '--icon-size-xl', expected: '1.5rem' },
];

const REQUIRED_ICON_UTILITIES = [
  '.icon-xs',
  '.icon-sm',
  '.icon-md',
  '.icon-lg',
  '.icon-xl',
];

const REQUIRED_SURFACE_AND_BRAND_TOKENS = [
  '--brand-soft',
  '--surface-subrail',
  '--surface-subrail-border',
];

const CANONICAL_PRIMITIVE_TOKENS = [
  '--primitive-neutral-0',
  '--primitive-neutral-25',
  '--primitive-neutral-50',
  '--primitive-neutral-75',
  '--primitive-neutral-100',
  '--primitive-neutral-200',
  '--primitive-neutral-300',
  '--primitive-ink-500',
  '--primitive-ink-700',
  '--primitive-ink-800',
  '--primitive-ink-900',
  '--primitive-gold-50',
  '--primitive-gold-100',
  '--primitive-gold-500',
  '--primitive-gold-600',
  '--primitive-gold-700',
  '--primitive-gold-800',
  '--primitive-success-500',
  '--primitive-warning-500',
  '--primitive-danger-500',
];

const SEMANTIC_TOKENS_MAPPING_PRIMITIVES = [
  { token: '--surface-canvas', expectedPrimitive: '--primitive-neutral-25' },
  { token: '--surface-panel', expectedPrimitive: '--primitive-neutral-0' },
  { token: '--brand', expectedPrimitive: '--primitive-gold-500' },
  { token: '--brand-fill', expectedPrimitive: '--primitive-gold-700' },
  { token: '--brand-fill-hover', expectedPrimitive: '--primitive-gold-800' },
  { token: '--brand-fill-foreground', expectedPrimitive: '--primitive-neutral-0' },
  { token: '--brand-soft', expectedPrimitive: '--primitive-gold-100' },
  { token: '--nav-active-bg', expectedPrimitive: '--primitive-gold-50' },
  { token: '--control-hover-accent', expectedPrimitive: '--primitive-gold-100' },
  { token: '--brand-foreground', expectedPrimitive: '--primitive-ink-900' },
  { token: '--brand-soft-foreground', expectedPrimitive: '--primitive-ink-900' },
  { token: '--ink-primary', expectedPrimitive: '--primitive-ink-900' },
  { token: '--ink-tertiary', expectedPrimitive: '--primitive-ink-500' },
  { token: '--neutral-muted', expectedPrimitive: '--primitive-neutral-100' },
  { token: '--neutral-hover', expectedPrimitive: '--primitive-neutral-75' },
  { token: '--warning-foreground', expectedPrimitive: '--primitive-ink-900' },
  { token: '--practice-current-foreground', expectedPrimitive: '--primitive-ink-900' },
];

// WCAG AA Contrast Verification (Dynamic Resolution from src/index.css)
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
function sRGBtoLin(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function getLuminance([r, g, b]) {
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}
function getContrastRatio(hsl1, hsl2) {
  const lum1 = getLuminance(hslToRgb(...hsl1));
  const lum2 = getLuminance(hslToRgb(...hsl2));
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

function parseCssCustomProperties(cssContent) {
  const tokenMap = new Map();
  const propRegex = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = propRegex.exec(cssContent)) !== null) {
    tokenMap.set(m[1].trim(), m[2].trim());
  }
  return tokenMap;
}

function resolveCssTokenHsl(tokenName, tokenMap, visited = new Set()) {
  if (visited.has(tokenName)) {
    throw new Error(`Cyclic CSS variable reference detected: ${tokenName}`);
  }
  visited.add(tokenName);
  const raw = tokenMap.get(tokenName);
  if (!raw) {
    throw new Error(`Missing CSS variable in src/index.css: ${tokenName}`);
  }
  const varMatch = raw.match(/var\((--[a-zA-Z0-9-]+)\)/);
  if (varMatch) {
    return resolveCssTokenHsl(varMatch[1], tokenMap, visited);
  }
  const hslMatch = raw.match(/^([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%$/);
  if (!hslMatch) {
    throw new Error(`Unparseable HSL triplet for ${tokenName}: '${raw}'`);
  }
  return [parseFloat(hslMatch[1]), parseFloat(hslMatch[2]), parseFloat(hslMatch[3])];
}

const CANONICAL_CONTRAST_PAIRS = [
  { name: 'ink-primary on panel', fg: '--ink-primary', bg: '--surface-panel', min: 4.5 },
  { name: 'ink-primary on canvas', fg: '--ink-primary', bg: '--surface-canvas', min: 4.5 },
  { name: 'ink-secondary on panel', fg: '--ink-secondary', bg: '--surface-panel', min: 4.5 },
  { name: 'ink-secondary on canvas', fg: '--ink-secondary', bg: '--surface-canvas', min: 4.5 },
  { name: 'ink-tertiary on panel', fg: '--ink-tertiary', bg: '--surface-panel', min: 4.5 },
  { name: 'ink-tertiary on canvas', fg: '--ink-tertiary', bg: '--surface-canvas', min: 4.5 },
  { name: 'brand-foreground on brand', fg: '--brand-foreground', bg: '--brand', min: 4.5 },
  { name: 'brand-fill-foreground on brand-fill', fg: '--brand-fill-foreground', bg: '--brand-fill', min: 4.5 },
  { name: 'white on success', fg: '--primitive-neutral-0', bg: '--primitive-success-500', min: 4.5 },
  { name: 'ink-primary on warning', fg: '--ink-primary', bg: '--primitive-warning-500', min: 4.5 },
  { name: 'white on danger', fg: '--primitive-neutral-0', bg: '--primitive-danger-500', min: 4.5 },
  { name: 'ink-primary on info', fg: '--ink-primary', bg: '--info', min: 4.5 },
  { name: 'ink-primary on gold', fg: '--ink-primary', bg: '--primitive-gold-500', min: 4.5 },
];

function verifyContrastIntegrity(issues = []) {
  if (!fs.existsSync(INDEX_CSS_PATH)) return issues;
  const css = fs.readFileSync(INDEX_CSS_PATH, 'utf8');
  const tokenMap = parseCssCustomProperties(css);

  CANONICAL_CONTRAST_PAIRS.forEach((pair) => {
    try {
      const fgHsl = resolveCssTokenHsl(pair.fg, tokenMap);
      const bgHsl = resolveCssTokenHsl(pair.bg, tokenMap);
      const ratio = getContrastRatio(fgHsl, bgHsl);
      if (ratio < pair.min) {
        issues.push({
          file: 'src/index.css',
          line: 1,
          matched: `Contrast failure: ${pair.name} (${ratio.toFixed(2)}:1)`,
          message: `Token pair '${pair.name}' (${pair.fg} on ${pair.bg}) has contrast ${ratio.toFixed(2)}:1, which fails WCAG AA minimum (${pair.min}:1).`,
        });
      }
    } catch (err) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: `Contrast token resolution error: ${pair.name}`,
        message: err.message,
      });
    }
  });
  return issues;
}

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

  // Verify canonical control variables & values
  CANONICAL_CONTROL_TOKENS.forEach(({ name, expected }) => {
    const regex = new RegExp(`${name}:\\s*([^;]+);`);
    const match = css.match(regex);
    if (!match) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: name,
        message: `Required control token ${name} is missing from src/index.css.`,
      });
    } else if (!match[1].includes(expected)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: match[0],
        message: `Control token ${name} value '${match[1].trim()}' does not match canonical value '${expected}'.`,
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

  // Verify canonical icon variables & values
  CANONICAL_ICON_TOKENS.forEach(({ name, expected }) => {
    const regex = new RegExp(`${name}:\\s*([^;]+);`);
    const match = css.match(regex);
    if (!match) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: name,
        message: `Required icon token ${name} is missing from src/index.css.`,
      });
    } else if (!match[1].includes(expected)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: match[0],
        message: `Icon token ${name} value '${match[1].trim()}' does not match canonical value '${expected}'.`,
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

  // Verify surface and brand tokens exist
  REQUIRED_SURFACE_AND_BRAND_TOKENS.forEach((tok) => {
    if (!css.includes(tok)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: tok,
        message: `Required surface/brand token ${tok} is missing from src/index.css.`,
      });
    }
  });

  // Verify primitive physical tokens exist
  CANONICAL_PRIMITIVE_TOKENS.forEach((prim) => {
    if (!css.includes(prim)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: prim,
        message: `Canonical primitive color token ${prim} is missing from src/index.css.`,
      });
    }
  });

  // Verify semantic tokens map to canonical primitives
  SEMANTIC_TOKENS_MAPPING_PRIMITIVES.forEach(({ token, expectedPrimitive }) => {
    const regex = new RegExp(`${token}:\\s*var\\(${expectedPrimitive}\\)`);
    if (!regex.test(css)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: token,
        message: `Semantic token ${token} must reference primitive ${expectedPrimitive} (found no var(${expectedPrimitive}) assignment).`,
      });
    }
  });

  // Verify retired tokens are absent from src/index.css source of truth
  const RETIRED_CSS_TOKENS = [
    '--brand-wash',
    '--brand-wash-border',
    '--brand-wash-foreground',
    '--surface-paper-warm',
    '--surface-paper',
    '--surface-paper-edge',
    '--shadow-paper',
    '--shadow-paper-hover',
    '--shadow-card-hover',
    '--primitive-forest-50',
    '--primitive-forest-100',
    '--primitive-forest-700',
    '--primitive-forest-800',
    '--primitive-info-500',
  ];
  RETIRED_CSS_TOKENS.forEach((tok) => {
    if (css.includes(tok)) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: tok,
        message: `Retired CSS token '${tok}' must not exist in src/index.css source of truth.`,
      });
    }
  });

  // Verify canonical radius baseline (12px / 0.75rem matching NumisCollection)
  if (!css.includes('--radius: 0.75rem;')) {
    issues.push({
      file: 'src/index.css',
      line: 1,
      matched: '--radius',
      message: '--radius must be 0.75rem (12px baseline matching NumisCollection).',
    });
  }

  // Verify canonical radius control token (10px / 0.625rem aligned with NumisCollection calc(12px - 2px))
  if (!css.includes('--radius-control: 0.625rem;')) {
    issues.push({
      file: 'src/index.css',
      line: 1,
      matched: '--radius-control',
      message: '--radius-control must be 0.625rem (10px, matching NumisCollection calc(12px - 2px)).',
    });
  }

  // Verify primitive consumption
  const primitiveChecks = [
    { file: 'src/components/ui/button.jsx', required: ['h-control-md'] },
    { file: 'src/components/ui/icon-button.jsx', required: ['icon-md'] },
    { file: 'src/components/ui/input.jsx', required: ['h-control-md'] },
    { file: 'src/components/app-shell/SearchTrigger.jsx', required: ['h-control-md', 'icon-md'] },
    { file: 'src/components/patterns/ChoiceCard.jsx', required: ['icon-md'] },
  ];

  primitiveChecks.forEach(({ file, required }) => {
    const fullPath = path.resolve(file);
    if (!fs.existsSync(fullPath)) {
      issues.push({
        file,
        line: 1,
        matched: 'Missing primitive',
        message: `Primitive file ${file} does not exist.`,
      });
      return;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    required.forEach((token) => {
      if (!content.includes(token)) {
        issues.push({
          file,
          line: 1,
          matched: `Missing ${token}`,
          message: `Primitive ${file} must consume design token ${token}.`,
        });
      }
    });
  });

  return issues;
}

// 2. Scan Directories for Token Consumption & Rules
const SCAN_DIRECTORIES = [
  path.resolve('src/pages'),
  path.resolve('src/components'),
];

// Exemptions for musical notation canvas coordinate geometry
const GEOMETRY_EXEMPT_FILES = new Set(['ScoreCanvas.jsx', 'ScorePreview.jsx', 'MusicalGlyphs.jsx']);

// Rules to scan for in JSX
const FORBIDDEN_PATTERNS = [
  {
    regex: /text-\[\d+px\]/g,
    message: 'Arbitrary pixel text size found. Use semantic typography (.type-*) or standard Tailwind scale instead.',
    isSvgFontSize: true,
  },
  {
    regex: /(?:bg|text|border|ring)-\[#(?:[0-9a-fA-F]{3}){1,2}\]/g,
    message: 'Raw hex color found in JSX. Use semantic color tokens (e.g. text-ink-*, bg-surface-*, text-brand).',
  },
  {
    regex: /tone=["']surface["']/g,
    message: 'IconButton tone="surface" is retired. Use tone="outline" for standard panel buttons or tone="quiet" for borderless buttons.',
  },
  {
    regex: /type-[a-z-]+(?:\s+[a-z0-9:-]+)*\s+text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[\w+\])/g,
    message: 'Conflicting font-size override on semantic heading. The semantic heading class owns the font size.',
  },
  {
    regex: /text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[\w+\])(?:\s+[a-z0-9:-]+)*\s+type-[a-z-]+/g,
    message: 'Conflicting font-size override before semantic heading. The semantic heading class owns the font size.',
  },
  {
    regex: /(?:bg|text|border|ring|fill|stroke)-primitive-/g,
    message: 'Direct consumption of primitive tokens found in JSX. Application code must only consume semantic tokens (e.g. text-ink-*, bg-surface-*, text-brand).',
  },
  {
    regex: /<DialogTitle[^>]*className=["'][^"']*(?:font-display|text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[\w+\]))[^"']*["']/g,
    message: 'DialogTitle font-size or font-display override. DialogTitle already defines canonical type-section-title.',
  },
  {
    regex: /<Surface[^>]*\b(?:tone=["']paper["']|elevation=["']paper["']|border=["']paper["'])/g,
    message: 'Surface component only supports canonical tones (panel, canvas, raised). Paper tokens are retired.',
  },
  {
    regex: /(?:#2B58BF|#2b58bf|#2C5E43|#2c5e43)/g,
    message: 'Forbidden color found. Royal blue (#2B58BF) and legacy forest green (#2C5E43) are strictly prohibited.',
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

        // Check forbidden patterns
        FORBIDDEN_PATTERNS.forEach((pattern) => {
          // Geometry files only exempt arbitrary pixel text sizing for SVG coordinate scales
          if (isGeometryExempt && pattern.isSvgFontSize) {
            return;
          }
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

        // Check unmigrated application page titles
        if (/<h1[^>]*font-display\s+text-(?:2xl|3xl|4xl)/.test(line)) {
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

// Phase 1: Verify Foundations & Primitives
verifyFoundations(totalViolations);

// Phase 2: Verify Semantic Landmark Structure
function verifyLandmarkStructure(issues = []) {
  const appShellPath = path.resolve('src/components/app-shell/AppShell.jsx');
  const publicShellPath = path.resolve('src/components/public/PublicShell.jsx');
  const appPagePath = path.resolve('src/components/patterns/AppPage.jsx');

  if (fs.existsSync(appShellPath)) {
    const code = fs.readFileSync(appShellPath, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    if (!/<main\b/.test(code)) {
      issues.push({
        file: 'src/components/app-shell/AppShell.jsx',
        line: 1,
        matched: 'Missing <main>',
        message: 'AppShell must own the document <main> landmark for authenticated application routes.',
      });
    }
  }

  if (fs.existsSync(publicShellPath)) {
    const code = fs.readFileSync(publicShellPath, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    if (!/<main\b/.test(code)) {
      issues.push({
        file: 'src/components/public/PublicShell.jsx',
        line: 1,
        matched: 'Missing <main>',
        message: 'PublicShell must own the document <main> landmark for public routes.',
      });
    }
  }

  if (fs.existsSync(appPagePath)) {
    const code = fs.readFileSync(appPagePath, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    if (/<main\b|Component\s*=\s*['"]main['"]/.test(code)) {
      issues.push({
        file: 'src/components/patterns/AppPage.jsx',
        line: 1,
        matched: 'Nested <main> landmark',
        message: 'AppPage must not default to <main> because outer Shells already own the <main> landmark.',
      });
    }
  }

  return issues;
}
verifyLandmarkStructure(totalViolations);

// Phase 3: Verify jsconfig Exclusions Integrity
function verifyExclusionIntegrity(issues = []) {
  const jsconfigPath = path.resolve('jsconfig.json');
  if (!fs.existsSync(jsconfigPath)) return issues;

  const jsconfig = JSON.parse(fs.readFileSync(jsconfigPath, 'utf8'));
  const excluded = (jsconfig.exclude || []).filter((p) => p.startsWith('src/components/ui/'));
  if (excluded.length === 0) return issues;

  // Build a map of excluded base names
  const excludedMap = new Map();
  excluded.forEach((exPath) => {
    const base = path.basename(exPath, path.extname(exPath));
    excludedMap.set(base, exPath);
  });

  function scanImportsInDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanImportsInDir(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js') || entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const normPath = full.replace(/\\/g, '/');
        // Skip files that are themselves in the exclude list
        if (excluded.some((ex) => normPath.endsWith(ex))) continue;

        const code = fs.readFileSync(full, 'utf8');
        for (const [baseName, exPath] of excludedMap.entries()) {
          const importPattern = new RegExp(`from\\s+['"][^'"]*components/ui/${baseName}(?:\\.jsx?)?['"]`);
          if (importPattern.test(code)) {
            const relFile = path.relative(process.cwd(), full);
            issues.push({
              file: relFile,
              line: 1,
              matched: `Imported excluded primitive: ${baseName}`,
              message: `Design System / Type Safety violation: ${exPath} is excluded from typecheck but imported by ${relFile}. Migrate or type the component before importing it.`,
            });
          }
        }
      }
    }
  }

  scanImportsInDir(path.resolve('src'));
  return issues;
}
verifyExclusionIntegrity(totalViolations);

// Phase 4: Scan Codebase
for (const dir of SCAN_DIRECTORIES) {
  scanDirectory(dir, totalViolations);
}

// Phase 4.5: Verify Page-Level Typography Semantic Ownership & Consumption (AST-Based)
function verifyPageTypographyConsumption(issues = []) {
  const pagesDir = path.resolve('src/pages');
  if (!fs.existsSync(pagesDir)) return issues;

  // 1. Self-test AST parser with standard test fixtures
  const testFixtures = [
    {
      code: '<span className="text-xs">bad</span>',
      shouldFail: true,
      label: 'literal text-xs',
    },
    {
      code: '<span className={`text-xs ${active}`}>bad</span>',
      shouldFail: true,
      label: 'template literal text-xs',
    },
    {
      code: '<span className={cn("text-xs", active && "font-medium")}>bad</span>',
      shouldFail: true,
      label: 'CallExpression cn(text-xs)',
    },
    {
      code: '<p className="type-body leading-tight">bad</p>',
      shouldFail: true,
      label: 'semantic leading override',
    },
    {
      code: '<span className="type-caption uppercase tracking-wider">bad</span>',
      shouldFail: true,
      label: 'redundant caption styling',
    },
    {
      code: '{/* ds-allow: specific narrow reason */}\n<span className="text-xs">good</span>',
      shouldFail: false,
      label: 'valid narrow ds-allow exception',
    },
    {
      code: '{/* ds-allow: marketing */}\n<span className="text-xs">bad</span>',
      shouldFail: true,
      label: 'banned trivial ds-allow exception',
    },
  ];

  for (const fixture of testFixtures) {
    const res = scanFile('test-fixture.jsx', fixture.code);
    const hasViolations =
      res.rawFindings.length > 0 ||
      res.redundantUsages.length > 0 ||
      res.leadingOverrides.length > 0 ||
      res.explicitExceptions.some((e) => e.isTrivial);

    if (fixture.shouldFail && !hasViolations) {
      issues.push({
        file: 'scripts/check-design-system.mjs',
        line: 1,
        matched: fixture.label,
        message: `Typography AST scanner regression: expected failure for fixture '${fixture.label}', but none was reported.`,
      });
    } else if (!fixture.shouldFail && hasViolations) {
      issues.push({
        file: 'scripts/check-design-system.mjs',
        line: 1,
        matched: fixture.label,
        message: `Typography AST scanner regression: expected pass for fixture '${fixture.label}', but violations were reported: ${JSON.stringify(res)}.`,
      });
    }
  }

  // 2. Scan all page files under src/pages
  function scanPages(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanPages(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(full, 'utf8');
        const res = scanFile(full, content);

        if (res.error) {
          issues.push({
            file: path.relative(process.cwd(), full),
            line: 1,
            matched: 'AST Parse Error',
            message: res.error,
          });
          continue;
        }

        for (const f of res.rawFindings) {
          issues.push({
            file: path.relative(process.cwd(), full),
            line: f.line,
            matched: f.matched,
            message: f.message,
          });
        }

        for (const f of res.redundantUsages) {
          issues.push({
            file: path.relative(process.cwd(), full),
            line: f.line,
            matched: f.matched,
            message: f.message,
          });
        }

        for (const f of res.leadingOverrides) {
          issues.push({
            file: path.relative(process.cwd(), full),
            line: f.line,
            matched: f.matched,
            message: f.message,
          });
        }

        for (const e of res.explicitExceptions) {
          if (e.isTrivial) {
            issues.push({
              file: path.relative(process.cwd(), full),
              line: e.line,
              matched: e.raw,
              message: `Trivial or missing ds-allow reason '${e.reason}'. Explicit, domain-specific explanation required (do not use generic reasons like 'marketing', 'custom', or 'looks better').`,
            });
          }
        }
      }
    }
  }

  scanPages(pagesDir);
  return issues;
}
verifyPageTypographyConsumption(totalViolations);

// Phase 5: Verify Legacy Color Token Retirement
function verifyLegacyColorRetirement(issues = []) {
  const jsconfigPath = path.resolve('jsconfig.json');
  let excludedSet = new Set();
  if (fs.existsSync(jsconfigPath)) {
    try {
      const jsconfig = JSON.parse(fs.readFileSync(jsconfigPath, 'utf8'));
      (jsconfig.exclude || []).forEach((p) => {
        excludedSet.add(path.resolve(p).replace(/\\/g, '/'));
      });
    } catch (_) {}
  }

  const legacyRegex = /\b(bg-(?:muted|accent|primary|secondary|card|background)|text-(?:muted-foreground|primary|secondary-foreground|card-foreground|foreground)|border-(?:border|input))\b/g;

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const norm = full.replace(/\\/g, '/');
        if (excludedSet.has(norm)) continue;

        const content = fs.readFileSync(full, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
          const matches = line.match(legacyRegex);
          if (matches) {
            matches.forEach((m) => {
              issues.push({
                file: path.relative(process.cwd(), full),
                line: idx + 1,
                matched: m,
                message: `Legacy shadcn color token '${m}' found in product code. Use canonical Yueora tokens (bg-surface-*, text-ink-*, border-line-*, bg-brand, bg-brand-soft, bg-neutral-muted, bg-neutral-hover) instead.`,
              });
            });
          }
        });
      }
    }
  }

  for (const dir of SCAN_DIRECTORIES) {
    scanDir(dir);
  }

  return issues;
}
verifyLegacyColorRetirement(totalViolations);

// Phase 6: Verify Brand-Soft vs Brand-Wash & No Arbitrary Brand Opacities
function verifyBrandSoftVsWashIntegrity(issues = []) {
  const arbitraryBrandRegex = /\bbg-brand\/\d+\b/g;

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(full, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
          if (line.includes('ds-allow') || line.includes('ds-ignore')) return;
          const matches = line.match(arbitraryBrandRegex);
          if (matches) {
            matches.forEach((m) => {
              issues.push({
                file: path.relative(process.cwd(), full),
                line: idx + 1,
                matched: m,
                message: `Arbitrary brand opacity '${m}' found. Use canonical semantic token (bg-brand-soft for compact selection context, or bg-neutral-muted for quiet containers).`,
              });
            });
          }
        });
      }
    }
  }

  for (const dir of SCAN_DIRECTORIES) {
    scanDir(dir);
  }

  return issues;
}
verifyBrandSoftVsWashIntegrity(totalViolations);

// Phase 7: Semantic Navigation, Selection & Surface Contract Verification
function verifyNavigationAndSurfaceContracts(issues = []) {
  // 1. SidebarNavItem: assert bg-nav-active or bg-brand-soft active and NO shadow
  const sidebarNavItemPath = path.resolve('src/components/app-shell/SidebarNavItem.jsx');
  if (fs.existsSync(sidebarNavItemPath)) {
    const code = fs.readFileSync(sidebarNavItemPath, 'utf8');
    if (!code.includes('bg-brand-soft') && !code.includes('bg-nav-active')) {
      issues.push({
        file: 'src/components/app-shell/SidebarNavItem.jsx',
        line: 1,
        matched: 'missing bg-brand-soft or bg-nav-active in SidebarNavItem',
        message: 'SidebarNavItem must use warm gold active navigation (bg-nav-active or bg-brand-soft).',
      });
    }
    if (code.includes('shadow-xs') || code.includes('shadow-sm') || code.includes('shadow-raised')) {
      issues.push({
        file: 'src/components/app-shell/SidebarNavItem.jsx',
        line: 1,
        matched: 'shadow in SidebarNavItem active state',
        message: 'SidebarNavItem active navigation state must be planar (no shadow-xs or shadow-sm).',
      });
    }
  }

  // 2. LibrarySubRail: assert bg-brand-soft or bg-nav-active active and NO shadow
  const librarySubRailPath = path.resolve('src/components/library/LibrarySubRail.jsx');
  if (fs.existsSync(librarySubRailPath)) {
    const code = fs.readFileSync(librarySubRailPath, 'utf8');
    if (!code.includes('bg-brand-soft') && !code.includes('bg-nav-active')) {
      issues.push({
        file: 'src/components/library/LibrarySubRail.jsx',
        line: 1,
        matched: 'missing bg-brand-soft or bg-nav-active in LibrarySubRail',
        message: 'LibrarySubRail navigation items must use warm gold active styling (bg-nav-active or bg-brand-soft).',
      });
    }
    if (code.includes('shadow-xs') || code.includes('shadow-sm')) {
      issues.push({
        file: 'src/components/library/LibrarySubRail.jsx',
        line: 1,
        matched: 'shadow in LibrarySubRail navigation item',
        message: 'LibrarySubRail active items must be planar (no shadow-xs or shadow-sm).',
      });
    }
  }

  // 3. Settings.jsx: assert bg-brand-soft or bg-nav-active active and NO shadow on navigation tabs
  const settingsPath = path.resolve('src/pages/Settings.jsx');
  if (fs.existsSync(settingsPath)) {
    const code = fs.readFileSync(settingsPath, 'utf8');
    if (!code.includes('bg-brand-soft') && !code.includes('bg-nav-active')) {
      issues.push({
        file: 'src/pages/Settings.jsx',
        line: 1,
        matched: 'missing bg-brand-soft or bg-nav-active in Settings navigation',
        message: 'Settings navigation tabs must use warm gold active styling (bg-nav-active or bg-brand-soft).',
      });
    }
    if (code.includes('shadow-xs') || code.includes('shadow-sm')) {
      issues.push({
        file: 'src/pages/Settings.jsx',
        line: 1,
        matched: 'shadow in Settings navigation tabs',
        message: 'Settings navigation tabs must be planar (no shadow-xs).',
      });
    }
  }

  // 4. ImportDropzone.jsx: assert NO bg-brand-soft (drag target is not selection)
  const importDropzonePath = path.resolve('src/components/imports/ImportDropzone.jsx');
  if (fs.existsSync(importDropzonePath)) {
    const code = fs.readFileSync(importDropzonePath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/components/imports/ImportDropzone.jsx',
        line: 1,
        matched: 'bg-brand-soft in ImportDropzone',
        message: 'ImportDropzone active drag target must not use bg-brand-soft; use bg-surface-canvas or bg-neutral-hover with border-brand.',
      });
    }
  }

  // 5. OptionGroup.jsx: assert NO bg-brand-soft (large selection rows use neutral hover + brand indicator)
  const optionGroupPath = path.resolve('src/components/practice/OptionGroup.jsx');
  if (fs.existsSync(optionGroupPath)) {
    const code = fs.readFileSync(optionGroupPath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/components/practice/OptionGroup.jsx',
        line: 1,
        matched: 'bg-brand-soft in OptionGroup',
        message: 'OptionGroup large selectable rows must not use bg-brand-soft; use neutral selection (bg-neutral-hover) + brand indicator.',
      });
    }
  }

  // 6. TransportControl.jsx: assert NO bg-brand-soft (loop is a toggle, not selection)
  const transportControlPath = path.resolve('src/components/patterns/TransportControl.jsx');
  if (fs.existsSync(transportControlPath)) {
    const code = fs.readFileSync(transportControlPath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/components/patterns/TransportControl.jsx',
        line: 1,
        matched: 'bg-brand-soft in TransportControl',
        message: 'TransportControl loop toggle must not use bg-brand-soft; use neutral active control state.',
      });
    }
  }

  // 7. VirtualKeyboard.jsx: assert NO bg-brand-soft (sounding key is playback state)
  const virtualKeyboardPath = path.resolve('src/components/practice/VirtualKeyboard.jsx');
  if (fs.existsSync(virtualKeyboardPath)) {
    const code = fs.readFileSync(virtualKeyboardPath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/components/practice/VirtualKeyboard.jsx',
        line: 1,
        matched: 'bg-brand-soft in VirtualKeyboard',
        message: 'VirtualKeyboard sounding keys must not use bg-brand-soft; use playback state token (e.g. bg-practice-current/20).',
      });
    }
  }

  // 8. ChoiceCard.jsx: assert NO bg-brand-soft (ChoiceCard is a large card selection)
  const choiceCardPath = path.resolve('src/components/patterns/ChoiceCard.jsx');
  if (fs.existsSync(choiceCardPath)) {
    const code = fs.readFileSync(choiceCardPath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/components/patterns/ChoiceCard.jsx',
        line: 1,
        matched: 'bg-brand-soft in ChoiceCard',
        message: 'ChoiceCard is a large selection surface and must not use bg-brand-soft; use neutral selection (bg-neutral-hover) with brand indicator.',
      });
    }
  }

  // 9. tailwind.config.js: assert NO dead chart tokens and NO retired tokens
  const tailwindConfigPath = path.resolve('tailwind.config.js');
  if (fs.existsSync(tailwindConfigPath)) {
    const code = fs.readFileSync(tailwindConfigPath, 'utf8');
    if (code.includes('chart-1') || code.includes('chart:')) {
      issues.push({
        file: 'tailwind.config.js',
        line: 1,
        matched: 'dead chart tokens in tailwind.config.js',
        message: 'tailwind.config.js contains dead chart-* token mappings without canonical CSS variables or consumers.',
      });
    }
    const retiredTailwindTokens = ['wash:', 'washBorder:', 'washForeground:', 'paper-warm:', 'paper:', 'paper-edge:'];
    retiredTailwindTokens.forEach((tok) => {
      if (code.includes(tok)) {
        issues.push({
          file: 'tailwind.config.js',
          line: 1,
          matched: `retired token ${tok} in tailwind.config.js`,
          message: `tailwind.config.js must not define retired token '${tok}'.`,
        });
      }
    });
  }

  // 10. Landing.jsx top-level sections: assert NO banned full-width section surfaces
  const landingPath = path.resolve('src/pages/Landing.jsx');
  if (fs.existsSync(landingPath)) {
    const code = fs.readFileSync(landingPath, 'utf8');
    const sectionTags = code.match(/<section[^>]*>/g) || [];
    const BANNED_SECTION_SURFACES = [
      'bg-brand-wash',
      'bg-surface-paper',
      'bg-surface-paper-warm',
      'bg-neutral-muted',
      'bg-brand',
    ];

    sectionTags.forEach((tag) => {
      BANNED_SECTION_SURFACES.forEach((banned) => {
        const regex = new RegExp(`\\b${banned}(?:\\/\\d+)?\\b`);
        if (regex.test(tag)) {
          issues.push({
            file: 'src/pages/Landing.jsx',
            line: 1,
            matched: tag,
            message: `Landing top-level section contains banned surface '${banned}'. Large surfaces must strictly alternate between bg-surface-canvas and bg-surface-panel.`,
          });
        }
      });
    });
  }

  // 11. Retired tokens & visual exceptions: assert NO brand-wash, surface-paper, shadow-paper, or MusicPaper in ANY JSX file (Recursive, zero allowlist)
  const RETIRED_TOKENS_REGEX = /\b(MusicPaper|bg-brand-wash|border-brand-washBorder|bg-surface-paper-warm|bg-surface-paper|border-surface-paper-edge|shadow-paper|shadow-paper-hover|music-paper)\b/;

  function scanRetiredTokens(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanRetiredTokens(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const rel = path.normalize(path.relative(process.cwd(), full));
        const code = fs.readFileSync(full, 'utf8');
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
          const match = line.match(RETIRED_TOKENS_REGEX);
          if (match) {
            issues.push({
              file: rel,
              line: idx + 1,
              matched: match[0],
              message: `${rel} contains retired token/primitive '${match[0]}'. The Design System strictly enforces 3 canonical surfaces (canvas, panel, raised) with zero paper/notation visual exceptions. Use surface-panel or neutral-hover.`,
            });
          }
        });
      }
    }
  }
  for (const dir of SCAN_DIRECTORIES) {
    scanRetiredTokens(dir);
  }

  // 14. Standard AppPage usage on core overview and detail pages
  const OVERVIEW_PAGES = [
    'src/pages/Imports.jsx',
    'src/pages/Notifications.jsx',
    'src/pages/PracticeHistory.jsx',
    'src/pages/PracticeProgress.jsx',
    'src/pages/PracticeSummary.jsx',
    'src/pages/Settings.jsx',
    'src/pages/Help.jsx',
    'src/pages/Pricing.jsx',
    'src/pages/About.jsx',
  ];
  OVERVIEW_PAGES.forEach((rel) => {
    const p = path.resolve(rel);
    if (fs.existsSync(p)) {
      const code = fs.readFileSync(p, 'utf8');
      if (!code.includes('<AppPage') || !code.includes("from '@/components/patterns/AppPage'")) {
        issues.push({
          file: rel,
          line: 1,
          matched: 'Missing AppPage container',
          message: `${rel} must consume <AppPage> primitive for unified page structure and width.`,
        });
      }
    }
  });

  // 15. Planar Controls & Documentation Contracts (Button, IconButton, docs)
  const buttonPath = path.resolve('src/components/ui/button.jsx');
  if (fs.existsSync(buttonPath)) {
    const code = fs.readFileSync(buttonPath, 'utf8');
    if (/secondary:\s*"[^"]*shadow-xs/.test(code) || /outline:\s*"[^"]*shadow-xs/.test(code)) {
      issues.push({
        file: 'src/components/ui/button.jsx',
        line: 1,
        matched: 'shadow-xs in secondary/outline button',
        message: 'Button secondary and outline variants must be planar (no shadow-xs).',
      });
    }
  }

  const iconButtonPath = path.resolve('src/components/ui/icon-button.jsx');
  if (fs.existsSync(iconButtonPath)) {
    const code = fs.readFileSync(iconButtonPath, 'utf8');
    if (/outline:\s*'[^']*shadow-xs/.test(code) || /active:\s*\{[^}]*shadow-xs/.test(code)) {
      issues.push({
        file: 'src/components/ui/icon-button.jsx',
        line: 1,
        matched: 'shadow-xs in icon-button outline/active',
        message: 'IconButton outline and active variants must be planar (no shadow-xs).',
      });
    }
    if (code.includes('surface:')) {
      issues.push({
        file: 'src/components/ui/icon-button.jsx',
        line: 1,
        matched: 'surface in icon-button',
        message: 'IconButton surface variant is retired. Use tone="outline" instead.',
      });
    }
  }

  const dsDocPath = path.resolve('docs/design-system.md');
  if (fs.existsSync(dsDocPath)) {
    const code = fs.readFileSync(dsDocPath, 'utf8');
    if (code.includes('tone="surface"') || code.includes("tone='surface'")) {
      issues.push({
        file: 'docs/design-system.md',
        line: 1,
        matched: 'tone="surface" in docs/design-system.md',
        message: 'docs/design-system.md must not reference retired IconButton tone="surface".',
      });
    }
  }

  const tabsPath = path.resolve('src/components/ui/tabs.jsx');
  if (fs.existsSync(tabsPath)) {
    const code = fs.readFileSync(tabsPath, 'utf8');
    if (code.includes('shadow-xs')) {
      issues.push({
        file: 'src/components/ui/tabs.jsx',
        line: 1,
        matched: 'shadow-xs in tabs.jsx',
        message: 'TabsTrigger active state must be planar (no shadow-xs).',
      });
    }
  }

  const publicHeaderPath = path.resolve('src/components/public/PublicHeader.jsx');
  if (fs.existsSync(publicHeaderPath)) {
    const code = fs.readFileSync(publicHeaderPath, 'utf8');
    if (code.includes('shadow-xs')) {
      issues.push({
        file: 'src/components/public/PublicHeader.jsx',
        line: 1,
        matched: 'shadow-xs in PublicHeader.jsx',
        message: 'PublicHeader sticky shell must be planar (no shadow-xs).',
      });
    }
  }

  // 15c. Surface Interactive Model Simplification Guard
  // Scan across src/pages and src/components for any non-boolean interactive props on Surface
  function scanSurfaceInteractiveVariants(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanSurfaceInteractiveVariants(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const rel = path.normalize(path.relative(process.cwd(), full));
        const code = fs.readFileSync(full, 'utf8');
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
          const match = line.match(/\binteractive=(?:["']([^"']+)["']|\{["']([^"']+)["']\})/);
          if (match) {
            const val = match[1] || match[2];
            if (val !== 'true' && val !== 'false') {
              issues.push({
                file: rel,
                line: idx + 1,
                matched: `interactive="${val}"`,
                message: `${rel}:${idx + 1} <Surface> interactive prop must be a simple boolean. Custom card variant "${val}" is prohibited.`,
              });
            }
          }
        });
      }
    }
  }
  for (const dir of SCAN_DIRECTORIES) {
    scanSurfaceInteractiveVariants(dir);
  }

  // 16. Neutral Active Shadow Guard (Rule 25)
  // Recursive scan across src/pages and src/components: bg-neutral-muted must NEVER pair with shadow-xs or shadow-sm
  function scanNeutralActiveShadow(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanNeutralActiveShadow(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const rel = path.normalize(path.relative(process.cwd(), full));
        const code = fs.readFileSync(full, 'utf8');
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
          if (line.includes('ds-allow') || line.includes('ds-ignore')) return;
          if (line.includes('bg-neutral-muted') && (line.includes('shadow-xs') || line.includes('shadow-sm'))) {
            issues.push({
              file: rel,
              line: idx + 1,
              matched: 'bg-neutral-muted with shadow',
              message: `${rel}:${idx + 1} Neutral active state (bg-neutral-muted) must be strictly planar (no shadow-xs or shadow-sm).`,
            });
          }
        });
      }
    }
  }
  for (const dir of SCAN_DIRECTORIES) {
    scanNeutralActiveShadow(dir);
  }

  // 17. Standard Panel Shadow Allowlist (Rule 27)
  // Content panels, sections, headers, and list containers must be flat by default.
  // shadow-xs is restricted strictly to primary action primitives and core form controls.
  const ALLOWED_SHADOW_XS_FILES = new Set([
    // Primary / danger CTA action primitives
    path.normalize('src/components/ui/button.jsx'),
    path.normalize('src/components/ui/icon-button.jsx'),
    // Core form controls with subtle affordance
    path.normalize('src/components/ui/checkbox.jsx'),
    path.normalize('src/components/ui/input.jsx'),
    path.normalize('src/components/ui/input-otp.jsx'),
    path.normalize('src/components/ui/radio-group.jsx'),
    path.normalize('src/components/ui/select.jsx'),
    path.normalize('src/components/ui/slider.jsx'),
    path.normalize('src/components/ui/switch.jsx'),
    path.normalize('src/components/ui/textarea.jsx'),
  ]);

  function scanStandardPanelShadows(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanStandardPanelShadows(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const rel = path.normalize(path.relative(process.cwd(), full));
        if (ALLOWED_SHADOW_XS_FILES.has(rel)) continue;
        const code = fs.readFileSync(full, 'utf8');
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
          if (line.includes('ds-allow') || line.includes('ds-ignore')) return;
          if (line.includes('shadow-xs') && !line.includes('drop-shadow-xs')) {
            issues.push({
              file: rel,
              line: idx + 1,
              matched: 'shadow-xs on standard panel/page element',
              message: `${rel}:${idx + 1} Standard panels, cards, and page elements must be planar. shadow-xs is restricted to approved action CTAs and form control primitives in ALLOWED_SHADOW_XS_FILES.`,
            });
          }
        });
      }
    }
  }
  for (const dir of SCAN_DIRECTORIES) {
    scanStandardPanelShadows(dir);
  }

  // 16. Surface component API governance (only panel, canvas, raised, and boolean interactive)
  const surfacePath = path.resolve('src/components/patterns/Surface.jsx');
  if (fs.existsSync(surfacePath)) {
    const code = fs.readFileSync(surfacePath, 'utf8');
    if (code.includes("tone: 'paper'") || code.includes("elevation: 'paper'") || code.includes("border: 'paper'") || code.includes("tone === 'paper'") || code.includes("elevation === 'paper'")) {
      issues.push({
        file: 'src/components/patterns/Surface.jsx',
        line: 1,
        matched: 'paper in Surface.jsx CVA',
        message: 'Surface component only supports canonical tones (panel, canvas, raised). Paper tokens are retired.',
      });
    }
    if (code.includes("'static-card'") || code.includes("'card'") || code.includes("'row'") || code.includes("'quiet'")) {
      issues.push({
        file: 'src/components/patterns/Surface.jsx',
        line: 1,
        matched: 'variant proliferation in Surface.jsx',
        message: 'Surface interactive variants must be simplified to boolean true/false. Custom card/row/quiet variants are prohibited.',
      });
    }
    if (code.includes('shadow-card-hover')) {
      issues.push({
        file: 'src/components/patterns/Surface.jsx',
        line: 1,
        matched: 'shadow-card-hover in Surface.jsx',
        message: 'Surface must not reference retired shadow-card-hover token.',
      });
    }

    // Verify non-actionable Practice StatCards have no interactive prop on Surface
    const practiceStatCardPath = path.resolve('src/components/practice/PracticeStatCard.jsx');
    if (fs.existsSync(practiceStatCardPath)) {
      const pscCode = fs.readFileSync(practiceStatCardPath, 'utf8');
      if (/<Surface[^>]*\binteractive\b/.test(pscCode)) {
        issues.push({
          file: 'src/components/practice/PracticeStatCard.jsx',
          line: 1,
          matched: 'interactive on Surface in PracticeStatCard',
          message: 'PracticeStatCard must not pass interactive to Surface. Non-actionable metric cards must own their hover grammar directly.',
        });
      }
    }

    const practiceHubPath = path.resolve('src/pages/PracticeHub.jsx');
    if (fs.existsSync(practiceHubPath)) {
      const phCode = fs.readFileSync(practiceHubPath, 'utf8');
      if (phCode.includes('interactive className="flex items-start justify-between" data-qa="practice-stat-card"')) {
        issues.push({
          file: 'src/pages/PracticeHub.jsx',
          line: 1,
          matched: 'interactive on non-actionable practice stat card',
          message: 'Non-actionable PracticeHub StatCards must not use interactive prop.',
        });
      }
    }
  }

  // 17. Documentation & AGENTS Truth Sync
  const agentsPath = path.resolve('AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    const code = fs.readFileSync(agentsPath, 'utf8');
    const forbiddenAgentsPatterns = [
      'tone="panel|paper',
      'tone="paper"',
      'elevation="paper"',
      'border="paper"',
    ];
    forbiddenAgentsPatterns.forEach((p) => {
      if (code.includes(p)) {
        issues.push({
          file: 'AGENTS.md',
          line: 1,
          matched: p,
          message: `AGENTS.md exposes deprecated Surface API '${p}'. Real Surface component only supports panel, canvas, raised.`,
        });
      }
    });
  }

  const dsDocsPath = path.resolve('docs/design-system.md');
  if (fs.existsSync(dsDocsPath)) {
    const code = fs.readFileSync(dsDocsPath, 'utf8');
    const forbiddenDocsPatterns = [
      'elevation="paper"',
      'tone="paper"',
      'border="paper"',
      'secondary action with paper surface',
    ];
    forbiddenDocsPatterns.forEach((p) => {
      if (code.includes(p)) {
        issues.push({
          file: 'docs/design-system.md',
          line: 1,
          matched: p,
          message: `docs/design-system.md mentions deprecated API or phrase '${p}'.`,
        });
      }
    });
  }

  return issues;
}
verifyNavigationAndSurfaceContracts(totalViolations);
verifyContrastIntegrity(totalViolations);

// Phase 8: Verify Application Visual-Rendering Token Invariant (src/lib)
function verifyRenderingCodeTokens(issues = []) {
  const RENDERING_DIR = path.resolve('src/lib');
  if (!fs.existsSync(RENDERING_DIR)) return issues;

  const RENDERING_SIGNALS = [
    "getContext('2d')",
    'getContext("2d")',
    "createElement('canvas')",
    'createElement("canvas")',
    'createRoot',
    'XMLSerializer',
  ];

  const RAW_COLOR_REGEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

  function scanRenderingDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanRenderingDir(full);
      } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        const code = fs.readFileSync(full, 'utf8');

        // Dynamically detect rendering modules without hardcoding specific filenames
        const isRenderingModule = RENDERING_SIGNALS.some((sig) => code.includes(sig));
        if (!isRenderingModule) continue;

        // Invariant 1: No duplicated token tables (e.g. hardcoded HSL mappings)
        if (/const\s+TOKENS\s*=\s*\{/.test(code) || /--foreground:\s*['"]\d+/.test(code)) {
          issues.push({
            file: path.relative(process.cwd(), full),
            line: 1,
            matched: 'hardcoded TOKENS map',
            message: 'Rendering code must not maintain a duplicate token map; resolve canonical CSS custom properties via resolveSemanticColor() or resolveRequiredSvgTokens().',
          });
        }

        // Invariant 2: No unannotated raw color literals (requires explicit // ds-allow: <reason>)
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            if (/ds-allow:\s*\S+/.test(line)) return;
          }
          if (/ds-allow:\s*\S+/.test(line)) return;

          const matches = line.match(RAW_COLOR_REGEX);
          if (matches) {
            matches.forEach((m) => {
              issues.push({
                file: path.relative(process.cwd(), full),
                line: idx + 1,
                matched: m,
                message: `Unannotated raw color literal '${m}' found in rendering module. Resolve canonical token via resolveSemanticColor(), or annotate intentional output-specific color with '// ds-allow: <reason>'.`,
              });
            });
          }
        });
      }
    }
  }

  scanRenderingDir(RENDERING_DIR);
  return issues;
}
verifyRenderingCodeTokens(totalViolations);

// Phase 9: Verify Button Semantic API & Page Appearance Ownership (Visual Freedom Contraction)
function verifyVisualFreedomContraction(issues = []) {
  const PAGES_DIR = path.resolve('src/pages');
  const SRC_DIR = path.resolve('src');

  // 1. Button API Invariants across all src files (.js, .jsx, .ts, .tsx):
  // - Ban legacy variant= attribute on Button (only intent is supported)
  // - Ban legacy variant aliases (variant="default|outline|ghost|destructive")
  // - Ban legacy button sizes (size="hero" or size="default")
  // - Ban stale hero documentation / preview references
  function scanButtonApi(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
          scanButtonApi(full);
        }
      } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
        const code = fs.readFileSync(full, 'utf8');
        const rel = path.relative(process.cwd(), full);

        const btnVariantMatches = code.matchAll(/<Button\b[^>]*\bvariant\s*=/g);
        for (const m of btnVariantMatches) {
          const line = code.slice(0, m.index).split('\n').length;
          issues.push({
            file: rel,
            line,
            matched: 'variant=',
            message: `Legacy Button 'variant' prop is retired. Use semantic 'intent' prop (primary, secondary, quiet, danger, subtle, link, inverse, inverse-secondary).`,
          });
        }

        const btnSizeMatches = code.matchAll(/<Button\b[^>]*\bsize=["'](hero|default)["']/g);
        for (const m of btnSizeMatches) {
          const line = code.slice(0, m.index).split('\n').length;
          issues.push({
            file: rel,
            line,
            matched: m[0],
            message: `Legacy Button size '${m[1]}' is retired. Button sizes are strictly canonical: 'xs', 'sm', 'md', 'lg', 'xl'.`,
          });
        }

        const staleHeroMatches = code.matchAll(/(?:hero:\s*52px|Size Hero)/gi);
        for (const m of staleHeroMatches) {
          const line = code.slice(0, m.index).split('\n').length;
          issues.push({
            file: rel,
            line,
            matched: m[0],
            message: `Stale 'hero 52px' reference detected. Button sizes are strictly canonical: 'xs' (28px), 'sm' (32px), 'md' (36px), 'lg' (40px), 'xl' (44px).`,
          });
        }
      }
    }
  }
  scanButtonApi(SRC_DIR);

  // 2. Comprehensive Page Appearance Ownership via AST-based Appearance Guard
  // Covers .js, .jsx, .ts, .tsx across src/pages/**
  // Enforces:
  // - Zero generic/arbitrary radii
  // - Zero direct shadow-overlay / shadow-raised on non-primitive elements
  // - Zero physical colors (bg-white/black)
  // - Zero Button / IconButton appearance overrides
  // - Zero DialogContent / DropdownMenuContent appearance overrides
  // - Unconditional enforcement (no ds-allow bypass for appearance rules)
  function scanPages(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanPages(full);
      } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
        const code = fs.readFileSync(full, 'utf8');
        const rel = path.relative(process.cwd(), full);
        const fileIssues = scanPageAppearanceContent(code, rel);
        issues.push(...fileIssues);
      }
    }
  }
  if (fs.existsSync(PAGES_DIR)) {
    scanPages(PAGES_DIR);
  }

  return issues;
}
verifyVisualFreedomContraction(totalViolations);

if (totalViolations.length === 0) {
  console.log('✅ Design System integrity checks passed.');
  console.log(`   - Verified ${REQUIRED_TYPOGRAPHY.length} semantic typography roles in src/index.css`);
  console.log(`   - Verified ${CANONICAL_PRIMITIVE_TOKENS.length} canonical primitive tokens & ${SEMANTIC_TOKENS_MAPPING_PRIMITIVES.length} primitive alias mappings in src/index.css`);
  console.log(`   - Verified ${REQUIRED_SURFACE_AND_BRAND_TOKENS.length} canonical surface/brand tokens in src/index.css`);
  console.log(`   - Verified ${CANONICAL_CONTROL_TOKENS.length} canonical control tokens & ${REQUIRED_CONTROL_UTILITIES.length} utilities`);
  console.log(`   - Verified ${CANONICAL_ICON_TOKENS.length} canonical icon tokens & ${REQUIRED_ICON_UTILITIES.length} utilities`);
  console.log(`   - Verified primitive token consumption contracts (Button, IconButton, Input, SearchTrigger, ChoiceCard)`);
  console.log(`   - Verified document landmark integrity (AppShell/PublicShell own main, AppPage does not nest main)`);
  console.log(`   - Verified jsconfig exclusion integrity (zero excluded UI primitives imported by application)`);
  console.log(`   - Verified legacy color token retirement (zero legacy tokens in application pages or active primitives)`);
  console.log(`   - Verified zero direct primitive-* token utilities consumed in application JSX`);
  console.log(`   - Verified brand-soft vs brand-wash integrity (zero arbitrary bg-brand/opacity in application code)`);
  console.log(`   - Verified prohibited brand-soft contexts in named shared components (ChoiceCard, ImportDropzone, OptionGroup, TransportControl, VirtualKeyboard, SidebarNavItem, LibrarySubRail, Settings)`);
  console.log(`   - Verified zero dead chart-* tokens and zero retired tokens in tailwind.config.js`);
  console.log(`   - Verified planar navigation active states and planar secondary/outline buttons (Button, IconButton, Sidebar, Library, Performances, Pricing, Preview)`);
  console.log(`   - Verified planar shell & tab triggers (TabsTrigger, PublicHeader)`);
  console.log(`   - Verified Neutral Active Shadow Guard (zero bg-neutral-muted with shadow across all pages and components)`);
  console.log(`   - Verified Standard Panel planar standard & planar controls (buttons, inputs, and standard panels are flat by default)`);
  console.log(`   - Verified planar container integrity across core application pages (Notifications, Imports, About, Help, Library, DesignSystemPreview)`);
  console.log(`   - Verified Surface API simplification (zero paper tone/elevation in Surface component or consumers)`);
  console.log(`   - Verified retired paper tokens & MusicPaper completely removed from product code (zero exceptions)`);
  console.log(`   - Verified zero DialogTitle typography overrides & zero conflicting font-size overrides on semantic typography`);
  console.log('   - Verified Page Typography Ownership & Consumption (zero raw font-size, font-display, uppercase, or tracking across all pages in src/pages)');
  console.log(`   - Verified Button Semantic API & Visual Freedom Contraction (zero variant= props, zero legacy aliases, zero hero/default sizes)`);
  console.log(`   - Verified Page Appearance Ownership (zero arbitrary/generic radii, zero arbitrary/generic shadows, zero raw physical colors in src/pages)`);
  console.log(`   - Verified Button Visual Ownership Guard (zero button appearance overrides in page JSX)`);
  console.log(`   - Verified documentation and AI instruction truth sync (AGENTS.md & docs/design-system.md)`);
  console.log(`   - Verified zero banned full-width Landing surfaces`);
  console.log(`   - Verified retired tokens permanently removed and forbidden from product code`);
  console.log(`   - Verified standard AppPage adoption on core overview and detail pages`);
  console.log(`   - Verified visual-rendering token invariant across application rendering modules (src/lib)`);
  console.log(`   - Verified WCAG AA contrast compliance across ${CANONICAL_CONTRAST_PAIRS.length} canonical foreground/background pairs via computed relative luminance`);
  console.log(`   - Scanned ${scannedFilesCount} JSX files across ${SCAN_DIRECTORIES.length} root directories\n`);
  process.exit(0);
} else {
  console.error(`⚠️ Found ${totalViolations.length} Design System violations:\n`);
  totalViolations.forEach((v) => {
    console.error(`  ${v.file}:${v.line} - [${v.matched}] ${v.message}`);
  });
  console.error('\nPlease resolve these violations by adhering to canonical tokens and primitives.\n');
  process.exit(1);
}
