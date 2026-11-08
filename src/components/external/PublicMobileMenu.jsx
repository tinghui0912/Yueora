import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/brand/Logo';

/**
 * PublicMobileMenu — Intentional, editorial mobile sheet navigation.
 * Clear product-first hierarchy with generous touch targets.
 */
export default function PublicMobileMenu() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-control p-2 text-ink-secondary hover:bg-surface-paper hover:text-ink-primary md:hidden transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 border-surface-paper-edge bg-surface-canvas p-6 flex flex-col justify-between">
          <div>
            <SheetHeader className="text-left pb-4 border-b border-surface-paper-edge">
              <SheetTitle>
                <Logo variant="full" size="md" />
              </SheetTitle>
              <p className="mt-1 font-display italic text-xs text-ink-secondary/70">
                A personal musical journey.
              </p>
            </SheetHeader>

            {/* Primary Product Navigation */}
            <nav className="mt-6 flex flex-col space-y-1" onClick={() => setOpen(false)}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-secondary/70 mb-1">
                Explore Yueora
              </p>
              <a
                href="/#lifecycle"
                className="rounded-control px-3 py-2.5 font-display text-lg font-medium text-ink-primary hover:bg-surface-paper transition-colors"
              >
                How it works
              </a>
              <a
                href="/#practice"
                className="rounded-control px-3 py-2.5 font-display text-lg font-medium text-ink-primary hover:bg-surface-paper transition-colors"
              >
                Practice without pressure
              </a>
              <a
                href="/#performances"
                className="rounded-control px-3 py-2.5 font-display text-lg font-medium text-ink-primary hover:bg-surface-paper transition-colors"
              >
                Preserved moments
              </a>
              <Link
                to="/pricing"
                className="rounded-control px-3 py-2.5 font-display text-lg font-medium text-ink-primary hover:bg-surface-paper transition-colors"
              >
                Pricing &amp; plans
              </Link>
            </nav>

            {/* Secondary Destinations */}
            <div className="mt-8 border-t border-surface-paper-edge pt-4 space-y-1" onClick={() => setOpen(false)}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-secondary/70 mb-1">
                About &amp; Support
              </p>
              <Link to="/about" className="block rounded-control px-3 py-2 type-metadata text-ink-secondary hover:text-ink-primary">
                About Yueora
              </Link>
              <Link to="/help" className="block rounded-control px-3 py-2 type-metadata text-ink-secondary hover:text-ink-primary">
                Help &amp; Guides
              </Link>
              <Link to="/legal/privacy" className="block rounded-control px-3 py-2 type-metadata text-ink-secondary hover:text-ink-primary">
                Privacy policy
              </Link>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-surface-paper-edge" onClick={() => setOpen(false)}>
            {isAuthenticated ? (
              <Link
                to="/library"
                className="flex w-full items-center justify-center gap-2 rounded-control bg-brand px-4 py-3 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
              >
                <span>Go to Yueora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-control bg-brand px-4 py-3 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
                >
                  <span>Start playing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center rounded-control border border-surface-paper-edge bg-surface-paper px-4 py-2.5 text-xs font-medium text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
