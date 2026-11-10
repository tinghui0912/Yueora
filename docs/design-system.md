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

Repeated product hierarchy roles should use semantic typography roles. Do not override a semantic typography role with conflicting manual font sizes. Local utility text, compact control copy, marketing composition and domain-specific visual geometry may use constrained Tailwind typography when no reusable semantic role exists.

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

> [!NOTE] Single Source of Truth for Physical Values
> All physical HSL values are centrally defined and maintained in `src/index.css`. The Design System documentation defines token names, semantic roles, usage contracts, and boundaries.

- **Ink (Text):**
  - `text-ink-primary`: Main titles and high-emphasis reading copy (>10:1 contrast).
  - `text-ink-secondary`: Readable secondary descriptions, timestamps, and labels (>6.5:1 contrast).
  - `text-ink-tertiary`: Readable muted copy (>4.5:1 contrast).
  - `text-ink-subtle`: Strictly non-textual dividers and subtle glyphs.
- **General UI Surfaces (3 Canonical Surfaces):**
  - `bg-surface-canvas`: Global backdrop canvas — warm ivory off-white, never pure gray and never green.
  - `bg-surface-panel`: Pure white functional container surface for primary nav sidebar, dialogs, cards, forms, inputs, resume modules, list panels, pricing cards, and musical notation containers. Flat by default (NO `shadow-xs`). Musical notation is domain content and uses this standard panel.
  - `bg-surface-raised`: Elevated overlay surface (menus, popovers, floating toolbars) with `shadow-overlay` or `shadow-raised`.
- **Secondary Navigation Shell (Implementation Detail):**
  - `bg-surface-subrail`, `border-line-subrail`: Subtle, distinct secondary navigation rail surface and border for collection/folder exploration.
- **Lines & Borders:**
  - `border-line-subtle`: Quiet structural dividers and panel borders.
  - `border-line-strong`: Stronger borders for unfocused controls, switches, checkboxes.
  - `border-line-subrail`: Distinctive divider for secondary navigation rails.
- **Brand & Active States:**
  - `bg-brand`: Deep forest green for primary CTA buttons, strong emphasis, and checkmark indicators. Brand is an accent, never a full-width background system.
  - `bg-brand-hover`: Darker forest green for primary CTA hover.
  - `bg-brand-soft`: **Compact Selected Content State Only.** Pale green is strictly reserved for compact selected content items (filter badges, small tags, compact ChoiceCard badges) where the small surface area keeps it visually subordinate.
    - **Large Selection Contract:** Wide horizontal rows, large selectable options (e.g. Practice Setup option rows), and full-width list items are **banned** from `bg-brand-soft`. They must use neutral selected surface (`bg-neutral-hover` or `bg-surface-panel`) paired with a brand indicator (`border-brand`, green radio dot, or `text-brand` checkmark).
    - **Maximum 2 Brand Signals per selection state:** Never stack green background + green border + green text + green icon. Selection should be understood, not painted.
    - **Drag Targets:** Dragging state is not selection; use `border-brand bg-surface-canvas text-brand`, never `bg-brand-soft`.
    - **Control Toggles:** Loop/toggle buttons use `border-brand bg-neutral-muted text-ink-primary` with `text-brand` icon, not `bg-brand-soft`.
    - It remains **BANNED** on navigation active items, ordinary hovers, buttons/actions, status/verification icons, popular badges, chart bars, and decorative icon circles.
  - `text-brand-soft-foreground`: Contrast foreground text on pale green surfaces.
- **Neutral Quiet & Hover & Navigation Active:**
  - `bg-neutral-muted`: Warm ivory-neutral for **Navigation Active items** (`bg-neutral-muted font-semibold text-ink-primary` - NO shadow), passive badges, tab tracks, progress backgrounds.
  - `bg-neutral-hover`: Warm neutral hover state for all interactive items, navigation links, and dropdown items (warm ivory-gray, NEVER green).
