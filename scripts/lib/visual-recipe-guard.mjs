import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  NUMIS_REFERENCE_META,
  YUEORA_AUTHORIZED_RECIPES,
  ELEVATION_SHADOW_TOKENS,
} from './numis-visual-provenance-manifest.mjs';

const VALID_MAPPING_TYPES = new Set(['exact', 'semantic-alias', 'structural-adaptation']);

const FROZEN_FIXTURES_DIR = path.resolve('scripts/fixtures/numis-frozen');
const FROZEN_METADATA_PATH = path.join(FROZEN_FIXTURES_DIR, 'metadata.json');

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

    // 2b. Frozen Numis snapshot content and hash verification
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
        const hash = crypto.createHash('sha256').update(normalizedContent, 'utf8').digest('hex');
        const expectedHash = frozenMetadata?.files?.[recipe.source.file]?.sha256;
        if (expectedHash && hash !== expectedHash) {
          issues.push({
            file: 'scripts/lib/numis-visual-provenance-manifest.mjs',
            line: 1,
            matched: recipe.id,
            message: `Frozen source fixture '${recipe.source.file}' hash mismatch for recipe '${recipe.id}' (expected ${expectedHash}, got ${hash}).`,
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

      // 4. Owner source code verification (Fail closed: every declared class must exist)
      try {
        const ownerContent = fs.readFileSync(normPath, 'utf8');
        if (Array.isArray(recipe.yueoraClasses) && recipe.yueoraClasses.length > 0) {
          const missingClasses = recipe.yueoraClasses.filter((cls) => {
            // Strip complex pseudo-modifiers if searching
            const bare = cls.replace(/^(?:group-\[[^\]]+\]:|hover:|focus:|active:|focus-visible:|data-\[[^\]]+\]:)+/, '');
            return !ownerContent.includes(bare);
          });

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
          message: `Failed to read owner file '${normPath}': ${err.message}`,
        });
      }
    }
  }

  return issues;
}

export default verifyVisualRecipes;
