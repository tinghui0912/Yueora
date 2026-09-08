import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowRight, Upload, Search, Play, TrendingUp } from 'lucide-react';
import ScorePreview from '@/components/library/ScorePreview';

const steps = [
  { icon: Upload, title: 'Bring in music', body: 'Upload scans or photos of any sheet music.' },
  { icon: Search, title: 'Review it', body: 'Confirm the recognized score looks right.' },
  { icon: Play, title: 'Practice', body: 'Play along and get calm, clear feedback.' },
  { icon: TrendingUp, title: 'Improve', body: 'See what to practice next, and your progress over time.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primary = isAuthenticated ? '/library' : '/register';

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl tracking-tight">NoteVerse</span>
        <nav className="flex items-center gap-2 text-sm">
          {isAuthenticated ? (
            <Link to="/library" className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Open library</Link>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">Log in</Link>
              <Link to="/register" className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Start free</Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.1] text-foreground">
              Your sheet music,<br />ready to practice.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Turn scans and photos into interactive scores you can organize, edit and practice.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to={primary} className="flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/library" className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent">
                See how it works
              </Link>
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
              <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">72% accuracy</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-medium">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.title} className="rounded-md border border-border p-5">
                <s.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-display text-lg font-medium">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight">
          A library that grows with you,<br />and practice that knows what's next.
        </h2>
        <Link to={primary} className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Start free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground md:flex-row">
          <span>© 2026 NoteVerse</span>
          <span>Personal sheet music library + intelligent practice</span>
        </div>
      </footer>
    </div>
  );
}