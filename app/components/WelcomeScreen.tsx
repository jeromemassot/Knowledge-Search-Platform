import React, { useCallback, useState } from 'react';
import { DocumentPage } from '../types';

interface WelcomeScreenProps {
  onFileUpload: (pages: DocumentPage[]) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onFileUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
            throw new Error("File is empty or could not be read.");
        }
        const pages: DocumentPage[] = text
          .split('\n')
          .filter(line => line.trim() !== '')
          .map((line, index) => {
            try {
              return JSON.parse(line) as DocumentPage;
            } catch (parseError) {
              throw new Error(`Error parsing JSON on line ${index + 1}: ${(parseError as Error).message}`);
            }
          });
        
        // After parsing, we need to remove orphaned chunks from every page.
        // An orphan chunk is a chunk that is not a root and not a child of any other chunk.
        pages.forEach(page => {
            const allChunkIds = new Set(page.chunks.map(chunk => chunk.id));
            const referencedChunkIds = new Set<string>();
            page.chunks.forEach(chunk => {
                if (chunk.parent_id) {
                    referencedChunkIds.add(chunk.parent_id);
                }
            });

            page.chunks = page.chunks.filter(chunk => {
                // Keep the chunk if it's a root chunk
                if (!chunk.parent_id) {
                    return true;
                }
                // Keep the chunk if its parent exists in the same page
                if (allChunkIds.has(chunk.parent_id)) {
                    return true;
                }
                return false;
            });
        });
        onFileUpload(pages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsParsing(false);
      }
    };
    
    reader.onerror = () => {
        setError('Failed to read the file.');
        setIsParsing(false);
    }

    reader.readAsText(file);
  }, [onFileUpload]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl w-full text-center bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-purple-400">Document Collection Visualizer</h1>
        <p className="text-gray-300 mb-6">
          Upload a <code className="bg-gray-700 text-yellow-300 px-2 py-1 rounded">.jsonl</code> file to get started. Each line in the file should be a valid JSON object representing a single document page.
        </p>
        <div className="mt-4">
          <label htmlFor="file-upload" className={`inline-block px-6 py-3 font-semibold rounded-lg transition-colors duration-200 ${isParsing ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'}`}>
            {isParsing ? 'Parsing...' : 'Select JSONL File'}
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".jsonl,application/x-jsonlines"
            onChange={handleFileChange}
            disabled={isParsing}
          />
        </div>
        {error && (
            <div className="mt-6 p-3 bg-red-800/50 text-red-300 border border-red-700 rounded-lg text-left">
                <p><strong>Error:</strong> {error}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
