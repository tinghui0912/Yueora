import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ExternalShell from '@/components/external/ExternalShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const returnTo = params.get('returnTo') || '/';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1));
      }, 1000);
      return () => clearInterval(cooldownRef.current);
    }
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    if (code.length < 6) { setError('Enter the 6-digit code from your email.'); return; }
    setError('');
    setVerifying(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: code });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = returnTo || '/';
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Try resending.');
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    setError('');
    try {
      await base44.auth.resendOtp(email);
      toast({ title: 'Code sent', description: 'Check your email for the new code.' });
      setCooldown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setSending(false);
    }
  };

  return (
    <ExternalShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center md:px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line-subtle bg-surface-panel text-brand">
          <MailCheck className="icon-xl" aria-hidden="true" />
        </div>
        <h1 className="mt-5 type-page-title text-ink-primary">Check your email</h1>
        <p className="mt-2 type-body-small text-ink-secondary">
          We sent a 6-digit code to {email || 'your email'}. Enter it below to verify your account.
        </p>

        <form onSubmit={submit} className="mt-6 w-full space-y-3 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="code" className="type-label text-ink-primary">Verification code</Label>
            {/* ds-allow: verification code input letter-spacing and size */}
            <Input
              id="code"
              className="text-center text-lg tracking-[0.4em]"
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
              placeholder="123456"
              autoFocus
            />
            {error && <p className="type-caption text-danger">{error}</p>}
          </div>
          <Button type="submit" intent="primary" className="w-full" disabled={verifying || code.length < 6}>
            {verifying ? <><Loader2 className="mr-2 icon-sm animate-spin" /> Verifying…</> : 'Verify and continue'}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3 type-body-small text-ink-secondary">
          {cooldown > 0 ? (
            <span className="text-ink-tertiary">Resend in {cooldown}s</span>
          ) : (
            <button type="button" onClick={resend} disabled={sending} className="flex items-center gap-1.5 text-brand hover:underline disabled:opacity-50">
              {sending ? <><Loader2 className="icon-xs animate-spin" /> Sending…</> : <><RefreshCw className="icon-xs" /> Resend code</>}
            </button>
          )}
          <span>·</span>
          <Link to="/login" className="hover:text-ink-primary hover:underline">Back to log in</Link>
        </div>
      </div>
    </ExternalShell>
  );
}