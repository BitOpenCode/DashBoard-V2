import React from 'react';
// Импортируем конфигурацию Chart.js
import '../../utils/dashboard/chartConfig';
// Утилиты для нормализации данных пользователя
import { normalizeUserData } from '../../utils/dashboard/userNormalizer';
// Утилиты для TON вынесены в отдельные файлы
import { 
  useUsersData, 
  useWalletsData, 
  useEventsData, 
  useReferralsData, 
  usePoolsData, 
  useKPIData, 
  useLeadersData, 
  useFunnelData,
  useTonOrdersData,
  useActivityOverview,
  useLevelUsers,
  useWalletUsersData,
  useAllUsersData,
  useScrollLock,
  useModals
} from '../dashboard/hooks';
import { UsersSection } from '../dashboard/sections/UsersSection';
import { WalletsSection } from '../dashboard/sections/WalletsSection';
import { ReferralsSection } from '../dashboard/sections/ReferralsSection';
import { PoolsSection } from '../dashboard/sections/PoolsSection';
import { FunnelSection } from '../dashboard/sections/FunnelSection';
import { LeadersSection } from '../dashboard/sections/LeadersSection';
import { EventsSection } from '../dashboard/sections/EventsSection';
import { AllUsersSection } from '../dashboard/sections/AllUsersSection';
import { WalletUsersSection } from '../dashboard/sections/WalletUsersSection';
import { KPISection } from '../dashboard/sections/KPISection';
import { DataLoadingButtons } from '../dashboard/DataLoadingButtons';
import { AnimatedSection } from '../dashboard/AnimatedSection';
import { LoadingSpinner } from '../dashboard/LoadingSpinner';
import { UserDetailsModal } from '../dashboard/modals/UserDetailsModal';
import { EventModal } from '../dashboard/modals/EventModal';
import { ComparisonModal } from '../dashboard/modals/ComparisonModal';
import { ActivityOverviewModal } from '../dashboard/modals/ActivityOverviewModal';
import { LevelUsersModal } from '../dashboard/modals/LevelUsersModal';
import { dashboardButtonsConfig } from '../../utils/dashboard/dashboardButtonConfig';
import { DataLoadingButton } from '../dashboard/DataLoadingButtons';

