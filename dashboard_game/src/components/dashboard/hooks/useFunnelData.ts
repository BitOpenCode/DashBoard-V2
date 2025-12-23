import { useState } from 'react';
import { FunnelData } from './types';

/**
 * Хук для управления данными воронки (funnel)
 */
export const useFunnelData = () => {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadFunnelData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-funnel-board'
        : 'https://n8n-p.blc.am/webhook/game-funnel-board';
      
      console.log('🔗 Загрузка данных воронки...');
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
      console.log('✅ Данные воронки получены (RAW):', data);
      console.log('📊 Тип данных:', typeof data);
      console.log('📊 Является массивом:', Array.isArray(data));
      
      // Ожидаем формат: { level_stats: [...], total_users: ... } или [{ level_stats: [...], total_users: ... }]
      let processedData = null;
      
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Проверяем первый элемент массива
          if (data[0].level_stats) {
            processedData = data[0];
            console.log('✅ Данные - массив с объектом, содержащим level_stats');
          } else if (data[0] && typeof data[0] === 'object') {
            // Если первый элемент - объект со статистикой напрямую
            processedData = data[0];
            console.log('✅ Данные - массив с объектом статистики');
          } else {
            console.error('❌ Массив не содержит объект с level_stats:', data[0]);
            throw new Error('Неверный формат данных: массив не содержит level_stats');
          }
        } else {
          throw new Error('Неверный формат данных: пустой массив');
        }
      } else if (data && typeof data === 'object') {
        if (data.level_stats) {
          // Если данные пришли не в массиве, но есть level_stats
          processedData = data;
          console.log('✅ Данные - объект с level_stats');
        } else if (data.leaderboard && Array.isArray(data.leaderboard)) {
          // Если данные в формате {leaderboard: [...], total: ...}, преобразуем в level_stats
          console.log('✅ Данные - объект с leaderboard, преобразуем в level_stats');
          const leaderboard = data.leaderboard;
          const total = data.total || leaderboard.length;
          
          // Функция для определения уровня по th (хешрейту) - соответствует логике из Dashboard.tsx
          const getUserLevel = (th: number): number | null => {
            // Пользователи без ASIC (th < 234) не имеют уровня
            if (th < 234) return null;
            
            // Уровень 0: от 234 Th (1 ASIC) до 935 Th включительно
            if (th >= 234 && th <= 935) return 0;
            // Уровень 1: от 936 Th (4 ASIC) до 4913 Th включительно
            if (th >= 936 && th <= 4913) return 1;
            // Уровень 2: от 4914 Th (21 ASIC) до 14975 Th включительно
            if (th >= 4914 && th <= 14975) return 2;
            // Уровень 3: от 14976 Th (64 ASIC) до 24803 Th включительно
            if (th >= 14976 && th <= 24803) return 3;
            // Уровень 4: от 24804 Th (106 ASIC) до 49841 Th включительно
            if (th >= 24804 && th <= 49841) return 4;
            // Уровень 5: от 49842 Th (213 ASIC) до 99917 Th включительно
            if (th >= 49842 && th <= 99917) return 5;
            // Уровень 6: от 99918 Th (427 ASIC) до 249911 Th включительно
            if (th >= 99918 && th <= 249911) return 6;
            // Уровень 7: от 249912 Th (1068 ASIC) до 499823 Th включительно
            if (th >= 249912 && th <= 499823) return 7;
            // Уровень 8: от 499824 Th (2136 ASIC) до 999881 Th включительно
            if (th >= 499824 && th <= 999881) return 8;
            // Уровень 9: от 999882 Th (4273 ASIC) до 7999991 Th включительно
            if (th >= 999882 && th <= 7999991) return 9;
            // Уровень 10: от 7999992 Th (34188 ASIC) и выше
            if (th >= 7999992) return 10;
            
            return null;
          };
          
          // Группируем пользователей по уровням
          const levelCounts = new Map<number, number>();
          let usersWithoutLevel = 0;
          
          leaderboard.forEach((user: any) => {
            const th = typeof user.th === 'string' ? parseFloat(user.th) : (user.th || 0);
            const level = getUserLevel(th);
            if (level !== null) {
              levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
            } else {
              usersWithoutLevel++;
            }
          });
          
          // Создаем массив level_stats (включая уровень 0 для пользователей без уровня)
          const levelStats: any[] = [];
          for (let level = 0; level <= 10; level++) {
            const count = levelCounts.get(level) || 0;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(2) + '%' : '0%';
            levelStats.push({
              level: level,
              users_per_level: count,
              percentage: percentage
            });
          }
          
          // Если есть пользователи без уровня (th < 234), добавляем их в уровень 0 или создаем отдельную запись
          if (usersWithoutLevel > 0) {
            levelStats[0].users_per_level += usersWithoutLevel;
            levelStats[0].percentage = total > 0 ? ((levelStats[0].users_per_level / total) * 100).toFixed(2) + '%' : '0%';
          }
          
          console.log(`📊 Преобразовано ${leaderboard.length} пользователей в статистику по ${levelStats.length} уровням`);
          
          processedData = {
            level_stats: levelStats,
            total_users: total
          };
          console.log('✅ Данные преобразованы из leaderboard в level_stats');
        } else if (data.json && data.json.level_stats) {
          // Если данные обернуты в { json: {...} }
          processedData = data.json;
          console.log('✅ Данные - объект с json.level_stats');
        } else if (data.jsonb_build_object && data.jsonb_build_object.level_stats) {
          // Если данные в формате jsonb_build_object
          processedData = data.jsonb_build_object;
          console.log('✅ Данные - объект с jsonb_build_object.level_stats');
        } else {
          console.error('❌ Неизвестный формат данных:', data);
          console.error('❌ Ключи объекта:', Object.keys(data));
          throw new Error('Неверный формат данных от webhook. Ожидается объект с level_stats и total_users или leaderboard.');
        }
      } else {
        console.error('❌ Неожиданный тип данных:', typeof data);
        throw new Error('Неверный формат данных от webhook. Ожидается объект с level_stats и total_users.');
      }
      
      if (!processedData) {
        console.error('❌ processedData не установлен после обработки');
        throw new Error('Не удалось обработать данные от webhook');
      }
      
      if (!processedData.level_stats || !Array.isArray(processedData.level_stats)) {
        console.error('❌ Отсутствует level_stats или он не массив:', processedData);
        console.error('❌ Ключи processedData:', Object.keys(processedData));
        throw new Error('Неверный формат данных: отсутствует level_stats или он не является массивом.');
      }
      
      // Нормализуем данные
      const normalizedData = {
        level_stats: processedData.level_stats.map((stat: any) => ({
          level: typeof stat.level === 'string' ? parseInt(stat.level) : stat.level,
          users_per_level: typeof stat.users_per_level === 'string' ? parseInt(stat.users_per_level) : stat.users_per_level,
          percentage: typeof stat.percentage === 'string' ? stat.percentage : String(stat.percentage || '0%')
        })),
        total_users: processedData.total_users || 0
      };
      
      console.log('📊 Количество уровней:', normalizedData.level_stats.length);
      
      setFunnelData(normalizedData);
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных воронки:', e);
      setFunnelData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    funnelData,
    loading,
    loadFunnelData,
    setFunnelData,
  };
};

