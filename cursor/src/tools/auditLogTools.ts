import type { ToolDefinition, ToolHandler } from '../types.js';
import * as api from '../mergeApiClient.js';

export const tools: ToolDefinition[] = [
  {
    name: 'list_audit_log',
    description:
      'Query audit log entries from Merge Agent Handler. Shows events like user creation, tool pack changes, connector updates, and credential operations. Useful for reviewing what actions have been taken.',
    inputSchema: {
      type: 'object',
      properties: {
        created_after: {
          type: 'string',
          description: 'ISO datetime to filter events created after this time.',
        },
        created_before: {
          type: 'string',
          description:
            'ISO datetime to filter events created before this time.',
        },
        event_type: {
          type: 'string',
          enum: [
            'CONNECTOR_DELETED',
            'CONNECTOR_IMPORTED',
            'CONNECTOR_UPDATED',
            'CREDENTIAL_DELETED',
            'REGISTERED_USER_CREATED',
            'REGISTERED_USER_DELETED',
            'TOOL_PACK_CREATED',
            'TOOL_PACK_DELETED',
            'TOOL_PACK_UPDATED',
            'USER_CREATED',
            'USER_INVITED',
          ],
          description: 'Filter by specific event type.',
        },
        user_id: {
          type: 'string',
          description: 'Filter by user ID who performed the action.',
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
];

export const handlers: Record<string, ToolHandler> = {
  list_audit_log: async (args) => {
    const filters: Record<string, string> = {};
    if (args.created_after) filters.created_after = args.created_after as string;
    if (args.created_before)
      filters.created_before = args.created_before as string;
    if (args.event_type) filters.event_type = args.event_type as string;
    if (args.user_id) filters.user_id = args.user_id as string;

    const events = await api.listAuditLog(
      Object.keys(filters).length > 0 ? filters : undefined,
    );
    return JSON.stringify(events, null, 2);
  },
};
