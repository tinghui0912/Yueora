import { Check } from 'lucide-react';

// A restrained radio list — reads as a choice, not a settings form.
export default function OptionGroup({ value, onChange, options, ariaLabel }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="mt-2 border-y border-line-subtle">
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`flex w-full items-start gap-3 py-3 px-3 rounded-control text-left transition-colors ${
              i > 0 ? 'border-t border-line-subtle' : ''
            } ${active ? 'bg-neutral-hover' : 'hover:bg-neutral-hover/60'}`}
          >
            <span
              aria-hidden="true"
              className={`mt-1.5 h-3 w-3 shrink-0 rounded-full border ${active ? 'border-brand bg-brand' : 'border-line-strong bg-transparent'}`}
            />
            <span className="min-w-0 flex-1">
              <span className={`block type-body-small ${active ? 'font-medium text-ink-primary' : 'text-ink-secondary'}`}>{o.label}</span>
              {o.description && <span className="mt-0.5 block type-body-small text-ink-secondary">{o.description}</span>}
            </span>
            {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}