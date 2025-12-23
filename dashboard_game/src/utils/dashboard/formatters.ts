/**
 * Утилиты для форматирования чисел
 */

/**
 * Форматирует число с учетом локали
 * @param value - число для форматирования
 * @param fractionDigits - количество знаков после запятой (по умолчанию 2)
 * @returns отформатированная строка
 */
export const numberFormat = (value: number, fractionDigits = 2) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: fractionDigits }).format(value);

/**
 * Форматирует число для полного отображения (без округления)
 * @param value - число или строка для форматирования
 * @returns отформатированная строка
 */
export const formatFullNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  
  // Если число очень маленькое (< 0.0001), показываем все знаки
  if (Math.abs(num) > 0 && Math.abs(num) < 0.0001) {
    return num.toFixed(20).replace(/\.?0+$/, '');
  }
  
  // Для обычных чисел показываем до 8 знаков после запятой
  return num.toFixed(8).replace(/\.?0+$/, '');
};

