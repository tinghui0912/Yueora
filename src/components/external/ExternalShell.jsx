import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ExternalShell({ sharedBy, children }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl tracking-tight">NoteVerse</span>
          {sharedBy && (
            <span className="hidden text-sm text-muted-foreground sm:inline">Shared by {sharedBy}</span>
          )}
        </div>
        {!isAuthenticated ? (
          <Link to="/login" className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
            Log in
          </Link>
        ) : (
          <Link to="/library" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Open library
          </Link>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}