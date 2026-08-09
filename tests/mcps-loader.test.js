import { describe, expect, it } from 'vitest';
import { getMCPByName, loadAllMCPs } from '../src/mcps-loader.js';

describe('MCP loader', () => {
  it('loads metadata from properties.json', async () => {
    const mcps = await loadAllMCPs();
    expect(Array.isArray(mcps)).toBe(true);
    expect(mcps).toHaveLength(1);
    expect(mcps[0].name).toBe('hello-world');
  });
  it('finds by name and returns undefined when absent', async () => {
    expect((await getMCPByName('hello-world')).version).toBe('1.0.0');
    expect(await getMCPByName('inexistente')).toBeUndefined();
  });
});
