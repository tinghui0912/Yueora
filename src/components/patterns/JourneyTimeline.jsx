import { Link } from 'react-router-dom';
import { ScoreSheetGlyph, PracticeGlyph, MemoryGlyph } from '@/components/brand/MusicalGlyphs';
import { Share2, CheckCircle2 } from 'lucide-react';

/**
 * JourneyTimeline: Visualizes "a piece of music has a life in Yueora".
 * Shows the organic musical lifecycle rather than a disconnected file metadata table.
 */
export default function JourneyTimeline({
  score,
  sessions = [],
  performances = [],
  className = '',
}) {
  if (!score) return null;

  const totalPracticeMinutes = sessions.reduce((acc, s) => acc + Math.round((s.durationSeconds || 0) / 60), 0);
  const hasPracticed = sessions.length > 0;
  const hasPerformances = performances.length > 0;
  const isShared = score.ownership === 'shared' || (score.shareLinks && score.shareLinks.length > 0);

  const steps = [
    {
      id: 'arrival',
      title: 'Arrived in Yueora',
      detail: `${score.source || 'MusicXML'} · ${score.created || 'Recently'}`,
      active: true,
      icon: ScoreSheetGlyph,
    },
    {
      id: 'repertoire',
      title: 'In your Repertoire',
      detail: `${score.pages || 1} pages · Key of ${score.key || 'C'} · ♩ = ${score.tempo || 80}`,
      active: true,
      icon: CheckCircle2,
    },
    {
      id: 'practice',
      title: hasPracticed ? 'Accumulating Journey' : 'Awaiting First Practice',
      detail: hasPracticed
        ? `${sessions.length} sessions · ${totalPracticeMinutes}m spent playing`
        : 'Open the score to play when you are ready',
      active: hasPracticed,
      icon: PracticeGlyph,
      action: !hasPracticed && (
        <Link
          to={`/score/${score.id}/setup`}
          className="mt-1.5 inline-flex items-center gap-1 type-metadata font-semibold text-brand hover:underline"
        >
          Begin your first session →
        </Link>
      ),
    },
    {
      id: 'memory',
      title: hasPerformances ? 'Preserved Performances' : 'No Takes Preserved Yet',
      detail: hasPerformances
        ? `${performances.length} musical moment${performances.length > 1 ? 's' : ''} kept`
        : 'Save recordings from practice when a moment feels right',
      active: hasPerformances,
      icon: MemoryGlyph,
      action: hasPerformances && (
        <Link
          to={`/performances?score=${score.id}`}
          className="mt-1.5 inline-flex items-center gap-1 type-metadata font-semibold text-brand hover:underline"
        >
          Listen to preserved moments ({performances.length}) →
        </Link>
      ),
    },
    {
      id: 'sharing',
      title: isShared ? 'Musical Connection' : 'Private to You',
      detail: isShared
        ? (score.ownership === 'shared' ? `Shared by ${score.sharedBy}` : 'Shared with link or invite')
        : 'Only you have access to this piece',
      active: isShared,
      icon: Share2,
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative pl-6 before:absolute before:bottom-3 before:left-[11px] before:top-2 before:w-[1.5px] before:bg-surface-paper-edge">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative mb-5 last:mb-0">
              <div
                className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                  step.active
                    ? 'border-brand/40 bg-surface-paper text-brand shadow-xs'
                    : 'border-surface-paper-edge bg-surface-canvas text-ink-tertiary'
                }`}
              >
                <Icon className="h-3 w-3" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-tight ${step.active ? 'text-ink-primary' : 'text-ink-secondary'}`}>
                  {step.title}
                </p>
                <p className="mt-1 type-metadata text-ink-secondary leading-relaxed">{step.detail}</p>
                {step.action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
