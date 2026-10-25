import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadData } from "./data.js";
import { createServer } from "./server.js";

const server = createServer(loadData());

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
