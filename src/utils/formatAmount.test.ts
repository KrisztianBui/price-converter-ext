import { describe, expect, test } from 'vitest';
import { formatAmount, formatFixedAmount } from './formatAmount';

describe('formatAmount', () => {
  describe('standard currencies (2 decimal places)', () => {
    test('formats a whole number with 2 decimals', () => {
      expect(formatAmount(100, 'USD')).toBe('100.00');
    });

    test('formats a decimal with 2 decimal places', () => {
      expect(formatAmount(9.2, 'EUR')).toBe('9.20');
    });

    test('formats a large number with thousands separator', () => {
      expect(formatAmount(1000, 'GBP')).toBe('1,000.00');
    });
  });

  describe('zero-decimal currencies (0 decimal places)', () => {
    test('formats JPY with no decimals', () => {
      expect(formatAmount(150, 'JPY')).toBe('150');
    });

    test('formats HUF with no decimals', () => {
      expect(formatAmount(370, 'HUF')).toBe('370');
    });

    test('rounds to integer for zero-decimal currency', () => {
      expect(formatAmount(1000, 'JPY')).toBe('1,000');
    });

    test('rounds fractional value to integer for zero-decimal currency', () => {
      expect(formatAmount(150.7, 'JPY')).toBe('151');
    });
  });

  describe('case insensitivity', () => {
    test('treats lowercase currency code as zero-decimal when applicable', () => {
      expect(formatAmount(100, 'jpy')).toBe('100');
    });

    test('treats lowercase standard currency correctly', () => {
      expect(formatAmount(9.5, 'usd')).toBe('9.50');
    });
  });
});

describe('formatFixedAmount', () => {
  test('formats 1 as plain integer', () => {
    expect(formatFixedAmount(1)).toBe('1');
  });

  test('formats 1000 with comma separator', () => {
    expect(formatFixedAmount(1000)).toBe('1,000');
  });

  test('formats 500 without separator', () => {
    expect(formatFixedAmount(500)).toBe('500');
  });
});
