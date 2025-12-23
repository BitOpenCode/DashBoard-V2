import { useMemo, useState, useRef, useEffect } from 'react';
import { EventsData } from './types';
import { filterEventsData, filterCorrelationData } from '../../../utils/dashboard/eventsFilter';
import { excludedEvents } from '../../../utils/dashboard/eventConstants';

/**
 * Хук для управления фильтрацией и состоянием событий
 */
export const useEventsFilter = (eventsData: EventsData | null) => {
  const [eventsTimeFilter, setEventsTimeFilter] = useState<'all' | '7' | '30'>('all');
  const [correlationTimeFilter, setCorrelationTimeFilter] = useState<'all' | '7' | '30'>('all');
  const [comparisonTimeFilter, setComparisonTimeFilter] = useState<'all' | '7' | '30'>('all');
  const [eventsChartType, setEventsChartType] = useState<'line' | 'bar'>('line');
  const [correlationChartType, setCorrelationChartType] = useState<'line' | 'bar'>('line');
  const [comparisonChartType, setComparisonChartType] = useState<'line' | 'bar'>('line');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Инициализируем выбранные события только один раз при первой загрузке данных
  useEffect(() => {
    if (eventsData && eventsData.events && Object.keys(eventsData.events).length > 0 && !eventsInitialized) {
      const eventKeys = Object.keys(eventsData.events)
        .filter(eventName => !excludedEvents.includes(eventName))
        .slice(0, 20);
      setSelectedEvents(new Set(eventKeys));
      setEventsInitialized(true);
    }
  }, [eventsData, eventsInitialized]);

  const filteredEventsData = useMemo(() => {
    return filterEventsData(eventsData, eventsTimeFilter);
  }, [eventsData, eventsTimeFilter]);

  const filteredCorrelationData = useMemo(() => {
    return filterCorrelationData(eventsData, correlationTimeFilter);
  }, [eventsData, correlationTimeFilter]);

  const scrollToCategory = (categoryName: string) => {
    const element = categoryRefs.current[categoryName];
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return {
    eventsTimeFilter,
    setEventsTimeFilter,
    correlationTimeFilter,
    setCorrelationTimeFilter,
    comparisonTimeFilter,
    setComparisonTimeFilter,
    eventsChartType,
    setEventsChartType,
    correlationChartType,
    setCorrelationChartType,
    comparisonChartType,
    setComparisonChartType,
    selectedEvents,
    setSelectedEvents,
    categoryRefs,
    scrollToCategory,
    filteredEventsData,
    filteredCorrelationData,
  };
};

