/**
 * Константы для событий
 */

export const eventNamesMap: { [key: string]: { title: string; icon: string; color: string } } = {
  'mining_started': { title: 'Mining Started', icon: 'mining', color: '#f97316' },
  'mining_claimed': { title: 'Mining Claimed', icon: 'coins', color: '#10b981' },
  'equipment_purchase': { title: 'Equipment Purchase', icon: 'cart', color: '#3b82f6' },
  'checkin_reward': { title: 'Daily Check-in', icon: 'calendar', color: '#ec4899' },
  'referral_bonus_referrer': { title: 'Referral Bonus', icon: 'dollar', color: '#22c55e' },
  'swap_btc_to_ecos': { title: 'Swap BTC to XP', icon: 'swap', color: '#0ea5e9' },
  'daily_all_done_reward': { title: 'All Tasks Done', icon: 'target', color: '#8b5cf6' },
  'check_tma_reward': { title: 'TMA Check', icon: 'check', color: '#14b8a6' },
  'follow_game_channel_reward': { title: 'Channel Follow', icon: 'megaphone', color: '#3b82f6' },
  'app_ecos_register_tma_reward': { title: 'TMA Registration', icon: 'phone', color: '#06b6d4' },
  'confirm_telegram_premium_reward': { title: 'Telegram Premium', icon: 'star', color: '#f59e0b' },
  'swap_btc_0_03_to_ecos_reward': { title: 'Swap 0.03 BTC', icon: 'exchange', color: '#0891b2' },
  'buy_100_asics_in_the_game_reward': { title: 'Own 100 ASIC', icon: 'monitor', color: '#6366f1' },
  'buy_200_asics_in_the_game_reward': { title: 'Own 200 ASIC', icon: 'laptop', color: '#7c3aed' },
  'buy_400_asics_in_the_game_reward': { title: 'Own 400 ASIC', icon: 'monitor', color: '#a855f7' },
  'buy_800_asics_in_the_game_reward': { title: 'Own 800 ASIC', icon: 'monitor', color: '#c084fc' },
  'buy_1000_asics_in_the_game_reward': { title: 'Own 1000 ASIC', icon: 'monitor', color: '#9333ea' },
  'buy_property_reward': { title: 'Buy Property', icon: 'building', color: '#059669' },
  'checkin_7_days_reward': { title: '7 Days Check-in', icon: 'calendar', color: '#16a34a' },
  'checkin_15_days_reward': { title: '15 Days Check-in', icon: 'calendar-days', color: '#15803d' },
  'balance_turnover_1000000_reward': { title: 'Balance 1M+', icon: 'diamond', color: '#c026d3' },
  'combo_reward': { title: 'Combo Complete', icon: 'gamepad', color: '#eab308' },
  'complete_70_tasks_reward': { title: '70 Tasks Done', icon: 'medal', color: '#ea580c' },
  'complete_80_tasks_reward': { title: '80 Tasks Done', icon: 'medal', color: '#fb923c' },
  'complete_90_tasks_reward': { title: '90 Tasks Done', icon: 'trophy', color: '#dc2626' },
  'like_game_post_reward': { title: 'Like Game Post', icon: 'thumb', color: '#2563eb' },
  'share_game_post_reward': { title: 'Share Game Post', icon: 'share', color: '#0284c7' },
  'comment_game_post_reward': { title: 'Comment Game Post', icon: 'message', color: '#7c2d12' },
  'view_game_post_reward': { title: 'View Game Post', icon: 'eye', color: '#0d9488' },
  'referral_bonus_referred': { title: 'Referred User', icon: 'user-plus', color: '#65a30d' },
  'wallet_created': { title: 'Wallet Created', icon: 'wallet', color: '#047857' },
  'first_transaction': { title: 'First Transaction', icon: 'credit-card', color: '#1e40af' },
  'level_up': { title: 'Level Up', icon: 'award', color: '#d97706' },
  'buy_asics_in_the_game_reward': { title: 'Buy ASIC Task', icon: 'zap', color: '#f59e0b' },
  'buy_datacenter_in_the_game_reward': { title: 'Buy Datacenter', icon: 'building', color: '#10b981' },
  'buy_energy_station_in_the_game_reward': { title: 'Buy Energy Station', icon: 'zap', color: '#eab308' },
  'buy_land_in_the_game_reward': { title: 'Buy Land', icon: 'mountain', color: '#10b981' },
  'check_telegram_wallet_reward': { title: 'Connect TON Wallet', icon: 'wallet', color: '#0ea5e9' },
  'like_telegram_post_reward': { title: 'Like Telegram Post', icon: 'heart', color: '#0ea5e9' },
  'poke_reward': { title: 'Poke Reward', icon: 'pointer', color: '#ec4899' },
  'referral_claim_reward': { title: 'Referral Claim', icon: 'party', color: '#22c55e' },
  'site_visit_reward': { title: 'Site Visit', icon: 'globe', color: '#8b5cf6' },
  'telegram_channel_follow_reward': { title: 'Telegram Follow', icon: 'phone', color: '#06b6d4' },
  'swap_btc_0_05_to_ecos_reward': { title: 'Swap 0.05 BTC', icon: 'coins', color: '#0ea5e9' },
  'reach_100000_ths_reward': { title: 'Reach 100K TH/s', icon: 'zap', color: '#f59e0b' },
  'plan_completed_reward': { title: 'Plan Complete', icon: 'check', color: '#22c55e' },
  'bonus_reward': { title: 'Bonus Reward', icon: 'gift', color: '#ec4899' },
  'referral_bonus_referee': { title: 'Referee Bonus', icon: 'users', color: '#14b8a6' },
  'buy_600_asics_in_the_game_reward': { title: 'Own 600 ASIC', icon: 'laptop', color: '#8b5cf6' },
};

