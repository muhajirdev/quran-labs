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
