"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MessageCircle,
  PhoneCall,
  Sparkles,
  TrendingDown,
  User,
} from "lucide-react";
import { Badge } from "@heigin/ui";
import { cn } from "@/lib/landing-utils";

/**
 * Four compact, code-built animations for the "Specialized workflows" grid.
 * Each scene is self-contained, respects prefers-reduced-motion by jumping
 * straight to its final state, and pauses while it is out of view.
 */

function useInViewCycle(steps: number, intervalMs = 1000) {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(steps - 1);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let timer: number | undefined;
    const io = new IntersectionObserver((entries) => {
      const isIn = Boolean(entries.at(-1)?.isIntersecting);
      if (isIn) {
        timer = window.setInterval(() => setStep((s) => (s + 1) % steps), intervalMs);
      } else if (timer) {
        window.clearInterval(timer);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [steps, intervalMs]);
  return [step, ref] as const;
}

/* Scene 1: Meeting context attaching itself to a customer timeline. */
export function SceneMeetingContext() {
  const [step, ref] = useInViewCycle(3, 1000);
  return (
    <div ref={ref} className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-accent">
          <User size={14} className="text-foreground" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-foreground">Kaveri Textiles · timeline</p>
        <Badge tone="info" size="sm" className="ml-auto">
          Syncing
        </Badge>
      </div>
      {[
        { icon: PhoneCall, src: "Google Meet", text: "Renewal call · 32 min with Asha" },
        { icon: FileText, src: "Notion", text: "Spring contract brief attached" },
        { icon: MessageCircle, src: "WhatsApp", text: "“Updated pricing please”" },
      ].map((r, i) => (
        <div
          key={r.src}
          className={cn(
            "flex items-center gap-3 rounded-md border px-3 py-2 transition-all duration-500 ease-out",
            step >= i
              ? "translate-y-0 border-border bg-surface opacity-100"
              : "translate-y-2 border-border/40 bg-sidebar opacity-0"
          )}
        >
          <r.icon size={14} strokeWidth={1.8} aria-hidden="true" className="text-muted-foreground" />
          <span className="truncate text-sm text-foreground">{r.text}</span>
          <span className="ml-auto whitespace-nowrap text-xs text-faint">{r.src}</span>
        </div>
      ))}
    </div>
  );
}

/* Scene 2: Follow-up drafted from the context, awaiting approval. */
export function SceneFollowUpDraft() {
  const [step, ref] = useInViewCycle(2, 1600);
  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText size={14} className="text-info-ink" aria-hidden="true" />
        <span>
          <span className="font-semibold text-foreground">Sales Agent</span> · to Asha Rao
        </span>
        <Badge tone="info" size="sm" className="ml-auto">
          Awaiting approval
        </Badge>
      </div>
      <div className="rounded-md border border-border bg-surface p-3">
        <p className="text-sm text-foreground">
          Hi Asha, thanks for the time yesterday. Attaching the updated spring-line pricing we
          discussed — ₹84/unit up to 500, then ₹76/unit from there.
        </p>
        <p className="mt-2 text-xs text-faint">
          Reason: answers the open pricing question using the rates from yesterday's call.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
          Reject
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-500",
            step >= 1
              ? "bg-success text-white"
              : "bg-foreground text-background"
          )}
        >
          {step >= 1 ? <CheckCircle2 size={12} aria-hidden="true" /> : null}
          {step >= 1 ? "Approved" : "Approve & send"}
        </span>
        <span className="ml-auto text-xs text-faint">Nothing sends until a human approves.</span>
      </div>
    </div>
  );
}

/* Scene 3: Deal brief or next step surfaced for the rep. */
export function SceneDealBrief() {
  const [step, ref] = useInViewCycle(3, 950);
  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-info-ink" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Brief for tomorrow: Sundaram Mills</p>
      </div>
      <ul className="space-y-1.5">
        {[
          "Last conversation: Divya R asked for a 30-day net term.",
          "Open quote ₹4,15,000 · awaiting sign-off 6 days.",
          "Decision maker on leave until Thursday.",
        ].map((row, i) => (
          <li
            key={row}
            className={cn(
              "flex items-start gap-2 text-sm leading-relaxed transition-all duration-500 ease-out",
              step >= i
                ? "translate-y-0 text-muted-foreground opacity-100"
                : "translate-y-1.5 text-faint opacity-0"
            )}
          >
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
            {row}
          </li>
        ))}
      </ul>
      <div className="rounded-md bg-sidebar p-3">
        <p className="text-xs font-medium text-foreground">
          Suggested next step · ping Divya on Friday with a short recap &amp; a nudge on the net-term ask.
        </p>
      </div>
    </div>
  );
}

/* Scene 4: Stalled account flagged for attention. */
export function SceneStalledAccount() {
  const [step, ref] = useInViewCycle(3, 850);
  const rows = [
    { name: "Northwind Traders", owner: "Arjun K", days: 14, flag: "No reply" },
    { name: "Lumen Works · Pilot", owner: "Rina P", days: 9, flag: "Quote expired" },
    { name: "Bluepeak Logistics", owner: "Meera S", days: 21, flag: "Quiet 21d" },
  ];
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle size={14} className="text-warning" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Attention needed · 3 accounts</p>
        <Badge tone="warning" size="sm" className="ml-auto" dot>
          Review
        </Badge>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.name}
          className={cn(
            "flex items-center gap-3 rounded-md border px-3 py-2 transition-all duration-500 ease-out",
            step >= i
              ? "translate-y-0 border-border bg-surface opacity-100"
              : "translate-y-2 border-border/40 bg-sidebar opacity-0"
          )}
        >
          <TrendingDown size={14} strokeWidth={1.8} aria-hidden="true" className="text-warning" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {r.owner} · {r.flag}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} aria-hidden="true" />
            {r.days}d
          </div>
        </div>
      ))}
    </div>
  );
}

