import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join, resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import handler from "../../api/r/[slug]";

const root = resolve(import.meta.dirname, "../..");
const publicDir = join(root, "apps/docs/public/r");

interface Reply {
  status: number;
  headers: Record<string, string>;
  body: string;
}

async function request(path: string, headers: Record<string, string> = {}): Promise<Reply> {
  const reply: Reply = { status: 0, headers: {}, body: "" };
  const res = {
    set statusCode(code: number) {
      reply.status = code;
    },
    setHeader(name: string, value: string) {
      reply.headers[name.toLowerCase()] = value;
    },
    end(body: string) {
      reply.body = body;
    },
  } as unknown as ServerResponse;
  await handler({ url: path, headers } as unknown as IncomingMessage, res);
  return reply;
}

// A string that only exists in the paid hero source, never in a stub.
const PAID_MARKER = "SCENE_MS";

describe("registry gating", () => {
  beforeAll(() => {
    execFileSync(process.execPath, ["scripts/build-registry.mjs"], { cwd: root });
  });

  it("writes no gated item, and no paid source, to the static folder", () => {
    const index = JSON.parse(readFileSync(join(publicDir, "index.json"), "utf8")) as {
      items: { name: string; access: string }[];
    };
    const gated = index.items.filter((i) => i.access === "gated");
    expect(gated.length).toBeGreaterThan(0);
    for (const item of gated) expect(existsSync(join(publicDir, `${item.name}.json`))).toBe(false);
    for (const file of readdirSync(publicDir)) {
      expect(readFileSync(join(publicDir, file), "utf8")).not.toContain(PAID_MARKER);
    }
  });

  it("answers a gated item with 402 and a stub when there is no license", async () => {
    const reply = await request("/api/r/landing-hero.json");
    expect(reply.status).toBe(402);
    expect(reply.headers["cache-control"]).toBe("private, no-store");
    expect(reply.headers["www-authenticate"]).toContain("license_required");
    expect(reply.body).not.toContain(PAID_MARKER);
    const item = JSON.parse(reply.body) as { access: string; files: { content: string }[] };
    expect(item.access).toBe("gated");
    for (const file of item.files) expect(file.content).toContain("license required");
  });

  it("does not unlock a gated item for an unverified bearer token", async () => {
    const reply = await request("/api/r/landing-page.json", { authorization: "Bearer not-a-real-license" });
    expect(reply.status).toBe(402);
    expect(reply.body).not.toContain("LandingPage");
  });

  it("keeps every template item gated, the shared core included", async () => {
    const index = JSON.parse(readFileSync(join(publicDir, "index.json"), "utf8")) as {
      items: { name: string; category: string; access: string }[];
    };
    const templateItems = index.items.filter((i) => i.category === "template");
    expect(templateItems.length).toBeGreaterThan(0);
    for (const item of templateItems) {
      expect(item.access).toBe("gated");
      expect((await request(`/api/r/${item.name}.json`)).status).toBe(402);
    }
  });

  it("serves a free item in full", async () => {
    const reply = await request("/api/r/button.json");
    expect(reply.status).toBe(200);
    const item = JSON.parse(reply.body) as { access: string; files: { path: string; content: string }[] };
    expect(item.access).toBe("public");
    expect(item.files.find((f) => f.path === "components/ui/button.tsx")?.content).toContain("Button");
  });

  it("rejects unknown and malformed slugs", async () => {
    expect((await request("/api/r/does-not-exist.json")).status).toBe(404);
    expect((await request("/api/r/..%2Fsecrets")).status).toBe(400);
  });
});
