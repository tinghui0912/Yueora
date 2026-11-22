import React from 'react';
import { minutesLabel, modeLabel } from '@/lib/practiceUtils';

/**
 * PracticeHistoryRow: Interactive record row for a completed practice session.
 */
export default function PracticeHistoryRow({ item, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="block w-full p-4 text-left transition-colors hover:bg-neutral-hover"
    >
      <p className="font-medium text-ink-primary">{item.scoreTitleSnapshot}</p>
      <p className="mt-0.5 type-body-small text-ink-secondary">
        {minutesLabel(item.durationSeconds)} · {modeLabel(item.mode)}{item.tempoBpm ? ` · ${item.tempoBpm} BPM` : ''}
      </p>
      <p className="mt-1 type-metadata text-ink-tertiary">{item.rangeSummary}</p>
    </button>
  );
}
