# Design Spec: Visual Refresh + Quick Reference Table

**Date:** 2026-03-14
**Status:** Draft

## Overview

Two complementary improvements to the price converter popup: a visual redesign that gives the extension a branded, warm feel, and a quick reference table that fills the empty space below the converter with immediately useful content.

## Goals

- Make the popup feel polished and ready for the Chrome Web Store
- Fill empty vertical space with content that is useful on every conversion
- Avoid adding new API calls or dependencies

## Out of Scope

- Options page (future work)
- Context menu behavior changes
- Currency list changes
- Rate history charts
- Copy-to-clipboard on table rows (deliberate omission to keep the UI simple; can be revisited in a future iteration)
- Currency input hover/border polish (deferred — not enough specificity to implement safely without visual design review)
- Converter error display in the result input (the existing `'Error'` placeholder text is preserved unchanged)

---

## Section 1: Visual Refresh

### Header Band

A gradient strip at the top of the popup using warm amber-to-orange tones. Contains the "Price Converter" title in white. Gives the extension a distinct, branded identity.

### Color Palette

A warm custom accent palette added to `tailwind.config`. Approximate tone: amber-600 to orange-500 gradient for the header; amber-500 as the primary accent color for interactive elements.

No new dependencies — uses Tailwind's existing utility classes and the project's existing shadcn/ui component tokens.

### Dark Mode

The gradient header stays consistent in both light and dark mode (the warm gradient remains unchanged). The background below the header uses `bg-background` (the existing shadcn token), which already adapts to `prefers-color-scheme`. White text on the amber-to-orange gradient must be verified against WCAG AA (4.5:1 contrast ratio) before shipping — adjust the gradient stops if needed.

### Component Changes

**Header:** New gradient band (`bg-gradient-to-r from-amber-500 to-orange-500`) replacing the plain `<h1>` title. Title text is white (`text-white`).

**Swap button:** Change `variant="outline"` to `variant="default"` and add `className="bg-amber-500 hover:bg-amber-600 text-white border-0"` (or equivalent Tailwind overrides for the new accent color). Do not create a new shadcn variant — use direct class overrides.

**Background:** `bg-background` (adapts to light/dark via existing shadcn token).

### Files Affected

- `tailwind.config` — add warm accent palette
- `src/pages/popup/Popup.tsx` — restructure layout, add gradient header, update swap button classes
- `src/pages/popup/index.css` — increase popup min-height (see Section 2)

---

## Section 2: Quick Reference Table

### Purpose

Show a static set of common amounts converted at the current live rate, giving users an at-a-glance reference without needing to type multiple values. The table always displays the fixed row amounts regardless of what the user has typed into the amount input — it is entirely independent of the `amount` state.

### Rows

Fixed set: **1, 5, 10, 50, 100, 500, 1,000** (in the from-currency).

### Data Source

Computed from the `rate` value returned by `useExchangeRate` — no additional API calls.

### States

| State | Condition | Table behavior |
|---|---|---|
| Skeleton | `rate === undefined` (regardless of `loading`) | Skeleton shimmer on value cells |
| Error | `error !== null` | Dashes (`—`) in value cells |
| Ready | `rate !== undefined && !error` | Live computed values, formatted (see below) |
| `from === to` | Both currencies identical | Hook immediately sets `rate: 1` with no loading phase. Renders as Ready; values are trivially identical (e.g. 1 USD = 1 USD). No special-casing needed. |

**Important:** `useExchangeRate` initializes with `{ rate: undefined, loading: false, error: null }`. The hook only sets `loading: true` inside its effect, which is asynchronous — so on the very first render, both `loading` and `rate` are in their initial state (`false` and `undefined`). Gating the skeleton on `loading` alone would cause the table to briefly render with no values before the effect runs. Gate on `rate === undefined` instead (or `rate === undefined || loading`) to correctly show the skeleton from the very first frame.

### Number Formatting

**Result column (to-currency):** `toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` for standard currencies. For zero-decimal currencies, use `maximumFractionDigits: 0`.

**Amount column (from-currency):** Format the fixed amounts (1, 5, 10, 50, 100, 500, 1000) using `toLocaleString('en-US')` with no forced decimal places — this produces `1,000` for 1000 and `1` for 1, which matches the visual intent.

**Zero-decimal currency set:** The list below is a defensive allowlist for current and future currencies. Of the currencies currently in `Popup.tsx`, only JPY and HUF are zero-decimal — so in practice only those two will trigger this path today. The full set is provided so it does not need to be revisited when new currencies are added:

JPY, KRW, IDR, VND, HUF, CLP, BIF, GNF, MGA, PYG, RWF, UGX, VUV, XAF, XOF, XPF.

### Layout

Compact two-column table below the converter inputs. Section label "Quick reference" above it. From-currency amount on the left, converted result on the right.

### Popup Height

Chrome extension popup height is controlled by the popup page's CSS, not `manifest.json`. Set `min-height: 520px` on the popup root element in `src/pages/popup/index.css`. This is the single target value — do not use a range.

### Files Affected

- `src/pages/popup/Popup.tsx` — add table below converter
- `src/pages/popup/index.css` — set `min-height: 520px` on popup root
- Optionally extract to `src/components/ui/reference-table.tsx` if the JSX grows large

---

## Architecture Notes

- The reference table derives entirely from `rate`, `fromCurrency`, and `toCurrency` — no new hooks or state
- The table re-renders automatically when currency or rate changes
- The `amount` input has no effect on the reference table
- The existing converter error display (`'Error'` placeholder in the result input) is not modified by this spec
