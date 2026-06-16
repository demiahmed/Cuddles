import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';

interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
  missing: number;
}

interface TimeDistributionChartProps {
  distribution: TimeDistribution;
}

export default function TimeDistributionChart({ distribution }: TimeDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!chartRef.current || !distribution) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;

    const labels = ['Morning (6-11)', 'Afternoon (12-17)', 'Evening (18-21)', 'Night (22-5)', 'Missing Data'];
    const data = [
      distribution.morning,
      distribution.afternoon,
      distribution.evening,
      distribution.night,
      distribution.missing
    ];

    const colors = [
      'rgba(251, 191, 36, 0.8)',  // morning - yellow
      'rgba(34, 197, 94, 0.8)',   // afternoon - green
      'rgba(239, 68, 68, 0.8)',   // evening - red
      'rgba(147, 51, 234, 0.8)',  // night - purple
      'rgba(156, 163, 175, 0.8)'  // missing - gray
    ];

    const borderColors = [
      '#f59e0b',  // morning
      '#22c55e',  // afternoon
      '#ef4444',  // evening
      '#9333ea',  // night
      '#9ca3af'   // missing
    ];

    const config: ChartConfiguration = {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: 'Sex Entries',
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: chartType === 'bar' ? 4 : 0,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: chartType === 'pie' && !isMobile,
            position: 'bottom' as const,
            labels: {
              padding: 15,
              usePointStyle: true,
              font: { size: 11 },
              color: '#000000' // Pure black for maximum contrast
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = chartType === 'bar' ? context.parsed.y : context.parsed;
                const total = data.reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${value} entries (${percentage}%)`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#8b5cf6',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 }
          },
        },
        scales: chartType === 'bar' ? {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: { size: isMobile ? 10 : 11 }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              font: { size: isMobile ? 10 : 11 }
            },
            grid: {
              display: false
            }
          }
        } : undefined,
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [distribution, chartType]);

  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h4 className="text-lg font-semibold text-gray-600">
          Time of Day Distribution
        </h4>

        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              chartType === 'bar'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
            }`}
          >
            📊
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              chartType === 'pie'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
            }`}
          >
            🥧
          </button>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 text-center">
          Total entries: {total}
        </p>
      </div>

      {total === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">🕐</p>
            <p>No time data available</p>
            <p className="text-sm">Add entries with time information to see distribution</p>
          </div>
        </div>
      ) : (
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <canvas
            ref={chartRef}
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          />
        </div>
      )}

      {/* Legend for mobile pie chart */}
      {chartType === 'pie' && isMobile && total > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Morning: {distribution.morning}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Afternoon: {distribution.afternoon}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Evening: {distribution.evening}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span>Night: {distribution.night}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Missing: {distribution.missing}</span>
          </div>
        </div>
      )}
    </div>
  );
}