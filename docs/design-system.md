# Yueora Design System & Frontend UI Architecture

> **Core Principle:** *Pages compose. The Design System decides appearance.*

Yueora is a **Warm Editorial Music Workspace**. The Design System exists to ensure that every surface reflects tactile warm paper, near-black editorial authority, calm musical progression, dignified serif and sans typography, softer geometry, and accessible interaction without page-level visual drift.

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

Repeated product hierarchy roles use semantic typography roles. Do not override a semantic typography role with conflicting manual font sizes.

- **Editorial & Display Typography:** Fraunces (`--font-display`, `--font-heading`) delivers literary elegance, warmth, and acoustic authority with optical size variations.
- **Functional Typography:** Inter (`--font-body`) delivers legibility across all controls, forms, metadata, and body reading text.

| Semantic Class | Target Role | Baseline Size | Line Height | Tracking | Font Family |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.type-hero-title` | Marketing page primary hero headline | `clamp(3.25rem, 7vw, 5.5rem)` | `1.02` | `-0.02em` | Fraunces (500) |
| `.type-marketing-title` | Marketing chapter / section titles | `clamp(2rem, 4.5vw, 3.25rem)` | `1.08` | `-0.02em` | Fraunces (500) |
| `.type-eyebrow` | Public and editorial overlines & chapter tags | `11px` (`0.6875rem`) | `1.4` | `0.34em` | Inter (600, uppercase) |
| `.type-editorial-quote` | Philosophy, pull quotes & reflections | `clamp(1.25rem, 2vw, 1.625rem)` | `1.5` | Normal | Fraunces (400, italic) |
| `.type-marketing-body` | Marketing lead paragraphs & introductory copy | `18px` (`1.125rem`) | `1.65` | Normal | Inter (400) |
| `.type-display` | Editorial display titles & brand headlines | `clamp(2rem, 4vw, 3.25rem)` | `1.1` | `-0.02em` | Fraunces (500) |
| `.type-experience-title` | Core musical space titles (Repertoire, Practice Hub, Preserved Moments) | Mobile `28px` (`1.75rem`), Desktop `34px` (`2.125rem`) | `1.2` | `-0.015em` | Fraunces (500) |
| `.type-page-title` | Application page headings | Mobile `26px` (`1.625rem`), Desktop `30px` (`1.875rem`) | `1.2–1.25` | `-0.015em` | Fraunces (500) |
| `.type-section-title` | Major section headings | Mobile `20px` (`1.25rem`), Desktop `22px` (`1.375rem`) | `1.3–1.35` | `-0.01em` | Fraunces (500) |
| `.type-subsection` | Subsections & card titles | `16px` (`1rem`) | `1.4` | Normal | Inter (600) |
| `.type-body` | Primary editorial reading text | `16px` (`1rem`) | `1.6` | Normal | Inter (400) |
| `.type-body-small` | Secondary UI copy & descriptions | `14px` (`0.875rem`) | `1.55` | Normal | Inter (400) |
| `.type-label` | Form labels & navigation items | `14px` (`0.875rem`) | `1.4` | Normal | Inter (500) |
| `.type-caption` | Micro-labels, step badges & editorial eyebrows | `11px` (`0.6875rem`) | `1.4` | `0.2em` | Inter (600, uppercase) |
| `.type-metadata` | Timestamps, counters & helper text | `13px` (`0.8125rem`) | `1.45` | Normal | Inter (400) |
| `.type-metric` | Large reflective numbers & hours | Mobile `28px` (`1.75rem`), Desktop `32px` (`2rem`) | `1.0` | Tabular | Fraunces (500) |

> [!NOTE] Caption vs. Metadata Boundary
> `.type-caption` is strictly for short uppercase micro-labels, category tags, table column headers, status badges, and overlines/eyebrows (uppercase, `0.2em` tracking). It must **never** be used for full sentences or toggle descriptions. For helper text, toggle descriptions, timestamps, and secondary explanatory sentences, always use `.type-metadata` (sentence case, natural tracking).

> [!IMPORTANT] Page Typography Ownership Contract
> **Pages compose. The Design System decides appearance.**
> - **Serif tells the story. Sans explains the product.** Fraunces is reserved for identity, titles, musical voice, and reflective editorial moments; Inter is for controls, reading copy, explanations, and metadata.
> - All pages under `src/pages/**` must strictly consume the 16 canonical semantic `type-*` roles.
> - Raw font-size utilities (`text-xs..6xl`), raw `font-display`, raw `uppercase`, and raw tracking utilities are **banned** in page JSX and enforced by `npm run check:design-system`.
> - Rare exceptions (e.g. ambient oversized watermarks, OTP pin tracking) require an explicit, non-trivial `{/* ds-allow: <specific reason> */}` comment. Generic reasons like "marketing" or "custom" are prohibited and rejected by CI.
> - Shared domain components (e.g. `ScoreCanvas`, `VirtualKeyboard`) own domain-specific coordinate typography.

### 2.2 Color Vocabulary & Usage Contract (WCAG 2.2 AA)

Yueora enforces **one canonical visual language**: a **Warm Editorial Music Workspace (v2)**.
- **Warm charcoal is identity:** The primary brand color (`--brand`) is warm charcoal (`#211F1D` / `30 6% 12%`).
- **Terracotta is accent:** The accent color (`--accent`, `--ring`) is terracotta (`#C06C47` / `18 44% 54%`).
- **Warm ivory canvas:** The global backdrop (`--surface-canvas`) is warm ivory (`#FAF8F5` / `40 33% 98%`).
- **White content panels:** Standard panels (`--surface-panel`) are clean white (`#FFFFFF` / `0 0% 100%`).
- **Color is functional:** Color is reserved strictly for functional feedback (success green for practice following/correct notes, amber for resyncing warnings, terracotta red for alerts/errors, gold for favorites/sounding keys, terracotta accent for focus rings and cues).
- **No royal blue:** The UGC royal blue accent (`#2B58BF`) is strictly prohibited.
- **No forest green brand:** Legacy forest green is retired as a brand color.

