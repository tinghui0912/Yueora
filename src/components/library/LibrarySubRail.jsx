const sections = [
  { group: 'all', items: [
    { key: 'all', label: 'All music' },
    { key: 'mine', label: 'Mine' },
    { key: 'shared', label: 'Shared with me' },
    { key: 'saved', label: 'Saved' },
    { key: 'favorites', label: 'Favorites' },
  ]},
  { group: 'practice', items: [
    { key: 'to_practice', label: 'To practice' },
    { key: 'recently_practiced', label: 'Recently practiced' },
    { key: 'mastered', label: 'Mastered' },
  ]},
];

export default function LibrarySubRail({ active, onSelect }) {
  return (
    <div className="hidden w-[180px] shrink-0 border-r border-border bg-background lg:block">
      <div className="sticky top-16 px-3 py-4">
        {sections.map((sec, i) => (
          <div key={sec.group} className={i > 0 ? 'mt-5' : ''}>
            {sec.items.map((item) => (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                  active === item.key
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
            {i < sections.length - 1 && <div className="my-3 border-t border-border" />}
          </div>
        ))}
      </div>
    </div>
  );
}