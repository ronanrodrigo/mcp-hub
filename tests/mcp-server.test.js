import { describe, expect, it } from "vitest";
import { createHelloWorldMcpServer } from "../src/mcp-server.js";

describe("Hello World MCP server", () => {
  it("creates an MCP server with the hello_world tool", () => {
    const server = createHelloWorldMcpServer();

    expect(server).toBeDefined();
    expect(server.serverInfo).toMatchObject({
      name: "hello-world",
      version: "1.0.0"
    });
  });
});