#### Canonical Roles:

> [!NOTE] Single Source of Truth for Physical Values
> All physical HSL values are centrally defined and maintained in `src/index.css`. The Design System documentation defines token names, semantic roles, usage contracts, and boundaries.

- **Ink (Text):**
  - `text-ink-primary`: Warm charcoal identity (`#211F1D`). Main titles, buttons, and high-emphasis reading copy (>10:1 contrast).
  - `text-ink-secondary`: Secondary descriptions, timestamps, and labels (>7:1 contrast).
  - `text-ink-tertiary`: Readable muted copy and metadata (>=4.5:1 contrast).
  - `text-ink-subtle`: Strictly non-textual dividers and subtle glyphs.
- **General UI Surfaces (3 Canonical Surfaces):**
  - `bg-surface-canvas`: Global backdrop canvas — warm ivory off-white (`#FAF8F5`), never pure gray and never green.
  - `bg-surface-panel`: Pure white functional container surface for primary nav sidebar, dialogs, cards, forms, inputs, resume modules, list panels, pricing cards, and musical notation containers. Flat by default (NO `shadow-xs`). Musical notation is domain content and uses this standard panel.
  - `bg-surface-raised`: Elevated overlay surface (menus, popovers, floating toolbars) with `shadow-overlay` or `shadow-raised`.
- **Secondary Navigation Shell (Implementation Detail):**
  - `bg-surface-subrail`, `border-line-subrail`: Subtle, distinct secondary navigation rail surface and border for collection/folder exploration.
- **Lines & Borders:**
  - `border-line-subtle`: Quiet structural dividers and panel borders (`#E3DFD8`).
  - `border-line-strong`: Stronger borders for unfocused controls, switches, checkboxes (`#C7C2BA`).
  - `border-line-subrail`: Distinctive divider for secondary navigation rails.
