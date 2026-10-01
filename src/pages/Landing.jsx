import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowRight, Upload, ScanSearch, Music2, Library as LibraryIcon, Play, Share2, BarChart3, Check } from 'lucide-react';
import ScorePreview from '@/components/library/ScorePreview';

const flow = [
  { icon: Upload, title: 'Bring in music', body: 'Upload a PDF, photos, or MusicXML — the music you actually want to play.' },
  { icon: ScanSearch, title: 'Recognize it', body: 'Yueora turns the pages into an interactive score, ready to review.' },
  { icon: Music2, title: 'Make it yours', body: 'Correct anything that’s off, then keep it in your personal library.' },
  { icon: Play, title: 'Play when you feel like it', body: 'Pick up where you left off, with calm feedback and no pressure.' },
];

const libraryViews = ['All music', 'Mine', 'Shared with me', 'Saved', 'Favorites', 'Folders'];
const practiceLines = ['Continue playing', 'Revisit a section', 'Practice at your pace'];
const progressLines = ['History', 'Tempo trend', 'Sections becoming easier', 'Recent progress'];
const shareLines = ['People — Can view or Can edit', 'General access — link on or off', 'Download & practice permissions'];
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
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl tracking-tight">Yueora</span>
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/about" className="hidden rounded-md px-3 py-2 text-muted-foreground hover:text-foreground sm:inline">About</Link>
          <Link to="/pricing" className="hidden rounded-md px-3 py-2 text-muted-foreground hover:text-foreground sm:inline">Pricing</Link>
          {isAuthenticated ? (
            <Link to="/library" className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Open library</Link>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">Log in</Link>
              <Link to="/register" className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Start playing</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.6rem)] font-medium leading-[1.05] text-foreground">
              Play what<br />you love.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Bring the sheet music you actually want to play. Keep it in your library, turn it interactive, and come back whenever you feel like playing.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to={primary} className="flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Start playing <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent">
                See how Yueora works
              </a>
            </div>
          </div>
          <div className="relative rounded-md border border-border bg-card p-5 shadow-sm">
            <div className="aspect-[16/10]">
              <ScorePreview id="moonlight" className="h-full w-full" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-medium">Moonlight Sonata</p>
                <p className="text-sm text-muted-foreground">Beethoven</p>
              </div>
              <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">Interactive score</span>
            </div>
          </div>
        </div>
      </section>

      {/* Your music, not ours */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-tight">Your music, not ours.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Yueora doesn’t hand you a curriculum or tell you what to practice. You bring the pieces you love — and decide what to play next.
          </p>
        </div>
      </section>

      {/* From paper to playable */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium">From paper to playable</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((s) => (
            <div key={s.title} className="rounded-md border border-border p-5">
              <s.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-lg font-medium">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personal library */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-2xl font-medium">Your personal music library</h2>
              <p className="mt-3 text-muted-foreground">Keep everything in one place, organized the way you think about it.</p>
              <ul className="mt-5 space-y-2">
                {libraryViews.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm">
                    <LibraryIcon className="h-4 w-4 text-primary" /> {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-border bg-background p-5">
              <div className="grid grid-cols-2 gap-3">
                {['Moonlight Sonata', 'Clair de Lune', 'Interstellar', 'Prelude in C'].map((t, i) => (
                  <div key={t} className="rounded-md border border-border bg-card p-3">
                    <div className="aspect-[16/10]"><ScorePreview id={t} className="h-full w-full" /></div>
                    <p className="mt-2 text-sm font-medium">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice without pressure */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium">Practice without pressure</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {practiceLines.map((p) => (
            <div key={p} className="rounded-md border border-border bg-card p-5 text-sm font-medium">{p}</div>
          ))}
        </div>
      </section>

      {/* Progress without judgment */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-medium">See progress without being judged</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {progressLines.map((p) => (
              <div key={p} className="flex items-center gap-2 rounded-md border border-border bg-background p-4 text-sm">
                <BarChart3 className="h-4 w-4 text-primary" /> {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sharing */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-2xl font-medium">Share music with people you trust</h2>
            <ul className="mt-5 space-y-2">
              {shareLines.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="h-4 w-4 text-primary" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">People with access</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>You</span><span className="text-muted-foreground">Owner</span></div>
              <div className="flex items-center justify-between"><span>Alice</span><span className="text-muted-foreground">Can edit</span></div>
              <div className="flex items-center justify-between"><span>charlie@example.com</span><span className="text-muted-foreground">Invitation pending</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-medium">Simple pricing</h2>
          <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-5">
              <p className="font-display text-lg font-medium">Free</p>
              <p className="mt-1 text-sm text-muted-foreground">A small library to get started.</p>
              <p className="mt-3 font-display text-2xl">$0</p>
            </div>
            <div className="rounded-md border-2 border-primary bg-background p-5">
              <p className="font-display text-lg font-medium">Pro</p>
              <p className="mt-1 text-sm text-muted-foreground">Unlimited scores, analytics & export.</p>
              <p className="mt-3 font-display text-2xl">$6<span className="text-base text-muted-foreground">/mo</span></p>
            </div>
          </div>
          <Link to="/pricing" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Compare plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium">Frequently asked</h2>
        <div className="mt-6 divide-y divide-border rounded-md border border-border bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                {f.q}
                <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight">Play what you love.</h2>
          <p className="mt-3 text-muted-foreground">喜欢，就弹。</p>
          <Link to={primary} className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Start playing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground md:flex-row">
          <span>© 2026 Yueora</span>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/help" className="hover:text-foreground">Help</Link>
            <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/legal/acceptable-use" className="hover:text-foreground">Acceptable use</Link>
            <Link to="/legal/copyright" className="hover:text-foreground">Copyright</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}