import path from 'path';

/**
 * Color Provenance and Allowlist Guard
 *
 * Enforces that no unknown physical colors, hexes, rgbs, named Tailwind physical colors,
 * unapproved SVG opacities, unapproved Canvas alphas, or unproven color-opacity pairs
 * enter the codebase.
 * Every visual recipe must trace to tinghui0912/NumisCollection (efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c).
 */

// 1. External Brand Asset Exceptions (Strictly scoped by file and values)
export const EXTERNAL_BRAND_EXCEPTIONS = {
  'src/components/GoogleIcon.jsx': new Set([
    '#4285f4', // Google Blue
    '#34a853', // Google Green
    '#fbbc05', // Google Yellow
    '#ea4335', // Google Red
  ]),
};

// 2. Framework / Library Selector Exceptions (Direct Numis source provenance)
export const FRAMEWORK_SELECTOR_EXCEPTIONS = {
  'src/components/ui/chart.jsx': new Set([
    '#ccc', // Recharts grid stroke selector [stroke='#ccc']
    '#fff', // Recharts dot/sector stroke selector [stroke='#fff']
  ]),
};

// 3. 32 Frozen Numis Root Tokens (Source of Truth in src/index.css)
export const NUMIS_ROOT_TOKENS = new Set([
  '--numis-background',
  '--numis-foreground',
  '--numis-card',
  '--numis-card-foreground',
  '--numis-popover',
  '--numis-popover-foreground',
  '--numis-primary',
  '--numis-primary-foreground',
  '--numis-secondary',
  '--numis-secondary-foreground',
  '--numis-muted',
  '--numis-muted-foreground',
  '--numis-accent',
  '--numis-accent-foreground',
  '--numis-destructive',
  '--numis-destructive-foreground',
  '--numis-border',
  '--numis-input',
  '--numis-ring',
  '--numis-sidebar-background',
  '--numis-sidebar-foreground',
  '--numis-sidebar-primary',
  '--numis-sidebar-primary-foreground',
  '--numis-sidebar-accent',
  '--numis-sidebar-accent-foreground',
  '--numis-sidebar-border',
  '--numis-sidebar-ring',
  '--numis-chart-1',
  '--numis-chart-2',
  '--numis-chart-3',
  '--numis-chart-4',
  '--numis-chart-5',
]);

// 4. Approved Elevation Shadow Custom Properties in src/index.css
export const ELEVATION_SHADOW_TOKENS = new Set([
  '--shadow-control',
  '--shadow-raised',
  '--shadow-overlay',
]);

// 5. Numis Actual Status Recipes (Role-aware manifest traced to exact source files)
export const NUMIS_STATUS_RECIPES = [
  {
    id: 'condition-positive',
    source: 'src/components/collection/ItemCard.jsx:6',
    classes: ['border-emerald-200', 'bg-emerald-500/10', 'text-emerald-700'],
  },
  {
    id: 'condition-warning',
    source: 'src/components/collection/ItemCard.jsx:10',
    classes: ['border-amber-200', 'bg-amber-500/10', 'text-amber-700'],
  },
  {
    id: 'condition-danger',
    source: 'src/components/collection/ItemCard.jsx:12',
    classes: ['border-red-200', 'bg-red-500/10', 'text-red-700'],
  },
  {
    id: 'condition-blue',
    source: 'src/components/collection/ItemCard.jsx:8',
    classes: ['border-blue-200', 'bg-blue-500/10', 'text-blue-700'],
  },
  {
    id: 'condition-gray',
    source: 'src/components/collection/ItemCard.jsx:13',
    classes: ['border-gray-200', 'bg-gray-500/10', 'text-gray-700'],
  },
  {
    id: 'callout-warning',
    source: 'src/components/collection/BulkEstimateButton.jsx:44',
    classes: ['text-amber-600', 'bg-amber-50'],
  },
  {
    id: 'positive-metric',
    source: 'src/pages/UserProfile.jsx:114, ItemCard.jsx:84, ItemDetailDialog.jsx:61',
    classes: ['text-emerald-600'],
  },
  {
    id: 'negative-metric',
    source: 'src/pages/UserProfile.jsx:114, ItemCard.jsx:84, ItemDetailDialog.jsx:61',
    classes: ['text-red-500'],
  },
  {
    id: 'success-icon',
    source: 'src/components/collection/BulkEstimateButton.jsx:69',
    classes: ['text-green-500'],
  },
  {
    id: 'inline-warning-text',
    source: 'src/components/collection/BulkEstimateButton.jsx:44, ItemCard.jsx:10',
    classes: ['text-amber-700'],
  },
  {
    id: 'status-dot-emerald',
    source: 'Numis emerald palette for status indicator dot',
    classes: ['bg-emerald-500'],
  },
  {
    id: 'status-dot-amber',
    source: 'Numis amber palette for status indicator dot',
    classes: ['bg-amber-500'],
  },
];

