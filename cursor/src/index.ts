#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import type { ToolDefinition, ToolHandler } from './types.js';

// Import all tool modules
import * as mcpTools from './tools/mcpTools.js';
import * as registeredUserTools from './tools/registeredUserTools.js';
import * as toolPackTools from './tools/toolPackTools.js';
import * as connectorTools from './tools/connectorTools.js';
import * as linkTokenTools from './tools/linkTokenTools.js';
import * as credentialTools from './tools/credentialTools.js';
import * as auditLogTools from './tools/auditLogTools.js';
import * as toolSearchTools from './tools/toolSearchTools.js';

// Collect all tool definitions and handlers
const allModules = [
  mcpTools,
  registeredUserTools,
  toolPackTools,
  connectorTools,
  linkTokenTools,
  credentialTools,
  auditLogTools,
  toolSearchTools,
];

const allTools: ToolDefinition[] = allModules.flatMap((m) => m.tools);
const allHandlers: Record<string, ToolHandler> = Object.assign(
  {},
  ...allModules.map((m) => m.handlers),
);

// Validate API key at startup
if (!process.env.MERGE_API_KEY) {
  console.error(
    'Error: MERGE_API_KEY environment variable is required. Set it in your Cursor settings or environment.',
  );
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'merge-agent-handler',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  };
});

// Handle tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const handler = allHandlers[name];
  if (!handler) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Unknown tool: ${name}. Use tools/list to see available tools.`,
        },
      ],
      isError: true,
    };
  }

  try {
    const result = await handler((args as Record<string, unknown>) ?? {});
    return {
      content: [
        {
          type: 'text' as const,
          text: result,
        },
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error executing ${name}: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
