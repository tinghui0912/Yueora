import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold normal-case tracking-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80", /* ds-allow: badge hover softened opacity matching Numis reference softened hover */
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-danger text-danger-foreground shadow hover:bg-danger/80",
        outline: "border-line-subtle text-ink-primary",
        /* Semantic status variants — mapped to exact Numis canonical badge recipes */
        brand: "border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80",
        success: "border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80",
        warning: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        danger: "border-transparent bg-danger text-danger-foreground shadow hover:bg-danger/80",
        neutral: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
