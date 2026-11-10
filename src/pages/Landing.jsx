import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
  ArrowRight,
  ArrowDown,
  Check,
} from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import Reveal from '@/components/public/Reveal';
import ScorePreview from '@/components/library/ScorePreview';
import HeroProductVisual from '@/components/visuals/HeroProductVisual';
import PracticeWorkspaceVisual from '@/components/visuals/PracticeWorkspaceVisual';
import ProgressVisual from '@/components/visuals/ProgressVisual';
import SharingVisual from '@/components/visuals/SharingVisual';
import PerformanceMemoryVisual from '@/components/visuals/PerformanceMemoryVisual';
import MockScanPage from '@/components/visuals/MockScanPage';
import { ScoreSheetGlyph } from '@/components/brand/MusicalGlyphs';
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
      a: 'Never. Yueora has no daily streaks, no guilt reminders, and no badges for logging in consecutive days. Music is a lifelong practice of affection, not a gamified habit tracker.',
    },
    {
      q: 'How does Yueora listen to my piano?',
      a: 'Yueora uses your laptop, tablet, or phone microphone to listen to the acoustic sound of your instrument. It recognizes pitches and timing against your score, keeping your place calmly without judging mistakes.',
    },
    {
      q: 'Can I bring my own existing sheet music?',
      a: 'Yes. You can upload PDFs, phone photos, flatbed scans, or MusicXML files. Yueora’s optical music recognition translates static images into interactive, editable notation.',
    },
    {
      q: 'Is my playing and library private?',
      a: 'Strictly private. Nothing in your repertoire is public or searchable. Recordings and session journals remain on your account unless you explicitly create an intimate private share link.',
    },
  ];

  return (
    <PublicShell>
      {/* 1. HERO — UGC 12-Column Editorial Grammar */}
      <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
        {/* ambient oversized background typography */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-display italic text-[26vw] leading-none text-ink-primary/[0.035] select-none whitespace-nowrap">
            music
          </span>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-28 pb-24 lg:py-0">
          {/* Left 7 Columns — Identity & Editorial Statement */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="type-eyebrow text-ink-tertiary mb-6"
            >
              Personal Sheet Music Sanctuary · Private by Default
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="type-hero-title text-ink-primary"
            >
              Play what
              <br />
              <span className="italic">you love.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-xs sm:text-sm tracking-[0.22em] uppercase text-ink-secondary font-medium"
            >
              Personal sheet music library &amp; quiet practice stand
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 max-w-xl text-lg md:text-xl leading-relaxed text-ink-secondary"
            >
              Bring the sheet music that already matters to you. Yueora turns physical pages into
              living interactive scores, holds your personal repertoire, follows your playing without
              judgment, and preserves the musical moments worth keeping.
            </motion.p>

            {/* Tactile Actions — UGC Hero CTA scale: 52px high, 28px horizontal padding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button asChild intent="primary" size="xl">
                <Link to={primary}>
                  <span>Start your repertoire</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild intent="secondary" size="xl">
                <a href="#lifecycle">
                  <span>See the lifecycle</span>
                  <ArrowDown className="w-4 h-4 text-ink-tertiary" />
                </a>
              </Button>
            </motion.div>

            {/* Reassurance pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-tertiary"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-ink-primary" /> No forced curriculum
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-ink-primary" /> No streak pressure
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-ink-primary" /> 100% Private by default
              </span>
            </motion.div>
          </div>

          {/* Right 5 Columns — Elevated Musical Media Object (Harmonized with headline hierarchy) */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[85vw] max-w-[380px] sm:w-[350px] lg:w-full lg:max-w-[390px] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.25)] border border-line-subtle/80 bg-surface-panel p-2 sm:p-3"
            >
              <HeroProductVisual />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full bg-white/90 text-ink-primary type-eyebrow backdrop-blur border border-line-subtle shadow-sm">
                  Clair de Lune
                </span>
                <span className="font-display italic text-ink-primary text-sm font-medium">Debussy</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.a
          href="#trust"
          aria-label="Scroll to content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-ink-tertiary"
        >
          <span className="type-eyebrow">Scroll</span>
          <span className="w-px h-8 bg-ink-primary/20 overflow-hidden relative">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-ink-primary"
              animate={{ y: [-16, 32] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.a>
      </section>

      {/* 2. REASSURANCE / PHILOSOPHY STRIP — UGC BrandTrustBar Parity */}
      <section id="trust" className="py-20 md:py-24 border-y border-line-subtle/80 bg-surface-panel/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-center type-eyebrow text-ink-tertiary mb-10">
              Built on patience and devotion · Your music, not ours
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line-subtle/80 rounded-2xl overflow-hidden border border-line-subtle/80">
              <div className="bg-surface-canvas px-6 py-8 text-center">
                <div className="font-display text-4xl md:text-5xl tracking-tight text-ink-primary">0</div>
                <div className="mt-2 type-eyebrow text-ink-secondary">
                  Streak pressure
                </div>
              </div>
              <div className="bg-surface-canvas px-6 py-8 text-center">
                <div className="font-display text-4xl md:text-5xl tracking-tight text-ink-primary">Any</div>
                <div className="mt-2 type-eyebrow text-ink-secondary">
                  Score format accepted
                </div>
              </div>
              <div className="bg-surface-canvas px-6 py-8 text-center">
                <div className="font-display text-4xl md:text-5xl tracking-tight text-ink-primary">Mic</div>
                <div className="mt-2 type-eyebrow text-ink-secondary">
                  Acoustic phrase listening
                </div>
              </div>
              <div className="bg-surface-canvas px-6 py-8 text-center">
                <div className="font-display text-4xl md:text-5xl tracking-tight text-ink-primary">100%</div>
                <div className="mt-2 type-eyebrow text-ink-secondary">
                  Private by default
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. THE CONNECTED LIFECYCLE — UGC CaseStudies Parity */}
      <section id="lifecycle" className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p className="type-eyebrow text-ink-tertiary mb-4">
                  01 · The Musical Lifecycle
                </p>
                <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance max-w-2xl text-ink-primary">
                  A piece has a <span className="italic">life</span> in Yueora.
                </h2>
              </div>
              <p className="text-ink-secondary max-w-sm leading-relaxed text-base">
                Follow how Claude Debussy’s <span className="font-display italic font-medium text-ink-primary">Clair de Lune</span> journeys
                from a paper scan into a living performance memory.
              </p>
            </div>
          </Reveal>

          {/* Interactive Life Continuum Bar */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Steps list — 5 columns */}
            <div className="lg:col-span-5 space-y-3">
              {journeySteps.map((s, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left rounded-2xl p-5 transition-all duration-300 ${
                      isActive
                        ? 'bg-surface-panel border border-line-subtle shadow-[0_20px_40px_-20px_rgba(0,0,0,0.12)]'
                        : 'border border-transparent hover:bg-neutral-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="type-metadata font-mono font-semibold tracking-wider text-ink-primary">
                        {s.step}
                      </span>
                      <span className="type-metadata uppercase rounded-full bg-surface-canvas px-3 py-0.5 text-ink-tertiary border border-line-subtle/60">
                        {s.tag}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-medium text-ink-primary">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                      {s.summary}
                    </p>
                    {isActive && (
                      <p className="mt-3 border-t border-line-subtle pt-2.5 text-xs leading-relaxed text-ink-secondary font-display italic">
                        {s.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Stage Preview Visual — 7 columns */}
            <div className="lg:col-span-7">
              <div className="rounded-[2.5rem] border border-line-subtle bg-surface-panel p-6 sm:p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
                {activeStep === 0 && (
                  <div>
                    <div className="flex items-center justify-between border-b border-line-subtle pb-4">
                      <p className="type-eyebrow text-ink-tertiary">Step 01 · Original Paper Scan</p>
                      <span className="text-sm font-medium text-ink-primary">Debussy · Clair de Lune</span>
                    </div>
                    <div className="mt-6 overflow-hidden rounded-2xl border border-line-subtle bg-surface-canvas/50">
                      <MockScanPage seed="step-scan-original" className="aspect-[16/10] w-full" />
                    </div>
                    <p className="mt-4 text-center text-xs text-ink-tertiary italic">
                      Physical sheet photographed on the music stand
                    </p>
                  </div>
                )}

                {activeStep === 1 && (
                  <div>
                    <div className="flex items-center justify-between border-b border-line-subtle pb-4">
                      <p className="type-eyebrow text-ink-tertiary">Step 02 · Interactive Score Review</p>
                      <span className="rounded-full border border-line-subtle bg-surface-canvas px-3 py-0.5 type-metadata font-semibold text-ink-primary">
                        OMR Recognized
                      </span>
                    </div>
                    <div className="mt-6 overflow-hidden rounded-2xl border border-line-subtle bg-white">
                      <ScorePreview id="step-score-review" className="aspect-[16/10] w-full" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-ink-secondary">
                      <span>Key: D♭ Major · 9/8 Time</span>
                      <span className="text-ink-primary font-semibold">Ready to play</span>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div>
                    <div className="flex items-center justify-between border-b border-line-subtle pb-4">
                      <p className="type-eyebrow text-ink-tertiary">Step 03 · Living Repertoire</p>
                      <span className="text-sm font-medium text-ink-primary">Curated Collection</span>
                    </div>
                    <div className="mt-6 rounded-2xl border border-line-subtle bg-surface-canvas/50 p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-display text-xl font-medium text-ink-primary">
                            Clair de Lune
                          </h4>
                          <p className="text-sm text-ink-secondary">Claude Debussy</p>
                        </div>
                        <span className="rounded-full border border-line-subtle bg-surface-panel px-3 py-1 type-metadata font-semibold text-ink-primary">
                          Active Study
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-xs text-ink-tertiary">
                        <span>Last played Sunday</span>
                        <span>·</span>
                        <span className="text-ink-primary font-medium">Continue from bar 14</span>
                      </div>
                    </div>
                    <div className="mt-4 aspect-[16/8] overflow-hidden rounded-2xl border border-line-subtle bg-white">
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
        </div>
      </section>

      {/* 4. PERSONAL REPERTOIRE — UGC SelectedWork Parity */}
      <section id="repertoire" className="py-24 md:py-36 bg-surface-panel/30 border-y border-line-subtle/80">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p className="type-eyebrow text-ink-tertiary mb-4">
                  02 · Personal Repertoire
                </p>
                <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance max-w-2xl text-ink-primary">
                  A music cabinet, <br />
                  <span className="italic">not a cloud drive.</span>
                </h2>
              </div>
              <p className="text-ink-secondary max-w-sm leading-relaxed text-base">
                Yueora doesn’t treat your music like generic files. Every piece is bound into tactile
                pages, complete with its practice timeline, saved takes, and personal notes.
              </p>
            </div>
          </Reveal>

          {/* 3-Column Work Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Reveal delay={0}>
              <div className="group rounded-[2rem] border border-line-subtle bg-surface-panel p-6 transition-all duration-500 hover:-translate-y-1 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-line-subtle bg-surface-canvas/50">
                  <ScorePreview id="rep-clair" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="mt-5">
                  <span className="type-metadata uppercase tracking-[0.2em] text-ink-tertiary">Debussy</span>
                  <h3 className="font-display text-2xl tracking-tight text-ink-primary mt-1">Clair de Lune</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-secondary">Suite bergamasque · Bar 14</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-ink-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-primary shrink-0" />
                    <span>Active study · 2 takes preserved</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="group rounded-[2rem] border border-line-subtle bg-surface-panel p-6 transition-all duration-500 hover:-translate-y-1 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-line-subtle bg-surface-canvas/50">
                  <ScorePreview id="rep-gymno" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="mt-5">
                  <span className="type-metadata uppercase tracking-[0.2em] text-ink-tertiary">Satie</span>
                  <h3 className="font-display text-2xl tracking-tight text-ink-primary mt-1">Gymnopédie No. 1</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-secondary">Lent et douloureux</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-ink-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-primary shrink-0" />
                    <span>Polishing · 3 takes preserved</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="group rounded-[2rem] border border-line-subtle bg-surface-panel p-6 transition-all duration-500 hover:-translate-y-1 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-line-subtle bg-surface-canvas/50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <ScoreSheetGlyph className="h-8 w-8 text-ink-primary mx-auto mb-3" />
                    <p className="font-display text-lg text-ink-primary">Your Next Piece</p>
                    <p className="text-xs text-ink-tertiary mt-1">Drop a scan or PDF anytime</p>
                  </div>
                </div>
                <div className="mt-5">
                  <span className="type-metadata uppercase tracking-[0.2em] text-ink-tertiary">Open Repertoire</span>
                  <h3 className="font-display text-2xl tracking-tight text-ink-primary mt-1">Ready to explore</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-secondary">Add whatever you feel like playing</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-ink-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-line-strong shrink-0" />
                    <span>No subscription limit to begin</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. THE PRACTICE STAND — UGC 5/7 Editorial Asymmetry */}
      <section id="practice" className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left 5 Columns — Visual */}
          <Reveal className="lg:col-span-5" y={36}>
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.25)] border border-line-subtle bg-surface-panel p-4">
              <PracticeWorkspaceVisual />
            </div>
          </Reveal>

          {/* Right 7 Columns — Content */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="type-eyebrow text-ink-tertiary mb-5">
                03 · The Practice Stand
              </p>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance text-ink-primary">
                Following your phrasing, <br />
                <span className="italic">not policing your notes.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-7 space-y-5 text-lg leading-relaxed text-ink-secondary max-w-xl">
                <p>
                  Traditional practice tools penalize every missed accidental with blaring red marks.
                  Yueora listens quietly to acoustic piano through your microphone, tracking where you
                  are on the score and following your phrase.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-line-subtle bg-surface-panel p-5 hover:border-line-strong hover:-translate-y-0.5 transition-all duration-300">
                  <h3 className="font-display text-xl text-ink-primary">Paced Following</h3>
                  <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                    Respects expressive rubato, slowing down and accelerating naturally with you.
                  </p>
                </div>

                <div className="rounded-2xl border border-line-subtle bg-surface-panel p-5 hover:border-line-strong hover:-translate-y-0.5 transition-all duration-300">
                  <h3 className="font-display text-xl text-ink-primary">Phrase Looping</h3>
                  <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                    Select measures 14 to 22 with one tap to work through tricky transitions calmly.
                  </p>
                </div>

                <div className="rounded-2xl border border-line-subtle bg-surface-panel p-5 hover:border-line-strong hover:-translate-y-0.5 transition-all duration-300 sm:col-span-2">
                  <h3 className="font-display text-xl text-ink-primary">Zero Accuracy Scoring</h3>
                  <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                    No percentage grades, no stars, no shaming—just a quiet, supportive companion at the keys.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. PRESERVED PERFORMANCES & INTIMATE SHARING */}
      <section id="performances" className="py-24 md:py-36 bg-surface-panel/30 border-y border-line-subtle/80">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p className="type-eyebrow text-ink-tertiary mb-4">
                  04 · Preserved Moments &amp; Intimate Sharing
                </p>
                <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance max-w-2xl text-ink-primary">
                  Reflective memories, <br />
                  <span className="italic">never vanity metrics.</span>
                </h2>
              </div>
              <p className="text-ink-secondary max-w-sm leading-relaxed text-base">
                Music is not a gym workout or a productivity sprint. Preserve the takes you love and open
                the door only when you choose.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal delay={0.05}>
              <div className="rounded-[2rem] border border-line-subtle bg-surface-panel p-6 sm:p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
                <p className="type-eyebrow text-ink-tertiary mb-4">Reflective Immersion</p>
                <ProgressVisual />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-[2rem] border border-line-subtle bg-surface-panel p-6 sm:p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
                <p className="type-eyebrow text-ink-tertiary mb-4">Intimate Sharing Door</p>
                <SharingVisual />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. TRANSPARENT PRICING — UGC Services Parity */}
      <section id="pricing" className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="mb-16 max-w-2xl">
              <p className="type-eyebrow text-ink-tertiary mb-4">
                05 · Simple &amp; Durable
              </p>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance text-ink-primary">
                Simple, transparent <span className="italic">pricing.</span>
              </h2>
              <p className="mt-4 text-base text-ink-secondary leading-relaxed">
                Start for free with your favorite pieces. Upgrade to Pro when your repertoire expands.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl">
            {/* Free Plan (White Panel) */}
            <Reveal delay={0.05}>
              <div className="h-full rounded-[2rem] p-8 md:p-9 flex flex-col justify-between bg-surface-panel border border-line-subtle hover:border-line-strong transition-all duration-300">
                <div>
                  <span className="type-eyebrow text-ink-tertiary">
                    Starter
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl tracking-tight leading-none text-ink-primary mt-4">
                    {plans.free.name}
                  </h3>
                  <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                    A personal starter library to begin your musical journey calmly.
                  </p>
                  <div className="mt-6 font-display text-4xl md:text-5xl tracking-tight text-ink-primary">
                    {formatPrice(plans.free.priceMonthly)}
                    <span className="text-sm font-normal text-ink-tertiary ml-2">free forever</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 border-t border-line-subtle pt-6 text-sm text-ink-secondary">
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> {plans.free.scores} in your library
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> {plans.free.imports}
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> {plans.free.storage} storage
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> {plans.free.sharing} sharing
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> Acoustic phrase following
                    </li>
                  </ul>
                </div>

                <div className="mt-10">
                  <Button asChild intent="secondary" size="xl" className="w-full rounded-full">
                    <Link to={primary}>Get Started Free</Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Plus Plan — Featured Middle Inverse Dark Card (Most Popular) */}
            <Reveal delay={0.1}>
              <div className="h-full rounded-[2rem] p-8 md:p-9 flex flex-col justify-between bg-ink-primary text-surface-canvas border border-ink-primary shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="type-eyebrow text-surface-canvas/60">
                      Regular Musician
                    </span>
                    <span className="rounded-full bg-surface-canvas/15 px-3 py-1 type-metadata uppercase text-surface-canvas font-semibold">
                      Most Popular
                    </span>
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl tracking-tight leading-none text-surface-canvas mt-4">
                    {plans.plus.name}
                  </h3>
                  <p className="mt-3 text-sm text-surface-canvas/75 leading-relaxed">
                    For active players building their repertoire with practice insights.
                  </p>
                  <div className="mt-6 font-display text-4xl md:text-5xl tracking-tight text-surface-canvas">
                    {formatPrice(plans.plus.priceMonthly)}
                    <span className="text-sm font-normal text-surface-canvas/60 ml-2">/ month</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 border-t border-surface-canvas/20 pt-6 text-sm text-surface-canvas/85">
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-surface-canvas shrink-0" /> <strong>{plans.plus.scores}</strong> in your library
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-surface-canvas shrink-0" /> <strong>{plans.plus.imports}</strong>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-surface-canvas shrink-0" /> <strong>{plans.plus.storage}</strong> storage
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-surface-canvas shrink-0" /> {plans.plus.sharing} sharing
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-surface-canvas shrink-0" /> Practice insights &amp; journal
                    </li>
                  </ul>
                </div>

                <div className="mt-10">
                  <Button asChild size="xl" className="w-full bg-surface-canvas text-ink-primary hover:bg-white font-semibold rounded-full">
                    <Link to={primary}>Start Plus</Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Pro Plan — Highest Capability Tier (White Panel) */}
            <Reveal delay={0.15}>
              <div className="h-full rounded-[2rem] p-8 md:p-9 flex flex-col justify-between bg-surface-panel border border-line-subtle hover:border-line-strong transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="type-eyebrow text-ink-tertiary">
                      Devoted Repertoire
                    </span>
                    <span className="type-metadata text-ink-tertiary uppercase tracking-wider">
                      Unlimited
                    </span>
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl tracking-tight leading-none text-ink-primary mt-4">
                    {plans.pro.name}
                  </h3>
                  <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                    Unlimited scores, phrase looping, and deep performance archives.
                  </p>
                  <div className="mt-6 font-display text-4xl md:text-5xl tracking-tight text-ink-primary">
                    {formatPrice(plans.pro.priceMonthly)}
                    <span className="text-sm font-normal text-ink-tertiary ml-2">/ month</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 border-t border-line-subtle pt-6 text-sm text-ink-secondary">
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> <strong>{plans.pro.scores}</strong> in your library
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> <strong>{plans.pro.imports}</strong>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> <strong>{plans.pro.storage}</strong> storage
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> {plans.pro.sharing} sharing
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-ink-primary shrink-0" /> <strong>Full recording downloads</strong>
                    </li>
                  </ul>
                </div>

                <div className="mt-10">
                  <Button asChild intent="primary" size="xl" className="w-full rounded-full">
                    <Link to={primary}>Start Pro</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. EDITORIAL FAQ */}
      <section className="py-24 md:py-36 border-t border-line-subtle/80 bg-surface-panel/30">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center">
              <p className="type-eyebrow text-ink-tertiary mb-4">
                06 · Clarity &amp; Questions
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-ink-primary">
                Frequently asked questions
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 divide-y divide-line-subtle border-y border-line-subtle">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-ink-primary focus:outline-hidden">
                  <span>{f.q}</span>
                  <span className="ml-4 font-mono text-ink-tertiary group-open:rotate-45 transition-transform duration-300">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-base leading-relaxed text-ink-secondary font-display italic">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL INVERSE CONVERSION BLOCK — UGC ContactCTA Parity */}
      <section className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="rounded-[2.5rem] bg-ink-primary text-surface-canvas overflow-hidden relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)]">
            {/* ambient oversized word */}
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-display italic text-[22vw] leading-none text-surface-canvas/[0.04] select-none whitespace-nowrap">
                play
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 md:p-14 lg:p-20 items-center">
              {/* Left 7 Columns — Pitch */}
              <div className="lg:col-span-7">
                <Reveal>
                  <p className="type-eyebrow text-surface-canvas/50 mb-6">
                    A Personal Sanctuary
                  </p>
                  <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance text-surface-canvas">
                    Play what you love. <br />
                    <span className="italic text-surface-canvas/80">乐，是为了悦。</span>
                  </h2>
                  <p className="mt-7 text-surface-canvas/75 text-lg md:text-xl leading-relaxed max-w-lg">
                    Your music is waiting on your piano stand. Bring it into Yueora and start your
                    journey with the pieces that already matter to you.
                  </p>
                </Reveal>
              </div>

              {/* Right 5 Columns — Action Card */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <Reveal delay={0.1}>
                  <div className="rounded-3xl border border-surface-canvas/15 p-8 md:p-10 bg-surface-canvas/5 backdrop-blur-md">
                    <p className="text-xs tracking-wider uppercase text-surface-canvas/60 mb-2">
                      Get Started Today
                    </p>
                    <p className="font-display text-2xl text-surface-canvas">
                      No card required for free tier.
                    </p>
                    <p className="text-sm text-surface-canvas/75 mt-2 leading-relaxed">
                      Upload your first score in under two minutes.
                    </p>
                    <div className="mt-8 flex flex-col gap-3">
                      <Button asChild size="xl" className="w-full bg-surface-canvas text-ink-primary hover:bg-white font-semibold rounded-full">
                        <Link to={primary}>
                          <span>Begin Your Repertoire</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <p className="text-center text-xs text-surface-canvas/50 mt-1">
                        Encrypted · Private by Default · Cancel Anytime
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
