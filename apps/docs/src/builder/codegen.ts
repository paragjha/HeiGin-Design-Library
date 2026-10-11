// Turns a builder tree into self-contained TSX. Blocks describe their own JSX through CodeCtx.
// Output variants: single file (package or copied-source imports) and a Next.js route pair.
// Every node's line range is tracked so the UI can link canvas selection and code.
import type { BuilderDoc, BuilderNode, PropValue } from "./model";

/** A JSX attribute expression that must be emitted verbatim inside braces. */
export class Raw {
  constructor(public code: string) {}
}
export const raw = (code: string) => new Raw(code);

export type AttrValue = PropValue | Raw | undefined | null;

export interface PropDecl {
  name: string;
  type: string;
  optional: boolean;
  /** "data" props are loaded by the route; "callback" props cannot cross the server/client boundary. */
  kind: "data" | "callback";
}

export interface CodeCtx {
  use(name: string, from?: "@heigin/ui" | "lucide-react" | "react"): void;
  useType(name: string): void;
  /** State hook at the top of the component body. Marks the file as a client component. */
  hook(code: string): void;
  /** Module-level declaration (mock data, column specs, helpers). */
  hoist(code: string): void;
  /** Exported module-level type (shared with the route file). */
  exportType(code: string): void;
  /** Unique identifier based on `base`. */
  name(base: string): string;
  client(): void;
  /** Declares a component prop and returns its (unique) name. */
  prop(base: string, type: string, opts?: { optional?: boolean; kind?: PropDecl["kind"] }): string;
  /** Ancestors of the node being generated, nearest first. */
  ancestors: BuilderNode[];
  /** Scratch data per node id, shared between a container's enter() and its descendants. */
  scope: Map<string, Record<string, unknown>>;
}

export interface CodeBlockDef {
  code: (node: BuilderNode, children: string[], ctx: CodeCtx) => string;
  /** Runs before children are generated (e.g. a form allocating its error state name). */
  enter?: (node: BuilderNode, ctx: CodeCtx) => void;
}

// ───────────── markers for line mapping (stripped from the final output)
const START = (i: number) => `${i}`;
const END = (i: number) => `${i}`;
const MARKER_RE = /(\d+)|(\d+)/g;
/** Visible text, ignoring line-map markers (used for layout decisions). */
const vis = (s: string) => s.replace(MARKER_RE, "");

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
    .map((l) => (vis(l) ? by + l : l))
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
  const multi = (vis(inline).length > 88 || parts.some((p) => p.includes("\n"))) && parts.length > 1;
  const open = multi ? `<${tag}\n${indent(parts.join("\n"))}\n` : `<${tag}${inline}`;
  const kids = children.filter((c) => vis(c).trim() !== "");
  if (!kids.length) return multi ? `${open}/>` : `${open} />`;
  const openTag = `${open}>`;
  const only = kids[0]!;
  if (kids.length === 1 && !only.includes("\n") && vis(only).length + vis(openTag).length < 90 && !vis(only).startsWith("<")) {
    return `${openTag}${only}</${tag}>`;
  }
  return `${openTag}\n${indent(kids.join("\n"))}\n</${tag}>`;
}

/** JS literal for plain data: unquoted identifier keys, 2-space indent. */
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

