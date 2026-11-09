# Yueora Design System & Frontend UI Architecture

> **Core Principle:** *Pages compose. The Design System decides appearance.*

Yueora is a personal musical sanctuary. The Design System exists to ensure that every surface reflects tactile paper, calm musical progression, dignified typography, and accessible interaction without page-level visual drift.

---

## 1. System Layers

```text
Foundations (Tokens & CSS Variables)
↓
Semantic Tokens (Colors, Typography Roles, Control Heights, Icon Sizes, Radii, Shadows, Motion)
↓
Primitive Components (Button, IconButton, Input, Select, Field, Badge, BackLink)
↓
Yueora Semantic Components (Surface, Stepper, ChoiceCard, AppPage, PageHeader, SectionHeader)
↓
Domain Components (ScoreCard, PieceIdentity, JourneyTimeline, PracticeTransport, FollowFeedback, RepertoireGrid)
↓
Page Composition (What information appears, order, business logic, state)
```

---

## 2. Foundations & Semantic Tokens

### 2.1 Typography Scale

All typography in application pages must use semantic typography roles. **Do not combine a semantic class with manual Tailwind text sizes.**

| Semantic Class | Target Role | Baseline Size | Line Height | Tracking | Font Family |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.type-display` | Hero titles & brand headlines | `clamp(2rem, 4vw, 3rem)` | `1.1` | `-0.02em` | Newsreader |
| `.type-experience-title` | Core musical space titles (Repertoire, Practice Hub, Preserved Moments) | Mobile `32px` (`2rem`), Desktop `38px` (`2.375rem`) | `1.15` | `-0.02em` | Newsreader |
| `.type-page-title` | Application page headings | Mobile `28px` (`1.75rem`), Desktop `34px` (`2.125rem`) | `1.2` | `-0.015em` | Newsreader |
| `.type-section-title` | Major section headings | Mobile `20px` (`1.25rem`), Desktop `22px` (`1.375rem`) | `1.25–1.3` | `-0.01em` | Newsreader |
| `.type-subsection` | Subsections & card titles | `16px` (`1rem`) | `1.4` | Normal | Plus Jakarta Sans (600) |
| `.type-body` | Primary editorial reading text | `16px` (`1rem`) | `1.6` | Normal | Plus Jakarta Sans (400) |
| `.type-body-small` | Secondary UI copy & descriptions | `14px` (`0.875rem`) | `1.55` | Normal | Plus Jakarta Sans (400) |
| `.type-label` | Form labels & navigation items | `14px` (`0.875rem`) | `1.4` | Normal | Plus Jakarta Sans (500) |
| `.type-caption` | Micro-labels, step badges & tags | `12px` (`0.75rem`) | `1.4` | `0.06em` | Plus Jakarta Sans (600, uppercase) |
| `.type-metadata` | Timestamps, counters & helper text | `13px` (`0.8125rem`) | `1.45` | Normal | Plus Jakarta Sans (400) |
| `.type-metric` | Large reflective numbers & hours | Mobile `28px` (`1.75rem`), Desktop `32px` (`2rem`) | `1.0` | Tabular | Newsreader |

### 2.2 Color Vocabulary & Usage Contract (WCAG 2.2 AA)

Yueora enforces **one canonical visual language**. Legacy token aliases (`bg-accent`, `bg-muted`, `text-muted-foreground`, `bg-primary`, etc.) are retired from product code.

#### Canonical Roles:
- **Ink (Text):**
  - `text-ink-primary` (`hsl(220 5% 13%)`): Main titles and high-emphasis reading copy (>10:1 contrast).
  - `text-ink-secondary` (`hsl(223 4% 36%)`): Readable secondary descriptions, timestamps, and labels (>6.5:1 contrast).
  - `text-ink-tertiary` (`hsl(220 4% 48%)`): Readable muted copy (>4.5:1 contrast).
  - `text-ink-subtle` (`hsl(220 3% 62%)`): Strictly non-textual dividers and subtle glyphs.
- **Surfaces:**
  - `bg-surface-canvas` (`hsl(44 19% 97%)`): Global backdrop canvas — warm ivory off-white, never pure gray and never green.
  - `bg-surface-panel` (`hsl(0 0% 100%)`): Pure white functional container surface for primary nav sidebar, dialogs, cards, forms, inputs.
  - `bg-surface-subrail` (`hsl(44 18% 95%)`): Subtle, distinct secondary navigation rail surface for collection and folder exploration.
  - `bg-surface-raised` (`hsl(0 0% 100%)`): Elevated overlay surface (menus, popovers, floating toolbars).
  - `bg-surface-paper` (`hsl(44 26% 96%)`): Tactile archival paper tone for score artifacts and musical notation.
  - `bg-surface-paper-warm` (`hsl(40 28% 95%)`): Warm paper tone for preserved musical memories and takes.
- **Lines & Borders:**
  - `border-line-subtle` (`hsl(47 14% 91%)`): Quiet structural dividers and panel borders.
  - `border-line-strong` (`hsl(47 13% 80%)`): Stronger borders for unfocused controls, switches, checkboxes.
  - `border-line-subrail` (`hsl(47 14% 88%)`): Distinctive divider for secondary navigation rails.
  - `border-surface-paper-edge` (`hsl(44 16% 87%)`): Tactile card and paper boundary.
- **Brand & Active States:**
  - `bg-brand` (`hsl(148 36% 27%)`): Deep forest green for primary CTA buttons, strong emphasis, and checkmark indicators.
  - `bg-brand-hover` (`hsl(148 36% 22%)`): Darker forest green for primary CTA hover.
  - `bg-brand-soft` (`hsl(148 36% 93%)`): **Pale green has exactly ONE meaning: selected / active Yueora context.** Used for active tabs, selected choice cards, active filters, and reviewed badges. **NEVER** use for neutral hover or disabled states.
  - `text-brand-soft-foreground` (`hsl(148 36% 27%)`): Contrast foreground text on pale green surfaces.
  - `bg-brand-wash` (`hsl(148 24% 96%)`): **Featured brand surface.** Used for Priority 1 re-engagement ("Pick up where you left off"), returning-user recommendations, and signature practice stand sections. Distinct from canvas and never confused with active selection.
  - `border-brand-wash-border` (`hsl(148 26% 88%)`): Boundary for featured brand surfaces.
- **Neutral Quiet & Hover:**
  - `bg-neutral-muted` (`hsl(44 14% 92%)`): Warm ivory-neutral for passive badges, tab tracks, progress backgrounds.
  - `bg-neutral-hover` (`hsl(44 16% 94%)`): Warm neutral hover state for dropdown menu items, command items, unselected tabs.
- **Semantic Feedback:**
  - `text-success` / `bg-success`: Subdued musical confirmation green (`hsl(148 40% 32%)`).
  - `text-warning` / `bg-warning`: Warm amber for pending or verification notices (`hsl(38 76% 40%)`).
  - `text-danger` / `bg-danger`: Non-punitive alert terracotta red (`hsl(0 62% 44%)`).
  - `text-info` / `bg-info`: Soft instructional slate blue (`hsl(204 45% 40%)`).

#### Color Usage Matrix:

| UI Context | Default Surface | Hover Surface | Active / Selected | Border | Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Button** | `bg-brand` | `bg-brand-hover` | `bg-brand` | `border-transparent` | `text-white` |
| **Secondary Button** | `bg-surface-panel` | `bg-neutral-hover` | `bg-brand-soft` | `border-line-subtle` | `text-ink-primary` |
| **Quiet Button** | `transparent` | `bg-neutral-hover` | `bg-brand-soft` | `border-transparent` | `text-ink-primary` |
| **Dropdown Item** | `transparent` | `bg-neutral-hover` | `bg-brand-soft` | `none` | `text-ink-primary` |
| **Tab Trigger** | `transparent` | `bg-neutral-hover` | `bg-surface-panel` | `none` | `text-ink-primary` |
| **Filter Pill** | `transparent` | `bg-neutral-hover` | `bg-brand-soft` | `border-line-subtle` | `text-brand-soft-foreground` |
| **Standard Card** | `bg-surface-panel` | `bg-surface-panel` | `border-brand` | `border-line-subtle` | `text-ink-primary` |
| **Music Paper Card** | `bg-surface-paper` | `bg-surface-paper-warm`| `border-brand` | `border-surface-paper-edge` | `text-ink-primary` |
| **Form Input** | `bg-surface-panel` | `bg-surface-panel` | `ring-brand/20 border-brand` | `border-surface-paper-edge` | `text-ink-primary` |
| **Neutral Badge** | `bg-neutral-muted` | — | — | `border-transparent` | `text-ink-secondary` |
| **Active/Selected Badge** | `bg-brand-soft` | — | — | `border-transparent` | `text-brand-soft-foreground` |

#### Legacy Token to Yueora Canonical Mapping:

| Legacy Token | Forbidden Usage | Canonical Yueora Replacement |
| :--- | :--- | :--- |
| `bg-background` | Page container backdrops | `bg-surface-canvas` |
| `bg-card` | Standard panels, cards | `bg-surface-panel` |
| `bg-primary` | Primary buttons, active dots | `bg-brand` (with `text-white`) |
| `text-primary` | Text links, brand headers | `text-brand` |
| `bg-accent` (active context) | Selected item, active filter | `bg-brand-soft text-brand-soft-foreground` |
| `bg-accent` (hover context) | Item hover, menu hover | `bg-neutral-hover` (warm ivory-neutral) |
| `bg-muted` (passive container) | Progress track, badge | `bg-neutral-muted` |
| `text-muted-foreground` | Helper text, secondary copy | `text-ink-secondary` or `text-ink-tertiary` |
| `border-border` | Component borders | `border-line-subtle` |
| `border-input` | Form input borders | `border-surface-paper-edge` |
| `text-foreground` | Primary text | `text-ink-primary` |

### 2.3 Surface Hierarchy & Anti-Flattening Contract

> **Golden Rule of Anti-Flattening:**
> *Uniformity does NOT mean visual flattening.*
> *Same semantic role → same appearance.*
> *Different semantic roles → intentionally distinguishable appearance.*

Authenticated application layout establishes a 5-tier depth model:

1. **Primary Navigation (AppShell Sidebar):** `bg-surface-panel` (pure white, `hsl(0 0% 100%)`) with `border-r border-line-subtle`.
2. **Secondary Navigation (Collection SubRail):** `bg-surface-subrail` (`hsl(44 18% 95%)`) with `border-r border-line-subrail`. Deliberately distinct from pure white sidebar and main canvas.
3. **Workspace Canvas:** `bg-surface-canvas` (`hsl(44 19% 97%)`). Warm ivory backdrop for all application views.
4. **Featured Content (Re-engagement / Priority 1):** `bg-brand-wash` (`hsl(148 24% 96%)`) with `border border-brand-wash-border`. Elevates "Pick up where you left off" above ordinary cards without shouting.
5. **Content Cards & Archival Sheets:** `bg-surface-panel` or `bg-surface-paper` with `shadow-paper` and `border border-surface-paper-edge`.
6. **Raised Overlays:** `bg-surface-raised` with `shadow-overlay` (popovers, menus, search palette).

### 2.4 Marketing Surface Rhythm Contract (Landing Page)

Marketing pages must follow an intentional chapter rhythm rather than being flattened into one continuous canvas wash:

| Section | Content Role | Semantic Surface | Border Divider |
| :--- | :--- | :--- | :--- |
| **01. Hero** | Musical Invitation ("Play what you love") | `bg-surface-canvas` | — |
| **02. Philosophy** | 4 Quiet Pillars ("Your music, not ours") | `bg-surface-panel` (pure editorial white) | `border-t border-line-subtle` |
| **03. Lifecycle** | Paper-to-playable transformation continuum | `bg-surface-paper` (tactile paper) | `border-t border-line-subtle` |
| **04. Repertoire** | Music cabinet ("Not a cloud drive") | `bg-surface-canvas` | `border-t border-line-subtle` |
| **05. Practice Stand** | Signature non-judgmental phrase following | `bg-brand-wash` (subtle brand wash) | `border-y border-brand-wash-border` |
| **06. Performances** | Preserved takes & memory archive | `bg-surface-paper-warm` (warm paper) | `border-t border-surface-paper-edge` |
| **07. Sharing** | Private sanctuary ("A door you choose to open") | `bg-surface-canvas` | `border-t border-line-subtle` |
| **08. Pricing** | Durable & fair subscription plans | `bg-neutral-muted/40` (soft neutral backdrop) | `border-t border-line-subtle` |
| **09. FAQ** | Clarity & questions | `bg-surface-panel` (clean reading white) | `border-t border-line-subtle` |
| **10. Final CTA** | Inverse brand moment ("Play what you love") | `bg-brand text-white` (deep forest green) | `border-t border-brand` |
| **11. Footer** | Sanctuary credits & quiet legal navigation | `bg-surface-canvas` | `border-t border-line-subtle` |

### 2.5 Canonical Control Scale & Icon Sizing

One visual decision has one owner. All interactive controls, inputs, and icon elements consume these exact dimensions:

| Size Key | Control Dimension | CSS Height Variable | Height & Min-Height Utilities | Width & Min-Width Utilities | Icon Size | Icon Utility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `xs` | `28px` (`1.75rem`) | `--control-height-xs` | `.h-control-xs` / `.min-h-control-xs` | `.w-control-xs` / `.min-w-control-xs` | `14px` (`0.875rem`) | `.icon-xs` |
| `sm` | `32px` (`2.0rem`) | `--control-height-sm` | `.h-control-sm` / `.min-h-control-sm` | `.w-control-sm` / `.min-w-control-sm` | `16px` (`1.0rem`) | `.icon-sm` |
| `md` | `36px` (`2.25rem`) | `--control-height-md` | `.h-control-md` / `.min-h-control-md` | `.w-control-md` / `.min-w-control-md` | `18px` (`1.125rem`) | `.icon-md` |
| `lg` | `40px` (`2.5rem`) | `--control-height-lg` | `.h-control-lg` / `.min-h-control-lg` | `.w-control-lg` / `.min-w-control-lg` | `20px` (`1.25rem`) | `.icon-lg` |
| `xl` | `44px` (`2.75rem`) | `--control-height-xl` | `.h-control-xl` / `.min-h-control-xl` | `.w-control-xl` / `.min-w-control-xl` | `24px` (`1.5rem`) | `.icon-xl` |

---

## 3. Page Layout & Container System

Pages compose using `<AppPage size="...">` rather than arbitrary `max-w-*` strings:

| Size | Max Width | Semantic Purpose | Example Views |
| :--- | :--- | :--- | :--- |
| `compact` | `26rem` (416px) | Authentication dialogs, compact modals | Login, ResetPassword |
| `form` | `47rem` (~752px) | Multi-step wizards, focused forms, settings | AddScore, AccountSettings, Checkout |
| `standard` | `64rem` (1024px) | History lists, hub overviews, documentation | PracticeHub, PracticeHistory, Help |
| `wide` | `80rem` (1280px) | Full repertoire grids, score details | Library, ScoreDetail, Performances |
| `full` | `100%` | Immersive sheet workspaces | Editor, PracticeSession |

---

## 4. Component Primitives Guide

### 4.1 Button

All variants own their typography and consume canonical control/icon tokens:

| Variant Key | Height Token | Typography Token | Icon Token | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `xs` | `h-control-xs` (`28px`) | `.type-caption` | `icon-xs` (`14px`) | Miniature inline action chips |
| `sm` | `h-control-sm` (`32px`) | `.type-body-small font-medium` | `icon-sm` (`16px`) | Compact secondary actions |
| `md` / `default` | `h-control-md` (`36px`) | `.type-body-small font-medium` | `icon-sm` (`16px`) | Standard buttons, dialog actions |
| `lg` | `h-control-xl` (`44px`) | `.type-body-small font-semibold`| `icon-md` (`18px`) | Hero CTAs, large stand buttons |
| `icon` | `h-control-md w-control-md` (`36×36px`) | — | `icon-sm` (`16px`) | Square icon trigger |

```jsx
import { Button } from '@/components/ui/button';

