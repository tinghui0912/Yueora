import { useState } from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import PublicShell from '@/components/public/PublicShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function Copyright() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <PublicShell>
      <LegalLayout
        title="Copyright & Takedown"
        updated="Sep 1, 2026"
        intro="Yueora lets you upload, recognize, and share sheet music. That means copyright matters. This page explains your responsibilities and how to report a problem."
        sections={[
          { heading: 'Your responsibility', paragraphs: ['You’re responsible for making sure you have the rights to upload and share any score you add to Yueora. If you’re unsure whether something is copyrighted, check before uploading or sharing it.', 'Sharing a link doesn’t transfer ownership. Only share scores with people who are allowed to have them.'] },
          { heading: 'Reporting infringement', paragraphs: ['If you believe a score on Yueora infringes your copyright, let us know. We’ll review it and may remove access.', 'Use the “Report this score” option on any shared score, or submit a takedown request using the button below.'] },
          { heading: 'What to include', paragraphs: ['A clear description of the work you believe is infringed.', 'Where the infringing content is (a link or score title).', 'Your contact information and a good-faith statement that the use is unauthorized.'], list: ['Identification of the copyrighted work', 'Location of the allegedly infringing content', 'Your name and contact details', 'A statement that you have a good-faith belief the use is not authorized'] },
          { heading: 'Counter-notice', paragraphs: ['If your content was removed and you believe it was in error, you can submit a counter-notice through support. We’ll review both sides before acting.'] },
          { heading: 'Repeat infringers', paragraphs: ['We may terminate the accounts of users who repeatedly upload infringing content.'] },
        ]}
      >
        <div className="border-t border-line-subtle pt-6">
          <p className="text-sm text-ink-secondary">Need to report copyrighted material?</p>
          <Button className="mt-3" onClick={() => { setOpen(true); setSent(false); }}>Submit a takedown request</Button>
        </div>
      </LegalLayout>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Takedown request</DialogTitle></DialogHeader>
          {sent ? (
            <div className="py-6 text-center">
              <p className="font-medium">Request received</p>
              <p className="mt-1 text-sm text-muted-foreground">We’ll review it and follow up by email.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label htmlFor="work">Copyrighted work</Label><Input id="work" placeholder="Title of the work" /></div>
              <div className="space-y-1.5"><Label htmlFor="loc">Where is it?</Label><Input id="loc" placeholder="Link or score title" /></div>
              <div className="space-y-1.5"><Label htmlFor="details">Details</Label><Textarea id="details" rows={3} placeholder="Why this is infringing" /></div>
              <div className="space-y-1.5"><Label htmlFor="email">Your email</Label><Input id="email" type="email" /></div>
            </div>
          )}
          <DialogFooter>
            {sent ? <Button onClick={() => setOpen(false)}>Done</Button> : (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => setSent(true)}>Submit</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicShell>
  );
}