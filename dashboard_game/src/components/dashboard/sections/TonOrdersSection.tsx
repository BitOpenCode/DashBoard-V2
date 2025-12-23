import React, { useMemo, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Line, Bar } from 'react-chartjs-2';
import { TONOrdersData } from '../hooks/types';
import { numberFormat } from '../../../utils/dashboard/formatters';

interface TonOrdersSectionProps {
  tonOrdersData: TONOrdersData | null;
  selectedTonCategories: Set<string>;
  onSelectedTonCategoriesChange: (categories: Set<string>) => void;
}

/**
 * Компонент секции статистики TON заказов
 */
export const TonOrdersSection: React.FC<TonOrdersSectionProps> = ({
  tonOrdersData,
  selectedTonCategories,
  onSelectedTonCategoriesChange,
}) => {
  const { isDark } = useTheme();
  const [tonOrdersTimeFilter, setTonOrdersTimeFilter] = useState<'all' | '7' | '30'>('all');
  const [tonOrdersChartType, setTonOrdersChartType] = useState<'line' | 'bar'>('line');

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

  if (!tonOrdersData) {
    return null;
  }

  return (
    <div className="mb-6 space-y-6">
      {/* График TON Orders */}
      {filteredTonOrdersData && filteredTonOrdersData.chartData.length > 0 && (
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
      )}

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
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Пользователи с TON заказами</h3>
                <p className="text-sm text-gray-400">Список пользователей, которые совершили покупки</p>
              </div>
            </div>
          </div>

          {/* Фильтр по категориям */}
          <div className="mb-6 p-4 neu-inset rounded-lg">
            <div className="mb-3">
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Фильтр по категориям:
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
                Нет пользователей с выбранными категориями покупок
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Username
                    </th>
                    <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Всего TON
                    </th>
                    {aggregatedTonOrdersData?.categories.map((category) => (
                      <th key={category.key} className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const normalizeNumber = (val: any): number => {
                      if (val === null || val === undefined) return 0;
                      if (typeof val === 'string') return parseFloat(val) || 0;
                      return Number(val) || 0;
                    };

                    return (
                      <tr
                        key={user.person_id}
                        className={`border-b transition-colors ${
                          isDark 
                            ? 'border-gray-700 hover:bg-gray-700/50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.photo_url && (
                              <img 
                                src={user.photo_url} 
                                alt={user.username || 'User'}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.username || 'Unknown'}
                              </span>
                              {(user.first_name || user.last_name) && (
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {user.first_name} {user.last_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`text-right py-3 px-4 font-semibold text-green-600 dark:text-green-400`}>
                          {numberFormat(normalizeNumber(user.user_total_ton_spent))}
                        </td>
                        {aggregatedTonOrdersData?.categories.map((category) => {
                          const purchases = normalizeNumber(user[category.purchasesField]);
                          const tonSpent = normalizeNumber(user[category.tonField]);
                          return (
                            <td key={category.key} className={`text-right py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {purchases > 0 ? (
                                <div>
                                  <div className="font-semibold">{purchases}</div>
                                  <div className="text-xs text-gray-500">{numberFormat(tonSpent)} TON</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

