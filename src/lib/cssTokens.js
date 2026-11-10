/**
 * Shared runtime token resolver for off-screen canvas, SVG, and video rendering.
 *
 * Resolves canonical semantic Design System tokens from document.documentElement
 * CSS custom properties so export and rendering pipelines stay in sync with
 * src/index.css automatically without maintaining duplicated color tables.
 */

export const REQUIRED_SVG_TOKENS = [
  '--foreground',
  '--border',
  '--muted-foreground',
  '--primary',
  '--practice-current',
  '--selection',
  '--warning',
  '--card',
  '--surface-panel',
  '--surface-canvas',
  '--ink-primary',
  '--ink-secondary',
  '--ink-tertiary',
  '--brand',
  '--brand-soft',
  '--line-subtle',
];

/**
 * Resolves a CSS custom property from computed style, recursively following var(--...) references.
 * @param {string} name
 * @param {CSSStyleDeclaration} [rootStyle]
 * @returns {string}
 */
export function resolveCssVariable(name, rootStyle) {
  if (!rootStyle && typeof document !== 'undefined') {
    rootStyle = window.getComputedStyle(document.documentElement);
  }
  if (!rootStyle) return '';
  let val = rootStyle.getPropertyValue(name).trim();
  let depth = 0;
  while (val.startsWith('var(') && depth < 5) {
    const match = val.match(/var\((--[a-zA-Z0-9-]+)\)/);
    if (!match) break;
    val = rootStyle.getPropertyValue(match[1]).trim();
    depth++;
  }
  return val;
}

/**
 * Resolves a canonical semantic token to an HSL color string for Canvas 2D or SVG rendering.
 * Does not silently provide a copied Design System fallback: if a required semantic token
 * is missing or cannot be resolved, an error is thrown to guarantee single source of truth.
 * @param {string} name e.g. '--surface-panel', '--ink-primary', '--brand'
 * @param {string} [fallback] optional explicit output fallback if document or token is unresolvable
 * @returns {string}
 */
export function resolveSemanticColor(name, fallback) {
  if (typeof document === 'undefined') {
    if (fallback !== undefined) return fallback;
    throw new Error(`[cssTokens] Cannot resolve "${name}": document is undefined and no fallback provided.`);
  }
  const rootStyle = window.getComputedStyle(document.documentElement);
  const raw = resolveCssVariable(name, rootStyle);
  if (!raw) {
    if (fallback !== undefined) return fallback;
    throw new Error(`[cssTokens] Required semantic token "${name}" is missing or unresolvable in document styles.`);
  }
  return `hsl(${raw})`;
}

/**
 * Formats required CSS variables as an inline style string for standalone SVG images.
 * @param {string[]} [tokenList]
 * @returns {string}
 */
export function resolveRequiredSvgTokens(tokenList = REQUIRED_SVG_TOKENS) {
  if (typeof document === 'undefined') return '';
  const rootStyle = window.getComputedStyle(document.documentElement);
  return tokenList
    .map((name) => `${name}:${resolveCssVariable(name, rootStyle)}`)
    .join(';');
}
