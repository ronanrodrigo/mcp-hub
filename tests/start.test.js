import { describe, expect, it } from 'vitest';
import handler from '../api/start.js';

describe('GET/POST /start', () => {
  it.each(['GET', 'POST'])('returns discovery for %s with valid key', async (method) => {
    const response = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(value) { this.body = value; return this; },
    };
    await handler({ method, headers: { 'x-api-key': 'fixed-secret-key' } }, response);
    expect(response.statusCode).toBe(200);
    expect(response.body.mcps.map((mcp) => mcp.name)).toEqual(['hello-world', 'notes-search', 'skills']);
    expect(response.body.stats).toEqual({ totalMCPs: 3, totalEndpoints: 1 });
  });

  it.each([undefined, 'wrong'])('rejects invalid key %s', async (key) => {
    const response = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(value) { this.body = value; return this; },
    };
    await handler({ method: 'GET', headers: { 'x-api-key': key } }, response);
    expect(response.statusCode).toBe(401);
  });
});
