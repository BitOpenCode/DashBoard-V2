// Код для CODE ноды в n8n для форматирования данных транзакций и заказов
// Входные данные: результат SQL запроса из Postgres ноды
//
// ВАЖНО: SQL запрос фильтруется по конкретному person_id из query параметра webhook
// Поэтому возвращаются данные только для одного пользователя

// 1) Получаем данные из предыдущей ноды (Postgres)
const raw = $input.all().map(i => i.json);

console.log('=== DEBUG: Raw input ===');
console.log('Raw length:', raw.length);
if (raw.length > 0) {
  console.log('First raw item:', JSON.stringify(raw[0], null, 2));
}

// 2) Функция для извлечения данных из разных форматов ответа
function extractData(obj) {
  if (Array.isArray(obj) && obj.length > 0) {
    return obj[0];
  }
  if (obj && typeof obj === 'object') {
    if (obj.rows && Array.isArray(obj.rows) && obj.rows.length > 0) {
      return obj.rows[0];
    }
    if (obj.result && Array.isArray(obj.result) && obj.result.length > 0) {
      return obj.result[0];
    }
    if (obj.person_id !== undefined) {
      return obj;
    }
  }
  return null;
}

// 3) Извлекаем данные пользователя
let userData = null;
for (const item of raw) {
  const extracted = extractData(item);
  if (extracted && extracted.person_id !== undefined) {
    userData = extracted;
    break;
  }
}

if (!userData) {
  console.error('❌ Не удалось найти данные пользователя');
  return [{
    json: {
      error: 'Данные пользователя не найдены',
      person_id: null,
      all_transactions: [],
      transactions_by_type: {},
      balance_history: {},
      last_transaction: null,
      total_orders: 0,
      total_points_spent: 0,
      total_ton_spent: 0,
      orders: [],
      assets_metadata: {}
    }
  }];
}

console.log('✅ Данные пользователя найдены, person_id:', userData.person_id);

// 4) Обрабатываем all_transactions (все транзакции пользователя)
let allTransactions = [];
if (userData.all_transactions) {
  if (Array.isArray(userData.all_transactions)) {
    allTransactions = userData.all_transactions;
  } else if (typeof userData.all_transactions === 'string') {
    try {
      allTransactions = JSON.parse(userData.all_transactions);
      if (!Array.isArray(allTransactions)) {
        allTransactions = [];
      }
    } catch (e) {
      console.warn('Ошибка парсинга all_transactions:', e);
      allTransactions = [];
    }
  }
}

console.log(`📊 Обработано ${allTransactions.length} транзакций`);

// 5) Обрабатываем transactions_by_type (статистика по типам операций)
let transactionsByType = {};
if (userData.transactions_by_type) {
  if (typeof userData.transactions_by_type === 'object' && !Array.isArray(userData.transactions_by_type)) {
    transactionsByType = userData.transactions_by_type;
  } else if (typeof userData.transactions_by_type === 'string') {
    try {
      transactionsByType = JSON.parse(userData.transactions_by_type);
      if (Array.isArray(transactionsByType) || typeof transactionsByType !== 'object') {
        transactionsByType = {};
      }
    } catch (e) {
      console.warn('Ошибка парсинга transactions_by_type:', e);
      transactionsByType = {};
    }
  }
}

console.log(`📊 Обработано ${Object.keys(transactionsByType).length} типов транзакций`);

// 6) Обрабатываем balance_history
let balanceHistory = {};
if (userData.balance_history) {
  if (typeof userData.balance_history === 'object' && !Array.isArray(userData.balance_history)) {
    balanceHistory = userData.balance_history;
  } else if (typeof userData.balance_history === 'string') {
    try {
      balanceHistory = JSON.parse(userData.balance_history);
      if (Array.isArray(balanceHistory) || typeof balanceHistory !== 'object') {
        balanceHistory = {};
      }
    } catch (e) {
      console.warn('Ошибка парсинга balance_history:', e);
      balanceHistory = {};
    }
  }
}