// Primary call-to-action (deep green brand)
<Button intent="primary" size="md">Save score</Button>

// Secondary action with paper surface
<Button intent="secondary" size="md">Cancel</Button>

// Quiet button for subtle inline actions
<Button intent="quiet" size="sm">Add page</Button>

// Destructive action
<Button intent="danger" size="md">Delete forever</Button>
```

### 4.2 IconButton

Owns touch target dimensions and child icon scaling:

| Variant Key | Dimensions | Icon Token |
| :--- | :--- | :--- |
| `xs` | `h-control-xs w-control-xs` (`28×28px`) | `icon-xs` (`14px`) |
| `sm` | `h-control-sm w-control-sm` (`32×32px`) | `icon-sm` (`16px`) |
| `md` | `h-control-md w-control-md` (`36×36px`) | `icon-md` (`18px`) |
| `lg` | `h-control-lg w-control-lg` (`40×40px`) | `icon-lg` (`20px`) |

```jsx
import { IconButton } from '@/components/ui/icon-button';
import { Bell, Heart, X } from 'lucide-react';

<IconButton icon={Bell} label="Notifications" tone="quiet" size="md" />
<IconButton icon={Heart} label="Favorite" tone="surface" size="md" />
<IconButton icon={X} label="Close" tone="danger" size="xs" />
```

### 4.3 BackLink

```jsx
import BackLink from '@/components/patterns/BackLink';

