import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-control border px-2.5 py-0.5 type-caption font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand text-brand-foreground hover:bg-brand-hover",
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
