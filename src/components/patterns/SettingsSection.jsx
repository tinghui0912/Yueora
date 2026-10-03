import React from 'react';
import SectionHeader from './SectionHeader';

/**
 * SettingsSection — flat section with dividers, replacing the card-soup pattern.
 * Parent should wrap in <div className="divide-y divide-line-subtle">.
 * Use a plain bordered div only for: security workflows, billing plan, danger zone.
 */
export default function SettingsSection({ title, desc, children, action }) {
  return (
    <section className="py-6 first:pt-0 last:pb-0">
      <SectionHeader title={title} description={desc} action={action} />
      <div className="mt-4">{children}</div>
    </section>
  );
}