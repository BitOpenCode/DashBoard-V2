import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { useKPITablesData, AsicKpiUser, RefKpiUser } from '../hooks/useKPITablesData';
import { numberFormat } from '../../../utils/dashboard/formatters';
import { PushModal } from '../modals/PushModal';
import { AsicKPITable, RefKPITable } from './KPITables';
import { KPIData } from '../hooks/types';

interface KPISectionProps {
  onLoadUserDetails: (personId: number) => void;
  kpiData: KPIData | null;
}

/**
 * Компонент секции KPI статистики
 */
export const KPISection: React.FC<KPISectionProps> = ({ onLoadUserDetails, kpiData }) => {
  const { isDark } = useTheme();
  const [selectedKpiLevel, setSelectedKpiLevel] = React.useState<number | null>(null);
  const {
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
  } = useKPITablesData();

  const [pushModalOpen, setPushModalOpen] = useState<boolean>(false);
  const [pushModalSource, setPushModalSource] = useState<'ref1' | 'ref3' | 'asic' | null>(null);
  const [pushMessage, setPushMessage] = useState<string>('');
  const [pushSending, setPushSending] = useState<boolean>(false);

  if (!kpiData) {
    return null;
  }

  const getLevelColor = (level: number) => {
    if (level === 0) return isDark ? 'bg-gray-600' : 'bg-gray-200';
    if (level <= 3) return isDark ? 'bg-blue-600' : 'bg-blue-200';
    if (level <= 6) return isDark ? 'bg-purple-600' : 'bg-purple-200';
    return isDark ? 'bg-yellow-600' : 'bg-yellow-200';
  };

  const getLevelTextColor = (level: number) => {
    if (level === 0) return isDark ? 'text-gray-300' : 'text-gray-700';
    if (level <= 3) return isDark ? 'text-blue-300' : 'text-blue-700';
    if (level <= 6) return isDark ? 'text-purple-300' : 'text-purple-700';
    return isDark ? 'text-yellow-300' : 'text-yellow-700';
  };

  const handleLevelClick = (level: number) => {
    const isSelected = selectedKpiLevel === level;
    setSelectedKpiLevel(isSelected ? null : level);
    // Скрываем данные при переключении на другой уровень
    setAsicKpiData(null);
    setRefKpiData(null);
    setRef3KpiData(null);
    // Очищаем выбранных пользователей
    setSelectedAsicKpiUsers(new Set());
    setSelectedRefKpiUsers(new Set());
    setSelectedRef3KpiUsers(new Set());
  };

  const handleCloseLevelDetails = () => {
    setSelectedKpiLevel(null);
    setAsicKpiData(null);
    setRefKpiData(null);
    setRef3KpiData(null);
    setSelectedAsicKpiUsers(new Set());
    setSelectedRefKpiUsers(new Set());
    setSelectedRef3KpiUsers(new Set());
  };

  const sendPushNotifications = async (tgIds: string[], message: string) => {
    console.log('🚀 sendPushNotifications вызвана');
    setPushSending(true);
    
    try {
      const webhookUrl = import.meta.env.DEV
        ? '/webhook/game-push-1ref'
        : 'https://n8n-p.blc.am/webhook/game-push-1ref';
      
      const params = new URLSearchParams({
        tg_ids: JSON.stringify(tgIds),
        message: message
      });
      
      const response = await fetch(`${webhookUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Push-уведомления отправлены:', data);
      
      setPushModalOpen(false);
      setPushModalSource(null);
      setPushMessage('');
      
      if (pushModalSource === 'ref1') {
        setSelectedRefKpiUsers(new Set());
      } else if (pushModalSource === 'ref3') {
        setSelectedRef3KpiUsers(new Set());
      } else if (pushModalSource === 'asic') {
        setSelectedAsicKpiUsers(new Set());
      }
      
                  toast.success(`Push-уведомления успешно отправлены ${tgIds.length} пользователям!`);
                } catch (e: any) {
                  console.error('❌ Ошибка отправки push-уведомлений:', e);
                  toast.error(`Ошибка отправки push-уведомлений: ${e.message}`);
    } finally {
      setPushSending(false);
    }
  };

  return (
    <div className="mb-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Users KPI - Статистика по уровням</h2>
      </div>

      {/* Общая статистика */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Всего пользователей</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {numberFormat(kpiData.total_users)}
            </p>
          </div>
        </div>
      </div>

      {/* Карточки уровней */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 11 }, (_, i) => i).map((level) => {
          // Ищем статистику для уровня - используем прямое сравнение через индекс массива
          // Поскольку мы гарантируем, что массив отсортирован от 0 до 10, уровень = индекс
          const levelStatByIndex = kpiData.level_stats[level];
          const levelStatByFind = kpiData.level_stats.find(s => {
            const sLevel = typeof s.level === 'string' ? parseInt(s.level, 10) : Number(s.level);
            return sLevel === level;
          });
          
          const levelStat = levelStatByIndex || levelStatByFind || {
            level,
            users_per_level: 0,
            percentage: '0.00'
          };
          
          // Логируем уровень 0 для отладки
          if (level === 0) {
            console.log('🔍 [KPISection] Уровень 0:');
            console.log('  - kpiData:', kpiData);
            console.log('  - kpiData.level_stats:', kpiData.level_stats);
            console.log('  - Длина массива:', kpiData.level_stats.length);
            console.log('  - Через индекс [0]:', levelStatByIndex);
            console.log('  - levelStatByIndex?.level:', levelStatByIndex?.level, 'type:', typeof levelStatByIndex?.level);
            console.log('  - levelStatByIndex?.users_per_level:', levelStatByIndex?.users_per_level, 'type:', typeof levelStatByIndex?.users_per_level);
            console.log('  - Через find:', levelStatByFind);
            console.log('  - Итоговая статистика:', levelStat);
            console.log('  - levelStat.users_per_level:', levelStat.users_per_level, 'type:', typeof levelStat.users_per_level);
            console.log('  - levelStat.percentage:', levelStat.percentage, 'type:', typeof levelStat.percentage);
            console.log('  - numberFormat(levelStat.users_per_level):', numberFormat(levelStat.users_per_level));
            console.log('  - Проверка levelStat.users_per_level === 0:', levelStat.users_per_level === 0);
            console.log('  - Проверка levelStat.users_per_level === 1945:', levelStat.users_per_level === 1945);
          }
          
          const isSelected = selectedKpiLevel === level;

          return (
            <div
              key={level}
              onClick={() => handleLevelClick(level)}
              className={`p-4 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl border-2 ${
                isSelected
                  ? isDark
                    ? 'bg-purple-900 border-purple-500'
                    : 'bg-purple-50 border-purple-500'
                  : isDark
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getLevelColor(level)} ${getLevelTextColor(level)}`}>
                  {level}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {numberFormat(levelStat.users_per_level)}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {levelStat.percentage}%
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full transition-all ${getLevelColor(level)}`}
                    style={{
                      width: `${Math.min(parseFloat(String(levelStat.percentage).replace('%', '') || '0'), 100)}%`
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isSelected ? 'Нажмите, чтобы свернуть' : 'Нажмите для деталей'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Детальная информация выбранного уровня */}
      {selectedKpiLevel !== null && (
        <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Уровень {selectedKpiLevel} - Детальная информация
            </h3>
            <button
              onClick={handleCloseLevelDetails}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
            >
              Свернуть
            </button>
          </div>
          {(() => {
            const levelStat = kpiData.level_stats.find(s => s.level === selectedKpiLevel);
            if (!levelStat) return null;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Пользователей на уровне</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {numberFormat(levelStat.users_per_level)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Процент от общего</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {levelStat.percentage}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => loadAsicKpiData(selectedKpiLevel)}
                    disabled={asicKpiLoading}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      asicKpiLoading
                        ? 'bg-gray-500 cursor-not-allowed text-white'
                        : isDark
                        ? 'bg-purple-700 hover:bg-purple-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {asicKpiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>KPI 1 ASIC till level up</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => loadRefKpiData(selectedKpiLevel)}
                    disabled={refKpiLoading}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      refKpiLoading
                        ? 'bg-gray-500 cursor-not-allowed text-white'
                        : isDark
                        ? 'bg-blue-700 hover:bg-blue-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {refKpiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>KPI 1 ref</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => loadRef3KpiData(selectedKpiLevel)}
                    disabled={ref3KpiLoading}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      ref3KpiLoading
                        ? 'bg-gray-500 cursor-not-allowed text-white'
                        : isDark
                        ? 'bg-green-700 hover:bg-green-600 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {ref3KpiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>KPI 3 ref</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* ASIC KPI Results */}
                {asicKpiData && asicKpiData.length > 0 && (
                  <AsicKPITable
                    data={asicKpiData}
                    selectedUsers={selectedAsicKpiUsers}
                    onUserSelect={(personId, e) => {
                      if (e) {
                        e.stopPropagation();
                        e.preventDefault();
                      }
                      setSelectedAsicKpiUsers(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(personId)) {
                          newSet.delete(personId);
                        } else {
                          newSet.add(personId);
                        }
                        return newSet;
                      });
                    }}
                    onSelectAll={() => {
                      if (selectedAsicKpiUsers.size === asicKpiData.length) {
                        setSelectedAsicKpiUsers(new Set());
                      } else {
                        setSelectedAsicKpiUsers(new Set(asicKpiData.map(u => u.person_id)));
                      }
                    }}
                                onOpenPushModal={() => {
                                  if (selectedAsicKpiUsers.size === 0) {
                                    toast.error('Пожалуйста, выберите хотя бы одного пользователя');
                                    return;
                                  }
                      setPushMessage('');
                      setPushModalSource('asic');
                      setPushModalOpen(true);
                    }}
                    onClose={() => {
                      setAsicKpiData(null);
                      setSelectedAsicKpiUsers(new Set());
                    }}
                    onLoadUserDetails={onLoadUserDetails}
                  />
                )}
                
                {/* Ref KPI Results */}
                {refKpiData && refKpiData.length > 0 && (
                  <RefKPITable
                    data={refKpiData}
                    selectedUsers={selectedRefKpiUsers}
                    onUserSelect={(personId, e) => {
                      if (e) {
                        e.stopPropagation();
                        e.preventDefault();
                      }
                      setSelectedRefKpiUsers(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(personId)) {
                          newSet.delete(personId);
                        } else {
                          newSet.add(personId);
                        }
                        return newSet;
                      });
                    }}
                    onSelectAll={() => {
                      if (selectedRefKpiUsers.size === refKpiData.length) {
                        setSelectedRefKpiUsers(new Set());
                      } else {
                        setSelectedRefKpiUsers(new Set(refKpiData.map(u => u.person_id)));
                      }
                    }}
                    onOpenPushModal={() => {
                      if (selectedRefKpiUsers.size === 0) {
                        toast.error('Пожалуйста, выберите хотя бы одного пользователя');
                        return;
                      }
                      setPushMessage('');
                      setPushModalSource('ref1');
                      setPushModalOpen(true);
                    }}
                    onClose={() => {
                      setRefKpiData(null);
                      setSelectedRefKpiUsers(new Set());
                    }}
                    onLoadUserDetails={onLoadUserDetails}
                    level={selectedKpiLevel}
                    title={`Пользователи на уровне ${selectedKpiLevel}, которые еще никого не пригласили`}
                  />
                )}
                
                {/* Ref 3 KPI Results */}
                {ref3KpiData && ref3KpiData.length > 0 && (
                  <RefKPITable
                    data={ref3KpiData}
                    selectedUsers={selectedRef3KpiUsers}
                    onUserSelect={(personId, e) => {
                      if (e) {
                        e.stopPropagation();
                        e.preventDefault();
                      }
                      setSelectedRef3KpiUsers(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(personId)) {
                          newSet.delete(personId);
                        } else {
                          newSet.add(personId);
                        }
                        return newSet;
                      });
                    }}
                    onSelectAll={() => {
                      if (selectedRef3KpiUsers.size === ref3KpiData.length) {
                        setSelectedRef3KpiUsers(new Set());
                      } else {
                        setSelectedRef3KpiUsers(new Set(ref3KpiData.map(u => u.person_id)));
                      }
                    }}
                    onOpenPushModal={() => {
                      if (selectedRef3KpiUsers.size === 0) {
                        toast.error('Пожалуйста, выберите хотя бы одного пользователя');
                        return;
                      }
                      setPushMessage('');
                      setPushModalSource('ref3');
                      setPushModalOpen(true);
                    }}
                    onClose={() => {
                      setRef3KpiData(null);
                      setSelectedRef3KpiUsers(new Set());
                    }}
                    onLoadUserDetails={onLoadUserDetails}
                    level={selectedKpiLevel}
                    title={`Пользователи на уровне ${selectedKpiLevel}, которые пригласили ровно 2 реферала`}
                  />
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Модальное окно для push-уведомлений */}
      <PushModal
        isOpen={pushModalOpen}
        onClose={() => {
          setPushModalOpen(false);
          setPushModalSource(null);
        }}
        source={pushModalSource}
        asicKpiData={asicKpiData}
        refKpiData={refKpiData}
        ref3KpiData={ref3KpiData}
        selectedAsicKpiUsers={selectedAsicKpiUsers}
        selectedRefKpiUsers={selectedRefKpiUsers}
        selectedRef3KpiUsers={selectedRef3KpiUsers}
        message={pushMessage}
        setMessage={setPushMessage}
        sending={pushSending}
        onSend={sendPushNotifications}
      />
    </div>
  );
};

