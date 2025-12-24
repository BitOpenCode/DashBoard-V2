import { useState } from 'react';
import toast from 'react-hot-toast';
import { getUserLevel } from '../../../utils/dashboard/levelUtils';

export interface LevelUser {
  rank: number;
  user_id: number;
  username: string;
  asic_count: number;
  th: number;
  avatar_url: string | null;
}

export interface LevelUsersData {
  level: number;
  users: LevelUser[];
}

export const useLevelUsers = () => {
  const [levelUsersModal, setLevelUsersModal] = useState<LevelUsersData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    minASIC: string;
    maxASIC: string;
    minTh: string;
    maxTh: string;
  }>({
    minASIC: '',
    maxASIC: '',
    minTh: '',
    maxTh: ''
  });

  const loadLevelUsers = async (level: number) => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? `/webhook/game-funnel-board`
        : `https://n8n-p.blc.am/webhook/game-funnel-board`;
      
      console.log('🔗 Загрузка пользователей уровня', level, 'с:', webhookUrl);
      
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
      console.log('📊 Полученные данные пользователей (RAW):', data);
      
      // Обрабатываем данные от webhook
      let allUsers: any[] = [];
      if (Array.isArray(data)) {
        allUsers = data;
      } else if (data && data.leaderboard && Array.isArray(data.leaderboard)) {
        allUsers = data.leaderboard;
      } else if (data && typeof data === 'object') {
        allUsers = [data];
      } else {
        throw new Error('Неверный формат данных от webhook');
      }
      
      // Нормализуем данные пользователей
      const normalizedUsers = allUsers.map((user: any) => {
        let userTh = user.th;
        if (typeof userTh === 'string') {
          userTh = parseFloat(userTh) || 0;
        } else if (typeof userTh !== 'number') {
          userTh = parseInt(userTh) || 0;
        }
        
        return {
          ...user,
          th: userTh,
        };
      });
      
      // Фильтруем пользователей по уровню
      const filteredUsers = normalizedUsers
        .filter((user: any) => {
          const userTh = user.th || 0;
          const userLevel = getUserLevel(userTh);
          return userLevel === level;
        })
        .map((user: any, index: number) => ({
          ...user,
          rank: index + 1
        }));
      
      console.log(`✅ Найдено ${filteredUsers.length} пользователей уровня ${level} из ${allUsers.length} всего`);
      
      setLevelUsersModal({
        level: level,
        users: filteredUsers
      });
      
      // Сбрасываем фильтры при загрузке новых данных
      setFilters({ minASIC: '', maxASIC: '', minTh: '', maxTh: '' });
      
    } catch (e: unknown) {
      const error = e as Error;
      console.error('❌ Ошибка при загрузке пользователей уровня:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Failed to fetch. Возможные причины:\n' +
          '1. CORS-ошибка (проверьте настройки n8n)\n' +
          '2. Webhook неактивен\n' +
          '3. Проблемы с сетью';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else {
        errorMessage = error.message;
      }
      
      toast.error(`Ошибка загрузки пользователей уровня ${level}: ${errorMessage}. Убедитесь, что webhook "game-funnel-board" активен в n8n.`);
    } finally {
      setLoading(false);
    }
  };

  return {
    levelUsersModal,
    loading,
    filters,
    loadLevelUsers,
    setLevelUsersModal,
    setFilters,
  };
};

