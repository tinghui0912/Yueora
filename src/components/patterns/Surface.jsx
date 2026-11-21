import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const surfaceVariants = cva(
  'rounded-container',
  {
    variants: {
      tone: {
        panel: 'bg-surface-panel',
        canvas: 'bg-surface-canvas',
        raised: 'bg-surface-raised',
      },
      elevation: {
        none: '',
        raised: 'shadow-raised',
        overlay: 'shadow-overlay',
      },
      border: {
        true: 'border border-line-subtle/50',
        false: 'border-0',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-5 md:p-6',
        lg: 'p-6 sm:p-8',
      },
      interactive: {
        false: '',
        true: 'hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300',
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

/**
 * @typedef {React.HTMLAttributes<HTMLDivElement> & {
 *   tone?: 'panel' | 'canvas' | 'raised';
 *   elevation?: 'none' | 'raised' | 'overlay';
 *   border?: boolean;
 *   padding?: 'none' | 'sm' | 'md' | 'lg';
 *   interactive?: boolean;
 *   asChild?: boolean;
 *   children?: React.ReactNode;
 * }} SurfaceProps
 */

/** @type {React.ForwardRefExoticComponent<SurfaceProps & React.RefAttributes<HTMLDivElement>>} */
export const Surface = React.forwardRef(
  (
    {
      className = '',
      tone = 'panel',
      elevation = 'none',
      border = true,
      padding = 'none',
      interactive = false,
      asChild = false,
      children = null,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';
    const isInteractive = Boolean(interactive);

    return (
      <Comp
        ref={ref}
        className={cn(
          surfaceVariants({ tone, elevation, border, padding, interactive: isInteractive, className })
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
