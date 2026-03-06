import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '@/types';
import { requireApiKey } from '@/lib/auth';

export { GraphDO } from './graph-do';

// ─── App ──────────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/', (c) => c.json({
  name: 'edgraph',
  version: '0.1.0',
  description: 'Edge-native graph database on Cloudflare Durable Objects',
  endpoints: {
    nodes:      '/graphs/:graphId/nodes',
    node:       '/graphs/:graphId/nodes/:id',
    neighbours: '/graphs/:graphId/nodes/:id/neighbours',
    edges:      '/graphs/:graphId/edges',
    edge:       '/graphs/:graphId/edges/:id',
    traverse:   '/graphs/:graphId/traverse   POST',
    paths:      '/graphs/:graphId/paths      POST',
    subgraph:   '/graphs/:graphId/subgraph   POST',
    stats:      '/graphs/:graphId/stats',
    reset:      '/graphs/:graphId            DELETE',
  },
}));

// ─── Proxy to GraphDO ─────────────────────────────────────────────────────────

// All write operations require API key
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

app.all('/graphs/:graphId/*', async (c) => {
  const { graphId } = c.req.param();
  if (!graphId) return c.json({ error: 'graphId is required' }, 400);

  // Auth: all writes require API key; reads are open
  if (WRITE_METHODS.has(c.req.method)) {
    const denied = requireApiKey(c);
    if (denied) return denied;
  }

  // Route to the correct DO instance — one per graph
  const id   = c.env.GRAPH.idFromName(graphId);
  const stub = c.env.GRAPH.get(id);

  // Strip /graphs/:graphId prefix, forward remaining path + query
  const url = new URL(c.req.url);
  const subPath = url.pathname.replace(`/graphs/${graphId}`, '') || '/';
  const doUrl = new URL(subPath + url.search, 'http://do');

  // Forward request to DO
  const doReq = new Request(doUrl.toString(), {
    method:  c.req.method,
    headers: c.req.raw.headers,
    body:    WRITE_METHODS.has(c.req.method) ? c.req.raw.body : undefined,
  });

  return stub.fetch(doReq);
});

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => c.json({ error: err.message }, 500));

export default app;
