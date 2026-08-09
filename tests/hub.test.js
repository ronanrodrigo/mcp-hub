import { describe, expect, it, beforeEach, afterEach } from "vitest";
import handler from "../api/index.js";
import { createResponse } from "./helpers.js";

const originalApiKey = process.env.API_KEY;

beforeEach(() => {
  delete process.env.API_KEY;
});

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.API_KEY;
  else process.env.API_KEY = originalApiKey;
});

const request = (apiKey) => ({ headers: apiKey === undefined ? {} : { "x-api-key": apiKey } });

describe("GET /", () => {
  it("returns hub metadata with a valid key", async () => {
    const res = createResponse();
    await handler(request("fixed-secret-key"), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hub.name).toBe("mcp-hub");
    expect(res.body.hub.status).toBe("running");
    expect(res.body.mcps).toHaveLength(1);
    expect(res.body.stats).toEqual({ totalMCPs: 1, totalEndpoints: 1 });
  });

  it.each([undefined, "wrong-key"])("rejects key %s", async (apiKey) => {
    const res = createResponse();
    await handler(request(apiKey), res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("includes the complete MCP metadata structure", async () => {
    const res = createResponse();
    await handler(request("fixed-secret-key"), res);
    const [mcp] = res.body.mcps;

    expect(mcp).toMatchObject({
      name: "hello-world",
      version: "1.0.0",
      author: "ronanrodrigo",
      tags: ["test", "demo"]
    });
    expect(mcp.endpoints).toHaveLength(1);
  });
});
