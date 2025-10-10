import { SexStats } from '@/types';

interface IntimacyPanelProps {
  stats: SexStats | null;
}

export default function IntimacyPanel({ stats }: IntimacyPanelProps) {
  if (!stats) {
    return <div className="text-gray-500">Loading intimacy stats...</div>;
  }

  const statCard = (label: string, value: string | number) => (
    <div className="bg-white rounded-lg shadow-md p-4 text-center transform hover:scale-105 transition">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-pink-600">{value}</p>
    </div>
  );

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-700 mb-4">Intimacy Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCard('Total Entries', stats.total)}
        {statCard('Days Since Last', stats.days_since_last)}
        {statCard('Longest Streak (with)', `${stats.longest_with} days`)}
        {statCard(
          'Longest Streak (without)',
          stats.longest_without ? `${stats.longest_without} days` : 'N/A'
        )}
        {statCard(
          'Avg. Time Between',
          isFinite(stats.avg_gap_days)
            ? `${stats.avg_gap_days.toFixed(2)} days`
            : 'N/A'
        )}
        {statCard(
          'Avg. per Week',
          isFinite(stats.entries_per_week)
            ? stats.entries_per_week.toFixed(2)
            : 'N/A'
        )}
        {statCard(
          'Avg. per Month',
          isFinite(stats.entries_per_month)
            ? stats.entries_per_month.toFixed(2)
            : 'N/A'
        )}
        {statCard(
          'Avg. Satisfaction',
          stats.avg_satisfaction != null && isFinite(Number(stats.avg_satisfaction))
            ? `${Number(stats.avg_satisfaction).toFixed(2)}/5`
            : 'N/A'
        )}
        {statCard('Most Common Time', stats.most_common_time ?? 'N/A')}
      </div>
    </div>
  );
}