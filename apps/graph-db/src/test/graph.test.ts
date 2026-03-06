import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';

// We use a unique graph ID per test run to keep tests isolated
const G = `test-${Date.now()}`;
const BASE = `/graphs/${G}`;
const KEY = 'test-key';

// Helper: auth'd POST
async function post(path: string, body: unknown) {
  return SELF.fetch(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
}

async function put(path: string, body: unknown) {
  return SELF.fetch(`http://localhost${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
}

async function del(path: string) {
  return SELF.fetch(`http://localhost${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${KEY}` },
  });
}

async function get(path: string) {
  return SELF.fetch(`http://localhost${path}`);
}

// ─── Node CRUD ────────────────────────────────────────────────────────────────

describe('nodes', () => {
  it('creates and retrieves a node', async () => {
    const res = await post(`${BASE}/nodes`, { label: 'Person', properties: { name: 'Alice' } });
    expect(res.status).toBe(201);
    const node = await res.json() as any;
    expect(node.label).toBe('Person');
    expect(node.properties.name).toBe('Alice');
    expect(node.id).toBeTruthy();

    const get2 = await get(`${BASE}/nodes/${node.id}`);
    expect(get2.status).toBe(200);
    const fetched = await get2.json() as any;
    expect(fetched.id).toBe(node.id);
  });

  it('creates a node with explicit id', async () => {
    const res = await post(`${BASE}/nodes`, { id: 'alice', label: 'Person' });
    expect(res.status).toBe(201);
    const node = await res.json() as any;
    expect(node.id).toBe('alice');
  });

  it('updates a node', async () => {
    const create = await post(`${BASE}/nodes`, { id: 'bob', label: 'Person', properties: { name: 'Bob' } });
    expect(create.status).toBe(201);

    const update = await put(`${BASE}/nodes/bob`, { properties: { name: 'Bobby', age: 30 } });
    expect(update.status).toBe(200);
    const updated = await update.json() as any;
    expect(updated.properties.name).toBe('Bobby');
    expect(updated.properties.age).toBe(30);
  });

  it('returns 404 for missing node', async () => {
    const res = await get(`${BASE}/nodes/does-not-exist`);
    expect(res.status).toBe(404);
  });

  it('deletes a node and its edges', async () => {
    await post(`${BASE}/nodes`, { id: 'n1', label: 'A' });
    await post(`${BASE}/nodes`, { id: 'n2', label: 'B' });
    await post(`${BASE}/edges`, { fromId: 'n1', toId: 'n2', type: 'link' });

    await del(`${BASE}/nodes/n1`);

    const nodeRes = await get(`${BASE}/nodes/n1`);
    expect(nodeRes.status).toBe(404);

    // Edge should be gone too
    const edgeRes = await get(`${BASE}/edges?fromId=n1`);
    const body = await edgeRes.json() as any;
    expect(body.edges).toHaveLength(0);
  });

  it('lists nodes filtered by label', async () => {
    await post(`${BASE}/nodes`, { id: 'p1', label: 'Planet' });
    await post(`${BASE}/nodes`, { id: 'p2', label: 'Planet' });
    await post(`${BASE}/nodes`, { id: 's1', label: 'Star' });

    const res = await get(`${BASE}/nodes?label=Planet`);
    const body = await res.json() as any;
    expect(body.nodes.length).toBeGreaterThanOrEqual(2);
    expect(body.nodes.every((n: any) => n.label === 'Planet')).toBe(true);
  });
});

// ─── Edge CRUD ────────────────────────────────────────────────────────────────

describe('edges', () => {
  it('creates an edge between existing nodes', async () => {
    await post(`${BASE}/nodes`, { id: 'e-a', label: 'X' });
    await post(`${BASE}/nodes`, { id: 'e-b', label: 'X' });

    const res = await post(`${BASE}/edges`, { fromId: 'e-a', toId: 'e-b', type: 'knows' });
    expect(res.status).toBe(201);
    const edge = await res.json() as any;
    expect(edge.type).toBe('knows');
    expect(edge.fromId).toBe('e-a');
    expect(edge.toId).toBe('e-b');
  });

  it('rejects edge with missing node', async () => {
    await post(`${BASE}/nodes`, { id: 'e-src', label: 'X' });
    const res = await post(`${BASE}/edges`, { fromId: 'e-src', toId: 'nobody', type: 'link' });
    expect(res.status).toBe(404);
  });

  it('deletes an edge and cleans up adjacency', async () => {
    await post(`${BASE}/nodes`, { id: 'ea1', label: 'X' });
    await post(`${BASE}/nodes`, { id: 'ea2', label: 'X' });
    const eRes = await post(`${BASE}/edges`, { fromId: 'ea1', toId: 'ea2', type: 'test' });
    const edge = await eRes.json() as any;

    await del(`${BASE}/edges/${edge.id}`);

    // Neighbours should be empty after edge deletion
    const nRes = await get(`${BASE}/nodes/ea1/neighbours`);
    const nb = await nRes.json() as any;
    expect(nb.neighbours).toHaveLength(0);
  });
});

// ─── Traversal ────────────────────────────────────────────────────────────────

