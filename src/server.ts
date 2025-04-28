import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Create a new MCP server
function createServer() {
  const server = new McpServer({
    name: "Echo",
    version: "1.0.0"
  });

  server.resource(
    "echo",
    new ResourceTemplate("echo://{message}", { list: undefined }),
    async (uri, { message }) => ({
      contents: [{
        uri: uri.href,
        text: `Resource echo: ${message}`
      }]
    })
  );

  server.tool(
    "echo",
    { message: z.string() },
    async ({ message }) => ({
      content: [{ type: "text", text: `Tool echo: ${message}` }]
    })
  );

  server.prompt(
    "echo",
    { message: z.string() },
    ({ message }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please process this message: ${message}`
        }
      }]
    })
  );

  return server;
}

export { createServer };
