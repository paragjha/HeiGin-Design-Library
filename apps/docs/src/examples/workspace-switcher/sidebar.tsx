import { useState } from "react";
import { BarChart3, CalendarCheck, Inbox, KanbanSquare } from "lucide-react";
import { SidebarNav, WorkspaceSwitcher, type Workspace } from "@heigin/ui";

const OWNED: Workspace[] = [
  { id: "specialized", name: "specialized.com", initials: "S", accent: "#dc2626" },
];
const EXTERNAL: Workspace[] = [
  { id: "trek", name: "trekbikes.com", initials: "T", accent: "#475569" },
  { id: "canyon", name: "canyon.com", initials: "C", accent: "#475569" },
];

export default function SidebarWithSwitcher() {
  const [current, setCurrent] = useState<Workspace>(OWNED[0]!);
  const [page, setPage] = useState("#today");
  return (
    <div
      style={{
        width: 240,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "var(--hg-color-sidebar)",
        border: "1px solid var(--hg-color-border)",
        borderRadius: 8,
      }}
    >
      <WorkspaceSwitcher
        current={current}
        owned={OWNED}
        external={EXTERNAL}
        onSelect={setCurrent}
        onNew={() => {}}
        onViewAll={() => {}}
      />
      <SidebarNav
        currentHref={page}
        renderLink={(props) => (
          <a
            {...props}
            onClick={(e) => {
              e.preventDefault();
              setPage(props.href);
            }}
          />
        )}
        groups={[
          {
            items: [
              { label: "Today", href: "#today", icon: <CalendarCheck strokeWidth={1.6} /> },
              { label: "Inbox", href: "#inbox", icon: <Inbox strokeWidth={1.6} />, count: 7 },
              { label: "Pipeline", href: "#pipeline", icon: <KanbanSquare strokeWidth={1.6} /> },
              { label: "Reports", href: "#reports", icon: <BarChart3 strokeWidth={1.6} /> },
            ],
          },
        ]}
      />
    </div>
  );
}
