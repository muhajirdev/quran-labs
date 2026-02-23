import { useState, useRef, useEffect, lazy } from 'react';
import { Footer } from '~/components/layout/Footer';
import { DataExplorerSidebar } from '~/components/data-explorer/Sidebar';
import { ExampleQueries } from '~/components/data-explorer/ExampleQueries';
import { SchemaViewer } from '~/components/data-explorer/SchemaViewer';
import { CollapsibleQueryEditor } from '~/components/data-explorer/CollapsibleQueryEditor';
import { TabbedResultsView } from '~/components/data-explorer/TabbedResultsView';
import type { GraphData, GraphNode, SchemaData, NodeTable, RelationshipTable } from '~/components/data-explorer/types';
import { convertToGraphData } from '~/components/data-explorer/simpleGraphUtils';
import { expandNode as expandNodeUtil } from '~/components/data-explorer/expandNodeUtils';

const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

// Define the client loader to handle client-side data fetching
export async function clientLoader({ request }: { request: Request }) {
  // Get the query parameter from the URL
  const url = new URL(request.url);
  const queryParam = url.searchParams.get('query');

  // Default query if none is provided
  const defaultQuery = 'MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t';

  return {
    initialQuery: queryParam ? decodeURIComponent(queryParam) : defaultQuery
  };
}

// Set hydrate property to true to enable client-side hydration
clientLoader.hydrate = true as const;

export default function DataExplorer({ loaderData }: { loaderData?: { initialQuery: string } } = {}) {
  // Use the query from URL or fall back to default
  const defaultQuery = 'MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t';
  const [query, setQuery] = useState(loaderData?.initialQuery || defaultQuery);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [showGraph, setShowGraph] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  // State for tracking expanded node-relationship pairs
  // Format: "nodeId:relationshipType:direction"
  const [expandedRelationships, setExpandedRelationships] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false); // Used when a node is clicked
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  // We don't need graphSettingsOpen state anymore with the Popover component
  const [graphSettings, setGraphSettings] = useState({
    showRelationshipLabels: true,
    showNodeLabels: true,
    showRelationshipDirections: true,
    use3D: false,
    darkMode: true, // Set dark mode to true by default to match the Figma design
    nodeSize: 6,
    linkWidth: 1.5,
    backgroundColor: "#121212", // Dark gray background by default
    nodeLabelProperty: {} as Record<string, string>,
    relationshipLabelProperty: {} as Record<string, string>
  });
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Function to expand a node (fetch related nodes)
  const expandNode = async (nodeId: string, relationshipType?: string) => {
    console.log("expandNode called with:", { nodeId, relationshipType });
    console.log("Current graph data:", {
      nodes: graphData.nodes.length,
      links: graphData.links.length
    });

    // Get the node from the graph data
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error("Node not found in graph data:", nodeId);
      return;
    }

    console.log("Found node to expand:", node.label, node.name);

    // Call the utility function to expand the node
    await expandNodeUtil({
      nodeId,
      node,
      graphData,
      schema,
      expandedRelationships,
      setExpandedRelationships,
      setGraphData,
      setLoading,
      relationshipType // Pass the optional relationship type
    });
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
        const properties = propsData.data.map((prop: any) => {
          console.log("Property info:", prop);
          return {
            name: prop.name,
            type: prop.type,
            isPrimaryKey: prop['primary key'] === true
          };
        });

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

  // Function to update dimensions
  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 600, // Increased height for better visualization
      });
    }
  };

  // Update dimensions when the window is resized
  useEffect(() => {
    // Initial dimensions
    updateDimensions();

    // Add a setTimeout to recalculate dimensions after the initial render
    // This ensures the container has its correct width
    const timer = setTimeout(() => {
      console.log("Recalculating graph dimensions after initial render");
      updateDimensions();
    }, 500);

    // Add event listener for window resize
    window.addEventListener("resize", updateDimensions);

    // Clean up
    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Recalculate dimensions when graph data changes or becomes visible
  useEffect(() => {
    if (showGraph && graphData.nodes.length > 0) {
      // Add a small delay to ensure the container is rendered
      const timer = setTimeout(() => {
        console.log("Recalculating graph dimensions after data change");
        updateDimensions();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showGraph, graphData]);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setShowGraph(false);

    try {
      console.log('Executing query:', query);

      // Update the URL with the current query for sharing
      const url = new URL(window.location.href);
      url.searchParams.set('query', encodeURIComponent(query));
      window.history.replaceState({}, '', url.toString());

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

        // Debug: Log relationship properties
        newGraphData.links.forEach((link: any) => {
          console.log(`Relationship ${link.type} properties:`, link.properties);
        });

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="bg-card backdrop-blur-xl border-b border-border shadow-lg py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground">Quran Graph Data Explorer</h1>
          <p className="text-primary mt-2">Explore the Quran Knowledge Graph through Cypher queries</p>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-6 flex-grow ${sidebarOpen ? 'pr-[384px] md:pr-[384px]' : ''} transition-all duration-300`}>
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Left column - Examples and Schema */}
          <div className="lg:col-span-4 space-y-6">
            {/* Example Queries */}
            <ExampleQueries setQuery={setQuery} />

            {/* Schema Viewer */}
            <SchemaViewer schema={schema} loading={schemaLoading} setQuery={setQuery} />
          </div>

          {/* Right column - Query Editor and Results */}
          <div className="lg:col-span-8 space-y-6 mt-6 lg:mt-0">
            {/* Collapsible Query Editor */}
            <CollapsibleQueryEditor
              query={query}
              setQuery={setQuery}
              executeQuery={executeQuery}
              loading={loading}
            />
            {error && (
              <div className="p-4 bg-destructive/20 border border-destructive text-destructive rounded-xl">
                <h2 className="text-lg font-semibold mb-2">Error</h2>
                <p className="font-mono">{error}</p>
              </div>
            )}

            {results && (
              <TabbedResultsView
                results={results}
                graphData={graphData}
                showGraph={showGraph}
                graphSettings={graphSettings}
                setGraphSettings={setGraphSettings}
                schema={schema}
                dimensions={dimensions}
                containerRef={containerRef}
                updateDimensions={updateDimensions}
                graphRef={graphRef}
                expandNode={expandNode}
                setSelectedNode={setSelectedNode}
                setSidebarOpen={setSidebarOpen}
                expandedRelationships={expandedRelationships}
                ForceGraph2D={ForceGraph2D}
              />
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
        graphData={graphData}
        schema={schema}
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
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="bg-card backdrop-blur-xl border-b border-border shadow-lg py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground">Quran Graph Data Explorer</h1>
          <p className="text-primary mt-2">Explore the Quran Knowledge Graph through Cypher queries</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-center h-[600px] w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground font-medium">Loading data explorer...</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
