import { useEffect, useState } from "react";
import { AgentThinking, Badge, Button, Table, type LoaderVariant, type ThinkingStep } from "@heigin/ui";

const SCRIPT: [number, ThinkingStep][] = [
  [1.2, { id: "read", label: "Reading 48 open deals in the pipeline", shape: "cube" }],
  [3.4, { id: "quiet", label: "Searching activity for deals with no reply in 14 days", shape: "lens" }],
  [5.8, { id: "usage", label: "Checking renewal dates against product usage", shape: "globe" }],
  [7.8, { id: "rank", label: "Ranking the five riskiest by value", shape: "ring" }],
];

const ROWS = [
  { id: "kaveri", deal: "Kaveri Textiles · renewal", value: "₹18,40,000", signal: "No reply in 19 days", risk: "High" },
  { id: "asha", deal: "Asha Foods · expansion", value: "₹9,20,000", signal: "Usage down 34%", risk: "High" },
  { id: "meridian", deal: "Meridian Labs · new", value: "₹6,75,000", signal: "Champion left the company", risk: "Medium" },
];

/** Demo only: a scripted run with a canned answer. */
export default function ThinkingRun() {
  const [loader, setLoader] = useState<LoaderVariant>("orb");
  const [run, setRun] = useState(0);
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [status, setStatus] = useState<"thinking" | "done">("thinking");
  const [startedAt, setStartedAt] = useState(() => Date.now());

  useEffect(() => {
    setSteps([]);
    setStatus("thinking");
    setStartedAt(Date.now());
    const timers = SCRIPT.map(([s, step]) => window.setTimeout(() => setSteps((all) => [...all, step]), s * 1000));
    timers.push(window.setTimeout(() => setStatus("done"), 10000));
    return () => timers.forEach(window.clearTimeout);
  }, [run]);

  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <div role="group" aria-label="Loader style" style={{ display: "flex", gap: 6 }}>
          {(["orb", "spinner"] as const).map((v) => (
            <Button key={v} size="sm" touch={false} variant={loader === v ? "primary" : "secondary"} aria-pressed={loader === v} onClick={() => setLoader(v)}>
              {v === "orb" ? "Thinking orb" : "Spinner"}
            </Button>
          ))}
        </div>
        <Button size="sm" touch={false} variant="ghost" onClick={() => setRun((r) => r + 1)}>
          Ask again
        </Button>
      </div>
      <AgentThinking
        prompt="Which deals are most at risk this month?"
        steps={steps}
        status={status}
        startedAt={startedAt}
        loader={loader}
        onStop={() => setStatus("done")}
      >
        <p style={{ margin: "0 0 12px" }}>
          <b>Three deals worth ₹34.35L need attention this month.</b> Each has gone quiet or lost a signal that usually comes before a renewal.
        </p>
        <Table
          caption="Deals most at risk this month"
          getRowId={(r) => r.id}
          rows={ROWS}
          density="compact"
          columns={[
            { id: "deal", header: "Deal" },
            { id: "value", header: "Value", numeric: true, align: "end" },
            { id: "signal", header: "Signal", hideOnMobile: true },
            { id: "risk", header: "Risk", cell: (r) => <Badge tone={r.risk === "High" ? "danger" : "warning"}>{r.risk}</Badge> },
          ]}
        />
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--hg-color-muted)" }}>Sample data for the demo.</p>
      </AgentThinking>
    </div>
  );
}
