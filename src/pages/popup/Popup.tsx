import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@src/components/ui/button';
import { CurrencyInput, CurrencyOption } from '@src/components/ui/currency-input';
import { useExchangeRate } from '@src/hooks/useExchangeRate';

const CURRENCIES: CurrencyOption[] = [
  { value: 'USD', label: 'US Dollar',        symbol: '$'   },
  { value: 'EUR', label: 'Euro',              symbol: '€'   },
  { value: 'GBP', label: 'British Pound',    symbol: '£'   },
  { value: 'JPY', label: 'Japanese Yen',      symbol: '¥'   },
  { value: 'HUF', label: 'Hungarian Forint',  symbol: 'Ft'  },
  { value: 'CHF', label: 'Swiss Franc',       symbol: 'Fr'  },
  { value: 'CAD', label: 'Canadian Dollar',   symbol: 'CA$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'CNY', label: 'Chinese Yuan',      symbol: '¥'   },
  { value: 'SEK', label: 'Swedish Krona',     symbol: 'kr'  },
  { value: 'NOK', label: 'Norwegian Krone',   symbol: 'kr'  },
  { value: 'DKK', label: 'Danish Krone',      symbol: 'kr'  },
  { value: 'PLN', label: 'Polish Zloty',      symbol: 'zł'  },
  { value: 'CZK', label: 'Czech Koruna',      symbol: 'Kč'  },
  { value: 'RON', label: 'Romanian Leu',      symbol: 'lei' },
];

export default function Popup() {
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [fromCurrency, setFromCurrency] = useState<CurrencyOption>(CURRENCIES[0]);
  const [toCurrency, setToCurrency] = useState<CurrencyOption>(CURRENCIES[1]);

  useEffect(() => {
    if (typeof chrome === 'undefined') return;
    chrome.storage.session.get('pendingConversion', (data) => {
      const pending = data.pendingConversion as { amount: number | null; currency: string | null } | undefined;
      if (!pending) return;

      const matched = CURRENCIES.find((c) => c.value === pending.currency) ?? CURRENCIES[0];
      setFromCurrency(matched);
      if (pending.amount !== null) {
        setAmount(pending.amount);
      }

      chrome.storage.session.remove('pendingConversion');
    });
  }, []);

  const { rate, loading, error } = useExchangeRate(fromCurrency.value, toCurrency.value);

  const result = useMemo(
    () => (amount !== undefined && rate !== undefined ? amount * rate : undefined),
    [amount, rate],
  );

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col gap-4 p-5">
      <h1 className="text-lg font-semibold tracking-tight">Price Converter</h1>

      <div className="flex items-center gap-2">
        <CurrencyInput
          className="flex-1"
          amount={amount}
          onAmountChange={setAmount}
          currency={fromCurrency}
          onCurrencyChange={setFromCurrency}
          currencies={CURRENCIES}
          placeholder="0"
        />

        <Button variant="outline" size="icon" onClick={handleSwap} aria-label="Swap currencies">
          <ArrowLeftRight />
        </Button>
      </div>

      <CurrencyInput
        amount={result}
        onAmountChange={() => {}}
        currency={toCurrency}
        onCurrencyChange={setToCurrency}
        currencies={CURRENCIES}
        placeholder={loading ? 'Loading…' : error ? 'Error' : '0'}
        disabled={loading}
      />
    </div>
  );
}
