import Papa from 'papaparse';

/**
 * Экспортирует данные в CSV файл
 * @param data - массив объектов для экспорта
 * @param filename - имя файла (без расширения)
 * @param columns - опциональный массив колонок для экспорта (если не указан, используются все ключи первого объекта)
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export',
  columns?: string[]
): void => {
  if (!data || data.length === 0) {
    console.warn('Нет данных для экспорта');
    return;
  }

  // Определяем колонки
  const exportColumns = columns || Object.keys(data[0]);

  // Фильтруем данные только по нужным колонкам
  const filteredData = data.map(row => {
    const filteredRow: Record<string, any> = {};
    exportColumns.forEach(col => {
      filteredRow[col] = row[col] ?? '';
    });
    return filteredRow;
  });

  // Конвертируем в CSV
  const csv = Papa.unparse(filteredData, {
    header: true,
    delimiter: ',',
    newline: '\n',
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
  });

  // Создаем Blob и скачиваем файл
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM для правильного отображения кириллицы в Excel
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Освобождаем память
  URL.revokeObjectURL(url);
};

/**
 * Экспортирует данные в CSV с кастомными заголовками колонок
 * @param data - массив объектов для экспорта
 * @param columnMapping - объект маппинга: { 'ключ_в_данных': 'Заголовок_в_CSV' }
 * @param filename - имя файла (без расширения)
 */
export const exportToCSVWithCustomHeaders = <T extends Record<string, any>>(
  data: T[],
  columnMapping: Record<string, string>,
  filename: string = 'export'
): void => {
  if (!data || data.length === 0) {
    console.warn('Нет данных для экспорта');
    return;
  }

  // Преобразуем данные с кастомными заголовками
  const mappedData = data.map(row => {
    const mappedRow: Record<string, any> = {};
    Object.keys(columnMapping).forEach(key => {
      mappedRow[columnMapping[key]] = row[key] ?? '';
    });
    return mappedRow;
  });

  // Конвертируем в CSV
  const csv = Papa.unparse(mappedData, {
    header: true,
    delimiter: ',',
    newline: '\n',
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
  });

  // Создаем Blob и скачиваем файл
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM для правильного отображения кириллицы в Excel
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Освобождаем память
  URL.revokeObjectURL(url);
};


