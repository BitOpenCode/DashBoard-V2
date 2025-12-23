import { useState } from 'react';
import { PoolsData } from './types';

/**
 * Хук для управления данными пулов
 */
export const usePoolsData = () => {
  const [poolsData, setPoolsData] = useState<PoolsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadPoolsData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-pools-table'
        : 'https://n8n-p.blc.am/webhook/game-pools-table';
      
      console.log('🔗 Загрузка данных пулов...');
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
      console.log('✅ Данные пулов получены (RAW):', data);
      
      // Ожидаем формат: [{ pools: [...] }] или { pools: [...] }
      let processedData = null;
      
      if (Array.isArray(data)) {
        // Если это массив, берем первый элемент
        if (data.length > 0) {
          processedData = data[0];
        }
      } else if (data && typeof data === 'object') {
        // Если это объект с pools
        processedData = data;
      }
      
      // Проверяем наличие pools
      if (processedData && processedData.pools && Array.isArray(processedData.pools)) {
        console.log(`✅ Обработано ${processedData.pools.length} пулов`);
        setPoolsData({
          pools: processedData.pools
        });
      } else {
        console.warn('⚠️ Не удалось извлечь данные пулов:', processedData);
        setPoolsData(null);
      }
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных пулов:', e);
      setPoolsData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    poolsData,
    loading,
    loadPoolsData,
    setPoolsData,
  };
};

