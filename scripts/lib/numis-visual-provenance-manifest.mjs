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

// 7. Complete Reference Recipe Inventory (Frozen Numis Source of Truth)
// Records verified recipes in tinghui0912/NumisCollection (efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c).
// Frozen reference inventory != Yueora active permission table.
export const NUMIS_REFERENCE_RECIPES = [
  {
    "id": "toast-destructive-close",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toast.jsx",
      "line": 67,
      "exactSnippet": "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
    },
    "sourceSemanticRole": "destructive toast close button hover & focus states",
    "sourceClasses": [
      "text-red-300",
      "hover:text-red-50",
      "focus:ring-red-400",
      "focus:ring-offset-red-600"
    ]
  },
  {
    "id": "positive-metric",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/pages/UserProfile.jsx",
      "line": 114,
      "exactSnippet": "color: gain >= 0 ? \"text-emerald-600\" : \"text-red-500\""
    },
    "sourceSemanticRole": "positive portfolio financial gain metric",
    "sourceClasses": [
      "text-emerald-600"
    ]
  },
  {
    "id": "negative-metric",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/pages/UserProfile.jsx",
      "line": 114,
      "exactSnippet": "color: gain >= 0 ? \"text-emerald-600\" : \"text-red-500\""
    },
    "sourceSemanticRole": "negative portfolio financial loss metric",
    "sourceClasses": [
      "text-red-500"
    ]
  },
  {
    "id": "warning-callout",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/collection/BulkEstimateButton.jsx",
      "line": 44,
      "exactSnippet": "<p className=\"text-xs text-amber-600 font-body bg-amber-50 rounded-lg p-3\">"
    },
    "sourceSemanticRole": "ai estimate credit quota warning callout",
    "sourceClasses": [
      "text-amber-600",
      "bg-amber-50"
    ]
  },
  {
    "id": "badge-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 12,
      "exactSnippet": "\"border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80\","
    },
    "sourceSemanticRole": "default badge primary visual",
    "sourceClasses": [
      "border-transparent",
      "bg-primary",
      "text-primary-foreground",
      "shadow",
      "hover:bg-primary/80"
    ]
  },
  {
    "id": "badge-secondary",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 14,
      "exactSnippet": "\"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80\","
    },
    "sourceSemanticRole": "secondary badge visual",
    "sourceClasses": [
      "border-transparent",
      "bg-secondary",
      "text-secondary-foreground",
      "hover:bg-secondary/80"
    ]
  },
  {
    "id": "badge-destructive",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 16,
      "exactSnippet": "\"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80\","
    },
    "sourceSemanticRole": "destructive badge visual",
    "sourceClasses": [
      "border-transparent",
      "bg-destructive",
      "text-destructive-foreground",
      "shadow",
      "hover:bg-destructive/80"
    ]
  },
  {
    "id": "badge-outline",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 17,
      "exactSnippet": "outline: \"text-foreground\","
    },
    "sourceSemanticRole": "outline badge visual",
    "sourceClasses": [
      "text-foreground"
    ]
  },
  {
    "id": "toast-destructive",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toast.jsx",
      "line": 31,
      "exactSnippet": "\"destructive group border-destructive bg-destructive text-destructive-foreground\","
    },
    "sourceSemanticRole": "destructive toast container visual",
    "sourceClasses": [
      "destructive",
      "group",
      "border-destructive",
      "bg-destructive",
      "text-destructive-foreground"
    ]
  },
  {
    "id": "toast-action",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toast.jsx",
      "line": 55,
      "exactSnippet": "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"
    },
    "sourceSemanticRole": "destructive toast action button interactive styling",
    "sourceClasses": [
      "group-[.destructive]:border-muted/40",
      "group-[.destructive]:hover:border-destructive/30",
      "group-[.destructive]:hover:bg-destructive",
      "group-[.destructive]:hover:text-destructive-foreground",
      "group-[.destructive]:focus:ring-destructive"
    ]
  },
  {
    "id": "button-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 13,
      "exactSnippet": "\"bg-primary text-primary-foreground shadow hover:bg-primary/90\","
    },
    "sourceSemanticRole": "default primary button visual and hover state",
    "sourceClasses": [
      "bg-primary",
      "text-primary-foreground",
      "shadow",
      "hover:bg-primary/90"
    ]
  },
  {
    "id": "button-destructive",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 15,
      "exactSnippet": "\"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90\","
    },
    "sourceSemanticRole": "destructive button visual and hover state",
    "sourceClasses": [
      "bg-destructive",
      "text-destructive-foreground",
      "shadow-sm",
      "hover:bg-destructive/90"
    ]
  },
  {
    "id": "button-outline",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 17,
      "exactSnippet": "\"border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground\","
    },
    "sourceSemanticRole": "outline button visual and hover state",
    "sourceClasses": [
      "border",
      "border-input",
      "bg-transparent",
      "shadow-sm",
      "hover:bg-accent",
      "hover:text-accent-foreground"
    ]
  },
  {
    "id": "button-secondary",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 19,
      "exactSnippet": "\"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80\","
    },
    "sourceSemanticRole": "secondary button visual and hover state",
    "sourceClasses": [
      "bg-secondary",
      "text-secondary-foreground",
      "shadow-sm",
      "hover:bg-secondary/80"
    ]
  },
  {
    "id": "button-ghost",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 20,
      "exactSnippet": "ghost: \"hover:bg-accent hover:text-accent-foreground\","
    },
    "sourceSemanticRole": "ghost quiet button hover state",
    "sourceClasses": [
      "hover:bg-accent",
      "hover:text-accent-foreground"
    ]
  },
  {
    "id": "button-link",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 21,
      "exactSnippet": "link: \"text-primary underline-offset-4 hover:underline\","
    },
    "sourceSemanticRole": "link button visual and hover state",
    "sourceClasses": [
      "text-primary",
      "underline-offset-4",
      "hover:underline"
    ]
  },
  {
    "id": "button-size-icon",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 27,
      "exactSnippet": "icon: \"h-9 w-9\","
    },
    "sourceSemanticRole": "icon button dimensions",
    "sourceClasses": [
      "h-9",
      "w-9"
    ]
  },
  {
    "id": "input-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/input.jsx",
      "line": 10,
      "exactSnippet": "\"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm\","
    },
    "sourceSemanticRole": "text input control visual and focus state",
    "sourceClasses": [
      "flex",
      "h-9",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-transparent",
      "px-3",
      "py-1",
      "shadow-sm",
      "transition-colors",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-ring"
    ]
  },
  {
    "id": "select-trigger",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/select.jsx",
      "line": 19,
      "exactSnippet": "\"flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1\","
    },
    "sourceSemanticRole": "select trigger control visual and focus state",
    "sourceClasses": [
      "flex",
      "h-9",
      "w-full",
      "items-center",
      "justify-between",
      "rounded-md",
      "border",
      "border-input",
      "bg-transparent",
      "px-3",
      "py-2",
      "text-sm",
      "shadow-sm",
      "data-[placeholder]:text-muted-foreground",
      "focus:outline-none",
      "focus:ring-1",
      "focus:ring-ring"
    ]
  },
  {
    "id": "select-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/select.jsx",
      "line": 57,
      "exactSnippet": "\"relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
    },
    "sourceSemanticRole": "select dropdown menu popover container visual",
    "sourceClasses": [
      "relative",
      "z-50",
      "max-h-96",
      "min-w-[8rem]",
      "overflow-hidden",
      "rounded-md",
      "border",
      "bg-popover",
      "text-popover-foreground",
      "shadow-md"
    ]
  },
  {
    "id": "select-item",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/select.jsx",
      "line": 88,
      "exactSnippet": "\"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50\","
    },
    "sourceSemanticRole": "select item row hover and focus state",
    "sourceClasses": [
      "relative",
      "flex",
      "w-full",
      "cursor-default",
      "select-none",
      "items-center",
      "rounded-sm",
      "py-1.5",
      "pl-2",
      "pr-8",
      "text-sm",
      "outline-none",
      "focus:bg-accent",
      "focus:text-accent-foreground"
    ]
  },
  {
    "id": "checkbox-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/checkbox.jsx",
      "line": 11,
      "exactSnippet": "\"peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground\","
    },
    "sourceSemanticRole": "checkbox control visual and checked state",
    "sourceClasses": [
      "peer",
      "h-4",
      "w-4",
      "shrink-0",
      "rounded-sm",
      "border",
      "border-primary",
      "shadow",
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "data-[state=checked]:bg-primary",
      "data-[state=checked]:text-primary-foreground"
    ]
  },
  {
    "id": "radio-item",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/radio-group.jsx",
      "line": 17,
      "exactSnippet": "\"aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50\","
    },
    "sourceSemanticRole": "radio item control visual and focus state",
    "sourceClasses": [
      "aspect-square",
      "h-4",
      "w-4",
      "rounded-full",
      "border",
      "border-primary",
      "text-primary",
      "shadow",
      "focus:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-ring"
    ]
  },
  {
    "id": "switch-root",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/switch.jsx",
      "line": 9,
      "exactSnippet": "\"peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input\","
    },
    "sourceSemanticRole": "switch track root visual and checked/unchecked state",
    "sourceClasses": [
      "peer",
      "inline-flex",
      "h-5",
      "w-9",
      "shrink-0",
      "rounded-full",
      "border-2",
      "border-transparent",
      "shadow-sm",
      "transition-colors",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2",
      "focus-visible:ring-offset-background",
      "data-[state=checked]:bg-primary",
      "data-[state=unchecked]:bg-input"
    ]
  },
  {
    "id": "switch-thumb",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/switch.jsx",
      "line": 16,
      "exactSnippet": "\"pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0\""
    },
    "sourceSemanticRole": "switch sliding thumb visual and translation",
    "sourceClasses": [
      "pointer-events-none",
      "block",
      "h-4",
      "w-4",
      "rounded-full",
      "bg-background",
      "shadow-lg",
      "ring-0",
      "transition-transform",
      "data-[state=checked]:translate-x-4",
      "data-[state=unchecked]:translate-x-0"
    ]
  },
  {
    "id": "dialog-overlay",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dialog.jsx",
      "line": 21,
      "exactSnippet": "\"fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0\","
    },
    "sourceSemanticRole": "modal dialog backdrop overlay",
    "sourceClasses": [
      "fixed",
      "inset-0",
      "z-50",
      "bg-black/80"
    ]
  },
  {
    "id": "dialog-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dialog.jsx",
      "line": 34,
      "exactSnippet": "\"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200"
    },
    "sourceSemanticRole": "modal dialog content surface and animation",
    "sourceClasses": [
      "fixed",
      "z-50",
      "grid",
      "gap-4",
      "border",
      "bg-background",
      "p-6",
      "shadow-lg",
      "duration-200"
    ]
  },
  {
    "id": "popover-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/popover.jsx",
      "line": 19,
      "exactSnippet": "\"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
    },
    "sourceSemanticRole": "popover surface container visual",
    "sourceClasses": [
      "z-50",
      "w-72",
      "rounded-md",
      "border",
      "bg-popover",
      "p-4",
      "text-popover-foreground",
      "shadow-md",
      "outline-none"
    ]
  },
  {
    "id": "dropdown-menu-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dropdown-menu.jsx",
      "line": 53,
      "exactSnippet": "\"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md\","
    },
    "sourceSemanticRole": "dropdown menu surface container visual",
    "sourceClasses": [
      "z-50",
      "min-w-[8rem]",
      "overflow-hidden",
      "rounded-md",
      "border",
      "bg-popover",
      "p-1",
      "text-popover-foreground",
      "shadow-md"
    ]
  },
  {
    "id": "dropdown-menu-item",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dropdown-menu.jsx",
      "line": 66,
      "exactSnippet": "\"relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0\","
    },
    "sourceSemanticRole": "dropdown menu item row hover state",
    "sourceClasses": [
      "relative",
      "flex",
      "cursor-default",
      "select-none",
      "items-center",
      "gap-2",
      "rounded-sm",
      "px-2",
      "py-1.5",
      "text-sm",
      "outline-none",
      "transition-colors",
      "focus:bg-accent",
      "focus:text-accent-foreground"
    ]
  },
  {
    "id": "tooltip-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/tooltip.jsx",
      "line": 20,
      "exactSnippet": "\"z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95"
    },
    "sourceSemanticRole": "tooltip popover surface and typography",
    "sourceClasses": [
      "z-50",
      "overflow-hidden",
      "rounded-md",
      "bg-primary",
      "px-3",
      "py-1.5",
      "text-xs",
      "text-primary-foreground"
    ]
  },
  {
    "id": "tabs-list",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/tabs.jsx",
      "line": 12,
      "exactSnippet": "\"inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground\","
    },
    "sourceSemanticRole": "tabs container list visual",
    "sourceClasses": [
      "inline-flex",
      "h-9",
      "items-center",
      "justify-center",
      "rounded-lg",
      "bg-muted",
      "p-1",
      "text-muted-foreground"
    ]
  },
  {
    "id": "tabs-trigger",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/tabs.jsx",
      "line": 23,
      "exactSnippet": "\"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow\","
    },
    "sourceSemanticRole": "tabs active trigger tab visual",
    "sourceClasses": [
      "inline-flex",
      "items-center",
      "justify-center",
      "whitespace-nowrap",
      "rounded-md",
      "px-3",
      "py-1",
      "text-sm",
      "font-medium",
      "transition-all",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "data-[state=active]:bg-background",
      "data-[state=active]:text-foreground",
      "data-[state=active]:shadow"
    ]
  },
  {
    "id": "toggle-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toggle.jsx",
      "line": 12,
      "exactSnippet": "default: \"bg-transparent\","
    },
    "sourceSemanticRole": "toggle default transparent resting state",
    "sourceClasses": [
      "bg-transparent"
    ]
  },
  {
    "id": "toggle-outline",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toggle.jsx",
      "line": 14,
      "exactSnippet": "\"border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground\","
    },
    "sourceSemanticRole": "toggle outline variant visual and hover state",
    "sourceClasses": [
      "border",
      "border-input",
      "bg-transparent",
      "shadow-sm",
      "hover:bg-accent",
      "hover:text-accent-foreground"
    ]
  },
  {
    "id": "empty-state",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/collection/EmptyState.jsx",
      "line": 12,
      "exactSnippet": "<div className=\"p-6 rounded-full bg-primary/5 mb-6\">"
    },
    "sourceSemanticRole": "empty collection state visual icon and typography hierarchy",
    "sourceClasses": [
      "py-20",
      "text-center",
      "p-6",
      "rounded-full",
      "bg-primary/5",
      "w-12",
      "h-12",
      "text-primary/40",
      "font-heading",
      "text-xl",
      "font-semibold",
      "text-foreground",
      "text-muted-foreground",
      "font-body"
    ]
  },
  {
    "id": "dashboard-segmented-toggle",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/pages/Dashboard.jsx",
      "line": 134,
      "exactSnippet": "className={`px-3 py-1 rounded-md text-xs font-body font-medium transition-colors ${chartMode === key ? \"bg-card shadow text-foreground\" : \"text-muted-foreground hover:text-foreground\"}`}"
    },
    "sourceSemanticRole": "dashboard segmented view switch container and active item",
    "sourceClasses": [
      "flex",
      "items-center",
      "gap-1",
      "bg-muted",
      "p-1",
      "rounded-lg",
      "px-3",
      "py-1",
      "rounded-md",
      "text-xs",
      "font-medium",
      "transition-colors",
      "bg-card",
      "shadow",
      "text-foreground",
      "text-muted-foreground",
      "hover:text-foreground"
    ]
  },
  {
    "id": "flat-content-panel",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/card.jsx",
      "line": 8,
      "exactSnippet": "className={cn(\"rounded-xl border bg-card text-card-foreground shadow\", className)}"
    },
    "sourceSemanticRole": "standard card panel container visual",
    "sourceClasses": [
      "rounded-xl",
      "border",
      "bg-card",
      "text-card-foreground",
      "shadow"
    ]
  },
  {
    "id": "statcard-interactive-panel",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/collection/StatCard.jsx",
      "line": 9,
      "exactSnippet": "className=\"bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5\""
    },
    "sourceSemanticRole": "stat card interactive container with hover border and shadow",
    "sourceClasses": [
      "bg-card",
      "rounded-2xl",
      "p-6",
      "border",
      "border-border/50",
      "hover:border-primary/30",
      "transition-all",
      "duration-300",
      "hover:shadow-lg",
      "hover:shadow-primary/5"
    ]
  },
  {
    "id": "itemcard-interactive-card",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/collection/ItemCard.jsx",
      "line": 35,
      "exactSnippet": "className=\"group bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1\""
    },
    "sourceSemanticRole": "item card tactile container with hover border, shadow, and lift",
    "sourceClasses": [
      "group",
      "bg-card",
      "rounded-2xl",
      "border",
      "border-border/50",
      "overflow-hidden",
      "cursor-pointer",
      "hover:border-primary/40",
      "transition-all",
      "duration-300",
      "hover:shadow-xl",
      "hover:shadow-primary/5",
      "hover:-translate-y-1"
    ]
  },
  {
    "id": "sidebar-active-navigation",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/layout/Sidebar.jsx",
      "line": 36,
      "exactSnippet": "className=\"absolute inset-0 bg-primary/10 rounded-xl\""
    },
    "sourceSemanticRole": "sidebar navigation active background wash and text highlight",
    "sourceClasses": [
      "absolute",
      "inset-0",
      "bg-primary/10",
      "rounded-xl",
      "text-primary",
      "font-medium",
      "text-muted-foreground",
      "hover:text-foreground"
    ]
  },
  {
    "id": "dashboard-quick-link",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/pages/Dashboard.jsx",
      "line": 221,
      "exactSnippet": "className=\"bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center justify-between hover:border-primary/30 transition-all\""
    },
    "sourceSemanticRole": "dashboard quick action link card gradient and hover border",
    "sourceClasses": [
      "bg-gradient-to-br",
      "from-primary/10",
      "to-primary/5",
      "rounded-2xl",
      "p-6",
      "border",
      "border-primary/10",
      "hover:border-primary/30",
      "transition-all"
    ]
  }
];

