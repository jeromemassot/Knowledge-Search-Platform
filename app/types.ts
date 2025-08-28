// Types based on the provided JSON data model
export interface Chunk {
  id: number;
  unique_id: string;
  content: string;
  parent_id: number | null;
  parent_unique_id: string | null;
  url_links: UrlLink[];
  is_root: boolean;
  kind: 'chunk';
}

export interface UrlLink {
  //[key: string]: string;
  url: string;
  kind: 'url_link';
}

export interface DocumentPage {
  unique_id: string;
  title: string;
  content: string;
  copyright: string;
  chunks: Chunk[];
  keywords: string[];
  summary: string;
  kind: 'page';
}

// Custom types for the graph visualization library
export interface GraphNodeData {
  text: string;
  url: string;
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'page' | 'chunk' | 'url_link' | 'collection';
  data: DocumentPage | Chunk | UrlLink | GraphNodeData;
  val: number; // Used for sizing the node
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}