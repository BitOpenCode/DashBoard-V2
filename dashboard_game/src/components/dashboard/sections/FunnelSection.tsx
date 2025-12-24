import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Line } from 'react-chartjs-2';
import { FunnelData } from '../hooks/types';

interface FunnelSectionProps {
  funnelData: FunnelData;
  onLoadLevelUsers: (level: number) => void;
}

/**
 * Компонент секции воронки пользователей по уровням
 */
export const FunnelSection: React.FC<FunnelSectionProps> = ({ funnelData, onLoadLevelUsers }) => {
  const { isDark } = useTheme();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-white">Users by Level</h2>
      </div>

      <div className="space-y-6">
        {/* Общая статистика */}
        <div
          className={`p-6 rounded-xl shadow-lg ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Всего пользователей</div>
          <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
            {funnelData.total_users?.toLocaleString('ru-RU') || 0}
          </div>
        </div>

        {/* Статистика по уровням */}
        {funnelData.level_stats && funnelData.level_stats.length > 0 && (
          <div
            className={`p-6 rounded-xl shadow-lg ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Распределение пользователей по уровням
            </h3>
            <div className="space-y-4">
              {funnelData.level_stats
                .sort((a, b) => a.level - b.level)
                .map((levelStat) => {
                  const percentage = parseFloat(levelStat.percentage);
                  const maxPercentage = Math.max(...funnelData.level_stats.map((l) => parseFloat(l.percentage)));

                  return (
                    <div
                      key={levelStat.level}
                      onClick={() => onLoadLevelUsers(levelStat.level)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 hover:border-cyan-500'
                          : 'bg-gray-50 border-gray-200 hover:border-cyan-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                              levelStat.level === 0
                                ? 'bg-gray-500 text-white'
                                : levelStat.level <= 3
                                ? 'bg-blue-500 text-white'
                                : levelStat.level <= 6
                                ? 'bg-purple-500 text-white'
                                : levelStat.level <= 8
                                ? 'bg-orange-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {levelStat.level}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Уровень {levelStat.level}
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {levelStat.users_per_level.toLocaleString('ru-RU')} пользователей
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                            {levelStat.percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Прогресс-бар */}
                      <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full transition-all ${
                            levelStat.level === 0
                              ? 'bg-gray-500'
                              : levelStat.level <= 3
                              ? 'bg-blue-500'
                              : levelStat.level <= 6
                              ? 'bg-purple-500'
                              : levelStat.level <= 8
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${(percentage / maxPercentage) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* График распределения */}
        {funnelData.level_stats && funnelData.level_stats.length > 0 && (
          <div
            className={`p-6 rounded-xl shadow-lg ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Визуализация распределения</h3>
            <div className="h-80">
              <Line
                data={{
                  labels: funnelData.level_stats
                    .sort((a, b) => a.level - b.level)
                    .map((stat) => `Уровень ${stat.level}`),
                  datasets: [
                    {
                      label: 'Пользователей',
                      data: funnelData.level_stats
                        .sort((a, b) => a.level - b.level)
                        .map((stat) => stat.users_per_level),
                      borderColor: '#06b6d4',
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#06b6d4',
                      pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
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
                        title: function (context) {
                          return context[0].label;
                        },
                        label: function (context) {
                          const level = funnelData.level_stats.sort((a, b) => a.level - b.level)[context.dataIndex];
                          return `${context.parsed.y} пользователей (${level.percentage}%)`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: isDark ? '#374151' : '#f3f4f6',
                        drawBorder: false,
                      },
                      ticks: {
                        color: isDark ? '#9ca3af' : '#6b7280',
                        font: {
                          size: 12,
                        },
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: isDark ? '#374151' : '#f3f4f6',
                        drawBorder: false,
                      },
                      ticks: {
                        color: isDark ? '#9ca3af' : '#6b7280',
                        font: {
                          size: 12,
                        },
                        callback: function (value) {
                          return Number(value).toLocaleString('ru-RU');
                        },
                      },
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


