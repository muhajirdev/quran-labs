import { DurableObject } from 'cloudflare:workers';
import type {
  Env, NodeRow, EdgeRow, AdjacencyRow,
  NodeProps, EdgeProps,
  CreateNodeBody, UpdateNodeBody,
  CreateEdgeBody, UpdateEdgeBody,
  TraverseBody, PathsBody, SubgraphBody,
  TraversalNode, PathResult, SubgraphResult,
} from '@/types';

// ─── Schema ──────────────────────────────────────────────────────────────────
// Each statement is executed individually — DO SQLite exec() is single-statement.

const SCHEMA_STMTS = [
  `CREATE TABLE IF NOT EXISTS nodes (
    id         TEXT PRIMARY KEY,
    label      TEXT NOT NULL DEFAULT '',
    properties TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS edges (
    id         TEXT PRIMARY KEY,
    from_id    TEXT NOT NULL,
    to_id      TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT '',
    properties TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  // Adjacency index: index-free neighbour lookup — two rows per edge (in + out)
  `CREATE TABLE IF NOT EXISTS adjacency (
    node_id      TEXT NOT NULL,
    neighbour_id TEXT NOT NULL,
    edge_id      TEXT NOT NULL,
    direction    TEXT NOT NULL,
    edge_type    TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (node_id, edge_id, direction)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_adj_node      ON adjacency(node_id)`,
  `CREATE INDEX IF NOT EXISTS idx_adj_node_dir  ON adjacency(node_id, direction)`,
  `CREATE INDEX IF NOT EXISTS idx_adj_node_type ON adjacency(node_id, direction, edge_type)`,
  `CREATE INDEX IF NOT EXISTS idx_edges_from    ON edges(from_id)`,
  `CREATE INDEX IF NOT EXISTS idx_edges_to      ON edges(to_id)`,
  `CREATE INDEX IF NOT EXISTS idx_nodes_label   ON nodes(label)`,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uuid() { return crypto.randomUUID(); }
function now()  { return new Date().toISOString(); }

function rowToNode(r: NodeRow): NodeProps {
  return {
    id: r.id,
    label: r.label,
    properties: JSON.parse(r.properties),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToEdge(r: EdgeRow): EdgeProps {
  return {
    id: r.id,
    fromId: r.from_id,
    toId: r.to_id,
    type: r.type,
    properties: JSON.parse(r.properties),
    createdAt: r.created_at,
  };
}

function ok(data: unknown, status = 200) {
  return Response.json(data, { status });
}
function err(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

// ─── GraphDO ─────────────────────────────────────────────────────────────────

export class GraphDO extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    // blockConcurrencyWhile defers requests until schema is ready
    ctx.blockConcurrencyWhile(async () => {
      for (const stmt of SCHEMA_STMTS) {
        this.sql.exec(stmt);
      }
    });
  }

  // ── HTTP dispatch ──────────────────────────────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const path = url.pathname; // e.g. /nodes, /edges, /traverse

    try {
      // Nodes
      if (path === '/nodes' && method === 'GET')    return this.listNodes(url);
      if (path === '/nodes' && method === 'POST')   return this.createNode(await request.json());
      if (path.match(/^\/nodes\/[^/]+$/) && method === 'GET')    return this.getNode(seg(path, 1));
      if (path.match(/^\/nodes\/[^/]+$/) && method === 'PUT')    return this.updateNode(seg(path, 1), await request.json());
      if (path.match(/^\/nodes\/[^/]+$/) && method === 'DELETE') return this.deleteNode(seg(path, 1));

      // Node neighbours shorthand
      if (path.match(/^\/nodes\/[^/]+\/neighbours$/) && method === 'GET')
        return this.getNeighbours(seg(path, 1), url);

      // Edges
      if (path === '/edges' && method === 'GET')    return this.listEdges(url);
      if (path === '/edges' && method === 'POST')   return this.createEdge(await request.json());
      if (path.match(/^\/edges\/[^/]+$/) && method === 'GET')    return this.getEdge(seg(path, 1));
      if (path.match(/^\/edges\/[^/]+$/) && method === 'PUT')    return this.updateEdge(seg(path, 1), await request.json());
      if (path.match(/^\/edges\/[^/]+$/) && method === 'DELETE') return this.deleteEdge(seg(path, 1));

      // Traversal operations
      if (path === '/traverse' && method === 'POST')  return this.traverse(await request.json());
      if (path === '/paths'    && method === 'POST')  return this.paths(await request.json());
      if (path === '/subgraph' && method === 'POST')  return this.subgraph(await request.json());

      // Stats
      if (path === '/stats' && method === 'GET') return this.stats();

      // Nuke the graph
      if (path === '/reset' && method === 'DELETE') return this.reset();

      return err('Not found', 404);
    } catch (e: any) {
      return err(e?.message ?? 'Internal error', 500);
    }
  }

  // ── Node CRUD ──────────────────────────────────────────────────────────────

  private listNodes(url: URL): Response {
    const label = url.searchParams.get('label');
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    let sql = 'SELECT * FROM nodes';
    const params: unknown[] = [];
    if (label) { sql += ' WHERE label = ?'; params.push(label); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = [...this.sql.exec<NodeRow>(sql, ...params)];
    return ok({ nodes: rows.map(rowToNode), count: rows.length });
  }

  private createNode(body: CreateNodeBody): Response {
    const id = body.id ?? uuid();
    const label = body.label ?? '';
    const props = JSON.stringify(body.properties ?? {});
    const ts = now();

    this.sql.exec(
      'INSERT INTO nodes (id, label, properties, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      id, label, props, ts, ts
    );

    return ok(rowToNode({ id, label, properties: props, created_at: ts, updated_at: ts }), 201);
  }

  private getNode(id: string): Response {
    const rows = [...this.sql.exec<NodeRow>('SELECT * FROM nodes WHERE id = ?', id)];
    if (!rows.length) return err('Node not found', 404);
    return ok(rowToNode(rows[0]));
  }

  private updateNode(id: string, body: UpdateNodeBody): Response {
    const rows = [...this.sql.exec<NodeRow>('SELECT * FROM nodes WHERE id = ?', id)];
    if (!rows.length) return err('Node not found', 404);

    const current = rows[0];
    const label = body.label ?? current.label;
    const props = body.properties !== undefined
      ? JSON.stringify(body.properties)
      : current.properties;
    const ts = now();

    this.sql.exec(
      'UPDATE nodes SET label = ?, properties = ?, updated_at = ? WHERE id = ?',
      label, props, ts, id
    );

    return ok(rowToNode({ id, label, properties: props, created_at: current.created_at, updated_at: ts }));
  }

  private deleteNode(id: string): Response {
    // SQLite FK cascade is off by default — delete dependents explicitly
    this.sql.exec('DELETE FROM adjacency WHERE node_id = ? OR neighbour_id = ?', id, id);
    this.sql.exec('DELETE FROM edges WHERE from_id = ? OR to_id = ?', id, id);
    this.sql.exec('DELETE FROM nodes WHERE id = ?', id);
    return ok({ deleted: id });
  }

  // ── Edge CRUD ──────────────────────────────────────────────────────────────

  private listEdges(url: URL): Response {
    const type = url.searchParams.get('type');
    const fromId = url.searchParams.get('fromId');
    const toId = url.searchParams.get('toId');
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    const wheres: string[] = [];
    const params: unknown[] = [];
    if (type)   { wheres.push('type = ?');    params.push(type); }
    if (fromId) { wheres.push('from_id = ?'); params.push(fromId); }
    if (toId)   { wheres.push('to_id = ?');   params.push(toId); }

    let sql = 'SELECT * FROM edges';
    if (wheres.length) sql += ' WHERE ' + wheres.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = [...this.sql.exec<EdgeRow>(sql, ...params)];
    return ok({ edges: rows.map(rowToEdge), count: rows.length });
  }

  private createEdge(body: CreateEdgeBody): Response {
    if (!body.fromId) return err('fromId is required');
    if (!body.toId)   return err('toId is required');

    // Verify both nodes exist
    const from = [...this.sql.exec<NodeRow>('SELECT id FROM nodes WHERE id = ?', body.fromId)];
    const to   = [...this.sql.exec<NodeRow>('SELECT id FROM nodes WHERE id = ?', body.toId)];
    if (!from.length) return err(`Source node '${body.fromId}' not found`, 404);
    if (!to.length)   return err(`Target node '${body.toId}' not found`, 404);

    const id   = body.id ?? uuid();
    const type = body.type ?? '';
    const props = JSON.stringify(body.properties ?? {});
    const ts   = now();

    this.sql.exec(
      'INSERT INTO edges (id, from_id, to_id, type, properties, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      id, body.fromId, body.toId, type, props, ts
    );

    // Maintain adjacency index (two rows per edge)
    this.sql.exec(
      'INSERT INTO adjacency (node_id, neighbour_id, edge_id, direction, edge_type) VALUES (?, ?, ?, ?, ?)',
      body.fromId, body.toId, id, 'out', type
    );
    this.sql.exec(
      'INSERT INTO adjacency (node_id, neighbour_id, edge_id, direction, edge_type) VALUES (?, ?, ?, ?, ?)',
      body.toId, body.fromId, id, 'in', type
    );

    return ok(rowToEdge({ id, from_id: body.fromId, to_id: body.toId, type, properties: props, created_at: ts }), 201);
  }

  private getEdge(id: string): Response {
    const rows = [...this.sql.exec<EdgeRow>('SELECT * FROM edges WHERE id = ?', id)];
    if (!rows.length) return err('Edge not found', 404);
    return ok(rowToEdge(rows[0]));
  }

  private updateEdge(id: string, body: UpdateEdgeBody): Response {
    const rows = [...this.sql.exec<EdgeRow>('SELECT * FROM edges WHERE id = ?', id)];
    if (!rows.length) return err('Edge not found', 404);
    const current = rows[0];

    const type  = body.type ?? current.type;
    const props = body.properties !== undefined ? JSON.stringify(body.properties) : current.properties;

    this.sql.exec('UPDATE edges SET type = ?, properties = ? WHERE id = ?', type, props, id);

    // Update edge_type in adjacency if type changed
    if (body.type !== undefined && body.type !== current.type) {
      this.sql.exec('UPDATE adjacency SET edge_type = ? WHERE edge_id = ?', type, id);
    }

    return ok(rowToEdge({ ...current, type, properties: props }));
  }

  private deleteEdge(id: string): Response {
    this.sql.exec('DELETE FROM adjacency WHERE edge_id = ?', id);
    this.sql.exec('DELETE FROM edges WHERE id = ?', id);
    return ok({ deleted: id });
  }

  // ── Neighbours ────────────────────────────────────────────────────────────

  private getNeighbours(nodeId: string, url: URL): Response {
    const direction = (url.searchParams.get('direction') ?? 'both') as 'in' | 'out' | 'both';
    const edgeTypes = url.searchParams.getAll('type');
    const limit     = Math.min(parseInt(url.searchParams.get('limit') ?? '100'), 1000);

    const adj = this.queryAdjacency(nodeId, direction, edgeTypes, limit);
    if (!adj.length) return ok({ neighbours: [] });

    const neighbourIds = adj.map(a => a.neighbour_id);
    const edgeIds      = adj.map(a => a.edge_id);

    const nodeRows = this.fetchByIds<NodeRow>('nodes', neighbourIds);
    const edgeRows = this.fetchByIds<EdgeRow>('edges', edgeIds);

    const nodeMap = new Map(nodeRows.map(n => [n.id, rowToNode(n)]));
    const edgeMap = new Map(edgeRows.map(e => [e.id, rowToEdge(e)]));

    return ok({
      neighbours: adj.map(a => ({
        node:      nodeMap.get(a.neighbour_id)!,
        edge:      edgeMap.get(a.edge_id)!,
        direction: a.direction,
      }))
    });
  }

  // ── Traversal (BFS / DFS) ─────────────────────────────────────────────────

  private traverse(body: TraverseBody): Response {
    const {
      from,
      direction  = 'out',
      maxDepth   = 3,
      edgeTypes  = [],
      nodeLabels = [],
      algorithm  = 'bfs',
      limit      = 200,
    } = body;
    if (!from) return err('from is required');

    const startRows = [...this.sql.exec<NodeRow>('SELECT * FROM nodes WHERE id = ?', from)];
    if (!startRows.length) return err(`Node '${from}' not found`, 404);

    interface QItem { nodeId: string; depth: number; parentId: string | null; edgeId: string | null }

    const visited  = new Set<string>([from]);
    const results: TraversalNode[] = [];
    const queue: QItem[] = [{ nodeId: from, depth: 0, parentId: null, edgeId: null }];

    while (queue.length > 0 && results.length < limit) {
      const item = algorithm === 'bfs' ? queue.shift()! : queue.pop()!;
      const { nodeId, depth, parentId, edgeId } = item;

      if (depth > 0) {
        const nodeRows = [...this.sql.exec<NodeRow>('SELECT * FROM nodes WHERE id = ?', nodeId)];
        if (!nodeRows.length) continue;
        const node = rowToNode(nodeRows[0]);
        if (nodeLabels.length && !nodeLabels.includes(node.label)) continue;
        results.push({ node, depth, parentId, viaEdgeId: edgeId });
      }

      if (depth >= maxDepth) continue;

      const adj = this.queryAdjacency(nodeId, direction, edgeTypes, 1000);
      for (const a of adj) {
        if (!visited.has(a.neighbour_id)) {
          visited.add(a.neighbour_id);
          queue.push({ nodeId: a.neighbour_id, depth: depth + 1, parentId: nodeId, edgeId: a.edge_id });
        }
      }
    }

    return ok({
      from,
      algorithm,
      direction,
      maxDepth,
      count: results.length,
      nodes: results,
    });
  }

  // ── Shortest Path (BFS) ───────────────────────────────────────────────────

  private paths(body: PathsBody): Response {
    const {
      from,
      to,
      direction = 'out',
      edgeTypes = [],
      maxDepth  = 10,
    } = body;
    if (!from) return err('from is required');
    if (!to)   return err('to is required');
    if (from === to) return ok({ path: null, message: 'from and to are the same node' });

    // BFS with parent tracking
    type Visit = { nodeId: string; parentId: string | null; edgeId: string | null }

    const visited = new Map<string, Visit>([[from, { nodeId: from, parentId: null, edgeId: null }]]);
    const queue: string[] = [from];
    let depth = 0;
    let found = false;

    outer: while (queue.length > 0 && depth < maxDepth) {
      const levelSize = queue.length;
      depth++;
      for (let i = 0; i < levelSize; i++) {
        const nodeId = queue.shift()!;
        const adj = this.queryAdjacency(nodeId, direction, edgeTypes, 1000);
        for (const a of adj) {
          if (!visited.has(a.neighbour_id)) {
            visited.set(a.neighbour_id, { nodeId: a.neighbour_id, parentId: nodeId, edgeId: a.edge_id });
            if (a.neighbour_id === to) { found = true; break outer; }
            queue.push(a.neighbour_id);
          }
        }
      }
    }

    if (!found) return ok({ path: null, message: `No path found from '${from}' to '${to}'` });

    // Reconstruct path
    const nodeIds: string[] = [];
    const edgeIds: string[] = [];
    let cur: string | null = to;
    while (cur) {
      nodeIds.unshift(cur);
      const v: { nodeId: string; parentId: string | null; edgeId: string | null } = visited.get(cur)!;
      if (v.edgeId) edgeIds.unshift(v.edgeId);
      cur = v.parentId;
    }

    const nodeRows = this.fetchByIds<NodeRow>('nodes', nodeIds);
    const edgeRows = this.fetchByIds<EdgeRow>('edges', edgeIds);
    const nodeMap  = new Map(nodeRows.map(n => [n.id, rowToNode(n)]));
    const edgeMap  = new Map(edgeRows.map(e => [e.id, rowToEdge(e)]));

    const result: PathResult = {
      nodes:  nodeIds.map(id => nodeMap.get(id)!),
      edges:  edgeIds.map(id => edgeMap.get(id)!),
      length: edgeIds.length,
    };
    return ok({ path: result });
  }

  // ── Subgraph Extraction ───────────────────────────────────────────────────

  private subgraph(body: SubgraphBody): Response {
    const {
      root,
      depth      = 2,
      direction  = 'out',
      edgeTypes  = [],
      nodeLabels = [],
    } = body;
    if (!root) return err('root is required');

    const visitedNodes = new Set<string>([root]);
    const visitedEdges = new Set<string>();
    const queue: Array<{ nodeId: string; d: number }> = [{ nodeId: root, d: 0 }];

    while (queue.length > 0) {
      const { nodeId, d } = queue.shift()!;
      if (d >= depth) continue;

      const adj = this.queryAdjacency(nodeId, direction, edgeTypes, 1000);
      for (const a of adj) {
        visitedEdges.add(a.edge_id);
        if (!visitedNodes.has(a.neighbour_id)) {
          visitedNodes.add(a.neighbour_id);
          queue.push({ nodeId: a.neighbour_id, d: d + 1 });
        }
      }
    }

    const nodeRows = this.fetchByIds<NodeRow>('nodes', [...visitedNodes]);
    const edgeRows = this.fetchByIds<EdgeRow>('edges', [...visitedEdges]);

    // Apply label filter post-collection
    const filteredNodes = nodeLabels.length
      ? nodeRows.filter(n => nodeLabels.includes(n.label))
      : nodeRows;

    // Filter edges where both endpoints survive label filter
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edgeRows.filter(
      e => filteredNodeIds.has(e.from_id) && filteredNodeIds.has(e.to_id)
    );

    const result: SubgraphResult = {
      nodes: filteredNodes.map(rowToNode),
      edges: filteredEdges.map(rowToEdge),
    };
    return ok({ ...result, nodeCount: result.nodes.length, edgeCount: result.edges.length });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  private stats(): Response {
    type CountRow = { c: number; [key: string]: SqlStorageValue };
    type LabelRow = { label: string; count: number; [key: string]: SqlStorageValue };
    type TypeRow  = { type: string;  count: number; [key: string]: SqlStorageValue };
    const nodeCount = [...this.sql.exec<CountRow>('SELECT COUNT(*) as c FROM nodes')][0]?.c ?? 0;
    const edgeCount = [...this.sql.exec<CountRow>('SELECT COUNT(*) as c FROM edges')][0]?.c ?? 0;
    const labelRows = [...this.sql.exec<LabelRow>(
      'SELECT label, COUNT(*) as count FROM nodes GROUP BY label ORDER BY count DESC'
    )];
    const typeRows = [...this.sql.exec<TypeRow>(
      'SELECT type, COUNT(*) as count FROM edges GROUP BY type ORDER BY count DESC'
    )];
    return ok({
      nodeCount, edgeCount,
      nodeLabels: labelRows,
      edgeTypes:  typeRows,
    });
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  private reset(): Response {
    this.sql.exec('DELETE FROM adjacency');
    this.sql.exec('DELETE FROM edges');
    this.sql.exec('DELETE FROM nodes');
    return ok({ reset: true });
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  /** Query the adjacency table with optional direction and edge type filters. */
  private queryAdjacency(
    nodeId: string,
    direction: 'in' | 'out' | 'both',
    edgeTypes: string[],
    limit: number
  ): AdjacencyRow[] {
    const params: unknown[] = [nodeId];
    let sql = 'SELECT neighbour_id, edge_id, edge_type, direction FROM adjacency WHERE node_id = ?';

    if (direction !== 'both') {
      sql += ' AND direction = ?';
      params.push(direction);
    }

    if (edgeTypes.length) {
      sql += ` AND edge_type IN (${edgeTypes.map(() => '?').join(',')})`;
      params.push(...edgeTypes);
    }

    sql += ' LIMIT ?';
    params.push(limit);

    return [...this.sql.exec<AdjacencyRow>(sql, ...params)];
  }

  /** Fetch multiple rows by ID in a single IN query (chunked to avoid SQLite limits). */
  private fetchByIds<T extends Record<string, SqlStorageValue>>(table: string, ids: string[]): T[] {
    if (!ids.length) return [];
    const CHUNK = 100;
    const results: T[] = [];
    for (let i = 0; i < ids.length; i += CHUNK) {
      const chunk = ids.slice(i, i + CHUNK);
      const placeholders = chunk.map(() => '?').join(',');
      const rows = [...this.sql.exec<T>(`SELECT * FROM ${table} WHERE id IN (${placeholders})`, ...chunk)];
      results.push(...rows);
    }
    return results;
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Extract path segment by index (0-based after leading slash). */
function seg(path: string, idx: number): string {
  return path.split('/').filter(Boolean)[idx] ?? '';
}
