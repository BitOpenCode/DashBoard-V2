import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '../../../contexts/ThemeContext';
import { EventIcon } from '../EventIcon';
import { Line, Bar } from 'react-chartjs-2';
import { filterEventModalData, EventModalData, TimeFilter } from '../../../utils/dashboard/eventModalFilter';

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  eventData: EventModalData[];
  eventInfo: {
    title: string;
    icon: string;
    color: string;
  };
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventData,
  eventInfo
}) => {
  const { isDark } = useTheme();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const filteredData = useMemo(() => {
    return filterEventModalData(eventData, timeFilter);
  }, [eventData, timeFilter]);

  const handleClose = () => {
    setTimeFilter('all');
    setChartType('line');
    onClose();
  };

  if (!isOpen || !filteredData || filteredData.length === 0) {
    return null;
  }

  const totalCount = filteredData.reduce((sum, day) => sum + day.count, 0);
  const lastDayCount = filteredData.length > 0 ? filteredData[filteredData.length - 1].count : 0;

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
                <EventIcon name={eventInfo.icon} className="w-8 h-8" color={eventInfo.color} />
                <Dialog.Title className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {eventInfo.title}
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
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {timeFilter === 'all' ? 'Всего' : timeFilter === '7' ? 'Всего за период' : 'Всего за период'}
                </div>
                <div className="text-3xl font-bold" style={{ color: eventInfo.color }}>
                  {totalCount}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {timeFilter === 'all' ? 'Последний день' : timeFilter === '7' ? 'Последняя неделя' : 'Последний месяц'}
                </div>
                <div className="text-3xl font-bold" style={{ color: eventInfo.color }}>
                  {lastDayCount}
                </div>
              </div>
            </div>
            
            {/* Большой график */}
            <div className="h-96">
              {chartType === 'line' ? (
                <Line
                  data={{
                    labels: filteredData.map(d => d.date),
                    datasets: [{
                      label: eventInfo.title,
                      data: filteredData.map(d => d.count),
                      borderColor: eventInfo.color,
                      backgroundColor: `${eventInfo.color}20`,
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: eventInfo.color,
                      pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        titleColor: isDark ? '#ffffff' : '#000000',
                        bodyColor: isDark ? '#ffffff' : '#000000',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                          title: function(context) {
                            return `📅 ${context[0].label}`;
                          },
                          label: function(context) {
                            return `⚡ ${context.parsed.y} событий`;
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
                    labels: filteredData.map(d => d.date),
                    datasets: [{
                      label: eventInfo.title,
                      data: filteredData.map(d => d.count),
                      backgroundColor: eventInfo.color,
                      borderColor: eventInfo.color,
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: isDark ? '#374151' : '#ffffff',
                        titleColor: isDark ? '#ffffff' : '#000000',
                        bodyColor: isDark ? '#ffffff' : '#000000',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                          title: function(context) {
                            return `📅 ${context[0].label}`;
                          },
                          label: function(context) {
                            return `⚡ ${context.parsed.y} событий`;
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
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

