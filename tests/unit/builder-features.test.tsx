import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createNode, getBlock, validate } from "../../apps/docs/src/builder/blocks";
import { generate, generateRoute } from "../../apps/docs/src/builder/codegen";
import { importCode } from "../../apps/docs/src/builder/importer";
import { findNode, findParent, indentNode, node, outdentNode, unwrapNode, wrapNode, type BuilderDoc } from "../../apps/docs/src/builder/model";
import { TEMPLATES } from "../../apps/docs/src/builder/templates";

const root = resolve(import.meta.dirname, "../..");
const tsc = join(root, "node_modules/typescript/bin/tsc");
const withProps = (type: string, props: Record<string, string>) => {
  const n = createNode(type);
  return { ...n, props: { ...n.props, ...props } };
};

function typecheck(dir: string, files: Record<string, string>, paths: Record<string, string[]>) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [name, code] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), code);
  }
  writeFileSync(join(dir, "css.d.ts"), 'declare module "*.module.css" { const c: Record<string, string>; export default c; }\ndeclare module "*.css";\n');
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({
      extends: join(root, "tsconfig.base.json"),
      compilerOptions: { noEmit: true, types: [], baseUrl: ".", paths, noUnusedLocals: true },
      include: ["**/*.tsx", "css.d.ts", join(root, "packages/ui/src/env.d.ts")],
    }),
  );
  try {
    execFileSync(process.execPath, [tsc, "-p", dir], { encoding: "utf8", stdio: "pipe" });
    return "";
  } catch (e) {
    return (e as { stdout?: string }).stdout ?? String(e);
  }
}

const boundDoc: BuilderDoc = {
  mode: "page",
  name: "LeadsPage",
  root: node("page", {}, [
    withProps("table", { dataSource: "props" }),
    withProps("taskList", { dataSource: "props" }),
    createNode("form"),
    createNode("toastButton"),
  ]),
};

describe("data binding + export variants", () => {
  it("binding a table/task list to props declares typed component props", () => {
    const g = generate(boundDoc, getBlock);
    expect(g.props.map((p) => p.name)).toEqual(["leadsRows", "tasks", "onSubmit"]);
    expect(g.code).toContain("export type LeadRow =");
    expect(g.code).toContain("export interface LeadsPageProps {");
    expect(g.code).toContain("onSubmit?: (values: Record<string, string>) => void | Promise<void>;");
    expect(g.code).not.toContain("const leadsRows: LeadRow[] = ["); // no mock data when bound
  });

  it(
    "Next.js route files and copied-source imports type-check",
    () => {
      const g = generate(boundDoc, getBlock);
      const route = generateRoute(boundDoc, g, "leads");
      expect(route.files.map((f) => f.path)).toEqual(["app/leads/page.tsx", "app/leads/leads-page.tsx"]);
      expect(route.files[0]!.code).toContain("const leadsRows: LeadRow[] = [];");
      expect(route.files[0]!.code).toContain("<LeadsPage leadsRows={leadsRows} tasks={tasks} />");

      const sourceImports: Record<string, string> = {};
      for (const name of ["table", "status-badge", "money-value", "task-row", "button", "field", "input", "native-select", "toast", "page-header", "empty-state", "pagination", "filter-toolbar", "filter-chip"]) {
        const m = JSON.parse(readFileSync(join(root, `source/manifests/${name}.json`), "utf8")) as { entry: string; exports: string[]; types: string[] };
        for (const e of [...m.exports, ...m.types]) sourceImports[e] = `@/components/heigin/${m.entry.replace(/\.tsx$/, "")}`;
      }
      const src = generate(TEMPLATES.find((t) => t.id === "leads-page")!.build(), getBlock, { importStyle: "source", sourceImports });
      expect(src.code).toContain('from "@/components/heigin/components/ui/table"');
      expect(src.code).not.toContain('from "@heigin/ui"');

      const errors = typecheck(
        join(root, ".tmp/builder-export"),
        { "app/leads/page.tsx": route.files[0]!.code, "app/leads/leads-page.tsx": route.files[1]!.code, "copied/LeadsPage.tsx": src.code },
        {
          "@heigin/ui": [join(root, "packages/ui/src/index.ts")],
          "@/components/heigin/*": [join(root, "packages/ui/src/*")],
          next: [join(root, "node_modules/next/types/index.d.ts")],
        },
      );
      expect(errors, errors).toBe("");
    },
    120_000,
  );
});

