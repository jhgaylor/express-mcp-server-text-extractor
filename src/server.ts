import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import pdfParse from "pdf-parse";
import * as cheerio from "cheerio";

// Create a new MCP server
function createServer() {
  const server = new McpServer({
    name: "TextExtractor",
    version: "1.0.0"
  });

  // Add text extraction tool
  server.tool(
    "extractText",
    { url: z.string().url() },
    async ({ url }) => {
      try {
        // Fetch the content from URL
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'TextExtractor/1.0'
          }
        });

        // Determine content type from response headers
        const contentType = response.headers['content-type'] || '';
        let extractedText = '';

        if (contentType.includes('application/pdf')) {
          // Extract text from PDF
          const pdfData = await pdfParse(response.data);
          extractedText = pdfData.text;
        } else if (contentType.includes('text/html')) {
          // Extract text from HTML
          const $ = cheerio.load(response.data.toString());
          // Remove script and style elements
          $('script, style').remove();
          extractedText = $('body').text().trim().replace(/\s+/g, ' ');
        } else if (contentType.includes('application/json')) {
          // Extract text from JSON
          const jsonData = JSON.parse(response.data.toString());
          extractedText = JSON.stringify(jsonData, null, 2);
        } else if (contentType.includes('text/plain')) {
          // Extract text from plain text
          extractedText = response.data.toString();
        } else {
          // Default: try to convert to string
          extractedText = `Unsupported content type: ${contentType}. Raw content:\n${response.data.toString().substring(0, 1000)}...`;
        }

        return {
          content: [{ 
            type: "text", 
            text: extractedText 
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ 
            type: "text", 
            text: `Error extracting text: ${errorMessage}` 
          }]
        };
      }
    }
  );

  return server;
}

export { createServer };
