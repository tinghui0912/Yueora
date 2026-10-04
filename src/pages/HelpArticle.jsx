import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ThumbsUp, ThumbsDown, LifeBuoy, Flag } from 'lucide-react';
import { getHelpArticle, helpArticles } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function HelpArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = getHelpArticle(slug);
  const [feedback, setFeedback] = useState(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [sent, setSent] = useState(false);

  if (!article) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl">Article not found</h1>
        <Link to="/help" className="mt-4 inline-block text-primary underline">Back to help center</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/help" className="hover:text-foreground">Help</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{article.category}</span>
      </nav>

      <h1 className="mt-4 font-display text-3xl font-medium">{article.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Updated {article.updated}</p>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground">
        {article.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* Related */}
      {article.related.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="type-caption text-ink-tertiary">Related articles</p>
          <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
            {article.related.map((r) => {
              const a = getHelpArticle(r);
              if (!a) return null;
              return (
                <li key={r}>
                  <Link to={`/help/${r}`} className="flex items-center justify-between px-4 py-3 hover:bg-accent/40">
                    <span className="text-sm font-medium">{a.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Feedback */}
      <div className="mt-8 rounded-md border border-border bg-card p-5">
        <p className="text-sm font-medium">Was this helpful?</p>
        <div className="mt-3 flex items-center gap-2">
          <Button variant={feedback === 'up' ? 'default' : 'outline'} size="sm" onClick={() => setFeedback('up')}><ThumbsUp className="mr-1.5 h-4 w-4" /> Yes</Button>
          <Button variant={feedback === 'down' ? 'default' : 'outline'} size="sm" onClick={() => setFeedback('down')}><ThumbsDown className="mr-1.5 h-4 w-4" /> No</Button>
          {feedback && <span className="text-sm text-muted-foreground">Thanks for the feedback.</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSupportOpen(true)}><LifeBuoy className="mr-1.5 h-4 w-4" /> Contact support</Button>
          <Button variant="ghost" size="sm" onClick={() => setSupportOpen(true)}><Flag className="mr-1.5 h-4 w-4" /> Report a problem</Button>
        </div>
      </div>

      {/* Support dialog */}
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
              <div className="space-y-1.5"><Label htmlFor="msg">Message</Label><Textarea id="msg" placeholder="How can we help?" rows={4} /></div>
              <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" /></div>
            </div>
          )}
          <DialogFooter>
            {sent ? (
              <Button onClick={() => { setSupportOpen(false); setSent(false); }}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSupportOpen(false)}>Cancel</Button>
                <Button onClick={() => setSent(true)}>Send</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}