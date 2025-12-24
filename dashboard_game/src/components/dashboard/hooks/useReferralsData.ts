import { useState } from 'react';
import toast from 'react-hot-toast';
import { ReferralsData } from './types';

/**
 * Хук для управления данными рефералов
 */
export const useReferralsData = () => {
  const [referralsData, setReferralsData] = useState<ReferralsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadReferralsData = async () => {
    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/top-ref'
        : 'https://n8n-p.blc.am/webhook/top-ref';
      
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
      
      // Парсим HTML-текст
      let textData = data[0]?.text || data.text || '';
      
      // Заменяем экранированные символы на реальные переносы строк
      textData = textData.replace(/\\n/g, '\n');
      
      // Извлекаем Total invites
      const totalMatch = textData.match(/Total invites:<\/b>\s*(\d+)/);
      const totalInvites = totalMatch ? parseInt(totalMatch[1]) : 0;
      
      // Извлекаем Top referrers
      const referrersMatch = textData.match(/Top referrers:<\/b>\s*([\s\S]*?)(?=\n\n|<b>By day:|$)/);
      const referrersText = referrersMatch ? referrersMatch[1] : '';
      const referrerLines = referrersText.split('\n').filter(line => line.trim());
      
      const topReferrers = referrerLines.map(line => {
        // Формат: "@username — 123" или "username — 123"
        // Используем [—–-] для поддержки разных типов тире
        const match = line.match(/(\S+)\s*[—–-]\s*(\d+)/);
        if (match) {
          return {
            username: match[1].trim(),
            count: parseInt(match[2])
          };
        }
        return null;
      }).filter(Boolean) as { username: string; count: number }[];
      
      // Извлекаем данные по дням
      const byDayMatch = textData.match(/By day:<\/b>\s*([\s\S]*?)(?=\n\n|$)/);
      const byDayText = byDayMatch ? byDayMatch[1] : '';
      const dayLines = byDayText.split('\n').filter(line => line.trim());
      
      // Функция для преобразования формата даты из YYYY-MM-DD в DD.MM.YY
      const formatDateToDDMMYY = (dateStr: string): string => {
        try {
          const [year, month, day] = dateStr.split('-');
          const yy = year.slice(-2); // Последние 2 цифры года
          return `${day}.${month}.${yy}`;
        } catch {
          return dateStr;
        }
      };
      
      const byDay = dayLines.map(line => {
        // Формат: "2025-11-22 — 3"
        // Используем [—–-] для поддержки разных типов тире
        const match = line.match(/(\d{4}-\d{2}-\d{2})\s*[—–-]\s*(\d+)/);
        if (match) {
          return {
            date: formatDateToDDMMYY(match[1]),
            count: parseInt(match[2])
          };
        }
        return null;
      }).filter(Boolean) as { date: string; count: number }[];
      
      setReferralsData({
        totalInvites,
        topReferrers,
        byDay
      });
      
    } catch (e: any) {
      console.error('❌ Ошибка при загрузке данных рефералов:', e);
      toast.error('Ошибка загрузки данных рефералов: ' + (e.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  return {
    referralsData,
    loading,
    loadReferralsData,
    setReferralsData,
  };
};

