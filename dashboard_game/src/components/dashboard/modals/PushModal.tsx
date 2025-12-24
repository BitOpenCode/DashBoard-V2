import React from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { AsicKpiUser, RefKpiUser } from '../hooks/useKPITablesData';

interface PushModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: 'ref1' | 'ref3' | 'asic' | null;
  asicKpiData: AsicKpiUser[] | null;
  refKpiData: RefKpiUser[] | null;
  ref3KpiData: RefKpiUser[] | null;
  selectedAsicKpiUsers: Set<number>;
  selectedRefKpiUsers: Set<number>;
  selectedRef3KpiUsers: Set<number>;
  message: string;
  setMessage: (message: string) => void;
  sending: boolean;
  onSend: (tgIds: string[], message: string) => Promise<void>;
}

export const PushModal: React.FC<PushModalProps> = ({
  isOpen,
  onClose,
  source,
  asicKpiData,
  refKpiData,
  ref3KpiData,
  selectedAsicKpiUsers,
  selectedRefKpiUsers,
  selectedRef3KpiUsers,
  message,
  setMessage,
  sending,
  onSend
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !source) {
    return null;
  }

  // Определяем источник данных и выбранных пользователей
  let selectedUsers: (AsicKpiUser | RefKpiUser)[] = [];
  let selectedCount = 0;

  if (source === 'ref1' && refKpiData) {
    selectedUsers = refKpiData.filter(user => selectedRefKpiUsers.has(user.person_id));
    selectedCount = selectedRefKpiUsers.size;
  } else if (source === 'ref3' && ref3KpiData) {
    selectedUsers = ref3KpiData.filter(user => selectedRef3KpiUsers.has(user.person_id));
    selectedCount = selectedRef3KpiUsers.size;
  } else if (source === 'asic' && asicKpiData) {
    selectedUsers = asicKpiData.filter(user => selectedAsicKpiUsers.has(user.person_id));
    selectedCount = selectedAsicKpiUsers.size;
  }

  if (selectedCount === 0) {
    return null;
  }

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Пожалуйста, введите сообщение');
      return;
    }
    
    const tgIds = selectedUsers.map(user => user.tg_id).filter((id): id is string => id !== undefined && id !== null && id.trim() !== '');
    
    if (tgIds.length === 0) {
      toast.error('У выбранных пользователей нет TG ID');
      return;
    }
    
    await onSend(tgIds, message.trim());
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-2xl w-full rounded-xl shadow-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Отправить push-уведомления
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            Выбрано пользователей: <span className="font-semibold">{selectedCount}</span>
          </p>
          <div className={`max-h-40 overflow-y-auto p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <span 
                  key={user.person_id}
                  className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {user.first_name} {user.last_name || ''} (@{user.username || user.tg_id})
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Сообщение для отправки:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите текст push-уведомления..."
            rows={6}
            className={`w-full p-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {message.length} символов
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Отмена
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || selectedCount === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              sending || !message.trim()
                ? 'bg-gray-500 cursor-not-allowed text-white'
                : isDark
                ? 'bg-blue-700 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Отправить пуш</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

