"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { IconButton } from "./icon-button";

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Formats the range label. Default: "1–20 of 134". */
  formatRange?: (from: number, to: number, total: number) => string;
  className?: string;
}

const numberFormat = new Intl.NumberFormat("en-IN");

/** Previous/next pager with a live range label. Controlled. */
export function Pagination({ page, pageSize, totalItems, onPageChange, formatRange, className }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  // Clamp once: a page past the end (e.g. a filter shrank the list) would otherwise show "41–12 of 12".
  const current = Math.min(Math.max(1, page), pageCount);
  const from = totalItems === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, totalItems);
  const label = formatRange
    ? formatRange(from, to, totalItems)
    : `${numberFormat.format(from)}–${numberFormat.format(to)} of ${numberFormat.format(totalItems)}`;

  return (
    <nav
      aria-label="Pagination"
      className={cn(className)}
      style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--hg-space-2)" }}
    >
      <span aria-live="polite" style={{ fontSize: "var(--hg-font-size-sm)", color: "var(--hg-color-muted)", fontVariantNumeric: "tabular-nums" }}>
        {label}
      </span>
      <IconButton
        label="Previous page"
        icon={<ChevronLeft strokeWidth={1.6} />}
        variant="secondary"
        size="sm"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      />
      <IconButton
        label="Next page"
        icon={<ChevronRight strokeWidth={1.6} />}
        variant="secondary"
        size="sm"
        disabled={current >= pageCount}
        onClick={() => onPageChange(current + 1)}
      />
    </nav>
  );
}
