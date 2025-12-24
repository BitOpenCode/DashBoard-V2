import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '../../../contexts/ThemeContext';
import { LevelUsersData, LevelUser } from '../hooks/useLevelUsers';
import { getUserLevel, getLevelThresholds } from '../../../utils/dashboard/levelUtils';

interface LevelUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LevelUsersData | null;
  loading: boolean;
  filters: {
    minASIC: string;
    maxASIC: string;
    minTh: string;
    maxTh: string;
  };
  onFiltersChange: (filters: {
    minASIC: string;
    maxASIC: string;
    minTh: string;
    maxTh: string;
  }) => void;
}

export const LevelUsersModal: React.FC<LevelUsersModalProps> = ({
  isOpen,
  onClose,
  data,
  loading,
  filters,
  onFiltersChange
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !data) {
    return null;
  }

  const filteredUsers = useMemo(() => {
    return data.users.filter((user) => {
      // Дополнительная проверка: убеждаемся, что пользователь действительно на нужном уровне
      const userLevel = getUserLevel(user.th || 0);
      if (userLevel === null || userLevel !== data.level) {
        return false;
      }
      
      // Фильтр по ASIC
      const asicCount = user.asic_count || 0;
      const minASIC = filters.minASIC ? parseInt(filters.minASIC) : null;
      const maxASIC = filters.maxASIC ? parseInt(filters.maxASIC) : null;
      
      if (minASIC !== null && asicCount < minASIC) {
        return false;
      }
      if (maxASIC !== null && asicCount > maxASIC) {
        return false;
      }
      
      // Фильтр по Th
      const th = user.th || 0;
      const minTh = filters.minTh ? parseInt(filters.minTh) : null;
      const maxTh = filters.maxTh ? parseInt(filters.maxTh) : null;
      
      if (minTh !== null && th < minTh) {
        return false;
      }
      if (maxTh !== null && th > maxTh) {
        return false;
      }
      
      return true;
    });
  }, [data.users, data.level, filters]);

  const formatTh = (th: number) => {
    if (th >= 1000000000) {
      return `${(th / 1000000000).toFixed(2)} Eh`;
    }
    return `${th.toLocaleString('ru-RU')} Th`;
  };

  const getLevelColor = (level: number) => {
    if (level === 0) return 'bg-gray-500';
    if (level <= 3) return 'bg-blue-500';
    if (level <= 6) return 'bg-purple-500';
    if (level <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getLevelColor(data.level)} text-white`}>
                  {data.level}
                </div>
                <div>
                  <Dialog.Title className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Пользователи уровня {data.level}
                  </Dialog.Title>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Всего: {data.users.length} пользователей
                  </p>
                </div>
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

            {/* Фильтры */}
            <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Фильтры</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Фильтр по ASIC */}
                <div className="w-full min-w-0">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    ASIC (мин - макс)
                  </label>
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="number"
                      placeholder="Мин"
                      value={filters.minASIC}
                      onChange={(e) => onFiltersChange({ ...filters, minASIC: e.target.value })}
                      className={`w-full min-w-0 px-3 py-2 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    />
                    <span className={`flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>-</span>
                    <input
                      type="number"
                      placeholder="Макс"
                      value={filters.maxASIC}
                      onChange={(e) => onFiltersChange({ ...filters, maxASIC: e.target.value })}
                      className={`w-full min-w-0 px-3 py-2 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    />
                  </div>
                </div>
                {/* Фильтр по Th */}
                <div className="w-full min-w-0">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Th/s (мин - макс)
                  </label>
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="number"
                      placeholder="Мин"
                      value={filters.minTh}
                      onChange={(e) => onFiltersChange({ ...filters, minTh: e.target.value })}
                      className={`w-full min-w-0 px-3 py-2 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    />
                    <span className={`flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>-</span>
                    <input
                      type="number"
                      placeholder="Макс"
                      value={filters.maxTh}
                      onChange={(e) => onFiltersChange({ ...filters, maxTh: e.target.value })}
                      className={`w-full min-w-0 px-3 py-2 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    />
                  </div>
                </div>
              </div>
              {/* Кнопка сброса фильтров */}
              {(filters.minASIC || filters.maxASIC || filters.minTh || filters.maxTh) && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => onFiltersChange({ minASIC: '', maxASIC: '', minTh: '', maxTh: '' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>

            {/* Список пользователей */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Загрузка пользователей...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {data.users.length === 0 
                    ? 'На этом уровне пока нет пользователей'
                    : 'Нет пользователей, соответствующих выбранным фильтрам'}
                </p>
              </div>
            ) : (
              <>
                {/* Информация о количестве отфильтрованных пользователей */}
                <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {filteredUsers.length === data.users.length ? (
                      <>Показано: <span className="font-semibold">{filteredUsers.length}</span> из {data.users.length} пользователей</>
                    ) : (
                      <>Показано: <span className="font-semibold">{filteredUsers.length}</span> из {data.users.length} пользователей (применены фильтры)</>
                    )}
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
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Прогресс
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => {
                        const thresholds = getLevelThresholds(data.level);
                        const currentTh = user.th || 0;
                        const progress = Math.min(100, ((currentTh - thresholds.current) / (thresholds.next - thresholds.current)) * 100);
                        const progressPercent = Math.max(0, progress);
                        
                        return (
                          <tr
                            key={user.user_id || index}
                            className={`border-b transition-colors ${
                              isDark 
                                ? 'border-gray-700 hover:bg-gray-700/50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                user.rank === 1
                                  ? 'bg-yellow-500 text-white'
                                  : user.rank === 2
                                  ? 'bg-gray-400 text-white'
                                  : user.rank === 3
                                  ? 'bg-orange-600 text-white'
                                  : isDark
                                  ? 'bg-gray-600 text-gray-300'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
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
                                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                  {user.username}
                                </span>
                              </div>
                            </td>
                            <td className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {user.asic_count.toLocaleString('ru-RU')}
                            </td>
                            <td className={`text-right py-3 px-4 font-semibold text-cyan-600 dark:text-cyan-400`}>
                              {user.th.toLocaleString('ru-RU')} Th/s
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {formatTh(currentTh)} из {formatTh(thresholds.next)}
                                  </span>
                                  <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {progressPercent.toFixed(1)}%
                                  </span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${
                                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                  <div
                                    className="h-full transition-all bg-gradient-to-r from-cyan-500 to-blue-500"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

