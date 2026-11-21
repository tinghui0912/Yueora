# AGENTS.md

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.

## Yueora Design System Architecture & AI Coding Guardrails

Yueora enforces a strict multi-layer Design System. **Pages compose; the Design System decides appearance.**

### Architecture Freeze Policy
> **The Design System architecture is formally frozen. Do not redesign the visual system when adding a page or feature. Reuse existing semantic tokens and primitives first.**

### Golden Rule for Coding Agents
> **Do NOT manually create UI styles with arbitrary Tailwind when a Yueora primitive or semantic token exists.**

Before creating or styling any UI element:
1. **Search existing Design System primitives:**
   - Buttons: `<Button intent="primary|secondary|quiet|danger|subtle|link" size="xs|sm|md|lg|xl">` (Single semantic `intent` prop; sizes align 1:1 with the 5 canonical control tokens. Legacy `variant` prop and `hero` size are permanently retired. Pages compose; Button completely owns appearance. Do NOT override bg, border, radius, or shadow on Button via `className`).
   - Icon Buttons: `<IconButton icon={Icon} label="Accessible name" tone="quiet|outline|primary|danger" size="xs|sm|md|lg">`
   - Form Fields: `<Field label="..." htmlFor="..." description="..." error={...} required><Input ... /></Field>`
   - Selects: `<NativeSelect>` or Radix `<Select>`
   - Containers & Surfaces: `<AppPage size="form|standard|wide|compact|full">`, `<Surface tone="panel|canvas|raised" elevation="none|raised|overlay" padding="none|sm|md|lg">` (Prefer `<Surface>` over repeating `rounded-container border border-line-subtle bg-surface-panel`).
   - Flow & Layout: `<PageHeader>`, `<SectionHeader>`, `<Stepper>`, `<ChoiceCard>`, `<RepertoireGrid>`
2. **Use semantic typography roles instead of raw font sizes (Page Typography Ownership Contract):**
   - **Pages compose. The Design System decides appearance.**
   - **Serif tells the story. Sans explains the product.** Playfair Display is reserved for identity, titles, musical voice, and reflective moments; Inter is for controls, reading copy, explanations, and metadata.
   - Public & marketing: `.type-hero-title`, `.type-marketing-title`, `.type-eyebrow`, `.type-editorial-quote`, `.type-marketing-body`
   - Titles: `.type-display`, `.type-experience-title`, `.type-page-title`, `.type-section-title`, `.type-subsection`
   - Body & content: `.type-body`, `.type-body-small`, `.type-label`
   - Captions & stats: `.type-caption`, `.type-metadata`, `.type-metric`
   - **Never combine** semantic typography with conflicting font sizes (e.g. do NOT write `type-page-title text-2xl`).
   - **All pages under `src/pages/**` must strictly consume semantic `type-*` roles.** Raw font-size utilities (`text-xs..6xl`), raw `font-display`, raw `uppercase`, and raw tracking in page files are banned and enforced by `npm run check:design-system`.
   - Rare exceptions require an explicit, non-trivial `{/* ds-allow: <specific reason> */}` comment. Generic reasons like "marketing" or "custom" are prohibited.
