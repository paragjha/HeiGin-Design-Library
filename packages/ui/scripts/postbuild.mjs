// Copies standalone CSS entry points into dist and sanity-checks the build output.
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(pkgDir, "dist");

for (const file of ["tokens.css", "tailwind.css", "base.css"]) {
  copyFileSync(join(pkgDir, "src/styles", file), join(dist, file));
}

// tsc keeps extensionless relative specifiers from the bundler-style source. Node16/NodeNext
// consumers need explicit extensions, so rewrite "./button" -> "./button.js" in every .d.ts.
const walkFiles = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walkFiles(join(dir, f)) : [join(dir, f)]));
let rewritten = 0;
for (const file of walkFiles(dist).filter((f) => f.endsWith(".d.ts"))) {
  // Side-effect CSS imports (used to collect styles.css at build time) mean nothing in types.
  const code = readFileSync(file, "utf8").replace(/^import\s+["'][^"']+\.css["'];?\r?\n/gm, "");
  const next = code.replace(/(from\s+|import\s*\(\s*)(["'])(\.{1,2}\/[^"']+?)\2/g, (match, lead, quote, spec) => {
    if (/\.(js|css|json)$/.test(spec)) return match;
    const base = join(dirname(file), spec);
    const target = existsSync(`${base}.d.ts`) ? `${spec}.js` : existsSync(join(base, "index.d.ts")) ? `${spec}/index.js` : null;
    if (!target) throw new Error(`postbuild: cannot resolve ${spec} from ${file}`);
    rewritten++;
    return `${lead}${quote}${target}${quote}`;
  });
  if (/from\s+["'][^"']+\.css["']/.test(next)) throw new Error(`postbuild: ${file} references a CSS module in its public types`);
  if (next !== readFileSync(file, "utf8")) writeFileSync(file, next);
}
console.log(`postbuild: added extensions to ${rewritten} declaration imports`);

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
