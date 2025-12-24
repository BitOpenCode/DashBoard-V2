import { useState } from 'react';
import toast from 'react-hot-toast';
import { UsersData, TimeFilter } from './types';

/**
 * Хук для управления данными пользователей
 */
export const useUsersData = () => {
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const loadUsersData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/users-game-daily'
        : 'https://n8n-p.blc.am/webhook/users-game-daily';
      
      console.log('🔗 Загрузка данных пользователей...');
      console.log('URL:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Данные пользователей получены:', data);
      
      // Проверяем, пришли ли структурированные данные от n8n
      if (data.totalUsers !== undefined) {
        // Если пришли структурированные данные от n8n
        console.log('Получены структурированные данные от n8n:', data);
        setUsersData(data);
      } else if (data.text) {
        // Если пришло текстовое сообщение от n8n (старый формат)
        console.log('Получено текстовое сообщение от n8n');
        setUsersData({
          totalUsers: 0,
          usersLast24h: [],
          dailyCounts: [],
          text: data.text
        });
      } else {
        // Обрабатываем массив пользователей
        const users = Array.isArray(data) ? data : (data.users || []);
        
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        
        // Подсчитываем пользователей за последние 24 часа
        const usersLast24h = users.filter((user: any) => {
          const createdAt = Date.parse(user.created_at);
          return !Number.isNaN(createdAt) && createdAt >= dayAgo;
        });
        
        console.log('Пользователи за последние 24 часа:', usersLast24h.length);
        
        // Группируем по дням
        const countsByDay = new Map();
        for (const user of users) {
          const ts = Date.parse(user.created_at);
          if (Number.isNaN(ts)) continue;
          const date = new Date(ts);
          const dayKey = `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCFullYear()).slice(-2)}`;
          countsByDay.set(dayKey, (countsByDay.get(dayKey) || 0) + 1);
        }
        
        const dailyCounts = Array.from(countsByDay.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => {
            const [ad, am, ay] = a.date.split('.').map(Number);
            const [bd, bm, by] = b.date.split('.').map(Number);
            const aDate = new Date(2000 + ay, am - 1, ad).getTime();
            const bDate = new Date(2000 + by, bm - 1, bd).getTime();
            return aDate - bDate;
          });
        
        console.log('Итоговые данные:', {
          totalUsers: users.length,
          usersLast24h: usersLast24h.length,
          dailyCounts: dailyCounts.length
        });
        
        setUsersData({
          totalUsers: users.length,
          usersLast24h: usersLast24h,
          dailyCounts: dailyCounts
        });
      }
    } catch (e) {
      console.error('Ошибка загрузки данных пользователей:', e);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Unknown error';
      if (e instanceof Error) {
        if (e.message.includes('Failed to fetch')) {
          errorMessage = 'Ошибка сети: не удается подключиться к серверу. Проверьте интернет-соединение.';
        } else if (e.message.includes('CORS')) {
          errorMessage = 'Ошибка CORS: сервер не разрешает запросы с этого домена.';
        } else {
          errorMessage = e.message;
        }
      }
      
      toast.error('Ошибка загрузки данных пользователей: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    usersData,
    loading,
    timeFilter,
    setTimeFilter,
    loadUsersData,
    setUsersData, // Для возможности сброса данных извне
  };
};

