import { Switch } from '@/components/ui/switch';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';
import { NativeSelect } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { MessageCircle } from 'lucide-react';

const categories = [
  { key: 'imports', label: 'Imports', desc: 'Recognition finished, ready to review, or failed.' },
  { key: 'sharing', label: 'Score sharing', desc: 'Invitations sent, accepted, or score access changed.' },
  { key: 'performances', label: 'Performance sharing', desc: 'A recording was shared with you, or access changed.' },
  { key: 'comments', label: 'Comments & replies', desc: 'Someone commented on your performance or replied to you.' },
  { key: 'security', label: 'Security', desc: 'New sign-ins and account changes.' },
  { key: 'billing', label: 'Billing', desc: 'Renewals, receipts, and plan changes.' },
  { key: 'practice', label: 'Practice suggestions', desc: 'A gentle nudge — never a streak reminder.' },
  { key: 'updates', label: 'Product updates', desc: 'New features and improvements.' },
];

export default function NotificationSettings() {
  const prefs = usePrototypeStore((s) => s.notificationPrefs) || {};
  const toggle = usePrototypeStore((s) => s.toggleNotificationPref);
  const setNotificationSetting = usePrototypeStore((s) => s.setNotificationSetting);

  const frequency = prefs.practiceCadence || 'Occasionally';
  const preferredTime = prefs.practicePreferredTime || 'Evening';

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection title="Notification preferences" desc="Choose what you hear about, and how. Practice reminders are gentle by default.">
        <div className="max-w-2xl overflow-hidden rounded-container border border-line-subtle bg-surface-panel">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-line-subtle bg-neutral-muted/40 px-5 py-2.5 type-caption text-ink-tertiary">
            <span>Category</span>
            <span className="w-16 text-center">In-app</span>
            <span className="w-16 text-center">Email</span>
          </div>
          {categories.map((c) => (
            <div key={c.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line-subtle px-5 py-3 last:border-0">
              <div>
                <p className="type-body-small font-medium text-ink-primary">{c.label}</p>
                <p className="type-metadata text-ink-tertiary">{c.desc}</p>
              </div>
              <div className="flex w-16 justify-center"><Switch checked={prefs[c.key]?.inApp ?? true} onCheckedChange={() => toggle(c.key, 'inApp')} aria-label={`${c.label} in-app`} /></div>
              <div className="flex w-16 justify-center"><Switch checked={prefs[c.key]?.email ?? false} onCheckedChange={() => toggle(c.key, 'email')} aria-label={`${c.label} email`} /></div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Practice cadence & timing"
        desc="Choose how often and when you'd like to receive gentle invitations to play."
      >
        <div className="max-w-md space-y-4">
          <Field label="Suggestion cadence" htmlFor="cadence">
            <NativeSelect
              id="cadence"
              value={frequency}
              onChange={(e) => setNotificationSetting('practiceCadence', e.target.value)}
            >
              <option value="Off">Off (no suggestions)</option>
              <option value="Occasionally">Occasionally (every few days)</option>
              <option value="Weekly">Weekly (once a week)</option>
            </NativeSelect>
          </Field>

          <Field label="Preferred time of day" htmlFor="timeOfDay">
            <NativeSelect
              id="timeOfDay"
              value={preferredTime}
              onChange={(e) => setNotificationSetting('practicePreferredTime', e.target.value)}
            >
              <option value="Morning">Morning (8:00 AM – 11:00 AM)</option>
              <option value="Afternoon">Afternoon (1:00 PM – 4:00 PM)</option>
              <option value="Evening">Evening (6:00 PM – 9:00 PM)</option>
            </NativeSelect>
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Practice reminder tone"
        desc="We never say “you haven’t practiced.” Instead, an invitation to enjoy your piano."
      >
        <div className="max-w-md rounded-container border border-line-subtle bg-surface-panel p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <MessageCircle className="icon-xs text-ink-primary" />
            <span className="type-caption text-ink-tertiary">
              Invitation preview
            </span>
          </div>
          <p className="type-editorial-quote text-ink-primary">
            &ldquo;Feel like returning to Moonlight Sonata today?&rdquo;
          </p>
          <p className="type-metadata text-ink-secondary">
            Moonlight Sonata is waiting whenever you feel like playing.
          </p>
          <p className="type-metadata text-ink-tertiary border-t border-line-subtle pt-2">
            Zero streak counters, zero pressure.
          </p>
        </div>
      </SettingsSection>
    </div>
  );
}
