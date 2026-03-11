# Merge Agent Handler — Cursor Plugin

Connect Cursor's AI agent to **100+ enterprise tools** (Jira, Salesforce, HubSpot, GitHub, Slack, Workday, Gong, and more) via [Merge Agent Handler](https://merge.dev/agent-handler).

Discover, authenticate, and call enterprise tools directly from Cursor's chat — no context switching required.

## What This Plugin Does

This plugin teaches Cursor's AI agent how to interact with Merge Agent Handler. Once installed, the agent can:

- **Call enterprise tools** — create Jira tickets, search Salesforce contacts, list Gong calls, send Slack messages, and more
- **Handle authentication** — automatically detects when a connector needs OAuth and generates a link for you to click
- **Manage resources** — create and configure Tool Packs, Registered Users, and connectors without leaving the IDE
- **Discover tools dynamically** — searches 100+ integrations by natural language intent (e.g., "find a tool that creates issues")

## What's Included

| Component | File | What it does |
|-----------|------|-------------|
| **Rule** | `rules/merge-agent-handler.mdc` | Always-on guidance that teaches the agent the full Merge API — how to call endpoints, handle auth flows, manage tool packs, and present results cleanly. This is the core of the plugin. |
| **Command** | `commands/setup.md` | Interactive `/setup` command that walks you step-by-step through creating a Registered User, choosing a Tool Pack, and selecting connectors. |
| **Skill** | `skills/merge-tools/SKILL.md` | Trigger phrases like "create a Jira ticket" or "check my Gong calls" that activate the enterprise tool workflow. |
| **MCP Server** | `src/` | A local MCP server (stdio) exposing 18 tools for tool discovery, execution, and resource management. Powers the agent's ability to list and call tools programmatically. |

### Key Concepts

If you're new to Merge Agent Handler, here's what the terms mean:

| Concept | What it is |
|---------|------------|
| **Registered User** | Your identity in Merge. It represents a person (or service account) and tracks which third-party apps you've authenticated with. When the agent calls a tool, it acts on behalf of your Registered User — using your authenticated connections to read or write data in Jira, Salesforce, Gong, etc. |
| **Tool Pack** | A bundle of connectors that your agent can access. For example, a Tool Pack might include Jira + Slack + Gong, giving your agent the ability to create tickets, send messages, and check call data — all from Cursor. You can have multiple Tool Packs for different workflows. |
| **Connector** | A specific integration with a third-party service (e.g., Jira, Salesforce, Gong). Each connector exposes a set of tools for reading and writing data in that service. |
| **MCP Tool** | A single callable operation — like `jira__create_issue`, `gong__list_calls`, or `salesforce__search_contacts`. Tools are discovered dynamically from your Tool Pack. |
| **Link Token** | A one-time authentication URL. When you need to connect a new service, the agent generates a link — you click it, complete the OAuth flow in your browser, and the agent can then access your data in that service. |

## Prerequisites

