import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Camera, Check, Mail } from 'lucide-react';

export default function AccountSettings() {
  const { user } = useAuth();
  const account = usePrototypeStore((s) => s.account);
  const setAvatar = usePrototypeStore((s) => s.setAvatar);
  const setDisplayName = usePrototypeStore((s) => s.setDisplayName);
  const setPendingEmail = usePrototypeStore((s) => s.setPendingEmail);
  const confirmPendingEmail = usePrototypeStore((s) => s.confirmPendingEmail);
  const cancelPendingEmail = usePrototypeStore((s) => s.cancelPendingEmail);
  const resendEmailVerification = usePrototypeStore((s) => s.resendEmailVerification);

  const isGoogleUser = Boolean(user?.google_id || user?.provider === 'google' || account?.provider === 'google');
  const [name, setName] = useState(account?.displayName || user?.full_name || 'You');
  const [saved, setSaved] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resendNotified, setResendNotified] = useState(false);
  const fileRef = useRef(null);

  const save = async () => {
    try { await base44.auth.updateMe({ full_name: name }); } catch { /* mock */ }
    setDisplayName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendVerification = () => {
    if (!newEmail.trim() || newEmail.trim() === account.email) return;
    setPendingEmail(newEmail.trim());
    setEmailSent(true);
    setTimeout(() => {
      setEmailModal(false);
      setEmailSent(false);
      setNewEmail('');
    }, 1200);
  };

  const handleResend = () => {
    resendEmailVerification();
    setResendNotified(true);
    setTimeout(() => setResendNotified(false), 3000);
  };

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection title="Profile" desc="Your name and email as shown across Yueora.">
        <div className="max-w-md space-y-5">
          {/* Avatar row */}
          <div className="flex items-center gap-3">
            {account.avatar ? (
              <img src={account.avatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover border border-line-subtle" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-medium">
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            <Button intent="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Camera className="mr-1.5 icon-xs" /> Change avatar
            </Button>
            {account.avatar && (
              <Button intent="quiet" size="sm" onClick={() => setAvatar(null)}>Remove</Button>
            )}
          </div>

          {/* Display Name */}
          <Field label="Display name" htmlFor="name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          {/* Email row */}
          <Field label="Email" htmlFor="email">
            <div className="flex items-center gap-2">
              <Input id="email" value={account.email} disabled />
              <Button intent="secondary" size="sm" onClick={() => setEmailModal(true)}>Change</Button>
            </div>
          </Field>

          {/* Pending email banner if email change is in flight */}
          {account.pendingEmail && (
            <div className="rounded-container border border-line-subtle bg-surface-panel p-3.5 space-y-2">
              <div className="flex items-start gap-2.5">
                <Mail className="icon-xs text-ink-secondary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="type-body-small font-medium text-ink-primary">
                    Pending verification for {account.pendingEmail}
                  </p>
                  <p className="type-metadata text-ink-secondary">
                    We sent a confirmation link. Your primary email will update once confirmed.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Button intent="quiet" size="xs" onClick={handleResend}>
                  {resendNotified ? 'Link resent' : 'Resend link'}
                </Button>
                {import.meta.env.DEV && (
                  <Button intent="quiet" size="xs" onClick={confirmPendingEmail}>
                    Simulate confirm
                  </Button>
                )}
                <Button intent="quiet" size="xs" onClick={cancelPendingEmail} className="text-ink-tertiary hover:text-ink-primary">
                  Cancel change
                </Button>
              </div>
            </div>
          )}

          {/* Login provider */}
          <div className="space-y-1">
            <p className="type-label text-ink-primary">Login provider</p>
            <p className="type-body-small text-ink-secondary">
              {isGoogleUser ? 'Google Authentication' : 'Email and password'} · email verification on file
            </p>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={save}>Save changes</Button>
            {saved && (
              <span className="flex items-center gap-1 type-body-small text-brand">
                <Check className="icon-xs" /> Saved
              </span>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Change Email Dialog */}
      <Dialog open={emailModal} onOpenChange={setEmailModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change email address</DialogTitle>
          </DialogHeader>
          <p className="type-body-small text-ink-secondary">
            We will dispatch a verification link to your new address. Your account remains reachable at {account.email} until confirmed.
          </p>
          <div className="mt-3">
            <Field label="New email" htmlFor="newemail" required>
              <Input
                id="newemail"
                type="email"
                placeholder="you@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>
          </div>
          {emailSent && (
            <p className="mt-2 type-metadata text-brand flex items-center gap-1">
              <Check className="icon-xs" /> Verification link sent. Check your inbox.
            </p>
          )}
          <DialogFooter>
            <Button intent="secondary" onClick={() => setEmailModal(false)}>Cancel</Button>
            <Button onClick={handleSendVerification} disabled={!newEmail.trim() || newEmail.trim() === account.email || emailSent}>
              {emailSent ? 'Sent' : 'Send verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
