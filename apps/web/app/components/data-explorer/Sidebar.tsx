import React from 'react';
import type { GraphData, GraphNode, SchemaData } from './types';
import { getNodeRelationships } from './nodeRelationshipUtils';
import { RelationshipPanel } from './RelationshipPanel';
import { Button } from '~/components/ui/button';
import { X as XIcon } from 'lucide-react';

interface DataExplorerSidebarProps {
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  setSidebarOpen: (open: boolean) => void;
  expandNode: (nodeId: string, relationshipType?: string) => void;
  graphData: GraphData;
  schema: SchemaData | null;
}

export function DataExplorerSidebar({
  selectedNode,
  setSelectedNode,
  setSidebarOpen,
  expandNode,
  graphData,
  schema
}: DataExplorerSidebarProps) {
  if (!selectedNode) return null;

  // State to track expanded property values
  const [expandedProps, setExpandedProps] = React.useState<Set<string>>(new Set());

  // Reset expanded properties when node changes
  React.useEffect(() => {
    setExpandedProps(new Set());
  }, [selectedNode.id]);

  // Function to toggle property expansion
  const togglePropertyExpansion = (key: string) => {
    setExpandedProps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get relationship information for the selected node
  const { actualRelationships, schemaRelationships } = getNodeRelationships({
    node: selectedNode,
    graphData,
    schema
  });

  return (
    <>
      {/* Node Details Sidebar */}
      <div className={`fixed top-0 right-0 h-full bg-sidebar shadow-xl w-96 transform transition-transform duration-300 ease-in-out z-40 border-l border-sidebar-border backdrop-blur-xl ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-secondary/20 text-sidebar-foreground px-4 py-3 flex justify-between items-center border-b border-sidebar-border">
          <h3 className="font-bold text-lg truncate">{selectedNode.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedNode(null);
              setSidebarOpen(false);
            }}
            className="h-8 w-8 text-sidebar-foreground hover:text-sidebar-primary"
          >
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <div className="flex items-center mb-4">
            <div
              className="w-6 h-6 rounded-full mr-2 border border-sidebar-border"
              style={{ backgroundColor: selectedNode.color || '#4B5563' }}
            ></div>
            <span className="font-medium text-sidebar-foreground">Type: {selectedNode.label}</span>
          </div>

          {selectedNode.properties && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm text-sidebar-foreground">Properties:</h4>

                {/* Only show Expand/Collapse All if there are long properties */}
                {(() => {
                  const longProps = Object.entries(selectedNode.properties || {})
                    .filter(([key, value]) => !key.startsWith('_') && String(value).length > 100)
                    .map(([key]) => key);

                  if (longProps.length === 0) return null;

                  const allExpanded = longProps.every(key => expandedProps.has(key));

                  return (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (allExpanded) {
                          setExpandedProps(new Set());
                        } else {
                          setExpandedProps(new Set(longProps));
                        }
                      }}
                      className="h-6 px-2 text-xs text-sidebar-primary hover:text-sidebar-primary/80 font-medium"
                    >
                      {allExpanded ? 'Collapse All' : 'Expand All'}
                    </Button>
                  );
                })()}
              </div>
              <div className="bg-secondary/20 rounded p-3 border border-sidebar-border">
                {Object.entries(selectedNode.properties)
                  .filter(([key]) => !key.startsWith('_'))
                  .map(([key, value]) => {
                    const stringValue = String(value);
                    const isLongText = stringValue.length > 100;
                    const isExpanded = expandedProps.has(key);
                    const displayValue = isLongText && !isExpanded
                      ? truncateText(stringValue)
                      : stringValue;

                    return (
                      <div key={key} className="mb-2 last:mb-0">
                        <div className="grid grid-cols-3 gap-2 mb-1 text-sm">
                          <span className="text-sidebar-foreground font-medium">{key}:</span>
                          <div className="col-span-2">
                            <span className="text-sidebar-foreground break-words">{displayValue}</span>

                            {isLongText && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => togglePropertyExpansion(key)}
                                className="h-5 p-0 ml-1 text-xs text-sidebar-primary hover:text-sidebar-primary/80 font-medium"
                              >
                                {isExpanded ? 'Show less' : 'Read more'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Relationship Information */}
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-sidebar-foreground mb-2">Relationships:</h4>

            <RelationshipPanel
              actualRelationships={actualRelationships}
              schemaRelationships={schemaRelationships}
              onExpandRelationship={(relType, direction) => {
                if (direction === 'outgoing') {
                  expandNode(selectedNode.id, `${relType}>`);
                } else if (direction === 'incoming') {
                  expandNode(selectedNode.id, `<${relType}`);
                } else {
                  expandNode(selectedNode.id, relType);
                }
              }}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-sidebar-border flex justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedNode(null);
                setSidebarOpen(false);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
        onClick={() => {
          setSelectedNode(null);
          setSidebarOpen(false);
        }}
      ></div>
    </>
  );
}
