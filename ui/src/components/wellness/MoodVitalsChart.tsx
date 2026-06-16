'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { WellnessEntry } from '@/types/wellness';

interface Props {
  entries: WellnessEntry[];
}

export default function MoodVitalsChart({ entries }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || entries.length === 0) return;

    const labels = entries.map((e) => {
      const d = new Date(e.date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Mood',
            data: entries.map((e) => e.mood_score),
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236,72,153,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#ec4899',
            borderWidth: 2,
            spanGaps: true,
          },
          {
            label: 'Energy',
            data: entries.map((e) => e.energy_level),
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [4, 3],
            spanGaps: true,
          },
          {
            label: 'Stress',
            data: entries.map((e) => e.stress_level),
            borderColor: '#8b5cf6',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#8b5cf6',
            borderWidth: 2,
            borderDash: [2, 4],
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true, padding: 12 } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          y: {
            min: 0, max: 5,
            ticks: { stepSize: 1, font: { size: 10 } },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          x: { ticks: { font: { size: 10 }, maxTicksLimit: 10 } },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
      },
    };

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, config);
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No data yet — log a few days to see trends.
      </div>
    );
  }

  return <div className="h-52"><canvas ref={canvasRef} /></div>;
}
