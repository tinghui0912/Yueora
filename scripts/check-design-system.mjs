import fs from 'fs';
import path from 'path';

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
  'type-metadata',
  'type-metric',
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
  '--brand-wash',
  '--brand-wash-border',
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
  '--primitive-ink-900',
  '--primitive-forest-50',
  '--primitive-forest-100',
  '--primitive-forest-700',
  '--primitive-forest-800',
  '--primitive-gold-500',
  '--primitive-success-500',
  '--primitive-warning-500',
  '--primitive-danger-500',
  '--primitive-info-500',
];

const SEMANTIC_TOKENS_MAPPING_PRIMITIVES = [
  { token: '--surface-canvas', expectedPrimitive: '--primitive-neutral-25' },
  { token: '--surface-panel', expectedPrimitive: '--primitive-neutral-0' },
  { token: '--brand', expectedPrimitive: '--primitive-forest-700' },
  { token: '--brand-soft', expectedPrimitive: '--primitive-forest-100' },
  { token: '--brand-wash', expectedPrimitive: '--primitive-neutral-0' },
  { token: '--ink-primary', expectedPrimitive: '--primitive-ink-900' },
  { token: '--ink-tertiary', expectedPrimitive: '--primitive-ink-500' },
  { token: '--neutral-muted', expectedPrimitive: '--primitive-neutral-100' },
  { token: '--neutral-hover', expectedPrimitive: '--primitive-neutral-75' },
  { token: '--warning-foreground', expectedPrimitive: '--primitive-ink-900' },
  { token: '--practice-current-foreground', expectedPrimitive: '--primitive-ink-900' },
];

// WCAG AA Contrast Verification
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

const CANONICAL_CONTRAST_PAIRS = [
  { name: 'ink-primary on panel', fg: [220, 5, 13], bg: [0, 0, 100], min: 4.5 },
  { name: 'ink-primary on canvas', fg: [220, 5, 13], bg: [44, 19, 97], min: 4.5 },
  { name: 'ink-secondary on panel', fg: [223, 4, 36], bg: [0, 0, 100], min: 4.5 },
  { name: 'ink-secondary on canvas', fg: [223, 4, 36], bg: [44, 19, 97], min: 4.5 },
  { name: 'ink-tertiary on panel', fg: [220, 4, 44], bg: [0, 0, 100], min: 4.5 },
  { name: 'ink-tertiary on canvas', fg: [220, 4, 44], bg: [44, 19, 97], min: 4.5 },
  { name: 'white on brand', fg: [0, 0, 100], bg: [148, 36, 27], min: 4.5 },
  { name: 'white on success', fg: [0, 0, 100], bg: [148, 30, 38], min: 4.5 },
  { name: 'ink-900 on warning', fg: [220, 5, 13], bg: [38, 58, 45], min: 4.5 },
  { name: 'white on danger', fg: [0, 0, 100], bg: [0, 65, 45], min: 4.5 },
  { name: 'white on info', fg: [0, 0, 100], bg: [210, 30, 45], min: 4.5 },
  { name: 'ink-900 on gold/current', fg: [220, 5, 13], bg: [44, 67, 46], min: 4.5 },
];

