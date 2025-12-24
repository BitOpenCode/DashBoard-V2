import { useState } from 'react';
import toast from 'react-hot-toast';
import { WalletsData } from './types';

/**
 * Хук для управления данными кошельков
 */
export const useWalletsData = () => {
  const [walletsData, setWalletsData] = useState<WalletsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadWalletsData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/users-wallets'
        : 'https://n8n-p.blc.am/webhook/users-wallets';
      
      console.log('🔗 Загрузка данных кошельков...');
      console.log('URL:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Данные кошельков получены:', data);
      
      // Обрабатываем данные
      setWalletsData({
        totalUsers: data['Total Users'] || data.totalUsers || 0,
        withWalletCount: data.withWalletCount || 0,
        withoutWalletCount: data.withoutWalletCount || 0,
        withWalletPercent: data.withWalletPercent || '0%',
        withoutWalletPercent: data.withoutWalletPercent || '0%',
      });
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных кошельков:', e);
      
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
      
      const fullErrorMessage = `Ошибка загрузки данных кошельков: ${errorMessage}. Убедитесь, что webhook "users-wallets" активен в n8n.`;
      toast.error(fullErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    walletsData,
    loading,
    loadWalletsData,
    setWalletsData, // Для возможности сброса данных извне
  };
};