// Backward-compatible alias
export const NUMIS_REFERENCE_STATUS_RECIPES = NUMIS_REFERENCE_RECIPES;

// 8. Active Yueora Authorized Visual Recipes
// Every active recipe must reference a verified frozen source, have >= 1 approved owner,
// and EVERY owner path must physically exist in the current Yueora HEAD (fs.existsSync).
// Speculative future visual permissions for nonexistent files are strictly forbidden (fail closed).
export const YUEORA_AUTHORIZED_RECIPES = [
  {
    "id": "toast-destructive-close",
    "sourceReferenceId": "toast-destructive-close",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toast.jsx",
      "line": 67,
      "exactSnippet": "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
    },
    "sourceSemanticRole": "destructive toast close button hover & focus states",
    "approvedYueoraRole": "destructive toast close button interactive states",
    "sourceClasses": [
      "text-red-300",
      "hover:text-red-50",
      "focus:ring-red-400",
      "focus:ring-offset-red-600"
    ],
    "yueoraClasses": [
      "text-red-300",
      "hover:text-red-50",
      "focus:ring-red-400",
      "focus:ring-offset-red-600"
    ],
    "allowedOwners": [
      "src/components/ui/toast.jsx"
    ],
    "approvedYueoraRoles": [
      "destructive-toast-close"
    ],
    "mappingType": "exact",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "ToastClose",
      "target": "ToastPrimitives.Close",
      "prefixFilter": "group-[.destructive]:",
      "stripPrefix": true
    }
  },
  {
    "id": "badge-default",
    "sourceReferenceId": "badge-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 12,
      "exactSnippet": "\"border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80\","
    },
    "sourceSemanticRole": "default badge primary visual",
    "approvedYueoraRole": "default / brand / success status badge visual",
    "sourceClasses": [
      "border-transparent",
      "bg-primary",
      "text-primary-foreground",
      "shadow",
      "hover:bg-primary/80"
    ],
    "yueoraClasses": [
      "border-transparent",
      "bg-brand",
      "text-brand-foreground",
      "shadow",
      "hover:bg-brand/80"
    ],
    "allowedOwners": [
      "src/components/ui/badge.jsx",
      "src/components/patterns/StatusIndicator.jsx",
      "src/components/patterns/CountBadge.jsx"
    ],
    "approvedYueoraRoles": [
      "default",
      "brand",
      "success",
      "practice",
      "attention"
    ],
    "mappingType": "semantic-alias",
    "ownerUnits": {
      "src/components/ui/badge.jsx": {
        "type": "cva-variant",
        "variable": "badgeVariants",
        "variantGroup": "variant",
        "key": "default"
      },
      "src/components/patterns/StatusIndicator.jsx": {
        "type": "object-property",
        "variable": "toneStyles",
        "key": "brand"
      },
      "src/components/patterns/CountBadge.jsx": {
        "type": "cva-variant",
        "variable": "countBadgeVariants",
        "variantGroup": "tone",
        "key": "attention"
      }
    }
  },
  {
    "id": "badge-secondary",
    "sourceReferenceId": "badge-secondary",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 14,
      "exactSnippet": "\"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80\","
    },
    "sourceSemanticRole": "secondary badge visual",
    "approvedYueoraRole": "secondary / neutral / warning / informational status badge visual",
    "sourceClasses": [
      "border-transparent",
      "bg-secondary",
      "text-secondary-foreground",
      "hover:bg-secondary/80"
    ],
    "yueoraClasses": [
      "border-transparent",
      "bg-secondary",
      "text-secondary-foreground",
      "hover:bg-secondary/80"
    ],
    "allowedOwners": [
      "src/components/ui/badge.jsx",
      "src/components/patterns/StatusIndicator.jsx",
      "src/components/patterns/CountBadge.jsx"
    ],
    "approvedYueoraRoles": [
      "secondary",
      "neutral",
      "warning",
      "informational"
    ],
    "mappingType": "semantic-alias",
    "ownerUnits": {
      "src/components/ui/badge.jsx": {
        "type": "cva-variant",
        "variable": "badgeVariants",
        "variantGroup": "variant",
        "key": "secondary"
      },
      "src/components/patterns/StatusIndicator.jsx": {
        "type": "object-property",
        "variable": "toneStyles",
        "key": "neutral"
      },
      "src/components/patterns/CountBadge.jsx": {
        "type": "cva-variant",
        "variable": "countBadgeVariants",
        "variantGroup": "tone",
        "key": "informational"
      }
    }
  },
  {
    "id": "badge-destructive",
    "sourceReferenceId": "badge-destructive",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 16,
      "exactSnippet": "\"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80\","
    },
    "sourceSemanticRole": "destructive badge visual",
    "approvedYueoraRole": "destructive / danger status badge visual",
    "sourceClasses": [
      "border-transparent",
      "bg-destructive",
      "text-destructive-foreground",
      "shadow",
      "hover:bg-destructive/80"
    ],
    "yueoraClasses": [
      "border-transparent",
      "bg-danger",
      "text-danger-foreground",
      "shadow",
      "hover:bg-danger/80"
    ],
    "allowedOwners": [
      "src/components/ui/badge.jsx",
      "src/components/patterns/StatusIndicator.jsx",
      "src/components/patterns/CountBadge.jsx"
    ],
    "approvedYueoraRoles": [
      "destructive",
      "danger"
    ],
    "mappingType": "semantic-alias",
    "ownerUnits": {
      "src/components/ui/badge.jsx": {
        "type": "cva-variant",
        "variable": "badgeVariants",
        "variantGroup": "variant",
        "key": "destructive"
      },
      "src/components/patterns/StatusIndicator.jsx": {
        "type": "object-property",
        "variable": "toneStyles",
        "key": "danger"
      },
      "src/components/patterns/CountBadge.jsx": {
        "type": "cva-variant",
        "variable": "countBadgeVariants",
        "variantGroup": "tone",
        "key": "danger"
      }
    }
  },
  {
    "id": "badge-outline",
    "sourceReferenceId": "badge-outline",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/badge.jsx",
      "line": 17,
      "exactSnippet": "outline: \"text-foreground\","
    },
    "sourceSemanticRole": "outline badge visual",
    "approvedYueoraRole": "outline status badge visual",
    "sourceClasses": [
      "text-foreground"
    ],
    "yueoraClasses": [
      "border-line-subtle",
      "text-ink-primary"
    ],
    "allowedOwners": [
      "src/components/ui/badge.jsx"
    ],
    "approvedYueoraRoles": [
      "outline"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "badgeVariants",
      "variantGroup": "variant",
      "key": "outline"
    }
  },
  {
    "id": "toast-destructive",
    "sourceReferenceId": "toast-destructive",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toast.jsx",
      "line": 31,
      "exactSnippet": "\"destructive group border-destructive bg-destructive text-destructive-foreground\","
    },
    "sourceSemanticRole": "destructive toast container visual",
    "approvedYueoraRole": "destructive toast container visual",
    "sourceClasses": [
      "destructive",
      "group",
      "border-destructive",
      "bg-destructive",
      "text-destructive-foreground"
    ],
    "yueoraClasses": [
      "destructive",
      "group",
      "border-danger",
      "bg-danger",
      "text-danger-foreground"
    ],
    "allowedOwners": [
      "src/components/ui/toast.jsx"
    ],
    "approvedYueoraRoles": [
      "destructive-toast"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "toastVariants",
      "variantGroup": "variant",
      "key": "destructive"
    }
  },
  {
    "id": "toast-action",
    "sourceReferenceId": "toast-action",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toast.jsx",
      "line": 55,
      "exactSnippet": "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"
    },
    "sourceSemanticRole": "destructive toast action button interactive styling",
    "approvedYueoraRole": "destructive toast action button interactive styling",
    "sourceClasses": [
      "group-[.destructive]:border-muted/40",
      "group-[.destructive]:hover:border-destructive/30",
      "group-[.destructive]:hover:bg-destructive",
      "group-[.destructive]:hover:text-destructive-foreground",
      "group-[.destructive]:focus:ring-destructive"
    ],
    "yueoraClasses": [
      "group-[.destructive]:border-neutral-muted/40",
      "group-[.destructive]:hover:border-danger/30",
      "group-[.destructive]:hover:bg-danger",
      "group-[.destructive]:hover:text-danger-foreground",
      "group-[.destructive]:focus:ring-danger"
    ],
    "allowedOwners": [
      "src/components/ui/toast.jsx"
    ],
    "approvedYueoraRoles": [
      "destructive-toast-action"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "ToastAction",
      "target": "ToastPrimitives.Action",
      "prefixFilter": "group-[.destructive]:",
      "stripPrefix": false
    }
  },
  {
    "id": "button-default",
    "sourceReferenceId": "button-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 13,
      "exactSnippet": "\"bg-primary text-primary-foreground shadow hover:bg-primary/90\","
    },
    "sourceSemanticRole": "default primary button visual and hover state",
    "approvedYueoraRole": "Button intent=\"primary\"",
    "sourceClasses": [
      "bg-primary",
      "text-primary-foreground",
      "shadow",
      "hover:bg-primary/90"
    ],
    "yueoraClasses": [
      "bg-brand",
      "text-brand-foreground",
      "shadow",
      "hover:bg-brand/90"
    ],
    "allowedOwners": [
      "src/components/ui/button.jsx"
    ],
    "approvedYueoraRoles": [
      "primary"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "buttonVariants",
      "variantGroup": "intent",
      "key": "primary"
    }
  },
  {
    "id": "button-destructive",
    "sourceReferenceId": "button-destructive",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 15,
      "exactSnippet": "\"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90\","
    },
    "sourceSemanticRole": "destructive button visual and hover state",
    "approvedYueoraRole": "Button intent=\"danger\"",
    "sourceClasses": [
      "bg-destructive",
      "text-destructive-foreground",
      "shadow-sm",
      "hover:bg-destructive/90"
    ],
    "yueoraClasses": [
      "bg-danger",
      "text-danger-foreground",
      "shadow-control",
      "hover:bg-danger/90"
    ],
    "allowedOwners": [
      "src/components/ui/button.jsx"
    ],
    "approvedYueoraRoles": [
      "danger"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "buttonVariants",
      "variantGroup": "intent",
      "key": "danger"
    }
  },
  {
    "id": "button-outline",
    "sourceReferenceId": "button-outline",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 17,
      "exactSnippet": "\"border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground\","
    },
    "sourceSemanticRole": "outline button visual and hover state",
    "approvedYueoraRole": "Button intent=\"secondary\"",
    "sourceClasses": [
      "border",
      "border-input",
      "bg-transparent",
      "shadow-sm",
      "hover:bg-accent",
      "hover:text-accent-foreground"
    ],
    "yueoraClasses": [
      "border",
      "border-line-subtle",
      "bg-transparent",
      "text-ink-primary",
      "shadow-control",
      "hover:bg-brand-soft",
      "hover:text-brand-soft-foreground"
    ],
    "allowedOwners": [
      "src/components/ui/button.jsx"
    ],
    "approvedYueoraRoles": [
      "secondary"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "buttonVariants",
      "variantGroup": "intent",
      "key": "secondary"
    }
  },
  {
    "id": "button-secondary",
    "sourceReferenceId": "button-secondary",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 19,
      "exactSnippet": "\"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80\","
    },
    "sourceSemanticRole": "secondary button visual and hover state",
    "approvedYueoraRole": "Button intent=\"subtle\"",
    "sourceClasses": [
      "bg-secondary",
      "text-secondary-foreground",
      "shadow-sm",
      "hover:bg-secondary/80"
    ],
    "yueoraClasses": [
      "bg-secondary",
      "text-secondary-foreground",
      "shadow-control",
      "hover:bg-secondary/80"
    ],
    "allowedOwners": [
      "src/components/ui/button.jsx"
    ],
    "approvedYueoraRoles": [
      "subtle"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "buttonVariants",
      "variantGroup": "intent",
      "key": "subtle"
    }
  },
  {
    "id": "button-ghost",
    "sourceReferenceId": "button-ghost",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 20,
      "exactSnippet": "ghost: \"hover:bg-accent hover:text-accent-foreground\","
    },
    "sourceSemanticRole": "ghost quiet button hover state",
    "approvedYueoraRole": "Button intent=\"quiet\"",
    "sourceClasses": [
      "hover:bg-accent",
      "hover:text-accent-foreground"
    ],
    "yueoraClasses": [
      "hover:bg-brand-soft",
      "hover:text-brand-soft-foreground"
    ],
    "allowedOwners": [
      "src/components/ui/button.jsx"
    ],
    "approvedYueoraRoles": [
      "quiet"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "buttonVariants",
      "variantGroup": "intent",
      "key": "quiet"
    }
  },
  {
    "id": "button-link",
    "sourceReferenceId": "button-link",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 21,
      "exactSnippet": "link: \"text-primary underline-offset-4 hover:underline\","
    },
    "sourceSemanticRole": "link button visual and hover state",
    "approvedYueoraRole": "Button intent=\"link\"",
    "sourceClasses": [
      "text-primary",
      "underline-offset-4",
      "hover:underline"
    ],
    "yueoraClasses": [
      "text-brand",
      "underline-offset-4",
      "hover:underline"
    ],
    "allowedOwners": [
      "src/components/ui/button.jsx"
    ],
    "approvedYueoraRoles": [
      "link"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "buttonVariants",
      "variantGroup": "intent",
      "key": "link"
    }
  },
  {
    "id": "button-size-icon",
    "sourceReferenceId": "button-size-icon",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/button.jsx",
      "line": 27,
      "exactSnippet": "icon: \"h-9 w-9\","
    },
    "sourceSemanticRole": "icon button dimensions",
    "approvedYueoraRole": "IconButton size=\"md\"",
    "sourceClasses": [
      "h-9",
      "w-9"
    ],
    "yueoraClasses": [
      "h-control-md",
      "w-control-md"
    ],
    "allowedOwners": [
      "src/components/ui/icon-button.jsx"
    ],
    "approvedYueoraRoles": [
      "icon-md"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "iconButtonVariants",
      "variantGroup": "size",
      "key": "md"
    }
  },
  {
    "id": "input-default",
    "sourceReferenceId": "input-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/input.jsx",
      "line": 10,
      "exactSnippet": "\"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm\","
    },
    "sourceSemanticRole": "text input control visual and focus state",
    "approvedYueoraRole": "Input default control",
    "sourceClasses": [
      "flex",
      "h-9",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-transparent",
      "px-3",
      "py-1",
      "shadow-sm",
      "placeholder:text-muted-foreground",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "transition-colors",
      "file:border-0",
      "file:bg-transparent",
      "file:text-foreground",
      "disabled:opacity-50"
    ],
    "yueoraClasses": [
      "flex",
      "h-control-md",
      "w-full",
      "rounded-control",
      "border",
      "border-line-subtle",
      "bg-transparent",
      "px-3",
      "py-1",
      "shadow-control",
      "placeholder:text-ink-tertiary",
      "focus-visible:ring-1",
      "focus-visible:ring-brand",
      "text-ink-primary",
      "transition-colors",
      "file:border-0",
      "file:bg-transparent",
      "disabled:opacity-50"
    ],
    "allowedOwners": [
      "src/components/ui/input.jsx"
    ],
    "approvedYueoraRoles": [
      "default"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "Input",
      "target": "input",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "select-trigger",
    "sourceReferenceId": "select-trigger",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/select.jsx",
      "line": 19,
      "exactSnippet": "\"flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1\","
    },
    "sourceSemanticRole": "select trigger control visual and focus state",
    "approvedYueoraRole": "SelectTrigger control",
    "sourceClasses": [
      "flex",
      "h-9",
      "w-full",
      "items-center",
      "justify-between",
      "rounded-md",
      "border",
      "border-input",
      "bg-transparent",
      "px-3",
      "py-2",
      "shadow-sm",
      "data-[placeholder]:text-muted-foreground",
      "focus:ring-1",
      "focus:ring-ring",
      "disabled:opacity-50"
    ],
    "yueoraClasses": [
      "flex",
      "h-control-md",
      "w-full",
      "items-center",
      "justify-between",
      "rounded-control",
      "border",
      "border-line-subtle",
      "bg-transparent",
      "px-3",
      "py-1.5",
      "shadow-control",
      "data-[placeholder]:text-ink-tertiary",
      "focus:ring-1",
      "focus:ring-brand",
      "text-ink-primary",
      "disabled:opacity-50",
      "transition-colors"
    ],
    "allowedOwners": [
      "src/components/ui/select.jsx"
    ],
    "approvedYueoraRoles": [
      "trigger"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "SelectTrigger",
      "target": "SelectPrimitive.Trigger",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "select-content",
    "sourceReferenceId": "select-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/select.jsx",
      "line": 57,
      "exactSnippet": "\"relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
    },
    "sourceSemanticRole": "select dropdown menu popover container visual",
    "approvedYueoraRole": "SelectContent container",
    "sourceClasses": [
      "relative",
      "z-50",
      "max-h-96",
      "min-w-[8rem]",
      "overflow-hidden",
      "rounded-md",
      "border",
      "bg-popover",
      "text-popover-foreground",
      "shadow-md"
    ],
    "yueoraClasses": [
      "relative",
      "z-50",
      "max-h-96",
      "min-w-[8rem]",
      "overflow-hidden",
      "rounded-menu",
      "border",
      "border-line-subtle/50",
      "bg-surface-panel",
      "text-ink-primary",
      "shadow-md"
    ],
    "allowedOwners": [
      "src/components/ui/select.jsx"
    ],
    "approvedYueoraRoles": [
      "content"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "SelectContent",
      "target": "SelectPrimitive.Content",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "select-item",
    "sourceReferenceId": "select-item",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/select.jsx",
      "line": 88,
      "exactSnippet": "\"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50\","
    },
    "sourceSemanticRole": "select item row hover and focus state",
    "approvedYueoraRole": "SelectItem item row",
    "sourceClasses": [
      "relative",
      "flex",
      "w-full",
      "cursor-default",
      "select-none",
      "items-center",
      "rounded-sm",
      "py-1.5",
      "pl-2",
      "pr-8",
      "outline-none",
      "focus:bg-accent",
      "focus:text-accent-foreground",
      "data-[disabled]:opacity-50"
    ],
    "yueoraClasses": [
      "relative",
      "flex",
      "w-full",
      "cursor-default",
      "select-none",
      "items-center",
      "rounded-control",
      "py-1.5",
      "pl-2",
      "pr-8",
      "outline-none",
      "focus:bg-brand-soft",
      "focus:text-brand-soft-foreground",
      "text-ink-primary",
      "transition-colors",
      "data-[disabled]:opacity-50"
    ],
    "allowedOwners": [
      "src/components/ui/select.jsx"
    ],
    "approvedYueoraRoles": [
      "item"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "SelectItem",
      "target": "SelectPrimitive.Item",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "checkbox-default",
    "sourceReferenceId": "checkbox-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/checkbox.jsx",
      "line": 11,
      "exactSnippet": "\"peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground\","
    },
    "sourceSemanticRole": "checkbox control visual and checked state",
    "approvedYueoraRole": "Checkbox control",
    "sourceClasses": [
      "peer",
      "h-4",
      "w-4",
      "shrink-0",
      "rounded-sm",
      "border",
      "border-primary",
      "shadow",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "disabled:opacity-50",
      "data-[state=checked]:bg-primary",
      "data-[state=checked]:text-primary-foreground"
    ],
    "yueoraClasses": [
      "peer",
      "h-4",
      "w-4",
      "shrink-0",
      "rounded-sm",
      "border",
      "border-brand",
      "shadow",
      "focus-visible:ring-1",
      "focus-visible:ring-brand",
      "disabled:opacity-50",
      "transition-colors",
      "data-[state=checked]:border-brand",
      "data-[state=checked]:bg-brand",
      "data-[state=checked]:text-brand-foreground"
    ],
    "allowedOwners": [
      "src/components/ui/checkbox.jsx"
    ],
    "approvedYueoraRoles": [
      "default"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "Checkbox",
      "target": "CheckboxPrimitive.Root",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "radio-item",
    "sourceReferenceId": "radio-item",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/radio-group.jsx",
      "line": 17,
      "exactSnippet": "\"aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50\","
    },
    "sourceSemanticRole": "radio item control visual and focus state",
    "approvedYueoraRole": "RadioGroupItem control",
    "sourceClasses": [
      "aspect-square",
      "h-4",
      "w-4",
      "rounded-full",
      "border",
      "border-primary",
      "text-primary",
      "shadow",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "disabled:opacity-50"
    ],
    "yueoraClasses": [
      "aspect-square",
      "h-4",
      "w-4",
      "rounded-full",
      "border",
      "border-brand",
      "text-brand",
      "shadow",
      "focus-visible:ring-1",
      "focus-visible:ring-brand",
      "disabled:opacity-50"
    ],
    "allowedOwners": [
      "src/components/ui/radio-group.jsx"
    ],
    "approvedYueoraRoles": [
      "item"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "RadioGroupItem",
      "target": "RadioGroupPrimitive.Item",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "switch-root",
    "sourceReferenceId": "switch-root",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/switch.jsx",
      "line": 9,
      "exactSnippet": "\"peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input\","
    },
    "sourceSemanticRole": "switch track root visual and checked/unchecked state",
    "approvedYueoraRole": "Switch track root",
    "sourceClasses": [
      "peer",
      "inline-flex",
      "h-5",
      "w-9",
      "shrink-0",
      "cursor-pointer",
      "items-center",
      "rounded-full",
      "border-2",
      "border-transparent",
      "shadow-sm",
      "transition-colors",
      "disabled:opacity-50",
      "data-[state=checked]:bg-primary",
      "data-[state=unchecked]:bg-input"
    ],
    "yueoraClasses": [
      "peer",
      "inline-flex",
      "h-5",
      "w-9",
      "shrink-0",
      "cursor-pointer",
      "items-center",
      "rounded-full",
      "border-2",
      "border-transparent",
      "shadow-sm",
      "transition-colors",
      "disabled:opacity-50",
      "data-[state=checked]:bg-brand",
      "data-[state=unchecked]:bg-input",
      "focus-visible:ring-2",
      "focus-visible:ring-brand"
    ],
    "allowedOwners": [
      "src/components/ui/switch.jsx"
    ],
    "approvedYueoraRoles": [
      "root"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "Switch",
      "target": "SwitchPrimitives.Root",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "switch-thumb",
    "sourceReferenceId": "switch-thumb",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/switch.jsx",
      "line": 16,
      "exactSnippet": "\"pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0\""
    },
    "sourceSemanticRole": "switch sliding thumb visual and translation",
    "approvedYueoraRole": "Switch sliding thumb",
    "sourceClasses": [
      "pointer-events-none",
      "block",
      "h-4",
      "w-4",
      "rounded-full",
      "bg-background",
      "shadow-lg",
      "ring-0",
      "transition-transform",
      "data-[state=checked]:translate-x-4",
      "data-[state=unchecked]:translate-x-0"
    ],
    "yueoraClasses": [
      "pointer-events-none",
      "block",
      "h-4",
      "w-4",
      "rounded-full",
      "bg-surface-canvas",
      "shadow-lg",
      "ring-0",
      "transition-transform",
      "data-[state=checked]:translate-x-4",
      "data-[state=unchecked]:translate-x-0"
    ],
    "allowedOwners": [
      "src/components/ui/switch.jsx"
    ],
    "approvedYueoraRoles": [
      "thumb"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "Switch",
      "target": "SwitchPrimitives.Thumb",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "dialog-overlay",
    "sourceReferenceId": "dialog-overlay",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dialog.jsx",
      "line": 21,
      "exactSnippet": "\"fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0\","
    },
    "sourceSemanticRole": "modal dialog backdrop overlay",
    "approvedYueoraRole": "DialogOverlay backdrop",
    "sourceClasses": [
      "fixed",
      "inset-0",
      "z-50",
      "bg-black/80"
    ],
    "yueoraClasses": [
      "fixed",
      "inset-0",
      "z-50",
      "bg-black/80"
    ],
    "allowedOwners": [
      "src/components/ui/dialog.jsx"
    ],
    "approvedYueoraRoles": [
      "overlay"
    ],
    "mappingType": "exact",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "DialogOverlay",
      "target": "DialogPrimitive.Overlay",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "dialog-content",
    "sourceReferenceId": "dialog-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dialog.jsx",
      "line": 34,
      "exactSnippet": "\"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200"
    },
    "sourceSemanticRole": "modal dialog content surface and animation",
    "approvedYueoraRole": "DialogContent modal surface",
    "sourceClasses": [
      "fixed",
      "left-[50%]",
      "top-[50%]",
      "z-50",
      "grid",
      "w-full",
      "max-w-lg",
      "translate-x-[-50%]",
      "translate-y-[-50%]",
      "gap-4",
      "border",
      "bg-background",
      "p-6",
      "shadow-lg",
      "duration-200"
    ],
    "yueoraClasses": [
      "fixed",
      "left-[50%]",
      "top-[50%]",
      "z-50",
      "grid",
      "w-full",
      "max-w-lg",
      "translate-x-[-50%]",
      "translate-y-[-50%]",
      "gap-4",
      "border",
      "border-line-subtle",
      "bg-surface-canvas",
      "p-6",
      "shadow-lg",
      "duration-200",
      "sm:rounded-dialog"
    ],
    "allowedOwners": [
      "src/components/ui/dialog.jsx"
    ],
    "approvedYueoraRoles": [
      "content"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "DialogContent",
      "target": "DialogPrimitive.Content",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "popover-content",
    "sourceReferenceId": "popover-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/popover.jsx",
      "line": 19,
      "exactSnippet": "\"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
    },
    "sourceSemanticRole": "popover surface container visual",
    "approvedYueoraRole": "PopoverContent container",
    "sourceClasses": [
      "z-50",
      "w-72",
      "rounded-md",
      "border",
      "bg-popover",
      "p-4",
      "text-popover-foreground",
      "shadow-md"
    ],
    "yueoraClasses": [
      "z-50",
      "w-72",
      "rounded-md",
      "border",
      "border-line-subtle",
      "bg-surface-raised",
      "p-4",
      "text-ink-primary",
      "shadow-md"
    ],
    "allowedOwners": [
      "src/components/ui/popover.jsx"
    ],
    "approvedYueoraRoles": [
      "content"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "PopoverContent",
      "target": "PopoverPrimitive.Content",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "dropdown-menu-content",
    "sourceReferenceId": "dropdown-menu-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dropdown-menu.jsx",
      "line": 53,
      "exactSnippet": "\"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md\","
    },
    "sourceSemanticRole": "dropdown menu surface container visual",
    "approvedYueoraRole": "DropdownMenuContent container",
    "sourceClasses": [
      "z-50",
      "min-w-[8rem]",
      "overflow-hidden",
      "rounded-md",
      "border",
      "bg-popover",
      "p-1",
      "text-popover-foreground",
      "shadow-md"
    ],
    "yueoraClasses": [
      "z-50",
      "min-w-[8rem]",
      "overflow-hidden",
      "rounded-menu",
      "border",
      "border-line-subtle/50",
      "bg-surface-panel",
      "p-1",
      "text-ink-primary",
      "shadow-md"
    ],
    "allowedOwners": [
      "src/components/ui/dropdown-menu.jsx"
    ],
    "approvedYueoraRoles": [
      "content"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "DropdownMenuContent",
      "target": "DropdownMenuPrimitive.Content",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "dropdown-menu-item",
    "sourceReferenceId": "dropdown-menu-item",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/dropdown-menu.jsx",
      "line": 66,
      "exactSnippet": "\"relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0\","
    },
    "sourceSemanticRole": "dropdown menu item row hover state",
    "approvedYueoraRole": "DropdownMenuItem item row",
    "sourceClasses": [
      "relative",
      "flex",
      "cursor-default",
      "select-none",
      "items-center",
      "gap-2",
      "rounded-sm",
      "px-2",
      "py-1.5",
      "text-sm",
      "outline-none",
      "transition-colors",
      "focus:bg-accent",
      "focus:text-accent-foreground",
      "data-[disabled]:opacity-50"
    ],
    "yueoraClasses": [
      "relative",
      "flex",
      "cursor-default",
      "select-none",
      "items-center",
      "gap-2",
      "rounded-sm",
      "px-2",
      "py-1.5",
      "type-body-small",
      "text-ink-primary",
      "outline-none",
      "transition-colors",
      "focus:bg-brand-soft",
      "focus:text-brand-soft-foreground",
      "data-[disabled]:opacity-50"
    ],
    "allowedOwners": [
      "src/components/ui/dropdown-menu.jsx"
    ],
    "approvedYueoraRoles": [
      "item"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "DropdownMenuItem",
      "target": "DropdownMenuPrimitive.Item",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "tooltip-content",
    "sourceReferenceId": "tooltip-content",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/tooltip.jsx",
      "line": 20,
      "exactSnippet": "\"z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95"
    },
    "sourceSemanticRole": "tooltip popover surface and typography",
    "approvedYueoraRole": "TooltipContent popover",
    "sourceClasses": [
      "z-50",
      "overflow-hidden",
      "rounded-md",
      "bg-primary",
      "px-3",
      "py-1.5",
      "text-xs",
      "text-primary-foreground"
    ],
    "yueoraClasses": [
      "z-50",
      "overflow-hidden",
      "rounded-md",
      "bg-brand",
      "px-3",
      "py-1.5",
      "text-xs",
      "text-brand-foreground"
    ],
    "allowedOwners": [
      "src/components/ui/tooltip.jsx"
    ],
    "approvedYueoraRoles": [
      "content"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "TooltipContent",
      "target": "TooltipPrimitive.Content",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "tabs-list",
    "sourceReferenceId": "tabs-list",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/tabs.jsx",
      "line": 12,
      "exactSnippet": "\"inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground\","
    },
    "sourceSemanticRole": "tabs container list visual",
    "approvedYueoraRole": "TabsList container",
    "sourceClasses": [
      "inline-flex",
      "h-9",
      "items-center",
      "justify-center",
      "rounded-lg",
      "bg-muted",
      "p-1",
      "text-muted-foreground"
    ],
    "yueoraClasses": [
      "inline-flex",
      "h-9",
      "items-center",
      "justify-center",
      "rounded-nav",
      "bg-neutral-muted",
      "p-1",
      "text-ink-tertiary"
    ],
    "allowedOwners": [
      "src/components/ui/tabs.jsx"
    ],
    "approvedYueoraRoles": [
      "list"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "TabsList",
      "target": "TabsPrimitive.List",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "tabs-trigger",
    "sourceReferenceId": "tabs-trigger",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/tabs.jsx",
      "line": 23,
      "exactSnippet": "\"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow\","
    },
    "sourceSemanticRole": "tabs active trigger tab visual",
    "approvedYueoraRole": "TabsTrigger item",
    "sourceClasses": [
      "inline-flex",
      "items-center",
      "justify-center",
      "whitespace-nowrap",
      "rounded-md",
      "px-3",
      "py-1",
      "text-sm",
      "font-medium",
      "transition-all",
      "disabled:opacity-50",
      "data-[state=active]:bg-background",
      "data-[state=active]:text-foreground",
      "data-[state=active]:shadow"
    ],
    "yueoraClasses": [
      "inline-flex",
      "items-center",
      "justify-center",
      "whitespace-nowrap",
      "rounded-control",
      "px-3",
      "py-1",
      "type-body-small",
      "font-medium",
      "text-ink-tertiary",
      "transition-all",
      "disabled:opacity-50",
      "data-[state=active]:bg-surface-canvas",
      "data-[state=active]:text-ink-primary",
      "data-[state=active]:shadow",
      "focus-visible:ring-2",
      "focus-visible:ring-ring"
    ],
    "allowedOwners": [
      "src/components/ui/tabs.jsx"
    ],
    "approvedYueoraRoles": [
      "trigger"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "TabsTrigger",
      "target": "TabsPrimitive.Trigger",
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "toggle-default",
    "sourceReferenceId": "toggle-default",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toggle.jsx",
      "line": 12,
      "exactSnippet": "default: \"bg-transparent\","
    },
    "sourceSemanticRole": "toggle default transparent resting state",
    "approvedYueoraRole": "Toggle default resting state",
    "sourceClasses": [
      "bg-transparent"
    ],
    "yueoraClasses": [
      "bg-transparent"
    ],
    "allowedOwners": [
      "src/components/ui/toggle.jsx"
    ],
    "approvedYueoraRoles": [
      "default"
    ],
    "mappingType": "exact",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "toggleVariants",
      "variantGroup": "variant",
      "key": "default"
    }
  },
  {
    "id": "toggle-outline",
    "sourceReferenceId": "toggle-outline",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/toggle.jsx",
      "line": 14,
      "exactSnippet": "\"border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground\","
    },
    "sourceSemanticRole": "toggle outline variant visual and hover state",
    "approvedYueoraRole": "Toggle outline variant",
    "sourceClasses": [
      "border",
      "border-input",
      "bg-transparent",
      "shadow-sm",
      "hover:bg-accent",
      "hover:text-accent-foreground"
    ],
    "yueoraClasses": [
      "border",
      "border-line-subtle",
      "bg-transparent",
      "shadow-control",
      "hover:bg-brand-soft",
      "hover:text-brand-soft-foreground"
    ],
    "allowedOwners": [
      "src/components/ui/toggle.jsx"
    ],
    "approvedYueoraRoles": [
      "outline"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "cva-variant",
      "variable": "toggleVariants",
      "variantGroup": "variant",
      "key": "outline"
    }
  },
  {
    "id": "empty-state",
    "sourceReferenceId": "empty-state",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/collection/EmptyState.jsx",
      "line": 12,
      "exactSnippet": "<div className=\"p-6 rounded-full bg-primary/5 mb-6\">"
    },
    "sourceSemanticRole": "empty collection state visual icon and typography hierarchy",
    "approvedYueoraRole": "EmptyState pattern component",
    "sourceClasses": [
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "py-20",
      "text-center",
      "p-6",
      "rounded-full",
      "bg-primary/5",
      "w-12",
      "h-12",
      "text-primary/40",
      "font-heading",
      "text-xl",
      "font-semibold",
      "text-foreground",
      "text-muted-foreground",
      "font-body"
    ],
    "yueoraClasses": [
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "py-20",
      "text-center",
      "bg-brand/5",
      "text-brand/40",
      "font-heading",
      "text-xl",
      "font-semibold",
      "text-ink-primary",
      "type-body",
      "text-ink-tertiary"
    ],
    "allowedOwners": [
      "src/components/patterns/EmptyState.jsx"
    ],
    "approvedYueoraRoles": [
      "empty-state"
    ],
    "mappingType": "structural-adaptation",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "EmptyState"
    }
  },
  {
    "id": "dashboard-segmented-toggle",
    "sourceReferenceId": "dashboard-segmented-toggle",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/pages/Dashboard.jsx",
      "line": 134,
      "exactSnippet": "className={`px-3 py-1 rounded-md text-xs font-body font-medium transition-colors ${chartMode === key ? \"bg-card shadow text-foreground\" : \"text-muted-foreground hover:text-foreground\"}`}"
    },
    "sourceSemanticRole": "dashboard segmented view switch container and active item",
    "approvedYueoraRole": "SegmentedControl pattern component",
    "sourceClasses": [
      "flex",
      "items-center",
      "gap-1",
      "bg-muted",
      "p-1",
      "rounded-lg",
      "px-3",
      "py-1",
      "rounded-md",
      "text-xs",
      "font-medium",
      "transition-colors",
      "disabled:opacity-50",
      "bg-card",
      "shadow",
      "text-foreground",
      "text-muted-foreground",
      "hover:text-foreground"
    ],
    "yueoraClasses": [
      "inline-flex",
      "items-center",
      "gap-1",
      "rounded-overlay",
      "bg-neutral-muted",
      "p-1",
      "rounded-control",
      "px-3",
      "py-1",
      "text-xs",
      "font-medium",
      "transition-colors",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "disabled:opacity-50",
      "bg-surface-panel",
      "shadow",
      "text-ink-primary",
      "text-ink-tertiary",
      "hover:text-ink-primary"
    ],
    "allowedOwners": [
      "src/components/patterns/SegmentedControl.jsx"
    ],
    "approvedYueoraRoles": [
      "segmented-control"
    ],
    "mappingType": "structural-adaptation",
    "ownerUnit": {
      "type": "jsx-component-group",
      "components": [
        "SegmentedControl",
        "SegmentedControlItem"
      ],
      "targetItemExpr": true
    }
  },
  {
    "id": "flat-content-panel",
    "sourceReferenceId": "flat-content-panel",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/ui/card.jsx",
      "line": 8,
      "exactSnippet": "className={cn(\"rounded-xl border bg-card text-card-foreground shadow\", className)}"
    },
    "sourceSemanticRole": "standard card panel container visual",
    "approvedYueoraRole": "Surface tone=\"panel\" container",
    "sourceClasses": [
      "rounded-xl",
      "border",
      "bg-card",
      "text-card-foreground",
      "shadow"
    ],
    "yueoraClasses": [
      "rounded-container",
      "border",
      "border-line-subtle/50",
      "bg-surface-panel"
    ],
    "allowedOwners": [
      "src/components/patterns/Surface.jsx"
    ],
    "approvedYueoraRoles": [
      "panel"
    ],
    "mappingType": "structural-adaptation",
    "ownerUnit": {
      "type": "cva-variant-composite",
      "variable": "surfaceVariants",
      "variants": [
        {
          "group": "tone",
          "key": "panel"
        },
        {
          "group": "border",
          "key": "true"
        }
      ],
      "includeBase": true
    }
  },
  {
    "id": "statcard-interactive-panel",
    "sourceReferenceId": "statcard-interactive-panel",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/collection/StatCard.jsx",
      "line": 9,
      "exactSnippet": "className=\"bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5\""
    },
    "sourceSemanticRole": "stat card interactive container with hover border and shadow",
    "approvedYueoraRole": "Surface interactive container",
    "sourceClasses": [
      "bg-card",
      "rounded-2xl",
      "p-6",
      "border",
      "border-border/50",
      "hover:border-primary/30",
      "transition-all",
      "duration-300",
      "hover:shadow-lg",
      "hover:shadow-primary/5"
    ],
    "yueoraClasses": [
      "bg-surface-panel",
      "rounded-container",
      "border",
      "border-line-subtle/50",
      "hover:border-brand/30",
      "transition-all",
      "duration-300",
      "hover:shadow-lg",
      "hover:shadow-brand/5"
    ],
    "allowedOwners": [
      "src/components/patterns/Surface.jsx"
    ],
    "approvedYueoraRoles": [
      "surface-interactive"
    ],
    "mappingType": "structural-adaptation",
    "ownerUnit": {
      "type": "cva-variant-composite",
      "variable": "surfaceVariants",
      "variants": [
        {
          "group": "tone",
          "key": "panel"
        },
        {
          "group": "border",
          "key": "true"
        },
        {
          "group": "interactive",
          "key": "true"
        }
      ],
      "includeBase": true
    }
  },
  {
    "id": "itemcard-interactive-card",
    "sourceReferenceId": "itemcard-interactive-card",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/collection/ItemCard.jsx",
      "line": 35,
      "exactSnippet": "className=\"group bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1\""
    },
    "sourceSemanticRole": "item card tactile container with hover border, shadow, and lift",
    "approvedYueoraRole": "ScoreCard interactive card",
    "sourceClasses": [
      "group",
      "bg-card",
      "rounded-2xl",
      "border",
      "border-border/50",
      "overflow-hidden",
      "cursor-pointer",
      "hover:border-primary/40",
      "transition-all",
      "duration-300",
      "hover:shadow-xl",
      "hover:shadow-primary/5",
      "hover:-translate-y-1"
    ],
    "yueoraClasses": [
      "group",
      "bg-surface-panel",
      "rounded-container",
      "border",
      "border-line-subtle/50",
      "overflow-hidden",
      "hover:border-brand/40",
      "transition-all",
      "duration-300",
      "hover:shadow-xl",
      "hover:shadow-brand/5",
      "hover:-translate-y-1"
    ],
    "allowedOwners": [
      "src/components/library/ScoreCard.jsx"
    ],
    "approvedYueoraRoles": [
      "score-card"
    ],
    "mappingType": "structural-adaptation",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "ScoreCard",
      "target": "div",
      "attributes": {
        "data-qa": "score-card"
      },
      "cnArgumentIndex": 0
    }
  },
  {
    "id": "sidebar-active-navigation",
    "sourceReferenceId": "sidebar-active-navigation",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/components/layout/Sidebar.jsx",
      "line": 36,
      "exactSnippet": "className=\"absolute inset-0 bg-primary/10 rounded-xl\""
    },
    "sourceSemanticRole": "sidebar navigation active background wash and text highlight",
    "approvedYueoraRole": "SidebarNavItem active state",
    "sourceClasses": [
      "absolute",
      "inset-0",
      "bg-primary/10",
      "rounded-xl",
      "text-primary",
      "font-medium",
      "text-muted-foreground",
      "hover:text-foreground"
    ],
    "yueoraClasses": [
      "bg-nav-active",
      "text-brand",
      "font-medium",
      "text-ink-tertiary",
      "hover:text-ink-primary"
    ],
    "allowedOwners": [
      "src/components/app-shell/SidebarNavItem.jsx"
    ],
    "approvedYueoraRoles": [
      "nav-active"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "SidebarNavItem",
      "target": "NavLink",
      "cnArgumentIndex": 1
    }
  },
  {
    "id": "dashboard-quick-link",
    "sourceReferenceId": "dashboard-quick-link",
    "source": {
      "repository": "tinghui0912/NumisCollection",
      "commit": "efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c",
      "file": "src/pages/Dashboard.jsx",
      "line": 221,
      "exactSnippet": "className=\"bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center justify-between hover:border-primary/30 transition-all\""
    },
    "sourceSemanticRole": "dashboard quick action link card gradient and hover border",
    "approvedYueoraRole": "PracticeQuickLink action card",
    "sourceClasses": [
      "bg-gradient-to-br",
      "from-primary/10",
      "to-primary/5",
      "rounded-2xl",
      "p-6",
      "border",
      "border-primary/10",
      "hover:border-primary/30",
      "transition-all"
    ],
    "yueoraClasses": [
      "bg-gradient-to-br",
      "from-brand/10",
      "to-brand/5",
      "rounded-container",
      "p-6",
      "border",
      "border-brand/10",
      "hover:border-brand/30",
      "transition-all",
      "focus-visible:ring-1",
      "focus-visible:ring-brand"
    ],
    "allowedOwners": [
      "src/components/practice/PracticeQuickLink.jsx"
    ],
    "approvedYueoraRoles": [
      "quick-link"
    ],
    "mappingType": "semantic-alias",
    "ownerUnit": {
      "type": "jsx-component",
      "component": "PracticeQuickLink",
      "target": "Link",
      "cnArgumentIndex": 0
    }
  }
];

