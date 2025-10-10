import { PeriodStats } from '@/types';
import CycleChart from './CycleChart';

interface PeriodPanelProps {
  stats: PeriodStats | null;
}

export default function PeriodPanel({ stats }: PeriodPanelProps) {
  if (!stats) {
    return <div className="text-gray-500">Loading period stats...</div>;
  }

  const avgDuration =
    stats.durations.length > 0
      ? (
          stats.durations.reduce((sum, d) => sum + d.duration_days, 0) /
          stats.durations.length
        ).toFixed(1)
      : 'N/A';

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-700 mb-4">Cycle Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center transform hover:scale-105 transition">
          <p className="text-sm font-medium text-gray-600">Average Cycle Length</p>
          <p className="text-2xl font-bold text-pink-600">
            {stats.avg_cycle ? `${stats.avg_cycle} days` : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center transform hover:scale-105 transition">
          <p className="text-sm font-medium text-gray-600">Average Period Duration</p>
          <p className="text-2xl font-bold text-pink-600">{avgDuration} days</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center transform hover:scale-105 transition">
          <p className="text-sm font-medium text-gray-600">Predicted Next Period</p>
          <p className="text-2xl font-bold text-pink-600">
            {stats.predicted_next
              ? new Date(stats.predicted_next).toLocaleDateString('en-GB')
              : 'N/A'}
          </p>
        </div>
      </div>
      <CycleChart stats={stats} />
    </div>
  );
}