- **Navigation Active Contract:**
  - Inactive: `text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary`
  - Active: `bg-neutral-muted font-semibold text-ink-primary` with subtle `text-brand` icon cue (NO shadow).
  - Uniform across `SidebarNavItem`, `LibrarySubRail`, `Settings`, and `Help`.
- **Semantic Feedback:**
  - `text-success` / `bg-success`: Subdued musical confirmation green.
  - `text-warning` / `bg-warning`: Warm amber for pending or verification notices.
  - `text-danger` / `bg-danger`: Non-punitive alert terracotta red.
  - `text-info` / `bg-info`: Soft instructional slate blue.

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
| **Standard Card / Score Container** | `bg-surface-panel` | `bg-surface-panel` | `border-brand` | `border-line-subtle` | `text-ink-primary` |
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

Yueora's visual vocabulary is rich in semantic roles, but strictly restrained in underlying physical colors. Pages and domain components **never** consume primitive tokens directly; they compose semantic tokens. Physical HSL definitions reside exclusively in `src/index.css`.

| Primitive Color Token | Semantic Consumers | Design System Role |
| :--- | :--- | :--- |
| `--primitive-neutral-0` | `surface-panel`, `surface-raised`, `*-foreground` | Pure White: panels, clean cards, overlay popovers, button text |
| `--primitive-neutral-25` | `surface-canvas` | Warm Ivory Canvas: global page backdrop |
| `--primitive-neutral-50` | `surface-subrail` | Warm Neutral: secondary navigation rail, preserved takes |
| `--primitive-neutral-75` | `neutral-hover` | Neutral Hover: perceptible interactive hover contrast |
| `--primitive-neutral-100` | `neutral-muted`, `line-subtle`, `subrail-border` | Neutral Muted: quiet borders, passive tracks, nav active background |
| `--primitive-neutral-200` | `line-strong` | Neutral Strong: control borders, checkboxes, switches |
| `--primitive-neutral-300` | `ink-subtle` | Neutral Subtle: quiet dividers, passive iconography |
| `--primitive-ink-500` | `ink-tertiary` | Ink Tertiary: readable muted metadata (>=4.5:1 WCAG AA contrast) |
| `--primitive-ink-700` | `ink-secondary`, `neutral-muted-foreground`, `practice-waiting` | Ink Secondary: secondary body copy, timestamps (>6.5:1 contrast) |
| `--primitive-ink-900` | `ink-primary`, `neutral-hover-foreground` | Ink Primary: main page headings, high-emphasis copy (>10:1 contrast) |
| `--primitive-forest-50` | internal fallback | Internal Forest: legacy compatibility fallback |
| `--primitive-forest-100` | `brand-soft`, `selection` | Brand Soft: compact selected content only (≤ 32px), score highlights |
| `--primitive-forest-700` | `brand`, `brand-soft-foreground` | Forest Green Accent: primary CTA, active cues, brand dots |
| `--primitive-forest-800` | `brand-hover` | Forest Dark: primary CTA pressed/hover state |
| `--primitive-gold-500` | `gold`, `practice-current` | Musical Accent: favorite stars, sounding key / notation accent |
| `--primitive-success-500` | `success`, `practice-following`, `practice-correct` | Functional Success: positive feedback (>=4.5:1 WCAG AA contrast) |
| `--primitive-warning-500` | `warning`, `practice-resyncing` | Functional Warning: pending device access, resyncing tempo |
| `--primitive-danger-500` | `danger`, `practice-error` | Functional Alert: terracotta destructive action (>=4.5:1 contrast) |
| `--primitive-info-500` | `info` | Functional Info: instructional notices, guidance callouts (>=4.5:1) |

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

### 2.3 Unified Product Grammar & 3 General UI Surfaces (+ Notation Exception)

