import { describe, it, expect } from "vitest";
import { search } from "./search.js";
import type { LoadedData } from "../data.js";

/** Minimal data fixture with one HeiGin manifest and two community components. */
function fixture(): LoadedData {
  return {
    manifests: [
      {
        name: "agent-decision-tree",
        category: "crm" as const,
        entry: "components/crm/agent-decision-tree.tsx",
        description: "Interactive decision tree for CRM agent routing",
        exports: ["AgentDecisionTree"],
        types: [],
        client: true,
        files: [],
        styles: [],
        internalDependencies: [],
        npmDependencies: {},
        peerDependencies: {},
        install: [],
        copyCommand: "",
      },
    ],
    props: {
      "agent-decision-tree": {
        description: "Decision tree component",
        props: [
          { name: "nodes", type: "TreeNode[]", required: true, defaultValue: null, description: "Tree nodes" },
        ],
        extends: [],
      },
    },
    tokens: {
      color: {
        primary: { value: "#6366f1", evidence: "observed" as const, live: "#6366f1", description: "Primary brand color" },
      },
    },
    tokenCategories: ["color"],
    kokonut: [
      {
        slug: "ai-tool-calls",
        category: "ai",
        title: "AI Tool Calls",
        description: "Displays real-time tool call status with expandable parameters",
        api: "",
        author: "@kokonutui",
        version: "1.1.0",
        exportName: "AIToolCalls",
        dependencies: ["lucide-react"],
        registryDependencies: [],
        modified: true,
        docsUrl: "https://kokonutui.com/docs/ai/ai-tool-calls",
        registryUrl: "https://kokonutui.com/r/ai-tool-calls.json",
      },
      {
        slug: "bento-grid",
        category: "cards",
        title: "Widget Grid",
        description: "Responsive bento-style grid of cards",
        api: "",
        author: "@dorianbaffier",
        version: "3.0.0",
        exportName: "WidgetGrid",
        dependencies: [],
        registryDependencies: [],
        modified: false,
        docsUrl: "https://kokonutui.com/docs/cards/bento-grid",
        registryUrl: "https://kokonutui.com/r/bento-grid.json",
      },
    ],
  };
}

describe("search", () => {
  it("single-word query matches hyphenated slug", () => {
    const result = search(fixture(), { query: "decision" });
    expect(result).toContain("agent-decision-tree");
  });

  it("multi-word query 'decision tree' matches agent-decision-tree", () => {
    const result = search(fixture(), { query: "decision tree" });
    expect(result).toContain("agent-decision-tree");
    expect(result).not.toContain("No results");
  });

  it("multi-word query 'tool calls' matches ai-tool-calls (community)", () => {
    const result = search(fixture(), { query: "tool calls" });
    expect(result).toContain("ai-tool-calls");
  });

  it("PascalCase query 'ToolCalls' matches ai-tool-calls", () => {
    const result = search(fixture(), { query: "ToolCalls" });
    expect(result).toContain("ai-tool-calls");
  });

  it("camelCase export 'AgentDecisionTree' matches", () => {
    const result = search(fixture(), { query: "AgentDecisionTree" });
    expect(result).toContain("agent-decision-tree");
  });

  it("single-word still works for community", () => {
    const result = search(fixture(), { query: "bento" });
    expect(result).toContain("bento-grid");
  });

  it("token search works", () => {
    const result = search(fixture(), { query: "primary" });
    expect(result).toContain("--hg-color-primary");
  });

  it("empty query returns prompt", () => {
    const result = search(fixture(), { query: "" });
    expect(result).toBe("Please provide a search query.");
  });

  it("gibberish returns no results", () => {
    const result = search(fixture(), { query: "xyzzyplugh" });
    expect(result).toContain("No results");
  });

  it("multi-word query with no match returns no results", () => {
    const result = search(fixture(), { query: "quantum flux capacitor" });
    expect(result).toContain("No results");
  });
});
