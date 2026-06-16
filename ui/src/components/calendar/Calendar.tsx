
import { useState, useEffect } from 'react';
import DayCell from './DayCell';
import MonthNavigation from './MonthNavigation';
import { Entry, PeriodStats } from '@/types';
import { WellnessEntry } from '@/types/wellness';
import { getDaysInMonth, getFirstDayOfMonth } from '@/utils/date';
import '@/styles/calendar.css';

interface CalendarProps {
  currentDisplayDate: Date;
  onMonthChange: (date: Date) => void;
  entries: Entry[];
  onDateSelect: (date: Date) => void;
  periodStats?: PeriodStats | null;
  wellnessLogs?: WellnessEntry[];
}

export default function Calendar({
  currentDisplayDate,
  onMonthChange,
  entries,
  onDateSelect,
  periodStats,
  wellnessLogs = [],
}: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const days: Date[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(new Date(year, month, -firstDay + i + 1));
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    setCalendarDays(days);
  }, [currentDisplayDate]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDisplayDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDisplayDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  // Group entries by date for efficient lookup
  const entriesByDate = entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  // Index wellness logs by date
  const wellnessByDate = wellnessLogs.reduce<Record<string, WellnessEntry>>((acc, log) => {
    acc[log.date] = log;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-full overflow-hidden">
      <MonthNavigation
        currentDate={currentDisplayDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <div className="calendar-grid text-sm font-medium text-gray-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {calendarDays.map((date, index) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateKey = `${year}-${month}-${day}`;
          const isCurrentMonth = date.getMonth() === currentDisplayDate.getMonth();
          return (
            <DayCell
              key={dateKey + index}
              date={date}
              entries={entriesByDate[dateKey] || []}
              onClick={onDateSelect}
              isCurrentMonth={isCurrentMonth}
              periodStats={periodStats}
              allEntries={entries}
              currentDisplayDate={currentDisplayDate}
              wellnessLog={wellnessByDate[dateKey] ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}