import React from 'react';
import { cn } from '@/lib/utils';

const sizeMap = {
  compact: 'max-w-page-compact',
  form: 'max-w-page-form',
  standard: 'max-w-page-standard',
  wide: 'max-w-page-wide',
  full: 'w-full max-w-none',
};

const paddingMap = {
  normal: 'px-4 sm:px-6 md:px-8 py-6 md:py-8',
  compact: 'px-4 py-4 sm:px-6',
  none: 'p-0',
};

/**
 * @typedef {React.HTMLAttributes<HTMLDivElement> & {
 *   size?: 'compact' | 'form' | 'standard' | 'wide' | 'full';
 *   padding?: 'normal' | 'compact' | 'none';
 *   className?: string;
 *   children?: React.ReactNode;
 * }} AppPageProps
 */

/**
 * AppPage — Standard application surface container.
 * Enforces unified semantic max-widths, responsive gutters, and vertical flow.
 * Note: Renders as a neutral <div> container because the outer Shell (AppShell / PublicShell)
 * already owns the document's single <main> landmark.
 *
 * @param {AppPageProps} props
 */
export function AppPage({
  size = 'standard',
  padding = 'normal',
  className = '',
  children = null,
  ...props
}) {
  const resolvedWidth = sizeMap[size] || sizeMap.standard;
  const resolvedPadding = paddingMap[padding] || paddingMap.normal;

  return (
    <div
      className={cn('mx-auto w-full min-w-0', resolvedWidth, resolvedPadding, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default AppPage;
