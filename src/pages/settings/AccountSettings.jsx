import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export default function AccountSettings() {
  const { user } = useAuth();
  const account = usePrototypeStore((s) => s.account);
  const setAvatar = usePrototypeStore((s) => s.setAvatar);
  const updateEmail = usePrototypeStore((s) => s.updateEmail);
  const [name, setName] = useState(user?.full_name || 'You');
  const [saved, setSaved] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const fileRef = useRef(null);

  const save = async () => {
    try { await base44.auth.updateMe({ full_name: name }); } catch { /* mock */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const sendVerification = () => {
    if (!newEmail.trim()) return;
    updateEmail(newEmail.trim());
    setEmailSent(true);
    setTimeout(() => { setEmailModal(false); setEmailSent(false); setNewEmail(''); }, 1500);
  };

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection title="Profile" desc="Your name and email as shown across Yueora.">
        <div className="max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            {account.avatar ? (
              <img src={account.avatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-medium">{name.slice(0, 1).toUpperCase()}</div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Camera className="mr-1.5 h-4 w-4" /> Change avatar
            </Button>
            {account.avatar && (
              <Button variant="ghost" size="sm" onClick={() => setAvatar(null)}>Remove</Button>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Input id="email" value={account.email} disabled />
              <Button variant="outline" size="sm" onClick={() => setEmailModal(true)}>Change</Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Login method</Label>
            <p className="type-body-small text-ink-secondary">Google · email verification on file</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save}>Save changes</Button>
            {saved && <span className="type-body-small text-brand">Saved</span>}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Language & region" desc="Interface language and regional formatting.">
        <div className="max-w-sm space-y-1.5">
          <Label htmlFor="lang">Language</Label>
          <select id="lang" className="h-9 w-full rounded-control border border-line-subtle bg-surface-panel px-3 type-body-small text-ink-primary">
            <option>English</option>
            <option>中文</option>
          </select>
          <p className="type-metadata text-ink-tertiary">Some pages may not be fully translated yet.</p>
        </div>
      </SettingsSection>

      <Dialog open={emailModal} onOpenChange={setEmailModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Change email</DialogTitle></DialogHeader>
          <p className="text-sm text-ink-secondary">We'll send a verification link to your new address.</p>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="newemail">New email</Label>
            <Input id="newemail" type="email" placeholder="you@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          {emailSent && <p className="mt-2 text-sm text-brand">Verification sent — updating your email now.</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModal(false)}>Cancel</Button>
            <Button onClick={sendVerification} disabled={!newEmail.trim() || emailSent}>{emailSent ? 'Sent' : 'Send verification'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}