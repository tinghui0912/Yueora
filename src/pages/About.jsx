import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import PublicShell from '@/components/public/PublicShell';
import AppPage from '@/components/patterns/AppPage';
import Surface from '@/components/patterns/Surface';
import Reveal from '@/components/public/Reveal';
import ScorePreview from '@/components/library/ScorePreview';
import { Button } from '@/components/ui/button';
import { Music2, Heart, Eye, TrendingUp, Shield, ArrowRight } from 'lucide-react';

export default function About() {
  const { isAuthenticated } = useAuth();
  const scores = usePrototypeStore((s) => s.scores);
  const activeScoresCount = (scores || []).filter((s) => s.ownership !== 'trash').length;
  const ctaDestination = isAuthenticated ? (activeScoresCount > 0 ? '/practice' : '/add-score') : '/register';

  return (
    <PublicShell>
      <AppPage size="full" padding="none">
        {/* 1. Asymmetric Editorial Hero — UGC 12-Column (5 Media / 7 Copy) */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left 5 Columns: Framed Real Domain Score Preview */}
            <Reveal className="lg:col-span-5" y={36}>
              <Surface tone="panel" elevation="overlay" className="relative aspect-[4/5] overflow-hidden p-6 sm:p-8 flex flex-col justify-between select-none">
                {/* Score Header */}
                <div className="border-b border-line-subtle pb-4">
                  <div className="flex items-center justify-between type-eyebrow text-ink-tertiary">
                    <span>Repertoire Archive</span>
                    <span>Op. 75 No. 3</span>
                  </div>
                  <h3 className="mt-3 type-subsection text-ink-primary">
                    Clair de Lune
                  </h3>
                  <p className="mt-0.5 type-metadata text-ink-secondary">Claude Debussy · Suite bergamasque</p>
                </div>

                {/* Real Domain Score Preview */}
                <div className="my-auto overflow-hidden rounded-container border border-line-subtle bg-surface-panel">
                  <ScorePreview id="about-score-clair" className="aspect-[16/11] w-full object-cover" />
                </div>

                {/* Score Footer Details */}
                <div className="pt-4 border-t border-line-subtle flex items-center justify-between type-metadata text-ink-tertiary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-practice-following" /> Acoustic Listener Ready
                  </span>
                  <span>Personal Repertoire · Page 1</span>
                </div>
              </Surface>
            </Reveal>

            {/* Right 7 Columns: Editorial Manifesto */}
            <div className="lg:col-span-7">
              <Reveal>
                <p className="type-eyebrow text-ink-tertiary mb-5">
                  About · Why Yueora Exists
                </p>
                <h1 className="type-marketing-title text-balance text-ink-primary">
                  Music is meant to be enjoyed.
                </h1>
                <p className="mt-4 type-editorial-quote text-ink-secondary">
                  乐，是为了悦。
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-7 space-y-5 type-marketing-body text-ink-secondary max-w-xl">
                  <p>
                    You don’t have to play for an exam, a competition, or anyone else’s expectations.
                    Music in your home does not need to justify itself with certificates or daily practice streaks.
                  </p>
                  <p>
                    We built Yueora because modern practice tools treat music as an obligation: a syllabus to fulfill,
                    a streak to protect, and a stream of red error highlights telling you what you did wrong.
                  </p>
                  <p className="font-medium text-ink-primary">
                    We believe loving a piece is reason enough to play it.
                  </p>
                </div>
              </Reveal>

              {/* Shift cards */}
              <Reveal delay={0.15}>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Surface padding="md">
                    <p className="type-eyebrow text-ink-tertiary">Traditional Tools</p>
                    <p className="mt-2 type-subsection text-ink-primary font-medium">
                      &ldquo;Here is what you must practice.&rdquo;
                    </p>
                    <p className="mt-1.5 type-body-small text-ink-secondary">
                      A curriculum, a syllabus, daily streak badges, and forced grading matrices.
                    </p>
                  </Surface>
                  <Surface padding="md">
                    <p className="type-eyebrow text-ink-primary">Yueora Sanctuary</p>
                    <p className="mt-2 type-subsection text-ink-primary font-medium">
                      &ldquo;What do you feel like playing?&rdquo;
                    </p>
                    <p className="mt-1.5 type-body-small text-ink-secondary">
                      You bring the sheet music that already matters to you. Everything follows from your devotion.
                    </p>
                  </Surface>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 2. Etymology Section — The Sound & Meaning */}
        <section className="py-16 md:py-24 border-t border-line-subtle/80 bg-surface-panel/30">
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="type-eyebrow text-ink-tertiary mb-4">Etymology &amp; Philosophy</p>
                <h2 className="type-marketing-title text-ink-primary text-balance">
                  Why &ldquo;Yueora&rdquo;
                </h2>
                {/* ds-allow: decorative brand hanzi glyph artwork */}
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="font-display text-6xl md:text-7xl text-ink-primary font-medium">乐</span>
                  <span className="text-xl text-ink-tertiary font-serif italic">+</span>
                  <span className="font-display text-6xl md:text-7xl text-ink-primary font-medium">悦</span>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={0.1}>
                <div className="space-y-5 type-marketing-body text-ink-secondary max-w-2xl">
                  <p>
                    In Chinese, <span className="font-medium text-ink-primary">乐 (yuè)</span> means music,
                    while <span className="font-medium text-ink-primary">悦 (yuè)</span> carries the idea of joy and quiet delight.
                  </p>
                  <p>
                    Different characters. The exact same sound.
                  </p>
                  <p>
                    For thousands of years in classical thought, music was never separated from happiness.
                    Over time, institutional pedagogy turned music into an exercise of discipline and stress.
                  </p>
                  <p className="type-editorial-quote text-ink-primary pt-2">
                    To us, they belong together: 乐，是为了悦。
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 3. Four Core Principles — UGC Interests Parity Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <Reveal>
              <div className="mb-14 max-w-2xl">
                <p className="type-eyebrow text-ink-tertiary mb-4">Core Principles</p>
                <h2 className="type-marketing-title text-ink-primary text-balance">
                  How we make design decisions.
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Reveal delay={0.05} y={28}>
                <Surface padding="lg" interactive className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-control bg-neutral-muted flex items-center justify-center text-ink-primary mb-6">
                      <Music2 className="w-5 h-5" />
                    </div>
                    <h3 className="type-subsection text-ink-primary font-medium">Choice over curriculum</h3>
                    <p className="mt-2 type-body-small text-ink-secondary">
                      You decide what to play. No mandated progression, no grading hurdles, no arbitrary prerequisites.
                    </p>
                  </div>
                  <p className="mt-6 type-eyebrow text-ink-tertiary">Autonomy</p>
                </Surface>
              </Reveal>

              <Reveal delay={0.1} y={28}>
                <Surface padding="lg" interactive className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-control bg-neutral-muted flex items-center justify-center text-ink-primary mb-6">
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="type-subsection text-ink-primary font-medium">Joy over obligation</h3>
                    <p className="mt-2 type-body-small text-ink-secondary">
                      Liking a piece is reason enough. You never have to justify playing a pop ballad or a favorite prelude.
                    </p>
                  </div>
                  <p className="mt-6 type-eyebrow text-ink-tertiary">Affection</p>
                </Surface>
              </Reveal>

              <Reveal delay={0.15} y={28}>
                <Surface padding="lg" interactive className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-control bg-neutral-muted flex items-center justify-center text-ink-primary mb-6">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h3 className="type-subsection text-ink-primary font-medium">Feedback without judgment</h3>
                    <p className="mt-2 type-body-small text-ink-secondary">
                      Acoustic cues help you listen and hear where you stopped, without humiliating red failure marks.
                    </p>
                  </div>
                  <p className="mt-6 type-eyebrow text-ink-tertiary">Listening</p>
                </Surface>
              </Reveal>

              <Reveal delay={0.2} y={28}>
                <Surface padding="lg" interactive className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-control bg-neutral-muted flex items-center justify-center text-ink-primary mb-6">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="type-subsection text-ink-primary font-medium">Progress without pressure</h3>
                    <p className="mt-2 type-body-small text-ink-secondary">
                      Progress is worth seeing, not worrying about. If you leave for two months, Yueora warmly welcomes you back.
                    </p>
                  </div>
                  <p className="mt-6 type-eyebrow text-ink-tertiary">Serenity</p>
                </Surface>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 4. Companion, Not Coach & Sanctuary Guarantees */}
        <section className="py-16 md:py-24 border-t border-line-subtle/80 bg-surface-panel/30">
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6">
              <Reveal>
                <p className="type-eyebrow text-ink-tertiary mb-4">Philosophy</p>
                <h2 className="type-marketing-title text-ink-primary">
                  A companion, not a coach.
                </h2>
                <div className="mt-6 space-y-4 type-marketing-body text-ink-secondary">
                  <p>
                    Yueora isn’t here to tell you whether you’ve practiced enough.
                  </p>
                  <p>
                    When you sit at your instrument, it helps you get back into the music.
                    When a bar feels difficult, it helps you isolate the phrase and loop it slowly.
                  </p>
                  <p>
                    If you haven’t played for a month, it doesn’t scold you with push notifications.
                    The sheet music will still be waiting right where you left it.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={0.1}>
                <Surface padding="lg" className="p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-ink-primary" />
                    <h3 className="type-section-title text-ink-primary">
                      Your repertoire is private.
                    </h3>
                  </div>
                  <div className="space-y-4 type-body text-ink-secondary">
                    <p>
                      Your scores, recordings, and rehearsal notes belong exclusively to you.
                      We do not sell your practice audio, train public AI models on your private playing,
                      or transform your musical library into an open social feed.
                    </p>
                    <p>
                      When you want to share a take with a friend, teacher, or family member,
                      you open the door with an intimate private link—on your terms.
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-line-subtle flex items-center justify-between type-metadata text-ink-tertiary">
                    <span>Encrypted Repertoire</span>
                    <span>Zero Public Discoverability</span>
                  </div>
                </Surface>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 5. Final Inverse Conversion Block — UGC Parity */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <Reveal y={36}>
              <div className="relative rounded-container bg-ink-primary text-surface-canvas p-10 md:p-16 lg:p-20 overflow-hidden">
                {/* Ambient watermark */}
                <div aria-hidden className="pointer-events-none absolute -bottom-10 -right-8 select-none">
                  {/* ds-allow: ambient oversized background typography */}
                  <span className="font-display italic text-[22vw] leading-none text-surface-canvas/[0.04]">
                    joy
                  </span>
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-8">
                    <p className="type-eyebrow text-surface-canvas/60 mb-5">
                      Start Your Sanctuary
                    </p>
                    <h2 className="type-marketing-title text-surface-canvas">
                      Play what you love.
                      <br />
                      <span className="italic font-normal text-surface-canvas/80">
                        Bring the music that matters.
                      </span>
                    </h2>
                    <p className="mt-6 max-w-xl type-marketing-body text-surface-canvas/75">
                      Begin with whatever is sitting on your piano right now. Free to start, private forever.
                    </p>
                  </div>

                  <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
                    <Button
                      asChild
                      intent="inverse"
                      size="xl"
                      className="w-full"
                    >
                      <Link to={ctaDestination}>
                        <span>Start playing free</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    {!isAuthenticated && (
                      <Button
                        asChild
                        intent="inverse-secondary"
                        size="xl"
                        className="w-full"
                      >
                        <Link to="/login">Sign into your repertoire</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </AppPage>
    </PublicShell>
  );
}
