import { useState, type AnchorHTMLAttributes } from "react";
import {
  ArrowLeftRight,
  Bot,
  Building2,
  CalendarCheck,
  ChartNoAxesCombined,
  Contrast,
  FolderClosed,
  Gauge,
  Inbox,
  KanbanSquare,
  Layers,
  LayoutPanelLeft,
  LifeBuoy,
  Megaphone,
  MonitorSmartphone,
  PenLine,
  ScanEye,
  Settings,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { AppSidebar, HeiGinMark, WorkspaceSwitcher, type Workspace } from "@heigin/ui";

const WORKSPACES: Workspace[] = [
  { id: "northwind", name: "Northwind", caption: "northwind.heigin.com", accent: "#1f1f1f" },
  { id: "kaveri", name: "Kaveri Textiles", caption: "kaveri.heigin.com", accent: "#b45309" },
  { id: "meridian", name: "Meridian Labs", caption: "meridian.heigin.com", accent: "#2563eb" },
];

/** Demo only: links update the highlight instead of navigating. */
export default function AppSidebarWorkspace() {
  const [current, setCurrent] = useState("#pipeline");
  const [area, setArea] = useState("#area-sales");
  const [workspace, setWorkspace] = useState(WORKSPACES[0]!);
  const [drafts, setDrafts] = useState(10);
  const go = (set: (href: string) => void) => (props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      {...props}
      onClick={(e) => {
        e.preventDefault();
        set(props.href);
      }}
    />
  );
  const linkTo = (href: string) => (href.startsWith("#area-") ? go(setArea) : go(setCurrent));

  return (
    <div style={{ height: 640, width: "100%", maxWidth: 340, border: "1px solid var(--hg-color-border)", borderRadius: 14, overflow: "hidden" }}>
      <AppSidebar
        brand={<HeiGinMark size={36} title="HeiGin" />}
        currentRail={area}
        rail={[
          [
            { label: "Sales", href: "#area-sales", icon: <ScanEye /> },
            { label: "Files", href: "#area-files", icon: <FolderClosed /> },
            { label: "Automations", href: "#area-automations", icon: <Layers /> },
          ],
          [{ label: "Notes", href: "#area-notes", icon: <PenLine /> }],
          [{ label: "Layouts", href: "#area-layouts", icon: <LayoutPanelLeft /> }],
          [
            { label: "Reports", href: "#area-reports", icon: <Gauge /> },
            { label: "Tags", href: "#area-tags", icon: <Tags /> },
            { label: "People", href: "#area-people", icon: <Users /> },
            { label: "Agents", href: "#area-agents", icon: <Bot /> },
          ],
        ]}
        railFooter={[
          { label: "Help", href: "#area-help", icon: <LifeBuoy /> },
          { label: "Settings", href: "#area-settings", icon: <Settings /> },
        ]}
        header={
          <>
            <WorkspaceSwitcher variant="stacked" current={workspace} owned={WORKSPACES} onSelect={setWorkspace} onNew={() => {}} />
            <a href="#switch" onClick={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 8px 0", fontSize: 12.5, color: "var(--hg-color-muted)", textDecoration: "none" }}>
              <ArrowLeftRight size={14} aria-hidden="true" /> Switch workspaces
            </a>
          </>
        }
        currentHref={current}
        renderLink={(props) => linkTo(props.href)(props)}
        groups={[
          {
            items: [
              { label: "Inbox", href: "#inbox", icon: <Inbox /> },
              { label: "Pipeline", href: "#pipeline", icon: <ChartNoAxesCombined /> },
              { label: "Deals", href: "#deals", icon: <KanbanSquare /> },
              { label: "Companies", href: "#companies", icon: <Building2 /> },
              { label: "Tasks", href: "#tasks", icon: <CalendarCheck /> },
              { label: "Payments", href: "#payments", icon: <Wallet /> },
            ],
          },
          {
            items: [
              {
                label: "Campaigns",
                href: "#campaigns",
                icon: <Megaphone />,
                onAdd: () => setDrafts((d) => d + 1),
                addLabel: "New campaign",
                children: [
                  { label: "Drafts", href: "#drafts", count: drafts },
                  { label: "Scheduled", href: "#scheduled", count: 2 },
                  { label: "Sent", href: "#sent", count: 28 },
                ],
              },
              { label: "Pages", href: "#pages", icon: <MonitorSmartphone />, onAdd: () => {}, addLabel: "New page" },
            ],
          },
          {
            items: [
              { label: "Performance", href: "#performance", icon: <Gauge /> },
              { label: "Team", href: "#team", icon: <Users /> },
              { label: "Customize", href: "#customize", icon: <Contrast /> },
            ],
          },
        ]}
      />
    </div>
  );
}
