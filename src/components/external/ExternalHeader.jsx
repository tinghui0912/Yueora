import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

/**
 * ExternalHeader — compact header for shared score / invite pages.
 * No marketing navigation (About/Pricing/Help). Just brand + auth CTA.
 */
export default function ExternalHeader({ sharedBy }) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="shrink-0 border-b border-line-subtle">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-xl tracking-tight text-ink-primary">Yueora</Link>
          {sharedBy && (
            <span className="hidden text-sm text-ink-tertiary sm:inline">Shared by {sharedBy}</span>
          )}
        </div>
        {isAuthenticated ? (
          <Link to="/library" className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Open library</Link>
        ) : (
          <Link to="/login" className="rounded-control border border-line-subtle px-4 py-2 text-sm font-semibold text-ink-primary hover:bg-accent">Log in</Link>
        )}
      </div>
    </header>
  );
}