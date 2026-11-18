import { useState } from "react";
import { AgentDecisionTree, Button, type AgentDecision, type LoaderVariant } from "@heigin/ui";
import { ServiceLogo, type ServiceName } from "../../components/ServiceLogos";

const L = (name: ServiceName) => <ServiceLogo name={name} size={11} />;
const I = (name: ServiceName) => <ServiceLogo name={name} size={15} />;

const DECISIONS: AgentDecision[] = [
  {
    id: "incident",
    agent: { name: "Incident agent", model: "Claude Opus 5.5" },
    risk: "high",
    question: "Checkout errors jumped to 18% after deploy #482 – what should I do?",
    context: "2,140 errors in 12 minutes · about $3.2k in orders an hour at risk.",
    recommended: "rollback",
    branches: [
      { id: "rollback", label: "Roll back to #481", icon: I("vercel"), question: "Tell customers about it?", recommendedOption: "status", options: [
        { id: "status", label: "Post on the status page", icon: I("statuspage"), detail: "Public · updates every 15 min", apps: [L("statuspage"), L("slack")] },
        { id: "team", label: "Only tell the team", icon: I("slack"), detail: "#incidents only · nothing public", apps: [L("slack")] },
      ] },
      { id: "hotfix", label: "Ship a hotfix", icon: I("github"), question: "Wait for the test run?", options: [
        { id: "now", label: "Ship right away", warning: "Skips 1,284 tests", apps: [L("github"), L("vercel")] },
        { id: "tests", label: "After the tests", detail: "14 min · errors keep coming", apps: [L("github")] },
      ] },
      { id: "flag", label: "Turn the flag off", icon: I("launchdarkly"), outcome: <>New checkout off for 30%<br />The old one takes over</>, apps: [L("launchdarkly"), L("statuspage")] },
    ],
  },
  {
    id: "renewal",
    agent: { name: "Sales agent", model: "Claude Sonnet 5.5" },
    risk: "medium",
    question: "Acme wants 25% off their $84k renewal or they’ll switch – how should I respond?",
    context: "Renewal in 9 days · 212 seats · they asked twice on yesterday’s call.",
    recommended: "offer",
    branches: [
      { id: "offer", label: "Offer 15% instead", icon: I("gmail"), question: "Tie it to a longer contract?", recommendedOption: "two", options: [
        { id: "two", label: "Only with 2 years", detail: "$71.4k a year until 2028", apps: [L("gmail"), L("salesforce")] },
        { id: "one", label: "For one year", detail: "$71.4k · renews at full price", apps: [L("gmail")] },
      ] },
      { id: "vp", label: "Ask the VP", icon: I("slack"), question: "What should I send along?", options: [
        { id: "notes", label: "The call notes", detail: "Summary of yesterday’s call", apps: [L("slack"), L("notion")] },
        { id: "margin", label: "Usage and margin", warning: "Margin drops to 41%", apps: [L("slack"), L("salesforce")], note: { text: "Finance set a 45% floor for any discount above 20%.", source: "Finance · discount policy" } },
      ] },
      { id: "accept", label: "Accept 25%", icon: I("salesforce"), outcome: "$63k a year · needs sign-off", apps: [L("salesforce")] },
    ],
  },
  {
    id: "spend",
    agent: { name: "Infra agent", model: "Claude Haiku 5.5" },
    risk: "high",
    question: "AWS spend jumped 340% overnight – a stuck export job costs $410 an hour. What should I do?",
    context: "The job export-nightly has retried 9,800 times since 2:14 AM.",
    recommended: "stop",
    branches: [
      { id: "stop", label: "Stop the job", icon: I("aws"), question: "What about the half-done export?", recommendedOption: "restart", options: [
        { id: "restart", label: "Restart from checkpoint", detail: "Re-runs 3 of 8 hours · ~$40", apps: [L("aws")] },
        { id: "drop", label: "Write it off", warning: "Yesterday’s report stays empty", apps: [L("postgresql")] },
      ] },
      { id: "limit", label: "Set a spend limit", icon: I("datadog"), question: "How tight?", options: [
        { id: "fifty", label: "$50 an hour", warning: "Throttles 4 other services", apps: [L("aws")] },
        { id: "two-hundred", label: "$200 an hour", detail: "Only the export slows down", apps: [L("aws"), L("datadog")] },
      ] },
      { id: "page", label: "Page the on-call", icon: I("pagerduty"), outcome: <>Wakes Maya, on call this week<br />Costs run until she’s in</>, apps: [L("pagerduty"), L("slack")] },
    ],
  },
];

const REPLIES: Record<string, string> = {
  incident: "Got it – holding the deploy and watching error rates. I’ll check back in 10 minutes.",
  renewal: "Understood – I’ll hold the offer and draft a reply for you to review first.",
  spend: "On it – job stopped, snapshot saved. I’ll restart it at 1 PM when traffic is low.",
};

/** Demo only: three queued decisions. Choices are logged here; nothing is sent. */
export default function DecisionQueue() {
  const [loader, setLoader] = useState<LoaderVariant>("orb");
  const [round, setRound] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  return (
    <div style={{ display: "grid", gap: 12, width: "100%" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <div role="group" aria-label="Loader style" style={{ display: "flex", gap: 6 }}>
          {(["orb", "spinner"] as const).map((v) => (
            <Button key={v} size="sm" touch={false} variant={loader === v ? "primary" : "secondary"} aria-pressed={loader === v} onClick={() => setLoader(v)}>
              {v === "orb" ? "Thinking orb" : "Spinner"}
            </Button>
          ))}
        </div>
        <Button size="sm" touch={false} variant="ghost" onClick={() => { setRound((r) => r + 1); setLog([]); }}>
          Start over
        </Button>
      </div>
      <AgentDecisionTree
        key={round}
        decisions={DECISIONS}
        loader={loader}
        onDecide={(d, choice) =>
          new Promise((resolve) =>
            window.setTimeout(() => {
              const what = choice.kind === "other" ? `“${choice.text}”` : choice.kind === "option" ? `${choice.branch.label} → ${choice.option.label}` : choice.branch.label;
              setLog((l) => [`${d.agent.name}: ${what}`, ...l].slice(0, 3));
              resolve(choice.kind === "other" ? REPLIES[d.id] : undefined);
            }, 900),
          )
        }
      />
      <p role="status" style={{ margin: 0, fontSize: 12, color: "var(--hg-color-muted)" }}>
        {log.length ? log.join(" · ") : "No decisions yet (demo, nothing is sent)"}
      </p>
    </div>
  );
}
