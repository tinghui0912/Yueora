import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import ExternalShell from '@/components/external/ExternalShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (code.length < 6) { setError('Enter the 6-digit code from your email.'); return; }
    navigate('/library');
  };

  return (
    <ExternalShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center md:px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><MailCheck className="h-6 w-6" /></div>
        <h1 className="mt-5 font-display text-3xl font-medium">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to {email || 'your email'}. Enter it below to verify your account.
        </p>

        <form onSubmit={submit} className="mt-6 w-full space-y-3 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification code</Label>
            <Input id="code" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="123456" className="text-center text-lg tracking-[0.4em]" />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full">Verify and continue</Button>
        </form>

        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <button className="hover:text-foreground">Resend code</button>
          <span>·</span>
          <Link to="/login" className="hover:text-foreground">Back to log in</Link>
        </div>
      </div>
    </ExternalShell>
  );
}