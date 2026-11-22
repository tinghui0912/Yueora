import path from 'path';
import {
  NUMIS_REFERENCE_META,
  NUMIS_ROOT_TOKENS,
  YUEORA_SEMANTIC_COLOR_ALIASES,
  YUEORA_COMPATIBILITY_COLOR_ALIASES,
  ELEVATION_SHADOW_TOKENS,
  COLOR_UTILITY_PREFIXES,
  NUMIS_REFERENCE_STATUS_RECIPES,
  YUEORA_AUTHORIZED_STATUS_RECIPES,
  YUEORA_VISUAL_RECIPE_MANIFEST,
  NUMIS_STATUS_RECIPES,
  NUMIS_OVERLAY_RECIPES,
  NUMIS_EXACT_COLOR_UTILITIES,
  EXTERNAL_BRAND_EXCEPTIONS,
  FRAMEWORK_SELECTOR_EXCEPTIONS,
  RETIRED_YUEORA_PATTERNS,
} from './numis-visual-provenance-manifest.mjs';

export {
  NUMIS_REFERENCE_META,
  NUMIS_ROOT_TOKENS,
  YUEORA_SEMANTIC_COLOR_ALIASES,
  YUEORA_COMPATIBILITY_COLOR_ALIASES,
  ELEVATION_SHADOW_TOKENS,
  COLOR_UTILITY_PREFIXES,
  NUMIS_REFERENCE_STATUS_RECIPES,
  YUEORA_AUTHORIZED_STATUS_RECIPES,
  YUEORA_VISUAL_RECIPE_MANIFEST,
  NUMIS_STATUS_RECIPES,
  NUMIS_OVERLAY_RECIPES,
  NUMIS_EXACT_COLOR_UTILITIES,
  EXTERNAL_BRAND_EXCEPTIONS,
  FRAMEWORK_SELECTOR_EXCEPTIONS,
  RETIRED_YUEORA_PATTERNS,
};

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

        const isApprovedNumis = Object.prototype.hasOwnProperty.call(NUMIS_ROOT_TOKENS, propName);
        const isApprovedSemantic = Object.prototype.hasOwnProperty.call(YUEORA_SEMANTIC_COLOR_ALIASES, propName);
        const isApprovedCompat = Object.prototype.hasOwnProperty.call(YUEORA_COMPATIBILITY_COLOR_ALIASES, propName);
        const isApprovedElevation = Object.prototype.hasOwnProperty.call(ELEVATION_SHADOW_TOKENS, propName);

        if (isApprovedNumis) {
          if (propVal !== NUMIS_ROOT_TOKENS[propName]) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: propName,
              message: `Frozen Numis reference token '${propName}' has value '${propVal}', expected '${NUMIS_ROOT_TOKENS[propName]}'.`,
            });
          }
        } else if (isApprovedSemantic) {
          if (propVal !== YUEORA_SEMANTIC_COLOR_ALIASES[propName]) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: propName,
              message: `Yueora semantic color alias '${propName}' has value '${propVal}', expected '${YUEORA_SEMANTIC_COLOR_ALIASES[propName]}'.`,
            });
          }
        } else if (isApprovedCompat) {
          if (propVal !== YUEORA_COMPATIBILITY_COLOR_ALIASES[propName]) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: propName,
              message: `Compatibility color alias '${propName}' has value '${propVal}', expected '${YUEORA_COMPATIBILITY_COLOR_ALIASES[propName]}'.`,
            });
          }
        } else if (isApprovedElevation) {
          if (propVal !== ELEVATION_SHADOW_TOKENS[propName]) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: propName,
              message: `Elevation shadow token '${propName}' has value '${propVal}', expected '${ELEVATION_SHADOW_TOKENS[propName]}'.`,
            });
          }
        } else {
          // Property is not in any approved color/elevation manifest.
          // Check if it attempts to define a color literal or reference.
          const hasHslTriplet = /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(propVal);
          const hasHex = /#(?:[0-9a-fA-F]{3,8})\b/.test(propVal);
          const hasRgbOrHslFunc = /(?:rgb|hsl)a?\([^)]+\)/.test(propVal) && !propVal.includes('var(');
          const hasColorMix = /color-mix\(/.test(propVal);
          const hasVarColorRef = /var\(--(?:numis-|brand|surface|ink|line|danger|neutral|info|selection|practice|gold|background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar-|chart-)/.test(propVal);
          const hasColorComposition = /var\([^)]+\)\s*\/\s*[\d.]+/.test(propVal);

          if (hasHslTriplet || hasHex || hasRgbOrHslFunc || hasColorMix || hasVarColorRef || hasColorComposition) {
            issues.push({
              file: filePath,
              line: lineNum,
              matched: propName,
              message: `Unknown or unapproved color custom property '${propName}' with value '${propVal}' found in src/index.css. All color properties must be members of the authoritative manifests in numis-visual-provenance-manifest.mjs.`,
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
        // Recipe matched, now verify owner scope (must be non-empty and include file)
        if (!Array.isArray(matchedRecipe.allowedOwners) || matchedRecipe.allowedOwners.length === 0 || !matchedRecipe.allowedOwners.includes(normPath)) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: namedUtilsOnLine.join(' + '),
            message: `Status recipe '${matchedRecipe.id}' (${matchedRecipe.yueoraClasses.join(' ')}) is not approved for owner '${normPath}'.`,
          });
        }
      }
    }

    // 5b. Semantic Recipe Guard (Prevent Recombining Semantic Tokens into Unproven Visual Recipes)
    // Frozen Numis source verification proves that generic status recipes were invented by recombining tokens.
    // Every complete semantic status/badge recipe must match an authorized Numis recipe in YUEORA_VISUAL_RECIPE_MANIFEST.
    const unapprovedSemanticCombinations = [
      {
        tokens: ['border-brand/20', 'bg-brand-soft', 'text-brand-soft-foreground'],
        name: 'border-brand/20 + bg-brand-soft + text-brand-soft-foreground',
      },
      {
        tokens: ['border-danger/30', 'bg-danger/10', 'text-danger'],
        name: 'border-danger/30 + bg-danger/10 + text-danger',
      },
      {
        tokens: ['border-line-subtle', 'bg-neutral-muted', 'text-ink-secondary'],
        name: 'border-line-subtle + bg-neutral-muted + text-ink-secondary',
      },
      {
        tokens: ['border-line-subtle', 'bg-surface-panel', 'text-ink-secondary'],
        name: 'border-line-subtle + bg-surface-panel + text-ink-secondary',
      },
      {
        tokens: ['border-transparent', 'bg-brand-soft', 'text-brand-soft-foreground'],
        name: 'border-transparent + bg-brand-soft + text-brand-soft-foreground',
      },
      {
        tokens: ['border-transparent', 'bg-neutral-muted', 'text-ink-secondary'],
        name: 'border-transparent + bg-neutral-muted + text-ink-secondary',
      },
    ];

    for (const combo of unapprovedSemanticCombinations) {
      const allPresent = combo.tokens.every((t) => {
        const regex = new RegExp(`(?<![\\w-])${t.replace(/[/]/g, '\\/')}(?![/\\w-])`);
        return regex.test(line);
      });
      if (allPresent) {
        issues.push({
          file: filePath,
          line: lineNum,
          matched: combo.name,
          message: `Unapproved semantic visual recipe combination '${combo.name}' found. Using individual Numis tokens to construct an unproven combination is visual invention. Status/badge components must consume exact Numis canonical recipes.`,
        });
      }
    }

    // Check canonical badge recipes owner authorization
    const canonicalBadgeRecipes = [
      {
        id: 'badge-default',
        tokens: ['border-transparent', 'bg-brand', 'text-brand-foreground', 'shadow', 'hover:bg-brand/80'],
      },
      {
        id: 'badge-secondary',
        tokens: ['border-transparent', 'bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80'],
      },
      {
        id: 'badge-destructive',
        tokens: ['border-transparent', 'bg-danger', 'text-danger-foreground', 'shadow', 'hover:bg-danger/80'],
      },
    ];

    for (const badgeRecipe of canonicalBadgeRecipes) {
      const allPresent = badgeRecipe.tokens.every((t) => {
        const regex = new RegExp(`(?<![\\w-])${t.replace(/[/]/g, '\\/')}(?![/\\w-])`);
        return regex.test(line);
      });
      if (allPresent) {
        const manifestRecipe = YUEORA_VISUAL_RECIPE_MANIFEST.find((r) => r.id === badgeRecipe.id);
        if (manifestRecipe && (!manifestRecipe.allowedOwners.includes(normPath))) {
          issues.push({
            file: filePath,
            line: lineNum,
            matched: badgeRecipe.tokens.join(' + '),
            message: `Canonical Numis badge recipe '${badgeRecipe.id}' (${badgeRecipe.tokens.join(' ')}) is not approved for owner '${normPath}'.`,
          });
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
    // COLOR_UTILITY_PREFIXES includes via as well as bg, text, border, ring, shadow, from, to, stroke, fill.
    const prefixGroup = COLOR_UTILITY_PREFIXES.join('|');
    const allSemanticTokens = [
      ...Object.keys(YUEORA_SEMANTIC_COLOR_ALIASES).map((t) => t.replace(/^--/, '')),
      ...Object.keys(YUEORA_COMPATIBILITY_COLOR_ALIASES).map((t) => t.replace(/^--/, '')),
      ...Object.keys(NUMIS_ROOT_TOKENS).map((t) => t.replace(/^--numis-/, '')),
      'warning',
      'warning-foreground',
      'success',
      'success-foreground',
    ];
    // Sort descending by length so longer compound tokens match before sub-tokens (e.g. brand-soft before brand)
    allSemanticTokens.sort((a, b) => b.length - a.length);
    const tokenRegexPart = allSemanticTokens.join('|');
    const chromaticOpacityRegex = new RegExp(`(?:\\b|:)((?:${prefixGroup})-(?:${tokenRegexPart})\\/(\\d+))\\b`, 'g');
    const chromaticOpacityMatches = line.matchAll(chromaticOpacityRegex);
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

/**
 * Scans a file on disk for color provenance.
 */
export function scanColorProvenanceFile(filePath) {
  const fs = path.resolve();
  // Using dynamic import or fs directly
  const fsModule = import('fs');
  return fsModule.then((f) => {
    const content = f.readFileSync(filePath, 'utf-8');
    return scanColorProvenanceContent(content, filePath);
  });
}
