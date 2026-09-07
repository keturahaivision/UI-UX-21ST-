// Hugging Face Inference Router client (OpenAI-compatible chat completions with tool calling).
// Docs: https://huggingface.co/docs/inference-providers

export const DEFAULT_BASE_URL = 'https://router.huggingface.co/v1';
export const DEFAULT_MODEL = 'Qwen/Qwen3-Coder-Next';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createLLM({
  apiKey = process.env.HF_TOKEN,
  baseUrl = process.env.HF_BASE_URL || DEFAULT_BASE_URL,
  model = process.env.HF_MODEL || DEFAULT_MODEL,
  temperature = 0.2,
  maxTokens = 4096,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!apiKey) {
    throw new Error(
      'HF_TOKEN is not set. Create a token with "Make calls to Inference Providers" at https://huggingface.co/settings/tokens',
    );
  }

  return {
    model,
    async chat({ messages, tools, signal }) {
      const body = { model, messages, temperature, max_tokens: maxTokens };
      if (tools?.length) {
        body.tools = tools;
        body.tool_choice = 'auto';
      }

      let lastError;
      for (let attempt = 0; attempt < 4; attempt++) {
        const res = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
          signal,
        });

        if (res.status === 429 || res.status >= 500) {
          lastError = new Error(`HF router ${res.status}: ${(await res.text()).slice(0, 300)}`);
          await sleep(750 * 2 ** attempt);
          continue;
        }
        if (!res.ok) {
          throw new Error(`HF router ${res.status}: ${(await res.text()).slice(0, 500)}`);
        }

        const data = await res.json();
        const choice = data.choices?.[0];
        if (!choice?.message) throw new Error('HF router returned no choices');
        return {
          message: normalizeMessage(choice.message),
          finishReason: choice.finish_reason,
          usage: data.usage,
        };
      }
      throw lastError;
    },
  };
}

// Make the assistant message safe to append back into history regardless of provider quirks.
function normalizeMessage(message) {
  const out = { role: 'assistant', content: stripThinking(message.content ?? '') };
  if (Array.isArray(message.tool_calls) && message.tool_calls.length) {
    out.tool_calls = message.tool_calls.map((tc, i) => ({
      id: tc.id || `call_${i}`,
      type: 'function',
      function: {
        name: tc.function?.name,
        arguments:
          typeof tc.function?.arguments === 'string'
            ? tc.function.arguments
            : JSON.stringify(tc.function?.arguments ?? {}),
      },
    }));
  }
  return out;
}

// Some reasoning models emit <think>...</think> blocks inline.
function stripThinking(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
}

export function parseToolArguments(raw) {
  if (raw == null || raw === '') return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    // Some models double-encode or trail garbage; try the outermost object.
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error(`Tool arguments are not valid JSON: ${raw.slice(0, 200)}`);
  }
}
