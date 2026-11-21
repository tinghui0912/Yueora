import path from 'path';

/**
 * Color Provenance and Allowlist Guard
 *
 * Enforces that no unknown physical colors, hexes, rgbs, named Tailwind physical colors,
 * unapproved SVG opacities, or unapproved Canvas alphas enter the codebase.
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

// 3. Numis Actual Status Recipes (Proven from Numis ItemCard.jsx, UserProfile.jsx, BulkEstimateButton.jsx)
export const NUMIS_ACTUAL_STATUS_RECIPES = new Set([
  // Positive status (ItemCard.jsx:6, UserProfile.jsx:75)
  'bg-emerald-500/10',
  'border-emerald-200',
  'text-emerald-700',
  'text-emerald-600',
  'text-green-500',
  // Warning status (ItemCard.jsx:10, BulkEstimateButton.jsx:11)
  'bg-amber-500/10',
  'bg-amber-50',
  'border-amber-200',
  'text-amber-700',
  'text-amber-600',
  'bg-orange-500/10',
  'bg-orange-100',
  'bg-orange-400',
  'border-orange-200',
  'text-orange-700',
  'text-orange-600',
  // Destructive / Error status (ItemCard.jsx:12, button.jsx:15, badge.jsx:16)
  'bg-red-500/10',
  'border-red-200',
  'text-red-700',
  'text-red-500',
  'text-red-50',
  'text-red-300',
  'ring-red-400',
  // Category / Info status (ItemCard.jsx:8,13)
  'bg-blue-500/10',
  'border-blue-200',
  'text-blue-700',
  'bg-gray-500/10',
  'border-gray-200',
  'text-gray-700',
  'bg-slate-50',
  'bg-slate-100',
  'bg-slate-200',
  'border-slate-100',
  'border-slate-200',
  'border-slate-300',
  'text-slate-300',
  'text-slate-600',
  'text-slate-700',
  'text-slate-800',
  'text-slate-900',
  'ring-slate-500',
]);

// 4. Numis Dialog / Drawer Overlay Recipes (Verbatim Numis alert-dialog, dialog, drawer, sheet)
export const NUMIS_OVERLAY_RECIPES = {
  'src/components/ui/alert-dialog.jsx': new Set(['bg-black/50']),
  'src/components/ui/dialog.jsx': new Set(['bg-black/80']),
  'src/components/ui/drawer.jsx': new Set(['bg-black/80']),
  'src/components/ui/sheet.jsx': new Set(['bg-black/50']),
};

// 5. Allowed Chromatic Opacities on Brand/Status Roles (Numis actual usage in efd2af4c)
// Proven Numis opacities: 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 95
// Note: 12 and 18 are permanently removed as they had no Numis source provenance.
export const ALLOWED_CHROMATIC_OPACITIES = new Set([
  '5', '10', '15', '20', '30', '40', '50', '60', '70', '80', '90', '95'
]);

// 6. Retired Yueora Physical Colors & Tokens (Zero Tolerance Blacklist)
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

    // 2. Check arbitrary hex colors (#...)
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

    // 3. Check arbitrary Tailwind bracket color utilities: bg-[#...], text-[#...], border-[#...], etc.
    const arbitraryTailwind = line.match(/(?:bg|text|border|ring|fill|stroke)-\[(#(?:[0-9a-fA-F]{3,8})|(?:rgb|hsl)a?\([^\]]+\))\]/g);
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

    // 4. Check Tailwind named physical colors: text-fuchsia-500, bg-cyan-700, border-lime-300, etc.
    for (const colorName of TAILWIND_NAMED_COLORS) {
      const namedColorRegex = new RegExp(`\\b(?:bg|text|border|ring|fill|stroke)-${colorName}(?:-\\d+)?(?:\\/\\d+)?\\b`, 'g');
      let namedMatch;
      while ((namedMatch = namedColorRegex.exec(line)) !== null) {
        const util = namedMatch[0];
        // Allow if it matches an approved Numis actual status recipe
        if (NUMIS_ACTUAL_STATUS_RECIPES.has(util)) {
          continue;
        }
        issues.push({
          file: filePath,
          line: lineNum,
          matched: util,
          message: `Tailwind named physical color '${util}' found without Numis provenance. Only verified Numis actual status recipes or canonical semantic tokens are allowed.`,
        });
      }
    }

    // 5. Check physical black and white utilities (bg-black, text-white, bg-white, text-black)
    const blackWhiteMatches = line.match(/\b(?:bg|text|border|ring)-(?:black|white)(?:\/\d+)?\b/g);
    if (blackWhiteMatches) {
      for (const bw of blackWhiteMatches) {
        // Check if it's an approved overlay recipe
        const overlayAllowed = NUMIS_OVERLAY_RECIPES[normPath];
        if (overlayAllowed && overlayAllowed.has(bw)) {
          continue;
        }
        issues.push({
          file: filePath,
          line: lineNum,
          matched: bw,
          message: `Physical color utility '${bw}' found outside approved overlay provenance. Use canonical semantic tokens (e.g. text-brand-foreground, text-danger-foreground, bg-ink-primary) instead.`,
        });
      }
    }

    // 6. Check inline JSX styles: style={{ color: 'rgb(...)', backgroundColor: 'hsl(...)', borderColor: '#...' }}
    const inlineStyleMatch = line.match(/style\s*=\s*\{\s*\{([^}]+)\}\s*\}/);
    if (inlineStyleMatch) {
      const styleBody = inlineStyleMatch[1];
      // Check for raw rgb / hsl / hex in inline styles
      const rawColorInStyle = styleBody.match(/(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*['"]([^'"]+)['"]/);
      if (rawColorInStyle) {
        const val = rawColorInStyle[1].trim();
        if (val.startsWith('#') || ((val.startsWith('rgb') || val.startsWith('hsl')) && !val.includes('var('))) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: rawColorInStyle[0],
            message: `Raw physical color in inline style '${rawColorInStyle[0]}' is prohibited. Consume semantic CSS custom properties or classes instead.`,
          });
        }
      }
    }

    // 7. Check JS / TS color constants: const COLOR = 'rgb(...)' or const COLOR = 'hsl(...)'
    const jsColorConstMatch = line.match(/(?:const|let|var)\s+[A-Za-z0-9_]+\s*=\s*['"]((?:rgb|hsl)a?\([^'"]+\))['"]/);
    if (jsColorConstMatch) {
      const val = jsColorConstMatch[1];
      if (!val.includes('var(')) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: jsColorConstMatch[0],
          message: `Raw rgb/hsl color constant '${val}' found. Components must consume semantic CSS custom properties.`,
        });
      }
    }

    // 8. Check Canvas 2D fillStyle / strokeStyle
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

    // 9. Check Canvas globalAlpha arbitrary blends on chromatic roles
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

    // 10. Check SVG fill / stroke attributes
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

    // 11. Check SVG chromatic opacity: opacity="0.xx" on chromatic elements
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

    // 12. Check CSS rules outside index.css token definitions
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

    // 13. Check chromatic opacity combinations on brand/status roles
    const chromaticOpacityMatches = line.matchAll(/\b(?:bg|text|border|ring)-(?:brand|danger|warning|success|practice-[a-z]+)\/(\d+)\b/g);
    for (const m of chromaticOpacityMatches) {
      const opVal = m[1];
      if (!ALLOWED_CHROMATIC_OPACITIES.has(opVal)) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: m[0],
          message: `Unapproved chromatic opacity recipe '/${opVal}' found on '${m[0]}'. Allowed chromatic opacities: ${[...ALLOWED_CHROMATIC_OPACITIES].sort((a,b)=>Number(a)-Number(b)).map(o=>`/${o}`).join(', ')}.`,
        });
      }
    }
  });

  return issues;
}
