# Merge Agent Handler — Cursor Plugin

Connect Cursor's AI agent to **100+ enterprise tools** (Jira, Salesforce, HubSpot, GitHub, Slack, Workday, Gong, and more) via [Merge Agent Handler](https://docs.ah.merge.dev).

The agent can discover, authenticate, and call enterprise tools directly from Cursor's chat — no context switching required.

## What's Included

| Component | Description |
|-----------|-------------|
| **Rules** (`rules/merge-agent-handler.mdc`) | Always-on guidance that teaches the agent how to call Merge APIs, handle authentication, and manage resources |
| **Commands** (`commands/setup.md`) | Interactive `/setup` command that walks you through selecting a user, tool pack, and connectors |
| **Skills** (`skills/merge-tools/SKILL.md`) | Trigger phrases like "create a Jira ticket" or "check my Gong calls" that activate the enterprise tool workflow |
| **MCP Server** (`src/`) | A local MCP server exposing 18 tools for tool discovery, execution, and resource management |

## Prerequisites

- [Cursor](https://cursor.com) IDE
- A Merge Agent Handler API key — [get one here](https://docs.ah.merge.dev)
- Node.js 18+

## Installation

### 1. Clone and build

```bash
git clone https://github.com/merge-api/ah-plugins.git
cd ah-plugins/cursor
npm install
npm run build
```

### 2. Set your API key

Add this to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.) and restart your terminal:

```bash
export MERGE_API_KEY="your-api-key-here"
```

### 3. Open in Cursor

Open the plugin folder in Cursor. It will automatically:
- Detect `mcp.json` and start the MCP server
- Load the rule from `rules/`
- Register the `/setup` command from `commands/`
- Activate the skill from `skills/`

You can verify the MCP server is running under **Settings > MCP** — look for `merge-agent-handler`.

### 4. Enable the plugin

In Cursor, go to **Settings > Plugins** and enable `merge-agent-handler`.

## Getting Started

### Run setup

Type `/setup` in Cursor's agent chat. The command walks you through:

1. **Selecting a Registered User** — your identity in Merge that tracks which apps you've connected
2. **Selecting a Tool Pack** — a bundle of connectors (e.g., Jira + Slack + Gong) you want to use together
3. **Choosing connectors** — if creating a new tool pack, pick from 100+ available integrations

Setup saves your configuration to `.merge-agent-handler-session.json` so you don't need to repeat it.

### Authenticate a connector

After setup, connect your accounts:

> "auth Jira"
> "authenticate Salesforce"
> "connect Gong"

The agent generates a link — click it to complete OAuth in your browser.

### Use enterprise tools

Once authenticated, just ask:

> "Create a Jira ticket for bug X in project Y"
> "Search Salesforce contacts with email @acme.com"
> "List my recent Gong calls"
> "Send a Slack message to #engineering"
> "Check open deals in HubSpot"

The agent automatically finds the right tool, checks authentication, and executes.

### Add more connectors

> "add Slack to my tool pack"
> "add GitHub"

## How It Works

The plugin uses Merge Agent Handler's REST API and MCP protocol:

1. **Discovery** — The agent searches for tools matching your intent (e.g., "create a ticket" → `jira__create_issue`)
2. **Authentication** — If a connector isn't authenticated yet, the agent generates an OAuth link automatically
3. **Execution** — The agent calls the tool via JSON-RPC and presents the results

All API calls use `curl` via the terminal with your `MERGE_API_KEY`, ensuring arguments are always passed correctly.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Registered User** | Your identity in Merge — tracks which apps you've connected and lets you access them securely |
| **Tool Pack** | A bundle of connectors you use together (e.g., Jira + Slack + Gong) |
| **Connector** | An integration with a specific service (e.g., Jira, Salesforce, Gong) |
| **MCP Tool** | A specific operation like `jira__create_issue` or `gong__list_calls` |

## Project Structure

```
├── .cursor-plugin/
│   └── plugin.json              Plugin manifest
├── mcp.json                     MCP server configuration
├── commands/
│   └── setup.md                 Interactive /setup command
├── rules/
│   └── merge-agent-handler.mdc  Always-on agent guidance
├── skills/
│   └── merge-tools/
│       └── SKILL.md             Natural language trigger phrases
├── assets/
│   └── Merge logo.png           Plugin logo
├── src/
│   ├── index.ts                 MCP server entry point (stdio)
│   ├── mergeApiClient.ts        HTTP client for Merge API
│   ├── types.ts                 TypeScript interfaces
│   └── tools/                   Tool definitions (8 modules, 18 tools)
├── package.json
└── tsconfig.json
```

## Available MCP Tools (18)

| Category | Tools |
|----------|-------|
| **Core** | `list_tool_packs`, `list_registered_users`, `list_tools`, `call_tool` |
| **User Management** | `create_registered_user`, `get_registered_user`, `update_registered_user`, `delete_registered_user` |
| **Tool Packs** | `create_tool_pack`, `get_tool_pack`, `update_tool_pack`, `delete_tool_pack` |
| **Connectors** | `list_connectors`, `get_connector` |
| **Authentication** | `create_link_token`, `delete_credential` |
| **Discovery & Audit** | `search_tools`, `list_audit_log` |

## Troubleshooting

**MCP server not showing in Cursor**
- Make sure you ran `npm run build` — the server needs `dist/index.js`
- Check that `MERGE_API_KEY` is set in your environment
- Restart Cursor after adding the environment variable

**"MERGE_API_KEY environment variable is not set"**
- Add `export MERGE_API_KEY="..."` to your shell profile and restart your terminal
- Reopen the project in Cursor

**Connector tools not appearing after setup**
- The tool pack must have `tool_names` populated. Re-run `/setup` and create a new tool pack — the command automatically discovers and adds all available tools.

**Authentication required errors**
- Say "auth [connector name]" to generate an OAuth link
- Complete the authentication in your browser, then retry your request

## License

MIT
