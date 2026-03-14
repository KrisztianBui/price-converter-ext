import { useEffect, useMemo, useState } from 'react';
import {ArrowLeftRight} from 'lucide-react';
import { Button } from '@src/components/ui/button';
import { CurrencyInput, CurrencyOption } from '@src/components/ui/currency-input';
import { useExchangeRate } from '@src/hooks/useExchangeRate';
import { ReferenceTable } from '@src/components/ui/reference-table';
import * as React from 'react';

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
    setAmount(result)
  };

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-white">Price Converter</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        <div className="flex flex-col items-center gap-2">
          <CurrencyInput
            className="w-full"
            amount={amount}
            onAmountChange={setAmount}
            currency={fromCurrency}
            onCurrencyChange={setFromCurrency}
            currencies={CURRENCIES}
            placeholder="1"
            rightAdornment={
              <Button variant="ghost" size="icon" onClick={handleSwap}>
                <ArrowLeftRight />
              </Button>
            }
          />

        <CurrencyInput
          className="w-full"
          amount={result}
          onAmountChange={() => {}}
          currency={toCurrency}
          onCurrencyChange={setToCurrency}
          currencies={CURRENCIES}
          placeholder={loading ? 'Loading…' : error ? 'Error' : `${rate}`}
          disabled={loading}
          readOnly
        />
        </div>

        <ReferenceTable
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          rate={rate}
          error={error}
        />
      </div>
    </div>
  );
}
