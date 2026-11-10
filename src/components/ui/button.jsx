import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-[color,background-color,border-color,box-shadow,transform] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Semantic Yueora Intents */
        primary:
          "bg-brand text-white hover:bg-brand-hover active:scale-[0.98]",
        secondary:
          "border border-line-subtle bg-surface-panel text-ink-primary hover:bg-neutral-hover hover:text-ink-primary active:scale-[0.98]",
        quiet:
          "text-ink-secondary hover:text-ink-primary hover:bg-neutral-hover active:scale-[0.98]",
        danger:
          "bg-danger text-white hover:bg-danger/90 active:scale-[0.98]",
        subtle:
          "bg-neutral-muted text-ink-primary hover:bg-neutral-hover active:scale-[0.98]",
        link:
          "text-ink-primary underline-offset-4 hover:underline",

        /* Backward-compatible legacy aliases */
        default:
          "bg-brand text-white hover:bg-brand-hover active:scale-[0.98]",
        destructive:
          "bg-danger text-white hover:bg-danger/90 active:scale-[0.98]",
        outline:
          "border border-line-subtle bg-surface-panel text-ink-primary hover:bg-neutral-hover hover:text-ink-primary active:scale-[0.98]",
        ghost:
          "text-ink-secondary hover:text-ink-primary hover:bg-neutral-hover active:scale-[0.98]",
      },
      size: {
        xs: "h-control-xs min-h-control-xs px-3 type-caption rounded-full gap-1.5 [&_svg]:icon-xs",
        sm: "h-control-sm min-h-control-sm px-4 type-body-small font-medium rounded-full gap-1.5 [&_svg]:icon-sm",
        md: "h-control-md min-h-control-md px-5 type-body-small font-medium rounded-full gap-2 [&_svg]:icon-sm",
        default: "h-control-md min-h-control-md px-5 type-body-small font-medium rounded-full gap-2 [&_svg]:icon-sm",
        lg: "h-control-xl min-h-control-xl px-6 type-body-small font-semibold rounded-full gap-2.5 [&_svg]:icon-md",
        xl: "h-[3.25rem] min-h-[3.25rem] px-7 text-sm font-medium tracking-wide rounded-full gap-2.5 [&_svg]:icon-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

/**
 * @typedef {React.ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'subtle' | 'link' | 'default' | 'destructive' | 'outline' | 'ghost';
 *   intent?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'subtle' | 'link';
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'default';
 *   asChild?: boolean;
 *   children?: React.ReactNode;
 * }} ButtonProps
 */

/** @type {React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>} */
const Button = React.forwardRef(({ className = '', variant, intent, size, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const resolvedVariant = intent || variant || "primary";
  const resolvedSize = size === "default" ? "md" : (size || "md");
  return (
    (<Comp
      className={cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize, className }))}
      ref={ref}
      {...props}>
      {children}
    </Comp>)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
