import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'search_tools',
    description:
      'Search for MCP tools by natural language intent. Instead of browsing all tools manually, describe what you want to do (e.g., "create a Jira ticket", "find Salesforce contacts") and this will return the most relevant tools. More efficient than list_tools for finding specific capabilities.',
    inputSchema: {
      type: 'object',
      properties: {
        tool_pack_id: {
          type: 'string',
          description: 'The tool pack ID to search within.',
        },
        registered_user_id: {
          type: 'string',
          description: 'The registered user ID.',
        },
        intent: {
          type: 'string',
          description:
            'Natural language description of what you want to do (e.g., "create a ticket in Jira").',
        },
        connector_slugs: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Optional list of connector slugs to limit the search to specific services.',
        },
        max_results: {
          type: 'number',
          minimum: 1,
          maximum: 50,
          description: 'Maximum number of results to return (1-50).',
        },
      },
      required: ['tool_pack_id', 'registered_user_id', 'intent'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
];

export const handlers: Record<string, ToolHandler> = {
  search_tools: async (args) => {
    const result = await api.searchTools(
      args.tool_pack_id as string,
      args.registered_user_id as string,
      args.intent as string,
      args.connector_slugs as string[] | undefined,
      args.max_results as number | undefined,
    );
    return JSON.stringify(result, null, 2);
  },
};
