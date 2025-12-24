import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

/**
 * Переиспользуемый компонент для отображения индикатора загрузки
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Загрузка...',
  className = '',
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`mb-6 ${className}`}>
      <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};


