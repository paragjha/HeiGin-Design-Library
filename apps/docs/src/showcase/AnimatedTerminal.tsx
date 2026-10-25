import * as React from "react";

export type TerminalLine =
  | { kind: "prompt"; text: string; delayMs?: number }
  | { kind: "ok"; text: string; delayMs?: number }
  | { kind: "info"; text: string; delayMs?: number }
  | { kind: "output"; text: string; delayMs?: number };

export interface AnimatedTerminalProps {
  lines: TerminalLine[];
  /** Base type speed in ms/character for prompt lines. Default: 40. */
  typeSpeedMs?: number;
  /** Delay between non-prompt lines. Default: 300. */
  stepMs?: number;
  /** Replay when the component re-mounts. Default: true. */
  autoplay?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Rendered {
  kind: TerminalLine["kind"];
  text: string;
  typing: boolean;
}

/** A terminal that types a command and reveals status lines one by one. */
export function AnimatedTerminal({
  lines,
  typeSpeedMs = 40,
  stepMs = 300,
  autoplay = true,
}: AnimatedTerminalProps) {
  const [out, setOut] = React.useState<Rendered[]>([]);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!autoplay) return;
    const reduce = prefersReducedMotion();
    let cancelled = false;
    const timers: number[] = [];
    setOut([]);
    setDone(false);

    const run = async () => {
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        const line = lines[i]!;
        const wait = (ms: number) =>
          new Promise<void>((resolve) => {
            const t = window.setTimeout(resolve, reduce ? Math.min(60, ms) : ms);
            timers.push(t);
          });

        await wait(line.delayMs ?? (line.kind === "prompt" ? 400 : stepMs));

        if (line.kind === "prompt" && !reduce) {
          setOut((prev) => [...prev, { kind: line.kind, text: "", typing: true }]);
          for (let c = 1; c <= line.text.length; c++) {
            if (cancelled) return;
            await wait(typeSpeedMs);
            setOut((prev) => {
              const copy = prev.slice();
              copy[copy.length - 1] = {
                kind: line.kind,
                text: line.text.slice(0, c),
                typing: c < line.text.length,
              };
              return copy;
            });
          }
          setOut((prev) => {
            const copy = prev.slice();
            copy[copy.length - 1] = { kind: line.kind, text: line.text, typing: false };
            return copy;
          });
        } else {
          setOut((prev) => [...prev, { kind: line.kind, text: line.text, typing: false }]);
        }
      }
      if (!cancelled) setDone(true);
    };

    void run();
    return () => {
      cancelled = true;
      for (const t of timers) window.clearTimeout(t);
    };
  }, [lines, typeSpeedMs, stepMs, autoplay]);

  return (
    <div className="hg-terminal" role="group" aria-label="Example terminal output">
      <div className="hg-terminal__chrome" aria-hidden="true">
        <span className="hg-terminal__dot hg-terminal__dot--r" />
        <span className="hg-terminal__dot hg-terminal__dot--y" />
        <span className="hg-terminal__dot hg-terminal__dot--g" />
      </div>
      <div className="hg-terminal__body" aria-live="polite">
        {out.map((l, i) => (
          <span key={i} className={`hg-terminal__line hg-terminal__line--${l.kind}`}>
            {l.text}
            {l.typing && <span className="hg-terminal__caret" aria-hidden="true" />}
          </span>
        ))}
        {done && (
          <span className="sr-only" role="status">
            Terminal finished.
          </span>
        )}
      </div>
    </div>
  );
}
