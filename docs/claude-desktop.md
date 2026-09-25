# Claude Desktop setup

Claude Desktop is the easiest way to run the whole stack because it handles the browser sign-ins
that a headless session cannot: Hugging Face (free rendering via Spaces), Comfy Cloud, and the local
Render Agent MCP server.

## 1. Prerequisites
- Claude Desktop (macOS or Windows), Node.js 20.12+ (`node --version`).
- This repo cloned locally, with `npm install` run once.
- A Hugging Face token: https://huggingface.co/settings/tokens (enable **Make calls to Inference Providers**).
- A Render API key: https://dashboard.render.com/u/settings#api-keys (only needed for the Render.com tools).

## 2. Turn on free rendering in Hugging Face
Open https://huggingface.co/settings/mcp and enable **Gradio Spaces** tools (this is the `gradio=none`
setting that blocks image and video generation when it is off). Add the Spaces you want, for example:

| Space | Does |
| --- | --- |
| `evalstate/flux1_schnell` | fast image generation |
| `mcp-tools/FLUX.1-Krea-dev`, `mcp-tools/Qwen-Image` | high-quality image generation |
| `mcp-tools/FLUX.1-Kontext-Dev`, `mcp-tools/Qwen-Image-Edit-Angles` | image editing, camera angle changes |
| `zerogpu-aoti/wan2-2-fp8da-aoti-faster` | image-to-video |
| `not-lain/background-removal`, `fffiloni/InstantIR` | background removal, restoration |
| `ResembleAI/Chatterbox` | text to speech |

These run on ZeroGPU: free, with a daily quota (higher with a PRO account).

## 3. Write the config
From the repo root, with your keys exported (or in `.env`):

```
node scripts/setup-claude-desktop.js            # writes claude_desktop_config.json
node scripts/setup-claude-desktop.js --dry-run  # just print it
```

It merges three servers into your existing config without touching other entries:

| Server | Transport | Gives Claude Desktop |
| --- | --- | --- |
| `hugging-face` | remote via `mcp-remote` | Hub search, model info, and Space invocation (free rendering) |
| `comfy-cloud` | remote via `mcp-remote` | ComfyUI Cloud workflows (sign in on first use) |
| `render-agent` | local stdio (`src/mcp.js`) | 25 Render.com tools plus `render_agent_run` delegation |

Config file locations, if you prefer to edit by hand (see `claude_desktop_config.example.json`):
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

## 4. Restart and sign in
Quit and reopen Claude Desktop. The first time a remote server starts, `mcp-remote` opens a browser tab
to complete OAuth for Hugging Face and Comfy Cloud. Check **Settings → Developer** to confirm all three
servers show as running.

## 5. Try it
- "Generate a product render of matte black headphones on marble with flux1_schnell."
- "Use render_agent_run to list my Render services and show error logs for api."
- "Take that render, remove the background, then deploy the landing page on Render."

## Troubleshooting
- **Server fails to start**: run the command from the config in a terminal, e.g.
  `node /path/to/UI-UX-21ST-/src/mcp.js`; a missing key prints a clear error.
- **`npx: command not found`**: install Node.js, or replace `npx` with its full path from `which npx`.
- **Space invoke disabled**: re-check step 2.
- **Render tools return 401**: the `RENDER_API_KEY` in the config is wrong or missing.
