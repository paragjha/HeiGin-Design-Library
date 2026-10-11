import * as React from "react";
import { Badge, type BadgeTone } from "@heigin/ui";
import { tokenMeta, tokens, type TokenEvidence } from "@heigin/ui/tokens";
import { CopyButton } from "../components/CopyButton";
import { Snippet } from "../components/Snippet";
import { href } from "../lib/router";
import { tailwindCss, tokensCss } from "../lib/source";

const evidenceTone: Record<TokenEvidence, BadgeTone> = { observed: "success", derived: "info", proposed: "warning" };
const cssVar = (path: string) => `--hg-${path.replace(/\./g, "-")}`;

function Evidence({ path }: { path: string }) {
  const meta = tokenMeta[path];
  if (!meta) return null;
  return (
    <Badge tone={evidenceTone[meta.evidence]} size="sm">
      {meta.evidence}
    </Badge>
  );
}

function TokenTable({ group, render }: { group: string; render?: (path: string, value: string) => React.ReactNode }) {
  const rows = Object.entries(tokenMeta).filter(([p]) => p.startsWith(`${group}.`));
  return (
    <div className="table-scroll">
      <table className="doc-table">
        <thead>
          <tr>
            {render && <th scope="col">Preview</th>}
            <th scope="col">Token</th>
            <th scope="col">Value</th>
            <th scope="col">Evidence</th>
            <th scope="col">Usage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([path, meta]) => {
            const value = path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], tokens) as string;
            return (
              <tr key={path}>
                {render && <td>{render(path, value)}</td>}
                <td>
                  <code>{cssVar(path)}</code>
                </td>
                <td>
                  <code className="type">{value}</code>
                </td>
                <td>
                  <Evidence path={path} />
                  {meta.live && <div className="muted tiny">live: {meta.live}</div>}
                </td>
                <td className="small">{meta.description ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TokensPage() {
  const counts = Object.values(tokenMeta).reduce<Record<string, number>>((acc, m) => ((acc[m.evidence] = (acc[m.evidence] ?? 0) + 1), acc), {});
  return (
    <article className="page">
      <header className="page__header">
        <h1>Design tokens</h1>
        <p className="lede">
          {Object.keys(tokenMeta).length} tokens in <code className="inline-code">tokens/tokens.json</code>. A script generates the CSS custom properties,
          the TypeScript exports and a Tailwind v4 theme from that file. Every token records where it came from.
        </p>
        <ul className="chip-list">
          {Object.entries(counts).map(([k, v]) => (
            <li key={k}>
              <Badge tone={evidenceTone[k as TokenEvidence]}>
                {k}: {v}
              </Badge>
            </li>
          ))}
        </ul>
      </header>
      <section aria-labelledby="formats-h">
        <h2 id="formats-h">Formats</h2>
        <ul className="prose-list">
          <li>
            <strong>CSS:</strong> <code className="inline-code">@heigin/ui/tokens.css</code>, prefixed <code className="inline-code">--hg-</code> so they never
            clash with your own variables. Already included in <code className="inline-code">styles.css</code>.
          </li>
          <li>
            <strong>TypeScript:</strong> <code className="inline-code">import {"{ tokens, vars, tokenMeta }"} from "@heigin/ui/tokens"</code>. Use{" "}
            <code className="inline-code">vars.color.ink</code> to get <code className="inline-code">var(--hg-color-ink)</code>.
          </li>
          <li>
            <strong>JSON:</strong> <code className="inline-code">tokens/tokens.json</code> in the repo (the source of truth).
          </li>
          <li>
            <strong>Tailwind v4 (optional):</strong> <code className="inline-code">@heigin/ui/tailwind.css</code>.
          </li>
        </ul>
        <p>
          Production names map 1:1, with the prefix added: <code className="inline-code">--color-ink</code> → <code className="inline-code">--hg-color-ink</code>.
          See <a href={href("/tokens/colors")}>Colors</a>, <a href={href("/tokens/typography")}>Typography</a> and{" "}
          <a href={href("/tokens/spacing")}>Spacing and layout</a>.
        </p>
        <Snippet label="tokens.css (generated)" lang="css" code={tokensCss} />
        <Snippet label="tailwind.css (generated, optional)" lang="css" code={tailwindCss} />
      </section>
    </article>
  );
}

function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const h = hex.replace("#", "");
    if (h.length !== 6) return null;
    const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
  };
  const x = lum(a);
  const y = lum(b);
  if (x === null || y === null) return null;
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function ColorsPage() {
  const colors = Object.entries(tokens.color) as [string, string][];
  return (
    <article className="page">
      <header className="page__header">
        <h1>Colors</h1>
        <p className="lede">
          HeiGin is deliberately monochrome. The primary action colour is near-black (<code className="inline-code">#1f1f1f</code>), not a brand hue.
          Colour is saved for status and for things that need attention.
        </p>
      </header>
      <ul className="swatch-grid" aria-label="Colour tokens">
        {colors.map(([name, value]) => {
          const path = `color.${name}`;
          const ratio = contrast(value, "#ffffff");
          return (
            <li key={name} className="swatch">
              <span className="swatch__chip" style={{ background: `var(${cssVar(path)})` }} aria-hidden="true" />
              <div className="swatch__body">
                <strong>{name}</strong>
                <code className="tiny">{value}</code>
                <span className="tiny muted">{ratio ? `${ratio.toFixed(2)}:1 on white` : "translucent"}</span>
                <Evidence path={path} />
                <CopyButton text={`var(${cssVar(path)})`} label="Copy var" variant="ghost" />
              </div>
            </li>
          );
        })}
      </ul>
      <section aria-labelledby="color-table-h">
        <h2 id="color-table-h">Reference</h2>
        <TokenTable group="color" />
      </section>
    </article>
  );
}

export function TypographyPage() {
  const sizes = Object.entries(tokens.font.size) as [string, string][];
  return (
    <article className="page">
      <header className="page__header">
        <h1>Typography</h1>
        <p className="lede">
          Inter across the whole UI. The default UI text is 13px (buttons, inputs, rows). Body copy is 14px, page titles are 20px, metric values 28px.
          Large text gets slight negative tracking, and numbers in tables and metrics use tabular figures.
        </p>
      </header>
      <section aria-labelledby="scale-h">
        <h2 id="scale-h">Size scale</h2>
        <div className="type-scale">
          {sizes.map(([name, value]) => (
            <div key={name} className="type-row">
              <code className="tiny muted">
                {cssVar(`font.size.${name}`)} · {value}
              </code>
              <span style={{ fontSize: value, letterSpacing: parseInt(value) >= 20 ? "var(--hg-font-tracking-tighter)" : undefined }}>
                Kaveri Textiles ₹8,49,600
              </span>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="roles-h">
        <h2 id="roles-h">Roles</h2>
        <div className="table-scroll">
          <table className="doc-table">
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Spec</th>
                <th scope="col">Sample</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Page title", "20px / 600 / -0.015em", { fontSize: 20, fontWeight: 600, letterSpacing: "-0.015em" }],
                ["Section title", "16px / 600", { fontSize: 16, fontWeight: 600 }],
                ["Card title", "13px / 600", { fontSize: 13, fontWeight: 600 }],
                ["Body", "14px / 400 / 1.5", { fontSize: 14 }],
                ["UI default", "13px / 400–500", { fontSize: 13 }],
                ["Label", "12px / 500", { fontSize: 12, fontWeight: 500 }],
                ["Meta / helper", "12px / 400 muted", { fontSize: 12, color: "var(--hg-color-muted)" }],
                ["Badge", "11px / 500", { fontSize: 11, fontWeight: 500 }],
                ["Metric", "28px / 600 / -0.02em / tabular", { fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }],
              ].map(([role, spec, style]) => (
                <tr key={role as string}>
                  <td>{role as string}</td>
                  <td>
                    <code className="type">{spec as string}</code>
                  </td>
                  <td style={style as React.CSSProperties}>{role === "Metric" ? "₹2.31Cr" : "Follow up with Asha"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="font-tokens-h">
        <h2 id="font-tokens-h">Font tokens</h2>
        <TokenTable group="font" />
      </section>
    </article>
  );
}

export function SpacingPage() {
  return (
    <article className="page">
      <header className="page__header">
        <h1>Spacing and layout</h1>
        <p className="lede">
          A 4px base unit (Tailwind's <code className="inline-code">--spacing: .25rem</code> in production). Controls are 32px tall on desktop and grow to
          44px touch targets below 768px. The sidebar becomes a drawer below 1024px.
        </p>
      </header>
      <section aria-labelledby="space-h">
        <h2 id="space-h">Space</h2>
        <TokenTable group="space" render={(_, v) => <span className="space-bar" style={{ width: v }} aria-hidden="true" />} />
      </section>
      <section aria-labelledby="radius-h">
        <h2 id="radius-h">Radius</h2>
        <TokenTable group="radius" render={(_, v) => <span className="radius-demo" style={{ borderRadius: v }} aria-hidden="true" />} />
      </section>
      <section aria-labelledby="shadow-h">
        <h2 id="shadow-h">Shadow</h2>
        <TokenTable group="shadow" render={(_, v) => <span className="shadow-demo" style={{ boxShadow: v }} aria-hidden="true" />} />
      </section>
      <section aria-labelledby="control-h">
        <h2 id="control-h">Controls and layout</h2>
        <TokenTable group="control" />
        <TokenTable group="layout" />
      </section>
      <section aria-labelledby="bp-h">
        <h2 id="bp-h">Breakpoints, z-index, focus and motion</h2>
        <TokenTable group="breakpoint" />
        <TokenTable group="z" />
        <TokenTable group="focus" />
        <TokenTable group="motion" />
        <p className="muted small">
          All motion stops under <code className="inline-code">prefers-reduced-motion: reduce</code>. Production also includes that media query.
        </p>
      </section>
    </article>
  );
}
