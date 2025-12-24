import { useState } from 'react';
import toast from 'react-hot-toast';

interface ShareChartParams {
  chartRef: React.RefObject<HTMLDivElement>;
  chartTitle: string;
  chartType: 'line' | 'bar' | 'doughnut';
  section: string;
  timeFilter?: string;
  // Дополнительные данные для отправки
  totalUsers?: number;
  growthData?: Array<{ date: string; count: number }>;
  currentDate?: string;
}

/**
 * Хук для отправки графиков в Telegram через n8n webhook
 */
export const useShareChart = () => {
  const [isSharing, setIsSharing] = useState(false);

  const shareChart = async ({
    chartRef,
    chartTitle,
    chartType,
    section,
    timeFilter = 'all',
    totalUsers,
    growthData,
    currentDate,
  }: ShareChartParams) => {
    if (!chartRef.current) {
      toast.error('График не найден');
      return;
    }

    setIsSharing(true);
    try {
      // Временно переключаем тему на темную для экспорта
      const chartContainer = chartRef.current;
      const canvas = chartRef.current.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas элемент не найден');
      }

      const isDarkOriginal = document.documentElement.classList.contains('dark');
      const originalContainerBg = chartContainer.style.backgroundColor;
      const originalCanvasBg = (canvas as HTMLElement).style.backgroundColor;
      
      if (!isDarkOriginal) {
        // Применяем темную тему
        document.documentElement.classList.add('dark');
        chartContainer.classList.add('dark');
        chartContainer.style.backgroundColor = '#1f2937'; // gray-800
        (canvas as HTMLElement).style.backgroundColor = '#1f2937';
        
        // Ждем применения стилей и перерисовки Chart.js
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 500)); // Увеличена задержка для перерисовки Chart.js
      } else {
        // Если уже темная тема, все равно ждем перерисовки
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Конвертируем canvas в base64 изображение
      const imageData = canvas.toDataURL('image/png', 1.0);

      // Восстанавливаем исходную тему
      if (!isDarkOriginal) {
        document.documentElement.classList.remove('dark');
        chartContainer.classList.remove('dark');
        chartContainer.style.backgroundColor = originalContainerBg;
        (canvas as HTMLElement).style.backgroundColor = originalCanvasBg;
      }

      // Отправляем в webhook
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/chart-share'
        : 'https://n8n-p.blc.am/webhook/chart-share';

      // Подготавливаем данные для отправки
      const payload = {
        chartImage: imageData,
        chartTitle,
        chartType,
        section,
        timeFilter,
        timestamp: new Date().toISOString(),
        // Дополнительные данные - убеждаемся, что growthData это массив
        totalUsers: totalUsers || 0,
        growthData: Array.isArray(growthData) ? growthData : [],
        currentDate: currentDate || new Date().toLocaleDateString('ru-RU'),
      };

      console.log('🔗 Отправка графика в Telegram...');
      console.log('URL:', webhookUrl);
      console.log('Chart Title:', chartTitle);
      console.log('Section:', section);
      console.log('Total Users:', payload.totalUsers);
      console.log('Growth Data (array):', payload.growthData);
      console.log('Growth Data length:', payload.growthData.length);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ График успешно отправлен:', result);

      toast.success('График отправлен в Telegram! 📊');
    } catch (error: any) {
      console.error('❌ Ошибка при отправке графика:', error);
      toast.error(`Ошибка при отправке: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsSharing(false);
    }
  };

  return { shareChart, isSharing };
};


