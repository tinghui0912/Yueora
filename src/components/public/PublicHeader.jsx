import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import PublicMobileMenu from '@/components/external/PublicMobileMenu';
import Logo from '@/components/brand/Logo';

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
        <nav className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex md:gap-2">
            {isHome ? (
              <>
                <a
                  href="#lifecycle"
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  How it works
                </a>
                <a
                  href="#practice"
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Practice
                </a>
                <a
                  href="#performances"
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Performances
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/#lifecycle"
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  How it works
                </Link>
                <Link
                  to="/#practice"
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Practice
                </Link>
                <Link
                  to="/#performances"
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Performances
                </Link>
              </>
            )}

            <Link
              to="/pricing"
              className="rounded-control px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              Pricing
            </Link>
          </div>

          <div className="mx-1 hidden h-4 w-px bg-surface-paper-edge sm:block" aria-hidden="true" />

          {/* Action Area */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/library"
                className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                Go to Yueora
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-control px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary sm:inline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Start playing
                </Link>
              </>
            )}
            <PublicMobileMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
