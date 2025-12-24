import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatFullNumber } from '../../../utils/dashboard/formatters';
import { UserTransactions } from '../hooks/useUserDetailsData';

interface UserTransactionsModalProps {
  userTransactions: UserTransactions | null;
}

export const UserTransactionsModal: React.FC<UserTransactionsModalProps> = ({
  userTransactions
}) => {
  const { isDark } = useTheme();
  
  const [transactionFilters, setTransactionFilters] = useState<{
    type: string;
    dateFrom: string;
    dateTo: string;
    amountMin: string;
    amountMax: string;
    direction: 'all' | 'income' | 'expense';
  }>({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    direction: 'all'
  });
  
  const [orderFilters, setOrderFilters] = useState<{
    type: string;
    status: string;
    dateFrom: string;
    dateTo: string;
    pointsMin: string;
    pointsMax: string;
    tonMin: string;
    tonMax: string;
  }>({
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    pointsMin: '',
    pointsMax: '',
    tonMin: '',
    tonMax: ''
  });

  // Фильтрация заказов
  const filteredOrders = useMemo(() => {
    if (!userTransactions?.orders || userTransactions.orders.length === 0) {
      return [];
    }

    let filtered = userTransactions.orders;

    // Фильтр по типу
    if (orderFilters.type !== 'all') {
      filtered = filtered.filter((order: any) => {
        const itemCode = String(order.item_code || '').toLowerCase();
        let filterType = orderFilters.type.toLowerCase();
        
        if (filterType === 'energystation') {
          return itemCode.includes('energy_station') || itemCode.includes('energystation');
        }
        
        return itemCode.includes(filterType);
      });
    }

    // Фильтр по статусу
    if (orderFilters.status !== 'all') {
      filtered = filtered.filter((order: any) => 
        (order.status || 'pending') === orderFilters.status
      );
    }

    // Фильтр по дате от
    if (orderFilters.dateFrom) {
      const dateFrom = new Date(orderFilters.dateFrom);
      dateFrom.setHours(0, 0, 0, 0);
      filtered = filtered.filter((order: any) => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate >= dateFrom;
      });
    }

    // Фильтр по дате до
    if (orderFilters.dateTo) {
      const dateTo = new Date(orderFilters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order: any) => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate <= dateTo;
      });
    }

    // Фильтр по минимальному количеству Points
    if (orderFilters.pointsMin) {
      const minPoints = parseFloat(orderFilters.pointsMin);
      if (!isNaN(minPoints)) {
        filtered = filtered.filter((order: any) => {
          const points = parseFloat(String(order.amount_points || 0));
          return points >= minPoints;
        });
      }
    }

    // Фильтр по максимальному количеству Points
    if (orderFilters.pointsMax) {
      const maxPoints = parseFloat(orderFilters.pointsMax);
      if (!isNaN(maxPoints)) {
        filtered = filtered.filter((order: any) => {
          const points = parseFloat(String(order.amount_points || 0));
          return points <= maxPoints;
        });
      }
    }

    // Фильтр по минимальному количеству TON
    if (orderFilters.tonMin) {
      const minTon = parseFloat(orderFilters.tonMin);
      if (!isNaN(minTon)) {
        filtered = filtered.filter((order: any) => {
          const ton = parseFloat(String(order.amount_ton || 0));
          return ton >= minTon;
        });
      }
    }

    // Фильтр по максимальному количеству TON
    if (orderFilters.tonMax) {
      const maxTon = parseFloat(orderFilters.tonMax);
      if (!isNaN(maxTon)) {
        filtered = filtered.filter((order: any) => {
          const ton = parseFloat(String(order.amount_ton || 0));
          return ton <= maxTon;
        });
      }
    }

    return filtered;
  }, [userTransactions?.orders, orderFilters]);

  // Фильтрация транзакций
  const filteredTransactions = useMemo(() => {
    if (!userTransactions?.all_transactions || userTransactions.all_transactions.length === 0) {
      return [];
    }

    let filtered = userTransactions.all_transactions;

    // Фильтр по типу
    if (transactionFilters.type !== 'all') {
      filtered = filtered.filter((t: any) => 
        t.operation_type === transactionFilters.type
      );
    }

    // Фильтр по направлению
    if (transactionFilters.direction === 'income') {
      filtered = filtered.filter((t: any) => 
        parseFloat(String(t.operation_value || 0)) > 0
      );
    } else if (transactionFilters.direction === 'expense') {
      filtered = filtered.filter((t: any) => 
        parseFloat(String(t.operation_value || 0)) < 0
      );
    }

    // Фильтр по дате от
    if (transactionFilters.dateFrom) {
      const dateFrom = new Date(transactionFilters.dateFrom);
      dateFrom.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t: any) => {
        if (!t.created_at) return false;
        const txDate = new Date(t.created_at);
        return txDate >= dateFrom;
      });
    }

    // Фильтр по дате до
    if (transactionFilters.dateTo) {
      const dateTo = new Date(transactionFilters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t: any) => {
        if (!t.created_at) return false;
        const txDate = new Date(t.created_at);
        return txDate <= dateTo;
      });
    }

    // Фильтр по минимальному объему
    if (transactionFilters.amountMin) {
      const minAmount = parseFloat(transactionFilters.amountMin);
      if (!isNaN(minAmount)) {
        filtered = filtered.filter((t: any) => {
          const txAmount = Math.abs(parseFloat(String(t.operation_value || 0)));
          return txAmount >= minAmount;
        });
      }
    }

    // Фильтр по максимальному объему
    if (transactionFilters.amountMax) {
      const maxAmount = parseFloat(transactionFilters.amountMax);
      if (!isNaN(maxAmount)) {
        filtered = filtered.filter((t: any) => {
          const txAmount = Math.abs(parseFloat(String(t.operation_value || 0)));
          return txAmount <= maxAmount;
        });
      }
    }

    return filtered;
  }, [userTransactions?.all_transactions, transactionFilters]);

  if (!userTransactions) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Заказы */}
      <div className="p-4 rounded-lg neu-card">
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Orders
          {userTransactions.loading && <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>(loading...)</span>}
        </h4>
        {userTransactions.loading ? (
          <div className="text-center py-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{userTransactions.total_orders || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Points Spent</p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{formatFullNumber(userTransactions.total_points_spent || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TON Spent</p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{formatFullNumber(userTransactions.total_ton_spent || 0)}</p>
              </div>
            </div>
            {/* Фильтры заказов */}
            {userTransactions.orders && userTransactions.orders.length > 0 && (
              <div className="mt-4 p-3 rounded-lg neu-card">
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Order Filters:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                    <select
                      value={orderFilters.type}
                      onChange={(e) => setOrderFilters({ ...orderFilters, type: e.target.value })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    >
                      <option value="all">All Types</option>
                      <option value="asic">ASIC</option>
                      <option value="energy">Energy</option>
                      <option value="land">Land</option>
                      <option value="energystation">Energy Station</option>
                      <option value="datacenter">Data Center</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                    <select
                      value={orderFilters.status}
                      onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    >
                      <option value="all">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date From</label>
                    <input
                      type="date"
                      value={orderFilters.dateFrom}
                      onChange={(e) => setOrderFilters({ ...orderFilters, dateFrom: e.target.value })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date To</label>
                    <input
                      type="date"
                      value={orderFilters.dateTo}
                      onChange={(e) => setOrderFilters({ ...orderFilters, dateTo: e.target.value })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setOrderFilters({
                        type: 'all',
                        status: 'all',
                        dateFrom: '',
                        dateTo: '',
                        pointsMin: '',
                        pointsMax: '',
                        tonMin: '',
                        tonMax: ''
                      })}
                      className="w-full neu-btn-filter"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Points min.</label>
                    <input
                      type="number"
                      step="any"
                      value={orderFilters.pointsMin}
                      onChange={(e) => setOrderFilters({ ...orderFilters, pointsMin: e.target.value })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm font-mono neu-input"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Points max.</label>
                    <input
                      type="number"
                      step="any"
                      value={orderFilters.pointsMax}
                      onChange={(e) => setOrderFilters({ ...orderFilters, pointsMax: e.target.value })}
                      placeholder="∞"
                      className="w-full px-2 py-1 text-sm font-mono neu-input"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>TON min.</label>
                    <input
                      type="number"
                      step="any"
                      value={orderFilters.tonMin}
                      onChange={(e) => setOrderFilters({ ...orderFilters, tonMin: e.target.value })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm font-mono neu-input"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>TON max.</label>
                    <input
                      type="number"
                      step="any"
                      value={orderFilters.tonMax}
                      onChange={(e) => setOrderFilters({ ...orderFilters, tonMax: e.target.value })}
                      placeholder="∞"
                      className="w-full px-2 py-1 text-sm font-mono neu-input"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Список заказов */}
            {filteredOrders.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing: {filteredOrders.length} of {userTransactions.orders.length} orders
                  </p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredOrders.map((order: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded-lg neu-card`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {order.item_code || `Order #${order.order_id || idx + 1}`}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              order.status === 'completed' 
                                ? isDark ? 'bg-green-500/30 text-green-400' : 'bg-green-500/20 text-green-700'
                                : order.status === 'cancelled' || order.status === 'failed'
                                ? isDark ? 'bg-red-500/30 text-red-400' : 'bg-red-500/20 text-red-700'
                                : isDark ? 'bg-yellow-500/30 text-yellow-400' : 'bg-yellow-500/20 text-yellow-700'
                            }`}>
                              {order.status || 'pending'}
                            </span>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs">
                            {order.amount_points > 0 && (
                              <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Points: {formatFullNumber(order.amount_points)}
                              </span>
                            )}
                            {order.amount_ton > 0 && (
                              <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                TON: {formatFullNumber(order.amount_ton)}
                              </span>
                            )}
                          </div>
                          {order.metadata && typeof order.metadata === 'object' && Object.keys(order.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className={`text-xs cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                ► Metadata
                              </summary>
                              <pre className={`text-xs mt-1 p-2 rounded-lg neu-inset ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {JSON.stringify(order.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <span className={`text-xs block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {order.created_at 
                              ? new Date(order.created_at).toLocaleDateString('en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })
                              : 'N/A'}
                          </span>
                          {order.order_id && (
                            <span className={`text-xs block mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              ID: {order.order_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Все транзакции */}
      <div className="p-4 rounded-lg neu-card">
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          All Transactions
          {userTransactions.loading && <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>(loading...)</span>}
        </h4>
        {userTransactions.loading ? (
          <div className="text-center py-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading transactions...</p>
          </div>
        ) : (
          <>
            {/* Фильтры транзакций */}
            {userTransactions.all_transactions && userTransactions.all_transactions.length > 0 && (
              <div className="mb-4 p-3 rounded-lg neu-card">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Transaction Type</label>
                    <select
                      value={transactionFilters.type}
                      onChange={(e) => setTransactionFilters({ ...transactionFilters, type: e.target.value })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    >
                      <option value="all">All Types</option>
                      {userTransactions.transactions_by_type && Object.keys(userTransactions.transactions_by_type).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Direction</label>
                    <select
                      value={transactionFilters.direction}
                      onChange={(e) => setTransactionFilters({ ...transactionFilters, direction: e.target.value as 'all' | 'income' | 'expense' })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    >
                      <option value="all">All</option>
                      <option value="income">Income (+)</option>
                      <option value="expense">Expense (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date From</label>
                    <input
                      type="date"
                      value={transactionFilters.dateFrom}
                      onChange={(e) => setTransactionFilters({ ...transactionFilters, dateFrom: e.target.value })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date To</label>
                    <input
                      type="date"
                      value={transactionFilters.dateTo}
                      onChange={(e) => setTransactionFilters({ ...transactionFilters, dateTo: e.target.value })}
                      className="w-full px-2 py-1 text-sm neu-input"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Min Amount</label>
                    <input
                      type="number"
                      step="any"
                      value={transactionFilters.amountMin}
                      onChange={(e) => setTransactionFilters({ ...transactionFilters, amountMin: e.target.value })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm neu-input"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Max Amount</label>
                    <input
                      type="number"
                      step="any"
                      value={transactionFilters.amountMax}
                      onChange={(e) => setTransactionFilters({ ...transactionFilters, amountMax: e.target.value })}
                      placeholder="∞"
                      className="w-full px-2 py-1 text-sm neu-input"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setTransactionFilters({
                        type: 'all',
                        dateFrom: '',
                        dateTo: '',
                        amountMin: '',
                        amountMax: '',
                        direction: 'all'
                      })}
                      className="w-full neu-btn-filter"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Отфильтрованные транзакции */}
            {filteredTransactions.length > 0 ? (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing: {filteredTransactions.length} of {userTransactions.all_transactions.length} transactions
                  </p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction: any, idx: number) => {
                    const assetName = userTransactions.assets_metadata?.[transaction.asset_id]?.name || `Asset ${transaction.asset_id}`;
                    const operationValue = parseFloat(String(transaction.operation_value || 0));
                    const isPositive = operationValue > 0;
                    const absValue = Math.abs(operationValue);
                    
                    return (
                      <div key={idx} className="p-3 rounded-lg neu-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-semibold font-mono ${isPositive 
                                ? (isDark ? 'text-green-400' : 'text-green-700') 
                                : (isDark ? 'text-red-400' : 'text-red-700')
                              }`}>
                                {isPositive ? '+' : ''}{formatFullNumber(absValue)}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{assetName}</span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {transaction.operation_type || 'N/A'}
                            </p>
                            {transaction.operation_id && (
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Operation ID: {transaction.operation_id}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <span className={`text-xs block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {transaction.created_at 
                                ? new Date(transaction.created_at).toLocaleDateString('en-US', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })
                                : 'N/A'}
                            </span>
                            {transaction.id && (
                              <span className={`text-xs block mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                ID: {transaction.id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No transactions
                </p>
              </div>
            )}
            {/* Статистика по типам транзакций */}
            {userTransactions.transactions_by_type && Object.keys(userTransactions.transactions_by_type).length > 0 && (
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Statistics by type:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(userTransactions.transactions_by_type).slice(0, 9).map(([type, stats]: [string, any]) => (
                    <div key={type} className="p-2 rounded-lg neu-card-sm">
                      <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {type}
                      </p>
                      <p className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {stats.count || 0} pcs. / {formatFullNumber(stats.total_value || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


