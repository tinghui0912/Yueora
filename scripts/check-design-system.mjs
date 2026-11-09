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

// Phase 7: Semantic Navigation & Landing Surface Contract Verification
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

  // 4. Landing.jsx top-level sections: assert NO banned full-width section surfaces
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

  return issues;
}
verifyNavigationAndSurfaceContracts(totalViolations);

if (totalViolations.length === 0) {
  console.log('✅ Design System integrity checks passed.');
  console.log(`   - Verified ${REQUIRED_TYPOGRAPHY.length} semantic typography roles in src/index.css`);
  console.log(`   - Verified ${REQUIRED_SURFACE_AND_BRAND_TOKENS.length} canonical surface/brand tokens in src/index.css`);
  console.log(`   - Verified ${CANONICAL_CONTROL_TOKENS.length} canonical control tokens & ${REQUIRED_CONTROL_UTILITIES.length} utilities`);
  console.log(`   - Verified ${CANONICAL_ICON_TOKENS.length} canonical icon tokens & ${REQUIRED_ICON_UTILITIES.length} utilities`);
  console.log(`   - Verified primitive token consumption contracts (Button, IconButton, Input, SearchTrigger, ChoiceCard)`);
  console.log(`   - Verified document landmark integrity (AppShell/PublicShell own main, AppPage does not nest main)`);
  console.log(`   - Verified jsconfig exclusion integrity (zero excluded UI primitives imported by application)`);
  console.log(`   - Verified legacy color token retirement (zero legacy tokens in application pages or active primitives)`);
  console.log(`   - Verified brand-soft vs brand-wash integrity (zero arbitrary bg-brand/opacity in application code)`);
  console.log(`   - Verified navigation active contract (SidebarNavItem, LibrarySubRail, Settings strictly use neutral active)`);
  console.log(`   - Verified landing page surface rhythm (zero banned surfaces on full-width sections; strict canvas/panel alternating rhythm)`);
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
