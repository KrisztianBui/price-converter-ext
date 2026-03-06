"use client"

import * as React from "react"
import { cn } from "@src/lib/utils"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@src/components/ui/combobox"

export interface CurrencyOption {
  value: string   // "USD" — currency code
  label: string   // "USD – US Dollar" — used for combobox search matching
  symbol: string  // "$" — displayed in the trigger
}

export interface CurrencyInputProps {
  amount: string
  onAmountChange: (value: string) => void
  currency: CurrencyOption
  onCurrencyChange: (currency: CurrencyOption) => void
  currencies: CurrencyOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CurrencyInput({
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  currencies,
  placeholder,
  disabled,
  className,
}: CurrencyInputProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-input bg-background transition-[color,box-shadow]",
        // Ring on whole pill when number input is focused
        "has-[input[type=number]:focus-visible]:ring-[3px]",
        "has-[input[type=number]:focus-visible]:ring-ring/50",
        "has-[input[type=number]:focus-visible]:border-ring",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {/* LEFT: Currency combobox */}
      <div
        className={cn(
          "rounded-l-full overflow-hidden transition-[box-shadow]",
          // Ring only on left half when combobox trigger is focused or popup is open
          "has-[button[data-slot=combobox-trigger]:focus-visible]:ring-[3px]",
          "has-[button[data-slot=combobox-trigger]:focus-visible]:ring-ring/50",
          "has-[[data-slot=combobox-trigger][data-popup-open]]:ring-[3px]",
          "has-[[data-slot=combobox-trigger][data-popup-open]]:ring-ring/50"
        )}
      >
        <Combobox
          value={currency}
          items={currencies}
          onValueChange={(val) => val && onCurrencyChange(val)}
          itemToStringValue={(c) => c.label}
        >
          <ComboboxTrigger className="flex items-center gap-1.5 rounded-l-full px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none">
            <span>{currency.symbol}</span>
            <span>{currency.value}</span>
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput placeholder="Search currency..." showTrigger={false} />
            <ComboboxEmpty>No currency found</ComboboxEmpty>
            <ComboboxList>
              {(c) => (
                <ComboboxItem key={c.value} value={c}>
                  {c.symbol} {c.value} – {c.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border shrink-0" aria-hidden />

      {/* RIGHT: Number input */}
      <input
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        disabled={disabled}
        className="flex-1 min-w-0 rounded-r-full px-3 py-2 text-sm text-right bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  )
}