> **Golden Rule of Unified Product Grammar:**
> *Same product, same visual grammar.*
> *Simple before expressive. Consistent before distinctive.*
> *If the standard treatment works, use it.*
> *Semantic meaning does not automatically justify a different visual treatment.*
> *Domain meaning does not automatically justify a new visual primitive.*
> *A specialized content type is not automatically a specialized Design System surface.*
> *Do not create a new surface, color, shadow, radius, card treatment, page width or component variant merely because a section is important, musical, premium, emotional, featured or memorable.*
> *Visual differences must have functional necessity, not aesthetic preference.*
> *When in doubt, use the standard panel.*

Authenticated application layout converges on 3 canonical surfaces with zero notation exceptions:

1. **App Canvas (`bg-surface-canvas`):** Warm ivory backdrop for all application views.
2. **Standard Content Panel (`bg-surface-panel`):** Universal clean white container with `border border-line-subtle` and `rounded-container` (flat by default, no shadow). All application cards, list containers, resume modules, stats, pricing cards, forms, and musical notation containers use this universal container.
3. **Floating Raised Overlays (`bg-surface-raised`):** Elevated overlay surface with `shadow-overlay` or `shadow-raised` (popovers, menus, modal dialogs, search trigger).

### 2.4 Marketing Surface Rhythm Contract (Landing Page)

> **Golden Rule of Restraint:**
> *Restraint creates hierarchy. Brand color is an accent, not a background system.*
> *Structure should be felt, not painted.*

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

Contained artifacts within these sections utilize standard `surface-panel` with appropriate elevation. Musical notation is domain content and renders on standard `surface-panel`.

### 2.5 Canonical Control Scale & Icon Sizing

One visual decision has one owner. All interactive controls, inputs, and icon elements consume these exact dimensions:

| Size Key | Control Dimension | CSS Height Variable | Height & Min-Height Utilities | Width & Min-Width Utilities | Icon Size | Icon Utility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `xs` | `28px` (`1.75rem`) | `--control-height-xs` | `.h-control-xs` / `.min-h-control-xs` | `.w-control-xs` / `.min-w-control-xs` | `14px` (`0.875rem`) | `.icon-xs` |
| `sm` | `32px` (`2.0rem`) | `--control-height-sm` | `.h-control-sm` / `.min-h-control-sm` | `.w-control-sm` / `.min-w-control-sm` | `16px` (`1.0rem`) | `.icon-sm` |
| `md` | `36px` (`2.25rem`) | `--control-height-md` | `.h-control-md` / `.min-h-control-md` | `.w-control-md` / `.min-w-control-md` | `18px` (`1.125rem`) | `.icon-md` |
| `lg` | `40px` (`2.5rem`) | `--control-height-lg` | `.h-control-lg` / `.min-h-control-lg` | `.w-control-lg` / `.min-w-control-lg` | `20px` (`1.25rem`) | `.icon-lg` |
| `xl` | `44px` (`2.75rem`) | `--control-height-xl` | `.h-control-xl` / `.min-h-control-xl` | `.w-control-xl` / `.min-w-control-xl` | `24px` (`1.5rem`) | `.icon-xl` |

### 2.6 Shadow Language & Elevation Contract

Yueora is a tactile, calm, planar environment. Shadows are strictly functional:

