"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import popup from "../ui/popup.module.css";
import styles from "./crm.module.css";

export interface Workspace {
  id: string;
  /** Display name — a company name, team name, or sign-in subdomain. */
  name: string;
  /** Optional secondary line, e.g. the user's role in the workspace. */
  caption?: string;
  /** Optional avatar URL. Falls back to an initials disc. */
  avatarUrl?: string;
  /** 1–2 characters for the initials disc. Derived from `name` when omitted. */
  initials?: string;
  /** CSS colour for the initials disc. Falls back to the HeiGin brand. */
  accent?: string;
}

export interface WorkspaceSwitcherProps {
  /** The currently active workspace — appears in the trigger and gets the check. */
  current: Workspace;
  /** Workspaces the user owns or belongs to directly. */
  owned: Workspace[];
  /** Workspaces the user was invited to from outside their org. */
  external?: Workspace[];
  /** Called when the user picks any workspace, including the current one. */
  onSelect: (workspace: Workspace) => void;
  /** Show a "New workspace" row at the bottom of the list when set. */
  onNew?: () => void;
  /** Show a "View all workspaces" link in the footer when set. */
  onViewAll?: () => void;
  /** Show the search input once the combined list hits this many entries. Pass false to always hide. Default 6. */
  searchThreshold?: number | false;
  /** Labels for the two sections and the chrome. Pass through to override copy. */
  labels?: {
    yours?: string;
    external?: string;
    newWorkspace?: string;
    viewAll?: string;
    search?: string;
    empty?: string;
    triggerLabel?: string;
  };
  className?: string;
}

const DEFAULT_LABELS = {
  yours: "Your workspaces",
  external: "External",
  newWorkspace: "New workspace",
  viewAll: "View all workspaces",
  search: "Search workspaces…",
  empty: "No workspaces match.",
  triggerLabel: "Switch workspace",
} as const;

const initialsOf = (ws: Workspace) =>
  ws.initials ??
  ws.name
    .replace(/^https?:\/\//, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

function Mark({ ws, size = 20 }: { ws: Workspace; size?: number }) {
  if (ws.avatarUrl) {
    return <img src={ws.avatarUrl} alt="" className={styles.wsMarkImg} width={size} height={size} />;
  }
  return (
    <span
      className={styles.wsMark}
      style={{ width: size, height: size, backgroundColor: ws.accent ?? "var(--hg-color-brand, #4f46e5)" }}
      aria-hidden="true"
    >
      {initialsOf(ws)}
    </span>
  );
}

/**
 * A workspace / tenant switcher for the sidebar: shows the active workspace
 * in a compact trigger, and reveals a searchable list grouped into
 * **Your workspaces** and **External** (ones shared in from outside the org).
 * Users with access to multiple HeiGin workspaces can switch without
 * signing out and re-entering a subdomain.
 */
export function WorkspaceSwitcher({
  current,
  owned,
  external = [],
  onSelect,
  onNew,
  onViewAll,
  searchThreshold = 6,
  labels,
  className,
}: WorkspaceSwitcherProps) {
  const L = { ...DEFAULT_LABELS, ...(labels ?? {}) };
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const total = owned.length + external.length;
  const showSearch = searchThreshold !== false && total >= searchThreshold;

  const q = query.trim().toLowerCase();
  const match = (ws: Workspace) => !q || ws.name.toLowerCase().includes(q) || (ws.caption?.toLowerCase().includes(q) ?? false);
  const ownedFiltered = owned.filter(match);
  const externalFiltered = external.filter(match);
  const nothingMatches = q !== "" && ownedFiltered.length === 0 && externalFiltered.length === 0;

  const pick = (ws: Workspace) => {
    onSelect(ws);
    setOpen(false);
    setQuery("");
  };

  return (
    <BasePopover.Root open={open} onOpenChange={setOpen}>
      <BasePopover.Trigger
        className={cn(styles.wsTrigger, className)}
        aria-label={L.triggerLabel}
        data-testid="workspace-switcher-trigger"
      >
        <Mark ws={current} />
        <span className={styles.wsTriggerName}>{current.name}</span>
        <ChevronsUpDown size={14} strokeWidth={1.8} className={styles.wsTriggerChevron} aria-hidden="true" />
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner className={popup.positioner} side="bottom" align="start" sideOffset={6}>
          <BasePopover.Popup className={cn(popup.popup, styles.wsPopup)} data-testid="workspace-switcher-popup">
            {showSearch && (
              <div className={styles.wsSearch}>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={L.search}
                  aria-label={L.search}
                  className={styles.wsSearchInput}
                  autoFocus
                />
              </div>
            )}
            <div className={styles.wsScroll} role="listbox" aria-label={L.triggerLabel}>
              {ownedFiltered.length > 0 && (
                <>
                  <p className={styles.wsSectionLabel}>{L.yours}</p>
                  {ownedFiltered.map((ws) => (
                    <WsRow key={ws.id} ws={ws} active={ws.id === current.id} onSelect={pick} />
                  ))}
                </>
              )}
              {externalFiltered.length > 0 && (
                <>
                  <p className={styles.wsSectionLabel}>{L.external}</p>
                  {externalFiltered.map((ws) => (
                    <WsRow key={ws.id} ws={ws} active={ws.id === current.id} onSelect={pick} />
                  ))}
                </>
              )}
              {nothingMatches && <p className={styles.wsEmpty}>{L.empty}</p>}
              {onNew && (
                <>
                  <div className={styles.wsDivider} role="separator" />
                  <button
                    type="button"
                    className={cn(styles.wsRow, styles.wsRowAction)}
                    onClick={() => {
                      onNew();
                      setOpen(false);
                    }}
                    data-testid="workspace-switcher-new"
                  >
                    <span className={styles.wsAction}>
                      <Plus size={14} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className={styles.wsRowName}>{L.newWorkspace}</span>
                  </button>
                </>
              )}
            </div>
            {onViewAll && (
              <button
                type="button"
                className={styles.wsFooter}
                onClick={() => {
                  onViewAll();
                  setOpen(false);
                }}
                data-testid="workspace-switcher-view-all"
              >
                {L.viewAll}
              </button>
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

function WsRow({ ws, active, onSelect }: { ws: Workspace; active: boolean; onSelect: (ws: Workspace) => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={styles.wsRow}
      onClick={() => onSelect(ws)}
      data-testid={`workspace-switcher-row-${ws.id}`}
    >
      <Mark ws={ws} size={20} />
      <span className={styles.wsRowName}>
        <span className={styles.wsRowNameText}>{ws.name}</span>
        {ws.caption && <span className={styles.wsRowCaption}>{ws.caption}</span>}
      </span>
      {active && <Check size={14} strokeWidth={2.4} className={styles.wsRowCheck} aria-hidden="true" />}
    </button>
  );
}
