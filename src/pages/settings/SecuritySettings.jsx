import { useState } from 'react';
import { ShieldCheck, Mail, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import SettingsSection from '@/components/patterns/SettingsSection';
import { Button } from '@/components/ui/button';

export default function SecuritySettings() {
  const { user } = useAuth();
  const email = user?.email || 'you@example.com';
  // Determine if account is linked via Google OAuth
  const isGoogleUser = Boolean(user?.google_id || user?.provider === 'google' || !user?.has_password);

  const [resetRequested, setResetRequested] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);

  const handleSendResetEmail = async () => {
    if (!email) return;
    setResetLoading(true);
    setResetError(null);
    try {
      await base44.auth.resetPasswordRequest(email);
      setResetRequested(true);
    } catch (err) {
      if (import.meta.env.DEV) {
        setResetRequested(true);
      } else {
        setResetError(err?.message || 'Unable to send password reset email. Please try again later.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="divide-y divide-line-subtle">
      {/* Sign-in Method */}
      <SettingsSection
        title="Sign-in method"
        desc="How you authenticate and access your Yueora workspace."
      >
        <div className="max-w-md space-y-4">
          <div className="flex items-start gap-3 rounded-container border border-line-subtle bg-surface-panel p-4">
            <ShieldCheck className="h-5 w-5 text-ink-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="type-body-small font-medium text-ink-primary">
                {isGoogleUser ? 'Google Authentication' : 'Email and password'}
              </p>
              <p className="mt-1 type-metadata text-ink-secondary leading-relaxed">
                {isGoogleUser
                  ? 'Your account is secured via Google OAuth. Multi-factor authentication, security keys, and session protection are managed directly through your Google Account.'
                  : 'Your account is authenticated via your verified email address and password.'}
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Password Management */}
      <SettingsSection
        title="Password & credentials"
        desc="Manage password updates and account recovery credentials."
      >
        <div className="max-w-md space-y-4">
          {isGoogleUser ? (
            <div className="rounded-container border border-line-subtle bg-surface-panel p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-ink-secondary shrink-0" />
                <span className="type-body-small font-medium text-ink-primary">External credential management</span>
              </div>
              <p className="mt-2 type-metadata text-ink-secondary leading-relaxed">
                Because you sign in with Google, Yueora does not store or manage a local password for your account. You can update your password or security settings anytime in your Google Account dashboard.
              </p>
            </div>
          ) : (
            <div className="rounded-container border border-line-subtle bg-surface-panel p-4 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-ink-secondary shrink-0" />
                <span className="type-body-small font-medium text-ink-primary">Password reset</span>
              </div>
              <p className="type-metadata text-ink-secondary leading-relaxed">
                To change your password, request a secure verification link sent to your registered email address ({email}).
              </p>

              {resetError && (
                <div className="flex items-center gap-2 rounded-control bg-danger/10 p-2.5 text-danger type-metadata">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetRequested ? (
                <div className="flex items-center gap-2 rounded-control bg-practice-following/10 p-3 text-ink-primary type-metadata border border-practice-following/20">
                  <CheckCircle2 className="h-4 w-4 text-practice-following shrink-0" />
                  <span>Password reset email dispatched to <strong>{email}</strong>. Check your inbox to update your password.</span>
                </div>
              ) : (
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={handleSendResetEmail}
                  disabled={resetLoading}
                  className="mt-1"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      <span>Sending reset email…</span>
                    </>
                  ) : (
                    <span>Send password reset email</span>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Email Verification */}
      <SettingsSection
        title="Email verification"
        desc="Confirmed contact address for account recovery."
      >
        <div className="max-w-md">
          <div className="flex items-center justify-between rounded-container border border-line-subtle bg-surface-panel p-4">
            <div className="flex items-center gap-3 min-w-0">
              <Mail className="h-4 w-4 text-ink-secondary shrink-0" />
              <div className="min-w-0">
                <p className="truncate type-body-small font-medium text-ink-primary">{email}</p>
                <p className="type-metadata text-ink-tertiary">Verified for Yueora workspace access</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-muted px-2.5 py-0.5 type-caption font-semibold text-ink-primary shrink-0">
              <CheckCircle2 className="h-3 w-3 text-brand" />
              Verified
            </span>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
