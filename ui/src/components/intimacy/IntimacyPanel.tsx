import { SexStats } from '@/types';
import { useEffect, useState } from 'react';
import IntimacyChart from './IntimacyChart';
import TimeDistributionChart from './TimeDistributionChart';

interface IntimacyPanelProps {
  stats: SexStats | null;
}

interface MonthlyEntry {
  month: string;
  count: number;
  month_key: string;
}

interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
  missing: number;
}

export default function IntimacyPanel({ stats }: IntimacyPanelProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyEntry[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution>({
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
    missing: 0
  });

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch('/api/stats/sex/monthly');
        if (response.ok) {
          const data = await response.json();
          setMonthlyData(data);
        }
      } catch (error) {
        console.error('Failed to fetch monthly intimacy data:', error);
      }
    };

    const fetchTimeDistribution = async () => {
      try {
        const response = await fetch('/api/stats/sex/time-distribution');
        if (response.ok) {
          const data = await response.json();
          setTimeDistribution(data);
        }
      } catch (error) {
        console.error('Failed to fetch time distribution data:', error);
      }
    };

    fetchMonthlyData();
    fetchTimeDistribution();
  }, []);

  if (!stats) {
    return <div className="text-gray-400 text-sm py-8 text-center">Loading…</div>;
  }

  const statCard = (
    label: string,
    value: string | number,
    icon: string,
    subtitle?: string | null,
    color: string = 'bg-pink-50 border-pink-200 text-pink-900',
  ) => (
    <div className={`rounded-2xl border-2 p-4 text-center ${color}`}>
      <span className="text-2xl">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wide mt-2 mb-0.5 opacity-60">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-50 mt-0.5">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
        {statCard('Total entries', stats.total, '📊', null, 'bg-purple-50 border-purple-200 text-purple-900')}
        {statCard('Days since last', stats.days_since_last, '⏰', null, 'bg-blue-50 border-blue-200 text-blue-900')}
        {statCard('Longest streak (with)', `${stats.longest_with} days`, '🔥', stats.longest_with_period || null, 'bg-orange-50 border-orange-200 text-orange-900')}
        {statCard('Longest streak (without)', stats.longest_without ? `${stats.longest_without} days` : 'N/A', '❄️', stats.longest_without_period || null, 'bg-cyan-50 border-cyan-200 text-cyan-900')}
        {statCard('Avg time between', isFinite(stats.avg_gap_days) ? `${stats.avg_gap_days.toFixed(1)} days` : 'N/A', '📅', null, 'bg-amber-50 border-amber-200 text-amber-900')}
        {statCard('Avg per week', isFinite(stats.entries_per_week) ? stats.entries_per_week.toFixed(1) : 'N/A', '📈', null, 'bg-indigo-50 border-indigo-200 text-indigo-900')}
        {statCard('Avg per month', isFinite(stats.entries_per_month) ? stats.entries_per_month.toFixed(1) : 'N/A', '📋', null, 'bg-teal-50 border-teal-200 text-teal-900')}
        {statCard('Avg satisfaction', stats.avg_satisfaction != null && isFinite(Number(stats.avg_satisfaction)) ? `${Number(stats.avg_satisfaction).toFixed(1)}/5` : 'N/A', '⭐', null, 'bg-rose-50 border-rose-200 text-rose-900')}
        {statCard('Most common time', stats.most_common_time ?? 'N/A', '🕐', null, 'bg-violet-50 border-violet-200 text-violet-900')}
      </div>
      <IntimacyChart monthlyData={monthlyData} />
      <TimeDistributionChart distribution={timeDistribution} />
    </div>
  );
}