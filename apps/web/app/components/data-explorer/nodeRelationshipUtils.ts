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
  schemaRelationships: { type: string; direction: 'incoming' | 'outgoing' | 'both'; connectedNodeTypes: string[] }[];
  actualRelationships: { type: string; direction: 'incoming' | 'outgoing' | 'both'; connectedNodes: GraphNode[] }[];
} {
  // Initialize result objects
  const schemaRelationships: { type: string; direction: 'incoming' | 'outgoing' | 'both'; connectedNodeTypes: string[] }[] = [];
  const actualRelationships: { type: string; direction: 'incoming' | 'outgoing' | 'both'; connectedNodes: GraphNode[] }[] = [];

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

      // Determine the direction based on connectivity
      const outgoing = relTable.connectivity.some(conn => conn.src === node.label);
      const incoming = relTable.connectivity.some(conn => conn.dst === node.label);

      let direction: 'incoming' | 'outgoing' | 'both' = 'both';
      if (outgoing && !incoming) {
        direction = 'outgoing';
      } else if (incoming && !outgoing) {
        direction = 'incoming';
      }

      // Add to schema relationships
      schemaRelationships.push({
        type: relTable.name,
        direction,
        connectedNodeTypes: [...new Set(connectedNodeTypes)] // Remove duplicates
      });
    }
  });

  // Get actual relationships in the current graph data
  // Group links by relationship type and direction
  const relationshipMap = new Map<string, { nodes: GraphNode[], direction: 'incoming' | 'outgoing' | 'both' }>();

  console.log("Getting relationships for node:", node.id, node.label, node.name);
  console.log("Current graph data links:", graphData.links.length);

  graphData.links.forEach(link => {
    // Skip if no type
    if (!link.type) return;

    // Check if this link connects to our node
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    if (sourceId === node.id || targetId === node.id) {
      console.log(`Found link connecting to node ${node.id}: ${link.type} (${sourceId} -> ${targetId})`);
      // Determine direction
      let direction: 'incoming' | 'outgoing' | 'both';
      if (sourceId === node.id) {
        direction = 'outgoing'; // Node -> Other
      } else {
        direction = 'incoming'; // Other -> Node
      }

      // Get the other node's ID
      const otherNodeId = sourceId === node.id ? targetId : sourceId;

      // Find the other node
      const otherNode = graphData.nodes.find(n => n.id === otherNodeId);
      if (!otherNode) return;

      // Create a key that includes both type and direction
      const key = link.type;

      // Add to the map
      if (!relationshipMap.has(key)) {
        relationshipMap.set(key, { nodes: [], direction });
      } else {
        // If we already have this relationship type but with a different direction,
        // update to 'both' if needed
        const existing = relationshipMap.get(key)!;
        if (existing.direction !== direction) {
          existing.direction = 'both';
        }
      }

      relationshipMap.get(key)?.nodes.push(otherNode);
    }
  });

  // Convert map to array
  relationshipMap.forEach(({ nodes, direction }, type) => {
    actualRelationships.push({
      type,
      direction,
      connectedNodes: nodes
    });
  });

  return {
    schemaRelationships,
    actualRelationships
  };
}
