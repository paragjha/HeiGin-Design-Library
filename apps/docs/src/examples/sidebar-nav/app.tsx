import { useState } from "react";
import { BarChart3, Bot, Building2, CalendarCheck, FileText, Inbox, KanbanSquare, Settings, Users, Wallet } from "lucide-react";
import { SidebarNav } from "@heigin/ui";

const icon = (Icon: typeof Inbox) => <Icon strokeWidth={1.6} />;

export default function AppSidebar() {
  const [current, setCurrent] = useState("#today");
  return (
    <div style={{ width: 240, padding: 12, background: "var(--hg-color-sidebar)", border: "1px solid var(--hg-color-border)", borderRadius: 8 }}>
      <SidebarNav
        currentHref={current}
        renderLink={(props) => (
          <a
            {...props}
            onClick={(e) => {
              e.preventDefault();
              setCurrent(props.href);
            }}
          />
        )}
        groups={[
          {
            items: [
              { label: "Today", href: "#today", icon: icon(CalendarCheck) },
              { label: "Inbox", href: "#inbox", icon: icon(Inbox), count: 7 },
              { label: "Pipeline", href: "#pipeline", icon: icon(KanbanSquare) },
            ],
          },
          {
            label: "Customers",
            items: [
              { label: "Accounts", href: "#accounts", icon: icon(Building2) },
              { label: "Contacts", href: "#contacts", icon: icon(Users) },
            ],
          },
          {
            label: "Money",
            items: [
              { label: "Quotes", href: "#quotes", icon: icon(FileText) },
              { label: "Receivables", href: "#receivables", icon: icon(Wallet) },
            ],
          },
          {
            label: "Workspace",
            items: [
              { label: "Agent", href: "#agent", icon: icon(Bot) },
              { label: "Reports", href: "#reports", icon: icon(BarChart3) },
              { label: "Settings", href: "#settings", icon: icon(Settings) },
            ],
          },
        ]}
      />
    </div>
  );
}
