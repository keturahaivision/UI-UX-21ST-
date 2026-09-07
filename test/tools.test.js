import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RenderClient } from '../src/render.js';
import { authorize, buildTools, clampMode, toOpenAITools } from '../src/tools.js';
import { fakeRenderFetch } from './helpers.js';

const READ = { name: 'r', risk: 'read' };
const WRITE = { name: 'w', risk: 'write' };
const DESTRUCTIVE = { name: 'd', risk: 'destructive' };

test('policy modes gate tools by risk', async () => {
  assert.equal(await authorize(READ, {}, { mode: 'read-only' }), true);
  assert.equal(await authorize(WRITE, {}, { mode: 'read-only' }), false);
  assert.equal(await authorize(WRITE, {}, { mode: 'safe' }), true);
  assert.equal(await authorize(DESTRUCTIVE, {}, { mode: 'safe' }), false);
  assert.equal(await authorize(DESTRUCTIVE, {}, { mode: 'auto' }), true);
  assert.equal(await authorize(DESTRUCTIVE, {}, { mode: 'ask', approve: async () => true }), true);
  assert.equal(await authorize(WRITE, {}, { mode: 'ask' }), false);
});

test('clampMode never exceeds the ceiling', () => {
  assert.equal(clampMode('auto', 'safe'), 'safe');
  assert.equal(clampMode('read-only', 'auto'), 'read-only');
  assert.equal(clampMode('auto', 'auto'), 'auto');
  assert.equal(clampMode('nonsense', 'read-only'), 'read-only');
});

test('every tool has a valid OpenAI schema and risk tier', () => {
  const tools = buildTools({ render: {} });
  const names = new Set();
  for (const t of tools) {
    assert.ok(!names.has(t.name), `duplicate tool ${t.name}`);
    names.add(t.name);
    assert.ok(['read', 'write', 'destructive'].includes(t.risk), `${t.name} risk`);
    assert.equal(t.parameters.type, 'object');
    for (const r of t.parameters.required) assert.ok(t.parameters.properties[r], `${t.name} requires unknown ${r}`);
  }
  const schema = toOpenAITools(tools)[0];
  assert.equal(schema.type, 'function');
  assert.ok(schema.function.parameters);
});

test('get_logs resolves ownerId from the service and masks env vars', async () => {
  const { fetchImpl, calls } = fakeRenderFetch({
    'GET /v1/services/srv-1': { id: 'srv-1', ownerId: 'tea-7' },
    'GET /v1/logs': { logs: [{ timestamp: 't1', message: 'boom' }], hasMore: false },
    'GET /v1/services/srv-1/env-vars': [{ envVar: { key: 'DATABASE_URL', value: 'postgres://secret-long-value' } }],
  });
  const render = new RenderClient({ apiKey: 'k', fetchImpl });
  const tools = Object.fromEntries(buildTools({ render }).map((t) => [t.name, t]));

  const logs = await tools.get_logs.run({ resourceId: 'srv-1', level: 'error' });
  assert.deepEqual(logs.lines, ['t1 boom']);
  const logCall = calls.find((c) => c.key === 'GET /v1/logs');
  assert.equal(logCall.url.searchParams.get('ownerId'), 'tea-7');
  assert.equal(logCall.url.searchParams.get('level'), 'error');

  const vars = await tools.list_env_vars.run({ serviceId: 'srv-1' });
  assert.equal(vars[0].key, 'DATABASE_URL');
  assert.ok(!vars[0].value.includes('secret'));
  const revealed = await tools.list_env_vars.run({ serviceId: 'srv-1', reveal: true });
  assert.equal(revealed[0].value, 'postgres://secret-long-value');
});

test('wait_for_deploy polls until a terminal state', async () => {
  let n = 0;
  const { fetchImpl } = fakeRenderFetch({
    'GET /v1/services/srv-1/deploys/dep-1': () => ({ id: 'dep-1', status: ++n < 3 ? 'build_in_progress' : 'live' }),
  });
  const render = new RenderClient({ apiKey: 'k', fetchImpl });
  const tools = Object.fromEntries(buildTools({ render, sleep: async () => {} }).map((t) => [t.name, t]));
  const out = await tools.wait_for_deploy.run({ serviceId: 'srv-1', deployId: 'dep-1' });
  assert.equal(out.done, true);
  assert.equal(out.deploy.status, 'live');
  assert.equal(n, 3);
});

test('delete_service refuses a mismatched confirmation name', async () => {
  const { fetchImpl, calls } = fakeRenderFetch({ 'GET /v1/services/srv-1': { id: 'srv-1', name: 'api' } });
  const render = new RenderClient({ apiKey: 'k', fetchImpl });
  const tools = Object.fromEntries(buildTools({ render }).map((t) => [t.name, t]));
  await assert.rejects(() => tools.delete_service.run({ serviceId: 'srv-1', confirmName: 'nope' }), /does not match/);
  assert.ok(!calls.some((c) => c.key.startsWith('DELETE')));
});
