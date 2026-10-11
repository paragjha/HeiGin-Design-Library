// India-first formatters. Money must always come from here, never a hand-built string.

const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("en-IN");

/** ₹8,49,600 (Indian digit grouping). Pass `withPaise` for ₹8,49,600.00. */
export function formatINR(amount: number, withPaise = false): string {
  return (withPaise ? inr2 : inr0).format(amount);
}

/** Compact lakh/crore form used in summaries: ₹8.5 L, ₹2.31 Cr, ₹64K. */
export function formatINRCompact(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const trim = (n: number, digits: number) => n.toFixed(digits).replace(/\.?0+$/, "");
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7, 2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5, 1)} L`;
  if (abs >= 1e3) return `${sign}₹${trim(abs / 1e3, 1)}K`;
  return `${sign}₹${num.format(abs)}`;
}

/** 1,34,200 */
export function formatNumber(n: number): string {
  return num.format(n);
}
