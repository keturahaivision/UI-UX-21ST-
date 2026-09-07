import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runAgent, SYSTEM_PROMPT } from '../src/agent.js';
import { RenderClient } from '../src/render.js';
import { buildTools } from '../src/tools.js';
import { fakeRenderFetch, scriptedLLM } from './helpers.js';

function setup(routes = {}) {
  const { fetchImpl, calls } = fakeRenderFetch({
    'GET /v1/services': [{ service: { id: 'srv-1', name: 'api', serviceDetails: { url: 'https://api.example.com' } } }],
    'POST /v1/services/srv-1/deploys': { id: 'dep-2', status: 'build_in_progress' },
    'POST /v1/services/srv-1/suspend': null,
    ...routes,
  });
  const render = new RenderClient({ apiKey: 'k', fetchImpl });
  return { tools: buildTools({ render, sleep: async () => {} }), calls };
}

test('runs a tool call, feeds the result back, and returns the final answer', async () => {
  const { tools, calls } = setup();
  const llm = scriptedLLM([
    { toolCalls: [{ name: 'list_services', args: { name: 'api' } }] },
    { content: 'api is srv-1 at https://api.example.com' },
  ]);
  const events = [];
  const result = await runAgent({ llm, tools, messages: [{ role: 'user', content: 'find api' }], onEvent: (e) => events.push(e) });

  assert.equal(result.content, 'api is srv-1 at https://api.example.com');
  assert.equal(result.steps, 2);
  assert.equal(calls.length, 1);
  assert.equal(llm.seen[0][0].role, 'system');
  assert.equal(llm.seen[0][0].content, SYSTEM_PROMPT);
  const toolMsg = llm.seen[1].find((m) => m.role === 'tool');
  assert.ok(toolMsg.content.includes('srv-1'));
  assert.deepEqual(events.map((e) => e.type), ['tool_call', 'tool_result', 'assistant']);
  assert.equal(result.messages.at(-1).content, result.content);
});

test('denies destructive tools in safe mode and tells the model not to retry', async () => {
  const { tools, calls } = setup();
  const llm = scriptedLLM([
    { toolCalls: [{ name: 'suspend_service', args: { serviceId: 'srv-1' } }] },
    { content: 'I could not suspend it.' },
  ]);
  const events = [];
  await runAgent({ llm, tools, messages: [{ role: 'user', content: 'suspend api' }], policy: { mode: 'safe' }, onEvent: (e) => events.push(e) });
  assert.equal(calls.length, 0, 'no Render call should have been made');
  assert.ok(events.some((e) => e.type === 'tool_denied'));
  const toolMsg = llm.seen[1].find((m) => m.role === 'tool');
  assert.match(toolMsg.content, /Denied by policy/);
});

test('ask mode consults the approver and runs approved writes', async () => {
  const { tools, calls } = setup();
  const asked = [];
  const llm = scriptedLLM([
    { toolCalls: [{ name: 'trigger_deploy', args: { serviceId: 'srv-1' } }] },
    { content: 'Deploy dep-2 started.' },
  ]);
  await runAgent({
    llm,
    tools,
    messages: [{ role: 'user', content: 'deploy api' }],
    policy: { mode: 'ask', approve: async (tool, args) => (asked.push(tool.name), true) },
  });
  assert.deepEqual(asked, ['trigger_deploy']);
  assert.equal(calls[0].key, 'POST /v1/services/srv-1/deploys');
});

test('unknown tools and bad JSON become error results instead of crashing', async () => {
  const { tools } = setup();
  const llm = {
    model: 'fake',
    turns: 0,
    async chat() {
      if (this.turns++ === 0) {
        return {
          message: {
            role: 'assistant',
            content: '',
            tool_calls: [
              { id: 'a', type: 'function', function: { name: 'nope', arguments: '{}' } },
              { id: 'b', type: 'function', function: { name: 'get_service', arguments: '{not json' } },
            ],
          },
        };
      }
      return { message: { role: 'assistant', content: 'done' } };
    },
  };
  const events = [];
  const result = await runAgent({ llm, tools, messages: [{ role: 'user', content: 'x' }], onEvent: (e) => events.push(e) });
  assert.equal(result.content, 'done');
  assert.equal(events.filter((e) => e.type === 'tool_error').length, 2);
});

test('stops at maxSteps with a status message', async () => {
  const { tools } = setup();
  const llm = scriptedLLM(Array.from({ length: 5 }, () => ({ toolCalls: [{ name: 'list_services' }] })));
  const result = await runAgent({ llm, tools, messages: [{ role: 'user', content: 'loop' }], maxSteps: 3 });
  assert.equal(result.steps, 3);
  assert.match(result.content, /stopped after 3 steps/);
});
