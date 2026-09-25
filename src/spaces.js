// Minimal Hugging Face Spaces (Gradio) HTTP client. Calls a Space's API directly, no MCP needed.
// Flow: POST /gradio_api/call/<endpoint> -> {event_id}; GET .../<event_id> streams SSE until "complete".

export function spaceHost(spaceId) {
  const [owner, name] = spaceId.split('/');
  if (!owner || !name) throw new Error(`Space id must be owner/name, got "${spaceId}"`);
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `https://${slug(owner)}-${slug(name)}.hf.space`;
}

export function parseSSE(text) {
  const events = [];
  for (const block of text.split(/\n\n+/)) {
    let event = 'message';
    const data = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).trim());
    }
    if (data.length) events.push({ event, data: data.join('\n') });
  }
  return events;
}

export function createSpacesClient({ token = process.env.HF_TOKEN, fetchImpl = globalThis.fetch, timeoutMs = 240000 } = {}) {
  const headers = () => ({
    'content-type': 'application/json',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  });

  return {
    async info(spaceId) {
      const res = await fetchImpl(`${spaceHost(spaceId)}/gradio_api/info`, { headers: headers() });
      if (!res.ok) throw new Error(`Space ${spaceId} info ${res.status}`);
      return res.json();
    },

    async call(spaceId, endpoint, data) {
      const base = `${spaceHost(spaceId)}/gradio_api/call/${endpoint.replace(/^\//, '')}`;
      const submit = await fetchImpl(base, { method: 'POST', headers: headers(), body: JSON.stringify({ data }) });
      if (!submit.ok) throw new Error(`Space ${spaceId} ${endpoint} submit failed: ${submit.status} ${(await submit.text()).slice(0, 200)}`);
      const { event_id: eventId } = await submit.json();
      if (!eventId) throw new Error(`Space ${spaceId} returned no event_id`);

      const res = await fetchImpl(`${base}/${eventId}`, { headers: headers(), signal: AbortSignal.timeout(timeoutMs) });
      const events = parseSSE(await res.text());
      const done = events.find((e) => e.event === 'complete');
      if (done) return JSON.parse(done.data);
      const err = events.find((e) => e.event === 'error');
      const detail = err && err.data !== 'null' ? err.data : '';
      throw new Error(
        `Space ${spaceId} ${endpoint} failed${detail ? `: ${detail}` : ''}. ` +
          (token ? 'Check the Space logs or your ZeroGPU quota.' : 'ZeroGPU Spaces reject anonymous calls: set HF_TOKEN.'),
      );
    },
  };
}

// Extract image URLs from a Gradio result payload (FileData objects or nested arrays of them).
export function extractFileUrls(payload) {
  const urls = [];
  const walk = (v) => {
    if (!v) return;
    if (Array.isArray(v)) return v.forEach(walk);
    if (typeof v === 'object') {
      if (typeof v.url === 'string') urls.push(v.url);
      else if (v.image) walk(v.image);
      else if (v.video) walk(v.video);
    }
  };
  walk(payload);
  return urls;
}
