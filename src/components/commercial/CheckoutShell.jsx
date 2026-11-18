import { Link, Outlet } from 'react-router-dom';
import Logo from '@/components/brand/Logo';

/**
 * CheckoutShell — a focused, distraction-free shell for the commercial flow.
 * Brand header, a way back to pricing, and minimal legal links. No app sidebar.
 */
export default function CheckoutShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="border-b border-line-subtle">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 md:px-8">
          <Link to="/" aria-label="Yueora home">
            <Logo variant="full" size="md" />
          </Link>
          <Link to="/pricing" className="type-body-small text-ink-secondary hover:text-ink-primary">
            Back to pricing
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-line-subtle">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-2 px-5 py-5 text-sm text-ink-tertiary md:flex-row md:px-8">
          <span className="flex items-center gap-2">
            <Logo variant="mark" size="sm" className="text-ink-tertiary" label="Yueora" />
            Secure checkout. Your payment details are protected.
          </span>
          <nav className="flex gap-4">
            <Link to="/legal/terms" className="hover:text-ink-primary">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-ink-primary">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}