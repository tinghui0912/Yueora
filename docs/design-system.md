# Yueora Design System & Frontend UI Architecture

> **Core Principle:** *Pages compose. The Design System decides appearance.*

Yueora is a personal musical sanctuary. The Design System exists to ensure that every surface reflects tactile paper, calm musical progression, dignified typography, and accessible interaction without page-level visual drift.

---

## 1. System Layers

```text
Foundations (Tokens & CSS Variables)
↓
Semantic Tokens (Colors, Typography Roles, Radii, Shadows, Motion)
↓
Primitive Components (Button, IconButton, Input, Select, Field, Badge)
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
| `.type-display` | Hero titles & brand headlines | `clamp(2rem, 4vw, 3rem)` | `1.15` | `-0.02em` | Newsreader |
| `.type-page-title` | Application page headings | Mobile `28px`, Desktop `34px` | `1.2` | `-0.015em` | Newsreader |
| `.type-section-title` | Section headings | Mobile `20px`, Desktop `22px` | `1.3` | `-0.01em` | Newsreader |
| `.type-subsection` | Subsections & card titles | `16px` | `1.4` | Normal | Plus Jakarta Sans (600) |
| `.type-body` | Primary editorial reading text | `16px` | `1.6` | Normal | Plus Jakarta Sans (400) |
| `.type-body-small` | Secondary UI copy & descriptions | `14px` | `1.55` | Normal | Plus Jakarta Sans (400) |
| `.type-label` | Form labels & navigation items | `14px` | `1.4` | Normal | Plus Jakarta Sans (500) |
| `.type-caption` | Micro-labels, step badges & tags | `12px` | `1.4` | `0.06em` | Plus Jakarta Sans (600, uppercase) |
| `.type-metadata` | Timestamps, counters & helper text | `13px` | `1.45` | Normal | Plus Jakarta Sans (400) |
| `.type-metric` | Large reflective numbers & hours | Mobile `28px`, Desktop `32px` | `1.0` | Tabular | Newsreader |

### 2.2 Color Vocabulary (WCAG 2.2 AA)

- **Ink (Text):**
  - `text-ink-primary` (`hsl(220 5% 13%)`): Main titles and high-emphasis reading copy (>10:1 contrast).
  - `text-ink-secondary` (`hsl(223 4% 36%)`): Readable secondary descriptions, timestamps, and labels (>6.5:1 contrast).
  - `text-ink-tertiary` (`hsl(220 4% 48%)`): Readable muted copy (>4.5:1 contrast).
  - `text-ink-subtle` (`hsl(220 3% 62%)`): Strictly non-textual dividers and subtle glyphs.
- **Surfaces:**
  - `bg-surface-canvas`: Global backdrop canvas (`#fcfaf5`).
  - `bg-surface-panel`: Pure container surface (`#ffffff`).
  - `bg-surface-paper`: Tactile archival paper tone.
  - `bg-surface-paper-warm`: Warm paper highlight.
- **Lines & Borders:**
  - `border-line-subtle`: Quiet dividers (`hsl(47 14% 91%)`).
  - `border-surface-paper-edge`: Tactile card and paper boundary (`hsl(44 16% 87%)`).
- **Brand & Semantic Feedback:**
  - `bg-brand` / `text-brand`: Deep forest green (`hsl(148 36% 27%)`).
  - `text-danger` / `bg-danger`: Non-punitive alert red.
  - Practice states: `following`, `waiting`, `resyncing`, `current`.

### 2.3 Control Heights & Icon Sizing

- **Control Heights:**
  - `h-control-xs` / `min-h-[28px]` (28px): Compact filter chips and measure steppers.
  - `h-control-sm` / `min-h-[32px]` (32px): Secondary actions and compact buttons.
  - `h-control-md` / `min-h-[36px]` (36px): Standard buttons, search triggers.
  - `h-control-lg` / `h-10` / `min-h-[40px]` (40px): Standard form inputs, selects, primary dialog actions.
- **Icon Sizing Tokens:**
  - `icon-xs` (`14px`): Micro-indicators and badge icons.
  - `icon-sm` (`16px`): Standard navigation and button icons.
  - `icon-md` (`18px`): Header utilities and card badges.
  - `icon-lg` (`20px`): Section headers and primary action glyphs.
  - `icon-xl` (`24px`): Display icons and empty states.

---

## 3. Page Layout & Container System

Pages must use `<AppPage size="...">` rather than arbitrary `max-w-*` strings:

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

```jsx
import { Button } from '@/components/ui/button';

// Primary call-to-action
<Button intent="primary" size="md">Save score</Button>

// Secondary action with paper surface
<Button intent="secondary" size="md">Cancel</Button>

// Quiet button for subtle actions
<Button intent="quiet" size="sm">Add page</Button>

// Destructive action
<Button intent="danger" size="md">Delete forever</Button>
```

### 4.2 IconButton

```jsx
import { IconButton } from '@/components/ui/icon-button';
import { Bell, Heart, X } from 'lucide-react';

<IconButton icon={Bell} label="Notifications" tone="quiet" size="sm" />
<IconButton icon={Heart} label="Favorite" tone="surface" size="md" />
<IconButton icon={X} label="Close" tone="danger" size="xs" />
```

### 4.3 Form Field & Input

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

### 4.4 Flow Components: Stepper & ChoiceCard

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

### 4.5 Surfaces: Surface & MusicPaper

- Use `<MusicPaper>` when representing an **actual physical or living musical score**.
- Use `<Surface tone="panel" elevation="paper">` for general application containers, dialogs, summaries, and cards.
- **Do not** wrap every trivial element in a card. Let whitespace separate content naturally.

---

## 5. Responsive & Tablet Rules

1. **Tablet on Piano Stand ($768\text{px}$–$820\text{px}$):**
   - Must receive full score width with compact bottom navigation.
   - The $220\text{px}$ desktop sidebar mounts only at $1024\text{px}+$ (`lg:`).
2. **Repertoire Grid:**
   - Always use `<RepertoireGrid>` to ensure score cards never become narrow tiles at $1024\text{px}$ or $1280\text{px}$.
3. **Touch Targets:**
   - Interactive targets must never be smaller than $28\times 28\text{px}$ (preferably $36\times 36\text{px}$).

---

## 6. Living Component Catalog

Visit `/design-system` in the application to view live, interactive samples of every token, button, field, stepper, and surface.