- **Brand & Active States:**
  - `bg-brand`: Warm charcoal identity (`#211F1D`) for primary CTA buttons, strong emphasis, and selection indicator.
  - `bg-brand-hover`: Warm charcoal hover tone (`#312D2A`).
  - `bg-brand-soft`: Warm neutral selected background (`#ECE8E1`).
  - `text-brand-soft-foreground`: Warm charcoal text on selected background (`#211F1D`).
- **Neutral Quiet & Hover & Navigation Active:**
  - `bg-neutral-muted`: Warm ivory-neutral for **Navigation Active items** (`bg-neutral-muted font-semibold text-ink-primary` - NO shadow), passive badges, tab tracks, progress backgrounds.
  - `bg-neutral-hover`: Warm neutral hover state for all interactive items, navigation links, and dropdown items (warm ivory-gray, NEVER green).
- **Navigation Active Contract:**
  - Inactive: `text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary`
  - Active: `bg-neutral-muted font-semibold text-ink-primary` with subtle `text-brand` or `text-accent` icon cue (NO shadow).
  - Uniform across `SidebarNavItem`, `LibrarySubRail`, `Settings`, and `Help`.
- **Semantic Feedback:**
  - `text-success` / `bg-success`: Subdued musical confirmation green.
  - `text-warning` / `bg-warning`: Warm amber for pending or verification notices.
  - `text-danger` / `bg-danger`: Non-punitive alert terracotta red.
  - `text-info` / `bg-info`: Warm neutral informational notice.
  - `text-accent`: Terracotta accent indicator for focus rings, checkmarks, active cues.

#### Color Usage Matrix:

| UI Context | Default Surface | Hover Surface | Active / Selected | Border | Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Button** | `bg-brand` | `bg-brand-hover` | `bg-brand-hover` | `border-transparent` | `text-white` |
| **Secondary Button** | `bg-surface-panel` | `bg-neutral-hover` | `bg-neutral-muted` | `border-line-subtle` | `text-ink-primary` |
| **Quiet Button** | `transparent` | `bg-neutral-hover` | `bg-neutral-muted` | `border-transparent` | `text-ink-secondary` |
| **Danger Button** | `bg-danger` | `bg-danger/90` | `bg-danger` | `border-transparent` | `text-white` |
| **Dropdown Item** | `transparent` | `bg-neutral-hover` | `bg-neutral-muted` | `none` | `text-ink-primary` |
| **Tab Trigger** | `transparent` | `bg-neutral-hover` | `bg-surface-panel` | `none` | `text-ink-primary` |
| **Filter Pill (Compact)** | `transparent` | `bg-neutral-hover` | `bg-brand-soft` | `border-line-subtle` | `text-brand-soft-foreground` |
| **ChoiceCard (Large)** | `bg-surface-panel` | `bg-neutral-hover` | `bg-neutral-hover` | `border-brand` | `text-ink-primary` |
| **Standard Card / Score Container** | `bg-surface-panel` | `bg-surface-panel` | `border-brand` | `border-line-subtle` | `text-ink-primary` |
| **Form Input** | `bg-surface-panel` | `bg-surface-panel` | `ring-brand/20 border-brand` | `border-line-subtle` | `text-ink-primary` |
| **Neutral Badge** | `bg-neutral-muted` | — | — | `border-transparent` | `text-ink-secondary` |
| **Selected Badge (Compact)**| `bg-brand-soft` | — | — | `border-transparent` | `text-brand-soft-foreground` |

#### Primitive Physical Palette (16 Core Primitives):

Yueora's visual vocabulary is rich in semantic roles, but strictly restrained in underlying physical colors. Pages and domain components **never** consume primitive tokens directly; they compose semantic tokens. Physical HSL definitions reside exclusively in `src/index.css`.

