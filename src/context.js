// Shared bootstrap: load .env, build the Render client, the HF LLM, and the tool catalog.
import { createLLM } from './hf.js';
import { RenderClient } from './render.js';
import { buildTools } from './tools.js';

export function loadEnv(path = '.env') {
  try {
    process.loadEnvFile?.(path);
  } catch {
    // No .env file: rely on the process environment.
  }
}

export function createContext({ model } = {}) {
  loadEnv();
  const render = new RenderClient();
  const llm = createLLM(model ? { model } : {});
  const tools = buildTools({ render });
  return { render, llm, tools };
}

export function maxMode() {
  const m = process.env.AGENT_MAX_MODE || 'safe';
  if (!['read-only', 'safe', 'auto'].includes(m)) throw new Error(`AGENT_MAX_MODE must be read-only, safe, or auto (got "${m}")`);
  return m;
}
