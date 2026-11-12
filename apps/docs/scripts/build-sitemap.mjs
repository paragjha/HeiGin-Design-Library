#!/usr/bin/env node
/**
 * Writes apps/docs/public/sitemap.xml from source/manifests + source/categories.json
 * + the known docs & marketing routes. Runs at build time via the Vercel buildCommand chain.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..", "..");
const manifestDir = join(repoRoot, "source/manifests");
const categoriesPath = join(repoRoot, "source/categories.json");
const templateDir = join(repoRoot, "source/templates");
const SITE = "https://ui.heigin.com";

const STATIC_ROUTES = [
  "/",
  "/components",
  "/patterns",
  "/blocks",
  "/templates",
  "/pricing",
  "/docs",
  "/docs/getting-started",
  "/docs/tokens",
  "/docs/tokens/colors",
  "/docs/tokens/typography",
  "/docs/tokens/spacing",
  "/docs/accessibility",
  "/docs/nextjs",
  "/docs/copy-source",
  "/docs/mcp",
  "/docs/changelog",
];

function manifestSlugs() {
  return readdirSync(manifestDir)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .map((f) => JSON.parse(readFileSync(join(manifestDir, f), "utf8")))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function categoryIds() {
  if (!existsSync(categoriesPath)) return [];
  const taxonomy = JSON.parse(readFileSync(categoriesPath, "utf8"));
  return (taxonomy.groups ?? []).flatMap((g) => (g.categories ?? []).map((c) => c.id));
}

function url(path, priority = "0.6") {
  return `  <url>\n    <loc>${SITE}${path}</loc>\n    <priority>${priority}</priority>\n    <changefreq>weekly</changefreq>\n  </url>`;
}

function main() {
  const manifests = manifestSlugs();
  const categories = categoryIds();
  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  parts.push(url("/", "1.0"));
  for (const r of STATIC_ROUTES.filter((p) => p !== "/")) parts.push(url(r, "0.8"));
  for (const catId of categories) {
    parts.push(url(`/components/${catId}`, "0.75"));
  }
  for (const m of manifests) {
    const base = m.category === "crm" ? "/patterns" : "/components";
    parts.push(url(`${base}/${m.name}`, "0.7"));
  }
  const templateSlugs = existsSync(templateDir)
    ? readdirSync(templateDir)
        .filter((f) => f.endsWith(".json"))
        .flatMap((f) => JSON.parse(readFileSync(join(templateDir, f), "utf8")).items.map((i) => i.name))
    : [];
  for (const slug of templateSlugs) parts.push(url(`/templates/${slug}`, "0.7"));
  parts.push("</urlset>");
  const sitemap = parts.join("\n") + "\n";
  const outPath = join(repoRoot, "apps/docs/public/sitemap.xml");
  writeFileSync(outPath, sitemap);
  console.log(
    `build-sitemap: wrote ${outPath} (${STATIC_ROUTES.length} static + ${categories.length} categories + ${manifests.length} items + ${templateSlugs.length} templates)`,
  );
}

main();
