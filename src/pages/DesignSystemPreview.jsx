import { useState } from 'react';
import {
  Upload,
  FileMusic,
  Bell,
  Heart,
  Plus,
  Sparkles,
} from 'lucide-react';
import { AppPage } from '@/components/patterns/AppPage';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SectionHeader } from '@/components/patterns/SectionHeader';
import { Stepper } from '@/components/patterns/Stepper';
import { ChoiceCard } from '@/components/patterns/ChoiceCard';
import { Surface } from '@/components/patterns/Surface';
import BackLink from '@/components/patterns/BackLink';
import { FilterTabs, FilterTab } from '@/components/patterns/FilterTabs';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchTrigger from '@/components/app-shell/SearchTrigger';

export default function DesignSystemPreview() {
  const [activeStep, setActiveStep] = useState(2);
  const [selectedChoice, setSelectedChoice] = useState('pdf');
  const [inputValue, setInputValue] = useState('Debussy — Clair de Lune');
  const [hasError, setHasError] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('acoustic');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [filterActive, setFilterActive] = useState('all');

  return (
    <AppPage size="standard" className="space-y-12">
      <div className="border-b border-line-subtle pb-6">
        <PageHeader
          title="Yueora Design System"
          description="Foundations, semantic tokens, and reusable primitives for sustainable UI engineering."
          primaryAction={
            <Button
              intent="secondary"
              size="sm"
              onClick={() => setHasError(!hasError)}
            >
              Toggle Form Error State
            </Button>
          }
        />
      </div>

      {/* 1. Typography Scale */}
      <section className="space-y-4">
        <SectionHeader
          title="Semantic Typography Scale"
          description="Every role owns font family, weight, size, line-height, and responsive optical scaling."
        />
        <Surface tone="panel" padding="md" className="space-y-4">
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-hero-title (Editorial / Marketing Hero)</span>
            <p className="type-hero-title text-ink-primary">Play what you love.</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-marketing-title (Marketing Section Titles)</span>
            <p className="type-marketing-title text-ink-primary">Your music, not ours.</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-eyebrow (Public &amp; Editorial Overline)</span>
            <p className="type-eyebrow text-ink-tertiary">01 · Personal Repertoire Archive</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-editorial-quote (Philosophy &amp; Brand Quotes)</span>
            <p className="type-editorial-quote text-ink-primary">&ldquo;The music already on your piano stand is the music that deserves your devotion.&rdquo;</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-display</span>
            <p className="type-display text-ink-primary">Play what you love.</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-experience-title (Core Musical Spaces)</span>
            <p className="type-experience-title text-ink-primary">Your Musical Journey</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-page-title</span>
            <p className="type-page-title text-ink-primary">Living Repertoire</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-section-title</span>
            <p className="type-section-title text-ink-primary">Recent Practice Sessions</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-subsection</span>
            <p className="type-subsection text-ink-primary">Clair de Lune · Suite bergamasque</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-body</span>
            <p className="type-body text-ink-primary">
              Yueora listens quietly to acoustic piano through your microphone, tracking where you are on the score.
            </p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-body-small</span>
            <p className="type-body-small text-ink-secondary">
              Optical music recognition that understands phrasing, dynamics, and fingering.
            </p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-label</span>
            <p className="type-label text-ink-primary">Piece Title or Folder Name</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-caption</span>
            <p className="type-caption text-brand">Paced Following · Bar 14</p>
          </div>
          <div className="border-b border-line-subtle pb-3">
            <span className="type-caption text-ink-secondary/70">type-metadata</span>
            <p className="type-metadata text-ink-secondary">Last played Sunday · 2 takes preserved</p>
          </div>
          <div>
            <span className="type-caption text-ink-secondary/70">type-metric</span>
            <p className="type-metric text-ink-primary">3.5 hrs</p>
          </div>
        </Surface>
      </section>

      {/* 2. Color System & Interaction Matrix */}
      <section className="space-y-4">
        <SectionHeader
          title="Color System & Interaction Matrix"
          description="One canonical visual language. Antique gold is brand accent. Warm paper is content surface. Chromatic color communicates functional status."
        />
        <Surface tone="panel" padding="md" className="space-y-6">
          {/* Swatches */}
          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Canonical Color Roles</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-4">
              <div className="rounded-control border border-line-subtle bg-surface-canvas p-3 text-center">
                <span className="type-caption text-ink-secondary">Canvas</span>
                <p className="type-metadata text-ink-tertiary">surface-canvas</p>
              </div>
              <div className="rounded-control border border-line-subtle bg-surface-panel p-3 text-center">
                <span className="type-caption text-ink-primary">Panel</span>
                <p className="type-metadata text-ink-tertiary">surface-panel</p>
              </div>
              <Surface tone="raised" elevation="overlay" padding="none" className="p-3 text-center">
                <span className="type-caption text-ink-primary">Raised</span>
                <p className="type-metadata text-ink-tertiary">Overlay / Menu</p>
              </Surface>
              <div className="rounded-control border border-transparent bg-brand-fill p-3 text-center text-brand-fill-foreground">
                <span className="type-caption text-brand-fill-foreground">Brand CTA</span>
                <p className="type-metadata text-brand-fill-foreground/80">Primary Fill</p>
              </div>
              <div className="rounded-control border border-transparent bg-brand p-3 text-center text-brand-foreground">
                <span className="type-caption text-brand-foreground">Brand Accent</span>
                <p className="type-metadata text-brand-foreground/80">Antique Gold</p>
              </div>
              <div className="rounded-control border border-brand bg-brand-soft p-3 text-center">
                <span className="type-caption text-brand-soft-foreground">Brand Soft</span>
                <p className="type-metadata text-brand-soft-foreground/80">Compact Selection</p>
              </div>
              <div className="rounded-control border border-line-subrail bg-surface-subrail p-3 text-center">
                <span className="type-caption text-ink-primary font-medium">SubRail</span>
                <p className="type-metadata text-ink-tertiary">Secondary Nav</p>
              </div>
              <div className="rounded-control border border-line-subtle bg-neutral-muted p-3 text-center">
                <span className="type-caption text-ink-secondary">Neutral Muted</span>
                <p className="type-metadata text-ink-tertiary">Passive / Track</p>
              </div>
              <div className="rounded-control border border-line-subtle bg-neutral-hover p-3 text-center">
                <span className="type-caption text-ink-primary">Neutral Hover</span>
                <p className="type-metadata text-ink-tertiary">Hover / Focus</p>
              </div>
            </div>
          </div>

          {/* State Matrix */}
          <div className="space-y-3 border-t border-line-subtle pt-4">
            <span className="type-caption text-ink-secondary/70">Component State Matrix</span>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-control border border-line-subtle bg-surface-panel p-3 text-center">
                <p className="type-caption text-ink-tertiary">Default</p>
                <div className="mt-2 rounded-control border border-line-subtle bg-surface-panel px-3 py-1.5 type-body-small text-ink-primary">
                  Item Default
                </div>
              </div>
              <div className="rounded-control border border-line-subtle bg-surface-panel p-3 text-center">
                <p className="type-caption text-ink-tertiary">Hover (Neutral)</p>
                <div className="mt-2 rounded-control border border-line-subtle bg-neutral-hover px-3 py-1.5 type-body-small text-ink-primary">
                  Item Hovered
                </div>
              </div>
              <div className="rounded-control border border-line-subtle bg-surface-panel p-3 text-center">
                <p className="type-caption text-ink-primary">Nav Active</p>
                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-control bg-brand-soft px-3 py-1.5 type-body-small font-semibold text-ink-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  Nav Active
                </div>
              </div>
              <div className="rounded-control border border-line-subtle bg-surface-panel p-3 text-center">
                <p className="type-caption text-brand">Compact Selected</p>
                <div className="mt-2 rounded-control border border-brand bg-brand-soft px-3 py-1.5 type-body-small font-medium text-brand-soft-foreground">
                  Badge / Chip
                </div>
              </div>
              <div className="rounded-control border border-line-subtle bg-surface-panel p-3 text-center">
                <p className="type-caption text-ink-primary">Large Selected</p>
                <div className="mt-2 flex items-center justify-between rounded-control border border-brand bg-neutral-hover px-3 py-1.5 type-body-small font-medium text-ink-primary">
                  <span>Row / Option</span>
                  <span className="h-2 w-2 rounded-full bg-brand" />
                </div>
              </div>
              <div className="rounded-control border border-line-subtle bg-surface-panel p-3 text-center">
                <p className="type-caption text-ink-tertiary">Disabled</p>
                <div className="mt-2 rounded-control border border-line-subtle bg-neutral-muted/50 px-3 py-1.5 type-body-small text-ink-tertiary opacity-60">
                  Item Disabled
                </div>
              </div>
            </div>
          </div>
        </Surface>
      </section>

      {/* 2. Button Primitives */}
      <section className="space-y-4">
        <SectionHeader
          title="Buttons & Intents"
          description="Semantic button roles with centralized sizing and accessible active states."
        />
        <Surface tone="panel" padding="md" className="space-y-6">
          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Intents</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button intent="primary">Primary Action</Button>
              <Button intent="secondary">Secondary Action</Button>
              <Button intent="quiet">Quiet Button</Button>
              <Button intent="subtle">Subtle Action</Button>
              <Button intent="danger">Danger Action</Button>
              <Button intent="link">Text Link</Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Sizes (xs: 28px, sm: 32px, md: 36px, lg: 40px, xl: 44px)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button intent="primary" size="xs">Size XS (28px)</Button>
              <Button intent="primary" size="sm">Size SM (32px)</Button>
              <Button intent="primary" size="md">Size MD (36px Default)</Button>
              <Button intent="primary" size="lg">Size LG (40px)</Button>
              <Button intent="primary" size="xl">Size XL (44px)</Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Icon Buttons (IconButton)</span>
            <div className="flex flex-wrap items-center gap-3">
              <IconButton icon={Bell} size="xs" tone="quiet" label="Notifications XS" />
              <IconButton icon={Heart} size="sm" tone="outline" label="Favorite SM" />
              <IconButton icon={Plus} size="md" tone="outline" label="Add MD" />
              <IconButton icon={Sparkles} size="lg" tone="primary" label="Sparkles LG" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Segmented Control (Tabs)</span>
            <Tabs defaultValue="all">
              <TabsList data-qa="design-system-tabs-list">
                <TabsTrigger value="all" data-qa="design-system-tabs-trigger">All items</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Compact Controls (10px Rounded Control)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button intent="primary">Primary Control</Button>
              <Button intent="secondary">Secondary Control</Button>
              <div className="inline-flex items-center gap-1 rounded-control border border-line-subtle bg-surface-panel p-1">
                <span className="rounded-control bg-brand-soft px-4 py-1.5 type-caption text-ink-primary">Active Toggle</span>
                <span className="rounded-control px-4 py-1.5 type-caption font-medium text-ink-secondary">Inactive</span>
              </div>
            </div>
          </div>
        </Surface>
      </section>

      {/* 3. Form Architecture */}
      <section className="space-y-4">
        <SectionHeader
          title="Form Field Composition"
          description="Consistent typography, label placement, error styling, and control heights."
        />
        <Surface tone="panel" padding="md">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Piece Title"
              htmlFor="demo-title"
              required
              description="Name as it appears on your sheet."
              error={hasError ? 'Title is required to save to repertoire.' : undefined}
            >
              <Input
                id="demo-title"
                value={inputValue}
                hasError={hasError}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Field>

            <Field
              label="Collection / Folder"
              htmlFor="demo-folder"
              description="Organize into a personal binder."
            >
              <NativeSelect id="demo-folder">
                <option>French Impressionism</option>
                <option>Sunday Morning Pieces</option>
                <option>Recital Preparation</option>
              </NativeSelect>
            </Field>
          </div>
        </Surface>
      </section>

      {/* 3b. Form & Selection Primitives (Pixel-Parity Specimen) */}
      <section className="space-y-4" data-qa="primitive-parity-section">
        <SectionHeader
          title="Selection & Overlay Primitives"
          description="Checkbox, Radio, Switch, Popover, Tooltip, Badges, and FilterTabs aligned with NumisCollection 12px baseline."
        />
        <Surface tone="panel" padding="md" className="space-y-6">
          {/* Checkbox & Radio & Switch */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Checkbox specimen */}
            <div className="space-y-3">
              <span className="type-caption text-ink-secondary/70">Checkbox</span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checkboxChecked}
                    onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                    data-qa="design-system-checkbox"
                  />
                  <span className="type-body-small text-ink-primary">Keep preserved take</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={false}
                    data-qa="design-system-checkbox-unchecked"
                  />
                  <span className="type-body-small text-ink-secondary">Unchecked state</span>
                </label>
              </div>
            </div>

            {/* RadioGroup specimen */}
            <div className="space-y-3">
              <span className="type-caption text-ink-secondary/70">Radio Group</span>
              <RadioGroup
                value={radioValue}
                onValueChange={setRadioValue}
                data-qa="design-system-radio"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="acoustic" id="ds-radio-acoustic" />
                  <span className="type-body-small text-ink-primary">Acoustic Piano</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="digital" id="ds-radio-digital" />
                  <span className="type-body-small text-ink-secondary">Digital / MIDI</span>
                </label>
              </RadioGroup>
            </div>

            {/* Switch specimen */}
            <div className="space-y-3">
              <span className="type-caption text-ink-secondary/70">Switch Toggle</span>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                    data-qa="design-system-switch"
                  />
                  <span className="type-body-small text-ink-primary">Acoustic listening</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={false}
                    data-qa="design-system-switch-unchecked"
                  />
                  <span className="type-body-small text-ink-secondary">Muted</span>
                </label>
              </div>
            </div>
          </div>

          {/* Popover & Tooltip & FilterTabs */}
          <div className="border-t border-line-subtle pt-6 grid gap-6 sm:grid-cols-3">
            {/* Popover specimen */}
            <div className="space-y-3">
              <span className="type-caption text-ink-secondary/70">Popover (shadow-md, rounded-md)</span>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button intent="secondary" size="sm" data-qa="design-system-popover-trigger">
                      Open Popover
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent data-qa="design-system-popover">
                    <div className="space-y-2">
                      <p className="type-body-small font-semibold text-ink-primary">Popover Specimen</p>
                      <p className="type-caption text-ink-secondary">
                        Aligned to shadow-md and 10px radius (rounded-md).
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tooltip specimen */}
            <div className="space-y-3">
              <span className="type-caption text-ink-secondary/70">Tooltip (WCAG AA gold badge)</span>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button intent="quiet" size="sm" data-qa="design-system-tooltip-trigger">
                        Hover for Tooltip
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent data-qa="design-system-tooltip">
                      Preserved Take Details
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* FilterTabs specimen */}
            <div className="space-y-3">
              <span className="type-caption text-ink-secondary/70">FilterTabs (role=group, aria-pressed)</span>
              <FilterTabs aria-label="Specimen filter" data-qa="design-system-filter-tabs">
                <FilterTab active={filterActive === 'all'} onClick={() => setFilterActive('all')}>
                  All
                </FilterTab>
                <FilterTab active={filterActive === 'takes'} onClick={() => setFilterActive('takes')}>
                  Takes
                </FilterTab>
                <FilterTab active={filterActive === 'notes'} onClick={() => setFilterActive('notes')}>
                  Notes
                </FilterTab>
              </FilterTabs>
            </div>
          </div>

          {/* Badges specimen */}
          <div className="border-t border-line-subtle pt-6 space-y-3">
            <span className="type-caption text-ink-secondary/70">Badges (AA Contrast &amp; Semantic Statuses)</span>
            <div className="flex flex-wrap items-center gap-2" data-qa="design-system-badge-group">
              <Badge variant="default" data-qa="design-system-badge">Default Brand (AA)</Badge>
              <Badge variant="brand">Brand Soft</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </Surface>
      </section>

      {/* 4. Stepper & ChoiceCard Primitives */}
      <section className="space-y-4">
        <SectionHeader
          title="Flow Components: Stepper & ChoiceCard"
          description="Reusable multi-step flows and tactile option selection."
        />
        <Surface tone="panel" padding="md" className="space-y-6">
          <Stepper
            current={activeStep}
            steps={['Source', 'Files', 'Details', 'Confirm']}
            onStepClick={(step) => setActiveStep(step)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard
              icon={Upload}
              title="Upload PDF"
              description="One or more pages from your music stand or device."
              selected={selectedChoice === 'pdf'}
              onClick={() => setSelectedChoice('pdf')}
              badge={<Badge variant="brand">Common</Badge>}
            />
            <ChoiceCard
              icon={FileMusic}
              title="Upload Images"
              description="High-resolution PNG or JPG photos of physical scores."
              selected={selectedChoice === 'images'}
              onClick={() => setSelectedChoice('images')}
            />
          </div>
        </Surface>
      </section>

      {/* 5. Unified Product Grammar & Surface Model */}
      <section className="space-y-4">
        <SectionHeader
          title="3 Canonical Surfaces"
          description="Same product, same visual grammar. Standard Panel is flat by default."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-container border border-line-subtle bg-surface-canvas p-4">
            <span className="type-caption text-ink-tertiary">1. App Canvas</span>
            <p className="type-subsection text-ink-primary mt-1">Surface Canvas</p>
            <p className="type-metadata text-ink-secondary mt-1">Warm ivory app backdrop (surface-canvas).</p>
          </div>

          <div className="rounded-container border border-line-subtle bg-surface-panel p-4">
            <span className="type-caption text-brand">2. Universal Container</span>
            <p className="type-subsection text-ink-primary mt-1">Standard Panel</p>
            <p className="type-metadata text-ink-secondary mt-1">All cards, lists, forms, and musical notation containers (surface-panel). Flat by default.</p>
          </div>

          <Surface tone="raised" elevation="overlay" padding="none" className="p-4">
            <span className="type-caption text-ink-tertiary">3. Elevated Overlay</span>
            <p className="type-subsection text-ink-primary mt-1">Raised Overlay</p>
            <p className="type-metadata text-ink-secondary mt-1">Menus, dialogs, popovers (surface-raised).</p>
          </Surface>
        </div>

        {/* Live Pick up where you left off sample */}
        <div className="rounded-container border border-line-subtle bg-surface-panel p-5 transition-colors hover:border-line-strong">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-subtle bg-surface-panel text-brand">
                <Sparkles className="icon-sm" />
              </span>
              <div>
                <span className="type-caption text-brand">
                  Live Standard Panel Demo
                </span>
                <p className="type-subsection text-ink-primary">
                  Pick up where you left off · Clair de Lune
                </p>
                <p className="type-metadata text-ink-secondary">
                  Continue from bar 14 · Standard surface-panel with near-black indicator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button intent="primary" size="sm">Resume playing</Button>
              <Button intent="secondary" size="sm">Score details</Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Shell Controls */}
      <section className="space-y-4">
        <SectionHeader
          title="Shell Primitives"
          description="Search triggers, badges, and status indicators."
        />
        <Surface tone="panel" padding="md" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <SearchTrigger label="Search" shortcut="⌘K" />
            <Badge variant="brand">Musician Choice</Badge>
            <Badge variant="success">Active Take</Badge>
            <Badge variant="warning">Syncing</Badge>
            <Badge variant="neutral">Draft</Badge>
          </div>
          <div className="border-t border-line-subtle pt-3">
            <span className="type-caption text-ink-secondary/70 mb-2 block">BackLink Primitive</span>
            <BackLink to="/design-system" label="Back to Repertoire preview" />
          </div>
        </Surface>
      </section>

      {/* 7. Inverse Editorial Surface */}
      <section className="space-y-4">
        <SectionHeader
          title="Inverse Editorial Surface (UGC Conversion Pattern)"
          description="Dramatic deep archive container (bg-ink-primary text-surface-canvas) with ambient background typography and tactile compact actions."
        />
        <div className="relative rounded-container bg-ink-primary text-surface-canvas p-8 md:p-10 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -bottom-6 -right-6 select-none">
            {/* ds-allow: ambient oversized background typography showcase */}
            <span className="font-display italic text-8xl text-surface-canvas/[0.04]">music</span>
          </div>
          <div className="relative z-10 max-w-xl">
            <p className="type-eyebrow text-surface-canvas/60 mb-3">Sanctuary Callout</p>
            <h3 className="type-display font-medium text-surface-canvas">Play what you love.</h3>
            <p className="mt-2 type-body-small text-surface-canvas/75">
              Warm paper and antique gold define identity. Ivory is content surface. Chromatic color communicates functional status.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button intent="inverse" size="sm">
                Inverse Action
              </Button>
              <Button intent="inverse-secondary" size="sm">
                Outlined Action
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AppPage>
  );
}
