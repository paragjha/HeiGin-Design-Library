import { Mail, MessageSquare, Phone } from "lucide-react";
import {
  ActivityItem,
  ActivityTimeline,
  ApprovalCard,
  Badge,
  Button,
  ChannelMark,
  ConversationListItem,
  DealStage,
  DetailList,
  FilterChip,
  FilterToolbar,
  MetricCard,
  MetricGroup,
  MoneyValue,
  PageHeader,
  RecordHeader,
  SidebarNav,
  StatusBadge,
  TaskRow,
  WorkspaceSwitcher,
  type Channel,
  type StatusKey,
  type Workspace,
} from "@heigin/ui";
import { definePlayground } from "../components/Playground";
import type { ComponentDocEntry } from "./types";

const q = (s: string) => JSON.stringify(s);

const SPEC = "Specified in the HeiGin product context (heigin-crm/docs/heigin-product-context.md §6.1) and the earlier heigin-ui shell; live CRM screens not yet inspected.";

const SIDEBAR_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Today", href: "/today", count: 3 },
      { label: "Inbox", href: "/inbox", count: 12 },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Pipeline", href: "/pipeline" },
      { label: "Leads", href: "/leads" },
      { label: "Deals", href: "/deals" },
    ],
  },
];

export const patternDocs: ComponentDocEntry[] = [
  {
    slug: "page-header",
    title: "Page header",
    group: "CRM patterns",
    manifest: "page-header",
    propsFor: ["PageHeader"],
    description: "Page title (h1), one line of context, and the page's actions.",
    evidence: "observed",
    evidenceNote: "Every list page: title 24px/500 (22px on mobile) with -0.02em tracking, a 13px muted description, and 28px small buttons on the right (secondary + primary).",
    states: ["with actions", "title only"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Leads" },
        description: { type: "text", label: "Description", default: "342 total · 24 new this week" },
        showActions: { type: "boolean", label: "Show actions", default: true },
      },
      render: (v) => (
        <PageHeader
          title={v.title}
          description={v.description || undefined}
          actions={v.showActions ? <><Button variant="secondary" size="sm">Export</Button><Button size="sm">Add lead</Button></> : undefined}
        />
      ),
      code: (v) =>
        `import { Button, PageHeader } from "@heigin/ui";\n\n<PageHeader\n  title=${q(v.title)}${v.description ? `\n  description=${q(v.description)}` : ""}${v.showActions ? '\n  actions={<>\n    <Button variant="secondary" size="sm">Export</Button>\n    <Button size="sm">Add lead</Button>\n  </>}' : ""}\n/>`,
    }),
    examples: [{ file: "basic", title: "Leads page header" }],
    a11y: ["Exactly one h1 per page.", "Actions wrap below the title on narrow screens rather than overflowing."],
  },
  {
    slug: "metric-card",
    title: "Metric card",
    group: "CRM patterns",
    manifest: "metric-card",
    propsFor: ["MetricCard", "MetricGroup"],
    description: "One headline number with its label, an optional trend and a hint. Used in summary strips (Today, Pulse, Reports).",
    evidence: "observed",
    evidenceNote: "Dashboard KPI strip: one bordered surface split into cells (2 columns, 5 from 1024px). Each cell: 16px padding, icon + 12.5px muted label, 24px/500 tabular value, 12px muted hint; overdue values in danger.",
    states: ["default", "danger", "warning", "success", "with trend"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Label", default: "Open pipeline" },
        value: { type: "text", label: "Value", default: "₹23.1L" },
        hint: { type: "text", label: "Hint", default: "18 open deals" },
        tone: { type: "select", label: "Tone", options: ["default", "danger", "warning", "success"], default: "default" },
      },
      render: (v) => (
        <MetricGroup columns={1}>
          <MetricCard label={v.label} value={v.value} hint={v.hint || undefined} tone={v.tone as "default" | "danger" | "warning" | "success"} />
        </MetricGroup>
      ),
      code: (v) =>
        `import { MetricCard, MetricGroup } from "@heigin/ui";\n\n<MetricGroup>\n  <MetricCard\n    label=${q(v.label)}\n    value=${q(v.value)}${v.hint ? `\n    hint=${q(v.hint)}` : ""}${v.tone !== "default" ? `\n    tone=${q(v.tone)}` : ""}\n  />\n</MetricGroup>`,
    }),
    examples: [{ file: "strip", title: "Dashboard KPI strip" }],
    a11y: [
      "Trend direction is conveyed with an icon and words (12%), not colour alone.",
      "Use the `good` flag when down is good, e.g. reply time.",
    ],
  },
  {
    slug: "money-value",
    title: "Money value",
    group: "CRM patterns",
    manifest: "money-value",
    propsFor: ["MoneyValue"],
    description: "The only sanctioned way to render money: Indian digit grouping (₹8,49,600) or compact lakh/crore (₹8.5L), with tabular numerals.",
    evidence: "observed",
    evidenceNote: "Production shows compact lakh/crore amounts without a space (₹10.1L, ₹59.1Cr) and full amounts with Indian grouping (₹4,35,000).",
    states: ["full", "compact", "with paise"],
    playground: definePlayground({
      controls: {
        amount: { type: "text", label: "Amount", default: "849600" },
        format: { type: "select", label: "Format", options: ["full", "compact"], default: "full" },
        withPaise: { type: "boolean", label: "With paise", default: false },
      },
      render: (v) => (
        <span style={{ fontSize: 20, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          <MoneyValue amount={Number(v.amount) || 0} format={v.format as "full" | "compact"} withPaise={v.withPaise} />
        </span>
      ),
      code: (v) =>
        `import { MoneyValue } from "@heigin/ui";\n\n<MoneyValue amount={${v.amount}}${v.format !== "full" ? ` format=${q(v.format)}` : ""}${v.withPaise ? " withPaise" : ""} />`,
    }),
    examples: [{ file: "formats", title: "Formats" }],
    a11y: ["The compact form keeps the full amount in a title and in visually hidden text for screen readers."],
  },
  {
    slug: "status-badge",
    title: "Status badge and SLA clock",
    group: "CRM patterns",
    manifest: "status-badge",
    propsFor: ["StatusBadge", "SLAClock"],
    description: "Statuses come from one shared registry: tint + ink + icon + word. SLAClock shows the first-reply countdown.",
    evidence: "observed",
    evidenceNote: "Statuses appear as lowercase values (new, open, duplicate) in neutral or info badges, with an optional leading dot. The registry labels here are Title Case — confirm preferred casing with product.",
    states: ["each registry status", "on track", "due soon", "breached"],
    playground: definePlayground({
      controls: {
        status: {
          type: "select",
          label: "Status",
          options: ["new", "contacted", "qualified", "not_interested", "won", "lost", "draft", "approved", "rejected", "overdue"],
          default: "qualified",
        },
        hideIcon: { type: "boolean", label: "Hide icon", default: false },
      },
      render: (v) => <StatusBadge status={v.status as StatusKey} hideIcon={v.hideIcon} />,
      code: (v) =>
        `import { StatusBadge } from "@heigin/ui";\n\n<StatusBadge status=${q(v.status)}${v.hideIcon ? " hideIcon" : ""} />`,
    }),
    examples: [{ file: "registry", title: "Registry and SLA states" }],
    a11y: ["Every status has a word; the icon is decorative.", "SLAClock always announces its state word, even when it is visually hidden."],
  },
  {
    slug: "channel-mark",
    title: "Channel mark and trust rung",
    group: "CRM patterns",
    manifest: "channel-mark",
    propsFor: ["ChannelMark", "TrustRungBadge"],
    description: "Where a lead or conversation came from, and the AI agent's autonomy level for a capability.",
    evidence: "proposed",
    evidenceNote: `${SPEC} Trust-rung labels are the canonical ones from the product context (Read only, Propose, Act with review, Autonomous).`,
    states: ["icon + label", "icon only", "rungs R0–R3"],
    playground: definePlayground({
      controls: {
        channel: { type: "select", label: "Channel", options: ["whatsapp", "email", "sms", "call", "web_form", "indiamart"], default: "whatsapp" },
        display: { type: "select", label: "Display", options: ["icon-label", "icon"], default: "icon-label" },
      },
      render: (v) => <ChannelMark channel={v.channel as Channel} display={v.display as "icon-label" | "icon"} />,
      code: (v) =>
        `import { ChannelMark } from "@heigin/ui";\n\n<ChannelMark channel=${q(v.channel)}${v.display !== "icon-label" ? ` display=${q(v.display)}` : ""} />`,
    }),
    examples: [{ file: "marks", title: "Channels and rungs" }],
    a11y: ["Icon-only channel marks keep the channel name as role=\"img\" with aria-label.", "WhatsApp green is a channel identity, never a success colour."],
  },
  {
    slug: "approval-card",
    title: "Approval card",
    group: "CRM patterns",
    manifest: "approval-card",
    propsFor: ["ApprovalCard"],
    description: "An approval request: what, why, who asked, the proposed change, then Approve / Reject with an in-place outcome and Undo.",
    evidence: "proposed",
    evidenceNote: `${SPEC} Mirrors Flow 4 (agent proposal: approve, edit, dismiss, undo) and quote discount approvals in Flow 3.`,
    states: ["pending", "approving (loading)", "approved", "rejected", "irreversible warning"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Apply 12% discount to Q-1042" },
        reason: { type: "text", label: "Reason", default: "Repeat buyer above ₹10L annual spend." },
        requestedBy: { type: "text", label: "Requested by", default: "Meera S" },
      },
      render: (v) => (
        <div style={{ maxWidth: 520 }}>
          <ApprovalCard
            title={v.title}
            reason={v.reason}
            requestedBy={v.requestedBy}
            changes={[{ field: "Discount", from: "5%", to: "12%" }]}
            onApprove={() => {}}
            onReject={() => {}}
          />
        </div>
      ),
      code: (v) =>
        `import { ApprovalCard } from "@heigin/ui";\n\n<ApprovalCard\n  title=${q(v.title)}\n  reason=${q(v.reason)}\n  requestedBy=${q(v.requestedBy)}\n  changes={[{ field: "Discount", from: "5%", to: "12%" }]}\n  onApprove={handleApprove}\n  onReject={handleReject}\n/>`,
    }),
    examples: [{ file: "basic", title: "Discount and reminder approvals", description: "Demo only — nothing is sent." }],
    a11y: [
      "The card is an article labelled by its title.",
      "Before/after values use <del> and <ins>, with hidden \"from\" and \"to\" words.",
      "The outcome is announced in a status region.",
      "Irreversible actions say so before the button is pressed.",
    ],
  },
  {
    slug: "task-row",
    title: "Task row",
    group: "CRM patterns",
    manifest: "task-row",
    propsFor: ["TaskRow"],
    description: "A to-do in a list: complete checkbox, title, related record, due date and an optional assignee.",
    evidence: "inferred",
    evidenceNote: "Today \"Tasks due / overdue\": 40px flat rows with a task icon, title, a related-record chip and a due date (red when overdue). The completion checkbox is an extension.",
    states: ["open", "done", "overdue", "clickable"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Follow up with Asha Rao" },
        due: { type: "text", label: "Due", default: "Tomorrow" },
        done: { type: "boolean", label: "Done", default: false },
        overdue: { type: "boolean", label: "Overdue", default: false },
      },
      render: (v) => (
        <div style={{ maxWidth: 480 }}>
          <TaskRow title={v.title} due={v.due || undefined} done={v.done} overdue={v.overdue} onDoneChange={() => {}} />
        </div>
      ),
      code: (v) =>
        `import { TaskRow } from "@heigin/ui";\n\n<TaskRow\n  title=${q(v.title)}${v.due ? `\n  due=${q(v.due)}` : ""}${v.done ? "\n  done" : "\n  done={false}"}${v.overdue ? "\n  overdue" : ""}\n  onDoneChange={setDone}\n/>`,
    }),
    examples: [{ file: "list", title: "My tasks" }],
    a11y: [
      "The checkbox label names the task and the resulting state (Mark \"…\" as done).",
      "Overdue is written out in words, not shown by colour alone.",
    ],
  },
  {
    slug: "conversation-list-item",
    title: "Conversation list item",
    group: "CRM patterns",
    manifest: "conversation-list-item",
    propsFor: ["ConversationListItem"],
    description: "One thread in the inbox: contact, last message, channel, time, unread state and SLA.",
    evidence: "proposed",
    evidenceNote: `${SPEC} Inbox lanes live at /inbox/:lane (unassigned, mine, waiting).`,
    states: ["read", "unread", "selected", "with SLA"],
    playground: definePlayground({
      controls: {
        name: { type: "text", label: "Name", default: "Asha Rao" },
        preview: { type: "text", label: "Preview", default: "Thanks, I'll review the quote and get back to you." },
        channel: { type: "select", label: "Channel", options: ["whatsapp", "email", "sms", "call"], default: "whatsapp" },
        unread: { type: "boolean", label: "Unread", default: true },
      },
      render: (v) => (
        <div style={{ maxWidth: 400, border: "1px solid var(--hg-color-border)", borderRadius: 8 }}>
          <ConversationListItem
            name={v.name}
            preview={v.preview}
            channel={v.channel as Channel}
            timeLabel="2m ago"
            dateTime="2026-10-18T10:30:00"
            unreadCount={v.unread ? 2 : 0}
            href="#"
          />
        </div>
      ),
      code: (v) =>
        `import { ConversationListItem } from "@heigin/ui";\n\n<ConversationListItem\n  name=${q(v.name)}\n  preview=${q(v.preview)}\n  channel=${q(v.channel)}\n  timeLabel="2m ago"\n  dateTime="2026-10-18T10:30:00"${v.unread ? "\n  unreadCount={2}" : ""}\n  href="/inbox/123"\n/>`,
    }),
    examples: [{ file: "inbox", title: "Inbox lane" }],
    a11y: [
      "The whole row is clickable through a single stretched link, so there is one tab stop per row.",
      "The unread count is part of the link name.",
      "The selected row uses aria-current.",
    ],
  },
  {
    slug: "activity-timeline",
    title: "Activity timeline",
    group: "CRM patterns",
    manifest: "activity-timeline",
    propsFor: ["ActivityTimeline", "ActivityItem"],
    description: "Chronological record history: messages, calls, stage changes, quotes and agent actions.",
    evidence: "proposed",
    evidenceNote: `${SPEC} Listed as "Timeline" among the composed generics.`,
    states: ["entry", "entry with detail"],
    playground: definePlayground({
      controls: {
        label: { type: "text", label: "Timeline label", default: "Lead activity" },
      },
      render: (v) => (
        <ActivityTimeline label={v.label}>
          <ActivityItem icon={<Phone size={14} strokeWidth={1.6} />} dateTime="2026-10-18T11:00:00" timeLabel="11:00 AM">
            <strong>Meera S</strong> called Asha Rao — discussed pricing
          </ActivityItem>
          <ActivityItem icon={<MessageSquare size={14} strokeWidth={1.6} />} dateTime="2026-10-17T16:30:00" timeLabel="Yesterday">
            <strong>Agent</strong> sent WhatsApp follow-up
          </ActivityItem>
          <ActivityItem icon={<Mail size={14} strokeWidth={1.6} />} dateTime="2026-10-16T09:15:00" timeLabel="16 Oct">
            <strong>Asha Rao</strong> replied to quote email
          </ActivityItem>
        </ActivityTimeline>
      ),
      code: (v) =>
        `import { Phone, MessageSquare, Mail } from "lucide-react";\nimport { ActivityTimeline, ActivityItem } from "@heigin/ui";\n\n<ActivityTimeline label=${q(v.label)}>\n  <ActivityItem icon={<Phone size={14} />} dateTime="…" timeLabel="11:00 AM">\n    <strong>Meera S</strong> called Asha Rao\n  </ActivityItem>\n  <ActivityItem icon={<MessageSquare size={14} />} dateTime="…" timeLabel="Yesterday">\n    <strong>Agent</strong> sent WhatsApp follow-up\n  </ActivityItem>\n</ActivityTimeline>`,
    }),
    examples: [{ file: "record", title: "Lead activity" }],
    a11y: ["An ordered list with an accessible name.", "Times are <time datetime> elements."],
  },
  {
    slug: "filter-toolbar",
    title: "Filter toolbar and chips",
    group: "CRM patterns",
    manifest: "filter-toolbar",
    propsFor: ["FilterToolbar", "FilterChip"],
    description: "Search, quick-filter chips and a scope line (\"Showing 24 of 61\") for list pages.",
    evidence: "proposed",
    evidenceNote: `${SPEC} Rule: "Scope disclosure on every list".`,
    states: ["chip off", "chip on", "applied filter (removable)", "searching"],
    playground: definePlayground({
      controls: {
        placeholder: { type: "text", label: "Placeholder", default: "Search leads" },
        scope: { type: "text", label: "Scope", default: "Showing 24 of 61" },
      },
      render: (v) => (
        <FilterToolbar
          query=""
          onQueryChange={() => {}}
          searchPlaceholder={v.placeholder}
          chips={<><FilterChip pressed>Hot</FilterChip><FilterChip>Unassigned</FilterChip><FilterChip onRemove={() => {}}>Owner: Meera S</FilterChip></>}
          scope={v.scope || undefined}
        />
      ),
      code: (v) =>
        `import { FilterToolbar, FilterChip } from "@heigin/ui";\n\n<FilterToolbar\n  query={query}\n  onQueryChange={setQuery}\n  searchPlaceholder=${q(v.placeholder)}\n  chips={<>\n    <FilterChip pressed={hot} onPressedChange={setHot}>Hot</FilterChip>\n    <FilterChip>Unassigned</FilterChip>\n  </>}${v.scope ? `\n  scope=${q(v.scope)}` : ""}\n/>`,
    }),
    examples: [{ file: "list", title: "Lead filters" }],
    a11y: [
      "Wrapped in role=\"search\".",
      "Toggle chips use aria-pressed; removable chips have a named remove button.",
      "The scope line is a polite live region.",
    ],
    responsive: "Search, chips and actions wrap onto separate lines on narrow screens.",
  },
  {
    slug: "record-header",
    title: "Record header and deal stage",
    group: "CRM patterns",
    manifest: "record-header",
    propsFor: ["RecordHeader", "DealStage"],
    description: "Top of a record detail page (breadcrumbs, name, status, key facts, actions) and the pipeline stage indicator.",
    evidence: "inferred",
    evidenceNote: "Deal detail: 24px/500 title with an icon, \"Stage: …\" subtitle, and small action buttons (+ Task, Move stage, more). No avatar or breadcrumbs were seen — those are extensions.",
    states: ["with breadcrumbs", "stage in progress", "compact", "lost"],
    playground: definePlayground({
      controls: {
        name: { type: "text", label: "Name", default: "Kaveri Textiles" },
        showAvatar: { type: "boolean", label: "Show avatar", default: true },
        showStage: { type: "boolean", label: "Show deal stage", default: true },
      },
      render: (v) => (
        <div style={{ display: "grid", gap: 12 }}>
          <RecordHeader
            name={v.name}
            showAvatar={v.showAvatar}
            breadcrumbs={[{ label: "Deals", href: "#" }, { label: v.name }]}
            status={<Badge tone="info" dot>Proposal</Badge>}
            meta={[<span key="v">₹8,49,600</span>, <span key="o">Meera S</span>]}
            actions={<><Button variant="secondary" size="sm">+ Task</Button><Button size="sm">Move stage</Button></>}
          />
          {v.showStage && (
            <DealStage stages={["Discovery", "Qualification", "Proposal", "Negotiation", "Closed"]} current="Proposal" />
          )}
        </div>
      ),
      code: (v) =>
        `import { RecordHeader${v.showStage ? ", DealStage" : ""}, Badge, Button } from "@heigin/ui";\n\n<RecordHeader\n  name=${q(v.name)}${v.showAvatar ? "" : "\n  showAvatar={false}"}\n  breadcrumbs={[{ label: "Deals", href: "/deals" }, { label: ${q(v.name)} }]}\n  status={<Badge tone="info" dot>Proposal</Badge>}\n  actions={<Button size="sm">Move stage</Button>}\n/>${v.showStage ? '\n<DealStage stages={["Discovery", "Qualification", "Proposal", "Negotiation", "Closed"]} current="Proposal" />' : ""}`,
    }),
    examples: [{ file: "deal", title: "Deal header" }],
    a11y: [
      "Breadcrumbs are a labelled nav, and the current item has aria-current=\"page\".",
      "DealStage states its position in words (\"Stage 3 of 5: Proposal\").",
    ],
  },
  {
    slug: "detail-list",
    title: "Detail list",
    group: "CRM patterns",
    manifest: "detail-list",
    propsFor: ["DetailList"],
    description: "Key/value facts for a record, as in the production \"Deal details\" side panel.",
    evidence: "observed",
    evidenceNote: "Deal detail side panel (320px): rows with a 14px icon and a 100px 12.5px muted label, 13px ink values, 12px row gap, 20px panel padding; status shown as a neutral dot badge.",
    states: ["text value", "link value", "badge value"],
    playground: definePlayground({
      controls: {
        labelWidth: { type: "select", label: "Label width", options: ["80px", "100px", "120px"], default: "100px" },
      },
      render: (v) => (
        <div style={{ maxWidth: 360 }}>
          <DetailList
            labelWidth={v.labelWidth}
            items={[
              { label: "Company", value: "Kaveri Textiles" },
              { label: "Value", value: "₹8,49,600" },
              { label: "Owner", value: "Meera S" },
              { label: "Status", value: <Badge tone="info" dot size="sm">Proposal</Badge> },
              { label: "Source", value: <ChannelMark channel="whatsapp" /> },
            ]}
          />
        </div>
      ),
      code: (v) =>
        `import { Badge, ChannelMark, DetailList } from "@heigin/ui";\n\n<DetailList${v.labelWidth !== "100px" ? ` labelWidth=${q(v.labelWidth)}` : ""} items={[\n  { label: "Company", value: "Kaveri Textiles" },\n  { label: "Value", value: "₹8,49,600" },\n  { label: "Status", value: <Badge tone="info" dot>Proposal</Badge> },\n]} />`,
    }),
    examples: [{ file: "deal", title: "Deal details panel" }],
    a11y: ["A real <dl>: each label/value pair is announced together.", "Icons are decorative."],
  },
  {
    slug: "sidebar-nav",
    title: "Sidebar navigation",
    group: "CRM patterns",
    manifest: "sidebar-nav",
    propsFor: ["SidebarNav"],
    description: "App navigation rail with groups, icons and counts. Supports a custom link renderer for client-side routers (Next.js Link).",
    evidence: "observed",
    evidenceNote: "240px #f7f7f7 rail with right border; groups (Overview, Sales, Customers, Work, Insights) labelled 12px muted; items 32px (44px on mobile), 13.5px/400 at 85% ink, 15px icons, current item #ebebeb with full ink. Production also has a collapse button and a mobile bottom tab bar (not included).",
    states: ["default", "hover", "current page", "with count"],
    playground: definePlayground({
      controls: {
        currentHref: { type: "select", label: "Current page", options: ["/today", "/inbox", "/pipeline", "/leads", "/deals"], default: "/leads" },
      },
      render: (v) => (
        <div style={{ width: 240, background: "var(--hg-color-sidebar)", borderRight: "1px solid var(--hg-color-border)", borderRadius: 8, padding: "8px 0" }}>
          <SidebarNav groups={SIDEBAR_GROUPS} currentHref={v.currentHref} />
        </div>
      ),
      code: (v) =>
        `import { SidebarNav } from "@heigin/ui";\n\nconst groups = [\n  { label: "Overview", items: [\n    { label: "Today", href: "/today", count: 3 },\n    { label: "Inbox", href: "/inbox", count: 12 },\n  ]},\n  { label: "Sales", items: [\n    { label: "Pipeline", href: "/pipeline" },\n    { label: "Leads", href: "/leads" },\n  ]},\n];\n\n<SidebarNav groups={groups} currentHref=${q(v.currentHref)} />`,
    }),
    examples: [{ file: "app", title: "HeiGin app rail" }],
    a11y: ["A labelled <nav> with grouped lists.", "The current page uses aria-current=\"page\"."],
    responsive: "Items grow to 44px below 1024px, where production moves navigation into a left drawer.",
  },
  {
    slug: "workspace-switcher",
    title: "Workspace switcher",
    group: "CRM patterns",
    manifest: "workspace-switcher",
    propsFor: ["WorkspaceSwitcher"],
    description:
      "Sidebar switcher for users with access to more than one HeiGin workspace. Picks a tenant without signing out and re-entering a subdomain. Pass the current workspace plus the user's owned and external workspaces; the component handles search, grouping and the New workspace / View all actions.",
    evidence: "proposed",
    evidenceNote:
      "The CRM app signs the user into one subdomain at a time, so multi-tenant users would otherwise log out and sign back in to switch. This sits at the top of the sidebar so switching is one click.",
    states: ["closed", "open with search", "owned only", "with external"],
    playground: definePlayground({
      controls: {
        currentId: { type: "select", label: "Active workspace", options: ["specialized", "trek", "canyon"], default: "specialized" },
        includeExternal: { type: "boolean", label: "Show external workspaces", default: true },
      },
      render: (v) => {
        const owned: Workspace[] = [{ id: "specialized", name: "specialized.com", initials: "S", accent: "#dc2626" }];
        const external: Workspace[] = v.includeExternal
          ? [
              { id: "trek", name: "trekbikes.com", initials: "T", accent: "#64748b" },
              { id: "canyon", name: "canyon.com", initials: "C", accent: "#64748b" },
            ]
          : [];
        const all = [...owned, ...external];
        const current = all.find((w) => w.id === v.currentId) ?? owned[0]!;
        return (
          <div style={{ width: 240, padding: 12, background: "var(--hg-color-sidebar)", border: "1px solid var(--hg-color-border)", borderRadius: 8 }}>
            <WorkspaceSwitcher
              current={current}
              owned={owned}
              external={external}
              onSelect={() => {}}
              onNew={() => {}}
              onViewAll={() => {}}
            />
          </div>
        );
      },
      code: () =>
        `import { WorkspaceSwitcher, type Workspace } from "@heigin/ui";\n\nconst owned: Workspace[] = [\n  { id: "specialized", name: "specialized.com", initials: "S", accent: "#dc2626" },\n];\nconst external: Workspace[] = [\n  { id: "trek",   name: "trekbikes.com", initials: "T", accent: "#64748b" },\n  { id: "canyon", name: "canyon.com",   initials: "C", accent: "#64748b" },\n];\n\n<WorkspaceSwitcher\n  current={owned[0]}\n  owned={owned}\n  external={external}\n  onSelect={(ws) => navigateTo(ws)}\n  onNew={() => router.push("/workspaces/new")}\n  onViewAll={() => router.push("/workspaces")}\n/>`,
    }),
    examples: [{ file: "sidebar", title: "In a sidebar rail" }],
    a11y: [
      "The trigger is a labelled button; the popup is a listbox and each row is an option whose aria-selected reflects the active workspace.",
      "The search input is autofocused when the popup opens and only appears once the combined list crosses the search threshold.",
    ],
    responsive: "Trigger fills its sidebar width; popup is at most 320px wide and 320px tall, scrolling internally when the list is long.",
  },
];
