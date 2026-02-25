import { describe, expect, test } from 'vitest';
import { parseNumber } from './parseNumber';

describe('parseNumber', () => {
    describe('plain numbers', () => {
        test('parses integer with no separators', () => {
            expect(parseNumber('1234')).toBe(1234);
        });

        test('parses decimal with no separators', () => {
            expect(parseNumber('12.34')).toBe(12.34);
        });

        test('returns null for non-numeric string', () => {
            expect(parseNumber('abc')).toBeNull();
        });

        test('returns null for empty string', () => {
            expect(parseNumber('')).toBeNull();
        });
    });

    describe('whitespace handling', () => {
        test('strips spaces and parses plain number', () => {
            expect(parseNumber('1 234')).toBe(1234);
        });

        test('strips leading/trailing whitespace', () => {
            expect(parseNumber(' 42 ')).toBe(42);
        });
    });

    describe('single comma', () => {
        test('treats comma as decimal separator when fewer than 3 decimal digits', () => {
            expect(parseNumber('1,5')).toBe(1.5);
        });

        test('treats comma as thousands separator when exactly 3 decimal digits', () => {
            expect(parseNumber('1,234')).toBe(1234);
        });
    });

    describe('single dot', () => {
        test('treats dot as decimal separator when fewer than 3 decimal digits', () => {
            expect(parseNumber('1.5')).toBe(1.5);
        });

        test('treats dot as thousands separator when exactly 3 decimal digits', () => {
            expect(parseNumber('1.234')).toBe(1234);
        });
    });

    describe('both comma and dot present', () => {
        test('parses English format (dot as decimal, comma as thousands)', () => {
            expect(parseNumber('1,234.56')).toBe(1234.56);
        });

        test('parses European format (comma as decimal, dot as thousands)', () => {
            expect(parseNumber('1.234,56')).toBe(1234.56);
        });
    });

    describe('multiple separators of same kind', () => {
        test('strips multiple commas (all are thousands separators)', () => {
            expect(parseNumber('1,234,567')).toBe(1234567);
        });

        test('strips multiple dots (all are thousands separators)', () => {
            expect(parseNumber('1.234.567')).toBe(1234567);
        });
    });
});