| Primitive Color Token | Semantic Consumers | Design System Role |
| :--- | :--- | :--- |
| `--primitive-neutral-0` | `surface-panel`, `surface-raised`, `*-foreground` | Pure White: panels, clean cards, overlay popovers, button text |
| `--primitive-neutral-25` | `surface-canvas` | Warm Ivory Canvas: global page backdrop (`#FAF8F5`) |
| `--primitive-neutral-50` | `surface-subrail` | Warm Neutral: secondary navigation rail, preserved takes |
| `--primitive-neutral-75` | `neutral-hover`, `brand-soft`, `selection`, `info` | Neutral Hover / Selected Soft: perceptible interactive hover contrast (`#ECE8E1`) |
| `--primitive-neutral-100` | `neutral-muted`, `line-subtle`, `subrail-border` | Neutral Muted: quiet borders, passive tracks, nav active background (`#E3DFD8`) |
| `--primitive-neutral-200` | `line-strong` | Neutral Strong: control borders, checkboxes, switches (`#C7C2BA`) |
| `--primitive-neutral-300` | `ink-subtle` | Neutral Subtle: quiet dividers, passive iconography |
| `--primitive-ink-500` | `ink-tertiary` | Ink Tertiary: readable muted metadata (>=4.5:1 WCAG AA contrast) |
| `--primitive-ink-700` | `ink-secondary`, `neutral-muted-foreground`, `practice-waiting` | Ink Secondary: secondary body copy, timestamps (>7:1 contrast) |
| `--primitive-ink-800` | `brand-hover` | Ink Strong: primary CTA pressed/hover state (`#312D2A`) |
| `--primitive-ink-900` | `brand`, `ink-primary`, `neutral-hover-foreground` | Warm Charcoal Identity: primary CTA, titles, selection cues (`#211F1D`) |
| `--primitive-gold-500` | `gold`, `practice-current` | Musical Accent: favorite stars, sounding key / notation accent |
| `--primitive-success-500` | `success`, `practice-following`, `practice-correct` | Functional Success: positive feedback (>=4.5:1 WCAG AA contrast) |
| `--primitive-warning-500` | `warning`, `practice-resyncing` | Functional Warning: pending device access, resyncing tempo |
| `--primitive-danger-500` | `danger`, `practice-error` | Functional Alert: terracotta destructive action (>=4.5:1 contrast) |
| `--primitive-terracotta-500` | `accent`, `ring` | Terracotta Accent: focus rings, check cues, badges (`#C06C47`) |

#### Practice Domain Palette Mapping:

Practice runtime conveys musical feedback without looking like a rainbow arcade game:

| Practice Semantic Role | Mapped Primitive Token | Visual Purpose |
| :--- | :--- | :--- |
| `practice-following` | `--primitive-success-500` | Active listening lock on current note |
| `practice-correct` | `--primitive-success-500` | Accurately played note confirmation |
| `practice-waiting` | `--primitive-ink-700` | Paused / waiting for musician input |
| `practice-resyncing` | `--primitive-warning-500` | Tempo drift / resyncing cursor cue |
| `practice-current` | `--primitive-gold-500` | Active sounding note / piano key illumination |
| `practice-error` | `--primitive-danger-500` | Pitch or rhythm correction prompt |

### 2.3 Unified Product Grammar & 3 General UI Surfaces

Authenticated application layout converges on 3 canonical surfaces with zero notation exceptions:

1. **App Canvas (`bg-surface-canvas`):** Warm ivory backdrop for all application views (`#F8F6F1`).
2. **Standard Content Panel (`bg-surface-panel`):** Universal clean white container with `border border-line-subtle` and `rounded-container` (flat by default, no shadow). All application cards, list containers, resume modules, stats, pricing cards, forms, and musical notation containers use this universal container.
3. **Floating Raised Overlays (`bg-surface-raised`):** Elevated overlay surface with `shadow-overlay` or `shadow-raised` (popovers, menus, modal dialogs, search trigger).

