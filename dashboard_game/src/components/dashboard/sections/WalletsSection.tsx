import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Users } from 'lucide-react';
import { WalletsData } from '../hooks/types';

interface WalletsSectionProps {
  walletsData: WalletsData;
  onLoadWalletUsers: () => void;
  walletUsersLoading: boolean;
}

/**
 * Компонент секции статистики кошельков
 */
export const WalletsSection: React.FC<WalletsSectionProps> = ({
  walletsData,
  onLoadWalletUsers,
  walletUsersLoading,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">💳 Статистика кошельков</h2>
      </div>

      <div className="space-y-6">
        {/* Карточки статистики кошельков - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Всего пользователей */}
          <div
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
              isDark
                ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50'
                : 'bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm'
            } rounded-2xl p-6`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <Users className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`} />
                <span
                  className={`text-xs font-medium tracking-wide uppercase ${
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  }`}
                >
                  Всего пользователей
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className={`text-5xl font-semibold tracking-tight mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {walletsData.totalUsers}
                </div>
              </div>
            </div>
          </div>

          {/* С кошельком */}
          <div
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
              isDark
                ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50'
                : 'bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm'
            } rounded-2xl p-6`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`}></div>
                <span
                  className={`text-xs font-medium tracking-wide uppercase ${
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  }`}
                >
                  С кошельком
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className={`text-5xl font-semibold tracking-tight mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {walletsData.withWalletCount}
                </div>
                <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {walletsData.withWalletPercent} от общего
                </div>
              </div>
            </div>
          </div>

          {/* Без кошелька */}
          <div
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
              isDark
                ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50'
                : 'bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm'
            } rounded-2xl p-6`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full bg-red-500`}></div>
                <span
                  className={`text-xs font-medium tracking-wide uppercase ${
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  }`}
                >
                  Без кошелька
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className={`text-5xl font-semibold tracking-tight mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {walletsData.withoutWalletCount}
                </div>
                <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {walletsData.withoutWalletPercent} от общего
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка для просмотра пользователей с кошельками */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadWalletUsers}
            disabled={walletUsersLoading}
            className={`group relative px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-3 text-sm ${
              walletUsersLoading
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed text-gray-400'
                : isDark
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {walletUsersLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Показать пользователей с кошельками</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