- [Cursor](https://cursor.com) IDE
- A Merge Agent Handler API key — [sign up at ah.merge.dev](https://ah.merge.dev/login)
- Node.js 18+

## Installation

Install this plugin from the **Cursor Plugin Store**:

1. Open Cursor
2. Go to **Settings > Plugins**
3. Search for **Merge Agent Handler**
4. Click **Install**

## Setup

After installing the plugin, you need to configure your API key and run the setup command.

### 1. Set your API key

Add your Merge Agent Handler API key to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.) and restart your terminal:

```bash
export MERGE_API_KEY="your-api-key-here"
```

You can get your key (Production or Test Access Key) from the [Merge Agent Handler dashboard](https://ah.merge.dev/login).

### 2. Run `/setup`

Open Cursor's agent chat and type:

```
/setup
```

The setup command walks you through three steps:

1. **Select or create a Registered User** — pick an existing user or create a new one using your git name and email
2. **Select or create a Tool Pack** — pick an existing pack or create a new one
3. **Choose connectors** — if creating a new Tool Pack, select which integrations you want (e.g., Jira, Slack, Gong, Salesforce)

Setup automatically discovers all available tools for your selected connectors and saves your configuration so you don't need to repeat it.

### 3. Authenticate your connectors

After setup, connect your third-party accounts. Say:

> "auth Jira"

The agent generates an OAuth link — click it to sign in to Jira (or Salesforce, Gong, etc.) in your browser. Once authenticated, the agent can access your data.

## Usage

Once setup and authentication are complete, just ask the agent what you need:

> "Create a Jira ticket for bug X in project Y"
> "Search Salesforce contacts at acme.com"
> "List my recent Gong calls"
> "Send a Slack message to #engineering"
> "Check open deals in HubSpot"
> "List candidates in Greenhouse"

The agent automatically:
1. Finds the right tool for your request
2. Checks if the connector is authenticated (and prompts you to auth if not)
3. Calls the tool and presents the results

### Other commands

| Say this | What happens |
|----------|-------------|
| `/setup` | Re-run the full setup flow |
| "add Slack" | Add a new connector to your existing Tool Pack |
| "auth Gong" | Generate an OAuth link to connect a service |
| "list my integrations" | Show your current Tool Pack and connectors |

## How It Works

The plugin uses Merge Agent Handler's [REST API](https://docs.ah.merge.dev/api-reference/overview) and [MCP protocol](https://modelcontextprotocol.io/):

1. **Discovery** — The agent searches for tools matching your intent (e.g., "create a ticket" finds `jira__create_issue`)
2. **Authentication** — If a connector isn't authenticated, the agent detects this and generates an OAuth link automatically
3. **Execution** — The agent calls the tool via MCP (JSON-RPC) and presents the results in a clean format

Session state is persisted to `.merge-agent-handler-session.json` in your workspace so you don't need to re-run setup each conversation.

## Available MCP Tools (18)

| Category | Tools |
|----------|-------|
| **Core** | `list_tool_packs`, `list_registered_users`, `list_tools`, `call_tool` |
| **User Management** | `create_registered_user`, `get_registered_user`, `update_registered_user`, `delete_registered_user` |
| **Tool Packs** | `create_tool_pack`, `get_tool_pack`, `update_tool_pack`, `delete_tool_pack` |
| **Connectors** | `list_connectors`, `get_connector` |
| **Authentication** | `create_link_token`, `delete_credential` |
| **Discovery & Audit** | `search_tools`, `list_audit_log` |

## Project Structure

```
├── .cursor-plugin/
│   └── plugin.json              Plugin manifest
├── mcp.json                     MCP server configuration
├── commands/
│   └── setup.md                 Interactive /setup command
├── rules/
│   └── merge-agent-handler.mdc  Always-on agent guidance (the core of the plugin)
├── skills/
│   └── merge-tools/
│       └── SKILL.md             Natural language trigger phrases
├── assets/
│   └── merge-logo.png           Plugin logo
├── src/
│   ├── index.ts                 MCP server entry point (stdio)
│   ├── mergeApiClient.ts        HTTP client for Merge API
│   ├── types.ts                 TypeScript interfaces
│   └── tools/                   Tool definitions (8 modules, 18 tools)
├── package.json
└── tsconfig.json
```

## Troubleshooting

**"MERGE_API_KEY environment variable is not set"**
- Add `export MERGE_API_KEY="..."` to your shell profile and restart your terminal
- Reopen the project in Cursor

**MCP server not showing in Settings > MCP**
- Make sure you ran `npm run build` — the server needs `dist/index.js`
- Restart Cursor after setting the environment variable

**Connector tools not appearing after setup**
- The Tool Pack must have `tool_names` populated. Re-run `/setup` and create a new Tool Pack — the command automatically discovers and adds all available tools.

**"Authentication required" when calling a tool**
- Say "auth [connector name]" to generate an OAuth link
- Complete authentication in your browser, then retry your request

## Resources

- [Merge Agent Handler Overview](https://docs.ah.merge.dev/Overview/Agent-Handler-intro)
- [API Reference](https://docs.ah.merge.dev/api-reference/overview)
- [Dashboard](https://ah.merge.dev/)
- [merge.dev/agent-handler](https://merge.dev/agent-handler)

## License

MIT
