import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Mail, KeyRound, CheckCircle2, AlertCircle, Loader2,
  Smartphone, Laptop, ExternalLink, Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';

export default function SecuritySettings() {
  const { user } = useAuth();
  const account = usePrototypeStore((s) => s.account);
  const signOutSession = usePrototypeStore((s) => s.signOutSession);
  const signOutAllOtherSessions = usePrototypeStore((s) => s.signOutAllOtherSessions);
  const addSecurityActivity = usePrototypeStore((s) => s.addSecurityActivity);
  const resendEmailVerification = usePrototypeStore((s) => s.resendEmailVerification);
  const setEmailVerified = usePrototypeStore((s) => s.setEmailVerified);

  const email = account?.email || user?.email || 'you@example.com';
  const isGoogleUser = Boolean(user?.google_id || user?.provider === 'google' || account?.provider === 'google');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Email verification state
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (currentPassword === 'wrong') {
      setPasswordError('Incorrect current password. Please try again.');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addSecurityActivity({
        type: 'password',
        title: 'Password updated',
        detail: 'Primary account password changed',
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 600);
  };

  const handleResendVerification = () => {
    setResendingVerification(true);
    resendEmailVerification();
    setTimeout(() => {
      setResendingVerification(false);
      setVerificationNotice(true);
      setTimeout(() => setVerificationNotice(false), 3500);
    }, 500);
  };

  const sessions = account?.sessions || [];
  const otherSessions = sessions.filter((s) => !s.current);
  const securityActivity = account?.securityActivity || [];

  return (
    <div className="divide-y divide-line-subtle">
      {/* 1. Sign-in Method */}
      <SettingsSection
        title="Sign-in method"
        desc="How you authenticate and access your Yueora workspace."
      >
        <div className="max-w-md space-y-4">
          <div className="flex items-start gap-3 rounded-container border border-line-subtle bg-surface-panel p-4">
            <ShieldCheck className="icon-sm text-ink-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="type-body-small font-medium text-ink-primary">
                {isGoogleUser ? 'Google Authentication' : 'Email and password'}
              </p>
              <p className="mt-1 type-metadata text-ink-secondary leading-relaxed">
                {isGoogleUser
                  ? 'Your account is secured via Google OAuth. Multi-factor authentication, security keys, and session protection are managed directly through your Google Account.'
                  : 'Your account is authenticated via your verified email address and local account password.'}
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* 2. Password & Credentials */}
      <SettingsSection
        title="Password & credentials"
        desc="Manage password updates and account recovery credentials."
      >
        <div className="max-w-md space-y-4">
          {isGoogleUser ? (
            <div className="rounded-container border border-line-subtle bg-surface-panel p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="icon-xs text-ink-secondary shrink-0" />
                <span className="type-body-small font-medium text-ink-primary">External credential management</span>
              </div>
              <p className="mt-2 type-metadata text-ink-secondary leading-relaxed">
                Because you sign in with Google, Yueora does not store or manage a local password for your account. You can update your credentials anytime in your Google Account dashboard.
              </p>
              <div className="mt-3">
                <Button intent="secondary" size="sm" asChild>
                  <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">
                    <span>Manage Google Account</span>
                    <ExternalLink className="ml-1.5 icon-xs" />
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="rounded-container border border-line-subtle bg-surface-panel p-4 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="icon-xs text-ink-secondary shrink-0" />
                <span className="type-body-small font-medium text-ink-primary">Change password</span>
              </div>

              {passwordError && (
                <div role="alert" className="flex items-center gap-2 rounded-control bg-danger/10 p-2.5 text-danger type-metadata">
                  <AlertCircle className="icon-xs shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div role="status" className="flex items-center gap-2 rounded-control bg-neutral-muted p-2.5 text-ink-primary type-metadata border border-line-subtle">
                  <CheckCircle2 className="icon-xs text-brand shrink-0" />
                  <span>Password updated successfully.</span>
                </div>
              )}

              <Field label="Current password" htmlFor="currentPassword" required>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>

              <Field
                label="New password"
                htmlFor="newPassword"
                description="Must be at least 8 characters long."
                required
              >
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Confirm new password" htmlFor="confirmPassword" required>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>

              <div className="pt-1">
                <Button intent="secondary" size="sm" type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-1.5 icon-xs animate-spin" />
                      <span>Updating password…</span>
                    </>
                  ) : (
                    <span>Update password</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SettingsSection>

      {/* 3. Multi-Factor Authentication */}
      <SettingsSection
        title="Multi-factor authentication"
        desc="Require a verification code when signing in from an unfamiliar device."
      >
        <div className="max-w-md space-y-4">
          <div className="rounded-container border border-line-subtle bg-surface-panel p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="icon-xs text-ink-secondary shrink-0" />
                <div>
                  <p className="type-body-small font-medium text-ink-primary">Authenticator app</p>
                  <p className="type-metadata text-ink-tertiary">Time-based one-time passcodes (TOTP)</p>
                </div>
              </div>
              <span className="type-caption font-medium text-ink-secondary">
                {account?.mfa?.totp ? 'Enabled' : 'Not configured'}
              </span>
            </div>

            <div className="border-t border-line-subtle pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Mail className="icon-xs text-ink-secondary shrink-0" />
                <div>
                  <p className="type-body-small font-medium text-ink-primary">Text message (SMS)</p>
                  <p className="type-metadata text-ink-tertiary">Codes sent to your verified mobile number</p>
                </div>
              </div>
              <span className="type-caption font-medium text-ink-secondary">
                {account?.mfa?.sms ? 'Enabled' : 'Not configured'}
              </span>
            </div>

            <div className="border-t border-line-subtle pt-3">
              <Button intent="secondary" size="sm" asChild>
                <Link to="/mfa?returnTo=/settings/security">
                  Manage MFA
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* 4. Active Sessions */}
      <SettingsSection
        title="Active sessions"
        desc="Devices and browsers currently signed in to your Yueora workspace."
      >
        <div className="max-w-md space-y-3">
          <div className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 p-3.5">
                <div className="flex items-start gap-3 min-w-0">
                  <Laptop className="icon-xs text-ink-secondary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="type-body-small font-medium text-ink-primary truncate">{session.device}</p>
                      {session.current && (
                        <span className="rounded-control bg-neutral-muted px-2 py-0.5 type-caption font-semibold uppercase tracking-wider text-ink-primary">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="type-metadata text-ink-tertiary truncate">
                      {session.browser} · {session.location}
                    </p>
                    <p className="type-caption text-ink-tertiary mt-0.5">{session.lastActive}</p>
                  </div>
                </div>

                {!session.current && (
                  <Button
                    intent="quiet"
                    size="xs"
                    onClick={() => signOutSession(session.id)}
                    className="shrink-0"
                  >
                    Sign out
                  </Button>
                )}
              </div>
            ))}
          </div>

          {otherSessions.length > 0 && (
            <Button
              intent="secondary"
              size="sm"
              onClick={signOutAllOtherSessions}
            >
              Sign out all other sessions
            </Button>
          )}
        </div>
      </SettingsSection>

      {/* 5. Security Activity */}
      <SettingsSection
        title="Security activity"
        desc="Recent sign-ins, credential changes, and security events."
      >
        <div className="max-w-md">
          {securityActivity.length === 0 ? (
            <p className="type-body-small text-ink-secondary">No recent security events.</p>
          ) : (
            <div className="divide-y divide-line-subtle rounded-container border border-line-subtle bg-surface-panel">
              {securityActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3.5">
                  <Clock className="icon-xs text-ink-secondary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="type-body-small font-medium text-ink-primary">{activity.title}</p>
                    <p className="type-metadata text-ink-secondary">{activity.detail}</p>
                    <p className="type-caption text-ink-tertiary mt-0.5">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsSection>

      {/* 6. Email Verification */}
      <SettingsSection
        title="Email verification"
        desc="Confirmed contact address for account recovery."
      >
        <div className="max-w-md space-y-3">
          <div className="flex items-center justify-between rounded-container border border-line-subtle bg-surface-panel p-4">
            <div className="flex items-center gap-3 min-w-0">
              <Mail className="icon-xs text-ink-secondary shrink-0" />
              <div className="min-w-0">
                <p className="truncate type-body-small font-medium text-ink-primary">{email}</p>
                <p className="type-metadata text-ink-tertiary">
                  {account?.emailVerified
                    ? 'Verified for Yueora workspace access'
                    : 'Your email address has not been verified yet'}
                </p>
              </div>
            </div>
            {account?.emailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-muted px-2.5 py-0.5 type-caption font-semibold text-ink-primary shrink-0">
                <CheckCircle2 className="h-3 w-3 text-brand" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-muted px-2.5 py-0.5 type-caption font-semibold text-ink-secondary shrink-0">
                Not verified
              </span>
            )}
          </div>

          {verificationNotice && (
            <div role="status" className="flex items-center gap-2 rounded-control bg-neutral-muted p-2.5 text-ink-primary type-metadata border border-line-subtle">
              <CheckCircle2 className="icon-xs text-brand shrink-0" />
              <span>Verification email dispatched. Check your inbox.</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              intent="quiet"
              size="sm"
              onClick={handleResendVerification}
              disabled={resendingVerification}
            >
              {resendingVerification ? 'Sending…' : 'Resend verification email'}
            </Button>
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => setEmailVerified?.(!account?.emailVerified)}
                className="type-caption text-ink-tertiary hover:text-ink-primary underline cursor-pointer"
              >
                {account?.emailVerified ? 'Simulate unverified' : 'Simulate verified'}
              </button>
            )}
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