describe("import", () => {
  it("restores builder-generated code exactly from the embedded state", async () => {
    for (const t of TEMPLATES) {
      const doc = t.build();
      const code = generate(doc, getBlock, { includeState: true }).code;
      const res = await importCode(code);
      expect(res.exact, t.id).toBe(true);
      expect(res.doc).toEqual(doc);
    }
  });

  it("parses hand-written @heigin/ui code best-effort", async () => {
    const res = await importCode(`
      import { Badge, Button, Card, CardHeader, Field, Input, PageHeader } from "@heigin/ui";
      import { Plus } from "lucide-react";
      export default function AccountsPage() {
        return (
          <div style={{ display: "grid", maxWidth: "var(--hg-layout-content-max)" }}>
            <PageHeader title="Accounts" description="All customers" actions={<Button leadingIcon={<Plus />}>New account</Button>} />
            <Card>
              <CardHeader title="Kaveri Textiles" />
              <Badge tone="success" dot>Active</Badge>
              <Field label="GSTIN" required><Input placeholder="27AAPFU0939F1ZV" /></Field>
              <MyCustomChart data={[1, 2, 3]} />
            </Card>
          </div>
        );
      }`);
    expect(res.exact).toBe(false);
    expect(res.doc.name).toBe("AccountsPage");
    expect(res.doc.mode).toBe("page");
    const [header, card] = res.doc.root.children;
    expect(header?.type).toBe("pageHeader");
    expect(header?.props.title).toBe("Accounts");
    expect(header?.children[0]?.props).toMatchObject({ label: "New account", icon: "Plus" });
    expect(card?.type).toBe("card");
    expect(card?.props.title).toBe("Kaveri Textiles");
    expect(card?.children.map((c) => c.type)).toEqual(["badge", "input"]);
    expect(card?.children[1]?.props).toMatchObject({ label: "GSTIN", required: true, placeholder: "27AAPFU0939F1ZV" });
    expect(res.warnings.join(" ")).toContain("MyCustomChart");
  });
});

describe("form validation", () => {
  it("applies required and pattern rules", () => {
    const rules = [
      { name: "name", label: "Name", required: true, validate: "none" as const },
      { name: "mobile", label: "Mobile", required: true, validate: "phone-in" as const },
      { name: "gstin", label: "GSTIN", required: false, validate: "gstin" as const },
    ];
    expect(validate(rules, { name: "", mobile: "12345", gstin: "" })).toEqual({ name: "Enter name", mobile: "Enter a 10-digit Indian mobile number" });
    expect(validate(rules, { name: "Asha", mobile: "9876543210", gstin: "27AAPFU0939F1ZV" })).toEqual({});
    expect(validate(rules, { name: "Asha", mobile: "9876543210", gstin: "bad" })).toEqual({ gstin: "Enter a valid 15-character GSTIN" });
  });
});

describe("structure operations", () => {
  const tree = () => {
    const a = node("text", { text: "a" });
    const card = node("card", {}, [node("text", { text: "x" })]);
    const b = node("text", { text: "b" });
    return { a, card, b, root: node("page", {}, [a, card, b]) };
  };
  const accepts = () => true;
  it("wraps and unwraps", () => {
    const { root, a } = tree();
    const w = node("stack");
    const wrapped = wrapNode(root, a.id, w);
    expect(findParent(wrapped, a.id)?.parent.id).toBe(w.id);
    expect(unwrapNode(wrapped, w.id).children.map((c) => c.id)).toEqual(root.children.map((c) => c.id));
  });
  it("indents into the previous container and outdents back", () => {
    const { root, b, card } = tree();
    const indented = indentNode(root, b.id, accepts);
    expect(findParent(indented, b.id)?.parent.id).toBe(card.id);
    const out = outdentNode(indented, b.id, accepts);
    expect(findParent(out, b.id)?.parent.id).toBe(root.id);
    expect(findParent(out, b.id)?.index).toBe(2);
    // the first child cannot indent; children of the root cannot outdent
    expect(indentNode(root, root.children[0]!.id, accepts)).toBe(root);
    expect(outdentNode(root, b.id, accepts)).toBe(root);
    expect(findNode(root, b.id)).toBeTruthy();
  });
});

describe("navigation sections and icons", () => {
  it("groups links under their section heading and keeps 3-column rows working", () => {
    const nav = withProps("sidebar", {
      nav: "Today | /today | CalendarCheck\nLeads | /leads | Users | Sales\nPipeline | /pipeline | Layers |\nSettings | /settings | Settings | Workspace",
    });
    const g = generate({ mode: "component", name: "AppSidebar", root: node("fragment", {}, [nav]) }, getBlock);
    expect(g.code).toContain('label: "Sales"');
    expect(g.code).toContain('label: "Workspace"');
    expect(g.code).toContain('{ items: [');
    expect(g.code).toContain('{ label: "Today", href: "/today", icon: <CalendarCheck strokeWidth={1.6} /> }');
    // Pipeline has a blank section, so it stays in the Sales group.
    expect(g.code.indexOf('label: "Pipeline"')).toBeGreaterThan(g.code.indexOf('label: "Sales"'));
    expect(g.code.indexOf('label: "Pipeline"')).toBeLessThan(g.code.indexOf('label: "Workspace"'));
    expect(g.code).toContain("icon: <Users strokeWidth={1.6} />");
    expect(g.imports.icons).toEqual(expect.arrayContaining(["CalendarCheck", "Users", "Layers"]));
  });

  it("the sidebar template compiles to a standalone component", () => {
    const doc = TEMPLATES.find((t) => t.id === "sidebar-only")!.build();
    const g = generate(doc, getBlock);
    expect(g.code).toContain("export default function AppSidebar()");
    expect(g.code).toContain("<SidebarNav");
  });
});
