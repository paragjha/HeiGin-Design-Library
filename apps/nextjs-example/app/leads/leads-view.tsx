"use client";

import { useMemo, useState } from "react";
import { Archive, Download, Inbox, MoreHorizontal, UserPlus } from "lucide-react";
import {
  Avatar,
  Button,
  ChannelMark,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  FilterChip,
  FilterToolbar,
  IconButton,
  MoneyValue,
  Pagination,
  StatusBadge,
  Table,
  useToast,
  VisuallyHidden,
  type SortState,
  type TableColumn,
} from "@heigin/ui";
import type { Lead } from "@/lib/mock-data";

const PAGE_SIZE = 6;

export function LeadsView({ leads }: { leads: Lead[] }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [hot, setHot] = useState(false);
  const [unassigned, setUnassigned] = useState(false);
  const [sort, setSort] = useState<SortState | null>({ columnId: "value", direction: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = leads.filter(
      (l) => (!q || `${l.name} ${l.company} ${l.city}`.toLowerCase().includes(q)) && (!hot || l.hot) && (!unassigned || !l.owner),
    );
    if (sort) {
      const dir = sort.direction === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = a[sort.columnId as keyof Lead] ?? "";
        const bv = b[sort.columnId as keyof Lead] ?? "";
        return av > bv ? dir : av < bv ? -dir : 0;
      });
    }
    return rows;
  }, [leads, query, hot, unassigned, sort]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  const columns: TableColumn<Lead>[] = [
    {
      id: "name",
      header: "Lead",
      sortable: true,
      cell: (l) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Avatar name={l.name} size="sm" decorative />
          <span>
            <a href={`/leads#${l.id}`} style={{ color: "inherit", fontWeight: 500, textDecoration: "none" }}>
              {l.name}
            </a>
            <br />
            <span className="muted" style={{ fontSize: 12 }}>
              {l.company} · {l.city}
            </span>
          </span>
        </span>
      ),
    },
    { id: "status", header: "Status", cell: (l) => <StatusBadge status={l.status} /> },
    { id: "channel", header: "Source", hideOnMobile: true, cell: (l) => <ChannelMark channel={l.channel} /> },
    { id: "owner", header: "Owner", hideOnMobile: true, cell: (l) => l.owner ?? <span className="muted">Unassigned</span> },
    { id: "value", header: "Value", align: "end", numeric: true, sortable: true, cell: (l) => <MoneyValue amount={l.value} /> },
    {
      id: "actions",
      header: <VisuallyHidden>Actions</VisuallyHidden>,
      width: "48px",
      align: "end",
      cell: (l) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<IconButton label={`Actions for ${l.name}`} icon={<MoreHorizontal strokeWidth={1.6} />} size="sm" touch={false} />} />
          <DropdownMenuContent align="end">
            <DropdownMenuItem icon={<UserPlus strokeWidth={1.6} />} onClick={() => toast({ title: `Assigned ${l.name} to you (demo)` })}>
              Assign to me
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Archive strokeWidth={1.6} />} tone="danger" onClick={() => toast({ title: `Archived ${l.name} (demo)`, tone: "neutral" })}>
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <FilterToolbar
        query={query}
        onQueryChange={resetPage(setQuery)}
        searchLabel="Search leads"
        searchPlaceholder="Search name, company, city"
        chips={
          <>
            <FilterChip pressed={hot} onPressedChange={resetPage(setHot)} count={leads.filter((l) => l.hot).length}>
              Hot
            </FilterChip>
            <FilterChip pressed={unassigned} onPressedChange={resetPage(setUnassigned)}>
              Unassigned
            </FilterChip>
          </>
        }
        scope={`Showing ${filtered.length} of ${leads.length}`}
        actions={
          <Button variant="secondary" size="sm" leadingIcon={<Download strokeWidth={1.6} />} disabled={selected.size === 0} onClick={() => toast({ title: `Exported ${selected.size} leads (demo)` })}>
            Export{selected.size ? ` ${selected.size}` : ""}
          </Button>
        }
      />
      <Table
          caption="Leads"
          columns={columns}
          rows={pageRows}
          getRowId={(l) => l.id}
          selectedIds={selected}
          onSelectionChange={setSelected}
          getRowLabel={(l) => `Select ${l.name}`}
          sort={sort}
          onSortChange={setSort}
          empty={<EmptyState icon={<Inbox strokeWidth={1.6} />} title="No leads match" description="Try clearing a filter or searching for something else." />}
        />
      <Pagination page={page} pageSize={PAGE_SIZE} totalItems={filtered.length} onPageChange={setPage} />
    </div>
  );
}
