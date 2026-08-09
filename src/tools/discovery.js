import { HUB } from '../constants.js';
import { loadAllMCPs } from '../mcps-loader.js';

export async function discovery() {
  const mcps = await loadAllMCPs();
  return {
    success: true,
    hub: { ...HUB, status: 'running' },
    stats: {
      totalMCPs: mcps.length,
      totalEndpoints: mcps.reduce((total, mcp) => total + (mcp.endpoints?.length || 0), 0),
    },
    mcps,
  };
}

export const discoveryTool = {
  name: 'discovery',
  title: 'MCP Discovery',
  description: 'Discover all available MCPs in the hub and their metadata',
  inputSchema: {},
};
