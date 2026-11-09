import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-control border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-border text-foreground",
        /* Semantic status variants — subdued, not saturated */
        brand: "border-transparent bg-accent text-accent-foreground",
        success: "border-transparent bg-success/10 text-success",
        warning: "border-transparent bg-warning/10 text-warning",
        danger: "border-transparent bg-danger/10 text-danger",
        neutral: "border-transparent bg-muted text-ink-secondary",
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