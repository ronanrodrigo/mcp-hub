import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isValidApiKey } from "../../src/auth.js";
import { createHelloWorldMcpServer } from "../../src/mcp-server.js";

export default async function handler(req, res) {
  if (!isValidApiKey(req.headers["x-api-key"])) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const server = createHelloWorldMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  try {
    await server.connect(transport);
    return await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ error: "MCP request failed" });
    }

    return undefined;
  }
}
