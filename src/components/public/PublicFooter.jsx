import { Link } from 'react-router-dom';

/**
 * PublicFooter — shared marketing/help/legal footer.
 * Global navigation + legal links only. No page-specific CTAs.
 */
export default function PublicFooter() {
  return (
    <footer className="shrink-0 border-t border-line-subtle">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-ink-tertiary md:flex-row md:px-8">
        <span>© 2026 Yueora</span>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link to="/about" className="hover:text-ink-primary">About</Link>
          <Link to="/pricing" className="hover:text-ink-primary">Pricing</Link>
          <Link to="/help" className="hover:text-ink-primary">Help</Link>
          <Link to="/legal/terms" className="hover:text-ink-primary">Terms</Link>
          <Link to="/legal/privacy" className="hover:text-ink-primary">Privacy</Link>
          <Link to="/legal/acceptable-use" className="hover:text-ink-primary">Acceptable Use</Link>
          <Link to="/legal/copyright" className="hover:text-ink-primary">Copyright</Link>
        </nav>
      </div>
    </footer>
  );
}