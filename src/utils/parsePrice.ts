import {parseNumber} from "@src/utils/parseNumber";

const SYMBOL_TO_CURRENCY: Record<string, string> = {
  'A$':  'AUD',
  'C$':  'CAD',
  'HK$': 'HKD',
  'NZ$': 'NZD',
  'S$':  'SGD',
  '$':   'USD',
  '€':   'EUR',
  '£':   'GBP',
  '¥':   'JPY',
  '₹':   'INR',
  '₩':   'KRW',
  '₽':   'RUB',
  '₿':   'BTC',
  'Fr':  'CHF',
};

const CURRENCY_CODES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'KRW', 'RUB', 'BTC',
  'AUD', 'CAD', 'HKD', 'NZD', 'SGD', 'CHF', 'SEK', 'NOK', 'DKK',
  'MXN', 'BRL', 'ZAR', 'TRY', 'PLN', 'THB', 'IDR', 'MYR', 'PHP',
  'CZK', 'HUF', 'RON', 'BGN', 'ILS', 'AED', 'SAR',
]);

export interface ParsedPrice {
  amount: number;
  currency: string;
}

const PRICE_RE = (() => {
  const symbolPat = Object.keys(SYMBOL_TO_CURRENCY)
    .sort((a, b) => b.length - a.length)
    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  const codePat = [...CURRENCY_CODES].join('|');

  return new RegExp(
    `^(?:(${symbolPat}|${codePat})\\s*)?` +
    `(\\d[\\d\\s,.']*\\d|\\d)` +
    `(?:\\s*(${symbolPat}|${codePat}))?$`,
    'i',
  );
})();

export function parsePrice(text: string): ParsedPrice | null {
  const match = text.match(PRICE_RE);
  if (!match) return null;

  const rawCurrency = match[1] ?? match[3];
  if (!rawCurrency) return null;

  const currency = resolveCurrency(rawCurrency);
  const amount = parseNumber(match[2]);
  if (amount === null) return null;

  return { amount, currency };
}

function resolveCurrency(raw: string): string {
  const upper = raw.toUpperCase();
  if (CURRENCY_CODES.has(upper)) return upper;
  return SYMBOL_TO_CURRENCY[raw] ?? SYMBOL_TO_CURRENCY[upper] ?? upper;
}

