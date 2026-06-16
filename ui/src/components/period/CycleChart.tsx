import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { PeriodStats } from '@/types';
import 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

interface CycleChartProps {
  stats: PeriodStats;
}

type FilterType = 'all' | 'year' | 'months';
type TimeRange = {
  label: string;
  value: string;
  startDate?: Date;
  endDate?: Date;
}

export default function CycleChart({ stats }: CycleChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedRange, setSelectedRange] = useState<string>(new Date().getFullYear().toString());

  // Generate available time ranges based on data
  const availableRanges = () => {
    if (!stats?.cycle_lengths?.length) return [];
    
    const dates = stats.cycle_lengths.map(cl => new Date(cl.start));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const ranges: TimeRange[] = [{ label: 'All Time', value: 'all' }];
    
    // Generate year ranges only (no months since cycles are monthly anyway)
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
    if (!stats?.cycle_lengths?.length) return [];
    
    if (selectedRange === 'all') return stats.cycle_lengths;
    
    const ranges = availableRanges();
    const selectedRangeData = ranges.find(r => r.value === selectedRange);
    
    if (!selectedRangeData?.startDate || !selectedRangeData?.endDate) {
      return stats.cycle_lengths;
    }
    
    return stats.cycle_lengths.filter(cl => {
      const date = new Date(cl.start);
      return date >= selectedRangeData.startDate! && date <= selectedRangeData.endDate!;
    });
  };

  // Auto-adjust default year if current year has no data
  useEffect(() => {
    if (stats?.cycle_lengths?.length && selectedRange === new Date().getFullYear().toString()) {
      const currentYearData = getFilteredData();
      if (currentYearData.length === 0) {
        // Fall back to 'all' if current year has no data
        setSelectedRange('all');
      }
    }
  }, [stats]);

  useEffect(() => {
    if (!chartRef.current || !stats?.cycle_lengths?.length) return;

    const filteredData = getFilteredData();
    if (!filteredData.length) return;

    const dataPoints = filteredData.map((cl) => ({
      x: new Date(cl.start).getTime(),
      y: cl.length_days,
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
            label: 'Cycle Length (days)',
            data: dataPoints,
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true,
            tension: 0.2,
            pointRadius: isMobile ? 6 : 4,
            pointHoverRadius: isMobile ? 8 : 6,
            pointBackgroundColor: '#ec4899',
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
              unit: dataPoints.length > 6 ? (dataPoints.length > 24 ? 'year' : 'month') : 'day',
              displayFormats: { 
                year: 'yyyy',
                month: 'MMM yy',
                day: 'MMM dd'
              } 
            },
            title: { 
              display: !isMobile, 
              text: 'Period Start Date',
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
            beginAtZero: false,
            min: dataPoints.length > 0
              ? Math.max(15, Math.min(...dataPoints.map((p) => p.y)) - 5)
              : 15,
            max: dataPoints.length > 0
              ? Math.max(35, Math.max(...dataPoints.map((p) => p.y)) + 5)
              : 40,
            title: { 
              display: !isMobile, 
              text: 'Days',
              font: { size: isMobile ? 10 : 12 }
            },
            ticks: { 
              stepSize: 2,
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
                enabled: false // Disable drag zoom to avoid conflicts with pan
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
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                });
              },
              label: (context: any) => `Cycle: ${context.parsed.y} days` 
            },
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#ec4899',
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
  }, [stats, selectedRange]);

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
          Cycle Length History
        </h4>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="px-4 py-2.5 text-sm font-medium text-gray-800 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-400 bg-gradient-to-r from-white to-pink-50 hover:from-pink-50 hover:to-pink-100 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            {ranges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={resetZoom}
            className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 rounded-lg hover:from-pink-200 hover:to-pink-300 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md border border-pink-200"
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
            <p className="text-lg mb-2">📅</p>
            <p>No cycle data for selected period</p>
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
          Showing {filteredData.length} cycle{filteredData.length !== 1 ? 's' : ''} 
          {selectedRange !== 'all' && (
            <span> • <button 
              onClick={() => setSelectedRange('all')} 
              className="text-pink-600 hover:text-pink-800 underline"
            >
              View all {stats?.cycle_lengths?.length || 0} cycles
            </button></span>
          )}
        </p>
      </div>
    </div>
  );
}