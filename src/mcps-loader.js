import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const apiDirectory = fileURLToPath(new URL("../api", import.meta.url));

export async function loadAllMCPs() {
  const entries = await readdir(apiDirectory, { withFileTypes: true });
  const mcps = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const propertiesPath = join(apiDirectory, entry.name, "properties.json");

    try {
      const propertiesFile = await readFile(propertiesPath, "utf8");
      mcps.push(JSON.parse(propertiesFile));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return mcps.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMCPByName(name) {
  const mcps = await loadAllMCPs();
  return mcps.find((mcp) => mcp.name === name);
}
