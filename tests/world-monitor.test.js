import { describe, expect, it } from 'vitest';
import { loadAllMCPs } from '../src/mcps-loader.js';
import { listHubTools } from '../src/mcp-server.js';

describe('World Monitor integration', () => {
  it('loads metadata and publishes namespaced tools', async () => {
    const mcp = (await loadAllMCPs()).find(({ name }) => name === 'world-monitor');
    expect(mcp).toBeDefined();
    const names = (await listHubTools()).map(({ name }) => name);
    expect(names).toContain('world-monitor/get_country_risk');
    expect(names).toContain('world-monitor/get_forecast_predictions');
    expect(new Set(names).size).toBe(names.length);
  });
});
