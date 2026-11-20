import parser from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

// Normalizes Tailwind modifier prefixes (e.g. "sm:hover:bg-danger" -> "bg-danger")
const MODIFIER_PREFIX_REGEX = /^(?:[a-zA-Z0-9_\-\[\]=]+:)+/;
export function stripTailwindModifiers(token) {
  return token.replace(MODIFIER_PREFIX_REGEX, '');
}

// Banned Button/IconButton appearance base utilities
export const BANNED_BUTTON_APPEARANCE = /^(rounded|bg|text|border|shadow|ring|outline|font|leading|tracking|h|min-h|max-h|p|px|py|pt|pb|pl|pr|gap|items|justify|opacity|transition|duration|ease|scale|translate|rotate)(?:-|$)|^uppercase$|^italic$/;

// Allowed composition utilities on Button/IconButton
export const ALLOWED_COMPOSITION = /^(w|max-w|min-w|flex-1|shrink-0|self-|m|mt|mb|ml|mr|mx|my)(?:-|$)|^inline-flex$|^flex$/;

// Banned DialogContent & DropdownMenuContent appearance base utilities
export const BANNED_OVERLAY_APPEARANCE = /^(border|bg|shadow|rounded|text|ring|font)-|^border$|^shadow$/;

// Generic Tailwind radius regex (allowed: rounded-control, rounded-container, rounded-overlay, rounded-full)
export const GENERIC_RADIUS_REGEX = /(?<![a-zA-Z0-9_-])(rounded|rounded-(?:none|sm|md|lg|xl|2xl|3xl)|rounded-(?:t|b|l|r|tl|tr|bl|br)(?:-(?:none|sm|md|lg|xl|2xl|3xl))?)(?![a-zA-Z0-9_-])/;

// Physical surface colors regex
export const PHYSICAL_COLOR_REGEX = /(?<![a-zA-Z0-9_-])(bg-white(?:\/\d+)?|bg-black(?:\/\d+)?)(?![a-zA-Z0-9_-])/;

/**
 * Extracts class tokens and detects dynamic unanalyzable expressions from an AST node.
 * Returns { tokens: Array<{ token: string, loc: SourceLocation }>, isDynamic: boolean, dynamicExpr: string }
 */
export function extractClassTokens(node) {
  const result = { tokens: [], isDynamic: false, dynamicExpr: null };
  if (!node) return result;

  function walk(n) {
    if (!n) return;
    if (n.type === 'StringLiteral') {
      const parts = n.value.trim().split(/\s+/).filter(Boolean);
      for (const p of parts) {
        result.tokens.push({ token: p, loc: n.loc });
      }
    } else if (n.type === 'JSXExpressionContainer') {
      walk(n.expression);
    } else if (n.type === 'TemplateLiteral') {
      for (const quasi of n.quasis) {
        if (quasi.value && quasi.value.raw) {
          const parts = quasi.value.raw.trim().split(/\s+/).filter(Boolean);
          for (const p of parts) {
            result.tokens.push({ token: p, loc: quasi.loc });
          }
        }
      }
      for (const expr of n.expressions) {
        walk(expr);
      }
    } else if (n.type === 'CallExpression') {
      // Recognized helper calls like cn(...) and clsx(...)
      const calleeName = n.callee.name;
      if (calleeName === 'cn' || calleeName === 'clsx') {
        for (const arg of n.arguments) {
          walk(arg);
        }
      } else {
        // Unknown function call in className
        result.isDynamic = true;
        result.dynamicExpr = calleeName || 'CallExpression';
      }
    } else if (n.type === 'ConditionalExpression') {
      walk(n.consequent);
      walk(n.alternate);
    } else if (n.type === 'LogicalExpression') {
      walk(n.left);
      walk(n.right);
    } else if (n.type === 'Identifier') {
      result.isDynamic = true;
      result.dynamicExpr = n.name;
    } else if (n.type === 'MemberExpression') {
      result.isDynamic = true;
      result.dynamicExpr = 'MemberExpression';
    }
  }

  walk(node);
  return result;
}

/**
 * Scans JSX/TSX content for Design System appearance ownership violations.
 * Evaluates without ds-allow bypass: appearance rules are strictly non-negotiable.
 *
 * @param {string} content
 * @param {string} filePath
 * @returns {Array<{ file: string, line: number, matched: string, message: string }>}
 */
