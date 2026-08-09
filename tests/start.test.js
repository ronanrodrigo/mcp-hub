import { describe, expect, it } from 'vitest';
import handler from '../api/start.js';
import { mockResponse } from './helpers.js';

describe('GET/POST /start', () => {
  it.each(['GET', 'POST'])('returns discovery for %s with valid key', async (method) => {
    const response = mockResponse();
    await handler({ method, headers: { 'x-api-key': 'fixed-secret-key' } }, response);
    expect(response.statusCode).toBe(200);
    expect(response.body.mcps[0].name).toBe('hello-world');
    expect(response.body.stats).toEqual({ totalMCPs: 1, totalEndpoints: 1 });
  });
  it.each([undefined, 'wrong'])('rejects invalid key %s', async (key) => {
    const response = mockResponse();
    await handler({ method: 'GET', headers: { 'x-api-key': key } }, response);
    expect(response.statusCode).toBe(401);
  });
});
