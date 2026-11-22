import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';

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
          <Button asChild intent="primary" size="sm">
            <Link to="/library">Open library</Link>
          </Button>
        ) : (
          <Button asChild intent="secondary" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}