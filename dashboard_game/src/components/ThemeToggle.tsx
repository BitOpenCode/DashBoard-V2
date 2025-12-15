import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-xl transition-all duration-300 ${
        isDark 
          ? 'neu-btn text-orange-400 hover:text-orange-300' 
          : 'bg-white shadow-lg hover:shadow-xl text-orange-500'
      }`}
      aria-label="Переключить тему"
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
