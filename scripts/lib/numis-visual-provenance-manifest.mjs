import fs from 'fs';

/**
 * Single Authoritative Visual Provenance & Reference Manifest
 *
 * Source of truth: tinghui0912/NumisCollection (efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c)
 * Shared across color-provenance-guard, check-design-system, and regression test suites.
 */

// 1. Reference Metadata
export const NUMIS_REFERENCE_META = {
  repository: 'tinghui0912/NumisCollection',
  commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
  treeSha: '9602c27dce5c2625c0e7251acfae8c1be6b5c725',
};

// 2. 32 Frozen Numis Physical Root Color Tokens (Exact Values in src/index.css)
export const NUMIS_ROOT_TOKENS = {
  '--numis-background': '40 20% 97%',
  '--numis-foreground': '30 10% 12%',
  '--numis-card': '40 25% 99%',
  '--numis-card-foreground': '30 10% 12%',
  '--numis-popover': '40 25% 99%',
  '--numis-popover-foreground': '30 10% 12%',
  '--numis-primary': '36 70% 45%',
  '--numis-primary-foreground': '40 20% 98%',
  '--numis-secondary': '35 15% 93%',
  '--numis-secondary-foreground': '30 10% 20%',
  '--numis-muted': '35 12% 93%',
  '--numis-muted-foreground': '30 5% 46%',
  '--numis-accent': '36 50% 90%',
  '--numis-accent-foreground': '30 10% 15%',
  '--numis-destructive': '0 72% 51%',
  '--numis-destructive-foreground': '0 0% 98%',
  '--numis-border': '35 15% 88%',
  '--numis-input': '35 15% 88%',
  '--numis-ring': '36 70% 45%',
  '--numis-sidebar-background': '35 20% 96%',
  '--numis-sidebar-foreground': '30 10% 20%',
  '--numis-sidebar-primary': '36 70% 45%',
  '--numis-sidebar-primary-foreground': '40 20% 98%',
  '--numis-sidebar-accent': '35 20% 92%',
  '--numis-sidebar-accent-foreground': '30 10% 15%',
  '--numis-sidebar-border': '35 15% 88%',
  '--numis-sidebar-ring': '36 70% 45%',
  '--numis-chart-1': '36 70% 45%',
  '--numis-chart-2': '160 45% 40%',
  '--numis-chart-3': '210 40% 45%',
  '--numis-chart-4': '280 40% 50%',
  '--numis-chart-5': '0 55% 50%',
};

// 3. 33 Approved Yueora Semantic Color Aliases (Exact Frozen Mappings in src/index.css)
export const YUEORA_SEMANTIC_COLOR_ALIASES = {
  '--surface-canvas': 'var(--numis-background)',
  '--surface-panel': 'var(--numis-card)',
  '--surface-raised': 'var(--numis-card)',
  '--surface-subrail': 'var(--numis-sidebar-background)',
  '--surface-subrail-border': 'var(--numis-sidebar-border)',
  '--ink-primary': 'var(--numis-foreground)',
  '--ink-secondary': 'var(--numis-sidebar-foreground)',
  '--ink-tertiary': 'var(--numis-muted-foreground)',
  '--ink-subtle': 'var(--numis-border)',
  '--line-subtle': 'var(--numis-border)',
  '--line-strong': 'var(--numis-border)',
  '--brand': 'var(--numis-primary)',
  '--brand-foreground': 'var(--numis-primary-foreground)',
  '--brand-soft': 'var(--numis-accent)',
  '--brand-soft-foreground': 'var(--numis-accent-foreground)',
  '--nav-active-bg': 'var(--numis-primary) / 0.1',
  '--control-hover-accent': 'var(--numis-accent)',
  '--neutral-muted': 'var(--numis-muted)',
  '--neutral-muted-foreground': 'var(--numis-muted-foreground)',
  '--neutral-hover': 'var(--numis-sidebar-accent)',
  '--neutral-hover-foreground': 'var(--numis-foreground)',
  '--danger': 'var(--numis-destructive)',
  '--danger-foreground': 'var(--numis-destructive-foreground)',
  '--info': 'var(--numis-sidebar-accent)',
  '--info-foreground': 'var(--numis-foreground)',
  '--selection': 'var(--numis-accent)',
  '--practice-waiting': 'var(--numis-sidebar-foreground)',
  '--practice-waiting-foreground': 'var(--numis-primary-foreground)',
  '--practice-current': 'var(--numis-primary)',
  '--practice-current-foreground': 'var(--numis-primary-foreground)',
  '--practice-error': 'var(--numis-destructive)',
  '--practice-error-foreground': 'var(--numis-destructive-foreground)',
  '--gold': 'var(--numis-primary)',
};

