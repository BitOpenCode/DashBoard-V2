import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { numberFormat } from '../../../utils/dashboard/formatters';
import { useUserDetailsData } from '../hooks/useUserDetailsData';
import { UserTransactionsModal } from './UserTransactionsModal';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: number | null;
  allUsersData?: any;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  personId,
  allUsersData
}) => {
  const { isDark } = useTheme();
  const { userDetails, userTransactions, loadUserDetails, closeModal } = useUserDetailsData();

  // Загружаем данные при открытии модального окна
  React.useEffect(() => {
    if (isOpen && personId) {
      loadUserDetails(personId, allUsersData);
    }
  }, [isOpen, personId]);

  const handleClose = () => {
    closeModal();
    onClose();
  };

  // Получаем информацию о рефералах из allUsersData
  const refereesList = useMemo(() => {
    if (!userDetails?.user?.referees || !Array.isArray(userDetails.user.referees) || userDetails.user.referees.length === 0) {
      return [];
    }
    
    if (!allUsersData || !allUsersData.users) {
      return userDetails.user.referees.map((ref: any) => ({
        referee_id: ref.referee_id,
        joined_at: ref.joined_at,
        username: null,
        first_name: null,
        last_name: null,
        level: null,
        total_asics: null,
        total_th: null
      }));
    }
    
    return userDetails.user.referees.map((ref: any) => {
      const refereeInfo = allUsersData.users.find((u: any) => u.person_id === ref.referee_id);
      return {
        referee_id: ref.referee_id,
        joined_at: ref.joined_at,
        username: refereeInfo?.username || null,
        first_name: refereeInfo?.first_name || null,
        last_name: refereeInfo?.last_name || null,
        level: refereeInfo?.level !== undefined ? refereeInfo.level : null,
        total_asics: refereeInfo?.total_asics || null,
        total_th: refereeInfo?.total_th || null,
        photo_url: refereeInfo?.photo_url || null
      };
    });
  }, [userDetails, allUsersData]);


  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content 
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-6xl w-full max-h-[90vh] rounded-xl shadow-2xl p-6 mb-8 neu-card-lg z-50 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          {/* Заголовок модального окна */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👤</span>
              <div>
                <Dialog.Title className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  User Details
                </Dialog.Title>
                {userDetails?.user && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userDetails.user.username || userDetails.user.first_name || `ID: ${userDetails.user.person_id}`}
                  </p>
                )}
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
                <X className="w-6 h-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Контент модального окна */}
          {userDetails?.loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : userDetails?.user ? (
            <div className="space-y-6">
              {/* Основная информация */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Person ID</p>
                    <p className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{userDetails.user.person_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TG ID</p>
                    <p className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{userDetails.user.tg_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Username</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{userDetails.user.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{userDetails.user.first_name || 'N/A'} {userDetails.user.last_name || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Level</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{userDetails.user.level !== null ? userDetails.user.level : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ASIC</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{numberFormat(userDetails.user.total_asics || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Th</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{numberFormat(userDetails.user.total_th || 0)} Th</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Effective Th/s</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{numberFormat(userDetails.user.effective_ths || 0)} Th/s</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                      {userDetails.user.progress_cached ? `${(userDetails.user.progress_cached * 100).toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Баланс */}
              {userDetails.user.total_balance !== undefined && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Balance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Balance</p>
                      <p className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {numberFormat(userDetails.user.total_balance || 0)}
                      </p>
                    </div>
                    {userDetails.user.balance_by_asset && Object.keys(userDetails.user.balance_by_asset).map((assetId) => {
                      const assetNameRaw = userDetails.user.assets_metadata?.[assetId]?.name || `Asset ${assetId}`;
                      const assetName = assetNameRaw === 'ECOScoin' ? 'XP' : assetNameRaw;
                      const balance = userDetails.user.balance_by_asset[assetId];
                      return (
                        <div key={assetId}>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{assetName}</p>
                          <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{numberFormat(balance || 0)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* История баланса */}
              {userDetails.user.balance_history && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Balance History</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net</p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{numberFormat(userDetails.user.balance_history.net || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total In</p>
                      <p className={`${isDark ? 'text-green-400' : 'text-green-600'}`}>{numberFormat(userDetails.user.balance_history.total_in || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Out</p>
                      <p className={`${isDark ? 'text-red-400' : 'text-red-600'}`}>{numberFormat(userDetails.user.balance_history.total_out || 0)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Майнинг */}
              {userDetails.user.mining_summary && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mining</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sessions</p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{userDetails.user.mining_summary.sessions_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Energy (kWh)</p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{numberFormat(userDetails.user.mining_summary.total_energy_kwh || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Effective Th/s</p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{numberFormat(userDetails.user.mining_summary.total_effective_ths || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estimated BTC</p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{userDetails.user.mining_summary.total_estimated_btc || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Рефералы */}
              {userDetails.user.total_referrals !== undefined && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Referrals ({userDetails.user.total_referrals || 0})
                  </h4>
                  
                  {refereesList.length > 0 ? (
                    <div className="space-y-3">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                              <th className={`text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                ID
                              </th>
                              <th className={`text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                User
                              </th>
                              <th className={`text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Level
                              </th>
                              <th className={`text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                ASIC
                              </th>
                              <th className={`text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Th
                              </th>
                              <th className={`text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Registration Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {refereesList.map((referee: any, index: number) => (
                              <tr 
                                key={referee.referee_id || index}
                                className={`border-b transition-colors ${
                                  isDark 
                                    ? 'border-gray-700/50 hover:bg-gray-700/30' 
                                    : 'border-gray-100 hover:bg-gray-50'
                                } ${index % 2 === 0 ? (isDark ? 'bg-gray-800/30' : 'bg-gray-50/30') : ''}`}
                              >
                                <td className={`py-2 px-3 text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {referee.referee_id}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-2">
                                    {referee.photo_url && (
                                      <img 
                                        src={referee.photo_url} 
                                        alt={referee.username || 'User'}
                                        className="w-6 h-6 rounded-full flex-shrink-0"
                                        onError={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          img.style.display = 'none';
                                        }}
                                        loading="lazy"
                                      />
                                    )}
                                    <div className="min-w-0">
                                      <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {referee.username || 'Unknown'}
                                      </p>
                                      {(referee.first_name || referee.last_name) && (
                                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {referee.first_name} {referee.last_name}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {referee.level !== null ? (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                      referee.level === 0 
                                        ? isDark ? 'bg-gray-700/50 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'
                                        : referee.level <= 3
                                        ? isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : referee.level <= 6
                                        ? isDark ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : referee.level <= 8
                                        ? isDark ? 'bg-orange-900/50 text-orange-300 border border-orange-700' : 'bg-orange-100 text-orange-800 border border-orange-200'
                                        : isDark ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                      {referee.level}
                                    </span>
                                  ) : (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-gray-700/50 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className={`py-2 px-3 text-right text-sm font-semibold tabular-nums ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                  {referee.total_asics !== null ? numberFormat(referee.total_asics) : '—'}
                                </td>
                                <td className={`py-2 px-3 text-right text-sm font-semibold tabular-nums ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                  {referee.total_th !== null ? `${numberFormat(referee.total_th)} Th` : '—'}
                                </td>
                                <td className={`py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {referee.joined_at 
                                    ? new Date(referee.joined_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No invited users
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Транзакции и заказы */}
              <UserTransactionsModal userTransactions={userTransactions} />

              {/* JSON для отладки */}
              <details className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <summary className="cursor-pointer text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Full Data (JSON)
                </summary>
                <pre className={`text-xs overflow-auto max-h-96 p-4 rounded ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                  {JSON.stringify(userDetails.user, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Failed to load user data
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

