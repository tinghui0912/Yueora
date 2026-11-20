import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-control transition-[color,background-color,border-color,box-shadow,transform] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      intent: {
        primary:
          "bg-brand text-brand-foreground shadow-raised hover:bg-brand-hover active:scale-[0.99]",
        secondary:
          "border border-line-subtle bg-surface-panel text-ink-primary shadow-raised hover:bg-neutral-hover hover:text-ink-primary active:scale-[0.99]",
        quiet:
          "text-ink-secondary hover:text-ink-primary hover:bg-neutral-hover active:scale-[0.99]",
        danger:
          "bg-danger text-white shadow-raised hover:bg-danger/90 active:scale-[0.99]",
        subtle:
          "bg-neutral-muted text-ink-primary hover:bg-neutral-hover active:scale-[0.99]",
        link:
          "text-ink-primary underline-offset-4 hover:underline",
        inverse:
          "bg-ink-primary text-surface-panel shadow-raised hover:bg-ink-secondary active:scale-[0.99]",
        "inverse-secondary":
          "border border-line-strong text-ink-primary bg-transparent hover:bg-neutral-hover active:scale-[0.99]",
      },
      size: {
        xs: "h-control-xs min-h-control-xs px-3 type-caption rounded-control gap-1.5 [&_svg]:icon-xs",
        sm: "h-control-sm min-h-control-sm px-4 type-body-small font-medium rounded-control gap-1.5 [&_svg]:icon-sm",
        md: "h-control-md min-h-control-md px-5 type-body-small font-medium rounded-control gap-2 [&_svg]:icon-sm",
        lg: "h-control-lg min-h-control-lg px-5 type-body-small font-semibold rounded-control gap-2.5 [&_svg]:icon-md",
        xl: "h-control-xl min-h-control-xl px-6 type-body-small font-semibold rounded-control gap-2.5 [&_svg]:icon-md",
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
