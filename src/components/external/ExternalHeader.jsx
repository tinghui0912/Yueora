import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/brand/Logo';

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
          <Link to="/" aria-label="Yueora home" className="inline-flex">
            <Logo variant="compact" size="md" />
          </Link>
          {sharedBy && (
            <span className="hidden text-sm text-ink-tertiary sm:inline">Shared by {sharedBy}</span>
          )}
        </div>
        {isAuthenticated ? (
          <Link to="/library" className="rounded-control bg-brand px-4 py-2 type-body-small font-semibold text-brand-foreground shadow-raised hover:bg-brand-hover">Open library</Link>
        ) : (
          <Link to="/login" className="rounded-control border border-line-subtle px-4 py-2 type-body-small font-semibold text-ink-primary hover:bg-neutral-hover">Log in</Link>
        )}
      </div>
    </header>
  );
}