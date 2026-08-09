import { describe, expect, it } from 'vitest';
import { createMcpServer, listHubTools } from '../src/mcp-server.js';
import { createHub } from '../src/hub.js';

describe('MCP hub server', () => {
  it('initializes with the official SDK and exposes namespaced tools', async () => {
    const server = await createMcpServer();
    expect(server).toBeDefined();
    expect((await listHubTools()).map((tool) => tool.name)).toEqual(['discovery', 'hello-world/dia-fruta']);
  });

  it('executes a namespaced child MCP tool', async () => {
    const result = await (await createHub()).callTool('hello-world/dia-fruta', {
      now: new Date('2026-08-09T15:00:00.000Z'),
      random: () => 0,
    });
    expect(result.fruit).toBe('banana');
  });
});
