import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold normal-case tracking-normal transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80", /* ds-allow: badge hover softened opacity matching Numis reference softened hover */
        secondary:
          "border-transparent bg-neutral-muted text-ink-secondary hover:bg-neutral-hover",
        destructive:
          "border-transparent bg-danger text-danger-foreground shadow hover:bg-danger/80",
        outline: "border-line-subtle text-ink-primary",
        /* Semantic status variants — mapped strictly to Numis ItemCard condition recipes */
        brand: "border-transparent bg-brand-soft text-brand-soft-foreground",
        success: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
        warning: "border-amber-200 bg-amber-500/10 text-amber-700",
        danger: "border-red-200 bg-red-500/10 text-red-700",
        neutral: "border-transparent bg-neutral-muted text-ink-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * @typedef {React.HTMLAttributes<HTMLDivElement> & {
 *   variant?: 'default' | 'destructive' | 'secondary' | 'danger' | 'outline' | 'neutral' | 'warning' | 'success' | 'brand';
 * }} BadgeProps
 */

/**
 * @param {BadgeProps} props
 */
function Badge({
  className = '',
  variant = 'default',
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
export { CountBadge } from '@/components/patterns/CountBadge';
