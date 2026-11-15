import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LoadedData } from "./data.js";
import { listComponents } from "./tools/list-components.js";
import { getComponent } from "./tools/get-component.js";
import { getTokens } from "./tools/get-tokens.js";
import { search } from "./tools/search.js";
import { getSetupGuide } from "./tools/get-setup-guide.js";
import { copyComponentCommand } from "./tools/copy-command.js";

export const SERVER_VERSION = "0.1.3";

export function createServer(data: LoadedData): McpServer {
  const server = new McpServer({
    name: "@heigin/mcp",
    version: SERVER_VERSION,
  });

  server.tool(
    "list_components",
    "List all HeiGin UI components. Filter by category: ui (primitives), crm (CRM patterns), community (Kokonut UI), or all.",
    { category: z.enum(["ui", "crm", "community", "all"]).optional().describe("Component category filter") },
    async (args) => ({
      content: [{ type: "text", text: listComponents(data, args) }],
    }),
  );

  server.tool(
    "get_component",
    "Get full details for a HeiGin UI component or community component: description, props, types, imports, dependencies, and files.",
    { name: z.string().describe("Component slug, e.g. 'button', 'metric-card', 'dialog', 'ai-send'") },
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
    "Free-text search across HeiGin components, community components, props, and tokens. Returns ranked results.",
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
    "Get the CLI command to copy a HeiGin component (shadcn-style) or install a community component into your project.",
    {
      component: z.string().describe("Component slug, e.g. 'button'"),
      dest: z.string().optional().describe("Destination directory path"),
    },
    async (args) => ({
      content: [{ type: "text", text: copyComponentCommand(data, args) }],
    }),
  );

  return server;
}
