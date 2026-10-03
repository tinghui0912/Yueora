import { Switch } from '@/components/ui/switch';
import { usePrototypeStore } from '@/stores/prototypeStore';
import SettingsSection from '@/components/patterns/SettingsSection';

const categories = [
  { key: 'imports', label: 'Imports', desc: 'Recognition finished, ready to review, or failed.' },
  { key: 'sharing', label: 'Sharing', desc: 'Invitations sent, accepted, or access changed.' },
  { key: 'security', label: 'Security', desc: 'New sign-ins and account changes.' },
  { key: 'billing', label: 'Billing', desc: 'Renewals, receipts, and plan changes.' },
  { key: 'practice', label: 'Practice suggestions', desc: 'A gentle nudge — never a streak reminder.' },
  { key: 'updates', label: 'Product updates', desc: 'New features and improvements.' },
];

export default function NotificationSettings() {
  const prefs = usePrototypeStore((s) => s.notificationPrefs);
  const toggle = usePrototypeStore((s) => s.toggleNotificationPref);

  return (
    <div className="divide-y divide-line-subtle">
      <SettingsSection title="Notification preferences" desc="Choose what you hear about, and how. Practice reminders are gentle by default.">
        <div className="max-w-2xl overflow-hidden rounded-container border border-line-subtle">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-line-subtle bg-muted/30 px-5 py-2.5 type-caption text-ink-tertiary">
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
              <div className="flex w-16 justify-center"><Switch checked={prefs[c.key].inApp} onCheckedChange={() => toggle(c.key, 'inApp')} aria-label={`${c.label} in-app`} /></div>
              <div className="flex w-16 justify-center"><Switch checked={prefs[c.key].email} onCheckedChange={() => toggle(c.key, 'email')} aria-label={`${c.label} email`} /></div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Practice reminder tone" desc={'We\u2019ll never say \u201cyou haven\u2019t practiced.\u201d Instead: \u201cFeel like playing something today?\u201d'} />
    </div>
  );
}