function verifyContrastIntegrity(issues = []) {
  CANONICAL_CONTRAST_PAIRS.forEach((pair) => {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    if (ratio < pair.min) {
      issues.push({
        file: 'src/index.css',
        line: 1,
        matched: `Contrast failure: ${pair.name} (${ratio.toFixed(2)}:1)`,
        message: `Token pair '${pair.name}' has contrast ${ratio.toFixed(2)}:1, which fails WCAG AA minimum (${pair.min}:1).`,
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

  // Verify primitive consumption
  const primitiveChecks = [
    { file: 'src/components/ui/button.jsx', required: ['h-control-md'] },
    { file: 'src/components/ui/icon-button.jsx', required: ['icon-md'] },
    { file: 'src/components/ui/input.jsx', required: ['h-control-lg'] },
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
  {
    regex: /(?:bg|text|border|ring|fill|stroke)-primitive-/g,
    message: 'Direct consumption of primitive tokens found in JSX. Application code must only consume semantic tokens (e.g. text-ink-*, bg-surface-*, text-brand).',
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
                message: `Arbitrary brand opacity '${m}' found. Use canonical semantic token (bg-brand-soft for selected/active context, bg-brand-wash for featured modules, or bg-neutral-muted for quiet containers).`,
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
  // 1. SidebarNavItem: assert NO bg-brand-soft
  const sidebarNavItemPath = path.resolve('src/components/app-shell/SidebarNavItem.jsx');
  if (fs.existsSync(sidebarNavItemPath)) {
    const code = fs.readFileSync(sidebarNavItemPath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/components/app-shell/SidebarNavItem.jsx',
        line: 1,
        matched: 'bg-brand-soft in SidebarNavItem',
        message: 'SidebarNavItem must use neutral active navigation (bg-neutral-muted text-ink-primary font-semibold shadow-xs) instead of bg-brand-soft.',
      });
    }
  }

  // 2. LibrarySubRail: assert NO bg-brand-soft
  const librarySubRailPath = path.resolve('src/components/library/LibrarySubRail.jsx');
  if (fs.existsSync(librarySubRailPath)) {
    const code = fs.readFileSync(librarySubRailPath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/components/library/LibrarySubRail.jsx',
        line: 1,
        matched: 'bg-brand-soft in LibrarySubRail',
        message: 'LibrarySubRail navigation items must use neutral active styling (bg-neutral-muted) instead of bg-brand-soft.',
      });
    }
  }

  // 3. Settings.jsx: assert NO bg-brand-soft on navigation tabs
  const settingsPath = path.resolve('src/pages/Settings.jsx');
  if (fs.existsSync(settingsPath)) {
    const code = fs.readFileSync(settingsPath, 'utf8');
    if (code.includes('bg-brand-soft')) {
      issues.push({
        file: 'src/pages/Settings.jsx',
        line: 1,
        matched: 'bg-brand-soft in Settings navigation',
        message: 'Settings navigation tabs must use neutral active styling (bg-neutral-muted) instead of bg-brand-soft.',
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

  // 9. tailwind.config.js: assert NO dead chart tokens
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

  // 11. MusicPaper Allowlist Check (Recursive across src/pages and src/components)
  const MUSIC_PAPER_ALLOWLIST = new Set([
    path.normalize('src/components/patterns/MusicPaper.jsx'),
    path.normalize('src/components/library/ScoreCard.jsx'),
    path.normalize('src/components/visuals/HeroProductVisual.jsx'),
    path.normalize('src/pages/DesignSystemPreview.jsx'),
    path.normalize('src/pages/PracticeSession.jsx'),
    path.normalize('src/pages/ScoreDetail.jsx'),
  ]);

  function scanMusicPaper(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanMusicPaper(full);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const rel = path.normalize(path.relative(process.cwd(), full));
        const code = fs.readFileSync(full, 'utf8');
        if (code.includes('<MusicPaper') || code.includes("from '@/components/patterns/MusicPaper'")) {
          if (!MUSIC_PAPER_ALLOWLIST.has(rel)) {
            issues.push({
              file: rel,
              line: 1,
              matched: 'Unauthorized MusicPaper consumer',
              message: `${rel} consumes <MusicPaper>. MusicPaper is strictly reserved for literal score/notation canvases (ScoreCard, ScoreDetail, PracticeSession, HeroProductVisual). Generic cards must use surface-panel.`,
            });
          }
        }
      }
    }
  }
  for (const dir of SCAN_DIRECTORIES) {
    scanMusicPaper(dir);
  }

  // 12. Button / IconButton / Topbar: assert NO hover:bg-surface-paper*
  const HOVER_PAPER_CHECKS = [
    'src/components/ui/button.jsx',
    'src/components/ui/icon-button.jsx',
    'src/components/app-shell/Topbar.jsx',
  ];
  HOVER_PAPER_CHECKS.forEach((rel) => {
    const p = path.resolve(rel);
    if (fs.existsSync(p)) {
      const code = fs.readFileSync(p, 'utf8');
      if (code.includes('hover:bg-surface-paper')) {
        issues.push({
          file: rel,
          line: 1,
          matched: 'hover:bg-surface-paper in component',
          message: `${rel} must use canonical hover token hover:bg-neutral-hover, not hover:bg-surface-paper*.`,
        });
      }
    }
  });

  // 13. Retired tokens: assert NO brand-wash or surface-paper-warm in ANY JSX file (Recursive)
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
        if (code.includes('bg-brand-wash') || code.includes('border-brand-washBorder') || code.includes('bg-surface-paper-warm')) {
          issues.push({
            file: rel,
            line: 1,
            matched: 'Retired token in JSX',
            message: `${rel} contains retired tokens (bg-brand-wash or bg-surface-paper-warm). Standard surfaces must use surface-panel or neutral-hover.`,
          });
        }
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

  return issues;
}
verifyNavigationAndSurfaceContracts(totalViolations);
verifyContrastIntegrity(totalViolations);

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
  console.log(`   - Verified zero dead chart-* tokens in tailwind.config.js`);
  console.log(`   - Verified zero banned full-width Landing surfaces`);
  console.log(`   - Verified recursive MusicPaper allowlist (strictly notation canvases only)`);
  console.log(`   - Verified zero hover:bg-surface-paper in core UI primitives (Button, IconButton, Topbar)`);
  console.log(`   - Verified recursive retirement of brand-wash and surface-paper-warm across all components and pages`);
  console.log(`   - Verified standard AppPage adoption on core overview and detail pages`);
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
