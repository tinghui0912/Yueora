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
| `.type-hero-title` | Marketing page primary hero headline | `clamp(2.5rem, 5vw, 4rem)` | `1.05` | `-0.025em` | Newsreader (500) |
| `.type-marketing-title` | Marketing chapter / section titles | `clamp(1.875rem, 3.5vw, 2.75rem)` | `1.15` | `-0.02em` | Newsreader (500) |
| `.type-editorial-quote` | Philosophy, pull quotes & reflections | `clamp(1.25rem, 2vw, 1.5rem)` | `1.5` | Normal | Newsreader (400, italic) |
| `.type-marketing-body` | Marketing lead paragraphs & introductory copy | `18px` (`1.125rem`) | `1.65` | Normal | Plus Jakarta Sans (400) |
| `.type-display` | Editorial display titles & brand headlines | `clamp(2rem, 4vw, 3rem)` | `1.1` | `-0.02em` | Newsreader |
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
- **Surfaces & Simplified 3-Surface Model:**
  - `bg-surface-canvas` (`hsl(44 19% 97%)`): Global backdrop canvas — warm ivory off-white, never pure gray and never green.
  - `bg-surface-panel` (`hsl(0 0% 100%)`): Pure white functional container surface for primary nav sidebar, dialogs, cards, forms, inputs, resume modules, list panels, and pricing cards.
  - `bg-surface-subrail` (`hsl(44 18% 95%)`): Subtle, distinct secondary navigation rail surface for collection and folder exploration.
  - `bg-surface-raised` (`hsl(0 0% 100%)`): Elevated overlay surface (menus, popovers, floating toolbars).
  - `bg-surface-paper` (`hsl(44 26% 96%)`): Archival paper tone **strictly reserved for score artifacts and musical notation canvases**.
  - **Retired Tokens:** `brand-wash` and `surface-paper-warm` are permanently retired from product code.
- **Lines & Borders:**
  - `border-line-subtle` (`hsl(47 14% 91%)`): Quiet structural dividers and panel borders.
  - `border-line-strong` (`hsl(47 13% 80%)`): Stronger borders for unfocused controls, switches, checkboxes.
  - `border-line-subrail` (`hsl(47 14% 88%)`): Distinctive divider for secondary navigation rails.
  - `border-surface-paper-edge` (`hsl(44 16% 87%)`): Score paper boundary.
- **Brand & Active States:**
  - `bg-brand` (`hsl(148 36% 27%)`): Deep forest green for primary CTA buttons, strong emphasis, and checkmark indicators. Brand is an accent, never a full-width background system.
  - `bg-brand-hover` (`hsl(148 36% 22%)`): Darker forest green for primary CTA hover.
  - `bg-brand-soft` (`hsl(148 36% 93%)`): **Compact Selected Content State Only.** Pale green is strictly reserved for compact selected content items (filter badges, small tags, compact ChoiceCard badges) where the small surface area keeps it visually subordinate.
    - **Large Selection Contract:** Wide horizontal rows, large selectable options (e.g. Practice Setup option rows), and full-width list items are **banned** from `bg-brand-soft`. They must use neutral selected surface (`bg-neutral-hover` or `bg-surface-panel`) paired with a brand indicator (`border-brand`, green radio dot, or `text-brand` checkmark).
    - **Maximum 2 Brand Signals per selection state:** Never stack green background + green border + green text + green icon. Selection should be understood, not painted.
    - **Drag Targets:** Dragging state is not selection; use `border-brand bg-surface-canvas text-brand`, never `bg-brand-soft`.
    - **Control Toggles:** Loop/toggle buttons use `border-brand bg-neutral-muted text-ink-primary shadow-xs` with `text-brand` icon, not `bg-brand-soft`.
    - It remains **BANNED** on navigation active items, ordinary hovers, buttons/actions, status/verification icons, popular badges, chart bars, and decorative icon circles.
  - `text-brand-soft-foreground` (`hsl(148 36% 27%)`): Contrast foreground text on pale green surfaces.
- **Neutral Quiet & Hover & Navigation Active:**
  - `bg-neutral-muted` (`hsl(44 14% 92%)`): Warm ivory-neutral for **Navigation Active items** (`bg-neutral-muted font-semibold text-ink-primary shadow-xs`), passive badges, tab tracks, progress backgrounds.
  - `bg-neutral-hover` (`hsl(44 16% 91%)`): Warm neutral hover state for all interactive items, navigation links, and dropdown items (warm ivory-gray, NEVER green).
- **Navigation Active Contract:**
  - Inactive: `text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary`
  - Active: `bg-neutral-muted font-semibold text-ink-primary shadow-xs` with subtle `text-brand` icon cue.
  - Uniform across `SidebarNavItem`, `LibrarySubRail`, `Settings`, and `Help`.
- **Semantic Feedback:**
  - `text-success` / `bg-success`: Subdued musical confirmation green (`hsl(148 40% 32%)`).
  - `text-warning` / `bg-warning`: Warm amber for pending or verification notices (`hsl(38 76% 40%)`).
  - `text-danger` / `bg-danger`: Non-punitive alert terracotta red (`hsl(0 62% 44%)`).
  - `text-info` / `bg-info`: Soft instructional slate blue (`hsl(204 45% 40%)`).

