---
name: render-ops
description: Operate Render.com production services through the render-agent MCP server. Use when the user asks to deploy, roll back, restart, scale, inspect logs/metrics, edit env vars, or debug a failing Render service.
---

# Render operations

The `render-agent` MCP server (from `.mcp.json`) exposes two kinds of tools.

## Direct tools (fast, precise)
`list_services`, `get_service`, `list_deploys`, `get_deploy`, `list_events`, `get_logs`, `get_metrics`,
`list_env_vars`, `list_custom_domains`, `list_datastores`, `http_check`, `wait_for_deploy`,
`trigger_deploy`, `cancel_deploy`, `rollback_deploy`, `restart_service`, `resume_service`, `scale_service`,
`set_env_var`, `update_service`, `create_web_service`, `suspend_service`, `delete_env_var`, `delete_service`.

Each description is prefixed with its risk tier. The server enforces `AGENT_MAX_MODE`
(`read-only` < `safe` < `auto`); a denied call returns an error naming the tier, so do not retry it.

## Delegation
`render_agent_run(task, mode?)` hands a whole multi-step task to the Hugging Face-powered agent, which plans,
acts, verifies, and returns a report plus a step transcript. Prefer it for open-ended work
("figure out why checkout is 500ing and fix it") and direct tools for single precise actions.

## Playbook
1. Resolve names to IDs with `list_services` before acting.
2. Before a rollback, `list_deploys` and pick the last deploy with status `live`.
3. After `trigger_deploy` / `rollback_deploy`, call `wait_for_deploy`, then `get_logs` (level=error) and
   `http_check` on the service URL. Report what you observed, not what you expect.
4. Never print env var values unless the user explicitly asks; `list_env_vars` masks them by default.
