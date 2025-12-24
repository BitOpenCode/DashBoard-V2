export interface EventModalData {
  date: string;
  count: number;
}

export type TimeFilter = 'all' | '7' | '30';

/**
 * Фильтрует данные события по выбранному периоду времени
 */
export const filterEventModalData = (
  data: EventModalData[],
  filter: TimeFilter
): EventModalData[] => {
  if (!data || data.length === 0) return [];

  const formatDateDDMMYY = (date: Date) => {
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const yy = String(date.getUTCFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  };

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
      .map(d => ({
        date: `${formatDateDDMMYY(d.weekStart)}–${formatDateDDMMYY(d.weekEnd)}`,
        count: d.count
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


