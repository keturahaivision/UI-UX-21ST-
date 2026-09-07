// Web UI + JSON/SSE API. Deployable to Render itself (see render.yaml).

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import { runAgent } from './agent.js';
import { createContext, maxMode } from './context.js';
import { clampMode } from './tools.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const ACCESS_TOKEN = process.env.AGENT_ACCESS_TOKEN || '';
const SESSION_TTL_MS = 6 * 3600 * 1000;

const sessions = new Map(); // id -> { messages, updatedAt, busy }

function getSession(id) {
  const now = Date.now();
  for (const [k, s] of sessions) if (now - s.updatedAt > SESSION_TTL_MS) sessions.delete(k);
  const key = id && sessions.has(id) ? id : crypto.randomUUID();
  if (!sessions.has(key)) sessions.set(key, { messages: [], updatedAt: now, busy: false });
  return [key, sessions.get(key)];
}

function authorized(req) {
  if (!ACCESS_TOKEN) return true;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token.length === ACCESS_TOKEN.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(ACCESS_TOKEN));
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req, limit = 256 * 1024) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('Body too large');
    chunks.push(chunk);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

export function createServer(ctx = createContext()) {
  const { llm, tools } = ctx;
  const ceiling = maxMode();

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/healthz') return json(res, 200, { ok: true, model: llm.model });

    if (req.method === 'GET' && url.pathname === '/') {
      const html = await readFile(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    if (url.pathname.startsWith('/api/')) {
      if (!authorized(req)) return json(res, 401, { error: 'Missing or invalid access token' });

      if (req.method === 'GET' && url.pathname === '/api/config') {
        return json(res, 200, { model: llm.model, maxMode: ceiling, tools: tools.map((t) => ({ name: t.name, risk: t.risk })) });
      }

      if (req.method === 'POST' && url.pathname === '/api/chat') {
        let body;
        try {
          body = await readBody(req);
        } catch (err) {
          return json(res, 400, { error: err.message });
        }
        const message = String(body.message || '').trim();
        if (!message) return json(res, 400, { error: 'message is required' });

        const [sessionId, session] = getSession(body.sessionId);
        if (session.busy) return json(res, 409, { error: 'Session is busy; wait for the current task to finish' });
        const mode = clampMode(body.mode || 'safe', ceiling);
        if (mode === 'ask') return json(res, 400, { error: 'ask mode is only available in the CLI' });

        res.writeHead(200, {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
          'x-accel-buffering': 'no',
        });
        const send = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);
        send({ type: 'session', sessionId, mode, model: llm.model });

        const abort = new AbortController();
        req.on('close', () => abort.abort());
        const keepAlive = setInterval(() => res.write(': ping\n\n'), 15000);

        session.busy = true;
        session.messages.push({ role: 'user', content: message });
        try {
          const result = await runAgent({
            llm,
            tools,
            messages: session.messages,
            policy: { mode },
            onEvent: send,
            signal: abort.signal,
          });
          session.messages = result.messages;
          send({ type: 'done', steps: result.steps });
        } catch (err) {
          session.messages.pop();
          send({ type: 'error', error: err.message });
        } finally {
          session.busy = false;
          session.updatedAt = Date.now();
          clearInterval(keepAlive);
          res.end();
        }
        return;
      }

      if (req.method === 'DELETE' && url.pathname === '/api/session') {
        sessions.delete(url.searchParams.get('id'));
        return json(res, 200, { ok: true });
      }

      return json(res, 404, { error: 'Not found' });
    }

    res.writeHead(404);
    res.end('Not found');
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`render-agent web UI on http://localhost:${PORT}  (max mode: ${maxMode()}, auth: ${ACCESS_TOKEN ? 'token' : 'OPEN'})`);
    if (!ACCESS_TOKEN && process.env.RENDER) console.warn('WARNING: AGENT_ACCESS_TOKEN is empty on a public deployment.');
  });
}
