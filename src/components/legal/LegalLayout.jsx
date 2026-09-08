import ExternalShell from '@/components/external/ExternalShell';

export default function LegalLayout({ title, updated, intro, sections }) {
  return (
    <ExternalShell>
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <h1 className="font-display text-3xl font-medium">{title}</h1>
        {updated && <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>}
        {intro && <p className="mt-5 leading-relaxed text-muted-foreground">{intro}</p>}

        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-lg font-medium">{s.heading}</h2>
              <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-foreground">
                {s.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
                {s.list && (
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {s.list.map((li, j) => <li key={j}>{li}</li>)}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </ExternalShell>
  );
}