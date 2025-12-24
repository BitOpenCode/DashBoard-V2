import React, { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { numberFormat } from '../../../utils/dashboard/formatters';
import { exportToCSVWithCustomHeaders } from '../../../utils/dashboard/csvExport';

import { AllUsersData as AllUsersDataType, NormalizedUserData } from '../hooks/useAllUsersData';
import { RawUserData } from '../../../utils/dashboard/userNormalizer';

interface AllUsersSectionProps {
  onLoadUserDetails: (personId: number) => void;
  allUsersData: AllUsersDataType | null;
  normalizeUserData: (user: RawUserData) => NormalizedUserData;
}

/**
 * Компонент секции All Users
 */
export const AllUsersSection: React.FC<AllUsersSectionProps> = ({
  onLoadUserDetails,
  allUsersData,
  normalizeUserData,
}) => {
  const { isDark } = useTheme();
  
  // Адаптер для преобразования результата normalizeUserData в AllUser
  const adaptUserData = (normalizedUser: NormalizedUserData): NormalizedUserData => {
    return {
      person_id: normalizedUser.person_id || 0,
      person_language: normalizedUser.person_language || 'en',
      wallet_address: normalizedUser.wallet_address || '',
      hex_wallet_address: normalizedUser.hex_wallet_address || '',
      is_ecos_premium: normalizedUser.is_ecos_premium || false,
      ecos_premium_until: normalizedUser.ecos_premium_until || null,
      onbording_done: normalizedUser.onbording_done || false,
      person_created_at: normalizedUser.person_created_at || '',
      person_updated_at: normalizedUser.person_updated_at || '',
      tg_id: normalizedUser.tg_id || '',
      first_name: normalizedUser.first_name || '',
      last_name: normalizedUser.last_name || '',
      username: normalizedUser.username || 'Unknown',
      tg_language: normalizedUser.tg_language || 'en',
      tg_premium: normalizedUser.tg_premium || false,
      photo_url: normalizedUser.photo_url || null,
      tg_created_at: normalizedUser.tg_created_at || '',
      tg_updated_at: normalizedUser.tg_updated_at || '',
      total_asics: normalizedUser.total_asics || 0,
      total_th: normalizedUser.total_th || 0,
      level: normalizedUser.level || null,
      effective_ths: normalizedUser.effective_ths || 0,
      progress_cached: normalizedUser.progress_cached || 0,
    };
  };
  const [allUsersFilters, setAllUsersFilters] = useState<{
    search: string;
    ecosPremium: 'all' | 'premium' | 'free';
    tgPremium: 'all' | 'premium' | 'free';
    onboarding: 'all' | 'done' | 'pending';
    language: 'all' | string;
    level: 'all' | string;
    minAsic: string;
    maxAsic: string;
    minTh: string;
    maxTh: string;
    dateFrom: string;
    dateTo: string;
  }>({
    search: '',
    ecosPremium: 'all',
    tgPremium: 'all',
    onboarding: 'all',
    language: 'all',
    level: 'all',
    minAsic: '',
    maxAsic: '',
    minTh: '',
    maxTh: '',
    dateFrom: '',
    dateTo: ''
  });
  const [allUsersSort, setAllUsersSort] = useState<{
    field: string | null;
    direction: 'asc' | 'desc';
  }>({
    field: null,
    direction: 'asc'
  });

  // Дебаунс поискового запроса (300ms задержка)
  const [debouncedSearchQuery] = useDebounce(allUsersFilters.search, 300);

  // Фильтрация и сортировка данных
  const filteredAndSortedUsers = useMemo(() => {
    if (!allUsersData) return [];
    
    let filtered = [...allUsersData.users];

    // Используем debounced значение для поиска
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchLower) ||
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        String(user.person_id).includes(searchLower) ||
        user.tg_id?.toLowerCase().includes(searchLower) ||
        user.wallet_address?.toLowerCase().includes(searchLower) ||
        user.hex_wallet_address?.toLowerCase().includes(searchLower) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower)
      );
    }

    if (allUsersFilters.ecosPremium !== 'all') {
      filtered = filtered.filter(user => 
        allUsersFilters.ecosPremium === 'premium' ? user.is_ecos_premium : !user.is_ecos_premium
      );
    }

    if (allUsersFilters.tgPremium !== 'all') {
      filtered = filtered.filter(user => 
        allUsersFilters.tgPremium === 'premium' ? user.tg_premium : !user.tg_premium
      );
    }

    if (allUsersFilters.onboarding !== 'all') {
      filtered = filtered.filter(user => 
        allUsersFilters.onboarding === 'done' ? user.onbording_done : !user.onbording_done
      );
    }

    if (allUsersFilters.language !== 'all') {
      filtered = filtered.filter(user => 
        user.person_language === allUsersFilters.language || user.tg_language === allUsersFilters.language
      );
    }

    if (allUsersFilters.level !== 'all') {
      const levelFilter = parseInt(allUsersFilters.level);
      if (!isNaN(levelFilter)) {
        filtered = filtered.filter(user => 
          user.level !== null && user.level === levelFilter
        );
      }
    }

    if (allUsersFilters.minAsic) {
      const minAsic = parseInt(allUsersFilters.minAsic) || 0;
      filtered = filtered.filter(user => (user.total_asics || 0) >= minAsic);
    }

    if (allUsersFilters.maxAsic) {
      const maxAsic = parseInt(allUsersFilters.maxAsic) || Infinity;
      filtered = filtered.filter(user => (user.total_asics || 0) <= maxAsic);
    }

    if (allUsersFilters.minTh) {
      const minTh = parseInt(allUsersFilters.minTh) || 0;
      filtered = filtered.filter(user => (user.total_th || 0) >= minTh);
    }

    if (allUsersFilters.maxTh) {
      const maxTh = parseInt(allUsersFilters.maxTh) || Infinity;
      filtered = filtered.filter(user => (user.total_th || 0) <= maxTh);
    }

    if (allUsersFilters.dateFrom) {
      const dateFrom = new Date(allUsersFilters.dateFrom);
      dateFrom.setHours(0, 0, 0, 0);
      filtered = filtered.filter(user => {
        if (!user.person_created_at) return false;
        const userDate = new Date(user.person_created_at);
        userDate.setHours(0, 0, 0, 0);
        return userDate >= dateFrom;
      });
    }

    if (allUsersFilters.dateTo) {
      const dateTo = new Date(allUsersFilters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter(user => {
        if (!user.person_created_at) return false;
        const userDate = new Date(user.person_created_at);
        return userDate <= dateTo;
      });
    }

    if (allUsersSort.field) {
      filtered.sort((a, b) => {
        let aVal: any = a[allUsersSort.field as keyof typeof a];
        let bVal: any = b[allUsersSort.field as keyof typeof b];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          // Числа сортируем как есть
        } else {
          aVal = aVal || 0;
          bVal = bVal || 0;
        }

        if (aVal < bVal) return allUsersSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return allUsersSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allUsersData, debouncedSearchQuery, allUsersFilters, allUsersSort]);

  // Виртуализация временно отключена, так как ломает структуру таблицы

  const uniqueLanguages = useMemo(() => {
    if (!allUsersData) return [];
    const languages = new Set<string>();
    allUsersData.users.forEach(user => {
      if (user.person_language) languages.add(user.person_language);
      if (user.tg_language) languages.add(user.tg_language);
    });
    return Array.from(languages).sort();
  }, [allUsersData]);

  const uniqueLevels = useMemo(() => {
    if (!allUsersData) return [];
    const levels = new Set<number>();
    allUsersData.users.forEach(user => {
      if (user.level !== null && user.level !== undefined) {
        levels.add(user.level);
      }
    });
    return Array.from(levels).sort((a, b) => a - b);
  }, [allUsersData]);

  const handleSort = (field: string) => {
    setAllUsersSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: string) => {
    if (allUsersSort.field !== field) {
      return (
        <svg className="w-4 h-4 inline-block ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return allUsersSort.direction === 'asc' ? (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!allUsersData) {
    return null;
  }

  return (
    <div className="mb-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">👥 All Users Info</h2>
      </div>

      {/* Общая статистика */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Всего пользователей</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {numberFormat(allUsersData.total)}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Показано после фильтров</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {numberFormat(filteredAndSortedUsers.length)}
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                if (filteredAndSortedUsers.length === 0) {
                  toast.error('Нет данных для экспорта');
                  return;
                }
                try {
                  exportToCSVWithCustomHeaders(
                    filteredAndSortedUsers,
                    {
                      person_id: 'ID',
                      tg_id: 'TG ID',
                      username: 'Username',
                      first_name: 'First Name',
                      last_name: 'Last Name',
                      person_language: 'Language',
                      wallet_address: 'Wallet Address',
                      is_ecos_premium: 'ECOS Premium',
                      ecos_premium_until: 'ECOS Premium Until',
                      tg_premium: 'TG Premium',
                      onbording_done: 'Onboarding Done',
                      total_asics: 'Total ASICs',
                      total_th: 'Total TH',
                      level: 'Level',
                      effective_ths: 'Effective THs',
                      progress_cached: 'Progress',
                      person_created_at: 'Created At',
                    },
                    'all_users'
                  );
                  toast.success(`Экспортировано ${filteredAndSortedUsers.length} пользователей в CSV`);
                } catch (error: any) {
                  toast.error('Ошибка экспорта: ' + error.message);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-green-700 hover:bg-green-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Фильтры</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Поиск */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Поиск
            </label>
            <input
              type="text"
              value={allUsersFilters.search}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Username, ID, TG ID, Wallet, Имя..."
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* ECOS Premium фильтр */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              ECOS Premium
            </label>
            <select
              value={allUsersFilters.ecosPremium}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, ecosPremium: e.target.value as any }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="all">Все</option>
              <option value="premium">Premium</option>
              <option value="free">Free</option>
            </select>
          </div>

          {/* TG Premium фильтр */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              TG Premium
            </label>
            <select
              value={allUsersFilters.tgPremium}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, tgPremium: e.target.value as any }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="all">Все</option>
              <option value="premium">Premium</option>
              <option value="free">Free</option>
            </select>
          </div>

          {/* Onboarding фильтр */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Onboarding
            </label>
            <select
              value={allUsersFilters.onboarding}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, onboarding: e.target.value as any }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="all">Все</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Язык фильтр */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Язык
            </label>
            <select
              value={allUsersFilters.language}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, language: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="all">Все</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Level фильтр */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Level
            </label>
            <select
              value={allUsersFilters.level}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, level: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="all">Все</option>
              {uniqueLevels.map(level => (
                <option key={level} value={String(level)}>Level {level}</option>
              ))}
            </select>
          </div>

          {/* Минимальный ASIC */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              ASIC от
            </label>
            <input
              type="number"
              value={allUsersFilters.minAsic}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, minAsic: e.target.value }))}
              placeholder="0"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Максимальный ASIC */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              ASIC до
            </label>
            <input
              type="number"
              value={allUsersFilters.maxAsic}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, maxAsic: e.target.value }))}
              placeholder="∞"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Минимальный Th */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Th от
            </label>
            <input
              type="number"
              value={allUsersFilters.minTh}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, minTh: e.target.value }))}
              placeholder="0"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Максимальный Th */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Th до
            </label>
            <input
              type="number"
              value={allUsersFilters.maxTh}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, maxTh: e.target.value }))}
              placeholder="∞"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Дата регистрации от */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Дата регистрации от
            </label>
            <input
              type="date"
              value={allUsersFilters.dateFrom}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Дата регистрации до */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Дата регистрации до
            </label>
            <input
              type="date"
              value={allUsersFilters.dateTo}
              onChange={(e) => setAllUsersFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        {/* Кнопка сброса фильтров */}
        <button
          onClick={() => setAllUsersFilters({
            search: '',
            ecosPremium: 'all',
            tgPremium: 'all',
            onboarding: 'all',
            language: 'all',
            level: 'all',
            minAsic: '',
            maxAsic: '',
            minTh: '',
            maxTh: '',
            dateFrom: '',
            dateTo: ''
          })}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Сбросить фильтры
        </button>
      </div>

      {/* Таблица пользователей */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <th 
                  className={`text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('person_id')}
                >
                  <div className="flex items-center gap-1">
                    ID {getSortIcon('person_id')}
                  </div>
                </th>
                <th 
                  className={`text-left py-2.5 px-2 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('tg_id')}
                >
                  <div className="flex items-center gap-1">
                    TG ID {getSortIcon('tg_id')}
                  </div>
                </th>
                <th 
                  className={`text-left py-2.5 px-2 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-1">
                    User {getSortIcon('username')}
                  </div>
                </th>
                <th className={`text-left py-2.5 px-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Wallet
                </th>
                <th 
                  className={`text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('total_asics')}
                >
                  <div className="flex items-center justify-end gap-1">
                    ASIC {getSortIcon('total_asics')}
                  </div>
                </th>
                <th 
                  className={`text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('total_th')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Th {getSortIcon('total_th')}
                  </div>
                </th>
                <th 
                  className={`text-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Level {getSortIcon('level')}
                  </div>
                </th>
                <th 
                  className={`text-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('is_ecos_premium')}
                >
                  <div className="flex items-center justify-center gap-1">
                    ECOS Premium {getSortIcon('is_ecos_premium')}
                  </div>
                </th>
                <th 
                  className={`text-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('tg_premium')}
                >
                  <div className="flex items-center justify-center gap-1">
                    TG Premium {getSortIcon('tg_premium')}
                  </div>
                </th>
                <th 
                  className={`text-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('onbording_done')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Onboarding {getSortIcon('onbording_done')}
                  </div>
                </th>
                <th className={`text-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Язык
                </th>
                <th 
                  className={`text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  onClick={() => handleSort('person_created_at')}
                >
                  <div className="flex items-center gap-1">
                    Регистрация {getSortIcon('person_created_at')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user, index) => (
                    <tr
                      key={user.person_id}
                      onClick={() => {
                        console.log('🖱️ Клик по пользователю:', {
                          person_id: user.person_id,
                          username: user.username,
                          index: index
                        });
                        onLoadUserDetails(user.person_id);
                      }}
                      className={`border-b transition-all duration-150 cursor-pointer hover:shadow-md ${
                        isDark 
                          ? 'border-gray-700/50 hover:bg-gray-700/40' 
                          : 'border-gray-200 hover:bg-gray-100'
                      } ${index % 2 === 0 ? (isDark ? 'bg-gray-800/40' : 'bg-gray-50/50') : (isDark ? 'bg-gray-800/20' : 'bg-white')}`}
                    >
                      <td className={`py-3 px-4 text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.person_id}
                      </td>
                      <td className={`py-3 px-3 text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="min-w-[80px]">
                          {user.tg_id || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-start gap-2.5 min-w-[180px] max-w-[200px]">
                          {/* Фото пользователя */}
                          <div className="flex-shrink-0">
                            {user.photo_url ? (
                              <img 
                                src={user.photo_url} 
                                alt={user.username || 'User'}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-500/30 shadow-sm"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                                loading="lazy"
                              />
                            ) : null}
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-gray-500/30 shadow-sm ${
                                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                              style={{ display: user.photo_url ? 'none' : 'flex' }}
                            >
                              {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                            </div>
                          </div>
                          {/* Username и имя */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className={`text-sm font-semibold leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                              {user.username || 'Unknown'}
                            </div>
                            <div className={`text-xs leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="truncate max-w-[100px] text-xs font-mono" title={user.wallet_address || 'N/A'}>
                          {user.wallet_address ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : 'N/A'}
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-semibold tabular-nums ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {numberFormat(user.total_asics || 0)}
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-semibold tabular-nums ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {numberFormat(user.total_th || 0)} <span className="text-xs opacity-70">Th</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.level !== null ? (
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold ${
                            user.level === 0 
                              ? isDark ? 'bg-gray-700/50 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'
                              : user.level <= 3
                              ? isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
                              : user.level <= 6
                              ? isDark ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.level <= 8
                              ? isDark ? 'bg-orange-900/50 text-orange-300 border border-orange-700' : 'bg-orange-100 text-orange-800 border border-orange-200'
                              : isDark ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {user.level}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-gray-700/50 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.is_ecos_premium ? (
                          <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                            ✓
                          </span>
                        ) : (
                          <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-gray-700/50 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.tg_premium ? (
                          <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                            ✓
                          </span>
                        ) : (
                          <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-gray-700/50 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.onbording_done ? (
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                            ✓
                          </span>
                        ) : (
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                            ⚠
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.person_language === 'ru' || user.tg_language === 'ru'
                            ? isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
                            : isDark ? 'bg-gray-700/50 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {(user.person_language || user.tg_language || 'N/A').toUpperCase()}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-xs tabular-nums ${isDark ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`}>
                        {formatDate(user.person_created_at)}
                      </td>
                    </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

