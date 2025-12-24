import { useState } from 'react';
import toast from 'react-hot-toast';

export interface UserDetails {
  user: any;
  loading: boolean;
}

export interface UserTransactions {
  all_transactions: any[];
  transactions_by_type: any;
  balance_history: any;
  last_transaction: any;
  total_orders: number;
  total_points_spent: number;
  total_ton_spent: number;
  orders: any[];
  assets_metadata: any;
  loading: boolean;
}

/**
 * Хук для управления данными деталей пользователя
 */
export const useUserDetailsData = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userTransactions, setUserTransactions] = useState<UserTransactions | null>(null);

  /**
   * Нормализует данные пользователя из разных форматов
   */
  const normalizeUserData = (user: any): any => {
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
    const assetsMetadata: any = {};
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
    let allTransactions: any[] = [];
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
        if (Array.isArray(user.all_transactions.transactions)) {
          allTransactions = user.all_transactions.transactions;
        } else {
          allTransactions = [];
        }
      }
    }
    
    // Обрабатываем transactions_by_type (статистика по типам операций)
    let transactionsByType: any = {};
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
      person_id: parseInt(String(personId)) || 0,
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
  };

  /**
   * Загружает детали пользователя
   */
  const loadUserDetails = async (personId: number, allUsersData?: any) => {
    console.log('🚀 loadUserDetails вызвана для person_id:', personId, '(тип:', typeof personId, ')');
    setUserDetails({ user: null, loading: true });
    
    try {
      // Убеждаемся, что personId - это число
      const personIdNum = parseInt(String(personId));
      if (isNaN(personIdNum)) {
        throw new Error(`Некорректный person_id: ${personId}`);
      }
      
      // Используем webhook game-user-4kpi, который возвращает всех пользователей
      const webhookUrl = import.meta.env.DEV 
        ? `/webhook/game-user-4kpi`
        : `https://n8n-p.blc.am/webhook/game-user-4kpi`;
      
      console.log('🔗 Загрузка данных всех пользователей с webhook:', webhookUrl);
      
      // Используем GET запрос (webhook возвращает всех пользователей)
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Полученные данные от webhook (RAW):', data);
      
      // Webhook возвращает массив всех пользователей (как в final.json)
      // Нужно найти нужного пользователя по person_id на фронте
      let allUsers: any[] = [];
      
      if (Array.isArray(data)) {
        allUsers = data;
        console.log(`✅ Получен массив из ${allUsers.length} пользователей`);
      } else if (data && typeof data === 'object') {
        // Проверяем все возможные поля, которые могут содержать массив
        if (data.rows && Array.isArray(data.rows)) {
          allUsers = data.rows;
        } else if (data.result && Array.isArray(data.result)) {
          allUsers = data.result;
        } else if (data.users && Array.isArray(data.users)) {
          allUsers = data.users;
        } else if (data.data && Array.isArray(data.data)) {
          allUsers = data.data;
        } else {
          // Пробуем найти любой массив в объекте
          for (const key in data) {
            if (Array.isArray(data[key])) {
              const arr = data[key];
              if (arr.length > 0 && (arr[0].person_id !== undefined || arr[0].id !== undefined)) {
                allUsers = arr;
                break;
              }
            }
          }
          
          if (allUsers.length === 0) {
            allUsers = [data];
          }
        }
      }
      
      console.log(`📊 Всего получено ${allUsers.length} пользователей от webhook`);
      
      // Если webhook вернул мало пользователей, используем уже загруженные данные из allUsersData
      let searchInUsers = allUsers;
      
      if (allUsers.length < 100 && allUsersData && allUsersData.users && Array.isArray(allUsersData.users) && allUsersData.users.length > 0) {
        console.log(`✅ Используем уже загруженные данные из allUsersData (${allUsersData.users.length} пользователей)`);
        searchInUsers = allUsersData.users;
      }
      
      // Ищем пользователя с нужным person_id в массиве
      const requestedIdNum = personIdNum;
      console.log(`🔍 Ищем пользователя с ID ${requestedIdNum} среди ${searchInUsers.length} пользователей`);
      
      const userData = searchInUsers.find((user: any) => {
        const userId = user.person_id ?? user.id ?? user.user_id ?? user.personId ?? user.userId;
        
        if (userId === undefined || userId === null) {
          return false;
        }
        
        const userIdNum = parseInt(String(userId));
        return userIdNum === requestedIdNum;
      });
      
      if (!userData) {
        throw new Error(`Пользователь с ID ${requestedIdNum} не найден. Проверено ${searchInUsers.length} пользователей.`);
      }
      
      // Нормализуем данные пользователя
      const normalizedUser = normalizeUserData(userData);
      
      setUserDetails({ user: normalizedUser, loading: false });
      
      // Загружаем детальные данные о транзакциях и заказах из отдельного webhook
      await loadUserTransactions(personIdNum);
    } catch (e: any) {
      console.error('❌ Ошибка загрузки деталей пользователя:', e);
      setUserDetails(null);
      setUserTransactions(null);
      
      let errorMessage = 'Неизвестная ошибка';
      if (e.message.includes('Failed to fetch')) {
        errorMessage = 'Failed to fetch. Возможные причины:\n' +
          '1. CORS-ошибка (проверьте настройки n8n)\n' +
          '2. Webhook неактивен\n' +
          '3. Проблемы с сетью';
      } else if (e.message.includes('NetworkError')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else {
        errorMessage = e.message;
      }
      
      const fullErrorMessage = `Ошибка загрузки деталей пользователя: ${errorMessage}. Убедитесь, что webhook "game-user-4kpi" активен в n8n.`;
      toast.error(fullErrorMessage);
    }
  };

  /**
   * Загружает транзакции пользователя
   */
  const loadUserTransactions = async (personId: number) => {
    console.log('🚀 loadUserTransactions вызвана для person_id:', personId);
    setUserTransactions({ 
      all_transactions: [],
      transactions_by_type: {},
      balance_history: {},
      last_transaction: null,
      total_orders: 0,
      total_points_spent: 0,
      total_ton_spent: 0,
      orders: [],
      assets_metadata: {},
      loading: true 
    });
    
    try {
      const personIdNum = parseInt(String(personId));
      if (isNaN(personIdNum)) {
        throw new Error(`Некорректный person_id: ${personId}`);
      }
      
      const webhookUrl = import.meta.env.DEV 
        ? `/webhook/game-transactions?person_id=${personIdNum}`
        : `https://n8n-p.blc.am/webhook/game-transactions?person_id=${personIdNum}`;
      
      console.log('🔗 Загрузка транзакций и заказов с:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Полученные данные транзакций:', data);
      
      // Обрабатываем ответ (может быть массив или объект)
      let transactionsData = null;
      if (Array.isArray(data) && data.length > 0) {
        transactionsData = data[0];
      } else if (data && typeof data === 'object') {
        if (data.rows && Array.isArray(data.rows) && data.rows.length > 0) {
          transactionsData = data.rows[0];
        } else if (data.result && Array.isArray(data.result) && data.result.length > 0) {
          transactionsData = data.result[0];
        } else if (data.person_id !== undefined) {
          transactionsData = data;
        }
      }
      
      if (!transactionsData) {
        throw new Error('Не удалось извлечь данные транзакций из ответа webhook');
      }
      
      // Обрабатываем all_transactions
      let allTransactions: any[] = [];
      if (transactionsData.all_transactions) {
        if (Array.isArray(transactionsData.all_transactions)) {
          allTransactions = transactionsData.all_transactions;
        } else if (typeof transactionsData.all_transactions === 'string') {
          try {
            allTransactions = JSON.parse(transactionsData.all_transactions);
            if (!Array.isArray(allTransactions)) {
              allTransactions = [];
            }
          } catch (e) {
            console.warn('Ошибка парсинга all_transactions:', e);
          }
        }
      }
      
      // Обрабатываем transactions_by_type
      let transactionsByType: any = {};
      if (transactionsData.transactions_by_type) {
        if (typeof transactionsData.transactions_by_type === 'object' && !Array.isArray(transactionsData.transactions_by_type)) {
          transactionsByType = transactionsData.transactions_by_type;
        } else if (typeof transactionsData.transactions_by_type === 'string') {
          try {
            transactionsByType = JSON.parse(transactionsData.transactions_by_type);
            if (Array.isArray(transactionsByType) || typeof transactionsByType !== 'object') {
              transactionsByType = {};
            }
          } catch (e) {
            console.warn('Ошибка парсинга transactions_by_type:', e);
          }
        }
      }
      
      // Обрабатываем orders
      let orders: any[] = [];
      if (transactionsData.orders) {
        if (Array.isArray(transactionsData.orders)) {
          orders = transactionsData.orders;
        } else if (typeof transactionsData.orders === 'string') {
          try {
            orders = JSON.parse(transactionsData.orders);
            if (!Array.isArray(orders)) {
              orders = [];
            }
          } catch (e) {
            console.warn('Ошибка парсинга orders:', e);
          }
        }
      }
      
      // Обрабатываем assets_metadata (заменяем ECOScoin на XP)
      let assetsMetadata: any = {};
      if (transactionsData.assets_metadata) {
        if (typeof transactionsData.assets_metadata === 'object' && !Array.isArray(transactionsData.assets_metadata)) {
          assetsMetadata = transactionsData.assets_metadata;
          for (const assetId in assetsMetadata) {
            if (assetsMetadata[assetId].name === 'ECOScoin') {
              assetsMetadata[assetId].name = 'XP';
            }
          }
        } else if (typeof transactionsData.assets_metadata === 'string') {
          try {
            assetsMetadata = JSON.parse(transactionsData.assets_metadata);
            if (typeof assetsMetadata === 'object' && !Array.isArray(assetsMetadata)) {
              for (const assetId in assetsMetadata) {
                if (assetsMetadata[assetId].name === 'ECOScoin') {
                  assetsMetadata[assetId].name = 'XP';
                }
              }
            } else {
              assetsMetadata = {};
            }
          } catch (e) {
            console.warn('Ошибка парсинга assets_metadata:', e);
          }
        }
      }
      
      setUserTransactions({
        all_transactions: allTransactions,
        transactions_by_type: transactionsByType,
        balance_history: transactionsData.balance_history || {},
        last_transaction: transactionsData.last_transaction || null,
        total_orders: parseInt(String(transactionsData.total_orders || 0)),
        total_points_spent: parseFloat(String(transactionsData.total_points_spent || 0)),
        total_ton_spent: parseFloat(String(transactionsData.total_ton_spent || 0)),
        orders: orders,
        assets_metadata: assetsMetadata,
        loading: false
      });
      
      console.log('✅ Данные транзакций загружены:', {
        transactions: allTransactions.length,
        orders: orders.length,
        types: Object.keys(transactionsByType).length
      });
    } catch (e: any) {
      console.error('❌ Ошибка загрузки транзакций:', e);
      setUserTransactions({
        all_transactions: [],
        transactions_by_type: {},
        balance_history: {},
        last_transaction: null,
        total_orders: 0,
        total_points_spent: 0,
        total_ton_spent: 0,
        orders: [],
        assets_metadata: {},
        loading: false
      });
    }
  };

  const closeModal = () => {
    setUserDetails(null);
    setUserTransactions(null);
  };

  return {
    userDetails,
    userTransactions,
    loadUserDetails,
    loadUserTransactions,
    closeModal,
    normalizeUserData
  };
};


