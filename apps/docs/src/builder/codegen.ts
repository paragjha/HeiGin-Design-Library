// Turns a builder tree into a self-contained TSX file that imports only from @heigin/ui,
// lucide-react and react. Blocks describe their own JSX via the CodeCtx helpers below.
import type { BuilderDoc, BuilderNode, PropValue } from "./model";

/** A JSX attribute expression that must be emitted verbatim inside braces. */
export class Raw {
  constructor(public code: string) {}
}
export const raw = (code: string) => new Raw(code);

export type AttrValue = PropValue | Raw | undefined | null;

export interface CodeCtx {
  /** Register a named import. */
  use(name: string, from?: "@heigin/ui" | "lucide-react" | "react"): void;
  /** Register a type-only import from @heigin/ui. */
  useType(name: string): void;
  /** A statement placed at the top of the component body (state hooks). Marks the file as a client component. */
  hook(code: string): void;
  /** A module-level declaration (mock data, column specs). Returns nothing; use name() for unique identifiers. */
  hoist(code: string): void;
  /** Unique identifier based on `base` (leadRows, leadRows2, ...). */
  name(base: string): string;
  /** Mark the file as needing "use client" (event handlers, state). */
  client(): void;
}

const isIdentifierSafe = (s: string) => !/["\n{}]/.test(s);

function attr(name: string, value: AttrValue): string | null {
  if (value === undefined || value === null || value === false || value === "") return null;
  if (value === true) return name;
  if (value instanceof Raw) return value.code.includes("\n") ? `${name}={\n${indent(value.code)}\n}` : `${name}={${value.code}}`;
  if (typeof value === "number") return `${name}={${value}}`;
  return isIdentifierSafe(value) ? `${name}="${value}"` : `${name}={${JSON.stringify(value)}}`;
}

export const indent = (s: string, by = "  ") =>
  s
    .split("\n")
    .map((l) => (l ? by + l : l))
    .join("\n");

/** Escapes text for use as JSX children. */
export function text(s: string): string {
  return /[{}<>]/.test(s) ? `{${JSON.stringify(s)}}` : s;
}

/** Serialises one JSX element. Children may be multi-line strings. */
export function el(tag: string, attrs: Record<string, AttrValue> = {}, children: string[] = []): string {
  const parts = Object.entries(attrs)
    .map(([k, v]) => attr(k, v))
    .filter((p): p is string => p !== null);
  const inline = parts.length ? ` ${parts.join(" ")}` : "";
  const open = (inline.length > 88 || parts.some((p) => p.includes("\n"))) && parts.length > 1 ? `<${tag}\n${indent(parts.join("\n"))}\n` : `<${tag}${inline}`;
  const kids = children.filter((c) => c.trim() !== "");
  if (!kids.length) return open.endsWith("\n") ? `${open}/>` : `${open} />`;
  const openTag = open.endsWith("\n") ? `${open}>` : `${open}>`;
  if (kids.length === 1 && !kids[0]!.includes("\n") && kids[0]!.length + openTag.length < 90 && !kids[0]!.startsWith("<")) {
    return `${openTag}${kids[0]}</${tag}>`;
  }
  return `${openTag}\n${indent(kids.join("\n"))}\n</${tag}>`;
}

/** JS literal for plain data: unquoted identifier keys, 2-space indent (reads like hand-written code). */
export function literal(v: unknown, depth = 0): string {
  const pad = "  ".repeat(depth + 1);
  const end = "  ".repeat(depth);
  if (Array.isArray(v)) return v.length ? `[\n${v.map((x) => pad + literal(x, depth + 1)).join(",\n")},\n${end}]` : "[]";
  if (v && typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>).map(
      ([k, x]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${literal(x, depth + 1)}`,
    );
    const oneLine = `{ ${entries.join(", ")} }`;
    return oneLine.length <= 100 ? oneLine : `{\n${entries.map((e) => pad + e).join(",\n")},\n${end}}`;
  }
  return JSON.stringify(v);
}

/** Inline style object from a plain record; values are emitted as strings or numbers. */
export function style(s: Record<string, string | number | undefined>): Raw {
  const body = Object.entries(s)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${typeof v === "number" ? v : JSON.stringify(v)}`)
    .join(", ");
  return raw(`{ ${body} }`);
}

export type NodeCodeFn = (node: BuilderNode, children: string[], ctx: CodeCtx) => string;

export interface GeneratedCode {
  code: string;
  client: boolean;
  imports: { ui: string[]; icons: string[]; react: string[] };
}

export function generate(doc: BuilderDoc, codeFor: (type: string) => NodeCodeFn): GeneratedCode {
  const ui = new Set<string>();
  const uiTypes = new Set<string>();
  const icons = new Set<string>();
  const react = new Set<string>();
  const hooks: string[] = [];
  const hoisted: string[] = [];
  const used = new Map<string, number>();
  let client = false;

  const ctx: CodeCtx = {
    use(name, from = "@heigin/ui") {
      (from === "lucide-react" ? icons : from === "react" ? react : ui).add(name);
    },
    useType(name) {
      uiTypes.add(name);
    },
    hook(code) {
      hooks.push(code);
      client = true;
    },
    hoist(code) {
      hoisted.push(code);
    },
    name(base) {
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      return n === 1 ? base : `${base}${n}`;
    },
    client() {
      client = true;
    },
  };

  const walk = (n: BuilderNode): string => codeFor(n.type)(n, n.children.map(walk), ctx);
  const body = walk(doc.root);
  if (hooks.length) react.add("useState");

  const componentName = /^[A-Z][A-Za-z0-9]*$/.test(doc.name) ? doc.name : "MyPage";
  const uiImports = [...[...ui].sort(), ...[...uiTypes].sort().filter((t) => !ui.has(t)).map((t) => `type ${t}`)];
  const lines: string[] = [];
  if (client) lines.push(`"use client";`, "");
  if (react.size) lines.push(`import { ${[...react].sort().join(", ")} } from "react";`);
  if (icons.size) lines.push(`import { ${[...icons].sort().join(", ")} } from "lucide-react";`);
  if (uiImports.length) lines.push(`import { ${uiImports.join(", ")} } from "@heigin/ui";`);
  lines.push("");
  if (hoisted.length) lines.push(...hoisted.flatMap((h) => [h, ""]));
  lines.push(`export default function ${componentName}() {`);
  if (hooks.length) lines.push(...hooks.map((h) => indent(h)), "");
  lines.push(`  return (`, indent(body, "    "), `  );`, `}`, "");

  return { code: lines.join("\n"), client, imports: { ui: [...ui].sort(), icons: [...icons].sort(), react: [...react].sort() } };
}
