import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center shrink-0 rounded-control transition-[color,background-color,border-color,box-shadow,transform] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      tone: {
        quiet:
          'text-ink-secondary hover:text-ink-primary hover:bg-brand-soft/50 active:scale-[0.98]',
        outline:
          'border border-line-subtle bg-surface-panel text-ink-secondary hover:text-ink-primary hover:bg-brand-soft/60 hover:border-brand/40 shadow-raised active:scale-[0.98]',
        primary:
          'bg-brand-fill text-brand-fill-foreground shadow-raised hover:bg-brand-fill-hover active:scale-[0.98]',
        danger:
          'text-danger hover:bg-danger/10 hover:text-danger active:scale-[0.98]',
      },
      size: {
        xs: 'h-control-xs w-control-xs min-h-control-xs min-w-control-xs p-1 [&_svg]:icon-xs',
        sm: 'h-control-sm w-control-sm min-h-control-sm min-w-control-sm p-1.5 [&_svg]:icon-sm',
        md: 'h-control-md w-control-md min-h-control-md min-w-control-md p-2 [&_svg]:icon-md',
        lg: 'h-control-lg w-control-lg min-h-control-lg min-w-control-lg p-2.5 [&_svg]:icon-lg',
      },
      active: {
        true: 'bg-brand-soft text-ink-primary font-semibold ring-1 ring-brand/40',
      },
    },
    defaultVariants: {
      tone: 'quiet',
      size: 'md',
    },
  }
);

/**
 * @typedef {React.ButtonHTMLAttributes<HTMLButtonElement> & {
 *   icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
 *   label: string;
 *   tone?: 'quiet' | 'outline' | 'primary' | 'danger';
 *   size?: 'xs' | 'sm' | 'md' | 'lg';
 *   active?: boolean;
 *   asChild?: boolean;
 *   children?: React.ReactNode;
 * }} IconButtonProps
 */

/** @type {React.ForwardRefExoticComponent<IconButtonProps & React.RefAttributes<HTMLButtonElement>>} */
const IconButton = React.forwardRef(
  (
    {
      className = '',
      icon: Icon,
      label,
      tone = 'quiet',
      size = 'md',
      active = false,
      asChild = false,
      children = null,
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
