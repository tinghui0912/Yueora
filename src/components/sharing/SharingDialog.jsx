import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Send, Link2, MoreHorizontal, RefreshCw, Ban, Clock } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { canInviteEditors } from '@/lib/commercialEntitlements';
import { checkoutPath } from '@/lib/commercial';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { useToast } from '@/components/ui/use-toast';

const expirations = [
  { v: 'Never', label: 'Never' },
  { v: '24 hours', label: '24 hours' },
  { v: '7 days', label: '7 days' },
  { v: '30 days', label: '30 days' },
];

function defaultSharingData(score) {
  return {
    scoreId: score.id,
    title: score.title,
    people: [{ id: 'you', name: 'You', email: 'you@example.com', role: 'Owner' }],
    link: { access: 'Off', practice: false, expiration: 'Never', enabled: false },
  };
}

export default function SharingDialog({ score, open, onOpenChange }) {
  const { toast } = useToast();
  const storeSharing = usePrototypeStore((s) => (score ? s.sharing[score.id] : null));
  const sharing = storeSharing || (score ? defaultSharingData(score) : null);
  const invitePerson = usePrototypeStore((s) => s.invitePerson);
  const changeMemberRole = usePrototypeStore((s) => s.changeMemberRole);
  const removeMember = usePrototypeStore((s) => s.removeMember);
  const resendInvitation = usePrototypeStore((s) => s.resendInvitation);
  const revokeInvitation = usePrototypeStore((s) => s.revokeInvitation);
  const setLinkAccess = usePrototypeStore((s) => s.setLinkAccess);
  const setLinkPractice = usePrototypeStore((s) => s.setLinkPractice);
  const setLinkExpiration = usePrototypeStore((s) => s.setLinkExpiration);
  const disableLink = usePrototypeStore((s) => s.disableLink);
  const regenerateLink = usePrototypeStore((s) => s.regenerateLink);
  const invitations = usePrototypeStore((s) => s.invitations);
  const subscription = usePrototypeStore((s) => s.subscription);
  const canEdit = canInviteEditors(subscription?.plan);

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Can view');
  const [copied, setCopied] = useState(false);
  const [linkSettingsOpen, setLinkSettingsOpen] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!sharing || !score) return null;

  const sendInvite = () => {
    if (!email.trim()) return;
    invitePerson(score.id, email.trim(), inviteRole);
    toast({ title: 'Invitation sent', description: `${email} has been invited.` });
    setEmail('');
  };

  const copyLink = () => {
    if (!sharing.link.token) return;
    const url = `${window.location.origin}/s/${sharing.link.token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDisable = () => {
    disableLink(score.id);
    setConfirmDisable(false);
    toast({ title: 'Link disabled', description: 'No one can access this score via the link.' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg gap-0 p-0">
          <DialogHeader className="border-b border-line-subtle px-5 py-4">
            <DialogTitle>Share “{sharing.title}”</DialogTitle>
            <DialogDescription className="type-body-small text-ink-secondary">Decide who can access this score.</DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4">
            <p className="type-label text-ink-primary">Add people</p>
            <div className="mt-2 flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
              />
              <Select
                value={inviteRole}
                onValueChange={(v) => {
                  if (v === 'Can edit' && !canEdit) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setInviteRole(v);
                }}
              >
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Can view">Can view</SelectItem>
                  <SelectItem value="Can edit">{canEdit ? 'Can edit' : 'Can edit · Plus'}</SelectItem>
                </SelectContent>
              </Select>
              <IconButton icon={Send} label="Send invite" tone="primary" size="md" onClick={sendInvite} />
            </div>

            <p className="mt-5 type-label text-ink-primary">People</p>
            <div className="mt-2 divide-y divide-line-subtle rounded-control border border-line-subtle bg-surface-panel">
              {sharing.people.map((person) => (
                <div key={person.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate type-body-small font-medium text-ink-primary">{person.name}</p>
                    {person.email && person.email !== person.name && <p className="truncate type-caption text-ink-secondary">{person.email}</p>}
                    {person.resentAt && <p className="type-caption text-brand">Invitation resent</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {person.role === 'Owner' ? (
                      <span className="type-caption text-ink-tertiary">Owner</span>
                    ) : person.role === 'Invitation pending' ? (
                      <>
                        <span className="type-caption text-warning">Pending · {person.pendingRole || 'Can view'}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-control p-1 text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => { resendInvitation(score.id, person.id); toast({ title: 'Invitation resent', description: person.email }); }}>
                              Resend invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const inv = invitations.find((i) => i.personId === person.id);
                              if (inv) {
                                const url = `${window.location.origin}/invite/${inv.token}`;
                                navigator.clipboard?.writeText(url).catch(() => {});
                                toast({ title: 'Invitation link copied', description: url });
                              }
                            }}>
                              <Link2 className="mr-2 h-3.5 w-3.5" /> Copy invitation link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const inv = invitations.find((i) => i.personId === person.id);
                              if (inv) window.open(`/invite/${inv.token}`, '_blank');
                            }}>
                              Preview invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const nextRole = person.pendingRole === 'Can view' ? 'Can edit' : 'Can view';
                              if (nextRole === 'Can edit' && !canEdit) {
                                setShowUpgradeModal(true);
                                return;
                              }
                              changeMemberRole(score.id, person.id, nextRole);
                              toast({ title: 'Role changed' });
                            }}>
                              Change to {person.pendingRole === 'Can view' ? (canEdit ? 'Can edit' : 'Can edit · Plus') : 'Can view'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger/10" onClick={() => { revokeInvitation(score.id, person.id); toast({ title: 'Invitation revoked', description: person.email }); }}>
                              Revoke invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <>
                        <span className="type-caption text-ink-primary">{person.role}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-control p-1 text-ink-secondary hover:bg-neutral-hover hover:text-ink-primary">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => {
                              const nextRole = person.role === 'Can view' ? 'Can edit' : 'Can view';
                              if (nextRole === 'Can edit' && !canEdit) {
                                setShowUpgradeModal(true);
                                return;
                              }
                              changeMemberRole(score.id, person.id, nextRole);
                              toast({ title: 'Role changed' });
                            }}>
                              Change to {person.role === 'Can view' ? (canEdit ? 'Can edit' : 'Can edit · Plus') : 'Can view'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger/10" onClick={() => { removeMember(score.id, person.id); toast({ title: 'Access removed', description: person.email }); }}>
                              Remove access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-line-subtle" />

            <p className="type-label text-ink-primary">General access</p>
            <div className="mt-2 rounded-control border border-line-subtle bg-surface-panel">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Link2 className="h-4 w-4 text-ink-secondary" />
                  <span className="type-body-small text-ink-primary">Anyone with the link</span>
                </div>
                <Select
                  value={sharing.link.access}
                  onValueChange={(v) => {
                    if (v === 'Can edit' && !canEdit) {
                      setShowUpgradeModal(true);
                      return;
                    }
                    setLinkAccess(score.id, v);
                  }}
                >
                  <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Can view">Can view</SelectItem>
                    <SelectItem value="Can edit">{canEdit ? 'Can edit' : 'Can edit · Plus'}</SelectItem>
                    <SelectItem value="Off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {sharing.link.access === 'Can edit' && (
                <div className="flex items-center gap-2 border-t border-line-subtle bg-warning/10 px-3 py-2">
                  <span className="type-caption text-warning">Anyone with this link can edit.</span>
                </div>
              )}
              {sharing.link.access !== 'Off' && (
                <>
                  <div className="flex items-center justify-between border-t border-line-subtle px-3 py-2.5">
                    <span className="type-body-small text-ink-primary">Practice</span>
                    <Switch checked={sharing.link.practice} onCheckedChange={(v) => setLinkPractice(score.id, v)} />
                  </div>
                  <div className="flex items-center justify-between border-t border-line-subtle px-3 py-2.5">
                    <span className="flex items-center gap-1.5 type-body-small text-ink-primary">
                      <Clock className="h-3.5 w-3.5 text-ink-secondary" /> Expiration
                    </span>
                    <span className="type-caption text-ink-secondary">{sharing.link.expiration}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              {sharing.link.access !== 'Off' && sharing.link.token ? (
                <Button variant="outline" onClick={copyLink} className="flex-1">
                  {copied ? <Check className="mr-1.5 h-4 w-4 text-brand" /> : <Copy className="mr-1.5 h-4 w-4" />}
                  {copied ? 'Link copied' : 'Copy link'}
                </Button>
              ) : (
                <p className="flex-1 type-body-small text-ink-secondary">Turn on link sharing to copy a link.</p>
              )}
              <Button variant="outline" onClick={() => setLinkSettingsOpen(true)}>Link settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link settings dialog */}
      <Dialog open={linkSettingsOpen} onOpenChange={setLinkSettingsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Link settings</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="type-label text-ink-primary">Expiration</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {expirations.map((e) => (
                  <button
                    key={e.v}
                    onClick={() => { setLinkExpiration(score.id, e.v); toast({ title: 'Expiration set', description: e.label }); }}
                    className={`rounded-control border px-3 py-2 type-body-small transition-colors ${
                      sharing.link.expiration === e.v
                        ? 'border-brand bg-brand-soft text-brand-soft-foreground font-medium'
                        : 'border-line-subtle text-ink-primary hover:bg-neutral-hover'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-control border border-line-subtle bg-surface-panel px-3 py-2.5">
              <span className="type-body-small text-ink-primary">Allow practice</span>
              <Switch checked={sharing.link.practice} onCheckedChange={(v) => setLinkPractice(score.id, v)} />
            </div>
            <div className="flex gap-2 border-t border-line-subtle pt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { regenerateLink(score.id); toast({ title: 'Link regenerated', description: 'The old link no longer works.' }); }}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-danger hover:bg-danger/10 hover:text-danger" onClick={() => setConfirmDisable(true)}>
                <Ban className="mr-1.5 h-3.5 w-3.5" /> Disable
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setLinkSettingsOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade modal for collaborative editing */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collaborative editing requires Plus</DialogTitle>
          </DialogHeader>
          <p className="type-body-small text-ink-secondary">
            Free accounts include view-only sharing. Upgrade to Plus or Pro to invite collaborators who can edit fingering, dynamics, and annotations directly with you.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Maybe later
            </Button>
            <Button asChild onClick={() => setShowUpgradeModal(false)}>
              <Link to={checkoutPath('plus', 'monthly')}>
                Upgrade to Plus · $3 / mo
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable confirmation */}
      <Dialog open={confirmDisable} onOpenChange={setConfirmDisable}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Disable link?</DialogTitle></DialogHeader>
          <p className="type-body-small text-ink-secondary">No one will be able to access this score via the link. You can turn it back on anytime.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDisable(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDisable}>Disable link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