export const defaultColors = [
  '#f97316', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6',
  '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#6366f1',
  '#84cc16', '#06b6d4', '#d946ef', '#f43f5e', '#10b981',
  '#eab308', '#a855f7', '#0891b2', '#be123c', '#7c3aed',
  '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'
];

export const eventCategories: { [key: string]: { icon: string; events: string[] } } = {
  'Mining Events': { icon: 'mining', events: ['mining_started', 'mining_claimed'] },
  'Purchases': { icon: 'cart', events: ['equipment_purchase'] },
  'Daily Activities': { icon: 'calendar', events: ['checkin_reward', 'checkin_7_days_reward', 'checkin_15_days_reward', 'combo_reward', 'poke_reward'] },
  'Referrals': { icon: 'users', events: ['referral_bonus_referrer', 'referral_claim_reward', 'referral_bonus_referee'] },
  'Transactions': { icon: 'swap', events: ['swap_btc_to_ecos', 'swap_btc_0_03_to_ecos_reward', 'swap_btc_0_05_to_ecos_reward'] },
  'Tasks': { icon: 'target', events: ['daily_all_done_reward', 'complete_70_tasks_reward', 'complete_80_tasks_reward', 'complete_90_tasks_reward', 'plan_completed_reward'] },
  'Social': { icon: 'phone', events: ['follow_game_channel_reward', 'telegram_channel_follow_reward', 'like_game_post_reward', 'like_telegram_post_reward', 'site_visit_reward'] },
  'Registrations': { icon: 'check', events: ['app_ecos_register_tma_reward', 'confirm_telegram_premium_reward', 'check_telegram_wallet_reward', 'check_tma_reward'] },
  'ASIC Tasks': { icon: 'monitor', events: ['buy_asics_in_the_game_reward', 'buy_100_asics_in_the_game_reward', 'buy_200_asics_in_the_game_reward', 'buy_400_asics_in_the_game_reward', 'buy_600_asics_in_the_game_reward'] },
  'Property Tasks': { icon: 'building', events: ['buy_datacenter_in_the_game_reward', 'buy_energy_station_in_the_game_reward', 'buy_land_in_the_game_reward'] },
  'Achievements': { icon: 'trophy', events: ['reach_100000_ths_reward', 'balance_turnover_1000000_reward'] },
  'Bonuses': { icon: 'gift', events: ['bonus_reward'] },
};

export const excludedEvents = ['person_created', 'starter_pack_granted', 'bonus_reward', 'referral_bonus_referee'];



