# Render Agent

A Manus-style autonomous operations agent for [Render](https://render.com), powered by open models on the
[Hugging Face Inference Router](https://huggingface.co/docs/inference-providers). Give it a task in plain
language and it plans, calls the Render API, waits for deploys, reads logs, verifies with real HTTP checks,
and reports back.

```
$ render-agent "checkout is throwing 500s. figure out why and roll back if the last deploy caused it"
model: Qwen/Qwen3-Coder-Next · mode: ask
  → list_services {"name":"checkout"}
  → list_deploys {"serviceId":"srv-abc","limit":5}
  → get_logs {"resourceId":"srv-abc","level":"error","hours":1}
  → list_events {"serviceId":"srv-abc"}

  WRITE action: rollback_deploy {"serviceId":"srv-abc","deployId":"dep-prev"}
  Run it? [y/N] y
  → wait_for_deploy {"serviceId":"srv-abc","deployId":"dep-rb1"}
  → http_check {"url":"https://checkout.onrender.com/healthz"}

Rolled checkout back to dep-prev; /healthz returns 200 in 180 ms.
Root cause: the latest deploy (dep-new, "bump stripe sdk") fails with `TypeError: stripe.paymentIntents is undefined` ...
```

It ships three front doors that share one agent and one tool catalog:

| Front door | Command | Use it for |
| --- | --- | --- |
| CLI | `npx render-agent "<task>"` | terminal work, interactive y/N approval of every change |
| Web UI | `npm start` or deploy `render.yaml` | a hosted "GPT" for your team, token-protected |
| MCP server | `.mcp.json` | Claude Code calls the Render tools directly or delegates whole tasks |

## Setup

1. **Hugging Face token** with *Make calls to Inference Providers*: https://huggingface.co/settings/tokens
2. **Render API key**: https://dashboard.render.com/u/settings#api-keys
3. `cp .env.example .env`, fill in `HF_TOKEN` and `RENDER_API_KEY`, then `npm install`.

Node 20.12 or newer. The only runtime dependency is the MCP SDK.

### Picking a model

Any tool-calling model on the router works. Set `HF_MODEL` (append `:provider` to pin a provider, e.g.
`Qwen/Qwen3-Coder-Next:novita`). List what is available:

```
curl -s https://router.huggingface.co/v1/models | jq -r '.data[].id'
```

Tested targets: `Qwen/Qwen3-Coder-Next` (default), `zai-org/GLM-5.3-Flash`, `moonshotai/Kimi-K2.7-Code`,
`openai/gpt-oss-120b`, `deepseek-ai/DeepSeek-V3.2`. Coder-tuned models follow the "act then verify" loop best.

## Free rendering (Hugging Face Spaces)

The agent can generate and edit images without any MCP server, by calling Hugging Face Spaces' Gradio HTTP API
directly. ZeroGPU Spaces are free with a daily quota but reject anonymous calls, so `HF_TOKEN` is required.

```
render-agent "render a matte black headphone on a marble pedestal, then remove the background"
```

`render_image` uses `evalstate/flux1_schnell`. For anything else, `space_info` reports a Space's endpoints and
parameter order, and `call_space` invokes one, e.g. `not-lain/background-removal`, `fffiloni/InstantIR`, or
your own duplicated `FLUX.2-Klein-Multi-LoRA`. Results come back as file URLs on the Space.

## Permission modes

Every tool has a risk tier. The mode decides what runs without a human:

| Mode | read (list, logs, metrics, http_check) | write (deploy, rollback, restart, scale, env vars) | destructive (suspend, delete) |
| --- | --- | --- | --- |
| `read-only` | ✓ | ✗ | ✗ |
| `safe` (default) | ✓ | ✓ | ✗ |
| `auto` | ✓ | ✓ | ✓ |
| `ask` (CLI default) | ✓ | prompt | prompt |

A denied call is reported back to the model as a policy error so it explains what it wanted instead of
retrying. The web UI and MCP server clamp requested modes to `AGENT_MAX_MODE`, so a shared deployment can
never exceed what you configured server-side. `delete_service` additionally requires the service name typed
back as confirmation.

## CLI

```
render-agent "list my services and which ones are suspended"
render-agent --safe "redeploy api with a clean build cache and tell me when it is live"
render-agent --yes "suspend every preview-* service"
render-agent            # interactive session with memory across turns
```

Flags: `--yes/-y` (auto), `--safe`, `--read-only`, `--model <id>`, `--max-steps <n>`, `--quiet`.

## Web UI

```
npm start          # http://localhost:3000
```

Set `AGENT_ACCESS_TOKEN` to require a bearer token (the page asks for it once). Conversations are kept in
memory per browser session. Streams every tool call live over Server-Sent Events.

**Deploy it on Render**:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/keturahaivision/UI-UX-21ST-)

The included `render.yaml` is a Blueprint. Click the button (or create a new Blueprint from this repo). The Blueprint uses the free instance type, which sleeps after 15 minutes idle and wakes on the next request;
paste `HF_TOKEN` and `RENDER_API_KEY` when prompted, and Render generates `AGENT_ACCESS_TOKEN` for you
(read it from the service's Environment tab). Set `AGENT_MAX_MODE` to `auto` only if you want the hosted
agent to be able to suspend and delete.

## Claude Desktop

One script wires Hugging Face (free rendering via Spaces), Comfy Cloud, and the Render Agent server into
Claude Desktop: `node scripts/setup-claude-desktop.js`. Full walkthrough in [docs/claude-desktop.md](docs/claude-desktop.md).

## Claude Code integration

`.mcp.json` registers the MCP server for this project. Export `HF_TOKEN` and `RENDER_API_KEY` in your shell,
open Claude Code in this directory, and approve the `render-agent` server when prompted. Then:

- Ask Claude Code directly: *"use render tools to show me error logs for api from the last hour"*. It calls
  `get_logs` and friends itself.
- Delegate: *"run render_agent_run to diagnose why checkout is 500ing and fix it"*. The Hugging Face model
  does the multi-step work and returns a report plus a step transcript.

`.mcp.json` also registers **comfy-cloud** (ComfyUI's hosted MCP server at `https://cloud.comfy.org/mcp`) for
image and video generation. Run `/mcp` in Claude Code, pick `comfy-cloud`, and authenticate in the browser.
For a local ComfyUI instead, follow https://docs.comfy.org/agent-tools/mcp.md and run
`claude mcp add comfy-mcp -e COMFY_BIN=/path/to/venv/bin/comfy -- comfy-mcp`.

The `.claude/skills/render-ops` skill teaches Claude Code the playbook (resolve IDs first, wait for deploys,
verify with logs and HTTP). Policy is enforced by `AGENT_MAX_MODE` in the server's environment, not by the
model.

## Tools

| Tool | Risk | What it does |
| --- | --- | --- |
| `list_owners`, `list_services`, `get_service` | read | discover workspaces and services, resolve names to IDs |
| `list_deploys`, `get_deploy`, `list_events` | read | deploy history and service events |
| `get_logs` | read | logs with text, level, and type filters over a time window |
| `get_metrics` | read | cpu, memory, http-requests, http-latency, instance-count, bandwidth, active-connections |
| `list_env_vars` | read | keys with masked values (`reveal: true` to show) |
| `list_custom_domains`, `list_datastores` | read | domains, Postgres and Key Value instances |
| `http_check` | read | GET a URL, report status, latency, body preview |
| `space_info` | read | list a Hugging Face Space's API endpoints and parameters |
| `render_image`, `call_space` | write | free image generation on ZeroGPU Spaces (FLUX.1 schnell by default), or any Space endpoint: editing, background removal, image-to-video, TTS |
| `wait_for_deploy` | read | poll a deploy to a terminal state |
| `trigger_deploy`, `cancel_deploy`, `rollback_deploy` | write | ship, stop, or revert |
| `restart_service`, `resume_service`, `scale_service` | write | runtime control |
| `set_env_var`, `update_service`, `create_web_service` | write | configuration and provisioning |
| `suspend_service`, `delete_env_var`, `delete_service` | destructive | gated behind `auto` or an explicit yes |

## Development

```
npm test        # node --test with mocked Render and Hugging Face; no keys needed
```

Add a tool in `src/tools.js` (name, risk, description, JSON-schema parameters, `run`) and it appears in the
CLI, web UI, and MCP server automatically.
