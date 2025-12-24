import { Address } from '@ton/core';

/**
 * Конвертирует HEX адрес в user-friendly формат TON
 * @param hexAddress - HEX адрес для конвертации
 * @returns user-friendly адрес (формат UQ/EQ)
 */
export const hexToUserFriendlyAddress = (hexAddress: string): string => {
  console.log('🔧 hexToUserFriendlyAddress вызвана с адресом:', hexAddress);
  console.log('📏 Исходная длина адреса:', hexAddress.length);
  
  try {
    // Очищаем адрес от пробелов и переносов строк
    const cleanAddress = hexAddress.trim();
    console.log('🧹 Очищенный адрес:', cleanAddress);
    console.log('📏 Длина после очистки:', cleanAddress.length);
    
    // Если адрес уже в user-friendly формате (начинается с UQ/EQ), возвращаем как есть
    if (cleanAddress.startsWith('UQ') || cleanAddress.startsWith('EQ')) {
      console.log('✅ Адрес уже в user-friendly формате');
      return cleanAddress;
    }
    
    // Если адрес в raw формате (содержит ':'), парсим и конвертируем
    if (cleanAddress.includes(':')) {
      console.log('🔄 Адрес в raw формате, конвертируем...');
      const address = Address.parse(cleanAddress);
      const result = address.toString({ bounceable: true, testOnly: false });
      console.log('✅ Конвертировано:', result);
      return result;
    }
    
    // Если это чистый HEX адрес (64-66 символов - допускаем небольшие вариации), конвертируем через библиотеку TON
    if (cleanAddress.length >= 64 && cleanAddress.length <= 66 && /^[0-9a-fA-F]+$/.test(cleanAddress)) {
      console.log('🔄 Это HEX адрес, начинаем конвертацию...');
      
      // Определяем правильный HEX адрес (ровно 64 символа)
      let hexOnly;
      if (cleanAddress.length === 65 && cleanAddress.startsWith('0')) {
        // Если 65 символов и начинается с '0', убираем первый символ (это лишний ноль)
        hexOnly = cleanAddress.slice(1);
        console.log('✂️ Убран лишний "0" в начале, осталось 64 символа:', hexOnly);
      } else if (cleanAddress.length === 64) {
        // Если ровно 64 - используем как есть
        hexOnly = cleanAddress;
        console.log('✅ Адрес ровно 64 символа:', hexOnly);
      } else {
        // В остальных случаях берем последние 64 символа
        hexOnly = cleanAddress.slice(-64);
        console.log('✂️ Взяты последние 64 символа:', hexOnly);
      }
      
      console.log('📦 Проверка наличия Address:', typeof Address);
      console.log('📦 Проверка parseRaw:', typeof Address.parseRaw);
      
      const rawFormat = `0:${hexOnly}`;
      console.log('📝 Raw формат для парсинга:', rawFormat);
      
      // Создаем Address объект из raw формата (workchain 0 для основной сети)
      const address = Address.parseRaw(rawFormat);
      console.log('✅ Address объект создан:', address);
      
      // Конвертируем в user-friendly формат (bounceable, mainnet)
      const userFriendly = address.toString({ 
        bounceable: true,  // Стандартный формат для кошельков
        testOnly: false    // mainnet (не testnet)
      });
      
      console.log('✅ Конвертация HEX → User-friendly:', hexOnly, '→', userFriendly);
      return userFriendly;
    }
    
    // Если формат неизвестен, возвращаем как есть
    console.warn('⚠️ Неизвестный формат адреса (длина:', cleanAddress.length, '):', cleanAddress);
    console.warn('⚠️ Проверка HEX:', /^[0-9a-fA-F]+$/.test(cleanAddress));
    return cleanAddress;
    
  } catch (e: any) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА конвертации адреса:', e);
    console.error('❌ Стек ошибки:', e.stack);
    console.error('❌ Возвращаем исходный адрес');
    return hexAddress;
  }
};

/**
 * Получает курс TON к доллару США
 * @returns курс TON/USD или null в случае ошибки
 */
export const getTonUsdRate = async (): Promise<number | null> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data['the-open-network']?.usd || null;
  } catch (error) {
    console.error('Ошибка получения курса TON/USD:', error);
    return null;
  }
};

