import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../api');

export async function loadAllMCPs(directory = apiDirectory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const mcps = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(directory, entry.name, 'properties.json');
    try {
      const metadata = JSON.parse(await fs.readFile(file, 'utf8'));
      mcps.push(metadata);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return mcps.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMCPByName(name, directory = apiDirectory) {
  return (await loadAllMCPs(directory)).find((mcp) => mcp.name === name);
}
