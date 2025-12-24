import React, { useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { useWalletUsersData } from '../hooks/useWalletUsersData';

interface WalletUsersSectionProps {
  // Компонент сам управляет своими данными через хук
}

export const WalletUsersSection: React.FC<WalletUsersSectionProps> = () => {
  const { isDark } = useTheme();
  const {
    walletUsers,
    walletUsersLoading,
    walletBalances,
    walletSearchQuery,
    setWalletSearchQuery,
    tonUsdRate,
    loadWalletUsers,
    checkWalletBalance
  } = useWalletUsersData();

  // Дебаунс поискового запроса (300ms задержка)
  const [debouncedSearchQuery] = useDebounce(walletSearchQuery, 300);

  // Фильтрация пользователей по поисковому запросу (используем debounced значение)
  const filteredUsers = useMemo(() => {
    if (!walletUsers || walletUsers.length === 0) {
      return [];
    }

    if (!debouncedSearchQuery.trim()) {
      return walletUsers;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return walletUsers.filter((user) => {
      const displayName = (user.display_name || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      const id = String(user.id || '');
      return displayName.includes(query) || username.includes(query) || id.includes(query);
    });
  }, [walletUsers, debouncedSearchQuery]);

  // Если данные не загружены, показываем кнопку загрузки
  if (!walletUsers || walletUsers.length === 0) {
    return (
      <div className="mb-6">
        <div className="neu-card p-6 text-center">
          <button
            onClick={loadWalletUsers}
            disabled={walletUsersLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              walletUsersLoading
                ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                : isDark
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {walletUsersLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Load Wallet Users
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="neu-card p-6">
        {/* Поиск */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={walletSearchQuery}
            onChange={(e) => setWalletSearchQuery(e.target.value)}
            placeholder="Search by name, username or ID..."
            className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-all ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50'
            } focus:outline-none`}
          />
          {walletSearchQuery && (
            <button
              onClick={() => setWalletSearchQuery('')}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}
              title="Clear"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Счетчик результатов */}
        {walletSearchQuery && (
          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Found: {filteredUsers.length} of {walletUsers.length}
          </div>
        )}

        {/* Список пользователей */}
        {filteredUsers.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <svg className={`w-16 h-16 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nothing found
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Try changing your search query
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {filteredUsers.map((u, index) => {
              const wallet = u.wallet_address || '';
              const shortWallet = wallet.length > 20 ? `${wallet.slice(0, 8)}...${wallet.slice(-8)}` : wallet || '-';
              const displayName = u.username ? `@${u.username}` : u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : `User #${u.id}`;
              const balanceInfo = walletBalances[wallet];
              
              return (
                <div 
                  key={u.id}
                  className={`p-4 rounded-lg transition-all ${
                    isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Верхняя часть: номер, имя, ID */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs flex-shrink-0 ${
                      isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} truncate`}>
                        {displayName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID: {u.id}</span>
                        {u.language_code && (
                          <span className={`${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'} px-2 py-0.5 rounded text-xs font-semibold uppercase`}>
                            {u.language_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Средняя часть: адрес кошелька */}
                  <div className={`flex items-center justify-between flex-wrap gap-2 pb-3 mb-3 ${isDark ? 'border-b border-gray-600' : 'border-b border-gray-200'}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Wallet Address:</span>
                    <div className="flex items-center gap-2">
                      <code 
                        className={`text-sm font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'} px-2 py-1 rounded ${isDark ? 'bg-gray-600/50' : 'bg-emerald-50'}`}
                        title={wallet}
                      >
                        {shortWallet}
                      </code>
                      {wallet && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(wallet);
                            toast.success('Address copied!');
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                          }`}
                          title="Copy address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Нижняя часть: кнопка проверки и баланс */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => checkWalletBalance(wallet)}
                      disabled={balanceInfo?.loading || !wallet}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        balanceInfo?.loading || !wallet
                          ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                          : isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {balanceInfo?.loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Check Wallet
                        </>
                      )}
                    </button>
                    
                    {/* Отображение баланса */}
                    {balanceInfo && !balanceInfo.loading && (
                      <div className="flex items-center gap-2">
                        {balanceInfo.error ? (
                          <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            ❌ Error
                          </span>
                        ) : balanceInfo.balance ? (
                          <div className={`flex flex-col gap-1 px-3 py-1.5 rounded-lg ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                              </svg>
                              <span className="font-bold text-lg">{balanceInfo.balance}</span>
                              <span className="text-sm font-medium">TON</span>
                            </div>
                            {tonUsdRate !== null && (
                              <div className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'} flex items-center gap-1`}>
                                <span>≈</span>
                                <span className="font-semibold">
                                  ${(parseFloat(balanceInfo.balance) * tonUsdRate).toFixed(2)}
                                </span>
                                <span className="opacity-75">USD</span>
                              </div>
                            )}
                          </div>
                        ) : null}
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

