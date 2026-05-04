# Merge Agent Handler — Cursor Plugin

Connect [Cursor](https://cursor.com)'s AI agent to hundreds of enterprise applications via [Merge Agent Handler](https://merge.dev/agent-handler) — Jira, Salesforce, HubSpot, Slack, Gong, Workday, GitHub, and more.

This plugin is a thin wrapper around the [Merge CLI](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally), which handles installation, OAuth, and writing the right config to your project.

## Prerequisites

- Python 3.10+
- [pipx](https://pipx.pypa.io/) — on macOS: `brew install pipx && pipx ensurepath`

## Setup

After installing the plugin, run the setup command in Cursor's chat:

```
/setup
```

This runs the three Merge CLI commands for you:

```bash
pipx install merge-api    # install the CLI
merge login               # OAuth in browser
merge setup cursor        # writes Merge instructions to .cursorrules
```

## Usage

Just ask Cursor's agent what you need:

> "List the issues assigned to me in Jira."
> "Find Salesforce contacts at acme.com."
> "Send a Slack message to #engineering."
> "Show my recent Gong calls."

The first time you use a given connector, the agent will give you a Magic Link to sign in to that service via OAuth. After that, it can call tools on your behalf.

## Manual setup

If you'd rather run the commands yourself instead of using `/setup`:

```bash
pipx install merge-api
merge login
merge setup cursor
```

See the full guide: [Set up your agent locally](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally).

## Resources

- [Merge Agent Handler docs](https://docs.merge.dev/merge-agent-handler)
- [merge.dev/agent-handler](https://merge.dev/agent-handler)

## License

MIT
