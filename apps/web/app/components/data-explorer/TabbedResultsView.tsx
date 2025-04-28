import React, { useState } from 'react';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GraphSettingsPopover } from './GraphSettingsPopover';
import type { GraphData, SchemaData } from './types';
import { renderCellValue } from './simpleGraphUtils';

interface TabbedResultsViewProps {
  results: any;
  graphData: GraphData;
  showGraph: boolean;
  graphSettings: any;
  setGraphSettings: (settings: any) => void;
  schema: SchemaData | null;
  dimensions: { width: number; height: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  updateDimensions: () => void;
  graphRef: React.RefObject<any>;
  expandNode: (nodeId: string) => void;
  setSelectedNode: (node: any) => void;
  setSidebarOpen: (open: boolean) => void;
  expandedRelationships: Set<string>;
  ForceGraph2D: React.ComponentType<any>;
}

export function TabbedResultsView({
  results,
  graphData,
  showGraph,
  graphSettings,
  setGraphSettings,
  schema,
  dimensions,
  containerRef,
  updateDimensions,
  graphRef,
  expandNode,
  setSelectedNode,
  setSidebarOpen,
  expandedRelationships,
  ForceGraph2D
}: TabbedResultsViewProps) {
  const [activeTab, setActiveTab] = useState<string>(showGraph ? "graph" : "table");

  // Update active tab when graph data changes
  React.useEffect(() => {
    if (showGraph && graphData.nodes.length > 0) {
      setActiveTab("graph");
    } else {
      setActiveTab("table");
    }
  }, [showGraph, graphData.nodes.length]);

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden backdrop-blur-xl">
      <div className="bg-secondary/20 px-6 py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Results</h2>
          <div className="flex space-x-4 text-sm text-primary">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{results.execution_time_ms.toFixed(2)}ms</span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="font-medium">{results.data.length} rows</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              {showGraph && graphData.nodes.length > 0 && (
                <TabsTrigger value="graph">Graph View</TabsTrigger>
              )}
            </TabsList>

            {activeTab === "graph" && (
              <div className="flex items-center space-x-4">
                <GraphSettingsPopover
                  settings={graphSettings}
                  schema={schema}
                  onSettingsChange={setGraphSettings}
                />
                <div className="text-sm text-primary font-medium flex items-center">
                  <svg className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{graphData.nodes.length} nodes, {graphData.links.length} relationships</span>
                </div>
              </div>
            )}
          </div>

          <TabsContent value="table" className="mt-0">
            {results.data.length > 0 ? (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-secondary/20 border-b border-border">
                      {results.columns.map((column: string) => (
                        <th key={column} className="px-4 py-2 text-left text-foreground font-semibold">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.data.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-b border-border hover:bg-secondary/10">
                        {results.columns.map((column: string) => (
                          <td key={`${rowIndex}-${column}`} className="px-4 py-2 text-foreground">
                            {renderCellValue(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-secondary/20 p-4 rounded-lg text-center text-primary border border-border">
                No results returned
              </div>
            )}
          </TabsContent>

          <TabsContent value="graph" className="mt-0">
            {showGraph && graphData.nodes.length > 0 && (
              <>
                <div className="bg-secondary/20 p-3 rounded-lg mb-3 text-sm text-primary border border-border">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Click a node to view details. Double-click to expand connections.</span>
                  </div>
                </div>
                <div ref={containerRef} className="border border-border rounded-xl overflow-hidden bg-background shadow-lg relative w-full">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-[600px] bg-background">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-primary font-medium">Loading visualization...</p>
                      </div>
                    </div>
                  }>
                    <ForceGraph2D
                      ref={graphRef}
                      graphData={graphData}
                      width={dimensions.width}
                      height={dimensions.height}
                      backgroundColor={graphSettings.darkMode ? "#111827" : "#FFFFFF"}
                      onEngineStop={() => {
                        // Recalculate dimensions when the graph is initialized
                        console.log("Graph engine initialized, recalculating dimensions");
                        updateDimensions();
                      }}
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
                          // Convert to string in case it's a number or other type
                          const propValue = String(link.properties[customProperty]);
                          return `${link.type}: ${propValue}`;
                        }
                        // Default label
                        return link.type;
                      }}
                      linkWidth={graphSettings.linkWidth}
                      linkColor={() => graphSettings.darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                      linkCanvasObjectMode={() => (graphSettings.showRelationshipLabels || graphSettings.showRelationshipDirections) ? 'after' : 'none'}
                      linkCanvasObject={(link: any, ctx, globalScale) => {
                        // Calculate the position for the link
                        const start = link.source;
                        const end = link.target;

                        // Skip if positions are not available
                        if (!start.x || !start.y || !end.x || !end.y) return;

                        // Calculate the middle point of the link
                        const middleX = start.x + (end.x - start.x) / 2;
                        const middleY = start.y + (end.y - start.y) / 2;

                        // Set font size based on zoom level
                        const fontSize = 10 / globalScale;

                        // Draw relationship labels if enabled
                        if (graphSettings.showRelationshipLabels && link.type) {
                          // Get the label text to display
                          let labelText = link.type;

                          // Check if a custom property is configured for this relationship type
                          const customProperty = graphSettings.relationshipLabelProperty[link.type];
                          if (customProperty && customProperty !== 'default' && link.properties && link.properties[customProperty] !== undefined) {
                            // Convert to string in case it's a number or other type
                            labelText = String(link.properties[customProperty]);
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
                        }

                        // Draw directional arrows if enabled
                        if (graphSettings.showRelationshipDirections) {
                          // Calculate the angle of the link
                          const angle = Math.atan2(end.y - start.y, end.x - start.x);

                          // Calculate the position for the arrow (near the target node)
                          const nodeRadius = Math.sqrt((end.val || 1) * (graphSettings.nodeSize / 6) * 25 / Math.PI);
                          const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                          const arrowPosition = distance > nodeRadius * 2 ? 0.9 : 0.7; // Adjust based on distance

                          const arrowX = start.x + (end.x - start.x) * arrowPosition;
                          const arrowY = start.y + (end.y - start.y) * arrowPosition;

                          // Arrow size based on zoom level
                          const arrowSize = 2.5 / globalScale;

                          // Draw the arrow
                          ctx.save();
                          ctx.translate(arrowX, arrowY);
                          ctx.rotate(angle);

                          ctx.beginPath();
                          ctx.moveTo(0, 0);
                          ctx.lineTo(-arrowSize * 2, -arrowSize);
                          ctx.lineTo(-arrowSize * 2, arrowSize);
                          ctx.closePath();

                          ctx.fillStyle = graphSettings.darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                          ctx.fill();

                          ctx.restore();
                        }
                      }}
                      nodeRelSize={graphSettings.nodeSize}
                      // Physics simulation parameter
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
                        // Check if this node has any expanded relationships
                        const hasExpandedRelationships = Array.from(expandedRelationships).some(
                          key => key.startsWith(`${node.id}:`)
                        );

                        if (hasExpandedRelationships) {
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
                        console.log("Node clicked:", node);

                        // Check if it's a double click
                        const now = new Date().getTime();
                        const lastClick = (node as any)._lastClickTime || 0;
                        (node as any)._lastClickTime = now;

                        console.log("Time since last click:", now - lastClick);

                        if (now - lastClick < 300) {
                          // Double click - expand node
                          console.log("Double click detected, expanding node:", node.id);
                          expandNode(node.id);
                        } else {
                          // Single click - show node details in sidebar
                          console.log("Single click detected, showing node details");
                          setSelectedNode(node);
                          setSidebarOpen(true);
                        }
                      }}
                    />
                  </Suspense>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
