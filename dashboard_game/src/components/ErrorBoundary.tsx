import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Компонент для отображения ошибки при падении компонента
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
    }`}>
      <div className={`max-w-md w-full rounded-xl shadow-lg p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <svg 
              className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Что-то пошло не так
          </h2>
          
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Произошла ошибка при загрузке компонента. Попробуйте перезагрузить страницу или вернуться назад.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className={`mt-4 p-4 rounded-lg text-left ${
              isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <summary className={`cursor-pointer font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Детали ошибки (только для разработки)
              </summary>
              <pre className={`text-xs overflow-auto ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={resetErrorBoundary}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Попробовать снова
            </button>
            <button
              onClick={() => window.location.reload()}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Обертка для ErrorBoundary с настройками по умолчанию
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback = ErrorFallback,
  onError 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Логируем ошибку в консоль
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('❌ Error Info:', errorInfo);
    
    // Вызываем пользовательский обработчик, если он есть
    if (onError) {
      onError(error, errorInfo);
    }

    // В продакшене можно отправлять ошибки в сервис мониторинга
    // Например: Sentry.captureException(error, { contexts: { react: errorInfo } });
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // Очищаем состояние при сбросе ошибки
        window.location.hash = '';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};


