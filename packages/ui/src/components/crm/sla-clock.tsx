import { Clock } from "lucide-react";
import { cn } from "../../lib/cn";
import { VisuallyHidden } from "../ui/visually-hidden";
import styles from "./crm.module.css";

export type SLAState = "on_track" | "due_soon" | "breached";

const STATE: Record<SLAState, { className: string | undefined; word: string }> = {
  on_track: { className: styles.toneSuccess, word: "On track" },
  due_soon: { className: styles.toneWarning, word: "Due soon" },
  breached: { className: styles.toneDanger, word: "Breached" },
};

export interface SLAClockProps {
  state: SLAState;
  /** Human time string, e.g. "2h 10m left" or "20m over". Compute it in your app. */
  time: string;
  /** Show the state word visibly (default hidden, still announced). */
  showLabel?: boolean;
  className?: string;
}

/** First-reply SLA countdown. The state word and time carry meaning, not just colour. Server-component safe. */
export function SLAClock({ state, time, showLabel = false, className }: SLAClockProps) {
  const { className: tone, word } = STATE[state];
  return (
    <span className={cn(styles.inlineMark, tone, className)} data-state={state}>
      <Clock strokeWidth={1.6} aria-hidden="true" />
      {showLabel ? <span>{word} ·</span> : <VisuallyHidden>{word}:</VisuallyHidden>}
      <span className={styles.tabular}>{time}</span>
    </span>
  );
}
