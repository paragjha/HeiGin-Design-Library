import * as React from "react";
import { Badge, Tab, Tabs, TabsList, TabsPanel } from "@heigin/ui";
import { CodeBlock } from "./CodeBlock";
import { CopyButton } from "./CopyButton";
import { PACKAGE_NAME, getManifest, getSource } from "../lib/source";

export interface CodePanelProps {
  /** Manifest name, e.g. "button". */
  component: string;
  /** Usage example source (a real, compiled example file). */
  usage: string;
}

/** Usage / Source / Install panel with working copy controls, driven by the generated manifest. */
export function CodePanel({ component, usage }: CodePanelProps) {
  const manifest = getManifest(component);
  const [file, setFile] = React.useState(manifest?.entry ?? "");
  if (!manifest) return <p>Missing manifest for {component}. Run npm run manifests.</p>;

  const files = manifest.files.map((f) => f.replace("packages/ui/src/", ""));
  const source = getSource(file) ?? "";
  // Components first (PascalCase), then hooks/helpers; internal style exports are skipped.
  const mainExports = manifest.exports.filter((e) => !e.endsWith("Styles") && e !== "DialogHeader").sort((a, b) => Number(/^[a-z]/.test(a)) - Number(/^[a-z]/.test(b)));
  const importStatement = `import { ${mainExports.slice(0, 4).join(", ")} } from "${PACKAGE_NAME}";`;
  const installDeps = manifest.install.length ? `npm install ${manifest.install.join(" ")}` : "";

  return (
    <section className="code-panel" aria-label={`${component} code`}>
      <Tabs defaultValue="usage">
        <div className="code-panel__bar">
          <TabsList variant="pill">
            <Tab value="usage">Usage</Tab>
            <Tab value="source">Source</Tab>
            <Tab value="install">Install</Tab>
          </TabsList>
          <div className="code-panel__actions">
            <CopyButton text={importStatement} label="Copy import" testId="copy-import" variant="ghost" />
          </div>
        </div>

        <TabsPanel value="usage">
          <div className="code-panel__head">
            <code className="inline-code">{importStatement}</code>
            <CopyButton text={usage} label="Copy usage" testId="copy-usage" />
          </div>
          <CodeBlock code={usage} label="Usage example" />
        </TabsPanel>

        <TabsPanel value="source">
          <div className="code-panel__head">
            <div className="file-pills" role="group" aria-label="Files">
              {files.map((f) => (
                <button key={f} type="button" className="file-pill" aria-pressed={f === file} onClick={() => setFile(f)}>
                  {f.split("/").pop()}
                </button>
              ))}
            </div>
            <CopyButton text={source} label="Copy source" testId="copy-source" />
          </div>
          <p className="muted small">
            <code className="inline-code">{file}</code> · {source.split("\n").length} lines
          </p>
          <CodeBlock code={source} lang={file.endsWith(".css") ? "css" : "tsx"} label={`Source of ${file}`} maxHeight={520} />
        </TabsPanel>

        <TabsPanel value="install">
          <h3 className="h4">Option A — install the package</h3>
          <div className="code-panel__head">
            <code className="inline-code">npm install {PACKAGE_NAME}</code>
            <CopyButton text={`npm install ${PACKAGE_NAME}`} label="Copy install" testId="copy-install" />
          </div>
          <p className="muted small">
            Not yet published to npm — install from the private registry or a packed tarball (see Getting started). Import{" "}
            <code className="inline-code">{PACKAGE_NAME}/styles.css</code> once in your app root.
          </p>

          <h3 className="h4">Option B — copy the source</h3>
          <div className="code-panel__head">
            <code className="inline-code">{manifest.copyCommand}</code>
            <CopyButton text={manifest.copyCommand} label="Copy command" testId="copy-command" />
          </div>
          <ul className="dep-list">
            <li>
              <strong>Files ({files.length + 1}):</strong> {[...files, "styles/tokens.css"].join(", ")}
            </li>
            <li>
              <strong>HeiGin dependencies:</strong>{" "}
              {manifest.internalDependencies.length ? manifest.internalDependencies.join(", ") : "none — copies on its own"}
            </li>
            <li>
              <strong>npm packages:</strong> {installDeps ? <code className="inline-code">{installDeps}</code> : "none beyond React"}
            </li>
            <li>
              <strong>Rendering:</strong>{" "}
              {manifest.client ? <Badge tone="info">Client Component ("use client")</Badge> : <Badge tone="success">Server-component safe</Badge>}
            </li>
          </ul>
        </TabsPanel>
      </Tabs>
    </section>
  );
}
