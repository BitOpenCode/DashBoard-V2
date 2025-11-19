// Код для CODE ноды в n8n для форматирования данных всех пользователей
// Входные данные: массив объектов из Postgres с полями пользователей

// 1) Получаем данные из предыдущей ноды (Postgres)
const raw = $input.all().map(i => i.json);

console.log('=== DEBUG: Raw input ===');
console.log('Raw length:', raw.length);
if (raw.length > 0) {
  console.log('First raw item:', JSON.stringify(raw[0], null, 2));
}

// 2) Функция для извлечения массива из разных форматов ответа
function extractArray(obj) {
  if (Array.isArray(obj)) return obj;
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj.result)) return obj.result;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.rows)) return obj.rows;
    if (Array.isArray(obj.records)) return obj.records;
    if (Array.isArray(obj.items)) return obj.items;
  }
  return null;
}

// 3) Нормализация данных - собираем все записи в один массив
let users = [];

// Обрабатываем каждый элемент из raw
for (const item of raw) {
  const arr = extractArray(item);
  if (arr) {
    // Если это массив, добавляем все элементы
    users.push(...arr);
  } else if (item && typeof item === 'object') {
    // Если это объект с данными пользователя, добавляем его
    // Проверяем наличие ключевых полей
    if (item.person_id !== undefined || item.user_id !== undefined) {
      users.push(item);
    }
  }
}

console.log(`Получено ${users.length} пользователей из Postgres`);
if (users.length > 0) {
  console.log('Пример первого пользователя:', JSON.stringify(users[0], null, 2));
}

