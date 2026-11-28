"use client";

import * as React from "react";
import { ArrowRightLeft, Bot, MessageCircle, Phone } from "lucide-react";
import {
  ActivityItem,
  ActivityTimeline,
  AgentTaskTrail,
  ApprovalCard,
  ConversationListItem,
  DealStage,
  MetricCard,
  MetricGroup,
  MoneyValue,
  TaskRow,
  type AgentStep,
} from "@heigin/ui";
import { launchConfig } from "@/lib/launch-config";
import { cn, parseInline, useTicker } from "@/lib/launch-utils";

export type PanelKind = "inbox" | "approval" | "timeline" | "metrics" | "trail" | "pipeline" | "tasks";

const TIMELINE_ICON = { agent: Bot, stage: ArrowRightLeft, call: Phone, message: MessageCircle } as const;
const STEP_MS = 1800;
const frame = "rounded-[10px] border border-[var(--hg-color-border)] bg-[var(--hg-color-surface)]";

function Rich({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => (part.kind === "bold" ? <strong key={i}>{part.value}</strong> : <React.Fragment key={i}>{part.value}</React.Fragment>))}
    </>
  );
}

/** The agent trail walks its steps while on screen, stops at the approval, then starts over. */
function Trail({ active }: { active: boolean }) {
  const t = launchConfig.samples.trail;
  const n = t.steps.length;
  // one tick per step, one holding on the approval, one at rest before the loop
  const k = useTicker(active, n + 2, STEP_MS);
  const steps: AgentStep[] = [
    ...t.steps.map((label, i): AgentStep => ({
      id: `s${i}`,
      label,
      status: i < k ? "done" : i === k ? "active" : "pending",
      seconds: i < k ? 4 + i * 3 : i === k ? 1 : undefined,
      activity: i === k ? "Working" : undefined,
    })),
    { id: "send", label: "Send and book", status: k >= n ? "waiting" : "approval", approval: { description: t.approval } },
  ];
  return <AgentTaskTrail title={t.title} agent={{ name: t.agent }} steps={steps} onApprove={() => undefined} onDecline={() => undefined} className="w-full" />;
}

/** The pipeline nudges its first deal one stage on per tick, so the board reads as live. */
function Pipeline({ active }: { active: boolean }) {
  const p = launchConfig.samples.pipeline;
  const k = useTicker(active, 3, STEP_MS * 1.4);
  return (
    <ul className={cn(frame, "m-0 grid list-none gap-0 p-0")}>
      {p.deals.map((d, i) => {
        const at = p.stages.indexOf(d.stage);
        const stage = p.stages[Math.min(p.stages.length - 1, i === 0 ? at + (k === 2 ? 1 : 0) : at)]!;
        return (
          <li key={d.name} className="grid gap-2 border-b border-[var(--hg-color-border)] px-4 py-3 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="font-medium text-[var(--hg-color-ink)]">{d.name}</span>
              <MoneyValue amount={d.amount} format="compact" className="text-[var(--hg-color-muted)]" />
            </div>
            <DealStage stages={p.stages} current={stage} compact />
          </li>
        );
      })}
    </ul>
  );
}

/** Tasks tick themselves off one at a time. */
function Tasks({ active }: { active: boolean }) {
  const tasks = launchConfig.samples.tasks;
  const k = useTicker(active, tasks.length + 1, STEP_MS);
  return (
    <ul className={cn(frame, "m-0 list-none p-1")}>
      {tasks.map((task, i) => (
        <TaskRow key={task.title} title={task.title} due={task.due} done={i < k} onDoneChange={() => undefined} />
      ))}
    </ul>
  );
}

/** A live HeiGin panel with sample data. `active` lets the moving ones run only while they are on screen. */
export function LaunchPanel({ kind, active = true, className }: { kind: PanelKind; active?: boolean; className?: string }) {
  const p = launchConfig.changelog.panels;
  let body: React.ReactNode;
  if (kind === "approval") body = <ApprovalCard {...p.approval} rung={1} onApprove={() => undefined} onReject={() => undefined} />;
  else if (kind === "inbox")
    body = (
      <ul className={cn(frame, "m-0 list-none overflow-hidden p-1")}>
        {p.inbox.map((m, i) => (
          <ConversationListItem key={m.name} {...m} href="#inbox" selected={i === 0} />
        ))}
      </ul>
    );
  else if (kind === "metrics")
    body = (
      <MetricGroup columns={3} label="Pipeline">
        {p.metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </MetricGroup>
    );
  else if (kind === "timeline")
    body = (
      <div className={cn(frame, "p-4")}>
        <ActivityTimeline label="Activity for Asha Rao">
          {p.timeline.map((t) => {
            const Icon = TIMELINE_ICON[t.kind];
            return (
              <ActivityItem key={t.dateTime} icon={<Icon size={14} />} dateTime={t.dateTime} timeLabel={t.timeLabel}>
                <Rich text={t.text} />
              </ActivityItem>
            );
          })}
        </ActivityTimeline>
      </div>
    );
  else if (kind === "trail") body = <Trail active={active} />;
  else if (kind === "pipeline") body = <Pipeline active={active} />;
  else body = <Tasks active={active} />;
  return <div className={cn("w-full text-left", className)}>{body}</div>;
}