#### Color Usage Matrix:

| UI Context | Default Surface | Hover Surface | Active / Selected | Border | Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Button** | `bg-brand` | `bg-brand-hover` | `bg-brand-hover` | `border-transparent` | `text-white` |
| **Secondary Button** | `bg-surface-panel` | `bg-neutral-hover` | `bg-neutral-muted` | `border-line-strong/80` | `text-ink-primary` |
| **Quiet Button** | `transparent` | `bg-neutral-hover` | `bg-neutral-muted` | `border-transparent` | `text-ink-secondary` |
| **Danger Button** | `bg-danger` | `bg-danger/90` | `bg-danger` | `border-transparent` | `text-white` |
| **Dropdown Item** | `transparent` | `bg-neutral-hover` | `bg-neutral-muted` (with brand cue) | `none` | `text-ink-primary` |
| **Tab Trigger** | `transparent` | `bg-neutral-hover` | `bg-surface-panel` | `none` | `text-ink-primary` |
| **Filter Pill (Compact)** | `transparent` | `bg-neutral-hover` | `bg-brand-soft` | `border-line-subtle` | `text-brand-soft-foreground` |
| **ChoiceCard (Large)** | `bg-surface-panel` | `bg-neutral-hover` | `bg-neutral-hover` | `border-brand` | `text-ink-primary` |
| **Standard Card** | `bg-surface-panel` | `bg-surface-panel` | `border-brand` | `border-line-subtle` | `text-ink-primary` |
| **Notation Canvas** | `bg-surface-paper` | — | — | `border-surface-paper-edge` | `text-ink-primary` |
| **Form Input** | `bg-surface-panel` | `bg-surface-panel` | `ring-brand/20 border-brand` | `border-line-subtle` | `text-ink-primary` |
| **Neutral Badge** | `bg-neutral-muted` | — | — | `border-transparent` | `text-ink-secondary` |
| **Selected Badge (Compact)**| `bg-brand-soft` | — | — | `border-transparent` | `text-brand-soft-foreground` |

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
| `border-input` | Form input borders | `border-line-subtle` |
| `text-foreground` | Primary text | `text-ink-primary` |

#### Primitive Physical Palette (15 Core Colors + 4 Status = 19 Primitives):

Yueora's visual vocabulary is rich in semantic roles, but strictly restrained in underlying physical colors. Pages and domain components **never** consume primitive tokens directly; they compose semantic tokens.

| Primitive Color Token | Physical Value (HSL) | Semantic Consumers | Design System Role |
| :--- | :--- | :--- | :--- |
| `--primitive-neutral-0` | `0 0% 100%` | `surface-panel`, `surface-raised`, `*-foreground` | Pure White: panels, clean cards, overlay popovers, button text |
| `--primitive-neutral-25` | `44 19% 97%` | `surface-canvas`, `surface-paper` | Warm Ivory Canvas: global page backdrop, tactile archival paper |
| `--primitive-neutral-50` | `44 18% 95%` | `surface-subrail` | Warm Neutral: secondary navigation rail, preserved takes |
| `--primitive-neutral-75` | `44 16% 91%` | `neutral-hover` | Neutral Hover: perceptible interactive hover contrast |
| `--primitive-neutral-100` | `44 14% 92%` | `neutral-muted`, `line-subtle`, `surface-paper-edge`, `subrail-border` | Neutral Muted: quiet borders, passive tracks, nav active background |
| `--primitive-neutral-200` | `47 13% 80%` | `line-strong` | Neutral Strong: control borders, checkboxes, switches |
| `--primitive-neutral-300` | `220 3% 62%` | `ink-subtle` | Neutral Subtle: quiet dividers, passive iconography |
| `--primitive-ink-500` | `220 4% 44%` | `ink-tertiary` | Ink Tertiary: readable muted metadata (>=4.5:1 WCAG AA contrast) |
| `--primitive-ink-700` | `223 4% 36%` | `ink-secondary`, `neutral-muted-foreground`, `practice-waiting` | Ink Secondary: secondary body copy, timestamps (>6.5:1 contrast) |
| `--primitive-ink-900` | `220 5% 13%` | `ink-primary`, `neutral-hover-foreground` | Ink Primary: main page headings, high-emphasis copy (>10:1 contrast) |
| `--primitive-forest-50` | `148 24% 96%` | internal fallback | Internal Forest: legacy compatibility fallback |
| `--primitive-forest-100` | `148 36% 93%` | `brand-soft`, `selection` | Brand Soft: compact selected content only (≤ 32px), score highlights |
| `--primitive-forest-700` | `148 36% 27%` | `brand`, `brand-soft-foreground` | Forest Green Accent: primary CTA, active cues, brand dots |
| `--primitive-forest-800` | `148 36% 22%` | `brand-hover` | Forest Dark: primary CTA pressed/hover state |
| `--primitive-gold-500` | `44 67% 46%` | `gold`, `practice-current` | Musical Accent: favorite stars, sounding key / notation accent |
| `--primitive-success-500` | `148 30% 38%` | `success`, `practice-following`, `practice-correct` | Functional Success: positive feedback (>=4.5:1 WCAG AA contrast) |
| `--primitive-warning-500` | `38 58% 45%` | `warning`, `practice-resyncing` | Functional Warning: pending device access, resyncing tempo |
| `--primitive-danger-500` | `0 65% 45%` | `danger`, `practice-error` | Functional Alert: terracotta destructive action (>=4.5:1 contrast) |
| `--primitive-info-500` | `210 30% 45%` | `info` | Functional Info: instructional notices, guidance callouts (>=4.5:1) |

