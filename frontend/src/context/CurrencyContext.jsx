import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_CURRENCIES = {
  SAR: { code: 'SAR', symbol: 'SAR', rate: 3.75, name: 'Saudi Riyal', flag: '🇸🇦', isPegged: true },
  USD: { code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar', flag: '🇺🇸', isPegged: true },
  AED: { code: 'AED', symbol: 'AED', rate: 3.67, name: 'UAE Dirham', flag: '🇦🇪', isPegged: true },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', flag: '🇪🇺', isPegged: false },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, name: 'British Pound', flag: '🇬🇧', isPegged: false },
  QAR: { code: 'QAR', symbol: 'QAR', rate: 3.64, name: 'Qatari Riyal', flag: '🇶🇦', isPegged: true },
  KWD: { code: 'KWD', symbol: 'KWD', rate: 0.31, name: 'Kuwaiti Dinar', flag: '🇰🇼', isPegged: false },
};

const CurrencyContext = createContext();

const detectUserCurrency = () => {
  try {
    const saved = localStorage.getItem('tayara_display_currency');
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      return saved;
    }

    const tz = Intl?.DateTimeFormat?.()?.resolvedOptions()?.timeZone || '';
    const lang = (navigator?.language || '').toLowerCase();

    if (tz.includes('Riyadh') || lang === 'ar-sa') return 'SAR';
    if (tz.includes('Dubai') || lang === 'ar-ae') return 'AED';
    if (tz.includes('Qatar') || tz.includes('Doha') || lang === 'ar-qa') return 'QAR';
    if (tz.includes('Kuwait') || lang === 'ar-kw') return 'KWD';
    if (tz.includes('London') || lang === 'en-gb') return 'GBP';
    if (tz.startsWith('Europe/')) return 'EUR';

    // Default to SAR for Middle East timezones, otherwise USD
    if (tz.startsWith('Asia/')) return 'SAR';

    return 'USD';
  } catch (e) {
    return 'USD';
  }
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState('USD');

  useEffect(() => {
    const detected = detectUserCurrency();
    setSelectedCurrencyState(detected);
  }, []);

  const setSelectedCurrency = (code) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setSelectedCurrencyState(code);
      try {
        localStorage.setItem('tayara_display_currency', code);
      } catch (e) {
        // ignore
      }
    }
  };

  const formatPrice = (usdAmount) => {
    const num = parseFloat(usdAmount) || 0;
    const usdFormatted = `$${num.toFixed(2)}`;

    if (selectedCurrency === 'USD') {
      return {
        usd: usdFormatted,
        usdNum: num,
        local: usdFormatted,
        localNum: num,
        localCode: 'USD',
        approxText: '',
        fullDisplay: `${usdFormatted} USD`,
      };
    }

    const currMeta = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.USD;
    const rate = currMeta.rate || 1.0;
    const localVal = (num * rate).toFixed(2);
    const localFormatted = currMeta.symbol === '€' || currMeta.symbol === '£'
      ? `${currMeta.symbol}${localVal}`
      : `${localVal} ${selectedCurrency}`;

    return {
      usd: usdFormatted,
      usdNum: num,
      local: localFormatted,
      localNum: parseFloat(localVal),
      localCode: selectedCurrency,
      approxText: `≈ ${localFormatted}`,
      fullDisplay: `${usdFormatted} (≈ ${localFormatted})`,
    };
  };

  const convertToLocal = (usdAmount) => {
    const num = parseFloat(usdAmount) || 0;
    const currMeta = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.USD;
    return (num * (currMeta.rate || 1.0)).toFixed(2);
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        supportedCurrencies: SUPPORTED_CURRENCIES,
        formatPrice,
        convertToLocal,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
