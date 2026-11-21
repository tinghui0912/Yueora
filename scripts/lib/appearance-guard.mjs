import parser from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

// Canonical protected primitives set
export const PROTECTED_PRIMITIVES = new Set([
  'Button',
  'IconButton',
  'DialogContent',
  'DropdownMenuContent',
  'PopoverContent',
  'Surface',
]);

// Allowed responsive modifiers for protected primitives
export const ALLOWED_RESPONSIVE_MODIFIERS = new Set(['sm', 'md', 'lg', 'xl', '2xl']);

// Allowed composition utilities on Button / IconButton
export const ALLOWED_BUTTON_COMPOSITION = /^(?:w-|min-w-|max-w-|flex-1$|flex-initial$|flex-auto$|flex-none$|shrink-0$|shrink$|grow-0$|grow$|self-(?:auto|start|end|center|stretch|baseline)$|-?m(?:t|b|l|r|x|y)?-)/;

// Allowed composition utilities on DialogContent, DropdownMenuContent, PopoverContent
export const ALLOWED_OVERLAY_COMPOSITION = /^(?:w-|min-w-|max-w-|h-|min-h-|max-h-|overflow-(?:hidden|auto|scroll|visible|x-auto|y-auto|x-hidden|y-hidden)$|-?m(?:t|b|l|r|x|y)?-)/;

// Banned appearance and motion properties on Surface
export const BANNED_SURFACE_APPEARANCE = /^(?:bg-|border(?:-|$)|rounded(?:-|$)|shadow(?:-|$)|ring(?:-|$)|backdrop-|opacity-|transition(?:-|$)|duration(?:-|$)|ease(?:-|$)|-?translate-(?:x|y)-|scale(?:-|$)|rotate(?:-|$)|animate(?:-|$))/;

// Allowed composition utilities on Surface
export const ALLOWED_SURFACE_COMPOSITION = /^(?:relative$|absolute$|fixed$|sticky$|inset-|top-|bottom-|left-|right-|z-|w-|min-w-|max-w-|h-|min-h-|max-h-|aspect-|-?m(?:t|b|l|r|x|y)?-|p(?:t|b|l|r|x|y)?-|space-(?:x|y)-|grid$|grid-cols-|col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|flex$|inline-flex$|inline-grid$|inline-block$|block$|inline$|flex-col$|flex-row$|flex-wrap$|flex-nowrap$|flex-1$|flex-initial$|flex-auto$|flex-none$|shrink-0$|shrink$|grow-0$|grow$|items-|justify-|content-|self-|gap-|select-none$|truncate$|text-(?:left|center|right|justify)$|overflow-)/;

// Generic Tailwind radius regex (allowed: rounded-control, rounded-container, rounded-overlay, rounded-full)
export const GENERIC_RADIUS_REGEX = /(?<![a-zA-Z0-9_-])(rounded|rounded-(?:none|sm|md|lg|xl|2xl|3xl)|rounded-(?:t|b|l|r|tl|tr|bl|br)(?:-(?:none|sm|md|lg|xl|2xl|3xl))?)(?![a-zA-Z0-9_-])/;

// Physical surface colors regex
export const PHYSICAL_COLOR_REGEX = /(?<![a-zA-Z0-9_-])(bg-white(?:\/\d+)?|bg-black(?:\/\d+)?)(?![a-zA-Z0-9_-])/;