// 4) Форматируем данные для фронтенда
const formattedUsers = users.map((user, index) => {
  // Нормализуем поля (на случай разных названий в БД)
  const personId = user.person_id || user.user_id || user.id || null;
  const username = user.username || user.tg_username || user.name || 'Unknown';
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const walletAddress = user.wallet_address || user.wallet || null;
  const hexWalletAddress = user.hex_wallet_address || user.hex_wallet || null;
  const photoUrl = user.photo_url || user.avatar_url || user.avatar || null;
  const tgId = user.tg_id || user.telegram_id || user.telegramId || '';
  
  // Обрабатываем total_asics (может быть строкой или числом)
  const totalAsics = user.total_asics || user.total_asics_count || user.asic_count || user.asics || 0;
  const totalAsicsNumber = typeof totalAsics === 'string' ? parseInt(totalAsics) || 0 : parseInt(totalAsics) || 0;
  
  // Обрабатываем level (может быть строкой или числом)
  const level = user.level !== undefined && user.level !== null 
    ? (typeof user.level === 'string' ? parseInt(user.level) || 0 : parseInt(user.level) || 0)
    : null;
  
  // Обрабатываем effective_ths (может быть строкой или числом)
  const effectiveThs = user.effective_ths || user.effective_th || 0;
  const effectiveThsNumber = typeof effectiveThs === 'string' ? parseFloat(effectiveThs) || 0 : parseFloat(effectiveThs) || 0;
  
  // Обрабатываем progress_cached (может быть строкой или числом)
  const progressCached = user.progress_cached || user.progress || 0;
  const progressCachedNumber = typeof progressCached === 'string' ? parseFloat(progressCached) || 0 : parseFloat(progressCached) || 0;
  
  // Обрабатываем level_updated_at
  const levelUpdatedAt = user.level_updated_at || null;
  
  // Обрабатываем total_balance и balance_by_asset
  const totalBalance = user.total_balance ? (typeof user.total_balance === 'string' ? parseFloat(user.total_balance) || 0 : parseFloat(user.total_balance) || 0) : 0;
  const balanceByAsset = user.balance_by_asset || {};
  
  // Обрабатываем assets_metadata и заменяем ECOScoin на XP
  const assetsMetadataRaw = user.assets_metadata || {};
  const assetsMetadata = {};
  for (const assetId in assetsMetadataRaw) {
    if (assetsMetadataRaw.hasOwnProperty(assetId)) {
      const asset = assetsMetadataRaw[assetId];
      assetsMetadata[assetId] = {
        ...asset,
        name: asset.name === 'ECOScoin' ? 'XP' : (asset.name || `Asset ${assetId}`)
      };
    }
  }
  
  // Обрабатываем balance_history
  const balanceHistory = user.balance_history || {};
  
  // Обрабатываем last_transaction
  const lastTransaction = user.last_transaction || null;
  
  // Обрабатываем all_transactions (все транзакции пользователя)
  // Может быть массивом, JSON строкой, или объектом
  let allTransactions = [];
  if (user.all_transactions) {
    if (Array.isArray(user.all_transactions)) {
      allTransactions = user.all_transactions;
    } else if (typeof user.all_transactions === 'string') {
      try {
        allTransactions = JSON.parse(user.all_transactions);
        if (!Array.isArray(allTransactions)) {
          allTransactions = [];
        }
      } catch (e) {
        console.warn('Ошибка парсинга all_transactions:', e);
        allTransactions = [];
      }
    } else if (typeof user.all_transactions === 'object') {
      // Если это объект, пытаемся извлечь массив
      if (Array.isArray(user.all_transactions.transactions)) {
        allTransactions = user.all_transactions.transactions;
      } else {
        allTransactions = [];
      }
    }
  }
  
  // Обрабатываем transactions_by_type (статистика по типам операций)
  // Может быть объектом, JSON строкой
  let transactionsByType = {};
  if (user.transactions_by_type) {
    if (typeof user.transactions_by_type === 'object' && !Array.isArray(user.transactions_by_type)) {
      transactionsByType = user.transactions_by_type;
    } else if (typeof user.transactions_by_type === 'string') {
      try {
        transactionsByType = JSON.parse(user.transactions_by_type);
        if (Array.isArray(transactionsByType) || typeof transactionsByType !== 'object') {
          transactionsByType = {};
        }
      } catch (e) {
        console.warn('Ошибка парсинга transactions_by_type:', e);
        transactionsByType = {};
      }
    }
  }
  
  // Обрабатываем mining_summary
  const miningSummary = user.mining_summary || {};
  
  // Обрабатываем last_mining
  const lastMining = user.last_mining || null;
  
  // Обрабатываем checkin_summary
  const checkinSummary = user.checkin_summary || {};
  
  // Обрабатываем streak_summary
  const streakSummary = user.streak_summary || {};
  
  // Обрабатываем participation_summary
  const participationSummary = user.participation_summary || {};
  
  // Обрабатываем poke данные
  const pokeSentCount = user.poke_sent_count ? (typeof user.poke_sent_count === 'string' ? parseInt(user.poke_sent_count) || 0 : parseInt(user.poke_sent_count) || 0) : 0;
  const pokeReceivedCount = user.poke_received_count ? (typeof user.poke_received_count === 'string' ? parseInt(user.poke_received_count) || 0 : parseInt(user.poke_received_count) || 0) : 0;
  const pokeRewards = user.poke_rewards || [];
  
  // Обрабатываем referrals
  const totalReferrals = user.total_referrals ? (typeof user.total_referrals === 'string' ? parseInt(user.total_referrals) || 0 : parseInt(user.total_referrals) || 0) : 0;
  const referees = user.referees || [];
  
  // Обрабатываем orders
  const totalOrders = user.total_orders ? (typeof user.total_orders === 'string' ? parseInt(user.total_orders) || 0 : parseInt(user.total_orders) || 0) : 0;
  const totalPointsSpent = user.total_points_spent ? (typeof user.total_points_spent === 'string' ? parseFloat(user.total_points_spent) || 0 : parseFloat(user.total_points_spent) || 0) : 0;
  const totalTonSpent = user.total_ton_spent ? (typeof user.total_ton_spent === 'string' ? parseFloat(user.total_ton_spent) || 0 : parseFloat(user.total_ton_spent) || 0) : 0;
  const orders = user.orders || [];
  
  // Обрабатываем ownership_details
  const ownershipDetails = user.ownership_details || [];
  
  // Обрабатываем photo_url (может быть tg_photo_url)
  const finalPhotoUrl = photoUrl || user.tg_photo_url || null;
  
  return {
    person_id: parseInt(personId) || 0,
    person_language: user.person_language || user.language || 'en',
    wallet_address: walletAddress,
    hex_wallet_address: hexWalletAddress,
    is_ecos_premium: user.is_ecos_premium === true || user.is_ecos_premium === 'true' || user.ecos_premium === true,
    ecos_premium_until: user.ecos_premium_until || user.premium_until || null,
    onbording_done: user.onbording_done === true || user.onbording_done === 'true' || user.onboarding_done === true,
    person_created_at: user.person_created_at || user.created_at || user.registered_at || '',
    person_updated_at: user.person_updated_at || user.updated_at || '',
    tg_id: String(tgId),
    first_name: firstName,
    last_name: lastName,
    username: username,
    tg_language: user.tg_language || user.telegram_language || user.language || 'en',
    tg_premium: user.tg_premium === true || user.tg_premium === 'true' || user.telegram_premium === true,
    photo_url: finalPhotoUrl,
    tg_created_at: user.tg_created_at || user.telegram_created_at || user.person_created_at || '',
    tg_updated_at: user.tg_updated_at || user.telegram_updated_at || user.person_updated_at || '',
    total_asics: totalAsicsNumber,
    total_th: totalAsicsNumber * 234, // Вычисляем Th: ASIC * 234
    level: level,
    effective_ths: effectiveThsNumber,
    progress_cached: progressCachedNumber,
    level_updated_at: levelUpdatedAt,
    ownership_details: ownershipDetails,
    total_balance: totalBalance,
    balance_by_asset: balanceByAsset,
    assets_metadata: assetsMetadata,
    balance_history: balanceHistory,
    last_transaction: lastTransaction,
    all_transactions: allTransactions,
    transactions_by_type: transactionsByType,
    mining_summary: miningSummary,
    last_mining: lastMining,
    checkin_summary: checkinSummary,
    streak_summary: streakSummary,
    participation_summary: participationSummary,
    poke_sent_count: pokeSentCount,
    poke_received_count: pokeReceivedCount,
    poke_rewards: pokeRewards,
    total_referrals: totalReferrals,
    referees: referees,
    total_orders: totalOrders,
    total_points_spent: totalPointsSpent,
    total_ton_spent: totalTonSpent,
    orders: orders
  };
});

console.log(`Отформатировано ${formattedUsers.length} пользователей`);
console.log('Пример отформатированного пользователя:', JSON.stringify(formattedUsers[0], null, 2));

// 5) Возвращаем результат в формате n8n
// Используем тот же подход, что и для других webhooks - возвращаем объект с массивом
// Это решает проблему с responseMode: "lastNode"
return [{
  json: {
    users: formattedUsers,
    total: formattedUsers.length
  }
}];

