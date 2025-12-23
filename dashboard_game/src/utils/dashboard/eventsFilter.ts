import { EventsData } from '../../components/dashboard/hooks/types';

/**
 * Утилита для фильтрации данных событий по времени
 */

const formatDateDDMMYY = (date: Date) => {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yy = String(date.getUTCFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
};

/**
 * Агрегирует данные по дням/неделям/месяцам
 */
const aggregateData = (data: { date: string; count: number }[], filter: 'all' | '7' | '30') => {
  if (!data || data.length === 0) return [];
  
  if (filter === 'all') {
    return data;
  } else if (filter === '7') {
    // Группировка по неделям
    const sortedDays = [...data].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').map(Number);
      const [dayB, monthB, yearB] = b.date.split('.').map(Number);
      const dateA = Date.UTC(2000 + yearA, monthA - 1, dayA);
      const dateB = Date.UTC(2000 + yearB, monthB - 1, dayB);
      return dateA - dateB;
    });
    
    if (sortedDays.length === 0) return [];
    
    const firstDay = sortedDays[0];
    const [firstDayStr, firstMonthStr, firstYearStr] = firstDay.date.split('.');
    const startDate = new Date(Date.UTC(2000 + parseInt(firstYearStr), parseInt(firstMonthStr) - 1, parseInt(firstDayStr), 0, 0, 0, 0));
    
    const countsByWeek: { weekStart: Date; weekEnd: Date; count: number }[] = [];
    
    sortedDays.forEach(day => {
      const [dayStr, monthStr, yearStr] = day.date.split('.');
      const dayDate = new Date(Date.UTC(2000 + parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr), 0, 0, 0, 0));
      
      const daysDiff = Math.floor((dayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysDiff / 7);
      
      const weekStart = new Date(startDate.getTime() + weekNumber * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      let weekData = countsByWeek.find(w => w.weekStart.getTime() === weekStart.getTime());
      
      if (!weekData) {
        weekData = { weekStart, weekEnd, count: 0 };
        countsByWeek.push(weekData);
      }
      
      weekData.count += day.count;
    });
    
    return countsByWeek
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

/**
 * Фильтрует данные событий по времени
 */
export const filterEventsData = (eventsData: EventsData | null, timeFilter: 'all' | '7' | '30') => {
  if (!eventsData) return null;

  // Агрегируем totalByDay
  const filteredTotalByDay = aggregateData(eventsData.totalByDay, timeFilter);

  // Агрегируем каждый event
  const filteredEvents: { [key: string]: { date: string; count: number }[] } = {};
  Object.keys(eventsData.events).forEach(eventName => {
    filteredEvents[eventName] = aggregateData(eventsData.events[eventName], timeFilter);
  });

  return {
    ...eventsData,
    totalByDay: filteredTotalByDay,
    events: filteredEvents
  };
};

/**
 * Фильтрует данные для графика корреляции
 */
export const filterCorrelationData = (eventsData: EventsData | null, timeFilter: 'all' | '7' | '30') => {
  if (!eventsData) return null;

  // Агрегируем каждый event по фильтру времени
  const filteredEvents: { [key: string]: { date: string; count: number }[] } = {};
  Object.keys(eventsData.events).forEach(eventName => {
    filteredEvents[eventName] = aggregateData(eventsData.events[eventName], timeFilter);
  });

  // Получаем общие даты для всех событий
  const allDates = new Set<string>();
  Object.values(filteredEvents).forEach(eventData => {
    eventData.forEach(day => allDates.add(day.date));
  });
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

  return {
    dates: sortedDates,
    events: filteredEvents
  };
};

