import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import PublicMobileMenu from '@/components/external/PublicMobileMenu';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';

/**
 * PublicHeader — Editorial, calm, product-led navigation.
 * At the page top: visually continuous with the warm canvas.
 * On scroll: gently strengthens backdrop blur and boundary.
 */
export default function PublicHeader() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <header
      className={`sticky top-0 z-40 shrink-0 transition-[background-color,border-color,backdrop-filter] duration-base ${
        scrolled
          ? 'border-b border-surface-paper-edge bg-surface-canvas/92 backdrop-blur-md shadow-xs'
          : 'border-b border-transparent bg-surface-canvas/60 backdrop-blur-xs'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          aria-label="Yueora home"
          className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded py-1"
        >
          <Logo variant="full" size="md" />
        </Link>

        {/* Primary Navigation — Focused on understanding the product */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 md:flex lg:gap-4">
            {isHome ? (
              <>
                <a
                  href="#lifecycle"
                  className="px-2.5 py-1 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                >
                  How it works
                </a>
                <a
                  href="#practice"
                  className="px-2.5 py-1 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Practice
                </a>
                <a
                  href="#performances"
                  className="px-2.5 py-1 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Performances
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/#lifecycle"
                  className="px-2.5 py-1 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                >
                  How it works
                </Link>
                <Link
                  to="/#practice"
                  className="px-2.5 py-1 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Practice
                </Link>
                <Link
                  to="/#performances"
                  className="px-2.5 py-1 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Performances
                </Link>
              </>
            )}

            <Link
              to="/pricing"
              className="px-2.5 py-1 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              Pricing
            </Link>
          </div>

          <div className="mx-1 hidden h-4 w-px bg-surface-paper-edge md:block" aria-hidden="true" />

          {/* Action Area */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild intent="primary" size="sm" className="shadow-xs font-semibold">
                <Link to="/library">
                  Go to Yueora
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild intent="quiet" size="sm" className="hidden md:inline-flex font-medium text-ink-secondary hover:text-ink-primary">
                  <Link to="/login">
                    Log in
                  </Link>
                </Button>
                <Button asChild intent="primary" size="sm" className="shadow-xs font-semibold">
                  <Link to="/register">
                    Start playing
                  </Link>
                </Button>
              </>
            )}
            <PublicMobileMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
