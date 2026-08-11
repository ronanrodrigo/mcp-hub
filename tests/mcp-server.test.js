import { describe, expect, it } from 'vitest';
import { createMcpServer, jsonSchemaToZodShape, listHubTools, toMcpToolName } from '../src/mcp-server.js';
import { createHub } from '../src/hub.js';

describe('MCP hub server', () => {
  it('initializes every metadata tool with the official SDK', async () => {
    await expect(createMcpServer()).resolves.toBeDefined();

    const tools = await listHubTools();
    expect(tools.length).toBeGreaterThan(1);
    for (const tool of tools) {
      const protocolName = toMcpToolName(tool.name);
      expect(protocolName).toMatch(/^[A-Za-z0-9_.-]+$/);
      expect(protocolName).not.toContain('/');
      expect(() => jsonSchemaToZodShape(tool.inputSchema)).not.toThrow();
    }
  });

  it('converts JSON Schema types, required fields and constraints to Zod', () => {
    const shape = jsonSchemaToZodShape({
      type: 'object',
      properties: {
        name: { type: 'string' },
        count: { type: 'integer', minimum: 1, maximum: 10 },
        enabled: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
        options: {
          type: 'object',
          properties: { mode: { type: 'string' } },
          required: ['mode'],
        },
      },
      required: ['name', 'count', 'enabled', 'tags', 'options'],
    });

    expect(shape.name.safeParse('hello-world').success).toBe(true);
    expect(shape.count.safeParse(5).success).toBe(true);
    expect(shape.count.safeParse(0).success).toBe(false);
    expect(shape.count.safeParse(11).success).toBe(false);
    expect(shape.count.safeParse(1.5).success).toBe(false);
    expect(shape.enabled.safeParse(true).success).toBe(true);
    expect(shape.tags.safeParse(['test']).success).toBe(true);
    expect(shape.options.safeParse({ mode: 'strict' }).success).toBe(true);
    expect(shape.options.safeParse({}).success).toBe(false);
  });

  it('sanitizes protocol names without changing logical names', async () => {
    const tools = await listHubTools();
    const childTool = tools.find((tool) => tool.name === 'hello-world/dia-fruta');

    expect(childTool).toBeDefined();
    expect(childTool.mcpName).toBe('hello-world.dia-fruta');
    expect(toMcpToolName('hello-world/dia-fruta')).toBe('hello-world.dia-fruta');
  });

  it('executes a namespaced child MCP tool', async () => {
    const result = await (await createHub()).callTool('hello-world/dia-fruta', {
      now: new Date('2026-08-09T15:00:00.000Z'),
      random: () => 0,
    });
    expect(result.fruit).toBe('banana');
  });
});
