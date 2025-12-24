import { EventsData } from '../../components/dashboard/hooks/types';

export type TimeFilter = 'all' | '7' | '30';

export interface ComparisonData {
  dates: string[];
  started: { date: string; count: number }[];
  claimed: { date: string; count: number }[];
}

/**
 * Фильтрует данные для сравнительного графика майнинга
 */
export const filterComparisonData = (
  eventsData: EventsData | null,
  filter: TimeFilter
): ComparisonData | null => {
  if (!eventsData || !eventsData.events['mining_started'] || !eventsData.events['mining_claimed']) {
    return null;
  }

  const formatDateDDMMYY = (date: Date) => {
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const yy = String(date.getUTCFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  };

  const aggregateData = (data: { date: string; count: number }[], filter: TimeFilter) => {
    if (filter === '7') {
      // Группировка по неделям
      const countsByWeek = new Map<string, { count: number; weekStart: Date; weekEnd: Date }>();
      
      data.forEach(day => {
        const [dayStr, monthStr, yearStr] = day.date.split('.');
        const dayDate = new Date(2000 + parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        
        const weekStart = new Date(dayDate);
        weekStart.setUTCDate(dayDate.getUTCDate() - dayDate.getUTCDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
        
        const weekKey = `${formatDateDDMMYY(weekStart)}–${formatDateDDMMYY(weekEnd)}`;
        
        if (!countsByWeek.has(weekKey)) {
          countsByWeek.set(weekKey, { count: 0, weekStart, weekEnd });
        }
        const weekData = countsByWeek.get(weekKey)!;
        weekData.count += day.count;
      });
      
      return Array.from(countsByWeek.values())
        .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
        .map(data => ({
          date: `${formatDateDDMMYY(data.weekStart)}–${formatDateDDMMYY(data.weekEnd)}`,
          count: data.count
        }));
    } else if (filter === '30') {
      // Группировка по месяцам
      const countsByMonth = new Map<string, number>();
      
      data.forEach(day => {
        const [dayStr, monthStr, yearStr] = day.date.split('.');
        const dayDate = new Date(2000 + parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        
        const mm = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
        const yy = String(dayDate.getUTCFullYear()).slice(-2);
        const monthKey = `${mm}.${yy}`;
        
        countsByMonth.set(monthKey, (countsByMonth.get(monthKey) || 0) + day.count);
      });
      
      return Array.from(countsByMonth.entries())
        .map(([month, count]) => {
          const [mm, yy] = month.split('.').map(Number);
          const startTime = new Date(2000 + yy, mm - 1, 1).getTime();
          return { date: month, count, _startTime: startTime };
        })
        .sort((a, b) => a._startTime - b._startTime)
        .map(({ date, count }) => ({ date, count }));
    }
    
    return data;
  };

  const filteredStarted = aggregateData(eventsData.events['mining_started'], filter);
  const filteredClaimed = aggregateData(eventsData.events['mining_claimed'], filter);

  // Получаем общие даты для обоих событий
  const allDates = new Set<string>();
  filteredStarted.forEach(day => allDates.add(day.date));
  filteredClaimed.forEach(day => allDates.add(day.date));
  
  const sortedDates = Array.from(allDates).sort((a, b) => {
    const parseDate = (dateStr: string) => {
      if (dateStr.includes('–')) {
        const [start] = dateStr.split('–');
        const [dd, mm, yy] = start.split('.');
        return new Date(2000 + parseInt(yy), parseInt(mm) - 1, parseInt(dd)).getTime();
      } else if (dateStr.includes('.')) {
        const [mm, yy] = dateStr.split('.');
        return new Date(2000 + parseInt(yy), parseInt(mm) - 1, 1).getTime();
      }
      return 0;
    };
    return parseDate(a) - parseDate(b);
  });

  // Создаем мапы для быстрого доступа
  const startedMap = new Map(filteredStarted.map(d => [d.date, d.count]));
  const claimedMap = new Map(filteredClaimed.map(d => [d.date, d.count]));

  return {
    dates: sortedDates,
    started: sortedDates.map(date => ({ date, count: startedMap.get(date) || 0 })),
    claimed: sortedDates.map(date => ({ date, count: claimedMap.get(date) || 0 }))
  };
};

