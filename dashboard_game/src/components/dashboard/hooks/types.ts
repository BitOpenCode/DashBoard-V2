/**
 * Типы данных для dashboard хуков
 */

export type TimeFilter = 'all' | '7' | '30';
export type ChartType = 'line' | 'bar';

export interface UsersData {
  totalUsers: number;
  usersLast24h: any[];
  dailyCounts: { date: string; count: number }[];
  languageCounts?: { language: string; count: number }[];
  languageCountsLast24h?: { language: string; count: number }[];
  premiumUsers?: number;
  premiumUsersLast24h?: number;
  totalPremiumPercentage?: number;
  premiumPercentageLast24h?: number;
  text?: string;
}

export interface WalletsData {
  totalUsers: number;
  withWalletCount: number;
  withoutWalletCount: number;
  withWalletPercent: string;
  withoutWalletPercent: string;
}

export interface TONOrderUser {
  person_id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  tg_id: string | null;
  tg_language: string | null;
  tg_created_at: string | null;
  tg_updated_at: string | null;
  photo_url: string | null;
  wallet_address: string | null;
  ecos_5000_purchases: number | string;
  ecos_5000_ton_spent: number | string | null;
  ecos_5000_first_purchase: string | null;
  ecos_5000_last_purchase: string | null;
  ecos_10000_purchases: number | string;
  ecos_10000_ton_spent: number | string | null;
  ecos_10000_first_purchase: string | null;
  ecos_10000_last_purchase: string | null;
  ecos_100000_purchases: number | string;
  ecos_100000_ton_spent: number | string | null;
  ecos_100000_first_purchase: string | null;
  ecos_100000_last_purchase: string | null;
  ecos_200000_purchases: number | string;
  ecos_200000_ton_spent: number | string | null;
  ecos_200000_first_purchase: string | null;
  ecos_200000_last_purchase: string | null;
  ecos_1000000_purchases: number | string;
  ecos_1000000_ton_spent: number | string | null;
  ecos_1000000_first_purchase: string | null;
  ecos_1000000_last_purchase: string | null;
  premium_7d_purchases: number | string;
  premium_7d_ton_spent: number | string | null;
  premium_7d_first_purchase: string | null;
  premium_7d_last_purchase: string | null;
  premium_30d_purchases: number | string;
  premium_30d_ton_spent: number | string | null;
  premium_30d_first_purchase: string | null;
  premium_30d_last_purchase: string | null;
  user_total_ton_spent: number | string;
  global_total_ton_received: number | string;
  [key: string]: any;
}

export interface TONOrdersData {
  users: TONOrderUser[];
  global_total_ton_received: number;
}

export interface EventsData {
  events: {
    [key: string]: { date: string; count: number }[];
  };
  totalByDay: { date: string; count: number }[];
  debug?: any;
}

export interface ReferralsData {
  totalInvites: number;
  topReferrers: { username: string; count: number }[];
  byDay: { date: string; count: number }[];
}

export interface Pool {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  reward_type: string;
  commission: string;
  payment_frequency: number;
  visibility: string;
  status: string;
  total_hashrate: string;
  created_at: string;
  updated_at: string;
  lvl: number;
  max_lvl: number;
}

export interface PoolsData {
  pools: Pool[];
}

export interface LevelStat {
  level: number;
  users_per_level: number;
  percentage: string;
}

export interface KPIData {
  level_stats: LevelStat[];
  total_users: number;
}

export interface LeaderboardUser {
  rank: number;
  user_id: number | null;
  username: string;
  asic_count: number;
  th: number;
  avatar_url: string | null;
}

export interface LeadersData {
  leaderboard: LeaderboardUser[];
  total: number;
}

export interface FunnelData {
  level_stats: LevelStat[];
  total_users: number;
}

