import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const DEFAULT_URL = 'https://worldmonitor.app/mcp';
const REQUEST_TIMEOUT_MS = 30_000;

function getRemoteUrl() {
  const value = process.env.WORLD_MONITOR_MCP_URL || DEFAULT_URL;
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('World Monitor MCP URL must use HTTPS');
  return url;
}

function getHeaders() {
  const key = process.env.WORLD_MONITOR_API_KEY;
  return key ? { 'X-WorldMonitor-Key': key } : {};
}

export async function callWorldMonitor(toolName, args = {}) {
  const client = new Client({ name: 'mcp-hub-world-monitor', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(getRemoteUrl(), {
    requestInit: { headers: getHeaders(), signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  });

  try {
    await client.connect(transport);
    const result = await client.callTool({ name: toolName, arguments: args });
    if (!result || !Array.isArray(result.content)) throw new Error('World Monitor returned an invalid MCP response');
    return { success: true, result };
  } catch (error) {
    return { success: false, error: `World Monitor request failed: ${error.message}` };
  } finally {
    await client.close().catch(() => {});
  }
}

export function worldMonitorHandler(toolName) {
  return (args) => callWorldMonitor(toolName, args);
}
