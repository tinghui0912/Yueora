import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Ban, LogIn, AlertTriangle, UserX } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { useAuth } from '@/lib/AuthContext';
import ExternalShell from '@/components/external/ExternalShell';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import StateMessage from '@/components/patterns/StateMessage';

export default function InviteAcceptance() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const scores = usePrototypeStore((s) => s.scores);
  const invitations = usePrototypeStore((s) => s.invitations);
  const acceptInvitation = usePrototypeStore((s) => s.acceptInvitation);
  const declineInvitation = usePrototypeStore((s) => s.declineInvitation);

  // Find invitation from store
  const invitation = invitations.find((i) => i.token === inviteToken);

  // Fallback demo tokens
  let status = 'valid';
  if (inviteToken?.includes('expired')) status = 'expired';
  else if (inviteToken?.includes('revoked')) status = 'revoked';
  else if (inviteToken?.includes('accepted')) status = 'already_accepted';
  else if (inviteToken?.includes('wrong')) status = 'wrong_account';

  // Determine status from store invitation
  if (invitation) {
    if (invitation.status === 'accepted') status = 'already_accepted';
    else if (invitation.status === 'declined') status = 'declined';
    else if (invitation.status === 'revoked') status = 'revoked';
  }

  const score = invitation ? scores.find((s) => s.id === invitation.scoreId) : scores.find((s) => s.ownership === 'shared') || scores[0];
  const invitedBy = invitation?.invitedBy || 'Alice';
  const invitedEmail = invitation?.invitedEmail || 'you@example.com';
  const permission = invitation?.permission || 'Can edit';

  const accept = () => {
    if (invitation) {
      acceptInvitation(inviteToken);
    }
    // Read the updated invitation to get the shared score id
    const updated = usePrototypeStore.getState().invitations.find((i) => i.token === inviteToken);
    const targetId = updated?.sharedScoreId || score?.id;
    toast({ title: 'Invitation accepted', description: `${score?.title || 'Score'} is now in Shared with me.` });
    if (targetId) {
      navigate(`/score/${targetId}`);
    } else {
      navigate('/library');
    }
  };

  const decline = () => {
    if (invitation) {
      declineInvitation(inviteToken);
    }
    toast({ title: 'Invitation declined' });
    navigate('/');
  };

  const wrongAccount = isAuthenticated && user?.email !== invitedEmail && invitedEmail !== 'you@example.com';

  return (
    <ExternalShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center md:px-8">
        {status === 'valid' && (
          <>
            <p className="type-body-small text-ink-secondary">{invitedBy} invited you to</p>
            <h1 className="mt-1 type-page-title">{score?.title || 'Score'}</h1>
            <p className="mt-1 type-body-small text-ink-secondary">{score?.composer}</p>
            <span className="mt-4 rounded-control border border-line-subtle bg-surface-panel px-3 py-1.5 type-body-small font-medium text-ink-primary">{permission}</span>

            {isAuthenticated ? (
              wrongAccount ? (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex items-start gap-2 rounded-control border border-line-subtle bg-neutral-muted/50 p-3 text-left text-ink-primary">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <p className="type-body-small text-ink-secondary">This invitation was sent to <strong>{invitedEmail}</strong>, but you are signed in as <strong>{user?.email}</strong>. Switch accounts to accept it.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button intent="secondary" onClick={() => navigate(`/login?returnTo=/invite/${inviteToken}`)}>Switch account</Button>
                    <Button intent="quiet" onClick={decline}>Decline</Button>
                  </div>
                </div>
              ) : (
                <Button intent="primary" size="lg" onClick={accept} className="mt-8"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Accept invitation</Button>
              )
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button intent="primary" size="lg" onClick={() => navigate(`/login?returnTo=/invite/${inviteToken}`)}><LogIn className="mr-1.5 h-4 w-4" /> Continue to log in</Button>
                <p className="type-body-small text-ink-secondary">You will return here to accept after logging in.</p>
                <Link to={`/register?returnTo=/invite/${inviteToken}`} className="type-body-small font-medium text-brand hover:underline">Don't have an account? Sign up</Link>
              </div>
            )}
            <Button intent="quiet" size="sm" onClick={decline} className="mt-4">Decline invitation</Button>
          </>
        )}

        {status === 'wrong_account' && (
          <>
            <StateMessage tone="warning" icon={UserX} title="This invitation is not for this account" description={`It was sent to ${invitedEmail}. Sign in with that email to accept.`} />
            <div className="mt-6 flex gap-2">
              <Button intent="secondary" onClick={() => navigate('/login')}>Switch account</Button>
              <Button intent="quiet" onClick={decline}>Decline</Button>
            </div>
          </>
        )}
        {status === 'expired' && <StateMessage tone="warning" icon={Clock} title="This invitation has expired" description="Ask the owner to send you a new invitation." />}
        {status === 'revoked' && <StateMessage tone="warning" icon={Ban} title="This invitation was revoked" description="The owner no longer shares this score with you." />}
        {status === 'declined' && (
          <>
            <StateMessage tone="neutral" icon={Ban} title="Invitation declined" description="You declined this invitation. It will not appear again." />
            <Button intent="secondary" onClick={() => navigate('/')} className="mt-6">Back to home</Button>
          </>
        )}
        {status === 'already_accepted' && (
          <div className="flex flex-col items-center gap-4">
            <StateMessage tone="success" icon={CheckCircle2} title="You already accepted this" description="This score is in your library under Shared with me." />
            <Button intent="secondary" onClick={() => navigate('/library?view=shared')}>Go to Shared with me</Button>
          </div>
        )}
      </div>
    </ExternalShell>
  );
}