// 7) Обрабатываем last_transaction
let lastTransaction = null;
if (userData.last_transaction) {
  if (typeof userData.last_transaction === 'object' && !Array.isArray(userData.last_transaction)) {
    lastTransaction = userData.last_transaction;
  } else if (typeof userData.last_transaction === 'string') {
    try {
      lastTransaction = JSON.parse(userData.last_transaction);
      if (Array.isArray(lastTransaction) || Object.keys(lastTransaction).length === 0) {
        lastTransaction = null;
      }
    } catch (e) {
      console.warn('Ошибка парсинга last_transaction:', e);
      lastTransaction = null;
    }
  }
}

// 8) Обрабатываем orders (заказы)
// Может быть null, если нет заказов или если есть только статистика
let orders = [];
if (userData.orders !== null && userData.orders !== undefined) {
  if (Array.isArray(userData.orders)) {
    orders = userData.orders;
  } else if (typeof userData.orders === 'string') {
    try {
      orders = JSON.parse(userData.orders);
      if (!Array.isArray(orders)) {
        orders = [];
      }
    } catch (e) {
      console.warn('Ошибка парсинга orders:', e);
      orders = [];
    }
  }
}

console.log(`📊 Обработано ${orders.length} заказов`);

// 9) Обрабатываем assets_metadata (заменяем ECOScoin на XP)
let assetsMetadata = {};
if (userData.assets_metadata) {
  if (typeof userData.assets_metadata === 'object' && !Array.isArray(userData.assets_metadata)) {
    assetsMetadata = userData.assets_metadata;
    // Заменяем ECOScoin на XP
    for (const assetId in assetsMetadata) {
      if (assetsMetadata[assetId] && assetsMetadata[assetId].name === 'ECOScoin') {
        assetsMetadata[assetId].name = 'XP';
      }
    }
  } else if (typeof userData.assets_metadata === 'string') {
    try {
      assetsMetadata = JSON.parse(userData.assets_metadata);
      if (typeof assetsMetadata === 'object' && !Array.isArray(assetsMetadata)) {
        // Заменяем ECOScoin на XP
        for (const assetId in assetsMetadata) {
          if (assetsMetadata[assetId] && assetsMetadata[assetId].name === 'ECOScoin') {
            assetsMetadata[assetId].name = 'XP';
          }
        }
      } else {
        assetsMetadata = {};
      }
    } catch (e) {
      console.warn('Ошибка парсинга assets_metadata:', e);
      assetsMetadata = {};
    }
  }
}

// 10) Обрабатываем числовые поля
const totalOrders = userData.total_orders 
  ? (typeof userData.total_orders === 'string' ? parseInt(userData.total_orders) || 0 : parseInt(userData.total_orders) || 0)
  : 0;

const totalPointsSpent = userData.total_points_spent 
  ? (typeof userData.total_points_spent === 'string' ? parseFloat(userData.total_points_spent) || 0 : parseFloat(userData.total_points_spent) || 0)
  : 0;

const totalTonSpent = userData.total_ton_spent 
  ? (typeof userData.total_ton_spent === 'string' ? parseFloat(userData.total_ton_spent) || 0 : parseFloat(userData.total_ton_spent) || 0)
  : 0;

// 11) Формируем итоговый объект для фронтенда
const formattedData = {
  person_id: parseInt(userData.person_id) || 0,
  all_transactions: allTransactions,
  transactions_by_type: transactionsByType,
  balance_history: balanceHistory,
  last_transaction: lastTransaction,
  total_orders: totalOrders,
  total_points_spent: totalPointsSpent,
  total_ton_spent: totalTonSpent,
  orders: orders,
  assets_metadata: assetsMetadata
};

console.log('✅ Данные отформатированы для фронтенда');
console.log('📊 Итоговая статистика:', {
  person_id: formattedData.person_id,
  transactions_count: formattedData.all_transactions.length,
  orders_count: formattedData.orders.length,
  transaction_types_count: Object.keys(formattedData.transactions_by_type).length
});

// 12) Возвращаем результат в формате n8n
// Используем responseMode: "lastNode" - возвращаем объект напрямую
return [{
  json: formattedData
}];