// 4. 19 Approved Radix / Compatibility Color Aliases (Exact Frozen Mappings in src/index.css)
export const YUEORA_COMPATIBILITY_COLOR_ALIASES = {
  '--background': 'var(--numis-background)',
  '--foreground': 'var(--numis-foreground)',
  '--card': 'var(--numis-card)',
  '--card-foreground': 'var(--numis-card-foreground)',
  '--popover': 'var(--numis-popover)',
  '--popover-foreground': 'var(--numis-popover-foreground)',
  '--primary': 'var(--numis-primary)',
  '--primary-foreground': 'var(--numis-primary-foreground)',
  '--secondary': 'var(--numis-secondary)',
  '--secondary-foreground': 'var(--numis-secondary-foreground)',
  '--muted': 'var(--numis-muted)',
  '--muted-foreground': 'var(--numis-muted-foreground)',
  '--accent': 'var(--numis-accent)',
  '--accent-foreground': 'var(--numis-accent-foreground)',
  '--destructive': 'var(--numis-destructive)',
  '--destructive-foreground': 'var(--numis-destructive-foreground)',
  '--border': 'var(--numis-border)',
  '--input': 'var(--numis-input)',
  '--ring': 'var(--numis-ring)',
};

// 5. 3 Approved Elevation Shadow Custom Properties in src/index.css
export const ELEVATION_SHADOW_TOKENS = {
  '--shadow-control': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--shadow-raised': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  '--shadow-overlay': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

// 6. Canonical Color Utility Prefix Set (Shared across scanners)
export const COLOR_UTILITY_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'shadow',
  'from',
  'via',
  'to',
  'stroke',
  'fill',
];

// 7. Reference Status Recipe Inventory (Frozen Numis Source of Truth)
// Records verified recipes in tinghui0912/NumisCollection (efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c).
// Frozen reference inventory != Yueora active permission table.
export const NUMIS_REFERENCE_STATUS_RECIPES = [
  {
    id: 'toast-destructive-close',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/toast.jsx',
      line: 67,
    },
    sourceSemanticRole: 'destructive toast close button hover & focus states',
    sourceClasses: ['text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600'],
  },
  {
    id: 'positive-metric',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/pages/UserProfile.jsx',
      line: 114,
    },
    sourceSemanticRole: 'positive portfolio financial gain metric',
    sourceClasses: ['text-emerald-600'],
  },
  {
    id: 'negative-metric',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/pages/UserProfile.jsx',
      line: 114,
    },
    sourceSemanticRole: 'negative portfolio financial loss metric',
    sourceClasses: ['text-red-500'],
  },
  {
    id: 'warning-callout',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/collection/BulkEstimateButton.jsx',
      line: 44,
    },
    sourceSemanticRole: 'ai estimate credit quota warning callout',
    sourceClasses: ['text-amber-600', 'bg-amber-50'],
  },
  {
    id: 'badge-default',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx',
      line: 12,
    },
    sourceSemanticRole: 'default badge primary visual',
    sourceClasses: ['border-transparent', 'bg-primary', 'text-primary-foreground', 'shadow', 'hover:bg-primary/80'],
  },
  {
    id: 'badge-secondary',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx',
      line: 14,
    },
    sourceSemanticRole: 'secondary badge visual',
    sourceClasses: ['border-transparent', 'bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80'],
  },
  {
    id: 'badge-destructive',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx',
      line: 16,
    },
    sourceSemanticRole: 'destructive badge visual',
    sourceClasses: ['border-transparent', 'bg-destructive', 'text-destructive-foreground', 'shadow', 'hover:bg-destructive/80'],
  },
  {
    id: 'badge-outline',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx',
      line: 17,
    },
    sourceSemanticRole: 'outline badge visual',
    sourceClasses: ['text-foreground'],
  },
];

