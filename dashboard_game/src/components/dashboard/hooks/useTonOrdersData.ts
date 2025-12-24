import { useState } from 'react';
import { TONOrdersData } from './types';

/**
 * Хук для управления данными TON заказов
 */
export const useTonOrdersData = () => {
  const [tonOrdersData, setTonOrdersData] = useState<TONOrdersData | null>(null);
  const [selectedTonCategories, setSelectedTonCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  const loadTonOrdersData = async () => {
    setLoading(true);
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/ton-orders'
        : 'https://n8n-p.blc.am/webhook/ton-orders';
      
      console.log('🔗 Загрузка данных TON заказов...');
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
      console.log('✅ Данные TON заказов получены (RAW):', data);
      
      // Обрабатываем различные форматы данных
      let processedData = null;
      
      if (Array.isArray(data)) {
        // Если это массив, берем первый элемент
        if (data.length > 0) {
          processedData = data[0];
        }
      } else if (data && typeof data === 'object') {
        processedData = data;
      }
      
      // Проверяем наличие users в разных местах
      let users = null;
      let globalTotal = 0;
      
      if (processedData) {
        if (processedData.users && Array.isArray(processedData.users)) {
          users = processedData.users;
          globalTotal = processedData.global_total_ton_received || 0;
        } else if (processedData.jsonb_build_object && processedData.jsonb_build_object.users) {
          users = processedData.jsonb_build_object.users;
          globalTotal = processedData.jsonb_build_object.global_total_ton_received || 0;
        } else if (processedData.json && processedData.json.users) {
          users = processedData.json.users;
          globalTotal = processedData.json.global_total_ton_received || 0;
        }
      }
      
      if (users && Array.isArray(users)) {
        console.log(`✅ Обработано ${users.length} пользователей TON заказов`);
        
        // Нормализуем global_total_ton_received
        const normalizedGlobalTotal = typeof globalTotal === 'string' ? parseFloat(globalTotal) : (globalTotal || 0);
        
        setTonOrdersData({
          users: users,
          global_total_ton_received: normalizedGlobalTotal
        });
        // Инициализируем все категории как выбранные
        const allCategories = ['ecos_5000', 'ecos_10000', 'ecos_100000', 'ecos_200000', 'ecos_1000000', 'premium_7d', 'premium_30d'];
        setSelectedTonCategories(new Set(allCategories));
      } else {
        console.warn('⚠️ Не удалось извлечь данные пользователей TON заказов:', processedData);
        setTonOrdersData(null);
      }
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных TON заказов:', e);
      setTonOrdersData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    tonOrdersData,
    selectedTonCategories,
    loading,
    loadTonOrdersData,
    setTonOrdersData,
    setSelectedTonCategories,
  };
};


