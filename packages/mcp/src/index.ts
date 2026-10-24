import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadData } from "./data.js";
import { listComponents } from "./tools/list-components.js";
import { getComponent } from "./tools/get-component.js";
import { getTokens } from "./tools/get-tokens.js";
import { search } from "./tools/search.js";
import { getSetupGuide } from "./tools/get-setup-guide.js";
import { copyComponentCommand } from "./tools/copy-command.js";

const data = loadData();

const server = new McpServer({
  name: "@heigin/mcp",
  version: "0.1.0",
});

server.tool(
  "list_components",
  "List all HeiGin UI components. Filter by category: ui (primitives), crm (CRM patterns), or all.",
  { category: z.enum(["ui", "crm", "all"]).optional().describe("Component category filter") },
  async (args) => ({
    content: [{ type: "text", text: listComponents(data, args) }],
  }),
);

server.tool(
  "get_component",
  "Get full details for a HeiGin UI component: description, props, types, imports, dependencies, and files.",
  { name: z.string().describe("Component slug, e.g. 'button', 'metric-card', 'dialog'") },
  async (args) => ({
    content: [{ type: "text", text: getComponent(data, args) }],
  }),
);

server.tool(
  "get_tokens",
  "Look up HeiGin design tokens (CSS custom properties). Filter by category or search by keyword.",
  {
    category: z
      .enum([
        "color", "font", "space", "radius", "shadow", "border",
        "focus", "control", "layout", "breakpoint", "z", "motion", "all",
      ])
      .optional()
      .describe("Token category"),
    search: z.string().optional().describe("Search keyword (matches name, description, or value)"),
  },
  async (args) => ({
    content: [{ type: "text", text: getTokens(data, args) }],
  }),
);

server.tool(
  "search",
  "Free-text search across HeiGin components, props, and tokens. Returns ranked results.",
  { query: z.string().describe("Search query") },
  async (args) => ({
    content: [{ type: "text", text: search(data, args) }],
  }),
);

server.tool(
  "get_setup_guide",
  "Get installation and setup instructions for @heigin/ui, tailored to your framework.",
  {
    framework: z
      .enum(["nextjs", "vite", "remix", "general"])
      .optional()
      .describe("Target framework"),
  },
  async (args) => ({
    content: [{ type: "text", text: getSetupGuide(args) }],
  }),
);

server.tool(
  "copy_component_command",
  "Get the CLI command to copy a HeiGin component (shadcn-style) into your project, with its full dependency tree.",
  {
    component: z.string().describe("Component slug, e.g. 'button'"),
    dest: z.string().optional().describe("Destination directory path"),
  },
  async (args) => ({
    content: [{ type: "text", text: copyComponentCommand(data, args) }],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
