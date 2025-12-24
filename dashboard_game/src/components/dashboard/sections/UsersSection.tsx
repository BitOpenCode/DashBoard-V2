import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Users, TrendingUp, Globe, Calendar, Share2 } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UsersData, TimeFilter } from '../hooks/types';
import { useShareChart } from '../hooks/useShareChart';

interface UsersSectionProps {
  usersData: UsersData;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
}

/**
 * Компонент секции статистики пользователей
 */
export const UsersSection: React.FC<UsersSectionProps> = ({
  usersData,
  timeFilter,
  setTimeFilter,
}) => {
  const { isDark } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const { shareChart, isSharing } = useShareChart();
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Фильтрация данных по выбранному периоду
  const filteredData = useMemo(() => {
    if (!usersData || !usersData.dailyCounts) return null;

    const formatDateDDMMYY = (date: Date) => {
      const dd = String(date.getUTCDate()).padStart(2, '0');
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
      const yy = String(date.getUTCFullYear()).slice(-2);
      return `${dd}.${mm}.${yy}`;
    };

    if (timeFilter === 'all') {
      // Все время - показываем по дням
      return {
        ...usersData,
        dailyCounts: usersData.dailyCounts,
      };
    } else if (timeFilter === '7') {
      // 7 дней - группировка по неделям (по 7 дней от первой регистрации)
      if (usersData.dailyCounts.length === 0) {
        return { ...usersData, dailyCounts: [] };
      }

      // Сначала сортируем все дни по дате (по возрастанию)
      const sortedDays = [...usersData.dailyCounts].sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('.').map(Number);
        const [dayB, monthB, yearB] = b.date.split('.').map(Number);
        const dateA = Date.UTC(2000 + yearA, monthA - 1, dayA);
        const dateB = Date.UTC(2000 + yearB, monthB - 1, dayB);
        return dateA - dateB;
      });

      // Находим первую дату регистрации
      const firstDay = sortedDays[0];
      const [firstDayStr, firstMonthStr, firstYearStr] = firstDay.date.split('.');
      const startDate = new Date(
        Date.UTC(2000 + parseInt(firstYearStr), parseInt(firstMonthStr) - 1, parseInt(firstDayStr), 0, 0, 0, 0)
      );

      const countsByWeek: {
        weekStart: Date;
        weekEnd: Date;
        count: number;
        minDate: Date;
        maxDate: Date;
      }[] = [];

      sortedDays.forEach((day) => {
        const [dayStr, monthStr, yearStr] = day.date.split('.');
        const dayDate = new Date(
          Date.UTC(2000 + parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr), 0, 0, 0, 0)
        );

        // Вычисляем разницу в днях от первой даты
        const daysDiff = Math.floor((dayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysDiff / 7);

        // Вычисляем начало и конец недели
        const weekStart = new Date(startDate.getTime() + weekNumber * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

        // Ищем существующую неделю
        let weekData = countsByWeek.find((w) => w.weekStart.getTime() === weekStart.getTime());

        if (!weekData) {
          weekData = {
            weekStart,
            weekEnd,
            count: 0,
            minDate: dayDate,
            maxDate: dayDate,
          };
          countsByWeek.push(weekData);
        }

        weekData.count += day.count;

        if (dayDate < weekData.minDate) weekData.minDate = dayDate;
        if (dayDate > weekData.maxDate) weekData.maxDate = dayDate;
      });

      const weeklyCounts = countsByWeek
        .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
        .map((data) => ({
          date: `${formatDateDDMMYY(data.weekStart)}–${formatDateDDMMYY(data.weekEnd)}`,
          count: data.count,
        }));

      return {
        ...usersData,
        dailyCounts: weeklyCounts,
      };
    } else if (timeFilter === '30') {
      // 30 дней - группировка по месяцам
      const countsByMonth = new Map<string, number>();

      usersData.dailyCounts.forEach((day) => {
        const [dayStr, monthStr, yearStr] = day.date.split('.');
        const dayDate = new Date(2000 + parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));

        const mm = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
        const yy = String(dayDate.getUTCFullYear()).slice(-2);
        const monthKey = `${mm}.${yy}`;

        countsByMonth.set(monthKey, (countsByMonth.get(monthKey) || 0) + day.count);
      });

      const monthlyCounts = Array.from(countsByMonth.entries())
        .map(([month, count]) => {
          const [mm, yy] = month.split('.').map(Number);
          const startTime = new Date(2000 + yy, mm - 1, 1).getTime();
          return { date: month, count, _startTime: startTime };
        })
        .sort((a, b) => a._startTime - b._startTime)
        .map(({ date, count }) => ({ date, count }));

      return {
        ...usersData,
        dailyCounts: monthlyCounts,
      };
    }

    return {
      ...usersData,
      dailyCounts: usersData.dailyCounts,
    };
  }, [usersData, timeFilter]);

  // Расчет прогноза с useMemo - используем исходные дневные данные
  const forecast = useMemo(() => {
    // Всегда используем исходные дневные данные для расчёта
    if (!usersData || !usersData.dailyCounts || usersData.dailyCounts.length < 7) return null;

    const recentDays = usersData.dailyCounts.slice(-7); // Последние 7 дней
    const values = recentDays.map((day) => day.count);

    // Если все значения нулевые, используем среднее за всё время
    const allZero = values.every((v) => v === 0);
    if (allZero) {
      const allValues = usersData.dailyCounts.map((d) => d.count);
      const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;

      const forecastData = [];
      for (let i = 0; i < 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i + 1);
        forecastData.push({
          date: format(futureDate, 'dd.MM.yy'),
          count: Math.round(avg),
        });
      }
      return forecastData;
    }

    // Линейная регрессия (метод наименьших квадратов)
    const n = values.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      const avg = sumY / n;
      const forecastData = [];
      for (let i = 0; i < 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i + 1);
        forecastData.push({
          date: format(futureDate, 'dd.MM.yy'),
          count: Math.round(avg),
        });
      }
      return forecastData;
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    const avg = sumY / n;
    const minValue = Math.min(...values);

    // Функция для расчёта прогноза на один день
    const predictDay = (dayIndex: number): number => {
      let predictedValue = intercept + slope * dayIndex;
      // Если прогноз слишком низкий, используем среднее со случайным разбросом
      if (predictedValue < minValue * 0.5) {
        predictedValue = avg * (0.8 + Math.random() * 0.4);
      }
      return Math.max(1, Math.round(predictedValue));
    };

    const forecastData = [];

    if (timeFilter === '7') {
      // Недельный график → прогноз на 3 недели (сумма дней за каждую неделю)
      for (let week = 0; week < 3; week++) {
        let weekSum = 0;
        for (let day = 0; day < 7; day++) {
          const dayIndex = n + week * 7 + day;
          weekSum += predictDay(dayIndex);
        }

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() + week * 7 + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        forecastData.push({
          date: `${format(weekStart, 'dd.MM')}–${format(weekEnd, 'dd.MM')}`,
          count: weekSum,
        });
      }
    } else if (timeFilter === '30') {
      // Месячный график → прогноз на 3 месяца (сумма дней за каждый месяц)
      for (let month = 0; month < 3; month++) {
        let monthSum = 0;
        for (let day = 0; day < 30; day++) {
          const dayIndex = n + month * 30 + day;
          monthSum += predictDay(dayIndex);
        }

        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() + month + 1);

        forecastData.push({
          date: format(monthDate, 'MMM yy', { locale: ru }),
          count: monthSum,
        });
      }
    } else {
      // Дневной график → прогноз на 7 дней
      for (let i = 0; i < 7; i++) {
        const dayIndex = n + i;
        const predictedValue = predictDay(dayIndex);

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i + 1);

        forecastData.push({
          date: format(futureDate, 'dd.MM.yy'),
          count: predictedValue,
        });
      }
    }

    return forecastData;
  }, [usersData, timeFilter]);

  // Вычисление прироста в процентах по сравнению с предыдущим периодом
  const growthStats = useMemo(() => {
    if (!filteredData?.dailyCounts || filteredData.dailyCounts.length === 0) {
      return { percentage: 0, currentPeriodTotal: 0, previousPeriodTotal: 0 };
    }

    // Сортируем исходные данные по дате
    const sortedDays = [...usersData.dailyCounts].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').map(Number);
      const [dayB, monthB, yearB] = b.date.split('.').map(Number);
      const dateA = Date.UTC(2000 + yearA, monthA - 1, dayA);
      const dateB = Date.UTC(2000 + yearB, monthB - 1, dayB);
      return dateA - dateB;
    });

    if (sortedDays.length === 0) {
      return { percentage: 0, currentPeriodTotal: 0, previousPeriodTotal: 0 };
    }

    let currentPeriodTotal = 0;
    let previousPeriodTotal = 0;
    
    if (timeFilter === 'all') {
      // Для "all" сравниваем последние 7 дней с предыдущими 7 днями
      if (sortedDays.length >= 14) {
        const last7Days = sortedDays.slice(-7);
        const previous7Days = sortedDays.slice(-14, -7);
        currentPeriodTotal = last7Days.reduce((sum, day) => sum + day.count, 0);
        previousPeriodTotal = previous7Days.reduce((sum, day) => sum + day.count, 0);
      } else if (sortedDays.length >= 7) {
        const last7Days = sortedDays.slice(-7);
        currentPeriodTotal = last7Days.reduce((sum, day) => sum + day.count, 0);
        previousPeriodTotal = 0;
      }
    } else if (timeFilter === '7') {
      // Для недель - сравниваем последнюю неделю с предыдущей неделей
      // filteredData.dailyCounts уже содержит недельные данные
      if (filteredData.dailyCounts.length >= 2) {
        const lastWeek = filteredData.dailyCounts[filteredData.dailyCounts.length - 1];
        const previousWeek = filteredData.dailyCounts[filteredData.dailyCounts.length - 2];
        currentPeriodTotal = lastWeek.count;
        previousPeriodTotal = previousWeek.count;
      } else if (filteredData.dailyCounts.length === 1) {
        currentPeriodTotal = filteredData.dailyCounts[0].count;
        previousPeriodTotal = 0;
      }
    } else if (timeFilter === '30') {
      // Для месяцев - сравниваем последний месяц с предыдущим месяцем
      // filteredData.dailyCounts уже содержит месячные данные
      if (filteredData.dailyCounts.length >= 2) {
        const lastMonth = filteredData.dailyCounts[filteredData.dailyCounts.length - 1];
        const previousMonth = filteredData.dailyCounts[filteredData.dailyCounts.length - 2];
        currentPeriodTotal = lastMonth.count;
        previousPeriodTotal = previousMonth.count;
      } else if (filteredData.dailyCounts.length === 1) {
        currentPeriodTotal = filteredData.dailyCounts[0].count;
        previousPeriodTotal = 0;
      }
    }

    // Вычисляем процент прироста
    let percentage = 0;
    if (previousPeriodTotal > 0) {
      percentage = ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100;
    } else if (currentPeriodTotal > 0 && previousPeriodTotal === 0) {
      // Если предыдущего периода нет, но есть текущий - это новый период
      percentage = 0; // Не показываем прирост, если нет данных для сравнения
    }

    return {
      percentage: Math.round(percentage * 100) / 100, // Округляем до 2 знаков
      currentPeriodTotal,
      previousPeriodTotal,
    };
  }, [filteredData, usersData, timeFilter]);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-orange-500" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          User Statistics
        </h2>
      </div>

      {/* Если пришло текстовое сообщение от n8n */}
      {usersData.text ? (
        <div
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
              {usersData.text}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Основная статистика - Apple Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Всего пользователей */}
            <div
              className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isDark
                  ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50'
                  : 'bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm'
              } rounded-2xl p-6`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Users className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`} />
                  <span
                    className={`text-xs font-medium tracking-wide uppercase ${
                      isDark ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    Всего
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className={`text-5xl font-semibold tracking-tight mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {usersData.totalUsers || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                    пользователей
                  </div>
                </div>
              </div>
            </div>

            {/* За 24 часа */}
            <div
              className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isDark
                  ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50'
                  : 'bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm'
              } rounded-2xl p-6`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`}></div>
                  <span
                    className={`text-xs font-medium tracking-wide uppercase ${
                      isDark ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    За 24 часа
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className={`text-5xl font-semibold tracking-tight mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {usersData.usersLast24h?.length || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                    новых регистраций
                  </div>
                </div>
              </div>
            </div>

            {/* Premium пользователи */}
            {usersData.premiumUsers !== undefined && (
              <>
                <div
                  className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    isDark
                      ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50'
                      : 'bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm'
                  } rounded-2xl p-6`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white text-xs">★</span>
                      </div>
                      <span
                        className={`text-xs font-medium tracking-wide uppercase ${
                          isDark ? 'text-zinc-400' : 'text-gray-500'
                        }`}
                      >
                        Premium
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className={`text-5xl font-semibold tracking-tight mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {usersData.premiumUsers}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                        {usersData.totalPremiumPercentage}% от общего
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    isDark
                      ? 'bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50'
                      : 'bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm'
                  } rounded-2xl p-6`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs">★</span>
                      </div>
                      <span
                        className={`text-xs font-medium tracking-wide uppercase ${
                          isDark ? 'text-zinc-400' : 'text-gray-500'
                        }`}
                      >
                        Premium 24ч
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className={`text-5xl font-semibold tracking-tight mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {usersData.premiumUsersLast24h || 0}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                        {usersData.premiumPercentageLast24h}% от новых
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* График прироста пользователей */}
          {filteredData?.dailyCounts && filteredData.dailyCounts.length > 0 && (
            <div
              className={`p-6 rounded-xl shadow-lg ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              ref={chartRef}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📈 График прироста пользователей
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Filter buttons */}
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: '1D' },
                      { key: '7', label: '1W' },
                      { key: '30', label: '1M' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setTimeFilter(key as TimeFilter)}
                        className={
                          timeFilter === key ? 'neu-btn-filter-active' : 'neu-btn-filter'
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Chart Type Toggle */}
                  <button
                    onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
                    className="neu-btn-filter"
                    title={chartType === 'line' ? 'Переключить на столбчатый график' : 'Переключить на линейный график'}
                  >
                    {chartType === 'line' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    )}
                  </button>

                  {/* Share button */}
                  <button
                    onClick={() => {
                      // Убеждаемся, что growthData передается как массив
                      let growthDataArray = filteredData?.dailyCounts || [];
                      
                      // Ограничиваем количество данных для caption (лимит Telegram - 1024 символа)
                      // Для "all" берем только последние 30 дней, чтобы caption не был слишком длинным
                      if (timeFilter === 'all' && growthDataArray.length > 30) {
                        growthDataArray = growthDataArray.slice(-30);
                      }
                      // Для "7" и "30" оставляем все данные (их обычно немного)
                      
                      shareChart({
                        chartRef,
                        chartTitle: 'График прироста пользователей',
                        chartType: chartType,
                        section: 'users',
                        timeFilter,
                        totalUsers: usersData.totalUsers,
                        growthData: growthDataArray,
                        currentDate: new Date().toLocaleDateString('ru-RU'),
                      });
                    }}
                    disabled={isSharing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } ${isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    title="Поделиться графиком в Telegram"
                  >
                    <Share2 className={`w-4 h-4 ${isSharing ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">
                      {isSharing ? 'Отправка...' : 'Share'}
                    </span>
                  </button>
                </div>
              </div>

              {/* График */}
              <div className="h-80">
                {chartType === 'line' ? (
                  <Line
                    data={{
                      labels: [
                        ...(filteredData?.dailyCounts.map((day) => day.date) || []),
                        ...(forecast?.map((day) => day.date) || []),
                      ],
                      datasets: [
                        {
                          label: 'Регистрации',
                          data: filteredData?.dailyCounts.map((day) => day.count) || [],
                          borderColor: isDark ? '#f97316' : '#ea580c',
                          backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.05)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: isDark ? '#f97316' : '#ea580c',
                          pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                          pointBorderWidth: 2,
                          pointRadius: 6,
                          pointHoverRadius: 8,
                        },
                        // Добавляем прогноз
                        ...(forecast
                          ? [
                              {
                                label: 'Прогноз',
                                data: [
                                  ...(filteredData?.dailyCounts.map(() => null) || []),
                                  ...forecast.map((day) => day.count),
                                ],
                                borderColor: isDark ? '#8b5cf6' : '#7c3aed',
                                backgroundColor: 'transparent',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                tension: 0.4,
                                pointBackgroundColor: isDark ? '#8b5cf6' : '#7c3aed',
                                pointBorderColor: isDark ? '#ffffff' : '#ffffff',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                              },
                            ]
                          : []),
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: isDark ? '#374151' : '#ffffff',
                          titleColor: isDark ? '#ffffff' : '#000000',
                          bodyColor: isDark ? '#ffffff' : '#000000',
                          borderColor: isDark ? '#4b5563' : '#e5e7eb',
                          borderWidth: 1,
                          cornerRadius: 8,
                          displayColors: false,
                          callbacks: {
                            title: function (context) {
                              return `📅 ${context[0].label}`;
                            },
                            label: function (context) {
                              return `👥 ${context.parsed.y} новых пользователей`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            color: isDark ? '#374151' : '#f3f4f6',
                            drawBorder: false,
                          },
                          ticks: {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            font: {
                              size: 12,
                            },
                          },
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: isDark ? '#374151' : '#f3f4f6',
                            drawBorder: false,
                          },
                          ticks: {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            font: {
                              size: 12,
                            },
                            callback: function (value) {
                              return Number(value).toLocaleString('ru-RU');
                            },
                          },
                        },
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                    }}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: filteredData?.dailyCounts.map((day) => day.date) || [],
                      datasets: [
                        {
                          label: 'Регистрации',
                          data: filteredData?.dailyCounts.map((day) => day.count) || [],
                          backgroundColor: isDark ? '#f97316' : '#ea580c',
                          borderColor: isDark ? '#f97316' : '#ea580c',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: isDark ? '#374151' : '#ffffff',
                          titleColor: isDark ? '#ffffff' : '#000000',
                          bodyColor: isDark ? '#ffffff' : '#000000',
                          borderColor: isDark ? '#4b5563' : '#e5e7eb',
                          borderWidth: 1,
                          cornerRadius: 8,
                          displayColors: false,
                          callbacks: {
                            title: function (context) {
                              return `📅 ${context[0].label}`;
                            },
                            label: function (context) {
                              return `👥 ${context.parsed.y} новых пользователей`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            color: isDark ? '#374151' : '#f3f4f6',
                            drawBorder: false,
                          },
                          ticks: {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            font: {
                              size: 12,
                            },
                          },
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: isDark ? '#374151' : '#f3f4f6',
                            drawBorder: false,
                          },
                          ticks: {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            font: {
                              size: 12,
                            },
                            callback: function (value) {
                              return Number(value).toLocaleString('ru-RU');
                            },
                          },
                        },
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Статистика по языкам */}
          {usersData.languageCounts && usersData.languageCounts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Language list */}
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neu-inset p-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    User Languages
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {usersData.languageCounts.slice(0, 8).map(
                    (lang: { language: string; count: number }, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{lang.count}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            {lang.language.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Pie chart */}
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neu-inset p-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Language Distribution
                  </h3>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: usersData.languageCounts.slice(0, 6).map((lang) => lang.language.toUpperCase()),
                      datasets: [
                        {
                          data: usersData.languageCounts.slice(0, 6).map((lang) => lang.count),
                          backgroundColor: [
                            '#f97316', // orange-500
                            '#3b82f6', // blue-500
                            '#10b981', // emerald-500
                            '#8b5cf6', // violet-500
                            '#ef4444', // red-500
                            '#f59e0b', // amber-500
                          ],
                          borderColor: isDark ? '#374151' : '#ffffff',
                          borderWidth: 2,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: isDark ? '#ffffff' : '#000000',
                            padding: 20,
                            usePointStyle: true,
                            font: {
                              size: 12,
                            },
                          },
                        },
                        tooltip: {
                          backgroundColor: isDark ? '#374151' : '#ffffff',
                          titleColor: isDark ? '#ffffff' : '#000000',
                          bodyColor: isDark ? '#ffffff' : '#000000',
                          borderColor: isDark ? '#4b5563' : '#e5e7eb',
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                            label: function (context) {
                              const total = context.dataset.data.reduce(
                                (a: number, b: number) => a + b,
                                0
                              );
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Languages in last 24 hours */}
          {usersData.languageCountsLast24h && usersData.languageCountsLast24h.length > 0 && (
            <div className="neu-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="neu-inset p-2">
                  <Globe className="w-5 h-5 text-green-400" />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Languages (24h)
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {usersData.languageCountsLast24h.map(
                  (lang: { language: string; count: number }, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{lang.count}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          {lang.language.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Регистрации по дням и прогноз */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registrations by day */}
            {usersData?.dailyCounts && usersData.dailyCounts.length > 0 && (
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neu-inset p-2">
                    <Calendar className="w-5 h-5 text-pink-400" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Daily Registrations
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {usersData.dailyCounts.map(
                      (day: { date: string; count: number }, index: number) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            isDark ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {day.date}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (day.count /
                                      Math.max(...usersData.dailyCounts.map((d) => d.count))) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-bold text-orange-600 min-w-[2rem] text-right">
                              {day.count}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Прогноз */}
            {forecast && (
              <div className="neu-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neu-inset p-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Forecast: {timeFilter === '7' ? '3 Weeks' : timeFilter === '30' ? '3 Months' : '7 Days'}
                  </h3>
                </div>
                <div className="space-y-3">
                  {forecast.map((day: { date: string; count: number }, index: number) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{day.date}</span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                          прогноз
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (day.count / Math.max(...forecast.map((d) => d.count))) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-bold text-purple-600 min-w-[2rem] text-right">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    💡 Прогноз основан на тренде последних 7 дней
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

