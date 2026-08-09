import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createHelloWorldMcpServer() {
  const server = new McpServer({
    name: "hello-world",
    version: "1.0.0"
  });

  server.registerTool(
    "hello_world",
    {
      title: "Hello World",
      description: "Retorna uma mensagem Hello World.",
      outputSchema: {
        success: "boolean",
        message: "string"
      }
    },
    async () => {
      const output = {
        success: true,
        message: "Hello World"
      };

      return {
        content: [{ type: "text", text: output.message }],
        structuredContent: output
      };
    }
  );

  return server;
}
