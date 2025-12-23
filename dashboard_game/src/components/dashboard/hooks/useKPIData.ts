import { useState } from 'react';
import { KPIData } from './types';

/**
 * Хук для управления данными KPI
 */
export const useKPIData = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const loadKpiData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-funnel-kpi'
        : 'https://n8n-p.blc.am/webhook/game-funnel-kpi';
      
      console.log('🔗 Загрузка данных KPI...');
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
      console.log('✅ Данные KPI получены (RAW):', data);
      
      // Ожидаем формат: [{ level_stats: [...], total_users: number }] или { level_stats: [...], total_users: number }
      let processedData = null;
      
      if (Array.isArray(data)) {
        if (data.length > 0 && data[0].level_stats) {
          processedData = data[0];
        } else {
          throw new Error('Неверный формат данных: массив не содержит level_stats');
        }
      } else if (data && data.level_stats) {
        // Если данные пришли не в массиве, но есть level_stats
        processedData = data;
      } else {
        throw new Error('Неверный формат данных от webhook. Ожидается объект с level_stats или массив с таким объектом.');
      }
      
      // Обрабатываем данные
      if (processedData && processedData.level_stats && Array.isArray(processedData.level_stats)) {
        processedData.level_stats = processedData.level_stats.map((stat: any) => ({
          level: typeof stat.level === 'string' ? parseInt(stat.level) : stat.level,
          users_per_level: typeof stat.users_per_level === 'string' ? parseInt(stat.users_per_level) : stat.users_per_level,
          percentage: typeof stat.percentage === 'string' ? stat.percentage : String(stat.percentage || '0%')
        }));
        
        // Сортируем по уровню
        processedData.level_stats.sort((a: any, b: any) => a.level - b.level);
        
        // Добавляем недостающие уровни от 1 до максимального
        const existingLevels = new Set(processedData.level_stats.map((stat: any) => stat.level));
        const maxLevel = Math.max(...Array.from(existingLevels));
        const allLevels = [];
        
        for (let level = 1; level <= maxLevel; level++) {
          if (existingLevels.has(level)) {
            const existingStat = processedData.level_stats.find((stat: any) => stat.level === level);
            allLevels.push(existingStat);
          } else {
            allLevels.push({
              level: level,
              users_per_level: 0,
              percentage: '0%'
            });
          }
        }
        
        processedData.level_stats = allLevels;
        
        console.log(`✅ Обработано ${processedData.level_stats.length} уровней KPI`);
        setKpiData({
          level_stats: processedData.level_stats,
          total_users: processedData.total_users || 0
        });
      } else {
        throw new Error('Неверный формат данных: отсутствует level_stats или он не является массивом.');
      }
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных KPI:', e);
      setKpiData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    kpiData,
    loading,
    selectedLevel,
    setSelectedLevel,
    loadKpiData,
    setKpiData,
  };
};

