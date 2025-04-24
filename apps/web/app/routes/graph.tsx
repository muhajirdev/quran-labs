import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/graph";

const ForceGraph2D = lazy(() => {
  return import('react-force-graph-2d')
});

// Define node types
const NODE_TYPES = {
  SURAH: 'surah',
  VERSE: 'verse',
  WORD: 'word',
  ROOT: 'root',
  TOPIC: 'topic',
  TAFSIR: 'tafsir',
  TRANSLATION: 'translation'
} as const;

// Define relationship types
const REL_TYPES = {
  CONTAINS: 'contains',
  HAS_ROOT: 'has_root',
  ADDRESSES_TOPIC: 'addresses_topic',
  HAS_TAFSIR: 'has_tafsir',
  HAS_TRANSLATION: 'has_translation',
  SIMILAR_TO: 'similar_to'
} as const;

// Colors for different node types
const NODE_COLORS: Record<string, string> = {
  [NODE_TYPES.SURAH]: '#4285F4',      // Blue
  [NODE_TYPES.VERSE]: '#34A853',      // Green
  [NODE_TYPES.WORD]: '#FBBC05',       // Yellow
  [NODE_TYPES.ROOT]: '#EA4335',       // Red
  [NODE_TYPES.TOPIC]: '#8E24AA',      // Purple
  [NODE_TYPES.TAFSIR]: '#00ACC1',     // Cyan
  [NODE_TYPES.TRANSLATION]: '#FB8C00' // Orange
};

// Define the graph data structure
interface GraphData {
  nodes: Array<{
    id: string;
    name?: string;
    group?: string;
    val?: number;
    color?: string;
    properties?: Record<string, any>;
  }>;
  links: Array<{
    source: string;
    target: string;
    value?: number;
    type?: string;
  }>;
}

// Sample data - this will be replaced with real data from your API
const sampleData: GraphData = {
  nodes: [
    { id: "1", name: "Al-Fatiha", group: "chapter", val: 5 },
    { id: "2", name: "Al-Baqarah", group: "chapter", val: 10 },
    { id: "1:1", name: "Verse 1:1", group: "verse", val: 2 },
    { id: "1:2", name: "Verse 1:2", group: "verse", val: 2 },
    { id: "1:3", name: "Verse 1:3", group: "verse", val: 2 },
    { id: "mercy", name: "Mercy", group: "topic", val: 3 },
    { id: "guidance", name: "Guidance", group: "topic", val: 3 },
  ],
  links: [
    { source: "1", target: "1:1" },
    { source: "1", target: "1:2" },
    { source: "1", target: "1:3" },
    { source: "1:1", target: "mercy" },
    { source: "1:2", target: "guidance" },
    { source: "1:3", target: "mercy" },
  ],
};

// Client-side loader to fetch graph data
export async function clientLoader() {
  try {
    // Fetch the procedurally generated data from the public directory
    const response = await fetch('/data/quran_graph_data.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch graph data: ${response.statusText}`);
    }
    const graphData = await response.json();
    return { graphData };
  } catch (error) {
    console.error('Error loading graph data:', error);
    // Fall back to sample data if the fetch fails
    return { graphData: sampleData };
  }
}

clientLoader.hydrate = true as const;


export function meta() {
  return [
    { title: "Quran Knowledge Graph | Interactive Visualization" },
    { name: "description", content: "Explore the relationships between chapters, verses, words, and topics in the Quran through an interactive graph visualization" },
  ];
}

export const HydrateFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Quran Knowledge Graph</h1>
          <p className="text-emerald-100 mt-2">Interactive visualization of Quranic relationships and connections</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
          <div className="flex items-center justify-center h-[600px] bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading visualization...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GraphPage({ loaderData }: Route.ComponentProps) {
  const { graphData } = loaderData as { graphData: GraphData };
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Update dimensions when the window is resized
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight - 100, // Subtract some space for header/margins
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Quran Knowledge Graph</h1>
          <p className="text-emerald-100 mt-2">Interactive visualization of Quranic relationships and connections</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div ref={containerRef} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
          <Suspense fallback={<div className="flex items-center justify-center h-[600px] bg-white rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading visualization...</p>
            </div>
          </div>}>
            <ForceGraph2D
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#FFFFFF"
              nodeLabel="name"
              nodeColor={(node) => node.color || undefined}
              nodeVal={(node) => node.val || 5}
              linkLabel={(link) => link.type || 'related'}
              linkColor={() => "#DDDDDD"}
              linkWidth={(link) => link.value ? Math.max(0.5, link.value) : 0.5}
              linkDirectionalParticles={1}
              linkDirectionalParticleWidth={1}
              linkDirectionalParticleSpeed={0.003}
              linkCurvature={0.05}
              cooldownTicks={100}
              nodeCanvasObject={(node, ctx, globalScale) => {
                // Draw the node circle
                const label = node.name as string;
                const fontSize = 12 / globalScale;
                const nodeR = Math.sqrt((node.val || 5) * 100 / Math.PI);

                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, nodeR, 0, 2 * Math.PI);
                ctx.fillStyle = node.color || '#666666';
                ctx.fill();

                // Draw the label below the node
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#333333';

                // Add a white background to the text for better readability
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(
                  (node.x || 0) - bckgDimensions[0] / 2,
                  (node.y || 0) + nodeR + fontSize / 2 - bckgDimensions[1] / 2,
                  bckgDimensions[0],
                  bckgDimensions[1]
                );

                ctx.fillStyle = '#333333';
                ctx.fillText(label, node.x || 0, (node.y || 0) + nodeR + fontSize / 2);
              }}
              onNodeClick={(node) => {
                // Handle node click by setting the selected node
                console.log("Clicked node:", node);
                setSelectedNode(node);
              }}
            />
          </Suspense>
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">About This Visualization</h3>
          <p className="text-sm text-gray-600 mb-2">
            This visualization shows the Quran Knowledge Graph with 1000 procedurally generated data points.
            The graph includes the following node types:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {Object.entries(NODE_TYPES).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: NODE_COLORS[value] }}></div>
                <span className="text-xs">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold mb-1">Relationship Types:</h4>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <div className="w-8 h-0.5 bg-gray-300 mr-2"></div>
                <span className="text-xs">Relationship</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Click on any node to see its details. The visualization shows various relationships between
            Quranic entities including chapter-verse relationships, word roots, topic connections, and more.
          </p>
        </div>
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">{selectedNode.name}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-white hover:text-emerald-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: selectedNode.color || '#666666' }}
                ></div>
                <span className="font-medium">Type: {selectedNode.group}</span>
              </div>

              {selectedNode.properties && (
                <div className="mt-2">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Properties:</h4>
                  <div className="bg-gray-50 rounded p-3">
                    {Object.entries(selectedNode.properties).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2 mb-1 text-sm">
                        <span className="text-gray-600 font-medium">{key}:</span>
                        <span className="col-span-2">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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