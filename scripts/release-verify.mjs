#!/usr/bin/env node
/**
 * Cross-checks that every public claim about this release lines up with the
 * facts on the ground. Fails CI if any of them drift. Add new checks here
 * whenever a surface grows a new user-facing claim (counts, published status,
 * install commands, registry shape).
 *
 * Checks today:
 *   1. Local @heigin/ui package.json version has a matching entry in the
 *      changelog on apps/docs/src/pages/Guides.tsx (prevents advertising a
 *      version we haven't written release notes for).
 *   2. Count of source/manifests/*.json (minus index.json) matches
 *      source/manifests/index.json's components[] length.
 *   3. tokens/tokens.json leaf count matches what @heigin/ui's generated
 *      tokenMeta exports (the number the Overview strip advertises).
 *   4. For every slug in source/manifests, the file it points at under
 *      packages/ui/src actually exists (prevents MCP list_components from
 *      returning items that 404 on install).
 *   5. GettingStarted.tsx no longer claims @heigin/ui is unpublished.
 *
 * Checks deferred to later tasks (TODOs listed in the Chain B/C plan):
 *   - npm view @heigin/ui version == package.json version (task #5 publish)
 *   - MCP get_tokens length == tokenMeta length (needs network — gated on #47)
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const errors = [];
const ok = (msg) => console.log(`  ok  ${msg}`);
const fail = (msg) => { errors.push(msg); console.log(`  FAIL ${msg}`); };

function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

// ── 1. Package version has a changelog entry
console.log("1. Package version has a changelog entry");
const uiPkg = readJSON(join(root, "packages/ui/package.json"));
const changelogSrc = readFileSync(join(root, "apps/docs/src/pages/Guides.tsx"), "utf8");
if (changelogSrc.includes(`version: "${uiPkg.version}"`)) {
  ok(`@heigin/ui ${uiPkg.version} has a changelog entry`);
} else {
  fail(`@heigin/ui package.json says ${uiPkg.version} but Guides.tsx CHANGELOG has no matching entry`);
}

// ── 2. Manifest file count matches index
console.log("\n2. Manifest files match index.json");
const manifestDir = join(root, "source/manifests");
const manifestFiles = readdirSync(manifestDir).filter((f) => f.endsWith(".json") && f !== "index.json");
const manifestIndex = readJSON(join(manifestDir, "index.json"));
if (manifestFiles.length === manifestIndex.components.length) {
  ok(`${manifestFiles.length} manifest files, ${manifestIndex.components.length} index entries`);
} else {
  fail(`${manifestFiles.length} manifest files but ${manifestIndex.components.length} entries in index.json — run scripts/build-manifests.mjs`);
}

// ── 3. Token count — tokens.json vs the generated tokens.ts tokenMeta
console.log("\n3. tokens.json leaf count matches generated tokenMeta");
function countLeaves(node) {
  if (!node || typeof node !== "object") return 0;
  if (typeof node.value === "string") return 1;
  let n = 0;
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) continue;
    n += countLeaves(v);
  }
  return n;
}
const tokens = readJSON(join(root, "tokens/tokens.json"));
const tokenLeafCount = Object.entries(tokens)
  .filter(([k]) => !k.startsWith("$"))
  .reduce((n, [, group]) => n + countLeaves(group), 0);
const tokensTs = readFileSync(join(root, "packages/ui/src/tokens.ts"), "utf8");
// Only count entries that follow `export const tokenMeta`, up to its closing brace.
const metaBlockMatch = tokensTs.match(/export const tokenMeta[\s\S]*?^\};/m);
const metaBlock = metaBlockMatch ? metaBlockMatch[0] : "";
const tokenMetaKeys = (metaBlock.match(/^\s+"[^"]+":\s*\{/gm) ?? []).length;
if (tokenLeafCount === tokenMetaKeys) {
  ok(`${tokenLeafCount} tokens in tokens.json, ${tokenMetaKeys} in tokenMeta`);
} else {
  fail(`tokens.json has ${tokenLeafCount} leaves but tokenMeta exports ${tokenMetaKeys} — run scripts/build-tokens.mjs`);
}

// ── 4. Every manifest points at a file that exists
console.log("\n4. Every manifest's entry file exists");
let missing = 0;
for (const name of manifestFiles) {
  const m = readJSON(join(manifestDir, name));
  const entry = join(root, "packages/ui/src", m.entry);
  if (!existsSync(entry)) {
    fail(`${m.name}: ${m.entry} not found at ${entry}`);
    missing++;
  }
}
if (missing === 0) ok(`${manifestFiles.length} manifests, every entry file present`);

// ── 5. Registry output is in sync with manifests + licenses
console.log("\n5. Registry output in sync with manifests");
const registryDir = join(root, "apps/docs/public/r");
const licenses = readJSON(join(root, "source/licenses.json"));
const missingLicenses = manifestFiles
  .map((f) => readJSON(join(manifestDir, f)).name)
  .filter((name) => !licenses.items[name]);
if (missingLicenses.length) {
  fail(`source/licenses.json is missing: ${missingLicenses.join(", ")} — add them before build-registry can run`);
} else {
  ok(`${manifestFiles.length} manifest slugs all have a license tier in source/licenses.json`);
}
if (existsSync(registryDir)) {
  const indexPath = join(registryDir, "index.json");
  if (!existsSync(indexPath)) {
    fail("apps/docs/public/r/ exists but index.json is missing — run `npm run registry`");
  } else {
    const index = readJSON(indexPath);
    const expectedItems = manifestFiles.length + 1; // + shared @heigin/tokens
    if (index.items.length !== expectedItems) {
      fail(`/r/index.json has ${index.items.length} items but expected ${expectedItems} (${manifestFiles.length} manifests + tokens) — run \`npm run registry\``);
    } else {
      ok(`/r/index.json has ${index.items.length} items (${manifestFiles.length} components + tokens)`);
    }
    // Spot-check: button.json exists and lists files.
    const btnPath = join(registryDir, "button.json");
    if (existsSync(btnPath)) {
      const btn = readJSON(btnPath);
      if (btn.name === "button" && Array.isArray(btn.files) && btn.files.length > 0) {
        ok(`/r/button.json has ${btn.files.length} files, name "${btn.name}"`);
      } else {
        fail(`/r/button.json malformed — run \`npm run registry\``);
      }
    }
  }
} else {
  // The generator is run as part of CI (added to package.json "ci"), so if
  // we're here outside CI without a build, don't fail — just note it.
  console.log("  skip  registry output not present (run `npm run registry` to generate)");
}

// ── 6. Getting Started no longer claims unpublished
console.log("\n6. Getting Started doesn't lie about publish status");
const gs = readFileSync(join(root, "apps/docs/src/pages/GettingStarted.tsx"), "utf8");
if (gs.includes("Not published yet") || /not been released to npm/i.test(gs)) {
  fail('apps/docs/src/pages/GettingStarted.tsx still contains a "not published" claim');
} else {
  ok("apps/docs/src/pages/GettingStarted.tsx tells the truth about npm");
}

console.log();
if (errors.length) {
  console.error(`release:verify — ${errors.length} failure(s). Fix the drift above.`);
  process.exit(1);
}
console.log("release:verify — all checks passed.");
