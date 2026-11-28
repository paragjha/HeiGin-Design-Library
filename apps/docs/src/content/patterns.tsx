import { Mail, MessageSquare, Phone } from "lucide-react";
import {
  ActivityItem,
  ActivityTimeline,
  AgentDecisionTree,
  AgentTaskTrail,
  AgentThinking,
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
  type AgentDecision,
  type AgentStep,
  type Channel,
  type LoaderVariant,
  type StatusKey,
  type ThinkingShape,
} from "@heigin/ui";
import * as React from "react";
import { definePlayground } from "../components/Playground";
import type { ComponentDocEntry } from "./types";

import type { ServiceLogoProps } from "../components/ServiceLogos";
const LazyServiceLogo = React.lazy(() => import("../components/ServiceLogos").then((m) => ({ default: m.ServiceLogo })));
function SL(props: ServiceLogoProps) {
  return <React.Suspense fallback={<span style={{ display: "inline-block", width: props.size ?? 16, height: props.size ?? 16 }} />}><LazyServiceLogo {...props} /></React.Suspense>;
}

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
    slug: "agent-task-trail",
    title: "Agent task trail",
    group: "CRM patterns",
    manifest: "agent-task-trail",
    propsFor: ["AgentTaskTrail"],
    description: "A live timeline of an agent working through a task: steps with their service and time, sub-steps on a branching rail, and an approval gate for steps that need a person.",
    evidence: "proposed",
    evidenceNote: "New agent pattern, not in the live CRM yet. The running step shows the thinking orb by default; set loader=\"spinner\" for a plain ring.",
    states: ["done", "running (orb or spinner)", "not started", "will need approval", "needs approval", "approving (loading)", "declined", "sub-steps open / closed"],
    playground: definePlayground({
      controls: {
        title: { type: "text", label: "Title", default: "Fix the checkout crash" },
        loader: { type: "select", label: "Loader", options: ["orb", "spinner"], default: "orb" },
        gate: { type: "select", label: "Last step", options: ["approval", "waiting"], default: "waiting" },
      },
      render: (v) => {
        const steps: AgentStep[] = [
          { id: "read", label: "Read the bug report", icon: <SL name="linear" size={12} />, status: "done", seconds: 8, substeps: [{ label: "Opened ENG-2291", meta: "Linear" }] },
          { id: "patch", label: "Patch the checkout form", icon: <SL name="github" size={12} />, status: "active", activity: "Testing", seconds: 27, substeps: [{ label: "Found the empty-cart case", meta: "cart.ts:142" }, { label: "Running the test suite", meta: "182/214" }] },
          { id: "note", label: "Write the release note", icon: <SL name="notion" size={12} />, status: "pending" },
          { id: "pr", label: "Open a pull request", icon: <SL name="github" size={12} />, status: v.gate as "approval" | "waiting", approval: { description: "Open PR #482 against main – 3 files, 214 tests passing." } },
        ];
        return <AgentTaskTrail title={v.title} loader={v.loader as LoaderVariant} steps={steps} onApprove={() => {}} onDecline={() => {}} />;
      },
      code: (v) =>
        `import { AgentTaskTrail } from "@heigin/ui";\n\n<AgentTaskTrail\n  title=${q(v.title)}${v.loader === "orb" ? "" : `\n  loader=${q(v.loader)}`}\n  steps={[\n    { id: "read", label: "Read the bug report", status: "done", seconds: 8 },\n    { id: "patch", label: "Patch the checkout form", status: "active", activity: "Testing", startedAt: Date.now() },\n    { id: "note", label: "Write the release note", status: "pending" },\n    { id: "pr", label: "Open a pull request", status: ${q(v.gate)},\n      approval: { description: "Open PR #482 against main." } },\n  ]}\n  onApprove={openPullRequest}\n  onDecline={cancelStep}\n/>`,
    }),
    examples: [{ file: "live", title: "A full run", description: "Demo only — a scripted run with real service logos. Approve or decline at the last step; nothing is opened or sent." }],
    a11y: [
      "The trail is a section labelled by its title; steps are an ordered list.",
      "Each step carries hidden status text (done, in progress, needs your approval).",
      "Finished steps with sub-steps are buttons with aria-expanded.",
      "The running step and any approval request are announced in a polite status region.",
      "The orb and the rail are decorative; the text carries the meaning.",
    ],
    responsive: "Fills its container up to 400px; long labels truncate with an ellipsis.",
  },
  {
    slug: "agent-decision-tree",
    title: "Agent decision tree",
    group: "CRM patterns",
    manifest: "agent-decision-tree",
    propsFor: ["AgentDecisionTree"],
    description: "A queue of decisions an agent needs from a person, drawn as a tree: the question, the branches it weighed, follow-up options with their consequences, and the agent’s own pick.",
    evidence: "proposed",
    evidenceNote: "New agent pattern, not in the live CRM yet. While a choice is being sent the pill shows the thinking orb; set loader=\"spinner\" for a plain ring.",
    states: ["choosing", "hover (others dim)", "branch chosen", "sending (orb or spinner)", "approved", "other… instruction + agent reply", "all decided"],
    playground: definePlayground({
      controls: {
        loader: { type: "select", label: "Loader", options: ["orb", "spinner"], default: "orb" },
        risk: { type: "select", label: "Risk", options: ["high", "medium", "low"], default: "high" },
        question: { type: "text", label: "Question", default: "Checkout errors jumped to 18% after deploy #482 – what should I do?" },
      },
      render: (v) => {
        const decision: AgentDecision = {
          id: "incident",
          agent: { name: "Incident agent", model: "Claude Opus 5.5" },
          risk: v.risk as "high" | "medium" | "low",
          question: v.question,
          context: "2,140 errors in 12 minutes · about $3.2k in orders an hour at risk.",
          recommended: "rollback",
          branches: [
            { id: "rollback", label: "Roll back to #481", icon: <SL name="vercel" size={15} />, question: "Tell customers about it?", recommendedOption: "status", options: [
              { id: "status", label: "Post on the status page", detail: "Public · updates every 15 min", apps: [<SL key="s" name="statuspage" size={11} />] },
              { id: "team", label: "Only tell the team", detail: "#incidents only", apps: [<SL key="k" name="slack" size={11} />] },
            ] },
            { id: "flag", label: "Turn the flag off", icon: <SL name="launchdarkly" size={15} />, outcome: "New checkout off for 30%" },
          ],
        };
        return <AgentDecisionTree decisions={[decision]} loader={v.loader as LoaderVariant} onDecide={() => new Promise((r) => window.setTimeout(r, 900))} />;
      },
      code: (v) =>
        `import { AgentDecisionTree } from "@heigin/ui";\n\n<AgentDecisionTree${v.loader === "orb" ? "" : `\n  loader=${q(v.loader)}`}\n  decisions={[{\n    id: "incident",\n    agent: { name: "Incident agent", model: "Claude Opus 5.5" },\n    risk: ${q(v.risk)},\n    question: ${q(v.question)},\n    recommended: "rollback",\n    branches: [\n      { id: "rollback", label: "Roll back to #481", question: "Tell customers about it?",\n        options: [\n          { id: "status", label: "Post on the status page", detail: "Public" },\n          { id: "team", label: "Only tell the team", detail: "#incidents only" },\n        ] },\n      { id: "flag", label: "Turn the flag off", outcome: "New checkout off for 30%" },\n    ],\n  }]}\n  onDecide={(decision, choice) => sendToAgent(decision.id, choice)}\n/>`,
    }),
    examples: [{ file: "queue", title: "Three decisions in a queue", description: "Demo only — real service logos, HeiGin agents. Try hovering, the number keys, and “Other…”. Nothing is sent." }],
    a11y: [
      "The tree is a section labelled “Decisions”; the current decision is an article labelled by its question.",
      "Branches with follow-ups are disclosure buttons (aria-expanded); outcome branches are toggle buttons with a Confirm step.",
      "Number keys and Esc work only while focus is inside the tree, so the host page keeps its own shortcuts.",
      "The agent’s note is linked to its option with aria-describedby and shows on hover or focus.",
      "Sending, approval and the agent’s reply are announced through status roles. The wires are decorative.",
    ],
    responsive: "Below a 760px container the tree stacks into a single column and the wires are hidden; the agent’s note shows inline.",
  },
  {
    slug: "agent-thinking",
    title: "Agent thinking",
    group: "CRM patterns",
    manifest: "agent-thinking",
    propsFor: ["AgentThinking"],
    description: "Shows an agent thinking: a timer with the thinking orb, each step as it happens, and a dithered dot visual that reshapes per step. When done, the steps fold away and the answer takes their place.",
    evidence: "proposed",
    evidenceNote: "New agent pattern, not in the live CRM yet. The header shows the thinking orb by default; set loader=\"spinner\" for a plain ring, or visual={false} to drop the dot visual.",
    states: ["thinking (orb or spinner)", "step added", "shape change", "done (steps folded)", "steps reopened", "no visual", "reduced motion (still frame)"],
    playground: definePlayground({
      controls: {
        loader: { type: "select", label: "Loader", options: ["orb", "spinner"], default: "orb" },
        shape: { type: "select", label: "Shape", options: ["tree", "lens", "globe", "cube", "ring"], default: "lens" },
        visual: { type: "boolean", label: "Visual", default: true },
        done: { type: "boolean", label: "Done", default: false },
      },
      render: (v) => (
        <div style={{ width: "100%", maxWidth: 720 }}>
          <AgentThinking
            prompt="Which deals are most at risk this month?"
            status={v.done ? "done" : "thinking"}
            seconds={6.4}
            loader={v.loader as LoaderVariant}
            visual={v.visual}
            steps={[
              { id: "read", label: "Reading 48 open deals in the pipeline" },
              { id: "quiet", label: "Searching activity for deals with no reply in 14 days", shape: v.shape as ThinkingShape },
            ]}
          >
            Three deals worth ₹34.35L need attention this month.
          </AgentThinking>
        </div>
      ),
      code: (v) =>
        `import { AgentThinking } from "@heigin/ui";\n\n<AgentThinking\n  prompt="Which deals are most at risk this month?"\n  status=${q(v.done ? "done" : "thinking")}\n  startedAt={startedAt}${v.loader === "orb" ? "" : `\n  loader=${q(v.loader)}`}${v.visual ? "" : "\n  visual={false}"}\n  steps={[\n    { id: "read", label: "Reading 48 open deals" },\n    { id: "quiet", label: "Searching for deals with no reply", shape: ${q(v.shape)} },\n  ]}\n>\n  {answer}\n</AgentThinking>`,
    }),
    examples: [{ file: "run", title: "A full run", description: "Demo only — a scripted run with sample CRM data." }],
    a11y: [
      "The response is a section with aria-busy while thinking.",
      "“Thinking” is announced once; the ticking timer is hidden from assistive tech so it isn’t read out every tenth of a second.",
      "New steps arrive in a polite live region.",
      "Once done, “Thought for Ns” is a disclosure button that reopens the steps.",
      "The dot visual is decorative, pauses offscreen and shows a still frame under reduced motion.",
    ],
    responsive: "Below a 560px container the visual moves above the steps and shrinks to 240px.",
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
    slug: "app-sidebar",
    title: "App sidebar",
    group: "CRM patterns",
    manifest: "app-sidebar",
    propsFor: ["AppSidebar"],
    description: "Two-level app navigation: a rail of area icons beside a panel with the current area's pages, sub-pages with counts and + actions, a header slot for the workspace switcher and a footer slot. The panel collapses to leave the rail.",
    evidence: "proposed",
    evidenceNote: "Not in the live CRM, which uses the one-level Sidebar navigation. For apps with several areas, each with its own pages. The rail decides the area; you pass that area's pages as groups.",
    states: ["expanded", "collapsed (rail only)", "current area", "current page", "sub-pages with counts", "+ action", "rail tooltip", "light and dark"],
    examples: [{ file: "workspace", title: "Workspace with areas", description: "Pick an area in the rail or a page in the panel, switch workspace from the header, or add a campaign with +. The button above Help hides the panel." }],
    a11y: [
      "Two <nav> landmarks with their own names: the rail (\"Areas\") and the panel (\"Main\"). The current area and page carry aria-current=\"page\".",
      "Rail links show only an icon, so each has an aria-label and a tooltip that opens on hover and on keyboard focus.",
      "The panel toggle is a real button with aria-expanded and aria-controls, reachable in both states. A collapsed panel is inert, so Tab and screen readers skip it.",
      "A + action is its own button beside the link, named by addLabel (\"New in {label}\" by default), never nested inside the link.",
      "Under reduced motion the panel opens and closes without sliding.",
    ],
    responsive: "Fills the height of its column: 60px of rail plus a 232px panel (set --app-sidebar-panel to change it). On phones put it inside a left Drawer, or keep it collapsed to the rail.",
  },
];
