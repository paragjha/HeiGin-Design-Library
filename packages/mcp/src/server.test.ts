import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SERVER_VERSION } from "./server.js";

// The version the MCP reports to clients must match the published package version.
// Importing package.json at runtime would break the NodeNext build (outside rootDir),
// so the two strings are kept in lockstep by this test instead.
describe("SERVER_VERSION", () => {
  it("matches package.json", () => {
    const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "../package.json"), "utf8")) as { version: string };
    expect(SERVER_VERSION).toBe(pkg.version);
  });
});
