"use client";

import * as React from "react";
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
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
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
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      <IconButton
        label="Next page"
        icon={<ChevronRight strokeWidth={1.6} />}
        variant="secondary"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}
