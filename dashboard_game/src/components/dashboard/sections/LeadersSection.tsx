import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { LeadersData } from '../hooks/types';

interface LeadersSectionProps {
  leadersData: LeadersData;
}

/**
 * Компонент секции таблицы лидеров
 */
export const LeadersSection: React.FC<LeadersSectionProps> = ({ leadersData }) => {
  const { isDark } = useTheme();

  const formatTh = (th: number) => {
    if (th >= 1000000000) {
      return `${(th / 1000000000).toFixed(2)} Eh`;
    }
    return `${th.toLocaleString('ru-RU')} Th`;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🏆 Таблица лидеров</h2>
      </div>

      <div
        className={`p-6 rounded-xl shadow-lg ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        <div className="mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Всего лидеров: <span className="font-semibold">{leadersData.total}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Место
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  ASIC
                </th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Th/s
                </th>
              </tr>
            </thead>
            <tbody>
              {leadersData.leaderboard.map((user, index) => {
                return (
                  <tr
                    key={user.user_id || index}
                    className={`border-b transition-colors ${
                      isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          user.rank === 1
                            ? 'bg-yellow-500 text-white'
                            : user.rank === 2
                            ? 'bg-gray-400 text-white'
                            : user.rank === 3
                            ? 'bg-orange-600 text-white'
                            : isDark
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {user.rank}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url && (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user.asic_count.toLocaleString('ru-RU')}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      {formatTh(user.th)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

