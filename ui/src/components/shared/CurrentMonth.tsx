import { SexStats } from '@/types';

interface CurrentMonthProps {
  sexStats: SexStats | null;
}

export default function CurrentMonth({ sexStats }: CurrentMonthProps) {
  return (
    <div id="current-month" className="mb-4">
      <div
        id="current-month-sex-card-container"
        className="bg-white rounded-lg shadow-md p-4 text-center transform hover:scale-105 transition"
      >
        <p className="text-lg font-semibold text-gray-700">This Month</p>
        <p className="text-2xl font-bold text-pink-600">
          {sexStats?.current_month_count || 0} entries
        </p>
      </div>
    </div>
  );
}