// 8. Active Yueora Authorized Visual Recipes
// Every active recipe must reference a verified frozen source, have >= 1 approved owner,
// and EVERY owner path must physically exist in the current Yueora HEAD (fs.existsSync).
// Speculative future visual permissions for nonexistent files are strictly forbidden (fail closed).
export const YUEORA_AUTHORIZED_STATUS_RECIPES = [
  {
    id: 'toast-destructive-close',
    sourceReferenceId: 'toast-destructive-close',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/toast.jsx:67',
    },
    sourceSemanticRole: 'destructive toast close button hover & focus states',
    approvedYueoraRole: 'destructive toast close button interactive states',
    sourceClasses: ['text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600'],
    yueoraClasses: ['text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600'],
    yueoraColorRecipe: ['text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600'],
    allowedOwners: ['src/components/ui/toast.jsx'],
    approvedYueoraRoles: ['destructive-toast-close'],
  },
  {
    id: 'badge-default',
    sourceReferenceId: 'badge-default',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx:12',
    },
    sourceSemanticRole: 'default badge primary visual',
    approvedYueoraRole: 'default / brand / success status badge visual',
    sourceClasses: ['border-transparent', 'bg-primary', 'text-primary-foreground', 'shadow', 'hover:bg-primary/80'],
    yueoraClasses: ['border-transparent', 'bg-brand', 'text-brand-foreground', 'shadow', 'hover:bg-brand/80'],
    yueoraColorRecipe: ['border-transparent', 'bg-brand', 'text-brand-foreground', 'shadow', 'hover:bg-brand/80'],
    allowedOwners: [
      'src/components/ui/badge.jsx',
      'src/components/patterns/StatusIndicator.jsx',
      'src/components/patterns/CountBadge.jsx',
    ],
    approvedYueoraRoles: ['default', 'brand', 'success', 'practice', 'attention'],
  },
  {
    id: 'badge-secondary',
    sourceReferenceId: 'badge-secondary',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx:14',
    },
    sourceSemanticRole: 'secondary badge visual',
    approvedYueoraRole: 'secondary / neutral / warning / informational status badge visual',
    sourceClasses: ['border-transparent', 'bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80'],
    yueoraClasses: ['border-transparent', 'bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80'],
    yueoraColorRecipe: ['border-transparent', 'bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80'],
    allowedOwners: [
      'src/components/ui/badge.jsx',
      'src/components/patterns/StatusIndicator.jsx',
      'src/components/patterns/CountBadge.jsx',
    ],
    approvedYueoraRoles: ['secondary', 'neutral', 'warning', 'informational'],
  },
  {
    id: 'badge-destructive',
    sourceReferenceId: 'badge-destructive',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx:16',
    },
    sourceSemanticRole: 'destructive badge visual',
    approvedYueoraRole: 'destructive / danger status badge visual',
    sourceClasses: ['border-transparent', 'bg-destructive', 'text-destructive-foreground', 'shadow', 'hover:bg-destructive/80'],
    yueoraClasses: ['border-transparent', 'bg-danger', 'text-danger-foreground', 'shadow', 'hover:bg-danger/80'],
    yueoraColorRecipe: ['border-transparent', 'bg-danger', 'text-danger-foreground', 'shadow', 'hover:bg-danger/80'],
    allowedOwners: [
      'src/components/ui/badge.jsx',
      'src/components/patterns/StatusIndicator.jsx',
      'src/components/patterns/CountBadge.jsx',
    ],
    approvedYueoraRoles: ['destructive', 'danger'],
  },
  {
    id: 'badge-outline',
    sourceReferenceId: 'badge-outline',
    source: {
      repository: 'tinghui0912/NumisCollection',
      commit: 'efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c',
      file: 'src/components/ui/badge.jsx:17',
    },
    sourceSemanticRole: 'outline badge visual',
    approvedYueoraRole: 'outline status badge visual',
    sourceClasses: ['text-foreground'],
    yueoraClasses: ['border-line-subtle', 'text-ink-primary'],
    yueoraColorRecipe: ['border-line-subtle', 'text-ink-primary'],
    allowedOwners: [
      'src/components/ui/badge.jsx',
    ],
    approvedYueoraRoles: ['outline'],
  },
];

