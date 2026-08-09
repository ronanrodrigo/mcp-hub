import { describe, expect, it } from 'vitest';
import { createMcpServer, jsonSchemaToZodShape, listHubTools, toMcpToolName } from '../src/mcp-server.js';
import { createHub } from '../src/hub.js';

describe('MCP hub server', () => {
  it('initializes with SDK-compatible schemas and names', async () => {
    const server = await createMcpServer();
    expect(server).toBeDefined();
    expect(toMcpToolName('superpowers/list_skills')).toBe('superpowers.list_skills');
    expect((await listHubTools()).map((tool) => tool.name)).toContain('superpowers/list_skills');
    expect(jsonSchemaToZodShape({
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    }).name.safeParse('brainstorming').success).toBe(true);
  });

  it('executes a namespaced child MCP tool', async () => {
    const result = await (await createHub()).callTool('hello-world/dia-fruta', {
      now: new Date('2026-08-09T15:00:00.000Z'),
      random: () => 0,
    });
    expect(result.fruit).toBe('banana');
  });
});
