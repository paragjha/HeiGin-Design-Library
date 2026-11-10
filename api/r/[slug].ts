// Vercel serverless function at /r/<slug>.json — serves shadcn-compatible
// registry items built by scripts/build-registry.mjs. See:
//   - vercel.json buildCommand runs the generator before the docs build
//   - scripts/lib/registry-mapping.mjs for the item schema
//
// Entitlement model (plan, not yet active):
//   - access: "public" items — 200 + full body, long cache.
//   - access: "gated"  items — public body is a license-required stub; real
//     body lives in .generated/registry/_private/<slug>.json and is only
//     returned when Authorization: Bearer <token> verifies against the
//     license store (packages/registry-auth, task #16). Response is
//     Cache-Control: private, no-store so the CDN can't leak it.
//
// Today nothing is gated (source/licenses.json is all free), so the gated
// branch is dead code until the Pro tier ships. It's wired now so flipping
// a license tier to "pro" doesn't require touching this file.

import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// This function only runs for gated items — free items are served as plain
// static files from apps/docs/public/r/. The function reads the public stub
// from the static output (apps/docs/dist/r/) and the real body from the
// private .generated/registry/_private/ tree that only this process can see.
const publicRoots = [
  join(here, "..", "..", "apps", "docs", "dist", "r"),
  join(here, "..", "..", "..", "apps", "docs", "dist", "r"),
  join(here, "..", "..", "apps", "docs", "public", "r"),
  join(here, "..", "..", "..", "apps", "docs", "public", "r"),
];
const privateRoots = [
  join(here, "..", "..", ".generated", "registry", "_private"),
  join(here, "..", "..", "..", ".generated", "registry", "_private"),
];

function findIn(roots: string[], sub = ""): string | null {
  for (const root of roots) {
    const p = sub ? join(root, sub) : root;
    if (existsSync(p)) return p;
  }
  return null;
}

async function verifyLicense(_token: string): Promise<{ slugs: string[]; tier: "pro" | "team" } | null> {
  // TODO (task #16): delegate to packages/registry-auth. Until that ships,
  // nothing is gated so this path never runs.
  return null;
}

function send(res: ServerResponse, status: number, body: unknown, cache: "public" | "private") {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  if (cache === "public") {
    res.setHeader("cache-control", "public, max-age=60, s-maxage=600, stale-while-revalidate=86400");
  } else {
    res.setHeader("cache-control", "private, no-store");
  }
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://x");
  // Pull the slug from either ?slug=… (the rewrite we configure in vercel.json
  // passes this) or the last path segment (direct /api/r/<slug>.json hits).
  const raw =
    url.searchParams.get("slug") ??
    url.pathname.split("/").pop() ??
    "";
  const slug = raw.replace(/\.json$/, "");
  if (!/^[a-z0-9-]+$/.test(slug)) return send(res, 400, { error: "bad slug" }, "public");

  const publicRoot = findIn(publicRoots);
  if (!publicRoot) return send(res, 500, { error: "registry not built" }, "public");

  const publicPath = join(publicRoot, `${slug}.json`);
  if (!existsSync(publicPath)) return send(res, 404, { error: `unknown item: ${slug}` }, "public");

  const publicBody = readFileSync(publicPath, "utf8");
  const publicItem = JSON.parse(publicBody) as { access?: "public" | "gated" };

  // Public items: just return the generated body, warm cache.
  if (publicItem.access !== "gated") {
    return send(res, 200, publicBody, "public");
  }

  // Gated: need a verified bearer.
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const verdict = token ? await verifyLicense(token) : null;
  const allowed = !!verdict && (verdict.slugs.includes(slug) || verdict.slugs.includes("*"));
  if (!allowed) {
    res.statusCode = 402;
    res.setHeader("www-authenticate", 'Bearer realm="HeiGin", error="license_required"');
    return send(res, 402, publicBody, "private");
  }

  // Serve the real body — merge the private files into the public shell so
  // schema stays identical for the CLI.
  const privateRoot = findIn(privateRoots);
  const privatePath = privateRoot ? join(privateRoot, `${slug}.json`) : null;
  if (!privatePath || !existsSync(privatePath)) return send(res, 500, { error: "private body missing" }, "private");
  const privateBody = JSON.parse(readFileSync(privatePath, "utf8")) as { files: { path: string; content: string }[] };
  const merged = JSON.parse(publicBody);
  merged.files = merged.files.map((f: { path: string; content: string }) => {
    const real = privateBody.files.find((pf) => pf.path === f.path);
    return real ? { ...f, content: real.content } : f;
  });
  return send(res, 200, merged, "private");
}
