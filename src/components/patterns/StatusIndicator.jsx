import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusIndicator — status badge/pill for import status, save state, live input, MIDI, sharing, invitation.
 * Sourced from canonical Numis brand, neutral, and destructive alert primitives.
 */
const toneStyles = {
  neutral: 'border border-line-subtle bg-surface-panel text-ink-secondary',
  brand: 'border border-brand/20 bg-brand-soft text-brand-soft-foreground',
  success: 'border border-brand/20 bg-brand-soft text-brand-soft-foreground',
  warning: 'border border-line-subtle bg-neutral-muted text-ink-secondary',
  danger: 'border border-danger/30 bg-danger/10 text-danger',
  practice: 'border border-brand/20 bg-brand-soft text-brand-soft-foreground',
};

export default function StatusIndicator({ tone = 'neutral', label, className = '', pulse = false }) {
  const recipe = toneStyles[tone] || toneStyles.neutral;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 type-body-small font-medium', recipe, className)}>
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />}
      {label}
    </span>
  );
}