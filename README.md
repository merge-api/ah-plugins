# Merge Agent Handler — Plugins

Official plugins that connect AI coding agents to enterprise tools via [Merge Agent Handler](https://merge.dev/agent-handler).

Each plugin is a thin wrapper around the [Merge CLI](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally) — the CLI handles installation, OAuth, and writing the right config for your agent of choice.

## What is Merge Agent Handler?

[Merge Agent Handler](https://merge.dev/agent-handler) gives AI agents secure, managed access to hundreds of enterprise applications — Jira, Salesforce, HubSpot, Slack, Gong, Workday, GitHub, NetSuite, and more — through a single integration.

## Plugins

| Plugin | Agent | Setup command |
|--------|-------|---------------|
| [**cursor/**](cursor/) | [Cursor](https://cursor.com) | `/setup` |
| [**claude-code/**](claude-code/) | [Claude Code](https://docs.anthropic.com/en/docs/claude-code) / [Cowork](https://claude.ai/cowork) | `/merge-agent-handler:setup` |

After installing the plugin, run the setup command in your agent's chat. It runs:

```bash
pipx install merge-api    # install the Merge CLI (requires Python 3.10+)
merge login               # OAuth in browser
merge setup <agent>       # writes config for the agent (claude-code or cursor)
```

You can also run those commands yourself if you prefer.

## Usage

After setup, just ask your agent:

- "List the issues assigned to me in Jira."
- "Find Salesforce contacts at acme.com."
- "Send a Slack message to #engineering."
- "Show my recent Gong calls."

The first time you use a connector, you'll get a Magic Link to authenticate that service via OAuth. After that, your agent can call tools on your behalf.

## Resources

- [Set up your agent locally](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally)
- [Merge Agent Handler docs](https://docs.merge.dev/merge-agent-handler)
- [merge.dev/agent-handler](https://merge.dev/agent-handler)

## License

MIT
