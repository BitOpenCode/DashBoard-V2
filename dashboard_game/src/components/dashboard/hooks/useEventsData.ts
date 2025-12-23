import { useState } from 'react';
import { EventsData } from './types';

/**
 * Хук для управления данными событий
 */
export const useEventsData = () => {
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<'all' | '7' | '30'>('all');

  const loadEventsData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-events'
        : 'https://n8n-p.blc.am/webhook/game-events';
      
      console.log('🔗 Загрузка данных игровых событий...');
      console.log('URL:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      let data = await response.json();
      console.log('✅ Данные событий получены:', data);
      
      // Обрабатываем данные - если это массив с одним элементом, берем первый элемент
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      
      setEventsData({
        events: data.events || {},
        totalByDay: data.totalByDay || [],
        debug: data.debug
      });
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных событий:', e);
      
      let errorMessage = 'Неизвестная ошибка';
      
      if (e.message.includes('Failed to fetch')) {
        errorMessage = 'Failed to fetch. Возможные причины:\n' +
          '1. CORS-ошибка (проверьте настройки n8n)\n' +
          '2. Webhook неактивен\n' +
          '3. Проблемы с сетью';
      } else if (e.message.includes('NetworkError')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else {
        errorMessage = e.message;
      }
      
      alert('Ошибка загрузки данных событий: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    eventsData,
    loading,
    timeFilter,
    setTimeFilter,
    loadEventsData,
    setEventsData,
  };
};

