import { useMemo, useState } from "react";
import { Download, Filter, Inbox, Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { Avatar, Badge, Button, EmptyState, IconButton, Pagination, SearchInput, Tab, Table, Tabs, TabsList, type SortState, type TableColumn } from "@heigin/ui";

interface Lead {
  id: string;
  name: string;
  company: string;
  stage: "New" | "Qualified" | "Proposal";
  value: number;
  owner: string;
}

const LEADS: Lead[] = [
  { id: "L-1001", name: "Asha Rao", company: "Kaveri Textiles", stage: "Qualified", value: 849600, owner: "Meera S" },
  { id: "L-1002", name: "Vikram Iyer", company: "Iyer & Sons Pumps", stage: "New", value: 120000, owner: "Arjun K" },
  { id: "L-1003", name: "Neha Kapoor", company: "BluePeak Logistics", stage: "Proposal", value: 2310000, owner: "Meera S" },
  { id: "L-1004", name: "Rohan Mehta", company: "Mehta Agro", stage: "New", value: 64000, owner: "Arjun K" },
  { id: "L-1005", name: "Priya Nair", company: "Coastline Foods", stage: "Qualified", value: 410000, owner: "Ritu P" },
  { id: "L-1006", name: "Imran Shaikh", company: "Shaikh Fabrication", stage: "Proposal", value: 1575000, owner: "Ritu P" },
];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const tone = { New: "info", Qualified: "success", Proposal: "warning" } as const;

const columns: TableColumn<Lead>[] = [
  {
    id: "name",
    header: "Lead",
    sortable: true,
    cell: (r) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Avatar name={r.name} size="sm" decorative />
        <span>
          <a href={`#lead-${r.id}`} style={{ color: "inherit", fontWeight: 500 }}>
            {r.name}
          </a>
          <br />
          <span style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>{r.company}</span>
        </span>
      </span>
    ),
  },
  { id: "stage", header: "Stage", cell: (r) => <Badge tone={tone[r.stage]}>{r.stage}</Badge> },
  { id: "owner", header: "Owner", hideOnMobile: true },
  { id: "value", header: "Value", align: "end", numeric: true, sortable: true, cell: (r) => inr.format(r.value) },
];

const PAGE_SIZE = 4;

export default function TableStates() {
  const [view, setView] = useState("populated");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return LEADS;
    const q = query.toLowerCase();
    return LEADS.filter((l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));
  }, [query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const key = sort.columnId as keyof Lead;
      return a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0;
    });
  }, [sort, filtered]);
  const rows = view === "empty" ? [] : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Tabs value={view} onValueChange={setView}>
        <TabsList variant="pill" aria-label="Table state">
          <Tab value="populated">Populated</Tab>
          <Tab value="loading">Loading</Tab>
          <Tab value="empty">Empty</Tab>
        </TabsList>
      </Tabs>
      <Table
        caption="Open leads"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        loading={view === "loading"}
        toolbar={
          <>
            <SearchInput value={query} onValueChange={setQuery} placeholder="Search leads" style={{ maxWidth: 240 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="sm" variant="secondary" leadingIcon={<Filter strokeWidth={1.6} />}>Filter</Button>
              <Button size="sm" variant="secondary" leadingIcon={<Download strokeWidth={1.6} />}>Export</Button>
              <Button size="sm" leadingIcon={<Plus strokeWidth={1.6} />}>Add Lead</Button>
            </div>
          </>
        }
        footer={
          view === "populated" ? (
            <>
              <span>Showing {from} to {to} of {filtered.length} entries</span>
              <Pagination page={page} pageSize={PAGE_SIZE} totalItems={filtered.length} onPageChange={setPage} />
            </>
          ) : undefined
        }
        selectedIds={selected}
        onSelectionChange={setSelected}
        getRowLabel={(r) => `Select ${r.name}`}
        sort={sort}
        onSortChange={setSort}
        bulkActions={(count, clear) => (
          <>
            <Button size="sm" variant="secondary" leadingIcon={<Mail strokeWidth={1.6} />}>
              Email {count}
            </Button>
            <Button size="sm" variant="danger" leadingIcon={<Trash2 strokeWidth={1.6} />}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={clear}>
              Clear
            </Button>
          </>
        )}
        rowActions={(row) => (
          <>
            <IconButton label={`Edit ${row.name}`} icon={<Pencil strokeWidth={1.6} />} size="sm" />
            <IconButton label={`Email ${row.name}`} icon={<Mail strokeWidth={1.6} />} size="sm" />
          </>
        )}
        empty={
          <EmptyState
            icon={<Inbox strokeWidth={1.6} />}
            title="No open leads"
            description="New WhatsApp and website enquiries will appear here."
            action={<Button size="sm">Add lead</Button>}
          />
        }
      />
    </div>
  );
}
