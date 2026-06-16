interface TabNavigationProps {
  activePanel: 'calendar' | 'period' | 'intimacy' | 'wellness';
  onTabChange: (panel: 'calendar' | 'period' | 'intimacy' | 'wellness') => void;
}

const TABS = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'period',   label: 'Period' },
  { key: 'intimacy', label: 'Intimacy' },
  { key: 'wellness', label: 'Wellness' },
] as const;

export default function TabNavigation({ activePanel, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`tab-btn whitespace-nowrap py-3 px-5 border-b-2 font-semibold text-sm ${
              activePanel === key
                ? 'border-pink-600 text-pink-600 bg-pink-50'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            aria-current={activePanel === key ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}