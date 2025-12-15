import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LOGO_PATH } from '../../utils/paths';

const Home: React.FC = () => {
  const { isDark } = useTheme();

  const ecosCards = [
    {
      title: "Что?",
      icon: "⛏️",
      content: "ECOS Mining Game — это инновационная игра-симулятор майнинга Bitcoin, где вы можете построить свою майнинг-империю."
    },
    {
      title: "Для кого?",
      icon: "👥",
      content: "Для новичков и опытных трейдеров, готовых протестировать стратегии майнинга Bitcoin."
    },
    {
      title: "Зачем?",
      icon: "💎",
      content: "Изучите основы майнинга в безопасной среде и получите практический опыт управления майнинг-фермой."
    },
    {
      title: "Как?",
      icon: "🚀",
      content: "Начните с базового оборудования и расширяйте свою ферму, покупая более мощные ASIC-майнеры."
    }
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <div className={`w-28 h-28 rounded-2xl overflow-hidden ${
            isDark ? 'neu-card-lg animate-float' : 'shadow-2xl'
          }`}>
            <img 
              src={LOGO_PATH} 
              alt="ECOS Mining Game Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
          isDark ? 'text-orange-500 tracking-wider' : 'bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent'
        }`}>
          {isDark ? 'ECOS MINING' : 'ECOS Mining Game'}
        </h1>
        <p className={`text-lg ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
          Постройте свою майнинг-империю
        </p>
      </div>

      {/* 4 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {ecosCards.map((card, index) => (
          <div 
            key={index} 
            className={`p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDark 
                ? 'neu-card' 
                : 'bg-white rounded-2xl shadow-lg hover:shadow-xl'
            }`}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{card.icon}</span>
              <h3 className={`text-xl font-bold ${
                isDark ? 'text-orange-500' : 'text-orange-600'
              }`}>
                {card.title}
              </h3>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-gray-600'}`}>
              {card.content}
            </p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className={`p-8 mb-8 ${isDark ? 'neu-card-lg' : 'bg-white rounded-2xl shadow-xl'}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${
          isDark ? 'text-orange-500' : 'text-orange-600'
        }`}>
          Статистика платформы
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '1000+', label: 'Игроков' },
            { value: '24/7', label: 'Онлайн' },
            { value: '100%', label: 'Безопасно' }
          ].map((stat, i) => (
            <div key={i} className={`text-center p-4 ${isDark ? 'neu-inset' : 'bg-gray-50 rounded-xl'}`}>
              <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                {stat.value}
              </div>
              <div className={`text-xs ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className={`text-center p-8 ${isDark ? 'neu-card neu-glow-orange' : 'bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl'}`}>
        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-orange-500' : 'text-white'}`}>
          Готовы начать?
        </h3>
        <p className={`mb-6 ${isDark ? 'text-neutral-400' : 'text-orange-100'}`}>
          Присоединяйтесь к сообществу майнеров
        </p>
        <button className="neu-btn-lg">
          <span>Start Game</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