3. **Use semantic colors & respect the Color Contract:**
   - Text: `text-ink-primary`, `text-ink-secondary`, `text-ink-tertiary`, `text-ink-subtle`
   - Surfaces & 3 Canonical Surfaces:
     - Workspace Canvas: `bg-surface-canvas` (warm archive paper backdrop)
     - Standard Content Panel: `bg-surface-panel` (warm white, `border-line-subtle`, `rounded-container`). Flat by default; avoid automatic `shadow-xs` on static containers. All cards, list containers, sections, resume modules, pricing tiers, stats, and musical notation/score containers use standard panel. Musical notation is domain content, not a separate Design System surface.
     - Elevated Overlays / Menus: `bg-surface-raised` with `shadow-overlay` (or `shadow-raised`)
     - Secondary Navigation Shell (Implementation Detail): `bg-surface-subrail`, `border-line-subrail` for collection/folder subrails.
     - Brand Color Contract: Antique Bronze Gold (`--brand`: `36 70% 45%`) is primary identity tone. Primary CTA uses warm white text (`--brand-foreground`: `40 20% 98%`); brand accent icons and cues are `text-brand`.
   - Lines: `border-line-subtle`, `border-line-strong`, `border-line-subrail`
   - Navigation Active Contract: Canonical active is `bg-nav-active font-medium text-brand` with `text-brand` icon (NO shadow). Inactive is `text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary`.
   - Selection Contract (Large vs Compact):
     - **Compact Selection:** `bg-brand-soft text-brand-soft-foreground` (strictly for small chips, filter badges, compact tags, ChoiceCard badges where small surface area keeps it subordinate).
     - **Large Selection:** Wide rows, large selectable options, and full-width list items are **banned** from `bg-brand-soft`. Must use neutral selected surface (`bg-neutral-hover` or `bg-surface-panel`) paired with a brand indicator (`border-brand`, radio dot, or `text-brand` checkmark).
     - **Maximum 2 Brand Signals per selection state:** Never stack dark background + dark border + dark text + icon. Selection should be understood, not painted.
     - **Drag Targets:** Dragging state is not selection; use `border-brand bg-surface-canvas text-brand`, never `bg-brand-soft`.
     - **Control Toggles:** Loop/toggle buttons use `border-brand bg-neutral-muted text-ink-primary` with `text-brand` icon, not `bg-brand-soft`.
   - Interaction & Hover Contract: Primitive owns its Numis-derived interaction recipe (e.g. Button primary uses `hover:bg-brand/90`, secondary uses `hover:bg-brand-soft`, quiet uses `hover:bg-brand-soft`). General neutral item hover across menus, dropdowns, list items, and links is strictly `bg-neutral-hover text-ink-primary`. Pages may NOT invent hover treatments.
   - Primary CTA: `bg-brand` (Antique Bronze Gold `#C38322`, `36 70% 45%`), `text-brand-foreground` (Warm White `hsl(40 20% 98%)` / `rgb(251, 250, 249)`), `shadow`, `hover:bg-brand/90 active:scale-[0.98]`
   - Brand Accent: `text-brand` (Antique Bronze Gold `#C38322`), focus rings `focus-visible:ring-brand`, checkmarks, and active indicator cues.
   - Standard Form Controls: Default height is compact 36px (`h-control-md`, 10px `rounded-control`) for application-first density.
   - Interactive Surfaces & Tactile Lift: `<Surface interactive>` and `ScoreCard` provide soft warm elevation and subtle tactile lift (`hover:-translate-y-1 hover:border-brand/40 hover:shadow-raised transition-all duration-300`).
   - Neutral hovers & muted items: `bg-neutral-muted`, `hover:bg-neutral-hover` (warm ivory-gray, NEVER chromatic)
   - **Frozen Numis Reference Layer:** Fixed reference tokens derived strictly from NumisCollection (`efd2af4c5c1f8a2955b5c2c6d358cc9ecc3ec79c`) in `src/index.css`. Pages and domain components MUST ONLY consume semantic tokens (`bg-surface-*`, `text-ink-*`, `text-brand`, etc.), NEVER raw physical tokens directly.
   - **Visual parity takes precedence over accessibility-driven recoloring.** Yueora does not define an independent visual palette. All visual color values derive strictly from the fixed NumisCollection reference commit. Retired custom tokens and unapproved physical colors are permanently removed.
   - **Legacy tokens are permanently retired from product code:** NEVER use `bg-accent`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary`, `bg-card`, `bg-background`, `text-foreground`, `border-border`, `border-input`, `ring-ring` in pages or domain components.
   - Never use arbitrary `bg-brand/10` or raw hex colors (`#...`) in application JSX.
