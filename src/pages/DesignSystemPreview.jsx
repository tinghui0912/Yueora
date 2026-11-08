import { useState } from 'react';
import {
  Upload,
  FileMusic,
  Bell,
  Heart,
  Plus,
  Sparkles,
  Music,
} from 'lucide-react';
import { AppPage } from '@/components/patterns/AppPage';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SectionHeader } from '@/components/patterns/SectionHeader';
import { Stepper } from '@/components/patterns/Stepper';
import { ChoiceCard } from '@/components/patterns/ChoiceCard';
import { Surface } from '@/components/patterns/Surface';
import MusicPaper from '@/components/patterns/MusicPaper';
import BackLink from '@/components/patterns/BackLink';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import SearchTrigger from '@/components/app-shell/SearchTrigger';

export default function DesignSystemPreview() {
  const [activeStep, setActiveStep] = useState(2);
  const [selectedChoice, setSelectedChoice] = useState('pdf');
  const [inputValue, setInputValue] = useState('Debussy — Clair de Lune');
  const [hasError, setHasError] = useState(false);

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
        <Surface tone="panel" elevation="paper" padding="md" className="space-y-4">
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

      {/* 2. Button Primitives */}
      <section className="space-y-4">
        <SectionHeader
          title="Buttons & Intents"
          description="Semantic button roles with centralized sizing and accessible active states."
        />
        <Surface tone="panel" elevation="paper" padding="md" className="space-y-6">
          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Intents</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button intent="primary">Primary Action</Button>
              <Button intent="secondary">Secondary Action</Button>
              <Button intent="quiet">Quiet Button</Button>
              <Button intent="subtle">Subtle Action</Button>
              <Button intent="danger">Danger Action</Button>
              <Button intent="transport" size="md">
                <Music className="h-4 w-4" /> Transport
              </Button>
              <Button intent="link">Text Link</Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Sizes (xs, sm, md, lg)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button intent="primary" size="xs">Size XS</Button>
              <Button intent="primary" size="sm">Size SM</Button>
              <Button intent="primary" size="md">Size MD (Default)</Button>
              <Button intent="primary" size="lg">Size LG</Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="type-caption text-ink-secondary/70">Icon Buttons (IconButton)</span>
            <div className="flex flex-wrap items-center gap-3">
              <IconButton icon={Bell} size="xs" tone="quiet" label="Notifications XS" />
              <IconButton icon={Heart} size="sm" tone="surface" label="Favorite SM" />
              <IconButton icon={Plus} size="md" tone="outline" label="Add MD" />
              <IconButton icon={Sparkles} size="lg" tone="primary" label="Sparkles LG" />
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
        <Surface tone="panel" elevation="paper" padding="md">
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

      {/* 4. Stepper & ChoiceCard Primitives */}
      <section className="space-y-4">
        <SectionHeader
          title="Flow Components: Stepper & ChoiceCard"
          description="Reusable multi-step flows and tactile option selection."
        />
        <Surface tone="panel" elevation="paper" padding="md" className="space-y-6">
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

      {/* 5. Surface & Paper System */}
      <section className="space-y-4">
        <SectionHeader
          title="Surfaces & Paper"
          description="Tactile paper surfaces representing physical scores and quiet study."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Surface tone="panel" elevation="paper" padding="sm">
            <p className="type-subsection text-ink-primary">Surface Panel</p>
            <p className="type-metadata text-ink-secondary mt-1">Default container surface with paper edge.</p>
          </Surface>

          <Surface tone="paper" elevation="paper" padding="sm">
            <p className="type-subsection text-ink-primary">Surface Paper</p>
            <p className="type-metadata text-ink-secondary mt-1">Subtly textured archival sheet tone.</p>
          </Surface>

          <MusicPaper tone="warm" elevation="paper" className="p-4">
            <p className="type-subsection text-ink-primary">MusicPaper</p>
            <p className="type-metadata text-ink-secondary mt-1">Tactile musical score surface.</p>
          </MusicPaper>
        </div>
      </section>

      {/* 6. Shell Controls */}
      <section className="space-y-4">
        <SectionHeader
          title="Shell Primitives"
          description="Search triggers, badges, and status indicators."
        />
        <Surface tone="panel" elevation="paper" padding="md" className="space-y-4">
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
    </AppPage>
  );
}
