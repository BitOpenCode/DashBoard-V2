import { useState } from 'react';
import toast from 'react-hot-toast';
import { getTonUsdRate, checkWalletBalance as checkWalletBalanceUtil } from '../../../utils/dashboard/tonUtils';

export interface WalletUser {
  id: number;
  display_name: string;
  username: string;
  first_name: string;
  last_name: string;
  wallet_address: string;
  is_ecos_premium: boolean;
  language_code: string;
  created_at: string;
  updated_at: string;
}

export interface WalletBalance {
  balance: string;
  loading: boolean;
  error?: string;
}

/**
 * Хук для управления данными пользователей с кошельками
 */
export const useWalletUsersData = () => {
  const [walletUsers, setWalletUsers] = useState<WalletUser[] | null>(null);
  const [walletUsersLoading, setWalletUsersLoading] = useState<boolean>(false);
  const [walletBalances, setWalletBalances] = useState<{ [address: string]: WalletBalance }>({});
  const [walletSearchQuery, setWalletSearchQuery] = useState<string>('');
  const [tonUsdRate, setTonUsdRate] = useState<number | null>(null);
  const [tonUsdLoading, setTonUsdLoading] = useState<boolean>(false);

  /**
   * Получает курс TON к доллару США
   */
  const fetchTonUsdRate = async () => {
    if (tonUsdLoading || tonUsdRate !== null) {
      // Если уже загружаем или уже загрузили, не делаем повторный запрос
      return;
    }
    
    setTonUsdLoading(true);
    
    try {
      console.log('💱 Получение курса TON/USD...');
      const rate = await getTonUsdRate();
      
      if (rate) {
        setTonUsdRate(rate);
        console.log('✅ Курс TON/USD получен:', rate, 'USD');
      } else {
        console.error('❌ Курс не найден в ответе API');
      }
    } catch (error) {
      console.error('❌ Ошибка при получении курса TON/USD:', error);
    } finally {
      setTonUsdLoading(false);
    }
  };

  /**
   * Загружает список пользователей с кошельками
   */
  const loadWalletUsers = async () => {
    setWalletUsersLoading(true);
    
    // Загружаем курс TON/USD при загрузке списка кошельков
    fetchTonUsdRate();
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/wallet-view'
        : 'https://n8n-p.blc.am/webhook/wallet-view';
      
      console.log('🚀 ========== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ С КОШЕЛЬКАМИ ==========');
      console.log('URL:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Получаем текст ответа для диагностики
      const responseText = await response.text();
      console.log('📥 RAW RESPONSE (первые 500 символов):', responseText.substring(0, 500));
      
      // Парсим JSON
      const data = JSON.parse(responseText);
      
      console.log('📊 ПАРСИНГ ЗАВЕРШЁН');
      console.log('typeof data:', typeof data);
      console.log('Array.isArray(data):', Array.isArray(data));
      
      // n8n Code нода возвращает объект {users: [...], total: 204}
      // Извлекаем массив пользователей
      let users: WalletUser[] = [];
      
      if (Array.isArray(data)) {
        // Если пришёл массив напрямую - используем как есть
        console.log('✅ Данные - это массив');
        users = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.users)) {
        // Если пришёл объект с ключом users - извлекаем массив
        console.log('✅ Данные - это объект с ключом users');
        console.log('✅ Total:', data.total);
        users = data.users;
      } else if (data && typeof data === 'object') {
        // Если это просто объект (1 пользователь) - оборачиваем в массив
        console.log('⚠️ Данные - это один объект, оборачиваю в массив');
        users = [data];
      } else {
        console.error('❌ Неизвестный формат данных!');
        console.error('Тип:', typeof data);
        console.error('Данные:', data);
        toast.error('Ошибка: неизвестный формат данных от webhook!');
        return;
      }
      
      console.log('✅ Извлечён массив пользователей!');
      console.log('✅ Длина массива:', users.length);
      console.log('✅ Первые 5 ID:', users.slice(0, 5).map((u: any) => u.id));
      console.log('✅ Последние 5 ID:', users.slice(-5).map((u: any) => u.id));
      
      console.log('💾 СОХРАНЯЮ В STATE...');
      setWalletUsers(users);
      console.log('✅ setWalletUsers вызван с', users.length, 'элементами');
      console.log('🚀 ========== КОНЕЦ ЗАГРУЗКИ ==========');
      
    } catch (e: any) {
      console.error('❌ ОШИБКА:', e);
      toast.error('Ошибка загрузки пользователей: ' + e.message);
    } finally {
      setWalletUsersLoading(false);
    }
  };

  /**
   * Проверяет баланс TON кошелька
   */
  const checkWalletBalance = async (walletAddress: string) => {
    // ЗАЩИТА: Проверяем, не идет ли уже загрузка для этого адреса
    if (walletBalances[walletAddress]?.loading) {
      console.warn('⚠️ Загрузка для этого адреса уже идет, пропускаем повторный запрос');
      return;
    }
    
    // Устанавливаем статус загрузки
    setWalletBalances(prev => ({
      ...prev,
      [walletAddress]: { balance: '', loading: true }
    }));

    try {
      const balanceInTon = await checkWalletBalanceUtil(walletAddress);
      
      if (balanceInTon) {
        setWalletBalances(prev => ({
          ...prev,
          [walletAddress]: { balance: balanceInTon, loading: false }
        }));
      } else {
        throw new Error('Не удалось получить баланс');
      }
      
    } catch (e: any) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', e);
      
      setWalletBalances(prev => ({
        ...prev,
        [walletAddress]: { 
          balance: '', 
          loading: false, 
          error: e.message || 'Неизвестная ошибка' 
        }
      }));
    }
  };

  return {
    walletUsers,
    walletUsersLoading,
    walletBalances,
    walletSearchQuery,
    setWalletSearchQuery,
    tonUsdRate,
    loadWalletUsers,
    checkWalletBalance,
    setWalletUsers
  };
};

