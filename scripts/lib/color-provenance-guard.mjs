import path from 'path';

/**
 * Color Provenance and Allowlist Guard
 *
 * Enforces that no unknown physical colors, hexes, rgbs, named Tailwind physical colors,
 * unapproved SVG opacities, unapproved Canvas alphas, unproven color-opacity utilities,
 * or unknown semantic color aliases enter the codebase.
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

// 3. 32 Frozen Numis Physical Root Color Tokens (Source of Truth in src/index.css)
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

// 4. Approved Yueora Semantic Color Custom Properties in src/index.css
export const YUEORA_SEMANTIC_COLOR_ALIASES = new Set([
  '--surface-canvas',
  '--surface-panel',
  '--surface-raised',
  '--surface-subrail',
  '--surface-subrail-border',
  '--ink-primary',
  '--ink-secondary',
  '--ink-tertiary',
  '--ink-subtle',
  '--line-subtle',
  '--line-strong',
  '--brand',
  '--brand-foreground',
  '--brand-soft',
  '--brand-soft-foreground',
  '--nav-active-bg',
  '--control-hover-accent',
  '--neutral-muted',
  '--neutral-muted-foreground',
  '--neutral-hover',
  '--neutral-hover-foreground',
  '--danger',
  '--danger-foreground',
  '--info',
  '--info-foreground',
  '--selection',
  '--practice-waiting',
  '--practice-waiting-foreground',
  '--practice-current',
  '--practice-current-foreground',
  '--practice-error',
  '--practice-error-foreground',
  '--gold',
]);

// 5. Approved Radix / shadcn Compatibility Color Custom Properties in src/index.css
export const YUEORA_COMPATIBILITY_COLOR_ALIASES = new Set([
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
]);

// 6. Approved Elevation Shadow Custom Properties in src/index.css
export const ELEVATION_SHADOW_TOKENS = new Set([
  '--shadow-control',
  '--shadow-raised',
  '--shadow-overlay',
]);

// 7. Numis Actual Status Recipes (Role-aware manifest traced to exact source files)
export const NUMIS_STATUS_RECIPES = [
  {
    id: 'condition-positive',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/collection/ItemCard.jsx:6',
    },
    sourceClasses: ['border-emerald-200', 'bg-emerald-500/10', 'text-emerald-700'],
    yueoraClasses: ['border-emerald-200', 'bg-emerald-500/10', 'text-emerald-700'],
    allowedOwners: [
      'src/components/ui/badge.jsx',
      'src/components/patterns/CountBadge.jsx',
      'src/components/patterns/StatusIndicator.jsx',
      'src/components/visuals/PracticeWorkspaceVisual.jsx',
    ],
  },
  {
    id: 'condition-warning',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/collection/ItemCard.jsx:10',
    },
    sourceClasses: ['border-amber-200', 'bg-amber-500/10', 'text-amber-700'],
    yueoraClasses: ['border-amber-200', 'bg-amber-500/10', 'text-amber-700'],
    allowedOwners: [
      'src/components/ui/badge.jsx',
      'src/components/patterns/CountBadge.jsx',
      'src/components/patterns/StatusIndicator.jsx',
      'src/pages/InviteAcceptance.jsx',
      'src/pages/RecognitionReview.jsx',
      'src/components/sharing/SharingDialog.jsx',
    ],
  },
  {
    id: 'condition-danger',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/collection/ItemCard.jsx:12',
    },
    sourceClasses: ['border-red-200', 'bg-red-500/10', 'text-red-700'],
    yueoraClasses: ['border-red-200', 'bg-red-500/10', 'text-red-700'],
    allowedOwners: [
      'src/components/ui/badge.jsx',
      'src/components/patterns/CountBadge.jsx',
      'src/components/patterns/StatusIndicator.jsx',
    ],
  },
  {
    id: 'condition-blue',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/collection/ItemCard.jsx:8',
    },
    sourceClasses: ['border-blue-200', 'bg-blue-500/10', 'text-blue-700'],
    yueoraClasses: ['border-blue-200', 'bg-blue-500/10', 'text-blue-700'],
    allowedOwners: [],
  },
  {
    id: 'condition-gray',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/collection/ItemCard.jsx:13',
    },
    sourceClasses: ['border-gray-200', 'bg-gray-500/10', 'text-gray-700'],
    yueoraClasses: ['border-gray-200', 'bg-gray-500/10', 'text-gray-700'],
    allowedOwners: [],
  },
  {
    id: 'positive-metric',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/pages/UserProfile.jsx:114',
    },
    sourceClasses: ['text-emerald-600'],
    yueoraClasses: ['text-emerald-600'],
    allowedOwners: ['src/pages/UserProfile.jsx'],
  },
  {
    id: 'negative-metric',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/pages/UserProfile.jsx:114',
    },
    sourceClasses: ['text-red-500'],
    yueoraClasses: ['text-red-500'],
    allowedOwners: ['src/pages/UserProfile.jsx'],
  },
  {
    id: 'warning-callout',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/collection/BulkEstimateButton.jsx:44',
    },
    sourceClasses: ['text-amber-600', 'bg-amber-50'],
    yueoraClasses: ['text-amber-600', 'bg-amber-50'],
    allowedOwners: ['src/components/collection/BulkEstimateButton.jsx'],
  },
  {
    id: 'toast-destructive-close',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/toast.jsx:62',
    },
    sourceClasses: ['text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600'],
    yueoraClasses: ['text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600'],
    allowedOwners: ['src/components/ui/toast.jsx'],
  },
];

// 8. Numis Dialog / Drawer Overlay Recipes (Verbatim Numis alert-dialog, dialog, drawer, sheet: ALL /80)
export const NUMIS_OVERLAY_RECIPES = {
  'src/components/ui/alert-dialog.jsx': new Set(['bg-black/80']),
  'src/components/ui/dialog.jsx': new Set(['bg-black/80']),
  'src/components/ui/drawer.jsx': new Set(['bg-black/80']),
  'src/components/ui/sheet.jsx': new Set(['bg-black/80']),
};

// 9. Exact Utility + Color + Opacity Manifest (Verified from NumisCollection efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c)
// Every entry contains the full utility prefix, token, and opacity.
export const NUMIS_EXACT_COLOR_UTILITIES = new Set([
  // Primary (Brand) opacities
  'bg-brand/5',
  'bg-brand/10',
  'bg-brand/20',
  'bg-brand/80',
  'bg-brand/90',
  'bg-primary/5',
  'bg-primary/10',
  'bg-primary/20',
  'bg-primary/80',
  'bg-primary/90',
  'border-brand/10',
  'border-brand/20',
  'border-brand/30',
  'border-brand/40',
  'border-brand/50',
  'border-primary/10',
  'border-primary/20',
  'border-primary/30',
  'border-primary/40',
  'border-primary/50',
  'text-brand/30',
  'text-brand/40',
  'text-brand/50',
  'text-brand/60',
  'text-primary/30',
  'text-primary/40',
  'text-primary/50',
  'text-primary/60',
  'shadow-brand/5',
  'shadow-primary/5',
  'from-brand/5',
  'from-brand/10',
  'from-primary/5',
  'from-primary/10',
  'to-brand/5',
  'to-brand/15',
  'to-primary/5',
  'to-primary/15',

  // Practice domain aliases of primary (brand)
  'bg-practice-current/10',
  'bg-practice-current/20',
  'border-practice-current/40',

  // Destructive (Danger) opacities
  'bg-danger/10',
  'bg-danger/80',
  'bg-danger/90',
  'border-danger/30',
  'border-danger/50',
  'bg-destructive/10',
  'bg-destructive/80',
  'bg-destructive/90',
  'border-destructive/30',
  'border-destructive/50',

  // Secondary opacities
  'bg-secondary/80',

  // Card / Surface-panel opacities
  'bg-surface-panel/90',
  'bg-surface-panel/95',
  'bg-card/90',
  'bg-card/95',

  // Muted / Neutral-muted opacities
  'bg-neutral-muted/30',
  'bg-neutral-muted/40',
  'bg-neutral-muted/50',
  'border-neutral-muted/40',
  'bg-muted/30',
  'bg-muted/40',
  'bg-muted/50',
  'border-muted/40',

  // Muted-foreground / Ink-tertiary opacities
  'text-ink-tertiary/30',
  'text-ink-tertiary/40',
  'text-ink-tertiary/60',
  'text-muted-foreground/30',
  'text-muted-foreground/40',
  'text-muted-foreground/60',

  // Foreground / Ink-primary opacities
  'text-ink-primary/50',
  'text-foreground/50',

  // Sidebar-foreground / Ink-secondary opacities (Numis sidebar.jsx:367)
  'text-ink-secondary/70',
  'text-sidebar-foreground/70',

  // Border / Line-subtle opacities
  'border-line-subtle/30',
  'border-line-subtle/50',
  'stroke-line-subtle/50',
  'border-border/30',
  'border-border/50',
  'stroke-border/50',

  // Accent opacities (Numis navigation-menu.jsx:36)
  'bg-accent/50',

  // Status named colors with exact opacity (ItemCard condition badges)
  'bg-emerald-500/10',
  'bg-amber-500/10',
  'bg-red-500/10',
  'bg-blue-500/10',
  'bg-gray-500/10',
  'bg-orange-500/10',

  // Overlays
  'bg-black/50',
  'bg-black/80',
]);

// 10. Retired Yueora Physical Colors & Tokens (Zero Tolerance Blacklist)
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

        // Check if property contains semantic/compatibility color references or color alpha composition
        const hasVarColorRef = /var\(--(?:numis-|background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar-|chart-)/.test(propVal);
        const hasColorComposition = /var\([^)]+\)\s*\/\s*[\d.]+/.test(propVal);

        if (hasVarColorRef || hasColorComposition) {
          if (
            !NUMIS_ROOT_TOKENS.has(propName) &&
            !YUEORA_SEMANTIC_COLOR_ALIASES.has(propName) &&
            !YUEORA_COMPATIBILITY_COLOR_ALIASES.has(propName) &&
            !ELEVATION_SHADOW_TOKENS.has(propName)
          ) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: propName,
              message: `Unknown semantic color alias '${propName}' with value '${propVal}' found in src/index.css. New semantic color aliases must trace to an approved manifest in color-provenance-guard.mjs.`,
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

    // 5. Check Tailwind named physical colors & Exact Recipe Matching
    const namedUtilsOnLine = [];
    for (const colorName of TAILWIND_NAMED_COLORS) {
      const namedColorRegex = new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|caret|accent|shadow|hover:text|focus:ring|focus:ring-offset)-${colorName}(?:-\\d+)?(?:\\/\\d+)?\\b`, 'g');
      let namedMatch;
      while ((namedMatch = namedColorRegex.exec(line)) !== null) {
        const util = namedMatch[0];
        namedUtilsOnLine.push(util);
      }
    }

    if (namedUtilsOnLine.length > 0) {
      // Find matching recipe in NUMIS_STATUS_RECIPES
      const matchedRecipe = NUMIS_STATUS_RECIPES.find((r) => {
        if (r.yueoraClasses.length !== namedUtilsOnLine.length) return false;
        return r.yueoraClasses.every((c) => namedUtilsOnLine.includes(c));
      });

      if (!matchedRecipe) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: namedUtilsOnLine.join(' + '),
          message: `Unapproved status recipe combination '${namedUtilsOnLine.join(' ')}' found. Named physical colors must match an exact Numis recipe with all required classes.`,
        });
      } else {
        // Recipe matched, now verify owner scope
        if (matchedRecipe.allowedOwners && matchedRecipe.allowedOwners.length > 0) {
          if (!matchedRecipe.allowedOwners.includes(normPath)) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: namedUtilsOnLine.join(' + '),
              message: `Status recipe '${matchedRecipe.id}' (${matchedRecipe.yueoraClasses.join(' ')}) is not approved for owner '${normPath}'.`,
            });
          }
        }
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

    // 14. Check Exact Utility + Color + Opacity Recipes across ALL semantic color families
    const chromaticOpacityMatches = line.matchAll(/\b((?:bg|text|border|ring|shadow|to|from|stroke|fill)-(?:brand|danger|warning|success|info|surface-[a-z]+|line-[a-z]+|neutral-[a-z]+|ink-[a-z]+|practice-[a-z]+|secondary|muted|accent|destructive|primary|card|popover|background|foreground|sidebar-[a-z]+)\/(\d+))\b/g);
    for (const m of chromaticOpacityMatches) {
      const fullUtil = m[1];

      // Check if full utility (prefix + token + opacity) is in exact Numis manifest
      if (!NUMIS_EXACT_COLOR_UTILITIES.has(fullUtil)) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: fullUtil,
          message: `Unapproved color+opacity utility '${fullUtil}' found without Numis source provenance. Every color utility with opacity must trace to NUMIS_EXACT_COLOR_UTILITIES.`,
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
