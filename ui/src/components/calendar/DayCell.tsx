import { Entry, FlowType, ProtectionType, PeriodStats } from '@/types';
import { WellnessEntry, MOOD_EMOJI, MoodScore } from '@/types/wellness';
import { BloodDrop, getHeartIcon } from '@/components/shared/Icons';
import { isToday } from '@/utils/date';

interface DayCellProps {
  date: Date;
  entries?: Entry[];
  onClick: (date: Date) => void;
  isCurrentMonth?: boolean;
  periodStats?: PeriodStats | null;
  allEntries?: Entry[];
  currentDisplayDate?: Date;
  wellnessLog?: WellnessEntry | null;
}

export default function DayCell({
  date,
  entries = [],
  onClick,
  isCurrentMonth = true,
  periodStats,
  allEntries = [],
  currentDisplayDate = new Date(),
  wellnessLog = null,
}: DayCellProps) {
  
  const periodEntries = entries.filter(
    (e) => e.entry_type === 'period_start' || e.entry_type === 'period_end'
  );
  const sexEntries = entries.filter((e) => e.entry_type === 'sex');
  const flow = periodEntries.find((e) => e.flow)?.flow || null;
  const today = isToday(date);

  // REAL PREDICTIONS from API data
  const isPredictedPeriod = usePredictedPeriod(date, periodStats);
  const isPredictedOvulation = usePredictedOvulation(date, periodStats);
  
  // Show indicators for current display month only
  const isCurrentDisplayMonth = date.getMonth() === currentDisplayDate.getMonth() && 
                                date.getFullYear() === currentDisplayDate.getFullYear();
  
  // Only show predictions if:
  // 1. It's the current display month
  // 2. There are no actual period entries for this month (don't predict if actual data exists)
  const currentMonthPeriodEntries = allEntries.filter(entry => 
    (entry.entry_type === 'period_start' || entry.entry_type === 'period_end') &&
    new Date(entry.date).getMonth() === date.getMonth() &&
    new Date(entry.date).getFullYear() === date.getFullYear()
  );
  const shouldShowPredictions = isCurrentDisplayMonth && currentMonthPeriodEntries.length === 0;  const renderIcons = () => {
    const icons: any[] = [];
    
    // Period Icon (Blood Drop)
    if (flow && flow !== 'none') {
      icons.push(
        <span key="blood" className="inline-flex items-center justify-center h-3.5 w-3.5 mr-0.5">
          <BloodDrop className="h-full w-full text-red-500" />
        </span>
      );
    }

    // Sex/Intimacy Icons (Hearts)
    if (sexEntries.length > 0) {
      const maxIcons = 3;
      
      const protectedEntries = sexEntries
        .filter((e) => e.protected === 'protected');
      const unprotectedEntries = sexEntries
        .filter((e) => e.protected === 'unprotected');
      const nullProtectedEntries = sexEntries
        .filter((e) => e.protected === null || e.protected === undefined);

      const visibleEntries = [
        ...protectedEntries,
        ...unprotectedEntries,
        ...nullProtectedEntries,
      ].slice(0, maxIcons);
      
      const totalEntriesCount = sexEntries.length;

      visibleEntries.forEach(
        (entry, idx) => {
          icons.push(
            <span key={`heart-${idx}`} className="inline-flex items-center justify-center h-3.5 w-3.5 mr-0.5">
              {getHeartIcon(entry.protected, "h-full w-full")}
            </span>
          );
        }
      );

      // 'More' Icon
      if (totalEntriesCount > maxIcons) {
        icons.push(
          <span
            key="more"
            className="text-xs font-bold text-gray-500 leading-none"
          >{`+${totalEntriesCount - maxIcons}`}</span>
        );
      }
    }
    
    return icons;
  };

  // Build tooltip with predictions
  const tooltipParts = [
    flow && flow !== 'none' && `Period: ${flow}`,
    sexEntries.length > 0 &&
      `${sexEntries.length} Intimacy Entr${
        sexEntries.length === 1 ? 'y' : 'ies'
      }`,
    (shouldShowPredictions && isPredictedPeriod) && 'Predicted Period Day',
    (shouldShowPredictions && isPredictedOvulation) && 'Predicted Ovulation Day',
  ].filter(Boolean);

  const tooltip = tooltipParts.length > 0 ? tooltipParts.join(', ') : 'No entries';

  // Build CSS classes
  const classNames = [
    'day-cell',
    'border',
    'rounded-md',
    'flex',
    'flex-col',
    'p-2',
    'cursor-pointer',
    'transition',
    'relative',
  ];

  // Add prediction classes
  if (shouldShowPredictions && isPredictedPeriod) {
    classNames.push('predicted-period');
  } else if (shouldShowPredictions && isPredictedOvulation) {
    classNames.push('predicted-ovulation');
  }

  // Add today class
  if (today) {
    classNames.push('today');
  }

  // Add current month class
  if (isCurrentMonth) {
    classNames.push('current-month');
  }

  // Add visual styling for predictions with thick borders and background colors
  if (shouldShowPredictions && isPredictedPeriod) {
    classNames.push('bg-red-200', 'border-4', 'border-red-500', 'shadow-sm');
  } else if (shouldShowPredictions && isPredictedOvulation) {
    classNames.push('bg-yellow-200', 'border-4', 'border-yellow-500', 'shadow-sm');
  } else if (today) {
    classNames.push('bg-pink-50', 'border-2', 'border-pink-400', 'shadow-inner', 'z-10');
  } else if (isCurrentMonth) {
    classNames.push('border-gray-300', 'hover:bg-pink-50', 'hover:border-pink-200');
  } else {
    classNames.push('border-gray-100', 'opacity-50', 'hover:opacity-75');
  }

  const moodScore = wellnessLog?.mood_score as MoodScore | null | undefined;

  return (
    <div
      className={classNames.join(' ')}
      onClick={() => onClick(date)}
      title={tooltip}
    >
      {/* Mood dot — top-right corner */}
      {moodScore && (
        <span
          className="absolute top-0.5 right-0.5 text-[10px] leading-none"
          title={`Mood: ${MOOD_EMOJI[moodScore]}`}
        >
          {MOOD_EMOJI[moodScore]}
        </span>
      )}
      <span
        className={`day-number text-sm leading-none ${
          (shouldShowPredictions && isPredictedPeriod)
            ? 'font-semibold text-red-600'
            : (shouldShowPredictions && isPredictedOvulation)
              ? 'font-semibold text-yellow-600'
              : today 
                ? 'font-semibold text-pink-600' 
                : isCurrentMonth
                  ? 'font-medium text-gray-700'
                  : 'font-light text-gray-400'
        }`}
      >
        {date.getDate()}
        {shouldShowPredictions && isPredictedPeriod ? ' 🍫' : shouldShowPredictions && isPredictedOvulation ? ' 🌻' : ''}
      </span>
      {renderIcons().length > 0 && (
        <div className="mt-auto icon-container flex flex-wrap gap-x-0.5">
          {renderIcons()}
        </div>
      )}
    </div>
  );
}

