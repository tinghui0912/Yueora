import React from 'react';
import { AlertTriangle, Check, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ReviewMobileTrigger — Mobile bottom sheet trigger for recognition review issues.
 */
export function ReviewMobileTrigger({ count, reviewed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-t border-line-subtle px-4 py-3 md:hidden hover:bg-neutral-hover transition-colors"
    >
      <span className="type-body-small font-medium">{count} issues · {reviewed} reviewed</span>
      <ChevronUp className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
    </button>
  );
}

/**
 * ReviewIssueRow — Domain interactive row for recognition review issues.
 */
export function ReviewIssueRow({
  issue,
  active = false,
  onClick,
  compact = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left transition-colors',
        compact
          ? 'rounded-control border p-3'
          : 'rounded-container border p-3',
        active
          ? 'border-brand bg-neutral-hover'
          : compact
            ? 'border-line-subtle'
            : 'border-line-subtle bg-surface-panel hover:bg-neutral-hover',
        issue.resolved && 'opacity-50',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 type-body-small font-medium">
          <AlertTriangle className={cn('text-brand', compact ? 'h-3.5 w-3.5' : 'icon-xs')} aria-hidden="true" />
          Measure {issue.measure}
        </span>
        {issue.resolved && (
          <Check className={cn('text-brand', compact ? 'h-3.5 w-3.5' : 'icon-xs')} aria-hidden="true" />
        )}
      </div>
      <p className="mt-0.5 type-metadata text-ink-secondary">{issue.type}</p>
      {!compact && issue.detail && (
        <p className="mt-0.5 type-metadata text-ink-secondary">{issue.detail}</p>
      )}
      {!compact && issue.confidence && (
        <p className="mt-1 type-metadata text-ink-tertiary">Confidence: {issue.confidence}</p>
      )}
    </button>
  );
}

export default ReviewIssueRow;