<BackLink to="/library" label="Back to Repertoire" />
```

### 4.4 SearchTrigger & Topbar Specifications

- **Topbar Height**: `56px` (`h-14`)
- **SearchTrigger**:
  - Height: `h-control-md min-h-control-md` (`36px`)
  - Width: `w-52` (`208px` laptop), `xl:w-56` (`224px` desktop), `2xl:w-60` (`240px` very wide desktop)
  - Icon: `icon-md` (`18px`)
  - Shortcut badge: `.type-caption`
- **Notification Utility**: `IconButton size="md"` (`36×36px` target, `icon-md` / `18px`)
- **Help Utility**: `IconButton size="md"` (`36×36px` target, `icon-md` / `18px`)
- **Account Trigger**: `h-control-md` (`36px` touch height), `32×32px` avatar, `icon-sm` (`16px`) ChevronDown

### 4.5 Form Field, Input & Select

Inputs and Selects consume `h-control-lg` (`40px`) and `.type-body-small`:

```jsx
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';

<Field
  label="Piece Title"
  htmlFor="title"
  required
  error={errors.title}
  description="As written on your original sheet music."
>
  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} hasError={Boolean(errors.title)} />
</Field>

<Field label="Collection" htmlFor="folder">
  <NativeSelect id="folder" value={folder} onChange={(e) => setFolder(e.target.value)}>
    <option value="">No folder</option>
    {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
  </NativeSelect>
</Field>
```

### 4.6 Flow Components: Stepper & ChoiceCard

- `<Stepper>`: Step completion checkmark consumes `icon-xs` (`14px`), label consumes `.type-label`.
- `<ChoiceCard>`: Icon badge container consumes `h-control-md w-control-md` (`36×36px`) with `icon-md` (`18px`).

```jsx
import { Stepper } from '@/components/patterns/Stepper';
import { ChoiceCard } from '@/components/patterns/ChoiceCard';
import { Upload } from 'lucide-react';

<Stepper
  current={step}
  steps={['Source', 'Files', 'Details', 'Confirm']}
  onStepClick={(s) => setStep(s)}
/>

<ChoiceCard
  icon={Upload}
  title="Upload PDF"
  description="One or more pages from your device"
  selected={source === 'pdf'}
  onClick={() => setSource('pdf')}
/>
```

### 4.7 Surfaces: Surface & MusicPaper

- Use `<MusicPaper>` when representing an **actual physical or living musical score**.
- Use `<Surface tone="panel" elevation="paper">` for general application containers, dialogs, summaries, and cards.
- **Do not** wrap every trivial element in a card. Let whitespace separate content naturally.

---

## 5. Verification & Automated Guardrails

To verify Design System compliance:

```bash
# Automated Design System linter & token integrity validator
npm run check:design-system

# Codebase ESLint verification
npm run lint

# TypeScript / JSDoc typecheck
npm run typecheck

# Production build check
npm run build
```

The Design System interactive preview is accessible in development mode at `/design-system` (strictly gated behind `import.meta.env.DEV`).
