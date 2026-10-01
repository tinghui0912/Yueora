import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import ExternalShell from '@/components/external/ExternalShell';
import { Music2, Heart, Eye, TrendingUp, Hand } from 'lucide-react';

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <ExternalShell>
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        {/* Hero */}
        <div className="text-center">
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-medium leading-tight">
            Music is meant to be enjoyed.
          </h1>
          <p className="mt-4 font-display text-2xl text-primary">乐，是为了悦。</p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            You don't have to play for an exam, a competition, or anyone else's expectations. Sometimes, loving a piece is reason enough to play it.
          </p>
        </div>

        {/* Why Yueora exists */}
        <section className="mt-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Most practice tools</p>
              <p className="mt-3 font-display text-xl font-medium leading-snug">Here's what you should practice.</p>
              <p className="mt-2 text-sm text-muted-foreground">They begin with a curriculum, a syllabus, a list of things you must do.</p>
            </div>
            <div className="rounded-md border-2 border-primary bg-accent/30 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Yueora</p>
              <p className="mt-3 font-display text-xl font-medium leading-snug">What do you feel like playing?</p>
              <p className="mt-2 text-sm text-muted-foreground">We begin with what you want to play. Everything else follows from that.</p>
            </div>
          </div>
        </section>

        {/* Play what you love — editorial */}
        <section className="mt-20 space-y-6">
          <h2 className="font-display text-2xl font-medium">Play what you love.</h2>
          <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>Maybe you heard a piece in a film.</p>
            <p>Maybe someone sent you a score.</p>
            <p>Maybe it's something you played years ago.</p>
            <p className="text-foreground">If it makes you want to sit down and play, that's enough.</p>
          </div>
        </section>

        {/* Why "Yueora" */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-medium">Why "Yueora"</h2>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>Yueora is a name we created around a simple idea.</p>
            <p>In Chinese, <span className="text-foreground font-medium">乐 (yuè)</span> means music, while <span className="text-foreground font-medium">悦 (yuè)</span> carries the idea of joy.</p>
            <p>Different characters. The same sound.</p>
            <p className="text-foreground">To us, they belong together.</p>
            <p className="font-display text-2xl text-primary">Music should lead back to joy.</p>
            <p className="font-display text-3xl">乐，是为了悦。</p>
          </div>
        </section>

        {/* Four Principles */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-medium">Four principles</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Principle icon={Music2} title="Choice over curriculum" body="You decide what to play." />
            <Principle icon={Heart} title="Joy over obligation" body="Liking a piece is reason enough." />
            <Principle icon={Eye} title="Feedback without judgment" body="Information should help you listen, not tell you your worth." />
            <Principle icon={TrendingUp} title="Progress without pressure" body="Progress is worth seeing, not worrying about." />
          </div>
        </section>

        {/* Companion, not coach */}
        <section className="mt-20">
          <div className="flex items-center gap-2">
            <Hand className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-medium">A companion, not a coach.</h2>
          </div>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>Yueora isn't here to tell you whether you've practiced enough.</p>
            <p>When you want to play, it helps you get back into the music.</p>
            <p>When something feels difficult, it helps you notice where.</p>
            <p>If you haven't played for a month, it doesn't scold you.</p>
            <p className="text-foreground">The music will still be here.</p>
          </div>
        </section>

        {/* Trust — light */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-medium">Your library is yours.</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Yueora is built around your music, not around turning your library into a public catalog. Specific privacy details are on our Privacy page.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mt-20 rounded-md border border-border bg-card p-8 text-center md:p-12">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-medium">Play what you love.</h2>
          <p className="mt-3 text-lg text-muted-foreground">Bring in something you've been wanting to play.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <Link to="/library" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Start playing</Link>
            ) : (
              <>
                <Link to="/register" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Start playing</Link>
                <Link to="/login" className="rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-accent">Log in</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </ExternalShell>
  );
}

function Principle({ icon: Icon, title, body }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-3 font-display text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}