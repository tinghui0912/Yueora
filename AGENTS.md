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
3. **Use semantic colors:**
   - Text: `text-ink-primary`, `text-ink-secondary`, `text-ink-tertiary`, `text-ink-subtle`
   - Surfaces: `bg-surface-canvas`, `bg-surface-panel`, `bg-surface-paper`, `bg-surface-paper-warm`
   - Lines: `border-line-subtle`, `border-surface-paper-edge`
   - Never use raw hex colors (`#...`) in application JSX.
4. **Never expose debug / prototype simulation controls in production:**
   - Gate verification simulators behind `import.meta.env.DEV` or internal tooling.
5. Refer to `docs/design-system.md` and visit `/design-system` for interactive component examples and guidelines.
