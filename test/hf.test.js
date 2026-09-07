import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLLM, parseToolArguments } from '../src/hf.js';

test('sends OpenAI-style tool calling requests to the router and normalizes the reply', async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, body: JSON.parse(init.body), headers: init.headers };
    return new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'tool_calls',
            message: {
              role: 'assistant',
              content: '<think>plan</think>Looking it up.',
              tool_calls: [{ function: { name: 'list_services', arguments: { name: 'api' } } }],
            },
          },
        ],
        usage: { total_tokens: 42 },
      }),
    );
  };
  const llm = createLLM({ apiKey: 'hf_test', model: 'Qwen/Qwen3-Coder-Next', fetchImpl });
  const { message, usage } = await llm.chat({ messages: [{ role: 'user', content: 'hi' }], tools: [{ type: 'function', function: { name: 'x' } }] });

  assert.equal(captured.url, 'https://router.huggingface.co/v1/chat/completions');
  assert.equal(captured.headers.authorization, 'Bearer hf_test');
  assert.equal(captured.body.model, 'Qwen/Qwen3-Coder-Next');
  assert.equal(captured.body.tool_choice, 'auto');
  assert.equal(message.content, 'Looking it up.');
  assert.equal(message.tool_calls[0].id, 'call_0');
  assert.equal(message.tool_calls[0].function.arguments, '{"name":"api"}');
  assert.equal(usage.total_tokens, 42);
});

test('retries on 5xx then succeeds', async () => {
  let n = 0;
  const fetchImpl = async () =>
    ++n < 2
      ? new Response('overloaded', { status: 503 })
      : new Response(JSON.stringify({ choices: [{ message: { role: 'assistant', content: 'ok' } }] }));
  const llm = createLLM({ apiKey: 'k', fetchImpl });
  const { message } = await llm.chat({ messages: [] });
  assert.equal(message.content, 'ok');
  assert.equal(n, 2);
});

test('parseToolArguments tolerates provider quirks', () => {
  assert.deepEqual(parseToolArguments(''), {});
  assert.deepEqual(parseToolArguments({ a: 1 }), { a: 1 });
  assert.deepEqual(parseToolArguments('{"a":1}'), { a: 1 });
  assert.deepEqual(parseToolArguments('```json\n{"a":1}\n```'), { a: 1 });
  assert.throws(() => parseToolArguments('garbage'));
});

test('requires HF_TOKEN', () => {
  assert.throws(() => createLLM({ apiKey: '' }), /HF_TOKEN/);
});
