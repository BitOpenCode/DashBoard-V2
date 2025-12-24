import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '../../../contexts/ThemeContext';
import { TrendingUp } from 'lucide-react';
import { ActivityOverviewData } from '../hooks/useActivityOverview';

interface ActivityOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ActivityOverviewData | null;
}

export const ActivityOverviewModal: React.FC<ActivityOverviewModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !data) {
    return null;
  }

  const activationRate = parseFloat(data.activation_rate);
  const avgDays = parseFloat(data.avg_active_days);
  
  // Определяем качество
  let qualityIcon = '';
  let qualityText = '';
  let qualityDescription = '';
  let qualityColor = '';
  
  if (activationRate >= 90 && avgDays >= 3) {
    qualityIcon = '🌟';
    qualityText = 'Отличное качество';
    qualityDescription = 'Высокая активация (≥90%) и хорошее удержание (≥3 дней). Приглашаются реальные активные пользователи.';
    qualityColor = 'bg-green-500';
  } else if (activationRate >= 70 && avgDays >= 2) {
    qualityIcon = '✅';
    qualityText = 'Хорошее качество';
    qualityDescription = 'Хорошая активация (≥70%) и удовлетворительное удержание (≥2 дней). Рефералы проявляют интерес к игре.';
    qualityColor = 'bg-blue-500';
  } else if (activationRate >= 50) {
    qualityIcon = '⚠️';
    qualityText = 'Среднее качество';
    qualityDescription = 'Активация ≥50%, но многие пользователи быстро уходят.';
    qualityColor = 'bg-yellow-500';
  } else if (avgDays < 1.5 && activationRate === 100) {
    qualityIcon = '🤖';
    qualityText = 'Подозрение на ботов';
    qualityDescription = '100% активация, но средняя активность <1.5 дней. Похоже на схему: регистрация → получение бонуса → уход. Возможно использование ботов или фейковых аккаунтов.';
    qualityColor = 'bg-red-500';
  } else {
    qualityIcon = '❌';
    qualityText = 'Низкое качество';
    qualityDescription = 'Низкая активация (<50%). Большинство приглашенных не начинают играть или быстро уходят.';
    qualityColor = 'bg-red-500';
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 pb-32 overflow-y-auto">
          <div 
            className={`max-w-6xl w-full rounded-xl shadow-2xl p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок модального окна */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="neu-inset p-2">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <Dialog.Title className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Activity Overview: {data.referrer_name}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
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
              </Dialog.Close>
            </div>
            
            {/* Карточка с оценкой качества */}
            <div className={`${qualityColor} text-white p-6 rounded-xl shadow-lg mb-6`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{qualityIcon}</span>
                <h4 className="text-2xl font-bold">{qualityText}</h4>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{qualityDescription}</p>
            </div>
            
            {/* Главные метрики */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Всего приглашений</div>
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                  {data.total_invited}
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Средняя активность</div>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {parseFloat(data.avg_activity_per_referral).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">действий на реферала</div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Средние активные дни</div>
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {parseFloat(data.avg_active_days).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">дней активности</div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

