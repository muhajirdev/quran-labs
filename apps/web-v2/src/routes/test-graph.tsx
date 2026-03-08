import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  upsertNode,
  upsertEdge,
  getNeighbours,
  shortestPath,
  toContext,
  getStats
} from '../lib/graph.server'

export const Route = createFileRoute('/test-graph')({
  component: TestGraphPage,
})

function TestGraphPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      await upsertNode({ data: { id: 'alice', label: 'Person', properties: { role: 'CTO' } } })
      await upsertNode({ data: { id: 'acme', label: 'Company', properties: { industry: 'SaaS' } } })
      await upsertEdge({ data: { fromId: 'alice', toId: 'acme', type: 'works_at' } })

      const neighbours = await getNeighbours({ data: { nodeId: 'alice', direction: 'out' } })
      setResult(JSON.stringify(neighbours, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testToContext = async () => {
    setLoading(true)
    try {
      const context = await toContext({ data: { entityIds: ['alice'], depth: 2 } })
      setResult(context)
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testShortestPath = async () => {
    setLoading(true)
    try {
      await upsertNode({ data: { id: 'bob', label: 'Person', properties: { role: 'Engineer' } } })
      await upsertEdge({ data: { fromId: 'alice', toId: 'bob', type: 'manages' } })
      await upsertEdge({ data: { fromId: 'bob', toId: 'acme', type: 'works_at' } })

      const path = await shortestPath({ data: { from: 'alice', to: 'bob' } })
      setResult(JSON.stringify(path, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGetStats = async () => {
    setLoading(true)
    try {
      const stats = await getStats()
      setResult(JSON.stringify(stats, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Test Graph Database
        </h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={runTest}
            disabled={loading}
            className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-[#d94d1b] disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Basic Test'}
          </button>

          <button
            onClick={testToContext}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Test toContext()
          </button>

          <button
            onClick={testShortestPath}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            Test Shortest Path
          </button>

          <button
            onClick={() => handleGetStats()}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            Get Stats
          </button>

        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Result:
          </h2>
          <pre className="bg-gray-100 dark:bg-slate-800 p-4 rounded-md overflow-auto text-sm text-gray-800 dark:text-gray-200">
            {result || 'Click a button to run a test'}
          </pre>
        </div>
      </div>
    </div>
  )
}
