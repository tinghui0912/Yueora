import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import PublicShell from '@/components/public/PublicShell';
import AppPage from '@/components/patterns/AppPage';
import { Button } from '@/components/ui/button';
import { Music2, Heart, Eye, TrendingUp, Hand } from 'lucide-react';

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <PublicShell>
      <AppPage size="form" className="py-12 md:py-20">
        {/* Hero */}
        <div className="text-center">
          <h1 className="type-hero-title text-ink-primary">
            Music is meant to be enjoyed.
          </h1>
          <p className="mt-4 font-display text-2xl text-brand">乐，是为了悦。</p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            You don't have to play for an exam, a competition, or anyone else's expectations. Sometimes, loving a piece is reason enough to play it.
          </p>
        </div>

        {/* Why Yueora exists */}
        <section className="mt-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-container border border-line-subtle bg-surface-panel p-6">
              <p className="type-caption font-semibold uppercase tracking-wider text-ink-tertiary">Most practice tools</p>
              <p className="mt-3 font-display text-xl font-medium leading-snug text-ink-primary">Here's what you should practice.</p>
              <p className="mt-2 type-body-small text-ink-secondary">They begin with a curriculum, a syllabus, a list of things you must do.</p>
            </div>
            <div className="rounded-container border border-line-subtle bg-surface-panel p-6">
              <p className="type-caption font-semibold uppercase tracking-wider text-brand">Yueora</p>
              <p className="mt-3 font-display text-xl font-medium leading-snug text-ink-primary">What do you feel like playing?</p>
              <p className="mt-2 type-body-small text-ink-secondary">We begin with what you want to play. Everything else follows from that.</p>
            </div>
          </div>
        </section>

        {/* Play what you love — editorial */}
        <section className="mt-20 space-y-6">
          <h2 className="font-display text-2xl font-medium text-ink-primary">Play what you love.</h2>
          <div className="space-y-4 text-lg leading-relaxed text-ink-secondary">
            <p>Maybe you heard a piece in a film.</p>
            <p>Maybe someone sent you a score.</p>
            <p>Maybe it's something you played years ago.</p>
            <p className="text-ink-primary font-medium">If it makes you want to sit down and play, that's enough.</p>
          </div>
        </section>

        {/* Why "Yueora" */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-medium text-ink-primary">Why "Yueora"</h2>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink-secondary">
            <p>Yueora is a name we created around a simple idea.</p>
            <p>In Chinese, <span className="text-ink-primary font-medium">乐 (yuè)</span> means music, while <span className="text-ink-primary font-medium">悦 (yuè)</span> carries the idea of joy.</p>
            <p>Different characters. The same sound.</p>
            <p className="text-ink-primary font-medium">To us, they belong together.</p>
            <p className="font-display text-2xl text-brand">Music should lead back to joy.</p>
            <p className="font-display text-3xl text-ink-primary">乐，是为了悦。</p>
          </div>
        </section>

        {/* Four Principles */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-medium text-ink-primary">Four principles</h2>
          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <Principle icon={Music2} title="Choice over curriculum" body="You decide what to play." />
            <Principle icon={Heart} title="Joy over obligation" body="Liking a piece is reason enough." />
            <Principle icon={Eye} title="Feedback without judgment" body="Information should help you listen, not tell you your worth." />
            <Principle icon={TrendingUp} title="Progress without pressure" body="Progress is worth seeing, not worrying about." />
          </div>
        </section>

        {/* Companion, not coach */}
        <section className="mt-20">
          <div className="flex items-center gap-2">
            <Hand className="icon-sm text-brand" />
            <h2 className="font-display text-2xl font-medium text-ink-primary">A companion, not a coach.</h2>
          </div>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink-secondary">
            <p>Yueora isn't here to tell you whether you've practiced enough.</p>
            <p>When you want to play, it helps you get back into the music.</p>
            <p>When something feels difficult, it helps you notice where.</p>
            <p>If you haven't played for a month, it doesn't scold you.</p>
            <p className="text-ink-primary font-medium">The music will still be here.</p>
          </div>
        </section>

        {/* Trust — light */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-medium text-ink-primary">Your library is yours.</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-secondary">
            Yueora is built around your music, not around turning your library into a public catalog. Specific privacy details are on our Privacy page.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mt-20 rounded-container border border-line-subtle bg-surface-panel p-8 text-center md:p-12">
          <h2 className="type-marketing-title text-ink-primary">Play what you love.</h2>
          <p className="mt-3 text-lg text-ink-secondary">Bring in something you've been wanting to play.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <Button asChild intent="primary" size="lg">
                <Link to="/library">Start playing</Link>
              </Button>
            ) : (
              <>
                <Button asChild intent="primary" size="lg">
                  <Link to="/register">Start playing</Link>
                </Button>
                <Button asChild intent="secondary" size="lg">
                  <Link to="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </section>
      </AppPage>
    </PublicShell>
  );
}

function Principle({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-4">
      <Icon className="h-5 w-5 shrink-0 text-brand mt-0.5" />
      <div>
        <h3 className="type-subsection text-ink-primary">{title}</h3>
        <p className="mt-1 type-body-small text-ink-secondary">{body}</p>
      </div>
    </div>
  );
}