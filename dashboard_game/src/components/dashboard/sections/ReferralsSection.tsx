import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { ReferralsData } from '../hooks/types';

interface ReferralsSectionProps {
  referralsData: ReferralsData;
  onLoadActivityOverview: (username: string) => void;
  activityLoading: string | null;
}

/**
 * Компонент секции статистики рефералов
 */
export const ReferralsSection: React.FC<ReferralsSectionProps> = ({
  referralsData,
  onLoadActivityOverview,
  activityLoading,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Статистика рефералов</h2>
      </div>

      <div className="space-y-6">
        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Общее количество приглашений */}
          <div
            className={`p-6 rounded-xl shadow-lg ${
              isDark
                ? 'bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-700/50'
                : 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-pink-300' : 'text-pink-600'} mb-1`}>
                  Всего приглашений
                </p>
                <p className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                  {referralsData.totalInvites}
                </p>
              </div>
              <div className="p-4 rounded-full bg-pink-500/20">
                <svg
                  className="w-8 h-8 text-pink-600 dark:text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Общий заработок XP */}
          <div
            className={`p-6 rounded-xl shadow-lg ${
              isDark
                ? 'bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-700/50'
                : 'bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-600'} mb-1`}>
                  Всего выплачено XP
                </p>
                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {(referralsData.totalInvites * 20000).toLocaleString('ru-RU')}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  20 000 XP за реферала
                </p>
              </div>
              <div className="p-4 rounded-full bg-orange-500/20">
                <svg
                  className="w-8 h-8 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Invitations chart by day */}
        {referralsData.byDay && referralsData.byDay.length > 0 && (
          <div className="neu-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="neu-inset p-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Daily Invitations</h3>
            </div>
            <div className="h-80">
              <Line
                data={{
                  labels: referralsData.byDay.map((d) => d.date),
                  datasets: [
                    {
                      label: 'Приглашения',
                      data: referralsData.byDay.map((d) => d.count),
                      borderColor: '#ec4899',
                      backgroundColor: 'rgba(236, 72, 153, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#ec4899',
                      pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 4,
                      pointHoverRadius: 6,
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
                          return `📅 ${context[0].label}`;
                        },
                        label: function (context) {
                          return `👥 ${context.parsed.y} приглашений`;
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
                          size: 11,
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

        {/* Топ рефереров */}
        {referralsData.topReferrers && referralsData.topReferrers.length > 0 && (
          <div
            className={`p-6 rounded-xl shadow-lg ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏆</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Топ-20 рефереров</h3>
            </div>
            <div className="space-y-3">
              {referralsData.topReferrers.map((referrer, index) => {
                const earnedXP = referrer.count * 20000;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg transition-all ${
                      isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            index === 0
                              ? 'bg-yellow-500 text-white'
                              : index === 1
                              ? 'bg-gray-400 text-white'
                              : index === 2
                              ? 'bg-orange-600 text-white'
                              : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {referrer.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">приглашений:</span>
                        <span className="font-bold text-pink-600 dark:text-pink-400 text-lg">
                          {referrer.count}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-between pt-2 border-t ${
                        isDark ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => {
                          console.log('🎯 Нажата кнопка для пользователя:', referrer.username);
                          console.log('🎯 Тип:', typeof referrer.username);
                          console.log('🎯 Объект referrer:', referrer);
                          onLoadActivityOverview(referrer.username);
                        }}
                        disabled={activityLoading === referrer.username}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          activityLoading === referrer.username
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                        }`}
                      >
                        {activityLoading === referrer.username ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Загрузка...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            <span>Обзор активности</span>
                          </>
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Заработано:</span>
                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                          {earnedXP.toLocaleString('ru-RU')} XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

