import LegalLayout from '@/components/legal/LegalLayout';
import PublicShell from '@/components/public/PublicShell';

export default function Privacy() {
  return (
    <PublicShell>
      <LegalLayout
        title="Privacy Policy"
        updated="Sep 1, 2026"
        intro="Yueora is built around your personal music library, so we take privacy seriously. This explains what we collect and why."
        sections={[
          { heading: 'What we collect', paragraphs: ['Account information like your email and display name.', 'The scores and files you upload, and the practice data you generate.'], list: ['Email and profile details', 'Uploaded scores and recognition results', 'Practice session history and progress', 'Limited usage analytics (if enabled)'] },
          { heading: 'How we use it', paragraphs: ['To provide the service — recognition, your library, practice feedback, and sharing.', 'To improve recognition quality and the product. We never sell your data.'] },
          { heading: 'Sharing', paragraphs: ['Scores you share are visible only to the people and links you choose. We don’t share your data with third parties for advertising.'] },
          { heading: 'Your choices', paragraphs: ['You can export your data or delete your account anytime from Settings → Data & Privacy. You can also turn off anonymous analytics.'] },
          { heading: 'Security', paragraphs: ['We use reasonable measures to protect your data, but no system is perfectly secure. We recommend maintaining strong authentication and credentials on your primary sign-in account.'] },
          { heading: 'Contact', paragraphs: ['Privacy questions? Contact support from the Help center.'] },
        ]}
      />
    </PublicShell>
  );
}