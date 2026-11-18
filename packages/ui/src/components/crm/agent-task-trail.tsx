"use client";

import * as React from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../ui/button";
import { HeiGinMark } from "../ui/heigin-mark";
import { Loader, type LoaderVariant } from "../ui/loader";
import { VisuallyHidden } from "../ui/visually-hidden";
import styles from "./agent.module.css";

export type AgentStepStatus = "done" | "active" | "pending" | "approval" | "waiting" | "declined";

export interface AgentSubstep {
  label: React.ReactNode;
  /** Right-aligned detail: a file, a diff count, a progress figure. */
  meta?: React.ReactNode;
}

export interface AgentStepApproval {
  /** What will happen if approved, in one or two sentences. */
  description: React.ReactNode;
  approveLabel?: string;
  declineLabel?: string;
}

export interface AgentStep {
  id: string;
  label: string;
  /** The service the step works in (a 12px mark). */
  icon?: React.ReactNode;
  /**
   * `done`, `active` (running now), `pending` (not started), `approval` (will need a person),
   * `waiting` (needs a person now) or `declined`.
   */
  status: AgentStepStatus;
  /** What the agent is doing while the step is active, e.g. "Editing". */
  activity?: string;
  /** Elapsed seconds, or the final duration once done. */
  seconds?: number;
  /** When the active step started (ms since epoch). The timer then ticks on its own. */
  startedAt?: number;
  substeps?: AgentSubstep[];
  /** Required when status is `approval` or `waiting`. */
  approval?: AgentStepApproval;
}

export interface AgentTaskTrailProps {
  title: string;
  /** Who is working. Defaults to the HeiGin agent. */
  agent?: { name: string; icon?: React.ReactNode };
  steps: AgentStep[];
  /** Indicator on the running step: the thinking orb (default) or a spinner. */
  loader?: LoaderVariant;
  /** Steps whose sub-steps start open. The running step is always open. */
  defaultOpen?: string[];
  onApprove?: (step: AgentStep) => void | Promise<void>;
  onDecline?: (step: AgentStep) => void;
  className?: string;
}

const formatSeconds = (s: number) => (s < 1 ? "<1s" : s < 60 ? `${Math.floor(s)}s` : `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`);

const STATUS_TEXT: Record<AgentStepStatus, string> = {
  done: "done",
  active: "in progress",
  pending: "not started",
  approval: "will need your approval",
  waiting: "needs your approval",
  declined: "declined",
};

/** Wall-clock ms, ticking once a second while enabled. `null` until mounted, so SSR output is stable. */
function useNow(enabled: boolean) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

function Node({ status, loader }: { status: AgentStepStatus; loader: LoaderVariant }) {
  if (status === "active") {
    return loader === "orb" ? (
      <Loader variant="orb" size="sm" orbState="working" label={null} />
    ) : (
      <Loader variant="spinner" size="sm" label={null} className={styles.nodeSpinner} />
    );
  }
  if (status === "done")
    return (
      <svg viewBox="0 0 18 18" className={styles.nodeDone} aria-hidden="true">
        <circle cx="9" cy="9" r="9" />
        <path d="M5.6 9.3l2.2 2.1 4.6-4.7" />
      </svg>
    );
  if (status === "waiting")
    return (
      <svg viewBox="0 0 18 18" className={styles.nodeWaiting} aria-hidden="true">
        <circle cx="9" cy="9" r="9" />
        <rect x="6.2" y="5.6" width="1.9" height="6.8" rx=".6" />
        <rect x="9.9" y="5.6" width="1.9" height="6.8" rx=".6" />
      </svg>
    );
  if (status === "declined")
    return (
      <svg viewBox="0 0 18 18" className={styles.nodeDeclined} aria-hidden="true">
        <circle cx="9" cy="9" r="9" />
        <path d="M6.4 6.4l5.2 5.2M11.6 6.4l-5.2 5.2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 18 18" className={status === "approval" ? styles.nodeApproval : styles.nodePending} aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" />
    </svg>
  );
}

/**
 * A live timeline of an agent working through a task: each step with its service, status and
 * time, sub-steps on a branching rail, and an approval gate for steps that need a person.
 */
