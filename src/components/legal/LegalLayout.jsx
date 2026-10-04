/**
 * LegalLayout — legal content composition only.
 * No shell. Wrap in <PublicShell> from the page.
 * Accepts children for page-specific actions (e.g. takedown CTA).
 */
export default function LegalLayout({ title, updated, intro, sections, children }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-3xl font-medium text-ink-primary">{title}</h1>
      {updated && <p className="mt-2 text-sm text-ink-tertiary">Last updated {updated}</p>}
      {intro && <p className="mt-5 text-[15px] leading-[1.8] text-ink-secondary">{intro}</p>}

      <div className="mt-10 space-y-9">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-lg font-medium text-ink-primary">{s.heading}</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-[1.8] text-ink-secondary">
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
    </div>
  );
}