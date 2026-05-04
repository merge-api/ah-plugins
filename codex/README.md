# Merge Agent Handler — Codex Plugin

Connect [Codex](https://developers.openai.com/codex/) to hundreds of enterprise applications via [Merge Agent Handler](https://merge.dev/agent-handler) — Jira, Salesforce, HubSpot, Slack, Gong, Workday, GitHub, and more.

This plugin is a thin wrapper around the [Merge CLI](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally), which handles installation, OAuth, and writing the right config to your project.

## Prerequisites

- Python 3.10+
- [pipx](https://pipx.pypa.io/) — on macOS: `brew install pipx && pipx ensurepath`

## Install

Add this repo as a Codex marketplace, then install the plugin:

```bash
codex plugin marketplace add merge-api/ah-plugins
codex plugin install merge-agent-handler
```

## Setup

After installing, ask Codex to **set up Merge Agent Handler**. Codex will activate the bundled `setup` skill, which runs the three Merge CLI commands for you:

```bash
pipx install merge-api    # install the CLI
merge login               # OAuth in browser
merge setup agents-md     # writes a "## Merge CLI" section to AGENTS.md
```

`merge setup agents-md` works for any agent that follows the [AGENTS.md](https://agents.md) convention — Codex, Aider, and others. You may need to restart Codex afterward so it re-reads `AGENTS.md`.

## Usage

Just ask Codex what you need:

> "List the issues assigned to me in Jira."
> "Find Salesforce contacts at acme.com."
> "Send a Slack message to #engineering."
> "Show my recent Gong calls."

The first time you use a given connector, Codex will give you a Magic Link to sign in to that service via OAuth. After that, the agent can call its tools on your behalf.

## Manual setup

If you'd rather run the commands yourself instead of letting the skill do it:

```bash
pipx install merge-api
merge login
merge setup agents-md
```

See the full guide: [Set up your agent locally](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally).

## Resources

- [Merge Agent Handler docs](https://docs.merge.dev/merge-agent-handler)
- [merge.dev/agent-handler](https://merge.dev/agent-handler)

## License

MIT
