import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'list_tool_packs',
    description:
      'List all available Merge Agent Handler tool packs. A tool pack is a configured bundle of connectors and their tools. Call this first to discover what integrations are available.',
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
    name: 'list_registered_users',
    description:
      'List registered users in Merge Agent Handler. A registered user represents an end-user identity that can authenticate with connectors. Use the environment parameter to filter by production or test users.',
    inputSchema: {
      type: 'object',
      properties: {
        environment: {
          type: 'string',
          enum: ['production', 'test'],
          description:
            'Filter by environment. "production" returns real users, "test" returns test users.',
        },
      },
      required: [],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'list_tools',
    description:
      'List all MCP tools available for a specific tool pack and registered user combination. Returns the tool names, descriptions, and input schemas. Call this after selecting a tool pack and registered user to discover what operations are available.',
    inputSchema: {
      type: 'object',
      properties: {
        tool_pack_id: {
          type: 'string',
          description: 'The ID of the tool pack to list tools from.',
        },
        registered_user_id: {
          type: 'string',
          description: 'The ID of the registered user.',
        },
      },
      required: ['tool_pack_id', 'registered_user_id'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'call_tool',
    description:
      'Execute an MCP tool via Merge Agent Handler. This calls a specific tool (e.g., jira_create_issue, slack_send_message) with the provided arguments. Always call list_tools first to discover available tools and their required arguments.',
    inputSchema: {
      type: 'object',
      properties: {
        tool_pack_id: {
          type: 'string',
          description: 'The ID of the tool pack containing the tool.',
        },
        registered_user_id: {
          type: 'string',
          description: 'The ID of the registered user to act as.',
        },
        tool_name: {
          type: 'string',
          description:
            'The name of the MCP tool to call (e.g., "jira_create_issue").',
        },
        arguments: {
          type: 'object',
          description:
            'The arguments to pass to the tool. Check the tool\'s inputSchema from list_tools for required fields.',
        },
      },
      required: [
        'tool_pack_id',
        'registered_user_id',
        'tool_name',
        'arguments',
      ],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
];

export const handlers: Record<string, ToolHandler> = {
  list_tool_packs: async () => {
    const packs = await api.listToolPacks();
    return JSON.stringify(packs, null, 2);
  },

  list_registered_users: async (args) => {
    let isTest: boolean | undefined;
    if (args.environment === 'test') isTest = true;
    else if (args.environment === 'production') isTest = false;
    const users = await api.listRegisteredUsers(isTest);
    return JSON.stringify(users, null, 2);
  },

  list_tools: async (args) => {
    const tools = await api.listMcpTools(
      args.tool_pack_id as string,
      args.registered_user_id as string,
    );
    return JSON.stringify(tools, null, 2);
  },

  call_tool: async (args) => {
    const result = await api.callMcpTool(
      args.tool_pack_id as string,
      args.registered_user_id as string,
      args.tool_name as string,
      (args.arguments as Record<string, unknown>) ?? {},
    );

    if (result.requiresAuth && result.magicLinkUrl) {
      return [
        '⚠️ AUTHENTICATION REQUIRED',
        '',
        result.text,
        '',
        `Please open this link to authenticate: ${result.magicLinkUrl}`,
        '',
        'After authenticating, try calling the tool again.',
      ].join('\n');
    }

    return result.text;
  },
};
