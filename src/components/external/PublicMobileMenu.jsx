import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';

/**
 * PublicMobileMenu — Intentional, editorial mobile sheet navigation.
 * Matches UGC Nav mobile menu rhythm:
 * - Generous vertical link rows
 * - Border-b separators
 * - Warm translucent backdrop
 * - Large pill CTAs
 */
export default function PublicMobileMenu() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="grid place-items-center w-10 h-10 rounded-full border border-line-subtle text-ink-secondary hover:text-ink-primary hover:border-line-strong transition-colors md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm border-l border-line-subtle/80 bg-surface-canvas/95 backdrop-blur-2xl p-6 md:p-8 flex flex-col justify-between">
          <div>
            <SheetHeader className="text-left pb-5 border-b border-line-subtle">
              <SheetTitle>
                <Logo variant="full" size="md" />
              </SheetTitle>
              <p className="mt-1 font-display italic text-xs text-ink-secondary/70">
                A personal musical journey.
              </p>
            </SheetHeader>

            {/* Primary Product Navigation */}
            <nav className="mt-6 flex flex-col" onClick={() => setOpen(false)}>
              <a
                href="/#lifecycle"
                className="py-4 text-lg tracking-wide text-ink-primary border-b border-line-subtle/50 hover:text-brand transition-colors"
              >
                The Lifecycle
              </a>
              <a
                href="/#repertoire"
                className="py-4 text-lg tracking-wide text-ink-primary border-b border-line-subtle/50 hover:text-brand transition-colors"
              >
                Personal Repertoire
              </a>
              <a
                href="/#practice"
                className="py-4 text-lg tracking-wide text-ink-primary border-b border-line-subtle/50 hover:text-brand transition-colors"
              >
                Practice Stand
              </a>
              <Link
                to="/about"
                className="py-4 text-lg tracking-wide text-ink-primary border-b border-line-subtle/50 hover:text-brand transition-colors"
              >
                About Yueora
              </Link>
              <Link
                to="/pricing"
                className="py-4 text-lg tracking-wide text-ink-primary border-b border-line-subtle/50 hover:text-brand transition-colors"
              >
                Pricing &amp; Plans
              </Link>
            </nav>

            {/* Secondary Destinations */}
            <div className="mt-6 pt-2 space-y-1" onClick={() => setOpen(false)}>
              <Link to="/help" className="block py-2 text-sm text-ink-secondary hover:text-ink-primary">
                Help &amp; FAQ
              </Link>
              <Link to="/legal/privacy" className="block py-2 text-sm text-ink-secondary hover:text-ink-primary">
                Privacy policy
              </Link>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-line-subtle" onClick={() => setOpen(false)}>
            {isAuthenticated ? (
              <Button asChild intent="primary" size="lg" className="w-full">
                <Link to="/library">
                  <span>Go to Library</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="space-y-3">
                <Button asChild intent="primary" size="lg" className="w-full">
                  <Link to="/register">
                    <span>Start playing</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild intent="secondary" size="lg" className="w-full">
                  <Link to="/login">
                    Log in
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
