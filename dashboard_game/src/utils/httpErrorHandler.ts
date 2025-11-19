// Утилита для обработки ошибок HTTP ответов
export const handleHttpError = async (response: Response): Promise<string> => {
  const contentType = response.headers.get('content-type') || '';
  let errorText = '';
  let errorData = null;
  
  try {
    if (contentType.includes('application/json')) {
      errorData = await response.json();
      errorText = errorData.message || errorData.error || JSON.stringify(errorData);
    } else {
      errorText = await response.text();
      // Если это HTML, не показываем весь HTML в сообщении
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        errorText = `Сервер вернул HTML страницу вместо данных. Возможно, webhook неактивен или произошла ошибка на сервере.`;
        console.error('❌ Response error (HTML):', errorText.substring(0, 500));
      } else {
        // Пытаемся найти JSON в тексте
        const jsonMatch = errorText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            errorData = JSON.parse(jsonMatch[0]);
            errorText = errorData.message || errorData.error || 'Ошибка сервера';
          } catch (e) {
            // Оставляем оригинальный текст, но ограничиваем длину
            if (errorText.length > 500) {
              errorText = errorText.substring(0, 500) + '...';
            }
          }
        } else if (errorText.length > 500) {
          errorText = errorText.substring(0, 500) + '...';
        }
      }
    }
  } catch (parseError) {
    console.error('❌ Ошибка парсинга ответа:', parseError);
    errorText = `Ошибка ${response.status}: ${response.statusText}`;
  }
  
  return errorText;
};

