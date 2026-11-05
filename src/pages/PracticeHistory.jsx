import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music2, Pencil, Share2, Users } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { dayLabel, minutesLabel, modeLabel, visibilityLabel } from '@/lib/practiceUtils';
import PageHeader from '@/components/patterns/PageHeader';
import StateMessage from '@/components/patterns/StateMessage';
import ShareResourceDialog from '@/components/sharing/ShareResourceDialog';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const TABS = [
  { value: 'mine', label: 'My activity' },
  { value: 'shared', label: 'Shared with me' },
];

/**
 * Lightweight practice activity history: what you played, when, for how long.
 * Not a record of how well — reports are temporary and never stored here.
 */
export default function PracticeHistory() {
  const activities = usePrototypeStore((s) => s.practiceActivities);
  const members = usePrototypeStore((s) => s.teamMembers) || [];
  const updateSharing = usePrototypeStore((s) => s.updateActivitySharing);

  const [tab, setTab] = useState('mine');
  const [sharing, setSharing] = useState(null);
  const [detail, setDetail] = useState(null);

  const mine = activities.filter((a) => a.ownerId === 'you');
  const sharedWithMe = activities.filter((a) => a.ownerId !== 'you' && (a.sharedWith || []).includes('you'));
  const visible = tab === 'mine' ? mine : sharedWithMe;

  const groups = {};
  visible.forEach((a) => {
    const label = dayLabel(a.completedAt);
    (groups[label] = groups[label] || []).push(a);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <Link to="/practice" className="type-body-small text-ink-secondary hover:text-ink-primary">← Practice</Link>
      <div className="mt-3">
        <PageHeader
          title="Practice history"
          description="The practice you've done, kept as a simple record."
        />
      </div>

      <div role="tablist" aria-label="Practice activity" className="mt-5 inline-flex rounded-control border border-line-subtle p-0.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`rounded px-3 py-1.5 text-sm ${tab === t.value ? 'bg-accent font-medium text-accent-foreground' : 'text-ink-secondary hover:text-ink-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-8">
          <StateMessage
            tone="neutral"
            icon={Music2}
            title={tab === 'mine' ? 'No practice yet' : 'Nothing shared with you yet'}
            description={
              tab === 'mine'
                ? 'When you practice, the activity shows up here — just the piece, the date and how long.'
                : 'When someone shares a practice activity with you, it appears here.'
            }
            primaryAction={
              tab === 'mine'
                ? <Button asChild><Link to="/practice">Choose something to play</Link></Button>
                : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(groups).map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-2 type-caption text-ink-tertiary">{date}</h2>
              <div className="divide-y divide-line-subtle border-y border-line-subtle">
                {items.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => setDetail(a)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-medium text-ink-primary">{a.scoreTitleSnapshot}</p>
                      <p className="mt-0.5 type-body-small text-ink-secondary">
                        {minutesLabel(a.durationSeconds)} · {modeLabel(a.mode)}{a.tempoBpm ? ` · ${a.tempoBpm} BPM` : ''}
                      </p>
                      <p className="mt-1 flex items-center gap-1 type-metadata text-ink-tertiary">
                        {a.visibility === 'shared' && <Users className="h-3 w-3" aria-hidden="true" />}
                        {a.ownerId !== 'you' ? `Shared by ${(members.find((m) => m.id === a.ownerId) || {}).name || 'a member'}` : visibilityLabel(a)}
                      </p>
                    </button>
                    {a.ownerId === 'you' && (
                      <Button variant="ghost" size="sm" onClick={() => setSharing(a)}>
                        <Share2 className="mr-1 h-3.5 w-3.5" /> Share
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 type-metadata text-ink-tertiary">
        Practice reports are temporary and are never stored in history.
      </p>

      <ShareResourceDialog
        open={!!sharing}
        onOpenChange={(open) => !open && setSharing(null)}
        kind="activity"
        title={sharing?.scoreTitleSnapshot || ''}
        members={members}
        value={sharing}
        onSave={(next) => {
          updateSharing(sharing.id, next);
          setSharing(null);
        }}
      />

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{detail?.scoreTitleSnapshot}</DialogTitle>
          </DialogHeader>
          {detail && (
            <dl className="space-y-2 type-body-small">
              <div className="flex justify-between"><dt className="text-ink-secondary">Date</dt><dd className="text-ink-primary">{dayLabel(detail.completedAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-secondary">Duration</dt><dd className="text-ink-primary">{minutesLabel(detail.durationSeconds)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-secondary">Mode</dt><dd className="text-ink-primary">{modeLabel(detail.mode)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-secondary">Section</dt><dd className="text-ink-primary">{detail.rangeSummary}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-secondary">Visibility</dt><dd className="text-ink-primary">{visibilityLabel(detail)}</dd></div>
            </dl>
          )}
          <p className="type-metadata text-ink-tertiary">
            This is a record of practice, not a report. Reports are temporary.
          </p>
          <DialogFooter>
            {detail?.ownerId === 'you' && (
              <Button variant="outline" onClick={() => { setSharing(detail); setDetail(null); }}>
                <Pencil className="mr-1.5 h-4 w-4" /> Manage sharing
              </Button>
            )}
            <Button onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}