"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import styles from "./crm.module.css";

export interface TaskRowProps {
  title: string;
  /** Related record, e.g. "Kaveri Textiles · Asha Rao". */
  context?: React.ReactNode;
  /** Due label, e.g. "Today, 4:00 pm". */
  due?: string;
  overdue?: boolean;
  done: boolean;
  onDoneChange: (done: boolean) => void;
  /** Optional trailing slot (assignee avatar, menu). */
  aside?: React.ReactNode;
  /** Opens the task. Rendered as the row's title button. */
  onOpen?: () => void;
  className?: string;
}

/** A to-do in a list: complete checkbox, title, context, due date. Use inside a <ul>. */
export function TaskRow({ title, context, due, overdue = false, done, onDoneChange, aside, onOpen, className }: TaskRowProps) {
  return (
    <li className={cn(styles.row, onOpen && styles.rowInteractive, done && styles.done, className)} data-done={done || undefined}>
      <span className={styles.rowControl} style={{ paddingTop: 1 }}>
        <Checkbox aria-label={`Mark "${title}" as ${done ? "not done" : "done"}`} checked={done} onCheckedChange={onDoneChange} />
      </span>
      <div className={styles.rowMain}>
        {onOpen ? (
          <button type="button" className={styles.rowTitle} onClick={onOpen}>
            {title}
          </button>
        ) : (
          <span className={styles.rowTitle}>{title}</span>
        )}
        {context && <div className={styles.rowMeta}>{context}</div>}
      </div>
      {(due || aside) && (
        <div className={styles.rowAside}>
          {due &&
            (overdue && !done ? (
              <Badge tone="danger" dot>
                Overdue · {due}
              </Badge>
            ) : (
              <span>{due}</span>
            ))}
          {aside}
        </div>
      )}
    </li>
  );
}