/* --- Deep dive scenes: longer, centered demos for the three feature sections. --- */

/* Deep-dive 01: Sales context in one place — full customer record. */
export function DeepSalesContext() {
  const [step, ref] = useInViewCycle(4, 850);
  const events = [
    { icon: PhoneCall, src: "Google Meet", title: "Renewal call · 32 min", time: "Yesterday 3:40 pm" },
    { icon: MessageCircle, src: "WhatsApp", title: "“Send updated pricing”", time: "Yesterday 5:12 pm" },
    { icon: Mail, src: "Gmail", title: "Logistics confirms Friday slot", time: "Today 7:02 am" },
    { icon: FileText, src: "Notion", title: "Spring 2026 contract brief attached", time: "Today 10:40 am" },
  ];
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-faint">Customer timeline</p>
        {events.map((e, i) => (
          <div
            key={e.title}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-all duration-500 ease-out",
              step >= i
                ? "translate-y-0 border-border bg-surface opacity-100"
                : "translate-y-2 border-border/30 bg-sidebar opacity-0"
            )}
          >
            <e.icon size={15} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
              <p className="truncate text-xs text-faint">{e.src}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs text-faint">{e.time}</span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">Kaveri Textiles</p>
          <p className="mt-1.5 text-lg font-semibold text-foreground">Annual supply · Renewal</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Asha Rao · ₹8,40,000 · Meera S</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-faint">
            <span className="rounded bg-sidebar px-1.5 py-0.5">Qualified</span>
            <span>→</span>
            <span className="rounded bg-foreground px-1.5 py-0.5 text-background">Negotiation</span>
            <span>→</span>
            <span className="rounded bg-sidebar px-1.5 py-0.5 text-faint">Won</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-sidebar p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">4 sources</span> on this record this week.
            Nothing copy-pasted.
          </p>
        </div>
      </div>
    </div>
  );
}

/* Deep-dive 02: Follow-ups that keep moving. Open loops → drafts → approvals. */
export function DeepFollowUps() {
  const [step, ref] = useInViewCycle(3, 1150);
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-faint">Open loops this week</p>
        {[
          { account: "Kaveri Textiles", loop: "Pricing question · 22h", done: true },
          { account: "Sundaram Mills", loop: "Net-term ask · 3d", done: step >= 1 },
          { account: "Northwind Traders", loop: "Site visit confirmation · 1d", done: step >= 2 },
        ].map((r) => (
          <div
            key={r.account}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-500",
              r.done ? "border-success/30 bg-success-soft-bg" : "border-border bg-surface"
            )}
          >
            <CheckCircle2
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className={cn("mt-0.5 shrink-0", r.done ? "text-success-ink" : "text-faint")}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{r.account}</p>
              <p className="truncate text-xs text-muted-foreground">{r.loop}</p>
            </div>
            <span
              className={cn(
                "shrink-0 whitespace-nowrap text-xs font-medium",
                r.done ? "text-success-ink" : "text-faint"
              )}
            >
              {r.done ? "Follow-up sent" : "Draft ready"}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-faint">Approval queue</p>
        <div className="mt-2 rounded-md border border-border bg-background p-3">
          <p className="text-sm font-medium text-foreground">Send pricing follow-up to Asha Rao</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sales Agent · reason attached · source: call notes + WhatsApp thread.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-foreground">Edit</span>
            <span className="rounded-md bg-foreground px-2 py-0.5 text-xs text-background">Approve</span>
            <span className="ml-auto text-xs text-faint">1 of 3</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Approvals are per agent. Customer-facing actions default to review.
        </p>
      </div>
    </div>
  );
}

/* Deep-dive 03: Early signals on deals and customers. */
export function DeepEarlySignals() {
  const [step, ref] = useInViewCycle(4, 750);
  const signals = [
    {
      kind: "warn",
      title: "Sundaram Mills · stalled 12d",
      reason: "No reply after the quote on Oct 24. Decision maker was out.",
    },
    {
      kind: "warn",
      title: "Bluepeak Pilot · lost momentum",
      reason: "Weekly cadence slipped; last touch 9d ago.",
    },
    {
      kind: "info",
      title: "Northwind Traders · buying signal",
      reason: "Procurement visited the quote link three times yesterday.",
    },
    {
      kind: "info",
      title: "Kaveri Textiles · ready to sign",
      reason: "Pricing accepted, Meet on calendar for Friday.",
    },
  ];
  return (
    <div ref={ref} className="space-y-2.5">
      {signals.map((s, i) => (
        <div
          key={s.title}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3 transition-all duration-500 ease-out",
            step >= i
              ? "translate-y-0 border-border bg-surface opacity-100"
              : "translate-y-2 border-border/30 bg-sidebar opacity-0"
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
              s.kind === "warn" ? "bg-warning-soft-bg text-warning" : "bg-info-soft-bg text-info-ink"
            )}
          >
            {s.kind === "warn" ? (
              <AlertCircle size={14} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{s.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
