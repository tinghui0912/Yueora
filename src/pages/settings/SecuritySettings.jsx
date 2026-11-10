import { useState } from 'react';
import { Monitor, Smartphone, ShieldCheck, KeyRound, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const recoveryCodes = ['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4'];

export default function SecuritySettings() {
  const account = usePrototypeStore((s) => s.account);
  const addPasskey = usePrototypeStore((s) => s.addPasskey);
  const removePasskey = usePrototypeStore((s) => s.removePasskey);
  const signOutSession = usePrototypeStore((s) => s.signOutSession);
  const signOutAllOther = usePrototypeStore((s) => s.signOutAllOther);

  const [twoFactor, setTwoFactor] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [otp, setOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [passkeyOpen, setPasskeyOpen] = useState(false);
  const [passkeyCreating, setPasskeyCreating] = useState(false);

  const changePw = (e) => { e.preventDefault(); setPwSaved(true); setTimeout(() => setPwSaved(false), 1500); };

  const startEnable = () => setSetupStep(1);
  const cancelSetup = () => setSetupStep(0);
  const verifyOtp = () => setSetupStep(3);
  const finishSetup = () => { setTwoFactor(true); setSetupStep(0); setOtp(''); };
  const disable = () => setTwoFactor(false);

  const copyCodes = () => { navigator.clipboard?.writeText(recoveryCodes.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const createPasskey = () => {
    setPasskeyCreating(true);
    setTimeout(() => {
      addPasskey(passkeyName || 'Passkey');
      setPasskeyCreating(false);
      setPasskeyOpen(false);
      setPasskeyName('');
    }, 1200);
  };

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection title="Password" desc="Choose a strong password you don't use elsewhere.">
        <form onSubmit={changePw} className="max-w-sm space-y-4">
          <div className="space-y-1.5"><Label htmlFor="cur">Current password</Label><Input id="cur" type="password" placeholder="••••••••" /></div>
          <div className="space-y-1.5"><Label htmlFor="new">New password</Label><Input id="new" type="password" /></div>
          <div className="flex items-center gap-3"><Button type="submit">Update password</Button>{pwSaved && <span className="type-body-small text-brand">Updated</span>}</div>
        </form>
      </SettingsSection>

      <SettingsSection title="Two-factor authentication" desc="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`h-5 w-5 ${twoFactor ? 'text-brand' : 'text-ink-secondary'}`} />
            <span className="type-body-small text-ink-primary">{twoFactor ? 'Enabled' : 'Disabled'}</span>
          </div>
          {twoFactor ? (
            <Button variant="outline" size="sm" onClick={disable}>Disable</Button>
          ) : (
            <Button size="sm" onClick={startEnable}>Enable 2FA</Button>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Passkeys" desc="Sign in faster with a passkey.">
        {account.passkeys.length === 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><KeyRound className="icon-md text-ink-secondary" /><span className="type-body-small text-ink-secondary">No passkeys yet</span></div>
            <Button intent="secondary" size="sm" onClick={() => setPasskeyOpen(true)}><Plus className="mr-1.5" /> Add passkey</Button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-line-subtle">
              {account.passkeys.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <KeyRound className="icon-md text-ink-secondary" />
                    <div><p className="type-body-small font-medium text-ink-primary">{p.name}</p><p className="type-caption text-ink-secondary">Added {p.addedAt}</p></div>
                  </div>
                  <Button intent="quiet" size="sm" onClick={() => removePasskey(p.id)} className="text-danger hover:text-danger hover:bg-danger/10"><Trash2 className="mr-1.5" /> Remove</Button>
                </li>
              ))}
            </ul>
            <Button intent="secondary" size="sm" className="mt-3" onClick={() => setPasskeyOpen(true)}><Plus className="mr-1.5" /> Add another</Button>
          </>
        )}
      </SettingsSection>

      <SettingsSection title="Active sessions" desc="Devices currently signed in to your account.">
        <ul className="divide-y divide-line-subtle">
          {account.sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {s.device?.includes('iPhone') ? <Smartphone className="h-5 w-5 text-ink-secondary" /> : <Monitor className="h-5 w-5 text-ink-secondary" />}
                <div><p className="type-body-small font-medium text-ink-primary">{s.device} · {s.browser}</p><p className="type-caption text-ink-secondary">{s.location}</p></div>
              </div>
              {s.current ? <span className="type-caption text-brand">This device</span> : <Button variant="ghost" size="sm" onClick={() => signOutSession(s.id)}>Sign out</Button>}
            </li>
          ))}
        </ul>
        {account.sessions.filter((s) => !s.current).length > 0 && (
          <Button variant="outline" className="mt-3" onClick={signOutAllOther}>Sign out all other sessions</Button>
        )}
      </SettingsSection>

      <SettingsSection title="Security activity" desc="Recent sign-ins and account changes.">
        <ul className="space-y-2 type-body-small">
          <li className="flex justify-between"><span>New sign-in on Chrome</span><span className="type-caption text-ink-secondary">1 day ago</span></li>
          <li className="flex justify-between"><span>Password updated</span><span className="type-caption text-ink-secondary">2 weeks ago</span></li>
        </ul>
      </SettingsSection>

      {/* 2FA setup dialog */}
      <Dialog open={setupStep > 0} onOpenChange={(o) => !o && cancelSetup()}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{setupStep === 1 ? 'Set up 2FA' : setupStep === 2 ? 'Enter code' : 'Save recovery codes'}</DialogTitle></DialogHeader>
          {setupStep === 1 && (
            <div className="space-y-3">
              <p className="type-body-small text-ink-secondary">Scan this QR code with an authenticator app like Authy or 1Password.</p>
              <div className="flex h-40 w-40 items-center justify-center rounded-control border border-line-subtle bg-surface-panel mx-auto"><span className="type-caption text-ink-secondary">QR code</span></div>
              <DialogFooter><Button onClick={() => setSetupStep(2)}>Next</Button></DialogFooter>
            </div>
          )}
          {setupStep === 2 && (
            <div className="space-y-3">
              <p className="type-body-small text-ink-secondary">Enter the 6-digit code from your app.</p>
              <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="text-center text-lg tracking-[0.4em]" />
              <DialogFooter>
                <Button variant="outline" onClick={cancelSetup}>Cancel</Button>
                <Button onClick={verifyOtp} disabled={otp.length < 6}>Verify</Button>
              </DialogFooter>
            </div>
          )}
          {setupStep === 3 && (
            <div className="space-y-3">
              <p className="type-body-small text-ink-secondary">Save these one-time recovery codes somewhere safe. You can use them if you lose your device.</p>
              <div className="rounded-control border border-line-subtle bg-neutral-muted/40 p-3 font-mono type-body-small text-ink-primary">
                {recoveryCodes.map((c) => <div key={c}>{c}</div>)}
              </div>
              <Button intent="secondary" size="sm" onClick={copyCodes} className="w-full">{copied ? <><Check className="mr-1.5 text-brand" /> Copied</> : <><Copy className="mr-1.5" /> Copy codes</>}</Button>
              <DialogFooter><Button onClick={finishSetup}>I've saved them — finish</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Passkey creation dialog */}
      <Dialog open={passkeyOpen} onOpenChange={(o) => !o && setPasskeyOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add a passkey</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="type-body-small text-ink-secondary">Name this passkey so you remember which device it belongs to.</p>
            <div className="space-y-1.5">
              <Label htmlFor="pkname">Passkey name</Label>
              <Input id="pkname" value={passkeyName} onChange={(e) => setPasskeyName(e.target.value)} placeholder="MacBook Pro" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPasskeyOpen(false)}>Cancel</Button>
              <Button onClick={createPasskey} disabled={passkeyCreating}>{passkeyCreating ? 'Creating…' : 'Create passkey'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
