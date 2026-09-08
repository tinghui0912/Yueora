import { useState } from 'react';
import { Copy, Check, Send, Link2, MoreHorizontal } from 'lucide-react';
import { getSharing } from '@/lib/mockData';
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
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SharingDialog({ score, open, onOpenChange }) {
  const sharing = getSharing(score?.id);
  const [people, setPeople] = useState(sharing.people);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Can view');
  const [linkAccess, setLinkAccess] = useState(sharing.link.access);
  const [download, setDownload] = useState(sharing.link.download);
  const [practice, setPractice] = useState(sharing.link.practice);
  const [copied, setCopied] = useState(false);

  const sendInvite = () => {
    if (!email.trim()) return;
    setPeople((p) => [...p, { id: Date.now(), name: email, email, role: 'Invitation pending' }]);
    setEmail('');
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://noteverse.app/s/${score?.id || 'token'}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-display text-lg font-medium">
            Share “{sharing.title}”
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Decide who can access this score.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          <p className="text-sm font-medium">Add people</p>
          <div className="mt-2 flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Can view">Can view</SelectItem>
                <SelectItem value="Can edit">Can edit</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={sendInvite} size="icon" aria-label="Send invite">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-5 text-sm font-medium">People</p>
          <div className="mt-2 divide-y divide-border rounded-md border border-border">
            {people.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  {person.email && person.email !== person.name && (
                    <p className="truncate text-xs text-muted-foreground">{person.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${person.role === 'Invitation pending' ? 'text-gold' : person.role === 'Owner' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {person.role}
                  </span>
                  {person.role !== 'Owner' && (
                    <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
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
              <Select value={linkAccess} onValueChange={setLinkAccess}>
                <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Can view">Can view</SelectItem>
                  <SelectItem value="Can edit">Can edit</SelectItem>
                  <SelectItem value="Off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {linkAccess !== 'Off' && (
              <>
                <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                  <span className="text-sm">Download</span>
                  <Switch checked={download} onCheckedChange={setDownload} />
                </div>
                <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                  <span className="text-sm">Practice</span>
                  <Switch checked={practice} onCheckedChange={setPractice} />
                </div>
                <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                  <span className="text-sm">Expiration</span>
                  <span className="text-sm text-muted-foreground">Never</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={copyLink} className="flex-1">
              {copied ? <Check className="mr-1.5 h-4 w-4 text-primary" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? 'Link copied' : 'Copy link'}
            </Button>
            <Button variant="outline">Link settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}