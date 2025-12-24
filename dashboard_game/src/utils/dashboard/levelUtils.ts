/**
 * Определение уровней и их порогов
 */
export const getLevelThresholds = (level: number) => {
  const thresholds: { [key: number]: { current: number; next: number } } = {
    0: { current: 234, next: 936 },           // 234 Th (1 ASIC) -> 936 Th (4 ASIC)
    1: { current: 936, next: 4914 },         // 936 Th (4 ASIC) -> 4914 Th (21 ASIC)
    2: { current: 4914, next: 14976 },        // 4914 Th (21 ASIC) -> 14976 Th (64 ASIC)
    3: { current: 14976, next: 24804 },       // 14976 Th (64 ASIC) -> 24804 Th (106 ASIC)
    4: { current: 24804, next: 49842 },       // 24804 Th (106 ASIC) -> 49842 Th (213 ASIC)
    5: { current: 49842, next: 99918 },       // 49842 Th (213 ASIC) -> 99918 Th (427 ASIC)
    6: { current: 99918, next: 249912 },       // 99918 Th (427 ASIC) -> 249912 Th (1068 ASIC)
    7: { current: 249912, next: 499824 },      // 249912 Th (1068 ASIC) -> 499824 Th (2136 ASIC)
    8: { current: 499824, next: 999882 },     // 499824 Th (2136 ASIC) -> 999882 Th (4273 ASIC)
    9: { current: 999882, next: 7999992 },    // 999882 Th (4273 ASIC) -> 7999992 Th (34188 ASIC)
    10: { current: 7999992, next: 1000000000 } // 7999992 Th (34188 ASIC) -> 1 Eh (1,000,000,000 Th)
  };
  return thresholds[level] || { current: 0, next: 0 };
};

/**
 * Функция для определения уровня пользователя по Th
 * ВАЖНО: Эта логика должна совпадать с SQL запросом в n8n!
 */
export const getUserLevel = (th: number): number | null => {
  // Пользователи без ASIC (th < 234) не имеют уровня
  if (th < 234) return null;
  
  // Уровень 0: от 234 Th (1 ASIC) до 935 Th включительно
  if (th >= 234 && th <= 935) return 0;
  // Уровень 1: от 936 Th (4 ASIC) до 4913 Th включительно
  if (th >= 936 && th <= 4913) return 1;
  // Уровень 2: от 4914 Th (21 ASIC) до 14975 Th включительно
  if (th >= 4914 && th <= 14975) return 2;
  // Уровень 3: от 14976 Th (64 ASIC) до 24803 Th включительно
  if (th >= 14976 && th <= 24803) return 3;
  // Уровень 4: от 24804 Th (106 ASIC) до 49841 Th включительно
  if (th >= 24804 && th <= 49841) return 4;
  // Уровень 5: от 49842 Th (213 ASIC) до 99917 Th включительно
  if (th >= 49842 && th <= 99917) return 5;
  // Уровень 6: от 99918 Th (427 ASIC) до 249911 Th включительно
  if (th >= 99918 && th <= 249911) return 6;
  // Уровень 7: от 249912 Th (1068 ASIC) до 499823 Th включительно
  if (th >= 249912 && th <= 499823) return 7;
  // Уровень 8: от 499824 Th (2136 ASIC) до 999881 Th включительно
  if (th >= 499824 && th <= 999881) return 8;
  // Уровень 9: от 999882 Th (4273 ASIC) до 7999991 Th включительно
  if (th >= 999882 && th <= 7999991) return 9;
  // Уровень 10: от 7999992 Th (34188 ASIC) и выше
  if (th >= 7999992) return 10;
  
  return null;
};


