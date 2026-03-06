import type { Context } from 'hono';
import type { Env } from '@/types';

export function requireApiKey(c: Context<{ Bindings: Env }>): Response | null {
  const key = c.env.EDGRAPH_API_KEY;
  if (!key) return c.json({ error: 'API key not configured' }, 503) as any;
  const auth = c.req.header('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || token !== key) return c.json({ error: 'Unauthorized' }, 401) as any;
  return null;
}
