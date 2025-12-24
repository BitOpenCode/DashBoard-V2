import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { PoolsData } from '../hooks/types';

interface PoolsSectionProps {
  poolsData: PoolsData;
}

/**
 * Компонент секции статистики пулов майнинга
 */
export const PoolsSection: React.FC<PoolsSectionProps> = ({ poolsData }) => {
  const { isDark } = useTheme();

  const formatHashrate = (hashrate: string) => {
    const num = parseFloat(hashrate);
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)} Eh/s`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} Ph/s`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)} Th/s`;
    }
    return `${num.toFixed(2)} Gh/s`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return 'bg-yellow-500 text-white';
    if (index === 1) return 'bg-gray-400 text-white';
    if (index === 2) return 'bg-orange-600 text-white';
    return isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🏊 Лидерборд пулов</h2>
      </div>

      <div
        className={`p-6 rounded-xl shadow-lg ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        <div className="mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Всего пулов: <span className="font-semibold">{poolsData.pools.length}</span>
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
                  Название
                </th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Hashrate
                </th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Комиссия
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Уровень
                </th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bonus
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Создан
                </th>
              </tr>
            </thead>
            <tbody>
              {poolsData.pools.map((pool, index) => {
                return (
                  <tr
                    key={pool.id}
                    className={`border-b transition-colors ${
                      isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getMedalColor(
                          index
                        )}`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {pool.name}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ID: {pool.id}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        isDark ? 'text-indigo-400' : 'text-indigo-600'
                      } whitespace-nowrap`}
                    >
                      {formatHashrate(pool.total_hashrate)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {pool.commission}%
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {pool.lvl} / 5
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {(() => {
                        const bonusMap: { [key: number]: number } = {
                          1: 5,
                          2: 10,
                          3: 15,
                          4: 20,
                          5: 25,
                        };
                        const level = pool.lvl || 1;
                        return `${bonusMap[level] || 0}%`;
                      })()}
                    </td>
                    <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(pool.created_at)}
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