### 2.4 Marketing Surface Rhythm Contract (Landing Page)

Full-width marketing page sections strictly alternate between two canonical surfaces: `surface-canvas` (warm ivory) and `surface-panel` (editorial white).
**Banned on full-width sections:** `bg-neutral-muted`, `bg-brand`.

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

### 2.5 Canonical Control Scale & Icon Sizing

One visual decision has one owner. All interactive controls, inputs, and icon elements consume these exact dimensions:

| Size Key | Control Dimension | CSS Height Variable | Height & Min-Height Utilities | Width & Min-Width Utilities | Icon Size | Icon Utility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `xs` | `28px` (`1.75rem`) | `--control-height-xs` | `.h-control-xs` / `.min-h-control-xs` | `.w-control-xs` / `.min-w-control-xs` | `14px` (`0.875rem`) | `.icon-xs` |
| `sm` | `32px` (`2.0rem`) | `--control-height-sm` | `.h-control-sm` / `.min-h-control-sm` | `.w-control-sm` / `.min-w-control-sm` | `16px` (`1.0rem`) | `.icon-sm` |
| `md` | `36px` (`2.25rem`) | `--control-height-md` | `.h-control-md` / `.min-h-control-md` | `.w-control-md` / `.min-w-control-md` | `18px` (`1.125rem`) | `.icon-md` |
| `lg` | `40px` (`2.5rem`) | `--control-height-lg` | `.h-control-lg` / `.min-h-control-lg` | `.w-control-lg` / `.min-w-control-lg` | `20px` (`1.25rem`) | `.icon-lg` |
| `xl` | `44px` (`2.75rem`) | `--control-height-xl` | `.h-control-xl` / `.min-h-control-xl` | `.w-control-xl` / `.min-w-control-xl` | `24px` (`1.5rem`) | `.icon-xl` |

### 2.6 Refined Geometry & Flat UI Contract

- **Radius Tokens:**
  - Control radius: `--radius-control: 0.625rem` (`10px`) for buttons, icon buttons, inputs, selects, dropdown menus, nav items.
  - Container radius: `--radius-container: 0.75rem` (`12px`) for panels, cards, modules.
  - Overlay radius: `--radius-overlay: 0.75rem` (`12px`) for popovers, menus, dialogs.
  - Button geometry: standard controls (`rounded-control`, 10px geometry).
  - Badge geometry: pill badges (`rounded-full`).
  - **Zero Arbitrary & Generic Radii:** Arbitrary radius utilities (`rounded-[...]`) and generic Tailwind radius utilities (`rounded`, `rounded-sm..3xl`, and directional variants) are banned across all application pages in `src/pages/**`. Pages must strictly use semantic radii (`rounded-control`, `rounded-container`, `rounded-overlay`, and justified `rounded-full` for badges/pills/dots).
- **Flat Controls & Flat Content Panels:** Ordinary controls and standard content panels are flat by default (no `shadow-xs` on secondary buttons, inputs, checkboxes, or static panels). Repetitive panel patterns (`rounded-container border border-line-subtle bg-surface-panel`) should compose `<Surface padding="...">`.
- **Media-Driven Elevation:** Shadows are strictly reserved for elevated overlays (`shadow-raised` / `shadow-overlay` on menus, popovers, modal dialogs) and floating media artwork. Arbitrary shadows (`shadow-[...]`) and generic Tailwind shadows (`shadow-sm`, `shadow-md`, etc.) are banned in page code.

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

Yueora enforces a contracted, single-owner Button API. **Pages compose; Button completely owns appearance.**

