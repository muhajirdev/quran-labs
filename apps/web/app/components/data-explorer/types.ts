// Define types for graph data
export interface GraphNode {
  id: string;
  label?: string;
  properties?: Record<string, any>;
  [key: string]: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type?: string;
  properties?: Record<string, any>;
  [key: string]: any;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Define types for schema data
export interface SchemaProperty {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
}

export interface NodeTable {
  name: string;
  properties: SchemaProperty[];
}

export interface RelationshipConnectivity {
  src: string;
  dst: string;
}

export interface RelationshipTable {
  name: string;
  properties: SchemaProperty[];
  connectivity: RelationshipConnectivity[];
}

export interface SchemaData {
  nodeTables: NodeTable[];
  relTables: RelationshipTable[];
}
