import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-control transition-[color,background-color,border-color,box-shadow,transform] duration-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      intent: {
        primary:
          "bg-brand text-brand-foreground shadow hover:bg-brand/90",
        secondary:
          "border border-line-subtle bg-transparent text-ink-primary shadow-control hover:bg-brand-soft hover:text-ink-primary",
        quiet:
          "text-ink-secondary hover:text-ink-primary hover:bg-brand-soft",
        danger:
          "bg-danger text-danger-foreground shadow-control hover:bg-danger/90",
        subtle:
          "bg-neutral-muted text-ink-primary hover:bg-neutral-hover hover:text-ink-primary",
        link:
          "text-brand underline-offset-4 hover:underline hover:text-brand/90",
        inverse:
          "bg-ink-primary text-surface-panel shadow-control hover:bg-ink-secondary",
        "inverse-secondary":
          "border border-line-subtle/40 text-brand-foreground bg-transparent hover:bg-brand-soft/20 hover:text-brand-foreground",
      },
      size: {
        xs: "h-control-xs min-h-control-xs px-2.5 type-caption rounded-control gap-1.5 [&_svg]:icon-xs",
        sm: "h-control-sm min-h-control-sm px-3 type-body-small font-medium rounded-control gap-1.5 [&_svg]:icon-sm",
        md: "h-control-md min-h-control-md px-4 type-body-small font-medium rounded-control gap-2 [&_svg]:icon-sm",
        lg: "h-control-lg min-h-control-lg px-8 type-body-small font-semibold rounded-control gap-2.5 [&_svg]:icon-md",
        xl: "h-control-xl min-h-control-xl px-8 type-body-small font-semibold rounded-control gap-2.5 [&_svg]:icon-md",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
)

/**
 * @typedef {React.ButtonHTMLAttributes<HTMLButtonElement> & {
 *   intent?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'subtle' | 'link' | 'inverse' | 'inverse-secondary';
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
 *   asChild?: boolean;
 *   children?: React.ReactNode;
 * }} ButtonProps
 */

/** @type {React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>} */
const Button = React.forwardRef(({ className = '', intent = 'primary', size = 'md', asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ intent, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
