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
import WellnessPanel from '@/components/wellness/WellnessPanel';
import EntryModal from '@/components/shared/EntryModal';
import SpecialMessage from '@/components/shared/SpecialMessage';
import CurrentMonth from '@/components/shared/CurrentMonth';
import TabNavigation from '@/components/shared/TabNavigation';
import { Entry, PeriodStats, SexStats } from '@/types';
import { WellnessEntry } from '@/types/wellness';
import { fetchData, loadData as fetchEntries } from '@/utils/api';
import { fetchWellnessMonth } from '@/utils/wellness';
import { formatDate } from '@/utils/date';

type ActivePanel = 'calendar' | 'period' | 'intimacy' | 'wellness';

export default function AppRoot() {
  // Initialize activePanel with URL parameter detection
  const getInitialTab = (): ActivePanel => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as ActivePanel;
      if (tabParam && ['calendar', 'period', 'intimacy', 'wellness'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'calendar';
  };

  const [activePanel, setActivePanel] = useState<ActivePanel>(getInitialTab());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const [sexStats, setSexStats] = useState<SexStats | null>(null);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessEntry[]>([]);
  const [wellnessCalendarDate, setWellnessCalendarDate] = useState<string | null>(null);

  const loadData = useCallback(async (year: number, month: number) => {
    try {
      const [data, wellness] = await Promise.all([
        fetchEntries(year, month),
        fetchWellnessMonth(year, month + 1),
      ]);

      const sortedData = data.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time_of_day || '').localeCompare(b.time_of_day || '');
      });

      setEntries(sortedData);
      setWellnessLogs(wellness);
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

  // Handle URL parameter changes (for PWA shortcuts and browser navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as ActivePanel;
      if (tabParam && ['calendar', 'period', 'intimacy', 'wellness'].includes(tabParam)) {
        setActivePanel(tabParam as ActivePanel);
      }
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

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

  const handleTabChange = useCallback((panel: ActivePanel) => {
    setActivePanel(panel);
    setWellnessCalendarDate(null);

    // Update URL for better UX and PWA shortcuts
    const url = new URL(window.location.href);
    if (panel === 'calendar') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', panel);
    }

    // Update URL without triggering a reload
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleOpenWellnessFromCalendar = useCallback(() => {
    if (!selectedDate) return;
    const dateStr = formatDate(selectedDate);
    setIsModalOpen(false);
    setSelectedDate(null);
    setWellnessCalendarDate(dateStr);
    setActivePanel('wellness');
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'wellness');
    window.history.pushState({}, '', url.toString());
  }, [selectedDate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-4xl">
        <ServiceWorkerRegistration />
        <header className="mb-6 text-center relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
            Cuddles 🤗
          </h1>
          <p className="mt-2 text-gray-500">Your personal wellness calendar.</p>
        </header>

        <TabNavigation
          activePanel={activePanel}
          onTabChange={handleTabChange}
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
              periodStats={periodStats}
              wellnessLogs={wellnessLogs}
            />
          )}
          {activePanel === 'period' && <PeriodPanel stats={periodStats} />}
          {activePanel === 'intimacy' && <IntimacyPanel stats={sexStats} />}
          {activePanel === 'wellness' && (
            <WellnessPanel
              key={wellnessCalendarDate ?? 'today'}
              initialDate={wellnessCalendarDate}
              onWellnessSaved={() => {
                const year = currentDisplayDate.getFullYear();
                const month = currentDisplayDate.getMonth();
                loadData(year, month);
              }}
              onBack={() => {
                setWellnessCalendarDate(null);
                handleTabChange('calendar');
              }}
            />
          )}
        </main>
      </div>

      {isModalOpen && selectedDate && (
        <EntryModal
          date={formatDate(selectedDate)}
          entries={entries}
          onClose={handleModalClose}
          onSave={handleEntrySaved}
          onOpenWellness={handleOpenWellnessFromCalendar}
        />
      )}
    </div>
  );
}