import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { requireApiKey } from '../src/auth.js';
import { createMcpServer } from '../src/mcp-server.js';

function setCorsHeaders(response) {
  response.setHeader?.('Access-Control-Allow-Origin', '*');
  response.setHeader?.('Access-Control-Allow-Headers', 'Content-Type, x-api-key, mcp-session-id, Last-Event-ID');
  response.setHeader?.('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
}

export default async function handler(request, response) {
  setCorsHeaders(response);
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }
  if (!requireApiKey(request, response)) return;

  const server = await createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(request, response, request.body);
  } catch (error) {
    console.error('MCP transport error:', error);
    if (!response.headersSent) response.status(500).json({ success: false, error: 'MCP transport error' });
  } finally {
    await transport.close().catch(() => {});
    await server.close().catch(() => {});
  }
}
