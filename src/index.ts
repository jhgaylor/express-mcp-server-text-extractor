import express from 'express';
import { statelessHandler } from 'express-mcp-handler';
import { createServer } from './server';

// Configure the stateless handler
const handler = statelessHandler(createServer);

// Create Express app
const app = express();
app.use(express.json());

// Mount the handler (stateless only needs POST)
app.post('/mcp', handler);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Stateless MCP server running on port ${PORT}`);
}); 