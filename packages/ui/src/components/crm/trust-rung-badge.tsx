import { Badge } from "../ui/badge";

export type TrustRung = 0 | 1 | 2 | 3;

/** Canonical trust-ladder labels from the HeiGin product context. Use these words everywhere. */
export const TRUST_RUNGS: Record<TrustRung, { label: string; meaning: string }> = {
  0: { label: "Read only", meaning: "Reads and summarises. Changes nothing." },
  1: { label: "Propose", meaning: "Suggests an action. A human approves before anything happens." },
  2: { label: "Act with review", meaning: "Does the action; a human reviews after, with undo." },
  3: { label: "Autonomous", meaning: "Acts without review. Still logged with undo where possible." },
};

export interface TrustRungBadgeProps {
  rung: TrustRung;
  /** Show "R2 · Act with review" instead of just the label. */
  showCode?: boolean;
  className?: string;
}

/** The AI agent's autonomy level for a capability. Server-component safe. */
export function TrustRungBadge({ rung, showCode = true, className }: TrustRungBadgeProps) {
  const { label, meaning } = TRUST_RUNGS[rung];
  return (
    <Badge tone={rung >= 2 ? "info" : "neutral"} title={meaning} className={className} data-rung={rung}>
      {showCode ? `R${rung} · ${label}` : label}
    </Badge>
  );
}
