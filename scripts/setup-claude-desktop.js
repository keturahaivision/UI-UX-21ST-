#!/usr/bin/env node
// Merge the three MCP servers (hugging-face, comfy-cloud, render-agent) into Claude Desktop's config.
// Usage: node scripts/setup-claude-desktop.js [--dry-run] [--config <path>]
// Reads HF_TOKEN, RENDER_API_KEY, HF_MODEL, AGENT_MAX_MODE from the environment or ./.env.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile?.(join(root, '.env')); } catch { /* no .env */ }

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const configArg = args.includes('--config') ? args[args.indexOf('--config') + 1] : null;

export function defaultConfigPath(platform = process.platform, env = process.env, home = os.homedir()) {
  if (platform === 'darwin') return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  if (platform === 'win32') return join(env.APPDATA || join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  return join(env.XDG_CONFIG_HOME || join(home, '.config'), 'Claude', 'claude_desktop_config.json');
}

export function buildServers({ repoRoot = root, env = process.env, platform = process.platform } = {}) {
  const hfToken = env.HF_TOKEN || 'hf_xxx';
  // Windows needs the .cmd shims when Claude Desktop spawns npm-installed binaries.
  const npx = platform === 'win32' ? 'npx.cmd' : 'npx';
  return {
    'hugging-face': {
      command: npx,
      args: ['-y', 'mcp-remote', 'https://huggingface.co/mcp', '--header', `Authorization: Bearer ${hfToken}`],
    },
    'comfy-cloud': {
      command: npx,
      args: ['-y', 'mcp-remote', 'https://cloud.comfy.org/mcp'],
    },
    'render-agent': {
      command: 'node',
      args: [join(repoRoot, 'src', 'mcp.js')],
      env: {
        HF_TOKEN: hfToken,
        RENDER_API_KEY: env.RENDER_API_KEY || 'rnd_xxx',
        HF_MODEL: env.HF_MODEL || 'Qwen/Qwen3-Coder-Next',
        AGENT_MAX_MODE: env.AGENT_MAX_MODE || 'safe',
      },
    },
  };
}

export function mergeConfig(existing, servers) {
  const out = { ...(existing || {}) };
  out.mcpServers = { ...(out.mcpServers || {}), ...servers };
  return out;
}

function main() {
  const path = configArg || defaultConfigPath();
  let existing = {};
  if (existsSync(path)) {
    try { existing = JSON.parse(readFileSync(path, 'utf8')); }
    catch (err) { console.error(`Could not parse ${path}: ${err.message}`); process.exit(1); }
  }
  const merged = mergeConfig(existing, buildServers());
  const json = JSON.stringify(merged, null, 2) + '\n';

  const missing = ['HF_TOKEN', 'RENDER_API_KEY'].filter((k) => !process.env[k]);
  if (missing.length) console.warn(`Warning: ${missing.join(', ')} not set; placeholders written. Edit the file or re-run with them exported.`);

  if (dryRun) { console.log(`# would write ${path}\n${json}`); return; }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, json);
  console.log(`Wrote ${path}\nRestart Claude Desktop, then: Settings → Connectors → hugging-face / comfy-cloud → sign in.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
