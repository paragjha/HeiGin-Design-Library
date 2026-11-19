#!/usr/bin/env node
// Builds and validates kokonut-meta.json from tracked sources.
//
//   node scripts/build-kokonut-meta.mjs            write packages/mcp/data/kokonut-meta.json
//   node scripts/build-kokonut-meta.mjs --check    verify only, fail if the file is missing or stale
//
// CI and the Vercel build use the library function directly; this script is the
// standalone CLI equivalent of `npm run manifests -- --check` for community components.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./lib/graph.mjs";
import { buildKokonutMeta, serializeKokonutMeta } from "./lib/kokonut-meta.mjs";

const check = process.argv.includes("--check");
const outPath = join(repoRoot, "packages/mcp/data/kokonut-meta.json");

const meta = buildKokonutMeta();
const serialized = serializeKokonutMeta(meta);

if (check) {
  if (!existsSync(outPath)) {
    console.error(`FAIL: ${outPath} does not exist — run without --check to generate it`);
    process.exit(1);
  }
  const current = readFileSync(outPath, "utf8");
  if (current !== serialized) {
    console.error(`FAIL: ${outPath} is stale — run without --check to regenerate`);
    process.exit(1);
  }
  console.log(`OK: kokonut-meta.json (${meta.length} components) is up to date`);
} else {
  mkdirSync(join(repoRoot, "packages/mcp/data"), { recursive: true });
  writeFileSync(outPath, serialized);
  console.log(`Wrote kokonut-meta.json (${meta.length} community components)`);
}
