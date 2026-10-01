import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
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
    <div className="space-y-6">
      <Section title="Profile" desc="Your name and email as shown across Yueora.">
        <div className="max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            {account.avatar ? (
              <img src={account.avatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">{name.slice(0, 1).toUpperCase()}</div>
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
            <p className="text-sm text-muted-foreground">Google · email verification on file</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save}>Save changes</Button>
            {saved && <span className="text-sm text-primary">Saved</span>}
          </div>
        </div>
      </Section>

      <Section title="Language & region" desc="Interface language and regional formatting.">
        <div className="max-w-sm space-y-1.5">
          <Label htmlFor="lang">Language</Label>
          <select id="lang" className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
            <option>English</option>
            <option>中文</option>
          </select>
          <p className="text-xs text-muted-foreground">Some pages may not be fully translated yet.</p>
        </div>
      </Section>

      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-md border border-border bg-card p-5">
            <h3 className="font-display text-lg font-medium">Change email</h3>
            <p className="mt-1 text-sm text-muted-foreground">We'll send a verification link to your new address.</p>
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="newemail">New email</Label>
              <Input id="newemail" type="email" placeholder="you@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            {emailSent && <p className="mt-2 text-sm text-primary">Verification sent — updating your email now.</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailModal(false)}>Cancel</Button>
              <Button onClick={sendVerification} disabled={!newEmail.trim() || emailSent}>{emailSent ? 'Sent' : 'Send verification'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h2 className="font-display text-lg font-medium">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}