# Merge Agent Handler — Plugins

Official plugins that connect AI coding agents to **100+ enterprise tools** via [Merge Agent Handler](https://docs.ah.merge.dev).

Create Jira tickets, search Salesforce contacts, send Slack messages, check Gong calls, and more — directly from your coding agent.

## Available Plugins

| Plugin | Agent | Status |
|--------|-------|--------|
| [**cursor/**](cursor/) | [Cursor](https://cursor.com) | Available |
| **claude-code/** | [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Coming soon |

## Quick Start

### Cursor

```bash
cd cursor
npm install && npm run build
```

Set your API key and open the `cursor/` folder in Cursor:

```bash
export MERGE_API_KEY="your-api-key-here"
```

Then type `/setup` in Cursor's agent chat to get started. See [cursor/README.md](cursor/README.md) for full instructions.

## What is Merge Agent Handler?

[Merge Agent Handler](https://docs.ah.merge.dev) is a platform that gives AI agents access to 100+ enterprise applications through a single API. Instead of building individual integrations, your agent connects to Merge and gets instant access to tools across:

- **Project Management** — Jira, Linear, Asana, Monday.com
- **CRM** — Salesforce, HubSpot, Pipedrive
- **Communication** — Slack, Microsoft Teams
- **HR** — Workday, BambooHR, Gusto
- **Revenue Intelligence** — Gong, Chorus
- **Developer Tools** — GitHub, GitLab, Bitbucket
- And many more

## Getting an API Key

Visit [docs.ah.merge.dev](https://docs.ah.merge.dev) to sign up and get your `MERGE_API_KEY`.

## License

MIT
