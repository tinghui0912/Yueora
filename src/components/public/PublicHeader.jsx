import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import PublicMobileMenu from '@/components/external/PublicMobileMenu';
import Logo from '@/components/brand/Logo';

/**
 * PublicHeader — shared marketing/help/legal header.
 * Stable height (h-16), max-w-6xl content width.
 * Desktop: About, Pricing, Help + auth-aware CTA.
 * Mobile: hamburger menu.
 */
export default function PublicHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line-subtle bg-surface-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link to="/" aria-label="Yueora home" className="inline-flex">
          <Logo variant="full" size="md" />
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/about" className="hidden rounded-control px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary sm:inline">About</Link>
          <Link to="/pricing" className="hidden rounded-control px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary sm:inline">Pricing</Link>
          <Link to="/help" className="hidden rounded-control px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary sm:inline">Help</Link>
          {isAuthenticated ? (
            <Link to="/library" className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Open library</Link>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-control px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary sm:inline">Log in</Link>
              <Link to="/register" className="hidden rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:inline">Start playing</Link>
            </>
          )}
          <PublicMobileMenu />
        </nav>
      </div>
    </header>
  );
}