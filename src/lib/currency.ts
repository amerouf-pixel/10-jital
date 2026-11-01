export type CurrencyCode = "MAD" | "EUR" | "USD";

export interface Currency {
  code: CurrencyCode;
  label: string;
  symbol: string;
  rateToMAD: number;
}

export const CURRENCIES: Currency[] = [
  { code: "MAD", label: "Dirham marocain", symbol: "د.م.", rateToMAD: 1 },
  { code: "EUR", label: "Euro", symbol: "€", rateToMAD: 10.85 },
  { code: "USD", label: "Dollar américain", symbol: "$", rateToMAD: 9.95 },
];

export const DEFAULT_CURRENCY: CurrencyCode = "MAD";

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const fromCur = CURRENCIES.find((c) => c.code === from);
  const toCur = CURRENCIES.find((c) => c.code === to);
  if (!fromCur || !toCur) return amount;
  const amountInMAD = amount * fromCur.rateToMAD;
  return amountInMAD / toCur.rateToMAD;
}

export function formatAmount(amount: number, currency: CurrencyCode): string {
  const cur = CURRENCIES.find((c) => c.code === currency);
  if (!cur) return amount.toString();
  const formatted = amount.toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cur.symbol} ${formatted}`;
}

export function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const stored = localStorage.getItem("10jital-currency");
    if (stored === "MAD" || stored === "EUR" || stored === "USD") {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_CURRENCY;
}

export function setStoredCurrency(code: CurrencyCode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("10jital-currency", code);
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: code }));
  } catch {
    // ignore
  }
}
