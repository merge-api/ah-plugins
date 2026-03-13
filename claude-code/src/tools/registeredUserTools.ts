import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'create_registered_user',
    description:
      'Create a new registered user in Merge Agent Handler. A registered user represents an end-user identity that can authenticate with connectors and use tools. You must create a registered user before they can use any tools.',
    inputSchema: {
      type: 'object',
      properties: {
        origin_user_id: {
          type: 'string',
          description:
            'A unique identifier for this user in your system (e.g., email, UUID).',
        },
        origin_user_name: {
          type: 'string',
          description: 'Display name for the user.',
        },
        user_type: {
          type: 'string',
          enum: ['HUMAN', 'SYSTEM'],
          description:
            'Type of user. HUMAN for real users, SYSTEM for automated agents. Defaults to HUMAN.',
        },
        shared_credential_group: {
          type: 'object',
          description:
            'Optional group for sharing credentials across users in the same organization.',
          properties: {
            origin_company_id: {
              type: 'string',
              description: 'Company identifier for credential sharing.',
            },
            origin_company_name: {
              type: 'string',
              description: 'Company display name.',
            },
            custom_groupings: {
              type: 'object',
              description: 'Additional custom grouping key-value pairs.',
              additionalProperties: { type: 'string' },
            },
          },
        },
      },
      required: ['origin_user_id', 'origin_user_name'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'get_registered_user',
    description:
      'Get details of a specific registered user by ID, including their authenticated connectors.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The registered user ID.',
        },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'update_registered_user',
    description:
      'Update an existing registered user. You can change their display name, user type, or shared credential group.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The registered user ID to update.',
        },
        origin_user_name: {
          type: 'string',
          description: 'New display name.',
        },
        user_type: {
          type: 'string',
          enum: ['HUMAN', 'SYSTEM'],
          description: 'New user type.',
        },
        shared_credential_group: {
          type: 'object',
          description: 'Updated shared credential group configuration.',
          properties: {
            origin_company_id: { type: 'string' },
            origin_company_name: { type: 'string' },
            custom_groupings: {
              type: 'object',
              additionalProperties: { type: 'string' },
            },
          },
        },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'delete_registered_user',
    description:
      'Delete a registered user. This is permanent and will remove all their credentials and access. Always confirm with the user before deleting.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The registered user ID to delete.',
        },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
];

export const handlers: Record<string, ToolHandler> = {
  create_registered_user: async (args) => {
    const originUserId = args.origin_user_id as string;

    // Check if user already exists
    const existingUsers = await api.listRegisteredUsers();
    const existing = existingUsers.find((u) => u.origin_user_id === originUserId);
    if (existing) {
      return JSON.stringify(
        { ...existing, _note: 'User already exists, returning existing user.' },
        null,
        2,
      );
    }

    const result = await api.createRegisteredUser({
      origin_user_id: originUserId,
      origin_user_name: args.origin_user_name as string,
      user_type: args.user_type as 'HUMAN' | 'SYSTEM' | undefined,
      shared_credential_group: args.shared_credential_group as
        | {
            origin_company_id?: string;
            origin_company_name?: string;
            custom_groupings?: Record<string, string>;
          }
        | undefined,
    });
    return JSON.stringify(result, null, 2);
  },

  get_registered_user: async (args) => {
    const result = await api.getRegisteredUser(args.id as string);
    return JSON.stringify(result, null, 2);
  },

  update_registered_user: async (args) => {
    const { id, ...data } = args;
    const result = await api.updateRegisteredUser(
      id as string,
      data as Partial<{
        origin_user_name: string;
        user_type: 'HUMAN' | 'SYSTEM';
        shared_credential_group: {
          origin_company_id?: string;
          origin_company_name?: string;
          custom_groupings?: Record<string, string>;
        };
      }>,
    );
    return JSON.stringify(result, null, 2);
  },

  delete_registered_user: async (args) => {
    await api.deleteRegisteredUser(args.id as string);
    return `Registered user ${args.id} has been deleted.`;
  },
};