const Dashboard: React.FC = () => {
  
  const {
    usersData,
    loading: usersLoading,
    timeFilter,
    setTimeFilter,
    loadUsersData,
    setUsersData,
  } = useUsersData();
  
  const {
    walletsData,
    loading: walletsLoading,
    loadWalletsData,
    setWalletsData,
  } = useWalletsData();
  
  const {
    tonOrdersData,
    selectedTonCategories,
    loadTonOrdersData,
    setSelectedTonCategories,
  } = useTonOrdersData();
  
  const {
    eventsData,
    loading: eventsLoading,
    loadEventsData,
    setEventsData,
  } = useEventsData();
  
  const {
    selectedEventModal,
    openEventModal,
    closeEventModal,
    isEventModalOpen,
    comparisonModalOpen,
    openComparisonModal,
    closeComparisonModal,
    selectedPersonId,
    openUserDetailsModal,
    closeUserDetailsModal,
    isUserDetailsModalOpen,
    showWalletUsers,
    openWalletUsers,
  } = useModals();
  
  const {
    referralsData,
    loading: referralsLoading,
    loadReferralsData,
    setReferralsData,
  } = useReferralsData();
  const {
    activityOverview,
    loading: activityLoading,
    loadActivityOverview,
    setActivityOverview,
  } = useActivityOverview();
  
  const {
    funnelData,
    loading: funnelLoading,
    loadFunnelData,
    setFunnelData,
  } = useFunnelData();
  
  const {
    leadersData,
    loading: leadersLoading,
    loadLeadersData,
    setLeadersData,
  } = useLeadersData();
  
  const {
    poolsData,
    loading: poolsLoading,
    loadPoolsData,
    setPoolsData,
  } = usePoolsData();
  
  const {
    kpiData,
    loading: kpiLoading,
    loadKpiData,
    setKpiData,
  } = useKPIData();
  
  const {
    allUsersData,
    allUsersLoading,
    loadAllUsersData,
    setAllUsersData,
  } = useAllUsersData();
  const {
    levelUsersModal,
    loading: levelUsersLoading,
    filters: levelUsersFilters,
    loadLevelUsers,
    setLevelUsersModal,
    setFilters: setLevelUsersFilters,
  } = useLevelUsers();

  const {
    walletUsersLoading,
    loadWalletUsers,
  } = useWalletUsersData();

  const handleLoadWalletUsers = async () => {
    openWalletUsers();
    await loadWalletUsers();
  };

  const clearAllSections = () => {
    [
      setUsersData,
      setWalletsData,
      setEventsData,
      setReferralsData,
      setFunnelData,
      setLeadersData,
      setPoolsData,
      setKpiData,
      setAllUsersData,
    ].forEach((clearFn) => clearFn(null));
  };

  const handleLoadUsersData = async () => {
    clearAllSections();
    await loadUsersData();
  };

  const handleLoadWalletsData = async () => {
    clearAllSections();
    await loadWalletsData();
  };

  const handleLoadEventsData = async () => {
    clearAllSections();
    await loadEventsData();
    await loadTonOrdersData();
  };

  const handleLoadReferralsData = async () => {
    clearAllSections();
    await loadReferralsData();
  };

  const handleLoadPoolsData = async () => {
    clearAllSections();
    await loadPoolsData();
  };

  const handleLoadFunnelData = async () => {
    clearAllSections();
    await loadFunnelData();
  };

  const handleLoadLeadersData = async () => {
    clearAllSections();
    await loadLeadersData();
  };

  const handleLoadKpiData = async () => {
    clearAllSections();
    await loadKpiData();
  };

  const handleLoadAllUsersData = async () => {
    clearAllSections();
    await loadAllUsersData();
  };

  const handleLoadUserDetails = (personId: number) => {
    openUserDetailsModal(personId);
  };

  useScrollLock(!!levelUsersModal);
  useScrollLock(isUserDetailsModalOpen);

  const buttonConfig: Record<string, { handler: () => Promise<void>; loading: boolean }> = {
    users: { handler: handleLoadUsersData, loading: usersLoading },
    wallets: { handler: handleLoadWalletsData, loading: walletsLoading },
    events: { handler: handleLoadEventsData, loading: eventsLoading },
    referrals: { handler: handleLoadReferralsData, loading: referralsLoading },
    pools: { handler: handleLoadPoolsData, loading: poolsLoading },
    funnel: { handler: handleLoadFunnelData, loading: funnelLoading },
    leaders: { handler: handleLoadLeadersData, loading: leadersLoading },
    kpi: { handler: handleLoadKpiData, loading: kpiLoading },
    allUsers: { handler: handleLoadAllUsersData, loading: allUsersLoading },
  };

  const buttons: DataLoadingButton[] = dashboardButtonsConfig.map((config) => {
    const btnConfig = buttonConfig[config.id];
    return {
      label: config.label,
      icon: config.icon,
      loading: btnConfig?.loading || false,
      onClick: btnConfig?.handler || (() => {}),
    };
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 md:max-w-4xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">ECOS BTC Mining Game</h1>
      </div>

      <DataLoadingButtons buttons={buttons} />

      <AnimatedSection show={showWalletUsers}>
        <WalletUsersSection />
      </AnimatedSection>

      <AnimatedSection show={!!usersData}>
        {usersData && (
          <UsersSection usersData={usersData} timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
        )}
      </AnimatedSection>

      <AnimatedSection show={!!walletsData}>
        {walletsData && (
          <WalletsSection walletsData={walletsData} onLoadWalletUsers={handleLoadWalletUsers} walletUsersLoading={walletUsersLoading} />
        )}
      </AnimatedSection>

      <AnimatedSection show={!!referralsData}>
        {referralsData && (
          <ReferralsSection 
            referralsData={referralsData} 
            onLoadActivityOverview={loadActivityOverview}
            activityLoading={activityLoading}
          />
        )}
      </AnimatedSection>

      {/* Отображение данных игровых событий */}
      <EventsSection
        eventsData={eventsData}
        tonOrdersData={tonOrdersData}
        selectedTonCategories={selectedTonCategories}
        onSelectedTonCategoriesChange={setSelectedTonCategories}
        onSelectEventModal={openEventModal}
        onOpenComparisonModal={openComparisonModal}
      />

      {/* Модальное окно обзора активности рефералов */}
      <ActivityOverviewModal
        isOpen={!!activityOverview}
        onClose={() => setActivityOverview(null)}
        data={activityOverview}
      />

      {selectedEventModal && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={closeEventModal}
          eventName={selectedEventModal.eventName}
          eventData={selectedEventModal.eventData}
          eventInfo={selectedEventModal.eventInfo}
        />
      )}

      <AnimatedSection show={!!funnelData}>
        {funnelData && (
          <FunnelSection funnelData={funnelData} onLoadLevelUsers={loadLevelUsers} />
        )}
      </AnimatedSection>

      <AnimatedSection show={!!leadersData}>
        {leadersData && (
          <LeadersSection leadersData={leadersData} />
        )}
      </AnimatedSection>

      <AnimatedSection show={!!poolsData}>
        {poolsData && (
          <PoolsSection poolsData={poolsData} />
        )}
      </AnimatedSection>

      {kpiLoading && <LoadingSpinner message="Загрузка KPI данных..." />}
      <AnimatedSection show={!!kpiData}>
        {kpiData && (
          <KPISection onLoadUserDetails={handleLoadUserDetails} kpiData={kpiData} />
        )}
      </AnimatedSection>

      <AnimatedSection show={!!allUsersData}>
        {allUsersData && (
          <AllUsersSection
            allUsersData={allUsersData}
            normalizeUserData={(user: unknown) => normalizeUserData(user as Parameters<typeof normalizeUserData>[0])}
            onLoadUserDetails={handleLoadUserDetails}
          />
        )}
      </AnimatedSection>

      {/* Модальное окно с пользователями уровня */}
      <LevelUsersModal
        isOpen={!!levelUsersModal}
        onClose={() => setLevelUsersModal(null)}
        data={levelUsersModal}
        loading={levelUsersLoading}
        filters={levelUsersFilters}
        onFiltersChange={setLevelUsersFilters}
      />

      {/* User Details Modal - теперь использует Radix UI Dialog */}
      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={closeUserDetailsModal}
        personId={selectedPersonId}
        allUsersData={allUsersData}
      />

      <ComparisonModal
        isOpen={comparisonModalOpen}
        onClose={closeComparisonModal}
        eventsData={eventsData}
      />
    </div>
  );
};

export default Dashboard;


