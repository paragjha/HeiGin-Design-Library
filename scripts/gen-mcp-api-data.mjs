// Writes api/_mcp-data.json with the component manifests, props, tokens and community
// components inlined. The /api/mcp Vercel function imports this so the lambda is
// self-contained and does no file I/O at runtime.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildKokonutMeta } from "./lib/kokonut-meta.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = join(root, "api");
mkdirSync(apiDir, { recursive: true });

const manifestsDir = join(root, "source", "manifests");
const manifests = readdirSync(manifestsDir)
  .filter((f) => f.endsWith(".json") && f !== "index.json")
  .map((f) => JSON.parse(readFileSync(join(manifestsDir, f), "utf8")))
  .sort((a, b) => a.name.localeCompare(b.name));

const props = JSON.parse(
  readFileSync(join(root, "apps", "docs", "src", "generated", "props.json"), "utf8"),
);

const rawTokens = JSON.parse(
  readFileSync(join(root, "tokens", "tokens.json"), "utf8"),
);
const tokens = {};
const tokenCategories = [];
for (const [key, val] of Object.entries(rawTokens)) {
  if (key === "$meta" || typeof val !== "object" || val === null) continue;
  tokenCategories.push(key);
  tokens[key] = val;
}

// Community (Kokonut) components — validated against vendored .tsx files.
// No silent [] fallback: a missing or broken sync should fail the build.
const kokonut = buildKokonutMeta();

const payload = { manifests, props, tokens, tokenCategories, kokonut };
writeFileSync(join(apiDir, "_mcp-data.json"), JSON.stringify(payload));
console.log(`Wrote api/_mcp-data.json (${manifests.length} manifests, ${tokenCategories.length} token groups, ${kokonut.length} community components)`);
