/**
 * Money is always stored and transferred as integer "minor units" (e.g. paisa/cents)
 * to avoid floating point errors in totals and tax calculations.
 */
export type Minor = number;

export function toMinor(amount: number): Minor {
  return Math.round(amount * 100);
}

export function fromMinor(minor: Minor): number {
  return minor / 100;
}

export function formatMoney(minor: Minor, currency = "BDT", locale = "en-BD"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(fromMinor(minor));
}
