// ── Registered Users ──

export interface SharedCredentialGroup {
  origin_company_id?: string;
  origin_company_name?: string;
  custom_groupings?: Record<string, string>;
}

export interface RegisteredUserRequest {
  origin_user_id: string;
  origin_user_name: string;
  shared_credential_group?: SharedCredentialGroup;
  user_type?: 'HUMAN' | 'SYSTEM';
}

export interface RegisteredUserResponse {
  id: string;
  origin_user_id: string;
  origin_user_name: string;
  shared_credential_group?: SharedCredentialGroup;
  user_type?: string;
  authenticated_connectors?: string[];
  is_test?: boolean;
}

// ── Tool Packs ──

export interface ToolPackConnectorWrite {
  connector_id: string;
  auth_scope?: 'INDIVIDUAL' | 'SHARED' | 'ORGANIZATION';
  tool_names?: string[];
}

export interface ToolPackRequest {
  name: string;
  description: string;
  connectors: ToolPackConnectorWrite[];
}

export interface ToolPackConnectorRead {
  name: string;
  slug: string;
  source_url?: string;
  logo_url?: string;
  categories?: string[];
  tools?: Array<{ name: string; description?: string }>;
}

export interface ToolPackResponse {
  id: string;
  name: string;
  description?: string;
  connectors?: ToolPackConnectorRead[];
}

// ── Connectors ──

export interface ConnectorResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  tools?: Array<{ name: string; description?: string }>;
}

// ── Link Tokens ──

export interface LinkTokenResponse {
  link_token: string;
}

// ── Audit Log ──

export interface AuditLogEvent {
  id: string;
  user_name?: string;
  user_email?: string;
  role?: string;
  ip_address?: string;
  event_type: string;
  event_description?: string;
  created_at: string;
}

// ── Tool Search ──

export interface ToolSearchResult {
  name: string;
  fully_qualified_name?: string;
  human_name?: string;
  description?: string;
  input_schema?: Record<string, unknown>;
  relevance_score?: number;
  reasoning?: string;
}

export interface ToolSearchResponse {
  tools: ToolSearchResult[];
  total_results: number;
  intent: string;
}

// ── MCP Protocol ──

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: Record<string, unknown>;
}

export interface McpJsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: {
    tools?: McpTool[];
    content?: Array<{ type: string; text: string }>;
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
  };
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpToolResult {
  text: string;
  magicLinkUrl?: string;
  requiresAuth?: boolean;
}

// ── Pagination ──

export interface PaginatedResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results: T[];
}

// ── Tool Definition (for our MCP server) ──

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<string>;
