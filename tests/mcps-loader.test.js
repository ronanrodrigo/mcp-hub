import { describe, expect, it } from 'vitest';
import { getMCPByName, loadAllMCPs } from '../src/mcps-loader.js';

describe('MCP loader', () => {
  it('loads metadata from all properties.json files', async () => {
    const mcps = await loadAllMCPs();
    expect(Array.isArray(mcps)).toBe(true);
    expect(mcps).toHaveLength(2);
    expect(mcps.map((mcp) => mcp.name)).toEqual(['hello-world', 'superpowers']);
  });

  it('finds by name and returns undefined when absent', async () => {
    expect((await getMCPByName('hello-world')).version).toBe('1.0.0');
    expect((await getMCPByName('superpowers')).name).toBe('superpowers');
    expect(await getMCPByName('inexistente')).toBeUndefined();
  });
});
