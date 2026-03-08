// src/hooks/useExchangeRate.ts
import { useEffect, useState } from 'react';

interface ExchangeRateState {
  rate: number | undefined;
  loading: boolean;
  error: string | null;
}

export function useExchangeRate(from: string, to: string): ExchangeRateState {
  const [state, setState] = useState<ExchangeRateState>({
    rate: undefined,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (from === to) {
      setState({ rate: 1, loading: false, error: null });
      return;
    }

    let cancelled = false;

    setState(s => ({ ...s, loading: true, error: null }));

    fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ rates: Record<string, number> }>;
      })
      .then(data => {
        if (!cancelled) {
          setState({ rate: data.rates[to], loading: false, error: null });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState({ rate: undefined, loading: false, error: err.message });
        }
      });

    return () => { cancelled = true; };
  }, [from, to]);

  return state;
}
