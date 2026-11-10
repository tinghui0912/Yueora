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
   - Buttons: `<Button intent="primary|secondary|quiet|danger|transport|subtle" size="xs|sm|md|lg">`
   - Icon Buttons: `<IconButton icon={Icon} label="Accessible name" tone="quiet|outline|surface|primary|danger" size="xs|sm|md|lg">`
   - Form Fields: `<Field label="..." htmlFor="..." description="..." error={...} required><Input ... /></Field>`
   - Selects: `<NativeSelect>` or Radix `<Select>`
   - Containers & Surfaces: `<AppPage size="form|standard|wide|compact|full">`, `<Surface tone="panel|canvas|raised" elevation="none|raised|overlay">`, `<MusicPaper>`
   - Flow & Layout: `<PageHeader>`, `<SectionHeader>`, `<Stepper>`, `<ChoiceCard>`, `<RepertoireGrid>`
2. **Use semantic typography roles instead of raw font sizes:**
   - Titles: `.type-display`, `.type-page-title`, `.type-section-title`, `.type-subsection`
   - Body & content: `.type-body`, `.type-body-small`, `.type-label`
   - Captions & stats: `.type-caption`, `.type-metadata`, `.type-metric`
   - **Never combine** semantic typography with conflicting font sizes (e.g. do NOT write `type-page-title text-2xl`).
3. **Use semantic colors & respect the Color Contract:**
   - Text: `text-ink-primary`, `text-ink-secondary`, `text-ink-tertiary`, `text-ink-subtle`
   - Surfaces & 3 General UI Surfaces (+ Notation Exception):
     - Workspace Canvas: `bg-surface-canvas` (warm ivory backdrop)
     - Standard Content Panel: `bg-surface-panel` (clean white, `border-line-subtle`, `rounded-container`). Flat by default; avoid automatic `shadow-xs` on static containers. All cards, list containers, sections, resume modules, pricing tiers, and stats use standard panel.
     - Elevated Overlays / Menus: `bg-surface-raised` with `shadow-overlay`
     - Score Notation Canvas (Domain Exception): `bg-surface-paper` (`MusicPaper`) strictly reserved ONLY for literal sheet music score and musical notation canvases. Banned on generic recommendation cards, practice statistics, pricing cards, empty states, and standard content cards.
     - Secondary Navigation Shell (Implementation Detail): `bg-surface-subrail`, `border-line-subrail` for collection/folder subrails.
     - Retired Tokens: `brand-wash` and `surface-paper-warm` are permanently retired from product code. Brand color is an accent, not a background system.
   - Lines: `border-line-subtle`, `border-line-strong`, `border-line-subrail`
   - Navigation Active Contract: Strictly neutral active: `bg-neutral-muted font-semibold text-ink-primary` with subtle `text-brand` icon cue (NO shadow). Inactive is `text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary`. NEVER use `bg-brand-soft` for navigation items.
   - Selection Contract (Large vs Compact):
     - **Compact Selection:** `bg-brand-soft text-brand-soft-foreground` (strictly for small chips, filter badges, compact tags, ChoiceCard badges where small surface area keeps it subordinate).
     - **Large Selection:** Wide rows, large selectable options, and full-width list items are **banned** from `bg-brand-soft`. Must use neutral selected surface (`bg-neutral-hover` or `bg-surface-panel`) paired with a brand indicator (`border-brand`, green radio dot, or `text-brand` checkmark).
     - **Maximum 2 Brand Signals per selection state:** Never stack green background + green border + green text + green icon. Selection should be understood, not painted.
     - **Drag Targets:** Dragging state is not selection; use `border-brand bg-surface-canvas text-brand`, never `bg-brand-soft`.
     - **Control Toggles:** Loop/toggle buttons use `border-brand bg-neutral-muted text-ink-primary` with `text-brand` icon, not `bg-brand-soft`.
   - Hover Contract: General interactive hover across all controls, buttons, dropdowns, list items, and links is strictly `bg-neutral-hover text-ink-primary`. Banned across generic UI: `hover:bg-surface-paper*`.
   - Primary CTA: `bg-brand` (deep forest green), `text-white`, `hover:bg-brand-hover`
   - Neutral hovers & muted items: `bg-neutral-muted`, `hover:bg-neutral-hover` (warm ivory-gray, NEVER green)
   - **Primitive Physical Palette:** 15 core physical colors + 4 status colors in `src/index.css` (19 primitives total). Pages and domain components MUST ONLY consume semantic tokens (`bg-surface-*`, `text-ink-*`, `text-brand`, etc.), NEVER primitive tokens directly (`bg-primitive-*` is banned in product code).
   - **Legacy tokens are permanently retired from product code:** NEVER use `bg-accent`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary`, `bg-card`, `bg-background`, `text-foreground`, `border-border`, `border-input`, `ring-ring` in pages or domain components.
   - Never use arbitrary `bg-brand/10` or raw hex colors (`#...`) in application JSX.
4. **Appearance vs Composition Boundary:**
   - **Design System Owns:** color tokens, typography roles, font family & scale, control size (`control-xs..xl`), icon size (`icon-xs..xl`), radius (`radius-control|container|overlay`), surface model (`canvas|panel|raised` + notation `MusicPaper`), border & line tokens, shadow language (`none|raised|overlay|paper`), interaction & hover states, button & input variants, page width system (`AppPage`), navigation states, selection contracts.
   - **Page Owns:** content, content order, grid/flex structure, responsive columns, domain geometry, local spacing (`gap-*`, `space-y-*`, `mt-*`), data rendering.
   - **Do not pursue "zero className":** Standard composition layout utilities (`grid gap-4`, `flex items-center`) are legitimate page responsibilities. Visual drift occurs only when pages invent custom colors, fonts, shadows, borders, radii, or interaction states.
5. **Production Auth & Product Truth Principles:**
   - **Production Auth Boundary:** Development conveniences (e.g. `?demo=true`, `loginViaDemo()`, `localStorage.yueora_demo_auth`) are strictly gated by `import.meta.env.DEV`. Production builds must never accept demo auth or fall back to demo sessions on login failure.
   - **Product Truth:** Product UI must never claim a capability that production code does not actually provide. Simulated readiness / progress must be strictly gated behind `import.meta.env.DEV`.
5. **Unified Product Grammar & Anti-Overdesign Principle:**
   - **Same product, same visual grammar.**
   - **Simple before expressive.**
   - **Consistent before distinctive.**
   - **If the standard treatment works, use it.**
   - **Semantic meaning does not automatically justify a different visual treatment.**
   - **Do not create a new surface, color, shadow, radius, card treatment, page width or component variant merely because a section is important, musical, premium, emotional, featured or memorable.**
   - **Visual differences must have functional necessity, not aesthetic preference.**
   - If two UI elements can look the same without hurting usability, they should look the same.
   - Prefer one reusable treatment over several "semantically expressive" treatments.
   - **When in doubt, use the standard panel (`surface-panel` + `border-line-subtle`).**
6. **Never expose debug / prototype simulation controls in production:**
   - Gate verification simulators behind `import.meta.env.DEV` or internal tooling.
7. Refer to `docs/design-system.md` and visit `/design-system` for interactive component examples and guidelines.
