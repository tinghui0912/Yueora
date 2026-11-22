import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const countBadgeVariants = cva(
  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-semibold leading-none tabular-nums transition-colors select-none',
  {
    variants: {
      tone: {
        informational: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        attention: 'border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80',
        neutral: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        warning: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        danger: 'border-transparent bg-danger text-danger-foreground shadow hover:bg-danger/80',
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
