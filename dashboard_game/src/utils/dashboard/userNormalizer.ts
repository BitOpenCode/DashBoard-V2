/**
 * Утилиты для нормализации данных пользователя
 * Заменяет CODE ноду из n8n workflow
 */

export interface RawUserData {
  person_id?: number | string;
  user_id?: number | string;
  id?: number | string;
  username?: string;
  tg_username?: string;
  name?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  wallet_address?: string;
  wallet?: string;
  hex_wallet_address?: string;
  hex_wallet?: string;
  photo_url?: string;
  avatar_url?: string;
  avatar?: string;
  tg_photo_url?: string;
  tg_id?: string;
  telegram_id?: string;
  telegramId?: string;
  total_asics?: number | string;
  total_asics_count?: number | string;
  asic_count?: number | string;
  asics?: number | string;
  level?: number | string | null;
  effective_ths?: number | string;
  effective_th?: number | string;
  progress_cached?: number | string;
  progress?: number | string;
  level_updated_at?: string | null;
  total_balance?: number | string;
  balance_by_asset?: Record<string, unknown>;
  assets_metadata?: Record<string, { name?: string; [key: string]: unknown }>;
  balance_history?: Record<string, unknown>;
  last_transaction?: unknown;
  all_transactions?: unknown[] | string | { transactions?: unknown[] };
  transactions_by_type?: Record<string, unknown> | string;
  mining_summary?: Record<string, unknown>;
  last_mining?: unknown;
  checkin_summary?: Record<string, unknown>;
  streak_summary?: Record<string, unknown>;
  participation_summary?: Record<string, unknown>;
  poke_sent_count?: number | string;
  poke_received_count?: number | string;
  poke_rewards?: unknown[];
  total_referrals?: number | string;
  referees?: unknown[];
  total_orders?: number | string;
  total_points_spent?: number | string;
  total_ton_spent?: number | string;
  orders?: unknown[];
  ownership_details?: unknown[];
  person_language?: string;
  language?: string;
  is_ecos_premium?: boolean | string;
  ecos_premium?: boolean;
  ecos_premium_until?: string | null;
  premium_until?: string | null;
  onbording_done?: boolean | string;
  onboarding_done?: boolean;
  person_created_at?: string;
  created_at?: string;
  registered_at?: string;
  person_updated_at?: string;
  updated_at?: string;
  tg_language?: string;
  telegram_language?: string;
  tg_premium?: boolean | string;
  telegram_premium?: boolean;
  tg_created_at?: string;
  telegram_created_at?: string;
  tg_updated_at?: string;
  telegram_updated_at?: string;
  [key: string]: unknown;
}

export interface NormalizedUserData {
  person_id: number;
  person_language: string;
  wallet_address: string | null;
  hex_wallet_address: string | null;
  is_ecos_premium: boolean;
  ecos_premium_until: string | null;
  onbording_done: boolean;
  person_created_at: string;
  person_updated_at: string;
  tg_id: string;
  first_name: string;
  last_name: string;
  username: string;
  tg_language: string;
  tg_premium: boolean;
  photo_url: string | null;
  tg_created_at: string;
  tg_updated_at: string;
  total_asics: number;
  total_th: number;
  level: number | null;
  effective_ths: number;
  progress_cached: number;
  level_updated_at: string | null;
  ownership_details: unknown[];
  total_balance: number;
  balance_by_asset: Record<string, unknown>;
  assets_metadata: Record<string, { name?: string; [key: string]: unknown }>;
  balance_history: Record<string, unknown>;
  last_transaction: unknown | null;
  all_transactions: unknown[];
  transactions_by_type: Record<string, unknown>;
  mining_summary: Record<string, unknown>;
  last_mining: unknown | null;
  checkin_summary: Record<string, unknown>;
  streak_summary: Record<string, unknown>;
  participation_summary: Record<string, unknown>;
  poke_sent_count: number;
  poke_received_count: number;
  poke_rewards: unknown[];
  total_referrals: number;
  referees: unknown[];
  total_orders: number;
  total_points_spent: number;
  total_ton_spent: number;
  orders: unknown[];
}

/**
 * Нормализует данные пользователя из различных форматов БД
 * @param user - Сырые данные пользователя
 * @returns Нормализованные данные пользователя
 */
