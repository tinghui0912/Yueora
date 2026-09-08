import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ExternalShell({ sharedBy, children }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-xl tracking-tight">Yueora</Link>
          {sharedBy && (
            <span className="hidden text-sm text-muted-foreground sm:inline">Shared by {sharedBy}</span>
          )}
        </div>
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link to="/pricing" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline">Pricing</Link>
            <Link to="/login" className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Log in</Link>
          </div>
        ) : (
          <Link to="/library" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Open library</Link>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground md:flex-row">
          <span>© 2026 Yueora</span>
          <div className="flex gap-4">
            <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/legal/copyright" className="hover:text-foreground">Copyright</Link>
            <Link to="/help" className="hover:text-foreground">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}