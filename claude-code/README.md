# Merge Agent Handler — Claude Code & Cowork Plugin

Connect [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Cowork](https://claude.ai/cowork) to hundreds of enterprise applications via [Merge Agent Handler](https://merge.dev/agent-handler).

## What It Does

This plugin gives Claude Code and Cowork secure access to enterprise tools like Jira, Salesforce, HubSpot, Slack, Gong, Workday, and hundreds more — all through a single integration. [See all available connectors](https://docs.ah.merge.dev/connectors).

Once installed, you can ask Claude to:
- **Create a Jira ticket** for a bug you just found
- **Search Salesforce contacts** matching a company
- **Check your Gong calls** from last week
- **Post a message to Slack** in a specific channel
- **Look up employee info in Workday**
- And much more across hundreds of integrations

## Installation

### 1. Get your API key

Sign up at [ah.merge.dev/login](https://ah.merge.dev/login) and copy your **Production** or **Test Access Key**.

### 2. Set your API key

Add to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
export MERGE_API_KEY="your-api-key-here"
```

### 3. Install the plugin

#### From a marketplace (recommended)

If this plugin is available in a Claude Code marketplace:

```bash
claude plugin install merge-agent-handler
```

#### Local development

Clone the repo and install locally:

```bash
git clone https://github.com/merge-api/ah-plugins.git
cd ah-plugins/claude-code
npm install
npm run build
```

Then run Claude Code with the plugin:

```bash
claude --plugin-dir ./
```

## Usage

### First-time setup

Say **"set up Merge"** or run `/merge-agent-handler:setup` to start the interactive setup wizard:

1. **Pick or create a Registered User** — your identity in Merge
2. **Pick or create a Tool Pack** — choose which integrations to enable (Jira, Slack, Gong, etc.)
3. **Authenticate** — click the link to connect each service via OAuth

### Everyday use

After setup, just ask naturally:

- "Create a Jira ticket for the login bug"
- "Find all Salesforce contacts at Acme Corp"
- "Show me my recent Gong calls"
- "Send a Slack message to #engineering"

### Managing integrations

- **Add a connector:** "add Slack" or "add GitHub"
- **Authenticate a connector:** "auth Jira" or "connect Salesforce"
- **Re-run setup:** "set up Merge"

## How It Works

The plugin provides:

1. **An MCP server** with 18 tools for managing Merge Agent Handler resources (users, tool packs, connectors, credentials, audit logs)
2. **A skill** that teaches Claude how to use Merge's four workflows (Setup, Add Connector, Authenticate, Usage)
3. **A setup command** (`/merge-agent-handler:setup`) for interactive guided setup

All enterprise tool calls go through Merge's secure API, with per-user OAuth authentication.

## Plugin Structure

```
claude-code/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── .mcp.json                # MCP server configuration
├── commands/
│   └── setup.md             # Interactive setup command
├── skills/
│   └── merge-tools/
│       └── SKILL.md         # Agent skill with flow guidance
├── src/
│   ├── index.ts             # MCP server entry point
│   ├── mergeApiClient.ts    # Merge API HTTP client
│   ├── types.ts             # TypeScript interfaces
│   └── tools/               # 18 MCP tool definitions
├── package.json
└── tsconfig.json
```

## Resources

- [Agent Handler Overview](https://docs.ah.merge.dev/Overview/Agent-Handler-intro)
- [API Reference](https://docs.ah.merge.dev/api-reference/overview)
- [Available Connectors](https://docs.ah.merge.dev/connectors)
- [Dashboard](https://ah.merge.dev/)

## License

MIT
