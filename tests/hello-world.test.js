import { describe, expect, it } from 'vitest';
import handler from '../api/hello-world/hello-world.js';
import { mockResponse } from './helpers.js';

describe('hello-world endpoint', () => {
  it('returns Hello World with valid key', () => {
    const response = mockResponse();
    handler({ method: 'GET', headers: { 'x-api-key': 'fixed-secret-key' } }, response);
    expect(response.body).toEqual({ success: true, message: 'Hello World' });
  });
  it('rejects missing key', () => {
    const response = mockResponse();
    handler({ method: 'GET', headers: {} }, response);
    expect(response.statusCode).toBe(401);
  });
});
