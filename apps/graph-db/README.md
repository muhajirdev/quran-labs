# edgraph

Edge-native property graph database built on Cloudflare Durable Objects.

**One DO instance per graph. Traversal runs inside the DO — zero per-hop network cost.**

---

## Why

Graph databases differ from relational databases in one key way: **index-free adjacency**. In an RDBMS, finding a node's neighbours requires a JOIN across the edges table — cost grows with total graph size. In a native graph store, each node holds direct pointers to its neighbours, so traversal cost is proportional to the local neighbourhood, not the total graph.

edgraph implements this on Cloudflare by:
- Storing an adjacency index alongside the edges table (two rows per edge — one outbound, one inbound)
- Running multi-hop BFS/DFS traversal **inside the Durable Object** using DO SQLite
- One DO instance per graph, so strong consistency is guaranteed per graph

The result: a multi-hop traversal query is a single HTTP call that executes entirely in local SQLite, at the Cloudflare edge closest to the caller.

---

## API

All write operations require `Authorization: Bearer <EDGRAPH_API_KEY>`.  
Reads are open by default.

### Nodes

```
POST   /graphs/:graphId/nodes              Create a node
GET    /graphs/:graphId/nodes              List nodes (?label=&limit=&offset=)
GET    /graphs/:graphId/nodes/:id          Get a node
PUT    /graphs/:graphId/nodes/:id          Update a node
DELETE /graphs/:graphId/nodes/:id          Delete a node
GET    /graphs/:graphId/nodes/:id/neighbours  Direct neighbours (?direction=out&type=&limit=)
```

### Edges

```
POST   /graphs/:graphId/edges              Create an edge
GET    /graphs/:graphId/edges              List edges (?type=&fromId=&toId=&limit=&offset=)
GET    /graphs/:graphId/edges/:id          Get an edge
PUT    /graphs/:graphId/edges/:id          Update an edge
DELETE /graphs/:graphId/edges/:id          Delete an edge
```

### Traversal

```
POST /graphs/:graphId/traverse             BFS or DFS traversal
POST /graphs/:graphId/paths               Shortest path between two nodes
POST /graphs/:graphId/subgraph             Extract a subgraph from a root node
```

### Utility

```
GET    /graphs/:graphId/stats              Node/edge counts, label/type breakdown
DELETE /graphs/:graphId/reset              Wipe the entire graph (write auth required)
```

---

## Request / Response Examples

### Create a node

```json
POST /graphs/my-graph/nodes
{ "label": "Person", "properties": { "name": "Alice", "role": "CTO" } }

→ { "id": "...", "label": "Person", "properties": { ... }, "createdAt": "...", "updatedAt": "..." }
```

### Create an edge

```json
POST /graphs/my-graph/edges
{ "fromId": "alice-id", "toId": "bob-id", "type": "knows", "properties": { "since": 2019 } }
```

### Traverse

```json
POST /graphs/my-graph/traverse
{
  "from": "alice-id",
  "direction": "out",
  "maxDepth": 3,
  "edgeTypes": ["influences", "manages"],
  "nodeLabels": ["Person"],
  "algorithm": "bfs",
  "limit": 200
}

→ {
    "from": "alice-id",
    "count": 12,
    "nodes": [
      { "node": { ... }, "depth": 1, "parentId": "alice-id", "viaEdgeId": "..." },
      ...
    ]
  }
```

### Shortest path

```json
POST /graphs/my-graph/paths
{
  "from": "alice-id",
  "to": "carol-id",
  "direction": "out",
  "maxDepth": 6
}

→ {
    "path": {
      "nodes": [ { ... }, { ... }, { ... } ],
      "edges": [ { ... }, { ... } ],
      "length": 2
    }
  }
```

### Subgraph

```json
POST /graphs/my-graph/subgraph
{
  "root": "alice-id",
  "depth": 2,
  "direction": "out",
  "edgeTypes": ["manages"]
}

→ { "nodes": [...], "edges": [...], "nodeCount": 8, "edgeCount": 7 }
```

---

## Deploy

```bash
# Install
bun install

# Set API key
wrangler secret put EDGRAPH_API_KEY

# Deploy
wrangler deploy

# Dev
wrangler dev
```

---

## Graph IDs

Each unique `graphId` in the URL maps to a separate DO instance — fully isolated, strongly consistent. Use any string as a graph ID:

```
/graphs/fathom-project-abc123/...
/graphs/my-knowledge-graph/...
/graphs/production/...
```

---

## Data model

**Property graph** — nodes have a label + JSON properties, edges have a type + JSON properties.

```
(Person:Alice) --[manages]--> (Person:Bob) --[contributes]--> (Project:X)
    ^                                                              |
    +---------------------[sponsors]-------------------------------+
```

---

## Performance characteristics

| Operation | Complexity |
|-----------|-----------|
| Get node / edge | O(1) — primary key lookup |
| Get neighbours | O(degree) — adjacency index |
| k-hop traversal | O(k × avg_degree) — no full-table scan |
| Shortest path (BFS) | O(V + E) over reachable subgraph |
| Subgraph extraction | O(nodes + edges in subgraph) |

---

## Licence

MIT
