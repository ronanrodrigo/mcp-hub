import { describe, expect, it } from "vitest";
import { getMCPByName, loadAllMCPs } from "../src/mcps-loader.js";

describe("MCP metadata loader", () => {
  it("returns an array", async () => {
    expect(await loadAllMCPs()).toEqual(expect.any(Array));
  });

  it("discovers hello-world from properties.json", async () => {
    const mcps = await loadAllMCPs();
    expect(mcps).toHaveLength(1);
    expect(mcps[0]).toMatchObject({ name: "hello-world", version: "1.0.0" });
  });

  it("finds an MCP by name", async () => {
    await expect(getMCPByName("hello-world")).resolves.toMatchObject({
      name: "hello-world",
      endpoints: expect.any(Array)
    });
  });

  it("returns undefined for an unknown MCP", async () => {
    await expect(getMCPByName("inexistente")).resolves.toBeUndefined();
  });

  it("loads endpoint metadata", async () => {
    const [mcp] = await loadAllMCPs();
    expect(mcp.endpoints[0]).toMatchObject({
      path: "/api/hello-world/hello-world",
      method: "GET",
      requiresAuth: true
    });
  });
});
