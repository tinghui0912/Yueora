import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusIndicator — status badge/pill for import status, save state, live input, MIDI, sharing, invitation.
 * Sourced directly from NumisCollection ItemCard condition recipes.
 */
const toneStyles = {
  neutral: 'border border-line-subtle bg-surface-canvas text-ink-secondary',
  brand: 'border border-brand/20 bg-brand-soft text-brand-soft-foreground',
  success: 'border border-emerald-200 bg-emerald-500/10 text-emerald-700',
  warning: 'border border-amber-200 bg-amber-500/10 text-amber-700',
  danger: 'border border-red-200 bg-red-500/10 text-red-700',
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