- **Primary & Danger Actions:** Subtle `shadow-xs` on primary CTA buttons (`Button intent="primary|danger"` and `IconButton tone="primary"`).
- **Core Form Controls:** Subtle `shadow-xs` on interactive input controls (`Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `InputOTP`).
- **Floating Overlays:** `shadow-raised` / `shadow-overlay` on dropdown menus, popovers, and modal dialogs (`bg-surface-raised`).
- **Everything Else (Flat by Default):** Standard panels, cards, list views, sticky headers (`PublicHeader`), navigation rails (`Sidebar`, `SubRail`), segmented tabs (`TabsList` neutral track, `TabsTrigger` active `bg-surface-panel`), score notation containers, secondary buttons, and outline icon buttons are **strictly planar (no drop shadow)**.

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

Yueora defines a strict boundary between the **Canonical Product API** and the **Legacy Compatibility API**:

#### Canonical Yueora Button API
Preferred for all new and modified Yueora product code. New Yueora product code MUST use `intent`. Existing legacy `variant` consumers may remain until naturally modified.
- **Intents:** `primary` (deep forest green CTA), `secondary` (planar white panel with subtle line), `quiet` (subtle action), `danger` (terracotta alert), `subtle` (canvas action), `link` (inline text action).
- **Sizes:** `xs` (`28px`), `sm` (`32px`), `md` (`36px`, default), `lg` (`44px`).
- **Icon-Only Actions:** Dedicated primitive `<IconButton>` is used for all icon-only triggers.

| Size Key | Height Token | Typography Token | Icon Token | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `xs` | `h-control-xs` (`28px`) | `.type-caption` | `icon-xs` (`14px`) | Miniature inline action chips |
| `sm` | `h-control-sm` (`32px`) | `.type-body-small font-medium` | `icon-sm` (`16px`) | Compact secondary actions |
| `md` | `h-control-md` (`36px`) | `.type-body-small font-medium` | `icon-sm` (`16px`) | Standard buttons, dialog actions |
| `lg` | `h-control-xl` (`44px`) | `.type-body-small font-semibold`| `icon-md` (`18px`) | Hero CTAs, large stand buttons |

```jsx
import { Button } from '@/components/ui/button';

// Primary call-to-action (deep green brand)
<Button intent="primary" size="md">Save score</Button>

// Neutral secondary action
<Button intent="secondary" size="md">Cancel</Button>

// Quiet button for subtle inline actions
<Button intent="quiet" size="sm">Add page</Button>

// Destructive action
<Button intent="danger" size="md">Delete forever</Button>
```

#### Legacy Compatibility API (Existing Consumers + Excluded UI)
Existing compatibility aliases retained for legacy product consumers and excluded / third-party UI scaffolding:
- `variant`: `default`, `destructive`, `outline`, `ghost`
- `size`: `default` (resolves to `md`)

**Governance rules:**
- Do not introduce new `variant="default|destructive|outline|ghost"` usage in Yueora product code.
- Existing legacy compatibility consumers are not a Design System defect and do not justify another system-wide migration.
- When an existing legacy consumer is naturally modified in future product work, prefer migrating it to the equivalent canonical `intent` API:
  - `default` → `primary`
  - `outline` → `secondary`
  - `ghost` → `quiet`
  - `destructive` → `danger`
  - `size="default"` → `size="md"`
- No dedicated migration pass is required; migrate opportunistically when touching the consumer.

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

### 4.7 Surfaces: Surface

- Use `<Surface tone="panel">` for general application containers, dialogs, summaries, score workspaces, and cards (flat by default; use `elevation="raised"` or `elevation="overlay"` only when contextual elevation is required).
- Musical notation is domain content and renders within the standard `Surface` container.
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

---

## 6. Architecture Freeze Policy

The Yueora Design System architecture is **formally frozen**.

- **No New Layers or Paradigms:** The 6-tier architecture (Foundations → Semantic Tokens → Primitives → Yueora Patterns → Domain Components → Page Composition) is locked.
- **No Token Sprawl:** Do not introduce new color tokens, arbitrary surfaces, or redundant semantic variants. Reuse existing tokens.
- **Planar Panel Standard:** Standard panels and content containers are flat by default (`bg-surface-panel border-line-subtle rounded-container`). Ordinary content panels, list views, score stands, and settings forms must not add `shadow-xs`.
- **Neutral Active Navigation:** Navigation items and segmented controls use canonical neutral active states (`bg-neutral-muted text-ink-primary font-semibold`) with zero drop shadows.
- **Zero Domain Surface Exceptions:** Sheet music and musical notation are domain content types, not separate Design System surfaces. All score rendering uses standard `surface-panel`.
- **Pages Compose:** Future feature development and page additions must compose existing primitives and semantic tokens rather than inventing page-level visual styles.

