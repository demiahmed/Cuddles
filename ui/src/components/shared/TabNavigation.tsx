interface TabNavigationProps {
  activePanel: 'calendar' | 'period' | 'intimacy';
  onTabChange: (panel: 'calendar' | 'period' | 'intimacy') => void;
}

export default function TabNavigation({ activePanel, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex -mb-px" aria-label="Tabs">
        <button
          onClick={() => onTabChange('calendar')}
          className={`tab-btn whitespace-nowrap py-3 px-6 border-b-2 font-semibold text-sm ${
            activePanel === 'calendar'
              ? 'border-pink-600 text-pink-600 bg-pink-50'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
          aria-current={activePanel === 'calendar' ? 'page' : undefined}
        >
          Calendar
        </button>
        <button
          onClick={() => onTabChange('period')}
          className={`tab-btn whitespace-nowrap py-3 px-6 border-b-2 font-semibold text-sm ${
            activePanel === 'period'
              ? 'border-pink-600 text-pink-600 bg-pink-50'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
          aria-current={activePanel === 'period' ? 'page' : undefined}
        >
          Period
        </button>
        <button
          onClick={() => onTabChange('intimacy')}
          className={`tab-btn whitespace-nowrap py-3 px-6 border-b-2 font-semibold text-sm ${
            activePanel === 'intimacy'
              ? 'border-pink-600 text-pink-600 bg-pink-50'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
          aria-current={activePanel === 'intimacy' ? 'page' : undefined}
        >
          Intimacy
        </button>
      </nav>
    </div>
  );
}