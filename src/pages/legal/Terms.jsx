import LegalLayout from '@/components/legal/LegalLayout';
import PublicShell from '@/components/public/PublicShell';

export default function Terms() {
  return (
    <PublicShell>
      <LegalLayout
        title="Terms of Service"
        updated="Sep 1, 2026"
        intro="These terms govern your use of Yueora. Please read them — they explain how the service works and what we expect from each other."
        sections={[
          { heading: 'Your account', paragraphs: ['You need an account to use most of Yueora. You’re responsible for keeping your account secure and for what happens while you’re signed in.'] },
          { heading: 'Your content', paragraphs: ['You retain ownership of the scores and files you upload. You give Yueora permission to process them — to run recognition, display them, and let you practice and share — for the purpose of providing the service.'] },
          { heading: 'Acceptable use', paragraphs: ['You agree to use Yueora lawfully and to respect the rights of others. Don’t upload content you don’t have the rights to, and don’t try to disrupt the service.', 'See our Acceptable Use Policy for more detail.'] },
          { heading: 'Plans and billing', paragraphs: ['Some features require a paid plan. You can change or cancel your plan at any time. Fees are billed in advance and are non-refundable except where required by law.'] },
          { heading: 'Termination', paragraphs: ['You can stop using Yueora and delete your account at any time. We may suspend or close accounts that violate these terms.'] },
          { heading: 'Disclaimers', paragraphs: ['Yueora is provided “as is.” Recognition and feedback are helpful tools but aren’t guaranteed to be accurate. You’re responsible for reviewing your own scores.'] },
          { heading: 'Contact', paragraphs: ['Questions about these terms? Contact support from the Help center.'] },
        ]}
      />
    </PublicShell>
  );
}