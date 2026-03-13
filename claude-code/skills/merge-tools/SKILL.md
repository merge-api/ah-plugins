---
name: merge-tools
description: "Connect to and use hundreds of enterprise tools via Merge Agent Handler. Triggers: set up Merge, setup Merge, configure Merge, add connector, add Jira, add Salesforce, add Slack, add Gong, auth Jira, auth Salesforce, auth Slack, auth Gong, authenticate, connect to Jira, create a ticket, search Salesforce, post to Slack, check Workday, use enterprise tools, merge agent handler, list integrations, check Gong, list users, get deals, find leads, show my tickets, create an issue, send a message, find contacts."
---

# Enterprise Tool Integration via Merge Agent Handler

This skill connects Claude Code to hundreds of enterprise applications via Merge Agent Handler.

## Four Flows

### 1. Setup ("set up Merge")
Interactive guided setup. See the rule guidance below for exact steps:
- Pick or create a registered user (lists all existing users)
- Pick or create a tool pack (lists all existing packs)
- If creating a pack, pick connectors from the full list
- Stores `registered_user_id` and `tool_pack_id` for session

### 2. Add Connector ("add [integration]")
Adds a new connector to the current tool pack without re-running full setup:
- Finds the connector by name
- Calls `update_tool_pack` to add it to existing pack
- Example: "add Slack", "add GitHub", "add Salesforce"

### 3. Authenticate ("auth [integration]")
Generates an auth link for a connector:
- Calls `create_link_token` for the current user + connector
- Presents the link for the user to complete OAuth
- Example: "auth Gong", "auth Jira", "connect Salesforce"

### 4. Usage (enterprise tool requests)
Requires setup first. Two tool calls:
1. `search_tools` → find the right tool by intent
2. `call_tool` → execute it
- Example: "Check my Gong users", "Create a Jira ticket"

## Quick Reference

| User says | Flow | Key tool calls |
|-----------|------|---------------|
| "set up Merge" | Setup | `list_registered_users`, `list_tool_packs`, `list_connectors`, `create_*` |
| "add Slack" | Add Connector | `list_connectors`, `get_tool_pack`, `update_tool_pack` |
| "auth Gong" | Authenticate | `create_link_token` |
| "Check my Gong users" | Usage | `search_tools`, `call_tool` |

---

## IMPORTANT: How to Call Merge APIs

Use `curl` via the terminal for ALL Merge API calls. This ensures arguments are always passed correctly.

```bash
curl -s -X <METHOD> "https://ah-api.merge.dev/api/v1<PATH>" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '<JSON_BODY>'
```

The `MERGE_API_KEY` environment variable is already set.

---

## CRITICAL RULES — READ BEFORE DOING ANYTHING

### 1. You MUST explicitly include ALL tool_names for each connector
Omitting `tool_names` or passing an empty array means **NO tools** will be available for that connector. You must discover and include all tools.

**How to get the correct tool_names for each connector:**
1. For each connector, fetch ALL supported tools via `GET /connectors/{slug}`:
   ```bash
   curl -s "https://ah-api.merge.dev/api/v1/connectors/<connector_slug>" \
     -H "Authorization: Bearer $MERGE_API_KEY" \
     -H "X-Source: claude-code-plugin"
   ```
2. Parse the response — the `tools` array contains ALL tools the connector supports (regardless of auth status). Extract every tool `name`.
3. Include ALL tool names when creating or updating the tool pack:
   ```json
   {"connectors": [{"connector_id": "<uuid>", "auth_scope": "INDIVIDUAL", "tool_names": ["gong__list_users", "gong__get_user", ...]}]}
   ```

**IMPORTANT:** Do NOT use `tools/list` (JSON-RPC) to populate `tool_names` — that only returns tools for authenticated connectors. Use `GET /connectors/{slug}` instead, which returns ALL supported tools.

**You MUST do this every time you create or update a tool pack.** If you skip this step, the tools won't be callable.

### 2. Update tool pack = FULL replacement
The PATCH endpoint for tool packs requires the **complete** `connectors` array. To add a connector, first GET the current pack, then send ALL existing connectors PLUS the new one. Missing a connector from the array = removing it.

### 3. Connector names ≠ connector IDs
Users say names like "Gong", "Salesforce", "Greenhouse". The API needs UUIDs. When you fetch `/connectors`, each connector has:
- `name`: "Gong" (human-readable)
- `slug`: "gong" (used for auth/link-token calls)
- `id`: "abc-123-uuid" (used for `connector_id` in tool packs)

