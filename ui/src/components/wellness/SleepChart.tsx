'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { WellnessEntry } from '@/types/wellness';

interface Props {
  entries: WellnessEntry[];
}

export default function SleepChart({ entries }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const sleepEntries = entries.filter(
    (e) => e.sleep_hours !== null || e.sleep_quality !== null
  );

  useEffect(() => {
    if (!canvasRef.current || sleepEntries.length === 0) return;

    const labels = sleepEntries.map((e) => {
      const d = new Date(e.date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Hours slept',
            data: sleepEntries.map((e) => e.sleep_hours),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.10)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1',
            borderWidth: 2,
            yAxisID: 'yHours',
            spanGaps: true,
          },
          {
            label: 'Sleep quality',
            data: sleepEntries.map((e) => e.sleep_quality),
            borderColor: '#06b6d4',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#06b6d4',
            borderWidth: 2,
            borderDash: [4, 3],
            yAxisID: 'yQuality',
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
          yHours: {
            position: 'left',
            min: 0, max: 12,
            ticks: { stepSize: 2, font: { size: 10 } },
            title: { display: true, text: 'Hours', font: { size: 10 } },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          yQuality: {
            position: 'right',
            min: 0, max: 5,
            ticks: { stepSize: 1, font: { size: 10 } },
            title: { display: true, text: 'Quality (1-5)', font: { size: 10 } },
            grid: { drawOnChartArea: false },
          },
          x: { ticks: { font: { size: 10 }, maxTicksLimit: 10 } },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
      },
    };

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, config);
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [sleepEntries]);

  if (sleepEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Log sleep data to see your patterns.
      </div>
    );
  }

  return <div className="h-52"><canvas ref={canvasRef} /></div>;
}