export const normalizeUserData = (user: RawUserData): NormalizedUserData => {
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
  const totalAsicsNumber = typeof totalAsics === 'string' ? parseInt(totalAsics, 10) || 0 : parseInt(String(totalAsics), 10) || 0;
  
  // Обрабатываем level (может быть строкой или числом)
  const level = user.level !== undefined && user.level !== null 
    ? (typeof user.level === 'string' ? parseInt(user.level, 10) || 0 : parseInt(String(user.level), 10) || 0)
    : null;
  
  // Обрабатываем effective_ths (может быть строкой или числом)
  const effectiveThs = user.effective_ths || user.effective_th || 0;
  const effectiveThsNumber = typeof effectiveThs === 'string' ? parseFloat(effectiveThs) || 0 : parseFloat(String(effectiveThs)) || 0;
  
  // Обрабатываем progress_cached (может быть строкой или числом)
  const progressCached = user.progress_cached || user.progress || 0;
  const progressCachedNumber = typeof progressCached === 'string' ? parseFloat(progressCached) || 0 : parseFloat(String(progressCached)) || 0;
  
  // Обрабатываем level_updated_at
  const levelUpdatedAt = user.level_updated_at || null;
  
  // Обрабатываем total_balance и balance_by_asset
  const totalBalance = user.total_balance ? (typeof user.total_balance === 'string' ? parseFloat(user.total_balance) || 0 : parseFloat(String(user.total_balance)) || 0) : 0;
  const balanceByAsset = user.balance_by_asset || {};
  
  // Обрабатываем assets_metadata и заменяем ECOScoin на XP
  const assetsMetadataRaw = user.assets_metadata || {};
  const assetsMetadata: Record<string, { name?: string; [key: string]: unknown }> = {};
  for (const assetId in assetsMetadataRaw) {
    if (Object.prototype.hasOwnProperty.call(assetsMetadataRaw, assetId)) {
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
  let allTransactions: unknown[] = [];
  if (user.all_transactions) {
    if (Array.isArray(user.all_transactions)) {
      allTransactions = user.all_transactions;
    } else if (typeof user.all_transactions === 'string') {
      try {
        const parsed = JSON.parse(user.all_transactions);
        allTransactions = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Ошибка парсинга all_transactions:', e);
        allTransactions = [];
      }
    } else if (typeof user.all_transactions === 'object' && user.all_transactions !== null) {
      const transactionsObj = user.all_transactions as { transactions?: unknown[] };
      allTransactions = Array.isArray(transactionsObj.transactions) ? transactionsObj.transactions : [];
    }
  }
  
  // Обрабатываем transactions_by_type (статистика по типам операций)
  let transactionsByType: Record<string, unknown> = {};
  if (user.transactions_by_type) {
    if (typeof user.transactions_by_type === 'object' && !Array.isArray(user.transactions_by_type) && user.transactions_by_type !== null) {
      transactionsByType = user.transactions_by_type as Record<string, unknown>;
    } else if (typeof user.transactions_by_type === 'string') {
      try {
        const parsed = JSON.parse(user.transactions_by_type);
        transactionsByType = (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) ? parsed : {};
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
  const pokeSentCount = user.poke_sent_count ? (typeof user.poke_sent_count === 'string' ? parseInt(user.poke_sent_count, 10) || 0 : parseInt(String(user.poke_sent_count), 10) || 0) : 0;
  const pokeReceivedCount = user.poke_received_count ? (typeof user.poke_received_count === 'string' ? parseInt(user.poke_received_count, 10) || 0 : parseInt(String(user.poke_received_count), 10) || 0) : 0;
  const pokeRewards = Array.isArray(user.poke_rewards) ? user.poke_rewards : [];
  
  // Обрабатываем referrals
  const totalReferrals = user.total_referrals ? (typeof user.total_referrals === 'string' ? parseInt(user.total_referrals, 10) || 0 : parseInt(String(user.total_referrals), 10) || 0) : 0;
  const referees = Array.isArray(user.referees) ? user.referees : [];
  
  // Обрабатываем orders
  const totalOrders = user.total_orders ? (typeof user.total_orders === 'string' ? parseInt(user.total_orders, 10) || 0 : parseInt(String(user.total_orders), 10) || 0) : 0;
  const totalPointsSpent = user.total_points_spent ? (typeof user.total_points_spent === 'string' ? parseFloat(user.total_points_spent) || 0 : parseFloat(String(user.total_points_spent)) || 0) : 0;
  const totalTonSpent = user.total_ton_spent ? (typeof user.total_ton_spent === 'string' ? parseFloat(user.total_ton_spent) || 0 : parseFloat(String(user.total_ton_spent)) || 0) : 0;
  const orders = Array.isArray(user.orders) ? user.orders : [];
  
  // Обрабатываем ownership_details
  const ownershipDetails = Array.isArray(user.ownership_details) ? user.ownership_details : [];
  
  // Обрабатываем photo_url (может быть tg_photo_url)
  const finalPhotoUrl = photoUrl || user.tg_photo_url || null;
  
  return {
    person_id: parseInt(String(personId), 10) || 0,
    person_language: user.person_language || user.language || 'en',
    wallet_address: walletAddress || null,
    hex_wallet_address: hexWalletAddress || null,
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
    balance_by_asset: balanceByAsset as Record<string, unknown>,
    assets_metadata: assetsMetadata,
    balance_history: balanceHistory as Record<string, unknown>,
    last_transaction: lastTransaction,
    all_transactions: allTransactions,
    transactions_by_type: transactionsByType,
    mining_summary: miningSummary as Record<string, unknown>,
    last_mining: lastMining,
    checkin_summary: checkinSummary as Record<string, unknown>,
    streak_summary: streakSummary as Record<string, unknown>,
    participation_summary: participationSummary as Record<string, unknown>,
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

