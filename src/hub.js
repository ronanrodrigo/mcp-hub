import { discovery } from './tools/discovery.js';
import { diaFruta } from './tools/dia-fruta.js';
import { callWorldMonitor } from './tools/world-monitor.js';
import { createMcpServer, listHubTools } from './mcp-server.js';

const toolHandlers = {
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
  ].map((name) => [`world-monitor/${name}`, (args) => callWorldMonitor(name, args)])),
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
        return {
          success: false,
          error: `Tool ${name} is registered but has no local adapter yet`,
        };
      }
      return handler(args);
    },
  };
}
