---
name: merge-agent-handler-setup
description: Set up Merge Agent Handler so OpenClaw can call hundreds of enterprise tools (Jira, Salesforce, Slack, Gong, Workday, GitHub, etc.) — runs the Merge CLI to install and authenticate.
homepage: https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally
---

# Set Up Merge Agent Handler

Walk the user through installing and authenticating the [Merge CLI](https://docs.merge.dev/merge-agent-handler/local-agent-use/setup-your-agent-locally). The CLI itself does the work — your job is to run the commands and report progress.

After setup, you have access to two tools the Merge CLI exposes:

- `merge search-tools <query>` — discover which connector tools exist (e.g. "list jira issues").
- `merge execute-tool <tool> [args...]` — run a discovered tool. The first call to a connector returns a Magic Link the user signs in with; subsequent calls reuse that auth.

Use the `exec` tool to run shell commands.

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

## Step 3: Confirm the agent can reach merge

Run:

```bash
merge search-tools "list issues"
```

If this returns at least one tool, setup is complete. If it errors with an auth message, ask the user to re-run `merge login`.

## Done

Tell the user:

> Setup complete. Try a request like "List all the repos I have access to in GitHub, and my open PRs in each." The first time you use a given connector, you'll get a Magic Link to sign in to that service — after that, I can call its tools on your behalf.

## When to run again

The skill is idempotent. Re-run it if:

- The user reinstalls OpenClaw on a new machine.
- `merge` commands start failing with auth errors (`merge login` again).
- The user wants to confirm everything still works after a long break.
