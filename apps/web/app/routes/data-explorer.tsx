import { useState } from 'react';

// Define the client loader to handle client-side data fetching
export const loader = (async () => {
  return { initialQuery: 'MATCH (n) RETURN n LIMIT 10' };
});

export default function DataExplorer() {
  const [query, setQuery] = useState('MATCH (n) RETURN n LIMIT 10');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://kuzu-api.fly.dev/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to execute query');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quran Graph Data Explorer</h1>

      <div className="mb-6">
        <label htmlFor="query" className="block text-sm font-medium mb-2">
          Cypher Query
        </label>
        <div className="flex flex-col space-y-4">
          <textarea
            id="query"
            className="w-full h-40 p-4 border border-gray-300 rounded-md font-mono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your Cypher query here..."
          />
          <button
            onClick={executeQuery}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 w-full md:w-auto md:self-end"
          >
            {loading ? 'Executing...' : 'Execute Query'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="font-mono">{error}</p>
        </div>
      )}

      {results && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="overflow-x-auto">
            <div className="p-4 bg-gray-100 rounded-md mb-2">
              <p className="text-sm text-gray-600">
                Execution time: {results.execution_time_ms.toFixed(2)}ms
              </p>
              <p className="text-sm text-gray-600">
                Rows returned: {results.data.length}
              </p>
            </div>

            {results.data.length > 0 ? (
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {results.columns.map((column: string) => (
                      <th key={column} className="px-4 py-2 text-left border-b">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex} className="border-b">
                      {results.columns.map((column: string) => (
                        <td key={`${rowIndex}-${column}`} className="px-4 py-2">
                          {renderCellValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No results returned</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Example Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('MATCH (t:Topic) RETURN t LIMIT 10')}
          >
            <h3 className="font-medium mb-2">Get Topics</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">MATCH (t:Topic) RETURN t LIMIT 10</pre>
          </div>

          <div
            className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('MATCH (t:Topic) WHERE t.name CONTAINS "prayer" RETURN t')}
          >
            <h3 className="font-medium mb-2">Search Topics</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">MATCH (t:Topic) WHERE t.name CONTAINS "prayer" RETURN t</pre>
          </div>

          <div
            className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('MATCH (t:Topic)-[r]->(t2:Topic) RETURN t.name, type(r), t2.name LIMIT 20')}
          >
            <h3 className="font-medium mb-2">Topic Relationships</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">{`MATCH (t:Topic)-[r]->(t2:Topic) RETURN t.name, type(r), t2.name LIMIT 20`}</pre>
          </div>

          <div
            className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('MATCH (n) RETURN DISTINCT labels(n) as NodeTypes, count(n) as Count')}
          >
            <h3 className="font-medium mb-2">Count Node Types</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">MATCH (n) RETURN DISTINCT labels(n) as NodeTypes, count(n) as Count</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback component for when JavaScript is loading
export function HydrateFallbackComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quran Graph Data Explorer</h1>
      <p>Loading explorer...</p>
    </div>
  );
}

// Helper function to render cell values based on their type
function renderCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>;
  }

  if (typeof value === 'object') {
    return (
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return String(value);
}