4. **Appearance vs Composition Boundary:**
   - **Design System Owns:** color tokens, typography roles, font family & scale, control size (`control-xs..xl`), icon size (`icon-xs..xl`), radius (`radius-control|container|overlay`), surface model (`canvas|panel|raised`), border & line tokens, shadow language (`none|raised|overlay`), interaction & hover states, button appearance & intents (`primary`, `secondary`, `quiet`, `danger`, `subtle`, `link`), page width system (`AppPage`), navigation states, selection contracts.
   - **Page Owns:** content, content order, grid/flex structure, responsive columns, domain geometry, local spacing (`gap-*`, `space-y-*`, `mt-*`), data rendering.
   - **Do not pursue "zero className":** Standard composition layout utilities (`grid gap-4`, `flex items-center`) are legitimate page responsibilities. Visual drift occurs only when pages invent custom colors, fonts, shadows, borders, radii, or interaction states.
   - **Primitive Appearance Ownership Contract:**
     - `<Button>` and `<IconButton>` completely own visual styling (background, border, radius, height, padding, gap, typography, hover, active, focus states). Pages compose via `intent` and `size`. Controls use compact 10px `rounded-control` geometry with quiet `shadow-raised` on primary/secondary. Enforced via a strict **Composition Allowlist**: page consumers may ONLY pass external composition layout utilities (`w-*`, `min-w-*`, `max-w-*`, `flex-1`, `shrink-0`, `self-*`, `m-*`) with responsive modifiers only (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`). Arbitrary selector variants (`[&...]:`) and appearance utilities are strictly prohibited. Dynamic unanalyzable `className` expressions and JSX spread attributes (`{...props}`) fail closed. Protected identity cannot be evaded via namespace imports (`import * as ButtonUI`) or local aliases (`const ActionButton = Button`). Legacy `variant=` prop, legacy aliases, and `hero`/`default` sizes are permanently retired.
     - Overlay primitives (`DialogContent`, `DropdownMenuContent`, `PopoverContent`) completely own their appearance (background, borders, radius, overlay shadow). Enforced via an **Overlay Composition Allowlist**: page consumers may only pass sizing/overflow constraints (`w-*`, `min-w-*`, `max-w-*`, `h-*`, `min-h-*`, `max-h-*`, `overflow-*`). Spread attributes and dynamic unanalyzable className fail closed across named, namespace, and local aliased imports.
     - `<Surface>` completely owns surface tones (`panel`, `canvas`, `raised`), container borders, radius, elevations (`none`, `raised`, `overlay`), and interaction/hover/motion identity. Page consumers MUST NOT pass background, border, radius, shadow, ring, hover, focus, active, transition, duration, ease, translate, or group utilities in `className`. Consumer `className` is strictly restricted to layout, grid, flex, position, and spacing composition with responsive modifiers only.
     - Elevation belongs exclusively to `<Surface elevation="overlay|raised">` or dedicated primitives. Direct usage of `shadow-overlay` or `shadow-raised` on arbitrary `<div>` containers in `src/pages/**` is banned.
     - These guardrails are enforced via AST analysis in `scripts/lib/appearance-guard.mjs` across all `.js`, `.jsx`, `.ts`, `.tsx` in `src/pages/**`. Protected primitive identity is enforced order-independently across canonical named imports, import aliases, namespace member imports, and supported immutable `const` local aliases (fixed-point propagated). Mutable aliases (`let`/`var`) of protected primitives are prohibited. Comments like `/* ds-allow: ... */` are strictly prohibited from bypassing appearance guards.
   - **Planar & Radius Contract:** Pages MUST NOT use arbitrary radii (`rounded-[...]`) or generic Tailwind radii (`rounded`, `rounded-sm..3xl`, and directional variants). Only canonical semantic radii (`rounded-control`: 10px, `rounded-container`: 16px, `rounded-overlay`: 12px, and justified `rounded-full` for badges/pills/dots) are permitted in `src/pages/**`. Arbitrary shadows (`shadow-[...]`) and generic Tailwind shadows (`shadow-sm..2xl`) are banned in pages. Standard panels are flat by default. Overlays strictly use `shadow-overlay` or `shadow-raised`. Prefer `<Surface padding="...">` over raw container recipes.
5. **Production Auth & Product Truth Principles:**
   - **Production Auth Boundary:** Development conveniences (e.g. `?demo=true`, `loginViaDemo()`, `localStorage.yueora_demo_auth`) are strictly gated by `import.meta.env.DEV`. Production builds must never accept demo auth or fall back to demo sessions on login failure.
   - **Product Truth:** Product UI must never claim a capability that production code does not actually provide. Simulated readiness / progress must be strictly gated behind `import.meta.env.DEV`.
6. **Unified Product Grammar & Anti-Overdesign Principle:**
   - **Same product, same visual grammar.**
   - **Simple before expressive.**
   - **Consistent before distinctive.**
   - **If the standard treatment works, use it.**
   - **Semantic meaning does not automatically justify a different visual treatment.**
   - **Domain meaning does not automatically justify a new visual primitive.**
   - **A specialized content type is not automatically a specialized Design System surface.**
   - **Do not create a new surface, color, shadow, radius, card treatment, page width or component variant merely because a section is important, musical, premium, emotional, featured or memorable.**
   - **Visual differences must have functional necessity, not aesthetic preference.**
   - If two UI elements can look the same without hurting usability, they should look the same.
   - Prefer one reusable treatment over several "semantically expressive" treatments.
   - **When in doubt, use the standard panel (`surface-panel` + `border-line-subtle`).**
6. **Never expose debug / prototype simulation controls in production:**
   - Gate verification simulators behind `import.meta.env.DEV` or internal tooling.
7. Refer to `docs/design-system.md` and visit `/design-system` for interactive component examples and guidelines.
