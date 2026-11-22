import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import {
  NUMIS_REFERENCE_META,
  YUEORA_AUTHORIZED_RECIPES,
  ELEVATION_SHADOW_TOKENS,
} from './numis-visual-provenance-manifest.mjs';

const traverse = traverseModule.default || traverseModule;

const VALID_MAPPING_TYPES = new Set(['exact', 'semantic-alias', 'structural-adaptation']);

const FROZEN_FIXTURES_DIR = path.resolve('scripts/fixtures/numis-frozen');
const FROZEN_METADATA_PATH = path.join(FROZEN_FIXTURES_DIR, 'metadata.json');

export function isTypographyStructuralText(cls) {
  if (/^text-(xs|sm|base|lg|[2-9]?xl)$/.test(cls)) return true;
  if (/^text-(left|center|right|justify|start|end)$/.test(cls)) return true;
  if (/^text-(wrap|nowrap|balance|pretty|ellipsis|clip)$/.test(cls)) return true;
  return false;
}

export function isControlInfrastructure(token) {
  if (token.includes('cursor-') || token.includes('pointer-events-')) return true;
  if (token.includes('outline-none')) return true;
  if (token.includes('ring-offset-')) return true;
  if (token === 'disabled:opacity-50' || token === 'disabled:opacity-40' || token === 'data-[disabled]:opacity-50') return true;
  if (
    token === 'animate-in' ||
    token.startsWith('animate-in') ||
    token.startsWith('fade-in-') ||
    token.startsWith('fade-out-') ||
    token.startsWith('zoom-in-') ||
    token.startsWith('zoom-out-') ||
    /data-\[(state|side)=[^\]]+\]:(animate-|fade-|zoom-|slide-)/.test(token)
  ) {
    return true;
  }
  return false;
}

export function isProtectedToken(token) {
  if (!token || typeof token !== 'string') return false;
  if (isControlInfrastructure(token)) return false;

  if (token.startsWith('active:')) {
    return true;
  }

  if (token.startsWith('hover:') || token.startsWith('group-hover:') || token.includes(':hover:')) {
    return true;
  }

  if (token.startsWith('focus:') || token.startsWith('focus-visible:') || token.includes(':focus:')) {
    return true;
  }

  if (/data-\[state=[^\]]+\]:/.test(token)) {
    return true;
  }
  if (/data-\[placeholder\]:/.test(token) || token.startsWith('placeholder:')) {
    return true;
  }
  if (/group-\[[^\]]+\]:/.test(token)) {
    return true;
  }

  if (
    token.startsWith('bg-') ||
    token.startsWith('from-') ||
    token.startsWith('via-') ||
    token.startsWith('to-') ||
    token.startsWith('ring-') ||
    token.startsWith('fill-') ||
    token.startsWith('stroke-')
  ) {
    return true;
  }

  if (token === 'border' || token === 'border-2' || token.startsWith('border-')) {
    return true;
  }

  if (token.startsWith('text-')) {
    return !isTypographyStructuralText(token);
  }

  if (token === 'shadow' || token.startsWith('shadow-') || token.startsWith('opacity-')) {
    return true;
  }

  if (
    token.startsWith('scale-') ||
    token.startsWith('translate-') ||
    token.startsWith('rotate-') ||
    token.startsWith('duration-') ||
    token.startsWith('ease-')
  ) {
    return true;
  }

  if (token === 'destructive' || token === 'underline' || token.startsWith('underline-')) {
    return true;
  }

  return false;
}

function extractStringsFromNode(node) {
  const res = [];
  if (!node) return res;
  if (node.type === 'StringLiteral') {
    res.push(node.value);
  } else if (node.type === 'TemplateLiteral') {
    for (const q of node.quasis) {
      if (q.value?.raw) res.push(q.value.raw);
    }
  } else if (node.type === 'JSXExpressionContainer') {
    res.push(...extractStringsFromNode(node.expression));
  } else if (node.type === 'ConditionalExpression') {
    res.push(...extractStringsFromNode(node.consequent));
    res.push(...extractStringsFromNode(node.alternate));
  } else if (node.type === 'LogicalExpression') {
    res.push(...extractStringsFromNode(node.right));
  } else if (node.type === 'CallExpression') {
    for (const arg of node.arguments) {
      res.push(...extractStringsFromNode(arg));
    }
  } else if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
    res.push(...extractStringsFromNode(node.body));
  } else if (node.type === 'BlockStatement') {
    for (const stmt of node.body) {
      if (stmt.type === 'ReturnStatement') {
        res.push(...extractStringsFromNode(stmt.argument));
      }
    }
  }
  return res;
}

