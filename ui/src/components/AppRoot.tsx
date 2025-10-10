'use client';

import { useEffect, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';

const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ServiceWorkerRegistration'),
  { ssr: false }
);
import Calendar from '@/components/calendar/Calendar';
import PeriodPanel from '@/components/period/PeriodPanel';
import IntimacyPanel from '@/components/intimacy/IntimacyPanel';
import EntryModal from '@/components/shared/EntryModal';
import SpecialMessage from '@/components/shared/SpecialMessage';
import CurrentMonth from '@/components/shared/CurrentMonth';
import TabNavigation from '@/components/shared/TabNavigation';
import { Entry, PeriodStats, SexStats } from '@/types';
import { fetchData, loadData as fetchEntries } from '@/utils/api';
import { formatDate } from '@/utils/date';

type ActivePanel = 'calendar' | 'period' | 'intimacy';

export default function AppRoot() {
  const [activePanel, setActivePanel] = useState<ActivePanel>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const [sexStats, setSexStats] = useState<SexStats | null>(null);

  const loadData = useCallback(async (year: number, month: number) => {
    try {
      const data = await fetchEntries(year, month);
      
      // Sort entries by date and time, using original date string
      const sortedData = data.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time_of_day || '').localeCompare(b.time_of_day || '');
      });
      
      setEntries(sortedData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const [periodStats, sexStats] = await Promise.all([
        fetchData<PeriodStats>('/api/stats/periods'),
        fetchData<SexStats>('/api/stats/sex'),
      ]);
      setPeriodStats(periodStats);
      setSexStats(sexStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  useEffect(() => {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    loadData(year, month);
  }, [currentDisplayDate, loadData]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60 * 1000); // Refresh stats every minute
    return () => clearInterval(interval);
  }, [loadStats]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedDate(null);
    setIsModalOpen(false);
  }, []);

  const handleEntrySaved = useCallback(async (entryIdToRemove?: string) => {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    
    // If we have an entryIdToRemove, update state immediately for better UX
    if (entryIdToRemove) {
      setEntries(current => current.filter(entry => entry.id?.toString() !== entryIdToRemove));
    }
    
    // Then reload the data to ensure consistency
    await loadData(year, month);
    await loadStats();
  }, [currentDisplayDate, loadData, loadStats]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <ServiceWorkerRegistration />
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <header className="mb-6 text-center relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
            Cuddles 🤗
          </h1>
          <p className="mt-2 text-gray-500">Your personal wellness calendar.</p>
        </header>

        <TabNavigation
          activePanel={activePanel}
          onTabChange={(panel: ActivePanel) => setActivePanel(panel)}
        />

        <SpecialMessage periodStats={periodStats} />
        <CurrentMonth sexStats={sexStats} />

        <main>
          {activePanel === 'calendar' && (
            <Calendar
              currentDisplayDate={currentDisplayDate}
              onMonthChange={setCurrentDisplayDate}
              entries={entries}
              onDateSelect={handleDateSelect}
            />
          )}
          {activePanel === 'period' && <PeriodPanel stats={periodStats} />}
          {activePanel === 'intimacy' && <IntimacyPanel stats={sexStats} />}
        </main>
      </div>

      {isModalOpen && selectedDate && (
        <EntryModal
          date={formatDate(selectedDate)}
          entries={entries}
          onClose={handleModalClose}
          onSave={handleEntrySaved}
        />
      )}
    </div>
  );
}