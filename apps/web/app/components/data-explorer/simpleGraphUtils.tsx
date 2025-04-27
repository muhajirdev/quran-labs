import React from 'react';
import type { GraphData, GraphNode, SchemaData } from './types';

/**
 * A simple function to convert query results to graph data
 */
export function convertToGraphData(results: any): GraphData {
  const graphData: GraphData = {
    nodes: [],
    links: []
  };

  const nodeMap = new Map<string, GraphNode>();

  // Process each row in the results
  results.data.forEach((row: any) => {
    // Process each column in the row
    Object.keys(row).forEach(column => {
      const value = row[column];

      // Skip if not an object or null
      if (!value || typeof value !== 'object') return;

      // Check if it's a node (has _id and _label properties)
      if (value._id !== undefined && value._label !== undefined && 
          // Skip relationship objects (they have _src and _dst)
          value._src === undefined && value._dst === undefined) {
        
        // Create a unique ID for the node
        let nodeId;
        if (value._label === 'Verse' && value.verse_key) {
          nodeId = `${value._label}-${value.verse_key}`;
        } else if (value._label === 'Topic' && value.topic_id !== undefined) {
          nodeId = `${value._label}-${value.topic_id}`;
        } else {
          nodeId = `${value._label}-${value._id.offset}-${value._id.table || 0}`;
        }

        // Add node if it doesn't exist
        if (!nodeMap.has(nodeId)) {
          const node: GraphNode = {
            id: nodeId,
            label: value._label,
            properties: { ...value },
            name: getNodeDisplayName(value._label, value),
            val: value._label === 'Verse' ? 0.8 : (value._label === 'Topic' ? 1.2 : 1),
            color: getNodeColor(value._label)
          };

          nodeMap.set(nodeId, node);
          graphData.nodes.push(node);
        }
      }
    });
  });

  // Process relationships
  results.data.forEach((row: any) => {
    // Find relationship objects in the row
    Object.keys(row).forEach(column => {
      const value = row[column];
      
      // Check if this is a relationship object
      if (value && typeof value === 'object' && 
          value._src !== undefined && value._dst !== undefined &&
          value._label !== undefined) {
        
        // Find the source and target nodes
        let sourceNode = null;
        let targetNode = null;
        
        // Look through all nodes to find matching source and target
        graphData.nodes.forEach(node => {
          if (node.properties?._id?.offset === value._src.offset && 
              node.properties?._id?.table === value._src.table) {
            sourceNode = node;
          }
          if (node.properties?._id?.offset === value._dst.offset && 
              node.properties?._id?.table === value._dst.table) {
            targetNode = node;
          }
        });
        
        // If we found both source and target, add a link
        if (sourceNode && targetNode) {
          graphData.links.push({
            source: sourceNode.id,
            target: targetNode.id,
            type: value._label,
            value: 1,
            properties: { ...value }
          });
        }
      }
    });
  });

  return graphData;
}

/**
 * Create a simple expansion query for a node
 */
export function createExpansionQuery(node: GraphNode, expansionType?: string): string {
  // If an expansion type is specified, create a specific query
  if (expansionType && expansionType !== 'all') {
    if (node.label === 'Verse') {
      if (expansionType === 'tafsir' || expansionType === 'HAS_TAFSIR') {
        return `MATCH (v:Verse)-[r:HAS_TAFSIR]->(t:Tafsir)
                WHERE v.verse_key = "${node.properties?.verse_key || ''}"
                RETURN v, r, t`;
      } else if (expansionType === 'translation' || expansionType === 'HAS_TRANSLATION') {
        return `MATCH (v:Verse)-[r:HAS_TRANSLATION]->(t:Translation)
                WHERE v.verse_key = "${node.properties?.verse_key || ''}"
                RETURN v, r, t`;
      } else if (expansionType === 'topic' || expansionType === 'HAS_TOPIC') {
        return `MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
                WHERE v.verse_key = "${node.properties?.verse_key || ''}"
                RETURN v, h, t`;
      }
    } else if (node.label === 'Topic') {
      if (expansionType === 'verse' || expansionType === 'HAS_TOPIC') {
        return `MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
                WHERE t.topic_id = ${node.properties?.topic_id || 0}
                RETURN v, h, t`;
      }
    }
  }
  
  // Default generic expansion query
  return `MATCH (n)-[r]-(m)
          WHERE ID(n) = ${node.properties?._id?.offset || 0}
          RETURN n, r, m LIMIT 20`;
}

/**
 * Get available expansion types for a node
 */
export function getAvailableExpansionTypes(node: GraphNode): string[] {
  const expansionTypes: string[] = [];
  
  if (node.label === 'Verse') {
    expansionTypes.push('HAS_TOPIC');
    expansionTypes.push('HAS_TAFSIR');
    expansionTypes.push('HAS_TRANSLATION');
  } else if (node.label === 'Topic') {
    expansionTypes.push('HAS_TOPIC');
  } else if (node.label === 'Tafsir') {
    expansionTypes.push('HAS_TAFSIR');
  } else if (node.label === 'Translation') {
    expansionTypes.push('HAS_TRANSLATION');
  }
  
  return expansionTypes;
}

/**
 * Function to get the display name for a node based on its label and properties
 */
export function getNodeDisplayName(label: string, properties: any): string {
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

  // For all other node types, use standard properties
  return properties.name ||
    properties.verse_key ||
    properties.topic_id ||
    (properties.surah_number && properties.ayah_number ?
      `${properties.surah_number}:${properties.ayah_number}` :
      `${label}-${properties._id?.offset || ''}`);
}

/**
 * Function to get a color for a node based on its label
 */
export function getNodeColor(label: string): string {
  // Define colors for different node types
  const colorMap: Record<string, string> = {
    'Verse': '#4299E1', // Blue
    'Topic': '#F6AD55', // Orange
    'Tafsir': '#68D391', // Green
    'Translation': '#9F7AEA', // Purple
    'Word': '#FC8181', // Red
    'Chapter': '#F6E05E', // Yellow
    'Surah': '#F6E05E', // Yellow
  };

  // Return the color for the label, or a default gray
  return colorMap[label] || '#A0AEC0';
}

/**
 * Render a cell value for display in the table
 */
export function renderCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    // Truncate long strings
    if (value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value;
  }

  if (Array.isArray(value)) {
    return `[Array(${value.length})]`;
  }

  if (typeof value === 'object') {
    // Check if it's a node or relationship object
    if (value._label) {
      return <span className="font-medium">{value._label}</span>;
    }
    
    // For other objects, show a summary
    return `{Object}`;
  }

  return String(value);
}
