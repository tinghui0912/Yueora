import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center shrink-0 rounded-control transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      tone: {
        quiet:
          'text-ink-secondary hover:text-ink-primary hover:bg-surface-paper active:scale-[0.98]',
        outline:
          'border border-surface-paper-edge bg-surface-panel text-ink-secondary hover:text-ink-primary hover:bg-surface-paper shadow-xs active:scale-[0.98]',
        surface:
          'border border-line-subtle bg-surface-paper text-ink-secondary hover:text-ink-primary hover:bg-surface-paper-warm shadow-xs active:scale-[0.98]',
        primary:
          'bg-brand text-white shadow-xs hover:bg-brand-hover active:scale-[0.98]',
        danger:
          'text-danger hover:bg-destructive/10 hover:text-danger active:scale-[0.98]',
      },
      size: {
        xs: 'h-control-xs w-control-xs min-h-control-xs min-w-control-xs p-1 [&_svg]:icon-xs',
        sm: 'h-control-sm w-control-sm min-h-control-sm min-w-control-sm p-1.5 [&_svg]:icon-sm',
        md: 'h-control-md w-control-md min-h-control-md min-w-control-md p-2 [&_svg]:icon-md',
        lg: 'h-control-lg w-control-lg min-h-control-lg min-w-control-lg p-2.5 [&_svg]:icon-lg',
      },
      active: {
        true: 'bg-brand/10 text-brand font-semibold shadow-xs',
      },
    },
    defaultVariants: {
      tone: 'quiet',
      size: 'md',
    },
  }
);

const IconButton = React.forwardRef(
  (
    {
      className,
      icon: Icon,
      label,
      tone = 'quiet',
      size = 'md',
      active = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        aria-label={label}
        title={label}
        className={cn(iconButtonVariants({ tone, size, active, className }))}
        {...props}
      >
        {Icon ? <Icon aria-hidden="true" /> : children}
      </Comp>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
