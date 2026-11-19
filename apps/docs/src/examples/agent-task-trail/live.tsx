import { useEffect, useRef, useState } from "react";
import { AgentTaskTrail, Button, type AgentStep, type LoaderVariant } from "@heigin/ui";
import { ServiceLogo } from "../../components/ServiceLogos";

const logo = (name: Parameters<typeof ServiceLogo>[0]["name"]) => <ServiceLogo name={name} size={12} />;

const start = (): AgentStep[] => [
  { id: "read", label: "Read the bug report", icon: logo("linear"), status: "done", seconds: 8, substeps: [{ label: "Opened ENG-2291", meta: "Linear" }, { label: "Crash only on an empty cart", meta: "3 reports" }] },
  { id: "repro", label: "Reproduce the crash", icon: logo("vercel"), status: "done", seconds: 34, substeps: [{ label: "Deployed a preview", meta: "preview-482" }, { label: "Crashed on submit", meta: "TypeError" }] },
  { id: "patch", label: "Patch the checkout form", icon: logo("github"), status: "active", activity: "Editing", seconds: 21, substeps: [{ label: "Found the empty-cart case", meta: "cart.ts:142" }, { label: "Added a guard and 2 tests", meta: "+18 −3" }] },
  { id: "note", label: "Write the release note", icon: logo("notion"), status: "pending" },
  { id: "pr", label: "Open a pull request", icon: logo("github"), status: "approval", approval: { description: "Open PR #482 “Fix crash on empty cart” against main – 3 files, 214 tests passing." } },
];

/** Demo only: a scripted run that loops. Nothing is opened or sent. */
export default function LiveTrail() {
  const [steps, setSteps] = useState<AgentStep[]>(start);
  const [loader, setLoader] = useState<LoaderVariant>("orb");
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);

  const patch = (id: string, change: Partial<AgentStep> | ((s: AgentStep) => Partial<AgentStep>)) =>
    setSteps((all) => all.map((s) => (s.id === id ? { ...s, ...(typeof change === "function" ? change(s) : change) } : s)));
  const addSub = (id: string, label: string, meta: string) => patch(id, (s) => ({ substeps: [...(s.substeps ?? []), { label, meta }] }));

  useEffect(() => {
    const at = (sec: number, fn: () => void) => timers.current.push(window.setTimeout(fn, sec * 1000));
    const tick = window.setInterval(() => setSteps((all) => all.map((s) => (s.status === "active" ? { ...s, seconds: (s.seconds ?? 0) + 1 } : s))), 1000);
    at(3, () => { patch("patch", { activity: "Testing" }); addSub("patch", "Running the test suite", "182/214"); });
    at(7, () => { patch("patch", { activity: "Editing" }); addSub("patch", "All tests pass", "214/214"); });
    at(10, () => { patch("patch", { status: "done", activity: undefined }); patch("note", { status: "active", activity: "Writing", seconds: 0 }); addSub("note", "Added a 2.4.1 entry", "CHANGELOG.md"); });
    at(13, () => addSub("note", "Linked issue #318", "ENG-2291"));
    at(16, () => { patch("note", { status: "done", activity: undefined }); patch("pr", { status: "waiting" }); });
    return () => { window.clearInterval(tick); timers.current.forEach(window.clearTimeout); timers.current = []; };
    // The script restarts per run; patch/addSub only wrap the stable setSteps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const restart = (delay: number) => timers.current.push(window.setTimeout(() => { setSteps(start()); setRun((r) => r + 1); }, delay));

  return (
    // A full-width column, so the trail keeps its own width instead of growing when the approval text opens.
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12, justifyItems: "start", width: "100%", maxWidth: 400 }}>
      <div role="group" aria-label="Loader style" style={{ display: "flex", gap: 6 }}>
        {(["orb", "spinner"] as const).map((v) => (
          <Button key={v} size="sm" touch={false} variant={loader === v ? "primary" : "secondary"} aria-pressed={loader === v} onClick={() => setLoader(v)}>
            {v === "orb" ? "Thinking orb" : "Spinner"}
          </Button>
        ))}
      </div>
      <AgentTaskTrail
        title="Fix the checkout crash"
        loader={loader}
        steps={steps}
        onApprove={() =>
          new Promise<void>((resolve) =>
            window.setTimeout(() => {
              patch("pr", { status: "active", activity: "Opening", seconds: 0 });
              timers.current.push(window.setTimeout(() => { addSub("pr", "Opened PR #482", "3 files"); patch("pr", { status: "done", activity: undefined, seconds: 3 }); restart(4000); }, 2500));
              resolve();
            }, 500),
          )
        }
        onDecline={() => { patch("pr", { status: "declined" }); restart(3000); }}
      />
    </div>
  );
}
