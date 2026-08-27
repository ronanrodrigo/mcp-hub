import { HUB } from '../constants.js';
import { loadAllMCPs } from '../mcps-loader.js';
import { loadInstalledSkills, skillMcpMetadata } from '../skills-loader.js';

export async function discovery() {
  const mcps = [...(await loadAllMCPs()).filter((mcp) => mcp.name !== 'skills'), skillMcpMetadata(await loadInstalledSkills())];
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
