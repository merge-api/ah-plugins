import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'create_tool_pack',
    description:
      'Create a new tool pack in Merge Agent Handler. A tool pack bundles one or more connectors (integrations like Jira, Slack, Salesforce) and their tools together. You must specify which connectors to include and optionally configure auth scope and tool filtering per connector.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Display name for the tool pack.',
        },
        description: {
          type: 'string',
          description: 'Description of what this tool pack is for.',
        },
        connectors: {
          type: 'array',
          description: 'List of connectors to include in the tool pack.',
          items: {
            type: 'object',
            properties: {
              connector_id: {
                type: 'string',
                description:
                  'The connector ID (use list_connectors to find available IDs).',
              },
              auth_scope: {
                type: 'string',
                enum: ['INDIVIDUAL', 'SHARED', 'ORGANIZATION'],
                description:
                  'Auth scope: INDIVIDUAL (per-user creds), SHARED (shared across group), ORGANIZATION (org-wide).',
              },
              tool_names: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Optional list of specific tool names to include. Omit to include all tools.',
              },
            },
            required: ['connector_id'],
          },
        },
      },
      required: ['name', 'description', 'connectors'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'get_tool_pack',
    description:
      'Get details of a specific tool pack by ID, including its connectors and their tools.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The tool pack ID.',
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
    name: 'update_tool_pack',
    description:
      'Update an existing tool pack. You can change the name, description, or connector configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The tool pack ID to update.',
        },
        name: {
          type: 'string',
          description: 'New display name.',
        },
        description: {
          type: 'string',
          description: 'New description.',
        },
        connectors: {
          type: 'array',
          description: 'Updated connector configuration.',
          items: {
            type: 'object',
            properties: {
              connector_id: { type: 'string' },
              auth_scope: {
                type: 'string',
                enum: ['INDIVIDUAL', 'SHARED', 'ORGANIZATION'],
              },
              tool_names: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['connector_id'],
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
    name: 'delete_tool_pack',
    description:
      'Delete a tool pack. This is permanent and removes the tool pack and all its connector configurations. Always confirm with the user before deleting.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The tool pack ID to delete.',
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
  create_tool_pack: async (args) => {
    const result = await api.createToolPack({
      name: args.name as string,
      description: args.description as string,
      connectors: args.connectors as Array<{
        connector_id: string;
        auth_scope?: 'INDIVIDUAL' | 'SHARED' | 'ORGANIZATION';
        tool_names?: string[];
      }>,
    });
    return JSON.stringify(result, null, 2);
  },

  get_tool_pack: async (args) => {
    const result = await api.getToolPack(args.id as string);
    return JSON.stringify(result, null, 2);
  },

  update_tool_pack: async (args) => {
    const { id, ...data } = args;
    const result = await api.updateToolPack(
      id as string,
      data as Partial<{
        name: string;
        description: string;
        connectors: Array<{
          connector_id: string;
          auth_scope?: 'INDIVIDUAL' | 'SHARED' | 'ORGANIZATION';
          tool_names?: string[];
        }>;
      }>,
    );
    return JSON.stringify(result, null, 2);
  },

  delete_tool_pack: async (args) => {
    await api.deleteToolPack(args.id as string);
    return `Tool pack ${args.id} has been deleted.`;
  },
};
