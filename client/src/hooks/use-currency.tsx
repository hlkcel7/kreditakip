import { useState, useContext, createContext } from "react";
import { useQuery } from "@tanstack/react-query";

interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  currencies: Currency[];
  formatCurrency: (amount: number, currency?: string) => string;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => Promise<number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const defaultCurrencies: Currency[] = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
  { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'IQD', name: 'Irak Dinarı', symbol: 'IQD' },
  { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£' },
];

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  const { data: exchangeRates } = useQuery({
    queryKey: ['/api/exchange-rates'],
  });

  const formatCurrency = (amount: number, currency?: string) => {
    const currencyCode = currency || selectedCurrency;
    const currencyInfo = defaultCurrencies.find(c => c.code === currencyCode);
    
    const formattedAmount = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${formattedAmount} ${currencyInfo?.symbol || currencyCode}`;
  };

  const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
    if (fromCurrency === toCurrency) return amount;
    
    // Find exchange rate
    const rate = exchangeRates?.find((r: any) => 
      r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );
    
    if (rate) {
      return amount * parseFloat(rate.rate);
    }
    
    // If direct rate not found, try inverse
    const inverseRate = exchangeRates?.find((r: any) => 
      r.fromCurrency === toCurrency && r.toCurrency === fromCurrency
    );
    
    if (inverseRate) {
      return amount / parseFloat(inverseRate.rate);
    }
    
    // Default to original amount if no rate found
    return amount;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      currencies: defaultCurrencies,
      formatCurrency,
      convertCurrency,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // Return default implementation when not wrapped in provider
    return {
      selectedCurrency: 'TRY',
      setSelectedCurrency: () => {},
      currencies: defaultCurrencies,
      formatCurrency: (amount: number, currency?: string) => {
        const currencyCode = currency || 'TRY';
        const currencyInfo = defaultCurrencies.find(c => c.code === currencyCode);
        const formattedAmount = new Intl.NumberFormat('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
        return `${formattedAmount} ${currencyInfo?.symbol || currencyCode}`;
      },
      convertCurrency: async (amount: number) => amount,
    };
  }
  return context;
}
