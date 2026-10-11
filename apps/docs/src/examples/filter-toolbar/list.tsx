import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button, FilterChip, FilterToolbar } from "@heigin/ui";

const leads = [
  { name: "Asha Rao", hot: true, owner: "Meera S" },
  { name: "Vikram Iyer", hot: false, owner: null },
  { name: "Neha Kapoor", hot: true, owner: "Arjun K" },
  { name: "Rohan Mehta", hot: false, owner: "Meera S" },
  { name: "Priya Nair", hot: false, owner: null },
];

export default function LeadFilters() {
  const [query, setQuery] = useState("");
  const [hot, setHot] = useState(false);
  const [unassigned, setUnassigned] = useState(false);
  const [owner, setOwner] = useState<string | null>("Meera S");

  const visible = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) && (!hot || l.hot) && (!unassigned || !l.owner) && (!owner || l.owner === owner),
      ),
    [query, hot, unassigned, owner],
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        searchLabel="Search leads"
        searchPlaceholder="Search leads"
        chips={
          <>
            <FilterChip pressed={hot} onPressedChange={setHot} count={leads.filter((l) => l.hot).length}>
              Hot
            </FilterChip>
            <FilterChip pressed={unassigned} onPressedChange={setUnassigned}>
              Unassigned
            </FilterChip>
            {owner && <FilterChip onRemove={() => setOwner(null)}>Owner: {owner}</FilterChip>}
          </>
        }
        scope={`Showing ${visible.length} of ${leads.length}`}
        actions={
          <Button variant="secondary" size="sm" leadingIcon={<Download strokeWidth={1.6} />}>
            Export
          </Button>
        }
      />
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
        {visible.map((l) => (
          <li key={l.name}>{l.name}</li>
        ))}
      </ul>
    </div>
  );
}
