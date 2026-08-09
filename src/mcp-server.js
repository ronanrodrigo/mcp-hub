import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { discovery, discoveryTool } from './tools/discovery.js';

export function createMcpServer() {
  const server = new McpServer({ name: 'mcp-hub', version: '1.0.0' });
  server.registerTool(discoveryTool.name, {
    title: discoveryTool.title,
    description: discoveryTool.description,
    inputSchema: discoveryTool.inputSchema,
  }, async () => {
    const result = await discovery();
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: result,
    };
  });
  return server;
}

export function listHubTools() {
  return [discoveryTool];
}