#### Practice Domain Palette Mapping:

Practice runtime conveys musical feedback without looking like a rainbow arcade game:

| Practice Semantic Role | Mapped Primitive Token | Physical Value | Visual Purpose |
| :--- | :--- | :--- | :--- |
| `practice-following` | `--primitive-success-500` | `148 30% 38%` | Active listening lock on current note |
| `practice-correct` | `--primitive-success-500` | `148 30% 38%` | Accurately played note confirmation |
| `practice-waiting` | `--primitive-ink-700` | `223 4% 36%` | Paused / waiting for musician input |
| `practice-resyncing` | `--primitive-warning-500` | `38 58% 45%` | Tempo drift / resyncing cursor cue |
| `practice-current` | `--primitive-gold-500` | `44 67% 46%` | Active sounding note / piano key illumination |
| `practice-error` | `--primitive-danger-500` | `0 65% 45%` | Pitch or rhythm correction prompt |

### 2.3 Unified Product Grammar & 4-Surface Model

> **Golden Rule of Unified Product Grammar:**
> *Same product, same visual grammar.*
> *Simple before expressive. Consistent before distinctive.*
> *If the standard treatment works, use it.*
> *Semantic meaning does not automatically justify a different visual treatment.*
> *Do not create a new surface, color, shadow, radius, card treatment, page width or component variant merely because a section is important, musical, premium, emotional, featured or memorable.*
> *Visual differences must have functional necessity, not aesthetic preference.*
> *When in doubt, use the standard panel.*

Authenticated application layout converges on a simplified 4-surface model:

1. **App Canvas (`bg-surface-canvas`):** `hsl(44 19% 97%)`. Warm ivory backdrop for all application views.
2. **Standard Content Panel (`bg-surface-panel`):** `hsl(0 0% 100%)` with `border border-line-subtle`, `rounded-container`, and `shadow-xs`. All application cards, list containers, resume modules, stats, pricing cards, and forms use this universal container.
3. **Floating Raised Overlays (`bg-surface-raised`):** `hsl(0 0% 100%)` with `shadow-overlay` (popovers, menus, modal dialogs, search trigger).
4. **Notation Canvas Surface (`bg-surface-paper`):** `hsl(44 19% 97%)` (`MusicPaper`). Strictly reserved for literal sheet music score and stave notation rendering canvases. Banned on generic UI.

### 2.4 Marketing Surface Rhythm Contract (Landing Page)

> **Golden Rule of Restraint:**
> *Restraint creates hierarchy. Brand color is an accent, not a background system.*
> *Structure should be felt, not painted.*

Full-width marketing page sections strictly alternate between two canonical surfaces: `surface-canvas` (warm ivory) and `surface-panel` (editorial white).
**Banned on full-width sections:** `bg-brand-wash`, `bg-surface-paper`, `bg-surface-paper-warm`, `bg-neutral-muted`, `bg-brand`.

| Section | Content Role | Semantic Surface | Border Divider |
| :--- | :--- | :--- | :--- |
| **01. Hero** | Musical Invitation ("Play what you love") | `bg-surface-canvas` | — |
| **02. Philosophy** | 4 Quiet Pillars ("Your music, not ours") | `bg-surface-panel` | `border-t border-line-subtle` |
| **03. Lifecycle** | Paper-to-playable transformation continuum | `bg-surface-canvas` | `border-t border-line-subtle` |
| **04. Repertoire** | Music cabinet ("Not a cloud drive") | `bg-surface-panel` | `border-t border-line-subtle` |
| **05. Practice Stand** | Signature non-judgmental phrase following | `bg-surface-canvas` | `border-t border-line-subtle` |
| **06. Performances** | Preserved takes & memory archive | `bg-surface-panel` | `border-t border-line-subtle` |
| **07. Sharing** | Private sanctuary ("A door you choose to open") | `bg-surface-canvas` | `border-t border-line-subtle` |
| **08. Pricing** | Durable & fair subscription plans | `bg-surface-panel` | `border-t border-line-subtle` |
| **09. FAQ** | Clarity & questions | `bg-surface-canvas` | `border-t border-line-subtle` |
| **10. Final CTA** | Clean editorial closing ("Play what you love") | `bg-surface-panel` | `border-t border-line-subtle` |
| **11. Footer** | Sanctuary credits & quiet legal navigation | `bg-surface-canvas` | `border-t border-line-subtle` |

Contained artifacts within these sections utilize standard `surface-panel` with appropriate elevation, reserving `surface-paper` strictly for literal notation staves.

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
