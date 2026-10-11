import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export interface ActivityItemProps {
  /** Icon for the activity type (call, WhatsApp, note, stage change...). Decorative. */
  icon: React.ReactNode;
  /** One-line summary, e.g. "<strong>Meera S</strong> called Asha Rao". */
  children: React.ReactNode;
  /** Machine-readable timestamp (ISO 8601). */
  dateTime: string;
  /** Display time, e.g. "2:40 pm" or "Yesterday". */
  timeLabel: string;
  /** Optional body: message excerpt, note, or change details. */
  detail?: React.ReactNode;
  className?: string;
}

/** One entry in a record's activity timeline. Use inside ActivityTimeline. Server-component safe. */
export function ActivityItem({ icon, children, dateTime, timeLabel, detail, className }: ActivityItemProps) {
  return (
    <li className={cn(styles.timelineItem, className)}>
      <span className={styles.timelineIcon} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.timelineBody}>
        <span>{children}</span>
        <time dateTime={dateTime} className={styles.timelineTime}>
          {timeLabel}
        </time>
        {detail && <div className={styles.timelineDetail}>{detail}</div>}
      </div>
    </li>
  );
}

export interface ActivityTimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Accessible name, e.g. "Activity for Asha Rao". */
  label: string;
  children: React.ReactNode;
}

/** Chronological record history (newest first). An ordered list, so position is announced. */
export function ActivityTimeline({ label, className, children, ...props }: ActivityTimelineProps) {
  return (
    <ol aria-label={label} className={cn(styles.timeline, className)} {...props}>
      {children}
    </ol>
  );
}
