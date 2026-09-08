import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Upload, Users, Music2, LifeBuoy, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const articles = [
  { id: 'h1', category: 'Getting started', icon: BookOpen, title: 'Add your first score', body: 'Scan a page, drop a PDF, or import from MusicXML to build your library.' },
  { id: 'h2', category: 'Getting started', icon: BookOpen, title: 'Tour the practice hub', body: 'See what to practice next, your streak, and scores that need attention.' },
  { id: 'h3', category: 'Importing', icon: Upload, title: 'Supported file formats', body: 'PDF, PNG, JPG, and MusicXML. Multi-page PDFs are split automatically.' },
  { id: 'h4', category: 'Importing', icon: Upload, title: 'Fix recognition errors', body: 'When staff lines can\'t be detected, re-scan at higher contrast or rotate the page.' },
  { id: 'h5', category: 'Sharing', icon: Users, title: 'Invite a collaborator', body: 'Open a score, choose Share, and invite by email with View or Can edit access.' },
  { id: 'h6', category: 'Sharing', icon: Users, title: 'Link sharing vs. invitations', body: 'Link sharing lets anyone with the URL view; invitations grant named access and roles.' },
  { id: 'h7', category: 'Practicing', icon: Music2, title: 'Use the metronome', body: 'Set a default tempo in Preferences; toggle the click during any session.' },
  { id: 'h8', category: 'Practicing', icon: Music2, title: 'Track accuracy', body: 'NoteVerse marks measures that need work and surfaces them in the practice hub.' },
  { id: 'h9', category: 'Account', icon: LifeBuoy, title: 'Change your plan', body: 'Upgrade to Pro in Settings → Plan for unlimited scores and AI scan import.' },
  { id: 'h10', category: 'Account', icon: LifeBuoy, title: 'Export or delete your data', body: 'Settings → Privacy lets you export your library or permanently delete your account.' },
];

const categories = ['Getting started', 'Importing', 'Sharing', 'Practicing', 'Account'];

export default function Help() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('Getting started');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? articles : articles.filter((a) => a.category === active);
    if (!q) return pool;
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
  }, [query, active]);

  const grouped = useMemo(() => {
    const map = {};
    results.forEach((a) => {
      (map[a.category] = map[a.category] || []).push(a);
    });
    return map;
  }, [results]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <button onClick={() => navigate(-1)} className="text-sm hover:text-foreground">Back</button>
      </div>
      <h1 className="mt-3 font-display text-3xl font-medium">Help center</h1>
      <p className="mt-1 text-muted-foreground">Find guides, tips, and answers about NoteVerse.</p>

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="pl-9"
        />
      </div>

      {!query && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                active === c ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Search className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No articles match "{query}".</p>
          </div>
        ) : (
          categories
            .filter((c) => grouped[c])
            .map((c) => (
              <section key={c}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c}</h2>
                <ul className="divide-y divide-border rounded-md border border-border bg-card">
                  {grouped[c].map((a) => (
                    <li key={a.id}>
                      <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/40">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground">
                          <a.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{a.title}</span>
                          <span className="mt-0.5 block text-sm text-muted-foreground">{a.body}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
        )}
      </div>

      <div className="mt-8 rounded-md border border-border bg-accent/40 p-5">
        <h2 className="font-display text-lg font-medium">Still need help?</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Reach out and we'll get back to you.</p>
        <Button className="mt-3 bg-primary text-primary-foreground">Contact support</Button>
      </div>
    </div>
  );
}