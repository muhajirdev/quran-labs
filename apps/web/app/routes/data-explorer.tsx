import { useState, useRef, useEffect, lazy } from 'react';
import { Suspense } from 'react';
import { DataExplorerSidebar } from '~/components/data-explorer/Sidebar';
import { ExampleQueries } from '~/components/data-explorer/ExampleQueries';
import { SchemaViewer } from '~/components/data-explorer/SchemaViewer';
import { GraphSettings } from '~/components/data-explorer/GraphSettings';
import { renderCellValue, getNodeColor } from '~/components/data-explorer/utils';
import type { GraphData, GraphNode, SchemaData, NodeTable, RelationshipTable } from '~/components/data-explorer/types';

const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

// Define the client loader to handle client-side data fetching
export async function clientLoader() {
  return { initialQuery: 'MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t' };
}

// Set hydrate property to true to enable client-side hydration
clientLoader.hydrate = true as const;

export default function DataExplorer({ loaderData }: { loaderData?: { initialQuery: string } } = {}) {
  const [query, setQuery] = useState(loaderData?.initialQuery || 'MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [showGraph, setShowGraph] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [graphSettingsOpen, setGraphSettingsOpen] = useState(false);
  const [graphSettings, setGraphSettings] = useState({
    showRelationshipLabels: true,
    showNodeLabels: true,
    use3D: false,
    darkMode: false,
    nodeSize: 6,
    linkWidth: 1.5,
    nodeLabelProperty: {} as Record<string, string>,
    relationshipLabelProperty: {} as Record<string, string>
  });
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Function to get the display name for a node based on its label and properties
  const getNodeDisplayName = (label: string, properties: any): string => {
    // Helper function to truncate text
    const truncateText = (text: string, maxLength: number = 50): string => {
      return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    };

    // For text-based nodes (Translation, Tafsir), use the text property
    if ((label === 'Translation' || label === 'Tafsir') && properties.text) {
      return truncateText(properties.text as string);
    }

    // For Verse nodes, prefer verse_key
    if (label === 'Verse') {
      return properties.verse_key ||
        (properties.surah_number && properties.ayah_number ?
          `${properties.surah_number}:${properties.ayah_number}` :
          `Verse-${properties._id?.offset || ''}`);
    }

    // For Topic nodes, prefer name or topic_id
    if (label === 'Topic') {
      return properties.name ||
        (properties.topic_id ? `Topic ${properties.topic_id}` :
          `Topic-${properties._id?.offset || ''}`);
    }

    // For Word nodes
    if (label === 'Word') {
      return properties.text ||
        (properties.verse_key ? `Word in ${properties.verse_key}` :
          `Word-${properties._id?.offset || ''}`);
    }

    // For Chapter/Surah nodes
    if (label === 'Chapter' || label === 'Surah') {
      return properties.name ||
        (properties.surah_number ? `Surah ${properties.surah_number}` :
          `${label}-${properties._id?.offset || ''}`);
    }

    // For all other node types, use standard properties
    return properties.name ||
      properties.verse_key ||
      properties.topic_id ||
      (properties.surah_number && properties.ayah_number ?
        `${properties.surah_number}:${properties.ayah_number}` :
        `${label}-${properties._id?.offset || ''}`);
  };

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
            // Use getNodeDisplayName to determine the display name
            name: getNodeDisplayName(verse._label, verse),
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
            // Use getNodeDisplayName to determine the display name
            name: getNodeDisplayName(topic._label, topic),
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
                name: getNodeDisplayName(label, value),
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

  // Function to expand a node (fetch related nodes)
  const expandNode = async (nodeId: string) => {
    // Don't expand if already expanded
    if (expandedNodes.has(nodeId)) return;

    // Get the node from the graph data
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Create a query based on the node type
    let expansionQuery = '';

    if (node.label === 'Verse') {
      // For verses, find all topics
      expansionQuery = `MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
                        WHERE v.verse_key = "${node.properties?.verse_key || ''}"
                        RETURN v, h, t`;
    } else if (node.label === 'Topic') {
      // For topics, find all verses
      expansionQuery = `MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
                        WHERE t.topic_id = ${node.properties?.topic_id || 0}
                        RETURN v, h, t`;
    } else if (schema) {
      // Check if this node type exists in our schema
      const nodeTable = schema.nodeTables.find(t => t.name === node.label);
      if (nodeTable) {
        // Find relationships that connect to this node type
        const relTables = schema.relTables.filter(r =>
          r.connectivity.some(c => c.src === node.label || c.dst === node.label)
        );

        if (relTables.length > 0) {
          // Use the first relationship we find
          const relTable = relTables[0];
          const conn = relTable.connectivity.find(c => c.src === node.label || c.dst === node.label);

          if (conn) {
            if (conn.src === node.label) {
              // This node is the source
              expansionQuery = `MATCH (n:${node.label})-[r:${relTable.name}]->(m:${conn.dst})
                              WHERE n._id.offset = ${node.properties?._id?.offset || 0}
                              RETURN n, r, m LIMIT 20`;
            } else {
              // This node is the destination
              expansionQuery = `MATCH (n:${conn.src})-[r:${relTable.name}]->(m:${node.label})
                              WHERE m._id.offset = ${node.properties?._id?.offset || 0}
                              RETURN n, r, m LIMIT 20`;
            }
          } else {
            // Fallback to generic query
            expansionQuery = `MATCH (n)-[r]-(m)
                            WHERE n._id.offset = ${node.properties?._id?.offset || 0}
                            RETURN n, r, m LIMIT 20`;
          }
        } else {
          // No relationships found, use generic query
          expansionQuery = `MATCH (n)-[r]-(m)
                          WHERE n._id.offset = ${node.properties?._id?.offset || 0}
                          RETURN n, r, m LIMIT 20`;
        }
      } else {
        // Node type not found in schema, use generic query
        expansionQuery = `MATCH (n)-[r]-(m)
                        WHERE n._id.offset = ${node.properties?._id?.offset || 0}
                        RETURN n, r, m LIMIT 20`;
      }
    } else {
      // Schema not available, use generic query
      expansionQuery = `MATCH (n)-[r]-(m)
                      WHERE n._id.offset = ${node.properties?._id?.offset || 0}
                      RETURN n, r, m LIMIT 20`;
    }

    try {
      setLoading(true);

      const response = await fetch('https://kuzu-api.fly.dev/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: expansionQuery }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to execute expansion query');
      }

      // Convert results to graph data
      const newGraphData = convertToGraphData(data);

      // Merge with existing graph data
      const mergedNodes = [...graphData.nodes];
      const mergedLinks = [...graphData.links];

      // Add new nodes if they don't exist
      newGraphData.nodes.forEach(newNode => {
        if (!mergedNodes.some(n => n.id === newNode.id)) {
          mergedNodes.push(newNode);
        }
      });

      // Add new links if they don't exist
      newGraphData.links.forEach(newLink => {
        if (!mergedLinks.some(l =>
          l.source === newLink.source &&
          l.target === newLink.target &&
          l.type === newLink.type
        )) {
          mergedLinks.push(newLink);
        }
      });

      // Update graph data
      setGraphData({
        nodes: mergedNodes,
        links: mergedLinks
      });

      // Mark node as expanded
      setExpandedNodes(prev => new Set([...prev, nodeId]));

    } catch (err) {
      console.error('Error expanding node:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch the database schema
  const fetchSchema = async () => {
    setSchemaLoading(true);
    try {
      // First get the node tables
      const nodeTablesQuery = "CALL show_tables() RETURN *";
      const response = await fetch('https://kuzu-api.fly.dev/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: nodeTablesQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schema');
      }

      const tablesData = await response.json() as any;
      console.log('Tables data:', tablesData);

      // Process the tables data to create our schema
      const nodeTables: NodeTable[] = [];
      const relTables: RelationshipTable[] = [];

      // Process each table to get its properties and type
      for (const table of tablesData.data) {
        // Skip system tables
        if (table.name.startsWith('_')) continue;

        // Get table properties
        const propertiesQuery = `CALL TABLE_INFO('${table.name}') RETURN *`;
        const propsResponse = await fetch('https://kuzu-api.fly.dev/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: propertiesQuery }),
        });

        if (!propsResponse.ok) {
          console.error(`Failed to fetch properties for table ${table.name}`);
          continue;
        }

        const propsData = await propsResponse.json() as any;
        const properties = propsData.data.map((prop: any) => ({
          name: prop.name,
          type: prop.type,
          isPrimaryKey: prop['primary key'] === 'YES'
        }));

        if (table.type === 'NODE') {
          nodeTables.push({
            name: table.name,
            properties
          });
        } else if (table.type === 'REL') {
          // For relationship tables, get connectivity information
          const connectivityQuery = `CALL SHOW_CONNECTION('${table.name}') RETURN *`;
          const connResponse = await fetch('https://kuzu-api.fly.dev/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: connectivityQuery }),
          });

          if (!connResponse.ok) {
            console.error(`Failed to fetch connectivity for table ${table.name}`);
            continue;
          }

          const connData = await connResponse.json() as any;
          const connectivity = connData.data.map((conn: any) => ({
            src: conn['source table name'],
            dst: conn['destination table name']
          }));

          relTables.push({
            name: table.name,
            properties,
            connectivity
          });
        }
      }

      setSchema({ nodeTables, relTables });
    } catch (err) {
      console.error('Error fetching schema:', err);
    } finally {
      setSchemaLoading(false);
    }
  };

  // Execute initial query and fetch schema when component loads
  useEffect(() => {
    // Execute a simple query to test the API
    const timer = setTimeout(() => {
      executeQuery();
      fetchSchema();
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
    } catch (err) {
      console.error('Error executing query:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Quran Graph Data Explorer</h1>
          <p className="text-white mt-2">Explore the Quran Knowledge Graph through Cypher queries</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Left column - Query and Examples */}
          <div className="lg:col-span-4 space-y-6">
            {/* Query Input */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="query" className="text-lg font-semibold text-gray-900">
                  Cypher Query
                </label>
                <button
                  onClick={executeQuery}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:bg-blue-400 font-medium flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Executing...
                    </>
                  ) : (
                    'Execute Query'
                  )}
                </button>
              </div>
              <div className="relative">
                <textarea
                  id="query"
                  className="w-full h-48 p-4 border border-gray-400 rounded-md font-mono text-gray-900 bg-white"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your Cypher query here..."
                />
              </div>
            </div>

            {/* Example Queries */}
            <ExampleQueries setQuery={setQuery} />

            {/* Schema Viewer */}
            <SchemaViewer schema={schema} loading={schemaLoading} setQuery={setQuery} />
          </div>

          {/* Right column - Results */}
          <div className="lg:col-span-8 space-y-6 mt-6 lg:mt-0">
            {error && (
              <div className="p-4 bg-red-100 border border-red-500 text-red-800 rounded-xl">
                <h2 className="text-lg font-semibold mb-2">Error</h2>
                <p className="font-mono">{error}</p>
              </div>
            )}

            {results && (
              <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-300">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Results</h2>
                    <div className="flex space-x-4 text-sm text-gray-800">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{results.execution_time_ms.toFixed(2)}ms</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        <span className="font-medium">{results.data.length} rows</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    {/* Graph Visualization */}
                    {showGraph && graphData.nodes.length > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">Graph Visualization</h3>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => setGraphSettingsOpen(!graphSettingsOpen)}
                              className="text-gray-700 hover:text-blue-600 flex items-center"
                              title="Graph Settings"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div className="text-sm text-gray-800 font-medium flex items-center">
                              <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>{graphData.nodes.length} nodes, {graphData.links.length} relationships</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg mb-3 text-sm text-gray-700">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Click a node to view details. Double-click to expand connections.</span>
                          </div>
                        </div>
                        <div ref={containerRef} className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-md relative">
                          {/* Graph Settings Panel */}
                          <GraphSettings
                            settings={graphSettings}
                            schema={schema}
                            onSettingsChange={setGraphSettings}
                            isOpen={graphSettingsOpen}
                            onClose={() => setGraphSettingsOpen(false)}
                          />

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
                              backgroundColor={graphSettings.darkMode ? "#111827" : "#FFFFFF"}
                              nodeLabel={(node: any) => {
                                // Get custom property if configured
                                const customProperty = graphSettings.nodeLabelProperty[node.label];
                                if (customProperty && customProperty !== 'default' && node.properties && node.properties[customProperty] !== undefined) {
                                  return `${node.label}: ${node.properties[customProperty]}`;
                                }
                                // Default label
                                return `${node.label}: ${node.name}`;
                              }}
                              nodeColor={(node: any) => node.color}
                              linkLabel={(link: any) => {
                                // Get custom property if configured
                                const customProperty = graphSettings.relationshipLabelProperty[link.type];
                                if (customProperty && customProperty !== 'default' && link.properties && link.properties[customProperty] !== undefined) {
                                  return `${link.type}: ${link.properties[customProperty]}`;
                                }
                                // Default label
                                return link.type;
                              }}
                              linkWidth={graphSettings.linkWidth}
                              linkColor={() => graphSettings.darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                              linkCanvasObjectMode={() => graphSettings.showRelationshipLabels ? 'after' : 'none'}
                              linkCanvasObject={(link: any, ctx, globalScale) => {
                                // Skip if no type is defined or relationship labels are disabled
                                if (!link.type || !graphSettings.showRelationshipLabels) return;

                                // Calculate the position for the label
                                const start = link.source;
                                const end = link.target;

                                // Skip if positions are not available
                                if (!start.x || !start.y || !end.x || !end.y) return;

                                // Calculate the middle point of the link
                                const middleX = start.x + (end.x - start.x) / 2;
                                const middleY = start.y + (end.y - start.y) / 2;

                                // Set font size based on zoom level
                                const fontSize = 10 / globalScale;

                                // Get the label text to display
                                let labelText = link.type;

                                // Check if a custom property is configured for this relationship type
                                const customProperty = graphSettings.relationshipLabelProperty[link.type];
                                if (customProperty && customProperty !== 'default' && link.properties && link.properties[customProperty] !== undefined) {
                                  labelText = link.properties[customProperty];
                                }

                                // Draw the relationship label
                                ctx.font = `${fontSize}px Sans-Serif`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';

                                // Add a background for better readability
                                const textWidth = ctx.measureText(labelText).width;
                                const backgroundHeight = fontSize;
                                const backgroundWidth = textWidth + fontSize * 0.8;

                                ctx.fillStyle = graphSettings.darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                                ctx.fillRect(
                                  middleX - backgroundWidth / 2,
                                  middleY - backgroundHeight / 2,
                                  backgroundWidth,
                                  backgroundHeight
                                );

                                // Draw the text
                                ctx.fillStyle = graphSettings.darkMode ? '#D1D5DB' : '#4B5563';
                                ctx.fillText(labelText, middleX, middleY);
                              }}
                              nodeRelSize={graphSettings.nodeSize}
                              // @ts-ignore - cooldownTicks is a valid prop for ForceGraph2D
                              cooldownTicks={100}
                              nodeCanvasObject={(node: any, ctx, globalScale) => {
                                // Draw the node circle
                                // Get the label text to display
                                let label = node.name as string;

                                // Check if a custom property is configured for this node type
                                const customProperty = graphSettings.nodeLabelProperty[node.label];
                                if (customProperty && customProperty !== 'default' && node.properties && node.properties[customProperty] !== undefined) {
                                  label = node.properties[customProperty] as string;
                                }

                                const fontSize = 12 / globalScale;
                                const nodeR = Math.sqrt((node.val || 1) * (graphSettings.nodeSize / 6) * 25 / Math.PI);

                                // Draw a slightly larger circle for expanded nodes
                                if (expandedNodes.has(node.id)) {
                                  ctx.beginPath();
                                  ctx.arc(node.x || 0, node.y || 0, nodeR + 2, 0, 2 * Math.PI);
                                  ctx.fillStyle = graphSettings.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                                  ctx.fill();
                                }

                                ctx.beginPath();
                                ctx.arc(node.x || 0, node.y || 0, nodeR, 0, 2 * Math.PI);
                                ctx.fillStyle = node.color || (graphSettings.darkMode ? '#D1D5DB' : '#4B5563');
                                ctx.fill();

                                // Draw the label below the node if enabled
                                if (graphSettings.showNodeLabels) {
                                  ctx.font = `bold ${fontSize}px Sans-Serif`;
                                  ctx.textAlign = 'center';
                                  ctx.textBaseline = 'middle';

                                  // Add a background for better readability
                                  const textWidth = ctx.measureText(label).width;
                                  const backgroundDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                                  ctx.fillStyle = graphSettings.darkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                                  ctx.fillRect(
                                    (node.x || 0) - backgroundDimensions[0] / 2,
                                    (node.y || 0) + nodeR + fontSize / 2 - backgroundDimensions[1] / 2,
                                    backgroundDimensions[0],
                                    backgroundDimensions[1]
                                  );

                                  ctx.fillStyle = graphSettings.darkMode ? '#D1D5DB' : '#111827';
                                  ctx.fillText(label, node.x || 0, (node.y || 0) + nodeR + fontSize / 2);
                                }
                              }}
                              onNodeClick={(node: any) => {
                                // Check if it's a double click
                                const now = new Date().getTime();
                                const lastClick = (node as any)._lastClickTime || 0;
                                (node as any)._lastClickTime = now;

                                if (now - lastClick < 300) {
                                  // Double click - expand node
                                  expandNode(node.id);
                                } else {
                                  // Single click - show node details in sidebar
                                  setSelectedNode(node);
                                  setSidebarOpen(true);
                                }
                              }}
                            />
                          </Suspense>
                        </div>
                      </div>
                    )}

                    {/* Table View */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Table View</h3>
                        {results.data.length > 0 && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">{results.data.length} rows</span>
                          </div>
                        )}
                      </div>
                      {results.data.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-300 rounded-lg">
                          <table className="min-w-full">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-300">
                                {results.columns.map((column: string) => (
                                  <th key={column} className="px-4 py-2 text-left text-gray-900 font-semibold">
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
                        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-700">
                          No results returned
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Details Sidebar */}
      <DataExplorerSidebar
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        setSidebarOpen={setSidebarOpen}
        expandNode={expandNode}
      />
    </div>
  );
}

export function meta() {
  return [
    { title: "Quran Knowledge Graph | Data Explorer" },
    { description: "Explore the Quran Knowledge Graph through Cypher queries and interactive visualizations" },
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
        <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-lg">
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
