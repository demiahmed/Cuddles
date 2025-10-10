import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { PeriodStats } from '@/types';
import 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

interface CycleChartProps {
  stats: PeriodStats;
}

export default function CycleChart({ stats }: CycleChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !stats?.cycle_lengths?.length) return;

    const dataPoints = stats.cycle_lengths.map((cl) => ({
      x: new Date(cl.start).getTime(),
      y: cl.length_days,
    }));

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Cycle Length (days)',
            data: dataPoints,
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true,
            tension: 0.2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#ec4899',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            showLine: true,
            borderWidth: 2,
            cubicInterpolationMode: 'monotone',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'year', displayFormats: { year: 'yyyy' } },
            title: { display: true, text: 'Period Start Date' },
            min: dataPoints.length > 0
              ? dataPoints[0].x - 15 * 24 * 60 * 60 * 1000
              : undefined,
            max: dataPoints.length > 0
              ? dataPoints[dataPoints.length - 1].x + 15 * 24 * 60 * 60 * 1000
              : undefined,
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: dataPoints.length > 0
              ? Math.max(10, Math.max(...dataPoints.map((p) => p.y)) + 10)
              : 40,
            title: { display: true, text: 'Cycle Length (days)' },
            ticks: { stepSize: 5 },
          },
        },
        plugins: {
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
            },
          },
          legend: { display: true },
          tooltip: {
            callbacks: { label: (context) => `${context.parsed.y} days` },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stats]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner" style={{ height: '400px' }}>
      <h4 className="text-lg font-semibold text-gray-600 mb-2 text-center">
        Cycle Length History
      </h4>
      <div style={{ position: 'relative', height: 'calc(100% - 40px)', width: '100%' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}