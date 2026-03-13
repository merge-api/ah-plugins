---
name: setup
description: Set up Merge Agent Handler — select a registered user and tool pack
---

# Set Up Merge Agent Handler

Follow these instructions step by step. Ask one question at a time. Wait for the user's response before proceeding. **Always present options as clean numbered lists.** Never dump raw JSON.

---

## Pre-check: Verify API Key

Before anything else, check if the API key is set:
```bash
echo "${MERGE_API_KEY:+ok}"
```

**If the output is empty (key is NOT set)**, stop and guide the user:

```
You need a Merge API key to use Agent Handler. Here's how to set it up:

1. Sign up or log in at https://ah.merge.dev/login
2. Copy your **Production Access Key** (or Test Access Key for sandbox testing)
3. Add it to your shell profile (~/.zshrc, ~/.bashrc, etc.):

   export MERGE_API_KEY="your-key-here"

4. Then either:
   - Open a new terminal and restart Claude Code, OR
   - Run: source ~/.zshrc (or ~/.bashrc)

Once your key is set, run this setup again.
```

**Do NOT proceed with setup until the key is confirmed.** Stop here and wait for the user to set their key.

**If the output is "ok"** → continue to Step 0.

---

## Step 0: Check for Existing Session

Run this FIRST, before anything else:
```bash
cat .merge-agent-handler-session.json 2>/dev/null
```

**If the file exists and contains `registered_user_id` and `tool_pack_id`:**

Fetch ONLY the tool pack to get current connector info:
```bash
curl -s "https://ah-api.merge.dev/api/v1/tool-packs/<tool_pack_id>/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```

Then present to the user:
```
Found an existing Merge setup:

Registered User: [registered_user_name] ([registered_user_email])
Tool Pack: [tool_pack_name]
Connectors: [connector names extracted from tool pack response]

What would you like to do?

1. Use this existing setup
2. Start fresh with a new setup
```

- If user picks **1** → confirm "Using your existing setup. You're ready to go!" and STOP. Do not proceed to Step 1.
- If user picks **2** → continue to Step 1.

**If the file does not exist or is invalid** → go directly to Step 1.

---

## Step 1: Select or Create a Registered User

Explain briefly:
> **What's a Registered User?** Your identity in Merge — it tracks which enterprise apps you've connected (Jira, Salesforce, Gong, etc.) and lets you securely access them.

Fetch BOTH production and test users:
```bash
curl -s "https://ah-api.merge.dev/api/v1/registered-users?is_test=false" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for u in data.get('results', []):
    connectors = ', '.join(u.get('authenticated_connectors', [])) or 'none'
    print(f\"{u['origin_user_name']} — {u['origin_user_id']} (type: {u.get('user_type','HUMAN')}, env: production, connectors: {connectors}) [ID: {u['id']}]\")
"
```
Run the same with `?is_test=true` (change env label to `test`). Combine results into one numbered list:

```
Which registered user would you like to use?

1. Create a new user (will use your git name and email)
2. Pritak — pritak@merge.dev (type: HUMAN, env: production, connectors: gong, jira)
3. Test Bot — bot@merge.dev (type: SYSTEM, env: test, connectors: none)
```

**If user picks "Create new":**
```
What type of user?

1. Production (real account, connects to live data)
2. Test (sandbox account for testing)
```
Then create via curl:
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/registered-users" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"origin_user_id": "<git email>", "origin_user_name": "<git name>", "user_type": "HUMAN"}'
```
For test users, add `?is_test=true` to the URL. Use the returned `id` as `registered_user_id`.

**If user picks an existing user:** use that user's `id` as `registered_user_id`.

→ Proceed to Step 2.

---

## Step 2: Select or Create a Tool Pack

Explain briefly:
> **What's a Tool Pack?** A bundle of enterprise integrations (connectors) you want to use together — e.g., Jira + Slack + Gong for tickets, messages, and call data, all from Claude Code.

Fetch tool packs:
```bash
curl -s "https://ah-api.merge.dev/api/v1/tool-packs/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin" | python3 -c "
import json, sys
data = json.load(sys.stdin)
packs = data.get('results', data) if isinstance(data, dict) else data
for i, p in enumerate(packs, 1):
    connectors = ', '.join([c.get('connector_slug', c.get('connector_id', '?')) for c in p.get('connectors', [])]) or 'none'
    print(f\"{i}. {p['name']} — {p.get('description', '')} (connectors: {connectors}) [ID: {p['id']}]\")
"
```

Present as numbered list:
```
Which Tool Pack would you like to use?

1. Create a new Tool Pack
2. Pritak's Claude Code Tool Pack — Tool pack created via Claude Code Agent (connectors: gong, jira)
3. Sales Team Pack — CRM integrations (connectors: salesforce, hubspot)
```

**Reply with a number.** Or type the name of a Tool Pack if you don't see it.

**If user picks an existing tool pack:** use its `id` as `tool_pack_id`. → Skip to Step 3.

**If user picks "Create new":** → go to Step 2b.

---

## Step 2b: Choose Connectors for New Tool Pack

Fetch all connectors:
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

Show ALL connectors as a numbered list. Then say:

"**Reply with the numbers** of the integrations you want (e.g., '1, 3, 7'). You can always add or remove connectors later."

After user selects, you MUST do both sub-steps (A and B) to create a working tool pack:

**Step A — Get ALL supported tools for each selected connector:**
For EACH selected connector, fetch its full tool list via `GET /connectors/{slug}`:
```bash
curl -s "https://ah-api.merge.dev/api/v1/connectors/<connector_slug>" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "X-Source: claude-code-plugin"
```
Parse the `tools` array from each response — extract every tool `name` (e.g., `gong__list_users`, `jira__create_issue`).

**IMPORTANT:** Do NOT use `tools/list` (JSON-RPC) to get tool names — that only returns tools for authenticated connectors. `GET /connectors/{slug}` returns ALL supported tools regardless of auth status.

**Step B — Create the tool pack with ALL tool_names populated:**
```bash
curl -s -X POST "https://ah-api.merge.dev/api/v1/tool-packs/" \
  -H "Authorization: Bearer $MERGE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Source: claude-code-plugin" \
  -d '{"name": "<user name>'\''s Claude Code Tool Pack", "description": "Tool pack created via Claude Code Agent", "connectors": [{"connector_id": "<uuid>", "auth_scope": "INDIVIDUAL", "tool_names": ["connector__tool1", "connector__tool2", ...]}]}'
```
Include the FULL `tool_names` array for each connector from Step A.

**CRITICAL: If you skip Step A, NO tools will be callable. Omitting `tool_names` does NOT auto-include tools — it means ZERO tools.**

→ Proceed to Step 3.

---

## Step 3: Setup Complete

**MANDATORY — DO THIS BEFORE ANYTHING ELSE IN THIS STEP:**

You MUST save the session file. This is NOT optional. Run this command with the actual values substituted:
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

**If this file is not written, setup is NOT complete. Do NOT skip this step. Do NOT just tell the user setup is done without writing this file.**

Then verify it was saved:
```bash
cat .merge-agent-handler-session.json
```

Then present:
```
Setup complete!

Registered User: [name] ([email]) — ID: [registered_user_id]
Tool Pack: [pack name] — ID: [tool_pack_id]
Connectors: [list of connector names]

You can now ask me to interact with any of your connected services.
Say "add [integration]" to add a new connector.
Say "auth [integration]" to authenticate a connector.
```
