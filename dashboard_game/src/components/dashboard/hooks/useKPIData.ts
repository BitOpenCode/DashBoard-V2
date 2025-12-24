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
      // Оригинальный продовый вебхук (БЕЗ -test, БЕЗ localhost)
      const webhookUrl = 'https://n8n-p.blc.am/webhook/game-funnel-kpi';
      
      console.log('🔗 Загрузка данных KPI...');
      console.log('📡 URL вебхука:', webhookUrl);
      
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
      console.log('✅ Тип данных:', typeof data);
      console.log('✅ Является массивом:', Array.isArray(data));
      
      // Ожидаем формат: [{ level_stats: [...], total_users: number }] или { level_stats: [...], total_users: number }
      let processedData = null;
      
      if (Array.isArray(data)) {
        if (data.length > 0 && data[0].level_stats) {
          processedData = data[0];
          console.log('✅ Данные извлечены из массива:', processedData);
        } else {
          throw new Error('Неверный формат данных: массив не содержит level_stats');
        }
      } else if (data && data.level_stats) {
        // Если данные пришли не в массиве, но есть level_stats
        processedData = data;
        console.log('✅ Данные извлечены из объекта:', processedData);
      } else {
        throw new Error('Неверный формат данных от webhook. Ожидается объект с level_stats или массив с таким объектом.');
      }
      
      console.log('✅ processedData.level_stats:', processedData.level_stats);
      console.log('✅ Количество уровней в исходных данных:', processedData.level_stats?.length);
      console.log('✅ Все уровни в исходных данных:', processedData.level_stats?.map((s: any) => ({ 
        level: s.level, 
        type: typeof s.level, 
        users: s.users_per_level, 
        percentage: s.percentage 
      })));
      
      if (processedData && processedData.level_stats) {
        console.log('✅ level_stats существует, длина:', Array.isArray(processedData.level_stats) ? processedData.level_stats.length : 'не массив');
        if (Array.isArray(processedData.level_stats)) {
          console.log('✅ Все уровни в level_stats:', processedData.level_stats.map((s: any) => ({ level: s.level, type: typeof s.level, users: s.users_per_level, percentage: s.percentage })));
          const level0 = processedData.level_stats.find((s: any) => s.level === 0 || s.level === '0' || Number(s.level) === 0);
          console.log('✅ Уровень 0 в исходных данных:', level0);
        }
      }
      
      // Обрабатываем данные
      if (processedData && processedData.level_stats && Array.isArray(processedData.level_stats)) {
        console.log('📊 Исходные level_stats (до обработки):', processedData.level_stats);
        console.log('📊 Количество уровней в исходных данных:', processedData.level_stats.length);
        
        // Создаем Map для быстрого поиска по уровню (используем исходные данные)
        const levelStatsMap = new Map<number, any>();
        
        console.log('📊 Начинаем обработку level_stats, всего элементов:', processedData.level_stats.length);
        
        processedData.level_stats.forEach((stat: any, index: number) => {
          console.log(`📊 Обработка элемента [${index}]:`, stat);
          
          // Обрабатываем level - нормализуем в число
          let levelValue: number;
          if (typeof stat.level === 'string') {
            levelValue = parseInt(stat.level, 10);
            if (isNaN(levelValue)) {
              console.warn(`⚠️ [${index}] Не удалось распарсить level как число:`, stat.level);
              return; // Пропускаем некорректные данные
            }
          } else {
            levelValue = Number(stat.level);
            if (isNaN(levelValue)) {
              console.warn(`⚠️ [${index}] level не является числом:`, stat.level);
              return;
            }
          }
          
          console.log(`📊 [${index}] levelValue после обработки:`, levelValue, 'type:', typeof levelValue);
          
          // Специальная обработка для уровня 0
          if (levelValue === 0) {
            console.log(`🔍 [Уровень 0] Найден в исходных данных [${index}]:`, stat);
            console.log(`🔍 [Уровень 0] users_per_level (RAW):`, stat.users_per_level, 'type:', typeof stat.users_per_level);
            console.log(`🔍 [Уровень 0] percentage (RAW):`, stat.percentage, 'type:', typeof stat.percentage);
          }
          
          // Обрабатываем percentage - убираем символ % если есть, но сохраняем как строку
          let percentageValue = stat.percentage;
          if (typeof percentageValue === 'string') {
            percentageValue = percentageValue.replace('%', '').trim();
            // Если после удаления % осталась пустая строка или не число, используем '0.00'
            if (!percentageValue || isNaN(parseFloat(percentageValue))) {
              percentageValue = '0.00';
            }
          } else if (percentageValue === null || percentageValue === undefined) {
            percentageValue = '0.00';
          } else {
            percentageValue = String(percentageValue).replace('%', '').trim();
          }
          
          // Обрабатываем users_per_level - КРИТИЧЕСКИ ВАЖНО правильно обработать 0 и другие числа
          let usersPerLevelValue: number;
          
          // Явная проверка для уровня 0
          if (levelValue === 0) {
            console.log(`🔍 [Уровень 0] Начало обработки users_per_level:`, stat.users_per_level, 'type:', typeof stat.users_per_level);
          }
          
          if (typeof stat.users_per_level === 'string') {
            const parsed = parseInt(stat.users_per_level, 10);
            usersPerLevelValue = isNaN(parsed) ? 0 : parsed;
            if (levelValue === 0) {
              console.log(`🔍 [Уровень 0] Строка "${stat.users_per_level}" распарсена в:`, usersPerLevelValue);
            }
          } else if (stat.users_per_level === null || stat.users_per_level === undefined) {
            usersPerLevelValue = 0;
            if (levelValue === 0) {
              console.warn(`⚠️ [Уровень 0] users_per_level null/undefined, установлено 0`);
            }
          } else {
            // Явное преобразование в число
            const numValue = Number(stat.users_per_level);
            if (isNaN(numValue)) {
              usersPerLevelValue = 0;
              if (levelValue === 0) {
                console.warn(`⚠️ [Уровень 0] users_per_level "${stat.users_per_level}" не число, установлено 0`);
              }
            } else {
              usersPerLevelValue = numValue;
              if (levelValue === 0) {
                console.log(`🔍 [Уровень 0] Число ${stat.users_per_level} преобразовано в:`, usersPerLevelValue, 'type:', typeof usersPerLevelValue);
              }
            }
          }
          
          // Финальная проверка для уровня 0
          if (levelValue === 0) {
            console.log(`🔍 [Уровень 0] ФИНАЛЬНОЕ значение usersPerLevelValue:`, usersPerLevelValue, 'type:', typeof usersPerLevelValue);
            console.log(`🔍 [Уровень 0] Проверка usersPerLevelValue === 0:`, usersPerLevelValue === 0);
            console.log(`🔍 [Уровень 0] Проверка usersPerLevelValue === 1942:`, usersPerLevelValue === 1942);
          }
          
          const processed = {
            level: levelValue,
            users_per_level: usersPerLevelValue,
            percentage: percentageValue
          };
          
          // Логируем уровень 0 для отладки
          if (levelValue === 0) {
            console.log('🔍 [Уровень 0] Обработан и готов к добавлению в Map:', processed);
            console.log('🔍 [Уровень 0] processed.users_per_level:', processed.users_per_level, 'type:', typeof processed.users_per_level);
            console.log('🔍 [Уровень 0] processed.percentage:', processed.percentage, 'type:', typeof processed.percentage);
          }
          
          // Сохраняем в Map
          console.log(`📊 Сохранение уровня ${levelValue} в Map:`, processed);
          levelStatsMap.set(levelValue, processed);
          console.log(`📊 Проверка после сохранения уровня ${levelValue}:`, levelStatsMap.has(levelValue), 'значение:', levelStatsMap.get(levelValue));
        });
        
        console.log('📊 Существующие уровни в данных:', Array.from(levelStatsMap.keys()).sort((a, b) => a - b));
        console.log('📊 Количество уровней в Map:', levelStatsMap.size);
        const level0InMap = levelStatsMap.get(0);
        console.log('📊 [Уровень 0] В Map:', level0InMap);
        console.log('📊 [Уровень 0] Проверка has(0):', levelStatsMap.has(0));
        
        // Создаем массив для всех 11 уровней (0-10)
        const allLevels: any[] = [];
        
        // Всегда создаем массив из 11 уровней (0-10)
        console.log('📊 Начинаем создание массива из 11 уровней (0-10)...');
        console.log('📊 Map содержит уровень 0?', levelStatsMap.has(0));
        console.log('📊 Значение уровня 0 в Map:', levelStatsMap.get(0));
        
        for (let level = 0; level <= 10; level++) {
          const existingStat = levelStatsMap.get(level);
          if (existingStat) {
            allLevels.push(existingStat);
            if (level === 0) {
              console.log('✅ [Уровень 0] Добавлен в итоговый массив из данных:', existingStat);
              console.log('✅ [Уровень 0] Проверка users_per_level:', existingStat.users_per_level, 'type:', typeof existingStat.users_per_level);
              console.log('✅ [Уровень 0] Проверка percentage:', existingStat.percentage, 'type:', typeof existingStat.percentage);
            }
          } else {
            // Если уровень отсутствует, добавляем с нулевыми значениями
            allLevels.push({
              level: level,
              users_per_level: 0,
              percentage: '0.00'
            });
            if (level === 0) {
              console.warn('⚠️ [Уровень 0] Не найден в Map, добавлен с нулевыми значениями');
              console.warn('⚠️ [Уровень 0] Все ключи в Map:', Array.from(levelStatsMap.keys()));
            }
          }
        }
        
        console.log('📊 Массив allLevels создан, длина:', allLevels.length);
        console.log('📊 [Уровень 0] Проверка перед сохранением:');
        console.log('  - allLevels[0]:', allLevels[0]);
        console.log('  - allLevels[0]?.level:', allLevels[0]?.level, 'type:', typeof allLevels[0]?.level);
        console.log('  - allLevels[0]?.users_per_level:', allLevels[0]?.users_per_level, 'type:', typeof allLevels[0]?.users_per_level);
        console.log('  - allLevels[0]?.percentage:', allLevels[0]?.percentage, 'type:', typeof allLevels[0]?.percentage);
        
        processedData.level_stats = allLevels;
        
        console.log(`✅ Обработано ${processedData.level_stats.length} уровней KPI (должно быть 11)`);
        console.log('📊 Итоговые level_stats:', processedData.level_stats);
        const level0Final = processedData.level_stats.find((s: any) => {
          const sLevel = typeof s.level === 'string' ? parseInt(s.level, 10) : Number(s.level);
          return sLevel === 0;
        });
        console.log('📊 [Уровень 0] Итоговые данные через find:', level0Final);
        console.log('📊 [Уровень 0] Проверка через индекс [0]:', processedData.level_stats[0]);
        console.log('📊 [Уровень 0] Проверка level === 0:', processedData.level_stats[0]?.level === 0);
        console.log('📊 [Уровень 0] Проверка Number(level) === 0:', Number(processedData.level_stats[0]?.level) === 0);
        
        const finalKpiData = {
          level_stats: processedData.level_stats,
          total_users: processedData.total_users || 0
        };
        
        console.log('📊 [Уровень 0] Финальные данные перед setKpiData:');
        console.log('  - finalKpiData.level_stats[0]:', finalKpiData.level_stats[0]);
        console.log('  - finalKpiData.level_stats[0]?.level:', finalKpiData.level_stats[0]?.level);
        console.log('  - finalKpiData.level_stats[0]?.users_per_level:', finalKpiData.level_stats[0]?.users_per_level, 'type:', typeof finalKpiData.level_stats[0]?.users_per_level);
        console.log('  - finalKpiData.level_stats[0]?.percentage:', finalKpiData.level_stats[0]?.percentage);
        console.log('  - Проверка через find:', finalKpiData.level_stats.find((s: any) => {
          const sLevel = typeof s.level === 'string' ? parseInt(s.level, 10) : Number(s.level);
          return sLevel === 0;
        }));
        
        setKpiData(finalKpiData);
        
        // Дополнительная проверка после установки состояния
        console.log('📊 [Уровень 0] Данные установлены в состояние');
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

