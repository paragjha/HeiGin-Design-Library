import { createNode } from "./blocks";
import { node, type BuilderDoc, type BuilderNode, type BuildMode, type PropValue } from "./model";

/** Node with a block's defaults, overridden by `props`. */
const b = (type: string, props: Record<string, PropValue> = {}, children?: BuilderNode[]): BuilderNode => {
  const n = createNode(type);
  return { ...n, props: { ...n.props, ...props }, children: children ?? n.children };
};
const btn = (label: string, variant: string, icon = "none") => b("button", { label, variant, size: "sm", icon });

export interface Template {
  id: string;
  label: string;
  mode: BuildMode;
  description: string;
  build: () => BuilderDoc;
}

export const TEMPLATES: Template[] = [
  {
    id: "leads-page",
    label: "Leads list",
    mode: "page",
    description: "Header with actions, filter toolbar, selectable paginated table.",
    build: () => ({
      mode: "page",
      name: "LeadsPage",
      root: node("page", {}, [
        b("pageHeader", { title: "Leads", description: "Track and convert incoming leads." }, [btn("Import", "secondary", "Upload"), btn("New lead", "primary", "Plus")]),
        b("filterToolbar"),
        b("table", { dataset: "leads", caption: "Leads" }),
      ]),
    }),
  },
  {
    id: "dashboard-page",
    label: "Dashboard",
    mode: "page",
    description: "KPI strip, activity and tasks.",
    build: () => ({
      mode: "page",
      name: "DashboardPage",
      root: node("page", {}, [
        b("pageHeader", { title: "Dashboard", description: "Pipeline, conversion and team performance at a glance." }, []),
        b("metricGroup", { label: "Pipeline summary", columns: 4 }),
        b("grid", { responsive: true, minWidth: 320 }, [
          b("card", { title: "Recent activity" }, [b("activityTimeline")]),
          b("card", { title: "My tasks", padding: "none" }, [b("taskList")]),
        ]),
      ]),
    }),
  },
  {
    id: "deal-page",
    label: "Deal detail",
    mode: "page",
    description: "Record header, stage, tabs, timeline and details panel.",
    build: () => ({
      mode: "page",
      name: "DealDetailPage",
      root: node("page", {}, [
        b("pageHeader", { title: "Kaveri Textiles — 40 looms", description: "Stage: Proposal" }, [btn("Task", "secondary", "Plus"), btn("Move stage", "secondary")]),
        b("dealStage"),
        b("grid", { responsive: true, minWidth: 300 }, [
          b("stack", { gap: "4" }, [b("tabs", { tabs: "Overview\nActivity" }), b("activityTimeline"), b("approvalCard")]),
          b("card", { title: "Deal details" }, [b("detailList")]),
        ]),
      ]),
    }),
  },
  {
    id: "settings-section",
    label: "Settings form",
    mode: "section",
    description: "Labelled fields, switch and form actions.",
    build: () => ({
      mode: "section",
      name: "WorkspaceSettings",
      root: node("section", { title: "Workspace details", gap: "4" }, [
        b("grid", { responsive: true, minWidth: 240 }, [
          b("input", { label: "Legal name", placeholder: "Northwind Industrial Pvt Ltd" }),
          b("input", { label: "GSTIN", placeholder: "27AAPFU0939F1ZV", description: "15 characters" }),
        ]),
        b("textarea", { label: "Registered address", rows: 3 }),
        b("nativeSelect", { label: "Default owner" }),
        b("switch", { label: "Auto-assign new leads" }),
        b("stack", { direction: "row", justify: "end", gap: "2" }, [btn("Cancel", "secondary"), btn("Save changes", "primary")]),
      ]),
    }),
  },
  {
    id: "app-page",
    label: "App layout",
    mode: "page",
    description: "Sidebar navigation with a list page inside.",
    build: () => ({
      mode: "page",
      name: "LeadsApp",
      root: b("appShell", {}, [
        b("pageHeader", { title: "Leads", description: "Track and convert incoming leads." }, [btn("New lead", "primary", "Plus")]),
        b("table", { dataset: "leads", caption: "Leads", selectable: false }),
      ]),
    }),
  },
  {
    id: "lead-form-section",
    label: "Lead form",
    mode: "section",
    description: "Validated form with required fields, mobile and email checks.",
    build: () => ({
      mode: "section",
      name: "NewLeadForm",
      root: node("section", { title: "New lead", gap: "4" }, [
        b("form", { submitLabel: "Create lead", cancelLabel: "Cancel" }, [
          b("grid", { responsive: true, minWidth: 220 }, [
            b("input", { label: "Name", required: true, placeholder: "Asha Rao" }),
            b("input", { label: "Company", placeholder: "Kaveri Textiles" }),
          ]),
          b("grid", { responsive: true, minWidth: 220 }, [
            b("input", { label: "Mobile", required: true, validate: "phone-in", placeholder: "98765 43210" }),
            b("input", { label: "Email", validate: "email", type: "email", placeholder: "asha@kaveritextiles.in" }),
          ]),
          b("input", { label: "GSTIN", validate: "gstin", description: "Optional, 15 characters", placeholder: "33AAACK1234F1Z5" }),
          b("nativeSelect", { label: "Source", required: true, placeholder: "Choose source", options: "WhatsApp\nWebsite form\nIndiaMART\nReferral" }),
          b("textarea", { label: "Notes", rows: 3 }),
        ]),
      ]),
    }),
  },
  {
    id: "sidebar-only",
    label: "Sidebar",
    mode: "component",
    description: "Grouped navigation sidebar with icons, to drop into your own app shell.",
    build: () => ({ mode: "component", name: "AppSidebar", root: node("fragment", {}, [b("sidebar")]) }),
  },
  {
    id: "blank-page",
    label: "Blank page",
    mode: "page",
    description: "Empty page container.",
    build: () => ({ mode: "page", name: "MyPage", root: node("page", {}, [b("pageHeader", { title: "New page", description: "" }, [])]) }),
  },
  {
    id: "blank-section",
    label: "Blank section",
    mode: "section",
    description: "Empty section.",
    build: () => ({ mode: "section", name: "MySection", root: node("section", { title: "Section", gap: "4" }, []) }),
  },
  {
    id: "component",
    label: "Single component",
    mode: "component",
    description: "Configure one component and copy it.",
    build: () => ({ mode: "component", name: "MyComponent", root: node("fragment", {}, [b("approvalCard")]) }),
  },
];

export const defaultDoc = () => TEMPLATES[0]!.build();
