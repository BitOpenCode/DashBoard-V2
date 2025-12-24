import { useEffect } from 'react';

/**
 * Кастомный хук для блокировки скролла основного экрана при открытии модальных окон
 * Сохраняет текущую позицию скролла и восстанавливает её при закрытии
 * 
 * @param isOpen - Флаг открытия модального окна (true = заблокировать скролл, false = разблокировать)
 */
export const useScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      
      // Блокируем скролл
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Восстанавливаем скролл при закрытии модального окна
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};


