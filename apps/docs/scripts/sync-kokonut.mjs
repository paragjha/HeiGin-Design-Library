#!/usr/bin/env node
// Vendors the Kokonut UI components listed below (MIT, https://kokonutui.com) into the docs app,
// byte-for-byte from their shadcn registry, and writes src/kokonut/meta.json from their docs pages.
//
//   node apps/docs/scripts/sync-kokonut.mjs           fetch everything, keep locally modified files
//   node apps/docs/scripts/sync-kokonut.mjs --force   also overwrite the locally modified files
//
// It writes the same files `npx shadcn@latest add https://kokonutui.com/r/<slug>.json` would,
// plus Kokonut's own dropdown-menu and textarea primitives so previews match their site.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = join(root, "src");
const force = process.argv.includes("--force");

const SITE = "https://kokonutui.com";
const REPO_RAW = "https://raw.githubusercontent.com/kokonut-labs/kokonutui/main";

const ITEMS = [
  ["ai", "ai-prompt"],
  ["ai", "ai-input-search"],
  ["ai", "ai-loading"],
  ["ai", "ai-tool-approval"],
  ["ai", "ai-tool-calls"],
  ["ai", "ai-connect"],
  ["ai", "ai-send"],
  ["ai", "ai-handoff"],
  ["ai", "ai-code-run"],
  ["ai", "ai-diff-review"],
  ["ai", "ai-model-selector"],
  ["ai", "ai-branches"],
  ["ai", "ai-agent-lanes"],
  ["ai", "ai-memory"],
  ["cards", "bento-grid"],
  ["cards", "activity-terrain"],
  ["cards", "metric-card"],
  ["cards", "uptime-card"],
  ["navigation", "toolbar"],
  ["navigation", "profile-dropdown"],
  ["navigation", "action-search-bar"],
  ["media", "synced-transcript"],
];

// These carry a HeiGin change (spinner replaced by ThinkingOrb); a plain sync would undo it.
const LOCALLY_MODIFIED = new Set(["ai-loading", "ai-tool-approval", "ai-tool-calls"]);

const UI_PRIMITIVES = ["dropdown-menu", "textarea"];

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": "generic-client" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function write(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

function headerField(source, field) {
  return source.match(new RegExp(`@${field}:\\s*(.+)`))?.[1]?.trim() ?? "";
}

function parseDocs(md) {
  const title = md.match(/^# (.+)$/m)?.[1]?.trim() ?? "";
  const description = md.match(/^> (.+)$/m)?.[1]?.trim() ?? "";
  const start = md.indexOf("\n## Props");
  const end = md.indexOf("\n## Source");
  const api = start === -1 ? "" : md.slice(start + "\n## Props".length, end === -1 ? undefined : end).trim();
  return { title, description, api };
}

const meta = [];
for (const [category, slug] of ITEMS) {
  const registry = JSON.parse(await get(`${SITE}/r/${slug}.json`));
  let componentSource = "";
  for (const file of registry.files) {
    const rel = file.path.replace(/^\//, "");
    const target = join(src, rel);
    const isComponent = rel === `components/kokonutui/${slug}.tsx`;
    if (isComponent) componentSource = file.content;
    if (isComponent && LOCALLY_MODIFIED.has(slug) && existsSync(target) && !force) {
      console.log(`kept   ${rel} (locally modified)`);
      continue;
    }
    write(target, file.content);
    console.log(`wrote  ${rel}`);
  }
  const docs = parseDocs(await get(`${SITE}/docs/${category}/${slug}.md`));
  meta.push({
    slug,
    category,
    title: docs.title,
    description: docs.description,
    api: docs.api,
    author: headerField(componentSource, "author"),
    version: headerField(componentSource, "version"),
    exportName: componentSource.match(/export default (?:function )?(\w+)/)?.[1] ?? "",
    dependencies: registry.dependencies ?? [],
    registryDependencies: registry.registryDependencies ?? [],
    modified: LOCALLY_MODIFIED.has(slug),
    docsUrl: `${SITE}/docs/${category}/${slug}`,
    registryUrl: `${SITE}/r/${slug}.json`,
  });
}

for (const name of UI_PRIMITIVES) {
  write(join(src, "components/ui", `${name}.tsx`), await get(`${REPO_RAW}/components/ui/${name}.tsx`));
  console.log(`wrote  components/ui/${name}.tsx`);
}

const utils = join(src, "lib/utils.ts");
if (!existsSync(utils)) {
  write(
    utils,
    `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n`,
  );
  console.log("wrote  lib/utils.ts");
}

write(join(src, "kokonut/meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
console.log(`\nsync-kokonut: ${meta.length} components, meta.json written`);