export const NUMIS_ACTUAL_STATUS_RECIPES = new Set(
  NUMIS_STATUS_RECIPES.flatMap((r) => r.classes).concat([
    'text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600',
    'bg-slate-50', 'bg-slate-100', 'bg-slate-200',
    'border-slate-100', 'border-slate-200', 'border-slate-300',
    'text-slate-300', 'text-slate-600', 'text-slate-700', 'text-slate-800', 'text-slate-900',
    'ring-slate-500',
  ])
);

// 6. Numis Dialog / Drawer Overlay Recipes (Verbatim Numis alert-dialog, dialog, drawer, sheet: ALL /80)
export const NUMIS_OVERLAY_RECIPES = {
  'src/components/ui/alert-dialog.jsx': new Set(['bg-black/80']),
  'src/components/ui/dialog.jsx': new Set(['bg-black/80']),
  'src/components/ui/drawer.jsx': new Set(['bg-black/80']),
  'src/components/ui/sheet.jsx': new Set(['bg-black/80']),
};

// 7. Exact Color + Opacity Pairs (Verified from NumisCollection efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c)
// Note: /70 is permanently removed from chromatic allowlist as it has no chromatic source provenance.
export const NUMIS_COLOR_OPACITY_PAIRS = new Set([
  // Primary (Brand) opacities
  'brand/5',
  'brand/10',
  'brand/15',
  'brand/20',
  'brand/30',
  'brand/40',
  'brand/50',
  'brand/60',
  'brand/80',
  'brand/90',

  // Practice domain aliases of primary (brand)
  'practice-current/10',
  'practice-current/20',
  'practice-current/40',

  // Destructive (Danger) opacities
  'danger/10',
  'danger/30',
  'danger/50',
  'danger/80',
  'danger/90',

  // Status named colors with exact opacity
  'emerald-500/10',
  'amber-500/10',
  'red-500/10',
  'blue-500/10',
  'gray-500/10',
  'orange-500/10',

  // Surface / Line / Neutral opacities
  'surface-canvas/50',
  'surface-canvas/60',
  'surface-panel/90',
  'surface-panel/95',
  'line-subtle/30',
  'line-subtle/50',
  'neutral-muted/30',
  'neutral-muted/40',
  'neutral-muted/50',
  'ink-primary/50',
  'ink-secondary/70',
  'ink-tertiary/30',
  'ink-tertiary/40',
  'ink-tertiary/60',

  // Black overlay
  'black/80',
]);

// Backward compatibility alias for any legacy test references
export const ALLOWED_CHROMATIC_OPACITIES = new Set([
  '5', '10', '15', '20', '30', '40', '50', '60', '80', '90', '95'
]);

