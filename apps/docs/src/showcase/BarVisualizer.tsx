import * as React from "react";

export type AgentState = "connecting" | "initializing" | "listening" | "speaking" | "thinking";

export interface BarVisualizerProps {
  state?: AgentState;
  /** Number of bars. Default: 20. */
  barCount?: number;
  /** Minimum visible height in pixels. Default: 15. */
  minHeight?: number;
  /** Maximum visible height in pixels. Default: 90. */
  maxHeight?: number;
  /** Fallback demo values (no mic). Default: true. */
  demo?: boolean;
  /** Container height in pixels. Default: 160. */
  height?: number;
  /** Bar colour. Default: HeiGin brand. */
  color?: string;
  className?: string;
}

/**
 * A row of animated bars that reads as an agent state. In demo mode (no mic
 * data), heights are generated with simple noise driven by requestAnimationFrame.
 */
export function BarVisualizer({
  state = "listening",
  barCount = 20,
  minHeight = 15,
  maxHeight = 90,
  demo = true,
  height = 160,
  color = "var(--hg-color-brand, #6366f1)",
  className,
}: BarVisualizerProps) {
  const barsRef = React.useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!demo) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bars = barsRef.current;
    const range = maxHeight - minHeight;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000; // seconds
      for (let i = 0; i < bars.length; i++) {
        const el = bars[i];
        if (!el) continue;
        const h = heightFor(state, i, barCount, t, range) + minHeight;
        el.style.height = `${Math.max(2, h)}px`;
        el.style.opacity = state === "connecting" ? "0.5" : "1";
      }
      if (!reduce) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, demo, barCount, minHeight, maxHeight]);

  return (
    <div
      className={["hg-bar-viz", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={`Agent ${state}`}
      style={{ height, color }}
    >
      {Array.from({ length: barCount }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="hg-bar-viz__bar"
          style={{ height: minHeight }}
        />
      ))}
    </div>
  );
}

function heightFor(state: AgentState, i: number, n: number, t: number, range: number): number {
  const centre = (n - 1) / 2;
  const distFromCentre = Math.abs(i - centre) / centre; // 0 at centre, 1 at edges
  switch (state) {
    case "connecting":
      // slow sweep pulse
      return 0.2 * range * (0.5 + 0.5 * Math.sin(t * 2 + i * 0.3));
    case "initializing":
      // left-to-right sweep
      return (
        range *
        (0.3 + 0.4 * Math.max(0, Math.sin(t * 2 - i * 0.4)))
      );
    case "listening":
      // mic-like noise, calm
      return (
        range *
        (0.25 + 0.25 * (Math.sin(t * 3 + i) + Math.sin(t * 5 + i * 0.7)) * 0.5 + Math.random() * 0.1)
      );
    case "speaking":
      // bigger centre-heavy burst
      return (
        range *
        (0.3 + (1 - distFromCentre * 0.7) * (0.3 + 0.5 * Math.abs(Math.sin(t * 7 + i))))
      );
    case "thinking":
      // slow bidirectional pulse
      return range * (0.3 + 0.3 * (Math.sin(t * 1.5 + i * 0.4) + 1) * 0.5);
    default:
      return range * 0.5;
  }
}
