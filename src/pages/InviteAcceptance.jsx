import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Ban, LogIn } from 'lucide-react';
import { getInvite } from '@/lib/mockData';
import { useAuth } from '@/lib/AuthContext';
import ExternalShell from '@/components/external/ExternalShell';
import { Button } from '@/components/ui/button';

export default function InviteAcceptance() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const invite = getInvite(inviteToken);
  const { score, invitedBy, permission, status } = invite;

  const accept = () => navigate(`/score/${score.id}`);

  return (
    <ExternalShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center md:px-8">
        {status === 'valid' && (
          <>
            <p className="text-sm text-muted-foreground">{invitedBy} invited you to</p>
            <h1 className="mt-1 font-display text-3xl font-medium">{score.title}</h1>
            <p className="mt-1 text-muted-foreground">{score.composer}</p>
            <span className="mt-4 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">{permission}</span>

            {isAuthenticated ? (
              <Button onClick={accept} className="mt-8 bg-primary px-6 text-primary-foreground">
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Accept invitation
              </Button>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button onClick={() => navigate('/login')} className="bg-primary px-6 text-primary-foreground">
                  <LogIn className="mr-1.5 h-4 w-4" /> Continue to log in
                </Button>
                <p className="text-sm text-muted-foreground">You'll return here to accept after logging in.</p>
              </div>
            )}
          </>
        )}

        {status === 'expired' && (
          <StateCard icon={Clock} title="This invitation has expired" body="Ask the owner to send you a new invitation." />
        )}
        {status === 'revoked' && (
          <StateCard icon={Ban} title="This invitation was revoked" body="The owner no longer shares this score with you." />
        )}
        {status === 'already_accepted' && (
          <div className="flex flex-col items-center gap-4">
            <StateCard icon={CheckCircle2} title="You already accepted this" body="This score is in your library under Shared with me." />
            <Button onClick={() => navigate('/library?view=shared')} variant="outline">Go to Shared with me</Button>
          </div>
        )}
      </div>
    </ExternalShell>
  );
}

function StateCard({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <h1 className="font-display text-2xl font-medium">{title}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
    </div>
  );
}