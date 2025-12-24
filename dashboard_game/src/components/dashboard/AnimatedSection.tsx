import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AnimatedSectionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Компонент-обертка для анимированных секций Dashboard
 * Устраняет дублирование AnimatePresence + motion.div
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  show,
  children,
  className,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