#### Canonical Yueora Button API
- **Geometry:** Standard controls (`rounded-control`, 10px geometry).
- **Single Prop Contract:** Button exposes a single semantic prop: `intent`. The legacy `variant` prop and legacy aliases (`default`, `outline`, `ghost`, `destructive`) are permanently retired and banned in CI.
- **Intents:**
  - `primary`: Warm charcoal (`#211F1D`) identity CTA with white text.
  - `secondary`: Planar white panel (`bg-surface-panel`) with subtle line (`border-line-subtle`).
  - `quiet`: Subtle action with neutral hover (`hover:bg-neutral-hover`).
  - `danger`: Terracotta alert action for destructive confirmation (`bg-danger text-white`).
  - `subtle`: Neutral muted action (`bg-neutral-muted`).
  - `link`: Inline text action with underline hover.
  - `inverse`: High-contrast ivory action (`bg-surface-canvas text-ink-primary`) for dark editorial surfaces.
  - `inverse-secondary`: High-contrast transparent outlined action (`border border-surface-canvas/30 text-surface-canvas`) for dark surfaces.
- **Sizes (5 Canonical Tiers):** `xs` (`28px`), `sm` (`32px`), `md` (`36px`, default), `lg` (`40px`), `xl` (`44px`). Legacy `hero` (`52px`) and `default` sizes are retired; button sizes map 1:1 with the canonical control tokens `--control-height-xs..xl`.
- **Icon-Only Actions:** Dedicated primitive `<IconButton>` is used for all icon-only triggers.
- **Appearance Ownership:** Pages compose buttons via `intent` and `size`. Pages MUST NOT override button colors, borders, shadows, or radii in `className`.

| Size Key | Height Token | Typography Token | Icon Token | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `xs` | `h-control-xs` (`28px`) | `.type-caption` | `icon-xs` (`14px`) | Miniature inline action chips |
| `sm` | `h-control-sm` (`32px`) | `.type-body-small font-medium` | `icon-sm` (`16px`) | Compact secondary actions |
| `md` | `h-control-md` (`36px`) | `.type-body-small font-medium` | `icon-sm` (`16px`) | Standard buttons, dialog actions |
| `lg` | `h-control-lg` (`40px`) | `.type-body-small font-semibold`| `icon-md` (`18px`) | Large buttons, public header CTA |
| `xl` | `h-control-xl` (`44px`) | `.type-body-small font-semibold`| `icon-md` (`18px`) | Stand buttons, prominent hero actions |

```jsx
import { Button } from '@/components/ui/button';

// Primary call-to-action (near-black brand)
<Button intent="primary" size="md">Save score</Button>

// Neutral secondary action
<Button intent="secondary" size="md">Cancel</Button>

// Quiet button for subtle inline actions
<Button intent="quiet" size="sm">Add page</Button>

// Destructive action
<Button intent="danger" size="md">Delete forever</Button>

// High-contrast action on dark editorial cards
<Button intent="inverse" size="xl">Start playing</Button>
```

### 4.2 IconButton

Owns touch target dimensions and child icon scaling with circular geometry (`rounded-full`):

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
<IconButton icon={Heart} label="Favorite" tone="outline" size="md" />
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

Inputs and Selects consume `h-control-lg` (`40px`), `rounded-control` (12px), and `.type-body-small`. Planar (no `shadow-xs`):

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

### 4.7 Surfaces: Surface

- Use `<Surface tone="panel">` for general application containers, dialogs, summaries, score workspaces, and cards (flat by default; use `elevation="raised"` or `elevation="overlay"` only when contextual elevation is required).
- Musical notation is domain content and renders within the standard `Surface` container.
- **Do not** wrap every trivial element in a card. Let whitespace separate content naturally.

### 4.8 Primitive Appearance Ownership Contract

> **One visual decision has one owner. Primitives own appearance; pages own composition.**

