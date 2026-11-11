import { useState, useEffect } from 'react';
import { Mail, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const SUPPORT_EMAIL = 'support@yueora.com';

/**
 * ContactSupportDialog — Deduplicated modal for product support and issue reporting.
 * Provides a truthful email delivery mechanism rather than simulating backend ticket ingestion.
 */
export default function ContactSupportDialog({
  open,
  onOpenChange,
  defaultTopic = '',
}) {
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setTopic(defaultTopic);
      setMessage('');
      setEmail('');
      setSent(false);
    }
  }, [open, defaultTopic]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const subject = encodeURIComponent(topic.trim() || 'Support request');
    const bodyText = encodeURIComponent(
      `From: ${email.trim() || 'Not specified'}\n\n${message.trim()}`
    );
    const mailtoUri = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${bodyText}`;

    try {
      window.location.href = mailtoUri;
    } catch {
      // browser fallback
    }

    setSent(true);
  };

  const handleClose = () => {
    onOpenChange?.(false);
    setSent(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact support</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-line-subtle bg-surface-canvas text-brand">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-3 type-body-small font-medium text-ink-primary">
              Ready to send email
            </p>
            <p className="mt-1 type-metadata text-ink-secondary leading-relaxed max-w-xs mx-auto">
              Your default email application has been launched to deliver this message directly to {SUPPORT_EMAIL}.
            </p>
            <div className="mt-4 rounded-control border border-line-subtle bg-neutral-muted/50 p-2.5 text-xs text-ink-secondary">
              <span>If your mail app didn't open, write to: </span>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-brand hover:underline inline-flex items-center gap-0.5 ml-1"
              >
                {SUPPORT_EMAIL}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="support-topic">Topic</Label>
              <Input
                id="support-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What’s this about?"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-msg">Message</Label>
              <Textarea
                id="support-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-email">Your email</Label>
              <Input
                id="support-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </form>
        )}

        <DialogFooter>
          {sent ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!topic.trim() || !message.trim() || !email.trim()}
              >
                Send
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
