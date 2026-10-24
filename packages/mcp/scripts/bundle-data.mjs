/**
 * Copies the data files the MCP server needs into packages/mcp/data/
 * so the published npm package is self-contained.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..", "..");
const dataDir = join(__dirname, "..", "data");

mkdirSync(join(dataDir, "manifests"), { recursive: true });

// Copy all manifest JSON files
for (const f of readdirSync(join(root, "source", "manifests"))) {
  if (f.endsWith(".json")) {
    cpSync(
      join(root, "source", "manifests", f),
      join(dataDir, "manifests", f),
    );
  }
}

// Copy props.json
cpSync(
  join(root, "apps", "docs", "src", "generated", "props.json"),
  join(dataDir, "props.json"),
);

// Copy tokens.json
cpSync(
  join(root, "tokens", "tokens.json"),
  join(dataDir, "tokens.json"),
);

console.log("Bundled data files into packages/mcp/data/");
