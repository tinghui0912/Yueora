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

function extractStringsFromNode(node) {
  const res = [];
  if (!node) return res;
  if (node.type === 'StringLiteral') {
    res.push(node.value);
  } else if (node.type === 'TemplateLiteral') {
    for (const q of node.quasis) {
      if (q.value?.raw) res.push(q.value.raw);
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

const ROLE_ALIASES = {
  'destructive-toast': ['destructive'],
  'icon-md': ['md'],
};

/**
 * Extracts exact recipe unit tokens from an owner file using AST parsing.
 * Preserves all state and variant modifiers (hover:, focus:, data-[state=*]:, etc.)
 *
 * @param {string} filePath
 * @param {string} fileContent
 * @param {Object} recipe
 * @returns {Set<string>}
 */
export function extractRecipeUnitTokens(filePath, fileContent, recipe) {
  const ast = parser.parse(fileContent, { sourceType: 'module', plugins: ['jsx'] });
  const tokens = new Set();

  const searchRoles = new Set(recipe.approvedYueoraRoles || []);
  for (const r of recipe.approvedYueoraRoles || []) {
    if (ROLE_ALIASES[r]) {
      ROLE_ALIASES[r].forEach((a) => searchRoles.add(a));
    }
  }

  const addTokens = (str) => {
    if (!str) return;
    str.trim().split(/\s+/).forEach((t) => {
      if (!t) return;
      tokens.add(t);
      const strippedGroup = t.replace(/^group-\[\.destructive\]:/, '');
      if (strippedGroup !== t) tokens.add(strippedGroup);
    });
  };

  const addNodeTokens = (node) => {
    extractStringsFromNode(node).forEach(addTokens);
  };

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      if (callee.type === 'Identifier' && callee.name === 'cva') {
        const baseArg = path.node.arguments[0];
        const configArg = path.node.arguments[1];

        if (recipe.id.startsWith('toggle-') || recipe.id.includes('panel') || recipe.id.includes('surface')) {
          addNodeTokens(baseArg);
        }

        if (configArg && configArg.type === 'ObjectExpression') {
          const variantsProp = findObjectProp(configArg, 'variants');
          if (variantsProp && variantsProp.type === 'ObjectExpression') {
            for (const groupProp of variantsProp.properties) {
              if (groupProp.type === 'ObjectProperty' && groupProp.value.type === 'ObjectExpression') {
                for (const itemProp of groupProp.value.properties) {
                  if (itemProp.type === 'ObjectProperty') {
                    const itemKey = itemProp.key.type === 'Identifier' ? itemProp.key.name : itemProp.key.value;
                    if (searchRoles.has(String(itemKey))) {
                      addNodeTokens(itemProp.value);
                    }
                  }
                }
              }
            }
          }
          if (recipe.id === 'flat-content-panel' || recipe.id === 'statcard-interactive-panel') {
            const toneProp = findObjectProp(variantsProp, 'tone');
            if (toneProp) addNodeTokens(findObjectProp(toneProp, 'panel'));
            const borderProp = findObjectProp(variantsProp, 'border');
            if (borderProp) addNodeTokens(findObjectProp(borderProp, 'true'));
          }
          if (recipe.id === 'statcard-interactive-panel') {
            const interProp = findObjectProp(variantsProp, 'interactive');
            if (interProp) addNodeTokens(findObjectProp(interProp, 'true'));
          }
        }
      }
    },
    VariableDeclarator(path) {
      if (path.node.id.type === 'Identifier' && path.node.init?.type === 'ObjectExpression') {
        const obj = path.node.init;
        for (const prop of obj.properties) {
          if (prop.type === 'ObjectProperty') {
            const k = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
            if (searchRoles.has(String(k))) {
              addNodeTokens(prop.value);
            }
          }
        }
      }
    },
    JSXAttribute(path) {
      if (path.node.name.name === 'className') {
        if (path.node.value?.type === 'StringLiteral') {
          addTokens(path.node.value.value);
        } else if (path.node.value?.type === 'JSXExpressionContainer') {
          traverse(path.node.value.expression, {
            noScope: true,
            StringLiteral(strPath) {
              addTokens(strPath.node.value);
            },
            TemplateLiteral(tmplPath) {
              tmplPath.node.quasis.forEach((q) => q.value?.raw && addTokens(q.value.raw));
            },
          });
        }
      }
    },
  });

  return tokens;
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
export function verifyVisualRecipes(recipes = YUEORA_AUTHORIZED_RECIPES) {
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

      // 4. Owner source code recipe unit verification (Fail closed: every declared class must exist in the exact recipe unit)
      try {
        const ownerContent = fs.readFileSync(normPath, 'utf8');
        if (Array.isArray(recipe.yueoraClasses) && recipe.yueoraClasses.length > 0) {
          const unitTokens = extractRecipeUnitTokens(normPath, ownerContent, recipe);
          const missingClasses = recipe.yueoraClasses.filter((cls) => !unitTokens.has(cls));

          if (missingClasses.length > 0) {
            issues.push({
              file: normPath,
              line: 1,
              matched: recipe.id,
              message: `Owner file '${normPath}' does not contain authorized visual recipe '${recipe.id}' classes (${missingClasses.join(' ')}).`,
            });
          }
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
