import fs from 'node:fs';
import path from 'node:path';
import parser from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

export const SEMANTIC_ROLES = [
  'type-hero-title',
  'type-marketing-title',
  'type-eyebrow',
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
  'type-sidebar-descriptor',
  'type-dashboard-title',
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

export const RAW_TEXT_REGEX = /\b(text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|\[\d+px\]))\b/g;
export const FONT_DISPLAY_REGEX = /\bfont-display\b/g;
export const RAW_UPPERCASE_REGEX = /\buppercase\b/g;
export const RAW_TRACKING_REGEX = /\btracking-(?:wide|wider|widest|\[[^\]]+\])\b/g;
export const REDUNDANT_CAPTION_REGEX = /\b(font-semibold|uppercase|tracking-(?:wide|wider|widest|\[0\.2em\]))\b/g;
export const LEADING_OVERRIDE_REGEX = /\b(leading-(?:none|tight|snug|normal|relaxed|loose|\[[^\]]+\]))\b/g;
export const SEMANTIC_TYPE_REGEX = /\b(type-(?:hero-title|marketing-title|eyebrow|editorial-quote|marketing-body|display|experience-title|page-title|section-title|subsection|body-small|body|label|caption|metadata|metric|sidebar-descriptor|dashboard-title|page-subtitle|stat-label|panel-title|card-title|card-metadata|card-value-label|card-value|mobile-nav|menu-label))\b/g;

export const TRIVIAL_REASONS = /^(?:marketing|custom|looks better|test|override)$/i;

/**
 * Recursively extracts class strings from AST nodes inside a className attribute.
 */
function extractClassStrings(node, result = []) {
  if (!node) return result;
  if (node.type === 'StringLiteral') {
    result.push({ text: node.value, loc: node.loc });
  } else if (node.type === 'JSXExpressionContainer') {
    extractClassStrings(node.expression, result);
  } else if (node.type === 'TemplateLiteral') {
    for (const quasi of node.quasis) {
      if (quasi.value && quasi.value.raw) {
        result.push({ text: quasi.value.raw, loc: quasi.loc });
      }
    }
    for (const expr of node.expressions) {
      extractClassStrings(expr, result);
    }
  } else if (node.type === 'CallExpression') {
    // e.g. cn(...), clsx(...)
    for (const arg of node.arguments) {
      extractClassStrings(arg, result);
    }
  } else if (node.type === 'ConditionalExpression') {
    extractClassStrings(node.consequent, result);
    extractClassStrings(node.alternate, result);
  } else if (node.type === 'LogicalExpression') {
    extractClassStrings(node.right, result);
  }
  return result;
}

/**
 * Checks whether an element or attribute is covered by a narrow ds-allow comment.
 * Scope: The comment must be immediately associated with this element or its opening tag,
 * or its immediate parent JSX element.
 */
