import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import PublicMobileMenu from '@/components/external/PublicMobileMenu';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';

/**
 * PublicHeader — Editorial, calm, product-led navigation.
 * Matches UGC Nav grammar:
 * - fixed top-0 inset-x-0 z-50
 * - max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20
 * - smooth scroll threshold at 40px
 * - warm ivory translucent backdrop blur with subtle border
 * - 40px high desktop CTA with 20px horizontal padding
 * - header-owned expanding mobile dropdown panel
 */
export default function PublicHeader() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  const HeaderTag = shouldReduceMotion ? 'header' : motion.header;
  const headerMotionProps = shouldReduceMotion
    ? {}
    : {
        initial: { y: -80, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <HeaderTag
      {...headerMotionProps}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled || mobileOpen
          ? 'border-b border-line-subtle/80 bg-surface-canvas/90 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-10">
        {/* Brand Logo */}
        <Link
          to="/"
          aria-label="Yueora home"
          className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full py-1"
        >
          <Logo variant="full" size="md" />
        </Link>

        {/* Primary Navigation — Focused on understanding the product */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-8 lg:gap-9 md:flex">
            {isHome ? (
              <>
                <a
                  href="#lifecycle"
                  className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                >
                  The Lifecycle
                </a>
                <a
                  href="#repertoire"
                  className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                >
                  Repertoire
                </a>
                <a
                  href="#practice"
                  className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                >
                  Practice
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/#lifecycle"
                  className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                >
                  The Lifecycle
                </Link>
                <Link
                  to="/#repertoire"
                  className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                >
                  Repertoire
                </Link>
                <Link
                  to="/#practice"
                  className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                >
                  Practice
                </Link>
              </>
            )}

            <Link
              to="/about"
              className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
            >
              About
            </Link>

            <Link
              to="/pricing"
              className="text-sm tracking-wide text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
            >
              Pricing
            </Link>
          </div>

          <div className="mx-2 hidden h-4 w-px bg-line-subtle md:block" aria-hidden="true" />

          {/* Action Area — UGC desktop Nav CTA scale: 40px high, 20px padding */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {isAuthenticated ? (
              <Button asChild intent="primary" className="hidden sm:inline-flex h-9 sm:h-control-lg px-3.5 sm:px-5 text-xs sm:text-sm font-medium tracking-wide shrink-0">
                <Link to="/library">
                  Go to Library
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild intent="quiet" className="hidden md:inline-flex h-control-lg min-h-control-lg px-4 text-sm font-medium tracking-wide text-ink-secondary hover:text-ink-primary">
                  <Link to="/login">
                    Log in
                  </Link>
                </Button>
                <Button asChild intent="primary" className="hidden sm:inline-flex h-9 sm:h-control-lg px-3.5 sm:px-5 text-xs sm:text-sm font-medium tracking-wide shrink-0">
                  <Link to="/register">
                    Start playing
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile expanding menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="grid place-items-center w-10 h-10 shrink-0 rounded-full border border-line-subtle text-ink-secondary hover:text-ink-primary hover:border-line-strong transition-colors md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Header-owned expanding mobile panel */}
      <PublicMobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </HeaderTag>
  );
}
