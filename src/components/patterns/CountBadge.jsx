import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const countBadgeVariants = cva(
  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-semibold leading-none tabular-nums transition-colors select-none',
  {
    variants: {
      tone: {
        informational: 'bg-brand-soft text-ink-primary',
        attention: 'bg-brand text-brand-foreground',
        neutral: 'bg-neutral-muted text-ink-secondary',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
      },
    },
    defaultVariants: {
      tone: 'informational',
    },
  }
);

/**
 * @typedef {React.HTMLAttributes<HTMLSpanElement> & {
 *   tone?: 'informational' | 'attention' | 'neutral' | 'warning' | 'danger';
 *   children: React.ReactNode;
 * }} CountBadgeProps
 */

/** @type {React.ForwardRefExoticComponent<CountBadgeProps & React.RefAttributes<HTMLSpanElement>>} */
export const CountBadge = React.forwardRef(function CountBadge(
  { className = '', tone = 'informational', style, children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      data-qa="count-badge"
      data-tone={tone}
      style={{ fontSize: '11px', lineHeight: 1, ...style }}
      className={cn(countBadgeVariants({ tone }), className)}
      {...props}
    >
      {children}
    </span>
  );
});

export default CountBadge;
