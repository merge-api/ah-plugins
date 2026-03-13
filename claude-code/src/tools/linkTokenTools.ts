import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'create_link_token',
    description:
      'Generate a link token for a registered user to authenticate with a connector. The link token is used to initiate the OAuth flow for connecting a service (e.g., Jira, Salesforce). Present the resulting link to the user so they can complete authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        registered_user_id: {
          type: 'string',
          description: 'The ID of the registered user to generate a token for.',
        },
        connector: {
          type: 'string',
          description:
            'The connector slug to authenticate with (e.g., "jira", "salesforce").',
        },
      },
      required: ['registered_user_id', 'connector'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
];

export const handlers: Record<string, ToolHandler> = {
  create_link_token: async (args) => {
    const result = await api.createLinkToken(
      args.registered_user_id as string,
      args.connector as string,
    );
    return JSON.stringify(result, null, 2);
  },
};
