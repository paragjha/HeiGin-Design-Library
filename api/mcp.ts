// Vercel serverless function at /api/mcp — HTTP MCP transport for @heigin/mcp.
//
// Stateless Streamable HTTP: every request creates a fresh server + transport
// pair, so there is no cross-request state and the function fits serverless.
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "../packages/mcp/src/server.js";
import type { LoadedData } from "../packages/mcp/src/data.js";

const data: LoadedData = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "_mcp-data.json"), "utf8"),
);

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = req.method === "POST" ? await readBody(req) : undefined;
    const server = createServer(data);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        }),
      );
    }
    console.error("MCP /api/mcp handler failed:", err);
  }
}
