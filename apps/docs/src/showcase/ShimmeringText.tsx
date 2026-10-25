import * as React from "react";

export interface ShimmeringTextProps {
  /** A single string or an array to rotate through. */
  text: string | string[];
  /** ms between rotations. Default: 3000. */
  intervalMs?: number;
  /** Shimmer cycle time in seconds. Default: 2.4. */
  shimmerSeconds?: number;
  className?: string;
}

/** A soft moving sheen on short status text. Rotates phrases if given an array. */
export function ShimmeringText({
  text,
  intervalMs = 3000,
  shimmerSeconds = 2.4,
  className,
}: ShimmeringTextProps) {
  const phrases = React.useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (phrases.length <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const swap = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 240);
    }, intervalMs);
    return () => window.clearInterval(swap);
  }, [phrases, intervalMs]);

  return (
    <span
      className={["hg-shimmer-text", className].filter(Boolean).join(" ")}
      style={{ animationDuration: `${shimmerSeconds}s` }}
      aria-live="polite"
    >
      <span className="hg-shimmer-text__slot" data-visible={visible}>
        {phrases[index]}
      </span>
    </span>
  );
}
