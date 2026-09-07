// Fake fetch for the Render API and a scripted fake LLM.
export function fakeRenderFetch(routes) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const u = typeof url === 'string' ? new URL(url) : url;
    const key = `${init.method || 'GET'} ${u.pathname}`;
    calls.push({ key, url: u, body: init.body ? JSON.parse(init.body) : undefined, headers: init.headers });
    if (!(key in routes)) return new Response(JSON.stringify({ message: `no route for ${key}` }), { status: 404 });
    const handler = routes[key];
    const out = typeof handler === 'function' ? handler({ url: u, body: init.body ? JSON.parse(init.body) : undefined }) : handler;
    if (out === null) return new Response(null, { status: 204 });
    return new Response(JSON.stringify(out), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  return { fetchImpl, calls };
}

export function scriptedLLM(turns) {
  let i = 0;
  const seen = [];
  return {
    model: 'fake/model',
    seen,
    async chat({ messages }) {
      seen.push(messages);
      const turn = turns[i++];
      if (!turn) throw new Error('scripted LLM ran out of turns');
      if (turn.toolCalls) {
        return {
          message: {
            role: 'assistant',
            content: turn.content ?? '',
            tool_calls: turn.toolCalls.map((tc, n) => ({
              id: `call_${i}_${n}`,
              type: 'function',
              function: { name: tc.name, arguments: JSON.stringify(tc.args ?? {}) },
            })),
          },
        };
      }
      return { message: { role: 'assistant', content: turn.content } };
    },
  };
}
