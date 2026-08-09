import { describe, expect, it } from 'vitest';
import { createMcpServer, listHubTools } from '../src/mcp-server.js';
import { createHub } from '../src/hub.js';

describe('MCP hub server', () => {
  it('initializes with the official SDK and exposes discovery and validate', () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
    expect(listHubTools().map((tool) => tool.name)).toEqual(['discovery', 'validate']);
  });
  it('provides a future-proof tool dispatch boundary', async () => {
    const result = await createHub().callTool('discovery');
    expect(result.success).toBe(true);
  });
});