// Backward-compatible aliases
export const YUEORA_AUTHORIZED_STATUS_RECIPES = YUEORA_AUTHORIZED_RECIPES;
export const NUMIS_STATUS_RECIPES = YUEORA_AUTHORIZED_RECIPES;
export const YUEORA_VISUAL_RECIPE_MANIFEST = YUEORA_AUTHORIZED_RECIPES;

// Manifest Self-Validation Asserts:
// 1. Reference recipes must have non-empty source file, line (> 0), sourceSemanticRole, and sourceClasses.
for (const recipe of NUMIS_REFERENCE_RECIPES) {
  if (!recipe.source?.file || typeof recipe.source?.line !== 'number' || recipe.source.line <= 0) {
    throw new Error(`Invalid reference recipe '${recipe.id}': missing or invalid source file/line metadata.`);
  }
  if (!recipe.sourceSemanticRole || typeof recipe.sourceSemanticRole !== 'string') {
    throw new Error(`Invalid reference recipe '${recipe.id}': missing sourceSemanticRole.`);
  }
  if (!Array.isArray(recipe.sourceClasses) || recipe.sourceClasses.length === 0) {
    throw new Error(`Invalid reference recipe '${recipe.id}': empty sourceClasses.`);
  }
}

// 2. Active authorized recipes must have allowedOwners with every owner file physically existing in Yueora.
for (const recipe of YUEORA_AUTHORIZED_RECIPES) {
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
