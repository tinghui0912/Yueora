import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { dayLabel, minutesLabel, modeLabel } from '@/lib/practiceUtils';
import AppPage from '@/components/patterns/AppPage';
import PageHeader from '@/components/patterns/PageHeader';
import EmptyState from '@/components/patterns/EmptyState';
import PracticeHistoryRow from '@/components/practice/PracticeHistoryRow';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/**
 * Lightweight practice activity history: what you played, when, for how long.
 * Practice history is private — it is never shared and never shows a report.
 */
export default function PracticeHistory() {
  const activities = usePrototypeStore((s) => s.practiceActivities) || [];
  const [detail, setDetail] = useState(null);

  const mine = activities.filter((a) => a.ownerId === 'you');

  const groups = {};
  mine.forEach((a) => {
    const label = dayLabel(a.completedAt);
    (groups[label] = groups[label] || []).push(a);
  });

  return (
    <AppPage size="standard">
      <Link to="/practice" className="type-body-small text-ink-secondary hover:text-ink-primary">← Practice</Link>
      <div className="mt-3">
        <PageHeader
          title="Practice history"
          description="The practice you've done, kept as a simple record."
        />
      </div>

      {mine.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Music2}
            title="No practice yet"
            description="When you practice, the activity shows up here — just the piece, the date and how long. This record stays private to you."
            action={<Button asChild intent="primary" size="md"><Link to="/practice">Choose something to play</Link></Button>}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(groups).map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-2 type-caption text-ink-tertiary">{date}</h2>
              <div className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel overflow-hidden">
                {items.map((a) => (
                  <PracticeHistoryRow
                    key={a.id}
                    item={a}
                    onSelect={setDetail}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 type-metadata text-ink-tertiary">
        Practice history is private. Reports are temporary and are never stored here.
      </p>

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
            </dl>
          )}
          <p className="type-metadata text-ink-tertiary">
            This is a record of practice, not a report. Reports are temporary.
          </p>
          <DialogFooter>
            <Button onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}