// Backward-compatible alias
export const NUMIS_STATUS_RECIPES = YUEORA_AUTHORIZED_STATUS_RECIPES;
export const YUEORA_VISUAL_RECIPE_MANIFEST = YUEORA_AUTHORIZED_STATUS_RECIPES;

// Manifest Self-Validation Asserts:
// 1. Reference recipes must have non-empty source file, line (> 0), sourceSemanticRole, and sourceClasses.
for (const recipe of NUMIS_REFERENCE_STATUS_RECIPES) {
  if (!recipe.source?.file || typeof recipe.source?.line !== 'number' || recipe.source.line <= 0) {
    throw new Error(`Invalid reference status recipe '${recipe.id}': missing or invalid source file/line metadata.`);
  }
  if (!recipe.sourceSemanticRole || typeof recipe.sourceSemanticRole !== 'string') {
    throw new Error(`Invalid reference status recipe '${recipe.id}': missing sourceSemanticRole.`);
  }
  if (!Array.isArray(recipe.sourceClasses) || recipe.sourceClasses.length === 0) {
    throw new Error(`Invalid reference status recipe '${recipe.id}': empty sourceClasses.`);
  }
}

// 2. Active authorized recipes must have allowedOwners with every owner file physically existing in Yueora.
for (const recipe of YUEORA_AUTHORIZED_STATUS_RECIPES) {
  if (!Array.isArray(recipe.allowedOwners) || recipe.allowedOwners.length === 0) {
    throw new Error(`Invalid status recipe manifest: recipe '${recipe.id}' has empty allowedOwners. Empty allowedOwners is strictly forbidden (must fail closed).`);
  }
  for (const owner of recipe.allowedOwners) {
    if (!fs.existsSync(owner)) {
      throw new Error(`Invalid status recipe manifest: recipe '${recipe.id}' specifies nonexistent owner '${owner}'. No speculative future visual permission allowed.`);
    }
  }
  if (!Array.isArray(recipe.approvedYueoraRoles) || recipe.approvedYueoraRoles.length === 0) {
    throw new Error(`Invalid status recipe manifest: recipe '${recipe.id}' has empty approvedYueoraRoles.`);
  }
}

// 9. Numis Dialog / Drawer Overlay Recipes (Verbatim Numis alert-dialog, dialog, drawer, sheet: ALL /80)
export const NUMIS_OVERLAY_RECIPES = {
  'src/components/ui/alert-dialog.jsx': new Set(['bg-black/80']),
  'src/components/ui/dialog.jsx': new Set(['bg-black/80']),
  'src/components/ui/drawer.jsx': new Set(['bg-black/80']),
  'src/components/ui/sheet.jsx': new Set(['bg-black/80']),
};

// 10. Exact Utility + Color + Opacity Manifest (Verified from NumisCollection efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c)
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

  // Overlays
  'bg-black/50',
  'bg-black/80',
]);

// 11. External Brand Asset Exceptions (Strictly scoped by file and values)
export const EXTERNAL_BRAND_EXCEPTIONS = {
  'src/components/GoogleIcon.jsx': new Set([
    '#4285f4', // Google Blue
    '#34a853', // Google Green
    '#fbbc05', // Google Yellow
    '#ea4335', // Google Red
  ]),
};

// 12. Framework / Library Selector Exceptions (Direct Numis source provenance)
export const FRAMEWORK_SELECTOR_EXCEPTIONS = {
  'src/components/ui/chart.jsx': new Set([
    '#ccc', // Recharts grid stroke selector [stroke='#ccc']
    '#fff', // Recharts dot/sector stroke selector [stroke='#fff']
  ]),
};

// 13. Retired Yueora Physical Colors & Tokens (Zero Tolerance Blacklist)
export const RETIRED_YUEORA_PATTERNS = [
  /#98661B/i,
  /#895814/i,
  /#D39029/i,
  /#2B58BF/i,
  /#2C5E43/i,
  /36\s+70%\s+35%/,
  /\bbrand-fill\b/i,
  /\bbrand-fill-hover\b/i,
  /\bbrand-fill-foreground\b/i,
  /\bbrand-hover\b/i,
  /\bprimitive-gold-[0-9]+\b/i,
  /\bprimitive-neutral-[0-9]+\b/i,
  /\bprimitive-danger-[0-9]+\b/i,
];
