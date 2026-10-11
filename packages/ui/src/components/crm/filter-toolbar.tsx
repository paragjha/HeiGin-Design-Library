"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { SearchInput } from "../ui/search-input";
import styles from "./crm.module.css";

export interface FilterToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  /** FilterChip elements. */
  chips?: React.ReactNode;
  /** Scope disclosure, e.g. "Showing 24 of 61 · your leads". Announced politely when it changes. */
  scope?: React.ReactNode;
  /** Right-aligned controls (view switcher, export). */
  actions?: React.ReactNode;
  className?: string;
}

/** Search + quick filters + scope line for list pages. */
export function FilterToolbar({
  query,
  onQueryChange,
  searchLabel = "Search",
  searchPlaceholder = "Search",
  chips,
  scope,
  actions,
  className,
}: FilterToolbarProps) {
  return (
    <div className={cn(styles.toolbar, className)} role="search">
      <div className={styles.toolbarSearch}>
        <SearchInput aria-label={searchLabel} placeholder={searchPlaceholder} value={query} onValueChange={onQueryChange} />
      </div>
      {chips && (
        <div className={styles.toolbarChips} role="group" aria-label="Quick filters">
          {chips}
        </div>
      )}
      <div className={styles.toolbarEnd}>
        {scope && (
          <span className={styles.scope} aria-live="polite">
            {scope}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}
