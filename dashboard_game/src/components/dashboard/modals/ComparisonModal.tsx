import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '../../../contexts/ThemeContext';
import { Line, Bar } from 'react-chartjs-2';
import { EventsData } from '../hooks/types';
import { filterComparisonData, TimeFilter } from '../../../utils/dashboard/comparisonFilter';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventsData: EventsData | null;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  eventsData
}) => {
  const { isDark } = useTheme();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const filteredData = useMemo(() => {
    return filterComparisonData(eventsData, timeFilter);
  }, [eventsData, timeFilter]);

  const handleClose = () => {
    setTimeFilter('all');
    setChartType('line');
    onClose();
  };

  if (!isOpen || !eventsData || !filteredData) {
    return null;
  }

  const totalStarted = filteredData.started.reduce((sum, day) => sum + day.count, 0);
  const totalClaimed = filteredData.claimed.reduce((sum, day) => sum + day.count, 0);
  const claimPercentage = totalStarted > 0 ? ((totalClaimed / totalStarted) * 100).toFixed(1) : '0';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 pb-32 overflow-y-auto">
          <div 
            className={`max-w-4xl w-full rounded-xl shadow-2xl p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок модального окна */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <Dialog.Title className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Соотношение: Запуск → Сбор
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Close>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 items-center mb-6">
              {[
                { key: 'all' as TimeFilter, label: '1D' },
                { key: '7' as TimeFilter, label: '1W' },
                { key: '30' as TimeFilter, label: '1M' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeFilter(key)}
                  className={timeFilter === key ? 'neu-btn-filter-active' : 'neu-btn-filter'}
                >
                  {label}
                </button>
              ))}
              <div className="h-6 w-px bg-gray-600 mx-1" />
              <button
                onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
                className="neu-btn-filter"
                title={chartType === 'line' ? 'Switch to Bar Chart' : 'Switch to Line Chart'}
              >
                {chartType === 'line' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Запущено</div>
                <div className="text-3xl font-bold text-orange-600">
                  {totalStarted}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Собрано</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {totalClaimed}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Процент сбора</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {claimPercentage}%
                </div>
              </div>
            </div>
            
            {/* Большой график */}
            <div className="h-96">
              {chartType === 'line' ? (
                <Line
                  data={{
                    labels: filteredData.dates,
                    datasets: [
                      {
                        label: 'Майнинг запущен',
                        data: filteredData.started.map((d) => d.count),
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#f97316',
                        pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                      },
                      {
                        label: 'Майнинг собран',
                        data: filteredData.claimed.map((d) => d.count),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          color: isDark ? '#ffffff' : '#000000',
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 14
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        titleColor: isDark ? '#ffffff' : '#000000',
                        bodyColor: isDark ? '#ffffff' : '#000000',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                          title: function(context) {
                            return `📅 ${context[0].label}`;
                          },
                          label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} событий`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          color: isDark ? '#374151' : '#f3f4f6',
                          drawBorder: false
                        },
                        ticks: {
                          color: isDark ? '#9ca3af' : '#6b7280',
                          font: {
                            size: 12
                          }
                        }
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: isDark ? '#374151' : '#f3f4f6',
                          drawBorder: false
                        },
                        ticks: {
                          color: isDark ? '#9ca3af' : '#6b7280',
                          font: {
                            size: 12
                          },
                          callback: function(value) {
                            return Number(value).toLocaleString('ru-RU');
                          }
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    }
                  }}
                />
              ) : (
                <Bar
                  data={{
                    labels: filteredData.dates,
                    datasets: [
                      {
                        label: 'Майнинг запущен',
                        data: filteredData.started.map((d) => d.count),
                        backgroundColor: '#f97316',
                        borderColor: '#f97316',
                        borderWidth: 1,
                      },
                      {
                        label: 'Майнинг собран',
                        data: filteredData.claimed.map((d) => d.count),
                        backgroundColor: '#10b981',
                        borderColor: '#10b981',
                        borderWidth: 1,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          color: isDark ? '#ffffff' : '#000000',
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 14
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        titleColor: isDark ? '#ffffff' : '#000000',
                        bodyColor: isDark ? '#ffffff' : '#000000',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                          title: function(context) {
                            return `📅 ${context[0].label}`;
                          },
                          label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} событий`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        stacked: true,
                        grid: {
                          color: isDark ? '#374151' : '#f3f4f6',
                          drawBorder: false
                        },
                        ticks: {
                          color: isDark ? '#9ca3af' : '#6b7280',
                          font: {
                            size: 12
                          }
                        }
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                          color: isDark ? '#374151' : '#f3f4f6',
                          drawBorder: false
                        },
                        ticks: {
                          color: isDark ? '#9ca3af' : '#6b7280',
                          font: {
                            size: 12
                          },
                          callback: function(value) {
                            return Number(value).toLocaleString('ru-RU');
                          }
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    }
                  }}
                />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

