import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ThumbsUp, ThumbsDown, LifeBuoy, Flag } from 'lucide-react';
import { getHelpArticle } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import PublicShell from '@/components/public/PublicShell';
import AppPage from '@/components/patterns/AppPage';
import ContactSupportDialog from '@/components/help/ContactSupportDialog';

export default function HelpArticle() {
  const { slug } = useParams();
  const article = getHelpArticle(slug);
  const [feedback, setFeedback] = useState(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportTopic, setSupportTopic] = useState('');

  const openContact = (topic = '') => {
    setSupportTopic(topic);
    setSupportOpen(true);
  };

  if (!article) {
    return (
      <PublicShell>
        <AppPage size="form" className="pt-28 md:pt-32 pb-16 text-center">
          <h1 className="type-section-title text-ink-primary">Article not found</h1>
          <Link to="/help" className="mt-4 inline-block type-body-small text-brand hover:underline">Back to help center</Link>
        </AppPage>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <AppPage size="form" className="pt-28 md:pt-32 pb-12">
        <nav className="flex items-center gap-1.5 type-body-small text-ink-tertiary">
          <Link to="/help" className="hover:text-ink-primary">Help</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink-secondary">{article.category}</span>
        </nav>

        <h1 className="mt-4 type-page-title text-ink-primary">{article.title}</h1>
        <p className="mt-2 type-metadata text-ink-tertiary">Updated {article.updated}</p>

        <div className="mt-8 space-y-4 type-body text-ink-secondary">
          {article.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {article.related.length > 0 && (
          <div className="mt-10 border-t border-line-subtle pt-6">
            <p className="type-caption text-ink-tertiary">Related articles</p>
            <ul className="mt-3 divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
              {article.related.map((r) => {
                const a = getHelpArticle(r);
                if (!a) return null;
                return (
                  <li key={r}>
                    <Link to={`/help/${r}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-hover transition-colors">
                      <span className="type-body-small font-medium text-ink-primary">{a.title}</span>
                      <ChevronRight className="h-4 w-4 text-ink-tertiary" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-8 rounded-container border border-line-subtle bg-surface-panel p-5">
          <p className="type-body-small font-medium text-ink-primary">Was this helpful?</p>
          <div className="mt-3 flex items-center gap-2">
            <Button intent={feedback === 'up' ? 'primary' : 'secondary'} size="sm" onClick={() => setFeedback('up')}><ThumbsUp className="mr-1.5" /> Yes</Button>
            <Button intent={feedback === 'down' ? 'primary' : 'secondary'} size="sm" onClick={() => setFeedback('down')}><ThumbsDown className="mr-1.5" /> No</Button>
            {feedback && <span className="type-body-small text-ink-tertiary">Thanks for the feedback.</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button intent="secondary" size="sm" onClick={() => openContact()}><LifeBuoy className="mr-1.5" /> Contact support</Button>
            <Button intent="quiet" size="sm" onClick={() => openContact(`Problem report: ${article.title}`)}><Flag className="mr-1.5" /> Report a problem</Button>
          </div>
        </div>
      </AppPage>

      <ContactSupportDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
        defaultTopic={supportTopic}
      />
    </PublicShell>
  );
}