**Always extract and map all three fields** when listing connectors. Use `id` for tool pack operations, `slug` for auth operations.

### 4. Unauthenticated connectors only show `authenticate_*` tools
If `search_tools` or `list_tools` returns ONLY `authenticate_<connector>` and NO data tools, the connector is NOT authenticated. **Data tools do NOT exist until the user authenticates.** Do NOT guess tool names or try calling them — they will fail. Instead, immediately generate an auth link (see Authenticate Flow).

### 5. call_tool argument shape
When calling MCP tools via JSON-RPC, the arguments go inside `"input"`:
```json
{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "<tool_name>", "arguments": {"input": {}}}}
```
**Only pass fields the tool's schema actually defines.** Do NOT add extra fields like `per_page`, `limit`, etc. unless the tool's `inputSchema` (from `tools/list`) lists them. When in doubt, pass `"input": {}` (empty object).

### 6. Handling large API responses
API list responses can be very large. To keep things manageable:
- Pipe through `python3 -c` to extract just names/IDs. Example:
```bash
curl -s "https://ah-api.merge.dev/api/v1/connectors" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin" | python3 -c "
import json, sys
data = json.load(sys.stdin)
items = data.get('results', data) if isinstance(data, dict) else data
for i, c in enumerate(items, 1):
    print(f\"{i}. {c['name']} ({c['slug']}) — ID: {c['id']}\")
"
```
- For registered users, extract `origin_user_name`, `origin_user_id`, `id`, `user_type`, `authenticated_connectors`
- For tool packs, extract `name`, `description`, `id`, and connector names from the `connectors` array
- **Never dump raw JSON to the user.** Always present clean numbered lists.

### 7. Session state
After setup completes, save session details to `.merge-agent-handler-session.json` in the workspace root. Include enough context so the session can be resumed without API calls:
```bash
cat > .merge-agent-handler-session.json << 'EOF'
{
  "registered_user_id": "<id>",
  "registered_user_name": "<name>",
  "registered_user_email": "<email>",
  "tool_pack_id": "<id>",
  "tool_pack_name": "<name>",
  "connectors": ["gong", "jira", "salesforce"]
}
EOF
```
At the start of any flow, check if this file exists and load the IDs:
```bash
cat .merge-agent-handler-session.json 2>/dev/null
```
This way the user doesn't need to re-run setup every conversation.

---

## API Reference

**List Registered Users:**
```bash
# Production users
curl -s "https://ah-api.merge.dev/api/v1/registered-users?is_test=false" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"

# Test users
curl -s "https://ah-api.merge.dev/api/v1/registered-users?is_test=true" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```
**IMPORTANT:** Always fetch BOTH production and test users and combine results. The response format is `{"results": [...], "next": ...}`. The default (no `is_test` param) may only return production users.

**List Tool Packs:**
```bash
curl -s "https://ah-api.merge.dev/api/v1/tool-packs/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**List Connectors:**
```bash
curl -s "https://ah-api.merge.dev/api/v1/connectors" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**Get Connector by Slug:**
```bash
curl -s "https://ah-api.merge.dev/api/v1/connectors/<slug>" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**Create Registered User:**
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/registered-users" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"origin_user_id": "<email>", "origin_user_name": "<display name>", "user_type": "HUMAN"}'
```
For test users, add `?is_test=true` to the URL.

**Get Registered User:**
```bash
curl -s "https://ah-api.merge.dev/api/v1/registered-users/<id>" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**Update Registered User:**
```bash
curl -s -X PATCH "https://ah-api.merge.dev/api/v1/registered-users/<id>" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"origin_user_name": "<new name>"}'
```

**Delete Registered User:**
```bash
curl -s -X DELETE "https://ah-api.merge.dev/api/v1/registered-users/<id>" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**Create Tool Pack (omit tool_names initially — discover and add them via tools/list + PATCH):**
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/tool-packs/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"name": "<name>", "description": "<desc>", "connectors": [{"connector_id": "<uuid>", "auth_scope": "INDIVIDUAL"}]}'
```

**Get Tool Pack:**
```bash
curl -s "https://ah-api.merge.dev/api/v1/tool-packs/<id>/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**Update Tool Pack (FULL connectors array required — include tool_names for each connector):**
```bash
curl -s -X PATCH "https://ah-api.merge.dev/api/v1/tool-packs/<id>/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"connectors": [{"connector_id": "<uuid1>", "auth_scope": "INDIVIDUAL"}, {"connector_id": "<uuid2>", "auth_scope": "INDIVIDUAL"}]}'
```

