import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { TrendingUp, Search, X, Copy, ExternalLink } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { EventsData, TONOrdersData } from '../hooks/types';
import { useEventsFilter } from '../hooks/useEventsFilter';
import { eventNamesMap, defaultColors, eventCategories, excludedEvents } from '../../../utils/dashboard/eventConstants';
import { EventIcon } from '../EventIcon';
import { numberFormat } from '../../../utils/dashboard/formatters';

interface EventsSectionProps {
  eventsData: EventsData | null;
  tonOrdersData: TONOrdersData | null;
  selectedTonCategories: Set<string>;
  onSelectedTonCategoriesChange: (categories: Set<string>) => void;
  onSelectEventModal: (modal: {
    eventName: string;
    eventData: { date: string; count: number }[];
    eventInfo: { title: string; icon: string; color: string };
  }) => void;
  onOpenComparisonModal: () => void;
}

/**
 * Компонент секции статистики событий игры
 */
export const EventsSection: React.FC<EventsSectionProps> = ({
  eventsData,
  tonOrdersData,
  selectedTonCategories,
  onSelectedTonCategoriesChange,
  onSelectEventModal,
  onOpenComparisonModal,
}) => {
  const { isDark } = useTheme();
  const [tonOrdersTimeFilter, setTonOrdersTimeFilter] = useState<'all' | '7' | '30'>('all');
  const [tonOrdersChartType, setTonOrdersChartType] = useState<'line' | 'bar'>('line');
  
  const {
    eventsTimeFilter,
    setEventsTimeFilter,
    correlationTimeFilter,
    setCorrelationTimeFilter,
    eventsChartType,
    setEventsChartType,
    correlationChartType,
    setCorrelationChartType,
    selectedEvents,
    setSelectedEvents,
    categoryRefs,
    scrollToCategory,
    filteredEventsData,
    filteredCorrelationData,
  } = useEventsFilter(eventsData);

  // Агрегированные данные TON заказов по датам
  const aggregatedTonOrdersData = useMemo(() => {
    if (!tonOrdersData || !tonOrdersData.users || tonOrdersData.users.length === 0) {
      return null;
    }

    const formatDateDDMMYY = (dateStr: string | null) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const dd = String(date.getUTCDate()).padStart(2, '0');
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
      const yy = String(date.getUTCFullYear()).slice(-2);
      return `${dd}.${mm}.${yy}`;
    };

    // Категории заказов
    const categories = [
      { key: 'ecos_5000', label: 'Ecos 5000', purchasesField: 'ecos_5000_purchases', tonField: 'ecos_5000_ton_spent', firstPurchaseField: 'ecos_5000_first_purchase', lastPurchaseField: 'ecos_5000_last_purchase', color: '#f97316' },
      { key: 'ecos_10000', label: 'Ecos 10000', purchasesField: 'ecos_10000_purchases', tonField: 'ecos_10000_ton_spent', firstPurchaseField: 'ecos_10000_first_purchase', lastPurchaseField: 'ecos_10000_last_purchase', color: '#eab308' },
      { key: 'ecos_100000', label: 'Ecos 100000', purchasesField: 'ecos_100000_purchases', tonField: 'ecos_100000_ton_spent', firstPurchaseField: 'ecos_100000_first_purchase', lastPurchaseField: 'ecos_100000_last_purchase', color: '#22c55e' },
      { key: 'ecos_200000', label: 'Ecos 200000', purchasesField: 'ecos_200000_purchases', tonField: 'ecos_200000_ton_spent', firstPurchaseField: 'ecos_200000_first_purchase', lastPurchaseField: 'ecos_200000_last_purchase', color: '#3b82f6' },
      { key: 'ecos_1000000', label: 'Ecos 1000000', purchasesField: 'ecos_1000000_purchases', tonField: 'ecos_1000000_ton_spent', firstPurchaseField: 'ecos_1000000_first_purchase', lastPurchaseField: 'ecos_1000000_last_purchase', color: '#8b5cf6' },
      { key: 'premium_7d', label: 'Premium 7d', purchasesField: 'premium_7d_purchases', tonField: 'premium_7d_ton_spent', firstPurchaseField: 'premium_7d_first_purchase', lastPurchaseField: 'premium_7d_last_purchase', color: '#ec4899' },
      { key: 'premium_30d', label: 'Premium 30d', purchasesField: 'premium_30d_purchases', tonField: 'premium_30d_ton_spent', firstPurchaseField: 'premium_30d_first_purchase', lastPurchaseField: 'premium_30d_last_purchase', color: '#f43f5e' },
    ];

    // Создаем мапу для группировки по датам
    const datesMap = new Map<string, { [key: string]: any }>();

    // Проходим по всем пользователям и их покупкам
    tonOrdersData.users.forEach(user => {
      categories.forEach(category => {
        const purchases = parseInt(String(user[category.purchasesField] || 0));
        const tonSpent = parseFloat(String(user[category.tonField] || 0));
        const firstPurchase = user[category.firstPurchaseField] as string | null;
        const lastPurchase = user[category.lastPurchaseField] as string | null;

        // Обрабатываем первую покупку
        if (firstPurchase && purchases > 0) {
          const dateKey = formatDateDDMMYY(firstPurchase);
          if (dateKey) {
            if (!datesMap.has(dateKey)) {
              const dayData: { [key: string]: any } = { date: dateKey };
              categories.forEach(cat => {
                dayData[`${cat.key}_purchases`] = 0;
                dayData[`${cat.key}_ton`] = 0;
              });
              datesMap.set(dateKey, dayData);
            }
            const dayData = datesMap.get(dateKey)!;
            dayData[`${category.key}_purchases`] += purchases;
            dayData[`${category.key}_ton`] += tonSpent;
          }
        }

        // Обрабатываем последнюю покупку (если отличается от первой)
        if (lastPurchase && purchases > 0 && lastPurchase !== firstPurchase) {
          const dateKey = formatDateDDMMYY(lastPurchase);
          if (dateKey) {
            if (!datesMap.has(dateKey)) {
              const dayData: { [key: string]: any } = { date: dateKey };
              categories.forEach(cat => {
                dayData[`${cat.key}_purchases`] = 0;
                dayData[`${cat.key}_ton`] = 0;
              });
              datesMap.set(dateKey, dayData);
            }
            const dayData = datesMap.get(dateKey)!;
            dayData[`${category.key}_purchases`] += purchases;
            dayData[`${category.key}_ton`] += tonSpent;
          }
        }
      });
    });

    // Преобразуем в массив и сортируем по дате
    const sortedDates = Array.from(datesMap.keys()).sort((a, b) => {
      const [ddA, mmA, yyA] = a.split('.').map(Number);
      const [ddB, mmB, yyB] = b.split('.').map(Number);
      return new Date(2000 + yyA, mmA - 1, ddA).getTime() - new Date(2000 + yyB, mmB - 1, ddB).getTime();
    });

    const chartData = sortedDates.map(date => datesMap.get(date)!);

    // Подсчитываем общую статистику
    const summary = {
      totalUsers: tonOrdersData.users.length,
      totalTonReceived: parseFloat(String(tonOrdersData.global_total_ton_received || 0)),
      categories: categories.map(cat => ({
        ...cat,
        totalPurchases: tonOrdersData.users.reduce((sum, user) => sum + parseInt(String(user[cat.purchasesField] || 0)), 0),
        totalTonSpent: tonOrdersData.users.reduce((sum, user) => sum + parseFloat(String(user[cat.tonField] || 0)), 0),
      })),
    };

    return {
      chartData,
      categories,
      summary
    };
  }, [tonOrdersData]);

  // Фильтрованные данные TON заказов по времени
  const filteredTonOrdersData = useMemo(() => {
    if (!aggregatedTonOrdersData) return null;

    const formatDateDDMMYY = (date: Date) => {
      const dd = String(date.getUTCDate()).padStart(2, '0');
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
      const yy = String(date.getUTCFullYear()).slice(-2);
      return `${dd}.${mm}.${yy}`;
    };

    const aggregateData = (data: typeof aggregatedTonOrdersData.chartData, filter: 'all' | '7' | '30') => {
      if (filter === '7') {
        // Группировка по неделям
        const countsByWeek = new Map<string, { [key: string]: any }>();
        
        data.forEach(day => {
          const [dayStr, monthStr, yearStr] = day.date.split('.');
          const dayDate = new Date(2000 + parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
          
          const weekStart = new Date(dayDate);
          weekStart.setUTCDate(dayDate.getUTCDate() - dayDate.getUTCDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
          
          const weekKey = `${formatDateDDMMYY(weekStart)}–${formatDateDDMMYY(weekEnd)}`;
          
          if (!countsByWeek.has(weekKey)) {
            const weekData: { [key: string]: any } = { date: weekKey };
            aggregatedTonOrdersData.categories.forEach(cat => {
              weekData[`${cat.key}_purchases`] = 0;
              weekData[`${cat.key}_ton`] = 0;
            });
            countsByWeek.set(weekKey, weekData);
          }
          const weekData = countsByWeek.get(weekKey)!;
          aggregatedTonOrdersData.categories.forEach(cat => {
            weekData[`${cat.key}_purchases`] += day[`${cat.key}_purchases`] || 0;
            weekData[`${cat.key}_ton`] += day[`${cat.key}_ton`] || 0;
          });
        });
        
        return Array.from(countsByWeek.values())
          .sort((a, b) => {
            const [startA] = a.date.split('–');
            const [startB] = b.date.split('–');
            const [ddA, mmA, yyA] = startA.split('.').map(Number);
            const [ddB, mmB, yyB] = startB.split('.').map(Number);
            return new Date(2000 + yyA, mmA - 1, ddA).getTime() - new Date(2000 + yyB, mmB - 1, ddB).getTime();
          });
      } else if (filter === '30') {
        // Группировка по месяцам
        const countsByMonth = new Map<string, { [key: string]: any }>();
        
        data.forEach(day => {
          const [dayStr, monthStr, yearStr] = day.date.split('.');
          const dayDate = new Date(2000 + parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
          
          const mm = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
          const yy = String(dayDate.getUTCFullYear()).slice(-2);
          const monthKey = `${mm}.${yy}`;
          
          if (!countsByMonth.has(monthKey)) {
            const monthData: { [key: string]: any } = { date: monthKey };
            aggregatedTonOrdersData.categories.forEach(cat => {
              monthData[`${cat.key}_purchases`] = 0;
              monthData[`${cat.key}_ton`] = 0;
            });
            countsByMonth.set(monthKey, monthData);
          }
          const monthData = countsByMonth.get(monthKey)!;
          aggregatedTonOrdersData.categories.forEach(cat => {
            monthData[`${cat.key}_purchases`] += day[`${cat.key}_purchases`] || 0;
            monthData[`${cat.key}_ton`] += day[`${cat.key}_ton`] || 0;
          });
        });
        
        return Array.from(countsByMonth.values())
          .map((monthData) => {
            const [mm, yy] = monthData.date.split('.').map(Number);
            const startTime = new Date(2000 + yy, mm - 1, 1).getTime();
            return { ...monthData, _startTime: startTime };
          })
          .sort((a, b) => a._startTime - b._startTime)
          .map(({ _startTime, ...rest }) => rest);
      }
      
      return data;
    };

    const filteredChartData = aggregateData(aggregatedTonOrdersData.chartData, tonOrdersTimeFilter);

    return {
      ...aggregatedTonOrdersData,
      chartData: filteredChartData,
      dates: filteredChartData.map(d => d.date)
    };
  }, [aggregatedTonOrdersData, tonOrdersTimeFilter]);

  // Фильтруем пользователей по выбранным категориям
  const filteredUsers = useMemo(() => {
    if (!tonOrdersData || !tonOrdersData.users) return [];
    
    return tonOrdersData.users.filter(user => {
      // Если нет выбранных категорий, показываем всех пользователей
      if (selectedTonCategories.size === 0) return true;
      
      // Проверяем, есть ли у пользователя покупки в выбранных категориях
      return Array.from(selectedTonCategories).some(categoryKey => {
        const purchasesField = `${categoryKey}_purchases`;
        const purchases = parseInt(String(user[purchasesField] || 0));
        return purchases > 0;
      });
    }).sort((a, b) => {
      const aTotal = parseFloat(String(a.user_total_ton_spent || 0));
      const bTotal = parseFloat(String(b.user_total_ton_spent || 0));
      return bTotal - aTotal;
    });
  }, [tonOrdersData, selectedTonCategories]);

  if (!eventsData || !filteredEventsData) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-2xl font-bold text-white">Game Events Statistics</h2>
        </div>
        {/* Time filter buttons */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: '1D' },
            { key: '7', label: '1W' },
            { key: '30', label: '1M' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setEventsTimeFilter(key as 'all' | '7' | '30')}
              className={eventsTimeFilter === key ? 'neu-btn-filter-active' : 'neu-btn-filter'}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Overall Activity Chart */}
        {filteredEventsData.totalByDay && filteredEventsData.totalByDay.length > 0 && (
          <div className="neu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="neu-inset p-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Overall Player Activity</h3>
              </div>
              
              {/* Chart Type Toggle */}
              <button
                onClick={() => setEventsChartType(eventsChartType === 'line' ? 'bar' : 'line')}
                className="neu-btn-filter"
                title={eventsChartType === 'line' ? 'Switch to Bar Chart' : 'Switch to Line Chart'}
              >
                {eventsChartType === 'line' ? (
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
            
            <div className="h-80">
              {eventsChartType === 'line' ? (
                <Line
                  data={{
                    labels: filteredEventsData.totalByDay.map(day => day.date),
                    datasets: [{
                      label: eventsTimeFilter === 'all' ? 'Всего событий за день' : eventsTimeFilter === '7' ? 'Всего событий за неделю' : 'Всего событий за месяц',
                      data: filteredEventsData.totalByDay.map(day => day.count),
                      borderColor: isDark ? '#a855f7' : '#9333ea',
                      backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(147, 51, 234, 0.05)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: isDark ? '#a855f7' : '#9333ea',
                      pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 4,
                      pointHoverRadius: 6,
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
                            size: 11
                          },
                          maxRotation: 45,
                          minRotation: 45
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
                    labels: filteredEventsData.totalByDay.map(day => day.date),
                    datasets: [{
                      label: eventsTimeFilter === 'all' ? 'Всего событий за день' : eventsTimeFilter === '7' ? 'Всего событий за неделю' : 'Всего событий за месяц',
                      data: filteredEventsData.totalByDay.map(day => day.count),
                      backgroundColor: isDark ? '#a855f7' : '#9333ea',
                      borderColor: isDark ? '#a855f7' : '#9333ea',
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
                            size: 11
                          },
                          maxRotation: 45,
                          minRotation: 45
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
        )}

        {/* TON Orders Chart */}
        {tonOrdersData && filteredTonOrdersData && filteredTonOrdersData.chartData.length > 0 && (
          <>
            {/* График TON Orders */}
              <div className="neu-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="neu-inset p-2">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>TON Orders Statistics</h3>
                      <p className="text-sm text-gray-400">Purchase statistics by category</p>
                    </div>
                  </div>
                  
                  {/* Time Filter Buttons */}
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: '1D' },
                      { key: '7', label: '1W' },
                      { key: '30', label: '1M' }
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setTonOrdersTimeFilter(key as 'all' | '7' | '30')}
                        className={tonOrdersTimeFilter === key ? 'neu-btn-filter-active' : 'neu-btn-filter'}
                      >
                        {label}
                      </button>
                    ))}
                    
                    {/* Chart Type Toggle */}
                    <button
                      onClick={() => setTonOrdersChartType(tonOrdersChartType === 'line' ? 'bar' : 'line')}
                      className="neu-btn-filter"
                      title={tonOrdersChartType === 'line' ? 'Switch to Bar Chart' : 'Switch to Line Chart'}
                    >
                      {tonOrdersChartType === 'line' ? (
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
                </div>
                
                <div className="h-96">
                  {tonOrdersChartType === 'line' ? (
                    <Line
                      data={{
                        labels: filteredTonOrdersData.dates,
                        datasets: filteredTonOrdersData.categories.map(cat => ({
                          label: cat.label,
                          data: filteredTonOrdersData.chartData.map(day => day[`${cat.key}_purchases`] || 0),
                          borderColor: cat.color,
                          backgroundColor: `${cat.color}20`,
                          borderWidth: 2,
                          fill: false,
                          tension: 0.4,
                        }))
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                          },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              color: isDark ? '#374151' : '#f3f4f6',
                            },
                            ticks: {
                              color: isDark ? '#9ca3af' : '#6b7280',
                              maxRotation: 45,
                              minRotation: 45,
                            }
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: isDark ? '#374151' : '#f3f4f6',
                            },
                            ticks: {
                              color: isDark ? '#9ca3af' : '#6b7280',
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <Bar
                      data={{
                        labels: filteredTonOrdersData.dates,
                        datasets: filteredTonOrdersData.categories.map(cat => ({
                          label: cat.label,
                          data: filteredTonOrdersData.chartData.map(day => day[`${cat.key}_purchases`] || 0),
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                          borderWidth: 1,
                        }))
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                          },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                          }
                        },
                        scales: {
                          x: {
                            stacked: true,
                            grid: {
                              color: isDark ? '#374151' : '#f3f4f6',
                            },
                            ticks: {
                              color: isDark ? '#9ca3af' : '#6b7280',
                              maxRotation: 45,
                              minRotation: 45,
                            }
                          },
                          y: {
                            stacked: true,
                            beginAtZero: true,
                            grid: {
                              color: isDark ? '#374151' : '#f3f4f6',
                            },
                            ticks: {
                              color: isDark ? '#9ca3af' : '#6b7280',
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Список пользователей с TON заказами */}
              {tonOrdersData.users && tonOrdersData.users.length > 0 && (
                <div className="neu-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="neu-inset p-2">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>TON Orders Users</h3>
                        <p className="text-sm text-gray-400">Users who made purchases ({filteredUsers.length})</p>
                      </div>
                    </div>
                  </div>

                  {/* Фильтр по категориям */}
                  <div className="mb-6 p-4 neu-inset rounded-lg">
                    <div className="mb-3">
                      <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Filter by categories:
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {aggregatedTonOrdersData?.categories.map((category) => {
                        const isSelected = selectedTonCategories.has(category.key);
                        return (
                          <label
                            key={category.key}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const newSelected = new Set(selectedTonCategories);
                                if (e.target.checked) {
                                  newSelected.add(category.key);
                                } else {
                                  newSelected.delete(category.key);
                                }
                                onSelectedTonCategoriesChange(newSelected);
                              }}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-2"
                              style={{ accentColor: category.color }}
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                              <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{category.label}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Таблица пользователей */}
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No users with selected purchase categories
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {/* Header row */}
                        <div className="overflow-x-auto">
                          <div className={`hidden md:grid gap-1.5 p-4 neu-inset rounded-lg`} style={{ gridTemplateColumns: '180px 70px repeat(7, minmax(65px, 1fr))' }}>
                            <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              User
                            </div>
                            <div className={`text-xs font-semibold uppercase tracking-wider text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Total
                            </div>
                            {aggregatedTonOrdersData?.categories.map((category) => (
                              <div key={category.key} className={`text-xs font-semibold uppercase tracking-wider text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {category.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* User cards */}
                        <div className="overflow-x-auto">
                          {filteredUsers.map((user, index) => {
                              const normalizeNumber = (val: any): number => {
                                if (val === null || val === undefined) return 0;
                                if (typeof val === 'string') return parseFloat(val) || 0;
                                return Number(val) || 0;
                              };

                              const copyAddress = async (address: string) => {
                                try {
                                  await navigator.clipboard.writeText(address);
                                } catch (err) {
                                  console.error('Failed to copy address:', err);
                                }
                              };

                              const openTonViewer = (address: string) => {
                                window.open(`https://tonviewer.com/${address}`, '_blank');
                              };

                          return (
                            <div
                              key={user.person_id}
                              className={`p-2.5 rounded-lg transition-all hover:shadow-md mb-2 ${
                                isDark 
                                  ? 'bg-gray-800/50 border border-gray-700/30 hover:border-gray-700/50' 
                                  : 'bg-white border border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="grid gap-1.5 items-center" style={{ gridTemplateColumns: '180px 70px repeat(7, minmax(65px, 1fr))' }}>
                                {/* User info */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="relative flex-shrink-0">
                                      {user.photo_url ? (
                                        <img 
                                          src={user.photo_url} 
                                          alt={user.username || 'User'}
                                          className="w-8 h-8 rounded-full"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=6366f1&color=fff&size=128`;
                                          }}
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                          <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {(user.username || 'U').charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <div className={`font-medium text-xs truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                          {user.username || 'Unknown'}
                                        </div>
                                        <span className={`text-[10px] font-mono flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                          #{user.person_id}
                                        </span>
                                      </div>
                                      {user.wallet_address && (
                                        <div className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] ${isDark ? 'bg-gray-700/30 border border-gray-600/30' : 'bg-gray-50 border border-gray-200/50'} max-w-full`}>
                                          <span className={`font-mono truncate flex-shrink min-w-0 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} title={user.wallet_address}>
                                            {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                                          </span>
                                          <div className="flex items-center gap-0.5 flex-shrink-0">
                                            <button
                                              onClick={() => copyAddress(user.wallet_address!)}
                                              className={`p-0.5 rounded hover:opacity-70 transition-opacity ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                              title="Copy"
                                            >
                                              <Copy className="w-2.5 h-2.5" />
                                            </button>
                                            <button
                                              onClick={() => openTonViewer(user.wallet_address!)}
                                              className={`p-0.5 rounded hover:opacity-70 transition-opacity ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                              title="View"
                                            >
                                              <ExternalLink className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Total TON */}
                                <div className={`text-right font-semibold text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                  {numberFormat(normalizeNumber(user.user_total_ton_spent))}
                                </div>

                                {/* Categories */}
                                {aggregatedTonOrdersData?.categories.map((category) => {
                                  const purchases = normalizeNumber(user[category.purchasesField]);
                                  const tonSpent = normalizeNumber(user[category.tonField]);
                                  return (
                                    <div key={category.key} className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {purchases > 0 ? (
                                        <div className="flex flex-col items-end gap-0">
                                          <div className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{purchases}</div>
                                          <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{numberFormat(tonSpent)}</div>
                                        </div>
                                      ) : (
                                        <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>-</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                          })}
                        </div>
                      </div>

                      {/* Плашка с общим количеством заработанных TON */}
                      <div className={`mt-6 p-6 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Total TON Received
                              </p>
                              <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'} mt-1`}>
                                {numberFormat(parseFloat(String(tonOrdersData.global_total_ton_received || 0)))}
                              </p>
                            </div>
                          </div>
                          <div className={`text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p className="text-sm">from {filteredUsers.length} users</p>
                            <p className="text-xs mt-1">
                              avg: {filteredUsers.length > 0 ? numberFormat(parseFloat(String(tonOrdersData.global_total_ton_received || 0)) / filteredUsers.length) : '0'} TON
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
          </>
        )}
        
        {/* All Events Correlation Chart */}
        {filteredCorrelationData && filteredCorrelationData.dates.length > 0 && (
          <div className="neu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="neu-inset p-2">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Events Correlation</h3>
                  <p className="text-sm text-gray-400">Select events to compare on one chart</p>
                </div>
              </div>

              {/* Time Filter Buttons, Chart Type Toggle and Clear All */}
              <div className="flex gap-2 items-center">
                {[
                  { key: 'all', label: '1D' },
                  { key: '7', label: '1W' },
                  { key: '30', label: '1M' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setCorrelationTimeFilter(key as 'all' | '7' | '30')}
                    className={correlationTimeFilter === key ? 'neu-btn-filter-active' : 'neu-btn-filter'}
                  >
                    {label}
                  </button>
                ))}
                <div className="h-6 w-px bg-gray-600 mx-1" />
                <button
                  onClick={() => setCorrelationChartType(correlationChartType === 'line' ? 'bar' : 'line')}
                  className="neu-btn-filter"
                  title={correlationChartType === 'line' ? 'Switch to Bar Chart' : 'Switch to Line Chart'}
                >
                  {correlationChartType === 'line' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setSelectedEvents(new Set())}
                  className="neu-btn-filter"
                  title="Clear all selections"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
                  
            {/* Event Checkboxes */}
            {(() => {
              // Исключаем ненужные события
              const correlationExcludedEvents = ['starter_pack_granted', 'person_created', 'pool_member_bonus', 'pool_owner_commission'];
              
              const availableEvents = Object.keys(filteredCorrelationData.events)
                .filter(eventName => !correlationExcludedEvents.includes(eventName))
                .slice(0, 20);
              
              // Создаем мапу для быстрого доступа к индексу события
              const eventIndexMap = new Map(availableEvents.map((eventName, index) => [eventName, index]));
              
              return (
                <div className="mb-6 p-4 neu-inset rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-48 overflow-y-auto">
                    {availableEvents.map((eventName) => {
                      let eventInfo = eventNamesMap[eventName];
                      if (!eventInfo) {
                        // Используем индекс события в availableEvents для определения цвета
                        const eventIndex = eventIndexMap.get(eventName) || 0;
                        const color = defaultColors[eventIndex % defaultColors.length];
                        eventInfo = { title: eventName.replace(/_/g, ' '), icon: 'zap', color };
                      }
                      const isSelected = selectedEvents.has(eventName);
                      
                      return (
                        <label
                          key={eventName}
                          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelected = new Set(selectedEvents);
                              if (e.target.checked) {
                                newSelected.add(eventName);
                              } else {
                                newSelected.delete(eventName);
                              }
                              setSelectedEvents(newSelected);
                            }}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-2"
                            style={{ accentColor: eventInfo.color }}
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: eventInfo.color }} />
                            <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{eventInfo.title}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            
            <div className="h-96">
              {correlationChartType === 'line' ? (
                <Line
                  data={{
                    labels: filteredCorrelationData.dates,
                    datasets: selectedEvents.size > 0 ? (() => {
                      // Исключаем ненужные события
                      const correlationExcludedEvents = ['starter_pack_granted', 'person_created', 'pool_member_bonus', 'pool_owner_commission'];
                      
                      // Получаем доступные события в том же порядке, что и в чекбоксах
                      const availableEvents = Object.keys(filteredCorrelationData.events)
                        .filter(eventName => !correlationExcludedEvents.includes(eventName))
                        .slice(0, 20);
                      
                      // Создаем мапу для быстрого доступа к индексу события
                      const eventIndexMap = new Map(availableEvents.map((eventName, index) => [eventName, index]));
                      
                      return Array.from(selectedEvents)
                        .filter(eventName => !correlationExcludedEvents.includes(eventName))
                        .map((eventName) => {
                          const eventData = filteredCorrelationData.events[eventName] || [];
                          
                          // Используем единый объект eventNamesMap для синхронизации цветов
                          let eventInfo = eventNamesMap[eventName];
                          if (!eventInfo) {
                            // Используем индекс события в availableEvents для определения цвета (как в чекбоксах)
                            const eventIndex = eventIndexMap.get(eventName) || 0;
                            const color = defaultColors[eventIndex % defaultColors.length];
                            eventInfo = { title: eventName.replace(/_/g, ' '), icon: 'zap', color };
                          }
                          
                          // Создаем массив данных, соответствующий всем датам
                          const dataMap = new Map(eventData.map(d => [d.date, d.count]));
                          const data = filteredCorrelationData.dates.map(date => dataMap.get(date) || 0);
                          
                          return {
                            label: eventInfo.title,
                            data,
                            borderColor: eventInfo.color,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.3,
                            pointRadius: 2,
                            pointHoverRadius: 5,
                          };
                        });
                      })() : []
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            color: '#9ca3af',
                            font: { size: 10 },
                            boxWidth: 12,
                            padding: 8,
                            usePointStyle: true,
                          }
                        },
                        tooltip: {
                          backgroundColor: '#1f2937',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#374151',
                          borderWidth: 1,
                          cornerRadius: 8,
                          mode: 'index',
                          intersect: false,
                        }
                      },
                      scales: {
                        x: {
                          grid: { color: '#374151', drawBorder: false },
                          ticks: { color: '#9ca3af', font: { size: 10 }, maxRotation: 45, minRotation: 45 }
                        },
                        y: {
                          beginAtZero: true,
                          grid: { color: '#374151', drawBorder: false },
                          ticks: { color: '#9ca3af', font: { size: 11 } }
                        }
                      },
                      interaction: { intersect: false, mode: 'index' }
                    }}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: filteredCorrelationData.dates,
                      datasets: selectedEvents.size > 0 ? (() => {
                        // Исключаем ненужные события
                        const correlationExcludedEvents = ['starter_pack_granted', 'person_created', 'pool_member_bonus', 'pool_owner_commission'];
                        
                        // Получаем доступные события в том же порядке, что и в чекбоксах
                        const availableEvents = Object.keys(filteredCorrelationData.events)
                          .filter(eventName => !correlationExcludedEvents.includes(eventName))
                          .slice(0, 20);
                        
                        // Создаем мапу для быстрого доступа к индексу события
                        const eventIndexMap = new Map(availableEvents.map((eventName, index) => [eventName, index]));
                        
                        return Array.from(selectedEvents)
                          .filter(eventName => !correlationExcludedEvents.includes(eventName))
                          .map((eventName) => {
                            const eventData = filteredCorrelationData.events[eventName] || [];
                            
                            // Используем единый объект eventNamesMap для синхронизации цветов
                            let eventInfo = eventNamesMap[eventName];
                            if (!eventInfo) {
                              // Используем индекс события в availableEvents для определения цвета (как в чекбоксах)
                              const eventIndex = eventIndexMap.get(eventName) || 0;
                              const color = defaultColors[eventIndex % defaultColors.length];
                              eventInfo = { title: eventName.replace(/_/g, ' '), icon: 'zap', color };
                            }
                            
                            // Создаем массив данных, соответствующий всем датам
                            const dataMap = new Map(eventData.map(d => [d.date, d.count]));
                            const data = filteredCorrelationData.dates.map(date => dataMap.get(date) || 0);
                            
                            return {
                              label: eventInfo.title,
                              data,
                              backgroundColor: eventInfo.color,
                              borderColor: eventInfo.color,
                              borderWidth: 1,
                            };
                          });
                        })() : []
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                              color: '#9ca3af',
                              font: { size: 10 },
                              boxWidth: 12,
                              padding: 8,
                              usePointStyle: true,
                            }
                          },
                          tooltip: {
                            backgroundColor: '#1f2937',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            cornerRadius: 8,
                            mode: 'index',
                            intersect: false,
                          }
                        },
                        scales: {
                          x: {
                            stacked: true,
                            grid: { color: '#374151', drawBorder: false },
                            ticks: { color: '#9ca3af', font: { size: 10 }, maxRotation: 45, minRotation: 45 }
                          },
                          y: {
                            stacked: true,
                            beginAtZero: true,
                            grid: { color: '#374151', drawBorder: false },
                            ticks: { color: '#9ca3af', font: { size: 11 } }
                          }
                        },
                        interaction: { intersect: false, mode: 'index' }
                      }}
                    />
                  )}
            </div>
          </div>
        )}
        
        {/* Category Navigation */}
        {filteredEventsData.events && Object.keys(filteredEventsData.events).length > 0 && (
          <div className="neu-card p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="neu-inset p-3">
                <Search className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Navigation</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Select category to view statistics</p>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { name: 'Mining Events', icon: 'mining', color: '#f97316' },
                { name: 'Purchases', icon: 'cart', color: '#3b82f6' },
                { name: 'Daily Activities', icon: 'calendar', color: '#ec4899' },
                { name: 'Referrals', icon: 'users', color: '#22c55e' },
                { name: 'Transactions', icon: 'swap', color: '#0ea5e9' },
                { name: 'Tasks', icon: 'target', color: '#8b5cf6' },
                { name: 'Social', icon: 'phone', color: '#06b6d4' },
                { name: 'Registrations', icon: 'check', color: '#14b8a6' },
                { name: 'ASIC Tasks', icon: 'monitor', color: '#3b82f6' },
                { name: 'Property Tasks', icon: 'building', color: '#10b981' },
                { name: 'Achievements', icon: 'trophy', color: '#f59e0b' },
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => scrollToCategory(category.name)}
                  className="neu-btn text-left"
                >
                  <EventIcon name={category.icon} className="w-4 h-4" color={category.color} />
                  <span className={`flex-1 text-xs ${isDark ? 'text-gray-300' : '!text-gray-900'}`}>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Карточки по типам событий */}
        {filteredEventsData.events && Object.keys(filteredEventsData.events).length > 0 && (
          <div className="space-y-8">
            {Object.entries(eventCategories).map(([categoryName, categoryData]) => {
              // Filter events: only those that exist in data and not excluded
              const categoryEvents = categoryData.events
                .filter(eventName => 
                  filteredEventsData.events[eventName] && 
                  !excludedEvents.includes(eventName)
                );
              
              // If no events in category - don't show it
              if (categoryEvents.length === 0) return null;
              
              return (
                <div 
                  key={categoryName} 
                  className="space-y-4"
                  ref={(el) => (categoryRefs.current[categoryName] = el)}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                    <EventIcon name={categoryData.icon} className="w-6 h-6 text-orange-500" />
                    <h3 className="text-xl font-bold text-white">{categoryName}</h3>
                  </div>
                  
                  {/* Event cards in category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryEvents.map(eventName => {
                      const eventData = filteredEventsData.events[eventName];
                      const totalCount = eventData.reduce((sum: number, day: any) => sum + day.count, 0);
                      const lastDayCount = eventData.length > 0 ? eventData[eventData.length - 1].count : 0;
                      const eventInfo = eventNamesMap[eventName] || { title: eventName, icon: 'zap', color: '#6b7280' };
                      
                      return (
                        <div key={eventName} className="neu-card p-6 min-h-[280px] flex flex-col">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="neu-inset p-2">
                                <EventIcon name={eventInfo.icon} className="w-5 h-5" color={eventInfo.color} />
                              </div>
                              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>{eventInfo.title}</h4>
                            </div>
                          </div>
                          
                          <div className="space-y-5 flex-1 flex flex-col">
                            <div className="mb-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold" style={{ color: eventInfo.color }}>{totalCount}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">всего</span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                Сегодня: <span className="font-semibold" style={{ color: eventInfo.color }}>{lastDayCount}</span>
                              </div>
                            </div>
                            
                            {/* Мини-график */}
                            <div 
                              className="h-24 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => onSelectEventModal({ eventName, eventData, eventInfo })}
                              title="Нажмите для увеличения графика"
                            >
                              <Line
                                data={{
                                  labels: eventData.map(d => d.date),
                                  datasets: [{
                                    data: eventData.map(d => d.count),
                                    borderColor: eventInfo.color,
                                    backgroundColor: `${eventInfo.color}20`,
                                    borderWidth: 2,
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 0,
                                    pointHoverRadius: 4,
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: { display: false },
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
                                          return context[0].label;
                                        },
                                        label: function(context) {
                                          return `${context.parsed.y} событий`;
                                        }
                                      }
                                    }
                                  },
                                  scales: {
                                    x: { display: false },
                                    y: { display: false, beginAtZero: true }
                                  },
                                  interaction: {
                                    intersect: false,
                                    mode: 'index'
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Special comparison block for mining events */}
                    {categoryName === 'Mining Events' && 
                     filteredEventsData.events['mining_started'] && 
                     filteredEventsData.events['mining_claimed'] && (
                      <div className="neu-card p-6 min-h-[280px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="neu-inset p-2">
                              <TrendingUp className="w-5 h-5 text-purple-400" />
                            </div>
                            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>Ratio: Start → Claim</h4>
                          </div>
                        </div>
                        
                        <div className="space-y-5 flex-1 flex flex-col">
                          {/* Процентное соотношение */}
                          <div className="mb-2">
                            {(() => {
                              const totalStarted = filteredEventsData.events['mining_started'].reduce((sum: number, day: any) => sum + day.count, 0);
                              const totalClaimed = filteredEventsData.events['mining_claimed'].reduce((sum: number, day: any) => sum + day.count, 0);
                              const claimRate = totalStarted > 0 ? ((totalClaimed / totalStarted) * 100).toFixed(1) : '0';
                              
                              return (
                                <>
                                  <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-3xl font-bold text-emerald-600">{claimRate}%</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">собрано от запущенного</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Запущено</div>
                                      <div className="text-lg font-bold text-orange-600">{totalStarted}</div>
                                    </div>
                                    <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Собрано</div>
                                      <div className="text-lg font-bold text-emerald-600">{totalClaimed}</div>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                          
                          {/* График сравнения */}
                          <div 
                            className="h-24 flex-1 cursor-pointer hover:opacity-80 transition-opacity" 
                            title="Нажмите для увеличения"
                            onClick={() => onOpenComparisonModal()}
                          >
                            <Line
                              data={{
                                labels: filteredEventsData.events['mining_started'].map((d: any) => d.date),
                                datasets: [
                                  {
                                    label: 'Запущено',
                                    data: filteredEventsData.events['mining_started'].map((d: any) => d.count),
                                    borderColor: '#f97316',
                                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                    borderWidth: 2,
                                    fill: false,
                                    tension: 0.4,
                                    pointRadius: 0,
                                    pointHoverRadius: 4,
                                  },
                                  {
                                    label: 'Собрано',
                                    data: filteredEventsData.events['mining_claimed'].map((d: any) => d.count),
                                    borderColor: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    borderWidth: 2,
                                    fill: false,
                                    tension: 0.4,
                                    pointRadius: 0,
                                    pointHoverRadius: 4,
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: { display: false },
                                  tooltip: {
                                    backgroundColor: isDark ? '#374151' : '#ffffff',
                                    titleColor: isDark ? '#ffffff' : '#000000',
                                    bodyColor: isDark ? '#ffffff' : '#000000',
                                    borderColor: isDark ? '#4b5563' : '#e5e7eb',
                                    borderWidth: 1,
                                    cornerRadius: 8,
                                    displayColors: true,
                                  }
                                },
                                scales: {
                                  x: { display: false },
                                  y: { display: false, beginAtZero: true }
                                },
                                interaction: {
                                  intersect: false,
                                  mode: 'index'
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

