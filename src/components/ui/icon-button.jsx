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
        xs: 'h-7 w-7 min-h-[28px] min-w-[28px] p-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5',
        sm: 'h-8 w-8 min-h-[32px] min-w-[32px] p-2 [&_svg]:h-4 [&_svg]:w-4',
        md: 'h-9 w-9 min-h-[36px] min-w-[36px] p-2.5 [&_svg]:h-4.5 [&_svg]:w-4.5',
        lg: 'h-10 w-10 min-h-[40px] min-w-[40px] p-2.5 [&_svg]:h-5 [&_svg]:w-5',
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
