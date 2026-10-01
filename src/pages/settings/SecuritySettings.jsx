import { useState } from 'react';
import { Monitor, Smartphone, ShieldCheck, KeyRound, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePrototypeStore } from '@/stores/prototypeStore';
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
    <div className="space-y-6">
      <Section title="Password" desc="Choose a strong password you don't use elsewhere.">
        <form onSubmit={changePw} className="max-w-sm space-y-4">
          <div className="space-y-1.5"><Label htmlFor="cur">Current password</Label><Input id="cur" type="password" placeholder="••••••••" /></div>
          <div className="space-y-1.5"><Label htmlFor="new">New password</Label><Input id="new" type="password" /></div>
          <div className="flex items-center gap-3"><Button type="submit">Update password</Button>{pwSaved && <span className="text-sm text-primary">Updated</span>}</div>
        </form>
      </Section>

      <Section title="Two-factor authentication" desc="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`h-5 w-5 ${twoFactor ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm">{twoFactor ? 'Enabled' : 'Disabled'}</span>
          </div>
          {twoFactor ? (
            <Button variant="outline" size="sm" onClick={disable}>Disable</Button>
          ) : (
            <Button size="sm" onClick={startEnable}>Enable 2FA</Button>
          )}
        </div>
      </Section>

      <Section title="Passkeys" desc="Sign in faster with a passkey.">
        {account.passkeys.length === 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-muted-foreground" /><span className="text-sm">No passkeys yet</span></div>
            <Button variant="outline" size="sm" onClick={() => setPasskeyOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Add passkey</Button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {account.passkeys.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                    <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">Added {p.addedAt}</p></div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removePasskey(p.id)} className="text-destructive hover:text-destructive"><Trash2 className="mr-1.5 h-4 w-4" /> Remove</Button>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setPasskeyOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Add another</Button>
          </>
        )}
      </Section>

      <Section title="Active sessions" desc="Devices currently signed in to your account.">
        <ul className="divide-y divide-border">
          {account.sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {s.device?.includes('iPhone') ? <Smartphone className="h-5 w-5 text-muted-foreground" /> : <Monitor className="h-5 w-5 text-muted-foreground" />}
                <div><p className="text-sm font-medium">{s.device} · {s.browser}</p><p className="text-xs text-muted-foreground">{s.location}</p></div>
              </div>
              {s.current ? <span className="text-xs text-primary">This device</span> : <Button variant="ghost" size="sm" onClick={() => signOutSession(s.id)}>Sign out</Button>}
            </li>
          ))}
        </ul>
        {account.sessions.filter((s) => !s.current).length > 0 && (
          <Button variant="outline" className="mt-3" onClick={signOutAllOther}>Sign out all other sessions</Button>
        )}
      </Section>

      <Section title="Security activity" desc="Recent sign-ins and account changes.">
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between"><span>New sign-in on Chrome</span><span className="text-muted-foreground">1 day ago</span></li>
          <li className="flex justify-between"><span>Password updated</span><span className="text-muted-foreground">2 weeks ago</span></li>
        </ul>
      </Section>

      {/* 2FA setup dialog */}
      <Dialog open={setupStep > 0} onOpenChange={(o) => !o && cancelSetup()}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{setupStep === 1 ? 'Set up 2FA' : setupStep === 2 ? 'Enter code' : 'Save recovery codes'}</DialogTitle></DialogHeader>
          {setupStep === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Scan this QR code with an authenticator app like Authy or 1Password.</p>
              <div className="flex h-40 w-40 items-center justify-center rounded-md border border-border bg-card mx-auto"><span className="text-xs text-muted-foreground">QR code</span></div>
              <DialogFooter><Button onClick={() => setSetupStep(2)}>Next</Button></DialogFooter>
            </div>
          )}
          {setupStep === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter the 6-digit code from your app.</p>
              <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="text-center text-lg tracking-[0.4em]" />
              <DialogFooter>
                <Button variant="outline" onClick={cancelSetup}>Cancel</Button>
                <Button onClick={verifyOtp} disabled={otp.length < 6}>Verify</Button>
              </DialogFooter>
            </div>
          )}
          {setupStep === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Save these one-time recovery codes somewhere safe. You can use them if you lose your device.</p>
              <div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-sm">
                {recoveryCodes.map((c) => <div key={c}>{c}</div>)}
              </div>
              <Button variant="outline" size="sm" onClick={copyCodes} className="w-full">{copied ? <><Check className="mr-1.5 h-4 w-4" /> Copied</> : <><Copy className="mr-1.5 h-4 w-4" /> Copy codes</>}</Button>
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
            <p className="text-sm text-muted-foreground">Name this passkey so you remember which device it belongs to.</p>
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

function Section({ title, desc, children }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h2 className="font-display text-lg font-medium">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}