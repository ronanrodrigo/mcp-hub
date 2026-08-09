import { describe, expect, it, afterEach } from 'vitest';
import { loadAllMCPs } from '../src/mcps-loader.js';
import { listHubTools } from '../src/mcp-server.js';
import { planNatural } from '../src/tools/trvl.js';

describe('trvl integration', () => {
  const originalUrl = process.env.TRVL_MCP_URL;

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.TRVL_MCP_URL;
    else process.env.TRVL_MCP_URL = originalUrl;
  });

  it('loads metadata and publishes the namespaced planner tool', async () => {
    const mcps = await loadAllMCPs();
    const trvl = mcps.find((mcp) => mcp.name === 'trvl');
    expect(trvl).toBeDefined();
    expect(trvl.tools.map((tool) => tool.name)).toEqual(['plan_natural']);

    const tools = await listHubTools();
    expect(tools.map((tool) => tool.name)).toContain('trvl/plan_natural');
  });

  it('validates the query before contacting the remote MCP', async () => {
    process.env.TRVL_MCP_URL = 'https://example.invalid/mcp';
    await expect(planNatural({})).rejects.toThrow('query is required');
    await expect(planNatural({ query: '   ' })).rejects.toThrow('query is required');
  });

  it('requires a configured remote URL', async () => {
    delete process.env.TRVL_MCP_URL;
    await expect(planNatural({ query: 'Find a weekend trip from São Paulo' })).rejects.toThrow('TRVL_MCP_URL must be configured');
  });

  it('rejects unsupported remote URL schemes', async () => {
    process.env.TRVL_MCP_URL = 'stdio://trvl';
    await expect(planNatural({ query: 'Find a weekend trip from São Paulo' })).rejects.toThrow('TRVL_MCP_URL must use HTTP or HTTPS');
  });
});
