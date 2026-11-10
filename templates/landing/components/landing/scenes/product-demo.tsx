"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronsLeft,
  Clock,
  FileText,
  Hash,
  Inbox,
  KanbanSquare,
  Landmark,
  LayoutDashboard,
  MapPin,
  Mail,
  Megaphone,
  MessageCircle,
  Package,
  Pause,
  Phone,
  Play,
  Plug,
  Plus,
  Receipt,
  Repeat,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  UserRound,
  Users,
  Workflow,
  Map as MapIcon,
  ScrollText,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/landing/brand";
import { Backdrop } from "@/components/landing/backdrop";
import { landingConfig } from "@/lib/landing-config";
import { ThinkingOrbs } from "@/components/landing/scenes/thinking-orbs";
import { cn } from "@/lib/landing-utils";

/**
 * Hero product demo — code-rendered approximation of a CRM-style product app.
 *
 * The app shell (sidebar + topbar + content + rails) is a single unit. Scenes
 * crossfade in place: no cursor, no camera zoom, just the inner page content
 * flipping through the story quickly.
 */

type SceneId = "establish" | "context" | "signal" | "agent" | "approve" | "recorded";

const SCENES: ReadonlyArray<{ id: SceneId; route: string; dwellMs?: number }> = [
  // Today
  { id: "establish", route: "/today" },
  // Accounts — context lands
  { id: "context",   route: "/accounts" },
  // Accounts — a signal is flagged
  { id: "signal",    route: "/accounts" },
  // Inbox — agent drafts the reply (typing effect needs a touch more time)
  { id: "agent",     route: "/inbox", dwellMs: 2200 },
  // Inbox — human approves
  { id: "approve",   route: "/inbox" },
  // Accounts — outcome recorded
  { id: "recorded",  route: "/accounts" },
];

const SCENE_MS = 1500;

