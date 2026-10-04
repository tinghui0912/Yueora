import LegalLayout from '@/components/legal/LegalLayout';
import PublicShell from '@/components/public/PublicShell';

export default function AcceptableUse() {
  return (
    <PublicShell>
      <LegalLayout
        title="Acceptable Use Policy"
        updated="Sep 1, 2026"
        intro="This describes what’s okay — and not okay — when using Yueora."
        sections={[
          { heading: 'You agree to', paragraphs: ['Only upload content you have the rights to use.', 'Respect copyright and the work of composers and arrangers.', 'Keep your account secure.'], list: ['Upload scores you own, created yourself, or have permission to use', 'Share scores only with people you trust', 'Use the service for personal, lawful purposes'] },
          { heading: 'You agree not to', paragraphs: ['Upload or share content that infringes someone else’s copyright.', 'Use Yueora to harass others or distribute harmful content.', 'Try to break, reverse-engineer, or overload the service.'], list: ['Upload copyrighted scores you don’t have permission to share', 'Share access with people who shouldn’t have it', 'Automate or scrape the service'] },
          { heading: 'What happens if you don’t', paragraphs: ['We may remove content, revoke sharing links, or suspend accounts that violate this policy. Serious or repeated violations may lead to permanent closure.'] },
          { heading: 'Reporting', paragraphs: ['If you see content that shouldn’t be here, use “Report this score” on any shared score, or contact support.'] },
        ]}
      />
    </PublicShell>
  );
}