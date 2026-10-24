import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outfile = join(__dirname, "..", "dist", "index.js");

buildSync({
  entryPoints: [join(__dirname, "..", "src", "index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
  packages: "external",
});

const content = readFileSync(outfile, "utf8");
writeFileSync(outfile, "#!/usr/bin/env node\n" + content, "utf8");

console.log("Built packages/mcp/dist/index.js");
