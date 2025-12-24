import { useState } from 'react';
import { EventModalData } from '../../../types/dashboard';

/**
 * Хук для управления всеми модальными окнами Dashboard
 */
export const useModals = () => {
  const [selectedEventModal, setSelectedEventModal] = useState<EventModalData | null>(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [showWalletUsers, setShowWalletUsers] = useState(false);

  const openEventModal = (data: EventModalData) => {
    setSelectedEventModal(data);
  };

  const closeEventModal = () => {
    setSelectedEventModal(null);
  };

  const openComparisonModal = () => {
    setComparisonModalOpen(true);
  };

  const closeComparisonModal = () => {
    setComparisonModalOpen(false);
  };

  const openUserDetailsModal = (personId: number) => {
    setSelectedPersonId(personId);
  };

  const closeUserDetailsModal = () => {
    setSelectedPersonId(null);
  };

  const openWalletUsers = () => {
    setShowWalletUsers(true);
  };

  const closeWalletUsers = () => {
    setShowWalletUsers(false);
  };

  return {
    // Event Modal
    selectedEventModal,
    openEventModal,
    closeEventModal,
    isEventModalOpen: !!selectedEventModal,
    
    // Comparison Modal
    comparisonModalOpen,
    openComparisonModal,
    closeComparisonModal,
    
    // User Details Modal
    selectedPersonId,
    openUserDetailsModal,
    closeUserDetailsModal,
    isUserDetailsModalOpen: selectedPersonId !== null,
    
    // Wallet Users Section
    showWalletUsers,
    openWalletUsers,
    closeWalletUsers,
  };
};


