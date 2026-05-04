import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "merge-agent-handler",
  name: "Merge Agent Handler",
  description:
    "Connect OpenClaw agents to hundreds of enterprise tools (Jira, Salesforce, Slack, Gong, Workday, GitHub, etc.) via Merge Agent Handler.",
  register() {
    // This plugin ships only OpenClaw skills (see ./skills/).
    // The bundled merge-agent-handler-setup skill teaches the agent to
    // call `merge search-tools` and `merge execute-tool` via the exec tool,
    // so there is nothing to register at runtime.
  },
});
