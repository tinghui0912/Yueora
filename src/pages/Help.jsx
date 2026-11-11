import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, LifeBuoy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { helpArticles, helpCategories } from '@/lib/mockData';
import PublicShell from '@/components/public/PublicShell';
import AppPage from '@/components/patterns/AppPage';
import ContactSupportDialog from '@/components/help/ContactSupportDialog';

export default function Help() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('Getting started');
  const [supportOpen, setSupportOpen] = useState(false);

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
    <PublicShell>
      <AppPage size="form" className="pt-28 md:pt-32 pb-12">
        <h1 className="type-page-title text-ink-primary">Help center</h1>
        <p className="mt-1 type-body text-ink-secondary">Find guides, tips, and answers about Yueora.</p>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" className="pl-9" />
        </div>

        {!query && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {helpCategories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-control px-3 py-1.5 type-body-small transition-colors ${
                  active === c ? 'bg-neutral-muted font-semibold text-ink-primary' : 'text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-8">
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Search className="h-7 w-7 text-ink-tertiary" />
              <p className="type-body-small text-ink-secondary">No articles match “{query}”.</p>
            </div>
          ) : (
            helpCategories.filter((c) => grouped[c]).map((c) => (
              <section key={c}>
                <h2 className="mb-2 type-caption text-ink-tertiary">{c}</h2>
                <ul className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
                  {grouped[c].map((a) => (
                    <li key={a.slug}>
                      <Link to={`/help/${a.slug}`} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-hover transition-colors">
                        <span className="min-w-0 flex-1">
                          <span className="block type-body-small font-medium text-ink-primary">{a.title}</span>
                          <span className="mt-0.5 block type-body-small text-ink-secondary">{a.excerpt}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <div className="mt-10 rounded-container border border-line-subtle bg-surface-panel p-5">
          <h2 className="type-section-title font-medium text-ink-primary">Still need help?</h2>
          <p className="mt-0.5 type-body-small text-ink-secondary">Reach out and we’ll get back to you.</p>
          <Button className="mt-3" onClick={() => setSupportOpen(true)}><LifeBuoy className="mr-1.5" /> Contact support</Button>
        </div>
      </AppPage>

      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </PublicShell>
  );
}