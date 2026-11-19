// Builds kokonut-meta.json from tracked sources (apps/docs/src/kokonut/meta.json
// cross-checked against the vendored .tsx component files).
//
// Used by:
//   - scripts/build-kokonut-meta.mjs (--check mode for CI, --write for explicit generation)
//   - packages/mcp/scripts/bundle-data.mjs (writes into packages/mcp/data/)
//   - scripts/gen-mcp-api-data.mjs (Vercel build, inlines into api/_mcp-data.json)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./graph.mjs";

const docsSrc = join(repoRoot, "apps/docs/src");
const communityDir = join(docsSrc, "components/kokonutui");

/**
 * Returns the 22-entry kokonut-meta array, validated against the vendored .tsx files.
 * Throws on any mismatch so a broken sync is caught at build time.
 */
export function buildKokonutMeta() {
  const metaPath = join(docsSrc, "kokonut/meta.json");
  if (!existsSync(metaPath)) {
    throw new Error(
      `Missing apps/docs/src/kokonut/meta.json — run: node apps/docs/scripts/sync-kokonut.mjs`,
    );
  }

  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  if (!Array.isArray(meta) || meta.length === 0) {
    throw new Error("kokonut/meta.json is empty or not an array");
  }

  // Cross-check: every .tsx in kokonutui/ must have a meta entry and vice-versa
  const tsxSlugs = readdirSync(communityDir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.slice(0, -4))
    .sort();

  const metaSlugs = meta.map((m) => m.slug).sort();

  const onlyTsx = tsxSlugs.filter((s) => !metaSlugs.includes(s));
  const onlyMeta = metaSlugs.filter((s) => !tsxSlugs.includes(s));
  if (onlyTsx.length > 0 || onlyMeta.length > 0) {
    const parts = [];
    if (onlyTsx.length) parts.push(`components without meta: ${onlyTsx.join(", ")}`);
    if (onlyMeta.length) parts.push(`meta without component: ${onlyMeta.join(", ")}`);
    throw new Error(`kokonut slug mismatch — ${parts.join("; ")}. Re-run sync-kokonut.mjs`);
  }

  // Cross-check each entry against its .tsx source
  const errors = [];
  for (const entry of meta) {
    const file = join(communityDir, `${entry.slug}.tsx`);
    if (!existsSync(file)) {
      errors.push(`${entry.slug}: .tsx file missing`);
      continue;
    }
    const source = readFileSync(file, "utf8");

    const fileAuthor = source.match(/@author:\s*(.+)/)?.[1]?.trim() ?? "";
    if (fileAuthor && entry.author && fileAuthor !== entry.author) {
      errors.push(`${entry.slug}: author mismatch — file "${fileAuthor}" vs meta "${entry.author}"`);
    }

    const fileVersion = source.match(/@version:\s*(.+)/)?.[1]?.trim() ?? "";
    if (fileVersion && entry.version && fileVersion !== entry.version) {
      errors.push(`${entry.slug}: version mismatch — file "${fileVersion}" vs meta "${entry.version}"`);
    }

    const fileExport = source.match(/export default (?:function )?(\w+)/)?.[1] ?? "";
    if (fileExport && entry.exportName && fileExport !== entry.exportName) {
      errors.push(`${entry.slug}: exportName mismatch — file "${fileExport}" vs meta "${entry.exportName}"`);
    }

    // modified should be true exactly when the file imports from @heigin/ui
    const usesHeigin = source.includes('@heigin/ui');
    if (entry.modified !== usesHeigin) {
      errors.push(`${entry.slug}: modified=${entry.modified} but file ${usesHeigin ? "imports" : "does not import"} @heigin/ui`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`kokonut-meta validation errors:\n  ${errors.join("\n  ")}`);
  }

  return meta;
}

/** Canonical JSON string for kokonut-meta.json (matches sync-kokonut output). */
export function serializeKokonutMeta(meta) {
  return JSON.stringify(meta, null, 2) + "\n";
}