1. **Button & IconButton Ownership:**
   - `<Button>` and `<IconButton>` completely own visual styling (background, border, radius, height, padding, gap, typography, hover, active, focus states).
   - Enforced via a strict **Composition Allowlist**: page consumers may ONLY pass external composition layout utilities (`w-*`, `min-w-*`, `max-w-*`, `flex-1`, `shrink-0`, `self-*`, `m-*`) with responsive modifiers only (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).
   - Arbitrary selector variants (`[&>svg]:`, `[&_svg]:`, `[&>*]:`) and non-composition utilities (e.g. `bg-*`, `text-*`, `border-*`, `shadow-*`, `ring-*`, `font-*`, `opacity-*`, `backdrop-*`, `animate-*`) are banned.
   - Dynamic or unanalyzable `className` expressions and JSX spread attributes (`{...props}`) on Button or IconButton are prohibited and fail closed across named, namespace, and local variable aliasing patterns.

2. **Overlay Primitive Ownership (`DialogContent`, `DropdownMenuContent`, `PopoverContent`):**
   - Overlay primitives define their canonical background (`bg-surface-panel` / `bg-surface-raised`), borders (`border-line-subtle`), radius (`rounded-container` / `rounded-overlay`), and elevation (`shadow-overlay`).
   - Enforced via an **Overlay Composition Allowlist**: page consumers may only pass sizing and overflow constraints (`w-*`, `min-w-*`, `max-w-*`, `h-*`, `min-h-*`, `max-h-*`, `overflow-*`) with responsive modifiers only.
   - Dynamic unanalyzable className and JSX spread attributes on overlay primitives fail closed across named, namespace, and local variable aliases.

3. **Surface Primitive Ownership (`<Surface>`):**
   - `<Surface>` completely owns surface tones (`panel`, `canvas`, `raised`), container border (`border-line-subtle`), radius (`rounded-container`), elevations (`none`, `raised`, `overlay`), and interaction/hover/motion identity.
   - Page consumers MUST NOT pass background, border, radius, shadow, ring, hover, focus, active, transition, duration, ease, translate, or group utilities in `className`.
   - Consumer `className` on `<Surface>` is strictly restricted to layout, grid, flex, position, and spacing composition with responsive modifiers only.

4. **Elevation Ownership (`shadow-overlay`, `shadow-raised`):**
   - Direct usage of `shadow-overlay` or `shadow-raised` on arbitrary `<div>` or layout elements in `src/pages/**` is banned.
   - Elevation belongs exclusively to canonical overlay primitives or `<Surface elevation="overlay|raised">`.

---

## 5. Verification & Automated Guardrails

To verify Design System compliance:

```bash
# Automated Design System linter & token integrity validator (AST appearance guard)
npm run check:design-system

# Guardrail AST regression test suite (negative + positive production-guard fixtures; executed in CI)
npm run test:design-system-guardrails

# Codebase ESLint verification
npm run lint

# TypeScript / JSDoc typecheck
npm run typecheck

# Production build check
npm run build
```

The Design System interactive preview is accessible in development mode at `/design-system` (strictly gated behind `import.meta.env.DEV`).

---

## 6. Architecture Freeze Policy

The Yueora Design System architecture is **formally frozen**.

- **No New Layers or Paradigms:** The 6-tier architecture (Foundations → Semantic Tokens → Primitives → Yueora Patterns → Domain Components → Page Composition) is locked.
- **No Token Sprawl:** Do not introduce new color tokens, arbitrary surfaces, or redundant semantic variants. Reuse existing tokens.
- **Planar Panel Standard:** Standard panels and content containers are flat by default (`bg-surface-panel border-line-subtle rounded-container`). Ordinary content panels, list views, score stands, and settings forms must not add `shadow-xs`.
- **Neutral Active Navigation:** Navigation items and segmented controls use canonical neutral active states (`bg-neutral-muted text-ink-primary font-semibold`) with zero drop shadows.
- **Zero Domain Surface Exceptions:** Sheet music and musical notation are domain content types, not separate Design System surfaces. All score rendering uses standard `surface-panel`.
- **Pages Compose:** Future feature development and page additions must compose existing primitives and semantic tokens rather than inventing page-level visual styles.
