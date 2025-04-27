import type { GraphData, GraphNode, SchemaData } from './types';

/**
 * Get available relationship types for a node based on the schema and current graph data
 */
export function getNodeRelationships({
  node,
  graphData,
  schema
}: {
  node: GraphNode;
  graphData: GraphData;
  schema: SchemaData | null;
}): { 
  schemaRelationships: { type: string; connectedNodeTypes: string[] }[];
  actualRelationships: { type: string; connectedNodes: GraphNode[] }[];
} {
  // Initialize result objects
  const schemaRelationships: { type: string; connectedNodeTypes: string[] }[] = [];
  const actualRelationships: { type: string; connectedNodes: GraphNode[] }[] = [];
  
  // If no schema, return empty results
  if (!schema || !node.label) {
    return { schemaRelationships, actualRelationships };
  }
  
  // Get all relationship types from schema that involve this node type
  schema.relTables.forEach(relTable => {
    // Check if this relationship connects to our node type
    const isConnected = relTable.connectivity.some(conn => 
      conn.src === node.label || conn.dst === node.label
    );
    
    if (isConnected) {
      // Find the other node types this relationship connects to
      const connectedNodeTypes = relTable.connectivity
        .filter(conn => conn.src === node.label || conn.dst === node.label)
        .map(conn => conn.src === node.label ? conn.dst : conn.src);
      
      // Add to schema relationships
      schemaRelationships.push({
        type: relTable.name,
        connectedNodeTypes: [...new Set(connectedNodeTypes)] // Remove duplicates
      });
    }
  });
  
  // Get actual relationships in the current graph data
  // Group links by relationship type
  const relationshipMap = new Map<string, GraphNode[]>();
  
  graphData.links.forEach(link => {
    // Skip if no type
    if (!link.type) return;
    
    // Check if this link connects to our node
    if (link.source === node.id || link.target === node.id) {
      // Get the other node's ID
      const otherNodeId = link.source === node.id ? link.target : link.source;
      
      // Find the other node
      const otherNode = graphData.nodes.find(n => n.id === otherNodeId);
      if (!otherNode) return;
      
      // Add to the map
      if (!relationshipMap.has(link.type)) {
        relationshipMap.set(link.type, []);
      }
      relationshipMap.get(link.type)?.push(otherNode);
    }
  });
  
  // Convert map to array
  relationshipMap.forEach((nodes, type) => {
    actualRelationships.push({
      type,
      connectedNodes: nodes
    });
  });
  
  return {
    schemaRelationships,
    actualRelationships
  };
}
