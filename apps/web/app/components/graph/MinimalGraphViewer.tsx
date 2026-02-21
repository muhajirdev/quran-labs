import React, { useState, useEffect, lazy, Suspense, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import { BookOpen, X, ExternalLink, Maximize2 } from 'lucide-react';
import { convertToGraphData } from '~/components/data-explorer/simpleGraphUtils';
import { expandNode as expandNodeUtil } from '~/components/data-explorer/expandNodeUtils';
import type { GraphData, GraphNode, SchemaData, NodeTable, RelationshipTable } from '~/components/data-explorer/types';

// Lazy load ForceGraph2D to avoid SSR issues
const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

interface MinimalGraphViewerProps {
    query: string;
    onNodeClick?: (node: GraphNode) => void;
}

export const MinimalGraphViewer: React.FC<MinimalGraphViewerProps> = ({ query, onNodeClick }) => {
    const navigate = useNavigate();
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [schema, setSchema] = useState<SchemaData | null>(null);
    const [expandedRelationships, setExpandedRelationships] = useState<Set<string>>(new Set());

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    const graphRef = useRef<any>(null);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

    // Update dimensions
    const updateDimensions = () => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: Math.min(600, Math.max(400, window.innerHeight * 0.5)),
            });
        }
    };

    useEffect(() => {
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateDimensions();
        }, 100);
        return () => clearTimeout(timer);
    }, [graphData]);

    // Fetch schema for node expansion
    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const nodeTablesQuery = "CALL show_tables() RETURN *";
                const response = await fetch('https://kuzu-api.fly.dev/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: nodeTablesQuery }),
                });

                if (!response.ok) throw new Error('Failed to fetch schema');
                const tablesData = await response.json() as any;

                const nodeTables: NodeTable[] = [];
                const relTables: RelationshipTable[] = [];

                for (const table of tablesData.data) {
                    if (table.name.startsWith('_')) continue;

                    const propertiesQuery = `CALL TABLE_INFO('${table.name}') RETURN *`;
                    const propsResponse = await fetch('https://kuzu-api.fly.dev/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: propertiesQuery }),
                    });

                    if (!propsResponse.ok) continue;

                    const propsData = await propsResponse.json() as any;
                    const properties = propsData.data.map((prop: any) => ({
                        name: prop.name,
                        type: prop.type,
                        isPrimaryKey: prop['primary key'] === true
                    }));

                    if (table.type === 'NODE') {
                        nodeTables.push({ name: table.name, properties });
                    } else if (table.type === 'REL') {
                        const connectivityQuery = `CALL SHOW_CONNECTION('${table.name}') RETURN *`;
                        const connResponse = await fetch('https://kuzu-api.fly.dev/query', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: connectivityQuery }),
                        });

                        if (!connResponse.ok) continue;

                        const connData = await connResponse.json() as any;
                        const connectivity = connData.data.map((conn: any) => ({
                            src: conn['source table name'],
                            dst: conn['destination table name']
                        }));

                        relTables.push({ name: table.name, properties, connectivity });
                    }
                }
                setSchema({ nodeTables, relTables });
            } catch (err) {
                console.error('Error fetching schema:', err);
            }
        };

        fetchSchema();
    }, []); // Run once on mount

    // Execute query whenever the query prop changes
    useEffect(() => {
        let isMounted = true;

        const executeQuery = async () => {
            if (!query) return;

            setLoading(true);
            setError(null);
            setExpandedRelationships(new Set()); // Reset on new query

            try {
                const response = await fetch('https://kuzu-api.fly.dev/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });

                const data = await response.json() as any; // Cast to any to resolve unknown type issues

                if (!response.ok) {
                    throw new Error(data.detail || 'Failed to execute query');
                }

                if (isMounted && data.data) {
                    const newGraphData = convertToGraphData(data);
                    setGraphData(newGraphData);
                }
            } catch (err) {
                console.error('Error executing query:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        executeQuery();

        return () => {
            isMounted = false;
        };
    }, [query]);

    // Derive unique node colors for the legend
    const legendItems = useMemo(() => {
        const map = new Map<string, string>();
        graphData.nodes.forEach(node => {
            if (node.label && node.color && !map.has(node.label)) {
                map.set(node.label, node.color);
            }
        });
        return Array.from(map.entries()).map(([label, color]) => ({ label, color }));
    }, [graphData.nodes]);

    // Handle double click for expansion
    const [clickTimeout, setClickTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    // Extracted expansion logic
    const handleExpandNode = (node: any) => {
        if (!schema) return;

        const fullNode = graphData.nodes.find(n => n.id === node.id);
        if (fullNode) {
            setLoading(true);
            expandNodeUtil({
                nodeId: node.id,
                node: fullNode,
                graphData,
                schema,
                expandedRelationships,
                setExpandedRelationships,
                setGraphData: (newData) => {
                    setGraphData(newData);
                },
                setLoading
            }).catch(console.error);
        }
    };

    const handleNodeClick = (node: any) => {
        if (onNodeClick) {
            onNodeClick(node as GraphNode);
        }

        setSelectedNode(node as GraphNode);

        if (clickTimeout) {
            // Double click detected
            clearTimeout(clickTimeout);
            setClickTimeout(null);
            handleExpandNode(node);
        } else {
            // Single click detected, set timeout to wait for double click
            const timeout = setTimeout(() => {
                setClickTimeout(null);
            }, 300); // 300ms window for double click
            setClickTimeout(timeout);
        }
    };

    if (loading && graphData.nodes.length === 0) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center border border-white/10 rounded-2xl bg-black/40 backdrop-blur-sm">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-white/60 text-sm">Loading graph...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center border border-destructive/20 rounded-2xl bg-destructive/5 backdrop-blur-sm p-6 text-center">
                <div>
                    <h3 className="text-destructive font-medium mb-2">Error Loading Graph</h3>
                    <p className="text-white/60 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (graphData.nodes.length === 0) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="w-full rounded-2xl overflow-hidden border border-white/10 bg-[#121212]/80 backdrop-blur-md relative"
            style={{ minHeight: '400px' }}
        >
            <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            }>
                <ForceGraph2D
                    ref={graphRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeLabel="label"
                    nodeColor={(node: any) => node.color || '#3b82f6'}
                    nodeVal={(node: any) => node.size || 6}
                    linkColor={(link: any) => link.color || 'rgba(255, 255, 255, 0.2)'}
                    linkWidth={1.5}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    backgroundColor="transparent"
                    onNodeClick={handleNodeClick}
                    // Fix nodes in place after dragging
                    onNodeDragEnd={node => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    // Simple node canvas rendering for nice labels
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.name || node.label || node.id;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;

                        // Draw node circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, (node.size || 6), 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color || '#3b82f6';
                        ctx.fill();

                        // Draw label
                        if (globalScale > 1.5) {
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + (node.size || 6) + 2, bckgDimensions[0], bckgDimensions[1]);

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#ffffff';
                            ctx.fillText(label, node.x, node.y + (node.size || 6) + 2 + fontSize / 2);
                        }
                    }}
                />
            </Suspense>

            {loading && graphData.nodes.length > 0 && (
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-end items-center pb-8 p-4 pointer-events-none z-10 transition-opacity duration-300">
                    <div className="bg-black/80 backdrop-blur-md px-4 py-2 flex items-center gap-3 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                        <p className="text-white/90 text-sm font-medium">Expanding Node...</p>
                    </div>
                </div>
            )}

            {/* Overlay to indicate interactivity gently */}
            <div className="absolute bottom-4 right-4 pointer-events-none z-10">
                <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/5">
                    Double-click nodes to expand • Drag to rearrange • Scroll to zoom
                </div>
            </div>

            {/* Color Legend Overlay */}
            {legendItems.length > 0 && (
                <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-wrap max-w-[200px] gap-1.5">
                    {legendItems.map(item => (
                        <div key={item.label} className="flex items-center gap-1.5 bg-black/50 backdrop-blur border border-white/5 rounded-full px-2.5 py-1 text-[10px] text-white/70 shadow-sm">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Node Details Overlay */}
            {selectedNode && (
                <div className="absolute top-4 right-4 z-20 w-64 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs font-medium text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                                {selectedNode.label || 'Node'}
                            </span>
                        </div>
                        <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-md">
                            <button
                                onClick={() => handleExpandNode(selectedNode)}
                                className="text-white/40 hover:text-accent hover:bg-white/5 transition-colors p-1.5 border-r border-white/10 flex items-center justify-center group"
                                title="Expand Connections"
                            >
                                <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-white/40 hover:text-destructive hover:bg-white/5 transition-colors p-1.5 flex items-center justify-center group"
                                title="Close"
                            >
                                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <h4 className="text-white font-medium text-lg mb-4 truncate">
                        {selectedNode.properties?.name || selectedNode.properties?.verse_key || selectedNode.id}
                    </h4>

                    {selectedNode.label === 'Verse' && selectedNode.properties?.verse_key && (
                        <div className="flex flex-col gap-2">
                            <Button
                                className="w-full bg-accent hover:bg-accent/90 text-white shadow-lg border-0"
                                size="sm"
                                onClick={() => navigate(`/read?verse=${selectedNode.properties!.verse_key}`)}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Read Quran
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                size="sm"
                                onClick={() => navigate(`/verse/${selectedNode.properties!.verse_key}`)}
                            >
                                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                View Verse Detail
                            </Button>
                        </div>
                    )}

                    {selectedNode.label === 'Topic' && selectedNode.properties?.topic_id && (
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="w-full border-white/10 text-white/70 hover:bg-white/5 hover:text-white mt-2"
                                size="sm"
                                onClick={() => navigate(`/topic/${selectedNode.properties!.topic_id}`)}
                            >
                                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                View Topic Detail
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
