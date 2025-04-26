import React from 'react';
import type { GraphNode } from './types';

interface DataExplorerSidebarProps {
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  setSidebarOpen: (open: boolean) => void;
  expandNode: (nodeId: string) => void;
}

export function DataExplorerSidebar({
  selectedNode,
  setSelectedNode,
  setSidebarOpen,
  expandNode
}: DataExplorerSidebarProps) {
  if (!selectedNode) return null;

  return (
    <>
      {/* Node Details Sidebar */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-xl w-80 transform transition-transform duration-300 ease-in-out z-40 border-l border-gray-300 ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-bold text-lg truncate">{selectedNode.name}</h3>
          <button
            onClick={() => {
              setSelectedNode(null);
              setSidebarOpen(false);
            }}
            className="text-white hover:text-blue-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <div className="flex items-center mb-4">
            <div
              className="w-6 h-6 rounded-full mr-2 border border-gray-400"
              style={{ backgroundColor: selectedNode.color || '#4B5563' }}
            ></div>
            <span className="font-medium text-gray-900">Type: {selectedNode.label}</span>
          </div>

          {selectedNode.properties && (
            <div className="mt-2">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Properties:</h4>
              <div className="bg-gray-100 rounded p-3 border border-gray-300">
                {Object.entries(selectedNode.properties)
                  .filter(([key]) => !key.startsWith('_'))
                  .map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2 mb-1 text-sm">
                      <span className="text-gray-900 font-medium">{key}:</span>
                      <span className="col-span-2 text-gray-900 break-words">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between">
            <button
              onClick={() => {
                setSelectedNode(null);
                setSidebarOpen(false);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={() => expandNode(selectedNode.id)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Expand Node
            </button>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
        onClick={() => {
          setSelectedNode(null);
          setSidebarOpen(false);
        }}
      ></div>
    </>
  );
}
