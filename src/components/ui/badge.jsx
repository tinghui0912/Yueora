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
          "border-transparent bg-neutral-muted text-ink-primary hover:bg-neutral-hover",
        destructive:
          "border-transparent bg-danger/10 text-danger hover:bg-danger/20",
        outline: "border-line-subtle text-ink-primary",
        /* Semantic status variants — subdued, not saturated */
        brand: "border-transparent bg-brand-soft text-brand-soft-foreground",
        success: "border-transparent bg-success/10 text-success",
        warning: "border-transparent bg-warning/10 text-warning",
        danger: "border-transparent bg-danger/10 text-danger",
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