function findElementDsAllow(openingElement, comments, parentOpeningElement = null) {
  const elemStartLine = openingElement.loc?.start?.line;
  if (!elemStartLine) return null;

  for (const c of comments) {
    const commentEndLine = c.loc?.end?.line;
    // Check immediate element
    if (commentEndLine === elemStartLine || commentEndLine === elemStartLine - 1) {
      const match = c.value.match(/(?:ds-allow|ds-ignore):\s*([^\n\r*\/]+)/);
      if (match) {
        return {
          reason: match[1].trim(),
          raw: match[0].trim(),
          line: c.loc.start.line,
        };
      }
    }
    // Check immediate parent container element
    if (parentOpeningElement && parentOpeningElement.loc?.start?.line) {
      const parentStartLine = parentOpeningElement.loc.start.line;
      if (commentEndLine === parentStartLine || commentEndLine === parentStartLine - 1) {
        const match = c.value.match(/(?:ds-allow|ds-ignore):\s*([^\n\r*\/]+)/);
        if (match) {
          return {
            reason: match[1].trim(),
            raw: match[0].trim(),
            line: c.loc.start.line,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Scans a single JSX/TSX file content for typography consumption and ownership.
 */
export function scanFile(filePath, content) {
  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (err) {
    return {
      error: `Failed to parse AST: ${err.message}`,
      filePath,
      rawFindings: [],
      semanticUsages: [],
      redundantUsages: [],
      leadingOverrides: [],
      explicitExceptions: [],
    };
  }

  const rawFindings = [];
  const semanticUsages = [];
  const redundantUsages = [];
  const leadingOverrides = [];
  const explicitExceptions = [];

  // Extract all unique ds-allow annotations in comments
  const seenComments = new Set();
  const dsAllowComments = [];
  for (const c of ast.comments || []) {
    const match = c.value.match(/(?:ds-allow|ds-ignore):\s*([^\n\r*\/]+)/);
    if (match) {
      const key = `${c.loc.start.line}:${match[0].trim()}`;
      if (!seenComments.has(key)) {
        seenComments.add(key);
        const reason = match[1].trim();
        const info = {
          file: filePath,
          line: c.loc.start.line,
          reason,
          raw: match[0].trim(),
          isTrivial: TRIVIAL_REASONS.test(reason),
        };
        explicitExceptions.push(info);
        dsAllowComments.push(c);
      }
    }
  }

  traverse(ast, {
    JSXOpeningElement(path) {
      const elem = path.node;
      const classAttr = elem.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name && a.name.name === 'className'
      );
      if (!classAttr) return;

      const parentElem = path.parentPath.findParent((p) => p.isJSXElement());
      const parentOpening = parentElem ? parentElem.node.openingElement : null;

      const allow = findElementDsAllow(elem, dsAllowComments, parentOpening);
      if (allow && !allow.isTrivial) {
        // Narrow exception matched for this immediate JSX element or its immediate container!
        return;
      }

      const extracted = extractClassStrings(classAttr.value);
      if (extracted.length === 0) return;

      // Combine all extracted text for this element to check compound rules
      const fullClassStr = extracted.map((e) => e.text).join(' ');
      const elementLine = elem.loc?.start?.line || 1;

      // 1. Semantic usages
      const semMatches = fullClassStr.match(SEMANTIC_TYPE_REGEX) || [];
      for (const sm of semMatches) {
        semanticUsages.push({ role: sm, line: elementLine, file: filePath });
      }

      // 2. Raw font sizes
      const rawTextMatches = fullClassStr.match(RAW_TEXT_REGEX) || [];
      for (const m of rawTextMatches) {
        rawFindings.push({
          type: 'raw-text-size',
          matched: m,
          line: elementLine,
          file: filePath,
          message: `Raw font-size utility '${m}' in page. Pages must consume semantic type-* roles or provide a narrow, reasoned ds-allow: <reason> exception.`,
        });
      }

      // 3. Raw font-display without semantic type
      if (FONT_DISPLAY_REGEX.test(fullClassStr) && !SEMANTIC_TYPE_REGEX.test(fullClassStr)) {
        const matches = fullClassStr.match(FONT_DISPLAY_REGEX) || [];
        for (const m of matches) {
          rawFindings.push({
            type: 'raw-font-display',
            matched: m,
            line: elementLine,
            file: filePath,
            message: `Raw '${m}' used without semantic type role. Serif/display typography must be owned by semantic type roles (e.g. type-page-title, type-section-title, type-subsection, type-editorial-quote, type-display).`,
          });
        }
      }

      // 4. Raw uppercase without type-caption or type-eyebrow
      if (RAW_UPPERCASE_REGEX.test(fullClassStr) && !/\btype-(?:caption|eyebrow)\b/.test(fullClassStr)) {
        rawFindings.push({
          type: 'raw-uppercase',
          matched: 'uppercase',
          line: elementLine,
          file: filePath,
          message: `Raw uppercase utility used without type-caption or type-eyebrow. Micro-labels and tags must consume type-caption or type-eyebrow.`,
        });
      }

      // 5. Raw tracking without type-caption or type-eyebrow
      if (RAW_TRACKING_REGEX.test(fullClassStr) && !/\btype-(?:caption|eyebrow)\b/.test(fullClassStr)) {
        const matches = fullClassStr.match(RAW_TRACKING_REGEX) || [];
        for (const m of matches) {
          rawFindings.push({
            type: 'raw-tracking',
            matched: m,
            line: elementLine,
            file: filePath,
            message: `Raw tracking utility '${m}' used without type-caption or type-eyebrow. Tracking belongs to the design system typography definitions.`,
          });
        }
      }

      // 6. Redundant type-caption declarations
      if (/\btype-caption\b/.test(fullClassStr)) {
        const redundant = fullClassStr.match(REDUNDANT_CAPTION_REGEX);
        if (redundant) {
          redundantUsages.push({
            type: 'redundant-caption-style',
            matched: redundant.join(', '),
            line: elementLine,
            file: filePath,
            message: `Redundant style '${redundant.join(', ')}' on type-caption. type-caption already defines uppercase, tracking-[0.2em], and font-weight: 600.`,
          });
        }
      }

      // 7. Redundant / conflicting line-height on semantic roles
      if (SEMANTIC_TYPE_REGEX.test(fullClassStr)) {
        const leadingMatches = fullClassStr.match(LEADING_OVERRIDE_REGEX);
        if (leadingMatches) {
          leadingOverrides.push({
            type: 'leading-override',
            matched: leadingMatches.join(', '),
            line: elementLine,
            file: filePath,
            message: `Redundant or conflicting line-height override '${leadingMatches.join(', ')}' on semantic role. Semantic typography roles own normal line-height.`,
          });
        }
      }
    },
  });

  return {
    filePath,
    rawFindings,
    semanticUsages,
    redundantUsages,
    leadingOverrides,
    explicitExceptions,
  };
}

/**
 * Scans all JSX/TSX files in a directory.
 */
export function scanDirectory(dir, filter = null) {
  const discovered = [];

  function walk(current) {
    if (!fs.existsSync(current)) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile() && (e.name.endsWith('.jsx') || e.name.endsWith('.tsx'))) {
        discovered.push(full);
      }
    }
  }

  walk(dir);

  const scanned = [];
  for (const f of discovered) {
    const rel = path.relative(process.cwd(), f).replace(/\\/g, '/');
    if (filter && !rel.includes(filter)) continue;
    const content = fs.readFileSync(f, 'utf8');
    const res = scanFile(rel, content);
    scanned.push(res);
  }

  return {
    discoveredCount: discovered.length,
    scannedCount: scanned.length,
    results: scanned,
  };
}
