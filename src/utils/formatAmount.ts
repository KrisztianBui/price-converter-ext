const ZERO_DECIMAL_CURRENCIES = new Set([
  'JPY', 'KRW', 'IDR', 'VND', 'HUF', 'CLP', 'BIF', 'GNF',
  'MGA', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF',
]);

export function formatAmount(value: number, currency: string): string {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase());
  return value.toLocaleString('en-US', {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  });
}

export function formatFixedAmount(value: number): string {
  return value.toLocaleString('en-US');
}