/* ---------- Nav data: edit to match your product ---------- */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
  {
    label: "Overview",
    items: [
      { label: "Today", href: "/today", icon: Clock },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Leads", href: "/leads", icon: UserRound },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone },
      { label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
      { label: "Quotes & Payments", href: "/quotes", icon: Receipt },
      { label: "Products", href: "/products", icon: Package },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Accounts", href: "/accounts", icon: Building2 },
      { label: "Contacts", href: "/contacts", icon: Users },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Activities", href: "/activities", icon: CheckSquare },
      { label: "Inbox", href: "/inbox", icon: Inbox },
      { label: "Meetings", href: "/meetings", icon: CalendarDays },
      { label: "Field Planner", href: "/field-planner", icon: MapIcon },
      { label: "Sequences", href: "/sequences", icon: Repeat },
      { label: "Automations", href: "/automations", icon: Workflow },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Forecasting", href: "/forecasting", icon: TrendingUp },
      { label: "Copilot", href: "/copilot", icon: Bot },
      { label: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Integrations", href: "/integrations", icon: Plug },
      { label: "Users", href: "/users", icon: UserCog },
      { label: "Audit Log", href: "/audit-log", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

function screenLabel(route: string): string {
  for (const g of NAV_GROUPS) {
    const match = g.items.find((i) => route.startsWith(i.href));
    if (match) return match.label;
  }
  return "Dashboard";
}

/* ---------- App shell parts ---------- */

function Sidebar({ activeRoute }: { activeRoute: string }) {
  return (
    <aside className="hidden h-full w-[200px] shrink-0 flex-col border-r border-border bg-sidebar md:flex lg:w-[232px]">
      <div className="flex h-14 items-center gap-2 border-b border-border px-3.5">
        <BrandMark className="size-6" />
        <span className="text-[13.5px] font-semibold tracking-tight text-foreground">{landingConfig.brand.name}</span>
        <span className="ml-auto flex size-6 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground">
          <ChevronsLeft size={13} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>
      <nav className="flex-1 overflow-hidden px-1.5 py-2 text-[12.5px]">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi === 0 ? "" : "mt-3"}>
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-faint">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeRoute.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <span
                      className={cn(
                        "flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors duration-500",
                        active
                          ? "bg-surface text-foreground shadow-[inset_0_0_0_1px_var(--color-border)]"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Topbar({ activeRoute }: { activeRoute: string }) {
  const screen = screenLabel(activeRoute);
  const Icon = NAV_GROUPS.flatMap((g) => g.items).find((i) => activeRoute.startsWith(i.href))?.icon;
  return (
    <div className="flex h-12 flex-none items-center gap-2 border-b border-border bg-background px-3 md:px-5">
      {Icon && <Icon size={14} strokeWidth={1.6} aria-hidden="true" className="text-muted-foreground" />}
      <span className="truncate text-[13.5px] text-foreground">{screen}</span>
      <div className="flex-1" />
      <button
        type="button"
        className="hidden items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-[12.5px] text-muted-foreground md:inline-flex"
      >
        <Plus size={13} strokeWidth={1.6} aria-hidden="true" />
        Task
      </button>
      <button
        type="button"
        className="hidden items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-[12.5px] text-muted-foreground md:inline-flex"
      >
        <Sparkles size={12} strokeWidth={1.6} aria-hidden="true" />
        Ask {landingConfig.brand.name}
      </button>
      <span
        aria-hidden="true"
        className="ml-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[10.5px] font-semibold text-foreground"
      >
        MS
      </span>
    </div>
  );
}

/* ---------- Scene bodies: real-app page approximations ---------- */

function PageToday() {
  // Grouped like the real app: an "agent prepared" banner at top, two groups
  // (Needs reply · Scheduled) with their own counts, each row has a small
  // owner avatar and a right-side meta cluster with tag + due.
  type Row = {
    title: string;
    account: string;
    owner: string;
    initials: string;
    tag: string;
    tagTone: "neutral" | "warn" | "danger" | "info";
    due: string;
    prepped?: boolean;
  };
  const needsReply: Row[] = [
    {
      title: "Reply to Asha Rao · pricing question",
      account: "Kaveri Textiles · Renewal",
      owner: "Meera S",
      initials: "MS",
      tag: "Follow-up",
      tagTone: "warn",
      due: "22h open",
      prepped: true,
    },
    {
      title: "Send revised quote · Arjun K",
      account: "Northwind Traders · Expansion",
      owner: "Meera S",
      initials: "MS",
      tag: "Quote",
      tagTone: "danger",
      due: "overdue",
    },
  ];
  const scheduled: Row[] = [
    {
      title: "Confirm Thursday visit · Divya R",
      account: "Sundaram Mills · Repeat order",
      owner: "Arjun K",
      initials: "AK",
      tag: "Field visit",
      tagTone: "info",
      due: "tomorrow",
    },
    {
      title: "Prep call brief · Rina P",
      account: "Bluepeak Pilot · Discovery",
      owner: "Meera S",
      initials: "MS",
      tag: "Call",
      tagTone: "neutral",
      due: "3:30 pm",
      prepped: true,
    },
  ];
  const toneClass: Record<Row["tagTone"], string> = {
    neutral: "bg-sidebar text-muted-foreground",
    warn: "bg-warning-soft-bg text-warning",
    danger: "bg-danger-soft-bg text-danger-ink",
    info: "bg-info-soft-bg text-info-ink",
  };
  const renderGroup = (label: string, count: number, rows: Row[]) => (
    <div>
      <div className="flex items-center gap-2 pb-1.5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-faint">{label}</p>
        <span className="rounded-full bg-sidebar px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li
            key={row.title}
            className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2"
          >
            <span
              aria-hidden="true"
              className="flex size-5 flex-none items-center justify-center rounded border border-border text-muted-foreground"
            >
              <CheckSquare size={11} strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[12.5px] font-medium text-foreground">{row.title}</p>
                {row.prepped && (
                  <span
                    title={`Prepared by ${landingConfig.brand.name}`}
                    className="inline-flex items-center gap-0.5 rounded-full bg-info-soft-bg px-1.5 py-0.5 text-[9.5px] font-medium text-info-ink"
                  >
                    <Sparkles size={9} strokeWidth={1.8} aria-hidden="true" /> prepped
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-muted-foreground">{row.account}</p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-5 flex-none items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-foreground"
            >
              {row.initials}
            </span>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                toneClass[row.tagTone]
              )}
            >
              {row.tag}
            </span>
            <span className="w-16 shrink-0 text-right text-[11px] text-muted-foreground">{row.due}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Tuesday · 11 Nov</p>
          <p className="text-[16px] font-semibold text-foreground">What needs me today</p>
        </div>
        <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <span>Owner · Meera S</span>
        </div>
      </div>

      {/* Agent-prepared banner — grounds the Today page in the product story. */}
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-info/30 bg-info-soft-bg px-3 py-2 text-[11.5px]">
        <Sparkles size={13} strokeWidth={1.8} className="text-info-ink" aria-hidden="true" />
        <span className="font-semibold text-foreground">{landingConfig.brand.name} prepared your day.</span>
        <span className="text-muted-foreground">
          4 next steps · 2 drafts ready for review · 1 call brief
        </span>
        <span className="ml-auto text-[10.5px] text-faint">just now</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        {renderGroup("Needs reply", needsReply.length, needsReply)}
        {renderGroup("Scheduled", scheduled.length, scheduled)}
      </div>
    </div>
  );
}

/* Agent activity log — vertical timeline modeled after the reference the user
 * shared. Each item has a circle icon on the left, a connecting line between
 * items, and a title + subtitle + trust-rung pill on the right. The newest
 * item starts in a loading state with ThinkingOrbs, then resolves. */
function AgentActivityLog({ active }: { active: boolean }) {
  const [resolved, setResolved] = useState(false);
  useEffect(() => {
    if (!active) {
      setResolved(false);
      return;
    }
    setResolved(false);
    const t = window.setTimeout(() => setResolved(true), 1400);
    return () => window.clearTimeout(t);
  }, [active]);
  type Row = {
    icon: LucideIcon;
    time: string;
    agent: string;
    verb: string;
    target: string;
    reason?: string | undefined;
    pill?: { label: string; tone: "success" | "info" | "warning" } | undefined;
    working?: boolean | undefined;
  };
  // Matches the reference layout: time on the left, circled icon, agent name
  // bold, action in muted copy, reason/approval-state underneath, status pill
  // on the right. The newest row shows ThinkingOrbs while the agent is still
  // working and resolves to its final state.
  const rows: Row[] = [
    {
      icon: CheckSquare,
      time: "9:12 am",
      agent: "Sales Agent",
      verb: "sent the pricing reply to Asha Rao",
      reason: "Approved by Meera S",
      pill: { label: "Sent", tone: "success" },
      target: "",
    },
    {
      icon: Sparkles,
      time: "8:50 am",
      agent: "Deal brief",
      verb: "flagged Sundaram Mills as stalled",
      reason: resolved
        ? "Reason: renewal call notes mention a budget decision this week."
        : undefined,
      working: !resolved,
      target: "",
    },
    {
      icon: Mail,
      time: "Yesterday",
      agent: "Sales Agent",
      verb: "drafted a reply for Kaveri Textiles",
      reason: "Held for approval. No message was sent automatically.",
      target: "",
    },
    {
      icon: User,
      time: "Yesterday",
      agent: "Copilot",
      verb: "noted an unanswered question on Kaveri Textiles",
      reason: "Source: call transcript synced from Google Meet.",
      target: "",
    },
  ];
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Agent activity</p>
        <span className="ml-auto text-[10.5px] text-muted-foreground">last 7 days</span>
      </div>
      <ol className="relative mt-3 flex flex-col gap-3">
        {/* Vertical connector line through the icon circles */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-[47px] top-2 w-px bg-border"
        />
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <li key={i} className="relative flex gap-2.5 text-[11.5px]">
              {/* Time column, matching the reference's left-aligned timestamp */}
              <span className="w-[42px] flex-none pt-1 text-right text-[10.5px] text-muted-foreground">
                {r.time}
              </span>
              {/* Icon circle */}
              <span
                aria-hidden="true"
                className={cn(
                  "relative z-10 flex size-5 flex-none items-center justify-center rounded-full border border-border bg-background",
                  r.working ? "ring-2 ring-info/40" : ""
                )}
              >
                <Icon size={10} strokeWidth={1.8} className="text-muted-foreground" aria-hidden="true" />
              </span>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="leading-snug text-muted-foreground">
                  <span className="font-semibold text-foreground">{r.agent}</span> {r.verb}
                </p>
                {r.working ? (
                  <div className="mt-1 inline-flex items-center gap-2 rounded-md bg-info-soft-bg px-1.5 py-0.5 text-[10.5px] text-info-ink">
                    <ThinkingOrbs size={4} /> working…
                  </div>
                ) : (
                  r.reason && (
                    <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{r.reason}</p>
                  )
                )}
                {r.pill && !r.working && (
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      r.pill.tone === "info" && "bg-info-soft-bg text-info-ink",
                      r.pill.tone === "success" && "bg-success-soft-bg text-success-ink",
                      r.pill.tone === "warning" && "bg-warning-soft-bg text-warning"
                    )}
                  >
                    {r.pill.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PageAccount({ variant, active = true }: { variant: "context" | "signal" | "recorded"; active?: boolean }) {
  const signalActive = variant === "signal";
  const recordedActive = variant === "recorded";
  return (
    <div className="flex h-full flex-col overflow-hidden p-4 md:p-5">
      <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent text-[13px] font-semibold text-foreground">
          KT
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">Kaveri Textiles</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Hash size={11} strokeWidth={1.6} aria-hidden="true" /> ACC-2041
            </span>
            <span className="inline-flex items-center gap-1">
              <Landmark size={11} strokeWidth={1.6} aria-hidden="true" /> GSTIN 29ABCDE1234F1Z5
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} strokeWidth={1.6} aria-hidden="true" /> Bengaluru, KA
            </span>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-success-soft-bg px-2 py-0.5 text-[10.5px] font-medium text-success-ink">
          On track
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1 border-b border-border text-[12.5px]">
        <span className="rounded-t-md border-b-2 border-foreground px-3 pb-2 pt-1.5 font-medium text-foreground">Overview</span>
        <span className="px-3 pb-2 pt-1.5 text-muted-foreground">Timeline</span>
        <span className="px-3 pb-2 pt-1.5 text-muted-foreground">Contacts · 3</span>
        <span className="px-3 pb-2 pt-1.5 text-muted-foreground">Quotes · 2</span>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 gap-3 md:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Timeline</p>
            <span className="text-[11px] text-muted-foreground">Last 14 days</span>
          </div>
          <ul className="mt-2 flex flex-col">
            {[
              { icon: Phone, type: "Call", subject: "Renewal call · 32 min with Asha", time: "yesterday 3:40 pm" },
              {
                icon: MessageCircle,
                type: "WhatsApp",
                subject: "“Could you send the updated spring-line pricing?”",
                time: "yesterday 5:12 pm",
                highlight: signalActive,
              },
              { icon: Mail, type: "Email", subject: "Logistics confirms Friday slot", time: "today 7:02 am" },
              recordedActive && {
                icon: Mail,
                type: "Email",
                subject: "Follow-up sent · spring-line pricing to Asha Rao",
                time: "just now",
                sent: true,
              },
            ]
              .filter(Boolean)
              .map((row, i) => {
                const r = row as { icon: LucideIcon; type: string; subject: string; time: string; highlight?: boolean; sent?: boolean };
                const Icon = r.icon;
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex gap-2.5 border-b border-border py-2 last:border-0 transition-colors duration-500",
                      r.highlight && "bg-warning-soft-bg/40",
                      r.sent && "bg-success-soft-bg/40"
                    )}
                  >
                    <Icon
                      size={13}
                      strokeWidth={1.6}
                      aria-hidden="true"
                      className={cn("mt-0.5 flex-none", r.highlight ? "text-warning" : r.sent ? "text-success-ink" : "text-muted-foreground")}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 text-[12.5px]">
                        <span className="truncate text-foreground">{r.subject}</span>
                        <span className="ml-auto flex-none text-[11px] text-muted-foreground">{r.time}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{r.type}</div>
                    </div>
                  </li>
                );
              })}
          </ul>

          {signalActive && (
            <div className="mt-2 rounded-[var(--radius-md)] border border-warning/40 bg-warning-soft-bg p-2.5 transition-opacity duration-500">
              <div className="flex items-center gap-2 text-[11.5px]">
                <Sparkles size={12} className="text-warning" strokeWidth={1.6} aria-hidden="true" />
                <span className="font-semibold text-foreground">Sales Agent · needs attention</span>
                <span className="ml-auto text-[11px] text-muted-foreground">22h open</span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Asha asked for spring-line pricing. Renewal decision is expected this week.
              </p>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Open deal</p>
            <p className="mt-1 text-[13px] font-semibold text-foreground">Annual supply · Renewal</p>
            <p className="text-[11.5px] text-muted-foreground">Owner · Meera S · ₹8,40,000</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-faint">
              <span className="rounded bg-sidebar px-1.5 py-0.5">Qualified</span>
              <span>→</span>
              <span className="rounded bg-foreground px-1.5 py-0.5 text-background">Negotiation</span>
              <span>→</span>
              <span className="rounded bg-sidebar px-1.5 py-0.5 text-faint">Won</span>
            </div>
          </div>

          {signalActive ? (
            <AgentActivityLog active={active} />
          ) : (
            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Contacts</p>
              <ul className="mt-1.5 flex flex-col gap-1.5 text-[12.5px]">
                {[
                  { name: "Asha Rao", role: "Procurement lead" },
                  { name: "Vikram S", role: "CFO" },
                  { name: "Nandini D", role: "Ops" },
                ].map((c) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <User size={12} strokeWidth={1.6} className="text-muted-foreground" aria-hidden="true" />
                    <span className="text-foreground">{c.name}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{c.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recordedActive && (
            <div className="rounded-[var(--radius-md)] border border-success/30 bg-success-soft-bg p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-success-ink">Open loops</p>
              <p className="mt-1 text-[16px] font-semibold text-foreground">0</p>
              <p className="text-[11.5px] text-muted-foreground">Pricing answered · timeline updated</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageInbox({ variant, active }: { variant: "agent" | "approve"; active: boolean }) {
  const [typed, setTyped] = useState("");
  const body =
    "Hi Asha, thanks for the time yesterday. Here is the updated spring-line pricing we discussed — ₹84 per unit up to 500 units, then ₹76 per unit from there. Happy to walk through it on a quick call tomorrow if it helps.";
  // Typing fires ONLY when this scene is the active one on screen, so visitors
  // actually see the draft being written. For the approve variant we show the
  // completed draft (no typing).
  useEffect(() => {
    if (variant !== "agent") {
      setTyped(body);
      return;
    }
    if (!active) {
      setTyped("");
      return;
    }
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 3;
      if (i >= body.length) {
        setTyped(body);
        window.clearInterval(id);
      } else {
        setTyped(body.slice(0, i));
      }
    }, 28);
    return () => window.clearInterval(id);
  }, [variant, active]);
  const approving = variant === "approve";
  return (
    <div className="grid h-full grid-cols-[180px_1fr] overflow-hidden p-4 md:p-5">
      <div className="min-w-0 border-r border-border pr-3">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Inbox</p>
          <span className="text-[11px] text-muted-foreground">8</span>
        </div>
        <ul className="flex flex-col">
          {[
            { name: "Asha Rao", account: "Kaveri Textiles", preview: "Pricing question", time: "22h", active: true },
            { name: "Divya R", account: "Sundaram Mills", preview: "Can we revisit net 45?", time: "2d" },
            { name: "Arjun K", account: "Northwind", preview: "Site visit confirmation", time: "3d" },
            { name: "Rina P", account: "Bluepeak Pilot", preview: "Weekly cadence check", time: "5d" },
          ].map((t) => (
            <li key={t.name} className={cn("flex flex-col gap-0.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[12px]", t.active && "bg-sidebar")}>
              <div className="flex items-center gap-1.5">
                <span className="truncate font-semibold text-foreground">{t.name}</span>
                <span className="ml-auto flex-none text-[11px] text-muted-foreground">{t.time}</span>
              </div>
              <span className="truncate text-muted-foreground">
                <span className="text-foreground">{t.account}</span> · {t.preview}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col overflow-hidden pl-3">
        <div className="flex items-center gap-2 pb-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-accent text-[10.5px] font-semibold text-foreground">
            AR
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">Asha Rao · Kaveri Textiles</p>
            <p className="truncate text-[11.5px] text-muted-foreground">Open loop · 22h · Awaiting approval</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface p-3">
          <div className="flex items-center gap-2 text-[11.5px]">
            <Sparkles size={12} className="text-info-ink" strokeWidth={1.6} aria-hidden="true" />
            <span className="font-semibold text-foreground">Sales Agent</span>
            {variant === "agent" ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                drafting <ThinkingOrbs size={5} />
              </span>
            ) : (
              <span className="text-muted-foreground">drafted · 3 min ago</span>
            )}
            <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10.5px] text-muted-foreground">
              Awaiting approval
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[10.5px] text-muted-foreground">
            <span className="rounded bg-sidebar px-1.5 py-0.5">Source · yesterday's call</span>
            <span className="rounded bg-sidebar px-1.5 py-0.5">Source · WhatsApp thread</span>
            <span className="rounded bg-sidebar px-1.5 py-0.5">Rates agreed on call</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-[var(--radius-sm)] border border-border bg-background p-2.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>To Asha Rao · Kaveri Textiles</span>
              <span className="text-faint">Pricing · Spring 2026</span>
            </div>
            <div className="mt-1.5 border-t border-border pt-1.5 text-[12.5px] leading-relaxed text-foreground">
              {typed}
              {variant === "agent" && typed.length < body.length && (
                <span className="ml-0.5 inline-block h-3 w-[1px] translate-y-0.5 bg-foreground align-baseline motion-safe:animate-pulse" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="rounded-[var(--radius-md)] border border-border bg-background px-2.5 py-1 text-[12px] font-medium text-foreground">Reject</span>
            <span className="rounded-[var(--radius-md)] border border-border bg-background px-2.5 py-1 text-[12px] font-medium text-foreground">Edit</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-[var(--radius-md)] px-2.5 py-1 text-[12px] font-medium transition-colors duration-500",
                approving ? "bg-success text-white" : "bg-foreground text-background"
              )}
            >
              {approving ? "Approved ✓" : "Approve & send"}
            </span>
            <span className="ml-auto text-[10.5px] text-faint">Nothing sends until a human approves.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneBody({ scene, active }: { scene: SceneId; active: boolean }) {
  switch (scene) {
    case "establish":
      return <PageToday />;
    case "context":
      return <PageAccount variant="context" />;
    case "signal":
      return <PageAccount variant="signal" active={active} />;
    case "agent":
      return <PageInbox variant="agent" active={active} />;
    case "approve":
      return <PageInbox variant="approve" active={active} />;
    case "recorded":
      return <PageAccount variant="recorded" />;
  }
}

/* ---------- Hero wrapper: painterly bg + glass + external pause ---------- */

export function ProductDemo() {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Autoplay only when visible, not when a child is keyboard-focused, and never for reduced motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAutoplay(false);
      return;
    }
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setInView(Boolean(entries.at(-1)?.isIntersecting)),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = focused;
  useEffect(() => {
    if (!autoplay || !inView || paused) return;
    // Per-scene dwell so slow beats (typing the draft) get extra time.
    const dwell = SCENES[index]?.dwellMs ?? SCENE_MS;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), dwell);
    return () => window.clearTimeout(t);
  }, [autoplay, inView, paused, index]);

  const scene = SCENES[index]!;

  return (
    <div
      ref={rootRef}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className="relative mx-auto w-full max-w-[1600px] px-4 md:px-8"
    >
      <div className="relative overflow-hidden rounded-[2rem] p-4 md:p-10">

        <Backdrop priority />

        {/* Circular play/pause button — outside the app UI, in the outer frame.
            White icon + stronger backdrop for contrast against the painterly artwork. */}
        <button
          type="button"
          onClick={() => setAutoplay((on) => !on)}
          aria-label={autoplay ? "Pause the workflow demo" : "Play the workflow demo"}
          className="absolute right-6 top-6 z-20 inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-[0_6px_18px_-4px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 md:right-12 md:top-12"
        >
          {autoplay ? (
            <Pause size={16} strokeWidth={2} aria-hidden="true" fill="currentColor" />
          ) : (
            <Play size={16} strokeWidth={2} aria-hidden="true" fill="currentColor" className="translate-x-[1px]" />
          )}
        </button>

        {/*
         * Glass app frame. Responsive aspect ratio:
         *   - mobile: 9/14, phone-screen-like portrait so the Topbar +
         *     scene content have room to breathe at narrow widths.
         *   - md: 4/5 — a bit taller than the desktop ratio so the shell
         *     and content read cleanly at tablet widths.
         *   - lg and up: 1.61/1 — the reference desktop aspect with
         *     Sidebar + Topbar + content area side by side.
         * The sidebar is `hidden md:flex` so on mobile the scene content
         * takes the full width inside the frame; the stage adapts.
         */}
        <div className="relative mx-auto w-full max-w-[1291px]">
          <div className="aspect-[9/14] overflow-hidden rounded-2xl bg-white/15 p-1.5 ring-1 ring-white/30 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.35)] backdrop-blur-md md:aspect-[4/5] md:p-2 lg:aspect-[1.61/1]">
            {/* The stage — sidebar + topbar + content area. Scenes crossfade
                in place; nothing transforms. */}
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-background">
              <div className="flex h-full">
                <Sidebar activeRoute={scene.route} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Topbar activeRoute={scene.route} />
                  <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
                    {SCENES.map((s, i) => {
                      const active = i === index;
                      return (
                        <div
                          key={s.id}
                          aria-hidden={!active}
                          className={cn(
                            "absolute inset-0 transition-opacity duration-[450ms] ease-out motion-reduce:transition-none",
                            active ? "opacity-100 delay-[120ms]" : "opacity-0 pointer-events-none"
                          )}
                        >
                          <SceneBody scene={s.id} active={active} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
