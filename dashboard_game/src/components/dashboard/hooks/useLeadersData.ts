import { useState } from 'react';
import { LeadersData } from './types';

/**
 * Хук для управления данными лидеров
 */
export const useLeadersData = () => {
  const [leadersData, setLeadersData] = useState<LeadersData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadLeadersData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-leaders-table'
        : 'https://n8n-p.blc.am/webhook/game-leaders-table';
      
      console.log('🔗 Загрузка данных лидеров...');
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
      
      let data = await response.json();
      console.log('✅ Данные лидеров получены (RAW):', data);
      
      // n8n Code нода возвращает объект {leaderboard: [...], total: ...} или {users: [...], total: ...}
      // Извлекаем массив пользователей
      let users: any[] = [];
      let total = 0;
      
      if (Array.isArray(data)) {
        // Если пришёл массив напрямую - используем как есть
        console.log('✅ Данные - это массив');
        users = data;
        total = data.length;
      } else if (data && typeof data === 'object') {
        // Проверяем различные форматы
        if (Array.isArray(data.leaderboard)) {
          // Если пришёл объект с ключом leaderboard - извлекаем массив
          console.log('✅ Данные - это объект с ключом leaderboard');
          console.log('✅ Total:', data.total);
          users = data.leaderboard;
          total = data.total || data.leaderboard.length;
        } else if (Array.isArray(data.users)) {
          // Если пришёл объект с ключом users - извлекаем массив
          console.log('✅ Данные - это объект с ключом users');
          console.log('✅ Total:', data.total);
          users = data.users;
          total = data.total || data.users.length;
        } else if (data.rank !== undefined || data.username !== undefined || data.user_id !== undefined) {
          // Если это один объект пользователя - оборачиваем в массив
          console.log('⚠️ Данные - это один объект пользователя, оборачиваю в массив');
          users = [data];
          total = 1;
        } else {
          console.error('❌ Неизвестный формат данных!');
          console.error('Тип:', typeof data);
          console.error('Ключи:', Object.keys(data));
          console.error('Данные:', data);
          throw new Error('Неизвестный формат данных от webhook');
        }
      } else {
        console.error('❌ Неизвестный формат данных!');
        console.error('Тип:', typeof data);
        console.error('Данные:', data);
        throw new Error('Неизвестный формат данных от webhook');
      }
      
      console.log(`✅ Обработано ${users.length} пользователей лидеров`);
      
      // Нормализуем данные
      const leaderboard = users.map((user: any, index: number) => ({
        rank: user.rank || index + 1,
        user_id: user.user_id || user.id || null,
        username: user.username || user.tg_username || 'Unknown',
        asic_count: user.asic_count || user.asics || 0,
        th: user.th || user.total_th || 0,
        avatar_url: user.avatar_url || user.tg_photo_url || null
      }));
      
      setLeadersData({
        leaderboard,
        total: total
      });
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных лидеров:', e);
      setLeadersData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    leadersData,
    loading,
    loadLeadersData,
    setLeadersData,
  };
};

