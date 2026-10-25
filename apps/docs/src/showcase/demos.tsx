import * as React from "react";
import { Card, Button, Input, Field } from "@heigin/ui";
import { AvatarCircles } from "./AvatarCircles";
import { BorderBeam } from "./BorderBeam";
import { RainbowButton } from "./RainbowButton";
import { AnimatedTerminal } from "./AnimatedTerminal";
import { FileTree, type FileTreeNode } from "./FileTree";
import { SaasLanding } from "./SaasLanding";

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
