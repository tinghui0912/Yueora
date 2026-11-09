import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';

/**
 * AuthLayout — quiet, editorial, trustworthy.
 * Covers Login, Register, Forgot Password, Reset Password, Verify Email.
 * No giant icon block, no rounded-2xl card, no heavy shadow.
 */
export default function AuthLayout({ icon: _Icon = undefined, title, subtitle = null, footer = null, children = null }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <Link to="/" aria-label="Yueora home" className="mb-10 flex justify-center">
          <Logo variant="full" size="lg" />
        </Link>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="type-page-title text-ink-primary">{title}</h1>
          {subtitle && <p className="mt-2 type-body-small text-ink-secondary">{subtitle}</p>}
        </div>

        {/* Form — no card wrapper, subtle divider above */}
        <div className="border-t border-line-subtle pt-6">
          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center type-body-small text-ink-tertiary">{footer}</p>
        )}
      </div>
    </div>
  );
}