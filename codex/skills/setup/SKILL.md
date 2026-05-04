---
name: setup
description: Set up Merge Agent Handler so Codex can call enterprise tools (Jira, Salesforce, Slack, Gong, Workday, GitHub, etc.) — runs the Merge CLI to install, authenticate, and configure Codex.
---

# Set Up Merge Agent Handler

Walk the user through installing and configuring the [Merge CLI](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally). The CLI itself does the work — your job is to run the commands and report progress.

## Step 1: Verify the Merge CLI is installed

Check:
```bash
command -v merge >/dev/null && merge --version
```

If `merge` is found, skip to Step 2.

If not, install it (requires Python 3.10+):
```bash
pipx install merge-api
```

If `pipx` is not available, stop and tell the user:
> The Merge CLI requires `pipx` (and Python 3.10+) to install. Install pipx and re-run the setup.
> - macOS: `brew install pipx && pipx ensurepath`
> - Other platforms: https://pipx.pypa.io/stable/installation/

## Step 2: Authenticate

Run:
```bash
merge login
```

This opens an OAuth flow in the user's browser. The command blocks until they finish — wait for it to return. If it succeeds, the CLI stores their token locally.

## Step 3: Configure Codex

Run from the project root:
```bash
merge setup agents-md
```

This writes a `## Merge CLI` section to `AGENTS.md` so Codex (and any other AGENTS.md-following agent) knows when to call `merge search-tools` and `merge execute-tool`. It's idempotent — safe to re-run. The user may need to restart Codex for it to re-read `AGENTS.md`.

## Done

Tell the user:
> Setup complete. Try a request like "List all the repos I have access to in GitHub, and my open PRs in each." The first time you use a connector, you'll get a Magic Link to sign in to that service — after that, I can call its tools on your behalf.