// Retired Yueora physical colors and tokens regex
export const RETIRED_COLOR_REGEX = /(?:#98661B|#98661b|#895814|#895814|#D39029|#d39029|36\s+70%\s+35%|\bbrand-fill\b|\bbrand-fill-hover\b|\bbrand-fill-foreground\b|\bbrand-hover\b|\bprimitive-gold-[0-9]+\b|\bprimitive-neutral-[0-9]+\b|\bprimitive-ink-[0-9]+\b)/i;

/**
 * Parses a class token into modifiers and base utility.
 * Detects arbitrary selector variants like [&>svg]:
 */
export function parseTokenModifiers(token) {
  const hasArbitraryVariant = /\[[^\]]*[&>_:*][^\]]*\]:/.test(token);
  const parts = token.split(':');
  const base = parts.pop();
  const modifiers = parts;

  return {
    token,
    base,
    modifiers,
    hasArbitraryVariant,
  };
}

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
      const calleeName = n.callee.name;
      if (calleeName === 'cn' || calleeName === 'clsx') {
        for (const arg of n.arguments) {
          walk(arg);
        }
      } else {
        result.isDynamic = true;
        result.dynamicExpr = calleeName || 'CallExpression';
      }
    } else if (n.type === 'ArrayExpression') {
      for (const elem of n.elements) {
        walk(elem);
      }
    } else if (n.type === 'ObjectExpression') {
      for (const prop of n.properties) {
        if (prop.type === 'ObjectProperty' || prop.type === 'Property') {
          if (prop.computed) {
            if (prop.key.type === 'StringLiteral') {
              const parts = prop.key.value.trim().split(/\s+/).filter(Boolean);
              for (const p of parts) {
                result.tokens.push({ token: p, loc: prop.key.loc });
              }
            } else {
              result.isDynamic = true;
              result.dynamicExpr = 'computed object key';
            }
          } else {
            if (prop.key.type === 'Identifier') {
              result.tokens.push({ token: prop.key.name, loc: prop.key.loc });
            } else if (prop.key.type === 'StringLiteral') {
              const parts = prop.key.value.trim().split(/\s+/).filter(Boolean);
              for (const p of parts) {
                result.tokens.push({ token: p, loc: prop.key.loc });
              }
            } else {
              result.isDynamic = true;
              result.dynamicExpr = 'non-static object key';
            }
          }
        } else if (prop.type === 'SpreadElement') {
          result.isDynamic = true;
          result.dynamicExpr = 'object spread';
        }
      }
    } else if (n.type === 'ConditionalExpression') {
      walk(n.consequent);
      walk(n.alternate);
    } else if (n.type === 'LogicalExpression') {
      if (n.operator === '&&') {
        // Condition on left, classes on right
        walk(n.right);
      } else {
        walk(n.left);
        walk(n.right);
      }
    } else if (
      n.type === 'TSAsExpression' ||
      n.type === 'TSTypeAssertion' ||
      n.type === 'TSNonNullExpression' ||
      n.type === 'ParenthesizedExpression'
    ) {
      walk(n.expression);
    } else if (
      n.type === 'NullLiteral' ||
      n.type === 'BooleanLiteral' ||
      n.type === 'NumericLiteral'
    ) {
      // Safe non-string literal
    } else {
      result.isDynamic = true;
      result.dynamicExpr = n.name || n.type;
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

  // Canonical protected primitive module source mappings
  const CANONICAL_SOURCES = [
    {
      match: /components\/ui\/button/,
      name: 'Button',
      exports: new Set(['Button', 'buttonVariants']),
    },
    {
      match: /components\/ui\/icon-button/,
      name: 'IconButton',
      exports: new Set(['IconButton', 'iconButtonVariants']),
    },
    {
      match: /components\/ui\/dialog/,
      name: 'DialogContent',
      memberMatch: 'DialogContent',
      exports: new Set([
        'Dialog',
        'DialogPortal',
        'DialogOverlay',
        'DialogTrigger',
        'DialogClose',
        'DialogContent',
        'DialogHeader',
        'DialogFooter',
        'DialogTitle',
        'DialogDescription',
      ]),
    },
    {
      match: /components\/ui\/dropdown-menu/,
      name: 'DropdownMenuContent',
      memberMatch: 'DropdownMenuContent',
      exports: new Set([
        'DropdownMenu',
        'DropdownMenuTrigger',
        'DropdownMenuContent',
        'DropdownMenuItem',
        'DropdownMenuCheckboxItem',
        'DropdownMenuRadioItem',
        'DropdownMenuLabel',
        'DropdownMenuSeparator',
        'DropdownMenuShortcut',
        'DropdownMenuGroup',
        'DropdownMenuPortal',
        'DropdownMenuSub',
        'DropdownMenuSubContent',
        'DropdownMenuSubTrigger',
        'DropdownMenuRadioGroup',
      ]),
    },
    {
      match: /components\/ui\/popover/,
      name: 'PopoverContent',
      memberMatch: 'PopoverContent',
      exports: new Set(['Popover', 'PopoverTrigger', 'PopoverContent', 'PopoverAnchor']),
    },
    {
      match: /components\/patterns\/Surface/,
      name: 'Surface',
      exports: new Set(['Surface', 'default']),
    },
  ];

  // Map local names and namespace identifiers to canonical primitives
  const localToCanonical = new Map();
  const namespaceImports = new Map();

  function resolveNamespaceMember(cs, memberName) {
    if (!cs || !cs.exports.has(memberName)) return null;
    if (cs.name === 'Button' && memberName === 'Button') return 'Button';
    if (cs.name === 'IconButton' && memberName === 'IconButton') return 'IconButton';
    if (cs.memberMatch && memberName === cs.memberMatch) return cs.name;
    if (cs.name === 'Surface' && (memberName === 'Surface' || memberName === 'default')) return 'Surface';
    return null;
  }

  // Pass 1: Build import bindings (named, default, and namespace imports)
  // Guarantees all module import bindings are known regardless of statement order
  traverse(ast, {
    ImportDeclaration(importPath) {
      const source = importPath.node.source.value;
      for (const spec of importPath.node.specifiers) {
        const local = spec.local.name;
        if (spec.type === 'ImportSpecifier') {
          const imported = spec.imported.name;
          for (const cs of CANONICAL_SOURCES) {
            if (cs.match.test(source)) {
              if (imported === cs.name || imported === cs.memberMatch) {
                localToCanonical.set(local, cs.name);
              }
            }
          }
        } else if (spec.type === 'ImportDefaultSpecifier') {
          if (/components\/patterns\/Surface/.test(source)) {
            localToCanonical.set(local, 'Surface');
          }
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          for (const cs of CANONICAL_SOURCES) {
            if (cs.match.test(source)) {
              namespaceImports.set(local, cs);
            }
          }
        }
      }
    },
  });

  function unwrapExpression(node) {
    let current = node;
    while (
      current &&
      (current.type === 'TSAsExpression' ||
        current.type === 'TSTypeAssertion' ||
        current.type === 'TSNonNullExpression' ||
        current.type === 'ParenthesizedExpression')
    ) {
      current = current.expression;
    }
    return current;
  }

  function resolveRhs(rawInit) {
    const init = unwrapExpression(rawInit);
    if (!init) return null;

    if (init.type === 'Identifier') {
      if (localToCanonical.has(init.name)) {
        return localToCanonical.get(init.name);
      }
      if (PROTECTED_PRIMITIVES.has(init.name)) {
        return init.name;
      }
    } else if (init.type === 'MemberExpression' && !init.computed) {
      if (init.object?.type === 'Identifier' && init.property?.type === 'Identifier') {
        const objName = init.object.name;
        const propName = init.property.name;
        if (namespaceImports.has(objName)) {
          const cs = namespaceImports.get(objName);
          return resolveNamespaceMember(cs, propName);
        }
      }
    }
    return null;
  }

  // Pass 2: Resolve supported local aliases and reject mutable aliases of protected primitives
  // Uses fixed-point propagation to handle declaration order independence and multi-hop aliases
  const declaratorCandidates = [];
  traverse(ast, {
    VariableDeclaration(declPath) {
      const kind = declPath.node.kind; // 'const' | 'let' | 'var'
      for (const decl of declPath.node.declarations) {
        declaratorCandidates.push({ kind, decl });
      }
    },
  });

  const reportedMutableNodes = new Set();
  let changed = true;
  let iterations = 0;
  // Structural upper bound: monotonic alias propagation over finite candidates must converge within |candidates| + 1
  const maxIterations = declaratorCandidates.length + 1;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const { kind, decl } of declaratorCandidates) {
      const id = decl.id;
      const init = decl.init;
      if (!init || id.type !== 'Identifier') continue;

      const resolved = resolveRhs(init);
      if (!resolved) continue;

      if (kind === 'const') {
        if (!localToCanonical.has(id.name)) {
          localToCanonical.set(id.name, resolved);
          changed = true;
        }
      } else if (kind === 'let' || kind === 'var') {
        if (!reportedMutableNodes.has(decl)) {
          reportedMutableNodes.add(decl);
          issues.push({
            file: filePath,
            line: decl.loc?.start?.line || 1,
            matched: `${kind} ${id.name}`,
            message: `Mutable alias of protected primitive <${resolved}> via '${kind}' is prohibited. Use a const alias or canonical primitive import.`,
          });
        }
        if (!localToCanonical.has(id.name)) {
          localToCanonical.set(id.name, resolved);
          changed = true;
        }
      }
    }
  }

  // Fail closed: If alias propagation did not reach convergence within the structural bound,
  // we cannot safely guarantee primitive identity resolution.
  if (changed) {
    issues.push({
      file: filePath,
      line: 1,
      matched: 'Alias convergence failure',
      message: 'Protected primitive alias propagation did not converge; identity cannot be proven safe.',
    });
  }

  function resolveCanonical(elemNode) {
    if (!elemNode) return null;
    if (elemNode.type === 'JSXIdentifier') {
      const name = elemNode.name;
      if (localToCanonical.has(name)) {
        return localToCanonical.get(name);
      }
      if (PROTECTED_PRIMITIVES.has(name)) {
        return name;
      }
    } else if (elemNode.type === 'JSXMemberExpression') {
      if (elemNode.object.type === 'JSXIdentifier') {
        const objName = elemNode.object.name;
        const propName = elemNode.property?.name;
        if (namespaceImports.has(objName)) {
          const cs = namespaceImports.get(objName);
          const resolved = resolveNamespaceMember(cs, propName);
          if (resolved) return resolved;
        }
      }
    }
    return null;
  }

  // Pass 3: Inspect JSX elements
  traverse(ast, {
    JSXOpeningElement(path) {
      const canonicalPrimitive = resolveCanonical(path.node.name);
      const elemLine = path.node.loc?.start?.line || 1;

      // 1. Button specific API checks
      if (canonicalPrimitive === 'Button') {
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

      // 2. Reject spread attributes on protected primitives (Fail Closed)
      if (canonicalPrimitive && PROTECTED_PRIMITIVES.has(canonicalPrimitive)) {
        for (const attr of path.node.attributes) {
          if (attr.type === 'JSXSpreadAttribute') {
            issues.push({
              file: filePath,
              line: attr.loc?.start?.line || elemLine,
              matched: `{...${attr.argument?.name || 'props'}}`,
              message: `JSX spread attribute on protected primitive <${canonicalPrimitive}> is prohibited. Pages compose; <${canonicalPrimitive}> appearance must be statically verifiable without spread evasion.`,
            });
          }
        }
      }

      // 3. ClassName checks across elements
      for (const attr of path.node.attributes) {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'className') {
          const classData = extractClassTokens(attr.value);

          // Fail Closed: Dynamic unanalyzable className on ANY protected primitive is rejected
          if (classData.isDynamic && canonicalPrimitive && PROTECTED_PRIMITIVES.has(canonicalPrimitive)) {
            issues.push({
              file: filePath,
              line: attr.loc?.start?.line || elemLine,
              matched: classData.dynamicExpr || 'dynamic expression',
              message: `Dynamic unanalyzable className on protected primitive <${canonicalPrimitive}> (${classData.dynamicExpr || 'expression'}) is banned. Pages compose; <${canonicalPrimitive}> appearance must be statically verifiable composition utilities only.`,
            });
          }

          // Evaluate individual extracted tokens
          for (const item of classData.tokens) {
            const token = item.token;
            const line = item.loc?.start?.line || elemLine;
            const { base, modifiers, hasArbitraryVariant } = parseTokenModifiers(token);

            // A. Button & IconButton Composition Allowlist
            if (canonicalPrimitive === 'Button' || canonicalPrimitive === 'IconButton') {
              if (hasArbitraryVariant) {
                issues.push({
                  file: filePath,
                  line,
                  matched: token,
                  message: `Arbitrary selector variant on <${canonicalPrimitive}> className: [${token}] is prohibited. Descendant and arbitrary styling must not be applied to primitives from page consumers.`,
                });
              } else {
                const nonResponsive = modifiers.find((m) => !ALLOWED_RESPONSIVE_MODIFIERS.has(m));
                if (nonResponsive) {
                  issues.push({
                    file: filePath,
                    line,
                    matched: token,
                    message: `Non-responsive modifier '${nonResponsive}' on <${canonicalPrimitive}> className: [${token}]. Pages compose; <${canonicalPrimitive}> completely owns appearance, hover, active, and focus states.`,
                  });
                } else if (!ALLOWED_BUTTON_COMPOSITION.test(base)) {
                  issues.push({
                    file: filePath,
                    line,
                    matched: token,
                    message: `Non-composition utility on <${canonicalPrimitive}>: [${token}]. Pages compose; <${canonicalPrimitive}> completely owns its visual appearance. Only external composition utilities (w-*, min-w-*, max-w-*, flex-1, shrink-0, self-*, m-*) are allowed.`,
                  });
                }
              }
            }

            // B. Overlay Primitives (DialogContent, DropdownMenuContent, PopoverContent) Composition Allowlist
            if (
              canonicalPrimitive === 'DialogContent' ||
              canonicalPrimitive === 'DropdownMenuContent' ||
              canonicalPrimitive === 'PopoverContent'
            ) {
              if (hasArbitraryVariant) {
                issues.push({
                  file: filePath,
                  line,
                  matched: token,
                  message: `Arbitrary selector variant on <${canonicalPrimitive}> className: [${token}] is prohibited.`,
                });
              } else {
                const nonResponsive = modifiers.find((m) => !ALLOWED_RESPONSIVE_MODIFIERS.has(m));
                if (nonResponsive) {
                  issues.push({
                    file: filePath,
                    line,
                    matched: token,
                    message: `Non-responsive modifier '${nonResponsive}' on <${canonicalPrimitive}> className: [${token}]. Overlay primitives own interaction and focus appearance.`,
                  });
                } else if (!ALLOWED_OVERLAY_COMPOSITION.test(base)) {
                  issues.push({
                    file: filePath,
                    line,
                    matched: token,
                    message: `Non-composition utility on <${canonicalPrimitive}>: [${token}]. Primitive owns visual appearance (surface, border, shadow, radius); page only declares dimensions/composition (w-*, max-w-*, overflow-*).`,
                  });
                }
              }
            }

            // C. Surface Primitive Composition Allowlist & Appearance Protection
            if (canonicalPrimitive === 'Surface') {
              if (hasArbitraryVariant) {
                issues.push({
                  file: filePath,
                  line,
                  matched: token,
                  message: `Arbitrary selector variant on <Surface> className: [${token}] is prohibited.`,
                });
              } else {
                const nonResponsive = modifiers.find((m) => !ALLOWED_RESPONSIVE_MODIFIERS.has(m));
                if (nonResponsive) {
                  issues.push({
                    file: filePath,
                    line,
                    matched: token,
                    message: `Non-responsive modifier '${nonResponsive}' on <Surface> className: [${token}]. Pages compose; <Surface> completely owns interaction states, hover, active, focus, and motion.`,
                  });
                } else if (BANNED_SURFACE_APPEARANCE.test(base)) {
                  issues.push({
                    file: filePath,
                    line,
                    matched: token,
                    message: `Surface appearance override in page JSX: [${token}]. <Surface> owns tone, border, radius, elevation, and motion; do not override via className.`,
                  });
                } else if (!ALLOWED_SURFACE_COMPOSITION.test(base)) {
                  issues.push({
                    file: filePath,
                    line,
                    matched: token,
                    message: `Non-composition utility on <Surface>: [${token}]. Pages compose; <Surface> owns appearance.`,
                  });
                }
              }
            }

            // D. Direct page shadow tokens on non-primitive elements
            if (base === 'shadow-overlay' || base === 'shadow-raised') {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Direct shadow token '${token}' is banned in pages. Pages compose; elevated surfaces must be declared via <Surface elevation="..."> or canonical overlay primitives.`,
              });
            }

            // E. Arbitrary shadow
            if (/^shadow-\[[^\]]+\]$/.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Arbitrary shadow '${token}' is banned in pages. Shadows are reserved for elevated surfaces using canonical tokens: shadow-overlay or shadow-raised.`,
              });
            }

            // F. Generic Tailwind shadow
            if (/^shadow-(?:sm|md|lg|xl|2xl)$/.test(base) || base === 'shadow') {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Generic elevation '${token}' is banned in pages. Standard panels are flat by default. Overlays strictly use shadow-overlay or shadow-raised.`,
              });
            }

            // G. Arbitrary radius
            if (/^rounded-\[[^\]]+\]$/.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Arbitrary radius '${token}' is banned in pages. Pages compose; the Design System decides appearance via semantic radii (rounded-control, rounded-container, rounded-overlay, rounded-full).`,
              });
            }

            // H. Generic Tailwind radius
            if (GENERIC_RADIUS_REGEX.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Generic radius '${token}' is banned in pages. Pages compose; the Design System decides appearance via semantic radii (rounded-control, rounded-container, rounded-overlay, rounded-full).`,
              });
            }

            // I. Physical background colors
            if (PHYSICAL_COLOR_REGEX.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Physical color '${token}' is banned in pages. Surfaces must be mediated by semantic tokens (bg-surface-panel, bg-surface-canvas, text-white, text-ink-primary).`,
              });
            }

            // J. Retired Yueora colors and tokens
            if (RETIRED_COLOR_REGEX.test(token) || RETIRED_COLOR_REGEX.test(base)) {
              issues.push({
                file: filePath,
                line,
                matched: token,
                message: `Retired Yueora color/token '${token}' is banned. Only approved Numis reference colors and semantic tokens are permitted.`,
              });
            }
          }
        }
      }
    },
  });

  return issues;
}
