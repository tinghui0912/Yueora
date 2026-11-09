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

### Golden Rule for Coding Agents
> **Do NOT manually create UI styles with arbitrary Tailwind when a Yueora primitive or semantic token exists.**

Before creating or styling any UI element:
1. **Search existing Design System primitives:**
   - Buttons: `<Button intent="primary|secondary|quiet|danger|transport|subtle" size="xs|sm|md|lg">`
   - Icon Buttons: `<IconButton icon={Icon} label="Accessible name" tone="quiet|outline|surface|primary|danger" size="xs|sm|md|lg">`
   - Form Fields: `<Field label="..." htmlFor="..." description="..." error={...} required><Input ... /></Field>`
   - Selects: `<NativeSelect>` or Radix `<Select>`
   - Containers & Surfaces: `<AppPage size="form|standard|wide|compact|full">`, `<Surface tone="panel|paper|paper-warm" elevation="...">`, `<MusicPaper>`
   - Flow & Layout: `<PageHeader>`, `<SectionHeader>`, `<Stepper>`, `<ChoiceCard>`, `<RepertoireGrid>`
2. **Use semantic typography roles instead of raw font sizes:**
   - Titles: `.type-display`, `.type-page-title`, `.type-section-title`, `.type-subsection`
   - Body & content: `.type-body`, `.type-body-small`, `.type-label`
   - Captions & stats: `.type-caption`, `.type-metadata`, `.type-metric`
   - **Never combine** semantic typography with conflicting font sizes (e.g. do NOT write `type-page-title text-2xl`).
3. **Use semantic colors & respect the Color Contract:**
   - Text: `text-ink-primary`, `text-ink-secondary`, `text-ink-tertiary`, `text-ink-subtle`
   - Surfaces & IA Depth:
     - Primary Nav: `bg-surface-panel` (clean white)
     - Secondary Nav / Collection SubRail: `bg-surface-subrail`, `border-line-subrail`
     - Workspace Canvas: `bg-surface-canvas` (warm ivory)
     - Full-Width Page Sections: Strictly alternate between `surface-canvas` (warm ivory) and `surface-panel` (clean white). Banned on full-width sections: `bg-brand`, `bg-brand-wash`, `bg-surface-paper`, `bg-surface-paper-warm`, `bg-neutral-muted`. Brand is an accent, not a background system.
     - Featured Surfaces: `bg-brand-wash`, `border-brand-washBorder` (contained modules like Pick up where you left off, editorial highlight; NEVER full-width)
     - Archival Sheets & Content Cards: `bg-surface-paper`, `bg-surface-paper-warm` with `shadow-paper`
     - Overlays / Popovers: `bg-surface-raised` with `shadow-overlay`
   - Lines: `border-line-subtle`, `border-surface-paper-edge`, `border-line-subrail`
   - Navigation Active Contract: Strictly neutral active: `bg-neutral-muted font-semibold text-ink-primary shadow-xs` with subtle `text-brand` icon cue. Inactive is `text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary`. NEVER use `bg-brand-soft` for navigation items.
   - Selection Contract (Large vs Compact):
     - **Compact Selection:** `bg-brand-soft text-brand-soft-foreground` (strictly for small chips, filter badges, compact tags, ChoiceCard badges where small surface area keeps it subordinate).
     - **Large Selection:** Wide rows, large selectable options, and full-width list items are **banned** from `bg-brand-soft`. Must use neutral selected surface (`bg-neutral-hover` or `bg-surface-panel`) paired with a brand indicator (`border-brand`, green radio dot, or `text-brand` checkmark).
     - **Maximum 2 Brand Signals per selection state:** Never stack green background + green border + green text + green icon. Selection should be understood, not painted.
     - **Drag Targets:** Dragging state is not selection; use `border-brand bg-surface-canvas text-brand`, never `bg-brand-soft`.
     - **Control Toggles:** Loop/toggle buttons use `border-brand bg-neutral-muted text-ink-primary shadow-xs` with `text-brand` icon, not `bg-brand-soft`.
   - Featured Brand Surface: `bg-brand-wash` (subtle brand tint for recommendations, NOT selected state)
   - Primary CTA: `bg-brand` (deep forest green), `text-white`, `hover:bg-brand-hover`
   - Neutral hovers & muted items: `bg-neutral-muted`, `hover:bg-neutral-hover` (warm ivory-gray, NEVER green)
   - **Primitive Physical Palette:** 14 core physical colors + 4 status colors in `src/index.css`. Pages and domain components MUST ONLY consume semantic tokens (`bg-surface-*`, `text-ink-*`, `text-brand`, etc.), NEVER primitive tokens directly (`bg-primitive-*` is banned in product code).
   - **Legacy tokens are permanently retired from product code:** NEVER use `bg-accent`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary`, `bg-card`, `bg-background`, `text-foreground`, `border-border`, `border-input`, `ring-ring` in pages or domain components.
   - Never use arbitrary `bg-brand/10` or raw hex colors (`#...`) in application JSX.
4. **Production Auth & Product Truth Principles:**
   - **Production Auth Boundary:** Development conveniences (e.g. `?demo=true`, `loginViaDemo()`, `localStorage.yueora_demo_auth`) are strictly gated by `import.meta.env.DEV`. Production builds must never accept demo auth or fall back to demo sessions on login failure.
   - **Product Truth:** Product UI must never claim a capability that production code does not actually provide. Simulated readiness / progress must be strictly gated behind `import.meta.env.DEV`.
5. **Anti-Flattening Principle:**
   - Uniformity does NOT mean visual flattening.
   - Same semantic role -> same appearance; Different semantic roles -> intentionally distinguishable appearance.
6. **Never expose debug / prototype simulation controls in production:**
   - Gate verification simulators behind `import.meta.env.DEV` or internal tooling.
7. Refer to `docs/design-system.md` and visit `/design-system` for interactive component examples and guidelines.
