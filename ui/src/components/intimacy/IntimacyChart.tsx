import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

interface MonthlyEntry {
  month: string;
  count: number;
  month_key: string;
}

interface IntimacyChartProps {
  monthlyData: MonthlyEntry[];
}

type FilterType = 'all' | 'year';
type TimeRange = {
  label: string;
  value: string;
  startDate?: Date;
  endDate?: Date;
}

export default function IntimacyChart({ monthlyData }: IntimacyChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedRange, setSelectedRange] = useState<string>(new Date().getFullYear().toString());

  // Generate available time ranges based on data
  const availableRanges = () => {
    if (!monthlyData?.length) return [];

    const dates = monthlyData.map(d => new Date(d.month_key + '-01'));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const ranges: TimeRange[] = [{ label: 'All Time', value: 'all' }];

    // Generate year ranges
    for (let year = maxDate.getFullYear(); year >= minDate.getFullYear(); year--) {
      ranges.push({
        label: year.toString(),
        value: year.toString(),
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31, 23, 59, 59)
      });
    }

    return ranges;
  };

  // Filter data based on selected range
  const getFilteredData = () => {
    if (!monthlyData?.length) return [];

    if (selectedRange === 'all') return monthlyData;

    const ranges = availableRanges();
    const selectedRangeData = ranges.find(r => r.value === selectedRange);

    if (!selectedRangeData?.startDate || !selectedRangeData?.endDate) {
      return monthlyData;
    }

    return monthlyData.filter(d => {
      const date = new Date(d.month_key + '-01');
      return date >= selectedRangeData.startDate! && date <= selectedRangeData.endDate!;
    });
  };

  // Auto-adjust default year if current year has no data
  useEffect(() => {
    if (monthlyData?.length && selectedRange === new Date().getFullYear().toString()) {
      const currentYearData = getFilteredData();
      if (currentYearData.length === 0) {
        setSelectedRange('all');
      }
    }
  }, [monthlyData]);

  useEffect(() => {
    if (!chartRef.current || !monthlyData?.length) return;

    const filteredData = getFilteredData();
    if (!filteredData.length) return;

    const dataPoints = filteredData.map((d, index) => ({
      x: new Date(d.month_key + '-01').getTime(),
      y: d.count,
    }));

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Determine if we're on mobile
    const isMobile = window.innerWidth < 768;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Sex Entries',
            data: dataPoints,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.2,
            pointRadius: isMobile ? 6 : 4,
            pointHoverRadius: isMobile ? 8 : 6,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            showLine: true,
            borderWidth: isMobile ? 3 : 2,
            cubicInterpolationMode: 'monotone',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: dataPoints.length > 6 ? 'month' : 'month',
              displayFormats: {
                month: 'MMM yy',
              }
            },
            title: {
              display: !isMobile,
              text: 'Month',
              font: { size: isMobile ? 10 : 12 }
            },
            ticks: {
              maxTicksLimit: isMobile ? 4 : 8,
              font: { size: isMobile ? 10 : 11 }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: dataPoints.length > 0
              ? Math.max(10, Math.max(...dataPoints.map((p) => p.y)) + 2)
              : 10,
            title: {
              display: !isMobile,
              text: 'Entries',
              font: { size: isMobile ? 10 : 12 }
            },
            ticks: {
              stepSize: 1,
              font: { size: isMobile ? 10 : 11 }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
        },
        plugins: {
          zoom: {
            limits: {
              x: {
                min: dataPoints.length > 0 ? dataPoints[0].x - 30 * 24 * 60 * 60 * 1000 : 'original',
                max: dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].x + 30 * 24 * 60 * 60 * 1000 : 'original'
              }
            },
            pan: {
              enabled: true,
              mode: 'x',
              threshold: isMobile ? 10 : 5,
              modifierKey: isMobile ? undefined : 'ctrl'
            },
            zoom: {
              wheel: {
                enabled: !isMobile,
                speed: 0.1,
                modifierKey: 'ctrl'
              },
              pinch: {
                enabled: isMobile
              },
              drag: {
                enabled: false
              },
              mode: 'x'
            },
          },
          legend: {
            display: !isMobile,
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 }
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              title: (context: any) => {
                const date = new Date(context[0].parsed.x);
                return date.toLocaleDateString('en-GB', {
                  month: 'long',
                  year: 'numeric'
                });
              },
              label: (context: any) => `${context.parsed.y} entr${context.parsed.y === 1 ? 'y' : 'ies'}`
            },
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#8b5cf6',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 }
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
  }, [monthlyData, selectedRange]);

  const ranges = availableRanges();
  const filteredData = getFilteredData();

  const resetZoom = () => {
    if (chartInstance.current) {
      chartInstance.current.resetZoom();
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h4 className="text-lg font-semibold text-gray-600">
          Monthly Intimacy Activity
        </h4>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="px-4 py-2.5 text-sm font-medium text-gray-800 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-gradient-to-r from-white to-purple-50 hover:from-purple-50 hover:to-purple-100 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            {ranges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <button
            onClick={resetZoom}
            className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md border border-purple-200"
          >
            Reset Zoom
          </button>
        </div>
      </div>

      {/* Mobile instructions */}
      <div className="block sm:hidden mb-3">
        <p className="text-xs text-gray-500 text-center">
          📱 Pinch to zoom • Swipe to pan • Use filter above for specific periods
        </p>
      </div>

      {/* Desktop instructions */}
      <div className="hidden sm:block mb-3">
        <p className="text-xs text-gray-500 text-center">
          🖱️ Ctrl+Scroll to zoom • Ctrl+Drag to pan • Use filter above for specific periods
        </p>
      </div>

      {filteredData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">📊</p>
            <p>No intimacy data for selected period</p>
            <p className="text-sm">Try selecting "All Time" or a different range</p>
          </div>
        </div>
      ) : (
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <canvas
            ref={chartRef}
            style={{
              touchAction: 'pan-x pinch-zoom',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          />
        </div>
      )}

      {/* Data summary */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Showing {filteredData.length} month{filteredData.length !== 1 ? 's' : ''}
          {selectedRange !== 'all' && (
            <span> • <button
              onClick={() => setSelectedRange('all')}
              className="text-purple-600 hover:text-purple-800 underline"
            >
              View all {monthlyData?.length || 0} months
            </button></span>
          )}
        </p>
      </div>
    </div>
  );
}