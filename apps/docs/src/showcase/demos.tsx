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
import { FlickerGrid } from "./FlickerGrid";
import { GlyphMatrix, type GlyphForm } from "./GlyphMatrix";
import { ImageStreamHero } from "./ImageStreamHero";
import { LiveWaveform } from "./LiveWaveform";
import { ConversationBar, type ConversationStatus } from "./ConversationBar";

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
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <RainbowButton variant="gradient">Get HeiGin UI</RainbowButton>
        <span style={{ fontSize: 11, color: "var(--docs-ink-secondary)" }}>gradient</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <RainbowButton variant="beam">Get HeiGin UI</RainbowButton>
        <span style={{ fontSize: 11, color: "var(--docs-ink-secondary)" }}>beam</span>
      </div>
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

function useObjectUrls(files: File[]): string[] {
  const urls = React.useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  React.useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return urls;
}

const MAX_UPLOAD_BYTES = 1_500_000;
function filterImages(list: FileList | null): File[] {
  if (!list) return [];
  const out: File[] = [];
  for (const f of Array.from(list)) {
    if (!/^image\//.test(f.type)) continue;
    if (f.size > MAX_UPLOAD_BYTES) continue;
    out.push(f);
  }
  return out;
}

export function FlickerGridDemo() {
  const [files, setFiles] = React.useState<File[]>([]);
  const urls = useObjectUrls(files);
  const shape = urls[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 540 }}>
      <FlickerGrid width={520} height={300} shapeSrc={shape} magnetRadius={100} />
      <div className="hg-upload">
        <label className="link-button">
          Upload a silhouette (PNG/SVG)
          <input type="file" accept="image/*" hidden onChange={(e) => setFiles(filterImages(e.target.files).slice(0, 1))} />
        </label>
        {files[0] && (
          <span className="hg-upload__chip">
            <img src={urls[0]} alt="" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{files[0].name}</span>
            <button type="button" aria-label="Remove shape" onClick={() => setFiles([])}>×</button>
          </span>
        )}
        <span>Dark areas of the image flicker brightest; move your cursor over the grid.</span>
      </div>
    </div>
  );
}

