import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/brand/Logo';

/**
 * PublicMobileMenu — lightweight mobile nav for Landing and ExternalShell.
 * Contains: About, Pricing, Help, Log in / Open library.
 */
export default function PublicMobileMenu() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-control p-2 text-ink-secondary hover:bg-accent sm:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader><SheetTitle><Logo variant="full" size="sm" /></SheetTitle></SheetHeader>
          <nav className="mt-4 flex flex-col gap-1" onClick={() => setOpen(false)}>
            <Link to="/about" className="rounded-control px-3 py-2.5 type-body-small text-ink-secondary hover:bg-accent">About</Link>
            <Link to="/pricing" className="rounded-control px-3 py-2.5 type-body-small text-ink-secondary hover:bg-accent">Pricing</Link>
            <Link to="/help" className="rounded-control px-3 py-2.5 type-body-small text-ink-secondary hover:bg-accent">Help</Link>
            <div className="my-2 border-t border-line-subtle" />
            {isAuthenticated ? (
              <Link to="/library" className="rounded-control bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground">Open library</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-control px-3 py-2.5 text-center text-sm font-semibold text-ink-primary hover:bg-accent">Log in</Link>
                <Link to="/register" className="rounded-control bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground">Start playing</Link>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}