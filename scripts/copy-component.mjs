#!/usr/bin/env node
// Copies one or more HeiGin components, plus everything they import, into another project.
//
//   node scripts/copy-component.mjs button dialog --dest ../my-app/components/heigin
//   node scripts/copy-component.mjs --all --dest ../my-app/components/heigin
//
// Files keep their layout relative to packages/ui/src, so internal relative imports keep working:
//   <dest>/components/ui/button.tsx, <dest>/lib/cn.ts, <dest>/styles/tokens.css
// Existing files are never overwritten unless --force is passed.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { collect, listComponents, srcRoot, versionFor } from "./lib/graph.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const names = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--dest");

if (flag("--help") || (!names.length && !flag("--all"))) {
  console.log(`Usage: node scripts/copy-component.mjs <name...> --dest <dir> [--force] [--dry-run]
       node scripts/copy-component.mjs --all --dest <dir>
       node scripts/copy-component.mjs --list`);
  process.exit(names.length || flag("--all") ? 0 : 1);
}

const all = listComponents();
if (flag("--list")) {
  for (const c of all) console.log(`${c.category}/${c.name}`);
  process.exit(0);
}

const dest = option("--dest");
if (!dest) {
  console.error("Missing --dest <dir>");
  process.exit(1);
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
