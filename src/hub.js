import { discovery } from './tools/discovery.js';
import { diaFruta } from './tools/dia-fruta.js';
import { createMcpServer, listHubTools } from './mcp-server.js';

const toolHandlers = {
  'hello-world/dia-fruta': diaFruta,
};

export async function createHub() {
  return {
    server: await createMcpServer(),
    async callTool(name, args = {}) {
      if (name === 'discovery') return discovery(args);
      const handler = toolHandlers[name];
      if (!handler) {
        const knownTools = (await listHubTools()).map((tool) => tool.name);
        if (!knownTools.includes(name)) throw new Error(`Unknown tool: ${name}`);
        throw new Error(`Missing local adapter for ${name}`);
      }
      return handler(args);
    },
  };
}
