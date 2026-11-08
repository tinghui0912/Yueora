import React from 'react';
import { cn } from '@/lib/utils';

const toneDot = {
  neutral: 'bg-ink-tertiary',
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  practice: 'bg-practice-current',
};

const toneText = {
  neutral: 'text-ink-secondary',
  brand: 'text-ink-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  practice: 'text-practice-current',
};

/**
 * StatusIndicator — dot + label for import status, save state, live input, MIDI, sharing, invitation.
 */
export default function StatusIndicator({ tone = 'neutral', label, className = '', pulse = false }) {
  const dot = toneDot[tone] || toneDot.neutral;
  const text = toneText[tone] || toneText.neutral;
  return (
    <span className={cn('inline-flex items-center gap-1.5 type-body-small', text, className)}>
      <span className={cn('h-2 w-2 rounded-full', dot, pulse && 'animate-pulse')} />
      {label}
    </span>
  );
}