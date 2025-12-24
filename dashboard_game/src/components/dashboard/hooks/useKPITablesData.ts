import { useState } from 'react';

export interface AsicKpiUser {
  person_id: number;
  tg_id: string;
  username: string;
  first_name: string;
  last_name: string;
  current_level: number;
  effective_ths: string;
  total_asics: number;
  required_asics_for_next_level: number | null;
  missing_asics: number;
  progress_percent: number;
  person_created_at: string | null;
  tg_photo_url: string | null;
}

export interface RefKpiUser {
  person_id: number;
  tg_id: string;
  username: string;
  first_name: string;
  last_name: string;
  current_level: number;
  effective_ths: string;
  total_asics: number;
  total_referrals: number;
  person_created_at: string | null;
  tg_photo_url: string | null;
}

/**
 * Хук для управления данными таблиц KPI (ASIC, Ref, Ref3)
 */
export const useKPITablesData = () => {
  const [asicKpiData, setAsicKpiData] = useState<AsicKpiUser[] | null>(null);
  const [asicKpiLoading, setAsicKpiLoading] = useState<boolean>(false);
  const [refKpiData, setRefKpiData] = useState<RefKpiUser[] | null>(null);
  const [refKpiLoading, setRefKpiLoading] = useState<boolean>(false);
  const [ref3KpiData, setRef3KpiData] = useState<RefKpiUser[] | null>(null);
  const [ref3KpiLoading, setRef3KpiLoading] = useState<boolean>(false);
  
  const [selectedAsicKpiUsers, setSelectedAsicKpiUsers] = useState<Set<number>>(new Set());
  const [selectedRefKpiUsers, setSelectedRefKpiUsers] = useState<Set<number>>(new Set());
  const [selectedRef3KpiUsers, setSelectedRef3KpiUsers] = useState<Set<number>>(new Set());

  /**
   * Загружает данные ASIC KPI для указанного уровня
   */
  const loadAsicKpiData = async (level: number | null) => {
    if (level === null || level === undefined) return;
    
    console.log('🚀 loadAsicKpiData вызвана для уровня:', level);
    setAsicKpiLoading(true);
    setAsicKpiData(null);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-kpi-asic'
        : 'https://n8n-p.blc.am/webhook/game-kpi-asic';
      
      console.log('🔗 Загрузка ASIC KPI данных с:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let data = await response.json();
      console.log('📊 Полученные ASIC KPI данные (RAW):', data);
      
      // Обрабатываем данные в зависимости от формата ответа
      let usersList: any[] = [];
      
      if (Array.isArray(data)) {
        if (data.length > 0 && data[0] && typeof data[0] === 'object' && data[0].json) {
          usersList = data.map((item: any) => item.json || item);
        } else {
          usersList = data;
        }
      } else if (data && typeof data === 'object') {
        if (data.rows && Array.isArray(data.rows)) {
          usersList = data.rows;
        } else if (data.result && Array.isArray(data.result)) {
          usersList = data.result;
        } else if (data.users && Array.isArray(data.users)) {
          usersList = data.users;
        } else if (data.count !== undefined && data.users && Array.isArray(data.users)) {
          usersList = data.users;
        } else if (data.data && Array.isArray(data.data)) {
          usersList = data.data;
        } else if (Array.isArray(data.json)) {
          usersList = data.json.map((item: any) => item.json || item);
        } else if (data.person_id !== undefined) {
          usersList = [data];
        } else if (data.json && typeof data.json === 'object') {
          if (Array.isArray(data.json)) {
            usersList = data.json.map((item: any) => (item.json || item));
          } else if (data.json.person_id !== undefined) {
            usersList = [data.json];
          }
        }
      }
      
      // Фильтруем по выбранному уровню
      let filteredUsers = usersList;
      if (level !== null && level !== undefined) {
        filteredUsers = usersList.filter((user: any) => {
          const userLevel = typeof user.current_level === 'string' 
            ? parseInt(user.current_level, 10) 
            : parseInt(user.current_level);
          return userLevel === level;
        });
      }
      
      // Преобразуем строковые значения в числа
      const formattedUsers: AsicKpiUser[] = filteredUsers.map((user: any) => ({
        person_id: typeof user.person_id === 'string' ? parseInt(user.person_id, 10) || 0 : parseInt(user.person_id) || 0,
        tg_id: String(user.tg_id || ''),
        username: String(user.username || ''),
        first_name: String(user.first_name || ''),
        last_name: String(user.last_name || ''),
        current_level: typeof user.current_level === 'string' ? parseInt(user.current_level, 10) || 0 : parseInt(user.current_level) || 0,
        effective_ths: String(user.effective_ths || '0'),
        total_asics: typeof user.total_asics === 'string' ? parseInt(user.total_asics, 10) || 0 : parseInt(user.total_asics) || 0,
        required_asics_for_next_level: typeof user.required_asics_for_next_level === 'string' 
          ? (user.required_asics_for_next_level === '' || user.required_asics_for_next_level === null 
              ? null 
              : parseInt(user.required_asics_for_next_level, 10))
          : (user.required_asics_for_next_level === null ? null : parseInt(user.required_asics_for_next_level) || null),
        missing_asics: typeof user.missing_asics === 'string' ? parseInt(user.missing_asics, 10) || 0 : parseInt(user.missing_asics) || 0,
        progress_percent: typeof user.progress_percent === 'string' ? parseFloat(user.progress_percent) || 0 : parseFloat(user.progress_percent) || 0,
        person_created_at: user.person_created_at || null,
        tg_photo_url: user.tg_photo_url || null
      }));
      
      setAsicKpiData(formattedUsers);
      console.log('✅ ASIC KPI данные загружены:', formattedUsers.length, 'пользователей');
    } catch (e: any) {
      console.error('❌ Ошибка загрузки ASIC KPI данных:', e);
      setAsicKpiData([]);
    } finally {
      setAsicKpiLoading(false);
    }
  };

  /**
   * Загружает данные Ref KPI для указанного уровня
   */
  const loadRefKpiData = async (level: number | null) => {
    if (level === null || level === undefined) return;
    
    console.log('🚀 loadRefKpiData вызвана для уровня:', level);
    setRefKpiLoading(true);
    setRefKpiData(null);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-kpi-1ref'
        : 'https://n8n-p.blc.am/webhook/game-kpi-1ref';
      
      console.log('🔗 Загрузка Ref KPI данных с:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let data = await response.json();
      console.log('📊 Полученные Ref KPI данные (RAW):', data);
      
      // Обрабатываем данные в зависимости от формата ответа
      let usersList: any[] = [];
      
      if (Array.isArray(data)) {
        if (data.length > 0 && data[0] && typeof data[0] === 'object' && data[0].json) {
          usersList = data.map((item: any) => item.json || item);
        } else {
          usersList = data;
        }
      } else if (data && typeof data === 'object') {
        if (data.rows && Array.isArray(data.rows)) {
          usersList = data.rows;
        } else if (data.result && Array.isArray(data.result)) {
          usersList = data.result;
        } else if (data.users && Array.isArray(data.users)) {
          usersList = data.users;
        } else if (data.count !== undefined && data.users && Array.isArray(data.users)) {
          usersList = data.users;
        } else if (data.data && Array.isArray(data.data)) {
          usersList = data.data;
        } else if (Array.isArray(data.json)) {
          usersList = data.json.map((item: any) => item.json || item);
        } else if (data.person_id !== undefined) {
          usersList = [data];
        } else if (data.json && typeof data.json === 'object') {
          if (Array.isArray(data.json)) {
            usersList = data.json.map((item: any) => (item.json || item));
          } else if (data.json.person_id !== undefined) {
            usersList = [data.json];
          }
        }
      }
      
      // Фильтруем по выбранному уровню
      let filteredUsers = usersList;
      if (level !== null && level !== undefined) {
        filteredUsers = usersList.filter((user: any) => {
          const userLevel = typeof user.current_level === 'string' 
            ? parseInt(user.current_level, 10) 
            : parseInt(user.current_level);
          return userLevel === level;
        });
      }
      
      // Преобразуем строковые значения в числа
      const formattedUsers: RefKpiUser[] = filteredUsers.map((user: any) => ({
        person_id: typeof user.person_id === 'string' ? parseInt(user.person_id, 10) || 0 : parseInt(user.person_id) || 0,
        tg_id: String(user.tg_id || ''),
        username: String(user.username || ''),
        first_name: String(user.first_name || ''),
        last_name: String(user.last_name || ''),
        current_level: typeof user.current_level === 'string' ? parseInt(user.current_level, 10) || 0 : parseInt(user.current_level) || 0,
        effective_ths: String(user.effective_ths || '0'),
        total_asics: typeof user.total_asics === 'string' ? parseInt(user.total_asics, 10) || 0 : parseInt(user.total_asics) || 0,
        total_referrals: typeof user.total_referrals === 'string' ? parseInt(user.total_referrals, 10) || 0 : parseInt(user.total_referrals) || 0,
        person_created_at: user.person_created_at || null,
        tg_photo_url: user.tg_photo_url || null
      }));
      
      setRefKpiData(formattedUsers);
      console.log('✅ Ref KPI данные загружены:', formattedUsers.length, 'пользователей');
    } catch (e: any) {
      console.error('❌ Ошибка загрузки Ref KPI данных:', e);
      setRefKpiData([]);
    } finally {
      setRefKpiLoading(false);
    }
  };

  /**
   * Загружает данные Ref 3 KPI для указанного уровня
   */
  const loadRef3KpiData = async (level: number | null) => {
    if (level === null || level === undefined) return;
    
    console.log('🚀 loadRef3KpiData вызвана для уровня:', level);
    setRef3KpiLoading(true);
    setRef3KpiData(null);
    
    try {
      const webhookUrl = import.meta.env.DEV 
        ? '/webhook/game-kpi-3ref'
        : 'https://n8n-p.blc.am/webhook/game-kpi-3ref';
      
      console.log('🔗 Загрузка Ref 3 KPI данных с:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let data = await response.json();
      console.log('📊 Полученные Ref 3 KPI данные (RAW):', data);
      
      // Обрабатываем данные в зависимости от формата ответа
      let usersList: any[] = [];
      
      if (Array.isArray(data)) {
        if (data.length > 0 && data[0] && typeof data[0] === 'object' && data[0].json) {
          usersList = data.map((item: any) => item.json || item);
        } else {
          usersList = data;
        }
      } else if (data && typeof data === 'object') {
        if (data.rows && Array.isArray(data.rows)) {
          usersList = data.rows;
        } else if (data.result && Array.isArray(data.result)) {
          usersList = data.result;
        } else if (data.users && Array.isArray(data.users)) {
          usersList = data.users;
        } else if (data.count !== undefined && data.users && Array.isArray(data.users)) {
          usersList = data.users;
        } else if (data.data && Array.isArray(data.data)) {
          usersList = data.data;
        } else if (Array.isArray(data.json)) {
          usersList = data.json.map((item: any) => item.json || item);
        } else if (data.person_id !== undefined) {
          usersList = [data];
        } else if (data.json && typeof data.json === 'object') {
          if (Array.isArray(data.json)) {
            usersList = data.json.map((item: any) => (item.json || item));
          } else if (data.json.person_id !== undefined) {
            usersList = [data.json];
          }
        }
      }
      
      // Фильтруем по выбранному уровню
      let filteredUsers = usersList;
      if (level !== null && level !== undefined) {
        filteredUsers = usersList.filter((user: any) => {
          const userLevel = typeof user.current_level === 'string' 
            ? parseInt(user.current_level, 10) 
            : parseInt(user.current_level);
          return userLevel === level;
        });
      }
      
      // Преобразуем строковые значения в числа
      const formattedUsers: RefKpiUser[] = filteredUsers.map((user: any) => ({
        person_id: typeof user.person_id === 'string' ? parseInt(user.person_id, 10) || 0 : parseInt(user.person_id) || 0,
        tg_id: String(user.tg_id || ''),
        username: String(user.username || ''),
        first_name: String(user.first_name || ''),
        last_name: String(user.last_name || ''),
        current_level: typeof user.current_level === 'string' ? parseInt(user.current_level, 10) || 0 : parseInt(user.current_level) || 0,
        effective_ths: String(user.effective_ths || '0'),
        total_asics: typeof user.total_asics === 'string' ? parseInt(user.total_asics, 10) || 0 : parseInt(user.total_asics) || 0,
        total_referrals: typeof user.total_referrals === 'string' ? parseInt(user.total_referrals, 10) || 0 : parseInt(user.total_referrals) || 0,
        person_created_at: user.person_created_at || null,
        tg_photo_url: user.tg_photo_url || null
      }));
      
      setRef3KpiData(formattedUsers);
      console.log('✅ Ref 3 KPI данные загружены:', formattedUsers.length, 'пользователей');
    } catch (e: any) {
      console.error('❌ Ошибка загрузки Ref 3 KPI данных:', e);
      setRef3KpiData([]);
    } finally {
      setRef3KpiLoading(false);
    }
  };

  return {
    asicKpiData,
    asicKpiLoading,
    refKpiData,
    refKpiLoading,
    ref3KpiData,
    ref3KpiLoading,
    selectedAsicKpiUsers,
    setSelectedAsicKpiUsers,
    selectedRefKpiUsers,
    setSelectedRefKpiUsers,
    selectedRef3KpiUsers,
    setSelectedRef3KpiUsers,
    loadAsicKpiData,
    loadRefKpiData,
    loadRef3KpiData,
    setAsicKpiData,
    setRefKpiData,
    setRef3KpiData
  };
};


