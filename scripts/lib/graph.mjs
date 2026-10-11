// Import-graph helpers shared by build-manifests, copy-component and check-source-copy.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const srcRoot = join(repoRoot, "packages/ui/src");
const uiPkg = JSON.parse(readFileSync(join(repoRoot, "packages/ui/package.json"), "utf8"));

const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/g;
const toPosix = (p) => p.split("\\").join("/");

/** Lists component entry files: components/{ui,crm}/*.tsx, excluding tests. */
export function listComponents() {
  const out = [];
  for (const category of ["ui", "crm"]) {
    const dir = join(srcRoot, "components", category);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).sort()) {
      if (!file.endsWith(".tsx") || file.includes(".test.")) continue;
      out.push({ name: basename(file, ".tsx"), category, file: toPosix(join("components", category, file)) });
    }
  }
  return out;
}

function resolveRelative(fromFile, spec) {
  const base = resolve(dirname(join(srcRoot, fromFile)), spec);
  const candidates = spec.endsWith(".css") ? [base] : [`${base}.tsx`, `${base}.ts`, join(base, "index.ts")];
  const hit = candidates.find((c) => existsSync(c));
  if (!hit) throw new Error(`Unresolved import "${spec}" in ${fromFile}`);
  return toPosix(relative(srcRoot, hit));
}

const packageName = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

/** Walks the import graph from one src-relative file. Returns files and external packages. */
export function collect(entry) {
  const files = new Set();
  const packages = new Set();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (files.has(file)) continue;
    files.add(file);
    if (file.endsWith(".css")) continue;
    const code = readFileSync(join(srcRoot, file), "utf8");
    for (const match of code.matchAll(IMPORT_RE)) {
      const spec = match[1];
      if (spec.startsWith(".")) stack.push(resolveRelative(file, spec));
      else packages.add(packageName(spec));
    }
  }
  return { files: [...files].sort(), packages: [...packages].sort() };
}

export function versionFor(pkg) {
  return uiPkg.dependencies?.[pkg] ?? uiPkg.peerDependencies?.[pkg] ?? "*";
}

export function isClientModule(file) {
  return /^\s*["']use client["']/.test(readFileSync(join(srcRoot, file), "utf8"));
}

/** Runtime (value) exports and type-only exports of a module. */
export function exportedNames(file) {
  const code = readFileSync(join(srcRoot, file), "utf8");
  const values = new Set();
  const types = new Set();
  for (const m of code.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z0-9_]+)/g)) values.add(m[1]);
  for (const m of code.matchAll(/export\s+(?:interface|type)\s+([A-Za-z0-9_]+)/g)) types.add(m[1]);
  return { values: [...values].sort(), types: [...types].sort() };
}

/** JSDoc summary directly above the main export, if any. */
export function summary(file) {
  const code = readFileSync(join(srcRoot, file), "utf8");
  // Tempered pattern: a single JSDoc block (never spanning "*/") directly above an export.
  const matches = [...code.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(?:const|function)\s+([A-Za-z0-9_]+)/g)];
  const pascal = basename(file, ".tsx").replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
  const m = matches.find((x) => x[2] === pascal) ?? matches[0];
  return m ? m[1].replace(/^\s*\*\s?/gm, "").replace(/\s+/g, " ").trim() : "";
}
