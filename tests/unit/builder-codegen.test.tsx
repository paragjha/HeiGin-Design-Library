import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { BLOCKS, codeFor, createNode, getBlock } from "../../apps/docs/src/builder/blocks";
import { generate } from "../../apps/docs/src/builder/codegen";
import { node, type BuilderDoc, type BuilderNode } from "../../apps/docs/src/builder/model";
import { TEMPLATES } from "../../apps/docs/src/builder/templates";

const root = resolve(import.meta.dirname, "../..");
const outDir = join(root, ".tmp/builder-codegen");

function Render({ n }: { n: BuilderNode }) {
  return <>{getBlock(n.type).render(n.props, n.children.map((c) => <Render key={c.id} n={c} />))}</>;
}

const placeable = BLOCKS.filter((b) => !b.rootOnly);
const docs: BuilderDoc[] = [
  ...TEMPLATES.map((t) => t.build()),
  // Every block on its own, as a single-component export
  ...placeable.map((b) => ({ mode: "component" as const, name: `Only${b.type[0]!.toUpperCase()}${b.type.slice(1)}`, root: node("fragment", {}, [createNode(b.type)]) })),
  // Every block twice on one page: exercises identifier de-duplication (two tables, two toolbars...)
  { mode: "page", name: "EverythingTwice", root: node("page", {}, [...placeable, ...placeable].map((b) => createNode(b.type))) },
];

describe("builder", () => {
  it("renders every template on the canvas without errors", () => {
    for (const t of TEMPLATES) {
      const { unmount, container } = render(<Render n={t.build().root} />);
      expect(container.innerHTML.length, t.id).toBeGreaterThan(50);
      unmount();
    }
  });

  it("marks files with state or handlers as client components", () => {
    const leads = generate(TEMPLATES.find((t) => t.id === "leads-page")!.build(), codeFor);
    expect(leads.client).toBe(true);
    expect(leads.code.startsWith('"use client";')).toBe(true);
    expect(leads.code).toContain("useState");
    const settings = generate(TEMPLATES.find((t) => t.id === "settings-section")!.build(), codeFor);
    expect(settings.client).toBe(false);
    expect(settings.code).not.toContain("use client");
  });

  it(
    "generates code that type-checks against @heigin/ui for every template and block",
    () => {
      rmSync(outDir, { recursive: true, force: true });
      mkdirSync(outDir, { recursive: true });
      for (const d of docs) writeFileSync(join(outDir, `${d.name}.tsx`), generate(d, codeFor).code);
      writeFileSync(join(outDir, "css.d.ts"), 'declare module "*.module.css" { const c: Record<string, string>; export default c; }\n');
      writeFileSync(
        join(outDir, "tsconfig.json"),
        JSON.stringify({
          extends: "../../tsconfig.base.json",
          compilerOptions: { noEmit: true, types: [], paths: { "@heigin/ui": [join(root, "packages/ui/src/index.ts")] }, noUnusedLocals: true },
          include: ["*.tsx", "css.d.ts", join(root, "packages/ui/src/env.d.ts")],
        }),
      );
      let output = "";
      try {
        execFileSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", outDir], { encoding: "utf8", stdio: "pipe" });
      } catch (e) {
        output = (e as { stdout?: string }).stdout ?? String(e);
      }
      expect(output, output).toBe("");
    },
    120_000,
  );
});