describe('traverse', () => {
  // Build a small chain: A -> B -> C -> D
  async function buildChain() {
    const prefix = `tc-${Date.now()}`;
    await post(`${BASE}/nodes`, { id: `${prefix}-a`, label: 'Node', properties: { name: 'A' } });
    await post(`${BASE}/nodes`, { id: `${prefix}-b`, label: 'Node', properties: { name: 'B' } });
    await post(`${BASE}/nodes`, { id: `${prefix}-c`, label: 'Node', properties: { name: 'C' } });
    await post(`${BASE}/nodes`, { id: `${prefix}-d`, label: 'Node', properties: { name: 'D' } });
    await post(`${BASE}/edges`, { fromId: `${prefix}-a`, toId: `${prefix}-b`, type: 'next' });
    await post(`${BASE}/edges`, { fromId: `${prefix}-b`, toId: `${prefix}-c`, type: 'next' });
    await post(`${BASE}/edges`, { fromId: `${prefix}-c`, toId: `${prefix}-d`, type: 'next' });
    return prefix;
  }

  it('BFS traversal finds nodes at correct depths', async () => {
    const p = await buildChain();
    const res = await post(`${BASE}/traverse`, {
      from: `${p}-a`, direction: 'out', maxDepth: 3, algorithm: 'bfs',
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.count).toBe(3); // B(1), C(2), D(3)

    const depths = body.nodes.map((n: any) => n.depth);
    expect(depths).toContain(1);
    expect(depths).toContain(2);
    expect(depths).toContain(3);
  });

  it('maxDepth limits traversal', async () => {
    const p = await buildChain();
    const res = await post(`${BASE}/traverse`, {
      from: `${p}-a`, direction: 'out', maxDepth: 1,
    });
    const body = await res.json() as any;
    expect(body.count).toBe(1); // Only B
  });

  it('direction=in traverses backwards', async () => {
    const p = await buildChain();
    const res = await post(`${BASE}/traverse`, {
      from: `${p}-d`, direction: 'in', maxDepth: 3,
    });
    const body = await res.json() as any;
    expect(body.count).toBe(3); // C, B, A
  });

  it('edgeType filter restricts traversal', async () => {
    const p = `et-${Date.now()}`;
    await post(`${BASE}/nodes`, { id: `${p}-x`, label: 'X' });
    await post(`${BASE}/nodes`, { id: `${p}-y`, label: 'Y' });
    await post(`${BASE}/nodes`, { id: `${p}-z`, label: 'Z' });
    await post(`${BASE}/edges`, { fromId: `${p}-x`, toId: `${p}-y`, type: 'likes' });
    await post(`${BASE}/edges`, { fromId: `${p}-x`, toId: `${p}-z`, type: 'hates' });

    const res = await post(`${BASE}/traverse`, {
      from: `${p}-x`, direction: 'out', maxDepth: 1, edgeTypes: ['likes'],
    });
    const body = await res.json() as any;
    expect(body.count).toBe(1);
    expect(body.nodes[0].node.label).toBe('Y');
  });
});

// ─── Shortest path ────────────────────────────────────────────────────────────

describe('paths', () => {
  it('finds shortest path between two nodes', async () => {
    const p = `sp-${Date.now()}`;
    await post(`${BASE}/nodes`, { id: `${p}-1`, label: 'N' });
    await post(`${BASE}/nodes`, { id: `${p}-2`, label: 'N' });
    await post(`${BASE}/nodes`, { id: `${p}-3`, label: 'N' });
    await post(`${BASE}/edges`, { fromId: `${p}-1`, toId: `${p}-2`, type: 'e' });
    await post(`${BASE}/edges`, { fromId: `${p}-2`, toId: `${p}-3`, type: 'e' });

    const res = await post(`${BASE}/paths`, { from: `${p}-1`, to: `${p}-3` });
    const body = await res.json() as any;
    expect(body.path).not.toBeNull();
    expect(body.path.length).toBe(2);
    expect(body.path.nodes).toHaveLength(3);
  });

  it('returns null when no path exists', async () => {
    const p = `sp2-${Date.now()}`;
    await post(`${BASE}/nodes`, { id: `${p}-a`, label: 'N' });
    await post(`${BASE}/nodes`, { id: `${p}-b`, label: 'N' });

    const res = await post(`${BASE}/paths`, { from: `${p}-a`, to: `${p}-b` });
    const body = await res.json() as any;
    expect(body.path).toBeNull();
  });
});

// ─── Stats ────────────────────────────────────────────────────────────────────

describe('stats', () => {
  it('returns node and edge counts', async () => {
    const res = await get(`${BASE}/stats`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(typeof body.nodeCount).toBe('number');
    expect(typeof body.edgeCount).toBe('number');
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe('auth', () => {
  it('rejects writes without API key', async () => {
    const res = await SELF.fetch(`http://localhost${BASE}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'X' }),
    });
    expect(res.status).toBe(401);
  });

  it('allows reads without API key', async () => {
    const res = await get(`${BASE}/nodes`);
    expect(res.status).toBe(200);
  });
});
