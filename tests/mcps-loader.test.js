import { describe, expect, it } from 'vitest';
import { getMCPByName, loadAllMCPs } from '../src/mcps-loader.js';

describe('MCP loader', () => {
  it('loads metadata from the current properties.json files', async () => {
    const mcps = await loadAllMCPs();
    expect(Array.isArray(mcps)).toBe(true);
    expect(mcps.map((mcp) => mcp.name)).toEqual(['hello-world', 'notes-search', 'skills']);
  });

  it('finds by name and returns undefined when absent', async () => {
    expect((await getMCPByName('hello-world')).version).toBe('1.0.0');
    expect((await getMCPByName('notes-search')).name).toBe('notes-search');
    expect((await getMCPByName('skills')).name).toBe('skills');
    expect(await getMCPByName('inexistente')).toBeUndefined();
  });
});
