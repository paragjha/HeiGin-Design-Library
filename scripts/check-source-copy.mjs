#!/usr/bin/env node
// Proves the copy-source workflow: for EACH component, copy it (plus its manifest dependencies)
// into an empty directory and type-check it in isolation. Catches hidden dependencies that a
// manifest failed to list. Also checks that every manifest file path exists.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { repoRoot } from "./lib/graph.mjs";

// Outside the repo, so undeclared packages cannot resolve from the workspace node_modules.
const tmp = join(tmpdir(), "heigin-source-check");
const manifestsDir = join(repoRoot, "source/manifests");
const tsc = join(repoRoot, "node_modules/typescript/bin/tsc");
const only = process.argv.slice(2);

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const manifests = readdirSync(manifestsDir)
  .filter((f) => f !== "index.json" && f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(manifestsDir, f), "utf8")))
  .filter((m) => !only.length || only.includes(m.name));

let failed = 0;
for (const m of manifests) {
  const missing = [...m.files, ...m.styles].filter((f) => !existsSync(join(repoRoot, f)));
  if (missing.length) {
    failed++;
    console.error(`✗ ${m.name}: manifest lists missing files ${missing.join(", ")}`);
    continue;
  }
  const dest = join(tmp, m.name);
  execFileSync(process.execPath, [join(repoRoot, "scripts/copy-component.mjs"), m.name, "--dest", dest], { stdio: "pipe" });

  // Only the packages the manifest declares are resolvable (via paths), plus React types.
  const paths = Object.fromEntries(
    m.install.flatMap((p) => [
      [p, [join(repoRoot, "node_modules", p)]],
      [`${p}/*`, [join(repoRoot, "node_modules", p, "*")]],
    ]),
  );
  writeFileSync(join(dest, "css-modules.d.ts"), 'declare module "*.module.css" { const c: Readonly<Record<string, string>>; export default c; }\ndeclare module "*.css";\n');
  writeFileSync(
    join(dest, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        jsx: "react-jsx",
        module: "esnext",
        moduleResolution: "bundler",
        skipLibCheck: true,
        isolatedModules: true,
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        types: [],
        typeRoots: [join(repoRoot, "node_modules/@types")],
        baseUrl: ".",
        paths: { react: [join(repoRoot, "node_modules/@types/react")], "react/*": [join(repoRoot, "node_modules/@types/react/*")], ...paths },
      },
      include: ["**/*.ts", "**/*.tsx"],
    }),
  );
  try {
    execFileSync(process.execPath, [tsc, "-p", dest], { stdio: "pipe", encoding: "utf8" });
    console.log(`✓ ${m.name} (${m.files.length + 1} files${m.install.length ? `; npm: ${m.install.join(", ")}` : ""})`);
  } catch (e) {
    failed++;
    console.error(`✗ ${m.name} does not compile in isolation:\n${e.stdout}`);
  }
}

console.log(failed ? `\nSource-copy check FAILED for ${failed} component(s)` : `\nAll ${manifests.length} components copy and compile on their own`);
process.exit(failed ? 1 : 0);
