"use client"

import * as React from "react"
import { NumericFormat } from "react-number-format"
import { cn } from "@src/lib/utils"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@src/components/ui/combobox"
import { InputGroup, InputGroupInput } from "@src/components/ui/input-group"

export interface CurrencyOption {
  value: string   // "USD" — currency code
  label: string   // "USD – US Dollar" — used for combobox search matching
  symbol: string  // "$" — displayed in the trigger
}

export interface CurrencyInputProps {
  amount: number | undefined
  onAmountChange: (value: number | undefined) => void
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
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearch] = React.useState("")
  // pendingRef holds the newly selected option until onOpenChangeComplete fires.
  const pendingRef = React.useRef<CurrencyOption | null>(null)

  const filteredCurrencies = React.useMemo(
    () =>
      !search
        ? currencies
        : currencies.filter((c) =>
            c.label.toLowerCase().includes(search.toLowerCase())
          ),
    [currencies, search]
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "dark:bg-input/30 border-input flex items-center rounded-md border bg-transparent shadow-xs transition-[color,box-shadow]",
        // Ring on whole container when number input is focused
        "has-[input[type=number]:focus-visible]:border-ring has-[input[type=number]:focus-visible]:ring-[3px] has-[input[type=number]:focus-visible]:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {/* LEFT: Currency combobox */}
      <div
        className={cn(
          "rounded-l-md overflow-hidden",
          // Ring only on left section when combobox trigger is focused or popup is open
          "has-[button[data-slot=combobox-trigger]:focus-visible]:ring-[3px] has-[button[data-slot=combobox-trigger]:focus-visible]:ring-ring/50",
          "has-[[data-slot=combobox-trigger][data-popup-open]]:ring-[3px] has-[[data-slot=combobox-trigger][data-popup-open]]:ring-ring/50"
        )}
      >
        <Combobox
          // value stays at the parent's currency until the close animation
          // finishes — keeps ComboboxItem checkmarks stable during animation.
          value={currency}
          items={currencies}
          filteredItems={filteredCurrencies}
          // Lock base-ui's internal inputValue to "" so its query never
          // changes on selection. Without this, base-ui initialises
          // inputValue from the selected item's label (e.g. "USD – US Dollar"),
          // and when a different-length item is selected the bypass-filter
          // heuristic fails, filterQuery becomes the old label, and the list
          // briefly shows only the matching item during the close animation.
          inputValue=""
          onValueChange={(val) => {
            if (!val) return
            // Store selection; parent is notified in onOpenChangeComplete so no
            // React state update happens here — avoids a re-render mid-animation
            // that would cause Firefox to abort and restart the CSS animation.
            pendingRef.current = val
          }}
          itemToStringValue={(c) => c.label}
          onOpenChange={(isOpen: boolean) => {
            // Reset search when the dropdown opens so the list is always fresh.
            if (isOpen) setSearch("")
          }}
          onOpenChangeComplete={(isOpen: boolean) => {
            // Animation finished — now it's safe to update parent state without
            // triggering re-renders that could flicker during the close animation.
            if (!isOpen && pendingRef.current) {
              onCurrencyChange(pendingRef.current)
              pendingRef.current = null
            }
          }}
        >
          <ComboboxTrigger className="text-foreground hover:bg-accent focus-visible:outline-none flex h-9 cursor-pointer items-center gap-1.5 rounded-l-md px-3 text-sm font-medium">
            <span>{currency.symbol}</span>
            <span>{currency.value}</span>
          </ComboboxTrigger>
          <ComboboxContent anchor={containerRef}>
            {/* Plain controlled input instead of ComboboxInput to avoid
                base-ui resetting the filter value on selection, which
                re-renders the list mid-close-animation and causes flicker. */}
            <InputGroup>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
              />
            </InputGroup>
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
      <div className="bg-border h-5 w-px shrink-0" aria-hidden />

      {/* RIGHT: Number input */}
      <NumericFormat
        value={amount}
        onValueChange={(values) => onAmountChange(values.floatValue)}
        thousandSeparator=","
        decimalSeparator="."
        allowNegative={false}
        placeholder={placeholder ?? "0"}
        disabled={disabled}
        className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex-1 min-w-0 rounded-r-md h-9 px-3 text-sm text-left bg-transparent outline-none"
      />
    </div>
  )
}
