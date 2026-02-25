import { describe, expect, test } from 'vitest';
import { parsePrice } from './parsePrice';

describe('parsePrice', () => {
    describe('currency symbols as prefix', () => {
        test('parses $ as USD', () => {
            expect(parsePrice('$42')).toEqual({ amount: 42, currency: 'USD' });
        });

        test('parses € as EUR', () => {
            expect(parsePrice('€9.99')).toEqual({ amount: 9.99, currency: 'EUR' });
        });

        test('parses £ as GBP', () => {
            expect(parsePrice('£100')).toEqual({ amount: 100, currency: 'GBP' });
        });

        test('parses ¥ as JPY', () => {
            expect(parsePrice('¥1000')).toEqual({ amount: 1000, currency: 'JPY' });
        });

        test('parses multi-char symbol A$ as AUD', () => {
            expect(parsePrice('A$50')).toEqual({ amount: 50, currency: 'AUD' });
        });

        test('parses multi-char symbol HK$ as HKD', () => {
            expect(parsePrice('HK$200')).toEqual({ amount: 200, currency: 'HKD' });
        });

        test('parses Fr as CHF', () => {
            expect(parsePrice('Fr 1234')).toEqual({ amount: 1234, currency: 'CHF' });
        });

        test('allows optional whitespace between prefix symbol and amount', () => {
            expect(parsePrice('$ 42')).toEqual({ amount: 42, currency: 'USD' });
        });
    });

    describe('currency symbols as suffix', () => {
        test('parses € as suffix', () => {
            expect(parsePrice('9.99€')).toEqual({ amount: 9.99, currency: 'EUR' });
        });

        test('parses ¥ as suffix', () => {
            expect(parsePrice('1000¥')).toEqual({ amount: 1000, currency: 'JPY' });
        });

        test('allows optional whitespace before suffix symbol', () => {
            expect(parsePrice('9.99 €')).toEqual({ amount: 9.99, currency: 'EUR' });
        });
    });

    describe('ISO currency codes as prefix', () => {
        test('parses USD code', () => {
            expect(parsePrice('USD 1234')).toEqual({ amount: 1234, currency: 'USD' });
        });

        test('parses EUR code', () => {
            expect(parsePrice('EUR 9.99')).toEqual({ amount: 9.99, currency: 'EUR' });
        });

        test('parses code case-insensitively', () => {
            expect(parsePrice('usd 99')).toEqual({ amount: 99, currency: 'USD' });
        });
    });

    describe('ISO currency codes as suffix', () => {
        test('parses USD code as suffix', () => {
            expect(parsePrice('1234 USD')).toEqual({ amount: 1234, currency: 'USD' });
        });

        test('parses EUR code as suffix', () => {
            expect(parsePrice('9.99 EUR')).toEqual({ amount: 9.99, currency: 'EUR' });
        });
    });

    describe('number formats', () => {
        test('parses comma as thousands separator', () => {
            expect(parsePrice('$1,234')).toEqual({ amount: 1234, currency: 'USD' });
        });

        test('parses English format with comma thousands and dot decimal', () => {
            expect(parsePrice('$1,234.56')).toEqual({ amount: 1234.56, currency: 'USD' });
        });

        test('parses European format with dot thousands and comma decimal', () => {
            expect(parsePrice('€1.234,56')).toEqual({ amount: 1234.56, currency: 'EUR' });
        });

        test('parses space as thousands separator', () => {
            expect(parsePrice('€1 234')).toEqual({ amount: 1234, currency: 'EUR' });
        });
    });

    describe('returns null', () => {
        test('returns null when no currency present', () => {
            expect(parsePrice('1234')).toBeNull();
        });

        test('returns null for arbitrary text', () => {
            expect(parsePrice('hello world')).toBeNull();
        });

        test('returns null for currency symbol without amount', () => {
            expect(parsePrice('$')).toBeNull();
        });

        test('returns null for currency code without amount', () => {
            expect(parsePrice('USD')).toBeNull();
        });
    });
});
