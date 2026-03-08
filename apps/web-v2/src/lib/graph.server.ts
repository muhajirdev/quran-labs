import { createServerFn } from '@tanstack/react-start'
import { GraphMemory } from 'honidev'

const graph = new GraphMemory({
    graphId: 'quran-graph',
    url: 'https://quran-graph-db.qalam.workers.dev',
    apiKey: process.env.EDGRAPH_API_KEY
})

export const upsertNode = createServerFn({ method: 'POST' }).handler(
    async (data: { id: string; label: string; properties?: Record<string, any> }) => {
        return await graph.upsertNode(data.id, data.label, data.properties || {})
    }
)

export const upsertEdge = createServerFn({ method: 'POST' }).handler(
    async (data: { fromId: string; toId: string; type: string; properties?: Record<string, any> }) => {
        return await graph.upsertEdge(data.fromId, data.toId, data.type, data.properties)
    }
)

export const getNeighbours = createServerFn({ method: 'GET' }).handler(
    async (data: { nodeId: string; direction?: 'in' | 'out' | 'both'; types?: string[] }) => {
        return await graph.getNeighbours(data.nodeId, data.direction, data.types)
    }
)

export const shortestPath = createServerFn({ method: 'POST' }).handler(
    async (data: { from: string; to: string; maxDepth?: number }) => {
        return await graph.shortestPath(data.from, data.to, data.maxDepth)
    }
)

export const traverse = createServerFn({ method: 'POST' }).handler(
    async (data: {
        from: string
        direction?: 'in' | 'out' | 'both'
        maxDepth?: number
        edgeTypes?: string[]
        nodeLabels?: string[]
        algorithm?: 'bfs' | 'dfs'
        limit?: number
    }) => {
        return await graph.traverse(data.from, {
            direction: data.direction,
            maxDepth: data.maxDepth,
            edgeTypes: data.edgeTypes,
            nodeLabels: data.nodeLabels,
            algorithm: data.algorithm,
            limit: data.limit
        })
    }
)

export const toContext = createServerFn({ method: 'POST' }).handler(
    async (data: { entityIds: string[]; depth?: number }) => {
        return await graph.toContext(data.entityIds, data.depth)
    }
)

export const getStats = createServerFn({ method: 'GET' }).handler(
    async () => {
        return await graph.stats()
    }
)
