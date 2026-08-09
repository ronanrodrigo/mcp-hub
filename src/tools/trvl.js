import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const REMOTE_URL_ENV = 'TRVL_MCP_URL';

function getRemoteUrl() {
  const value = process.env[REMOTE_URL_ENV];
  if (!value) {
    throw new Error(`${REMOTE_URL_ENV} must be configured to use the trvl adapter`);
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${REMOTE_URL_ENV} must be a valid URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${REMOTE_URL_ENV} must use HTTP or HTTPS`);
  }
  return url;
}

export async function travel(args = {}) {
  const query = typeof args.query === 'string' ? args.query.trim() : '';
  if (!query) throw new Error('query is required');

  const client = new Client({ name: 'mcp-hub-trvl-adapter', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(getRemoteUrl());
  try {
    await client.connect(transport);
    const result = await client.callTool({ name: 'travel', arguments: { query } });
    if (!result || !Array.isArray(result.content)) {
      throw new Error('trvl returned an invalid MCP response');
    }
    return result;
  } catch (error) {
    throw new Error(`trvl request failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await transport.close().catch(() => {});
    await client.close().catch(() => {});
  }
}

export const travelTool = {
  name: 'travel',
  title: 'Travel Search',
  description: 'Search and plan travel through the configured trvl MCP service.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Natural-language travel request.' },
    },
    required: ['query'],
  },
};
