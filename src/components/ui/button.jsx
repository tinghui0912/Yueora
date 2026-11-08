import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-medium transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Semantic Yueora Intents */
        primary:
          "bg-brand text-white shadow-xs hover:bg-brand-hover active:scale-[0.98]",
        secondary:
          "border border-line-strong/80 bg-surface-panel text-ink-primary shadow-xs hover:bg-surface-paper hover:text-ink-primary active:scale-[0.98]",
        quiet:
          "text-ink-secondary hover:text-ink-primary hover:bg-surface-paper active:scale-[0.98]",
        danger:
          "bg-danger text-white shadow-xs hover:bg-danger/90 active:scale-[0.98]",
        transport:
          "rounded-full bg-brand text-white shadow-paper hover:bg-brand-hover active:scale-[0.97]",
        subtle:
          "border border-line-subtle bg-surface-canvas/60 text-ink-secondary hover:text-ink-primary hover:bg-surface-paper active:scale-[0.98]",
        link:
          "text-brand underline-offset-4 hover:underline",

        /* Backward-compatible legacy aliases */
        default:
          "bg-brand text-white shadow-xs hover:bg-brand-hover active:scale-[0.98]",
        destructive:
          "bg-danger text-white shadow-xs hover:bg-danger/90 active:scale-[0.98]",
        outline:
          "border border-line-strong/80 bg-surface-panel text-ink-primary shadow-xs hover:bg-surface-paper hover:text-ink-primary active:scale-[0.98]",
        ghost:
          "text-ink-secondary hover:text-ink-primary hover:bg-surface-paper active:scale-[0.98]",
      },
      size: {
        xs: "h-7 min-h-[28px] px-2.5 text-xs rounded-control gap-1.5 [&_svg]:size-3.5",
        sm: "h-8 min-h-[32px] px-3 text-[13px] font-medium rounded-control gap-1.5 [&_svg]:size-3.5",
        md: "h-9 min-h-[36px] px-4 text-sm font-medium rounded-control gap-2 [&_svg]:size-4",
        default: "h-9 min-h-[36px] px-4 text-sm font-medium rounded-control gap-2 [&_svg]:size-4",
        lg: "h-11 min-h-[44px] px-6 text-sm font-semibold rounded-control gap-2.5 [&_svg]:size-4.5",
        icon: "h-9 w-9 min-h-[36px] min-w-[36px] p-0 rounded-control [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

const Button = React.forwardRef(({ className, variant, intent, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const resolvedVariant = intent || variant || "primary";
  const resolvedSize = size === "default" ? "md" : (size || "md");
  return (
    (<Comp
      className={cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
