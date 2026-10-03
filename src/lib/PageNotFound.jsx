import { Music2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import StateMessage from '@/components/patterns/StateMessage';

export default function PageNotFound() {
  const { isAuthenticated } = useAuth();
  const home = isAuthenticated ? '/library' : '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas px-4">
      <StateMessage
        tone="neutral"
        icon={Music2}
        title="Page not found"
        description="This page may have moved, or the link may be incorrect."
        primaryAction={
          <Button onClick={() => { window.location.href = home; }}>
            Back to Yueora
          </Button>
        }
      />
    </div>
  );
}