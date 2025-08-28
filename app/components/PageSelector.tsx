import React from 'react';
import { DocumentPage } from '../types';

interface PageSelectorProps {
  pages: DocumentPage[];
  selectedPageIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ pages, selectedPageIds, onSelectionChange }) => {
    const handleToggle = (pageId: string) => {
        const newSelection = new Set(selectedPageIds);
        if (newSelection.has(pageId)) {
            newSelection.delete(pageId);
        } else {
            newSelection.add(pageId);
        }
        onSelectionChange(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedPageIds.size === pages.length) {
            onSelectionChange(new Set()); // Deselect all
        } else {
            onSelectionChange(new Set(pages.map(p => p.unique_id))); // Select all
        }
    };

    return (
        <aside className="absolute top-0 left-0 h-full w-full max-w-xs bg-gray-800/90 backdrop-blur-sm shadow-2xl z-20 p-4 flex flex-col border-r border-gray-700">
            <h2 className="text-xl font-bold pb-2 border-b border-gray-700">Pages</h2>
            <div className="my-4">
                 <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-700/50">
                    <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                        checked={pages.length > 0 && selectedPageIds.size === pages.length}
                        onChange={handleSelectAll}
                        />
                    <span className="font-semibold">{selectedPageIds.size === pages.length ? "Deselect All" : "Select All"}</span>
                </label>
            </div>
            <ul className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-2">
                {pages.map(page => (
                    <li key={page.unique_id}>
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                                checked={selectedPageIds.has(page.unique_id)}
                                onChange={() => handleToggle(page.unique_id)}
                            />
                            <span className="text-gray-200">{page.title}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default PageSelector;
