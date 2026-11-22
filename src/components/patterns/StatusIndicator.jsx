import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusIndicator — status badge/pill for import status, save state, live input, MIDI, sharing, invitation.
 * Sourced from canonical Numis brand, neutral, and destructive alert primitives.
 */
const toneStyles = {
  neutral: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  brand: 'border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80',
  success: 'border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80',
  warning: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  danger: 'border-transparent bg-danger text-danger-foreground shadow hover:bg-danger/80',
  practice: 'border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80',
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