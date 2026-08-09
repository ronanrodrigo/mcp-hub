import { discovery } from './tools/discovery.js';
import { createMcpServer } from './mcp-server.js';

export function createHub() {
  return {
    server: createMcpServer(),
    async callTool(name, args = {}) {
      if (name !== 'discovery') throw new Error(`Unknown tool: ${name}`);
      return discovery(args);
    },
  };
}
