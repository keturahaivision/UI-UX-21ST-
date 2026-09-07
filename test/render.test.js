import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RenderClient, RenderApiError } from '../src/render.js';
import { fakeRenderFetch } from './helpers.js';

test('builds query strings with arrays and skips empty values', () => {
  const client = new RenderClient({ apiKey: 'k', fetchImpl: async () => new Response('[]') });
  const url = client.buildUrl('/logs', { ownerId: 'tea-1', resource: ['srv-1', 'srv-2'], text: undefined, limit: 5 });
  assert.equal(url.searchParams.get('ownerId'), 'tea-1');
  assert.deepEqual(url.searchParams.getAll('resource'), ['srv-1', 'srv-2']);
  assert.equal(url.searchParams.has('text'), false);
  assert.equal(url.searchParams.get('limit'), '5');
});

test('unwraps list envelopes and sends bearer auth', async () => {
  const { fetchImpl, calls } = fakeRenderFetch({
    'GET /v1/services': [{ cursor: 'a', service: { id: 'srv-1', name: 'api' } }],
  });
  const client = new RenderClient({ apiKey: 'rnd_test', fetchImpl });
  const services = await client.listServices({ name: 'api' });
  assert.deepEqual(services, [{ id: 'srv-1', name: 'api' }]);
  assert.equal(calls[0].headers.authorization, 'Bearer rnd_test');
  assert.equal(calls[0].url.searchParams.get('name'), 'api');
});

test('createDeploy maps clearCache and surfaces API errors', async () => {
  const { fetchImpl, calls } = fakeRenderFetch({
    'POST /v1/services/srv-1/deploys': ({ body }) => ({ id: 'dep-9', status: 'build_in_progress', clearCache: body.clearCache }),
  });
  const client = new RenderClient({ apiKey: 'k', fetchImpl });
  const dep = await client.createDeploy('srv-1', { clearCache: true });
  assert.equal(dep.id, 'dep-9');
  assert.equal(calls[0].body.clearCache, 'clear');

  await assert.rejects(() => client.getService('srv-missing'), (err) => err instanceof RenderApiError && err.status === 404);
});

test('204 responses resolve to null', async () => {
  const { fetchImpl } = fakeRenderFetch({ 'POST /v1/services/srv-1/restart': null });
  const client = new RenderClient({ apiKey: 'k', fetchImpl });
  assert.equal(await client.restartService('srv-1'), null);
});
