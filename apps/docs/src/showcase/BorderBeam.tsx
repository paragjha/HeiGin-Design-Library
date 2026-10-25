import * as React from "react";

export interface BorderBeamProps {
  /** Beam travel time in seconds. Default: 8. */
  duration?: number;
  /** First beam colour. Default: #a855f7. */
  colorFrom?: string;
  /** Second beam colour. Default: #22d3ee. */
  colorTo?: string;
  /** Beam arc length in degrees, 10–120. Default: 60. */
  size?: number;
  className?: string;
}

/**
 * A beam that travels along the parent's border. Position the parent `relative`
 * and non-visible-overflow; the beam reads the parent's border-radius.
 */
export function BorderBeam({
  duration = 8,
  colorFrom = "#a855f7",
  colorTo = "#22d3ee",
  size = 60,
  className,
}: BorderBeamProps) {
  const style: React.CSSProperties & Record<string, string> = {
    ["--beam-duration"]: `${duration}s`,
    ["--beam-color-from"]: colorFrom,
    ["--beam-color-to"]: colorTo,
    ["--beam-size"]: `${Math.max(10, Math.min(120, size))}px`,
  };
  return (
    <span
      className={["hg-border-beam", className].filter(Boolean).join(" ")}
      aria-hidden="true"
      style={style}
    />
  );
}
