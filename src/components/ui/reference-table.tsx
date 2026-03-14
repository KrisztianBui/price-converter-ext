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
      <table className="w-full text-sm" aria-label="Quick reference">
        <tbody>
          {REFERENCE_AMOUNTS.map((amt) => (
            <tr key={amt} className="border-b border-border last:border-0">
              <td className="py-1.5 text-muted-foreground">
                {formatFixedAmount(amt)} {fromCurrency.value}
              </td>
              <td className="py-1.5 text-right font-medium">
                {error ? (
                  <span className="text-muted-foreground">—</span>
                ) : isLoading ? (
                  <span className="inline-block h-3.5 w-20 rounded animate-pulse bg-muted" aria-hidden="true" />
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
