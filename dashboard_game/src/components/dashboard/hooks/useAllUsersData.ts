import { useState } from 'react';
import toast from 'react-hot-toast';
import { normalizeUserData, type NormalizedUserData } from '../../../utils/dashboard/userNormalizer';

export interface AllUsersData {
  users: NormalizedUserData[];
  total: number;
}

export const useAllUsersData = () => {
  const [allUsersData, setAllUsersData] = useState<AllUsersData | null>(null);
  const [allUsersLoading, setAllUsersLoading] = useState<boolean>(false);

  const loadAllUsersData = async () => {
    console.log('🚀 loadAllUsersData вызвана');
    setAllUsersLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-all-users'
        : 'https://n8n-p.blc.am/webhook/game-all-users';
      
      console.log('🔗 Загрузка данных всех пользователей с:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Полученные данные всех пользователей (RAW):', data);
      console.log('📊 Тип данных:', typeof data);
      console.log('📊 Является массивом:', Array.isArray(data));
      
      // Извлекаем массив пользователей из разных форматов ответа
      let rawUsers: unknown[] = [];
      
      if (Array.isArray(data)) {
        // Проверяем, не является ли это массивом с jsonb_build_object
        if (data.length > 0 && data[0] && typeof data[0] === 'object' && 'jsonb_build_object' in data[0]) {
          const jsonbData = (data[0] as { jsonb_build_object?: { users?: unknown[] } }).jsonb_build_object;
          if (jsonbData?.users && Array.isArray(jsonbData.users)) {
            rawUsers = jsonbData.users;
            console.log('✅ Данные - массив с jsonb_build_object.users');
          } else {
            rawUsers = data;
            console.log('✅ Данные - массив пользователей');
          }
        } else {
          // Если это массив пользователей напрямую
          rawUsers = data;
          console.log('✅ Данные - массив пользователей');
        }
      } else if (data && typeof data === 'object') {
        // Если это объект
        const dataObj = data as Record<string, unknown>;
        if (dataObj.jsonb_build_object && typeof dataObj.jsonb_build_object === 'object') {
          const jsonbObj = dataObj.jsonb_build_object as { users?: unknown[] };
          if (jsonbObj.users && Array.isArray(jsonbObj.users)) {
            rawUsers = jsonbObj.users;
            console.log('✅ Данные - объект с jsonb_build_object.users');
          }
        } else if (dataObj.users && Array.isArray(dataObj.users)) {
          rawUsers = dataObj.users;
          console.log('✅ Данные - объект с users');
        } else if (dataObj.json && typeof dataObj.json === 'object') {
          const jsonObj = dataObj.json as { users?: unknown[] };
          if (jsonObj.users && Array.isArray(jsonObj.users)) {
            rawUsers = jsonObj.users;
            console.log('✅ Данные - объект с json.users');
          }
        } else if (dataObj.result && Array.isArray(dataObj.result)) {
          rawUsers = dataObj.result;
          console.log('✅ Данные - объект с result');
        } else if (dataObj.rows && Array.isArray(dataObj.rows)) {
          rawUsers = dataObj.rows;
          console.log('✅ Данные - объект с rows');
        } else if (dataObj.person_id !== undefined || dataObj.user_id !== undefined) {
          // Если это один пользователь
          rawUsers = [data];
          console.log('✅ Данные - один пользователь');
        } else {
          console.error('❌ Неизвестный формат данных:', data);
          throw new Error('Неверный формат данных от webhook.');
        }
      } else {
        console.error('❌ Неизвестный формат данных:', data);
        throw new Error('Неверный формат данных от webhook.');
      }
      
      console.log(`📊 Получено ${rawUsers.length} пользователей из webhook`);
      
      // Нормализуем данные пользователей на фронте (заменяет CODE ноду)
      // Обрабатываем данные порциями, чтобы не блокировать UI
      const BATCH_SIZE = 1000; // Обрабатываем по 1000 пользователей за раз
      const normalizedUsers: NormalizedUserData[] = [];
      
      console.log(`🔄 Начинаем нормализацию ${rawUsers.length} пользователей порциями по ${BATCH_SIZE}...`);
      
      for (let i = 0; i < rawUsers.length; i += BATCH_SIZE) {
        const batch = rawUsers.slice(i, i + BATCH_SIZE);
        const normalizedBatch = batch.map(user => normalizeUserData(user as Parameters<typeof normalizeUserData>[0]));
        normalizedUsers.push(...normalizedBatch);
        
        // Показываем прогресс каждые 10000 пользователей
        if ((i + BATCH_SIZE) % 10000 === 0 || i + BATCH_SIZE >= rawUsers.length) {
          console.log(`✅ Обработано ${Math.min(i + BATCH_SIZE, rawUsers.length)} / ${rawUsers.length} пользователей`);
          // Даем браузеру возможность обновить UI
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      const processedData: AllUsersData = {
        users: normalizedUsers,
        total: normalizedUsers.length
      };
      
      console.log('📊 Обработанные данные:', processedData);
      console.log('📊 Количество пользователей:', processedData.total);
      setAllUsersData(processedData);
      console.log('✅ Данные всех пользователей установлены в состояние');
      
    } catch (e: unknown) {
      const error = e as Error;
      console.error('❌ Ошибка при загрузке данных всех пользователей:', error);
      console.error('❌ Stack:', error.stack);
      
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
      
      const fullErrorMessage = `Ошибка загрузки данных всех пользователей: ${errorMessage}\n\nУбедитесь, что webhook "game-all-users" активен в n8n.\n\nПроверьте консоль браузера для деталей.`;
      toast.error(fullErrorMessage);
    } finally {
      setAllUsersLoading(false);
      console.log('🏁 loadAllUsersData завершена');
    }
  };

  return {
    allUsersData,
    allUsersLoading,
    loadAllUsersData,
    setAllUsersData,
  };
};

