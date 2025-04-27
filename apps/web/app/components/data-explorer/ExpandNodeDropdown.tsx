import React, { useMemo } from 'react';
import type { GraphNode } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import { getAvailableExpansionTypes } from './simpleGraphUtils';

interface ExpandNodeDropdownProps {
  selectedNode: GraphNode;
  expandNode: (nodeId: string, expansionType?: string) => void;
}

export function ExpandNodeDropdown({ selectedNode, expandNode }: ExpandNodeDropdownProps) {
  const handleExpand = (expansionType: string) => {
    expandNode(selectedNode.id, expansionType);
  };

  // Get available expansion types based on node type
  const expansionTypes = useMemo(() => {
    return getAvailableExpansionTypes(selectedNode);
  }, [selectedNode]);

  // Format relationship name for display
  const formatRelationshipName = (relName: string): string => {
    if (relName.startsWith('rel_')) {
      return relName.substring(4); // Remove 'rel_' prefix
    }

    // Format HAS_TOPIC -> Topic, HAS_TAFSIR -> Tafsir, etc.
    if (relName.startsWith('HAS_')) {
      return relName.substring(4);
    }

    // Handle special cases
    if (relName === 'verse') return 'Adjacent Verses';

    // Convert snake_case or camelCase to Title Case with spaces
    return relName
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
  };

  // If no expansion types are available, disable the button
  if (expansionTypes.length === 0) {
    return (
      <button
        className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center cursor-not-allowed"
        disabled
      >
        <span>No Expansions</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <span>Expand</span>
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {expansionTypes.map((type: string) => (
          <DropdownMenuItem key={type} onClick={() => handleExpand(type)}>
            {formatRelationshipName(type)}
          </DropdownMenuItem>
        ))}

        {expansionTypes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExpand('all')}>
              All Connections
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
