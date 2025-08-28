import React, { useState, useCallback, ReactNode } from 'react';
import { GraphNode, Chunk, DocumentPage, UrlLink, GraphNodeData } from './types';
import GraphVisualizer from './components/GraphVisualizer';
import WelcomeScreen from './components/WelcomeScreen';
import PageSelector from './components/PageSelector';

// Helper component for displaying the details of a selected node
interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="border-b border-gray-700 py-2">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-gray-200">{children}</dd>
  </div>
);

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  if (!node) return null;

  const renderNodeDetails = () => {
    // Special case for the Collection node
    if (node.id === 'collection') {
      const { text } = node.data as GraphNodeData;
      return <DetailRow label="Status">{text}</DetailRow>;
    }

    switch (node.type) {
      case 'page': {
        const pageData = node.data as DocumentPage;
        return (
          <>
            <DetailRow label="Title">{pageData.title}</DetailRow>
            <DetailRow label="Unique ID">{pageData.unique_id}</DetailRow>
            <DetailRow label="Chunk Count">{pageData.chunks.length}</DetailRow>
            <DetailRow label="Copyright">{pageData.copyright}</DetailRow>
            {pageData.summary && <DetailRow label="Summary">{pageData.summary}</DetailRow>}
            {pageData.keywords && <DetailRow label="Keywords">{pageData.keywords.join(', ')}</DetailRow>}
          </>
        );
      }
      case 'chunk': {
        const chunkData = node.data as Chunk;
        return (
          <>
            <DetailRow label="ID">{chunkData.id}</DetailRow>
            <DetailRow label="Unique ID">{chunkData.unique_id}</DetailRow>
            <DetailRow label="Parent ID">{chunkData.parent_id ?? 'None'}</DetailRow>
            <DetailRow label="Parent Unique ID">{chunkData.parent_unique_id ?? 'None'}</DetailRow>
            <DetailRow label="Content">
              <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-800 p-2 rounded-md max-h-60 overflow-y-auto custom-scrollbar">
                {chunkData.content}
              </pre>
            </DetailRow>
          </>
        );
      }
      case 'url_link': {
        const linkData = node.data as UrlLink;
        // <DetailRow label="Topic">{linkData.text}</DetailRow>
        return (
          <>
            <DetailRow label="URL">
              <a href={node.id} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                {node.id}
              </a>
            </DetailRow>
          </>
        );
      }
      default:
        return <p>No details available.</p>;
    }
  };

  return (
    <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-gray-900/80 backdrop-blur-sm shadow-2xl transition-transform duration-300 ease-in-out z-20 ${node ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between pb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold capitalize text-gray-100">{node.name} Details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <dl className="mt-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
          {renderNodeDetails()}
        </dl>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleFileUpload = useCallback((uploadedPages: DocumentPage[]) => {
    setPages(uploadedPages);
    // By default, do not select any pages to display
    setSelectedPageIds(new Set());
  }, []);

  const handleSelectionChange = useCallback((newSelectedIds: Set<string>) => {
    setSelectedPageIds(newSelectedIds);
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const selectedPages = pages.filter(p => selectedPageIds.has(p.unique_id));

  if (pages.length === 0) {
    return <WelcomeScreen onFileUpload={handleFileUpload} />;
  }

  return (
    <main className="relative w-screen h-screen font-sans bg-gray-900">
      <PageSelector pages={pages} selectedPageIds={selectedPageIds} onSelectionChange={handleSelectionChange} />
      {/* Offset for the PageSelector width (max-w-xs = 20rem = 320px) */}
      <div className="ml-[320px] h-full relative">
        <header className="absolute top-0 left-0 p-4 md:p-6 z-10 pointer-events-none w-full">
          <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">Document Collection Visualizer</h1>
          <p className="text-sm md:text-base text-gray-300 drop-shadow-lg">
            {selectedPages.length} of {pages.length} page(s) selected. Click a node for details.
          </p>
        </header>
        <GraphVisualizer pages={selectedPages} onNodeClick={handleNodeClick} />
      </div>
      <NodeDetailPanel node={selectedNode} onClose={handleClosePanel} />
    </main>
  );
};

export default App;
