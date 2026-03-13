import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'list_connectors',
    description:
      'List all available connectors in Merge Agent Handler. Connectors represent integrations with third-party services (e.g., Jira, Salesforce, Slack, HubSpot, GitHub). Use this to discover what services can be added to a tool pack.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'get_connector',
    description:
      'Get detailed information about a specific connector by its slug, including available tools and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description:
            'The connector slug (e.g., "jira", "salesforce", "slack").',
        },
      },
      required: ['slug'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
];

export const handlers: Record<string, ToolHandler> = {
  list_connectors: async () => {
    const connectors = await api.listConnectors();
    return JSON.stringify(connectors, null, 2);
  },

  get_connector: async (args) => {
    const result = await api.getConnector(args.slug as string);
    return JSON.stringify(result, null, 2);
  },
};
