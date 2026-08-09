import { describe, expect, it } from 'vitest';
import { discovery, discoveryTool } from '../src/tools/discovery.js';

describe('discovery tool', () => {
  it('is registered as a named MCP tool definition', () => {
    expect(discoveryTool.name).toBe('discovery');
    expect(discoveryTool.description).toContain('Discover');
  });
  it('returns aggregated metadata', async () => {
    const result = await discovery();
    expect(result.success).toBe(true);
    expect(result.hub.status).toBe('running');
    expect(result.mcps[0].endpoints).toHaveLength(1);
  });
});
