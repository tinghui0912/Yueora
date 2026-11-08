import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const surfaceVariants = cva(
  'rounded-container transition-all duration-base',
  {
    variants: {
      tone: {
        panel: 'bg-surface-panel',
        paper: 'bg-surface-paper',
        'paper-warm': 'bg-surface-paper-warm',
        canvas: 'bg-surface-canvas',
        raised: 'bg-surface-panel',
      },
      elevation: {
        none: '',
        paper: 'shadow-paper',
        raised: 'shadow-raised',
        overlay: 'shadow-overlay',
      },
      border: {
        true: 'border border-surface-paper-edge',
        subtle: 'border border-line-subtle',
        none: 'border-0',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-5 md:p-6',
        lg: 'p-6 sm:p-8',
      },
      interactive: {
        true: 'hover:shadow-paper-hover hover:-translate-y-0.5 cursor-pointer',
      },
    },
    defaultVariants: {
      tone: 'panel',
      elevation: 'none',
      border: true,
      padding: 'none',
      interactive: false,
    },
  }
);

export const Surface = React.forwardRef(
  (
    {
      className,
      tone = 'panel',
      elevation = 'none',
      border = true,
      padding = 'none',
      interactive = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(
          surfaceVariants({ tone, elevation, border, padding, interactive, className })
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Surface.displayName = 'Surface';

export default Surface;
