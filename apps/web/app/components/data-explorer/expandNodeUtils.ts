import type { GraphData, GraphNode, SchemaData } from './types';
import { convertToGraphData } from './simpleGraphUtils';

/**
 * Expands a node in the graph by fetching related nodes and relationships
 */
export async function expandNode({
  nodeId,
  node,
  graphData,
  schema,
  expandedNodes,
  setExpandedNodes,
  setGraphData,
  setLoading,
  relationshipType
}: {
  nodeId: string;
  node: GraphNode;
  graphData: GraphData;
  schema: SchemaData | null;
  expandedNodes: Set<string>;
  setExpandedNodes: (callback: (prev: Set<string>) => Set<string>) => void;
  setGraphData: (data: GraphData) => void;
  setLoading: (loading: boolean) => void;
  relationshipType?: string;
}): Promise<void> {
  console.log("expandNode called with:", { nodeId, relationshipType });
  console.log("Current expandedNodes:", Array.from(expandedNodes));

  // Check if node is already expanded
  if (expandedNodes.has(nodeId)) {
    console.log(`Node ${nodeId} is already expanded`);
    return;
  }

  console.log("Found node to expand:", node);

  // Create an expansion query based on the node type and its primary key from schema
  console.log("Creating expansion query for node:", node);

  // Find the node table in the schema
  const nodeTable = schema?.nodeTables.find(table => table.name === node.label);

  if (!nodeTable) {
    console.error(`Node type '${node.label}' not found in schema`);
    return;
  }

  // Find primary key property from schema
  const primaryKeyProp = nodeTable.properties.find(prop => prop.isPrimaryKey);
  console.log("Primary key property:", primaryKeyProp);
  console.log(nodeTable)

  if (!primaryKeyProp) {
    console.error(`No primary key found in schema for node type '${node.label}'`);
    return;
  }

  if (!node.properties || node.properties[primaryKeyProp.name] === undefined) {
    console.error(`Node doesn't have the primary key property '${primaryKeyProp.name}'`);
    return;
  }

  // We found a primary key in the schema and the node has this property
  console.log(`Using schema-defined primary key: ${primaryKeyProp.name}`);

  // Format the value based on the property type
  let pkValue = node.properties[primaryKeyProp.name];
  const isStringType = primaryKeyProp.type.toLowerCase().includes('string') ||
    primaryKeyProp.type.toLowerCase().includes('varchar') ||
    primaryKeyProp.type.toLowerCase().includes('char');

  // Add quotes for string values
  if (isStringType) {
    pkValue = `"${pkValue}"`;
  }

  // Build the expansion query based on whether a specific relationship type is provided
  let expansionQuery = '';

  if (relationshipType) {
    // Parse the relationship type to extract direction information
    // Format could be: "REL_TYPE" (bidirectional), "REL_TYPE>" (outgoing), or "<REL_TYPE" (incoming)
    let direction = 'both';
    let relType = relationshipType;

    if (relationshipType.endsWith('>')) {
      direction = 'outgoing';
      relType = relationshipType.slice(0, -1);
    } else if (relationshipType.startsWith('<')) {
      direction = 'incoming';
      relType = relationshipType.slice(1);
    }

    // Check if this is a special "ALL" relationship type
    const isAllRelationships = relType === 'ALL';

    // Build the query based on the direction and relationship type
    if (direction === 'outgoing') {
      if (isAllRelationships) {
        // Expand all outgoing relationships
        expansionQuery = `MATCH (n:${node.label})-[r]->(m) WHERE n.${primaryKeyProp.name} = ${pkValue} RETURN n, r, m LIMIT 20`;
        console.log(`Expanding all outgoing relationships`);
      } else {
        // Expand specific outgoing relationship
        expansionQuery = `MATCH (n:${node.label})-[r:${relType}]->(m) WHERE n.${primaryKeyProp.name} = ${pkValue} RETURN n, r, m LIMIT 20`;
        console.log(`Expanding outgoing ${relType} relationships`);
      }
    } else if (direction === 'incoming') {
      if (isAllRelationships) {
        // Expand all incoming relationships
        expansionQuery = `MATCH (n:${node.label})<-[r]-(m) WHERE n.${primaryKeyProp.name} = ${pkValue} RETURN n, r, m LIMIT 20`;
        console.log(`Expanding all incoming relationships`);
      } else {
        // Expand specific incoming relationship
        expansionQuery = `MATCH (n:${node.label})<-[r:${relType}]-(m) WHERE n.${primaryKeyProp.name} = ${pkValue} RETURN n, r, m LIMIT 20`;
        console.log(`Expanding incoming ${relType} relationships`);
      }
    } else {
      // Bidirectional
      if (isAllRelationships) {
        // Expand all relationships in both directions
        expansionQuery = `MATCH (n:${node.label})-[r]-(m) WHERE n.${primaryKeyProp.name} = ${pkValue} RETURN n, r, m LIMIT 20`;
        console.log(`Expanding all relationships in both directions`);
      } else {
        // Expand specific relationship in both directions
        expansionQuery = `MATCH (n:${node.label})-[r:${relType}]-(m) WHERE n.${primaryKeyProp.name} = ${pkValue} RETURN n, r, m LIMIT 20`;
        console.log(`Expanding bidirectional ${relType} relationships`);
      }
    }
  } else {
    // No relationship type specified, expand all relationships in both directions
    expansionQuery = `MATCH (n:${node.label})-[r]-(m) WHERE n.${primaryKeyProp.name} = ${pkValue} RETURN n, r, m LIMIT 20`;
    console.log(`Expanding all relationships in both directions`);
  }

  console.log(`Executing expansion query:`, expansionQuery);

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
    console.log(`Expansion results:`, newGraphData);

    // Merge with existing graph data
    const mergedNodes = [...graphData.nodes];
    const mergedLinks = [...graphData.links];

    // Add new nodes if they don't exist
    newGraphData.nodes.forEach((newNode: GraphNode) => {
      if (!mergedNodes.some(n => n.id === newNode.id)) {
        mergedNodes.push(newNode);
      }
    });

    // Add new links if they don't exist
    newGraphData.links.forEach((newLink: any) => {
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
}
