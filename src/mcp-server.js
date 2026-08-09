import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { discovery, discoveryTool } from './tools/discovery.js';
import { diaFruta, diaFrutaTool } from './tools/dia-fruta.js';
import { callWorldMonitor, worldMonitorHandler } from './tools/world-monitor.js';
import { loadAllMCPs } from './mcps-loader.js';

const localToolHandlers = {
  'hello-world/dia-fruta': diaFruta,
  ...Object.fromEntries([
    'get_country_risk',
    'get_world_brief',
    'get_country_brief',
    'get_market_data',
    'get_chokepoint_status',
    'get_news_intelligence',
    'get_conflict_events',
    'get_natural_disasters',
    'get_prediction_markets',
    'get_forecast_predictions',
  ].map((name) => [`world-monitor/${name}`, worldMonitorHandler(name)])),
};

function registerJsonTool(server, tool, handler) {
  server.registerTool(tool.name, {
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema || {},
  }, async (args) => {
    const result = await handler(args || {});
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: result,
    };
  });
}

function metadataToolToDefinition(mcp, metadataTool) {
  const name = `${mcp.name}/${metadataTool.name}`;
  return {
    name,
    title: metadataTool.title || `${mcp.name}: ${metadataTool.name}`,
    description: metadataTool.description || `Execute ${metadataTool.name} from MCP ${mcp.name}`,
    inputSchema: metadataTool.inputSchema || {},
  };
}

export async function createMcpServer() {
  const server = new McpServer({ name: 'mcp-hub', version: '1.0.0' });
  registerJsonTool(server, discoveryTool, discovery);

  const mcps = await loadAllMCPs();
  for (const mcp of mcps) {
    for (const metadataTool of mcp.tools || []) {
      const tool = metadataToolToDefinition(mcp, metadataTool);
      const handler = localToolHandlers[tool.name];
      registerJsonTool(server, tool, handler || (async () => ({
        success: false,
        error: `Tool ${tool.name} is registered in properties.json but has no local adapter yet`,
      })));
    }
  }

  return server;
}

export async function listHubTools() {
  const mcps = await loadAllMCPs();
  return [
    discoveryTool,
    ...mcps.flatMap((mcp) => (mcp.tools || []).map((tool) => metadataToolToDefinition(mcp, tool))),
  ];
}

export { callWorldMonitor, diaFrutaTool };