// Helper functions for predictions
function usePredictedPeriod(date: Date, periodStats?: PeriodStats | null): boolean {
  if (!periodStats?.predicted_next || !periodStats.avg_cycle) return false;
  
  try {
    // Parse the GMT date string properly (e.g., "Sun, 19 Oct 2025 00:00:00 GMT")
    const predictedNext = new Date(periodStats.predicted_next);
    
    // Calculate predicted period duration (assume 5 days average)
    const periodDuration = 5;
    const periodStart = new Date(predictedNext);
    const periodEnd = new Date(predictedNext);
    periodEnd.setDate(periodEnd.getDate() + periodDuration - 1);
    
    // Compare dates only (ignore time)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    const endOnly = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
    
    return dateOnly >= startOnly && dateOnly <= endOnly;
  } catch (error) {
    console.error('Error in usePredictedPeriod:', error);
    return false;
  }
}

function usePredictedOvulation(date: Date, periodStats?: PeriodStats | null): boolean {
  if (!periodStats?.ovulation_window) return false;
  
  try {
    const [ovulationStart, ovulationEnd] = periodStats.ovulation_window;
    // Parse the GMT date strings properly (e.g., "Fri, 03 Oct 2025 00:00:00 GMT")
    const startDate = new Date(ovulationStart);
    const endDate = new Date(ovulationEnd);
    
    // Compare dates only (ignore time)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return dateOnly >= startOnly && dateOnly <= endOnly;
  } catch (error) {
    console.error('Error in usePredictedOvulation:', error);
    return false;
  }
}