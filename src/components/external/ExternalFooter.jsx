import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';

/**
 * ExternalFooter — lightweight footer for shared score / invite pages.
 * Only essential links: Help, Terms, Privacy. No marketing nav.
 */
export default function ExternalFooter() {
  return (
    <footer className="shrink-0 border-t border-line-subtle">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 py-5 text-sm text-ink-tertiary md:flex-row md:px-8">
        <span className="flex items-center gap-2">
          <Logo variant="mark" size="sm" className="text-ink-tertiary" label="Yueora" />
          © 2026 Yueora
        </span>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link to="/help" className="hover:text-ink-primary">Help</Link>
          <Link to="/legal/terms" className="hover:text-ink-primary">Terms</Link>
          <Link to="/legal/privacy" className="hover:text-ink-primary">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}