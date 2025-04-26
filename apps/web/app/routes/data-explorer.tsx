import { useState, useRef, useEffect, lazy } from 'react';
import { Suspense } from 'react';

const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

// Define the client loader to handle client-side data fetching
export async function clientLoader() {
  return { initialQuery: 'MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t' };
}

// Set hydrate property to true to enable client-side hydration
clientLoader.hydrate = true as const;

// Define types for graph data
interface GraphNode {
  id: string;
  label?: string;
  properties?: Record<string, any>;
  [key: string]: any;
}

interface GraphLink {
  source: string;
  target: string;
  type?: string;
  properties?: Record<string, any>;
  [key: string]: any;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function DataExplorer({ loaderData }: { loaderData?: { initialQuery: string } } = {}) {
  const [query, setQuery] = useState(loaderData?.initialQuery || 'MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [showGraph, setShowGraph] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Function to convert query results to graph data
  const convertToGraphData = (results: any): GraphData => {
    const graphData: GraphData = {
      nodes: [],
      links: []
    };

    const nodeMap = new Map<string, GraphNode>();

    // Process each row in the results
    results.data.forEach((row: any) => {
      // Check for verse nodes (v)
      if (row.v && typeof row.v === 'object') {
        const verse = row.v;
        // Create a unique ID for the verse
        const verseId = `${verse._label}-${verse.verse_key}`;

        // Add verse node if it doesn't exist
        if (!nodeMap.has(verseId)) {
          const node: GraphNode = {
            id: verseId,
            label: verse._label,
            properties: { ...verse },
            // Use verse_key as the display name
            name: verse.verse_key || `${verse.surah_number}:${verse.ayah_number}`,
            // Make verses slightly smaller
            val: 0.8,
            color: getNodeColor(verse._label)
          };

          nodeMap.set(verseId, node);
          graphData.nodes.push(node);
        }
      }

      // Check for topic nodes (t)
      if (row.t && typeof row.t === 'object') {
        const topic = row.t;
        // Create a unique ID for the topic
        const topicId = `${topic._label}-${topic.topic_id}`;

        // Add topic node if it doesn't exist
        if (!nodeMap.has(topicId)) {
          const node: GraphNode = {
            id: topicId,
            label: topic._label,
            properties: { ...topic },
            // Use name or topic_id as the display name
            name: topic.name || `Topic ${topic.topic_id}`,
            // Make topics slightly larger
            val: 1.2,
            color: getNodeColor(topic._label)
          };

          nodeMap.set(topicId, node);
          graphData.nodes.push(node);
        }
      }

      // Check for relationships (h)
      if (row.h && typeof row.h === 'object' && row.v && row.t) {
        const verse = row.v;
        const topic = row.t;
        const rel = row.h;

        // Create IDs for source and target
        const verseId = `${verse._label}-${verse.verse_key}`;
        const topicId = `${topic._label}-${topic.topic_id}`;

        // Add relationship
        if (nodeMap.has(verseId) && nodeMap.has(topicId)) {
          graphData.links.push({
            source: verseId,
            target: topicId,
            type: rel._label || 'HAS_TOPIC',
            value: 1
          });
        }
      }
    });

    // If no relationships were found but we have nodes with _id, _label, etc.
    if (graphData.links.length === 0 && results.data.length > 0) {
      // Process each row in the results for generic nodes
      results.data.forEach((row: any) => {
        // Process each column in the row
        results.columns.forEach((column: string) => {
          const value = row[column];

          // Skip if not an object or null
          if (!value || typeof value !== 'object') return;

          // Check if it's a node (has _id and _label properties)
          if ((value._id !== undefined || value._ID !== undefined) &&
            (value._label !== undefined || value._LABEL !== undefined)) {

            const label = value._label || value._LABEL;
            const id = value._id || value._ID;
            let nodeId;

            // Handle different ID formats
            if (typeof id === 'object' && id.offset !== undefined) {
              nodeId = `${label}-${id.offset}-${id.table || 0}`;
            } else {
              nodeId = `${label}-${id}`;
            }

            // Add node if it doesn't exist
            if (!nodeMap.has(nodeId)) {
              const node: GraphNode = {
                id: nodeId,
                label: label,
                properties: { ...value },
                // Add display properties - try different possible name fields
                name: value.name || value.verse_key || value.topic_id ||
                  (value.surah_number && value.ayah_number ?
                    `${value.surah_number}:${value.ayah_number}` : nodeId),
                val: 1, // Size
                color: getNodeColor(label)
              };

              nodeMap.set(nodeId, node);
              graphData.nodes.push(node);
            }
          }
        });
      });

      // Try to extract relationships from the results
      if (query.toUpperCase().includes('MATCH') &&
        query.toUpperCase().includes('RETURN')) {

        results.data.forEach((row: any) => {
          let source: string | null = null;
          let target: string | null = null;
          let relType: string | null = null;

          // Look for relationship objects in the row
          Object.keys(row).forEach(key => {
            const value = row[key];

            // Check if this is a relationship object
            if (value && typeof value === 'object' &&
              value._src !== undefined && value._dst !== undefined) {

              // Try to find source and target nodes
              const sourceNode = graphData.nodes.find(n =>
                n.properties?._id?.offset === value._src.offset &&
                n.properties?._id?.table === value._src.table);

              const targetNode = graphData.nodes.find(n =>
                n.properties?._id?.offset === value._dst.offset &&
                n.properties?._id?.table === value._dst.table);

              if (sourceNode && targetNode) {
                source = sourceNode.id;
                target = targetNode.id;
                relType = value._label;
              }
            }
          });

          // If we found both source and target, add a link
          if (source && target && source !== target) {
            graphData.links.push({
              source,
              target,
              type: relType || 'RELATED_TO',
              value: 1
            });
          }
        });
      }
    }

    return graphData;
  };

  // Function to get color based on node label with better contrast
  const getNodeColor = (label: string): string => {
    const colors: Record<string, string> = {
      Topic: '#2563EB',    // darker blue
      Verse: '#047857',    // darker green
      Chapter: '#D97706',  // darker orange
      Word: '#7E22CE',     // darker purple
      Test: '#DC2626',     // darker red
      // Add more specific colors for different node types
      Surah: '#B45309',    // amber
      Ayah: '#059669',     // emerald
      Translation: '#4F46E5', // indigo
      Tafsir: '#7C3AED',   // violet
      Root: '#BE185D',     // pink
      Concept: '#0369A1'   // light blue
    };

    return colors[label] || '#4B5563'; // darker gray for better contrast
  };

  // Execute initial query when component loads
  useEffect(() => {
    // Execute a simple query to test the API
    const timer = setTimeout(() => {
      executeQuery();
    }, 500); // Add a small delay to ensure the component is fully mounted

    return () => clearTimeout(timer);
  }, []);

  // Update dimensions when the window is resized
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 500, // Fixed height or adjust as needed
        });
      }
    };

    // Initial dimensions
    updateDimensions();

    // Add event listener for window resize
    window.addEventListener("resize", updateDimensions);

    // Clean up
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setShowGraph(false);

    try {
      console.log('Executing query:', query);

      // Mock data for testing if API is not available
      const mockData = {
        columns: ['n'],
        data: [
          {
            n: {
              _ID: 1,
              _LABEL: 'Topic',
              name: 'Faith',
              topic_id: 1
            }
          },
          {
            n: {
              _ID: 2,
              _LABEL: 'Topic',
              name: 'Prayer',
              topic_id: 2
            }
          }
        ],
        execution_time_ms: 10.5
      };

      try {
        const response = await fetch('https://kuzu-api.fly.dev/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        const data = await response.json() as any;
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to execute query');
        }

        setResults(data);

        // Convert results to graph data if there are results
        if (data.data && data.data.length > 0) {
          const newGraphData = convertToGraphData(data);
          console.log('Converted graph data:', newGraphData);
          setGraphData(newGraphData);

          // Show graph if there are nodes
          if (newGraphData.nodes.length > 0) {
            setShowGraph(true);
          }
        }
      } catch (apiError) {
        console.warn('API error, using mock data:', apiError);
        // Use mock data if API fails
        setResults(mockData);
        const newGraphData = convertToGraphData(mockData);
        setGraphData(newGraphData);
        setShowGraph(true);
      }
    } catch (err) {
      console.error('Error executing query:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Quran Graph Data Explorer</h1>
          <p className="text-white mt-2">Explore the Quran Knowledge Graph through Cypher queries</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-white p-6 rounded-xl shadow-md border border-gray-300">
          <label htmlFor="query" className="block text-base font-medium mb-2 text-gray-900">
            Cypher Query
          </label>
          <div className="flex flex-col space-y-4">
            <textarea
              id="query"
              className="w-full h-40 p-4 border border-gray-400 rounded-md font-mono text-gray-900 bg-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your Cypher query here..."
            />
            <button
              onClick={executeQuery}
              disabled={loading}
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:bg-blue-400 w-full md:w-auto md:self-end font-medium"
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-500 text-red-800 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="font-mono">{error}</p>
          </div>
        )}

        {results && (
          <div className="mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Results</h2>
              <div className="overflow-x-auto">
                <div className="p-4 bg-gray-200 rounded-md mb-4 border border-gray-300">
                  <p className="text-sm text-gray-800 font-medium">
                    Execution time: {results.execution_time_ms.toFixed(2)}ms
                  </p>
                  <p className="text-sm text-gray-800 font-medium">
                    Rows returned: {results.data.length}
                  </p>
                </div>

                {/* Graph Visualization */}
                {showGraph && graphData.nodes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Graph Visualization</h3>
                      <div className="text-sm text-gray-800 font-medium">
                        {graphData.nodes.length} nodes, {graphData.links.length} relationships
                      </div>
                    </div>
                    <div ref={containerRef} className="border border-gray-400 rounded-xl overflow-hidden bg-white shadow-md">
                      <Suspense fallback={
                        <div className="flex items-center justify-center h-[500px] bg-white">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                            <p className="text-gray-800 font-medium">Loading visualization...</p>
                          </div>
                        </div>
                      }>
                        <ForceGraph2D
                          ref={graphRef}
                          graphData={graphData}
                          width={dimensions.width}
                          height={dimensions.height}
                          backgroundColor="#FFFFFF"
                          nodeLabel={(node: any) => `${node.label}: ${node.name}`}
                          nodeColor={(node: any) => node.color}
                          linkLabel={(link: any) => link.type}
                          linkWidth={1}
                          linkColor={() => 'rgba(0,0,0,0.3)'}
                          nodeRelSize={6}
                          cooldownTicks={100}
                          nodeCanvasObject={(node: any, ctx, globalScale) => {
                            // Draw the node circle
                            const label = node.name as string;
                            const fontSize = 12 / globalScale;
                            const nodeR = Math.sqrt((node.val || 1) * 25 / Math.PI);

                            ctx.beginPath();
                            ctx.arc(node.x || 0, node.y || 0, nodeR, 0, 2 * Math.PI);
                            ctx.fillStyle = node.color || '#4B5563';
                            ctx.fill();

                            // Draw the label below the node
                            ctx.font = `bold ${fontSize}px Sans-Serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#111827';

                            // Add a white background to the text for better readability
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                            ctx.fillRect(
                              (node.x || 0) - bckgDimensions[0] / 2,
                              (node.y || 0) + nodeR + fontSize / 2 - bckgDimensions[1] / 2,
                              bckgDimensions[0],
                              bckgDimensions[1]
                            );

                            ctx.fillStyle = '#111827';
                            ctx.fillText(label, node.x || 0, (node.y || 0) + nodeR + fontSize / 2);
                          }}
                          onNodeClick={(node: any) => {
                            setSelectedNode(node);
                          }}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}

                {/* Table View */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Table View</h3>
                  {results.data.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-400 rounded-lg">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-200">
                            {results.columns.map((column: string) => (
                              <th key={column} className="px-4 py-2 text-left border-b border-gray-400 text-gray-900 font-semibold">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {results.data.map((row: any, rowIndex: number) => (
                            <tr key={rowIndex} className="border-b border-gray-300 hover:bg-gray-100">
                              {results.columns.map((column: string) => (
                                <td key={`${rowIndex}-${column}`} className="px-4 py-2 text-gray-900">
                                  {renderCellValue(row[column])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">No results returned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Example Queries</h2>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-gray-900">Basic Queries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (t:Topic) RETURN t LIMIT 10')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Get Topics</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">MATCH (t:Topic) RETURN t LIMIT 10</pre>
              </div>

              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (v:Verse) WHERE v.surah_number = 99 RETURN v')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Get Verses by Surah</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">MATCH (v:Verse) WHERE v.surah_number = 99 RETURN v</pre>
              </div>

              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (t:Topic) WHERE t.name CONTAINS "atom" RETURN t')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Search Topics</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">MATCH (t:Topic) WHERE t.name CONTAINS "atom" RETURN t</pre>
              </div>

              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (n) RETURN DISTINCT labels(n) as NodeTypes, count(n) as Count')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Count Node Types</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">MATCH (n) RETURN DISTINCT labels(n) as NodeTypes, count(n) as Count</pre>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-gray-900">Graph Visualization Queries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.surah_number = 99 RETURN v, h, t')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Verse-Topic Relationships</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE v.surah_number = 99
RETURN v, h, t`}</pre>
              </div>

              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE t.name = "Atom" RETURN v, h, t')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Topics by Name</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE t.name = "Atom"
RETURN v, h, t`}</pre>
              </div>

              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Topics for a Specific Verse</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE v.verse_key = "99:7"
RETURN v, h, t`}</pre>
              </div>

              <div
                className="p-4 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE t.topic_id IN [394, 1287, 1428] RETURN v, h, t LIMIT 30')}
              >
                <h3 className="font-medium mb-2 text-gray-900">Multiple Topics</h3>
                <pre className="text-sm bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE t.topic_id IN [394, 1287, 1428]
RETURN v, h, t LIMIT 30`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden border border-gray-400">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">{selectedNode.name}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-white hover:text-blue-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div
                  className="w-6 h-6 rounded-full mr-2 border border-gray-400"
                  style={{ backgroundColor: selectedNode.color || '#4B5563' }}
                ></div>
                <span className="font-medium text-gray-900">Type: {selectedNode.label}</span>
              </div>

              {selectedNode.properties && (
                <div className="mt-2">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Properties:</h4>
                  <div className="bg-gray-100 rounded p-3 border border-gray-300">
                    {Object.entries(selectedNode.properties).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2 mb-1 text-sm">
                        <span className="text-gray-900 font-medium">{key}:</span>
                        <span className="col-span-2 text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-300">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function meta() {
  return [
    { title: "Quran Knowledge Graph | Data Explorer" },
    { name: "description", content: "Explore the Quran Knowledge Graph through Cypher queries and interactive visualizations" },
  ];
}

// Fallback component for when JavaScript is loading
export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Quran Graph Data Explorer</h1>
          <p className="text-white mt-2">Explore the Quran Knowledge Graph through Cypher queries</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="border border-gray-400 rounded-xl overflow-hidden bg-white shadow-lg">
          <div className="flex items-center justify-center h-[600px] bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-800 font-medium">Loading data explorer...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render cell values based on their type
function renderCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-600 italic">null</span>;
  }

  if (typeof value === 'object') {
    return (
      <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded border border-gray-300 text-gray-900">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-gray-900">{String(value)}</span>;
}
