import { useState } from 'react';
import { Copy, Check, Send, Link2, MoreHorizontal, RefreshCw, Ban, Clock } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
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
import { useToast } from '@/components/ui/use-toast';

const expirations = [
  { v: 'Never', label: 'Never' },
  { v: '24 hours', label: '24 hours' },
  { v: '7 days', label: '7 days' },
  { v: '30 days', label: '30 days' },
];

function defaultSharingData(score) {
  return { scoreId: score.id, title: score.title, people: [{ id: 'you', name: 'You', email: 'you@example.com', role: 'Owner' }], link: { access: 'Off', download: false, practice: false, expiration: 'Never', enabled: false } };
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
  const setLinkDownload = usePrototypeStore((s) => s.setLinkDownload);
  const setLinkPractice = usePrototypeStore((s) => s.setLinkPractice);
  const setLinkExpiration = usePrototypeStore((s) => s.setLinkExpiration);
  const disableLink = usePrototypeStore((s) => s.disableLink);
  const regenerateLink = usePrototypeStore((s) => s.regenerateLink);

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Can view');
  const [copied, setCopied] = useState(false);
  const [linkSettingsOpen, setLinkSettingsOpen] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  if (!sharing || !score) return null;

  const sendInvite = () => {
    if (!email.trim()) return;
    invitePerson(score.id, email.trim(), inviteRole);
    toast({ title: 'Invitation sent', description: `${email} has been invited.` });
    setEmail('');
  };

  const copyLink = () => {
    // Use the sharing token if available; fall back to score id for demo
    const token = sharing.link.token || score.id;
    const url = `${window.location.origin}/s/${token}`;
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
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="font-display text-lg font-medium">Share “{sharing.title}”</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Decide who can access this score.</DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4">
            <p className="text-sm font-medium">Add people</p>
            <div className="mt-2 flex gap-2">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && sendInvite()} />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Can view">Can view</SelectItem>
                  <SelectItem value="Can edit">Can edit</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={sendInvite} size="icon" aria-label="Send invite"><Send className="h-4 w-4" /></Button>
            </div>

            <p className="mt-5 text-sm font-medium">People</p>
            <div className="mt-2 divide-y divide-border rounded-md border border-border">
              {sharing.people.map((person) => (
                <div key={person.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{person.name}</p>
                    {person.email && person.email !== person.name && <p className="truncate text-xs text-muted-foreground">{person.email}</p>}
                    {person.resentAt && <p className="text-xs text-primary">Invitation resent</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {person.role === 'Owner' ? (
                      <span className="text-xs text-muted-foreground">Owner</span>
                    ) : person.role === 'Invitation pending' ? (
                      <>
                        <span className="text-xs text-gold">Pending · {person.pendingRole || 'Can view'}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 text-muted-foreground hover:bg-accent"><MoreHorizontal className="h-4 w-4" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => { resendInvitation(score.id, person.id); toast({ title: 'Invitation resent', description: person.email }); }}>Resend invitation</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { changeMemberRole(score.id, person.id, person.pendingRole === 'Can view' ? 'Can edit' : 'Can view'); toast({ title: 'Role changed' }); }}>Change to {person.pendingRole === 'Can view' ? 'Can edit' : 'Can view'}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => { revokeInvitation(score.id, person.id); toast({ title: 'Invitation revoked', description: person.email }); }}>Revoke invitation</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-foreground">{person.role}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 text-muted-foreground hover:bg-accent"><MoreHorizontal className="h-4 w-4" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => { changeMemberRole(score.id, person.id, person.role === 'Can view' ? 'Can edit' : 'Can view'); toast({ title: 'Role changed' }); }}>Change to {person.role === 'Can view' ? 'Can edit' : 'Can view'}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => { removeMember(score.id, person.id); toast({ title: 'Access removed', description: person.email }); }}>Remove access</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-border" />

            <p className="text-sm font-medium">General access</p>
            <div className="mt-2 rounded-md border border-border">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Anyone with the link</span>
                </div>
                <Select value={sharing.link.access} onValueChange={(v) => setLinkAccess(score.id, v)}>
                  <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Can view">Can view</SelectItem>
                    <SelectItem value="Can edit">Can edit</SelectItem>
                    <SelectItem value="Off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {sharing.link.access === 'Can edit' && (
                <div className="flex items-center gap-2 border-t border-border bg-gold/10 px-3 py-2">
                  <span className="text-xs text-gold">Anyone with this link can edit.</span>
                </div>
              )}
              {sharing.link.access !== 'Off' && (
                <>
                  <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                    <span className="text-sm">Download</span>
                    <Switch checked={sharing.link.download} onCheckedChange={(v) => setLinkDownload(score.id, v)} />
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                    <span className="text-sm">Practice</span>
                    <Switch checked={sharing.link.practice} onCheckedChange={(v) => setLinkPractice(score.id, v)} />
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Expiration</span>
                    <span className="text-sm text-muted-foreground">{sharing.link.expiration}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" onClick={copyLink} className="flex-1">
                {copied ? <Check className="mr-1.5 h-4 w-4 text-primary" /> : <Copy className="mr-1.5 h-4 w-4" />}
                {copied ? 'Link copied' : 'Copy link'}
              </Button>
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
              <p className="text-sm font-medium">Expiration</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {expirations.map((e) => (
                  <button key={e.v} onClick={() => { setLinkExpiration(score.id, e.v); toast({ title: 'Expiration set', description: e.label }); }} className={`rounded-md border px-3 py-2 text-sm ${sharing.link.expiration === e.v ? 'border-primary bg-accent/40 font-medium' : 'border-border hover:bg-accent'}`}>{e.label}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <span className="text-sm">Allow download</span>
              <Switch checked={sharing.link.download} onCheckedChange={(v) => setLinkDownload(score.id, v)} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <span className="text-sm">Allow practice</span>
              <Switch checked={sharing.link.practice} onCheckedChange={(v) => setLinkPractice(score.id, v)} />
            </div>
            <div className="flex gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { regenerateLink(score.id); toast({ title: 'Link regenerated', description: 'The old link no longer works.' }); }}><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate</Button>
              <Button variant="outline" size="sm" className="flex-1 text-destructive" onClick={() => setConfirmDisable(true)}><Ban className="mr-1.5 h-3.5 w-3.5" /> Disable</Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setLinkSettingsOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable confirmation */}
      <Dialog open={confirmDisable} onOpenChange={setConfirmDisable}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Disable link?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">No one will be able to access this score via the link. You can turn it back on anytime.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDisable(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDisable}>Disable link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}