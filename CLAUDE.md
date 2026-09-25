# render-agent

Manus-style operations agent for Render.com. The reasoning model runs on the Hugging Face Inference Router
(OpenAI-compatible tool calling); the tools wrap the Render REST API.

## Layout
- `src/hf.js` – HF router chat client with tool calling, retries, `<think>` stripping.
- `src/render.js` – thin Render API client.
- `src/spaces.js` – Hugging Face Spaces (Gradio) HTTP client for free rendering; needs `HF_TOKEN`.
- `src/tools.js` – tool catalog with risk tiers (`read` / `write` / `destructive`) and the policy `authorize()`.
- `src/agent.js` – the agent loop and system prompt.
- `src/cli.js`, `src/server.js` + `public/index.html`, `src/mcp.js` – the three front doors.
- `test/` – `node --test` suites with mocked fetch; no network or keys needed.

## Conventions
- Node 20.12+, ESM, no build step, only dependency is `@modelcontextprotocol/sdk`.
- Every new tool needs: `name`, `risk`, `description`, JSON-schema `parameters`, `run(args)`; add a test in `test/tools.test.js`.
- Never log env var values; use the `maskValue` helper.
- Run `npm test` before committing.

## Using it from Claude Code
`.mcp.json` registers the MCP server. With `HF_TOKEN` and `RENDER_API_KEY` exported, Claude Code can call
`list_services`, `get_logs`, `trigger_deploy`, etc. directly, or hand a whole task to `render_agent_run`.
See `.claude/skills/render-ops/SKILL.md`.
