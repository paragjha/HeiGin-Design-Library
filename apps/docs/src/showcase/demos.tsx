import * as React from "react";
import { Card, Button, Input, Field } from "@heigin/ui";
import { AvatarCircles } from "./AvatarCircles";
import { BorderBeam } from "./BorderBeam";
import { RainbowButton } from "./RainbowButton";
import { AnimatedTerminal } from "./AnimatedTerminal";
import { FileTree, type FileTreeNode } from "./FileTree";
import { SaasLanding } from "./SaasLanding";
import { BarVisualizer, type AgentState } from "./BarVisualizer";
import { ShimmeringText } from "./ShimmeringText";
import { IntegrationBeam } from "./IntegrationBeam";
import { CursorParticles, type ParticleMode } from "./CursorParticles";
import { DotMatrixOrb } from "./DotMatrixOrb";
import { AgentOrb, type OrbState } from "./AgentOrb";
import { DottedGlobe } from "./DottedGlobe";
import { IconCloud, type CloudIcon } from "./IconCloud";

export function AvatarCirclesDemo() {
  return (
    <AvatarCircles
      max={5}
      numPeople={99}
      people={[
        { name: "Dillion Verma", imageUrl: "https://avatars.githubusercontent.com/u/16860528" },
        { name: "Shoubhit Dash", imageUrl: "https://avatars.githubusercontent.com/u/20110627" },
        { name: "Khushal Agarwal", imageUrl: "https://avatars.githubusercontent.com/u/106103625" },
        { name: "Yash Dongre", imageUrl: "https://avatars.githubusercontent.com/u/59228569" },
        { name: "Pontus Abrahamsson", imageUrl: "https://avatars.githubusercontent.com/u/16860528" },
        { name: "Max Leiter" },
      ]}
    />
  );
}

export function BorderBeamDemo() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  return (
    <Card className="hg-border-beam-host" style={{ width: 320, padding: 24 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Welcome back</h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--docs-ink-secondary)" }}>Sign in to continue.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button variant="primary" style={{ marginTop: 4 }}>Sign in</Button>
      </div>
      <BorderBeam duration={8} />
    </Card>
  );
}

export function RainbowButtonDemo() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <RainbowButton onClick={() => undefined}>Get HeiGin UI</RainbowButton>
      <RainbowButton speed={3}>Faster</RainbowButton>
    </div>
  );
}

const terminalLines: Parameters<typeof AnimatedTerminal>[0]["lines"] = [
  { kind: "prompt", text: "npm install @heigin/ui" },
  { kind: "ok", text: "✔ Resolved 1 package" },
  { kind: "ok", text: "✔ Fetched @heigin/ui@0.1.1" },
  { kind: "ok", text: "✔ Installed 1 package in 1.4s" },
  { kind: "info", text: "ℹ Add @heigin/ui/styles.css to your app root." },
  { kind: "output", text: "" },
  { kind: "prompt", text: 'echo "import { Button } from \\"@heigin/ui\\";"' },
  { kind: "ok", text: "✔ Ready to build." },
];

export function AnimatedTerminalDemo() {
  // Remount button to replay.
  const [key, setKey] = React.useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", width: "100%", maxWidth: 560 }}>
      <AnimatedTerminal key={key} lines={terminalLines} />
      <button
        type="button"
        className="link-button"
        onClick={() => setKey((k) => k + 1)}
      >
        Replay
      </button>
    </div>
  );
}

const treeNodes: FileTreeNode[] = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "src/app",
        name: "app",
        children: [
          { id: "src/app/page.tsx", name: "page.tsx" },
          { id: "src/app/layout.tsx", name: "layout.tsx" },
        ],
      },
      {
        id: "src/components",
        name: "components",
        children: [
          { id: "src/components/header.tsx", name: "header.tsx" },
          { id: "src/components/footer.tsx", name: "footer.tsx" },
          {
            id: "src/components/ui",
            name: "ui",
            children: [{ id: "src/components/ui/button.tsx", name: "button.tsx" }],
          },
        ],
      },
      {
        id: "src/lib",
        name: "lib",
        children: [{ id: "src/lib/utils.ts", name: "utils.ts" }],
      },
    ],
  },
  { id: "package.json", name: "package.json" },
  { id: "tsconfig.json", name: "tsconfig.json" },
];

export function SaasLandingDemo() {
  return <SaasLanding onCtaClick={() => undefined} />;
}

