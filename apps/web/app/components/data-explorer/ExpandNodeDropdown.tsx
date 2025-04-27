import type { GraphNode } from './types';

interface ExpandNodeDropdownProps {
  selectedNode: GraphNode;
  expandNode: (nodeId: string) => void;
}

export function ExpandNodeDropdown({ selectedNode, expandNode }: ExpandNodeDropdownProps) {
  return (
    <button
      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
      onClick={() => expandNode(selectedNode.id)}
    >
      <span>Expand</span>
    </button>
  );
}