export function AgentTaskTrail({
  title,
  agent = { name: "HeiGin Agent" },
  steps,
  loader = "orb",
  defaultOpen = [],
  onApprove,
  onDecline,
  className,
}: AgentTaskTrailProps) {
  const headingId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const railRef = React.useRef<SVGSVGElement>(null);
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(defaultOpen));
  const [touched, setTouched] = React.useState<Set<string>>(() => new Set());
  const [askHidden, setAskHidden] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);
  const prev = React.useRef<Map<string, AgentStepStatus>>(new Map());
  const now = useNow(steps.some((s) => s.status === "active" && s.startedAt));

  // Open the running step; close a step when it finishes, unless the person opened it themselves.
  React.useEffect(() => {
    setOpen((current) => {
      let next = current;
      for (const s of steps) {
        const before = prev.current.get(s.id);
        if (s.status === "active" && !next.has(s.id)) next = new Set(next).add(s.id);
        if (before === "active" && s.status !== "active" && next.has(s.id) && !touched.has(s.id)) {
          next = new Set(next);
          next.delete(s.id);
        }
      }
      return next;
    });
    for (const s of steps) prev.current.set(s.id, s.status);
  }, [steps, touched]);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const active = steps.find((s) => s.status === "active");
  const waiting = steps.find((s) => s.status === "waiting");

  /* ---- rail: measured from the DOM, redrawn while sub-steps animate ---- */
  const drawRail = React.useCallback(() => {
    const list = listRef.current;
    const svg = railRef.current;
    if (!list || !svg) return;
    const box = list.getBoundingClientRect();
    const items = Array.from(list.querySelectorAll<HTMLElement>(":scope > ol > li"));
    const pts = items.map((li) => {
      const r = li.querySelector("[data-node]")!.getBoundingClientRect();
      return { top: r.top - box.top + 1, bottom: r.bottom - box.top - 1, x: r.left - box.left + r.width / 2 };
    });
    const SX = (pts[0]?.x ?? 10) + 13;
    let on = "";
    let off = "";
    let dots = "";
    items.forEach((li, i) => {
      const p = pts[i];
      const n = pts[i + 1];
      if (!p) return;
      const status = li.dataset.status as AgentStepStatus;
      const flowing = status === "done" || status === "active";
      const wrap = li.querySelector<HTMLElement>("[data-subs]");
      const wrapBox = wrap?.getBoundingClientRect();
      const rows = wrap
        ? Array.from(wrap.querySelectorAll<HTMLElement>("[data-sub]"))
            .map((r) => {
              const b = r.getBoundingClientRect();
              return b.top - box.top + b.height / 2;
            })
            .filter((y) => wrapBox && y < wrapBox.bottom - box.top - 2)
        : [];
      const first = rows[0];
      const last = rows[rows.length - 1];
      if (first !== undefined && last !== undefined && wrapBox && wrapBox.height > 6) {
        const endY = n ? n.top - 1 : last + 8;
        const into = `M${p.x} ${p.bottom + 2} C ${p.x} ${p.bottom + 10}, ${SX} ${first - 12}, ${SX} ${first - 4} L ${SX} ${last}`;
        const rest = n ? `M${SX} ${last} C ${SX} ${last + 10}, ${p.x} ${endY - 12}, ${p.x} ${endY}` : "";
        if (flowing) {
          on += into;
          if (status === "done") on += rest;
          else off += rest;
        } else off += into + rest;
        rows.forEach((y, k) => {
          const current = status === "active" && k === rows.length - 1;
          dots += current
            ? `<circle class="${styles.dotRing}" cx="${SX}" cy="${y}" r="5"/><circle class="${styles.dotCurrent}" cx="${SX}" cy="${y}" r="2.6"/>`
            : `<circle class="${styles.dotDone}" cx="${SX}" cy="${y}" r="2.4"/>`;
        });
      } else if (n) {
        const seg = `M${p.x} ${p.bottom + 2} L ${n.x} ${n.top - 1}`;
        const next = items[i + 1]?.dataset.status;
        if (status === "done" && next !== "pending" && next !== "approval") on += seg;
        else off += seg;
      }
    });
    svg.innerHTML = `<path class="${styles.railOff}" d="${off}"/><path class="${styles.railOn}" d="${on}"/>${dots}`;
  }, []);

  React.useLayoutEffect(() => {
    let raf = 0;
    const until = performance.now() + 650;
    const loop = () => {
      drawRail();
      if (performance.now() < until) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [drawRail, steps, open, askHidden]);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => drawRail());
    ro.observe(list);
    return () => ro.disconnect();
  }, [drawRail]);

  const toggle = (id: string) => {
    setTouched((t) => new Set(t).add(id));
    setOpen((o) => {
      const next = new Set(o);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const approve = async (step: AgentStep) => {
    setPending(step.id);
    try {
      await onApprove?.(step);
    } finally {
      setPending(null);
    }
  };

  const liveText = waiting
    ? `${waiting.label}: needs your approval`
    : active
      ? `${active.label}${active.activity ? `: ${active.activity}` : ""}`
      : doneCount === steps.length
        ? `${title}: all steps done`
        : "";

  return (
    <section className={cn(styles.trail, className)} aria-labelledby={headingId}>
      <header className={styles.trailHead}>
        <h3 id={headingId} className={styles.trailTitle}>
          {title}
        </h3>
        <span className={styles.agentChip}>
          {agent.icon ?? <HeiGinMark size={14} />}
          {agent.name}
        </span>
        <span className={styles.count}>
          <VisuallyHidden>Steps done: </VisuallyHidden>
          {doneCount}/{steps.length}
        </span>
      </header>
      <div ref={listRef} className={styles.steps}>
      <svg ref={railRef} className={styles.rail} aria-hidden="true" />
      <ol className={styles.stepList}>
        {steps.map((step) => {
          const subs = step.substeps ?? [];
          const isOpen = (open.has(step.id) || step.status === "active") && subs.length > 0;
          const expandable = step.status === "done" && subs.length > 0;
          const seconds = step.status === "active" && step.startedAt && now !== null ? Math.max(0, (now - step.startedAt) / 1000) : step.seconds;
          const subsId = `${headingId}-${step.id}-subs`;

          const rowInner = (
            <>
              <span className={styles.node} data-node>
                <Node status={step.status} loader={loader} />
              </span>
              <span className={styles.icon} aria-hidden="true">
                {step.icon}
              </span>
              <span className={styles.label}>
                <span>{step.label}</span>
                <VisuallyHidden>, {STATUS_TEXT[step.status]}</VisuallyHidden>
                {expandable && <ChevronRight className={styles.chev} strokeWidth={1.6} aria-hidden="true" />}
              </span>
              <span className={styles.end}>
                {step.status === "active" && step.activity && (
                  // Keyed on the text, so a new activity remounts and plays the swap animation.
                  <span key={step.activity} className={styles.activity} data-changed="true">
                    {step.activity}
                  </span>
                )}
                {(step.status === "active" || step.status === "done") && seconds !== undefined && (
                  <span className={styles.time}>{formatSeconds(seconds)}</span>
                )}
                {step.status === "approval" && <span className={styles.badge}>Approval</span>}
                {step.status === "declined" && <span className={styles.declinedText}>Declined</span>}
              </span>
            </>
          );

          return (
            <li key={step.id} data-status={step.status} data-open={isOpen}>
              {expandable ? (
                <button type="button" className={styles.row} aria-expanded={isOpen} aria-controls={subsId} onClick={() => toggle(step.id)}>
                  {rowInner}
                </button>
              ) : (
                <div className={styles.row}>
                  {rowInner}
                  {step.status === "waiting" && (
                    <button
                      type="button"
                      className={cn(styles.badge)}
                      style={{ gridColumn: 4, gridRow: 1 }}
                      aria-expanded={!askHidden}
                      aria-controls={`${subsId}-ask`}
                      onClick={() => setAskHidden((h) => !h)}
                    >
                      Needs you <ChevronUp strokeWidth={2} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
              {subs.length > 0 && (
                <div className={styles.collapse} data-open={isOpen} data-subs id={subsId}>
                  <div>
                    <ul className={styles.subs} aria-label={`${step.label} details`}>
                      {subs.map((sub, k) => (
                        <li key={k} className={styles.sub} data-sub data-current={step.status === "active" && k === subs.length - 1}>
                          <span>{sub.label}</span>
                          {sub.meta !== undefined && <span className={styles.subMeta}>{sub.meta}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {step.status === "waiting" && step.approval && (
                <div className={styles.collapse} data-open={!askHidden} id={`${subsId}-ask`}>
                  <div>
                    <p className={styles.ask}>{step.approval.description}</p>
                    <div className={styles.askActions}>
                      <Button variant="ghost" size="sm" touch={false} disabled={pending === step.id} onClick={() => onDecline?.(step)}>
                        {step.approval.declineLabel ?? "Decline"}
                      </Button>
                      <Button variant="secondary" size="sm" touch={false} loading={pending === step.id} onClick={() => approve(step)}>
                        {step.approval.approveLabel ?? "Approve"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      </div>
      <VisuallyHidden>
        <span role="status" aria-live="polite">
          {liveText}
        </span>
      </VisuallyHidden>
    </section>
  );
}
