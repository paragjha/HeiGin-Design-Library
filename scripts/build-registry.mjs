#!/usr/bin/env node
/**
 * Build the public shadcn-compatible registry from source/manifests/*.json.
 *
 * Free items and the index are written to apps/docs/public/r/ and served as
 * static files. Pro/Team items are never written there: their stub shell goes
 * to .generated/registry/_gated/<name>.json and their real bodies to
 * .generated/registry/_private/<name>.json. The api/r/[slug] function serves
 * the shell with a 402 until a license verifies, then merges in the bodies.
 *
 *   node scripts/build-registry.mjs           # build
 *   node scripts/build-registry.mjs --check   # fail if the output would change
 *
 * Source of truth, by facet:
 *   - items + categories + file set   → source/manifests/*.json
 *   - template items                  → source/templates/*.json
 *   - license tier per item           → source/licenses.json  (fails on missing)
 *   - file bodies                     → packages/ui/src/** and templates/**
 *   - @heigin/ui version              → packages/ui/package.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildItem, buildTemplateItem, buildTokensItem } from "./lib/registry-mapping.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const manifestDir = join(repoRoot, "source/manifests");
const templateDir = join(repoRoot, "source/templates");
const srcRoot = join(repoRoot, "packages/ui/src");
// Free items + the index go into the docs static output so Vercel's CDN
// serves them directly at /r/<slug>.json. Everything about a gated item stays
// under .generated/ so it can't be served statically; /r/<slug>.json for a
// gated item falls through to the api/r/ function (see vercel.json).
const outDir = join(repoRoot, "apps/docs/public/r");
const gatedDir = join(repoRoot, ".generated/registry/_gated");
const privateDir = join(repoRoot, ".generated/registry/_private");

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");

function readJSON(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function main() {
  const uiPkg = readJSON(join(repoRoot, "packages/ui/package.json"));
  const version = uiPkg.version;

  // Licenses — fail if any manifest slug is missing.
  const licenses = readJSON(join(repoRoot, "source/licenses.json"));
  const tierByName = licenses.items;

  // Load all manifests except index.
  const manifestFiles = readdirSync(manifestDir).filter((f) => f.endsWith(".json") && f !== "index.json");
  const manifests = manifestFiles.map((f) => readJSON(join(manifestDir, f)));
  manifests.sort((a, b) => a.name.localeCompare(b.name));

  // Template families: each file holds one family and its items.
  const families = existsSync(templateDir)
    ? readdirSync(templateDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => readJSON(join(templateDir, f)))
    : [];
  const templateEntries = families.flatMap((family) => family.items.map((entry) => ({ family, entry })));

  // Guard: every slug must have a license entry.
  const missing = [...manifests, ...templateEntries.map((t) => t.entry)].filter((m) => !tierByName[m.name]);
  if (missing.length) {
    console.error(`ERROR: source/licenses.json is missing entries for: ${missing.map((m) => m.name).join(", ")}`);
    console.error("Add them (default 'free') and rerun.");
    process.exit(1);
  }

  // Pre-load tokens.css once; every item depends on the shared @heigin/tokens item.
  const tokensCssPath = join(srcRoot, "styles/tokens.css");
  if (!existsSync(tokensCssPath)) {
    console.error(`ERROR: ${tokensCssPath} does not exist. Run scripts/build-tokens.mjs first.`);
    process.exit(1);
  }
  const tokensCss = readFileSync(tokensCssPath, "utf8");

  // Build items.
  const built = []; // { name, category, version, license, access, title, description, filesCount }
  const emitted = new Map(); // outPath -> content
  const emittedPrivate = new Map();

  for (const m of manifests) {
    const tier = tierByName[m.name];
    const fileBodies = new Map();
    for (const repoPath of m.files) {
      const abs = join(repoRoot, repoPath);
      if (!existsSync(abs)) {
        console.error(`ERROR: ${m.name} references ${repoPath} which does not exist.`);
        process.exit(1);
      }
      fileBodies.set(repoPath, readFileSync(abs, "utf8"));
    }

    const item = buildItem({ manifest: m, fileBodies, tier, version });
    const publicJson = JSON.stringify(item, null, 2) + "\n";
    emitted.set(join(item.access === "gated" ? gatedDir : outDir, `${m.name}.json`), publicJson);

    // For gated items, also emit the real-body version into _private/.
    if (item.access === "gated") {
      const realFiles = m.files
        .filter((p) => !/\/styles\/tokens\.css$/.test(p))
        .map((repoPath) => ({
          path: repoPath.replace(/^packages\/ui\/src\//, ""),
          content: fileBodies.get(repoPath),
        }));
      emittedPrivate.set(
        join(privateDir, `${m.name}.json`),
        JSON.stringify({ name: m.name, files: realFiles }, null, 2) + "\n",
      );
    }

    built.push({
      name: m.name,
      category: m.category,
      version,
      license: tier,
      access: item.access,
      title: item.title,
      description: item.description,
      fileCount: item.files.length,
    });
  }

  // Template items.
  const knownTemplates = new Set(templateEntries.map((t) => t.entry.name));
  for (const { family, entry } of templateEntries) {
    const tier = tierByName[entry.name];
    for (const dep of entry.registryDependencies ?? []) {
      if (!knownTemplates.has(dep)) {
        console.error(`ERROR: ${entry.name} depends on unknown template item ${dep}.`);
        process.exit(1);
      }
    }
    const fileBodies = new Map();
    for (const repoPath of entry.files) {
      const abs = join(repoRoot, repoPath);
      if (!repoPath.startsWith(`${family.sourceRoot}/`) || !existsSync(abs)) {
        console.error(`ERROR: ${entry.name} references ${repoPath} which is missing or outside ${family.sourceRoot}.`);
        process.exit(1);
      }
      fileBodies.set(repoPath, readFileSync(abs, "utf8"));
    }
    const item = buildTemplateItem({ entry, family, fileBodies, tier, version });
    emitted.set(
      join(item.access === "gated" ? gatedDir : outDir, `${entry.name}.json`),
      JSON.stringify(item, null, 2) + "\n",
    );
    if (item.access === "gated") {
      const realFiles = item.files.map((f, i) => ({ path: f.path, content: fileBodies.get(entry.files[i]) }));
      emittedPrivate.set(
        join(privateDir, `${entry.name}.json`),
        JSON.stringify({ name: entry.name, files: realFiles }, null, 2) + "\n",
      );
    }
    built.push({
      name: entry.name,
      category: "template",
      kind: entry.kind,
      type: "registry:block",
      version,
      license: tier,
      access: item.access,
      title: item.title,
      description: item.description,
      fileCount: item.files.length,
    });
  }

  // Shared tokens item.
  const tokensItem = buildTokensItem({ tokensCss, version });
  emitted.set(join(outDir, "tokens.json"), JSON.stringify(tokensItem, null, 2) + "\n");
  built.push({
    name: tokensItem.name,
    category: "ui",
    version,
    license: "free",
    access: "public",
    title: tokensItem.title,
    description: tokensItem.description,
    fileCount: 1,
  });

  // Index.
  const index = {
    $schema: "https://heigin.com/schemas/registry-index.json",
    name: "@heigin",
    version,
    description: "HeiGin UI shadcn-compatible registry.",
    homepage: "https://ui.heigin.com",
    items: built
      .map((b) => ({
        name: b.name,
        type: b.type ?? (b.name === "tokens" ? "registry:style" : "registry:ui"),
        title: b.title,
        description: b.description,
        category: b.category,
        ...(b.kind ? { kind: b.kind } : {}),
        version: b.version,
        license: b.license,
        access: b.access,
        url: `https://ui.heigin.com/r/${b.name}.json`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
  emitted.set(join(outDir, "index.json"), JSON.stringify(index, null, 2) + "\n");

  // --check mode: diff without writing.
  if (checkOnly) {
    let drift = 0;
    for (const [p, c] of [...emitted, ...emittedPrivate]) {
      const current = existsSync(p) ? readFileSync(p, "utf8") : "";
      if (current !== c) {
        console.error(`drift: ${p}`);
        drift++;
      }
    }
    if (drift) {
      console.error(`\nbuild-registry --check: ${drift} file(s) out of date. Run \`node scripts/build-registry.mjs\`.`);
      process.exit(1);
    }
    console.log(`build-registry --check: ${emitted.size + emittedPrivate.size} files, no drift.`);
    return;
  }

  // Write.
  // Start clean so an item that changed tier cannot leave a stale copy on the other side.
  for (const dir of [outDir, gatedDir, privateDir]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }
  for (const [p, c] of emitted) writeFileSync(p, c);
  for (const [p, c] of emittedPrivate) writeFileSync(p, c);

  const freeCount = built.filter((b) => b.access === "public").length;
  const gatedCount = built.filter((b) => b.access === "gated").length;
  console.log(`build-registry: ${built.length} items (${freeCount} free in ${outDir}, ${gatedCount} gated) + 1 index`);
  if (gatedCount) console.log(`  gated shells in ${gatedDir}, real bodies in ${privateDir}; neither is served statically`);
}

main();
