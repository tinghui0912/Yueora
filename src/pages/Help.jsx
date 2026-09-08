import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, LifeBuoy, ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { helpArticles, helpCategories } from '@/lib/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function Help() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('Getting started');
  const [supportOpen, setSupportOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return helpArticles.filter((a) => a.category === active);
    return helpArticles.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }, [query, active]);

  const grouped = useMemo(() => {
    const map = {};
    results.forEach((a) => { (map[a.category] = map[a.category] || []).push(a); });
    return map;
  }, [results]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <Link to="/library" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
      <h1 className="mt-3 font-display text-3xl font-medium">Help center</h1>
      <p className="mt-1 text-muted-foreground">Find guides, tips, and answers about Yueora.</p>

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" className="pl-9" />
      </div>

      {!query && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {helpCategories.map((c) => (
            <button key={c} onClick={() => setActive(c)} className={`rounded-md px-3 py-1.5 text-sm ${active === c ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}>{c}</button>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Search className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No articles match “{query}”.</p>
          </div>
        ) : (
          helpCategories.filter((c) => grouped[c]).map((c) => (
            <section key={c}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c}</h2>
              <ul className="divide-y divide-border rounded-md border border-border bg-card">
                {grouped[c].map((a) => (
                  <li key={a.slug}>
                    <Link to={`/help/${a.slug}`} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/40">
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{a.title}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{a.excerpt}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <div className="mt-8 rounded-md border border-border bg-accent/40 p-5">
        <h2 className="font-display text-lg font-medium">Still need help?</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Reach out and we’ll get back to you.</p>
        <Button className="mt-3 bg-primary text-primary-foreground" onClick={() => { setSupportOpen(true); setSent(false); }}><LifeBuoy className="mr-1.5 h-4 w-4" /> Contact support</Button>
      </div>

      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Contact support</DialogTitle></DialogHeader>
          {sent ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><ThumbsUp className="h-5 w-5" /></div>
              <p className="mt-3 font-medium">Message sent</p>
              <p className="mt-1 text-sm text-muted-foreground">We’ll get back to you soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label htmlFor="topic">Topic</Label><Input id="topic" placeholder="What’s this about?" /></div>
              <div className="space-y-1.5"><Label htmlFor="msg">Message</Label><Textarea id="msg" rows={4} placeholder="How can we help?" /></div>
              <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" /></div>
            </div>
          )}
          <DialogFooter>
            {sent ? <Button onClick={() => setSupportOpen(false)}>Done</Button> : (<>
              <Button variant="outline" onClick={() => setSupportOpen(false)}>Cancel</Button>
              <Button onClick={() => setSent(true)}>Send</Button>
            </>)}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}