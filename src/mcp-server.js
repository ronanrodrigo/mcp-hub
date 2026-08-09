import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { discovery, discoveryTool } from './tools/discovery.js';
import { diaFruta, diaFrutaTool } from './tools/dia-fruta.js';

function registerJsonTool(server, tool, handler) {
  server.registerTool(tool.name, {
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }, async () => {
    const result = await handler();
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: result,
    };
  });
}

export function createMcpServer() {
  const server = new McpServer({ name: 'mcp-hub', version: '1.0.0' });
  registerJsonTool(server, discoveryTool, discovery);
  registerJsonTool(server, diaFrutaTool, diaFruta);
  return server;
}

export function listHubTools() {
  return [discoveryTool, diaFrutaTool];
}
