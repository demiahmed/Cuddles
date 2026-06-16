import { SexStats } from '@/types';
import { useState, useEffect } from 'react';
import { loadMonthlySexStats } from '@/utils/api';

interface CurrentMonthProps {
  sexStats: SexStats | null;
}

export default function CurrentMonth({ sexStats }: CurrentMonthProps) {
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; count: number }>>([]);
  const [insightMessage, setInsightMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMonthlySexStats();
      setMonthlyData(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (monthlyData.length === 0 || !sexStats) return;

    const counts = monthlyData.map(d => d.count);
    const getPercentile = (arr: number[], p: number) => {
      const sorted = arr.slice().sort((a, b) => a - b);
      const index = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;
      if (upper >= sorted.length) return sorted[sorted.length - 1];
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    const p25 = getPercentile(counts, 25);
    const p50 = getPercentile(counts, 50);
    const p75 = getPercentile(counts, 75);
    const p95 = getPercentile(counts, 95);

    const current = sexStats.current_month_count || 0;
    let band: keyof typeof messages;
    if (current > p95) band = 'top';
    else if (current > p75) band = 'good';
    else if (current > p50) band = 'average';
    else if (current > p25) band = 'low';
    else band = 'verylow';

    const messages = {
      top: [
        "Fucking dominating! Keep that passion raging.",
        "Holy shit, absolute beast! Wrecking it.",
        "Crushing it! Driving us both wild."
      ],
      good: [
        "Killing it! Fire burning hot.",
        "Moves on point! Loving the ride.",
        "Step it up! Unleash that wild side."
      ],
      average: [
        "Not bad, fuck harder. Step up.",
        "Slacking? Fuck like you mean it.",
        "Pathetic. Get laid, turn it around."
      ],
      low: [
        "Slacking? Pound it out tonight.",
        "Pathetic effort. Get ravished now.",
        "Low action? Dive in deep."
      ],
      verylow: [
        "Pathetic. Get laid now.",
        "Dust off, get thoroughly fucked.",
        "Slacking hard? Ravish each other."
      ]
    };

    const randomMessage = messages[band][Math.floor(Math.random() * messages[band].length)];
    setInsightMessage(randomMessage);
  }, [monthlyData, sexStats]);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear();

  const count = sexStats?.current_month_count || 0;

  return (
    <div id="current-month" className="mb-4">
      <div
        id="current-month-sex-card-container"
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be185d 50%, #7c3aed 100%)' }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">{monthName}</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-6xl font-black text-white leading-none">{count}</span>
              <span className="text-base font-semibold text-white/70 mb-1">
                {count === 1 ? 'time' : 'times'}
              </span>
            </div>
          </div>
          <span className="text-4xl mt-1">🔥</span>
        </div>

        {/* Message bar */}
        {insightMessage && (
          <div className="mx-3 mb-3 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white tracking-wide">{insightMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}