#!/usr/bin/env node
// Copies one or more HeiGin components, plus everything they import, into another project.
//
//   node scripts/copy-component.mjs button dialog --dest ../my-app/components/heigin
//   node scripts/copy-component.mjs --all --dest ../my-app/components/heigin
//
// Files keep their layout relative to packages/ui/src, so internal relative imports keep working:
//   <dest>/components/ui/button.tsx, <dest>/lib/cn.ts, <dest>/styles/tokens.css
// Existing files are never overwritten unless --force is passed.
//
// Community (Kokonut UI) components import through the "@/" alias, so --dest is the folder that alias points to:
//   node scripts/copy-component.mjs community/activity-terrain --dest ../my-app/src
//   -> <dest>/components/kokonutui/activity-terrain.tsx, <dest>/lib/utils.ts
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { collect, listComponents, repoRoot, srcRoot, versionFor } from "./lib/graph.mjs";

const docsSrc = join(repoRoot, "apps/docs/src");
const communityDir = join(docsSrc, "components/kokonutui");
const community = readdirSync(communityDir).filter((f) => f.endsWith(".tsx")).map((f) => f.slice(0, -4)).sort();

/** A community component's files (relative to the "@/" root) and the npm packages they import. */
function collectCommunity(slug) {
  const files = new Set();
  const packages = new Set();
  const visit = (file) => {
    if (files.has(file)) return;
    files.add(file);
    const code = readFileSync(join(docsSrc, file), "utf8");
    for (const m of code.matchAll(/(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/g)) {
      const spec = m[1];
      if (spec.startsWith("@/")) {
        const base = spec.slice(2);
        const hit = [".tsx", ".ts"].map((ext) => base + ext).find((f) => existsSync(join(docsSrc, f)));
        if (!hit) throw new Error(`${file} imports ${spec}, which is not in apps/docs/src`);
        visit(hit);
      } else if (!spec.startsWith(".")) {
        packages.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
      }
    }
  };
  visit(`components/kokonutui/${slug}.tsx`);
  return { files, packages };
}

function communityVersion(pkg) {
  const read = (path) => JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
  if (pkg === "@heigin/ui") return read("packages/ui/package.json").version;
  const docs = read("apps/docs/package.json");
  return docs.dependencies?.[pkg] ?? docs.devDependencies?.[pkg] ?? "latest";
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const names = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--dest");

if (flag("--help") || (!names.length && !flag("--all") && !flag("--list"))) {
  console.log(`Usage: node scripts/copy-component.mjs <name...> --dest <dir> [--force] [--dry-run]
       node scripts/copy-component.mjs --all --dest <dir>
       node scripts/copy-component.mjs --list`);
  process.exit(names.length || flag("--all") ? 0 : 1);
}

const all = listComponents();
if (flag("--list")) {
  for (const c of all) console.log(`${c.category}/${c.name}`);
  for (const slug of community) console.log(`community/${slug}`);
  process.exit(0);
}

const dest = option("--dest");
if (!dest) {
  console.error("Missing --dest <dir>");
  process.exit(1);
}

// "community/<slug>" always means the community component; a bare slug does only when no HeiGin component has that name.
const communitySlug = (n) => {
  const slug = n.startsWith("community/") ? n.slice(10) : all.some((c) => c.name === n) ? null : n;
  return slug && community.includes(slug) ? slug : null;
};
const communityNames = flag("--all") ? [] : names.map(communitySlug).filter(Boolean);
if (communityNames.length && communityNames.length !== names.length) {
  console.error('Community components copy to your "@/" root, HeiGin components to their own folder. Copy them in separate runs.');
  process.exit(1);
}
if (communityNames.length) {
  const files = new Set();
  const packages = new Set();
  for (const slug of communityNames) {
    const graph = collectCommunity(slug);
    graph.files.forEach((f) => files.add(f));
    graph.packages.forEach((p) => packages.add(p));
  }
  const destRoot = resolve(dest);
  const copied = [];
  const skipped = [];
  for (const file of [...files].sort()) {
    const target = join(destRoot, file);
    const source = join(docsSrc, file);
    if (existsSync(target) && !flag("--force")) {
      if (readFileSync(target, "utf8") !== readFileSync(source, "utf8")) skipped.push(file);
      continue;
    }
    if (!flag("--dry-run")) {
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(source, target);
    }
    copied.push(file);
  }
  const install = [...packages].filter((p) => p !== "react" && p !== "react-dom").sort().map((p) => `${p}@${communityVersion(p)}`);
  console.log(`${flag("--dry-run") ? "Would copy" : "Copied"} ${copied.length} file(s) to ${destRoot}`);
  copied.forEach((f) => console.log(`  + ${f}`));
  if (skipped.length) {
    console.log(`
Skipped ${skipped.length} existing file(s) that differ (use --force to overwrite):`);
    skipped.forEach((f) => console.log(`  ! ${f}`));
  }
  console.log(`
Next steps:`);
  if (install.length) console.log(`  1. npm install ${install.join(" ")}`);
  console.log(`  ${install.length ? 2 : 1}. These components need Tailwind CSS v4 and a "@/" import alias pointing at ${destRoot}.`);
  console.log(`  ${install.length ? 3 : 2}. Import from "@/components/kokonutui/<name>". Kokonut UI, MIT: keep the license header in each file.`);
  process.exit(0);
}

const selected = flag("--all") ? all : names.map((n) => all.find((c) => c.name === n) ?? (console.error(`Unknown component "${n}". Use --list.`), process.exit(1)));
const files = new Set(["styles/tokens.css"]);
const packages = new Set();
for (const c of selected) {
  const graph = collect(c.file);
  graph.files.forEach((f) => files.add(f));
  graph.packages.forEach((p) => packages.add(p));
}

const destRoot = resolve(dest);
const copied = [];
const skipped = [];
for (const file of [...files].sort()) {
  const target = join(destRoot, file);
  const source = join(srcRoot, file);
  if (existsSync(target) && !flag("--force")) {
    if (readFileSync(target, "utf8") !== readFileSync(source, "utf8")) skipped.push(file);
    continue;
  }
  if (!flag("--dry-run")) {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
  copied.push(file);
}

const install = [...packages].filter((p) => p !== "react" && p !== "react-dom").map((p) => `${p}@${versionFor(p)}`);
console.log(`${flag("--dry-run") ? "Would copy" : "Copied"} ${copied.length} file(s) to ${destRoot}`);
copied.forEach((f) => console.log(`  + ${f}`));
if (skipped.length) {
  console.log(`\nSkipped ${skipped.length} existing file(s) that differ (use --force to overwrite):`);
  skipped.forEach((f) => console.log(`  ! ${f}`));
}
console.log(`\nNext steps:`);
if (install.length) console.log(`  1. npm install ${install.join(" ")}`);
console.log(`  ${install.length ? 2 : 1}. Import the tokens once, e.g. in app/layout.tsx:  import "<path>/styles/tokens.css";`);
console.log(`  ${install.length ? 3 : 2}. Import components from "<path>/components/ui/<name>".`);
