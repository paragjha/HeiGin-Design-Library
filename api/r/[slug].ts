// Vercel serverless function behind /r/<slug>.json for items that are not
// served statically. See:
//   - scripts/build-registry.mjs, which decides where each item is written
//   - vercel.json, which routes /r/<slug>.json here when no static file exists
//
// Access model:
//   - access: "public" items are static files in apps/docs/public/r/ and never
//     reach this function in production. They are handled here only so a
//     direct /api/r/<slug> request still answers.
//   - access: "gated" items have no static file. Without a verified license
//     this returns 402 and the stub shell (file bodies are a "license
//     required" notice). With one it merges the real bodies from
//     .generated/registry/_private/. Both are Cache-Control: private, no-store.
//
// verifyLicense() has no license store behind it yet, so today every gated
// request gets the 402. Nothing here can hand out paid source until a real
// verifier is wired in.

import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const bases = [process.cwd(), join(here, "..", ".."), join(here, "..", "..", "..")];
const under = (...parts: string[]) => bases.map((base) => join(base, ...parts));

const gatedRoots = under(".generated", "registry", "_gated");
const privateRoots = under(".generated", "registry", "_private");
const publicRoots = [...under("apps", "docs", "dist", "r"), ...under("apps", "docs", "public", "r")];

function findFile(roots: string[], name: string): string | null {
  for (const root of roots) {
    const p = join(root, name);
    if (existsSync(p)) return p;
  }
  return null;
}

async function verifyLicense(_token: string): Promise<{ slugs: string[] } | null> {
  // No license store exists yet. Returning null keeps every gated item locked.
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
  const raw = url.searchParams.get("slug") ?? url.pathname.split("/").pop() ?? "";
  const slug = raw.replace(/\.json$/, "");
  if (!/^[a-z0-9-]+$/.test(slug)) return send(res, 400, { error: "bad slug" }, "public");

  const gatedPath = findFile(gatedRoots, `${slug}.json`);
  if (!gatedPath) {
    const publicPath = findFile(publicRoots, `${slug}.json`);
    if (!publicPath) return send(res, 404, { error: `unknown item: ${slug}` }, "public");
    return send(res, 200, readFileSync(publicPath, "utf8"), "public");
  }

  const shell = readFileSync(gatedPath, "utf8");
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const verdict = token ? await verifyLicense(token) : null;
  const allowed = !!verdict && (verdict.slugs.includes(slug) || verdict.slugs.includes("*"));
  if (!allowed) {
    res.setHeader("www-authenticate", 'Bearer realm="HeiGin", error="license_required"');
    return send(res, 402, shell, "private");
  }

  const privatePath = findFile(privateRoots, `${slug}.json`);
  if (!privatePath) return send(res, 500, { error: "private body missing" }, "private");
  const privateBody = JSON.parse(readFileSync(privatePath, "utf8")) as { files: { path: string; content: string }[] };
  const merged = JSON.parse(shell) as { files: { path: string; content: string }[] };
  merged.files = merged.files.map((f) => {
    const real = privateBody.files.find((pf) => pf.path === f.path);
    return real ? { ...f, content: real.content } : f;
  });
  return send(res, 200, merged, "private");
}