/** Inline style object from a plain record. */
export function style(s: Record<string, string | number | undefined>): Raw {
  const body = Object.entries(s)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${typeof v === "number" ? v : JSON.stringify(v)}`)
    .join(", ");
  return raw(`{ ${body} }`);
}

// ───────────── builder-state embedding (lets generated code be re-imported exactly)
export const STATE_PREFIX = "heigin-builder:v1:";
const toBase64Url = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};
export const encodeDoc = (doc: BuilderDoc) => toBase64Url(JSON.stringify(doc));
export const decodeDoc = (s: string) => JSON.parse(fromBase64Url(s)) as BuilderDoc;

// ───────────── generation
export interface GenerateOptions {
  /** "package": import from @heigin/ui. "source": import copied files (see `sourceImports`). */
  importStyle?: "package" | "source";
  /** Export name -> module path for copied-source imports (e.g. Button -> @/components/heigin/components/ui/button). */
  sourceImports?: Record<string, string>;
  /** Append the builder state comment so the code can be re-imported. */
  includeState?: boolean;
}

export interface GeneratedCode {
  code: string;
  client: boolean;
  componentName: string;
  props: PropDecl[];
  exportedTypes: string[];
  imports: { ui: string[]; icons: string[]; react: string[] };
  /** Node id -> 1-based [firstLine, lastLine] in `code`. */
  lines: Record<string, [number, number]>;
}

export function componentNameOf(doc: BuilderDoc) {
  return /^[A-Z][A-Za-z0-9]*$/.test(doc.name) ? doc.name : "MyPage";
}

export function generate(doc: BuilderDoc, defFor: (type: string) => CodeBlockDef, options: GenerateOptions = {}): GeneratedCode {
  const ui = new Set<string>();
  const uiTypes = new Set<string>();
  const icons = new Set<string>();
  const react = new Set<string>();
  const hooks: string[] = [];
  const hoisted: string[] = [];
  const exported: string[] = [];
  const props: PropDecl[] = [];
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
    exportType(code) {
      exported.push(code);
    },
    name(base) {
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      return n === 1 ? base : `${base}${n}`;
    },
    client() {
      client = true;
    },
    prop(base, type, opts = {}) {
      const name = ctx.name(base);
      props.push({ name, type, optional: opts.optional ?? false, kind: opts.kind ?? "data" });
      return name;
    },
    ancestors: [],
    scope: new Map(),
  };

  let counter = 0;
  const ids: string[] = [];
  const walk = (n: BuilderNode): string => {
    const def = defFor(n.type);
    def.enter?.(n, ctx);
    ctx.ancestors.unshift(n);
    const children = n.children.map(walk);
    ctx.ancestors.shift();
    const i = counter++;
    ids[i] = n.id;
    return `${START(i)}${def.code(n, children, ctx)}${END(i)}`;
  };
  const body = walk(doc.root);
  if (hooks.some((h) => /\buseState\b/.test(h))) react.add("useState");

  const componentName = componentNameOf(doc);
  const out: string[] = [];
  if (client) out.push(`"use client";`, "");
  if (react.size) out.push(`import { ${[...react].sort().join(", ")} } from "react";`);
  if (icons.size) out.push(`import { ${[...icons].sort().join(", ")} } from "lucide-react";`);
  out.push(...uiImportLines([...ui], [...uiTypes].filter((t) => !ui.has(t)), options));
  out.push("");
  if (exported.length) out.push(...exported.flatMap((h) => [`export ${h}`, ""]));
  if (hoisted.length) out.push(...hoisted.flatMap((h) => [h, ""]));
  if (props.length) {
    out.push(`export interface ${componentName}Props {`);
    out.push(...props.map((p) => `  ${p.name}${p.optional ? "?" : ""}: ${p.type};`));
    out.push(`}`, "");
    out.push(`export default function ${componentName}({ ${props.map((p) => p.name).join(", ")} }: ${componentName}Props) {`);
  } else {
    out.push(`export default function ${componentName}() {`);
  }
  if (hooks.length) out.push(...hooks.map((h) => indent(h)), "");
  out.push(`  return (`, indent(body, "    "), `  );`, `}`);
  if (options.includeState) out.push("", `/* ${STATE_PREFIX}${encodeDoc(doc)} */`);
  out.push("");

  // Map node ids to line ranges, then strip markers.
  const marked = out.join("\n");
  const lines: Record<string, [number, number]> = {};
  marked.split("\n").forEach((line, idx) => {
    for (const m of line.matchAll(MARKER_RE)) {
      if (m[1] !== undefined) lines[ids[Number(m[1])]!] = [idx + 1, idx + 1];
      else if (m[2] !== undefined) lines[ids[Number(m[2])]!]![1] = idx + 1;
    }
  });
  const code = marked.replace(MARKER_RE, "");

  return {
    code,
    client,
    componentName,
    props,
    exportedTypes: exported.map((e) => /^(?:type|interface)\s+(\w+)/.exec(e)?.[1]).filter((x): x is string => !!x),
    imports: { ui: [...ui].sort(), icons: [...icons].sort(), react: [...react].sort() },
    lines,
  };
}

function uiImportLines(values: string[], types: string[], options: GenerateOptions): string[] {
  if (!values.length && !types.length) return [];
  if (options.importStyle !== "source" || !options.sourceImports) {
    const names = [...values.sort(), ...types.sort().map((t) => `type ${t}`)];
    return [`import { ${names.join(", ")} } from "@heigin/ui";`];
  }
  // Copied source: one import per module file.
  const byPath = new Map<string, string[]>();
  const add = (name: string, label: string) => {
    const path = options.sourceImports![name] ?? "@heigin/ui";
    byPath.set(path, [...(byPath.get(path) ?? []), label]);
  };
  values.forEach((v) => add(v, v));
  types.forEach((t) => add(t, `type ${t}`));
  return [...byPath.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([path, names]) => `import { ${names.sort((a, b) => a.replace("type ", "").localeCompare(b.replace("type ", ""))).join(", ")} } from "${path}";`);
}

/** Next.js App Router pair: a server `page.tsx` that loads data and renders the generated component file. */
export function generateRoute(doc: BuilderDoc, gen: GeneratedCode, route: string): { files: { path: string; code: string }[] } {
  const slug = route.replace(/^\/+|\/+$/g, "") || "page";
  const fileBase = gen.componentName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const dataProps = gen.props.filter((p) => p.kind === "data");
  const typeNames = gen.exportedTypes.filter((t) => dataProps.some((p) => new RegExp(`\\b${t}\\b`).test(p.type)));
  const title = doc.name.replace(/Page$/, "").replace(/([a-z])([A-Z])/g, "$1 $2") || "Page";
  const page: string[] = [`import type { Metadata } from "next";`];
  page.push(`import ${gen.componentName}${typeNames.length ? `, { ${typeNames.map((t) => `type ${t}`).join(", ")} }` : ""} from "./${fileBase}";`, "");
  page.push(`export const metadata: Metadata = { title: ${JSON.stringify(title)} };`, "");
  page.push(`export default async function Page() {`);
  if (dataProps.length) {
    page.push(`  // TODO: load real data (database, API, server action...). This runs on the server.`);
    page.push(...dataProps.map((p) => `  const ${p.name}: ${p.type} = [];`), "");
  }
  const callbacks = gen.props.filter((p) => p.kind === "callback");
  if (callbacks.length) page.push(`  // ${callbacks.map((c) => c.name).join(", ")}: functions can't be passed from a Server Component — handle them inside ${fileBase}.tsx.`);
  page.push(`  return <${gen.componentName}${dataProps.map((p) => ` ${p.name}={${p.name}}`).join("")} />;`, `}`, "");
  return {
    files: [
      { path: `app/${slug}/page.tsx`, code: page.join("\n") },
      { path: `app/${slug}/${fileBase}.tsx`, code: gen.code },
    ],
  };
}
