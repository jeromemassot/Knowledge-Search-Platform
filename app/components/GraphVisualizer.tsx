import React, { useMemo, useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { DocumentPage, GraphData, GraphNode } from '../types';

interface GraphVisualizerProps {
  pages: DocumentPage[];
  onNodeClick: (node: GraphNode) => void;
}

const NODE_COLORS: { [key: string]: string } = {
  collection: '#f97316', // orange-500
  page: '#a855f7', // purple-500
  chunk: '#3b82f6', // blue-500
  url_link: '#22c55e', // green-500
};

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ pages, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const graphData = useMemo<GraphData>(() => {
    if (pages.length === 0) {
      return { nodes: [], links: [] };
    }

    const gData: GraphData = { nodes: [], links: [] };

    gData.nodes.push({
      id: 'collection',
      name: 'Collection',
      type: 'collection',
      data: { text: `${pages.length} document(s) referenced in this collection.`, url: '' },
      val: 25,
    });

    pages.forEach(page => {
      const pageId = `page-${page.unique_id}`;

      gData.nodes.push({
        id: pageId,
        name: page.title,
        type: 'page',
        data: page,
        val: 20,
      });

      page.chunks.forEach((chunk) => {
        const chunkId = `chunk-${page.unique_id}-${chunk.id}`;
        gData.nodes.push({
          id: chunkId,
          name: `Chunk ${chunk.id}`,
          type: 'chunk',
          data: chunk,
          val: 5
        });

        // Connect Page to the root chunk (id: 0)
        if (chunk.id === 0) {
          gData.links.push({ source: pageId, target: chunkId, label: '[CONTAINS]' });
          gData.links.push({ source: chunkId, target: pageId, label: '[BELONGS_TO]' });
        }

        // Connect chunk to parent chunk
        if (typeof chunk.parent_id === 'number' && page.chunks.some(c => c.id === chunk.parent_id)) {
          const parentChunkId = `chunk-${page.unique_id}-${chunk.parent_id}`;
          gData.links.push({ source: chunkId, target: parentChunkId, label: '[IS_CHILD_OF]' });
          gData.links.push({ source: parentChunkId, target: chunkId, label: '[IS_PARENT_OF]' });
        }

        // Connect chunk to its links (assuming chunk.url_links is an array of URLs)
        if (chunk.url_links && Array.isArray(chunk.url_links)) {
          chunk.url_links.forEach((url_link) => {
            const UrlLinkId = `${url_link}`;
            // if the url is not already in the gData nodes
            if (!gData.nodes.some(n => n.id === UrlLinkId)) {
              gData.nodes.push({
                id: UrlLinkId,
                name: `Link`,
                type: 'url_link',
                data: url_link,
                val: 1
              });
            }
            gData.links.push({ source: chunkId, target: UrlLinkId, label: '[REFERS_TO]' });
            gData.links.push({ source: UrlLinkId, target: chunkId, label: '[IS_REFERENCED_BY]' });
          });
        }
      }); // <-- CHUNK LOOP ENDS HERE

      // Link page to collection (MOVED TO CORRECT LOCATION)
      gData.links.push({ source: pageId, target: 'collection', label: '[IS_PART_OF]' });
      gData.links.push({ source: 'collection', target: pageId, label: '[CONTAINS]' });
    }); // <-- PAGE LOOP ENDS HERE

    return gData;
  }, [pages]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {dimensions.width > 0 && pages.length > 0 ? (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeId="id"
          nodeLabel="name"
          nodeVal="val"
          nodeColor={(node) => NODE_COLORS[(node as GraphNode).type] || '#ffffff'}
          onNodeClick={onNodeClick as (node: object) => void}
          backgroundColor="#111827" // gray-900
          linkColor={() => 'rgba(255,255,255,0.2)'}
          linkWidth={0.5}
          linkLabel="label"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-400">No Pages Selected</h2>
          <p className="text-gray-500 mt-2">Select one or more pages from the panel on the left to visualize them.</p>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;