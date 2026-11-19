// India-first formatters. Money must always come from here, never a hand-built string.

const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("en-IN");

/** ₹8,49,600 (Indian digit grouping). Pass `withPaise` for ₹8,49,600.00. */
export function formatINR(amount: number, withPaise = false): string {
  return (withPaise ? inr2 : inr0).format(amount);
}

/** Compact lakh/crore form used in summaries, matching production: ₹8.5L, ₹2.31Cr, ₹64K. */
export function formatINRCompact(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const trim = (s: string) => s.replace(/\.?0+$/, "");
  // Largest unit first. Round at the unit's precision; a value that rounds up to 100
  // (e.g. ₹99,950 → 99.95K) becomes 1 of the next unit up (₹1L), not ₹100K.
  const units: [number, number, string][] = [[1e3, 1, "K"], [1e5, 1, "L"], [1e7, 2, "Cr"]];
  for (let i = units.length - 1; i >= 0; i--) {
    const [div, digits, suffix] = units[i]!;
    if (abs >= div) {
      if (Number((abs / div).toFixed(digits)) >= 100 && i < units.length - 1) {
        const [ndiv, ndigits, nsuffix] = units[i + 1]!;
        return `${sign}₹${trim((abs / ndiv).toFixed(ndigits))}${nsuffix}`;
      }
      return `${sign}₹${trim((abs / div).toFixed(digits))}${suffix}`;
    }
  }
  return `${sign}₹${num.format(Math.round(abs))}`;
}

/** 1,34,200 */
export function formatNumber(n: number): string {
  return num.format(n);
}
