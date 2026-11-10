import AppPage from '@/components/patterns/AppPage';

/**
 * LegalLayout — legal content composition only.
 * No shell. Wrap in <PublicShell> from the page.
 * Accepts children for page-specific actions (e.g. takedown CTA).
 */
export default function LegalLayout({ title, updated = undefined, intro = undefined, sections = [], children = null }) {
  return (
    <AppPage size="form" className="pt-28 md:pt-32 pb-12 md:pb-16">
      <h1 className="type-page-title text-ink-primary">{title}</h1>
      {updated && <p className="mt-2 type-body-small text-ink-tertiary">Last updated {updated}</p>}
      {intro && <p className="mt-5 type-body text-ink-secondary leading-relaxed">{intro}</p>}

      <div className="mt-10 space-y-9">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="type-section-title text-ink-primary font-medium">{s.heading}</h2>
            <div className="mt-3 space-y-3 type-body text-ink-secondary leading-relaxed">
              {s.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
              {s.list && (
                <ul className="list-disc space-y-1.5 pl-5 text-ink-secondary">
                  {s.list.map((li, j) => <li key={j}>{li}</li>)}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      {children && <div className="mt-10">{children}</div>}
    </AppPage>
  );
}