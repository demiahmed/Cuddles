interface MonthNavigationProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthNavigation({
  currentDate,
  onPrevMonth,
  onNextMonth,
}: MonthNavigationProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrevMonth}
        className="p-2 rounded-full text-gray-800 bg-gray-100 hover:bg-gray-200 shadow-sm transition-colors duration-200"
        aria-label="Previous month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 className="text-xl font-bold text-gray-800">
        {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
      </h2>
      <button
        onClick={onNextMonth}
        className="p-2 rounded-full text-gray-800 bg-gray-100 hover:bg-gray-200 shadow-sm transition-colors duration-200"
        aria-label="Next month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}