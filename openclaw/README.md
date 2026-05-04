# Merge Agent Handler — OpenClaw Plugin

Connect [OpenClaw](https://openclaw.ai) agents to hundreds of enterprise applications via [Merge Agent Handler](https://merge.dev/agent-handler) — Jira, Salesforce, HubSpot, Slack, Gong, Workday, GitHub, NetSuite, and more.

This plugin is a thin wrapper around the [Merge CLI](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally), which handles installation, OAuth, and tool execution. The plugin ships an OpenClaw skill that teaches the agent when and how to call the CLI.

## Prerequisites

- [OpenClaw](https://docs.openclaw.ai/get-started/install) installed and onboarded
- Python 3.10+
- [pipx](https://pipx.pypa.io/) — on macOS: `brew install pipx && pipx ensurepath`

## Install

Once published to [ClawHub](https://clawhub.ai):

```bash
openclaw plugins install clawhub:merge-agent-handler
```

After installing, restart your OpenClaw session so the bundled skill is picked up.

## Setup

In any OpenClaw chat (Discord, Slack, Telegram, the Control UI, …) ask the agent to **set up Merge Agent Handler**. The agent will activate the bundled `merge-agent-handler-setup` skill, which runs:

```bash
pipx install merge-api    # install the CLI
merge login               # OAuth in browser
merge search-tools "list issues"   # smoke test
```

`merge login` opens an OAuth flow in your browser. Once you finish, the CLI persists your token locally and the agent can call connector tools on your behalf.

## Usage

Just ask the agent what you need:

> "List the issues assigned to me in Jira."
> "Find Salesforce contacts at acme.com."
> "Send a Slack message to #engineering."
> "Show my recent Gong calls."

The first time you use a given connector you'll get a Magic Link to sign in to that service via OAuth. After that, the agent can call its tools on your behalf via `merge execute-tool`.

## Manual setup

If you'd rather run the commands yourself instead of letting the skill do it:

```bash
pipx install merge-api
merge login
merge search-tools "list issues"   # confirm auth works
```

See the full guide: [Set up your agent locally](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally).

## Publishing this plugin

This is a multi-plugin repo, so [ClawHub](https://clawhub.ai)'s `owner/repo` form won't work — the `package.json` lives at `openclaw/`, not the repo root. Publish from the subdirectory and override the source metadata so the registry still records the correct repo:

```bash
# from repo root, after merging to main and tagging v2.0.0
git checkout main && git pull
cd openclaw

# build once so dist/ is fresh
npm install && npm run build

# dry-run to preview the upload
clawhub package publish . --dry-run \
  --source-repo merge-api/ah-plugins \
  --source-ref v2.0.0

# real publish
clawhub package publish . \
  --source-repo merge-api/ah-plugins \
  --source-ref v2.0.0
```

See [ClawHub: Publish a plugin from GitHub](https://docs.openclaw.ai/tools/clawhub#publish-a-plugin-from-github).

## Resources

- [OpenClaw docs](https://docs.openclaw.ai)
- [ClawHub](https://clawhub.ai)
- [Merge Agent Handler docs](https://docs.merge.dev/merge-agent-handler)
- [merge.dev/agent-handler](https://merge.dev/agent-handler)

## License

MIT