export function scanPageAppearanceContent(content, filePath = 'anonymous.jsx') {
  const issues = [];

  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (err) {
    issues.push({
      file: filePath,
      line: 1,
      matched: 'AST Parse Error',
      message: `Failed to parse AST: ${err.message}`,
    });
    return issues;
  }

  // Ban stale hero documentation / preview references
  const staleHeroMatches = content.matchAll(/(?:hero:\s*52px|Size Hero)/gi);
  for (const m of staleHeroMatches) {
    const line = content.slice(0, m.index).split('\n').length;
    issues.push({
      file: filePath,
      line,
      matched: m[0],
      message: `Stale 'hero 52px' reference detected. Button sizes are strictly canonical: 'xs' (28px), 'sm' (32px), 'md' (36px), 'lg' (40px), 'xl' (44px).`,
    });
  }

  traverse(ast, {
    JSXOpeningElement(path) {
      const elementName = path.node.name.name;
      const elemLine = path.node.loc?.start?.line || 1;

      // 1. Button specific API checks
      if (elementName === 'Button') {
        for (const attr of path.node.attributes) {
          if (attr.type === 'JSXAttribute') {
            if (attr.name.name === 'variant') {
              const line = attr.loc?.start?.line || elemLine;
              issues.push({
                file: filePath,
                line,
                matched: 'variant=',
                message: `Legacy Button 'variant' prop is retired. Use semantic 'intent' prop (primary, secondary, quiet, danger, subtle, link, inverse, inverse-secondary).`,
              });
            } else if (attr.name.name === 'size') {
              const val = attr.value?.value;
              if (val === 'hero' || val === 'default') {
                const line = attr.loc?.start?.line || elemLine;
                issues.push({
                  file: filePath,
                  line,
                  matched: `size="${val}"`,
                  message: `Legacy Button size '${val}' is retired. Button sizes are strictly canonical: 'xs', 'sm', 'md', 'lg', 'xl'.`,
                });
              }
            }
          }
        }
      }

      // 2. ClassName checks across elements
      for (const attr of path.node.attributes) {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'className') {
          const classData = extractClassTokens(attr.value);

          // Handle dynamic unanalyzable className on Button or IconButton
          if (classData.isDynamic && (elementName === 'Button' || elementName === 'IconButton')) {
            issues.push({
              file: filePath,
              line: attr.loc?.start?.line || elemLine,
              matched: classData.dynamicExpr || 'dynamic expression',
              message: `Dynamic unanalyzable className on <${elementName}> is banned. Pages compose; <${elementName}> completely owns visual appearance, and className may only declare static composition classes.`,
            });
          }

          // Evaluate individual extracted tokens
          for (const item of classData.tokens) {
            const token = item.token;
            const line = item.loc?.start?.line || elemLine;
            const base = stripTailwindModifiers(token);

            // A. Button appearance overrides
            if (elementName === 'Button') {
              if (BANNED_BUTTON_APPEARANCE.test(base) && !ALLOWED_COMPOSITION.test(base)) {
                issues.push({
                  file: filePath,
                  line,
                  matched: token,
                  message: `Button appearance override in page JSX: [${token}]. Pages compose; Button completely owns its visual appearance via 'intent' and 'size'.`,
                });
              }
            }

            // B. IconButton appearance overrides
            if (elementName === 'IconButton') {
              if (BANNED_BUTTON_APPEARANCE.test(base) && !ALLOWED_COMPOSITION.test(base)) {
                issues.push({
                  file: filePath,
                  line,
                  matched: token,
                  message: `IconButton appearance override in page JSX: [${token}]. Pages compose; IconButton completely owns its visual appearance via 'tone' and 'size'.`,
                });
              }
            }

            // C. DialogContent appearance overrides
            if (elementName === 'DialogContent') {
              if (BANNED_OVERLAY_APPEARANCE.test(base)) {
                issues.push({
                  file: filePath,
                  line,
                  matched: token,
                  message: `DialogContent appearance override in page JSX: [${token}]. Primitive owns visual appearance (surface, border, shadow, radius); page only declares dimensions/composition.`,
                });
              }
            }

            // D. DropdownMenuContent appearance overrides
            if (elementName === 'DropdownMenuContent') {
              if (BANNED_OVERLAY_APPEARANCE.test(base)) {
                issues.push({
                  file: filePath,
                  line,
                  matched: token,
                  message: `DropdownMenuContent appearance override in page JSX: [${token}]. Primitive owns visual appearance; page only declares dimensions/composition.`,
                });
              }
            }

            // E. Direct page shadow tokens on non-primitive elements
            if (base === 'shadow-overlay' || base === 'shadow-raised') {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Direct shadow token '${token}' is banned in pages. Pages compose; elevated surfaces must be declared via <Surface elevation="..."> or canonical overlay primitives.`,
              });
            }

            // F. Arbitrary shadow
            if (/^shadow-\[[^\]]+\]$/.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Arbitrary shadow '${token}' is banned in pages. Shadows are reserved for elevated surfaces using canonical tokens: shadow-overlay or shadow-raised.`,
              });
            }

            // G. Generic Tailwind shadow
            if (/^shadow-(?:sm|md|lg|xl|2xl)$/.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Generic elevation '${token}' is banned in pages. Standard panels are flat by default. Overlays strictly use shadow-overlay or shadow-raised.`,
              });
            }

            // H. Arbitrary radius
            if (/^rounded-\[[^\]]+\]$/.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Arbitrary radius '${token}' is banned in pages. Pages compose; the Design System decides appearance via semantic radii (rounded-control, rounded-container, rounded-overlay, rounded-full).`,
              });
            }

            // I. Generic Tailwind radius
            if (GENERIC_RADIUS_REGEX.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Generic radius '${token}' is banned in pages. Pages compose; the Design System decides appearance via semantic radii (rounded-control, rounded-container, rounded-overlay, rounded-full).`,
              });
            }

            // J. Physical background colors
            if (PHYSICAL_COLOR_REGEX.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Physical color '${token}' is banned in pages. Surfaces must be mediated by semantic tokens (bg-surface-panel, bg-surface-canvas, text-white, text-ink-primary).`,
              });
            }
          }
        }
      }
    },
  });

  return issues;
}
