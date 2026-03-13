# Merge Agent Handler — Plugins

Official plugins that connect AI coding agents to enterprise tools via [Merge Agent Handler](https://merge.dev/agent-handler).

## What is Merge Agent Handler?

[Merge Agent Handler](https://merge.dev/agent-handler) gives AI agents secure, managed access to hundreds of enterprise applications through a single API and the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

Instead of building and maintaining individual integrations, your agent connects to Merge and gets instant access to tools across your entire software stack — from everyday apps like Jira, Salesforce, Slack, and GitHub to enterprise systems that have never been accessible to AI agents before, like Workday, NetSuite, Tripadvisor, and more. [See all available connectors](https://docs.ah.merge.dev/connectors).

Each integration is exposed as a set of callable tools (e.g., `jira__create_issue`, `salesforce__search_contacts`, `gong__list_calls`) that your agent can discover, authenticate, and execute.

### Key Concepts

| Concept | What it is |
|---------|------------|
| **Registered User** | An identity in Merge that represents a person or service account. Tracks which third-party apps they've authenticated with. When a tool is called, it acts on behalf of a specific Registered User — using their authenticated connections to read or write data. |
| **Tool Pack** | A bundle of connectors that defines which integrations your agent can access. Each Tool Pack contains one or more connectors (e.g., Jira + Slack + Gong) and exposes their capabilities as callable MCP tools. |
| **Connector** | A specific third-party integration (e.g., Jira, Salesforce, Gong). Each connector provides a set of tools for reading and writing data in that service. |
| **MCP Tool** | A single callable operation exposed by a connector — like `jira__create_issue` or `gong__list_calls`. Tools are discovered dynamically and follow the [Model Context Protocol](https://modelcontextprotocol.io/) standard. |
| **Link Token** | A one-time URL used to authenticate a connector. When a user clicks the link, they complete an OAuth flow to connect their account (e.g., sign in to Jira). After that, the agent can access their data. |

### How It Works

1. **Create a Registered User** — set up an identity for yourself or your service
2. **Create a Tool Pack** — bundle the connectors you want (e.g., Jira + Slack + Gong)
3. **Authenticate** — click a link to connect each third-party account via OAuth
4. **Use tools** — your agent discovers and calls tools like `jira__create_issue` or `gong__list_calls`

All authentication is per-user, so each person connects their own accounts and the agent acts on their behalf.

## Available Plugins

| Plugin | Agent | Status |
|--------|-------|--------|
| [**cursor/**](cursor/) | [Cursor](https://cursor.com) | Available |
| [**claude-code/**](claude-code/) | [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Available |

## Getting Started

See the README in each plugin directory for installation and usage instructions.

### Getting an API Key

Sign up at [ah.merge.dev/login](https://ah.merge.dev/login) to get your `MERGE_API_KEY` (Production or Test Access Key).

### Resources

- [Agent Handler Overview](https://docs.ah.merge.dev/Overview/Agent-Handler-intro)
- [API Reference](https://docs.ah.merge.dev/api-reference/overview)
- [Dashboard](https://ah.merge.dev/)
- [merge.dev/agent-handler](https://merge.dev/agent-handler)

## License

MIT
