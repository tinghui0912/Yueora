import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  ArrowRight,
  Check,
  Lock,
  Heart,
  ChevronRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Music,
} from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import ScorePreview from '@/components/library/ScorePreview';
import HeroProductVisual from '@/components/visuals/HeroProductVisual';
import PracticeWorkspaceVisual from '@/components/visuals/PracticeWorkspaceVisual';
import ProgressVisual from '@/components/visuals/ProgressVisual';
import SharingVisual from '@/components/visuals/SharingVisual';
import PerformanceMemoryVisual from '@/components/visuals/PerformanceMemoryVisual';
import MockScanPage from '@/components/visuals/MockScanPage';
import MusicPaper from '@/components/patterns/MusicPaper';
import {
  ScoreSheetGlyph,
  PracticeGlyph,
  MemoryGlyph,
  RepertoireGlyph,
} from '@/components/brand/MusicalGlyphs';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/commercial';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const plans = usePrototypeStore((s) => s.plans);
  const primary = isAuthenticated ? '/library' : '/register';

  // Active step in the continuous "Life of a Piece" journey
  const [activeStep, setActiveStep] = useState(0);

  const journeySteps = [
    {
      step: '01',
      title: 'Arrives as Paper or PDF',
      summary: 'A scan, photo, or digital file from your music stand.',
      description:
        'Bring the pieces you already care about. Whether it’s a dog-eared print of Debussy’s Clair de Lune, a phone photo of a score, or an exported MusicXML file, Yueora welcomes it without requiring proprietary sheet formats.',
      tag: 'Capture & Input',
      visual: 'scan',
    },
    {
      step: '02',
      title: 'Becomes an Interactive Score',
      summary: 'Optical music recognition that understands musical phrasing.',
      description:
        'Yueora interprets notes, staves, dynamics, and measure structures. You can refine pitches, durations, and fingering in the editor—turning static scans into an active musical score.',
      tag: 'Interpretation',
      visual: 'interactive',
    },
    {
      step: '03',
      title: 'Dwells in Your Repertoire',
      summary: 'A personal collection that remembers your history with the piece.',
      description:
        'Your scores don’t sit in generic cloud folders. They live in a personal music collection that remembers where you stopped, which sections you love, and the history you have built together over weeks and years.',
      tag: 'Repertoire Archive',
      visual: 'repertoire',
    },
    {
      step: '04',
      title: 'Practiced Without Pressure',
      summary: 'Calm acoustic listening that follows your playing.',
      description:
        'Open your piano stand and play. Yueora listens through your microphone, tracking where you are on the score and following your phrase. There are no punitive red error flashes, no grading percentages, and no artificial streak pressure.',
      tag: 'Practice Stand',
      visual: 'practice',
    },
    {
      step: '05',
      title: 'Preserved as a Memory',
      summary: 'Save the takes you cherish beside the sheet music.',
      description:
        'When an evening run of the piece feels warm and heartfelt, save the recording. Saved performances stay alongside your score, complete with your personal practice journal notes.',
      tag: 'Performance Archive',
      visual: 'memory',
    },
    {
      step: '06',
      title: 'Shared When You Choose',
      summary: 'A door you choose to open, private by default.',
      description:
        'Your musical journey remains entirely private. When you want to share a breakthrough take with your teacher or a loved one, open the door with one click—on your terms.',
      tag: 'Private Sharing',
      visual: 'sharing',
    },
  ];

  const faqs = [
    {
      q: 'Do I have to practice every day?',
      a: 'No. Yueora explicitly rejects streaks, daily notifications, and countdowns. We believe music should be an inviting sanctuary, not a chore. You return when you are inspired to play.',
    },
    {
      q: 'Where does my music come from?',
      a: 'You bring the music you already love. Scan sheet music on your piano stand, upload PDFs, take phone photos, or import MusicXML files. Yueora never restricts you to a pre-packaged corporate catalog.',
    },
    {
      q: 'Does Yueora judge or grade my playing?',
      a: 'Never. Yueora does not calculate accuracy percentages or flash red notes. The pitch-following engine is designed to follow where you are in the score quietly, giving you space to express yourself without judgment.',
    },
    {
      q: 'Is my practice private?',
      a: 'Yes, completely private by default. Your practice takes, audio recordings, and notes are never published to any public feed. You choose if and when to share a specific take with a teacher or friend.',
    },
    {
      q: 'Can I download my recordings and personal data?',
      a: 'Always. Your music and takes are yours. You can download original audio and video takes from your practice history and saved performances, and export your personal data anytime from Settings.',
    },
  ];

  return (
    <PublicShell>
      {/* 1. HERO: "Play what you love." */}
      <section className="relative mx-auto max-w-6xl px-5 pt-12 pb-20 md:px-8 md:pt-20 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            {/* Subtle brand eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface-paper px-3 py-1 text-xs text-brand shadow-xs">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium tracking-wide uppercase">A personal musical journey</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 font-display text-[clamp(2.75rem,5.5vw,4.25rem)] font-medium leading-[1.04] tracking-tight text-ink-primary">
              Play what<br />
              <span className="italic font-normal">you love.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-secondary">
              Bring the sheet music that already matters to you. Yueora turns physical pages into
              living interactive scores, holds your personal repertoire, follows your playing without
              judgment, and preserves the musical moments worth keeping.
            </p>

            {/* Tactile Actions */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button asChild intent="primary" size="lg" className="shadow-sm hover:shadow-md">
                <Link to={primary}>
                  <span>Start your journey</span>
                  <ArrowRight className="icon-sm" />
                </Link>
              </Button>
              <Button asChild intent="secondary" size="lg" className="shadow-xs">
                <a href="#lifecycle">
                  <span>See the lifecycle</span>
                  <ChevronRight className="icon-sm text-ink-tertiary" />
                </a>
              </Button>
            </div>

            {/* Reassurance pills */}
            <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-ink-tertiary">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-brand" /> No forced curriculum
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-brand" /> No streak pressure
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-brand" /> Private by default
              </span>
            </div>
          </div>

          {/* Hero Visual: Clair de Lune from paper scan to living score */}
          <div className="relative">
            <HeroProductVisual />
          </div>
        </div>
      </section>

      {/* 2. PHILOSOPHY MOMENT: "Your music, not ours." */}
      <section id="philosophy" className="border-t border-line-subtle bg-surface-panel/40 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="type-caption font-semibold uppercase tracking-wider text-brand">
              The Yueora Philosophy
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.1] text-ink-primary">
              Your music, <br />
              <span className="italic font-normal">not ours.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-secondary">
              Most music platforms give you an algorithmically prescribed course, pressure you with
              streaks, or judge every note against an unforgiving standard. Yueora is built on a
              different belief:
            </p>
            <p className="mt-4 font-serif italic text-xl leading-relaxed text-ink-primary">
              &ldquo;The music already on your piano stand is the music that deserves your devotion.
              Yueora does not teach you what to love—it gives what you love a lasting home.&rdquo;
            </p>
          </div>

          {/* 4 Quiet Pillars — Unboxed, Editorial Hierarchy */}
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 border-t border-line-subtle pt-12">
            <div>
              <span className="font-display text-2xl font-normal text-brand">01</span>
              <h3 className="mt-2 font-display text-lg font-medium text-ink-primary">
                You Choose Repertoire
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Upload scans, photos, PDFs, or MusicXML. You decide what piece deserves your practice
                time today.
              </p>
            </div>

            <div>
              <span className="font-display text-2xl font-normal text-brand">02</span>
              <h3 className="mt-2 font-display text-lg font-medium text-ink-primary">
                Zero Streak Guilt
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                No reminders shaming you for missing a day. Music is an art of patience. Return when
                your heart wants to play.
              </p>
            </div>

            <div>
              <span className="font-display text-2xl font-normal text-brand">03</span>
              <h3 className="mt-2 font-display text-lg font-medium text-ink-primary">
                Non-Judgmental Listening
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Our acoustic engine follows your phrase and keeps your place quietly instead of
                flashing red error marks.
              </p>
            </div>

            <div>
              <span className="font-display text-2xl font-normal text-brand">04</span>
              <h3 className="mt-2 font-display text-lg font-medium text-ink-primary">
                Private Sanctuary
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Your attempts, half-learned phrases, and recordings remain strictly yours until you
                choose to share them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE CONNECTED LIFECYCLE: "A piece has a life in Yueora." */}
      <section id="lifecycle" className="border-t border-line-subtle py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <RepertoireGlyph className="h-4 w-4" />
              <span>The Musical Lifecycle</span>
            </div>
            <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,2.75rem)] font-medium text-ink-primary">
              A piece has a life in Yueora.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              Follow how Claude Debussy’s <span className="font-serif italic font-medium text-ink-primary">Clair de Lune</span> journeys
              through Yueora: from a wrinkled paper scan into a living performance memory.
            </p>
          </div>

          {/* Interactive Life Continuum Bar */}
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1.3fr] lg:items-center">
            {/* Steps list */}
            <div className="space-y-3">
              {journeySteps.map((s, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left rounded-lg p-4 transition-[color,background-color,border-color,box-shadow] duration-fast ${
                      isActive
                        ? 'music-paper shadow-paper border-l-4 border-l-brand'
                        : 'border border-transparent hover:bg-surface-panel/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="type-caption font-mono text-xs font-semibold text-brand">
                        {s.step}
                      </span>
                      <span className="type-metadata rounded-full bg-surface-canvas px-2.5 py-0.5 text-ink-tertiary">
                        {s.tag}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-medium text-ink-primary">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                      {s.summary}
                    </p>
                    {isActive && (
                      <p className="mt-2.5 border-t border-line-subtle pt-2 text-xs leading-relaxed text-ink-secondary/90 font-serif">
                        {s.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Stage Preview Visual */}
            <div className="relative">
              {activeStep === 0 && (
                <div className="music-paper rounded-lg p-6 shadow-paper">
                  <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                    <p className="type-caption text-ink-tertiary">Step 01 · Original Paper Scan</p>
                    <span className="type-metadata text-ink-secondary">Debussy · Clair de Lune</span>
                  </div>
                  <div className="mt-4 overflow-hidden rounded border border-line-subtle bg-surface-canvas/50">
                    <MockScanPage seed="step-scan-original" className="aspect-[4/3] w-full" />
                  </div>
                  <p className="mt-3 text-center text-xs text-ink-tertiary italic">
                    Physical sheet photographed at the piano stand
                  </p>
                </div>
              )}

              {activeStep === 1 && (
                <div className="music-paper rounded-lg p-6 shadow-paper">
                  <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                    <p className="type-caption text-ink-tertiary">Step 02 · Interactive Score Review</p>
                    <span className="rounded-control bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      OMR Recognized
                    </span>
                  </div>
                  <div className="mt-4 overflow-hidden rounded border border-line-subtle bg-white">
                    <ScorePreview id="step-score-review" className="aspect-[4/3] w-full" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-ink-secondary">
                    <span>Key: D♭ Major · 9/8 Time</span>
                    <span className="text-brand font-medium">Ready to play</span>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="music-paper rounded-lg p-6 shadow-paper">
                  <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                    <p className="type-caption text-ink-tertiary">Step 03 · Living Repertoire</p>
                    <span className="type-metadata text-ink-secondary">Curated Collection</span>
                  </div>
                  <div className="mt-4 rounded-control border border-line-subtle bg-surface-canvas/50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display text-lg font-medium text-ink-primary">
                          Clair de Lune
                        </h4>
                        <p className="type-metadata text-ink-secondary">Claude Debussy</p>
                      </div>
                      <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                        Active Study
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-ink-tertiary">
                      <span>Last played Sunday</span>
                      <span>·</span>
                      <span className="text-brand font-medium">Continue from bar 14</span>
                    </div>
                  </div>
                  <div className="mt-3 aspect-[16/7] overflow-hidden rounded border border-line-subtle bg-white">
                    <ScorePreview id="step-score-view" className="h-full w-full" />
                  </div>
                </div>
              )}

              {activeStep === 3 && <PracticeWorkspaceVisual />}
              {activeStep === 4 && <PerformanceMemoryVisual />}
              {activeStep === 5 && <SharingVisual />}
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEEP DIVE: PERSONAL REPERTOIRE */}
      <section id="repertoire" className="border-t border-line-subtle bg-surface-panel/30 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                <BookOpen className="h-4 w-4" />
                <span>Personal Repertoire</span>
              </div>
              <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,2.75rem)] font-medium text-ink-primary">
                A music cabinet,<br />
                not a cloud drive.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-secondary">
                Yueora doesn’t treat your music like generic files or spreadsheets. Every piece is
                bound into tactile paper, complete with its practice timeline, saved takes, and
                personal notes.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <ScoreSheetGlyph className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-medium text-ink-primary">
                      Pick up where you left off
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
                      One-click continuation straight to the bar and tempo you were exploring last
                      time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-medium text-ink-primary">
                      Organized by affection, not algorithms
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
                      Group into collections like &ldquo;Sunday Morning Pieces&rdquo;, &ldquo;French Impressionism&rdquo;, or
                      &ldquo;Currently Memorizing&rdquo;.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Repertoire visual showcase */}
            <div className="grid grid-cols-2 gap-4">
              <MusicPaper tone="warm" elevation="paper" className="p-4 transition hover:shadow-paper-hover">
                <div className="aspect-[4/3] overflow-hidden rounded border border-line-subtle bg-white">
                  <ScorePreview id="rep-clair" className="h-full w-full" />
                </div>
                <div className="mt-3">
                  <span className="type-caption text-brand">Continue from bar 14</span>
                  <p className="font-display text-base font-medium text-ink-primary">Clair de Lune</p>
                  <p className="type-metadata text-ink-tertiary">Debussy · 1 take kept</p>
                </div>
              </MusicPaper>

              <MusicPaper tone="white" elevation="paper" className="p-4 transition hover:shadow-paper-hover">
                <div className="aspect-[4/3] overflow-hidden rounded border border-line-subtle bg-white">
                  <ScorePreview id="rep-gymno" className="h-full w-full" />
                </div>
                <div className="mt-3">
                  <span className="type-caption text-ink-tertiary">Lent et douloureux</span>
                  <p className="font-display text-base font-medium text-ink-primary">Gymnopédie No. 1</p>
                  <p className="type-metadata text-ink-tertiary">Satie · 2 takes kept</p>
                </div>
              </MusicPaper>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEEP DIVE: PRACTICE STAND & NON-JUDGMENTAL LISTENING */}
      <section id="practice" className="relative border-y border-line-subtle/50 bg-surface-paper/40 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                <PracticeGlyph className="h-4 w-4" />
                <span>The Practice Stand</span>
              </div>
              <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,2.75rem)] font-medium text-ink-primary">
                Following your phrasing,<br />
                not policing your notes.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-secondary">
                Traditional practice tools penalize every missed accidental with blaring red marks.
                Yueora listens quietly to acoustic piano through your microphone, tracking where you
                are on the score and following your phrase.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-ink-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" />
                  <span>
                    <strong className="font-medium text-ink-primary">Paced Following:</strong> The
                    following engine respects expressive phrasing, slowing down and accelerating with
                    you.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" />
                  <span>
                    <strong className="font-medium text-ink-primary">Targeted Phrase Looping:</strong>{' '}
                    Select measures 14 to 22 with one tap to work through tricky transitions calmly.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" />
                  <span>
                    <strong className="font-medium text-ink-primary">Zero Accuracy Scoring:</strong> No
                    judgment, no stars, no grading—just a quiet, supportive companion at the keys.
                  </span>
                </li>
              </ul>
            </div>

            {/* Visual: Practice Stand Component */}
            <div>
              <PracticeWorkspaceVisual />
            </div>
          </div>
        </div>
      </section>

      {/* 6. DEEP DIVE: PRESERVED PERFORMANCES & TIME */}
      <section id="performances" className="border-t border-line-subtle bg-surface-panel/30 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <MemoryGlyph className="h-4 w-4" />
              <span>Preserved Moments &amp; Time</span>
            </div>
            <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,2.75rem)] font-medium text-ink-primary">
              Reflective memories,<br />
              never vanity metrics.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              Music is not a gym workout or a productivity sprint. Yueora preserves the takes you
              love and reflects on the quiet time you spent immersed in sound.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <p className="type-caption text-ink-tertiary mb-3">Reflective Immersion</p>
              <ProgressVisual />
            </div>
            <div>
              <p className="type-caption text-ink-tertiary mb-3">Preserved Take Archive</p>
              <PerformanceMemoryVisual />
            </div>
          </div>
        </div>
      </section>

      {/* 7. DEEP DIVE: PRIVATE SHARING */}
      <section className="border-t border-line-subtle py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                <Lock className="h-4 w-4" />
                <span>Intimate Sharing</span>
              </div>
              <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,2.75rem)] font-medium text-ink-primary">
                Sharing is a door<br />
                you choose to open.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-secondary">
                No public feeds. No follower counts. No social media pressure. When you complete a take
                you want your piano teacher or a close friend to hear, you can invite them privately
                with an accompanying personal note.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  <span>Private by default — nothing is indexed or public</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  <span>Granular permission: View only or view &amp; annotate</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  <span>Revoke shared access anytime with one click</span>
                </div>
              </div>
            </div>

            <div>
              <SharingVisual />
            </div>
          </div>
        </div>
      </section>

      {/* 8. SIMPLE PRICING */}
      <section id="pricing" className="border-t border-line-subtle bg-surface-panel/40 py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="type-caption font-semibold uppercase tracking-wider text-brand">
              Durable &amp; Fair
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,2.75rem)] font-medium text-ink-primary">
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 text-base text-ink-secondary">
              Start for free with your favorite pieces. Upgrade to Pro when your repertoire expands.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free Plan */}
            <MusicPaper tone="white" elevation="paper" className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <p className="font-display text-xl font-medium text-ink-primary">Free</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  A personal starter library to begin your journey.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-medium text-ink-primary">
                    {formatPrice(plans.free.priceMonthly)}
                  </span>
                  <span className="type-metadata text-ink-tertiary">free tier</span>
                </div>

                <ul className="mt-8 space-y-3 border-t border-line-subtle pt-6 text-sm text-ink-secondary">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Up to 5 interactive scores
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Non-judgmental acoustic following
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Audio take recording
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Practice history and session journal
                  </li>
                </ul>
              </div>

              <Button asChild intent="secondary" size="lg" className="mt-8 w-full shadow-xs">
                <Link to={primary}>
                  Get Started Free
                </Link>
              </Button>
            </MusicPaper>

            {/* Pro Plan */}
            <MusicPaper tone="warm" elevation="paper" className="p-6 sm:p-8 flex flex-col justify-between border-2 border-brand/50">
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl font-medium text-ink-primary">Pro Repertoire</p>
                  <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                    Musician Choice
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-secondary">
                  Unlimited scores, practice insights, and deep performance archives.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-medium text-ink-primary">
                    {formatPrice(plans.pro.priceMonthly)}
                  </span>
                  <span className="type-metadata text-ink-tertiary">/ month</span>
                </div>

                <ul className="mt-8 space-y-3 border-t border-line-subtle pt-6 text-sm text-ink-secondary">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Unlimited interactive scores &amp; scans
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Phrase looping &amp; custom tempo control
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Audio &amp; video take archive
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Original audio &amp; video downloads
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-brand" /> Intimate sharing with teachers &amp; friends
                  </li>
                </ul>
              </div>

              <Button asChild intent="primary" size="lg" className="mt-8 w-full shadow-sm">
                <Link to={primary}>
                  Start Free Trial
                </Link>
              </Button>
            </MusicPaper>
          </div>

          <div className="mt-8 text-center text-xs text-ink-tertiary">
            <span>Cancel anytime. Your saved recordings and data can always be downloaded.</span>
          </div>
        </div>
      </section>

      {/* 9. EDITORIAL FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <div className="text-center">
          <p className="type-caption font-semibold uppercase tracking-wider text-brand">
            Clarity &amp; Questions
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium text-ink-primary">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line-subtle border-y border-line-subtle">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5 transition-colors">
              <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-ink-primary focus:outline-hidden">
                <span>{f.q}</span>
                <span className="ml-4 font-mono text-ink-tertiary group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary font-serif">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 10. FINAL BRAND CLOSING: "Play what you love." */}
      <section className="border-t border-line-subtle bg-surface-panel/40 py-20 text-center md:py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand mb-4">
            <Music className="h-5 w-5" />
          </div>

          <h2 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-tight text-ink-primary">
            Play what you love.
          </h2>
          <p className="mt-3 font-serif italic text-xl text-brand">
            喜欢，就弹。
          </p>
          <p className="mt-4 max-w-md mx-auto text-base text-ink-secondary">
            Your music is waiting on your piano stand. Bring it into Yueora today.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Button asChild intent="primary" size="lg" className="shadow-sm hover:shadow-md">
              <Link to={primary}>
                <span>Begin Your Repertoire</span>
                <ArrowRight className="icon-sm" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
