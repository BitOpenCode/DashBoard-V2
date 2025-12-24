import { useState } from 'react';
import toast from 'react-hot-toast';

export interface ActivityOverviewData {
  referrer_name: string;
  total_invited: number;
  activation_rate: string;
  avg_activity_per_referral: string;
  avg_active_days: string;
}

export const useActivityOverview = () => {
  const [activityOverview, setActivityOverview] = useState<ActivityOverviewData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const loadActivityOverview = async (username: string) => {
    console.log('🚀 Загружаем обзор активности для пользователя:', username);
    setLoading(username);
    
    try {
      // Убираем @ из username для передачи в запрос
      const cleanUsername = username.replace(/^@/, '');
      const baseUrl = import.meta.env.DEV 
        ? '/webhook/ref-overview'
        : 'https://n8n-p.blc.am/webhook/ref-overview';
      const webhookUrl = `${baseUrl}?username=${encodeURIComponent(cleanUsername)}`;
      
      console.log('🔗 URL запроса:', webhookUrl);
      
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
      console.log('📊 Полученные данные:', data);
      
      // Webhook должен вернуть массив с одним элементом или один объект
      let userStats: ActivityOverviewData | null = null;
      
      if (Array.isArray(data) && data.length > 0) {
        // Если пришел массив - берем первый элемент
        userStats = data[0] as ActivityOverviewData;
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Если пришел объект напрямую
        userStats = data as ActivityOverviewData;
      }
      
      console.log('✅ Статистика пользователя:', userStats);
      
      if (userStats && userStats.referrer_name) {
        console.log('✅ Открываем модальное окно');
        setActivityOverview(userStats);
      } else {
        console.error('❌ Данные не получены');
        toast.error(`Статистика для пользователя "${username}" не найдена. Возможно, вебхук не настроен на фильтрацию по параметру username.`);
      }
      
    } catch (e: unknown) {
      const error = e as Error;
      console.error('❌ Ошибка при загрузке обзора активности:', error);
      toast.error('Ошибка загрузки обзора активности: ' + error.message);
    } finally {
      setLoading(null);
    }
  };

  return {
    activityOverview,
    loading,
    loadActivityOverview,
    setActivityOverview,
  };
};

