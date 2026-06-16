import { PeriodStats } from '@/types';
import CycleChart from './CycleChart';

interface PeriodPanelProps {
  stats: PeriodStats | null;
}

export default function PeriodPanel({ stats }: PeriodPanelProps) {
  if (!stats) {
    return <div className="text-gray-400 text-sm py-8 text-center">Loading…</div>;
  }

  const avgDuration =
    stats.durations.length > 0
      ? (
          stats.durations.reduce((sum, d) => sum + d.duration_days, 0) /
          stats.durations.length
        ).toFixed(1)
      : 'N/A';

  const statCard = (label: string, value: string, icon: string, color: string) => (
    <div className={`rounded-2xl border-2 p-4 text-center ${color}`}>
      <span className="text-2xl">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wide mt-2 mb-0.5 opacity-60">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCard('Avg cycle length', stats.avg_cycle ? `${stats.avg_cycle} days` : 'N/A', '🔄', 'bg-purple-50 border-purple-200 text-purple-900')}
        {statCard('Avg period duration', `${avgDuration} days`, '🌹', 'bg-rose-50 border-rose-200 text-rose-900')}
        {statCard('Next period', stats.predicted_next ? new Date(stats.predicted_next).toLocaleDateString('en-GB') : 'N/A', '📅', 'bg-blue-50 border-blue-200 text-blue-900')}
      </div>
      <CycleChart stats={stats} />
    </div>
  );
}
