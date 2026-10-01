import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Ban, LogIn, AlertTriangle, UserX } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { useAuth } from '@/lib/AuthContext';
import ExternalShell from '@/components/external/ExternalShell';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function InviteAcceptance() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const scores = usePrototypeStore((s) => s.scores);

  // Determine status from token
  let status = 'valid';
  if (inviteToken?.includes('expired')) status = 'expired';
  else if (inviteToken?.includes('revoked')) status = 'revoked';
  else if (inviteToken?.includes('accepted')) status = 'already_accepted';
  else if (inviteToken?.includes('wrong')) status = 'wrong_account';

  const score = scores.find((s) => s.id === inviteToken) || scores.find((s) => s.ownership === 'shared') || scores[0];
  const invitedBy = 'Alice';
  const invitedEmail = 'you@example.com';
  const permission = 'Can edit';

  const accept = () => {
    toast({ title: 'Invitation accepted', description: `${score.title} is now in Shared with me.` });
    navigate(`/score/${score.id}`);
  };

  const decline = () => {
    toast({ title: 'Invitation declined' });
    navigate('/');
  };

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
              user?.email === invitedEmail || !invitedEmail ? (
                <Button onClick={accept} className="mt-8 bg-primary px-6 text-primary-foreground"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Accept invitation</Button>
              ) : (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex items-start gap-2 rounded-md border border-gold/40 bg-gold/10 p-3 text-left">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-gold" />
                    <p className="text-sm text-muted-foreground">This invitation was sent to <strong>{invitedEmail}</strong>, but you’re signed in as <strong>{user?.email}</strong>. Switch accounts to accept it.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/login')}>Switch account</Button>
                    <Button variant="ghost" onClick={decline}>Decline</Button>
                  </div>
                </div>
              )
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button onClick={() => navigate(`/login?returnTo=/invite/${inviteToken}`)} className="bg-primary px-6 text-primary-foreground"><LogIn className="mr-1.5 h-4 w-4" /> Continue to log in</Button>
                <p className="text-sm text-muted-foreground">You’ll return here to accept after logging in.</p>
                <Link to={`/register?returnTo=/invite/${inviteToken}`} className="text-sm font-medium text-primary hover:underline">Don’t have an account? Sign up</Link>
              </div>
            )}
          </>
        )}

        {status === 'wrong_account' && (
          <>
            <StateCard icon={UserX} title="This invitation isn’t for this account" body={`It was sent to ${invitedEmail}. Sign in with that email to accept.`} />
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => navigate('/login')}>Switch account</Button>
              <Button variant="ghost" onClick={decline}>Decline</Button>
            </div>
          </>
        )}
        {status === 'expired' && <StateCard icon={Clock} title="This invitation has expired" body="Ask the owner to send you a new invitation." />}
        {status === 'revoked' && <StateCard icon={Ban} title="This invitation was revoked" body="The owner no longer shares this score with you." />}
        {status === 'already_accepted' && (
          <div className="flex flex-col items-center gap-4">
            <StateCard icon={CheckCircle2} title="You already accepted this" body="This score is in your library under Shared with me." />
            <Button variant="outline" onClick={() => navigate('/library?view=shared')}>Go to Shared with me</Button>
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