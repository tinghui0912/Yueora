import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-colors hover:bg-neutral-muted hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground [&_svg]:pointer-events-none [&_svg]:icon-xs [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-line-subtle bg-transparent shadow-control hover:bg-brand-soft hover:text-brand-soft-foreground",
      },
      size: {
        default: "h-control-md px-3 min-w-control-md",
        sm: "h-control-sm px-2.5 min-w-control-sm text-xs",
        lg: "h-control-lg px-4 min-w-control-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * @typedef {React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & import("class-variance-authority").VariantProps<typeof toggleVariants>} ToggleProps
 */

/** @type {React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<React.ElementRef<typeof TogglePrimitive.Root>>>} */
const Toggle = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props} />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
