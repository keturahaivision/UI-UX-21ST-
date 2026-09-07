// Manus-style agent loop: plan -> act with tools -> observe -> verify -> report.

import { parseToolArguments } from './hf.js';
import { authorize, toOpenAITools } from './tools.js';

export const SYSTEM_PROMPT = `You are Render Agent, an autonomous production-operations engineer for Render.com.
You have tools that read and change real production infrastructure. Behave like a careful senior SRE.

Operating rules:
1. Never guess IDs. Resolve service names to IDs with list_services before acting. If a name is ambiguous, list the candidates and ask.
2. Investigate before you act: check current deploys, events, and logs so your action is based on evidence.
3. Act, then verify. After trigger_deploy or rollback_deploy call wait_for_deploy, then check logs and http_check the service URL. Never claim success you have not observed.
4. Be efficient: batch independent tool calls in one turn when possible, and stop as soon as the task is done.
5. If a tool is denied by policy, do not retry it. Explain what you wanted to do and how the user can allow it (choose "auto" mode or run the CLI with --yes).
6. Treat env var values as secrets. Do not print values unless the user explicitly asked to reveal them.
7. When debugging a failing deploy, read build logs (type=build) and app logs (level=error), quote the relevant lines, and state the most likely root cause and a concrete fix.
8. Final answers: lead with the outcome in one line, then a short status summary. Use a compact markdown table when listing several services or deploys. Include service URLs and deploy IDs so the user can verify in the dashboard.

Today's date is ${new Date().toISOString().slice(0, 10)}.`;

const MAX_TOOL_RESULT_CHARS = 12000;

function truncate(text, max = MAX_TOOL_RESULT_CHARS) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n…[truncated ${text.length - max} chars]`;
}

function serializeResult(result) {
  if (result === undefined || result === null) return '{"ok":true}';
  return truncate(typeof result === 'string' ? result : JSON.stringify(result));
}

/**
 * Run one agent turn.
 * @param {object} opts
 * @param {object} opts.llm            - from createLLM()
 * @param {Array}  opts.tools          - from buildTools()
 * @param {Array}  opts.messages       - conversation history WITHOUT the system prompt; the latest user message must be last
 * @param {object} [opts.policy]       - { mode: 'read-only'|'safe'|'auto'|'ask', approve?: async (tool, args) => boolean }
 * @param {function} [opts.onEvent]    - receives { type, ... } progress events
 * @param {number} [opts.maxSteps]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<{ content: string, messages: Array, steps: number }>}
 */
export async function runAgent({ llm, tools, messages, policy = { mode: 'safe' }, onEvent = () => {}, maxSteps, signal }) {
  const limit = maxSteps ?? Number(process.env.AGENT_MAX_STEPS ?? 30);
  const toolIndex = new Map(tools.map((t) => [t.name, t]));
  const openaiTools = toOpenAITools(tools);
  const history = [...messages];
  let steps = 0;

  while (steps < limit) {
    if (signal?.aborted) throw new Error('Aborted');
    steps += 1;

    const { message, usage } = await llm.chat({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      tools: openaiTools,
      signal,
    });
    history.push(message);
    if (usage) onEvent({ type: 'usage', step: steps, usage });

    if (!message.tool_calls?.length) {
      onEvent({ type: 'assistant', content: message.content });
      return { content: message.content, messages: history, steps };
    }

    if (message.content) onEvent({ type: 'thought', content: message.content });

    for (const call of message.tool_calls) {
      const name = call.function.name;
      const tool = toolIndex.get(name);
      let args = {};
      let result;
      let ok = true;

      try {
        args = parseToolArguments(call.function.arguments);
        onEvent({ type: 'tool_call', id: call.id, name, args, risk: tool?.risk });
        if (!tool) throw new Error(`Unknown tool "${name}". Available: ${[...toolIndex.keys()].join(', ')}`);

        const allowed = await authorize(tool, args, policy);
        if (!allowed) {
          ok = false;
          result = {
            error: `Denied by policy: ${name} is a "${tool.risk}" action and the current mode is "${policy.mode}". Do not retry. Tell the user what you intended and how to allow it.`,
          };
          onEvent({ type: 'tool_denied', id: call.id, name, args, risk: tool.risk });
        } else {
          result = await tool.run(args);
        }
      } catch (err) {
        ok = false;
        result = { error: err.message };
      }

      const content = serializeResult(result);
      if (ok) onEvent({ type: 'tool_result', id: call.id, name, ok, preview: content.slice(0, 400) });
      else if (result?.error && !String(result.error).startsWith('Denied by policy'))
        onEvent({ type: 'tool_error', id: call.id, name, error: result.error });

      history.push({ role: 'tool', tool_call_id: call.id, name, content });
    }
  }

  const content = `I stopped after ${limit} steps without finishing. Here is where things stand; ask me to continue if you want me to keep going.`;
  history.push({ role: 'assistant', content });
  onEvent({ type: 'assistant', content });
  return { content, messages: history, steps };
}
