#!/usr/bin/env node
// Validates the *packed* @heigin/ui artifact, not the workspace source:
//   1. npm pack -> inspect the file list (no secrets, no source maps of private files, no tests)
//   2. publint + @arethetypeswrong on the tarball
//   3. install the tarball into a throwaway consumer and import every export (ESM + types + CSS)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./lib/graph.mjs";

const pkgDir = join(repoRoot, "packages/ui");
const tmp = join(repoRoot, ".tmp/validate-package");
const isWin = process.platform === "win32";
const npm = isWin ? "npm.cmd" : "npm";
const npx = isWin ? "npx.cmd" : "npx";
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: "pipe", encoding: "utf8", shell: isWin, ...opts });
let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  failures++;
  console.error(`  ✗ ${msg}`);
};

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

if (!existsSync(join(pkgDir, "dist/index.js"))) {
  console.error("dist/ missing — run `npm run build:ui` first.");
  process.exit(1);
}

console.log("1. npm pack");
const packJson = JSON.parse(run(npm, ["pack", "--json", "--pack-destination", tmp], { cwd: pkgDir }));
const { filename, files, size } = packJson[0];
const tarball = join(tmp, filename);
const paths = files.map((f) => f.path);
ok(`${filename} (${(size / 1024).toFixed(1)} kB, ${paths.length} files)`);
const forbidden = paths.filter((p) => /(^|\/)(\.env|.*\.pem|.*\.key|.*\.test\.|src\/|node_modules\/|cookies|storage-state)/i.test(p));
if (forbidden.length) fail(`forbidden files in tarball: ${forbidden.join(", ")}`);
else ok("no secrets, tests or source files in tarball");
for (const required of ["package.json", "README.md", "dist/index.js", "dist/index.d.ts", "dist/styles.css", "dist/tokens.css", "dist/tailwind.css", "dist/base.css", "dist/tokens.js", "dist/tokens.d.ts"]) {
  if (!paths.includes(required)) fail(`missing ${required}`);
}
ok("required entry files present");

console.log("2. publint + are-the-types-wrong");
try {
  const out = run(npx, ["publint", tarball, "--strict"], { cwd: repoRoot });
  ok(`publint: ${out.trim().split("\n").pop()}`);
} catch (e) {
  fail(`publint failed:\n${e.stdout}${e.stderr}`);
}
try {
  run(npx, ["attw", tarball, "--profile", "esm-only", "--format", "table-flipped", "--exclude-entrypoints", "./styles.css", "./tokens.css", "./tailwind.css", "./base.css"], { cwd: repoRoot });
  ok("attw: types resolve for ESM consumers (node16-esm, bundler)");
} catch (e) {
  fail(`attw failed:\n${e.stdout}${e.stderr}`);
}

console.log("3. install into a throwaway consumer");
const consumer = join(tmp, "consumer");
mkdirSync(consumer, { recursive: true });
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ name: "consumer", private: true, type: "module", dependencies: { "@heigin/ui": `file:${tarball.replace(/\\/g, "/")}`, react: "^19.3.0", "react-dom": "^19.3.0" } }, null, 2),
);
run(npm, ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: consumer });
ok("tarball installs with its dependencies");

writeFileSync(
  join(consumer, "check.mjs"),
  `import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import * as ui from "@heigin/ui";
import { tokens, vars } from "@heigin/ui/tokens";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
const require = createRequire(import.meta.url);
const expected = ${JSON.stringify(["Button", "IconButton", "Input", "Field", "Select", "Checkbox", "Switch", "RadioGroup", "Tabs", "DropdownMenu", "Dialog", "DialogContent", "AlertDialog", "Drawer", "Popover", "Tooltip", "ToastProvider", "useToast", "Table", "Pagination", "Badge", "Avatar", "Card", "EmptyState", "Skeleton", "Spinner", "PageHeader", "MetricCard", "MoneyValue", "StatusBadge", "ApprovalCard", "TaskRow", "ConversationListItem", "ActivityTimeline", "FilterToolbar", "FilterChip", "RecordHeader", "DealStage", "SidebarNav", "formatINR"])};
const missing = expected.filter((n) => !(n in ui));
if (missing.length) throw new Error("missing exports: " + missing.join(", "));
if (tokens.color.ink !== "#1f1f1f" || vars.color.ink !== "var(--hg-color-ink)") throw new Error("tokens export wrong");
for (const sub of ["styles.css", "tokens.css", "tailwind.css", "base.css"]) {
  const p = require.resolve("@heigin/ui/" + sub);
  if (!existsSync(p) || readFileSync(p, "utf8").length < 50) throw new Error("css export broken: " + sub);
}
if (!readFileSync(require.resolve("@heigin/ui/styles.css"), "utf8").includes("--hg-color-ink")) throw new Error("styles.css lacks tokens");
const html = renderToStaticMarkup(h(ui.Button, { variant: "primary" }, "Create lead")) + renderToStaticMarkup(h(ui.MoneyValue, { amount: 849600 }));
if (!html.includes("Create lead") || !html.includes("₹8,49,600")) throw new Error("SSR render failed: " + html);
const pkg = JSON.parse(readFileSync(require.resolve("@heigin/ui/package.json"), "utf8"));
if (!pkg.peerDependencies?.react) throw new Error("react peer dependency missing");
console.log("    exports: " + Object.keys(ui).length + ", SSR ok, CSS ok, tokens ok");
`,
);
try {
  console.log(run(process.execPath, ["check.mjs"], { cwd: consumer, shell: false }).trimEnd());
  ok("runtime imports, SSR render, CSS and token exports resolve from the installed tarball");
} catch (e) {
  fail(`consumer check failed:\n${e.stdout}${e.stderr}`);
}

writeFileSync(
  join(consumer, "types.ts"),
  `import { Button, type ButtonProps, Table, type TableColumn, StatusBadge, type StatusKey } from "@heigin/ui";
import { tokens, type Tokens } from "@heigin/ui/tokens";
const p: ButtonProps = { variant: "secondary", size: "sm" };
const col: TableColumn<{ id: string }> = { id: "id", header: "ID" };
const s: StatusKey = "won";
const t: Tokens["color"]["ink"] = tokens.color.ink;
// @ts-expect-error invalid variant must be rejected
const bad: ButtonProps = { variant: "purple" };
export { Button, Table, StatusBadge, p, col, s, t, bad };
`,
);
writeFileSync(
  join(consumer, "tsconfig.json"),
  JSON.stringify({ compilerOptions: { strict: true, noEmit: true, module: "nodenext", moduleResolution: "nodenext", jsx: "react-jsx", skipLibCheck: false, types: [] }, files: ["types.ts"] }),
);
try {
  run(process.execPath, [join(repoRoot, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.json"], { cwd: consumer, shell: false });
  ok("TypeScript consumer (nodenext, strict, skipLibCheck=false) compiles against the published .d.ts");
} catch (e) {
  fail(`consumer typecheck failed:\n${e.stdout}${e.stderr}`);
}

console.log(failures ? `\nPackage validation FAILED (${failures})` : "\nPackage validation passed");
console.log(`Tarball kept at ${tarball}`);
process.exit(failures ? 1 : 0);
