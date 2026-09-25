import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSpacesClient, extractFileUrls, parseSSE, spaceHost } from '../src/spaces.js';
import { buildTools } from '../src/tools.js';

test('spaceHost maps ids to hf.space subdomains', () => {
  assert.equal(spaceHost('evalstate/flux1_schnell'), 'https://evalstate-flux1-schnell.hf.space');
  assert.equal(spaceHost('viturah96/FLUX.2-Klein-Multi-LoRA'), 'https://viturah96-flux-2-klein-multi-lora.hf.space');
  assert.throws(() => spaceHost('nope'));
});

test('parseSSE and extractFileUrls', () => {
  const events = parseSSE('event: heartbeat\ndata: null\n\nevent: complete\ndata: [{"url":"https://x/img.webp"},42]\n\n');
  assert.equal(events.at(-1).event, 'complete');
  assert.deepEqual(extractFileUrls(JSON.parse(events.at(-1).data)), ['https://x/img.webp']);
  assert.deepEqual(extractFileUrls([{ image: { url: 'a' } }, { video: { url: 'b' } }]), ['a', 'b']);
});

function fakeSpaceFetch({ complete = true } = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith('/gradio_api/info')) return new Response(JSON.stringify({ named_endpoints: { '/infer': { parameters: [{ parameter_name: 'prompt', python_type: { type: 'str' } }] } } }));
    if (init.method === 'POST') return new Response(JSON.stringify({ event_id: 'ev1' }));
    return new Response(complete ? 'event: complete\ndata: [{"url":"https://s/out.webp"},7]\n\n' : 'event: error\ndata: null\n\n');
  };
  return { fetchImpl, calls };
}

test('client submits, streams, and sends the bearer token', async () => {
  const { fetchImpl, calls } = fakeSpaceFetch();
  const client = createSpacesClient({ token: 'hf_t', fetchImpl });
  const out = await client.call('evalstate/flux1_schnell', '/infer', ['p', 0, true, 512, 512, 4]);
  assert.equal(out[1], 7);
  assert.equal(calls[0].url, 'https://evalstate-flux1-schnell.hf.space/gradio_api/call/infer');
  assert.equal(calls[0].init.headers.authorization, 'Bearer hf_t');
  assert.deepEqual(JSON.parse(calls[0].init.body).data, ['p', 0, true, 512, 512, 4]);
  assert.equal(calls[1].url, calls[0].url + '/ev1');
});

test('anonymous ZeroGPU failure produces an actionable error', async () => {
  const { fetchImpl } = fakeSpaceFetch({ complete: false });
  const client = createSpacesClient({ token: '', fetchImpl });
  await assert.rejects(() => client.call('evalstate/flux1_schnell', '/infer', ['p']), /set HF_TOKEN/);
});

test('render_image and space_info tools wrap the client', async () => {
  const { fetchImpl } = fakeSpaceFetch();
  const spaces = createSpacesClient({ token: 'hf_t', fetchImpl });
  const tools = Object.fromEntries(buildTools({ render: {}, spaces }).map((t) => [t.name, t]));
  const out = await tools.render_image.run({ prompt: 'headphones', seed: 3 });
  assert.deepEqual(out.images, ['https://s/out.webp']);
  assert.equal(out.seed, 7);
  const info = await tools.space_info.run({ space: 'evalstate/flux1_schnell' });
  assert.equal(info['/infer'][0].name, 'prompt');
});
