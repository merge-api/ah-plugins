import type {
  RegisteredUserRequest,
  RegisteredUserResponse,
  ToolPackRequest,
  ToolPackResponse,
  ConnectorResponse,
  LinkTokenResponse,
  AuditLogEvent,
  ToolSearchResult,
  ToolSearchResponse,
  McpTool,
  McpToolResult,
  McpJsonRpcRequest,
  McpJsonRpcResponse,
} from './types.js';

const BASE_URL = 'https://ah-api.merge.dev/api/v1';

function getApiKey(): string {
  const key = process.env.MERGE_API_KEY;
  if (!key) {
    throw new Error('MERGE_API_KEY environment variable is not set');
  }
  return key;
}

async function makeRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  qs?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (qs) {
    for (const [key, value] of Object.entries(qs)) {
      url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    'X-Source': 'claude-code-plugin',
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    // Strip HTML from error responses for cleaner messages
    const cleanText = text.replace(/<[^>]*>/g, '').trim().substring(0, 500);
    throw new Error(
      `Merge API error (${response.status} ${response.statusText}) on ${method} ${path}: ${cleanText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // Guard against non-JSON responses
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `Merge API returned non-JSON response (${contentType}) on ${method} ${path}: ${text.substring(0, 200)}`,
    );
  }

  return (await response.json()) as T;
}

async function fetchAllPages<T>(
  path: string,
  qs?: Record<string, string>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  while (true) {
    const response = await makeRequest<T[] | { results: T[]; next?: string }>(
      'GET',
      path,
      undefined,
      { ...qs, page: String(page) },
    );
    if (Array.isArray(response)) {
      return response;
    }
    const results = response.results ?? [];
    all.push(...results);
    if (!response.next) {
      break;
    }
    page++;
  }
  return all;
}

// ── Registered Users ──

export async function createRegisteredUser(
  data: RegisteredUserRequest,
): Promise<RegisteredUserResponse> {
  return makeRequest<RegisteredUserResponse>('POST', '/registered-users', data);
}

export async function getRegisteredUser(
  id: string,
): Promise<RegisteredUserResponse> {
  return makeRequest<RegisteredUserResponse>('GET', `/registered-users/${id}`);
}

export async function listRegisteredUsers(
  isTest?: boolean,
): Promise<RegisteredUserResponse[]> {
  const qs: Record<string, string> = {};
  if (isTest !== undefined) {
    qs.is_test = String(isTest);
  }
  return fetchAllPages<RegisteredUserResponse>('/registered-users', qs);
}

export async function updateRegisteredUser(
  id: string,
  data: Partial<RegisteredUserRequest>,
): Promise<RegisteredUserResponse> {
  return makeRequest<RegisteredUserResponse>(
    'PATCH',
    `/registered-users/${id}`,
    data,
  );
}

export async function deleteRegisteredUser(id: string): Promise<void> {
  await makeRequest<void>('DELETE', `/registered-users/${id}`);
}

// ── Tool Packs ──

export async function createToolPack(
  data: ToolPackRequest,
): Promise<ToolPackResponse> {
  return makeRequest<ToolPackResponse>('POST', '/tool-packs/', data);
}

export async function getToolPack(id: string): Promise<ToolPackResponse> {
  return makeRequest<ToolPackResponse>('GET', `/tool-packs/${id}/`);
}

export async function listToolPacks(): Promise<ToolPackResponse[]> {
  return fetchAllPages<ToolPackResponse>('/tool-packs/');
}

export async function updateToolPack(
  id: string,
  data: Partial<ToolPackRequest>,
): Promise<ToolPackResponse> {
  return makeRequest<ToolPackResponse>('PATCH', `/tool-packs/${id}/`, data);
}

export async function deleteToolPack(id: string): Promise<void> {
  await makeRequest<void>('DELETE', `/tool-packs/${id}/`);
}

// ── Connectors ──

export async function listConnectors(): Promise<ConnectorResponse[]> {
  return fetchAllPages<ConnectorResponse>('/connectors');
}

export async function getConnector(slug: string): Promise<ConnectorResponse> {
  return makeRequest<ConnectorResponse>('GET', `/connectors/${slug}`);
}

// ── Link Tokens ──

export async function createLinkToken(
  registeredUserId: string,
  connector: string,
): Promise<LinkTokenResponse> {
  return makeRequest<LinkTokenResponse>(
    'POST',
    `/registered-users/${registeredUserId}/link-token`,
    { connector },
  );
}

// ── Credentials ──

export async function deleteCredential(
  registeredUserId: string,
  connectorSlug: string,
): Promise<void> {
  await makeRequest<void>(
    'DELETE',
    `/credentials/registered-users/${registeredUserId}/connectors/${connectorSlug}`,
  );
}

// ── Audit Log ──

export async function listAuditLog(
  filters?: Record<string, string>,
): Promise<AuditLogEvent[]> {
  return fetchAllPages<AuditLogEvent>('/audit-log', filters);
}

// ── Tool Search ──

export async function searchTools(
  toolPackId: string,
  registeredUserId: string,
  intent: string,
  connectorSlugs?: string[],
  maxResults?: number,
): Promise<ToolSearchResponse> {
  const body: Record<string, unknown> = { intent };
  if (connectorSlugs && connectorSlugs.length > 0) {
    body.connector_slugs = connectorSlugs;
  }
  if (maxResults) {
    body.max_results = maxResults;
  }
  return makeRequest<ToolSearchResponse>(
    'POST',
    `/tool-packs/${toolPackId}/registered-users/${registeredUserId}/search`,
    body,
  );
}

// ── MCP Tools (JSON-RPC) ──

export async function listMcpTools(
  toolPackId: string,
  registeredUserId: string,
): Promise<McpTool[]> {
  const mcpPath = `/tool-packs/${toolPackId}/registered-users/${registeredUserId}/mcp`;

  const rpcRequest: McpJsonRpcRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  };

  const response = await makeRequest<McpJsonRpcResponse>(
    'POST',
    mcpPath,
    rpcRequest,
  );

  if (response.error) {
    throw new Error(
      `MCP tools/list failed: ${response.error.message} (code: ${response.error.code})`,
    );
  }

  return response.result?.tools ?? [];
}

export async function callMcpTool(
  toolPackId: string,
  registeredUserId: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<McpToolResult> {
  const mcpPath = `/tool-packs/${toolPackId}/registered-users/${registeredUserId}/mcp`;

  const rpcRequest: McpJsonRpcRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: { input: args },
    },
  };

  let response: McpJsonRpcResponse;
  try {
    response = await makeRequest<McpJsonRpcResponse>(
      'POST',
      mcpPath,
      rpcRequest,
    );
  } catch (error) {
    return {
      text: `Error calling tool "${toolName}": ${(error as Error).message}`,
    };
  }

  if (response.error) {
    return {
      text: `Tool "${toolName}" returned error: ${response.error.message}`,
    };
  }

  if (response.result?.isError) {
    const errorText =
      response.result.content?.map((c) => c.text).join('\n') ?? 'Unknown error';
    return { text: `Tool "${toolName}" failed: ${errorText}` };
  }

  const content = response.result?.content;
  let text: string;
  if (Array.isArray(content)) {
    text = content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');
  } else {
    text = JSON.stringify(response.result);
  }

  // Detect magic link authentication responses
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && parsed.magic_link_url) {
      return {
        text: parsed.message ?? text,
        magicLinkUrl: parsed.magic_link_url as string,
        requiresAuth: true,
      };
    }
  } catch {
    // Not JSON — normal tool response
  }

  return { text };
}