export function GlyphMatrixDemo() {
  const [files, setFiles] = React.useState<File[]>([]);
  const urls = useObjectUrls(files);
  const forms: GlyphForm[] = React.useMemo(() => {
    const base: GlyphForm[] = [{ kind: "random" }, { kind: "text", value: "HG" }];
    urls.forEach((u) => base.push({ kind: "image", src: u }));
    return base;
  }, [urls]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 540 }}>
      <div style={{ position: "relative" }}>
        <GlyphMatrix width={520} height={280} forms={forms} holdSeconds={2.5} />
      </div>
      <div className="hg-upload">
        <label className="link-button">
          Upload shapes to cycle in
          <input type="file" accept="image/*" multiple hidden onChange={(e) => setFiles((prev) => [...prev, ...filterImages(e.target.files)].slice(0, 4))} />
        </label>
        <div className="hg-upload__list">
          {files.map((f, i) => (
            <span key={i} className="hg-upload__chip">
              <img src={urls[i]} alt="" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
        <span>Cycles through random → "HG" → each uploaded shape.</span>
      </div>
    </div>
  );
}

const defaultStreamImages = [
  "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%236366f1"/><stop offset="1" stop-color="%2322d3ee"/></linearGradient></defs><rect width="300" height="400" fill="url(%23g)"/></svg>'),
  "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="%23f97316"/><stop offset="1" stop-color="%23ef4444"/></linearGradient></defs><rect width="300" height="400" fill="url(%23g)"/></svg>'),
  "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%2310b981"/><stop offset="1" stop-color="%2306b6d4"/></linearGradient></defs><rect width="300" height="400" fill="url(%23g)"/></svg>'),
  "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%23a855f7"/><stop offset="1" stop-color="%23ec4899"/></linearGradient></defs><rect width="300" height="400" fill="url(%23g)"/></svg>'),
];

export function ImageStreamHeroDemo() {
  const [files, setFiles] = React.useState<File[]>([]);
  const urls = useObjectUrls(files);
  const images = urls.length > 0 ? urls : defaultStreamImages;
  const move = (from: number, delta: number) => {
    setFiles((prev) => {
      const next = prev.slice();
      const to = Math.max(0, Math.min(prev.length - 1, from + delta));
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 980 }}>
      <ImageStreamHero images={images} height={360} speed={22}>
        <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", color: "#fff" }}>
          Your work, front and centre.
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>
          Upload images below to replace the sample stream.
        </div>
      </ImageStreamHero>
      <div className="hg-upload">
        <label className="link-button">
          Upload images
          <input type="file" accept="image/*" multiple hidden onChange={(e) => setFiles((prev) => [...prev, ...filterImages(e.target.files)].slice(0, 8))} />
        </label>
        <div className="hg-upload__list">
          {files.map((f, i) => (
            <span key={i} className="hg-upload__chip">
              <img src={urls[i]} alt="" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
              <button type="button" aria-label={`Move ${f.name} left`} onClick={() => move(i, -1)} disabled={i === 0}>◀</button>
              <button type="button" aria-label={`Move ${f.name} right`} onClick={() => move(i, 1)} disabled={i === files.length - 1}>▶</button>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
        {files.length === 0 && <span>Showing sample gradients. Upload up to 8 images (≤1.5 MB each).</span>}
      </div>
    </div>
  );
}

export function LiveWaveformDemo() {
  const [active, setActive] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [mode, setMode] = React.useState<"static" | "scrolling">("static");
  const [error, setError] = React.useState<string | null>(null);
  const start = (which: "active" | "processing") => {
    setError(null);
    if (which === "active") { setActive(true); setProcessing(false); }
    else { setProcessing(true); setActive(false); }
  };
  const stop = () => { setActive(false); setProcessing(false); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 520 }}>
      <LiveWaveform
        active={active}
        processing={processing}
        mode={mode}
        height={80}
        barWidth={3}
        barGap={2}
        fadeEdges
        barColor="gray"
        historySize={120}
        onError={(e) => { setActive(false); setError(e.message); }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Button size="sm" variant={active ? "primary" : "secondary"} onClick={() => (active ? stop() : start("active"))}>
          {active ? "Stop listening" : "Start listening"}
        </Button>
        <Button size="sm" variant={processing ? "primary" : "secondary"} onClick={() => (processing ? stop() : start("processing"))}>
          {processing ? "Stop processing" : "Processing shimmer"}
        </Button>
        <Button size="sm" variant={mode === "static" ? "primary" : "secondary"} onClick={() => setMode("static")}>Static</Button>
        <Button size="sm" variant={mode === "scrolling" ? "primary" : "secondary"} onClick={() => setMode("scrolling")}>Scrolling</Button>
      </div>
      {error && <div role="alert" style={{ fontSize: 12, color: "#ef4444" }}>{error}</div>}
      <div style={{ fontSize: 12, color: "var(--docs-ink-secondary)" }}>
        Live uses your microphone (permission required). Processing is procedural.
      </div>
    </div>
  );
}

export function ConversationBarDemo() {
  const [status, setStatus] = React.useState<ConversationStatus>("idle");
  const timerRef = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);
  const start = async () => {
    setStatus("connecting");
    timerRef.current = window.setTimeout(() => {
      setStatus("listening");
      timerRef.current = window.setTimeout(() => setStatus("speaking"), 2500);
    }, 900);
  };
  const end = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStatus("idle");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
      <ConversationBar status={status} agentName="HeiGin Guide" onStart={start} onEnd={end} />
      <div style={{ fontSize: 12, color: "var(--docs-ink-secondary)", textAlign: "center", maxWidth: 480 }}>
        UI is standalone; wire <code className="inline-code">onStart</code>, <code className="inline-code">onEnd</code> and <code className="inline-code">status</code> to any voice-agent SDK (for example ElevenLabs' <code className="inline-code">useConversation</code>). This demo simulates the state transitions.
      </div>
    </div>
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
