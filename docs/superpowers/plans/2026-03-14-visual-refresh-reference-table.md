# Visual Refresh + Quick Reference Table Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a warm gradient header, accent-colored swap button, and a live quick-reference conversion table to the popup.

**Architecture:** All new UI derives from existing state (`rate`, `fromCurrency`, `toCurrency`) already available in `Popup.tsx` — no new hooks or API calls. A standalone `formatAmount` utility handles locale-aware number formatting with zero-decimal currency awareness. The reference table is extracted to its own component to keep `Popup.tsx` focused.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (amber/orange built-in — no tailwind config changes needed), shadcn/ui, Vitest

---

## Chunk 1: Visual Refresh

### Task 1: Increase popup height

**Files:**
- Modify: `src/pages/popup/index.css`

- [ ] **Step 1: Open the file and confirm the current body height**

  Read `src/pages/popup/index.css`. Confirm you see `height: 360px` on the `body` rule.

- [ ] **Step 2: Replace fixed height with min-height**

  In `src/pages/popup/index.css`, change the `body` rule from:
  ```css
  body {
    width: 400px;
    height: 360px;
    ...
  }
  ```
  to:
  ```css
  body {
    width: 400px;
    min-height: 520px;
    ...
  }
  ```
  Remove the `height: 360px` line entirely. Do not change any other lines in the file.

  Note: `index.css` also has a `body > div` rule with `align-items: center` and `justify-content: center`. Leave it unchanged — it will not cause layout issues because the content div inside Popup.tsx fills the full height via `flex-1`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/popup/index.css
  git commit -m "feat: increase popup min-height to 520px to accommodate reference table"
  ```

---

### Task 2: Add gradient header and update swap button

**Files:**
- Modify: `src/pages/popup/Popup.tsx`

- [ ] **Step 1: Read the current Popup.tsx**

  Read `src/pages/popup/Popup.tsx` in full so you understand the exact JSX structure before changing it.

- [ ] **Step 2: Replace the outer div and h1 with the new layout**

  Replace the entire `return (...)` block in `Popup.tsx` with the following. The changes are:
  1. The outer `<div>` loses `p-5` and `gap-4` — those move to an inner content div.
  2. A new gradient header `<div>` replaces the plain `<h1>`.
  3. The swap `<Button>` gets updated classes.
  4. The `<ReferenceTable />` component will be added in Chunk 2, Task 4 — do not add it yet.

  ```tsx
  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-white">Price Converter</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        <div className="flex items-center gap-2">
          <CurrencyInput
            className="flex-1"
            amount={amount}
            onAmountChange={setAmount}
            currency={fromCurrency}
            onCurrencyChange={setFromCurrency}
            currencies={CURRENCIES}
            placeholder="1"
          />

          <Button
            variant="default"
            size="icon"
            onClick={handleSwap}
            aria-label="Swap currencies"
            className="bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            <ArrowLeftRight />
          </Button>
        </div>

        <CurrencyInput
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
    </div>
  );
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/popup/Popup.tsx
  git commit -m "feat: add warm gradient header and accent swap button"
  ```

---

## Chunk 2: Reference Table

> **Prerequisite:** Chunk 1 must be applied before working on Chunk 2. Task 4 modifies the JSX structure introduced by Chunk 1, Task 2.

### Task 3: Create formatAmount utility (TDD)

**Files:**
- Create: `src/utils/formatAmount.ts`
- Create: `src/utils/formatAmount.test.ts`

The utility exports two functions:
- `formatAmount(value: number, currency: string): string` — formats a converted result with the correct number of decimal places for the currency.
- `formatFixedAmount(value: number): string` — formats a fixed row amount (1, 5, 10 … 1000) from the from-currency column with locale grouping but no forced decimals.

> **Note:** The tests use `toLocaleString('en-US', ...)` which requires Node.js with full ICU data. Modern Node.js (v18+) ships with full ICU by default. Verify your environment before running: `node -e "console.log((1000).toLocaleString('en-US'))"` — if it prints `1,000` you're fine; if it prints `1000` you need to update Node.

- [ ] **Step 1: Write the failing tests**

  Create `src/utils/formatAmount.test.ts`:

  ```ts
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
    test('formats 1 with no grouping', () => {
      expect(formatFixedAmount(1)).toBe('1');
    });

    test('formats 1000 with comma separator', () => {
      expect(formatFixedAmount(1000)).toBe('1,000');
    });

    test('formats 500 without separator', () => {
      expect(formatFixedAmount(500)).toBe('500');
    });
  });
  ```

- [ ] **Step 2: Run tests and confirm they fail**

  First, verify your Node has full ICU (required for locale-aware formatting):
  ```bash
  node -e "console.log((1000).toLocaleString('en-US'))"
  ```
  Expected output: `1,000`

  Then run:
  ```bash
  pnpm test
  ```
  Expected: FAIL — `Cannot find module './formatAmount'`

- [ ] **Step 3: Implement formatAmount**

  Create `src/utils/formatAmount.ts`:

  ```ts
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
  ```

- [ ] **Step 4: Run tests and confirm they pass**

  ```bash
  pnpm test
  ```

  Expected: All tests pass, including the existing `parseNumber` and `parsePrice` suites.

- [ ] **Step 5: Commit**

  ```bash
  git add src/utils/formatAmount.ts src/utils/formatAmount.test.ts
  git commit -m "feat: add formatAmount utility with zero-decimal currency support"
  ```

---

### Task 4: Add ReferenceTable component and wire into Popup

**Files:**
- Create: `src/components/ui/reference-table.tsx`
- Modify: `src/pages/popup/Popup.tsx`

- [ ] **Step 1: Create the ReferenceTable component**

  Create `src/components/ui/reference-table.tsx`:

  ```tsx
  import { formatAmount, formatFixedAmount } from '@src/utils/formatAmount';
  import { CurrencyOption } from '@src/components/ui/currency-input';

  const REFERENCE_AMOUNTS = [1, 5, 10, 50, 100, 500, 1000];

  interface ReferenceTableProps {
    fromCurrency: CurrencyOption;
    toCurrency: CurrencyOption;
    rate: number | undefined;
    error: string | null;
  }

  export function ReferenceTable({ fromCurrency, toCurrency, rate, error }: ReferenceTableProps) {
    const isLoading = rate === undefined;

    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Quick reference
        </p>
        <table className="w-full text-sm">
          <tbody>
            {REFERENCE_AMOUNTS.map((amt) => (
              <tr key={amt} className="border-b border-border last:border-0">
                <td className="py-1.5 text-muted-foreground">
                  {formatFixedAmount(amt)} {fromCurrency.value}
                </td>
                <td className="py-1.5 text-right font-medium">
                  {isLoading ? (
                    <span className="inline-block h-3.5 w-20 rounded animate-pulse bg-muted" />
                  ) : error ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    `${formatAmount(amt * rate, toCurrency.value)} ${toCurrency.value}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  ```

- [ ] **Step 2: Wire ReferenceTable into Popup.tsx**

  In `src/pages/popup/Popup.tsx`:

  1. Add the import after the `useExchangeRate` import line:
     ```tsx
     import { ReferenceTable } from '@src/components/ui/reference-table';
     ```

  2. Inside the `<div className="flex flex-col gap-4 p-5 flex-1">` content block (after the second `<CurrencyInput>`), add:
     ```tsx
     <ReferenceTable
       fromCurrency={fromCurrency}
       toCurrency={toCurrency}
       rate={rate}
       error={error}
     />
     ```

  The complete updated `return` block should look like this:

  ```tsx
  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-white">Price Converter</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        <div className="flex items-center gap-2">
          <CurrencyInput
            className="flex-1"
            amount={amount}
            onAmountChange={setAmount}
            currency={fromCurrency}
            onCurrencyChange={setFromCurrency}
            currencies={CURRENCIES}
            placeholder="1"
          />

          <Button
            variant="default"
            size="icon"
            onClick={handleSwap}
            aria-label="Swap currencies"
            className="bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            <ArrowLeftRight />
          </Button>
        </div>

        <CurrencyInput
          amount={result}
          onAmountChange={() => {}}
          currency={toCurrency}
          onCurrencyChange={setToCurrency}
          currencies={CURRENCIES}
          placeholder={loading ? 'Loading…' : error ? 'Error' : `${rate}`}
          disabled={loading}
          readOnly
        />

        <ReferenceTable
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          rate={rate}
          error={error}
        />
      </div>
    </div>
  );
  ```

- [ ] **Step 3: Run tests to confirm nothing is broken**

  ```bash
  pnpm test
  ```

  Expected: All tests pass.

- [ ] **Step 4: Build to confirm no TypeScript errors**

  ```bash
  pnpm build
  ```

  Expected: Build completes without errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/ui/reference-table.tsx src/pages/popup/Popup.tsx
  git commit -m "feat: add quick reference conversion table to popup"
  ```
