import * as React from "react";

export type OrbState = null | "listening" | "talking";

export interface OrbPalette {
  /** Three gradient stops used for the orb. */
  stops: [string, string, string];
}

export interface AgentOrbProps {
  state?: OrbState;
  /** Size in CSS pixels. Default: 128. */
  size?: number;
  /** Three colour stops; defaults to a brand gradient. */
  palette?: OrbPalette;
  /** Deterministic seed; affects wobble phase so stacks of orbs feel distinct. */
  seed?: number;
  className?: string;
}

const defaultPalette: OrbPalette = {
  stops: ["#6366f1", "#22d3ee", "#a855f7"],
};

/**
 * An agent-state orb. It renders a conic-gradient disk that gently wobbles
 * on its own; the state (idle / listening / talking) changes the breathing
 * rhythm and the glow intensity. No canvas — just two layered circles.
 */
export function AgentOrb({
  state = null,
  size = 128,
  palette = defaultPalette,
  seed = 0,
  className,
}: AgentOrbProps) {
  const style = {
    width: size,
    height: size,
    ["--orb-s0"]: palette.stops[0],
    ["--orb-s1"]: palette.stops[1],
    ["--orb-s2"]: palette.stops[2],
    ["--orb-seed"]: `${seed}`,
  } as React.CSSProperties;
  return (
    <div
      className={["hg-orb", `hg-orb--${state ?? "idle"}`, className].filter(Boolean).join(" ")}
      style={style}
      role="img"
      aria-label={`Agent ${state ?? "idle"}`}
    >
      <div className="hg-orb__glow" aria-hidden="true" />
      <div className="hg-orb__disk" aria-hidden="true" />
      <div className="hg-orb__sheen" aria-hidden="true" />
    </div>
  );
}