/**
 * Проверяет баланс TON кошелька через различные API
 * @param walletAddress - адрес кошелька (может быть в любом формате)
 * @returns баланс в TON или null в случае ошибки
 */
export const checkWalletBalance = async (walletAddress: string): Promise<string | null> => {
  try {
    console.log('🔍 ========== ПРОВЕРКА БАЛАНСА TON ==========');
    console.log('📍 Исходный адрес:', walletAddress);
    
    // Конвертируем HEX адрес в user-friendly формат, если необходимо
    let userFriendlyAddress;
    try {
      userFriendlyAddress = hexToUserFriendlyAddress(walletAddress);
      console.log('✅ КОНВЕРТАЦИЯ ЗАВЕРШЕНА');
    } catch (convError) {
      console.error('❌ ОШИБКА ПРИ ВЫЗОВЕ hexToUserFriendlyAddress:', convError);
      userFriendlyAddress = walletAddress; // Используем исходный адрес
    }
    
    console.log('🔄 Конвертированный адрес:', userFriendlyAddress);
    
    // Пробуем несколько API для максимальной надежности
    let balanceInTon = '0.00';
    let apiUsed = '';
    
    // Метод 1: TON API (tonapi.io) - современный и надежный
    try {
      console.log('🔄 Попытка 1: TON API (tonapi.io)...');
      const tonapiUrl = `https://tonapi.io/v2/accounts/${userFriendlyAddress}`;
      
      const tonapiResponse = await fetch(tonapiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (tonapiResponse.ok) {
        const tonapiData = await tonapiResponse.json();
        console.log('📦 Ответ TON API:', tonapiData);
        
        if (tonapiData.balance !== undefined) {
          // TON API возвращает баланс в нанотонах
          balanceInTon = (tonapiData.balance / 1_000_000_000).toFixed(2);
          apiUsed = 'TON API';
          console.log('✅ TON API успешно вернул баланс:', balanceInTon, 'TON');
        }
      }
    } catch (e) {
      console.log('⚠️ TON API недоступен:', e);
    }
    
    // Метод 2: TON Center API v2 (резервный)
    if (balanceInTon === '0.00') {
      try {
        console.log('🔄 Попытка 2: TON Center API v2...');
        const toncenterUrl = `https://toncenter.com/api/v2/getAddressBalance?address=${userFriendlyAddress}`;
        
        const toncenterResponse = await fetch(toncenterUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (toncenterResponse.ok) {
          const toncenterData = await toncenterResponse.json();
          console.log('📦 Ответ TON Center v2:', toncenterData);
          
          if (toncenterData.ok && toncenterData.result !== undefined) {
            balanceInTon = (toncenterData.result / 1_000_000_000).toFixed(2);
            apiUsed = 'TON Center API v2';
            console.log('✅ TON Center API v2 успешно вернул баланс:', balanceInTon, 'TON');
          }
        }
      } catch (e) {
        console.log('⚠️ TON Center API v2 недоступен:', e);
      }
    }
    
    // Метод 3: TON Center API v3 (альтернативный)
    if (balanceInTon === '0.00') {
      try {
        console.log('🔄 Попытка 3: TON Center API v3...');
        const v3Url = `https://toncenter.com/api/v3/account?address=${userFriendlyAddress}`;
        
        const v3Response = await fetch(v3Url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (v3Response.ok) {
          const v3Data = await v3Response.json();
          console.log('📦 Ответ TON Center v3:', v3Data);
          
          if (v3Data.balance !== undefined) {
            balanceInTon = (v3Data.balance / 1_000_000_000).toFixed(2);
            apiUsed = 'TON Center API v3';
            console.log('✅ TON Center v3 успешно вернул баланс:', balanceInTon, 'TON');
          }
        }
      } catch (e) {
        console.log('⚠️ TON Center v3 недоступен:', e);
      }
    }
    
    console.log('🎯 Итоговый баланс:', balanceInTon, 'TON');
    console.log('📡 Использован API:', apiUsed || 'Не удалось получить данные');
    console.log('🔍 ========== КОНЕЦ ПРОВЕРКИ ==========');
    
    if (apiUsed === '' && balanceInTon === '0.00') {
      throw new Error('Не удалось получить баланс ни от одного API. Проверьте формат адреса.');
    }
    
    return balanceInTon;
    
  } catch (e: any) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', e);
    return null;
  }
};