// 8. Retired Yueora Physical Colors & Tokens (Zero Tolerance Blacklist)
export const RETIRED_YUEORA_PATTERNS = [
  /#98661B/i,
  /#895814/i,
  /#D39029/i,
  /#2B58BF/i, // Royal blue
  /#2C5E43/i, // Forest green
  /36\s+70%\s+35%/,
  /\bbrand-fill\b/i,
  /\bbrand-fill-hover\b/i,
  /\bbrand-fill-foreground\b/i,
  /\bbrand-hover\b/i,
  /\bprimitive-gold-[0-9]+\b/i,
  /\bprimitive-neutral-[0-9]+\b/i,
  /\bprimitive-danger-[0-9]+\b/i,
];

// Tailwind physical color names that must have exact Numis status provenance
const TAILWIND_NAMED_COLORS = [
  'slate', 'gray', 'zinc', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
  'violet', 'purple', 'fuchsia', 'pink', 'rose',
];

/**
 * Normalizes file path to forward slashes.
 */
function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

/**
 * Scans a file's content for color provenance and allowlist violations.
 * @param {string} content - Source code content
 * @param {string} filePath - Path relative to repository root
 * @returns {Array<{ file: string, line: number, matched: string, message: string }>}
 */
export function scanColorProvenanceContent(content, filePath = 'test.jsx') {
  const issues = [];
  const normPath = normalizePath(filePath);
  const lines = content.split('\n');

  // Skip documentation, build output, tests, node_modules
  if (
    normPath.includes('node_modules/') ||
    normPath.includes('dist/') ||
    normPath.includes('.taste-skill/') ||
    normPath.endsWith('.md')
  ) {
    return issues;
  }

  const isIndexCss = normPath.endsWith('src/index.css');

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1;
    const trimmed = line.trim();

    // Skip single-line comments in JS/CSS
    if (trimmed.startsWith('//') || (trimmed.startsWith('/*') && trimmed.endsWith('*/'))) {
      return;
    }

    // 1. Check retired Yueora colors & tokens
    for (const pat of RETIRED_YUEORA_PATTERNS) {
      if (pat.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: line.match(pat)?.[0] || 'retired-color',
          message: 'Forbidden retired Yueora color or token found. Deep bronze, custom CTA fills, and retired primitive scales are permanently banned.',
        });
      }
    }

    // 2. src/index.css Fail-Closed Custom Property Guard
    if (isIndexCss) {
      const customPropMatch = line.match(/^\s*(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/);
      if (customPropMatch) {
        const propName = customPropMatch[1];
        const propVal = customPropMatch[2].trim();

        // Check if property contains a raw physical color literal
        const hasHslTriplet = /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(propVal);
        const hasHex = /#(?:[0-9a-fA-F]{3,8})\b/.test(propVal);
        const hasRgbOrHslFunc = /(?:rgb|hsl)a?\([^)]+\)/.test(propVal) && !propVal.includes('var(');
        const hasColorMix = /color-mix\(/.test(propVal);

        if (hasHslTriplet || hasHex || hasRgbOrHslFunc || hasColorMix) {
          if (!NUMIS_ROOT_TOKENS.has(propName) && !ELEVATION_SHADOW_TOKENS.has(propName)) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: propName,
              message: `Unknown raw physical color custom property '${propName}' with value '${propVal}' found in src/index.css. All physical colors must trace to the 32 frozen Numis reference tokens or approved shadow elevation manifests.`,
            });
          }
        }
      }
    }

    // 3. Check arbitrary hex colors (#...)
    const hexMatches = line.match(/#(?:[0-9a-fA-F]{3,8})\b/g);
    if (hexMatches) {
      for (const hex of hexMatches) {
        const lowerHex = hex.toLowerCase();

        // Check external brand exception
        const extAllowed = EXTERNAL_BRAND_EXCEPTIONS[normPath];
        if (extAllowed && extAllowed.has(lowerHex)) {
          continue; // Valid external brand asset (e.g. GoogleIcon.jsx)
        }

        // Check framework selector exception
        const fwAllowed = FRAMEWORK_SELECTOR_EXCEPTIONS[normPath];
        if (fwAllowed && fwAllowed.has(lowerHex)) {
          continue; // Valid framework selector (e.g. chart.jsx [stroke='#ccc'])
        }

        issues.push({
          file: filePath,
          line: lineNum,
          matched: hex,
          message: `Unknown physical hex color '${hex}' found. Yueora does not invent physical colors; all visual colors must trace to frozen NumisCollection reference commit efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c or explicit external-brand exceptions.`,
        });
      }
    }

    // 4. Check arbitrary Tailwind bracket color utilities: bg-[#...], text-[#...], border-[#...], from-[#...], etc.
    const arbitraryTailwind = line.match(/(?:bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|caret|accent|shadow)-\[(#(?:[0-9a-fA-F]{3,8})|(?:rgb|hsl)a?\([^\]]+\))\]/g);
    if (arbitraryTailwind) {
      for (const m of arbitraryTailwind) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: m,
          message: `Arbitrary Tailwind color utility '${m}' found. Use canonical semantic tokens instead.`,
        });
      }
    }

    // 5. Check Tailwind named physical colors (covering gradients: from-, via-, to-, decoration-, outline-, etc.)
    const namedUtilsOnLine = [];
    for (const colorName of TAILWIND_NAMED_COLORS) {
      const namedColorRegex = new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|caret|accent|shadow)-${colorName}(?:-\\d+)?(?:\\/\\d+)?\\b`, 'g');
      let namedMatch;
      while ((namedMatch = namedColorRegex.exec(line)) !== null) {
        const util = namedMatch[0];
        namedUtilsOnLine.push({ util, colorName });
        // Allow if it matches an approved Numis actual status recipe
        if (!NUMIS_ACTUAL_STATUS_RECIPES.has(util)) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: util,
            message: `Tailwind named physical color '${util}' found without Numis provenance. Only verified Numis actual status recipes or canonical semantic tokens are allowed.`,
          });
        }
      }
    }

    // Role-Aware Status Recipe Grouping & Cross-Color Mixing Guard
    if (namedUtilsOnLine.length > 1) {
      const colorFamilies = new Set(namedUtilsOnLine.map((u) => u.colorName));
      // Cross-color mixing check (e.g. emerald with red, or blue with emerald)
      if (colorFamilies.size > 1) {
        // Exempt toast close button red variants
        const isToastClose = namedUtilsOnLine.every((u) => u.colorName === 'red');
        if (!isToastClose) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: namedUtilsOnLine.map((u) => u.util).join(' + '),
            message: `Mixed status recipe combines conflicting color families (${[...colorFamilies].join(', ')}). Status utilities cannot cross color roles.`,
          });
        }
      }

      // Check partial/mismatched recipe combinations: bg-amber-500/10 with text-amber-600
      const utilsSet = new Set(namedUtilsOnLine.map((u) => u.util));
      if (utilsSet.has('bg-amber-500/10') && utilsSet.has('text-amber-600')) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: 'bg-amber-500/10 + text-amber-600',
          message: `Mismatched status recipe: bg-amber-500/10 must be paired with text-amber-700 (ItemCard condition recipe), found text-amber-600.`,
        });
      }
    }

    // 6. Check physical black and white across ALL prefixes (bg, text, fill, stroke, from, via, to, border, ring)
    const blackWhiteRegex = /\b(?:bg|text|fill|stroke|from|via|to|border|ring)-(black|white)(?:\/(\d+))?\b/g;
    let bwMatch;
    while ((bwMatch = blackWhiteRegex.exec(line)) !== null) {
      const util = bwMatch[0];

      // Check overlay exception (only bg-black/80 in the 4 approved overlay files)
      const overlayAllowed = NUMIS_OVERLAY_RECIPES[normPath];
      if (overlayAllowed && overlayAllowed.has(util)) {
        continue;
      }

      // Check framework selector exception
      if (FRAMEWORK_SELECTOR_EXCEPTIONS[normPath]) {
        continue;
      }

      // Check external brand exception
      if (EXTERNAL_BRAND_EXCEPTIONS[normPath]) {
        continue;
      }

      issues.push({
        file: filePath,
        line: lineNum,
        matched: util,
        message: `Physical color '${util}' found. Application code must strictly consume semantic tokens (text-ink-*, bg-surface-*, etc.). Pure black/white is prohibited outside verified overlay primitives.`,
      });
    }

    // 7. Check inline JSX style containing raw physical colors
    const inlineStyleMatch = line.match(/style\s*=\s*\{\{[^}]*:\s*['"](#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([^'"]+\))['"][^}]*\}\}/);
    if (inlineStyleMatch) {
      const val = inlineStyleMatch[1];
      if (!val.includes('var(')) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: inlineStyleMatch[0],
          message: `Raw physical color in inline style '${val}' is prohibited. Use semantic Tailwind utilities or resolve canonical CSS custom properties.`,
        });
      }
    }

    // 8. Check raw JS color in constants, object literals, or array literals
    const jsColorMatch = line.match(/(?:(?:export\s+)?(?:const|let|var)\s+[A-Za-z0-9_]+\s*=\s*|(?:\b[a-zA-Z0-9_-]+\b|'[^']+'|"[^"]+")\s*:\s*|\[\s*)['"]((?:rgb|hsl)a?\([^'"]+\)|#[0-9a-fA-F]{3,8})['"]/);
    if (jsColorMatch) {
      const val = jsColorMatch[1];
      if (!val.includes('var(')) {
        const extAllowed = EXTERNAL_BRAND_EXCEPTIONS[normPath];
        const fwAllowed = FRAMEWORK_SELECTOR_EXCEPTIONS[normPath];
        if ((!extAllowed || !extAllowed.has(val.toLowerCase())) && (!fwAllowed || !fwAllowed.has(val.toLowerCase()))) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: val,
            message: `Raw rgb/hsl/hex color literal '${val}' found in JS code. Components must consume semantic CSS custom properties.`,
          });
        }
      }
    }

    // 9. Check Canvas 2D fillStyle / strokeStyle
    const canvasColorMatch = line.match(/(?:ctx\.)?(?:fillStyle|strokeStyle)\s*=\s*['"]([^'"]+)['"]/);
    if (canvasColorMatch) {
      const val = canvasColorMatch[1].trim();
      if (val.startsWith('#')) {
        const extAllowed = EXTERNAL_BRAND_EXCEPTIONS[normPath];
        if (!extAllowed || !extAllowed.has(val.toLowerCase())) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: canvasColorMatch[0],
            message: `Raw physical color '${val}' in Canvas 2D styling is prohibited. Resolve canonical semantic tokens via resolveSemanticColor() instead.`,
          });
        }
      } else if (val.startsWith('rgb') || val.startsWith('hsl')) {
        if (!val.includes('var(')) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: canvasColorMatch[0],
            message: `Raw physical color '${val}' in Canvas 2D styling is prohibited. Resolve canonical semantic tokens via resolveSemanticColor() instead.`,
          });
        }
      }
    }

    // 10. Check Canvas globalAlpha arbitrary blends on chromatic roles
    const canvasAlphaMatch = line.match(/(?:ctx\.)?globalAlpha\s*=\s*([0-9.]+)/);
    if (canvasAlphaMatch) {
      const alphaVal = parseFloat(canvasAlphaMatch[1]);
      if (alphaVal > 0 && alphaVal < 1) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: canvasAlphaMatch[0],
          message: `Arbitrary Canvas globalAlpha '${canvasAlphaMatch[1]}' found without Numis provenance. Use fully opaque semantic surfaces instead.`,
        });
      }
    }

    // 11. Check SVG fill / stroke attributes
    const svgColorMatches = line.matchAll(/\b(?:fill|stroke)=["']([^"']+)["']/g);
    for (const match of svgColorMatches) {
      const val = match[1].trim();
      if (val === 'none' || val === 'currentColor' || val.startsWith('url(')) continue;
      if (val.startsWith('#')) {
        const extAllowed = EXTERNAL_BRAND_EXCEPTIONS[normPath];
        if (extAllowed && extAllowed.has(val.toLowerCase())) continue;
        const fwAllowed = FRAMEWORK_SELECTOR_EXCEPTIONS[normPath];
        if (fwAllowed && fwAllowed.has(val.toLowerCase())) continue;
        issues.push({
          file: filePath,
          line: lineNum,
          matched: match[0],
          message: `Raw physical color '${val}' on SVG attribute is prohibited. Use semantic tokens (hsl(var(--...))) or currentColor instead.`,
        });
      }
    }

    // 12. Check SVG chromatic opacity: opacity="0.xx" on chromatic elements
    if (line.includes('fill="hsl(var(--brand') || line.includes('stroke="hsl(var(--brand') || line.includes('fill="hsl(var(--danger')) {
      const svgOpacityMatch = line.match(/\bopacity=["']([0-9.]+)["']/);
      if (svgOpacityMatch) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: svgOpacityMatch[0],
          message: `Arbitrary SVG chromatic opacity '${svgOpacityMatch[0]}' found. Use semantic tokens (e.g. hsl(var(--brand-soft))) without custom SVG opacity.`,
        });
      }
    }

    // 13. Check CSS rules outside index.css token definitions
    if (normPath.endsWith('.css') && !isIndexCss) {
      const cssColorMatch = line.match(/:\s*(#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([^)]+\))/);
      if (cssColorMatch && !cssColorMatch[1].includes('var(')) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: cssColorMatch[0],
          message: `Raw physical color in CSS rule '${cssColorMatch[1]}' is prohibited. Consume semantic CSS custom properties.`,
        });
      }
    }

    // 14. Check Exact Color + Opacity Recipes (Exact Token + Opacity pair validation)
    const chromaticOpacityMatches = line.matchAll(/\b(bg|text|border|ring|shadow|to|from)-(brand|danger|warning|success|practice-[a-z]+)\/(\d+)\b/g);
    for (const m of chromaticOpacityMatches) {
      const utilPrefix = m[1];
      const token = m[2];
      const opVal = m[3];
      const pair = `${token}/${opVal}`;

      // Check if pair is in exact Numis manifest
      if (!NUMIS_COLOR_OPACITY_PAIRS.has(pair)) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: m[0],
          message: `Unapproved chromatic color+opacity recipe '${m[0]}' found without Numis provenance. Pair '${pair}' is not in NUMIS_COLOR_OPACITY_PAIRS.`,
        });
      } else if (utilPrefix === 'border' && token === 'brand' && opVal === '60') {
        // Numis only has text-primary/60 (CollectionFormDialog.jsx, Dashboard.jsx), never border-primary/60
        issues.push({
          file: filePath,
          line: lineNum,
          matched: m[0],
          message: `Unapproved chromatic opacity recipe 'border-brand/60' found without Numis source provenance (only text-brand/60 is proven).`,
        });
      }
    }

    // 15. Check Element Opacity on Chromatic Branded Controls (e.g. hover:opacity-95)
    if (/\b(?:bg|text)-(?:brand|danger|primary)\b/.test(line)) {
      const elemOpacityMatch = line.match(/\b(?:hover:)?opacity-95\b/);
      if (elemOpacityMatch) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: elemOpacityMatch[0],
          message: `Element opacity '${elemOpacityMatch[0]}' found on chromatic branded control. Use proven color alpha recipes (e.g. hover:bg-brand/90) instead of element-level opacity.`,
        });
      }
    }
  });

  return issues;
}