export function BarVisualizerDemo() {
  const [state, setState] = React.useState<AgentState>("listening");
  const states: AgentState[] = ["connecting", "initializing", "listening", "speaking", "thinking"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 520 }}>
      <BarVisualizer state={state} demo barCount={20} minHeight={6} maxHeight={60} height={120} />
      <div className="hg-bar-viz-demo__controls">
        {states.map((s) => (
          <Button key={s} variant={state === s ? "primary" : "secondary"} size="sm" onClick={() => setState(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function ShimmeringTextDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
      <ShimmeringText
        text={[
          "Agent is thinking…",
          "Processing your request…",
          "Analyzing the data…",
          "Generating response…",
          "Almost there…",
        ]}
        shimmerSeconds={2.2}
      />
      <div style={{ fontSize: 12, color: "var(--docs-ink-secondary)" }}>Phrases swap every 3 s.</div>
    </div>
  );
}

const BrandMark = ({ fill }: { fill: string }) => (
  <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden="true"><rect x="2" y="2" width="18" height="18" rx="4" fill={fill} /></svg>
);
const UserIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

export function IntegrationBeamDemo() {
  return (
    <IntegrationBeam
      from={{ id: "hub", label: "HeiGin UI", node: <BrandMark fill="#6366f1" /> }}
      to={[
        { id: "stripe", label: "Stripe", node: <BrandMark fill="#635bff" /> },
        { id: "slack", label: "Slack", node: <BrandMark fill="#4a154b" /> },
        { id: "user", label: "Your users", node: <UserIcon /> },
      ]}
      duration={2.5}
    />
  );
}

export function DotMatrixOrbDemo() {
  const shapes = ["sphere", "ring", "wave"] as const;
  const [shape, setShape] = React.useState<(typeof shapes)[number]>("sphere");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      <DotMatrixOrb shape={shape} size={240} resolution={44} />
      <div style={{ display: "flex", gap: 6 }}>
        {shapes.map((s) => (
          <Button key={s} variant={shape === s ? "primary" : "secondary"} size="sm" onClick={() => setShape(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function AgentOrbDemo() {
  const [state, setState] = React.useState<OrbState>(null);
  const palettes = [
    { stops: ["#6366f1", "#22d3ee", "#a855f7"] as [string, string, string] },
    { stops: ["#f97316", "#eab308", "#ef4444"] as [string, string, string] },
    { stops: ["#10b981", "#14b8a6", "#06b6d4"] as [string, string, string] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 20 }}>
        {palettes.map((p, i) => (
          <AgentOrb key={i} state={state} palette={p} seed={(i + 1) * 50} size={110} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Button variant={state === null ? "primary" : "secondary"} size="sm" onClick={() => setState(null)}>Idle</Button>
        <Button variant={state === "listening" ? "primary" : "secondary"} size="sm" onClick={() => setState("listening")}>Listening</Button>
        <Button variant={state === "talking" ? "primary" : "secondary"} size="sm" onClick={() => setState("talking")}>Talking</Button>
      </div>
    </div>
  );
}

export function DottedGlobeDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <DottedGlobe size={300} density={40} rotationSeconds={28} tilt={22} />
      <div style={{ fontSize: 12, color: "var(--docs-ink-secondary)" }}>Rotates continuously; one frame under reduced-motion.</div>
    </div>
  );
}

// Hand-drawn glyphs for the cloud so the demo depends on no CDN.
function GlyphChip({ letters, bg }: { letters: string; bg: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="0" y="0" width="20" height="20" rx="4" fill={bg} />
      <text x="10" y="14" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" fontWeight="700" fill="#fff">{letters}</text>
    </svg>
  );
}

const cloudIcons: CloudIcon[] = [
  { id: "ts", label: "TypeScript", node: <GlyphChip letters="TS" bg="#3178c6" /> },
  { id: "react", label: "React", node: <GlyphChip letters="R" bg="#61dafb" /> },
  { id: "node", label: "Node.js", node: <GlyphChip letters="N" bg="#5fa04e" /> },
  { id: "next", label: "Next.js", node: <GlyphChip letters="N" bg="#000" /> },
  { id: "vite", label: "Vite", node: <GlyphChip letters="V" bg="#646cff" /> },
  { id: "vercel", label: "Vercel", node: <GlyphChip letters="▲" bg="#000" /> },
  { id: "gh", label: "GitHub", node: <GlyphChip letters="GH" bg="#24292f" /> },
  { id: "fig", label: "Figma", node: <GlyphChip letters="F" bg="#a259ff" /> },
  { id: "stripe", label: "Stripe", node: <GlyphChip letters="S" bg="#635bff" /> },
  { id: "linear", label: "Linear", node: <GlyphChip letters="L" bg="#5e6ad2" /> },
  { id: "slack", label: "Slack", node: <GlyphChip letters="S" bg="#4a154b" /> },
  { id: "openai", label: "OpenAI", node: <GlyphChip letters="OA" bg="#10a37f" /> },
  { id: "anthropic", label: "Anthropic", node: <GlyphChip letters="C" bg="#cc785c" /> },
  { id: "aws", label: "AWS", node: <GlyphChip letters="AW" bg="#ff9900" /> },
  { id: "pg", label: "Postgres", node: <GlyphChip letters="PG" bg="#336791" /> },
  { id: "redis", label: "Redis", node: <GlyphChip letters="R" bg="#d82c20" /> },
];

export function IconCloudDemo() {
  return (
    <IconCloud icons={cloudIcons} size={300} rotationSeconds={30} label="Technology integrations" />
  );
}

export function CursorParticlesDemo() {
  const [mode, setMode] = React.useState<ParticleMode>("repel");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 560 }}>
      <CursorParticles mode={mode} count={100} height={240}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>Move your cursor</div>
        <div style={{ fontSize: 12, color: "var(--docs-ink-secondary)" }}>
          Mode: <strong>{mode}</strong>
        </div>
      </CursorParticles>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <Button variant={mode === "repel" ? "primary" : "secondary"} size="sm" onClick={() => setMode("repel")}>Repel</Button>
        <Button variant={mode === "attract" ? "primary" : "secondary"} size="sm" onClick={() => setMode("attract")}>Attract</Button>
      </div>
    </div>
  );
}

export function FileTreeDemo() {
  const [selected, setSelected] = React.useState<string | undefined>("src/components/ui/button.tsx");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FileTree
        nodes={treeNodes}
        defaultExpanded={["src", "src/app", "src/components", "src/components/ui", "src/lib"]}
        defaultSelected="src/components/ui/button.tsx"
        onSelect={setSelected}
      />
      <p style={{ fontSize: 12, color: "var(--docs-ink-secondary)", margin: 0 }}>
        Selected: <code className="inline-code">{selected ?? "none"}</code>
      </p>
    </div>
  );
}