**Delete Tool Pack:**
```bash
curl -s -X DELETE "https://ah-api.merge.dev/api/v1/tool-packs/<id>/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**Create Link Token (for authentication):**
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/registered-users/<registered_user_id>/link-token" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"connector": "<connector_slug>"}'
```

**Delete Credential:**
```bash
curl -s -X DELETE "https://ah-api.merge.dev/api/v1/credentials/registered-users/<registered_user_id>/connectors/<connector_slug>" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

**Search Tools:**
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/tool-packs/<tool_pack_id>/registered-users/<registered_user_id>/search" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"intent": "<natural language description of what the user wants>"}'
```

**Call MCP Tool (JSON-RPC):**
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/tool-packs/<tool_pack_id>/registered-users/<registered_user_id>/mcp" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "<tool_name>", "arguments": {"input": {}}}}'
```

**List MCP Tools (JSON-RPC):**
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/tool-packs/<tool_pack_id>/registered-users/<registered_user_id>/mcp" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
```

---

## SETUP FLOW

Triggered when user says "set up Merge", "setup Merge", "configure Merge", or similar.

### Pre-check: Verify API Key

Before anything else, check if the API key is set:
```bash
echo "${MERGE_API_KEY:+ok}"
```

If the output is empty, **stop and guide the user**:

> You need a Merge API key to use Agent Handler. Here's how to set it up:
>
> 1. Sign up or log in at **https://ah.merge.dev/login**
> 2. Copy your **Production Access Key** (or Test Access Key for sandbox testing)
> 3. Add it to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.):
>    ```
>    export MERGE_API_KEY="your-key-here"
>    ```
> 4. Then either open a new terminal and restart Claude Code, or run `source ~/.zshrc`
>
> Once your key is set, say "set up Merge" again.

**Do NOT proceed until the key is confirmed.** If output is "ok", continue to Step 0.

### Step 0: Check for Existing Session

Always check first:
```bash
cat .merge-agent-handler-session.json 2>/dev/null
```

If the file exists and contains valid data, fetch the tool pack to get current connectors, then present:
```bash
curl -s "https://ah-api.merge.dev/api/v1/tool-packs/<tool_pack_id>/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

```
Found an existing Merge setup:

Registered User: [registered_user_name] ([registered_user_email])
Tool Pack: [tool_pack_name]
Connectors: [connector names from the tool pack GET response]

What would you like to do?

