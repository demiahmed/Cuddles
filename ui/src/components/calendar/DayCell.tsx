import { Entry, FlowType, ProtectionType } from '@/types';
import { BloodDrop, getHeartIcon } from '@/components/shared/Icons';
import { isToday } from '@/utils/date';
// import { useEffect } from 'react'; // No longer needed for debug logs

interface DayCellProps {
  date: Date;
  entries?: Entry[];
  onClick: (date: Date) => void;
}

export default function DayCell({ date, entries = [], onClick }: DayCellProps) {
  const periodEntries = entries.filter(
    (e) => e.entry_type === 'period_start' || e.entry_type === 'period_end'
  );
  const sexEntries = entries.filter((e) => e.entry_type === 'sex');
  const flow = periodEntries.find((e) => e.flow)?.flow || null;
  const today = isToday(date);

  const renderIcons = () => {
    const icons: React.ReactElement[] = [];
    
    // 1. Period Icon (Blood Drop)
    if (flow && flow !== 'none') {
      icons.push(
        <span key="blood" className="inline-flex items-center justify-center h-3.5 w-3.5 mr-0.5">
          <BloodDrop className="h-full w-full text-pink-500" />
        </span>
      );
    }


    // 2. Sex/Intimacy Icons (Hearts)
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
              {getHeartIcon(entry.protected, "h-full w-full text-pink-500")}
            </span>
          );
        }
      );

      // 3. 'More' Icon
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

  const tooltip = [
    flow && flow !== 'none' && `Period: ${flow}`,
    sexEntries.length > 0 &&
      `${sexEntries.length} Intimacy Entr${
        sexEntries.length === 1 ? 'y' : 'ies'
      }`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={`day-cell border border-gray-200 rounded-md flex flex-col p-2 cursor-pointer transition ${
        today ? 'bg-pink-50 ring-2 ring-pink-500' : 'hover:bg-pink-50'
      }`}
      onClick={() => onClick(date)}
      title={tooltip || 'No entries'}
    >
      <span
        className={`text-sm ${
          today ? 'font-bold text-pink-600' : 'text-gray-700'
        } leading-none`}
      >
        {date.getDate()}
      </span>
      {renderIcons().length > 0 && (
        <div className="mt-auto icon-container flex flex-wrap gap-x-0.5">
          {renderIcons()}
        </div>
      )}
    </div>
  );
}