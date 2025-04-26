import React from 'react';
import type { GraphNode } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';

interface ExpandNodeDropdownProps {
  selectedNode: GraphNode;
  expandNode: (nodeId: string, expansionType?: string) => void;
}

export function ExpandNodeDropdown({ selectedNode, expandNode }: ExpandNodeDropdownProps) {
  const handleExpand = (expansionType: string) => {
    expandNode(selectedNode.id, expansionType);
  };

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
        <DropdownMenuItem onClick={() => handleExpand('verse')}>
          Verse
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExpand('tafsir')}>
          Tafsir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExpand('translation')}>
          Translations
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExpand('all')}>
          All Connections
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