function findObjectProp(objNode, keyName) {
  if (!objNode || objNode.type !== 'ObjectExpression') return null;
  for (const prop of objNode.properties) {
    if (prop.type === 'ObjectProperty') {
      const k = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
      if (k === keyName || String(k) === String(keyName)) {
        return prop.value;
      }
    }
  }
  return null;
}

/**
 * Extracts exact recipe unit tokens from an owner file using AST parsing.
 * Restricts extraction strictly to the declared ownerUnit node.
 * Zero whole-file fallback: fails closed if the unit cannot be resolved.
 *
 * @param {string} filePath
 * @param {string} fileContent
 * @param {Object} recipe
 * @returns {Set<string>}
 */
export function extractRecipeUnitTokens(filePath, fileContent, recipe) {
  const normPath = filePath.replace(/\\/g, '/');
  const unitDef = recipe.ownerUnits ? recipe.ownerUnits[normPath] : recipe.ownerUnit;
  if (!unitDef) {
    throw new Error(`Visual recipe '${recipe.id}' does not declare an ownerUnit for owner '${normPath}'. Fail closed.`);
  }

  const ast = parser.parse(fileContent, { sourceType: 'module', plugins: ['jsx'] });
  const rawTokens = new Set();

  function addString(str) {
    if (!str) return;
    str.trim().split(/\s+/).forEach((t) => {
      if (!t) return;
      if (unitDef.prefixFilter) {
        if (t.startsWith(unitDef.prefixFilter)) {
          if (unitDef.stripPrefix) {
            rawTokens.add(t.slice(unitDef.prefixFilter.length));
          } else {
            rawTokens.add(t);
          }
        }
      } else {
        rawTokens.add(t);
      }
    });
  }

  function addNode(node) {
    extractStringsFromNode(node).forEach(addString);
  }

  if (unitDef.type === 'cva-variant') {
    let matched = 0;
    traverse(ast, {
      VariableDeclarator(p) {
        if (p.node.id?.name === unitDef.variable) {
          const init = p.node.init;
          if (init?.type === 'CallExpression' && init.callee?.name === 'cva') {
            const config = init.arguments[1];
            if (config?.type === 'ObjectExpression') {
              const variants = findObjectProp(config, 'variants');
              if (variants) {
                const group = findObjectProp(variants, unitDef.variantGroup);
                if (group) {
                  const val = findObjectProp(group, unitDef.key);
                  if (val) {
                    matched++;
                    addNode(val);
                  }
                }
              }
            }
          }
        }
      },
    });
    if (matched === 0) throw new Error(`cva-variant not found: ${unitDef.variable}.${unitDef.variantGroup}.${unitDef.key}`);
    if (matched > 1) throw new Error(`Ambiguous cva-variant matches (${matched}): ${unitDef.variable}.${unitDef.variantGroup}.${unitDef.key}`);
  } else if (unitDef.type === 'cva-variant-composite') {
    let matchedVar = 0;
    traverse(ast, {
      VariableDeclarator(p) {
        if (p.node.id?.name === unitDef.variable) {
          matchedVar++;
          const init = p.node.init;
          if (init?.type === 'CallExpression' && init.callee?.name === 'cva') {
            if (unitDef.includeBase && init.arguments[0]) {
              addNode(init.arguments[0]);
            }
            const config = init.arguments[1];
            if (config?.type === 'ObjectExpression') {
              const variants = findObjectProp(config, 'variants');
              if (variants) {
                for (const v of unitDef.variants) {
                  const group = findObjectProp(variants, v.group);
                  if (!group) throw new Error(`Variant group not found: ${v.group}`);
                  const val = findObjectProp(group, v.key);
                  if (!val) throw new Error(`Variant key not found: ${v.group}.${v.key}`);
                  addNode(val);
                }
              }
            }
          }
        }
      },
    });
    if (matchedVar === 0) throw new Error(`Variable not found: ${unitDef.variable}`);
    if (matchedVar > 1) throw new Error(`Ambiguous variable matches (${matchedVar}): ${unitDef.variable}`);
  } else if (unitDef.type === 'object-property') {
    let matched = 0;
    traverse(ast, {
      VariableDeclarator(p) {
        if (p.node.id?.name === unitDef.variable) {
          const init = p.node.init;
          if (init?.type === 'ObjectExpression') {
            const val = findObjectProp(init, unitDef.key);
            if (val) {
              matched++;
              addNode(val);
            }
          }
        }
      },
    });
    if (matched === 0) throw new Error(`object-property not found: ${unitDef.variable}.${unitDef.key}`);
    if (matched > 1) throw new Error(`Ambiguous object-property matches (${matched}): ${unitDef.variable}.${unitDef.key}`);
  } else if (unitDef.type === 'jsx-component') {
    let compPath = null;
    traverse(ast, {
      VariableDeclarator(p) {
        if (p.node.id?.name === unitDef.component) {
          compPath = p;
        }
      },
      FunctionDeclaration(p) {
        if (p.node.id?.name === unitDef.component) {
          compPath = p;
        }
      },
    });

    if (!compPath) throw new Error(`Component definition not found: ${unitDef.component}`);

    function getTagName(node) {
      if (node.name?.type === 'JSXIdentifier') return node.name.name;
      if (node.name?.type === 'JSXMemberExpression') {
        const obj = node.name.object?.name || (node.name.object?.property && `${node.name.object.object?.name}.${node.name.object.property.name}`);
        return `${obj}.${node.name.property?.name}`;
      }
      return '';
    }

    if (unitDef.target) {
      let matchedElements = [];
      compPath.traverse({
        JSXOpeningElement(p) {
          const name = getTagName(p.node);
          if (name === unitDef.target) {
            matchedElements.push(p);
          }
        },
      });

      if (matchedElements.length === 0) throw new Error(`Target JSX element <${unitDef.target}> not found in ${unitDef.component}`);
      if (matchedElements.length > 1) {
        matchedElements = [matchedElements[0]];
      }

      const el = matchedElements[0];
      const attrName = unitDef.attribute || 'className';
      const attr = el.node.attributes?.find((a) => a.type === 'JSXAttribute' && a.name?.name === attrName);
      if (!attr) throw new Error(`Attribute ${attrName} not found on <${unitDef.target}> in ${unitDef.component}`);

      if (attr.value?.type === 'StringLiteral') {
        addString(attr.value.value);
      } else if (attr.value?.type === 'JSXExpressionContainer') {
        const expr = attr.value.expression;
        if (expr.type === 'CallExpression' && expr.callee?.name === 'cn' && typeof unitDef.cnArgumentIndex === 'number') {
          addNode(expr.arguments[unitDef.cnArgumentIndex]);
        } else if ((expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression') && typeof unitDef.cnArgumentIndex === 'number') {
          const body = expr.body;
          if (body.type === 'CallExpression' && body.callee?.name === 'cn') {
            addNode(body.arguments[unitDef.cnArgumentIndex]);
          } else {
            addNode(body);
          }
        } else {
          addNode(expr);
        }
      }
    } else {
      compPath.traverse({
        JSXAttribute(p) {
          if (p.node.name?.name === 'className') {
            addNode(p.node.value);
          }
        },
      });
    }
  } else if (unitDef.type === 'jsx-component-group') {
    for (const compName of unitDef.components) {
      let compPath = null;
      traverse(ast, {
        VariableDeclarator(p) {
          if (p.node.id?.name === compName) compPath = p;
        },
        FunctionDeclaration(p) {
          if (p.node.id?.name === compName) compPath = p;
        },
      });
      if (!compPath) throw new Error(`Component in group not found: ${compName}`);
      compPath.traverse({
        JSXAttribute(p) {
          if (p.node.name?.name === 'className') {
            if (compName === 'SegmentedControlItem' && unitDef.targetItemExpr) {
              const expr = p.node.value?.expression;
              if (expr?.type === 'CallExpression' && expr.callee?.name === 'cn') {
                addNode(expr.arguments[1]);
              }
            } else {
              addNode(p.node.value);
            }
          }
        },
      });
    }
  } else {
    throw new Error(`Unsupported ownerUnit type '${unitDef.type}' for recipe '${recipe.id}'`);
  }

  return rawTokens;
}

/**
 * Visual Recipe Guard
 *
 * Verifies that protected primitives and domain patterns adhere strictly
 * to authorized NumisCollection visual recipes and owner permissions,
 * and verifies source facts against checked-in frozen Numis source fixtures.
 *
 * @param {Array<Object>} [recipes=YUEORA_AUTHORIZED_RECIPES] - Recipes to verify
 * @returns {Array<{ file: string, line: number, matched: string, message: string }>}
 */
export function verifyVisualRecipes(recipes = YUEORA_AUTHORIZED_RECIPES, options = {}) {
  const { contentOverrides = {} } = options;
  const issues = [];

  let frozenMetadata = null;
  if (fs.existsSync(FROZEN_METADATA_PATH)) {
    try {
      frozenMetadata = JSON.parse(fs.readFileSync(FROZEN_METADATA_PATH, 'utf8'));
    } catch (e) {
      issues.push({
        file: FROZEN_METADATA_PATH,
        line: 1,
        matched: 'metadata.json',
        message: `Failed to parse frozen Numis metadata: ${e.message}`,
      });
    }
  }

  if (frozenMetadata) {
    if (frozenMetadata.commit !== NUMIS_REFERENCE_META.commit) {
      issues.push({
        file: FROZEN_METADATA_PATH,
        line: 1,
        matched: frozenMetadata.commit,
        message: `Frozen metadata commit mismatch (expected ${NUMIS_REFERENCE_META.commit}, got ${frozenMetadata.commit})`,
      });
    }
    const expectedTree = NUMIS_REFERENCE_META.treeSha || NUMIS_REFERENCE_META.tree;
    if (frozenMetadata.tree !== expectedTree) {
      issues.push({
        file: FROZEN_METADATA_PATH,
        line: 1,
        matched: frozenMetadata.tree,
        message: `Frozen metadata tree SHA mismatch (expected ${expectedTree}, got ${frozenMetadata.tree})`,
      });
    }
  }

  for (const recipe of recipes) {
    // 1. Manifest structural validation
    if (!recipe.id || typeof recipe.id !== 'string') {
      issues.push({
        file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
        line: 1,
        matched: recipe.id || 'unnamed-recipe',
        message: 'Visual recipe is missing a valid stable id.',
      });
      continue;
    }

    if (!VALID_MAPPING_TYPES.has(recipe.mappingType)) {
      issues.push({
        file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
        line: 1,
        matched: `${recipe.id}: ${recipe.mappingType}`,
        message: `Recipe '${recipe.id}' has invalid mappingType '${recipe.mappingType}'. Must be 'exact', 'semantic-alias', or 'structural-adaptation'.`,
      });
    }

    // 2. Frozen Numis source metadata verification
    if (
      !recipe.source ||
      recipe.source.repository !== NUMIS_REFERENCE_META.repository ||
      recipe.source.commit !== NUMIS_REFERENCE_META.commit ||
      !recipe.source.file ||
      typeof recipe.source.line !== 'number' ||
      recipe.source.line <= 0
    ) {
      issues.push({
        file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
        line: 1,
        matched: recipe.id,
        message: `Recipe '${recipe.id}' has invalid or incomplete frozen Numis source metadata.`,
      });
    }

    // 2b. Frozen Numis snapshot content and hash verification (both sha256 and gitBlobSha)
    if (frozenMetadata && recipe.source?.file) {
      const fixtureFilePath = path.join(FROZEN_FIXTURES_DIR, recipe.source.file);
      if (!fs.existsSync(fixtureFilePath)) {
        issues.push({
          file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
          line: 1,
          matched: recipe.id,
          message: `Frozen source fixture '${fixtureFilePath}' for recipe '${recipe.id}' does not exist.`,
        });
      } else {
        const fixtureContent = fs.readFileSync(fixtureFilePath, 'utf8');
        const normalizedContent = fixtureContent.replace(/\r\n/g, '\n');
        const contentBuffer = Buffer.from(normalizedContent, 'utf8');

        // Verify SHA-256
        const hash = crypto.createHash('sha256').update(contentBuffer).digest('hex');
        const expectedHash = frozenMetadata?.files?.[recipe.source.file]?.sha256;
        if (expectedHash && hash !== expectedHash) {
          issues.push({
            file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
            line: 1,
            matched: recipe.id,
            message: `Frozen source fixture '${recipe.source.file}' sha256 mismatch for recipe '${recipe.id}' (expected ${expectedHash}, got ${hash}).`,
          });
        }

        // Verify Git Blob SHA-1 (blob <size>\0<content>)
        const header = Buffer.from(`blob ${contentBuffer.length}\0`);
        const gitBlobSha = crypto.createHash('sha1').update(Buffer.concat([header, contentBuffer])).digest('hex');
        const expectedGitBlobSha = frozenMetadata?.files?.[recipe.source.file]?.gitBlobSha;
        if (expectedGitBlobSha && gitBlobSha !== expectedGitBlobSha) {
          issues.push({
            file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
            line: 1,
            matched: recipe.id,
            message: `Frozen source fixture '${recipe.source.file}' git blob SHA mismatch for recipe '${recipe.id}' (expected ${expectedGitBlobSha}, got ${gitBlobSha}).`,
          });
        }

        const lines = fixtureContent.split(/\r?\n/);
        const sourceLineText = lines[recipe.source.line - 1] || '';
        const exact = recipe.source.exactSnippet || '';
        const unquoted = exact.replace(/^["']|["'],?$/g, '').trim();
        if (!sourceLineText.includes(exact) && (!unquoted || !sourceLineText.includes(unquoted))) {
          issues.push({
            file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
            line: 1,
            matched: recipe.id,
            message: `Frozen source snippet mismatch for recipe '${recipe.id}': line ${recipe.source.line} in '${recipe.source.file}' does not contain expected snippet: ${exact}`,
          });
        }
      }
    }

    // 3. Allowed owners verification (Fail closed: every owner must exist)
    if (!Array.isArray(recipe.allowedOwners) || recipe.allowedOwners.length === 0) {
      issues.push({
        file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
        line: 1,
        matched: recipe.id,
        message: `Recipe '${recipe.id}' has empty allowedOwners. Empty allowedOwners is strictly forbidden.`,
      });
      continue;
    }

    for (const ownerPath of recipe.allowedOwners) {
      const normPath = ownerPath.replace(/\\/g, '/');
      if (!fs.existsSync(normPath)) {
        issues.push({
          file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
          line: 1,
          matched: normPath,
          message: `Recipe '${recipe.id}' specifies nonexistent owner file '${normPath}'. Speculative visual permissions are forbidden.`,
        });
        continue;
      }

      // 4. Owner source code recipe unit verification (Fail closed: exact match on protected visual tokens)
      try {
        const ownerContent =
          contentOverrides[normPath] !== undefined
            ? contentOverrides[normPath]
            : fs.readFileSync(normPath, 'utf8');
        const unitTokens = extractRecipeUnitTokens(normPath, ownerContent, recipe);
        const actualProtected = Array.from(unitTokens).filter(isProtectedToken);
        const expectedProtected = (recipe.yueoraClasses || []).filter(isProtectedToken);

        const missingClasses = expectedProtected.filter((cls) => !unitTokens.has(cls));
        const unexpectedClasses = actualProtected.filter((cls) => !expectedProtected.includes(cls));

        if (missingClasses.length > 0 || unexpectedClasses.length > 0) {
          const unitDef = recipe.ownerUnits ? recipe.ownerUnits[normPath] : recipe.ownerUnit;
          const unitDesc = unitDef
            ? `${unitDef.type} (${unitDef.variable || unitDef.component || unitDef.components?.join('+') || ''})`
            : 'unknown-unit';

          const details = [];
          if (missingClasses.length > 0) details.push(`Missing protected tokens: ${missingClasses.join(' ')}`);
          if (unexpectedClasses.length > 0) details.push(`Unexpected protected tokens: ${unexpectedClasses.join(' ')}`);

          issues.push({
            file: normPath,
            line: 1,
            matched: recipe.id,
            message: `Visual recipe '${recipe.id}' mismatch in owner '${normPath}' [unit: ${unitDesc}]:\n  ${details.join('\n  ')}`,
          });
        }
      } catch (err) {
        issues.push({
          file: normPath,
          line: 1,
          matched: recipe.id,
          message: `Failed to verify owner file '${normPath}': ${err.message}`,
        });
      }
    }
  }

  return issues;
}

export default verifyVisualRecipes;
