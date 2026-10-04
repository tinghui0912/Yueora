import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowRight, Upload, ScanSearch, Music2, Play, Library as LibraryIcon, Share2 } from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import ScorePreview from '@/components/library/ScorePreview';
import HeroProductVisual from '@/components/visuals/HeroProductVisual';
import PracticeWorkspaceVisual from '@/components/visuals/PracticeWorkspaceVisual';
import ProgressVisual from '@/components/visuals/ProgressVisual';
import SharingVisual from '@/components/visuals/SharingVisual';
import MockScanPage from '@/components/visuals/MockScanPage';

const flow = [
  { icon: Upload, title: 'Bring in music', body: 'Upload a PDF, photos, or MusicXML — the music you actually want to play.', visual: 'scan' },
  { icon: ScanSearch, title: 'Recognize it', body: 'Yueora turns the pages into an interactive score, ready to review.', visual: 'highlight' },
  { icon: Music2, title: 'Make it yours', body: 'Correct anything that’s off, then keep it in your personal library.', visual: 'score' },
  { icon: Play, title: 'Play when you feel like it', body: 'Pick up where you left off, with calm feedback and no pressure.', visual: 'practice' },
];

const libraryViews = ['All music', 'Mine', 'Shared with me', 'Saved', 'Favorites', 'Folders'];
const faqs = [
  { q: 'Do I have to practice every day?', a: 'No. Yueora has no streaks, no assignments, and no overdue items. You come back when you feel like playing.' },
  { q: 'Where does my music come from?', a: 'You bring it — scans, photos, or MusicXML. Yueora doesn’t hand you a curriculum; it helps you play what you love.' },
  { q: 'Does Yueora grade my playing?', a: 'No. You get information — pitch, timing, tempo, and which sections felt tricky — but never a score, grade, or judgment.' },
  { q: 'Can I share scores with others?', a: 'Yes. Invite people by email with view or edit access, or turn on a link with the permissions you choose.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primary = isAuthenticated ? '/library' : '/register';

  return (
    <PublicShell>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-20 md:px-8 md:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.6rem)] font-medium leading-[1.05] text-ink-primary">
              Play what<br />you love.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-secondary">
              Bring the sheet music you actually want to play. Keep it in your library, turn it interactive, and come back whenever you feel like playing.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to={primary} className="flex items-center gap-2 rounded-control bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Start playing <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="rounded-control border border-line-subtle px-5 py-3 text-sm font-semibold text-ink-primary hover:bg-accent">
                See how Yueora works
              </a>
            </div>
          </div>
          <HeroProductVisual />
        </div>
      </section>

      {/* Your music, not ours */}
      <section className="border-y border-line-subtle bg-surface-panel">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-tight text-ink-primary">Your music, not ours.</h2>
          <p className="mt-3 max-w-2xl text-ink-secondary">
            Yueora doesn’t hand you a curriculum or tell you what to practice. You bring the pieces you love — and decide what to play next.
          </p>
        </div>
      </section>

      {/* From paper to playable */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <h2 className="font-display text-2xl font-medium text-ink-primary">From paper to playable</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((s) => (
            <div key={s.title} className="rounded-container border border-line-subtle bg-surface-panel p-5">
              {s.visual === 'scan' && (
                <div className="mb-3 overflow-hidden rounded border border-line-subtle">
                  <MockScanPage seed="flow-scan" className="aspect-[3/4] w-full" />
                </div>
              )}
              {s.visual === 'highlight' && (
                <div className="mb-3 overflow-hidden rounded border border-line-subtle">
                  <MockScanPage seed="flow-highlight" className="aspect-[3/4] w-full" showHighlight highlightMeasure={2} />
                </div>
              )}
              {s.visual === 'score' && (
                <div className="mb-3 aspect-[16/10] overflow-hidden rounded border border-line-subtle bg-white">
                  <ScorePreview id="flow-score" className="h-full w-full" />
                </div>
              )}
              {s.visual === 'practice' && (
                <div className="mb-3 aspect-[16/10] overflow-hidden rounded border border-line-subtle bg-white">
                  <ScorePreview id="flow-practice" className="h-full w-full" />
                </div>
              )}
              <s.icon className="h-5 w-5 text-brand" />
              <h3 className="mt-2 font-display text-lg font-medium text-ink-primary">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personal library */}
      <section className="border-t border-line-subtle bg-surface-panel">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-2xl font-medium text-ink-primary">Your personal music library</h2>
              <p className="mt-3 text-ink-secondary">Keep everything in one place, organized the way you think about it.</p>
              <ul className="mt-5 space-y-2">
                {libraryViews.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm text-ink-secondary">
                    <LibraryIcon className="h-4 w-4 text-brand" /> {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-container border border-line-subtle bg-surface-canvas p-5">
              <div className="grid grid-cols-2 gap-3">
                {['Moonlight Sonata', 'Clair de Lune', 'Interstellar', 'Prelude in C'].map((t) => (
                  <div key={t} className="rounded-container border border-line-subtle bg-surface-panel p-3">
                    <div className="aspect-[16/10]"><ScorePreview id={t} className="h-full w-full" /></div>
                    <p className="mt-2 text-sm font-medium text-ink-primary">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice without pressure */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink-primary">Practice without pressure</h2>
            <p className="mt-3 text-ink-secondary">Pick up where you left off. Yueora gives you calm feedback — pitch, timing, tempo — and never grades or judges your playing.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-secondary">
              <li>• Continue playing from where you stopped</li>
              <li>• Revisit a section that felt tricky</li>
              <li>• Practice at your own pace, with no streaks</li>
            </ul>
          </div>
          <PracticeWorkspaceVisual />
        </div>
      </section>

      {/* Progress without judgment */}
      <section className="border-t border-line-subtle bg-surface-panel">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <ProgressVisual />
            <div>
              <h2 className="font-display text-2xl font-medium text-ink-primary">See progress without being judged</h2>
              <p className="mt-3 text-ink-secondary">Track tempo trends, recent sessions, and which sections are becoming easier — without scores, grades, or pressure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sharing */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink-primary">Share music with people you trust</h2>
            <p className="mt-3 text-ink-secondary">Invite people by email with view or edit access, or turn on a link with the permissions you choose.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-secondary">
              <li className="flex items-center gap-2"><Share2 className="h-4 w-4 text-brand" /> People — Can view or Can edit</li>
              <li className="flex items-center gap-2"><Share2 className="h-4 w-4 text-brand" /> General access — link on or off</li>
              <li className="flex items-center gap-2"><Share2 className="h-4 w-4 text-brand" /> Download &amp; practice permissions</li>
            </ul>
          </div>
          <SharingVisual />
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-t border-line-subtle bg-surface-panel">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <h2 className="font-display text-2xl font-medium text-ink-primary">Simple pricing</h2>
          <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-container border border-line-subtle bg-surface-canvas p-5">
              <p className="font-display text-lg font-medium text-ink-primary">Free</p>
              <p className="mt-1 text-sm text-ink-secondary">A small library to get started.</p>
              <p className="mt-3 font-display text-2xl text-ink-primary">$0</p>
            </div>
            <div className="rounded-container border-2 border-primary bg-surface-canvas p-5">
              <p className="font-display text-lg font-medium text-ink-primary">Pro</p>
              <p className="mt-1 text-sm text-ink-secondary">Unlimited scores, analytics &amp; export.</p>
              <p className="mt-3 font-display text-2xl text-ink-primary">$6<span className="text-base text-ink-tertiary">/mo</span></p>
            </div>
          </div>
          <Link to="/pricing" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Compare plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8">
        <h2 className="font-display text-2xl font-medium text-ink-primary">Frequently asked</h2>
        <div className="mt-6 divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
          {faqs.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink-primary">
                {f.q}
                <span className="text-ink-tertiary group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-2 text-sm text-ink-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line-subtle bg-surface-panel">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight text-ink-primary">Play what you love.</h2>
          <p className="mt-3 text-ink-secondary">喜欢，就弹。</p>
          <Link to={primary} className="mt-8 inline-flex items-center gap-2 rounded-control bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Start playing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}