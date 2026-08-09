import { loadAllMCPs } from "./mcps-loader.js";
import {
  HUB_DESCRIPTION,
  HUB_NAME,
  HUB_VERSION
} from "./constants.js";

export async function getHubMetadata() {
  const allMCPs = await loadAllMCPs();

  return {
    success: true,
    hub: {
      name: HUB_NAME,
      version: HUB_VERSION,
      description: HUB_DESCRIPTION,
      status: "running"
    },
    stats: {
      totalMCPs: allMCPs.length,
      totalEndpoints: allMCPs.reduce(
        (sum, mcp) => sum + (Array.isArray(mcp.endpoints) ? mcp.endpoints.length : 0),
        0
      )
    },
    mcps: allMCPs
  };
}
