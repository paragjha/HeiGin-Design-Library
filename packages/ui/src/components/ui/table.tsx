"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./skeleton";
import styles from "./table.module.css";

export type SortDirection = "asc" | "desc";
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface TableColumn<T> {
  id: string;
  header: React.ReactNode;
  /** Cell renderer. Defaults to `String(row[id])` when the row has that key. */
  cell?: (row: T) => React.ReactNode;
  align?: "start" | "end" | "center";
  /** CSS width, e.g. "160px" or "20%". */
  width?: string;
  sortable?: boolean;
  /** Hide below 768px. Keep the identifying column visible. */
  hideOnMobile?: boolean;
  /** Use tabular numerals (amounts, counts, dates). */
  numeric?: boolean;
}

export interface TableProps<T> {
  /** Accessible table name. Rendered as a visually hidden caption unless `showCaption`. */
  caption: string;
  showCaption?: boolean;
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  /** Number of skeleton rows while loading. */
  loadingRows?: number;
  /** Rendered in place of rows when `rows` is empty and not loading. */
  empty?: React.ReactNode;
  /** Enables a checkbox column. Controlled. */
  selectedIds?: ReadonlySet<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  /** Label for a row's checkbox, e.g. (row) => `Select ${row.name}`. */
  getRowLabel?: (row: T) => string;
  sort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Makes rows clickable (mouse) — always also provide a link or button in the row for keyboard users. */
  onRowClick?: (row: T) => void;
  /** Bulk actions bar: rendered above the table when rows are selected. Receives count and a clear callback. */
  bulkActions?: (count: number, clearSelection: () => void) => React.ReactNode;
  /** Per-row action buttons/menus. Adds an actions column on the right. */
  rowActions?: (row: T) => React.ReactNode;
  density?: "default" | "compact";
  stickyHeader?: boolean;
  /** Wrap the table in its own bordered surface, as production list pages do. Default `true`; pass `false` inside a Card. */
  bordered?: boolean;
  className?: string;
}

/**
 * Generic data table: configurable columns, loading skeletons, empty state, row selection and
 * sortable headers. Sorting and pagination are controlled — the table never reorders data itself.
 */
export function Table<T>({
  caption,
  showCaption = false,
  columns,
  rows,
  getRowId,
  loading = false,
  loadingRows = 5,
  empty,
  selectedIds,
  onSelectionChange,
  getRowLabel,
  sort,
  onSortChange,
  onRowClick,
  bulkActions,
  rowActions,
  density = "default",
  stickyHeader = false,
  bordered = true,
  className,
}: TableProps<T>) {
  const selectable = Boolean(selectedIds && onSelectionChange);
  const rowIds = rows.map(getRowId);
  const selectedCount = selectable ? rowIds.filter((id) => selectedIds!.has(id)).length : 0;
  const allSelected = rows.length > 0 && selectedCount === rows.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const hasRowActions = Boolean(rowActions);
  const colCount = columns.length + (selectable ? 1 : 0) + (hasRowActions ? 1 : 0);
  const clearSelection = () => onSelectionChange?.(new Set());

  const toggleAll = () => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (allSelected) rowIds.forEach((id) => next.delete(id));
    else rowIds.forEach((id) => next.add(id));
    onSelectionChange(next);
  };
  const toggleRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };
  const cycleSort = (columnId: string) => {
    if (!onSortChange) return;
    if (!sort || sort.columnId !== columnId) onSortChange({ columnId, direction: "asc" });
    else if (sort.direction === "asc") onSortChange({ columnId, direction: "desc" });
    else onSortChange(null);
  };

  const showBulkBar = selectable && selectedCount > 0 && bulkActions;

  return (
    <div className={cn(styles.scroller, bordered && styles.bordered, className)}>
      {showBulkBar && (
        <div className={styles.bulkBar} role="toolbar" aria-label={`${selectedCount} selected`}>
          <span className={styles.bulkCount}>{selectedCount} selected</span>
          {bulkActions(selectedCount, clearSelection)}
        </div>
      )}
      <table className={cn(styles.table, density === "compact" && styles.compact, stickyHeader && styles.sticky)} aria-busy={loading || undefined}>
        <caption className={showCaption ? styles.caption : styles.srOnly}>{caption}</caption>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className={styles.selectCell}>
                <Checkbox
                  aria-label="Select all rows"
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={loading || rows.length === 0}
                  onCheckedChange={toggleAll}
                />
              </th>
            )}
            {columns.map((column) => {
              const active = sort?.columnId === column.id;
              const ariaSort = active ? (sort!.direction === "asc" ? "ascending" : "descending") : column.sortable ? "none" : undefined;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={ariaSort}
                  style={{ width: column.width }}
                  className={cn(styles[`align-${column.align ?? "start"}`], column.hideOnMobile && styles.hideOnMobile)}
                >
                  {column.sortable && onSortChange ? (
                    <button type="button" className={styles.sortButton} onClick={() => cycleSort(column.id)}>
                      {column.header}
                      <span className={cn(styles.sortIcon, active && styles.sortIconActive)} aria-hidden="true">
                        {active ? (
                          sort!.direction === "asc" ? <ArrowUp strokeWidth={1.6} /> : <ArrowDown strokeWidth={1.6} />
                        ) : (
                          <ChevronsUpDown strokeWidth={1.6} />
                        )}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
            {hasRowActions && <th scope="col" className={styles.actionsCell}><span className={styles.srOnly}>Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: loadingRows }, (_, i) => (
              <tr key={`skeleton-${i}`} className={styles.skeletonRow}>
                {selectable && (
                  <td className={styles.selectCell}>
                    <Skeleton width={16} height={16} />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.id} className={column.hideOnMobile ? styles.hideOnMobile : undefined}>
                    <Skeleton shape="text" width={`${50 + ((i * 17 + column.id.length * 7) % 40)}%`} />
                  </td>
                ))}
                {hasRowActions && <td className={styles.actionsCell} />}
              </tr>
            ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={colCount} className={styles.emptyCell}>
                {empty ?? <span className={styles.emptyText}>No results</span>}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => {
              const id = getRowId(row);
              const selected = selectable && selectedIds!.has(id);
              return (
                <tr
                  key={id}
                  data-selected={selected ? "" : undefined}
                  aria-selected={selectable ? selected : undefined}
                  className={cn(onRowClick && styles.clickable)}
                  onClick={
                    onRowClick
                      ? (event) => {
                          if ((event.target as HTMLElement).closest("a,button,input,[role=checkbox],[role=menuitem]")) return;
                          onRowClick(row);
                        }
                      : undefined
                  }
                >
                  {selectable && (
                    <td className={styles.selectCell}>
                      <Checkbox
                        aria-label={getRowLabel ? getRowLabel(row) : `Select row ${id}`}
                        checked={selected}
                        onCheckedChange={() => toggleRow(id)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        styles[`align-${column.align ?? "start"}`],
                        column.numeric && styles.numeric,
                        column.hideOnMobile && styles.hideOnMobile,
                      )}
                    >
                      {column.cell ? column.cell(row) : String((row as Record<string, unknown>)[column.id] ?? "")}
                    </td>
                  ))}
                  {hasRowActions && (
                    <td className={styles.actionsCell}>
                      <div className={styles.rowActions}>{rowActions!(row)}</div>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
