---
name: merge-tools
description: "Connect to and use 100+ enterprise tools via Merge Agent Handler. Triggers: set up Merge, setup Merge, configure Merge, add connector, add Jira, add Salesforce, add Slack, add Gong, auth Jira, auth Salesforce, auth Slack, auth Gong, authenticate, connect to Jira, create a ticket, search Salesforce, post to Slack, check Workday, use enterprise tools, merge agent handler, list integrations, check Gong, list users, get deals, find leads, show my tickets, create an issue, send a message, find contacts."
---

# Enterprise Tool Integration via Merge Agent Handler

This skill connects Cursor to 100+ enterprise applications via Merge Agent Handler.

## Four Flows

### 1. Setup ("set up Merge")
Interactive guided setup. See the rule `merge-agent-handler.mdc` for exact steps:
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
