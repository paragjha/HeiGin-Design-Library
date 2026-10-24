import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ManifestEntry {
  name: string;
  category: "ui" | "crm";
  entry: string;
  description: string;
  exports: string[];
  types: string[];
  client: boolean;
  files: string[];
  styles: string[];
  internalDependencies: string[];
  npmDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  install: string[];
  copyCommand: string;
}

export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

export interface ComponentProps {
  description: string;
  props: PropEntry[];
  extends: string[];
}

export interface TokenValue {
  value: string;
  evidence: "observed" | "derived" | "proposed";
  live: string;
  description: string;
}

export interface LoadedData {
  manifests: ManifestEntry[];
  props: Record<string, ComponentProps>;
  tokens: Record<string, Record<string, TokenValue>>;
  tokenCategories: string[];
}

function resolveDataPath(...segments: string[]): string {
  // Try bundled data/ directory first (npm published package)
  const bundled = join(__dirname, "..", "data", ...segments);
  if (existsSync(bundled)) return bundled;

  // Fall back to monorepo paths (local dev)
  const monorepoRoot = join(__dirname, "..", "..", "..");
  const paths: Record<string, string> = {
    manifests: join(monorepoRoot, "source", "manifests"),
    "props.json": join(monorepoRoot, "apps", "docs", "src", "generated", "props.json"),
    "tokens.json": join(monorepoRoot, "tokens", "tokens.json"),
  };

  const key = segments[0]!;
  if (key === "manifests" && segments.length > 1) {
    return join(paths["manifests"]!, segments[1]!);
  }
  return paths[key] ?? join(__dirname, "..", "data", ...segments);
}

function readJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadData(): LoadedData {
  // Load individual manifests
  const manifestDir = resolveDataPath("manifests");
  const manifestFiles = readdirSync(manifestDir).filter(
    (f) => f.endsWith(".json") && f !== "index.json",
  );

  const manifests: ManifestEntry[] = manifestFiles.map((f) =>
    readJSON<ManifestEntry>(join(manifestDir, f)),
  );
  manifests.sort((a, b) => a.name.localeCompare(b.name));

  // Load props
  const props = readJSON<Record<string, ComponentProps>>(
    resolveDataPath("props.json"),
  );

  // Load tokens
  const rawTokens = readJSON<Record<string, unknown>>(
    resolveDataPath("tokens.json"),
  );
  const tokens: Record<string, Record<string, TokenValue>> = {};
  const tokenCategories: string[] = [];

  for (const [key, val] of Object.entries(rawTokens)) {
    if (key === "$meta" || typeof val !== "object" || val === null) continue;
    tokenCategories.push(key);
    tokens[key] = val as Record<string, TokenValue>;
  }

  return { manifests, props, tokens, tokenCategories };
}
