// Copies standalone CSS entry points into dist and sanity-checks the build output.
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(pkgDir, "dist");

for (const file of ["tokens.css", "tailwind.css", "base.css"]) {
  copyFileSync(join(pkgDir, "src/styles", file), join(dist, file));
}

const required = ["index.js", "index.d.ts", "tokens.js", "tokens.d.ts", "styles.css", "tokens.css", "tailwind.css", "base.css"];
const missing = required.filter((f) => !existsSync(join(dist, f)));
if (missing.length) {
  console.error(`postbuild: missing ${missing.join(", ")}`);
  process.exit(1);
}

// The JS output must not import CSS (consumers import styles.css explicitly; Next.js forbids
// global CSS imports from node_modules inside components).
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const cssImports = walk(dist).filter((f) => f.endsWith(".js") && /import\s+["'][^"']+\.css["']/.test(readFileSync(f, "utf8")));
if (cssImports.length) {
  console.error(`postbuild: JS files import CSS:\n  ${cssImports.join("\n  ")}`);
  process.exit(1);
}
console.log("postbuild: dist OK");
