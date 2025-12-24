import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export interface DataLoadingButton {
  label: string;
  loading: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface DataLoadingButtonsProps {
  buttons: DataLoadingButton[];
}

/**
 * Компонент для отображения кнопок загрузки данных
 */
export const DataLoadingButtons: React.FC<DataLoadingButtonsProps> = ({ buttons }) => {
  return (
    <div className="mb-8 neu-btn-grid">
      {buttons.map((button, index) => (
        <motion.button
          key={index}
          onClick={button.onClick}
          disabled={button.loading}
          className="neu-btn-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {button.loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            button.icon || <Users className="w-5 h-5 text-blue-400" />
          )}
          <span>{button.loading ? 'Loading...' : button.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

