import { cn } from "../../lib/cn";
import styles from "./crm.module.css";

export interface DealStageProps {
  /** Ordered pipeline stages. */
  stages: string[];
  /** Current stage (must be in `stages`). */
  current: string;
  /** Deal is closed-lost: the current segment turns red and the label says so. */
  lost?: boolean;
  /** Hide stage labels (for table cells). */
  compact?: boolean;
  className?: string;
}

/** Pipeline progress as segmented bars. Text conveys the position ("Stage 3 of 5: Proposal"). Server-component safe. */
export function DealStage({ stages, current, lost = false, compact = false, className }: DealStageProps) {
  const index = Math.max(0, stages.indexOf(current));
  const summary = `${lost ? "Lost at" : "Stage"} ${index + 1} of ${stages.length}: ${current}`;
  return (
    <div className={className}>
      <ol className={cn(styles.stages, compact && styles.stagesCompact)} aria-label={summary} title={compact ? summary : undefined}>
        {stages.map((stage, i) => (
          <li
            key={stage}
            className={cn(styles.stage, i < index && styles.stageDone, i === index && (lost ? styles.stageLost : styles.stageCurrent))}
            aria-current={i === index ? "step" : undefined}
          >
            <span className={styles.stageBar} />
            <span className={styles.stageLabel}>{stage}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
