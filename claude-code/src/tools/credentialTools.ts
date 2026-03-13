import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'delete_credential',
    description:
      'Delete a credential for a specific connector and registered user. This disconnects the user from that service. They will need to re-authenticate to use that connector again. Always confirm with the user before deleting.',
    inputSchema: {
      type: 'object',
      properties: {
        registered_user_id: {
          type: 'string',
          description: 'The registered user ID.',
        },
        connector_slug: {
          type: 'string',
          description:
            'The connector slug to delete credentials for (e.g., "jira").',
        },
      },
      required: ['registered_user_id', 'connector_slug'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
  },
];

export const handlers: Record<string, ToolHandler> = {
  delete_credential: async (args) => {
    await api.deleteCredential(
      args.registered_user_id as string,
      args.connector_slug as string,
    );
    return `Credential for connector "${args.connector_slug}" has been deleted for user ${args.registered_user_id}.`;
  },
};