1. Use this existing setup
2. Start fresh with a new setup
```

- If the user picks **1**, load the saved data and confirm "Using your existing setup. You're ready to go!" — **do NOT fetch users or list connectors**.
- If the user picks **2**, continue with Step 1 below.
- If the file does not exist or is invalid, proceed directly to Step 1.

Follow these steps EXACTLY. Ask one question at a time. Wait for the user's response before proceeding. **Always present options as clean numbered lists so the user can reply with a number.** Never dump raw JSON or ask the user to type free-form IDs.

### Step 1: Select or Create a Registered User

Before presenting options, briefly explain:
> **What's a Registered User?** A Registered User is your identity in Merge — it tracks which enterprise apps you've connected and lets you securely access them. Think of it as your personal account that links to services like Jira, Salesforce, Gong, etc.

Fetch BOTH production and test users by making two curl calls (pipe through python3 to extract clean data):

```bash
curl -s "https://ah-api.merge.dev/api/v1/registered-users?is_test=false" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for u in data.get('results', []):
    connectors = ', '.join(u.get('authenticated_connectors', [])) or 'none'
    env = 'test' if u.get('is_test') else 'production'
    print(f\"{u['origin_user_name']} — {u['origin_user_id']} (type: {u.get('user_type','HUMAN')}, env: {env}, connectors: {connectors}) [ID: {u['id']}]\")
"
```
Run the same for `?is_test=true`. Combine results into one numbered list.

Present ALL returned users in a numbered list:
```
Which registered user would you like to use?

1. Create a new user (will use your git name and email)
2. Pritak — pritak@merge.dev (type: HUMAN, env: production, connectors: gong, jira)
3. Test Bot — bot@merge.dev (type: SYSTEM, env: test, connectors: none)
```

**If user picks "Create new":**
- Present as a numbered selection:
```
What type of user?

1. Production (real account, connects to live data)
2. Test (sandbox account for testing)
```
- After they pick, use **curl** to POST to `/registered-users`:
  - `origin_user_id`: the user's git email address
  - `origin_user_name`: the user's git display name
  - `user_type`: "HUMAN"
  - For test users, add `?is_test=true` to the URL

**If user picks an existing user:** use that user's `id` as the `registered_user_id`.

### Step 2: Select or Create a Tool Pack

Before presenting options, briefly explain:
> **What's a Tool Pack?** A Tool Pack is a bundle of enterprise integrations (connectors) that you want to use together. For example, a Tool Pack might include Jira + Slack + Gong so you can create tickets, send messages, and check call data — all from Claude Code.

Use **curl** to GET `/tool-packs/` and pipe through python3 to extract clean data. Present ALL returned tool packs in a numbered list:
```
Which Tool Pack would you like to use?

1. Create a new Tool Pack
2. Pritak's Claude Code Tool Pack — Tool pack created via Claude Code Agent (connectors: gong, jira)
3. Sales Team Pack — CRM integrations (connectors: salesforce, hubspot)
```

Ask the user to **reply with a number** to select. Also mention: "Or type the name of a Tool Pack if you don't see it."

**If user picks an existing tool pack:** use that pack's `id` as the `tool_pack_id`. Skip to Step 3.

**If user picks "Create new":** proceed to Step 2b.

### Step 2b: Choose Connectors for New Tool Pack

Use **curl** to GET `/connectors` and pipe through python3 to extract name, slug, and ID. Present a comprehensive numbered list of ALL available connectors:
```
[number]. [name] ([slug]) — ID: [connector_id]
```

Show ALL connectors — do not truncate the list. After the list, say:

"**Reply with the numbers** of the integrations you want (e.g., '1, 3, 7'). You can always add or remove connectors later."

After the user selects:

1. **Get ALL supported tools for each selected connector** via `GET /connectors/{slug}`:
   ```bash
   curl -s "https://ah-api.merge.dev/api/v1/connectors/<connector_slug>" \
     -H "Authorization: Bearer $MERGE_API_KEY" \
     -H "X-Source: claude-code-plugin"
   ```
   Parse the `tools` array from each response — extract every tool `name`. Do this for EACH selected connector.

2. **Create the tool pack** with ALL tool_names already populated:
   ```bash
   curl -s -X POST "https://ah-api.merge.dev/api/v1/tool-packs/" \
     -H "Authorization: Bearer $MERGE_API_KEY" \
     -H "Content-Type: application/json" \
     -H "X-Source: claude-code-plugin" \
     -d '{"name": "<name>", "description": "Tool pack created via Claude Code Agent", "connectors": [{"connector_id": "<uuid>", "auth_scope": "INDIVIDUAL", "tool_names": ["<all>", "<tool>", "<names>"]}]}'
   ```
   Include the complete `tool_names` array for each connector from step 1.

### Step 3: Setup Complete

**MANDATORY — DO THIS BEFORE ANYTHING ELSE IN THIS STEP:**

You MUST save the session file. This is NOT optional. Setup is NOT complete until this file is written:
```bash
cat > .merge-agent-handler-session.json << 'EOF'
{
  "registered_user_id": "<ACTUAL ID>",
  "registered_user_name": "<ACTUAL NAME>",
  "registered_user_email": "<ACTUAL EMAIL>",
  "tool_pack_id": "<ACTUAL ID>",
  "tool_pack_name": "<ACTUAL NAME>",
  "connectors": ["<actual_slug1>", "<actual_slug2>"]
}
EOF
```

Verify it was saved:
```bash
cat .merge-agent-handler-session.json
```

Then present a summary:
```
Setup complete!

Registered User: [name] ([email]) — ID: [registered_user_id]
Tool Pack: [pack name] — ID: [tool_pack_id]
Connectors: [list of connector names]

You can now ask me to interact with any of your connected services.
Say "set up Merge" again anytime to change your configuration.
Say "add [integration]" to add a new connector to your tool pack.
Say "auth [integration]" to authenticate a connector.
```

---

## ADD CONNECTOR FLOW

Triggered when user says "add [integration]", "add connector", "add [service] to my tool pack", or similar.

### Prerequisites
You MUST already have `registered_user_id` and `tool_pack_id` (from session file or previous setup). If not, tell the user to run "set up Merge" first.

### Steps

1. If the user specified a connector name (e.g., "add Slack"):
   - Use **curl** to GET `/connectors`, pipe through python3, and find the matching connector by name (fuzzy match is fine)
   - Extract both the `id` (UUID) and `slug` for the matched connector
   - If no match, show the full connector list as a numbered list and ask them to pick

2. If the user just said "add connector" without specifying:
   - Use **curl** to GET `/connectors` and present the full numbered list
   - Ask: "**Reply with a number** to select."

3. **Get ALL supported tools** for the new connector via `GET /connectors/{slug}`:
   ```bash
   curl -s "https://ah-api.merge.dev/api/v1/connectors/<connector_slug>" \
     -H "Authorization: Bearer $MERGE_API_KEY" \
     -H "X-Source: claude-code-plugin"
   ```
   Parse the `tools` array and extract every tool `name`.

4. Use **curl** to GET `/tool-packs/<tool_pack_id>/` to get the current connectors array

5. Use **curl** to PATCH `/tool-packs/<tool_pack_id>/` with the FULL connectors array (existing connectors + the new one):
   - Keep ALL existing connector configs exactly as they are (including their `tool_names`)
   - Add the new connector with `{ "connector_id": "<UUID>", "auth_scope": "INDIVIDUAL", "tool_names": ["<all_tools_from_step_3>"] }`

6. Confirm: "Added [connector name] to your tool pack. Say 'auth [connector]' to authenticate it."

---

## AUTHENTICATE FLOW

Triggered when user says "auth [integration]", "authenticate [integration]", "connect [integration]", "link [integration]", or similar.

### Prerequisites
You MUST already have `registered_user_id` (from session file or previous setup). If not, tell the user to run "set up Merge" first.

### Steps

1. Determine the connector **slug** from the user's request:
   - "auth Gong" → `connector` = `"gong"`
   - "auth Salesforce" → `connector` = `"salesforce"`
   - If unclear, use **curl** to GET `/connectors` and present a numbered list

2. Use **curl** to POST to `/registered-users/<registered_user_id>/link-token` with:
   - Body: `{"connector": "<connector_slug>"}`

3. Present the result:
   "Here's your authentication link for [connector name]. Click it to connect your account:"
   [link_token URL]

---

## USAGE FLOW

Triggered when the user asks to interact with enterprise tools (e.g., "Check my Gong users", "Create a Jira ticket", "Search Salesforce contacts").

### Prerequisites Check
First check `.merge-agent-handler-session.json` for saved IDs. If no session and no IDs from setup in this conversation, tell the user:
**"You need to set up Merge first. Say 'set up Merge' to get started."**

### Execution
1. Use **curl** to POST to the search endpoint with the user's intent as a natural language string
2. **Check the results.** If only `authenticate_*` tools appear → go to "Unauthenticated Connectors" below
3. Use **curl** to call `tools/list` via JSON-RPC to get the tool's `inputSchema` so you know what arguments it accepts
4. Use **curl** to call `tools/call` via JSON-RPC with the discovered tool name. **Only pass arguments defined in the tool's inputSchema.** When unsure, use `"input": {}`
5. Present the results in a clean, formatted way

### Unauthenticated Connectors — STOP AND AUTHENTICATE

If `search_tools` or `tools/list` returns ONLY an `authenticate_<connector>` tool (e.g., `authenticate_gong`, `authenticate_greenhouse`) and NO data tools:

**This means the connector is NOT authenticated yet. Data tools DO NOT EXIST until the user authenticates. Do NOT guess tool names. Do NOT try calling tools like `greenhouse__list_candidates` or `gong__list_users` — they do not exist yet and will fail.**

You MUST immediately do this instead:

1. **Do NOT call any data tool.** It does not exist yet.
2. Tell the user: "[Connector] needs to be authenticated before I can access its data."
3. Immediately generate an auth link using **curl**:
   ```bash
   curl -s -X POST "https://ah-api.merge.dev/api/v1/registered-users/<registered_user_id>/link-token" \
     -H "Authorization: Bearer $MERGE_API_KEY" \
     -H "Content-Type: application/json" \
     -H "X-Source: claude-code-plugin" \
     -d '{"connector": "<connector_slug>"}'
   ```
4. Present the link: "Click this link to connect your [connector name] account. Once done, ask me again and I'll be able to access your data."
5. **Wait for the user to confirm they've authenticated**, then retry the original request.

### Authentication Errors
- If `call_tool` returns a magic link URL or `requires_auth`, present the link and ask the user to authenticate, then retry
- You can also suggest: "Say 'auth [connector]' to authenticate this connector."

---

## Safety
- Always confirm with the user before destructive operations (deleting records, users, tool packs, or credentials)
- Tool results may contain sensitive enterprise data — present but don't persist unnecessarily
